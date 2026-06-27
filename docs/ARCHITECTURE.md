# System Architecture

NodeBase is a monolithic full-stack Next.js application with a serverless background job layer. This document describes every architectural layer, component boundary, and data flow in the system.

---

## Table of Contents

1. [System Context](#1-system-context)
2. [Container Architecture](#2-container-architecture)
3. [Component Map](#3-component-map)
4. [Request Lifecycle](#4-request-lifecycle)
5. [Workflow Execution Flow](#5-workflow-execution-flow)
6. [Real-time Status Flow](#6-real-time-status-flow)
7. [Authentication Flow](#7-authentication-flow)
8. [Technology Rationale](#8-technology-rationale)
9. [Scalability Notes](#9-scalability-notes)

---

## 1. System Context

The diagram below shows NodeBase in relation to every external actor and system.

```mermaid
C4Context
    title NodeBase — System Context

    Person(user, "User", "Creates and executes automation workflows")

    System(nodebase, "NodeBase", "AI workflow automation platform")

    System_Ext(neon, "Neon (PostgreSQL)", "Serverless Postgres database")
    System_Ext(inngest, "Inngest", "Serverless job queue and orchestration")
    System_Ext(openai, "OpenAI", "GPT-4 text generation")
    System_Ext(anthropic, "Anthropic", "Claude Sonnet text generation")
    System_Ext(gemini, "Google Gemini", "Gemini Flash text generation")
    System_Ext(polar, "Polar.sh", "Subscription billing and customer portal")
    System_Ext(sentry, "Sentry", "Error monitoring and performance")
    System_Ext(github, "GitHub", "OAuth provider")
    System_Ext(google_oauth, "Google", "OAuth provider")
    System_Ext(stripe, "Stripe", "Webhook event source")
    System_Ext(gforms, "Google Forms", "Webhook event source")
    System_Ext(discord, "Discord", "Webhook message destination")
    System_Ext(slack, "Slack", "Webhook message destination")

    Rel(user, nodebase, "Uses", "HTTPS")
    Rel(nodebase, neon, "Reads/writes data", "TLS")
    Rel(nodebase, inngest, "Sends events, serves functions", "HTTPS")
    Rel(nodebase, openai, "Generates text (GPT-4)", "HTTPS")
    Rel(nodebase, anthropic, "Generates text (Claude)", "HTTPS")
    Rel(nodebase, gemini, "Generates text (Gemini Flash)", "HTTPS")
    Rel(nodebase, polar, "Manages subscriptions", "HTTPS")
    Rel(nodebase, sentry, "Reports errors and traces", "HTTPS")
    Rel(nodebase, github, "OAuth login", "HTTPS")
    Rel(nodebase, google_oauth, "OAuth login", "HTTPS")
    Rel(stripe, nodebase, "Sends webhook events", "HTTPS")
    Rel(gforms, nodebase, "Sends form submissions", "HTTPS")
    Rel(nodebase, discord, "Posts messages", "HTTPS")
    Rel(nodebase, slack, "Posts messages", "HTTPS")
```

---

## 2. Container Architecture

NodeBase runs as a single Next.js deployment but logically separates concerns into distinct containers:

```mermaid
graph TB
    subgraph Browser["Client Browser"]
        RFC[React Client Components<br/>Jotai · React Query · Nuqs]
        RF[React Flow Canvas<br/>@xyflow/react v12]
        AC[Auth Client<br/>Better Auth React]
    end

    subgraph NextJS["Next.js Application (Vercel / Node.js)"]
        direction TB
        RSC[React Server Components<br/>Server-side rendering]
        TRPC[tRPC Router<br/>16 type-safe procedures]
        REST[REST Handlers<br/>Auth · Webhooks · Inngest]
        MW[Middleware<br/>Auth checks · Request context]

        subgraph Auth["Authentication Layer"]
            BA[Better Auth<br/>Sessions · OAuth · Plugins]
            POLAR_P[Polar Plugin<br/>Subscription checks]
        end

        subgraph Data["Data Access Layer"]
            PG[Prisma Client v7<br/>Type-safe ORM]
            ENC[Cryptr<br/>AES Encryption]
        end
    end

    subgraph Inngest["Inngest Worker (Serverless)"]
        EW[executeWorkflow<br/>Main orchestrator]
        EX[Node Executors<br/>10 executor functions]
        CH[Realtime Channels<br/>10 status channels]
    end

    subgraph DB["Database (Neon PostgreSQL)"]
        T1[Users · Sessions · Accounts]
        T2[Workflows · Nodes · Connections]
        T3[Credentials · Executions]
    end

    RFC -->|tRPC HTTP| TRPC
    RF -->|Save/Execute| TRPC
    AC -->|Auth API| REST
    RSC --> TRPC
    TRPC --> BA
    TRPC --> PG
    TRPC --> EW
    REST --> BA
    REST --> EW
    BA --> POLAR_P
    PG --> DB
    EW --> EX
    EX --> ENC
    ENC --> PG
    EW --> CH
    CH -->|WebSocket/SSE| RFC
```

---

## 3. Component Map

### Frontend Layer (`src/app/`, `src/features/`, `src/components/`)

```
Browser
├── (auth) routes
│   ├── /login          → LoginForm (Better Auth email/social)
│   └── /sign-up        → RegisterForm
│
└── (dashboard) routes
    ├── /workflows       → WorkflowList (tRPC: workflows.getMany)
    │   └── /workflows/[id]/editor
    │       └── EditorCanvas (React Flow)
    │           ├── NodeSelector (add node popup)
    │           ├── WorkflowNode (per node: config dialog + status)
    │           ├── EditorHeader (name, save button)
    │           └── ExecuteButton (manual trigger only)
    │
    ├── /credentials     → CredentialList (tRPC: credentials.getMany)
    │
    └── /executions      → ExecutionList (tRPC: executions.getMany)
        └── /executions/[id]
            └── ExecutionDetail (status, output, nodes)
```

### Backend Layer (`src/trpc/`, `src/inngest/`, `src/lib/`)

```
API Layer
├── /api/trpc/[trpc]        → tRPC fetch adapter
│   └── AppRouter
│       ├── workflows.*     → WorkflowRouter (6 procedures)
│       ├── credentials.*   → CredentialRouter (6 procedures)
│       └── executions.*    → ExecutionRouter (2 procedures)
│
├── /api/auth/[...all]      → Better Auth handler (all auth routes)
│
├── /api/inngest            → Inngest SDK handler
│   └── executeWorkflow     → Orchestrates workflow execution
│
├── /api/webhooks/stripe    → Stripe event receiver
└── /api/webhooks/google-form → Google Form submission receiver
```

---

## 4. Request Lifecycle

### Standard tRPC Request (e.g., `workflows.getMany`)

```mermaid
sequenceDiagram
    participant Browser
    participant ReactQuery as React Query Cache
    participant tRPC as tRPC Client
    participant Server as Next.js Server
    participant Auth as Better Auth
    participant Prisma as Prisma Client
    participant DB as PostgreSQL

    Browser->>ReactQuery: useSuspenseWorkflows()
    ReactQuery->>tRPC: POST /api/trpc/workflows.getMany
    tRPC->>Server: HTTP request with batch
    Server->>Auth: getSession(headers)
    Auth->>DB: SELECT session WHERE token = ?
    DB-->>Auth: Session record
    Auth-->>Server: { user: { id, email } }
    Server->>Prisma: workflow.findMany({ where: { userId } })
    Prisma->>DB: SELECT * FROM workflows WHERE userId = ?
    DB-->>Prisma: Workflow rows
    Prisma-->>Server: Typed Workflow[]
    Server-->>tRPC: JSON response (SuperJSON)
    tRPC-->>ReactQuery: Deserialized data
    ReactQuery-->>Browser: Render with data
```

### Protected vs Premium Procedures

```mermaid
flowchart LR
    REQ[Incoming Request] --> BASE[baseProcedure]
    BASE --> PROT{protectedProcedure}
    PROT -->|No session| E401[Throw UNAUTHORIZED]
    PROT -->|Has session| PREM{premiumProcedure}
    PREM -->|No subscription| E403[Throw FORBIDDEN]
    PREM -->|Has subscription| PROC[Execute procedure]
    PROT -->|Has session - non-premium| PROC2[Execute procedure]
```

---

## 5. Workflow Execution Flow

This is the core data flow — from the user clicking "Execute" to seeing results.

```mermaid
sequenceDiagram
    participant UI as React UI
    participant tRPC as tRPC Router
    participant DB as PostgreSQL
    participant Inngest as Inngest Queue
    participant Exec as executeWorkflow
    participant NodeExec as Node Executors
    participant AI as AI APIs / Webhooks
    participant RT as Inngest Realtime

    UI->>tRPC: workflows.execute({ workflowId })
    tRPC->>DB: Verify workflow ownership
    tRPC->>Inngest: sendWorkflowExecution({ workflowId })
    Inngest-->>tRPC: { ids: [eventId] }
    tRPC-->>UI: { success: true }

    Note over Inngest,Exec: Asynchronous execution begins

    Inngest->>Exec: Trigger executeWorkflow
    Exec->>DB: CREATE Execution (RUNNING, inngestEventId)

    Exec->>DB: Fetch workflow + nodes + connections
    Exec->>Exec: topologicalSort(nodes, connections)
    Exec->>DB: Get userId from workflow

    loop For each node (in topological order)
        Exec->>NodeExec: executor({ data, nodeId, userId, context, step, publish })
        NodeExec->>RT: publish(channel, "status", { nodeId, status: "loading" })
        RT-->>UI: NodeStatusIndicator → loading spinner

        alt AI Node
            NodeExec->>DB: Fetch + decrypt credential
            NodeExec->>AI: generateText({ model, system, user prompts })
            AI-->>NodeExec: { text: "..." }
        else HTTP Request
            NodeExec->>AI: ky(endpoint, { method, body })
            AI-->>NodeExec: { status, data }
        else Messaging (Discord/Slack)
            NodeExec->>AI: POST webhookUrl { content }
            AI-->>NodeExec: OK
        end

        NodeExec->>RT: publish(channel, "status", { nodeId, status: "success" })
        RT-->>UI: NodeStatusIndicator → success checkmark
        NodeExec-->>Exec: Updated context (merged with variable)
    end

    Exec->>DB: UPDATE Execution (SUCCESS, output: finalContext)
```

### Context Propagation

Each node executor receives the accumulated `context` object and returns an updated copy:

```
Initial context: {}
  → after MANUAL_TRIGGER: {}
  → after HTTP_REQUEST (variableName="api"):
      { api: { httpResponse: { status: 200, data: {...} } } }
  → after GEMINI (variableName="summary"):
      { api: { ... }, summary: { text: "Summary of data..." } }
  → after SLACK:
      { api: { ... }, summary: { ... }, notification: { messageContent: "..." } }
```

Handlebars templates in node config can reference prior results:
```
"Summarize this: {{api.httpResponse.data.content}}"
```

---

## 6. Real-time Status Flow

```mermaid
sequenceDiagram
    participant Hook as useNodeStatus(nodeId)
    participant RT as Inngest Realtime SDK
    participant Channel as Inngest Channel
    participant Executor as Node Executor
    participant UI as NodeStatusIndicator

    Hook->>RT: subscribe(channel, topic="status")
    RT->>Channel: SSE connection

    Executor->>Channel: publish({ nodeId, status: "loading" })
    Channel-->>RT: SSE event
    RT-->>Hook: message { nodeId, status: "loading" }
    Hook-->>UI: status = "loading" → spinner

    Executor->>Channel: publish({ nodeId, status: "success" })
    Channel-->>RT: SSE event
    RT-->>Hook: message { nodeId, status: "success" }
    Hook-->>UI: status = "success" → green checkmark
```

Each node type has its own named Inngest channel (e.g., `openai-execution`, `anthropic-execution`). The `useNodeStatus` hook filters messages by `nodeId` to display per-node status.

---

## 7. Authentication Flow

### Email/Password Registration

```mermaid
sequenceDiagram
    participant Browser
    participant Form as RegisterForm
    participant Auth as Better Auth Client
    participant Server as Auth Handler
    participant DB as PostgreSQL

    Browser->>Form: Submit { name, email, password }
    Form->>Auth: authClient.signUp.email({ name, email, password })
    Auth->>Server: POST /api/auth/sign-up/email
    Server->>DB: SELECT user WHERE email = ?
    DB-->>Server: null (user doesn't exist)
    Server->>Server: bcrypt.hash(password, 10)
    Server->>DB: INSERT INTO User { name, email, passwordHash }
    Server->>DB: INSERT INTO Session { token, userId, expiresAt }
    DB-->>Server: Session created
    Server-->>Auth: Set-Cookie session_token (HttpOnly, SameSite=Lax)
    Auth-->>Form: { user, session }
    Form->>Browser: redirect("/workflows")
```

### OAuth Flow (GitHub / Google)

```mermaid
sequenceDiagram
    participant Browser
    participant Form as LoginForm
    participant Auth as Better Auth Client
    participant Server as Auth Handler
    participant Provider as GitHub / Google
    participant DB as PostgreSQL

    Browser->>Form: Click "Continue with GitHub"
    Form->>Auth: authClient.signIn.social({ provider: "github" })
    Auth->>Server: GET /api/auth/social/github
    Server-->>Browser: redirect(github_oauth_url?state=...)
    Browser->>Provider: OAuth authorization page
    Provider-->>Browser: redirect(/api/auth/callback/github?code=...&state=...)
    Browser->>Server: GET /api/auth/callback/github
    Server->>Provider: POST /login/oauth/access_token (exchange code)
    Provider-->>Server: { access_token, scope }
    Server->>Provider: GET /user (fetch profile)
    Provider-->>Server: { id, login, email, avatar_url }
    Server->>DB: UPSERT Account WHERE providerId=github AND accountId=github_id
    Server->>DB: UPSERT User WHERE email = provider_email
    Server->>DB: INSERT Session
    Server-->>Browser: redirect("/workflows") + Set-Cookie
```

---

## 8. Technology Rationale

| Decision | Choice | Alternative Considered | Reason |
|----------|--------|----------------------|--------|
| Framework | Next.js 15 App Router | Express + React | RSC + colocation of server/client code, Vercel deployment |
| API layer | tRPC | REST / GraphQL | End-to-end TypeScript types without code generation |
| ORM | Prisma 7 | Drizzle | Mature ecosystem, Prisma Studio, strong typing |
| Database | Neon (PostgreSQL) | PlanetScale / Supabase | Serverless scaling, standard Postgres compatibility |
| Job queue | Inngest | BullMQ / SQS | Serverless (no Redis), built-in Realtime, dev server |
| Auth | Better Auth | NextAuth / Clerk | Plugin architecture, Polar integration, full control |
| Payments | Polar.sh | Stripe Billing | Better auth plugin, simpler OSS billing model |
| State (client) | Jotai | Zustand / Redux | Atomic model, minimal boilerplate, React 19 compatible |
| State (URL) | Nuqs | Manual URLSearchParams | Type-safe, server/client compatible |
| Encryption | Cryptr | node:crypto (manual) | Simple AES wrapper, no IV management overhead |
| Linting | Biome | ESLint + Prettier | Single tool, faster, zero config |
| Versioning | Semantic Release | Manual | Automated changelog and version bumps |

---

## 9. Scalability Notes

### Current Architecture

- **Single deployment** — Next.js app handles both UI and API in one process
- **Stateless** — Session state stored in DB; any instance handles any request
- **Serverless job execution** — Inngest scales independently; no persistent workers needed
- **Connection pooling** — Neon's built-in pooler handles connection limits

### Scaling Bottlenecks

| Bottleneck | Current Mitigation | Future Solution |
|-----------|-------------------|-----------------|
| DB connection limits | Neon pooler | PgBouncer / read replicas |
| AI API rate limits | Per-user credentials | Retry logic, queue throttling |
| Inngest function timeout | Retries = 0 (dev mode) | Enable retries, set timeouts |
| Realtime connections | Inngest Realtime SSE | Same — Inngest handles scaling |
| Credential decryption | In-memory per request | Edge caching (careful with security) |

### Horizontal Scaling

Because the application is stateless and sessions are DB-backed, it can scale horizontally without coordination:

```
                    ┌─────────────────┐
                    │   Load Balancer │
                    └────────┬────────┘
               ┌─────────────┼─────────────┐
         ┌─────▼────┐  ┌─────▼────┐  ┌─────▼────┐
         │ Next.js  │  │ Next.js  │  │ Next.js  │
         │ Instance │  │ Instance │  │ Instance │
         └─────┬────┘  └─────┬────┘  └─────┬────┘
               └─────────────┼─────────────┘
                    ┌─────────▼────────┐
                    │  Neon PostgreSQL │
                    └──────────────────┘
```

All instances share the same Neon database and Inngest account, so any instance can serve any request.

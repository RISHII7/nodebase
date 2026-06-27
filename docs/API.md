# API Reference

NodeBase exposes a type-safe tRPC API and several REST endpoints. All tRPC calls go through `/api/trpc` and are batched automatically by the tRPC client.

**Base URL:** `http://localhost:3000` (development) or your production domain

---

## Table of Contents

1. [Authentication Overview](#1-authentication-overview)
2. [tRPC Procedures](#2-trpc-procedures)
   - [workflows.*](#workflowsrouter)
   - [credentials.*](#credentialsrouter)
   - [executions.*](#executionsrouter)
3. [REST Endpoints](#3-rest-endpoints)
4. [Error Handling](#4-error-handling)
5. [Client Usage Examples](#5-client-usage-examples)

---

## 1. Authentication Overview

Every tRPC call is executed within a request context that contains the authenticated session. Procedures are classified by access level:

| Level | Description | Middleware |
|-------|-------------|-----------|
| `public` | No auth required | `baseProcedure` |
| `protected` | Requires valid session | `protectedProcedure` |
| `premium` | Requires active Polar.sh subscription | `premiumProcedure` |

Session is read from the `session_token` cookie set by Better Auth. On failure:
- Missing session → `TRPCError: UNAUTHORIZED`
- No active subscription → `TRPCError: FORBIDDEN`

---

## 2. tRPC Procedures

All procedures use **SuperJSON** serialization (handles `Date`, `Map`, `Set`, etc.).

### `workflows` Router

**Router file:** `src/features/workflows/servers/routers.ts`

---

#### `workflows.getMany`

Fetch a paginated list of workflows belonging to the current user.

| Property | Value |
|----------|-------|
| Type | Query |
| Auth | Protected |

**Input:**
```typescript
{
  page: number;      // default: 1, min: 1
  pageSize: number;  // default: 5, min: 1, max: 100
  search: string;    // default: "", case-insensitive name filter
}
```

**Output:**
```typescript
{
  data: Array<{
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
  }>;
  totalCount: number;
}
```

---

#### `workflows.getOne`

Fetch a single workflow with its nodes and connections in React Flow format.

| Property | Value |
|----------|-------|
| Type | Query |
| Auth | Protected |

**Input:**
```typescript
{
  workflowId: string;
}
```

**Output:**
```typescript
{
  id: string;
  name: string;
  nodes: Array<{
    id: string;
    type: NodeType;
    position: { x: number; y: number };
    data: Record<string, unknown>;
  }>;
  edges: Array<{
    id: string;
    source: string;        // fromNodeId
    target: string;        // toNodeId
    sourceHandle: string;  // fromOutput
    targetHandle: string;  // toInput
  }>;
}
```

---

#### `workflows.create`

Create a new workflow with a single `INITIAL` node.

| Property | Value |
|----------|-------|
| Type | Mutation |
| Auth | Premium |

**Input:**
```typescript
{
  name: string;
}
```

**Output:**
```typescript
{
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}
```

---

#### `workflows.update`

Replace the complete node and connection graph for a workflow. Runs as a database transaction: deletes existing nodes/connections then recreates them.

| Property | Value |
|----------|-------|
| Type | Mutation |
| Auth | Protected |

**Input:**
```typescript
{
  workflowId: string;
  nodes: Array<{
    id: string;
    type: NodeType;
    position: { x: number; y: number };
    data: Record<string, unknown>;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;  // default: "main"
    targetHandle?: string;  // default: "main"
  }>;
}
```

**Output:** `null` (void)

---

#### `workflows.updateName`

Update the display name of a workflow.

| Property | Value |
|----------|-------|
| Type | Mutation |
| Auth | Protected |

**Input:**
```typescript
{
  workflowId: string;
  name: string;
}
```

**Output:** `null` (void)

---

#### `workflows.remove`

Permanently delete a workflow and all its nodes, connections, and execution history.

| Property | Value |
|----------|-------|
| Type | Mutation |
| Auth | Protected |

**Input:**
```typescript
{
  workflowId: string;
}
```

**Output:** `null` (void)

---

#### `workflows.execute`

Trigger a workflow execution by sending an event to Inngest.

| Property | Value |
|----------|-------|
| Type | Mutation |
| Auth | Protected |

**Input:**
```typescript
{
  workflowId: string;
}
```

**Output:**
```typescript
{
  ids: string[];  // Inngest event IDs
}
```

**Note:** Execution happens asynchronously. Poll `executions.getMany` or subscribe to Inngest Realtime for status.

---

### `credentials` Router

**Router file:** `src/features/credentials/server/routers.ts`

---

#### `credentials.getMany`

Fetch a paginated list of API credentials for the current user.

| Property | Value |
|----------|-------|
| Type | Query |
| Auth | Protected |

**Input:**
```typescript
{
  page: number;
  pageSize: number;
  search: string;
}
```

**Output:**
```typescript
{
  data: Array<{
    id: string;
    name: string;
    type: CredentialType;  // "OPENAI" | "ANTHROPIC" | "GEMINI"
    value: string;         // AES-encrypted — do not display to users
    userId: string;
  }>;
  totalCount: number;
}
```

---

#### `credentials.getOne`

Fetch a single credential by ID.

| Property | Value |
|----------|-------|
| Type | Query |
| Auth | Protected |

**Input:**
```typescript
{
  credentialId: string;
}
```

**Output:** Single credential object (same shape as `getMany` data items)

---

#### `credentials.getByType`

Fetch all credentials of a specific type. Used by node configuration dialogs to populate dropdowns.

| Property | Value |
|----------|-------|
| Type | Query |
| Auth | Protected |

**Input:**
```typescript
{
  type: CredentialType;  // "OPENAI" | "ANTHROPIC" | "GEMINI"
}
```

**Output:**
```typescript
Array<{
  id: string;
  name: string;
  type: CredentialType;
}>
```

---

#### `credentials.create`

Create a new API credential. The value is AES-encrypted before storage.

| Property | Value |
|----------|-------|
| Type | Mutation |
| Auth | Premium |

**Input:**
```typescript
{
  name: string;
  value: string;          // Plaintext API key — encrypted at server
  type: CredentialType;
}
```

**Output:** Created credential object

---

#### `credentials.update`

Update a credential's name or value. The new value is re-encrypted.

| Property | Value |
|----------|-------|
| Type | Mutation |
| Auth | Protected |

**Input:**
```typescript
{
  credentialId: string;
  name?: string;
  value?: string;
}
```

**Output:** Updated credential object

---

#### `credentials.remove`

Permanently delete a credential. Any nodes referencing this credential will have their `credentialId` set to null.

| Property | Value |
|----------|-------|
| Type | Mutation |
| Auth | Protected |

**Input:**
```typescript
{
  credentialId: string;
}
```

**Output:** `null` (void)

---

### `executions` Router

**Router file:** `src/features/executions/server/routers.ts`

---

#### `executions.getMany`

Fetch a paginated list of execution runs, ordered by start time descending.

| Property | Value |
|----------|-------|
| Type | Query |
| Auth | Protected |

**Input:**
```typescript
{
  page: number;
  pageSize: number;
}
```

**Output:**
```typescript
{
  data: Array<{
    id: string;
    workflowId: string;
    status: ExecutionStatus;  // "RUNNING" | "SUCCESS" | "FAILED"
    error: string | null;
    errorStack: string | null;
    startedAt: Date;
    completedAt: Date | null;
    inngestEventId: string;
    output: Record<string, unknown> | null;
    workflow: {
      id: string;
      name: string;
    };
  }>;
  totalCount: number;
}
```

---

#### `executions.getOne`

Fetch a single execution with full output and error details.

| Property | Value |
|----------|-------|
| Type | Query |
| Auth | Protected |

**Input:**
```typescript
{
  executionId: string;
}
```

**Output:** Single execution object (same shape as `getMany` data items)

---

## 3. REST Endpoints

### `POST /api/auth/[...all]`

Better Auth catch-all handler. Manages all authentication operations.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/sign-up/email` | POST | Email/password registration |
| `/api/auth/sign-in/email` | POST | Email/password login |
| `/api/auth/sign-out` | POST | Invalidate session |
| `/api/auth/social/github` | GET | Initiate GitHub OAuth |
| `/api/auth/social/google` | GET | Initiate Google OAuth |
| `/api/auth/callback/github` | GET | GitHub OAuth callback |
| `/api/auth/callback/google` | GET | Google OAuth callback |
| `/api/auth/get-session` | GET | Fetch current session |
| `/api/auth/polar/*` | GET/POST | Polar.sh plugin endpoints |

**Auth cookies:** Better Auth sets `session_token` as `HttpOnly; SameSite=Lax` cookie.

---

### `GET|POST /api/trpc/[trpc]`

tRPC fetch adapter. All tRPC calls go through this endpoint.

**Query format (GET):**
```
GET /api/trpc/workflows.getMany?input={"json":{"page":1,"pageSize":5,"search":""}}
```

**Batch format (POST):**
```
POST /api/trpc/workflows.getMany,workflows.getOne
Content-Type: application/json

{ "0": { "json": {...} }, "1": { "json": {...} } }
```

---

### `GET|POST|PUT /api/inngest`

Inngest SDK handler. Registers and serves the `executeWorkflow` function.

- **GET** — Introspection (Inngest dashboard)
- **POST** — Webhook delivery (Inngest sends events here)
- **PUT** — Function registration

This endpoint must be publicly accessible for Inngest to deliver events in production.

---

### `POST /api/webhooks/stripe`

Receives Stripe event webhooks to trigger workflow execution.

**Query parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| `workflowId` | Yes | ID of the workflow to execute |

**Request body:** Stripe event JSON payload

**Extracted data** (available in workflow context as `initialData.stripe`):
```typescript
{
  eventId: string;       // Stripe event ID (e.g., "evt_1...")
  eventType: string;     // e.g., "payment_intent.succeeded"
  timestamp: number;     // Unix timestamp
  livemode: boolean;     // false in test mode
  data: unknown;         // Raw event data object
}
```

**Response:**
```json
{ "success": true }
```

**Setup:** Configure your Stripe webhook endpoint URL as:
```
https://your-domain.com/api/webhooks/stripe?workflowId=YOUR_WORKFLOW_ID
```

---

### `POST /api/webhooks/google-form`

Receives Google Form submission data to trigger workflow execution.

**Query parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| `workflowId` | Yes | ID of the workflow to execute |

**Request body:** Google Form submission JSON

**Extracted data** (available in workflow context as `initialData.googleForm`):
```typescript
{
  formId: string;
  formTitle: string;
  responseId: string;
  timestamp: string;     // ISO 8601
  respondentEmail: string;
  responses: Record<string, unknown>;  // Question → answer map
}
```

**Response:**
```json
{ "success": true }
```

---

## 4. Error Handling

### tRPC Error Codes

| Code | HTTP Status | When |
|------|-------------|------|
| `BAD_REQUEST` | 400 | Invalid input (Zod validation failure) |
| `UNAUTHORIZED` | 401 | No valid session |
| `FORBIDDEN` | 403 | No active subscription (premium procedures) |
| `NOT_FOUND` | 404 | Resource not found |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

### Error Response Shape

```json
{
  "error": {
    "json": {
      "message": "UNAUTHORIZED",
      "code": -32001,
      "data": {
        "code": "UNAUTHORIZED",
        "httpStatus": 401,
        "path": "workflows.create"
      }
    }
  }
}
```

### Validation Errors

Input validation uses Zod. Validation failures return `BAD_REQUEST` with field-level messages:
```json
{
  "error": {
    "json": {
      "message": "[{\"code\":\"too_small\",\"minimum\":1,\"path\":[\"page\"],\"message\":\"Number must be greater than or equal to 1\"}]"
    }
  }
}
```

---

## 5. Client Usage Examples

### React Query (client components)

```typescript
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Query
const trpc = useTRPC();
const { data } = useQuery(
  trpc.workflows.getMany.queryOptions({ page: 1, pageSize: 5, search: "" })
);

// Mutation
const qc = useQueryClient();
const createWorkflow = useMutation(
  trpc.workflows.create.mutationOptions({
    onSuccess: () => qc.invalidateQueries(trpc.workflows.getMany.pathKey()),
  })
);
createWorkflow.mutate({ name: "My Workflow" });
```

### Server Components (prefetch pattern)

```typescript
import { trpc, HydrateClient } from "@/trpc/server";

export default async function Page() {
  await trpc.workflows.getMany.prefetch({ page: 1, pageSize: 5, search: "" });

  return (
    <HydrateClient>
      <WorkflowList />
    </HydrateClient>
  );
}
```

### Direct server-side call

```typescript
import { caller } from "@/trpc/server";

const workflows = await caller.workflows.getMany({ page: 1, pageSize: 10, search: "" });
```

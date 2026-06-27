# ADR-003: Inngest for Workflow Orchestration

**Status:** Accepted  
**Date:** 2025-10-15  
**Deciders:** NodeBase team

---

## Context

NodeBase executes user-defined workflows that may include:
- External API calls (potentially slow)
- AI model requests (latency: 1-30 seconds per node)
- Sequential node execution with context passing
- Real-time status updates to the browser
- Error handling and (eventually) retries

These workflows cannot run synchronously in an HTTP handler because:
- They exceed typical serverless function timeouts (10-60 seconds)
- They need to survive HTTP disconnects
- They need real-time progress reporting

Options considered:

| Option | Infrastructure | Retries | Realtime | Serverless |
|--------|---------------|---------|---------|-----------|
| **BullMQ** | Redis required | Manual | Polling/SSE | No |
| **AWS SQS + Lambda** | AWS stack | Built-in | Custom | Yes |
| **Temporal** | Worker servers | Built-in | Polling | No |
| **Inngest** | None | Built-in | Built-in | Yes |
| **Trigger.dev** | None | Built-in | No | Yes |

---

## Decision

We chose **Inngest v3** with the Realtime middleware.

### Reasons

1. **Zero infrastructure** — Inngest is a cloud service with an HTTP-based protocol. No Redis, no RabbitMQ, no worker processes. The Next.js app registers functions at `/api/inngest` and Inngest calls them.

2. **Serverless compatible** — Works on Vercel, Cloudflare Workers, and other serverless platforms. No persistent connections required.

3. **Built-in dev server** — `inngest-cli dev` provides a local queue with full dashboard, event replay, and function logs. Zero setup for local development.

4. **Step functions** — `step.run()` provides automatic checkpointing. Each step can fail and retry independently without re-running completed steps.

5. **Realtime** — `@inngest/realtime` provides a Server-Sent Events (SSE) streaming layer built on Inngest's infrastructure. Node executors publish status; the browser subscribes to a channel. No custom WebSocket server needed.

6. **TypeScript-first** — The Inngest SDK has excellent TypeScript types. `event.data` is fully typed based on the event schema.

7. **`onFailure` handler** — A dedicated failure callback updates the execution record with error details without requiring error-specific polling.

### Why Not BullMQ

- Requires Redis deployment (additional infrastructure cost and complexity)
- No built-in dev server (must run Redis locally)
- No Realtime support (would need custom SSE/WebSocket)
- No serverless support

### Why Not Temporal

- Requires persistent worker servers (not serverless-compatible)
- Significantly higher operational complexity
- Overkill for the current workflow complexity

### Why Not AWS SQS + Lambda

- Tightly coupled to AWS ecosystem
- Realtime status would require custom implementation (AppSync, API Gateway WebSockets)
- Higher infrastructure overhead

---

## Consequences

### Positive

- Workflow execution survives HTTP timeouts and can run for minutes
- Real-time node status updates require zero custom infrastructure
- Local development works without any cloud services
- `step.run()` provides natural checkpointing for long-running workflows
- Inngest dashboard provides full observability without custom logging

### Negative / Trade-offs

- **Vendor dependency** — Workflow execution depends on Inngest cloud availability
- **Latency** — Each event goes from the app to Inngest's servers and back to the app's `/api/inngest` endpoint. Adds ~100-500ms compared to in-process execution.
- **Retries disabled** — Currently `retries: 0` (development shortcut). Production deployments should enable retries.
- **Cold start** — If the Next.js app is on Vercel, Inngest callbacks may hit a cold-start delay on the first invocation.

### Accepted Risks

- If Inngest experiences downtime, workflow execution is unavailable. Mitigation: Inngest has a 99.9% SLA on paid plans.
- Inngest pricing scales with usage. At high execution volumes, this could become expensive.

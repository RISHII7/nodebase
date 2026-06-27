# ADR-001: Next.js 15 App Router + tRPC

**Status:** Accepted  
**Date:** 2025-10-01  
**Deciders:** NodeBase team

---

## Context

We needed to choose a full-stack architecture for NodeBase. The platform requires:

1. A rich interactive UI (visual workflow editor with drag-and-drop)
2. Server-side rendering for initial page loads (SEO, performance)
3. Type-safe API communication between client and server
4. Fast iteration speed for a small team
5. Low infrastructure complexity (ideally a single deployment unit)

Options considered:
- **Next.js + REST** — Familiar but requires manual type definitions for API contracts
- **Next.js + GraphQL** — Type-safe but requires schema definition, resolvers, and code generation
- **Next.js + tRPC** — End-to-end TypeScript types with no code generation
- **Express + React (separate)** — Two deployments, two build systems
- **Remix** — Full-stack but less ecosystem maturity than Next.js

---

## Decision

We chose **Next.js 15 (App Router) with tRPC v11**.

### Why Next.js 15 App Router

- **React Server Components (RSC)** — Server components can fetch data directly without API round trips; ideal for initial page loads
- **Colocation** — Client and server code live in the same repository and deployment
- **Vercel deployment** — Zero-config deployment with automatic edge optimization
- **Turbopack** — Significantly faster dev server than webpack
- **Nested layouts** — Clean pattern for dashboard, editor, and auth layout segments
- **File-based routing** — Matches the feature-based folder structure

### Why tRPC v11

- **Zero code generation** — Types are inferred directly from the router definition; no `graphql-codegen` or `openapi-typescript` step
- **Input validation** — Zod schemas on procedures provide both TypeScript types and runtime validation
- **SuperJSON** — Handles complex types (Date, Map, Set) transparently across the wire
- **React Query integration** — `@trpc/react-query` provides `useQuery`, `useMutation`, `useSuspenseQuery` with the same caching semantics as React Query
- **Server-side prefetch** — `HydrateClient` pattern enables server components to prefetch tRPC queries, avoiding client-side loading states
- **Batch requests** — Multiple tRPC calls in one render are automatically batched into a single HTTP request

---

## Consequences

### Positive

- Refactoring a procedure input schema immediately surfaces all call sites with TypeScript errors
- Adding a new procedure is a single file edit — no API documentation to write, no client code to regenerate
- Server components + prefetch pattern delivers fast initial page loads with no layout shift
- The `caller` pattern allows direct server-to-server procedure calls without HTTP overhead

### Negative / Trade-offs

- **tRPC is not REST** — External clients (mobile apps, third-party integrations) cannot call tRPC directly; REST endpoints must be added separately
- **App Router mental model** — The Server/Client component boundary requires care; mistakes cause subtle hydration issues
- **Bundle size** — tRPC client + React Query adds ~30KB to the client bundle
- **tRPC version complexity** — tRPC v11 has a different API from v10; documentation and Stack Overflow answers are mixed

### Accepted Risks

- Tight coupling between server and client code — changing a procedure signature simultaneously changes both. This is by design for a single-team project.
- tRPC is not as widely adopted as REST — new contributors may have a learning curve.

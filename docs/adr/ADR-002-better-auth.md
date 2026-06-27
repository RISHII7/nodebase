# ADR-002: Better Auth Over NextAuth/Clerk

**Status:** Accepted  
**Date:** 2025-10-10  
**Deciders:** NodeBase team

---

## Context

NodeBase requires authentication that supports:

1. Email/password login
2. GitHub and Google OAuth
3. Polar.sh subscription plugin integration
4. Prisma (PostgreSQL) as the session store
5. Full TypeScript types on the client and server
6. Control over session storage and behavior

Options considered:

| Option | Type | Polar Integration | Control |
|--------|------|-------------------|---------|
| **NextAuth v5** | Open source | Manual | High |
| **Clerk** | SaaS | Via webhooks | Low |
| **Lucia Auth** | Library | Manual | Very high |
| **Better Auth** | Open source | First-class plugin | High |

---

## Decision

We chose **Better Auth v1**.

### Reasons

1. **Polar.sh plugin** — `@polar-sh/better-auth` provides first-class Polar integration with checkout, portal, and subscription state management built in. No manual webhook handling.

2. **Prisma adapter** — Native Prisma adapter stores sessions, accounts, and verifications in the same PostgreSQL database as the rest of the application. No separate auth database.

3. **Plugin architecture** — Adding OAuth providers, payment integrations, or custom flows is done through a composable plugin system rather than forking.

4. **TypeScript-first** — Better Auth exposes fully typed client methods (`authClient.signIn.email()`, `authClient.signIn.social()`), unlike NextAuth v5's more dynamic approach.

5. **Session control** — Database-backed sessions (not JWTs) allow immediate server-side revocation. Better Auth can expire, rotate, and invalidate sessions at any time.

6. **Trusted origins** — Configurable `trustedOrigins` allows Ngrok tunnels to work with OAuth callbacks in development without CORS issues.

### Why Not NextAuth v5

- Polar integration would require manual webhook handling and custom adapter code
- NextAuth v5 (App Router) still had rough edges at the time of adoption
- Less composable plugin system

### Why Not Clerk

- Clerk is a SaaS with vendor lock-in and ongoing cost
- Authentication data lives on Clerk's servers, not your database
- Polar integration requires webhooks and manual syncing rather than a direct plugin
- Less control over session behavior

---

## Consequences

### Positive

- Polar checkout/portal works out of the box with `authClient.checkout()` and `authClient.portal()`
- All auth data (sessions, accounts) is in the same Neon PostgreSQL database
- Rotating the `BETTER_AUTH_SECRET` invalidates all sessions predictably
- `requireAuth()` / `requireUnauth()` server utilities are clean and simple

### Negative / Trade-offs

- **Smaller community** — Better Auth is newer than NextAuth; fewer community plugins and Stack Overflow answers
- **Migration risk** — Switching auth providers later would require migrating session/account data
- **Plugin maintenance** — If `@polar-sh/better-auth` falls behind or breaks, we'd need to maintain it ourselves

### Accepted Risks

- Better Auth is a relatively young library. We accepted the risk of API changes in exchange for its Polar integration and TypeScript quality.

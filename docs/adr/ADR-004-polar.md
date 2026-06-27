# ADR-004: Polar.sh for Subscription Billing

**Status:** Accepted  
**Date:** 2025-10-20  
**Deciders:** NodeBase team

---

## Context

NodeBase needs a subscription billing system to:

1. Gate premium features (workflow creation, credential creation)
2. Process recurring payments
3. Allow users to manage their subscriptions (cancel, update payment)
4. Integrate smoothly with the auth system

Options considered:

| Option | Integration complexity | OSS billing | Auth plugin |
|--------|-----------------------|-------------|-------------|
| **Stripe Billing** | High (webhooks, customer sync) | No | No |
| **Paddle** | Medium | No | No |
| **Lemon Squeezy** | Medium | No | No |
| **Polar.sh** | Low (Better Auth plugin) | Yes | Yes |

---

## Decision

We chose **Polar.sh** with the `@polar-sh/better-auth` plugin.

### Reasons

1. **Better Auth integration** — `@polar-sh/better-auth` provides checkout, portal, and subscription state management as Better Auth plugins. No webhook handling, no customer ID syncing, no manual subscription checks.

2. **Subscription state in auth context** — Subscription status is available directly in the auth session context, making `premiumProcedure` simple to implement: check `customerState.subscriptions.some(s => s.status === 'active')`.

3. **OSS-friendly** — Polar is purpose-built for open-source software and developer tools. Better pricing model for small teams.

4. **Sandbox environment** — Full sandbox for development without real charges. Seamless switch to production.

5. **Customer portal** — `authClient.portal()` opens Polar's hosted customer portal. No custom billing UI needed.

6. **Checkout flow** — `authClient.checkout({ slug: "pro" })` initiates checkout in one line. No custom Stripe Elements UI.

### Why Not Stripe Billing

- Stripe integration requires:
  - Webhook endpoint to receive subscription events
  - Syncing Stripe customer IDs with local user records
  - Manual subscription status queries in every protected procedure
  - Custom UI or Stripe Billing Portal setup
- No Better Auth plugin (would require manual implementation)
- Higher integration complexity for a small team

### Why Not Lemon Squeezy / Paddle

- No Better Auth plugin
- Not designed for developer tools/SaaS
- Lemon Squeezy has had reliability issues

---

## Consequences

### Positive

- Zero custom webhook code for subscription management
- Checkout and portal are 1-2 line implementations
- Subscription state check in `premiumProcedure` is trivially simple
- Sandbox → production switch is a single config change

### Negative / Trade-offs

- **Polar maturity** — Polar is newer than Stripe; less community documentation and fewer integrations
- **Plugin dependency** — `@polar-sh/better-auth` must stay in sync with both Better Auth and Polar API updates
- **Feature set** — Polar has fewer advanced billing features than Stripe (usage-based billing, complex pricing tiers)
- **Payment methods** — Polar supports fewer payment methods than Stripe (primarily cards)

### Accepted Risks

- Polar's plugin ecosystem is less mature. Breaking changes in `@polar-sh/better-auth` could require significant rework.
- If Polar is discontinued, migration to Stripe would require significant work on both the auth integration and the billing UI.

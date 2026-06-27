# Troubleshooting Guide

Common issues, error messages, and debugging playbooks for NodeBase.

---

## Table of Contents

1. [Database Issues](#1-database-issues)
2. [Authentication Issues](#2-authentication-issues)
3. [Workflow Execution Issues](#3-workflow-execution-issues)
4. [Credential Issues](#4-credential-issues)
5. [Inngest Issues](#5-inngest-issues)
6. [Subscription Issues](#6-subscription-issues)
7. [Deployment Issues](#7-deployment-issues)
8. [General Debugging](#8-general-debugging)

---

## 1. Database Issues

### Error: `Can't reach database server`

**Symptom:** App fails to start or returns 500 errors immediately.

**Causes & fixes:**
1. `DATABASE_URL` is not set or malformed
   ```bash
   # Test your connection string
   npx prisma db pull
   ```
2. Neon database is paused (free tier auto-pauses after 5 minutes)
   - Go to Neon dashboard → your project → click "Resume"
3. SSL mode mismatch — ensure `?sslmode=require` is in the connection string
4. IP not allowlisted — check Neon's IP allowlist settings

### Error: `Table "User" does not exist`

**Cause:** Migrations have not been run.

**Fix:**
```bash
npx prisma migrate deploy
# Or in development:
npx prisma migrate dev
```

### Error: `Prisma Client is not yet initialized`

**Cause:** `npx prisma generate` has not been run after installation or after schema changes.

**Fix:**
```bash
npx prisma generate
```

### Error: `prepared statement already exists` (Neon)

**Cause:** Prisma's query engine using connection-level prepared statements conflicts with Neon's connection pooler.

**Fix:** Ensure you're using the **pooled** connection string (`-pooler` in the hostname) for the application, and the **direct** connection string for migrations.

---

## 2. Authentication Issues

### OAuth callback returns 400 or redirects to wrong page

**Causes:**
1. `BETTER_AUTH_URL` doesn't match the current host
   - Development: should be `http://localhost:3000`
   - With Ngrok: should be `https://your-tunnel.ngrok-free.app`
2. OAuth app callback URL doesn't match `BETTER_AUTH_URL/api/auth/callback/{provider}`
3. `NGROK_URL` is set but doesn't match the current Ngrok session (Ngrok generates a new domain each run on the free plan)

**Fix:**
```env
# Check these three values match your current URL
BETTER_AUTH_URL="https://your-tunnel.ngrok-free.app"
NEXT_PUBLIC_APP_URL="https://your-tunnel.ngrok-free.app"
NGROK_URL="your-tunnel.ngrok-free.app"
```

### GitHub OAuth: `redirect_uri_mismatch`

**Cause:** The callback URL in GitHub OAuth app settings doesn't match the one Better Auth generates.

**Fix:**
1. Go to GitHub → Settings → Developer settings → OAuth Apps → your app
2. Set **Authorization callback URL** to exactly: `{BETTER_AUTH_URL}/api/auth/callback/github`
3. No trailing slash

### Google OAuth: `Error 400: redirect_uri_mismatch`

**Fix:**
1. Go to Google Cloud Console → APIs & Services → Credentials → your OAuth client
2. Under **Authorized redirect URIs**, add: `{BETTER_AUTH_URL}/api/auth/callback/google`
3. Save and wait 5 minutes (Google caches these)

### `UNAUTHORIZED` on tRPC calls after login

**Cause:** Session cookie is not being sent with requests.

**Checks:**
- Check browser DevTools → Application → Cookies — is `session_token` present?
- Ensure `BETTER_AUTH_URL` matches the actual request origin (cookie domain issues)
- If using Ngrok: ensure `NGROK_URL` is in `trustedOrigins` in `src/lib/auth.ts`

---

## 3. Workflow Execution Issues

### Workflow execution starts but nodes never update status

**Cause:** Inngest is not running or not connected.

**Checks:**
1. Is the Inngest dev server running? (`http://localhost:8288`)
2. Did Next.js register the `executeWorkflow` function? Check Inngest dashboard → Apps
3. Check browser DevTools → Network — filter for "EventSource" connections (Inngest Realtime uses SSE)

**Fix:**
```bash
# Start the full dev stack
npm run dev:all
```

### Execution stays in `RUNNING` state forever

**Causes:**
1. Inngest function threw an error but `onFailure` handler didn't update the record
2. Inngest dev server was stopped while execution was in progress
3. Network timeout on AI API call

**Debug:**
1. Check Inngest dashboard → Runs — find the failed run
2. Look at Sentry for the error
3. Manually fix the stuck execution:
   ```bash
   # In Prisma Studio or direct SQL
   UPDATE "Execution" 
   SET status = 'FAILED', 
       "completedAt" = NOW(),
       error = 'Manually marked as failed'
   WHERE status = 'RUNNING';
   ```

### AI node fails with `Credential not found`

**Cause:** The node's `credentialId` references a credential that was deleted, or belongs to a different user.

**Fix:**
1. Open the node's configuration dialog
2. Select a valid credential from the dropdown
3. Save the workflow

### AI node fails with `Invalid API Key`

**Cause:** The stored API key is incorrect or has been revoked by the provider.

**Fix:**
1. Go to Credentials page
2. Edit the credential with a new valid API key
3. Re-run the workflow

### HTTP_REQUEST node fails with `ECONNREFUSED`

**Cause:** The endpoint URL is incorrect, or the target server is down.

**Debug:** Check the execution's `error` field for the full error message.

### Workflow output is empty (`{}`)

**Cause:** All nodes successfully executed but no node wrote to the context with a `variableName`. The INITIAL/MANUAL_TRIGGER node returns the context unchanged.

**Fix:** Ensure that action nodes (HTTP_REQUEST, AI nodes) have a `variableName` configured.

---

## 4. Credential Issues

### Error: `Invalid encryption key`

**Cause:** `ENCRYPTION_KEY` env var is not set or has changed since credentials were created.

**Symptoms:** Decryption fails at execution time, AI nodes error with "Failed to decrypt credential".

**Fix:**
- If key was accidentally changed: restore the original key
- If key must change: re-encrypt all credentials before changing the key

**NEVER** clear or change `ENCRYPTION_KEY` without re-encrypting all credential values first.

### Credential dropdown is empty in node dialog

**Cause:** No credentials of the required type exist for this user.

**Fix:**
1. Go to Credentials page
2. Create a new credential of the appropriate type (OPENAI, ANTHROPIC, or GEMINI)
3. Return to the workflow editor and reopen the node configuration dialog

---

## 5. Inngest Issues

### Functions not appearing in Inngest dashboard

**Cause:** Inngest has not been able to reach your app's `/api/inngest` endpoint.

**Local development fix:**
1. Start Ngrok: `ngrok http 3000`
2. In Inngest dev server (`http://localhost:8288`): Apps → Add App → `http://localhost:3000/api/inngest`

**Production fix:**
1. Go to Inngest dashboard → Apps → your app
2. Verify the Endpoint URL is `https://your-domain.com/api/inngest`
3. Click Sync

### Events are queued but function never runs

**Cause:** Function is registered but can't be invoked (usually a code error in the function definition).

**Debug:**
1. Check Inngest dashboard → Functions — is `execute-workflow` listed?
2. Check for runtime errors in Next.js startup logs
3. Ensure `src/app/api/inngest/route.ts` exports the function correctly

### `Inngest: Event key not set`

**Cause:** Running in production without proper Inngest configuration.

**Fix:** In development, the Inngest dev server handles events automatically. In production, configure the Event Key in your Vercel environment or via `INNGEST_EVENT_KEY` env var.

---

## 6. Subscription Issues

### "Upgrade to Pro" shows even after subscribing

**Cause:** Polar.sh customer state is cached or the subscription hasn't synced.

**Debug:**
```typescript
// In browser console (if using auth client)
const customer = await authClient.useSession();
console.log(customer.data);
```

**Fix:**
1. Sign out and sign back in (refreshes session with updated subscription state)
2. Check Polar.sh dashboard → Customers — verify the subscription is `active`
3. Verify `POLAR_ACCESS_TOKEN` is the correct production (not sandbox) token

### `FORBIDDEN` error on workflow creation

**Cause:** `premiumProcedure` check failed — user doesn't have an active subscription.

**Fix:** Subscribe to the Pro plan via the "Upgrade to Pro" button in the sidebar.

### Polar checkout redirects to wrong URL

**Cause:** `POLAR_SUCCESS_URL` is set to localhost instead of production URL.

**Fix:** Update `POLAR_SUCCESS_URL` to your production URL in the Vercel environment variables.

---

## 7. Deployment Issues

### Vercel build fails: `Environment variable DATABASE_URL not found`

**Fix:** Add all required environment variables in Vercel Dashboard → Settings → Environment Variables.

### Build fails: `Prisma Client not generated`

**Cause:** The Prisma client is generated to `src/generated/prisma/` and must be available at build time.

**Fix:** Vercel runs `npm run build` but not `prisma generate` automatically. Add to your build command or `package.json`:
```json
{
  "scripts": {
    "build": "prisma generate && next build --turbopack"
  }
}
```

### `SENTRY_AUTH_TOKEN` causing build failure

**Cause:** Source map upload fails if the token is invalid or has wrong scopes.

**Fix:**
1. Generate a new token at Sentry with `project:releases` and `org:read` scopes
2. Update `SENTRY_AUTH_TOKEN` in Vercel

---

## 8. General Debugging

### View database in real-time

```bash
npx prisma studio
# Opens at http://localhost:5555
```

### Check environment variables are loaded

```bash
# Add temporarily to any server component:
console.log("DB URL prefix:", process.env.DATABASE_URL?.substring(0, 20));
```

### Trace a specific tRPC call

In browser DevTools → Network → filter by `/api/trpc`:
- Request payload: the tRPC input
- Response: the tRPC output or error

### Inspect Inngest event payload

In Inngest dev server (`http://localhost:8288`) → Events → click any event to see:
- Event data sent
- Which functions consumed it
- Run logs

### Debug Handlebars templates

Add a temporary console.log in the executor to see the context before template rendering:

```typescript
// Temporarily add to executor
console.log("Context before render:", JSON.stringify(context, null, 2));
const rendered = Handlebars.compile(data.userPrompt)(context);
console.log("Rendered prompt:", rendered);
```

### Reset development database

```bash
# WARNING: Deletes all data
npx prisma migrate reset
# Then re-run: npm run dev
```

### Check for TypeScript errors

```bash
npx tsc --noEmit
```

### Run Biome check

```bash
npm run lint
```

# Environment Variables

Complete reference for all environment variables used by NodeBase. Copy `.env.example` to `.env` and fill in every required variable before starting the application.

---

## Table of Contents

1. [Quick Reference](#1-quick-reference)
2. [Variable Details](#2-variable-details)
3. [Generating Secret Values](#3-generating-secret-values)
4. [Environment-Specific Configuration](#4-environment-specific-configuration)
5. [Runtime vs Build-time Variables](#5-runtime-vs-build-time-variables)

---

## 1. Quick Reference

| Variable | Required | Category | Source |
|----------|----------|----------|--------|
| `DATABASE_URL` | Yes | Database | Neon dashboard |
| `BETTER_AUTH_SECRET` | Yes | Auth | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Yes | Auth | Your app URL |
| `GITHUB_CLIENT_ID` | OAuth only | Auth/OAuth | GitHub Developer Settings |
| `GITHUB_CLIENT_SECRET` | OAuth only | Auth/OAuth | GitHub Developer Settings |
| `GOOGLE_CLIENT_ID` | OAuth only | Auth/OAuth | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth only | Auth/OAuth | Google Cloud Console |
| `GEMINI_API_KEY` | AI nodes | AI | Google AI Studio |
| `OPENAI_API_KEY` | AI nodes | AI | OpenAI Platform |
| `ANTHROPIC_API_KEY` | AI nodes | AI | Anthropic Console |
| `SENTRY_AUTH_TOKEN` | Yes (build) | Monitoring | Sentry settings |
| `POLAR_ACCESS_TOKEN` | Yes | Payments | Polar.sh settings |
| `POLAR_SUCCESS_URL` | Yes | Payments | Your app URL |
| `NEXT_PUBLIC_APP_URL` | Yes | App | Your app URL |
| `NGROK_URL` | Dev only | Dev | Ngrok dashboard |
| `ENCRYPTION_KEY` | Yes | Security | `openssl rand -hex 32` |

Implicit variables set by the runtime (do not set manually):

| Variable | Set By | Used For |
|----------|--------|---------|
| `NODE_ENV` | Node.js / build tools | Dev/prod behavior branching |
| `VERCEL_URL` | Vercel platform | Server-side tRPC URL construction |
| `NEXT_RUNTIME` | Next.js | Sentry config (nodejs vs edge) |
| `CI` | CI/CD systems | Suppresses Sentry verbose logging |

---

## 2. Variable Details

---

### `DATABASE_URL`

PostgreSQL connection string for the primary database.

| Property | Value |
|----------|-------|
| Type | String (connection URL) |
| Required | Yes |
| Used in | `src/lib/db.ts`, `prisma.config.ts` |
| Format | `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require` |

**Neon-specific format (recommended):**
```
postgresql://neondb_owner:PASSWORD@HOST-pooler.ap-region.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

Use the **pooled** connection string for the application (`-pooler` suffix) and the direct connection string for migrations.

**Where to get it:** Neon dashboard → Your project → Connection Details → Connection string

**Example:**
```env
DATABASE_URL="postgresql://neondb_owner:npg_secret@ep-cool-name-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

---

### `BETTER_AUTH_SECRET`

Random secret used by Better Auth to sign session tokens and cookies.

| Property | Value |
|----------|-------|
| Type | String (base64 encoded) |
| Required | Yes |
| Used in | `src/lib/auth.ts` |
| Minimum length | 32 bytes (before base64 encoding) |

**Generate:**
```bash
openssl rand -base64 32
```

**Example:**
```env
BETTER_AUTH_SECRET="0ffQxsBx8FLbrhQ6XMVjF2dAtyOy9umi"
```

**Security:** Changing this value invalidates all existing sessions — all users will be logged out.

---

### `BETTER_AUTH_URL`

Base URL of the application. Used by Better Auth for:
- Constructing OAuth callback URLs (`{BETTER_AUTH_URL}/api/auth/callback/github`)
- Setting cookie domain for session tokens

| Property | Value |
|----------|-------|
| Type | String (HTTPS URL in production) |
| Required | Yes |
| Used in | `src/lib/auth.ts` |

**Development:**
```env
BETTER_AUTH_URL="http://localhost:3000"
```

**Production:**
```env
BETTER_AUTH_URL="https://your-app.vercel.app"
```

**Important:** This must match the URL registered in your OAuth app settings on GitHub/Google.

---

### `GITHUB_CLIENT_ID`

OAuth application client ID for GitHub login.

| Property | Value |
|----------|-------|
| Type | String |
| Required | Only if GitHub OAuth is enabled |
| Used in | `src/lib/auth.ts` (GitHub social provider) |

**Where to get it:** GitHub → Settings → Developer settings → OAuth Apps → New OAuth App

**Callback URL to register:** `{BETTER_AUTH_URL}/api/auth/callback/github`

**Example:**
```env
GITHUB_CLIENT_ID="Ov23liWRRBM3HHeCyZDs"
```

---

### `GITHUB_CLIENT_SECRET`

OAuth application client secret for GitHub login.

| Property | Value |
|----------|-------|
| Type | String |
| Required | Only if GitHub OAuth is enabled |
| Used in | `src/lib/auth.ts` (GitHub social provider) |

**Example:**
```env
GITHUB_CLIENT_SECRET="cb3d22c621c5e31a0da732bb648f89aa59b4013c"
```

---

### `GOOGLE_CLIENT_ID`

OAuth application client ID for Google login.

| Property | Value |
|----------|-------|
| Type | String |
| Required | Only if Google OAuth is enabled |
| Used in | `src/lib/auth.ts` (Google social provider) |

**Where to get it:** Google Cloud Console → APIs & Services → Credentials → Create OAuth 2.0 Client ID

**Authorized redirect URI to add:** `{BETTER_AUTH_URL}/api/auth/callback/google`

**Example:**
```env
GOOGLE_CLIENT_ID="994330676389-jmqh7uk410nv9jvua1ohnkdhhcugcisr.apps.googleusercontent.com"
```

---

### `GOOGLE_CLIENT_SECRET`

OAuth application client secret for Google login.

| Property | Value |
|----------|-------|
| Type | String |
| Required | Only if Google OAuth is enabled |
| Used in | `src/lib/auth.ts` (Google social provider) |

**Example:**
```env
GOOGLE_CLIENT_SECRET="GOCSPX-your-secret-here"
```

---

### `GEMINI_API_KEY`

API key for Google's Gemini AI models. Used when executing GEMINI workflow nodes.

| Property | Value |
|----------|-------|
| Type | String |
| Required | Only if GEMINI nodes are used |
| Used in | `src/features/executions/components/gemini/executor/index.ts` |
| Model | `gemini-2.5-flash` |

**Note:** This is the *server-side fallback* key. Individual users can also store their own Gemini API key as an encrypted credential in the database and reference it from their GEMINI nodes. This env var is not currently used in the executor — credentials from the database are used instead.

**Where to get it:** [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

**Example:**
```env
GEMINI_API_KEY="AIzaSyB..."
```

---

### `OPENAI_API_KEY`

API key for OpenAI's GPT models. Used when executing OPENAI workflow nodes.

| Property | Value |
|----------|-------|
| Type | String (starts with `sk-proj-`) |
| Required | Only if OPENAI nodes are used |
| Used in | `src/features/executions/components/openai/executor/index.ts` |
| Model | `gpt-4` |

**Where to get it:** [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

**Example:**
```env
OPENAI_API_KEY="sk-proj-..."
```

---

### `ANTHROPIC_API_KEY`

API key for Anthropic's Claude models. Used when executing ANTHROPIC workflow nodes.

| Property | Value |
|----------|-------|
| Type | String (starts with `sk-ant-`) |
| Required | Only if ANTHROPIC nodes are used |
| Used in | `src/features/executions/components/anthropic/executor/index.ts` |
| Model | `claude-sonnet-4-5` |

**Where to get it:** [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)

**Example:**
```env
ANTHROPIC_API_KEY="sk-ant-api03-..."
```

---

### `SENTRY_AUTH_TOKEN`

Authentication token for uploading source maps to Sentry during production builds. Also stored in `.env.sentry-build-plugin`.

| Property | Value |
|----------|-------|
| Type | String (starts with `sntrys_`) |
| Required | Yes (for source map upload in builds) |
| Used in | `next.config.ts` (Sentry Next.js plugin), `.env.sentry-build-plugin` |

**Where to get it:** Sentry → Settings → Account → API → Auth Tokens → Create New Token

**Scopes required:** `project:releases`, `org:read`

**Example:**
```env
SENTRY_AUTH_TOKEN="sntrys_eyJpYXQiOjE..."
```

**Note:** This token is only needed at build time. It does not need to be set in the production runtime environment.

---

### `POLAR_ACCESS_TOKEN`

API access token for the Polar.sh payments SDK. Used to verify subscriptions and manage customer portals.

| Property | Value |
|----------|-------|
| Type | String (starts with `polar_oat_`) |
| Required | Yes |
| Used in | `src/lib/polar.ts`, `src/lib/auth.ts` (Polar plugin) |
| Environment | Sandbox in development, production token for live |

**Where to get it:** Polar.sh → Settings → Access Tokens → Create Token

**Development (sandbox):**
```env
POLAR_ACCESS_TOKEN="polar_oat_sandbox_..."
```

**Production:**
```env
POLAR_ACCESS_TOKEN="polar_oat_..."
```

---

### `POLAR_SUCCESS_URL`

URL to redirect users to after a successful Polar.sh checkout.

| Property | Value |
|----------|-------|
| Type | String (URL) |
| Required | Yes |
| Used in | `src/lib/auth.ts` (Polar checkout plugin) |

**Development:**
```env
POLAR_SUCCESS_URL="http://localhost:3000"
```

**Production:**
```env
POLAR_SUCCESS_URL="https://your-app.vercel.app"
```

---

### `NEXT_PUBLIC_APP_URL`

Public-facing application URL. This variable is exposed to the browser (note the `NEXT_PUBLIC_` prefix). Used to construct webhook URLs in trigger node dialogs.

| Property | Value |
|----------|-------|
| Type | String (URL) |
| Required | Yes |
| Used in | `src/features/triggers/components/stripe-trigger/dialog/index.tsx`, `src/features/triggers/components/google-form-trigger/dialog/index.tsx` |
| Browser-visible | Yes (`NEXT_PUBLIC_` prefix) |

**Development:**
```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**With Ngrok (for external webhook testing):**
```env
NEXT_PUBLIC_APP_URL="https://your-tunnel.ngrok-free.app"
```

**Production:**
```env
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
```

---

### `NGROK_URL`

Ngrok tunnel domain (without `https://`) for local development. Added to Better Auth's `trustedOrigins` list so OAuth callbacks work through the tunnel.

| Property | Value |
|----------|-------|
| Type | String (domain only, no protocol) |
| Required | Development only |
| Used in | `src/lib/auth.ts` (trustedOrigins), `mprocs.yaml` |

**Get it:** Start Ngrok with `ngrok http 3000` and copy the domain from the output.

**Example:**
```env
NGROK_URL="repeatedly-cute-gnat.ngrok-free.app"
```

**Effect in code:**
```typescript
trustedOrigins: [`https://${process.env.NGROK_URL}`]
```

---

### `ENCRYPTION_KEY`

256-bit symmetric key used by Cryptr to AES-encrypt credential values stored in the database.

| Property | Value |
|----------|-------|
| Type | String (64-char hex) |
| Required | Yes |
| Used in | `src/lib/encryption.ts` |
| Length | 64 hexadecimal characters (= 32 bytes = 256 bits) |

**Generate:**
```bash
openssl rand -hex 32
```

**Example:**
```env
ENCRYPTION_KEY="26df57064e9b263321862bd25bf42945beaa318d7727423e72b371ef5e9c67e8"
```

**Critical:** If this key changes, all encrypted credentials in the database become undecryptable. Store it securely (Vercel environment variables, AWS Secrets Manager, etc.) and never rotate it without re-encrypting all credentials first.

---

## 3. Generating Secret Values

| Variable | Command |
|----------|---------|
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
| `ENCRYPTION_KEY` | `openssl rand -hex 32` |

**Node.js alternative:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Online generator (avoid for production):** Use a local command, not an online generator, for production secrets.

---

## 4. Environment-Specific Configuration

NodeBase uses a single `.env` file. There are no `.env.development` or `.env.production` files — values are swapped manually or via your deployment platform.

### Development

```env
BETTER_AUTH_URL="http://localhost:3000"
POLAR_SUCCESS_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NGROK_URL="your-tunnel.ngrok-free.app"
```

### Production (Vercel)

Set these via `vercel env add` or the Vercel dashboard:

```env
BETTER_AUTH_URL="https://your-app.vercel.app"
POLAR_SUCCESS_URL="https://your-app.vercel.app"
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
# Remove NGROK_URL entirely
```

---

## 5. Runtime vs Build-time Variables

| Variable | When Needed | Notes |
|----------|-------------|-------|
| `DATABASE_URL` | Runtime | Required for both dev and prod |
| `BETTER_AUTH_SECRET` | Runtime | Required for both |
| `BETTER_AUTH_URL` | Runtime | Required for both |
| `GITHUB_CLIENT_*` | Runtime | OAuth flow |
| `GOOGLE_CLIENT_*` | Runtime | OAuth flow |
| `GEMINI_API_KEY` | Runtime | Node execution |
| `OPENAI_API_KEY` | Runtime | Node execution |
| `ANTHROPIC_API_KEY` | Runtime | Node execution |
| `SENTRY_AUTH_TOKEN` | Build-time | Source map upload only |
| `POLAR_ACCESS_TOKEN` | Runtime | Subscription checks |
| `POLAR_SUCCESS_URL` | Runtime | Checkout redirect |
| `NEXT_PUBLIC_APP_URL` | Build + Runtime | Baked into client bundle |
| `NGROK_URL` | Runtime (dev) | Local tunneling |
| `ENCRYPTION_KEY` | Runtime | Credential encryption |

**`NEXT_PUBLIC_*` variables** are embedded into the JavaScript bundle at build time. Changing them requires a rebuild. They are visible to users in the browser — never put secrets in `NEXT_PUBLIC_*` variables.

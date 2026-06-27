# Development Guide

Everything you need to run NodeBase locally, contribute code, and understand the development workflow.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Initial Setup](#2-initial-setup)
3. [Running the Development Server](#3-running-the-development-server)
4. [Development Services](#4-development-services)
5. [Database Workflow](#5-database-workflow)
6. [Code Quality](#6-code-quality)
7. [Commit Conventions](#7-commit-conventions)
8. [Project Scripts Reference](#8-project-scripts-reference)

---

## 1. Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| npm | 10+ | Included with Node.js |
| Git | Any | [git-scm.com](https://git-scm.com) |
| Ngrok | Latest | [ngrok.com/download](https://ngrok.com/download) (optional) |

**Recommended IDE:** VS Code with:
- [Biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) extension (linting/formatting)
- [Prisma](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma) extension (schema highlighting)

---

## 2. Initial Setup

### Step 1: Clone the repository

```bash
git clone https://github.com/your-org/nodebase.git
cd nodebase
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values. Minimum required for basic development:

```env
# Neon PostgreSQL (get from neon.tech)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Auth secret (generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET="your-generated-secret"
BETTER_AUTH_URL="http://localhost:3000"

# Encryption key (generate with: openssl rand -hex 32)
ENCRYPTION_KEY="your-generated-hex-key"

# Polar.sh (get from polar.sh)
POLAR_ACCESS_TOKEN="polar_oat_sandbox_..."
POLAR_SUCCESS_URL="http://localhost:3000"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Optional (for full functionality):
```env
# GitHub OAuth
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# AI providers
OPENAI_API_KEY="sk-proj-..."
ANTHROPIC_API_KEY="sk-ant-..."
GEMINI_API_KEY="AIzaSy..."

# Ngrok (for external webhooks/OAuth)
NGROK_URL="your-tunnel.ngrok-free.app"
```

### Step 4: Set up the database

```bash
# Apply migrations
npx prisma migrate dev

# Generate the Prisma client
npx prisma generate
```

### Step 5: Start development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 3. Running the Development Server

### Option A: Next.js only (simplest)

```bash
npm run dev
```

Starts Next.js with Turbopack on port 3000. Sufficient for:
- UI development
- tRPC API changes
- Auth changes
- Credential management

**Limitation:** Workflow execution will not work — Inngest cannot deliver events to `localhost`.

### Option B: Full development stack

```bash
npm run dev:all
```

Starts all services via [mprocs](https://github.com/pvolok/mprocs) (defined in `mprocs.yaml`):

| Service | Port | Purpose |
|---------|------|---------|
| Next.js (Turbopack) | 3000 | Main application |
| Inngest dev server | 8288 | Local event queue |
| Ngrok | — | Public tunnel for webhooks |
| Prisma Studio | 5555 | Database GUI |

```mermaid
flowchart LR
    NGROK[Ngrok<br/>:443 public] -->|tunnel| NEXT[Next.js<br/>:3000]
    INNGEST[Inngest dev<br/>:8288] -->|delivers events| NEXT
    NEXT -->|registers functions| INNGEST
    PRISMA[Prisma Studio<br/>:5555] -->|reads/writes| DB[(Neon DB)]
    NEXT --> DB
```

### Option C: Individual services

```bash
# Just Inngest dev server
npm run inngest:dev

# Just Ngrok tunnel (replace NGROK_URL value with output)
npx ngrok http 3000

# Just Prisma Studio
npx prisma studio
```

---

## 4. Development Services

### 4.1 Inngest Dev Server

The Inngest dev server (`http://localhost:8288`) provides:
- Local event queue — no Inngest cloud account needed for development
- Function execution dashboard
- Event replay and debugging
- Real-time function logs

**Starting it:**
```bash
npx inngest-cli@latest dev
```

**Registering functions:** Next.js automatically registers functions at startup by hitting `/api/inngest`. The dev server handles this if you start Next.js first.

**Sending test events:**
```bash
# Via Inngest dashboard (localhost:8288)
# Or programmatically:
npx inngest-cli@latest events send workflows/execute.workflow \
  '{"workflowId": "your-workflow-id"}'
```

### 4.2 Ngrok

Ngrok creates a public HTTPS tunnel to your localhost. Required for:
- External OAuth callbacks (GitHub/Google)
- Testing Stripe webhooks
- Testing Google Form webhooks

**Start Ngrok:**
```bash
ngrok http 3000
```

Copy the domain from the output (e.g., `abc123.ngrok-free.app`) and set it in `.env`:
```env
NGROK_URL="abc123.ngrok-free.app"
NEXT_PUBLIC_APP_URL="https://abc123.ngrok-free.app"
BETTER_AUTH_URL="https://abc123.ngrok-free.app"
```

**Note:** Free Ngrok tunnels get a new domain each session. Update your `.env` and OAuth app settings accordingly.

### 4.3 Prisma Studio

Visual database browser at `http://localhost:5555`:

```bash
npx prisma studio
```

Use it to:
- Browse all database tables
- Manually create/edit records
- Debug execution output
- Inspect credential encryption (you'll see the encrypted `value`)

### 4.4 mprocs Configuration

`mprocs.yaml` defines all services for `npm run dev:all`:

```yaml
procs:
  ngrok:
    cmd: "npx dotenv -e .env -- ngrok http 3000 --domain $NGROK_URL"

  inngest:
    cmd: "npm run inngest:dev"

  next:
    cmd: "npm run dev"

  prisma-studio:
    cmd: "npx prisma studio"
```

---

## 5. Database Workflow

### Creating a migration

After modifying `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name describe_your_change
```

This:
1. Creates a new migration file in `prisma/migrations/`
2. Applies the migration to your development database
3. Regenerates the Prisma client

### Adding a new model field

1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_field_name`
3. The Prisma client is auto-regenerated

### Adding a new enum value

1. Add the value to the enum in `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_enum_value`
3. Update any code that switches on the enum

### Seeding data

There's no seed file currently. Use Prisma Studio or write a one-off script:

```typescript
// scripts/seed.ts
import { db } from "@/lib/db";

async function main() {
  await db.user.create({
    data: {
      name: "Test User",
      email: "test@example.com",
    },
  });
}

main().catch(console.error).finally(() => db.$disconnect());
```

Run with:
```bash
npx tsx scripts/seed.ts
```

---

## 6. Code Quality

### Biome (Linter + Formatter)

The project uses [Biome](https://biomejs.dev/) for both linting and formatting (replaces ESLint + Prettier).

**Configuration:** `biome.json`

```bash
# Check for issues
npm run lint

# Auto-fix
npm run lint:fix
```

**VS Code integration:** Install the Biome extension and add to `.vscode/settings.json`:
```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  }
}
```

### TypeScript

Strict mode is enabled in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": false
  }
}
```

**Type check:**
```bash
npx tsc --noEmit
```

### Path Aliases

Use `@/` instead of relative imports:

```typescript
// Good
import { db } from "@/lib/db";
import { encrypt } from "@/lib/encryption";

// Avoid
import { db } from "../../lib/db";
```

---

## 7. Commit Conventions

NodeBase uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by Semantic Release.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Version bump | Use for |
|------|-------------|---------|
| `feat` | minor | New feature |
| `fix` | patch | Bug fix |
| `docs` | patch* | Documentation changes |
| `refactor` | patch* | Code refactor without behavior change |
| `style` | patch* | Formatting, whitespace |
| `chore` | patch* | Build system, dependencies |
| `test` | — | Adding/modifying tests |
| `perf` | patch | Performance improvement |
| `ci` | — | CI/CD changes |
| `BREAKING CHANGE` | major | Breaking change (in footer) |

\* `docs`, `refactor`, `style`, `chore` trigger patch releases per `.releaserc.json`

### Examples

```bash
git commit -m "feat(workflows): add parallel node execution support"
git commit -m "fix(auth): correct OAuth callback URL construction"
git commit -m "docs(api): add tRPC procedure examples"
git commit -m "chore(deps): upgrade Next.js to 15.6.0"
git commit -m "feat!: redesign workflow data model

BREAKING CHANGE: Workflow nodes now use UUIDs instead of CUIDs"
```

---

## 8. Project Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `next dev --turbopack` | Start Next.js dev server with Turbopack |
| `build` | `next build --turbopack` | Production build |
| `start` | `next start` | Start production server |
| `lint` | `biome check .` | Run all Biome checks |
| `lint:fix` | `biome check --write .` | Auto-fix all Biome issues |
| `dev:all` | `dotenv -e .env -- mprocs` | Start all dev services |
| `inngest:dev` | `inngest-cli dev` | Start Inngest dev server |
| `ngrok:dev` | `dotenv -e .env -- ngrok http 3000 --domain $NGROK_URL` | Start Ngrok with configured domain |

**Prisma commands (not in package.json, run directly):**

| Command | Description |
|---------|-------------|
| `npx prisma migrate dev` | Create and apply migration |
| `npx prisma migrate deploy` | Apply pending migrations (production) |
| `npx prisma migrate status` | View migration status |
| `npx prisma generate` | Regenerate Prisma client |
| `npx prisma studio` | Open database browser |
| `npx prisma db push` | Push schema without migration (prototyping) |
| `npx prisma db pull` | Pull schema from existing database |
| `npx prisma validate` | Validate schema file |

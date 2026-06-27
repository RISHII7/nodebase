# Deployment Guide

NodeBase is designed for deployment on [Vercel](https://vercel.com) with [Neon](https://neon.tech) as the database. This guide covers both Vercel deployment and self-hosted options.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [External Service Setup](#2-external-service-setup)
3. [Vercel Deployment](#3-vercel-deployment)
4. [Self-hosted Deployment](#4-self-hosted-deployment)
5. [Database Migrations](#5-database-migrations)
6. [CI/CD Pipeline](#6-cicd-pipeline)
7. [Production Checklist](#7-production-checklist)

---

## 1. Prerequisites

Before deploying, you need accounts and credentials for:

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| [Vercel](https://vercel.com) | Hosting | Yes |
| [Neon](https://neon.tech) | PostgreSQL database | Yes |
| [Inngest](https://inngest.com) | Workflow execution | Yes |
| [Polar.sh](https://polar.sh) | Subscription billing | Yes |
| [Sentry](https://sentry.io) | Error monitoring | Yes |
| [GitHub](https://github.com/settings/developers) | OAuth | Free |
| [Google Cloud](https://console.cloud.google.com) | OAuth | Free |

---

## 2. External Service Setup

### 2.1 Neon Database

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project (choose region closest to your Vercel deployment)
3. Create a database named `neondb`
4. Go to **Connection Details** → copy the **Pooled connection string**
5. Set as `DATABASE_URL` in your environment

**Connection string format:**
```
postgresql://neondb_owner:PASSWORD@HOST-pooler.REGION.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Run migrations** (after setting DATABASE_URL locally):
```bash
npx prisma migrate deploy
```

### 2.2 Inngest

1. Sign up at [inngest.com](https://inngest.com)
2. Create a new app named "nodebase"
3. Go to **Keys** → copy the **Signing Key** and **Event Key**
4. In production, set the Inngest endpoint URL:
   - App settings → Endpoint URL → `https://your-domain.com/api/inngest`

> **Note:** Inngest does not require API keys stored in environment variables. The SDK uses the signing key from your Inngest dashboard to verify webhook deliveries. Configure the endpoint URL in the Inngest dashboard to point to your deployed app.

### 2.3 GitHub OAuth App

1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Set:
   - **Application name:** NodeBase
   - **Homepage URL:** `https://your-domain.com`
   - **Authorization callback URL:** `https://your-domain.com/api/auth/callback/github`
4. Copy **Client ID** → `GITHUB_CLIENT_ID`
5. Generate a **Client Secret** → `GITHUB_CLIENT_SECRET`

### 2.4 Google OAuth App

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google+ API** (or People API)
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web Application**
6. Add authorized redirect URI: `https://your-domain.com/api/auth/callback/google`
7. Copy **Client ID** → `GOOGLE_CLIENT_ID`
8. Copy **Client Secret** → `GOOGLE_CLIENT_SECRET`

### 2.5 Polar.sh

1. Sign up at [polar.sh](https://polar.sh)
2. Create an organization
3. Create a product called "Pro" (or your desired name)
4. Copy the **Product ID** and update it in `src/lib/auth.ts`:
   ```typescript
   productId: "your-polar-product-id"
   ```
5. Go to **Settings → Access Tokens → Create Token**
6. Copy the token → `POLAR_ACCESS_TOKEN`
7. For production, switch from sandbox to live mode

### 2.6 Sentry

1. Sign up at [sentry.io](https://sentry.io)
2. Create a new project (type: **Next.js**)
3. Copy the **DSN** and update `sentry.server.config.ts` and `sentry.edge.config.ts`
4. Go to **Settings → Account → API → Auth Tokens → Create New Token**
5. Required scopes: `project:releases`, `org:read`
6. Copy the token → `SENTRY_AUTH_TOKEN`

---

## 3. Vercel Deployment

### 3.1 Deploy from GitHub

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repository
4. Vercel auto-detects Next.js — no build configuration needed
5. Click **Deploy** (will fail initially — configure env vars first)

### 3.2 Configure Environment Variables

In the Vercel dashboard → your project → **Settings → Environment Variables**, add:

```
DATABASE_URL          = postgresql://...
BETTER_AUTH_SECRET    = (openssl rand -base64 32)
BETTER_AUTH_URL       = https://your-app.vercel.app
GITHUB_CLIENT_ID      = Ov23li...
GITHUB_CLIENT_SECRET  = cb3d22...
GOOGLE_CLIENT_ID      = 994330...
GOOGLE_CLIENT_SECRET  = GOCSPX-...
GEMINI_API_KEY        = AIzaSy...
OPENAI_API_KEY        = sk-proj-...
ANTHROPIC_API_KEY     = sk-ant-...
SENTRY_AUTH_TOKEN     = sntrys_...
POLAR_ACCESS_TOKEN    = polar_oat_...
POLAR_SUCCESS_URL     = https://your-app.vercel.app
NEXT_PUBLIC_APP_URL   = https://your-app.vercel.app
ENCRYPTION_KEY        = (openssl rand -hex 32)
```

> Do NOT set `NGROK_URL` in production.

### 3.3 Trigger Redeployment

After setting all environment variables:
1. Go to **Deployments**
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger automatic deployment

### 3.4 Update Callback URLs

After deployment, update your OAuth apps with the production callback URLs:
- GitHub: `https://your-app.vercel.app/api/auth/callback/github`
- Google: `https://your-app.vercel.app/api/auth/callback/google`

### 3.5 Configure Inngest Endpoint

In the Inngest dashboard → Apps → Your App → **Endpoint URL:**
```
https://your-app.vercel.app/api/inngest
```

Click **Sync** to register your functions.

---

## 4. Self-hosted Deployment

### 4.1 Requirements

- Node.js 20+
- PostgreSQL 14+
- Process manager (PM2, systemd, Docker)
- Reverse proxy (Nginx, Caddy)
- SSL certificate (Let's Encrypt)

### 4.2 Build

```bash
# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build production bundle
npm run build
```

### 4.3 Docker Deployment

```dockerfile
# Dockerfile (create this in the project root)
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/src/generated ./src/generated

EXPOSE 3000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml (production)
version: "3.9"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: ${DATABASE_URL}
      BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
      BETTER_AUTH_URL: ${BETTER_AUTH_URL}
      # ... all other env vars
    restart: unless-stopped
```

### 4.4 Nginx Configuration

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 5. Database Migrations

### Development

```bash
# Create and apply a new migration
npx prisma migrate dev --name description_of_change

# View migration status
npx prisma migrate status

# Reset (WARNING: destroys all data)
npx prisma migrate reset
```

### Production

```bash
# Apply pending migrations without prompting (safe for CI/CD)
npx prisma migrate deploy

# Never use migrate dev in production
```

### CI/CD Migration

Add to your deployment pipeline (see `.github/workflows/ci.yml`):

```yaml
- name: Run migrations
  run: npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

## 6. CI/CD Pipeline

The project uses GitHub Actions for continuous integration.

**File:** `.github/workflows/ci.yml`

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Generate Prisma client
        run: npx prisma generate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Type check
        run: npx tsc --noEmit

      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          # ... all required env vars as secrets
```

**Automated releases** (main branch only):
```yaml
release:
  runs-on: ubuntu-latest
  needs: build
  steps:
    - run: npx semantic-release
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Semantic Release automatically:
- Bumps version in `package.json`
- Generates `CHANGELOG.md`
- Creates a GitHub release
- Tags the commit

---

## 7. Production Checklist

Before going live, verify the following:

### Infrastructure
- [ ] `DATABASE_URL` points to production Neon (not local)
- [ ] Neon project in the correct region (match Vercel region)
- [ ] `npx prisma migrate deploy` completed successfully
- [ ] Inngest endpoint URL set to production domain
- [ ] Inngest app synced (functions registered)

### Authentication
- [ ] `BETTER_AUTH_SECRET` is a strong, unique random value
- [ ] `BETTER_AUTH_URL` is the production HTTPS URL
- [ ] GitHub OAuth callback URL updated to production domain
- [ ] Google OAuth redirect URI updated to production domain
- [ ] `NGROK_URL` is NOT set in production environment

### Security
- [ ] `ENCRYPTION_KEY` is set and backed up securely
- [ ] All env vars stored in Vercel (not in `.env` committed to git)
- [ ] `.env` is in `.gitignore`
- [ ] `SENTRY_AUTH_TOKEN` has only the minimum required scopes

### Payments
- [ ] Polar.sh is switched from sandbox to production mode
- [ ] `POLAR_ACCESS_TOKEN` is the production (non-sandbox) token
- [ ] `POLAR_SUCCESS_URL` is the production URL
- [ ] Product ID in `src/lib/auth.ts` matches the production Polar product

### Monitoring
- [ ] Sentry DSN is correct in `sentry.server.config.ts`
- [ ] Sentry source maps are uploading (check Sentry releases page)
- [ ] Error alerts configured in Sentry dashboard

### AI Services
- [ ] At least one AI API key is configured (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `GEMINI_API_KEY`)
- [ ] API key billing limits set on provider dashboards

### Performance
- [ ] Vercel deployment region set to match Neon database region
- [ ] Turbopack enabled in build (it is, via `next.config.ts`)

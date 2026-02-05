# ⚡ NodeBase

> **The Ultimate Next.js Workflow Automation Platform.**
>
> Built for performance, scalability, and enterprise-grade reliability.

[![CI Status](https://github.com/RISHII7/nodebase/actions/workflows/ci.yml/badge.svg)](https://github.com/RISHII7/nodebase/actions)
[![Release Status](https://github.com/RISHII7/nodebase/actions/workflows/release.yml/badge.svg)](https://github.com/RISHII7/nodebase/releases)
[![Semantic Release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.0-black)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.0-teal)](https://www.prisma.io/)

---

## 🚀 Overview

**NodeBase** is a cutting-edge full-stack application designed to build, manage, and execute complex workflows visually. Think Zapier or n8n, but built with the latest web technologies for maximum developer experience and performance.

It features a powerful **Node-Based Editor** powered by React Flow, enterprise-ready **CI/CD pipelines**, and a modern stack including **Next.js 15**, **Prisma 7**, and **Better Auth**.

---

## ✨ Features

- **🎨 Visual Workflow Editor**: Drag-and-drop interface for building automation logic (powered by `@xyflow/react`).
- **🔌 Dynamic Nodes**:
  - **Triggers**: Manual, Webhook, Schedule (Coming Soon).
  - **Executions**: HTTP Requests, AI Inference (OpenAI, Gemini), Conditional Logic.
- **🔐 Secure Authentication**: Robust auth system using **Better Auth** with social providers and email support.
- **🏗️ Enterprise Architecture**:
  - **Prisma 7**: Latest ORM with Driver Adapters for serverless PostgreSQL (Neon).
  - **tRPC**: End-to-end type safety for API communications.
  - **Turbopack**: Blazing fast local development builds.
- **🚀 CI/CD Automation**:
  - **Semantic Release**: Fully automated versioning and changelog generation based on Conventional Commits.
  - **GitHub Actions**: Automated testing, linting, and building on every push.
  - **Docker Ready**: (Upcoming) Containerized deployments for production.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL (Neon)](https://neon.tech/) with [Prisma 7](https://www.prisma.io/)
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **UI Library**: [Shadcn UI](https://ui.shadcn.com/) + [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Workflow Engine**: [React Flow](https://reactflow.dev/)
- **Monitoring**: [Sentry](https://sentry.io/)
- **Payments**: [Polar.sh](https://polar.sh/)

---

## 🏁 Getting Started

### Prerequisites

- **Node.js**: v20 or higher
- **npm**: v10 or higher
- **PostgreSQL**: Local instance or cloud provider (e.g., Neon)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/RISHII7/nodebase.git
    cd nodebase
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    npm ci
    ```

3.  **Environment Setup:**
    Duplicate the example environment file and fill in your secrets.

    ```bash
    cp .env.example .env
    ```

    > **Note:** You will need API keys for Better Auth, OpenAI/Google (optional), and a Postgres connection string.

4.  **Database Setup:**
    Initialize the database using Prisma.

    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to create your first workflow!

---

## 📜 Scripts

| Command             | Description                                               |
| :------------------ | :-------------------------------------------------------- |
| `npm run dev`       | Starts the Next.js development server with Turbopack.     |
| `npm run build`     | Builds the application for production.                    |
| `npm run start`     | Starts the production server.                             |
| `npm run lint`      | Runs Biome code linting.                                  |
| `npm run dev:all`   | Runs all dev services (Next.js + Inngest) using `mprocs`. |
| `npx prisma studio` | Opens the visual database editor.                         |

---

## 🤝 Contributing

We follow **Conventional Commits** to automate our release process. Please ensure your commit messages follow this format:

- `feat: ...` for new features (Minor release)
- `fix: ...` for bug fixes (Patch release)
- `chore: ...` for maintenance (No release)
- `docs: ...` for documentation updates

**Example:**

```bash
git commit -m "feat(editor): implement drag-to-select functionality"
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

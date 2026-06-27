# Contributing to NodeBase

Thank you for your interest in contributing! This document covers the contribution process, code standards, and workflow.

---

## Table of Contents

1. [Code of Conduct](#1-code-of-conduct)
2. [Getting Started](#2-getting-started)
3. [How to Contribute](#3-how-to-contribute)
4. [Development Workflow](#4-development-workflow)
5. [Commit Conventions](#5-commit-conventions)
6. [Pull Request Guidelines](#6-pull-request-guidelines)
7. [Code Standards](#7-code-standards)

---

## 1. Code of Conduct

This project follows the [Contributor Covenant](https://www.contributor-covenant.org/). Be respectful, inclusive, and constructive in all interactions.

---

## 2. Getting Started

1. Fork the repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/nodebase.git
   cd nodebase
   ```
3. Set up the development environment following [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
4. Create a branch for your change:
   ```bash
   git checkout -b feat/your-feature-name
   ```

---

## 3. How to Contribute

### Bug Reports

1. Search existing issues first
2. If not found, open a new issue with:
   - Clear title describing the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment (OS, Node.js version, browser)
   - Error messages or screenshots

### Feature Requests

1. Open an issue with the `enhancement` label
2. Describe the use case and why the current behavior is insufficient
3. Propose an implementation approach if you have one
4. Wait for maintainer feedback before starting implementation

### Code Contributions

1. Comment on the issue you want to work on (to avoid duplicate effort)
2. Fork → branch → implement → test → PR

---

## 4. Development Workflow

### Branch naming

```
feat/short-description      # New feature
fix/short-description       # Bug fix
docs/short-description      # Documentation
refactor/short-description  # Code refactoring
chore/short-description     # Maintenance
```

### Making changes

1. Make your changes following the [Code Standards](#7-code-standards)
2. Run the linter:
   ```bash
   npm run lint
   npm run lint:fix  # Auto-fix issues
   ```
3. Check TypeScript:
   ```bash
   npx tsc --noEmit
   ```
4. Test your changes manually (there are currently no automated tests)
5. Commit following the [Commit Conventions](#5-commit-conventions)

---

## 5. Commit Conventions

NodeBase uses [Conventional Commits](https://www.conventionalcommits.org/). This enables automated versioning and changelog generation via Semantic Release.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description | Version bump |
|------|-------------|-------------|
| `feat` | New feature | minor |
| `fix` | Bug fix | patch |
| `docs` | Documentation only | patch |
| `refactor` | Code refactor (no behavior change) | patch |
| `style` | Formatting, whitespace | patch |
| `chore` | Build system, dependencies | patch |
| `test` | Adding/fixing tests | none |
| `perf` | Performance improvement | patch |
| `ci` | CI/CD changes | none |

**Breaking change:** Add `BREAKING CHANGE:` footer or `!` after type:
```
feat!: redesign workflow execution API

BREAKING CHANGE: The execute endpoint now returns an eventId instead of void.
```

### Examples

```bash
git commit -m "feat(auth): add magic link authentication"
git commit -m "fix(editor): prevent duplicate trigger nodes"
git commit -m "docs(api): document all tRPC procedures"
git commit -m "chore(deps): upgrade Prisma to 7.4.0"
git commit -m "refactor(credentials): extract encryption to shared utility"
```

---

## 6. Pull Request Guidelines

### Before submitting

- [ ] Code follows the project's style (Biome passes)
- [ ] TypeScript compiles without errors
- [ ] Changes are tested manually
- [ ] Commit messages follow Conventional Commits
- [ ] Documentation is updated if behavior changes
- [ ] `.env.example` is updated if new env vars are added

### PR title

Follow the same format as commits:
```
feat(workflows): add node duplication
fix(auth): correct session expiry handling
```

### PR description template

```markdown
## Summary
<!-- What does this PR do? Why? -->

## Changes
<!-- List the key changes -->

## Testing
<!-- How did you test this? What scenarios did you verify? -->

## Screenshots (if UI change)
<!-- Before/after screenshots -->

## Breaking changes
<!-- Are there any breaking changes? How should users migrate? -->
```

### Review process

1. A maintainer will review within 1-3 business days
2. Address review feedback
3. Once approved, the maintainer will merge
4. Semantic Release will automatically create a version bump and changelog

---

## 7. Code Standards

### TypeScript

- Strict mode is enabled — no `any` types without justification
- Use inferred types where possible, explicit types where it aids readability
- Prefer `interface` for object shapes, `type` for unions and computed types

### File organization

- Feature-based structure: code lives near where it's used (`src/features/`)
- Shared utilities in `src/lib/`
- Reusable UI components in `src/components/ui/`

### Naming conventions

| What | Convention | Example |
|------|-----------|---------|
| Files | kebab-case | `node-status-indicator.tsx` |
| Components | PascalCase | `NodeStatusIndicator` |
| Functions | camelCase | `topologicalSort` |
| Constants | SCREAMING_SNAKE | `PAGINATION` |
| Types/Interfaces | PascalCase | `NodeExecutorParams` |
| Hooks | `use` prefix | `useNodeStatus` |

### Comments

- Default to no comments
- Only comment when the **WHY** is non-obvious
- Never comment what the code does (the code shows that)

### React patterns

- Server Components by default; add `"use client"` only when needed
- Use Suspense boundaries for async data
- Prefer hooks over HOCs
- Use Zod for all form validation

### Prisma

- Always include `userId` in queries for user-owned resources
- Use transactions for multi-table writes
- Never use `findFirst` where `findUnique` is appropriate (uniqueness matters)

### Error handling

- Throw meaningful errors with descriptive messages
- In executors: always publish an "error" status to the Realtime channel before re-throwing
- In tRPC: use `TRPCError` with appropriate codes
- Never swallow errors silently

### Adding a new node type

See [docs/NODE_TYPES.md#6-adding-a-new-node-type](docs/NODE_TYPES.md#6-adding-a-new-node-type) for the complete checklist.

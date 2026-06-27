## [1.5.1](https://github.com/RISHII7/nodebase/compare/v1.5.0...v1.5.1) (2026-06-27)

### 📚 Documentation

* **changelog:** update with recent ai features ([46fdbb9](https://github.com/RISHII7/nodebase/commit/46fdbb911281c3c1efeb3cfe0dfe1e9ab49f07da))

## [1.5.0](https://github.com/RISHII7/nodebase/compare/v1.4.0...v1.5.0) (2026-06-27)

### ✨ Features

* **ai:** Implement comprehensive AI integration suite (Anthropic, Gemini, OpenAI) ([7af9af4](https://github.com/RISHII7/nodebase/commit/7af9af4f664a4d9600c9bae40be13231c0508039))

## [1.4.0](https://github.com/RISHII7/nodebase/compare/v1.3.0...v1.4.0) (2026-02-17)

### ✨ Features

* **execution:** Add Inngest Realtime support for Node Status ([8499dec](https://github.com/RISHII7/nodebase/commit/8499dec3c1189408b1a4caf79b0f54be1325242e))
* **executor:** Implement Handlebars templating for dynamic HTTP requests ([a3fe5ce](https://github.com/RISHII7/nodebase/commit/a3fe5cefc3726dd1bb92043abba0358d82ca2e23))
* **http-request:** Add variable name support to prevent key collisions ([14633df](https://github.com/RISHII7/nodebase/commit/14633dfbfc7ddcb2931f9dc9135c0bf37d782c50))
* **triggers:** Implement Stripe Trigger & Realtime Events ([0e2fbd3](https://github.com/RISHII7/nodebase/commit/0e2fbd3176b6b4d637cfdbb93beaa7ade15b90f8))

### 🐛 Bug Fixes

* **build:** Remove conflicts with App Router by deleting src/pages ([b4d35ab](https://github.com/RISHII7/nodebase/commit/b4d35ab36942e88208deb8e0e7a923c59691e436))
* **executions:** resolve invalid URL error and google form webhook payload structure ([b090080](https://github.com/RISHII7/nodebase/commit/b090080e4219b0d8b85a35dbad7f9db990fba84b))
* **executions:** Resolve type mismatch in executor registry ([06420ac](https://github.com/RISHII7/nodebase/commit/06420ac8060ea9777b3bcc778d7233ca032fda82))
* **executions:** Update HttpRequestData type definition in executor ([969498a](https://github.com/RISHII7/nodebase/commit/969498acab5655ea1b8dfd26583ec3aed15f6635))
* **http-request:** Add Content-Type header for JSON mutation requests ([0cd5ace](https://github.com/RISHII7/nodebase/commit/0cd5ace71530b15b938f28ad90c857b2cf19710b))

### ♻️ Code Refactoring

* **http-request:** Enforce strict typing and remove legacy fallback ([7e86cbd](https://github.com/RISHII7/nodebase/commit/7e86cbd5948722eb27776882d387930a04070a2a))

### 👷 Continuous Integration

* Rename 'lint' job to 'build' to clarify no linting is performed ([f35863c](https://github.com/RISHII7/nodebase/commit/f35863c24a36678473f54d162cec9ce7151ce8a4))

## [1.3.0](https://github.com/RISHII7/nodebase/compare/v1.2.1...v1.3.0) (2026-02-08)

### ✨ Features

* **editor:** implement conditional workflow execution button ([517f669](https://github.com/RISHII7/nodebase/commit/517f669ad0516a721e7e4f5fbecaacb4108c79ee))
* **editor:** optimize dialog props and data flow ([361c32e](https://github.com/RISHII7/nodebase/commit/361c32e066d7a9080c8215dcdb2b1e3fd61d2797))
* **workflow:** Implement topological sort and executor registry ([481ed6a](https://github.com/RISHII7/nodebase/commit/481ed6a97ff80cb13dc127890ecfd99c52f87496))

### 🐛 Bug Fixes

* **build:** Add Pages Router compatibility files for Sentry ([0c72cc1](https://github.com/RISHII7/nodebase/commit/0c72cc1bc8939f38006745f223d58a4658c6f376))

## [1.2.1](https://github.com/RISHII7/nodebase/compare/v1.2.0...v1.2.1) (2026-02-05)

### 📚 Documentation

* add comprehensive README and env example ([d81aaa2](https://github.com/RISHII7/nodebase/commit/d81aaa2dfbd465321c75aebf63a7de04b88ba036))

## [1.2.0](https://github.com/RISHII7/nodebase/compare/v1.1.0...v1.2.0) (2026-02-05)

### ✨ Features

* **editor:** enhance canvas interaction and selection experience ([28002a8](https://github.com/RISHII7/nodebase/commit/28002a81021e056205b5c38f77259d39576bb11b))
* **editor:** implement delete functionality for execution and trigger nodes ([3a7b2ec](https://github.com/RISHII7/nodebase/commit/3a7b2eca33662f365e6e104a13e028bd167b5897))
* **editor:** implement http request configuration settings ([fe07e40](https://github.com/RISHII7/nodebase/commit/fe07e401216f14d40c7c996c6918f9c012b360c9))
* **editor:** implement node status indicators and manual trigger configuration ([5df8adf](https://github.com/RISHII7/nodebase/commit/5df8adfa8e00b17eef212a5be0225f5a17a39a8a))
* implement workflow save functionality ([d00fdf6](https://github.com/RISHII7/nodebase/commit/d00fdf6afda05f5ff03f4b4ac4eda51cb649648e))

### 🐛 Bug Fixes

* address editor state issues ([646e399](https://github.com/RISHII7/nodebase/commit/646e3995b82df298f288fb945562f58e2cb13eb9))

## [1.1.0](https://github.com/RISHII7/nodebase/compare/v1.0.0...v1.1.0) (2026-01-31)

### ✨ Features

* implement node selector and trigger system ([40659d6](https://github.com/RISHII7/nodebase/commit/40659d6feeec3791b45aff40ad4dec91420da80b))

### 👷 Continuous Integration

* upgrade release configuration to enterprise standards ([a46930d](https://github.com/RISHII7/nodebase/commit/a46930d413f8e1033da51027bcbf32ea84e3a0e1))

# 1.0.0 (2026-01-31)


### Bug Fixes

* **ci:** add DATABASE_URL to prisma generate step and remove linting ([f1c2d02](https://github.com/RISHII7/nodebase/commit/f1c2d02e661d8eb4466c796a82cfffc76ae2d8a3))


### Features

* add workflows page with data fetching and header ([12013bc](https://github.com/RISHII7/nodebase/commit/12013bc19e726e85a2153a651462ac9846520bca))
* add workflows UI states and components ([fbeb0fa](https://github.com/RISHII7/nodebase/commit/fbeb0fa5b72ebbdcc7152a2d3ce59cfaeec7d659))

# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.9.x | Yes (current) |
| < 1.9 | No |

---

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

To report a security vulnerability, email: **rishikesh.palande07@gmail.com**

Include in your report:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- (Optional) Suggested fix

You will receive an acknowledgment within **48 hours** and a more detailed response within **7 days** indicating the next steps.

---

## Disclosure Policy

- We ask that you give us reasonable time (90 days) to fix the vulnerability before public disclosure
- We will credit you in the security advisory if you wish
- We will not pursue legal action against security researchers acting in good faith

---

## Security Architecture

See [docs/SECURITY_ARCH.md](docs/SECURITY_ARCH.md) for the full security architecture documentation, including:
- Credential encryption design
- Authentication security
- OWASP Top 10 mapping
- Threat model

---

## Known Security Limitations

### Webhook endpoints are unauthenticated

The endpoints `/api/webhooks/stripe` and `/api/webhooks/google-form` are publicly accessible. Anyone who knows a valid `workflowId` can trigger workflow execution with arbitrary data. See [docs/WEBHOOKS.md#4-security-considerations](docs/WEBHOOKS.md#4-security-considerations) for mitigations.

### HTTP_REQUEST node allows arbitrary outbound requests

The `HTTP_REQUEST` node can be configured to make requests to any URL, including internal services (SSRF). See [docs/SECURITY_ARCH.md#a10-ssrf-risk](docs/SECURITY_ARCH.md#7-owasp-top-10-mapping) for mitigation recommendations.

### Retries disabled for workflow execution

`retries: 0` is set in `src/inngest/functions.ts` (development shortcut). This means failed executions don't automatically retry, but it also means a failed webhook delivery doesn't retry with side effects.

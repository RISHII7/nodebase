# ADR-005: Credential Encryption with Cryptr

**Status:** Accepted  
**Date:** 2026-06-27  
**Deciders:** NodeBase team

---

## Context

NodeBase stores users' API keys (OpenAI, Anthropic, Google Gemini) in the database. These credentials must be:

1. **Encrypted at rest** — A database breach should not expose plaintext API keys
2. **Decryptable at runtime** — The workflow executor needs the plaintext key to call AI APIs
3. **Simple to implement** — The encryption/decryption code should be maintainable without cryptography expertise
4. **Per-credential** — Each credential is encrypted independently; compromise of one doesn't affect others

Approaches considered:

| Approach | Pros | Cons |
|----------|------|------|
| **Plaintext storage** | Simple | Complete exposure on DB breach |
| **bcrypt / one-way hash** | Secure | Cannot be decrypted — unusable |
| **AES-256-CBC (manual)** | Full control | Manual IV management, no authentication tag |
| **AES-256-GCM (manual)** | Authenticated encryption | Requires IV + auth tag management |
| **Cryptr (AES-256-GCM wrapper)** | Simple API, GCM | Dependency, less control |
| **AWS KMS / Vault** | Enterprise-grade | Infrastructure overhead, cost |

---

## Decision

We chose **Cryptr** — a minimal AES-256-GCM wrapper for Node.js.

```typescript
// src/lib/encryption.ts
import Cryptr from "cryptr";
const cryptr = new Cryptr(process.env.ENCRYPTION_KEY!);

export const encrypt = (text: string) => cryptr.encrypt(text);
export const decrypt = (text: string) => cryptr.decrypt(text);
```

### Why Cryptr

1. **GCM mode** — AES-256-GCM provides both encryption and authentication (detects ciphertext tampering). Manual CBC implementations often miss the authentication layer, leaving them vulnerable to padding oracle and bit-flipping attacks.

2. **Random IV per call** — Cryptr generates a new random IV for each `encrypt()` call automatically. This prevents ciphertext patterns even when encrypting identical values multiple times.

3. **Single dependency** — One small library wrapping Node.js `crypto`. No external key management service required.

4. **Simple API** — `encrypt(text)` / `decrypt(text)`. The encryption complexity is hidden while the security properties (GCM, random IV) are preserved.

5. **Environment variable key** — The `ENCRYPTION_KEY` is a 256-bit hex string stored as an environment variable, not in code. Compromise requires both the database and the environment.

### Why Not AWS KMS / Vault

For the current scale:
- AWS KMS adds latency (network call to KMS for each decrypt) and cost (~$1/10,000 decrypt calls)
- HashiCorp Vault requires its own infrastructure to run and operate
- Both add significant operational complexity
- The threat model (protect against DB breach) is satisfied by envelope encryption with a locally-held key

### Key Design: ENCRYPTION_KEY

The `ENCRYPTION_KEY` is a 256-bit symmetric key stored as 64 hexadecimal characters:

```
ENCRYPTION_KEY = 26df57064e9b263321862bd25bf42945beaa318d7727423e72b371ef5e9c67e8
                └─────────────────── 64 hex chars = 32 bytes = 256 bits ────────────────────┘
```

Generated with: `openssl rand -hex 32`

---

## Consequences

### Positive

- Database breach without `ENCRYPTION_KEY` does not expose plaintext API keys
- Simple `encrypt`/`decrypt` API with no cryptography expertise required
- AES-256-GCM authentication prevents silent data corruption or tampering
- Random IV means identical API keys produce different ciphertexts (prevents frequency analysis)
- No external service dependency for encryption/decryption

### Negative / Trade-offs

- **Key rotation is manual** — Rotating `ENCRYPTION_KEY` requires re-encrypting all credential values. A migration script would need to be written.
- **Single key for all credentials** — If the key is compromised, all credentials are exposed. Key-per-user or key-per-credential would isolate the blast radius but add complexity.
- **No key versioning** — If the key changes without re-encryption, all existing credentials become unreadable.
- **Cryptr dependency** — A library we don't control wraps the cryptographic primitive. We accept this risk given the library is small (~50 lines) and open source.

### Key Rotation Procedure

If `ENCRYPTION_KEY` must be rotated:

```typescript
// Migration script (run before deploying new key)
const oldCryptr = new Cryptr(OLD_KEY);
const newCryptr = new Cryptr(NEW_KEY);

const credentials = await db.credential.findMany();
for (const cred of credentials) {
  const plaintext = oldCryptr.decrypt(cred.value);
  const newCiphertext = newCryptr.encrypt(plaintext);
  await db.credential.update({
    where: { id: cred.id },
    data: { value: newCiphertext },
  });
}

// Then update ENCRYPTION_KEY environment variable and deploy
```

### Future Enhancement: Envelope Encryption

For higher security, envelope encryption could be implemented:
- Generate a unique Data Encryption Key (DEK) per credential
- Encrypt the DEK with the master `ENCRYPTION_KEY` (Key Encryption Key)
- Store the encrypted DEK alongside the encrypted value
- Benefit: Rotating the master key only requires re-encrypting DEKs, not all credential values

# @nocobase/plugin-workflow-crypto

NocoBase workflow instruction node for AES encryption and decryption.

## Features

- **Encrypt / Decrypt** with AES-256-CBC, AES-256-GCM, AES-128-CBC, AES-128-GCM
- **Base64 or Hex** encoding for ciphertext
- **Auto-parse JSON** on decrypt — if the decrypted result is valid JSON, it's automatically parsed into an object
- **Workflow variables** supported in both Key and Input fields

## Installation

```bash
yarn nocobase pm create @nocobase/plugin-workflow-crypto
yarn nocobase pm enable @nocobase/plugin-workflow-crypto
```

## Node Configuration

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| Operation | encrypt / decrypt | decrypt | |
| Algorithm | select | aes-256-cbc | AES-256-CBC, AES-256-GCM, AES-128-CBC, AES-128-GCM |
| Key | string | — | Secret key (any string, SHA-256 hashed internally). Supports workflow variables |
| Input | string | — | Data to encrypt or decrypt. Supports workflow variables |
| Encoding | base64 / hex | base64 | Ciphertext encoding format |
| Auto-parse JSON | boolean | true | Decrypt mode only: auto JSON.parse the result |

## Ciphertext Format

```
CBC:  base64(iv):base64(ciphertext)
GCM:  base64(iv):base64(authTag):base64(ciphertext)
```

Key derivation: `SHA-256(key_string).slice(0, keyLength)` — any string works as key.

## Usage Example

### Decrypt an encrypted token from URL

```
[URL Trigger /api/sso/**]
    → [Crypto Node]
        Operation: Decrypt
        Key: "my-shared-secret"
        Input: {{$context.query.token}}
    → result: { userId: 1, name: "Admin" }
```

### External system encryption (Node.js)

```javascript
const crypto = require('crypto');
const key = crypto.createHash('sha256').update('my-shared-secret').digest().subarray(0, 32);
const iv = crypto.randomBytes(16);
const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
const data = JSON.stringify({ userId: 1, name: 'Admin' });
let enc = cipher.update(data, 'utf8');
enc = Buffer.concat([enc, cipher.final()]);
const token = iv.toString('base64') + ':' + enc.toString('base64');
// Use: /api/sso/login?token=encodeURIComponent(token)
```

## Error Handling

| Scenario | Result |
|----------|--------|
| Wrong key | `JOB_STATUS.ERROR` with decryption error message |
| Invalid ciphertext format | `JOB_STATUS.ERROR` with format error |
| Empty key or input | `JOB_STATUS.ERROR` with "Key/Input is required" |
| Non-JSON decrypted text (autoParseJson=true) | Returns raw string (no error) |

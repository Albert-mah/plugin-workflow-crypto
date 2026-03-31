# @nocobase/plugin-workflow-crypto

NocoBase workflow nodes for encryption, decryption, and token signing.

## Nodes

### Crypto (encrypt/decrypt)
- AES-256-CBC, AES-256-GCM, AES-128-CBC, AES-128-GCM
- Base64 or Hex encoding
- Auto-parse JSON on decrypt

### Sign Token
- Generate NocoBase JWT auth token for a user ID
- Used in SSO / passwordless login flows

# @nocobase/plugin-workflow-crypto

**AES encrypt / decrypt node for NocoBase workflows.** Exchange encrypted payloads with external systems — validate signed SSO parameters, decode callback payloads, or emit encrypted tokens — without writing a custom plugin each time.

## Features

- **Crypto node** with `encrypt` / `decrypt` operations
- Algorithms: `aes-256-cbc` (default), `aes-192-cbc`, `aes-128-cbc`
- Key modes: `hash` (SHA-256 of the key string) or `raw` (use key bytes as-is)
- Input/output encodings: `base64` / `hex`; IV-prefixed ciphertext auto-detected (`iv:ciphertext`)
- Optional **auto-parse JSON** after decrypt — decrypted object fields become workflow variables
- Key and input accept workflow variables; node supports test-run from the config panel

## Install

```bash
git clone https://github.com/Albert-mah/plugin-workflow-crypto \
  packages/plugins/@nocobase/plugin-workflow-crypto
yarn install
yarn pm add @nocobase/plugin-workflow-crypto
yarn pm enable @nocobase/plugin-workflow-crypto
```

## Usage

Add a **Crypto** node to any workflow. Downstream nodes read the result via `{{$jobsMapByNodeKey.<nodeKey>}}` (string for encrypt, string/object for decrypt).

Typical SSO combo with [plugin-workflow-url-trigger](https://github.com/Albert-mah/plugin-workflow-url-trigger) and [plugin-workflow-auth-token](https://github.com/Albert-mah/plugin-workflow-auth-token): URL trigger receives `?payload=<encrypted>` → Crypto decrypts and validates → Sign Token issues a NocoBase JWT → HTTP Response redirects the caller, logged in.

## Compatibility

Tested on NocoBase `2.1.x` and `2.2.0-beta.10` (encrypt→decrypt roundtrip verified).

## License

Apache-2.0

---

## 中文

NocoBase 工作流的 **AES 加解密节点**：encrypt/decrypt 双操作，aes-128/192/256-cbc，key 支持 hash/raw 两种模式，密文带 IV 前缀自动识别，解密后可自动 JSON 解析供下游取值。密钥与输入均可用工作流变量，节点面板可试跑。与 url-trigger、auth-token 组合实现 SSO 免密登录。已在 2.1.x 与 2.2.0-beta.10 实测（加解密往返验证通过）。

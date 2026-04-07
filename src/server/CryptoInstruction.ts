/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import crypto from 'crypto';
import { Processor, Instruction, JOB_STATUS, FlowNodeModel } from '@nocobase/plugin-workflow';

const ALGORITHMS = ['aes-256-cbc', 'aes-256-gcm', 'aes-128-cbc', 'aes-128-gcm'] as const;
type Algorithm = (typeof ALGORITHMS)[number];

interface CryptoConfig {
  operation: 'encrypt' | 'decrypt';
  algorithm: Algorithm;
  key: string;
  input: string;
  inputEncoding: 'base64' | 'hex';
  autoParseJson: boolean;
  keyMode: 'hash' | 'raw';
}

function deriveKey(key: string, length: number): Buffer {
  const hash = crypto.createHash('sha256').update(key).digest();
  return hash.subarray(0, length);
}

function getKeyLength(algorithm: Algorithm): number {
  return algorithm.includes('256') ? 32 : 16;
}

function isGcm(algorithm: Algorithm): boolean {
  return algorithm.includes('gcm');
}

function encrypt(input: string, algorithm: Algorithm, keyStr: string, encoding: 'base64' | 'hex', keyMode: 'hash' | 'raw' = 'raw'): string {
  const keyLen = getKeyLength(algorithm);
  const key = keyMode === 'raw' ? Buffer.from(keyStr, 'utf8') : deriveKey(keyStr, keyLen);
  const iv = crypto.randomBytes(isGcm(algorithm) ? 12 : 16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(input, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  if (isGcm(algorithm)) {
    const authTag = (cipher as crypto.CipherGCM).getAuthTag();
    return [iv.toString(encoding), authTag.toString(encoding), encrypted.toString(encoding)].join(':');
  }

  return [iv.toString(encoding), encrypted.toString(encoding)].join(':');
}

function decrypt(input: string, algorithm: Algorithm, keyStr: string, encoding: 'base64' | 'hex', keyMode: 'hash' | 'raw' = 'raw'): string {
  const keyLen = getKeyLength(algorithm);
  const key = keyMode === 'raw' ? Buffer.from(keyStr, 'utf8') : deriveKey(keyStr, keyLen);
  const parts = input.split(':');
  const ivLen = isGcm(algorithm) ? 12 : 16;

  if (isGcm(algorithm)) {
    if (parts.length >= 3) {
      // Separator format: iv:authTag:ciphertext
      const iv = Buffer.from(parts[0], encoding);
      const authTag = Buffer.from(parts[1], encoding);
      const ciphertext = Buffer.from(parts.slice(2).join(':'), encoding);
      const decipher = crypto.createDecipheriv(algorithm, key, iv) as crypto.DecipherGCM;
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(ciphertext);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString('utf8');
    }
    throw new Error('Invalid GCM ciphertext format');
  }

  let iv: Buffer;
  let ciphertext: Buffer;

  if (parts.length >= 2) {
    // Separator format: iv:ciphertext (our format)
    iv = Buffer.from(parts[0], encoding);
    ciphertext = Buffer.from(parts.slice(1).join(':'), encoding);
  } else {
    // IV-prefix format: iv is first 16 bytes of decoded data (Java/common format)
    const raw = Buffer.from(input, encoding);
    if (raw.length <= ivLen) {
      throw new Error('Ciphertext too short');
    }
    iv = raw.subarray(0, ivLen);
    ciphertext = raw.subarray(ivLen);
  }

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString('utf8');
}

export default class CryptoInstruction extends Instruction {
  async run(node: FlowNodeModel, prevJob, processor: Processor) {
    const {
      operation = 'decrypt',
      algorithm = 'aes-256-cbc',
      key = '',
      inputEncoding = 'base64',
      autoParseJson = true,
      keyMode = 'hash',
    } = node.config as CryptoConfig;

    const resolvedKey = processor.getParsedValue(key, node.id);
    const resolvedInput = processor.getParsedValue(node.config.input, node.id);

    if (!resolvedKey) {
      return { result: { error: 'Key is required' }, status: JOB_STATUS.ERROR };
    }

    if (!resolvedInput) {
      return { result: { error: 'Input is required' }, status: JOB_STATUS.ERROR };
    }

    try {
      let result: any;

      if (operation === 'encrypt') {
        const plaintext = typeof resolvedInput === 'string' ? resolvedInput : JSON.stringify(resolvedInput);
        result = encrypt(plaintext, algorithm, resolvedKey, inputEncoding, keyMode);
      } else {
        const decrypted = decrypt(String(resolvedInput), algorithm, resolvedKey, inputEncoding, keyMode);
        if (autoParseJson) {
          try {
            result = JSON.parse(decrypted);
          } catch {
            result = decrypted;
          }
        } else {
          result = decrypted;
        }
      }

      return { result, status: JOB_STATUS.RESOLVED };
    } catch (err) {
      return { result: { error: err.message }, status: JOB_STATUS.ERROR };
    }
  }

  async test(config) {
    const { operation = 'decrypt', algorithm = 'aes-256-cbc', key = '', input = '', inputEncoding = 'base64', autoParseJson = true, keyMode = 'hash' } = config;

    if (!key) {
      return { result: { error: 'Key is required' }, status: JOB_STATUS.ERROR };
    }
    if (!input) {
      return { result: { error: 'Input is required' }, status: JOB_STATUS.ERROR };
    }

    try {
      let result: any;
      if (operation === 'encrypt') {
        result = encrypt(typeof input === 'string' ? input : JSON.stringify(input), algorithm, key, inputEncoding, keyMode);
      } else {
        const decrypted = decrypt(String(input), algorithm, key, inputEncoding, keyMode);
        if (autoParseJson) {
          try { result = JSON.parse(decrypted); } catch { result = decrypted; }
        } else {
          result = decrypted;
        }
      }
      return { result, status: JOB_STATUS.RESOLVED };
    } catch (err) {
      return { result: { error: err.message }, status: JOB_STATUS.ERROR };
    }
  }
}

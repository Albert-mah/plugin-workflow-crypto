/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React from 'react';
import { LockOutlined } from '@ant-design/icons';
import { Instruction, WorkflowVariableTextArea } from '@nocobase/plugin-workflow/client';

const NAMESPACE = 'workflow-crypto';

export default class extends Instruction {
  title = `{{t("Crypto", { ns: "${NAMESPACE}" })}}`;
  type = 'crypto';
  group = 'extended';
  description = `{{t("Encrypt or decrypt data using AES algorithms.", { ns: "${NAMESPACE}" })}}`;
  icon = (<LockOutlined />);
  fieldset = {
    operation: {
      type: 'string',
      title: `{{t("Operation", { ns: "${NAMESPACE}" })}}`,
      'x-decorator': 'FormItem',
      'x-component': 'Radio.Group',
      'x-component-props': { optionType: 'button' },
      enum: [
        { label: `{{t("Decrypt", { ns: "${NAMESPACE}" })}}`, value: 'decrypt' },
        { label: `{{t("Encrypt", { ns: "${NAMESPACE}" })}}`, value: 'encrypt' },
      ],
      required: true,
      default: 'decrypt',
    },
    key: {
      type: 'string',
      title: `{{t("Key", { ns: "${NAMESPACE}" })}}`,
      'x-decorator': 'FormItem',
      'x-component': 'WorkflowVariableTextArea',
      'x-component-props': { changeOnSelect: true, autoSize: { minRows: 1, maxRows: 3 } },
      required: true,
    },
    input: {
      type: 'string',
      title: `{{t("Input", { ns: "${NAMESPACE}" })}}`,
      'x-decorator': 'FormItem',
      'x-component': 'WorkflowVariableTextArea',
      'x-component-props': { changeOnSelect: true, autoSize: { minRows: 1, maxRows: 5 } },
      required: true,
    },
    autoParseJson: {
      type: 'boolean',
      title: `{{t("Auto-parse JSON", { ns: "${NAMESPACE}" })}}`,
      'x-decorator': 'FormItem',
      'x-component': 'Checkbox',
      default: true,
      'x-reactions': [
        {
          dependencies: ['operation'],
          fulfill: { state: { visible: '{{$deps[0] === "decrypt"}}' } },
        },
      ],
    },
    advanced: {
      type: 'void',
      title: `{{t("Advanced options", { ns: "${NAMESPACE}" })}}`,
      'x-decorator': 'FormItem',
      'x-component': 'Collapse',
      'x-component-props': {
        ghost: true,
        size: 'small',
      },
      properties: {
        panel: {
          type: 'void',
          'x-component': 'Collapse.Panel',
          'x-component-props': {
            header: `{{t("Advanced options", { ns: "${NAMESPACE}" })}}`,
          },
          properties: {
            algorithm: {
              type: 'string',
              title: `{{t("Algorithm", { ns: "${NAMESPACE}" })}}`,
              'x-decorator': 'FormItem',
              'x-component': 'Select',
              enum: [
                { label: 'AES-256-CBC', value: 'aes-256-cbc' },
                { label: 'AES-256-GCM', value: 'aes-256-gcm' },
                { label: 'AES-128-CBC', value: 'aes-128-cbc' },
                { label: 'AES-128-GCM', value: 'aes-128-gcm' },
              ],
              required: true,
              default: 'aes-256-cbc',
            },
            keyMode: {
              type: 'string',
              title: `{{t("Key processing", { ns: "${NAMESPACE}" })}}`,
              description: `{{t("'Auto' hashes any key to the correct length. 'Raw' uses the key as-is (must be exactly 16 or 32 characters).", { ns: "${NAMESPACE}" })}}`,
              'x-decorator': 'FormItem',
              'x-component': 'Radio.Group',
              'x-component-props': { optionType: 'button' },
              enum: [
                { label: `{{t("Raw", { ns: "${NAMESPACE}" })}}`, value: 'raw' },
                { label: `{{t("Auto", { ns: "${NAMESPACE}" })}}`, value: 'hash' },
              ],
              default: 'raw',
            },
            inputEncoding: {
              type: 'string',
              title: `{{t("Encoding", { ns: "${NAMESPACE}" })}}`,
              'x-decorator': 'FormItem',
              'x-component': 'Radio.Group',
              'x-component-props': { optionType: 'button' },
              enum: [
                { label: 'Base64', value: 'base64' },
                { label: 'Hex', value: 'hex' },
              ],
              default: 'base64',
            },
          },
        },
      },
    },
  };

  components = {
    WorkflowVariableTextArea,
  };

  testable = true;
}

import React from 'react';
import { KeyOutlined } from '@ant-design/icons';
import { Instruction, WorkflowVariableInput } from '@nocobase/plugin-workflow/client';

const NAMESPACE = 'workflow-crypto';

export default class extends Instruction {
  title = `{{t("Sign Token", { ns: "${NAMESPACE}" })}}`;
  type = 'sign-token';
  group = 'extended';
  description = `{{t("Generate a NocoBase auth token for a user. Used in SSO / passwordless login flows.", { ns: "${NAMESPACE}" })}}`;
  icon = (<KeyOutlined />);
  fieldset = {
    userId: {
      type: 'number',
      title: `{{t("User ID", { ns: "${NAMESPACE}" })}}`,
      description: `{{t("The ID of the user to generate a token for. Supports workflow variables.", { ns: "${NAMESPACE}" })}}`,
      'x-decorator': 'FormItem',
      'x-component': 'WorkflowVariableInput',
      'x-component-props': {
        useTypedConstant: [['number', { min: 1 }]],
        changeOnSelect: true,
        nullable: false,
      },
      required: true,
    },
  };

  components = {
    WorkflowVariableInput,
  };
}

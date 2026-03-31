import { Plugin } from '@nocobase/server';
import WorkflowPlugin from '@nocobase/plugin-workflow';

import CryptoInstruction from './CryptoInstruction';
import SignTokenInstruction from './SignTokenInstruction';

export class PluginWorkflowCryptoServer extends Plugin {
  async load() {
    const workflowPlugin = this.app.pm.get(WorkflowPlugin) as WorkflowPlugin;
    workflowPlugin.registerInstruction('crypto', CryptoInstruction);
    workflowPlugin.registerInstruction('sign-token', SignTokenInstruction);
  }
}

export default PluginWorkflowCryptoServer;

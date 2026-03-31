import { Plugin } from '@nocobase/server';
import WorkflowPlugin from '@nocobase/plugin-workflow';

import CryptoInstruction from './CryptoInstruction';

export class PluginWorkflowCryptoServer extends Plugin {
  async load() {
    const workflowPlugin = this.app.pm.get(WorkflowPlugin) as WorkflowPlugin;
    workflowPlugin.registerInstruction('crypto', CryptoInstruction);
  }
}

export default PluginWorkflowCryptoServer;

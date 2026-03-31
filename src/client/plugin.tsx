import { Plugin } from '@nocobase/client';
import WorkflowPlugin from '@nocobase/plugin-workflow/client';

import CryptoInstruction from './CryptoInstruction';
import SignTokenInstruction from './SignTokenInstruction';

export class PluginWorkflowCryptoClient extends Plugin {
  async load() {
    const workflow = this.app.pm.get('workflow') as WorkflowPlugin;
    workflow.registerInstruction('crypto', CryptoInstruction);
    workflow.registerInstruction('sign-token', SignTokenInstruction);
  }
}

export default PluginWorkflowCryptoClient;

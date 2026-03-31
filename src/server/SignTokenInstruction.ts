import { Processor, Instruction, JOB_STATUS, FlowNodeModel } from '@nocobase/plugin-workflow';

/**
 * Generate a NocoBase auth token for a given user ID.
 * This enables SSO / passwordless login flows.
 */
export default class SignTokenInstruction extends Instruction {
  async run(node: FlowNodeModel, prevJob, processor: Processor) {
    const userId = processor.getParsedValue(node.config.userId, node.id);

    if (!userId) {
      return { result: { error: 'userId is required' }, status: JOB_STATUS.ERROR };
    }

    try {
      const app = this.workflow.app;

      // Verify user exists
      const userRepo = app.db.getRepository('users');
      const user = await userRepo.findOne({ filterByTk: userId });
      if (!user) {
        return { result: { error: `User ${userId} not found` }, status: JOB_STATUS.ERROR };
      }

      // Use JWT service directly to sign a token
      const jwtService = app.authManager.jwt;
      const token = jwtService.sign({ userId: user.id });

      return {
        result: { token, userId: user.id },
        status: JOB_STATUS.RESOLVED,
      };
    } catch (err) {
      return {
        result: { error: err.message },
        status: JOB_STATUS.ERROR,
      };
    }
  }
}

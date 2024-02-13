/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { FindMessageParams } from './types';

export const buildFindMessageParams = (params: FindMessageParams) => ({
  id: params.messageId,
  author: { id: params.userId },
  conversation: { id: params.conversationId },
});

import {randomUUID} from 'crypto';

export const AGENT_TOOLKIT_SOURCE = 'agent-toolkit';

export function generateRequestId(): string {
  return `${AGENT_TOOLKIT_SOURCE}-${randomUUID()}`;
}

import {randomUUID} from 'crypto';

declare const __PACKAGE_VERSION__: string;

export const AGENT_TOOLKIT_SOURCE = 'agent-toolkit';

const PKG_VERSION =
  typeof __PACKAGE_VERSION__ !== 'undefined' ? __PACKAGE_VERSION__ : '0.0.0';

export const AGENT_TOOLKIT_PLATFORM = `${AGENT_TOOLKIT_SOURCE}-nodejs-${PKG_VERSION}`;

export function generateRequestId(): string {
  return `${AGENT_TOOLKIT_SOURCE}-${randomUUID()}`;
}

export const AGENT_TOOLKIT_PG_PLATFORM = `nodejssdk-agenttoolkit.${PKG_VERSION}`;

export function agentToolkitOptions(): {headers: Record<string, string>} {
  return {headers: {'x-sdk-platform': AGENT_TOOLKIT_PG_PLATFORM}};
}

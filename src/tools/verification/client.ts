import {
  Cashfree as CashfreeVerification,
  CFEnvironment as CFVerificationEnvironment,
} from 'cashfree-verification';
import {CFEnvironment} from 'cashfree-pg';
import {randomUUID} from 'crypto';
import {generateRequestId, AGENT_TOOLKIT_PLATFORM} from '../request-id.js';

type VerificationRequestOptions = NonNullable<
  Parameters<typeof CashfreeVerification.VrsGstinVerification>[1]
>;

export function configureVerificationClient(
  environment: CFEnvironment,
  clientId: string,
  clientSecret: string
): void {
  CashfreeVerification.XEnvironment =
    environment === CFEnvironment.PRODUCTION
      ? CFVerificationEnvironment.PRODUCTION
      : CFVerificationEnvironment.SANDBOX;
  CashfreeVerification.XClientId = clientId;
  CashfreeVerification.XClientSecret = clientSecret;
}

export const VERIFICATION_API_VERSION = '2024-12-01';

export function getVerificationBaseUrl(): string {
  return CashfreeVerification.XEnvironment ===
    CFVerificationEnvironment.PRODUCTION
    ? 'https://api.cashfree.com/verification'
    : 'https://sandbox.cashfree.com/verification';
}

export function generateVerificationId(): string {
  return `at-${randomUUID()}`;
}

export function withRequestId(): VerificationRequestOptions {
  return {
    headers: {
      'x-request-id': generateRequestId(),
      'x-sdk-platform': AGENT_TOOLKIT_PLATFORM,
    },
  };
}

export async function verificationRequest(
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  options?: {
    body?: Record<string, any>;
    query?: Record<string, any>;
    extraHeaders?: Record<string, string>;
  }
): Promise<any> {
  const {body, query, extraHeaders} = options ?? {};

  let url = `${getVerificationBaseUrl()}${path}`;
  if (query) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    'x-client-id': CashfreeVerification.XClientId ?? '',
    'x-client-secret': CashfreeVerification.XClientSecret ?? '',
    'x-request-id': generateRequestId(),
    'x-sdk-platform': AGENT_TOOLKIT_PLATFORM,
    ...extraHeaders,
  };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method,
    headers,
    ...(body !== undefined && {body: JSON.stringify(body)}),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error: any = new Error(
      `Verification API request failed with status ${response.status}`
    );
    error.response = {status: response.status, data};
    throw error;
  }
  return data;
}

export async function verificationPost(
  path: string,
  body: Record<string, any>,
  extraHeaders?: Record<string, string>
): Promise<any> {
  return verificationRequest('POST', path, {
    body,
    ...(extraHeaders && {extraHeaders}),
  });
}

export async function verificationPostForm(
  path: string,
  form: FormData,
  extraHeaders?: Record<string, string>
): Promise<any> {
  const response = await fetch(`${getVerificationBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      'x-client-id': CashfreeVerification.XClientId ?? '',
      'x-client-secret': CashfreeVerification.XClientSecret ?? '',
      'x-request-id': generateRequestId(),
      'x-sdk-platform': AGENT_TOOLKIT_PLATFORM,
      ...extraHeaders,
    },
    body: form,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error: any = new Error(
      `Verification API request failed with status ${response.status}`
    );
    error.response = {status: response.status, data};
    throw error;
  }
  return data;
}

export {CashfreeVerification};

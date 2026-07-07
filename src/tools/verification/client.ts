import {
  Cashfree as CashfreeVerification,
  CFEnvironment as CFVerificationEnvironment,
} from 'cashfree-verification';
import {CFEnvironment} from 'cashfree-pg';
import {randomUUID} from 'crypto';
import {generateRequestId} from '../request-id.js';

// Axios request options type as seen by the verification SDK's bundled axios,
// to avoid type conflicts with the hoisted root axios installation.
type VerificationRequestOptions = NonNullable<
  Parameters<typeof CashfreeVerification.VrsGstinVerification>[1]
>;

/**
 * Configures the static cashfree-verification SDK client used by all
 * Verification Suite (SecureID) tools. VRS credentials are separate from
 * PG credentials and are generated from the Verification Suite dashboard.
 */
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

export function getVerificationBaseUrl(): string {
  return CashfreeVerification.XEnvironment ===
    CFVerificationEnvironment.PRODUCTION
    ? 'https://api.cashfree.com/verification'
    : 'https://sandbox.cashfree.com/verification';
}

/**
 * verification_id must be <= 50 chars, only alphanumeric, dot, hyphen, underscore.
 */
export function generateVerificationId(): string {
  return `at-${randomUUID()}`;
}

/**
 * Request options that tag SDK calls with an x-request-id header, mirroring
 * the request ID passed to every PG tool call.
 */
export function withRequestId(): VerificationRequestOptions {
  return {headers: {'x-request-id': generateRequestId()}};
}

/**
 * Raw REST call for Verification Suite APIs not covered by the
 * cashfree-verification SDK (e.g. bank account sync, IFSC).
 */
export async function verificationPost(
  path: string,
  body: Record<string, any>
): Promise<any> {
  const response = await fetch(`${getVerificationBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': CashfreeVerification.XClientId ?? '',
      'x-client-secret': CashfreeVerification.XClientSecret ?? '',
      'x-request-id': generateRequestId(),
    },
    body: JSON.stringify(body),
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

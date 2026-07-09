import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {
  CashfreeVerification,
  generateVerificationId,
  withRequestId,
} from './client.js';

const verifyPan360InputSchema = z.object({
  pan: z
    .string()
    .describe('The 10-character PAN (Permanent Account Number) to verify'),
  name: z
    .string()
    .nullable()
    .describe(
      'Name of the PAN holder to match against the registered name. Can be null if not available.'
    ),
  verification_id: z
    .string()
    .nullable()
    .describe(
      'Unique ID to identify this verification request (max 50 chars; alphanumeric, dot, hyphen, underscore). Can be null to auto-generate one.'
    ),
});

type VerifyPan360Input = z.infer<typeof verifyPan360InputSchema>;

const verifyPan360 = async (_cashfree: Cashfree, args: VerifyPan360Input) => {
  const {pan, name, verification_id} = args;

  try {
    const response = await CashfreeVerification.VrsPanAdvanceVerification(
      {
        pan,
        verification_id: verification_id || generateVerificationId(),
        ...(name && {name}),
      },
      undefined,
      withRequestId()
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {error: 'Failed to verify PAN 360', details: error.response.data};
    }
    return {error: 'Failed to verify PAN 360', message: error.message};
  }
};

const verifyPan360Tool: CashfreeToolDefinition = {
  method: 'verifyPan360',
  name: 'Verify PAN 360',
  description:
    'Verifies a PAN (Permanent Account Number) using the Cashfree Verification Suite (SecureID) PAN 360 API. Beyond confirming validity and the registered name, it returns richer details such as PAN type (individual/business), masked Aadhaar number, Aadhaar seeding status, date of birth, gender, and contact/address information. Optionally matches a provided name against the registered name.',
  inputSchema: verifyPan360InputSchema,
  execute: verifyPan360,
};

export default verifyPan360Tool;

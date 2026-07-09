import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {
  CashfreeVerification,
  generateVerificationId,
  withRequestId,
} from './client.js';

const nameMatchInputSchema = z.object({
  name_1: z
    .string()
    .describe('First name to compare (e.g., name provided by the user)'),
  name_2: z
    .string()
    .describe(
      'Second name to compare (e.g., name registered at the bank or on a document)'
    ),
  verification_id: z
    .string()
    .nullable()
    .describe(
      'Unique ID to identify this verification request (max 50 chars; alphanumeric, dot, hyphen, underscore). Can be null to auto-generate one.'
    ),
});

type NameMatchInput = z.infer<typeof nameMatchInputSchema>;

const verifyNameMatch = async (_cashfree: Cashfree, args: NameMatchInput) => {
  const {name_1, name_2, verification_id} = args;

  try {
    const response = await CashfreeVerification.VrsNameMatchVerification(
      {
        verification_id: verification_id || generateVerificationId(),
        name_1,
        name_2,
      },
      undefined,
      withRequestId()
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {error: 'Failed to match names', details: error.response.data};
    }
    return {error: 'Failed to match names', message: error.message};
  }
};

const nameMatchTool: CashfreeToolDefinition = {
  method: 'verifyNameMatch',
  name: 'Name Match',
  description:
    'Compares two names using Cashfree Verification Suite (SecureID) fuzzy name matching. Useful to check if a user-provided name matches the name registered at a bank or on an official document. Returns a match score and match result.',
  inputSchema: nameMatchInputSchema,
  execute: verifyNameMatch,
};

export default nameMatchTool;

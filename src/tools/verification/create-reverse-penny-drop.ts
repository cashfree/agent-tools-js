import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {
  CashfreeVerification,
  generateVerificationId,
  withRequestId,
} from './client.js';

const createReversePennyDropInputSchema = z.object({
  verification_id: z
    .string()
    .nullable()
    .describe(
      'Unique ID to identify this verification request (max 50 chars; alphanumeric, dot, hyphen, underscore). Can be null to auto-generate one.'
    ),
  name: z
    .string()
    .nullable()
    .describe(
      'Name of the account holder to match against the name at the bank. Can be null if not available.'
    ),
});

type CreateReversePennyDropInput = z.infer<
  typeof createReversePennyDropInputSchema
>;

const createReversePennyDrop = async (
  _cashfree: Cashfree,
  args: CreateReversePennyDropInput
) => {
  const {verification_id, name} = args;

  try {
    const response =
      await CashfreeVerification.VrsReversePennyDropCreateRequest(
        {
          verification_id: verification_id || generateVerificationId(),
          ...(name && {name}),
        },
        withRequestId()
      );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {
        error: 'Failed to create reverse penny drop request',
        details: error.response.data,
      };
    }
    return {
      error: 'Failed to create reverse penny drop request',
      message: error.message,
    };
  }
};

const createReversePennyDropTool: CashfreeToolDefinition = {
  method: 'createReversePennyDrop',
  name: 'Create Reverse Penny Drop Request',
  description:
    'Creates a reverse penny drop bank account verification request using Cashfree Verification Suite (SecureID). Returns a UPI payment link/QR through which the customer makes a Rs.1 payment (auto-refunded) so their bank account details get verified. Use getReversePennyDropStatus to fetch the result.',
  inputSchema: createReversePennyDropInputSchema,
  execute: createReversePennyDrop,
};

export default createReversePennyDropTool;

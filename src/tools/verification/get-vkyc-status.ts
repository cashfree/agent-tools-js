import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {
  CashfreeVerification,
  VERIFICATION_API_VERSION,
  withRequestId,
} from './client.js';

const getVkycStatusInputSchema = z.object({
  verification_id: z
    .string()
    .nullable()
    .describe(
      'The verification_id of the VKYC session. Provide this or reference_id.'
    ),
  reference_id: z
    .string()
    .nullable()
    .describe(
      'The reference_id returned by initiateVkyc. Provide this or verification_id.'
    ),
});

type GetVkycStatusInput = z.infer<typeof getVkycStatusInputSchema>;

const getVkycStatus = async (_cashfree: Cashfree, args: GetVkycStatusInput) => {
  const {verification_id, reference_id} = args;

  try {
    const response = await CashfreeVerification.VrsVkycGetStatus(
      VERIFICATION_API_VERSION,
      undefined,
      verification_id ?? undefined,
      reference_id ?? undefined,
      withRequestId()
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {error: 'Failed to get VKYC status', details: error.response.data};
    }
    return {error: 'Failed to get VKYC status', message: error.message};
  }
};

const getVkycStatusTool: CashfreeToolDefinition = {
  method: 'getVkycStatus',
  name: 'Get VKYC Status',
  description:
    'Fetches the status of a Cashfree Verification Suite (SecureID) Video KYC session started via initiateVkyc. Pass either the verification_id or the reference_id. Returns the VKYC session status, link details, and verification results.',
  inputSchema: getVkycStatusInputSchema,
  execute: getVkycStatus,
};

export default getVkycStatusTool;

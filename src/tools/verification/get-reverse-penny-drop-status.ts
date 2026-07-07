import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {CashfreeVerification, withRequestId} from './client.js';

const getReversePennyDropStatusInputSchema = z.object({
  ref_id: z
    .string()
    .nullable()
    .describe(
      'The reference ID returned when the reverse penny drop request was created. Can be null if verification_id is provided.'
    ),
  verification_id: z
    .string()
    .nullable()
    .describe(
      'The verification ID used when the reverse penny drop request was created. Can be null if ref_id is provided.'
    ),
});

type GetReversePennyDropStatusInput = z.infer<
  typeof getReversePennyDropStatusInputSchema
>;

const getReversePennyDropStatus = async (
  _cashfree: Cashfree,
  args: GetReversePennyDropStatusInput
) => {
  const {ref_id, verification_id} = args;

  if (!ref_id && !verification_id) {
    return {
      error: 'Failed to fetch reverse penny drop status',
      message: 'Provide either ref_id or verification_id.',
    };
  }

  try {
    const response = await CashfreeVerification.VrsReversePennyDropFetchStatus(
      ref_id || undefined,
      verification_id || undefined,
      withRequestId()
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {
        error: 'Failed to fetch reverse penny drop status',
        details: error.response.data,
      };
    }
    return {
      error: 'Failed to fetch reverse penny drop status',
      message: error.message,
    };
  }
};

const getReversePennyDropStatusTool: CashfreeToolDefinition = {
  method: 'getReversePennyDropStatus',
  name: 'Get Reverse Penny Drop Status',
  description:
    'Fetches the status and verified bank account details of a reverse penny drop verification request created with createReversePennyDrop. Requires either the ref_id or the verification_id of the request.',
  inputSchema: getReversePennyDropStatusInputSchema,
  execute: getReversePennyDropStatus,
};

export default getReversePennyDropStatusTool;

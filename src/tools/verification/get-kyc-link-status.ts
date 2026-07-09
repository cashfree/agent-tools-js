import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {verificationRequest} from './client.js';

const getKycLinkStatusInputSchema = z.object({
  verification_id: z
    .string()
    .nullable()
    .describe(
      'The verification_id you created for the KYC link. Provide this or reference_id.'
    ),
  reference_id: z
    .string()
    .nullable()
    .describe(
      'The reference_id returned by the Generate KYC Link API. Provide this or verification_id.'
    ),
});

type GetKycLinkStatusInput = z.infer<typeof getKycLinkStatusInputSchema>;

const getKycLinkStatus = async (
  _cashfree: Cashfree,
  args: GetKycLinkStatusInput
) => {
  const {verification_id, reference_id} = args;

  try {
    return await verificationRequest('GET', '/form', {
      query: {
        verificationID: verification_id,
        referenceID: reference_id,
      },
    });
  } catch (error: any) {
    if (error.response?.data) {
      return {
        error: 'Failed to get KYC link status',
        details: error.response.data,
      };
    }
    return {error: 'Failed to get KYC link status', message: error.message};
  }
};

const getKycLinkStatusTool: CashfreeToolDefinition = {
  method: 'getKycLinkStatus',
  name: 'Get KYC Link Status',
  description:
    'Fetches the status of a KYC (form) link created via generateKycLink using Cashfree Verification Suite (SecureID). Pass either the verification_id or the reference_id. Returns the form_status, form_link, link_expiry, and a verification_details array with each verification type and its result.',
  inputSchema: getKycLinkStatusInputSchema,
  execute: getKycLinkStatus,
};

export default getKycLinkStatusTool;

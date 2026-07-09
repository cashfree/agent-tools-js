import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {verificationRequest} from './client.js';

const deactivateStaticKycLinkInputSchema = z.object({
  template_name: z
    .string()
    .describe(
      'Name of the template whose static KYC link should be deactivated (e.g. "Aadhaar_verification")'
    ),
});

type DeactivateStaticKycLinkInput = z.infer<
  typeof deactivateStaticKycLinkInputSchema
>;

const deactivateStaticKycLink = async (
  _cashfree: Cashfree,
  args: DeactivateStaticKycLinkInput
) => {
  const {template_name} = args;

  try {
    return await verificationRequest('DELETE', '/form/static-link', {
      query: {template_name},
    });
  } catch (error: any) {
    if (error.response?.data) {
      return {
        error: 'Failed to deactivate static KYC link',
        details: error.response.data,
      };
    }
    return {
      error: 'Failed to deactivate static KYC link',
      message: error.message,
    };
  }
};

const deactivateStaticKycLinkTool: CashfreeToolDefinition = {
  method: 'deactivateStaticKycLink',
  name: 'Deactivate Static KYC Link',
  description:
    'Deactivates a reusable static KYC (form) link for a given template using Cashfree Verification Suite (SecureID). Once deactivated the static link can no longer be used. Returns the template_name, static_link, and status (INACTIVE).',
  inputSchema: deactivateStaticKycLinkInputSchema,
  execute: deactivateStaticKycLink,
};

export default deactivateStaticKycLinkTool;

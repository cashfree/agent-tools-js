import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {verificationPost} from './client.js';

const generateStaticKycLinkInputSchema = z.object({
  template_name: z
    .string()
    .nullable()
    .describe(
      'Name of the KYC template created in the merchant dashboard. Can be null to use the default "Aadhaar_verification" template.'
    ),
});

type GenerateStaticKycLinkInput = z.infer<
  typeof generateStaticKycLinkInputSchema
>;

const generateStaticKycLink = async (
  _cashfree: Cashfree,
  args: GenerateStaticKycLinkInput
) => {
  const {template_name} = args;

  try {
    return await verificationPost('/form/static-link', {
      template_name: template_name || 'Aadhaar_verification',
    });
  } catch (error: any) {
    if (error.response?.data) {
      return {
        error: 'Failed to generate static KYC link',
        details: error.response.data,
      };
    }
    return {
      error: 'Failed to generate static KYC link',
      message: error.message,
    };
  }
};

const generateStaticKycLinkTool: CashfreeToolDefinition = {
  method: 'generateStaticKycLink',
  name: 'Generate Static KYC Link',
  description:
    'Generates a reusable static KYC (form) link for a template using Cashfree Verification Suite (SecureID). Unlike a per-user KYC link, a static link can be shared with many individuals. Returns the static_link, a base64 qr_code, the template_name, and status (ACTIVE). Deactivate it with deactivateStaticKycLink.',
  inputSchema: generateStaticKycLinkInputSchema,
  execute: generateStaticKycLink,
};

export default generateStaticKycLinkTool;

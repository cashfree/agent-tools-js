import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {generateVerificationId, verificationPost} from './client.js';

const generateKycLinkInputSchema = z.object({
  phone: z.string().describe('Phone number of the individual to be verified'),
  template_name: z
    .string()
    .nullable()
    .describe(
      'Name of the KYC template created in the merchant dashboard. Can be null to use the default "Aadhaar_verification" template.'
    ),
  name: z
    .string()
    .nullable()
    .describe(
      'Name of the individual (alphanumeric, space, dot, hyphen). Can be null if not available.'
    ),
  email: z
    .string()
    .nullable()
    .describe('Email address of the individual. Can be null if not available.'),
  link_expiry: z
    .string()
    .nullable()
    .describe(
      'Link expiry date (max 30 days from today, e.g. YYYY-MM-DD). Can be null to use the default.'
    ),
  notification_types: z
    .array(z.enum(['sms', 'email', 'whatsapp']))
    .nullable()
    .describe(
      'Channels to send the KYC link through. Can be null to skip sending a notification.'
    ),
  verification_id: z
    .string()
    .nullable()
    .describe(
      'Unique ID to identify this KYC link (max 50 chars; alphanumeric, dot, hyphen, underscore). Can be null to auto-generate one.'
    ),
});

type GenerateKycLinkInput = z.infer<typeof generateKycLinkInputSchema>;

const generateKycLink = async (
  _cashfree: Cashfree,
  args: GenerateKycLinkInput
) => {
  const {phone, template_name, name, email, link_expiry, notification_types} =
    args;
  const verification_id = args.verification_id || generateVerificationId();

  try {
    return await verificationPost('/form', {
      verification_id,
      phone,
      template_name: template_name || 'Aadhaar_verification',
      ...(name && {name}),
      ...(email && {email}),
      ...(link_expiry && {link_expiry}),
      ...(notification_types?.length && {notification_types}),
    });
  } catch (error: any) {
    if (error.response?.data) {
      return {
        error: 'Failed to generate KYC link',
        details: error.response.data,
      };
    }
    return {error: 'Failed to generate KYC link', message: error.message};
  }
};

const generateKycLinkTool: CashfreeToolDefinition = {
  method: 'generateKycLink',
  name: 'Generate KYC Link',
  description:
    'Generates a per-user KYC (form) link using Cashfree Verification Suite (SecureID). The individual completes verification (e.g. Aadhaar) on a hosted form. Optionally sends the link over SMS, email, and/or WhatsApp. Returns the form_link, form_status, verification_id, and reference_id. Use getKycLinkStatus to track completion.',
  inputSchema: generateKycLinkInputSchema,
  execute: generateKycLink,
};

export default generateKycLinkTool;

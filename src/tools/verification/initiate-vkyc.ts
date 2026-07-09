import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {
  CashfreeVerification,
  VERIFICATION_API_VERSION,
  generateVerificationId,
  withRequestId,
} from './client.js';

const initiateVkycInputSchema = z.object({
  user_id: z
    .string()
    .nullable()
    .describe(
      'The user_id used when creating the VKYC user. Provide this or user_reference_id.'
    ),
  user_reference_id: z
    .number()
    .nullable()
    .describe(
      'The user_reference_id returned by createVkycUser. Provide this or user_id.'
    ),
  user_template: z
    .string()
    .nullable()
    .describe('Name of the user VKYC template. Can be null to use the default.'),
  agent_template: z
    .string()
    .nullable()
    .describe(
      'Name of the agent VKYC template. Can be null to use the default.'
    ),
  notification_types: z
    .array(z.string())
    .nullable()
    .describe(
      'Notification channels to send the VKYC link through (e.g. ["SMS", "EMAIL", "WHATSAPP"]). Can be null to skip sending.'
    ),
  verification_id: z
    .string()
    .nullable()
    .describe(
      'Unique ID to identify this verification request (max 50 chars; alphanumeric, dot, hyphen, underscore). Can be null to auto-generate one.'
    ),
});

type InitiateVkycInput = z.infer<typeof initiateVkycInputSchema>;

const initiateVkyc = async (_cashfree: Cashfree, args: InitiateVkycInput) => {
  const {user_id, user_reference_id, user_template, agent_template} = args;
  const notification_types = args.notification_types;
  const verification_id = args.verification_id || generateVerificationId();

  try {
    const response = await CashfreeVerification.VrsInitiateVKYC(
      VERIFICATION_API_VERSION,
      {
        verification_id,
        ...(user_id && {user_id}),
        ...(user_reference_id != null && {user_reference_id}),
        ...(user_template && {user_template}),
        ...(agent_template && {agent_template}),
        ...(notification_types?.length && {notification_types}),
      },
      undefined,
      withRequestId()
    );
    return {verification_id, ...response.data};
  } catch (error: any) {
    if (error.response?.data) {
      return {error: 'Failed to initiate VKYC', details: error.response.data};
    }
    return {error: 'Failed to initiate VKYC', message: error.message};
  }
};

const initiateVkycTool: CashfreeToolDefinition = {
  method: 'initiateVkyc',
  name: 'Initiate VKYC',
  description:
    'Initiates a Cashfree Verification Suite (SecureID) Video KYC session for a user created via createVkycUser. Pass the user_id or user_reference_id. Optionally sends the VKYC link over SMS/email/WhatsApp. Returns the vkyc_link, its expiry, verification_id, and reference_id. Use getVkycStatus to track completion.',
  inputSchema: initiateVkycInputSchema,
  execute: initiateVkyc,
};

export default initiateVkycTool;

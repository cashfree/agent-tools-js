import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {
  CashfreeVerification,
  VERIFICATION_API_VERSION,
  withRequestId,
} from './client.js';

const createVkycUserInputSchema = z.object({
  phone: z.string().describe('Phone number of the user'),
  email: z
    .string()
    .nullable()
    .describe('Email address of the user. Can be null if not available.'),
  name: z
    .string()
    .nullable()
    .describe('Name of the user. Can be null if not available.'),
  address: z
    .string()
    .nullable()
    .describe('Address of the user. Can be null if not available.'),
  user_id: z
    .string()
    .nullable()
    .describe(
      'Unique ID to identify the user (max 50 chars; alphanumeric, dot, hyphen, underscore). Can be null to let Cashfree auto-generate one.'
    ),
});

type CreateVkycUserInput = z.infer<typeof createVkycUserInputSchema>;

const createVkycUser = async (
  _cashfree: Cashfree,
  args: CreateVkycUserInput
) => {
  const {phone, email, name, address, user_id} = args;

  try {
    const response = await CashfreeVerification.VrsCreateUser(
      VERIFICATION_API_VERSION,
      {
        phone,
        ...(user_id && {user_id}),
        ...(email && {email}),
        ...(name && {name}),
        ...(address && {address}),
      },
      undefined,
      withRequestId()
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {error: 'Failed to create VKYC user', details: error.response.data};
    }
    return {error: 'Failed to create VKYC user', message: error.message};
  }
};

const createVkycUserTool: CashfreeToolDefinition = {
  method: 'createVkycUser',
  name: 'Create VKYC User',
  description:
    'Creates a user for the Cashfree Verification Suite (SecureID) Video KYC flow. This is the first step of VKYC. Returns a user_reference_id (and echoes the user_id) that is passed to initiateVkyc to start a Video KYC session.',
  inputSchema: createVkycUserInputSchema,
  execute: createVkycUser,
};

export default createVkycUserTool;

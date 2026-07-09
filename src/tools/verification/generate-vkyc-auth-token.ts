import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {
  CashfreeVerification,
  VERIFICATION_API_VERSION,
  withRequestId,
} from './client.js';

const generateVkycAuthTokenInputSchema = z.object({
  app_id: z
    .string()
    .describe(
      'The OAuth application ID for the VKYC product (provided by your Cashfree Account Manager)'
    ),
  vkyc_request_id: z
    .string()
    .describe(
      'The VKYC request ID to associate the access token with a specific verification session'
    ),
  identifier_type: z
    .string()
    .describe(
      'The type of identifier used to identify the authenticated user (e.g. "email", "phone")'
    ),
  identifier_value: z
    .string()
    .describe('The value of the identifier used to identify the user'),
});

type GenerateVkycAuthTokenInput = z.infer<
  typeof generateVkycAuthTokenInputSchema
>;

const generateVkycAuthToken = async (
  _cashfree: Cashfree,
  args: GenerateVkycAuthTokenInput
) => {
  const {app_id, vkyc_request_id, identifier_type, identifier_value} = args;

  try {
    const response = await CashfreeVerification.VrsVkycGenerateAuthToken(
      VERIFICATION_API_VERSION,
      {
        app_id,
        product: 'VKYC',
        metadata: {vkyc_request_id},
        authenticated_user: {identifier_type, identifier_value},
      },
      undefined,
      withRequestId()
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {
        error: 'Failed to generate VKYC auth token',
        details: error.response.data,
      };
    }
    return {
      error: 'Failed to generate VKYC auth token',
      message: error.message,
    };
  }
};

const generateVkycAuthTokenTool: CashfreeToolDefinition = {
  method: 'generateVkycAuthToken',
  name: 'Generate VKYC Auth Token',
  description:
    'Generates an OAuth authentication token used to initialise the Cashfree Verification Suite (SecureID) Video KYC SDK, enabling an OTP-less flow. Requires the app_id, the vkyc_request_id of the session, and the authenticated user identifier. Returns the auth token.',
  inputSchema: generateVkycAuthTokenInputSchema,
  execute: generateVkycAuthToken,
};

export default generateVkycAuthTokenTool;

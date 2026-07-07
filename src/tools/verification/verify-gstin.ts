import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {CashfreeVerification, withRequestId} from './client.js';

const verifyGstinInputSchema = z.object({
  gstin: z
    .string()
    .describe('The 15-character GSTIN (GST Identification Number) to verify'),
  business_name: z
    .string()
    .nullable()
    .describe(
      'Name of the business to match against the registered business name. Can be null if not available.'
    ),
});

type VerifyGstinInput = z.infer<typeof verifyGstinInputSchema>;

const verifyGstin = async (_cashfree: Cashfree, args: VerifyGstinInput) => {
  const {gstin, business_name} = args;

  try {
    const response = await CashfreeVerification.VrsGstinVerification(
      {
        GSTIN: gstin,
        ...(business_name && {businessName: business_name}),
      },
      withRequestId()
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {error: 'Failed to verify GSTIN', details: error.response.data};
    }
    return {error: 'Failed to verify GSTIN', message: error.message};
  }
};

const verifyGstinTool: CashfreeToolDefinition = {
  method: 'verifyGstin',
  name: 'Verify GSTIN',
  description:
    'Verifies a GSTIN (GST Identification Number) using Cashfree Verification Suite (SecureID). Returns the legal name of the business, registration details, taxpayer type, GST status, and address information.',
  inputSchema: verifyGstinInputSchema,
  execute: verifyGstin,
};

export default verifyGstinTool;

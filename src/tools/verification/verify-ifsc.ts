import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {generateVerificationId, verificationPost} from './client.js';

const verifyIfscInputSchema = z.object({
  ifsc: z.string().describe('The 11-character IFSC code to verify'),
  verification_id: z
    .string()
    .nullable()
    .describe(
      'Unique ID to identify this verification request (max 50 chars; alphanumeric, dot, hyphen, underscore). Can be null to auto-generate one.'
    ),
});

type VerifyIfscInput = z.infer<typeof verifyIfscInputSchema>;

const verifyIfsc = async (_cashfree: Cashfree, args: VerifyIfscInput) => {
  const {ifsc, verification_id} = args;

  try {
    return await verificationPost('/ifsc', {
      verification_id: verification_id || generateVerificationId(),
      ifsc,
    });
  } catch (error: any) {
    if (error.response?.data) {
      return {error: 'Failed to verify IFSC', details: error.response.data};
    }
    return {error: 'Failed to verify IFSC', message: error.message};
  }
};

const verifyIfscTool: CashfreeToolDefinition = {
  method: 'verifyIfsc',
  name: 'Verify IFSC',
  description:
    'Verifies an IFSC code using Cashfree Verification Suite (SecureID). Returns the bank name, branch, address, MICR code, and the payment modes (NEFT, IMPS, RTGS, UPI) supported by the branch.',
  inputSchema: verifyIfscInputSchema,
  execute: verifyIfsc,
};

export default verifyIfscTool;

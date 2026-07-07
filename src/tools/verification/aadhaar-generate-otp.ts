import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {CashfreeVerification, withRequestId} from './client.js';

const aadhaarGenerateOtpInputSchema = z.object({
  aadhaar_number: z
    .string()
    .describe('The 12-digit Aadhaar number to send the verification OTP for'),
});

type AadhaarGenerateOtpInput = z.infer<typeof aadhaarGenerateOtpInputSchema>;

const aadhaarGenerateOtp = async (
  _cashfree: Cashfree,
  args: AadhaarGenerateOtpInput
) => {
  const {aadhaar_number} = args;

  try {
    const response = await CashfreeVerification.VrsOfflineAadhaarSendOtp(
      {
        aadhaar_number,
      },
      withRequestId()
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {
        error: 'Failed to generate Aadhaar OTP',
        details: error.response.data,
      };
    }
    return {error: 'Failed to generate Aadhaar OTP', message: error.message};
  }
};

const aadhaarGenerateOtpTool: CashfreeToolDefinition = {
  method: 'aadhaarGenerateOtp',
  name: 'Generate OTP to Verify Aadhaar',
  description:
    'Generates an OTP for offline Aadhaar verification using Cashfree Verification Suite (SecureID). The OTP is sent to the mobile number linked with the Aadhaar. Returns a ref_id which must be passed along with the OTP to the aadhaarVerifyOtp tool to complete verification.',
  inputSchema: aadhaarGenerateOtpInputSchema,
  execute: aadhaarGenerateOtp,
};

export default aadhaarGenerateOtpTool;

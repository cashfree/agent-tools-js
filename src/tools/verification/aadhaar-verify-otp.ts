import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {CashfreeVerification, withRequestId} from './client.js';

const aadhaarVerifyOtpInputSchema = z.object({
  otp: z
    .string()
    .describe('The OTP received on the mobile number linked with the Aadhaar'),
  ref_id: z
    .string()
    .describe(
      'The ref_id received in the response of the aadhaarGenerateOtp tool'
    ),
});

type AadhaarVerifyOtpInput = z.infer<typeof aadhaarVerifyOtpInputSchema>;

const aadhaarVerifyOtp = async (
  _cashfree: Cashfree,
  args: AadhaarVerifyOtpInput
) => {
  const {otp, ref_id} = args;

  try {
    const response = await CashfreeVerification.VrsOfflineAadhaarVerifyOtp(
      {
        otp,
        ref_id,
      },
      withRequestId()
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {
        error: 'Failed to verify Aadhaar OTP',
        details: error.response.data,
      };
    }
    return {error: 'Failed to verify Aadhaar OTP', message: error.message};
  }
};

const aadhaarVerifyOtpTool: CashfreeToolDefinition = {
  method: 'aadhaarVerifyOtp',
  name: 'Submit OTP to Verify Aadhaar',
  description:
    'Completes offline Aadhaar verification using Cashfree Verification Suite (SecureID) by submitting the OTP received on the Aadhaar-linked mobile number along with the ref_id from the aadhaarGenerateOtp tool. Returns the Aadhaar holder details such as name, address, and photo on success.',
  inputSchema: aadhaarVerifyOtpInputSchema,
  execute: aadhaarVerifyOtp,
};

export default aadhaarVerifyOtpTool;

import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {VERIFICATION_API_VERSION, verificationPost} from './client.js';

const mobile360VerifyOtpInputSchema = z.object({
  verification_id: z
    .string()
    .describe(
      'The verification_id returned by the mobile360SendOtp tool for this request'
    ),
  otp: z
    .string()
    .describe('The OTP received on the mobile number via SMS/WhatsApp'),
});

type Mobile360VerifyOtpInput = z.infer<typeof mobile360VerifyOtpInputSchema>;

const mobile360VerifyOtp = async (
  _cashfree: Cashfree,
  args: Mobile360VerifyOtpInput
) => {
  const {verification_id, otp} = args;

  try {
    return await verificationPost(
      '/mobile360/otp/verify',
      {
        verification_id,
        otp,
      },
      {'x-api-version': VERIFICATION_API_VERSION}
    );
  } catch (error: any) {
    if (error.response?.data) {
      return {
        error: 'Failed to verify Mobile 360 OTP',
        details: error.response.data,
      };
    }
    return {error: 'Failed to verify Mobile 360 OTP', message: error.message};
  }
};

const mobile360VerifyOtpTool: CashfreeToolDefinition = {
  method: 'mobile360VerifyOtp',
  name: 'Mobile 360 - Verify OTP',
  description:
    'Completes the Cashfree Verification Suite (SecureID) Mobile 360 one-click onboarding flow by submitting the OTP received on the mobile number along with the verification_id from the mobile360SendOtp tool. On success returns the enriched 360 profile linked to the number: name, gender, DOB, PAN/masked Aadhaar/passport/voter/DL identifiers, phone and email linkages, bank account details, employment (UAN/EPFO), address history, credit score, and risk intelligence.',
  inputSchema: mobile360VerifyOtpInputSchema,
  execute: mobile360VerifyOtp,
};

export default mobile360VerifyOtpTool;

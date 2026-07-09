import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {
  VERIFICATION_API_VERSION,
  generateVerificationId,
  verificationPost,
} from './client.js';

const mobile360SendOtpInputSchema = z.object({
  mobile_number: z
    .string()
    .describe('The 10-digit mobile number of the individual to verify'),
  name: z
    .string()
    .nullable()
    .describe(
      'Name of the individual (max 100 chars). Improves data retrieval success rate. Can be null if not available.'
    ),
  notification_modes: z
    .array(z.enum(['SMS', 'WHATSAPP']))
    .nullable()
    .describe(
      'Channels to send the OTP through. Can be null to default to ["SMS"].'
    ),
  consent_purpose: z
    .string()
    .describe(
      'Purpose for collecting the user consent (20-100 chars). E.g. "Onboarding and KYC verification for account".'
    ),
  verification_id: z
    .string()
    .nullable()
    .describe(
      'Unique ID to identify this verification request (max 50 chars; alphanumeric, dot, hyphen, underscore). Reuse the same ID in mobile360VerifyOtp. Can be null to auto-generate one.'
    ),
});

type Mobile360SendOtpInput = z.infer<typeof mobile360SendOtpInputSchema>;

const mobile360SendOtp = async (
  _cashfree: Cashfree,
  args: Mobile360SendOtpInput
) => {
  const {mobile_number, name, notification_modes, consent_purpose} = args;
  const verification_id = args.verification_id || generateVerificationId();

  try {
    const data = await verificationPost(
      '/mobile360/otp/send',
      {
        verification_id,
        mobile_number,
        notification_modes: notification_modes?.length
          ? notification_modes
          : ['SMS'],
        user_consent: {
          obtained: true,
          type: 'EXPLICIT',
          timestamp: new Date().toISOString(),
          purpose: consent_purpose,
        },
        ...(name && {name}),
      },
      {'x-api-version': VERIFICATION_API_VERSION}
    );
    // Surface the verification_id so the caller can pass it to verify OTP.
    return {verification_id, ...data};
  } catch (error: any) {
    if (error.response?.data) {
      return {
        error: 'Failed to send Mobile 360 OTP',
        details: error.response.data,
      };
    }
    return {error: 'Failed to send Mobile 360 OTP', message: error.message};
  }
};

const mobile360SendOtpTool: CashfreeToolDefinition = {
  method: 'mobile360SendOtp',
  name: 'Mobile 360 - Send OTP',
  description:
    'Starts the Cashfree Verification Suite (SecureID) Mobile 360 one-click onboarding flow by sending an OTP to the given mobile number over SMS and/or WhatsApp. Requires explicit user consent (a purpose string). Returns a verification_id that must be passed to the mobile360VerifyOtp tool along with the OTP to fetch the enriched profile.',
  inputSchema: mobile360SendOtpInputSchema,
  execute: mobile360SendOtp,
};

export default mobile360SendOtpTool;

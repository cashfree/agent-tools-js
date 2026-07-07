import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {CashfreeVerification, withRequestId} from './client.js';

const verifyPanInputSchema = z.object({
  pan: z
    .string()
    .describe('The 10-character PAN (Permanent Account Number) to verify'),
  name: z
    .string()
    .nullable()
    .describe(
      'Name of the PAN holder to match against the registered name. Can be null if not available.'
    ),
});

type VerifyPanInput = z.infer<typeof verifyPanInputSchema>;

const verifyPan = async (_cashfree: Cashfree, args: VerifyPanInput) => {
  const {pan, name} = args;

  try {
    const response = await CashfreeVerification.VrsPanVerification(
      {
        pan,
        ...(name && {name}),
      },
      undefined,
      undefined,
      withRequestId()
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {error: 'Failed to verify PAN', details: error.response.data};
    }
    return {error: 'Failed to verify PAN', message: error.message};
  }
};

const verifyPanTool: CashfreeToolDefinition = {
  method: 'verifyPan',
  name: 'Verify PAN',
  description:
    'Verifies a PAN (Permanent Account Number) using Cashfree Verification Suite (SecureID). Returns whether the PAN is valid along with the registered name, PAN type (individual/business), and last updated date. Optionally matches a provided name against the registered name.',
  inputSchema: verifyPanInputSchema,
  execute: verifyPan,
};

export default verifyPanTool;

import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {verificationPost} from './client.js';

const verifyBankAccountInputSchema = z.object({
  bank_account: z
    .string()
    .describe('The bank account number to verify (6 to 40 characters)'),
  ifsc: z
    .string()
    .describe('The 11-character IFSC code of the bank account branch'),
  name: z
    .string()
    .nullable()
    .describe(
      'Name of the account holder to match against the name at the bank. Can be null if not available.'
    ),
  phone: z
    .string()
    .nullable()
    .describe(
      'Phone number of the account holder (8 to 13 digits). Can be null if not available.'
    ),
});

type VerifyBankAccountInput = z.infer<typeof verifyBankAccountInputSchema>;

const verifyBankAccount = async (
  _cashfree: Cashfree,
  args: VerifyBankAccountInput
) => {
  const {bank_account, ifsc, name, phone} = args;

  try {
    return await verificationPost('/bank-account/sync', {
      bank_account,
      ifsc,
      ...(name && {name}),
      ...(phone && {phone}),
    });
  } catch (error: any) {
    if (error.response?.data) {
      return {
        error: 'Failed to verify bank account',
        details: error.response.data,
      };
    }
    return {error: 'Failed to verify bank account', message: error.message};
  }
};

const verifyBankAccountTool: CashfreeToolDefinition = {
  method: 'verifyBankAccount',
  name: 'Verify Bank Account',
  description:
    'Verifies a bank account in real time using Cashfree Verification Suite (SecureID) penny drop (bank account verification sync). Requires the account number and IFSC. Returns the name at bank, bank name, branch, account status (VALID/INVALID), and a name match score if a name is provided.',
  inputSchema: verifyBankAccountInputSchema,
  execute: verifyBankAccount,
};

export default verifyBankAccountTool;

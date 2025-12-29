import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';

const fetchCustomerInstrumentsInputSchema = z.object({
  customer_id: z
    .string()
    .describe('The customer ID to fetch saved instruments for.'),
  instrument_type: z
    .enum(['card'])
    .describe(
      'The type of instrument to fetch. Currently only "card" is supported.'
    ),
});

type FetchCustomerInstrumentsInput = z.infer<
  typeof fetchCustomerInstrumentsInputSchema
>;

const fetchCustomerInstruments = async (
  cashfree: Cashfree,
  args: FetchCustomerInstrumentsInput
) => {
  const {customer_id, instrument_type} = args;

  try {
    const response = await cashfree.PGCustomerFetchInstruments(
      customer_id,
      instrument_type
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {
        error: 'Failed to fetch customer instruments',
        details: error.response.data,
      };
    }
    return {
      error: 'Failed to fetch customer instruments',
      message: error.message,
    };
  }
};

const fetchCustomerInstrumentsTool: CashfreeToolDefinition = {
  method: 'fetchCustomerInstruments',
  name: 'Fetch Customer Saved Instruments',
  description:
    'Fetch all saved instruments (cards) for a customer via Cashfree Token Vault. Returns a list of saved cards with instrument_id, card details (masked), and status. Use this to get available saved cards before making a payment with orderPaySavedCard.',
  inputSchema: fetchCustomerInstrumentsInputSchema,
  execute: fetchCustomerInstruments,
};

export default fetchCustomerInstrumentsTool;

import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {generateRequestId, agentToolkitOptions} from '../request-id.js';

const fetchCustomerInstrumentInputSchema = z.object({
  customer_id: z
    .string()
    .describe('The customer ID the saved instrument belongs to'),
  instrument_id: z
    .string()
    .describe('The instrument ID of the specific saved card to fetch'),
});

type FetchCustomerInstrumentInput = z.infer<
  typeof fetchCustomerInstrumentInputSchema
>;

const fetchCustomerInstrument = async (
  cashfree: Cashfree,
  args: FetchCustomerInstrumentInput
) => {
  const {customer_id, instrument_id} = args;

  try {
    const response = await cashfree.PGCustomerFetchInstrument(
      customer_id,
      instrument_id,
      generateRequestId(), undefined, agentToolkitOptions()
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {
        error: 'Failed to fetch customer instrument',
        details: error.response.data,
      };
    }
    return {
      error: 'Failed to fetch customer instrument',
      message: error.message,
    };
  }
};

const fetchCustomerInstrumentTool: CashfreeToolDefinition = {
  method: 'fetchCustomerInstrument',
  name: 'Fetch Specific Saved Instrument',
  description:
    'Fetches a single saved instrument (card) for a customer via Cashfree Token Vault. Requires the customer_id and instrument_id. Returns the masked card details and status.',
  inputSchema: fetchCustomerInstrumentInputSchema,
  execute: fetchCustomerInstrument,
};

export default fetchCustomerInstrumentTool;

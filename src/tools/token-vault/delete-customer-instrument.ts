import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {generateRequestId, agentToolkitOptions} from '../request-id.js';

const deleteCustomerInstrumentInputSchema = z.object({
  customer_id: z
    .string()
    .describe('The customer ID the saved instrument belongs to'),
  instrument_id: z
    .string()
    .describe('The instrument ID of the saved card to delete'),
});

type DeleteCustomerInstrumentInput = z.infer<
  typeof deleteCustomerInstrumentInputSchema
>;

const deleteCustomerInstrument = async (
  cashfree: Cashfree,
  args: DeleteCustomerInstrumentInput
) => {
  const {customer_id, instrument_id} = args;

  try {
    const response = await cashfree.PGCustomerDeleteInstrument(
      customer_id,
      instrument_id,
      generateRequestId(), undefined, agentToolkitOptions()
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {
        error: 'Failed to delete customer instrument',
        details: error.response.data,
      };
    }
    return {
      error: 'Failed to delete customer instrument',
      message: error.message,
    };
  }
};

const deleteCustomerInstrumentTool: CashfreeToolDefinition = {
  method: 'deleteCustomerInstrument',
  name: 'Delete Saved Instrument',
  description:
    'Deletes a saved instrument (card) for a customer via Cashfree Token Vault. Requires the customer_id and instrument_id. Once deleted the saved card can no longer be used for payment.',
  inputSchema: deleteCustomerInstrumentInputSchema,
  execute: deleteCustomerInstrument,
};

export default deleteCustomerInstrumentTool;

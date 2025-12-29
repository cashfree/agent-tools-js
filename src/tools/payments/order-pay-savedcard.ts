import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';

const orderPaySavedCardInputSchema = z.object({
  payment_session_id: z
    .string()
    .describe('The payment session id for the order.'),
  customer_id: z
    .string()
    .describe('Customer ID to fetch saved instruments for.'),
  instrument_id: z
    .string()
    .describe(
      'Instrument ID of the saved card. Use fetchCustomerInstruments tool to get available instruments.'
    ),
  offer_id: z.string().nullable().describe('Offer ID to apply to the order.'),
});

type OrderPaySavedCardInput = z.infer<typeof orderPaySavedCardInputSchema>;

const orderPaySavedCard = async (
  cashfree: Cashfree,
  args: OrderPaySavedCardInput
) => {
  const {payment_session_id, instrument_id, offer_id} = args;

  try {
    const PayOrderRequest: any = {
      payment_session_id,
      payment_method: {
        card: {
          channel: 'link',
          instrument_id,
        },
      },
      ...(offer_id ? {offer_id} : {}),
    };

    const response = await cashfree.PGPayOrder(PayOrderRequest);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {
        error: 'Failed to pay order with saved card',
        details: error.response.data,
      };
    }
    return {
      error: 'Failed to pay order with saved card',
      message: error.message,
    };
  }
};

const orderPayUsingSavedCardTool: CashfreeToolDefinition = {
  method: 'orderPayUsingSavedCard',
  name: 'Pay Order with Saved Card',
  description:
    'Pay an order using a saved card instrument via Cashfree. Requires payment_session_id, customer_id, instrument_id (from saved instruments). Use fetchCustomerInstruments to get available saved cards first.',
  inputSchema: orderPaySavedCardInputSchema,
  execute: orderPaySavedCard,
};

export default orderPayUsingSavedCardTool;

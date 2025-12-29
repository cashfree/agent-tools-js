import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {NetbankingBankMap} from '../utils.js';

const orderPayNetbankingInputSchema = z.object({
  payment_session_id: z
    .string()
    .describe('The payment session id for the order.'),
  netbanking_bank_code: z
    .enum(Object.keys(NetbankingBankMap) as [keyof typeof NetbankingBankMap])
    .describe('Netbanking bank code'),
  save_instrument: z
    .boolean()
    .nullable()
    .describe('Whether to save the instrument for future use.'),
  offer_id: z.string().nullable().describe('Offer ID to apply to the order.'),
});

type OrderPayNetbankingInput = z.infer<typeof orderPayNetbankingInputSchema>;

const orderPayNetbanking = async (
  cashfree: Cashfree,
  args: OrderPayNetbankingInput
) => {
  const {payment_session_id, netbanking_bank_code, save_instrument, offer_id} =
    args;

  try {
    const PayOrderRequest = {
      payment_session_id,
      payment_method: {
        netbanking: {
          channel: 'link',
          netbanking_bank_code: Number(netbanking_bank_code),
        },
      },
      ...(save_instrument != null && {save_instrument}),
      ...(offer_id && {offer_id}),
    };

    const response = await cashfree.PGPayOrder(PayOrderRequest);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {
        error: 'Failed to pay order with netbanking',
        details: error.response.data,
      };
    }
    return {
      error: 'Failed to pay order with netbanking',
      message: error.message,
    };
  }
};

const orderPayUsingNetbankingTool: CashfreeToolDefinition = {
  method: 'orderPayUsingNetbanking',
  name: 'Pay Order with Netbanking',
  description:
    'Pay an order using Netbanking via Cashfree. Bank codes are validated and mapped to bank names internally.',
  inputSchema: orderPayNetbankingInputSchema,
  execute: orderPayNetbanking,
};

export default orderPayUsingNetbankingTool;

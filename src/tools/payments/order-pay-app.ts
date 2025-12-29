import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';

const orderPayAppInputSchema = z.object({
  payment_session_id: z
    .string()
    .describe('The payment session id for the order.'),
  provider: z
    .enum([
      'gpay',
      'phonepe',
      'ola',
      'paytm',
      'amazon',
      'airtel',
      'freecharge',
      'mobikwik',
      'jio',
    ])
    .describe(
      'App provider: Google Pay (gpay), PhonePe (phonepe), Ola (ola), Paytm (paytm), Amazon Pay (amazon), Airtel Payments (airtel), Freecharge (freecharge), Mobikwik (mobikwik), Jio (jio)'
    ),
  phone: z
    .string()
    .describe(
      'Customer phone number associated with the wallet/app for payment.'
    ),
  save_instrument: z
    .boolean()
    .nullable()
    .describe('Whether to save the instrument for future use.'),
  offer_id: z.string().nullable().describe('Offer ID to apply to the order.'),
});

type OrderPayAppInput = z.infer<typeof orderPayAppInputSchema>;

const orderPayApp = async (cashfree: Cashfree, args: OrderPayAppInput) => {
  const {payment_session_id, provider, phone, save_instrument, offer_id} = args;

  try {
    const PayOrderRequest: any = {
      payment_session_id,
      payment_method: {
        app: {
          channel: 'link',
          provider,
          phone,
        },
      },
      ...(save_instrument !== null && save_instrument !== undefined
        ? {save_instrument}
        : {}),
      ...(offer_id ? {offer_id} : {}),
    };

    const response = await cashfree.PGPayOrder(PayOrderRequest);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {
        error: 'Failed to pay order with app payment',
        details: error.response.data,
      };
    }
    return {
      error: 'Failed to pay order with app payment',
      message: error.message,
    };
  }
};

const orderPayUsingAppTool: CashfreeToolDefinition = {
  method: 'orderPayUsingApp',
  name: 'Pay Order with App/Wallet',
  description:
    'Pay an order using app/wallet payment methods via Cashfree. Requires payment_session_id, provider (gpay, phonepe, paytm, etc.), and customer phone number. Optionally accepts save_instrument and offer_id. Supported providers: Google Pay, PhonePe, Ola, Paytm, Amazon Pay, Airtel Payments, Freecharge, Mobikwik, Jio.',
  inputSchema: orderPayAppInputSchema,
  execute: orderPayApp,
};

export default orderPayUsingAppTool;

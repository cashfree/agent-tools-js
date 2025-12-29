import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';

const upiAuthorizeDetailsSchema = z.object({
  approve_by: z
    .string()
    .nullable()
    .describe(
      'Time by which this authorization should be approved by the customer.'
    ),
  start_time: z
    .string()
    .nullable()
    .describe('This is the time when the UPI one time mandate will start.'),
  end_time: z
    .string()
    .nullable()
    .describe(
      'This is the time when the UPI mandate will be over. If the mandate has not been executed by this time, the funds will be returned back to the customer after this time.'
    ),
});

const orderPayUpiInputSchema = z.object({
  payment_session_id: z
    .string()
    .describe('The payment session id for the order.'),
  channel: z
    .enum(['link', 'collect', 'qrcode'])
    .describe('UPI channel: link, collect, or qrcode.'),
  upi_id: z
    .string()
    .nullable()
    .describe(
      'Customer UPI VPA to process payment. Required for channel=collect.'
    ),
  upi_redirect_url: z
    .boolean()
    .nullable()
    .describe('Show loader for collect. Only supported for collect channel.'),
  upi_expiry_minutes: z
    .number()
    .nullable()
    .describe(
      'UPI collect expiry in minutes (5-15). Only for collect channel.'
    ),
  authorize_only: z
    .boolean()
    .nullable()
    .describe('For one time mandate on UPI. Only for collect channel.'),
  authorization: upiAuthorizeDetailsSchema
    .nullable()
    .describe('UPI authorize details object for one time mandate.'),
  save_instrument: z
    .boolean()
    .nullable()
    .describe('Whether to save the instrument for future use.'),
  offer_id: z.string().nullable().describe('Offer ID to apply to the order.'),
});

type OrderPayUpiInput = z.infer<typeof orderPayUpiInputSchema>;

const orderPayUpi = async (cashfree: Cashfree, args: OrderPayUpiInput) => {
  const {
    payment_session_id,
    channel,
    upi_id,
    upi_redirect_url,
    upi_expiry_minutes,
    authorize_only,
    authorization,
    save_instrument,
    offer_id,
  } = args;

  try {
    const PayOrderRequest: any = {
      payment_session_id,
      payment_method: {
        upi: {
          channel,
          ...(upi_id ? {upi_id} : {}),
          ...(upi_redirect_url !== null && upi_redirect_url !== undefined
            ? {upi_redirect_url}
            : {}),
          ...(upi_expiry_minutes ? {upi_expiry_minutes} : {}),
          ...(authorize_only !== null && authorize_only !== undefined
            ? {authorize_only}
            : {}),
          ...(authorization ? {authorization} : {}),
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
        error: 'Failed to pay order with UPI',
        details: error.response.data,
      };
    }
    return {error: 'Failed to pay order with UPI', message: error.message};
  }
};

const orderPayUsingUpiTool: CashfreeToolDefinition = {
  method: 'orderPayUsingUpi',
  name: 'Pay Order with UPI',
  description:
    'Pay an order using UPI (link, collect, or qrcode channel) via Cashfree. Requires payment_session_id and channel. Optionally accepts upi_id (required for collect), upi_redirect_url, upi_expiry_minutes, authorize_only, authorization, save_instrument, and offer_id.',
  inputSchema: orderPayUpiInputSchema,
  execute: orderPayUpi,
};

export default orderPayUsingUpiTool;

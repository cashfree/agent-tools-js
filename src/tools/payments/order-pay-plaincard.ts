import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';

const orderPayPlainCardInputSchema = z.object({
  payment_session_id: z
    .string()
    .describe('The payment session id for the order.'),
  card_number: z.string().describe('Customer card number (16 digits).'),
  card_holder_name: z.string().describe('Customer name mentioned on the card.'),
  card_expiry_mm: z
    .string()
    .describe('Card expiry month (2 digits, e.g., 06).'),
  card_expiry_yy: z.string().describe('Card expiry year (2 digits, e.g., 25).'),
  card_cvv: z.string().describe('CVV mentioned on the card (3-4 digits).'),
  address_line_one: z
    .string()
    .nullable()
    .describe('First line of the billing address.'),
  address_line_two: z
    .string()
    .nullable()
    .describe('Second line of the billing address.'),
  city: z.string().nullable().describe('City name.'),
  zip_code: z.string().nullable().describe('Pin Code/Zip Code.'),
  country: z.string().nullable().describe('Country name.'),
  country_code: z
    .string()
    .nullable()
    .describe('Country code in ISO 2 format (e.g., US, IN).'),
  state: z.string().nullable().describe('State name.'),
  state_code: z
    .string()
    .nullable()
    .describe('State code in ISO 2 format (e.g., FL, CA).'),
  save_instrument: z
    .boolean()
    .nullable()
    .describe('Whether to save the instrument for future use.'),
  offer_id: z.string().nullable().describe('Offer ID to apply to the order.'),
});

type OrderPayPlainCardInput = z.infer<typeof orderPayPlainCardInputSchema>;

const orderPayPlainCard = async (
  cashfree: Cashfree,
  args: OrderPayPlainCardInput
) => {
  const {
    payment_session_id,
    card_number,
    card_holder_name,
    card_expiry_mm,
    card_expiry_yy,
    card_cvv,
    address_line_one,
    address_line_two,
    city,
    zip_code,
    country,
    country_code,
    state,
    state_code,
    save_instrument,
    offer_id,
  } = args;

  try {
    const PayOrderRequest: any = {
      payment_session_id,
      payment_method: {
        card: {
          channel: 'link',
          card_number,
          card_holder_name,
          card_expiry_mm,
          card_expiry_yy,
          card_cvv,
          ...(address_line_one ? {address_line_one} : {}),
          ...(address_line_two ? {address_line_two} : {}),
          ...(city ? {city} : {}),
          ...(zip_code ? {zip_code} : {}),
          ...(country ? {country} : {}),
          ...(country_code ? {country_code} : {}),
          ...(state ? {state} : {}),
          ...(state_code ? {state_code} : {}),
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
        error: 'Failed to pay order with card',
        details: error.response.data,
      };
    }
    return {error: 'Failed to pay order with card', message: error.message};
  }
};

const orderPayUsingPlainCardTool: CashfreeToolDefinition = {
  method: 'orderPayUsingPlainCard',
  name: 'Pay Order with Plain Card',
  description:
    'Pay an order using a plain credit/debit card via Cashfree. Requires payment_session_id, card details (number, holder name, expiry, CVV). Optionally accepts billing address details, save_instrument, and offer_id. Use this for direct card payments.',
  inputSchema: orderPayPlainCardInputSchema,
  execute: orderPayPlainCard,
};

export default orderPayUsingPlainCardTool;

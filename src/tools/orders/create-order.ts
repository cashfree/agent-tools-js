import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';

const createOrderInputSchema = z.object({
  order_amount: z.number().describe('The amount for the order'),
  order_currency: z
    .string()
    .default('INR')
    .describe('The currency for the order (e.g., INR)'),
  customer_id: z.string().describe('Unique identifier for the customer'),
  customer_name: z
    .string()
    .nullable()
    .describe('Name of the customer. Can be null if not available.'),
  customer_email: z.string().describe('Email address of the customer'),
  customer_phone: z.string().describe('Phone number of the customer'),
  return_url: z
    .string()
    .nullable()
    .describe(
      'URL to redirect after payment completion. Can be null if not needed.'
    ),
  order_note: z
    .string()
    .nullable()
    .describe(
      'Any note or description for the order. Can be null if not needed.'
    ),
});

type CreateOrderInput = z.infer<typeof createOrderInputSchema>;

const createOrder = async (cashfree: Cashfree, args: CreateOrderInput) => {
  const {
    order_amount,
    order_currency,
    customer_id,
    customer_name,
    customer_email,
    customer_phone,
    return_url,
    order_note,
  } = args;

  try {
    const request = {
      order_amount: order_amount,
      order_currency: order_currency || 'INR',
      customer_details: {
        customer_id: customer_id,
        customer_name: customer_name || '',
        customer_email: customer_email,
        customer_phone: customer_phone,
      },
      ...(return_url && {order_meta: {return_url}}),
      order_note: order_note || '',
    };

    const response = await cashfree.PGCreateOrder(request);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {error: 'Failed to create order', details: error.response.data};
    }
    return {error: 'Failed to create order', message: error.message};
  }
};

const createOrderTool: CashfreeToolDefinition = {
  method: 'createOrder',
  name: 'Create Order',
  description:
    'Creates a new payment order using Cashfree. Requires order amount, currency, and customer details (id, email, phone). Optionally accepts customer name, return URL, and order note.',
  inputSchema: createOrderInputSchema,
  execute: createOrder,
};

export default createOrderTool;

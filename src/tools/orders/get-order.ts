import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';

const getOrderInputSchema = z.object({
  order_id: z
    .string()
    .describe(
      'The unique identifier for the order whose status is to be fetched'
    ),
});

type getOrderInput = z.infer<typeof getOrderInputSchema>;

const getOrder = async (cashfree: Cashfree, args: getOrderInput) => {
  const {order_id} = args;

  try {
    const response = await cashfree.PGFetchOrder(order_id);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {error: 'Failed to fetch order', details: error.response.data};
    }
    return {error: 'Failed to fetch order', message: error.message};
  }
};

const getOrderTool: CashfreeToolDefinition = {
  method: 'getOrder',
  name: 'Get Order',
  description:
    'Fetches the details of an existing payment order using Cashfree. Requires the order ID.',
  inputSchema: getOrderInputSchema,
  execute: getOrder,
};

export default getOrderTool;

import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';

const getAllRefundsInputSchema = z.object({
  order_id: z
    .string()
    .describe('The order ID for which the refund details are to be fetched'),
});

type GetAllRefundsInput = z.infer<typeof getAllRefundsInputSchema>;

const getAllRefunds = async (cashfree: Cashfree, args: GetAllRefundsInput) => {
  const {order_id} = args;

  try {
    const response = await cashfree.PGOrderFetchRefunds(order_id);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {error: 'Failed to fetch refunds', details: error.response.data};
    }
    return {error: 'Failed to fetch refunds', message: error.message};
  }
};

const getAllRefundsTool: CashfreeToolDefinition = {
  method: 'getAllRefunds',
  name: 'Get All Refunds',
  description:
    'Retrieves details of all refunds for a given order. Requires order_id.',
  inputSchema: getAllRefundsInputSchema,
  execute: getAllRefunds,
};

export default getAllRefundsTool;

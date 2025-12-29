import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';

const getRefundInputSchema = z.object({
  order_id: z
    .string()
    .describe('The order ID for which the refund details are to be fetched'),
  refund_id: z
    .string()
    .describe('The unique ID associated with the refund. Alphanumeric.'),
});

type GetRefundInput = z.infer<typeof getRefundInputSchema>;

const getRefund = async (cashfree: Cashfree, args: GetRefundInput) => {
  const {order_id, refund_id} = args;

  try {
    const response = await cashfree.PGOrderFetchRefund(order_id, refund_id);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {error: 'Failed to get refund', details: error.response.data};
    }
    return {error: 'Failed to get refund', message: error.message};
  }
};

const getRefundTool: CashfreeToolDefinition = {
  method: 'getRefund',
  name: 'Get Refund',
  description:
    'Retrieves details of a refund for a given order. Requires order_id and refund_id.',
  inputSchema: getRefundInputSchema,
  execute: getRefund,
};

export default getRefundTool;

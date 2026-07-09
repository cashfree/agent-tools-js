import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {generateRequestId, agentToolkitOptions} from '../request-id.js';

const getPaymentsForOrderInputSchema = z.object({
  order_id: z
    .string()
    .describe('The unique identifier of the order to fetch payments for'),
});

type GetPaymentsForOrderInput = z.infer<
  typeof getPaymentsForOrderInputSchema
>;

const getPaymentsForOrder = async (
  cashfree: Cashfree,
  args: GetPaymentsForOrderInput
) => {
  const {order_id} = args;

  try {
    const response = await cashfree.PGOrderFetchPayments(
      order_id,
      generateRequestId(), undefined, agentToolkitOptions()
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {
        error: 'Failed to fetch payments for order',
        details: error.response.data,
      };
    }
    return {
      error: 'Failed to fetch payments for order',
      message: error.message,
    };
  }
};

const getPaymentsForOrderTool: CashfreeToolDefinition = {
  method: 'getPaymentsForOrder',
  name: 'Get Payments for an Order',
  description:
    'Fetches all payment attempts made for an order using Cashfree. Returns a list of payments with their status, amount, method, and cf_payment_id. Requires the order ID.',
  inputSchema: getPaymentsForOrderInputSchema,
  execute: getPaymentsForOrder,
};

export default getPaymentsForOrderTool;

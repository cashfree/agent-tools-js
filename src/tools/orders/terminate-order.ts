import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';

const terminateOrderInputSchema = z.object({
  order_id: z
    .string()
    .describe(
      'The unique identifier for the order whose status is to be fetched'
    ),
});

type terminateOrderInput = z.infer<typeof terminateOrderInputSchema>;

const terminateOrder = async (
  cashfree: Cashfree,
  args: terminateOrderInput
) => {
  const {order_id} = args;

  try {
    const TerminateOrderRequest = {
      order_status: 'TERMINATED',
    };

    const response = await cashfree.PGTerminateOrder(
      order_id,
      TerminateOrderRequest
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {
        error: 'Failed to terminate order',
        details: error.response.data,
      };
    }
    return {error: 'Failed to terminate order', message: error.message};
  }
};

const terminateOrderTool: CashfreeToolDefinition = {
  method: 'terminateOrder',
  name: 'Terminate Order',
  description:
    'Terminates an existing payment order using Cashfree. Requires the order ID.',
  inputSchema: terminateOrderInputSchema,
  execute: terminateOrder,
};

export default terminateOrderTool;

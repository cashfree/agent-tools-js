import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {generateRequestId, agentToolkitOptions} from '../request-id.js';

const getPaymentByIdInputSchema = z.object({
  order_id: z
    .string()
    .describe('The unique identifier of the order the payment belongs to'),
  cf_payment_id: z
    .string()
    .describe('The Cashfree payment ID of the specific payment to fetch'),
});

type GetPaymentByIdInput = z.infer<typeof getPaymentByIdInputSchema>;

const getPaymentById = async (
  cashfree: Cashfree,
  args: GetPaymentByIdInput
) => {
  const {order_id, cf_payment_id} = args;

  try {
    const response = await cashfree.PGOrderFetchPayment(
      order_id,
      cf_payment_id,
      generateRequestId(), undefined, agentToolkitOptions()
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {error: 'Failed to fetch payment', details: error.response.data};
    }
    return {error: 'Failed to fetch payment', message: error.message};
  }
};

const getPaymentByIdTool: CashfreeToolDefinition = {
  method: 'getPaymentById',
  name: 'Get Payment by ID',
  description:
    'Fetches the details of a single payment for an order using Cashfree. Requires the order ID and the Cashfree payment ID (cf_payment_id). Returns the payment status, amount, method, and gateway details.',
  inputSchema: getPaymentByIdInputSchema,
  execute: getPaymentById,
};

export default getPaymentByIdTool;

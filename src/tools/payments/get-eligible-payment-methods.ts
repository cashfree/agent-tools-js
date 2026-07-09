import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {generateRequestId, agentToolkitOptions} from '../request-id.js';

const getEligiblePaymentMethodsInputSchema = z.object({
  order_id: z
    .string()
    .nullable()
    .describe('The order ID to check eligibility for. Provide this or amount.'),
  amount: z
    .number()
    .nullable()
    .describe(
      'The order amount to check eligibility for. Provide this or order_id.'
    ),
});

type GetEligiblePaymentMethodsInput = z.infer<
  typeof getEligiblePaymentMethodsInputSchema
>;

const getEligiblePaymentMethods = async (
  cashfree: Cashfree,
  args: GetEligiblePaymentMethodsInput
) => {
  const {order_id, amount} = args;

  try {
    const response = await cashfree.PGEligibilityFetchPaymentMethods(
      {
        queries: {
          ...(order_id && {order_id}),
          ...(amount != null && {amount}),
        },
      },
      generateRequestId(), undefined, agentToolkitOptions()
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {
        error: 'Failed to fetch eligible payment methods',
        details: error.response.data,
      };
    }
    return {
      error: 'Failed to fetch eligible payment methods',
      message: error.message,
    };
  }
};

const getEligiblePaymentMethodsTool: CashfreeToolDefinition = {
  method: 'getEligiblePaymentMethods',
  name: 'Get Eligible Payment Methods',
  description:
    'Fetches the payment methods available/eligible for an order using Cashfree. Provide the order_id or the amount. Returns the list of eligible payment methods so an agent can decide how to collect payment.',
  inputSchema: getEligiblePaymentMethodsInputSchema,
  execute: getEligiblePaymentMethods,
};

export default getEligiblePaymentMethodsTool;

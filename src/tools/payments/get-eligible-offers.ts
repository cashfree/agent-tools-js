import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {generateRequestId, agentToolkitOptions} from '../request-id.js';

const getEligibleOffersInputSchema = z.object({
  order_id: z
    .string()
    .nullable()
    .describe('The order ID to check eligible offers for. Provide this or amount.'),
  amount: z
    .number()
    .nullable()
    .describe(
      'The order amount to check eligible offers for. Provide this or order_id.'
    ),
});

type GetEligibleOffersInput = z.infer<typeof getEligibleOffersInputSchema>;

const getEligibleOffers = async (
  cashfree: Cashfree,
  args: GetEligibleOffersInput
) => {
  const {order_id, amount} = args;

  try {
    const response = await cashfree.PGEligibilityFetchOffers(
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
        error: 'Failed to fetch eligible offers',
        details: error.response.data,
      };
    }
    return {error: 'Failed to fetch eligible offers', message: error.message};
  }
};

const getEligibleOffersTool: CashfreeToolDefinition = {
  method: 'getEligibleOffers',
  name: 'Get Eligible Offers',
  description:
    'Fetches the offers (discounts, cashback, EMI, etc.) eligible for an order using Cashfree. Provide the order_id or the amount. Returns the list of eligible offers with their IDs so they can be applied at payment.',
  inputSchema: getEligibleOffersInputSchema,
  execute: getEligibleOffers,
};

export default getEligibleOffersTool;

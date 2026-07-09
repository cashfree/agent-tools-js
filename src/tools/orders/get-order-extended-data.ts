import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {generateRequestId, agentToolkitOptions} from '../request-id.js';

const getOrderExtendedDataInputSchema = z.object({
  order_id: z
    .string()
    .describe('The unique identifier of the order to fetch extended data for'),
});

type GetOrderExtendedDataInput = z.infer<
  typeof getOrderExtendedDataInputSchema
>;

const getOrderExtendedData = async (
  cashfree: Cashfree,
  args: GetOrderExtendedDataInput
) => {
  const {order_id} = args;

  try {
    const response = await cashfree.PGFetchOrderExtendedData(
      order_id,
      generateRequestId(), undefined, agentToolkitOptions()
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {
        error: 'Failed to fetch order extended data',
        details: error.response.data,
      };
    }
    return {
      error: 'Failed to fetch order extended data',
      message: error.message,
    };
  }
};

const getOrderExtendedDataTool: CashfreeToolDefinition = {
  method: 'getOrderExtendedData',
  name: 'Get Order Extended Data',
  description:
    'Fetches the extended data of an order using Cashfree, such as shipment/delivery details and order delivery status. Requires the order ID.',
  inputSchema: getOrderExtendedDataInputSchema,
  execute: getOrderExtendedData,
};

export default getOrderExtendedDataTool;

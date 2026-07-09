import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {generateRequestId, agentToolkitOptions} from '../request-id.js';

const shipmentDetailsSchema = z.object({
  tracking_company: z
    .string()
    .describe('The shipping/logistics company handling the shipment'),
  tracking_urls: z
    .array(z.string())
    .describe('Tracking URLs for the shipment'),
  tracking_numbers: z
    .array(z.string())
    .describe('Tracking numbers for the shipment'),
});

const updateOrderExtendedDataInputSchema = z.object({
  order_id: z
    .string()
    .describe('The unique identifier of the order to update'),
  shipment_details: z
    .array(shipmentDetailsSchema)
    .describe('List of shipment details (tracking company, URLs, numbers)'),
  order_delivery_status: z
    .string()
    .nullable()
    .describe(
      'The delivery status of the order (e.g. delivery lifecycle state). Can be null.'
    ),
});

type UpdateOrderExtendedDataInput = z.infer<
  typeof updateOrderExtendedDataInputSchema
>;

const updateOrderExtendedData = async (
  cashfree: Cashfree,
  args: UpdateOrderExtendedDataInput
) => {
  const {order_id, shipment_details, order_delivery_status} = args;

  try {
    const response = await cashfree.PGUpdateOrderExtendedData(
      order_id,
      {
        shipment_details,
        ...(order_delivery_status && {
          order_delivery_status: order_delivery_status as any,
        }),
      },
      generateRequestId(), undefined, agentToolkitOptions()
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {
        error: 'Failed to update order extended data',
        details: error.response.data,
      };
    }
    return {
      error: 'Failed to update order extended data',
      message: error.message,
    };
  }
};

const updateOrderExtendedDataTool: CashfreeToolDefinition = {
  method: 'updateOrderExtendedData',
  name: 'Update Order Extended Data',
  description:
    'Updates the extended data of an order using Cashfree, such as shipment/tracking details and order delivery status. Used for settlement-on-delivery style flows. Requires the order ID and shipment details.',
  inputSchema: updateOrderExtendedDataInputSchema,
  execute: updateOrderExtendedData,
};

export default updateOrderExtendedDataTool;

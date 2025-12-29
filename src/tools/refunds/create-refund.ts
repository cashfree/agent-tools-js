import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';

const refundSplitSchema = z.object({
  vendor_id: z.string().describe('Vendor ID for split.'),
  amount: z.number().describe('Amount to split to this vendor.'),
});

const createRefundInputSchema = z.object({
  order_id: z
    .string()
    .describe('The order ID for which the refund is to be created'),
  refund_amount: z
    .number()
    .describe('Amount to be refunded. Should be <= transaction amount.'),
  refund_id: z
    .string()
    .describe('A unique ID to associate the refund with. Alphanumeric.'),
  refund_note: z
    .string()
    .nullable()
    .describe('A refund note for your reference. Can be null.'),
  refund_speed: z
    .string()
    .nullable()
    .describe(
      'Speed at which the refund is processed. STANDARD or INSTANT. Can be null.'
    ),
  refund_splits: z
    .array(refundSplitSchema)
    .nullable()
    .describe('Array of refund splits for vendors. Can be null.'),
});

type CreateRefundInput = z.infer<typeof createRefundInputSchema>;

const createRefund = async (cashfree: Cashfree, args: CreateRefundInput) => {
  const {
    order_id,
    refund_amount,
    refund_id,
    refund_note,
    refund_speed,
    refund_splits,
  } = args;

  try {
    const OrderCreateRefundRequest: any = {
      refund_amount,
      refund_id,
      ...(refund_note ? {refund_note} : {}),
      ...(refund_speed ? {refund_speed} : {}),
      ...(refund_splits ? {refund_splits} : {}),
    };

    const response = await cashfree.PGOrderCreateRefund(
      order_id,
      OrderCreateRefundRequest
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {error: 'Failed to create refund', details: error.response.data};
    }
    return {error: 'Failed to create refund', message: error.message};
  }
};

const createRefundTool: CashfreeToolDefinition = {
  method: 'createRefund',
  name: 'Create Refund',
  description:
    'Initiates a refund for a given order. Requires order_id, refund_amount, and refund_id. Optionally accepts refund_note, refund_speed, refund_splits.',
  inputSchema: createRefundInputSchema,
  execute: createRefund,
};

export default createRefundTool;

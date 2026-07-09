import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';
import {generateRequestId, agentToolkitOptions} from '../request-id.js';

const authorizeOrderInputSchema = z.object({
  order_id: z
    .string()
    .describe('The unique identifier of the pre-authorized order'),
  action: z
    .enum(['CAPTURE', 'VOID'])
    .describe(
      'CAPTURE to charge the pre-authorized amount, or VOID to release/cancel the pre-authorization'
    ),
  amount: z
    .number()
    .nullable()
    .describe(
      'The amount to capture (defaults to the full pre-authorized amount if null). Ignored for VOID.'
    ),
});

type AuthorizeOrderInput = z.infer<typeof authorizeOrderInputSchema>;

const authorizeOrder = async (
  cashfree: Cashfree,
  args: AuthorizeOrderInput
) => {
  const {order_id, action, amount} = args;

  try {
    const response = await cashfree.PGAuthorizeOrder(
      order_id,
      {
        action,
        ...(amount != null && {amount}),
      },
      generateRequestId(), undefined, agentToolkitOptions()
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {error: 'Failed to authorize order', details: error.response.data};
    }
    return {error: 'Failed to authorize order', message: error.message};
  }
};

const authorizeOrderTool: CashfreeToolDefinition = {
  method: 'authorizeOrder',
  name: 'Authorize Order (Preauthorization)',
  description:
    'Captures or voids a pre-authorized payment on an order using Cashfree. Use action=CAPTURE to charge the customer (optionally a partial amount) or action=VOID to release the hold. Applies to orders created with pre-authorization enabled.',
  inputSchema: authorizeOrderInputSchema,
  execute: authorizeOrder,
};

export default authorizeOrderTool;

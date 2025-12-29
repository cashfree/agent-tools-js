import {Cashfree} from 'cashfree-pg';
import {custom, z} from 'zod';
import type {CashfreeToolDefinition} from '../tools.js';

const createCustomerInputSchema = z.object({
  customer_phone: z
    .string()
    .length(10)
    .describe(
      'The unique identifier for the order whose status is to be fetched'
    ),
  customer_email: z
    .string()
    .describe(
      'The unique identifier for the order whose status is to be fetched'
    ),
  customer_name: z
    .string()
    .describe(
      'The unique identifier for the order whose status is to be fetched'
    ),
});

type createCustomerInput = z.infer<typeof createCustomerInputSchema>;

const createCustomer = async (
  cashfree: Cashfree,
  args: createCustomerInput
) => {
  const {customer_phone, customer_email, customer_name} = args;

  try {
    const CreateCustomerRequest = {
      customer_phone,
      customer_email,
      customer_name,
    };
    const response = await cashfree.PGCreateCustomer(CreateCustomerRequest);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return {error: 'Failed to fetch order', details: error.response.data};
    }
    return {error: 'Failed to fetch order', message: error.message};
  }
};

const createCustomerTool: CashfreeToolDefinition = {
  method: 'createCustomer',
  name: 'Create Customer',
  description:
    'Creates a new customer at Cashfree. Requires customer phone, email, and name.',
  inputSchema: createCustomerInputSchema,
  execute: createCustomer,
};

export default createCustomerTool;

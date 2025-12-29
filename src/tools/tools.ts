import {z} from 'zod';
import {Cashfree} from 'cashfree-pg';
import createOrderTool from './orders/create-order.js';
import getOrderTool from './orders/get-order.js';
import terminateOrderTool from './orders/terminate-order.js';
import createRefundTool from './refunds/create-refund.js';
import getAllRefundsTool from './refunds/get-all-refunds.js';
import getRefundTool from './refunds/get-refund.js';
import orderPayUsingUpiTool from './payments/order-pay-upi.js';
import orderPayUsingNetbankingTool from './payments/order-pay-netbanking.js';
import orderPayUsingAppTool from './payments/order-pay-app.js';
import orderPayUsingPlainCardTool from './payments/order-pay-plaincard.js';
import orderPayUsingSavedCardTool from './payments/order-pay-savedcard.js';
import createCustomerTool from './customer/create-customer.js';
import fetchCustomerInstrumentsTool from './token-vault/fetch-customer-instruments.js';

export type CashfreeToolMethod =
  | 'createOrder'
  | 'getOrder'
  | 'terminateOrder'
  | 'createRefund'
  | 'getAllRefunds'
  | 'getRefund'
  | 'orderPayUsingUpi'
  | 'orderPayUsingNetbanking'
  | 'orderPayUsingApp'
  | 'orderPayUsingPlainCard'
  | 'orderPayUsingSavedCard'
  | 'createCustomer'
  | 'fetchCustomerInstruments';

export type CashfreeToolDefinition = {
  method: string;
  name: string;
  description: string;
  inputSchema: z.ZodObject<any, any, any, any>;
  execute: (cashfree: Cashfree, args: any) => Promise<any>;
};

const tools: CashfreeToolDefinition[] = [
  createOrderTool,
  getOrderTool,
  terminateOrderTool,
  createRefundTool,
  getAllRefundsTool,
  getRefundTool,
  orderPayUsingUpiTool,
  orderPayUsingNetbankingTool,
  orderPayUsingAppTool,
  orderPayUsingPlainCardTool,
  orderPayUsingSavedCardTool,
  createCustomerTool,
  fetchCustomerInstrumentsTool,
];

export default tools;

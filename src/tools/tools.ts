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
import verifyPanTool from './verification/verify-pan.js';
import verifyGstinTool from './verification/verify-gstin.js';
import nameMatchTool from './verification/name-match.js';
import aadhaarGenerateOtpTool from './verification/aadhaar-generate-otp.js';
import aadhaarVerifyOtpTool from './verification/aadhaar-verify-otp.js';
import createReversePennyDropTool from './verification/create-reverse-penny-drop.js';
import getReversePennyDropStatusTool from './verification/get-reverse-penny-drop-status.js';
import verifyBankAccountTool from './verification/verify-bank-account.js';
import verifyIfscTool from './verification/verify-ifsc.js';

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
  | 'fetchCustomerInstruments'
  | 'verifyPan'
  | 'verifyGstin'
  | 'verifyNameMatch'
  | 'aadhaarGenerateOtp'
  | 'aadhaarVerifyOtp'
  | 'createReversePennyDrop'
  | 'getReversePennyDropStatus'
  | 'verifyBankAccount'
  | 'verifyIfsc';

export type CashfreeToolkitOptions = {
  /**
   * Credentials for Verification Suite (SecureID) tools. These are separate
   * from PG credentials and are generated from the Verification Suite
   * dashboard. If omitted, the PG client ID/secret are reused.
   */
  verification?: {
    clientId: string;
    clientSecret: string;
  };
};

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
  verifyPanTool,
  verifyGstinTool,
  nameMatchTool,
  aadhaarGenerateOtpTool,
  aadhaarVerifyOtpTool,
  createReversePennyDropTool,
  getReversePennyDropStatusTool,
  verifyBankAccountTool,
  verifyIfscTool,
];

export default tools;

import {z} from 'zod';
import {Cashfree} from 'cashfree-pg';
import createOrderTool from './orders/create-order.js';
import getOrderTool from './orders/get-order.js';
import terminateOrderTool from './orders/terminate-order.js';
import getOrderExtendedDataTool from './orders/get-order-extended-data.js';
import updateOrderExtendedDataTool from './orders/update-order-extended-data.js';
import authorizeOrderTool from './orders/authorize-order.js';
import createRefundTool from './refunds/create-refund.js';
import getAllRefundsTool from './refunds/get-all-refunds.js';
import getRefundTool from './refunds/get-refund.js';
import orderPayUsingUpiTool from './payments/order-pay-upi.js';
import orderPayUsingNetbankingTool from './payments/order-pay-netbanking.js';
import orderPayUsingAppTool from './payments/order-pay-app.js';
import orderPayUsingPlainCardTool from './payments/order-pay-plaincard.js';
import orderPayUsingSavedCardTool from './payments/order-pay-savedcard.js';
import getPaymentsForOrderTool from './payments/get-payments-for-order.js';
import getPaymentByIdTool from './payments/get-payment-by-id.js';
import getEligiblePaymentMethodsTool from './payments/get-eligible-payment-methods.js';
import getEligibleOffersTool from './payments/get-eligible-offers.js';
import createCustomerTool from './customer/create-customer.js';
import fetchCustomerInstrumentsTool from './token-vault/fetch-customer-instruments.js';
import fetchCustomerInstrumentTool from './token-vault/fetch-customer-instrument.js';
import deleteCustomerInstrumentTool from './token-vault/delete-customer-instrument.js';
import verifyPan360Tool from './verification/verify-pan-360.js';
import verifyGstinTool from './verification/verify-gstin.js';
import nameMatchTool from './verification/name-match.js';
import createReversePennyDropTool from './verification/create-reverse-penny-drop.js';
import getReversePennyDropStatusTool from './verification/get-reverse-penny-drop-status.js';
import verifyBankAccountTool from './verification/verify-bank-account.js';
import verifyIfscTool from './verification/verify-ifsc.js';
import mobile360SendOtpTool from './verification/mobile-360-send-otp.js';
import mobile360VerifyOtpTool from './verification/mobile-360-verify-otp.js';
import generateKycLinkTool from './verification/generate-kyc-link.js';
import getKycLinkStatusTool from './verification/get-kyc-link-status.js';
import generateStaticKycLinkTool from './verification/generate-static-kyc-link.js';
import deactivateStaticKycLinkTool from './verification/deactivate-static-kyc-link.js';
import smartOcrTool from './verification/smart-ocr.js';
import createVkycUserTool from './verification/create-vkyc-user.js';
import initiateVkycTool from './verification/initiate-vkyc.js';
import generateVkycAuthTokenTool from './verification/generate-vkyc-auth-token.js';
import getVkycStatusTool from './verification/get-vkyc-status.js';

export type CashfreeToolMethod =
  | 'createOrder'
  | 'getOrder'
  | 'terminateOrder'
  | 'getOrderExtendedData'
  | 'updateOrderExtendedData'
  | 'authorizeOrder'
  | 'createRefund'
  | 'getAllRefunds'
  | 'getRefund'
  | 'orderPayUsingUpi'
  | 'orderPayUsingNetbanking'
  | 'orderPayUsingApp'
  | 'orderPayUsingPlainCard'
  | 'orderPayUsingSavedCard'
  | 'getPaymentsForOrder'
  | 'getPaymentById'
  | 'getEligiblePaymentMethods'
  | 'getEligibleOffers'
  | 'createCustomer'
  | 'fetchCustomerInstruments'
  | 'fetchCustomerInstrument'
  | 'deleteCustomerInstrument'
  | 'verifyPan360'
  | 'verifyGstin'
  | 'verifyNameMatch'
  | 'createReversePennyDrop'
  | 'getReversePennyDropStatus'
  | 'verifyBankAccount'
  | 'verifyIfsc'
  | 'mobile360SendOtp'
  | 'mobile360VerifyOtp'
  | 'generateKycLink'
  | 'getKycLinkStatus'
  | 'generateStaticKycLink'
  | 'deactivateStaticKycLink'
  | 'smartOcr'
  | 'createVkycUser'
  | 'initiateVkyc'
  | 'generateVkycAuthToken'
  | 'getVkycStatus';

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
  getOrderExtendedDataTool,
  updateOrderExtendedDataTool,
  authorizeOrderTool,
  createRefundTool,
  getAllRefundsTool,
  getRefundTool,
  orderPayUsingUpiTool,
  orderPayUsingNetbankingTool,
  orderPayUsingAppTool,
  orderPayUsingPlainCardTool,
  orderPayUsingSavedCardTool,
  getPaymentsForOrderTool,
  getPaymentByIdTool,
  getEligiblePaymentMethodsTool,
  getEligibleOffersTool,
  createCustomerTool,
  fetchCustomerInstrumentsTool,
  fetchCustomerInstrumentTool,
  deleteCustomerInstrumentTool,
  verifyPan360Tool,
  verifyGstinTool,
  nameMatchTool,
  createReversePennyDropTool,
  getReversePennyDropStatusTool,
  verifyBankAccountTool,
  verifyIfscTool,
  mobile360SendOtpTool,
  mobile360VerifyOtpTool,
  generateKycLinkTool,
  getKycLinkStatusTool,
  generateStaticKycLinkTool,
  deactivateStaticKycLinkTool,
  smartOcrTool,
  createVkycUserTool,
  initiateVkycTool,
  generateVkycAuthTokenTool,
  getVkycStatusTool,
];

export default tools;

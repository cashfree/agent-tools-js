import {Cashfree} from 'cashfree-pg';
import {z} from 'zod';
import {readFile} from 'node:fs/promises';
import {basename, extname} from 'node:path';
import type {CashfreeToolDefinition} from '../tools.js';
import {
  VERIFICATION_API_VERSION,
  generateVerificationId,
  verificationPostForm,
} from './client.js';

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.pdf': 'application/pdf',
};

const smartOcrInputSchema = z.object({
  document_type: z
    .enum([
      'PAN',
      'AADHAAR',
      'DRIVING_LICENCE',
      'VOTER_ID',
      'PASSPORT',
      'VEHICLE_RC',
      'CANCELLED_CHEQUE',
      'INVOICE',
    ])
    .describe('The type of document to run OCR extraction on'),
  file_url: z
    .string()
    .nullable()
    .describe(
      'HTTPS URL of the document to process (image up to 5 MB, or PDF up to 1 MB). Provide this OR file_path, not both. Can be null.'
    ),
  file_path: z
    .string()
    .nullable()
    .describe(
      'Local filesystem path to the document to upload (JPEG/JPG/PNG or PDF, up to 5 MB). Provide this OR file_url, not both. Can be null.'
    ),
  do_verification: z
    .boolean()
    .nullable()
    .describe(
      'When true, also verifies the extracted details against government databases (supported for PAN and Driving Licence only). Can be null to skip verification.'
    ),
  verification_id: z
    .string()
    .nullable()
    .describe(
      'Unique ID to identify this request (max 50 chars; alphanumeric, dot, hyphen, underscore). Can be null to auto-generate one.'
    ),
});

type SmartOcrInput = z.infer<typeof smartOcrInputSchema>;

const smartOcr = async (_cashfree: Cashfree, args: SmartOcrInput) => {
  const {document_type, file_url, file_path, do_verification} = args;

  if (!file_url && !file_path) {
    return {
      error: 'Failed to run Smart OCR',
      message: 'Provide either file_url or file_path.',
    };
  }
  if (file_url && file_path) {
    return {
      error: 'Failed to run Smart OCR',
      message: 'Provide only one of file_url or file_path, not both.',
    };
  }

  const verification_id = args.verification_id || generateVerificationId();

  try {
    const form = new FormData();
    form.append('verification_id', verification_id);
    form.append('document_type', document_type);
    if (do_verification !== null && do_verification !== undefined) {
      form.append('do_verification', String(do_verification));
    }

    if (file_path) {
      const buffer = await readFile(file_path);
      const ext = extname(file_path).toLowerCase();
      const type = CONTENT_TYPE_BY_EXT[ext] ?? 'application/octet-stream';
      form.append(
        'file',
        new Blob([new Uint8Array(buffer)], {type}),
        basename(file_path)
      );
    } else {
      form.append('file_url', file_url as string);
    }

    return await verificationPostForm('/bharat-ocr', form, {
      'x-api-version': VERIFICATION_API_VERSION,
    });
  } catch (error: any) {
    if (error.response?.data) {
      return {error: 'Failed to run Smart OCR', details: error.response.data};
    }
    return {error: 'Failed to run Smart OCR', message: error.message};
  }
};

const smartOcrTool: CashfreeToolDefinition = {
  method: 'smartOcr',
  name: 'Smart OCR',
  description:
    'Runs Cashfree Verification Suite (SecureID) Smart OCR (Bharat OCR) to extract structured data from an identity or financial document image/PDF. Supports PAN, Aadhaar, Driving Licence, Voter ID, Passport, Vehicle RC, Cancelled Cheque, and Invoice. Accepts an image (JPEG/JPG/PNG) or PDF via an HTTPS file_url or a local file_path (max 5 MB; video is not supported). Returns extracted document_fields plus quality_checks, fraud_checks, and QR details. Set do_verification=true to also verify against government databases (PAN and Driving Licence only).',
  inputSchema: smartOcrInputSchema,
  execute: smartOcr,
};

export default smartOcrTool;

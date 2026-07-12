import { z } from 'zod';
import { ReceiptType, VoucherType, PaymentMethod } from '@prisma/client';

export const createPaymentReceiptSchema = z
  .object({
    customerId: z.string().uuid().optional().nullable(),
    supplierId: z.string().uuid().optional().nullable(),
    accountId: z.string().uuid('Invalid account ID'),
    type: z.nativeEnum(ReceiptType, { errorMap: () => ({ message: 'Invalid receipt type' }) }),
    amount: z.coerce.number().gt(0, 'Receipt amount must be greater than 0'),
    paymentMethod: z.nativeEnum(PaymentMethod, {
      errorMap: () => ({ message: 'Invalid payment method' }),
    }),
    reference: z.string().max(100).optional().nullable(),
    description: z.string().optional().nullable(),
    date: z.coerce.date({ invalid_type_error: 'Invalid receipt date' }),
  })
  .refine(
    (data) => {
      if (
        (data.type === 'CUSTOMER_PAYMENT' || data.type === 'ADVANCE_RECEIVE') &&
        !data.customerId
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Customer ID is required for customer payments or advance receives',
      path: ['customerId'],
    },
  )
  .refine(
    (data) => {
      if (
        (data.type === 'SUPPLIER_PAYMENT' || data.type === 'ADVANCE_PAYMENT') &&
        !data.supplierId
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Supplier ID is required for supplier payments or advance payments',
      path: ['supplierId'],
    },
  );

export const createPaymentVoucherSchema = z.object({
  type: z.nativeEnum(VoucherType, { errorMap: () => ({ message: 'Invalid voucher type' }) }),
  accountId: z.string().uuid('Invalid account ID'),
  amount: z.coerce.number().gt(0, 'Voucher amount must be greater than 0'),
  paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.CASH),
  description: z.string().optional().nullable(),
  date: z.coerce.date({ invalid_type_error: 'Invalid voucher date' }),
});

export interface CreatePaymentReceiptPayload {
  customerId?: string | null | undefined;
  supplierId?: string | null | undefined;
  accountId: string;
  type: ReceiptType;
  amount: number;
  paymentMethod: PaymentMethod;
  reference?: string | null | undefined;
  description?: string | null | undefined;
  date: Date;
}

export interface CreatePaymentVoucherPayload {
  type: VoucherType;
  accountId: string;
  amount: number;
  paymentMethod?: PaymentMethod | undefined;
  description?: string | null | undefined;
  date: Date;
}

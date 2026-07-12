import { z } from 'zod';

export const CategoryEnum = z.enum([
  'COMPANY',
  'BRANCH',
  'POS',
  'INVOICE',
  'TAX',
  'CURRENCY',
  'LOCALE',
  'EMAIL',
  'BACKUP',
  'SECURITY',
  'FEATURE',
  'SYSTEM',
  'BARCODE',
  'RECEIPT',
]);

export type SettingCategory = z.infer<typeof CategoryEnum>;

// COMPANY
export const companySettingsSchema = z.object({
  name: z.string().min(1, 'Company Name is required'),
  logo: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.string().length(0)),
  website: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  taxNumber: z.string().optional().nullable(),
  registrationNumber: z.string().optional().nullable(),
  businessHours: z.string().optional().nullable(),
});

// BRANCH
export const branchSettingsSchema = z.object({
  name: z.string().min(1, 'Branch Name is required'),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  warehouseId: z.string().uuid().optional().nullable(),
  timezone: z.string().optional().nullable(),
});
export const branchCategorySchema = z.record(z.string().uuid(), branchSettingsSchema);

// POS
export const posSettingsSchema = z.object({
  defaultWarehouseId: z.string().uuid(),
  defaultCustomerId: z.string().uuid(),
  allowNegativeStock: z.boolean().default(false),
  allowDiscount: z.boolean().default(true),
  maxDiscountPercent: z.number().min(0).max(100).default(10),
  autoOpenSession: z.boolean().default(true),
  autoPrintReceipt: z.boolean().default(true),
});

// INVOICE
export const invoiceSettingsSchema = z.object({
  invoicePrefix: z.string().min(1),
  invoiceNumberFormat: z.string().optional().nullable(),
  receiptFooter: z.string().optional().nullable(),
  termsConditions: z.string().optional().nullable(),
  printCopies: z.number().int().min(1).default(1),
});

// TAX
export const taxSettingsSchema = z.object({
  defaultTaxRate: z.number().min(0),
  taxInclusive: z.boolean().default(false),
  taxExclusive: z.boolean().default(true),
  taxNumber: z.string().optional().nullable(),
});

// CURRENCY
export const currencySettingsSchema = z.object({
  currencyCode: z.string().min(1),
  currencySymbol: z.string().min(1),
  decimalPrecision: z.number().int().min(0).max(4).default(2),
});

// LOCALE
export const localeSettingsSchema = z.object({
  dateFormat: z.string().default('YYYY-MM-DD'),
  timeFormat: z.string().default('HH:mm:ss'),
  timezone: z.string().default('UTC'),
  language: z.string().default('en'),
});

// EMAIL
export const emailSettingsSchema = z.object({
  smtpHost: z.string().min(1),
  smtpPort: z.number().int().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
  encryption: z.string().default('TLS'),
  fromEmail: z.string().email(),
  fromName: z.string().min(1),
});

// BACKUP
export const backupSettingsSchema = z.object({
  autoBackup: z.boolean().default(true),
  backupFrequency: z.string().default('DAILY'),
  retentionDays: z.number().int().min(1).default(30),
});

// SECURITY
export const securitySettingsSchema = z.object({
  apiSecret: z.string().optional().nullable(),
  requireMfa: z.boolean().default(false),
});

// FEATURE
export const featureSettingsSchema = z.object({
  purchaseModule: z.boolean().default(true),
  accountingModule: z.boolean().default(true),
  inventoryAlerts: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
  auditLogs: z.boolean().default(true),
  reports: z.boolean().default(true),
  multiBranch: z.boolean().default(false),
});

// SYSTEM
export const systemSettingsSchema = z.object({
  theme: z.string().default('light'),
  maintenanceMode: z.boolean().default(false),
});

// BARCODE
export const barcodeSettingsSchema = z.object({
  barcodeFormat: z.string().default('CODE128'),
  autoGenerateBarcode: z.boolean().default(true),
  barcodePrefix: z.string().optional().nullable(),
});

// RECEIPT
export const receiptSettingsSchema = z.object({
  paperSize: z.string().default('80mm'),
  logo: z.string().optional().nullable(),
  header: z.string().optional().nullable(),
  footer: z.string().optional().nullable(),
  qrCode: z.boolean().default(true),
});

export const categorySchemaMap: Record<SettingCategory, z.ZodTypeAny> = {
  COMPANY: companySettingsSchema,
  BRANCH: branchCategorySchema,
  POS: posSettingsSchema,
  INVOICE: invoiceSettingsSchema,
  TAX: taxSettingsSchema,
  CURRENCY: currencySettingsSchema,
  LOCALE: localeSettingsSchema,
  EMAIL: emailSettingsSchema,
  BACKUP: backupSettingsSchema,
  SECURITY: securitySettingsSchema,
  FEATURE: featureSettingsSchema,
  SYSTEM: systemSettingsSchema,
  BARCODE: barcodeSettingsSchema,
  RECEIPT: receiptSettingsSchema,
};

export const getCategorySchema = (category: SettingCategory) => {
  return categorySchemaMap[category];
};

// ── Backward Compatible Schemas ──
export const settingsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).default(20),
});
export type SettingsQuery = z.infer<typeof settingsQuerySchema>;

export const upsertSettingSchema = z.object({
  value: z.string(),
});
export type UpsertSettingBody = z.infer<typeof upsertSettingSchema>;

export const settingParamsSchema = z.object({
  companyId: z.string().uuid(),
  key: z.string().min(1),
});
export type SettingParams = z.infer<typeof settingParamsSchema>;

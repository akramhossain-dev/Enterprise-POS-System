'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import type { Supplier } from '@/types/supplier';

// ── Validation Schema ──────────────────────────────────────────

const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
const urlRegex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/;

export const supplierFormSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(255),
  contactPerson: z.string().max(200).optional().or(z.literal('')),
  phone: z.string().regex(phoneRegex, 'Invalid phone number').max(50).optional().or(z.literal('')),
  email: z.string().email('Invalid email address').max(255).optional().or(z.literal('')),
  website: z
    .string()
    .refine((v) => !v || urlRegex.test(v), 'Invalid website URL')
    .optional()
    .or(z.literal('')),
  taxNumber: z.string().max(100).optional().or(z.literal('')),
  addressLine1: z.string().max(255).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  creditLimit: z.coerce.number().min(0, 'Credit limit cannot be negative').default(0),
  openingBalance: z.coerce.number().default(0),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']),
  notes: z.string().max(2000).optional().or(z.literal('')),
  logoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export type SupplierFormSchema = z.infer<typeof supplierFormSchema>;

// ── Props ──────────────────────────────────────────────────────

interface SupplierFormProps {
  defaultValues?: Partial<SupplierFormSchema>;
  supplier?: Supplier;
  onSubmit: (values: SupplierFormSchema) => void;
  isPending?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
}

// ── Field wrapper ──────────────────────────────────────────────

function Field({
  label,
  error,
  required,
  className,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block text-xs font-semibold text-foreground/80">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
      {children}
    </h3>
  );
}

// ── Main Component ─────────────────────────────────────────────

export function SupplierForm({
  defaultValues,
  supplier,
  onSubmit,
  isPending = false,
  submitLabel = 'Save Supplier',
  onCancel,
}: SupplierFormProps) {
  const resolvedDefaults: Partial<SupplierFormSchema> = supplier
    ? {
        companyName: supplier.companyName,
        contactPerson: supplier.contactPerson ?? '',
        phone: supplier.phone ?? '',
        email: supplier.email ?? '',
        website: supplier.website ?? '',
        taxNumber: supplier.taxNumber ?? '',
        addressLine1:
          supplier.addresses?.find((a) => a.isDefault)?.addressLine1 ??
          supplier.addresses?.[0]?.addressLine1 ??
          '',
        city:
          supplier.addresses?.find((a) => a.isDefault)?.city ?? supplier.addresses?.[0]?.city ?? '',
        country:
          supplier.addresses?.find((a) => a.isDefault)?.country ??
          supplier.addresses?.[0]?.country ??
          '',
        creditLimit: parseFloat(supplier.creditLimit) || 0,
        openingBalance: parseFloat(supplier.openingBalance) || 0,
        status: supplier.status,
        notes: supplier.notes ?? '',
        logoUrl: '',
      }
    : (defaultValues ?? { status: 'ACTIVE', creditLimit: 0, openingBalance: 0 });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupplierFormSchema>({
    resolver: zodResolver(supplierFormSchema) as any,
    defaultValues: resolvedDefaults,
  });

  const inputClass =
    'w-full h-9 rounded-lg px-3 bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/60 disabled:opacity-60';
  const selectClass = cn(inputClass, 'cursor-pointer appearance-none');

  return (
    <form onSubmit={(handleSubmit as any)(onSubmit)} className="space-y-5" noValidate>
      {/* ── Business Information ──────────────────────── */}
      <div className="rounded-xl border border-border bg-cardard p-5">
        <SectionHeading>Business Information</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Company Name" error={errors.companyName?.message} required>
            <input
              {...register('companyName')}
              className={inputClass}
              placeholder="Acme Corp"
              aria-invalid={!!errors.companyName}
            />
          </Field>
          <Field label="Contact Person" error={errors.contactPerson?.message}>
            <input
              {...register('contactPerson')}
              className={inputClass}
              placeholder="John Smith"
              autoComplete="name"
            />
          </Field>
          <Field label="Tax / VAT Number" error={errors.taxNumber?.message}>
            <input {...register('taxNumber')} className={inputClass} placeholder="VAT-123456789" />
          </Field>
          <Field label="Website" error={errors.website?.message}>
            <input
              {...register('website')}
              type="url"
              className={inputClass}
              placeholder="https://example.com"
              autoComplete="url"
            />
          </Field>
          <Field label="Logo URL" error={errors.logoUrl?.message} className="sm:col-span-2">
            <input
              {...register('logoUrl')}
              type="url"
              className={inputClass}
              placeholder="https://cdn.example.com/logo.png"
            />
          </Field>
        </div>
      </div>

      {/* ── Contact Information ───────────────────────── */}
      <div className="rounded-xl border border-border bg-cardard p-5">
        <SectionHeading>Contact Information</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Phone" error={errors.phone?.message}>
            <input
              {...register('phone')}
              type="tel"
              className={inputClass}
              placeholder="+1 (555) 000-0000"
              autoComplete="tel"
              aria-invalid={!!errors.phone}
            />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <input
              {...register('email')}
              type="email"
              className={inputClass}
              placeholder="contact@supplier.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
            />
          </Field>
        </div>
      </div>

      {/* ── Address ───────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-cardard p-5">
        <SectionHeading>Address</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Street Address"
            error={errors.addressLine1?.message}
            className="sm:col-span-2"
          >
            <input
              {...register('addressLine1')}
              className={inputClass}
              placeholder="123 Business Ave, Suite 100"
            />
          </Field>
          <Field label="City" error={errors.city?.message}>
            <input {...register('city')} className={inputClass} placeholder="New York" />
          </Field>
          <Field label="Country" error={errors.country?.message}>
            <input {...register('country')} className={inputClass} placeholder="United States" />
          </Field>
        </div>
      </div>

      {/* ── Account Settings ──────────────────────────── */}
      <div className="rounded-xl border border-border bg-cardard p-5">
        <SectionHeading>Account Settings</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Credit Limit ($)" error={errors.creditLimit?.message}>
            <input
              {...register('creditLimit')}
              type="number"
              min={0}
              step="0.01"
              className={inputClass}
              placeholder="0.00"
            />
          </Field>
          <Field label="Opening Balance ($)" error={errors.openingBalance?.message}>
            <input
              {...register('openingBalance')}
              type="number"
              step="0.01"
              className={inputClass}
              placeholder="0.00"
            />
          </Field>
          <Field label="Status" error={errors.status?.message} required>
            <select {...register('status')} className={selectClass} aria-invalid={!!errors.status}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </Field>
        </div>
      </div>

      {/* ── Notes ─────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-cardard p-5">
        <SectionHeading>Notes</SectionHeading>
        <Field label="Internal Notes" error={errors.notes?.message}>
          <textarea
            {...register('notes')}
            rows={4}
            className={cn(inputClass, 'h-auto py-2 resize-none leading-relaxed')}
            placeholder="Add internal notes about this supplier..."
          />
        </Field>
      </div>

      {/* ── Actions ───────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isPending} className="min-w-[120px]">
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving…
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}

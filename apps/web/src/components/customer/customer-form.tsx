'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';
import type {
  Customer,
  CustomerFormValues,
  CustomerStatus,
  CustomerGender,
} from '@/types/customer';

// ── Zod Schema ────────────────────────────────────────────────

const phoneRegex = /^[+]?[\d\s\-().]{7,20}$/;

export const customerFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: z.string().regex(phoneRegex, 'Invalid phone number').max(50).optional().or(z.literal('')),
  email: z.string().email('Invalid email address').max(255).optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', '']),
  addressLine1: z.string().max(255).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  creditLimit: z.coerce.number().min(0, 'Credit limit cannot be negative').default(0),
  openingBalance: z.coerce.number().default(0),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']),
  notes: z.string().max(2000).optional().or(z.literal('')),
  avatarUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export type CustomerFormSchema = z.infer<typeof customerFormSchema>;

// ── Props ─────────────────────────────────────────────────────

interface CustomerFormProps {
  defaultValues?: Partial<CustomerFormSchema>;
  /** Pre-populated data when editing an existing customer */
  customer?: Customer;
  onSubmit: (values: CustomerFormSchema) => void;
  isPending?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
}

// ── Field wrapper ─────────────────────────────────────────────

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
    <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2 mb-4">
      {children}
    </h3>
  );
}

// ── Main Form ─────────────────────────────────────────────────

export function CustomerForm({
  defaultValues,
  customer,
  onSubmit,
  isPending = false,
  submitLabel = 'Save Customer',
  onCancel,
}: CustomerFormProps) {
  const resolvedDefaults: Partial<CustomerFormSchema> = customer
    ? {
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone ?? '',
        email: customer.email ?? '',
        dateOfBirth: customer.dateOfBirth ? customer.dateOfBirth.split('T')[0] : '',
        gender: (customer.gender ?? '') as CustomerGender | '',
        addressLine1: customer.addresses?.[0]?.addressLine1 ?? '',
        city: customer.addresses?.[0]?.city ?? '',
        country: customer.addresses?.[0]?.country ?? '',
        creditLimit: parseFloat(customer.creditLimit) || 0,
        openingBalance: parseFloat(customer.openingBalance) || 0,
        status: customer.status,
        notes: customer.notes ?? '',
        avatarUrl: '',
      }
    : {
        status: 'ACTIVE',
        creditLimit: 0,
        openingBalance: 0,
        gender: '',
        ...defaultValues,
      };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormSchema>({
    resolver: zodResolver(customerFormSchema) as any,
    defaultValues: resolvedDefaults,
  });

  const inputClass =
    'w-full h-9 rounded-lg px-3 bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/60 disabled:opacity-60';

  const selectClass = cn(inputClass, 'cursor-pointer appearance-none');

  return (
    <form onSubmit={(handleSubmit as any)(onSubmit)} className="space-y-5" noValidate>
      {/* ── Basic Information ─────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5">
        <SectionHeading>Basic Information</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First Name" error={errors.firstName?.message} required>
            <input
              {...register('firstName')}
              className={inputClass}
              placeholder="John"
              autoComplete="given-name"
              aria-invalid={!!errors.firstName}
            />
          </Field>
          <Field label="Last Name" error={errors.lastName?.message} required>
            <input
              {...register('lastName')}
              className={inputClass}
              placeholder="Doe"
              autoComplete="family-name"
              aria-invalid={!!errors.lastName}
            />
          </Field>
          <Field label="Date of Birth" error={errors.dateOfBirth?.message}>
            <input
              {...register('dateOfBirth')}
              type="date"
              className={inputClass}
              aria-invalid={!!errors.dateOfBirth}
            />
          </Field>
          <Field label="Gender" error={errors.gender?.message}>
            <select {...register('gender')} className={selectClass} aria-invalid={!!errors.gender}>
              <option value="">— Select gender —</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </Field>
        </div>
      </div>

      {/* ── Contact Information ───────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5">
        <SectionHeading>Contact Information</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Phone Number" error={errors.phone?.message}>
            <input
              {...register('phone')}
              type="tel"
              className={inputClass}
              placeholder="+1 (555) 000-0000"
              autoComplete="tel"
              aria-invalid={!!errors.phone}
            />
          </Field>
          <Field label="Email Address" error={errors.email?.message}>
            <input
              {...register('email')}
              type="email"
              className={inputClass}
              placeholder="john@example.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
            />
          </Field>
          <Field label="Address" error={errors.addressLine1?.message} className="sm:col-span-2">
            <input
              {...register('addressLine1')}
              className={inputClass}
              placeholder="123 Main Street, Suite 4"
              aria-invalid={!!errors.addressLine1}
            />
          </Field>
          <Field label="City" error={errors.city?.message}>
            <input
              {...register('city')}
              className={inputClass}
              placeholder="New York"
              aria-invalid={!!errors.city}
            />
          </Field>
          <Field label="Country" error={errors.country?.message}>
            <input
              {...register('country')}
              className={inputClass}
              placeholder="United States"
              aria-invalid={!!errors.country}
            />
          </Field>
        </div>
      </div>

      {/* ── Account Settings ──────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5">
        <SectionHeading>Account Settings</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Credit Limit" error={errors.creditLimit?.message}>
            <input
              {...register('creditLimit')}
              type="number"
              step="0.01"
              min="0"
              className={inputClass}
              placeholder="0.00"
              aria-invalid={!!errors.creditLimit}
            />
          </Field>
          <Field label="Opening Due" error={errors.openingBalance?.message}>
            <input
              {...register('openingBalance')}
              type="number"
              step="0.01"
              className={inputClass}
              placeholder="0.00"
              aria-invalid={!!errors.openingBalance}
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

      {/* ── Profile Photo ─────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5">
        <SectionHeading>Profile Photo</SectionHeading>
        <Field label="Avatar URL" error={errors.avatarUrl?.message}>
          <input
            {...register('avatarUrl')}
            type="url"
            className={inputClass}
            placeholder="https://example.com/photo.jpg"
            aria-invalid={!!errors.avatarUrl}
          />
        </Field>
        <p className="text-xs text-muted-foreground mt-2">
          Provide a direct URL to the customer&apos;s profile photo. Leave blank to use initials
          avatar.
        </p>
      </div>

      {/* ── Notes ────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5">
        <SectionHeading>Notes</SectionHeading>
        <Field label="Internal Notes" error={errors.notes?.message}>
          <textarea
            {...register('notes')}
            rows={4}
            className={cn(inputClass, 'h-auto py-2 resize-none')}
            placeholder="Add any relevant notes about this customer…"
            aria-invalid={!!errors.notes}
          />
        </Field>
      </div>

      {/* ── Actions ───────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pt-1">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isPending} disabled={isPending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

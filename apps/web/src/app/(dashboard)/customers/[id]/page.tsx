'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Edit,
  Archive,
  Trash2,
  Phone,
  Mail,
  MapPin,
  User,
  Calendar,
  CreditCard,
  FileText,
  RotateCcw,
  RefreshCw,
  Plus,
} from 'lucide-react';
import {
  useCustomer,
  useCustomerBalance,
  useCustomerLedger,
  useCustomerAddresses,
  useDeleteCustomer,
  useArchiveCustomer,
  useRestoreCustomer,
  useAddCustomerAddress,
} from '@/hooks/use-customer';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomerAvatar } from '@/components/customer/customer-avatar';
import { CustomerStatusBadge } from '@/components/customer/customer-status-badge';
import { CustomerDueBadge } from '@/components/customer/customer-due-badge';
import { PaymentSummaryCard } from '@/components/customer/payment-summary-card';
import { TransactionTimeline } from '@/components/customer/transaction-timeline';
import { CustomerProfileSkeleton } from '@/components/customer/customer-profile-skeleton';
import { Pagination } from '@/components/ui/pagination';
import { formatDate, formatDateTime } from '@/utils/format';
import { format, parseISO, isValid } from 'date-fns';
import { cn } from '@/utils/cn';
import type { CustomerLedgerEntryType } from '@/types/customer';
import { toast } from 'sonner';

// ── Tab types ──────────────────────────────────────────────────
type Tab = 'overview' | 'ledger' | 'addresses' | 'notes';

const tabs: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'ledger', label: 'Transactions' },
  { id: 'addresses', label: 'Addresses' },
  { id: 'notes', label: 'Notes' },
];

// ── Info row ──────────────────────────────────────────────────
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase">{label}</p>
        <p className="text-sm text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ── Add address form ──────────────────────────────────────────
function AddAddressForm({ customerId, onDone }: { customerId: string; onDone: () => void }) {
  const [form, setForm] = useState({
    label: '',
    addressLine1: '',
    city: '',
    country: '',
    isDefault: false,
  });
  const { mutate: addAddress, isPending } = useAddCustomerAddress(customerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label || !form.addressLine1) {
      toast.error('Label and address line are required');
      return;
    }
    addAddress(
      {
        label: form.label,
        addressLine1: form.addressLine1,
        city: form.city || undefined,
        country: form.country || undefined,
        isDefault: form.isDefault,
      },
      { onSuccess: onDone },
    );
  };

  const inputClass =
    'w-full h-8 rounded-lg px-3 bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all';

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-border bg-card space-y-3">
      <p className="text-sm font-semibold text-foreground">Add New Address</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Label *</label>
          <input
            className={inputClass}
            placeholder="Home / Office / Other"
            value={form.label}
            onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Address Line 1 *</label>
          <input
            className={inputClass}
            placeholder="123 Main Street"
            value={form.addressLine1}
            onChange={(e) => setForm((p) => ({ ...p, addressLine1: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">City</label>
          <input
            className={inputClass}
            placeholder="New York"
            value={form.city}
            onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Country</label>
          <input
            className={inputClass}
            placeholder="United States"
            value={form.country}
            onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))}
          className="rounded border-input text-primary"
        />
        Set as default address
      </label>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" size="sm" loading={isPending}>
          Save Address
        </Button>
      </div>
    </form>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function CustomerProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [ledgerEntryType, setLedgerEntryType] = useState<CustomerLedgerEntryType | ''>('');
  const [ledgerPage, setLedgerPage] = useState(1);
  const [showAddAddress, setShowAddAddress] = useState(false);

  const { data: customer, isLoading, isError, refetch } = useCustomer(id);
  const { data: balance } = useCustomerBalance(id);
  const { data: ledgerData, isLoading: isLedgerLoading } = useCustomerLedger(id, {
    page: ledgerPage,
    limit: 15,
    entryType: ledgerEntryType || undefined,
  });
  const { data: addresses = [] } = useCustomerAddresses(id);

  const { mutate: deleteCustomer } = useDeleteCustomer();
  const { mutate: archiveCustomer } = useArchiveCustomer();
  const { mutate: restoreCustomer } = useRestoreCustomer();

  if (isLoading)
    return (
      <PageContainer>
        <CustomerProfileSkeleton />
      </PageContainer>
    );

  if (isError || !customer) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-sm text-destructive">Failed to load customer profile.</p>
          <Button
            variant="outline"
            onClick={() => void refetch()}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Retry
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Back nav */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/customers">
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <span className="text-sm font-medium text-muted-foreground">Back to customers</span>
      </div>

      {/* Profile header card */}
      <div className="flex flex-col sm:flex-row gap-4 p-5 rounded-xl border border-border bg-card">
        <CustomerAvatar customer={customer} size="xl" className="flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {customer.fullName}
            </h1>
            <CustomerStatusBadge status={customer.status} />
            <CustomerDueBadge balance={customer.currentBalance} />
          </div>
          <p className="text-sm text-muted-foreground font-mono mt-1">#{customer.customerCode}</p>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
            {customer.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                {customer.phone}
              </span>
            )}
            {customer.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {customer.email}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Customer since{' '}
              {(() => {
                try {
                  const d = parseISO(customer.createdAt);
                  return isValid(d) ? format(d, 'MMM yyyy') : '—';
                } catch {
                  return '—';
                }
              })()}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-start gap-2 flex-shrink-0">
          <Button size="sm" variant="outline" asChild>
            <Link href={`/customers/${id}/edit`} className="inline-flex items-center gap-1.5">
              <Edit className="w-3.5 h-3.5" />
              Edit
            </Link>
          </Button>
          {customer.status === 'ARCHIVED' ? (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={() => restoreCustomer(id)}
            >
              Restore
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="text-amber-500 border-amber-500/20 hover:bg-amber-500/10"
              leftIcon={<Archive className="w-3.5 h-3.5" />}
              onClick={() => archiveCustomer(id)}
            >
              Archive
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="text-destructive border-destructive/20 hover:bg-destructive/10"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => {
              if (confirm(`Delete "${customer.fullName}"? This cannot be undone.`)) {
                deleteCustomer(id, { onSuccess: () => router.push('/customers') });
              }
            }}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Payment summary */}
      <PaymentSummaryCard
        balance={balance?.currentBalance ?? customer.currentBalance}
        creditLimit={balance?.creditLimit ?? customer.creditLimit}
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tab-panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px',
              activeTab === tab.id
                ? 'text-primary border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground hover:border-border',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div
          id="tab-panel-overview"
          role="tabpanel"
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
        >
          {/* Basic Information */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Basic Information</h2>
            <div className="space-y-3">
              <InfoRow
                icon={<User className="w-4 h-4" />}
                label="Full Name"
                value={customer.fullName}
              />
              <InfoRow
                icon={<Calendar className="w-4 h-4" />}
                label="Date of Birth"
                value={customer.dateOfBirth ? formatDate(customer.dateOfBirth) : null}
              />
              <InfoRow icon={<User className="w-4 h-4" />} label="Gender" value={customer.gender} />
              <InfoRow
                icon={<FileText className="w-4 h-4" />}
                label="National ID"
                value={customer.nationalId}
              />
              <InfoRow
                icon={<FileText className="w-4 h-4" />}
                label="Tax Number"
                value={customer.taxNumber}
              />
              <InfoRow
                icon={<Calendar className="w-4 h-4" />}
                label="Member Since"
                value={formatDateTime(customer.createdAt)}
              />
              <InfoRow
                icon={<Calendar className="w-4 h-4" />}
                label="Last Updated"
                value={formatDateTime(customer.updatedAt)}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Contact Information</h2>
            <div className="space-y-3">
              <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={customer.phone} />
              <InfoRow
                icon={<Phone className="w-4 h-4" />}
                label="Alternative Phone"
                value={customer.alternativePhone}
              />
              <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={customer.email} />
              {customer.addresses?.[0] && (
                <InfoRow
                  icon={<MapPin className="w-4 h-4" />}
                  label="Primary Address"
                  value={[
                    customer.addresses[0].addressLine1,
                    customer.addresses[0].city,
                    customer.addresses[0].country,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                />
              )}
            </div>
          </div>

          {/* Notes */}
          {customer.notes && (
            <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
              <h2 className="text-sm font-semibold text-foreground mb-3">Notes</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {customer.notes}
              </p>
            </div>
          )}

          {/* Account info */}
          <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
            <h2 className="text-sm font-semibold text-foreground mb-3">Account Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">
                  Loyalty Points
                </p>
                <p className="text-lg font-bold mt-1">{customer.loyaltyPoints}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">
                  Opening Balance
                </p>
                <p className="text-lg font-bold mt-1 font-mono">{customer.openingBalance}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Branch</p>
                <p className="text-lg font-bold mt-1">{customer.branchId ? 'Assigned' : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">
                  Customer Code
                </p>
                <p className="text-sm font-mono font-bold mt-1">#{customer.customerCode}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Ledger */}
      {activeTab === 'ledger' && (
        <div id="tab-panel-ledger" role="tabpanel" className="space-y-4">
          {/* Filter bar */}
          <div className="flex items-center gap-3">
            <label
              htmlFor="ledger-type-filter"
              className="text-xs font-semibold text-muted-foreground uppercase"
            >
              Type
            </label>
            <select
              id="ledger-type-filter"
              value={ledgerEntryType}
              onChange={(e) => {
                setLedgerEntryType(e.target.value as CustomerLedgerEntryType | '');
                setLedgerPage(1);
              }}
              className="h-8 rounded-lg bg-background border border-border text-xs px-2.5 outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Types</option>
              <option value="SALE">Sales</option>
              <option value="PAYMENT">Payments</option>
              <option value="RETURN">Returns</option>
              <option value="ADJUSTMENT">Adjustments</option>
              <option value="OPENING_BALANCE">Opening Balance</option>
            </select>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            {isLedgerLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="h-8 w-8 rounded-full bg-muted flex-shrink-0" />
                    <div className="flex-1 space-y-1.5 pt-1">
                      <div className="h-3.5 w-40 bg-muted rounded" />
                      <div className="h-3 w-24 bg-muted rounded" />
                    </div>
                    <div className="h-4 w-20 bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <TransactionTimeline entries={ledgerData?.data ?? []} />
            )}
          </div>

          {(ledgerData?.meta?.totalPages ?? 0) > 1 && (
            <Pagination
              page={ledgerPage}
              pageSize={15}
              total={ledgerData?.meta?.total ?? 0}
              onPageChange={setLedgerPage}
            />
          )}
        </div>
      )}

      {/* Tab: Addresses */}
      {activeTab === 'addresses' && (
        <div id="tab-panel-addresses" role="tabpanel" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Addresses ({addresses.length})
            </h2>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setShowAddAddress((p) => !p)}
            >
              Add Address
            </Button>
          </div>

          {showAddAddress && (
            <AddAddressForm customerId={id} onDone={() => setShowAddAddress(false)} />
          )}

          {addresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-border bg-card">
              <MapPin className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No addresses yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={cn(
                    'rounded-xl border bg-card p-4 space-y-1.5',
                    addr.isDefault ? 'border-primary/30 bg-primary/5' : 'border-border',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">{addr.label}</span>
                    {addr.isDefault && (
                      <Badge variant="outline-primary" className="text-[10px]">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{addr.addressLine1}</p>
                  {(addr.city || addr.country) && (
                    <p className="text-xs text-muted-foreground">
                      {[addr.city, addr.country].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Notes */}
      {activeTab === 'notes' && (
        <div id="tab-panel-notes" role="tabpanel">
          <div className="rounded-xl border border-border bg-card p-5">
            {customer.notes ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground">Customer Notes</h2>
                  <Button size="sm" variant="outline" asChild>
                    <Link
                      href={`/customers/${id}/edit`}
                      className="inline-flex items-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {customer.notes}
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Last updated {formatDate(customer.updatedAt)}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-10 h-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No notes yet</p>
                <Button size="sm" variant="outline" className="mt-4" asChild>
                  <Link href={`/customers/${id}/edit`} className="inline-flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    Add Notes
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}

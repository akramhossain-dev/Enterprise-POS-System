'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Edit,
  Archive,
  Trash2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Building2,
  FileText,
  CreditCard,
  ShoppingBag,
  RefreshCw,
  RotateCcw,
  Plus,
  Hash,
} from 'lucide-react';
import {
  useSupplier,
  useSupplierBalance,
  useSupplierLedger,
  useSupplierAddresses,
  useSupplierPayments,
  useDeleteSupplier,
  useArchiveSupplier,
  useRestoreSupplier,
  useAddSupplierAddress,
} from '@/hooks/use-supplier';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SupplierAvatar } from '@/components/supplier/supplier-avatar';
import { SupplierStatusBadge } from '@/components/supplier/supplier-status-badge';
import { SupplierDueBadge } from '@/components/supplier/supplier-due-badge';
import { SupplierSummaryCard } from '@/components/supplier/supplier-summary-card';
import { SupplierLedgerTable } from '@/components/supplier/supplier-ledger-table';
import { PaymentHistoryTable } from '@/components/supplier/payment-history-table';
import { PurchaseHistoryPlaceholder } from '@/components/supplier/purchase-history-placeholder';
import { SupplierProfileSkeleton } from '@/components/supplier/supplier-profile-skeleton';
import { formatDate, formatCurrency } from '@/utils/format';
import { format, parseISO, isValid } from 'date-fns';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';
import type { SupplierLedgerEntryType } from '@/types/supplier';

// ── Tabs ───────────────────────────────────────────────────────

type Tab = 'overview' | 'ledger' | 'purchases' | 'payments' | 'notes';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <Building2 className="w-3.5 h-3.5" /> },
  { id: 'ledger', label: 'Ledger', icon: <FileText className="w-3.5 h-3.5" /> },
  { id: 'purchases', label: 'Purchases', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  { id: 'payments', label: 'Payments', icon: <CreditCard className="w-3.5 h-3.5" /> },
  { id: 'notes', label: 'Notes', icon: <FileText className="w-3.5 h-3.5" /> },
];

const LEDGER_FILTER_OPTIONS: { value: SupplierLedgerEntryType | ''; label: string }[] = [
  { value: '', label: 'All Entries' },
  { value: 'PURCHASE', label: 'Purchases' },
  { value: 'PAYMENT', label: 'Payments' },
  { value: 'PURCHASE_RETURN', label: 'Returns' },
];

// ── Address Card ───────────────────────────────────────────────

function AddressCard({
  address,
}: {
  address: {
    addressLine1: string;
    city?: string | null;
    country?: string | null;
    label: string;
    isDefault: boolean;
  };
}) {
  return (
    <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-foreground">{address.label}</span>
        {address.isDefault && (
          <Badge variant="outline-success" className="text-[10px] px-1.5 py-0">
            Default
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{address.addressLine1}</p>
      {(address.city || address.country) && (
        <p className="text-xs text-muted-foreground">
          {[address.city, address.country].filter(Boolean).join(', ')}
        </p>
      )}
    </div>
  );
}

// ── Add Address Form ───────────────────────────────────────────

function AddAddressForm({ supplierId, onClose }: { supplierId: string; onClose: () => void }) {
  const [label, setLabel] = React.useState('');
  const [line1, setLine1] = React.useState('');
  const [city, setCity] = React.useState('');
  const [country, setCountry] = React.useState('');
  const addAddress = useAddSupplierAddress(supplierId);

  const inputClass =
    'w-full h-8 rounded-md px-2.5 bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary transition-all';

  return (
    <div className="space-y-2.5 p-3 rounded-xl border border-border bg-background mt-2">
      <p className="text-xs font-semibold text-foreground">Add Address</p>
      <div className="grid grid-cols-2 gap-2">
        <input
          placeholder="Label (e.g. HQ)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="Street Address *"
          value={line1}
          onChange={(e) => setLine1(e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          disabled={!label || !line1 || addAddress.isPending}
          onClick={() =>
            addAddress
              .mutateAsync({ label, addressLine1: line1, city, country, isDefault: false })
              .then(onClose)
          }
        >
          {addAddress.isPending ? 'Saving…' : 'Save Address'}
        </Button>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────

export default function SupplierProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params['id'] as string;

  const [activeTab, setActiveTab] = React.useState<Tab>('overview');
  const [showAddAddress, setShowAddAddress] = React.useState(false);
  const [ledgerFilter, setLedgerFilter] = React.useState<SupplierLedgerEntryType | ''>('');
  const [ledgerPage, setLedgerPage] = React.useState(1);
  const [paymentPage, setPaymentPage] = React.useState(1);

  const { data: supplier, isLoading, error } = useSupplier(id);
  const { data: balance } = useSupplierBalance(id);
  const { data: addresses } = useSupplierAddresses(id);
  const { data: ledgerData, isLoading: isLedgerLoading } = useSupplierLedger(id, {
    page: ledgerPage,
    limit: 20,
    entryType: ledgerFilter || undefined,
  });
  const { data: paymentsData, isLoading: isPaymentsLoading } = useSupplierPayments({
    supplierId: id,
    page: paymentPage,
    limit: 20,
  });

  const deleteSupplier = useDeleteSupplier();
  const archiveSupplier = useArchiveSupplier();
  const restoreSupplier = useRestoreSupplier();

  if (isLoading)
    return (
      <PageContainer>
        <SupplierProfileSkeleton />
      </PageContainer>
    );

  if (error || !supplier) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <p className="text-sm font-medium text-destructive mb-2">Supplier not found</p>
          <Button variant="outline" size="sm" onClick={() => router.push('/suppliers')}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Suppliers
          </Button>
        </div>
      </PageContainer>
    );
  }

  const handleDelete = async () => {
    if (!confirm('Permanently delete this supplier? This cannot be undone.')) return;
    await deleteSupplier.mutateAsync(id);
    toast.success('Supplier deleted');
    router.push('/suppliers');
  };

  const handleArchive = async () => {
    await archiveSupplier.mutateAsync(id);
  };

  const handleRestore = async () => {
    await restoreSupplier.mutateAsync(id);
  };

  const memberSince = (() => {
    try {
      const d = parseISO(supplier.createdAt);
      return isValid(d) ? format(d, 'MMM yyyy') : '—';
    } catch {
      return '—';
    }
  })();

  return (
    <PageContainer>
      {/* Back nav */}
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
        <Link href="/suppliers">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Suppliers
        </Link>
      </Button>

      {/* ── Header Card ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start gap-5 p-6 rounded-2xl border border-border bg-cardard mb-5">
        <SupplierAvatar supplier={supplier} size="xl" className="flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start gap-3 mb-2">
            <div>
              <h1 className="text-xl font-bold text-foreground">{supplier.companyName}</h1>
              {supplier.contactPerson && (
                <p className="text-sm text-muted-foreground mt-0.5">{supplier.contactPerson}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1.5 font-mono bg-muted px-2 py-0.5 rounded">
              <Hash className="w-3 h-3" />
              {supplier.supplierCode}
            </span>
            {supplier.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                {supplier.phone}
              </span>
            )}
            {supplier.email && (
              <a
                href={`mailto:${supplier.email}`}
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                {supplier.email}
              </a>
            )}
            {supplier.website && (
              <a
                href={supplier.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                {supplier.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SupplierStatusBadge status={supplier.status} />
            <SupplierDueBadge balance={supplier.currentBalance} />
            <span className="text-[11px] text-muted-foreground">Supplier since {memberSince}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {supplier.status === 'ARCHIVED' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestore}
              disabled={restoreSupplier.isPending}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restore
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleArchive}
              disabled={archiveSupplier.isPending}
            >
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/suppliers/${id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={handleDelete}
            disabled={deleteSupplier.isPending}
            aria-label="Delete supplier"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ── Summary Cards ─────────────────────────────── */}
      <SupplierSummaryCard
        balance={balance?.currentBalance ?? supplier.currentBalance}
        creditLimit={balance?.creditLimit ?? supplier.creditLimit}
        className="mb-5"
      />

      {/* ── Tabs ──────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit mb-5 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ───────────────────────────────── */}

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Business Info */}
          <div className="lg:col-span-2 space-y-5">
            <section className="rounded-xl border border-border bg-cardard p-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                Business Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Company Name', value: supplier.companyName },
                  { label: 'Contact Person', value: supplier.contactPerson || '—' },
                  { label: 'Tax / VAT Number', value: supplier.taxNumber || '—' },
                  {
                    label: 'Website',
                    value: supplier.website ? (
                      <a
                        href={supplier.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {supplier.website}
                      </a>
                    ) : (
                      '—'
                    ),
                  },
                  { label: 'Supplier Code', value: `#${supplier.supplierCode}` },
                  { label: 'Member Since', value: formatDate(supplier.createdAt) },
                ].map((row, i) => (
                  <div key={i} className="space-y-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {row.label}
                    </p>
                    <div className="text-sm text-foreground">{row.value}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Account Details */}
            <section className="rounded-xl border border-border bg-cardard p-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                Account Details
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  {
                    label: 'Opening Balance',
                    value: formatCurrency(parseFloat(supplier.openingBalance)),
                  },
                  {
                    label: 'Current Balance',
                    value: formatCurrency(parseFloat(supplier.currentBalance)),
                    className:
                      parseFloat(supplier.currentBalance) > 0 ? 'text-destructive' : 'text-success',
                  },
                  {
                    label: 'Credit Limit',
                    value: formatCurrency(parseFloat(supplier.creditLimit)),
                  },
                ].map((row, i) => (
                  <div key={i} className="space-y-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {row.label}
                    </p>
                    <p className={cn('text-sm font-semibold', row.className ?? 'text-foreground')}>
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Contact */}
            <section className="rounded-xl border border-border bg-cardard p-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                Contact
              </h2>
              <div className="space-y-3">
                {[
                  { icon: Phone, label: 'Phone', value: supplier.phone },
                  { icon: Phone, label: 'Alt. Phone', value: supplier.alternativePhone },
                  { icon: Mail, label: 'Email', value: supplier.email },
                  { icon: Globe, label: 'Website', value: supplier.website },
                ].map(({ icon: Icon, label, value }) =>
                  value ? (
                    <div key={label} className="flex items-start gap-2.5">
                      <Icon className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">{label}</p>
                        <p className="text-sm text-foreground">{value}</p>
                      </div>
                    </div>
                  ) : null,
                )}
              </div>
            </section>

            {/* Addresses */}
            <section className="rounded-xl border border-border bg-cardard p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Addresses
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setShowAddAddress((s) => !s)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {(addresses ?? supplier.addresses ?? []).map((addr) => (
                  <AddressCard key={addr.id} address={addr} />
                ))}
                {(addresses ?? supplier.addresses ?? []).length === 0 && (
                  <p className="text-xs text-muted-foreground">No addresses added yet.</p>
                )}
              </div>
              {showAddAddress && (
                <AddAddressForm supplierId={id} onClose={() => setShowAddAddress(false)} />
              )}
            </section>
          </div>
        </div>
      )}

      {/* LEDGER */}
      {activeTab === 'ledger' && (
        <div className="rounded-xl border border-border bg-cardard overflow-hidden">
          {/* Ledger header */}
          <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground mr-auto">Ledger Entries</h2>
            <select
              value={ledgerFilter}
              onChange={(e) => {
                setLedgerFilter(e.target.value as SupplierLedgerEntryType | '');
                setLedgerPage(1);
              }}
              className="h-8 px-2.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              {LEDGER_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <SupplierLedgerTable entries={ledgerData?.data ?? []} isLoading={isLedgerLoading} />
          {/* Ledger pagination */}
          {ledgerData && ledgerData.meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border">
              <span className="text-xs text-muted-foreground">
                Page {ledgerData.meta.page} of {ledgerData.meta.totalPages}
              </span>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLedgerPage((p) => p - 1)}
                  disabled={!ledgerData.meta.hasPrevPage}
                >
                  ‹
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLedgerPage((p) => p + 1)}
                  disabled={!ledgerData.meta.hasNextPage}
                >
                  ›
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PURCHASES */}
      {activeTab === 'purchases' && <PurchaseHistoryPlaceholder />}

      {/* PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="rounded-xl border border-border bg-cardard overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Payment History</h2>
          </div>
          <PaymentHistoryTable payments={paymentsData?.data ?? []} isLoading={isPaymentsLoading} />
          {paymentsData && paymentsData.meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border">
              <span className="text-xs text-muted-foreground">
                Page {paymentsData.meta.page} of {paymentsData.meta.totalPages}
              </span>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaymentPage((p) => p - 1)}
                  disabled={!paymentsData.meta.hasPrevPage}
                >
                  ‹
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaymentPage((p) => p + 1)}
                  disabled={!paymentsData.meta.hasNextPage}
                >
                  ›
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* NOTES */}
      {activeTab === 'notes' && (
        <div className="rounded-xl border border-border bg-cardard p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Internal Notes</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/suppliers/${id}/edit`}>
                <Edit className="w-3.5 h-3.5 mr-1.5" />
                Edit Notes
              </Link>
            </Button>
          </div>
          {supplier.notes ? (
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {supplier.notes}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No notes added yet.</p>
          )}
        </div>
      )}
    </PageContainer>
  );
}

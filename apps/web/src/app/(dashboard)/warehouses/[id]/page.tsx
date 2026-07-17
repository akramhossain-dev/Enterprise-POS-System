'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Edit,
  Mail,
  Phone,
  Calendar,
  Building,
  User as UserIcon,
  Layers,
  Clock,
  FileText,
  AlertCircle,
  Trash2,
  Box,
  MapPin,
  Map,
  Plus,
  QrCode,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { useWarehouse, useDeleteWarehouse } from '@/hooks/use-warehouse';
import {
  useStorageLocations,
  useCreateStorageLocation,
  useUpdateStorageLocation,
  useDeleteStorageLocation,
} from '@/hooks/use-storage-location';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { CapacityCard } from '@/components/warehouse/capacity-card';
import { StorageLocationCard } from '@/components/warehouse/storage-location-card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';
import type { StorageLocation } from '@/types/warehouse';

export default function WarehouseDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  // Queries
  const { data: warehouse, isLoading: isLoadingWarehouse, refetch: refetchWh } = useWarehouse(id);
  const {
    data: locations,
    isLoading: isLoadingLocations,
    refetch: refetchLocations,
  } = useStorageLocations(id);

  // Mutations
  const createLocMutation = useCreateStorageLocation();
  const updateLocMutation = useUpdateStorageLocation();
  const deleteLocMutation = useDeleteStorageLocation();
  const deleteWhMutation = useDeleteWarehouse();

  // Tab State
  const [activeTab, setActiveTab] = React.useState<
    'overview' | 'locations' | 'inventory' | 'activity'
  >('overview');

  // Location Modal Dialog State
  const [isLocOpen, setIsLocOpen] = React.useState(false);
  const [editingLoc, setEditingLoc] = React.useState<StorageLocation | null>(null);

  // Form States
  const [zone, setZone] = React.useState('');
  const [rack, setRack] = React.useState('');
  const [shelf, setShelf] = React.useState('');
  const [bin, setBin] = React.useState('');
  const [barcode, setBarcode] = React.useState('');
  const [status, setStatus] = React.useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Load editing location state
  React.useEffect(() => {
    if (editingLoc) {
      setZone(editingLoc.zone);
      setRack(editingLoc.rack);
      setShelf(editingLoc.shelf);
      setBin(editingLoc.bin);
      setBarcode(editingLoc.barcode);
      setStatus(editingLoc.status);
    } else {
      setZone('');
      setRack('');
      setShelf('');
      setBin('');
      setBarcode('');
      setStatus('ACTIVE');
    }
  }, [editingLoc, isLocOpen]);

  if (isLoadingWarehouse) {
    return (
      <PageContainer>
        <div className="flex h-64 items-center justify-center text-xs text-muted-foreground animate-pulse">
          Loading warehouse ledger details...
        </div>
      </PageContainer>
    );
  }

  if (!warehouse) {
    return (
      <PageContainer>
        <div className="text-center py-20 bg-card rounded-2xl border border-border">
          <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground" />
          <h2 className="font-semibold text-foreground text-sm mt-3">
            Warehouse Profile Not Found
          </h2>
          <Link href="/warehouses" className="mt-4 inline-block">
            <Button size="sm">Back to Directory</Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const cap = warehouse.metadata?.capacity ?? 5000;
  const util = warehouse.metadata?.utilization ?? 0;
  const storageType = warehouse.metadata?.storageType || 'DRY';

  const handleDeleteWh = () => {
    if (!window.confirm('Are you sure you want to archive this warehouse facility?')) return;
    deleteWhMutation.mutate(warehouse.id, {
      onSuccess: () => {
        router.push('/warehouses');
      },
    });
  };

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zone || !rack || !shelf || !bin) {
      toast.error('All location levels are required');
      return;
    }

    const locPayload = {
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      zone,
      rack,
      shelf,
      bin,
      barcode:
        barcode ||
        `BAR-${zone.replace(/\s+/g, '')}-${rack.replace(/\s+/g, '')}-${bin.replace(/\s+/g, '')}`,
      status,
    };

    if (editingLoc) {
      updateLocMutation.mutate(
        { id: editingLoc.id, payload: locPayload },
        {
          onSuccess: () => {
            setIsLocOpen(false);
            setEditingLoc(null);
            void refetchLocations();
          },
        },
      );
    } else {
      createLocMutation.mutate(locPayload, {
        onSuccess: () => {
          setIsLocOpen(false);
          void refetchLocations();
        },
      });
    }
  };

  const handleEditLoc = (loc: StorageLocation) => {
    setEditingLoc(loc);
    setIsLocOpen(true);
  };

  const handleDeleteLoc = (locId: string) => {
    if (!window.confirm('Delete this storage location bin?')) return;
    deleteLocMutation.mutate(locId, {
      onSuccess: () => void refetchLocations(),
    });
  };

  // Mock Inventory List
  const mockInventory = [
    { code: 'PROD-IP15', name: 'iPhone 15 Pro Max (256GB)', qty: 142, cost: 950, price: 1199 },
    { code: 'PROD-SG24', name: 'Samsung Galaxy S24 Ultra', qty: 85, cost: 900, price: 1299 },
    { code: 'PROD-MBA3', name: 'MacBook Air M3 (13-inch)', qty: 38, cost: 850, price: 1099 },
    { code: 'PROD-APP2', name: 'AirPods Pro 2nd Gen', qty: 210, cost: 180, price: 249 },
  ];

  return (
    <PageContainer>
      <PageHeader
        title={`${warehouse.name} Details`}
        description={`Depot Facility Profile [${warehouse.code}] & Storage Configurations.`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/warehouses">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <Link href={`/warehouses/${warehouse.id}/edit`}>
              <Button size="sm" className="gap-1.5">
                <Edit className="w-4 h-4" />
                Edit Depot
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteWh}
              className="text-rose-500 hover:bg-rose-500/10 border-rose-500/20"
            >
              <Trash2 className="w-4 h-4" />
              Archive Depot
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        {/* Left column info overview card */}
        <div className="lg:col-span-1 space-y-6">
          <CapacityCard capacity={cap} utilization={util} storageType={storageType} />

          {/* Quick info specs list */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-bold text-foreground text-sm border-b border-border/60 pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Location Details
            </h3>

            <div className="text-xs space-y-3.5 text-muted-foreground">
              {warehouse.address && (
                <div>
                  <span className="block font-medium text-muted-foreground/80">Street Address</span>
                  <span className="block mt-1 font-semibold text-foreground">
                    {warehouse.address}
                  </span>
                </div>
              )}
              {(warehouse.city || warehouse.country) && (
                <div>
                  <span className="block font-medium text-muted-foreground/80">Geography</span>
                  <span className="block mt-1 font-semibold text-foreground">
                    {warehouse.city || 'N/A'}, {warehouse.country || 'N/A'}
                  </span>
                </div>
              )}
              {warehouse.branch?.name && (
                <div>
                  <span className="block font-medium text-muted-foreground/80">
                    Corporate Branch Office
                  </span>
                  <span className="block mt-1 font-semibold text-foreground">
                    {warehouse.branch.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Manager Info Details */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-bold text-foreground text-sm border-b border-border/60 pb-2 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-primary" />
              Manager Contacts
            </h3>

            <div className="text-xs space-y-3.5 text-muted-foreground">
              <div>
                <span className="block font-medium text-muted-foreground/80">Manager Name</span>
                <span className="block mt-1 font-semibold text-foreground">
                  {warehouse.managerName || 'Unassigned'}
                </span>
              </div>
              {warehouse.phone && (
                <div>
                  <span className="block font-medium text-muted-foreground/80">Phone Number</span>
                  <span className="block mt-1 font-semibold text-foreground">
                    {warehouse.phone}
                  </span>
                </div>
              )}
              {warehouse.email && (
                <div>
                  <span className="block font-medium text-muted-foreground/80">Email Address</span>
                  <span className="block mt-1 font-semibold text-foreground">
                    {warehouse.email}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side tab view */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Navigation header */}
          <div className="flex border-b border-border bg-card rounded-2xl p-1.5 gap-1 shadow-sm">
            {(['overview', 'locations', 'inventory', 'activity'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all select-none',
                  activeTab === tab
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                )}
              >
                {tab === 'overview' && 'Depot Overview'}
                {tab === 'locations' && 'Storage Bins'}
                {tab === 'inventory' && 'Inventory Summary'}
                {tab === 'activity' && 'Recent logs'}
              </button>
            ))}
          </div>

          {/* Tab Panel contents */}
          <div className="rounded-2xl border border-border bg-card p-6 min-h-[350px]">
            {/* Overview tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground text-sm border-b border-border/50 pb-2">
                    Depot Details
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed bg-muted/20 border border-border/30 p-3.5 rounded-xl italic">
                    {warehouse.metadata?.description ||
                      'No descriptive information configured for this warehouse facility.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                  <div>
                    <span className="text-muted-foreground block font-medium">
                      Default Facility
                    </span>
                    <span
                      className={cn(
                        'block mt-1 font-semibold',
                        warehouse.isDefault ? 'text-indigo-500' : 'text-foreground',
                      )}
                    >
                      {warehouse.isDefault ? 'Yes (Primary Depot)' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-medium">Registered Date</span>
                    <span className="text-foreground block mt-1 font-semibold">
                      {new Date(warehouse.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-medium">Last Audited</span>
                    <span className="text-foreground block mt-1 font-semibold">
                      {new Date(warehouse.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-medium">
                      Storage Environment
                    </span>
                    <span className="text-foreground block mt-1 font-semibold uppercase">
                      {storageType}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Storage Locations tab */}
            {activeTab === 'locations' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <h3 className="font-semibold text-foreground text-sm">
                    Granular Storage Bins ({locations?.length || 0})
                  </h3>
                  <Button onClick={() => setIsLocOpen(true)} className="gap-1" size="xs">
                    <Plus className="w-3.5 h-3.5" />
                    Configure Bin
                  </Button>
                </div>

                {isLoadingLocations ? (
                  <div className="text-xs text-muted-foreground">
                    Loading storage location rack matrices...
                  </div>
                ) : !locations || locations.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                    No storage bins configured. Create one to organize Zone / Racks.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {locations.map((loc) => (
                      <StorageLocationCard
                        key={loc.id}
                        location={loc}
                        onEdit={handleEditLoc}
                        onDelete={handleDeleteLoc}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Inventory Summary tab */}
            {activeTab === 'inventory' && (
              <div className="space-y-5">
                <h3 className="font-semibold text-foreground text-sm border-b border-border/60 pb-2">
                  Inventory Stock Summary (Foundation)
                </h3>

                <div className="overflow-x-auto border border-border rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                        <th className="px-4 py-2.5">SKU Code</th>
                        <th className="px-4 py-2.5">Product Name</th>
                        <th className="px-4 py-2.5">Stock Qty</th>
                        <th className="px-4 py-2.5 text-right">Avg Unit Cost</th>
                        <th className="px-4 py-2.5 text-right">Retail Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockInventory.map((item) => (
                        <tr key={item.code} className="border-b border-border/50 hover:bg-muted/10">
                          <td className="px-4 py-2.5 font-mono font-bold text-[10px] text-muted-foreground">
                            {item.code}
                          </td>
                          <td className="px-4 py-2.5 font-semibold text-foreground">{item.name}</td>
                          <td className="px-4 py-2.5 font-mono text-foreground font-bold">
                            {item.qty} units
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono">
                            ${item.cost.toFixed(2)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono font-semibold text-emerald-500">
                            ${item.price.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Activity timeline */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <h3 className="font-semibold text-foreground text-sm border-b border-border/60 pb-3">
                  Recent Depot Logs
                </h3>

                <div className="relative border-l border-border pl-6 ml-3 space-y-6 text-xs text-muted-foreground">
                  {[
                    {
                      title: 'Depot registered in company directory',
                      date: '3 days ago',
                      detail: 'Jon Snow initialized central NY depot settings.',
                    },
                    {
                      title: 'Default status applied',
                      date: '3 days ago',
                      dateFull: '',
                      detail: 'System assigned WH-NY-01 as the default inbound facility.',
                    },
                    {
                      title: 'Zones configured',
                      date: '2 days ago',
                      detail: 'Jon Snow added 3 storage bins in Zone A & Zone B.',
                    },
                  ].map((act, idx) => (
                    <div key={idx} className="relative text-left">
                      <span className="absolute -left-[31px] top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-card border border-border">
                        <Clock className="w-2.5 h-2.5 text-primary" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{act.title}</span>
                          <span className="text-[10px] text-muted-foreground/60">{act.date}</span>
                        </div>
                        <p className="mt-1 text-muted-foreground">{act.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Storage Location Dialog Modal */}
      <Dialog open={isLocOpen} onOpenChange={setIsLocOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleLocationSubmit} className="space-y-4 text-left">
            <DialogHeader>
              <DialogTitle>
                {editingLoc ? 'Modify Storage Bin' : 'Configure Storage Bin'}
              </DialogTitle>
              <DialogDescription>
                Define zone mapping parameters to organize inventory placements.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <Input
                label="Zone Name *"
                placeholder="e.g. Zone A (Electronics)"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                required
              />
              <Input
                label="Rack Level *"
                placeholder="e.g. Rack 02"
                value={rack}
                onChange={(e) => setRack(e.target.value)}
                required
              />
              <Input
                label="Shelf Level *"
                placeholder="e.g. Shelf 03"
                value={shelf}
                onChange={(e) => setShelf(e.target.value)}
                required
              />
              <Input
                label="Bin Location Identifier *"
                placeholder="e.g. Bin A-15"
                value={bin}
                onChange={(e) => setBin(e.target.value)}
                required
              />
              <Input
                label="Location Barcode Identifier (Optional)"
                placeholder="e.g. LOC-ZA-R02-S03-B15"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
              />

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsLocOpen(false)}>
                Discard
              </Button>
              <Button
                type="submit"
                disabled={createLocMutation.isPending || updateLocMutation.isPending}
                className="gap-1"
              >
                {(createLocMutation.isPending || updateLocMutation.isPending) && (
                  <Loader2 className="w-3 h-3 animate-spin" />
                )}
                Save Location Bin
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

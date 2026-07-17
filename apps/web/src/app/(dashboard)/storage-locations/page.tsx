'use client';

import * as React from 'react';
import {
  Plus,
  RefreshCw,
  Search,
  LayoutGrid,
  Loader2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  useStorageLocations,
  useCreateStorageLocation,
  useUpdateStorageLocation,
  useDeleteStorageLocation,
} from '@/hooks/use-storage-location';
import { useWarehouses } from '@/hooks/use-warehouse';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
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

export default function StorageLocationsPage() {
  const [selectedWarehouseId, setSelectedWarehouseId] = React.useState<string>('');
  const [q, setQ] = React.useState('');

  // Queries
  const { data: warehousesResponse } = useWarehouses();
  const warehouses = warehousesResponse?.data || [];

  const {
    data: locations,
    isLoading: isLoadingLocations,
    refetch,
  } = useStorageLocations(selectedWarehouseId || undefined);

  // Mutations
  const createLocMutation = useCreateStorageLocation();
  const updateLocMutation = useUpdateStorageLocation();
  const deleteLocMutation = useDeleteStorageLocation();

  // Modal Dialog states
  const [isLocOpen, setIsLocOpen] = React.useState(false);
  const [editingLoc, setEditingLoc] = React.useState<StorageLocation | null>(null);

  // Form State
  const [warehouseId, setWarehouseId] = React.useState('');
  const [zone, setZone] = React.useState('');
  const [rack, setRack] = React.useState('');
  const [shelf, setShelf] = React.useState('');
  const [bin, setBin] = React.useState('');
  const [barcode, setBarcode] = React.useState('');
  const [status, setStatus] = React.useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Sync form values on modal edit trigger
  React.useEffect(() => {
    if (editingLoc) {
      setWarehouseId(editingLoc.warehouseId);
      setZone(editingLoc.zone);
      setRack(editingLoc.rack);
      setShelf(editingLoc.shelf);
      setBin(editingLoc.bin);
      setBarcode(editingLoc.barcode);
      setStatus(editingLoc.status);
    } else {
      setWarehouseId(selectedWarehouseId || (warehouses[0]?.id ?? ''));
      setZone('');
      setRack('');
      setShelf('');
      setBin('');
      setBarcode('');
      setStatus('ACTIVE');
    }
  }, [editingLoc, isLocOpen, warehouses, selectedWarehouseId]);

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseId || !zone || !rack || !shelf || !bin) {
      toast.error('Warehouse selection and all location levels are required');
      return;
    }

    const linkedWh = warehouses.find((w) => w.id === warehouseId);
    const warehouseName = linkedWh?.name || 'Unknown Warehouse';

    const locPayload = {
      warehouseId,
      warehouseName,
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
            void refetch();
          },
        },
      );
    } else {
      createLocMutation.mutate(locPayload, {
        onSuccess: () => {
          setIsLocOpen(false);
          void refetch();
        },
      });
    }
  };

  const handleEditLoc = (loc: StorageLocation) => {
    setEditingLoc(loc);
    setIsLocOpen(true);
  };

  const handleDeleteLoc = (locId: string) => {
    if (!window.confirm('Are you sure you want to delete this storage bin mapping?')) return;
    deleteLocMutation.mutate(locId, {
      onSuccess: () => void refetch(),
    });
  };

  // Filter locations by text search locally
  const filteredLocations = (locations || []).filter((l) => {
    if (!q) return true;
    const term = q.toLowerCase();
    return (
      l.zone.toLowerCase().includes(term) ||
      l.rack.toLowerCase().includes(term) ||
      l.bin.toLowerCase().includes(term) ||
      l.barcode.toLowerCase().includes(term) ||
      (l.warehouseName && l.warehouseName.toLowerCase().includes(term))
    );
  });

  return (
    <PageContainer>
      <PageHeader
        title="Storage Location Ledger"
        description="Configure warehouses bin mapping zones, identify shelf locations, and assign barcodes."
        actions={
          <Button onClick={() => setIsLocOpen(true)} className="gap-1.5" size="sm">
            <Plus className="w-4 h-4" />
            Add Storage Bin
          </Button>
        }
      />

      {/* Toolbar filters */}
      <div className="flex flex-col md:flex-row gap-3 bg-card border border-border rounded-2xl p-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search zones, bins, shelves, barcodes..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-xl bg-background text-sm focus-visible:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Warehouse Filter */}
        <div className="w-full md:w-64">
          <select
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(e.target.value)}
            className="w-full rounded-xl border border-border bg-background p-2 text-xs focus:ring-primary focus:border-primary"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                [{w.code}] {w.name}
              </option>
            ))}
          </select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void refetch();
          }}
          className="p-2"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Locations layout grid */}
      {isLoadingLocations ? (
        <div className="flex h-40 items-center justify-center text-xs text-muted-foreground animate-pulse">
          Loading layout bin indices...
        </div>
      ) : filteredLocations.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground" />
          <h3 className="font-semibold text-foreground text-sm mt-3">No Storage Bins Configured</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Select a warehouse or add a new bin to configure zones.
          </p>
          <Button onClick={() => setIsLocOpen(true)} className="mt-4 gap-1.5" size="sm">
            <Plus className="w-4 h-4" />
            Add Storage Bin
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredLocations.map((loc) => (
            <StorageLocationCard
              key={loc.id}
              location={loc}
              onEdit={handleEditLoc}
              onDelete={handleDeleteLoc}
            />
          ))}
        </div>
      )}

      {/* Storage Location Dialog Modal */}
      <Dialog open={isLocOpen} onOpenChange={setIsLocOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleLocationSubmit} className="space-y-4 text-left">
            <DialogHeader>
              <DialogTitle>
                {editingLoc ? 'Modify Storage Bin' : 'Configure Storage Bin'}
              </DialogTitle>
              <DialogDescription>
                Define operational zoning details to optimize storage layout.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Target Warehouse facility *
                </label>
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select Warehouse Link...</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

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

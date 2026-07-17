import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { StorageLocation } from '@/types/warehouse';

const STORAGE_KEY = 'pos_storage_locations';

const DEFAULT_LOCATIONS: StorageLocation[] = [
  {
    id: 'loc-1',
    warehouseId: 'wh-1',
    warehouseName: 'Central Manhattan Depot',
    zone: 'Zone A',
    rack: 'Rack 01',
    shelf: 'Shelf 03',
    bin: 'Bin A-10',
    barcode: 'LOC-ZA-R01-S03-B10',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'loc-2',
    warehouseId: 'wh-1',
    warehouseName: 'Central Manhattan Depot',
    zone: 'Zone A',
    rack: 'Rack 02',
    shelf: 'Shelf 01',
    bin: 'Bin A-15',
    barcode: 'LOC-ZA-R02-S01-B15',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'loc-3',
    warehouseId: 'wh-1',
    warehouseName: 'Central Manhattan Depot',
    zone: 'Zone B',
    rack: 'Rack 05',
    shelf: 'Shelf 04',
    bin: 'Bin B-02',
    barcode: 'LOC-ZB-R05-S04-B02',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'loc-4',
    warehouseId: 'wh-2',
    warehouseName: 'Chicago Cold Store',
    zone: 'Cold Zone C',
    rack: 'Rack 01',
    shelf: 'Shelf 02',
    bin: 'Bin C-04',
    barcode: 'LOC-ZC-R01-S02-B04',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'loc-5',
    warehouseId: 'wh-3',
    warehouseName: 'Atlanta Transit Hub',
    zone: 'Dock Zone D',
    rack: 'Rack 03',
    shelf: 'Shelf 01',
    bin: 'Bin D-01',
    barcode: 'LOC-ZD-R03-S01-B01',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class StorageLocationService extends ApiClient {
  private getStorageLocations(): StorageLocation[] {
    if (typeof window === 'undefined') return DEFAULT_LOCATIONS;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LOCATIONS));
      return DEFAULT_LOCATIONS;
    }
    return JSON.parse(stored) as StorageLocation[];
  }

  private saveLocations(locs: StorageLocation[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locs));
  }

  async listLocations(warehouseId?: string): Promise<StorageLocation[]> {
    try {
      const response = await this.get<StorageLocation[]>('/storage-locations', { warehouseId });
      return response.data;
    } catch {
      const all = this.getStorageLocations();
      if (warehouseId) {
        return all.filter((l) => l.warehouseId === warehouseId);
      }
      return all;
    }
  }

  async createLocation(
    payload: Omit<StorageLocation, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<StorageLocation> {
    try {
      const companyId = (payload as any).companyId || 'company-id-placeholder';
      const response = await this.post<StorageLocation>('/storage-locations', {
        ...payload,
        companyId,
      });
      return response.data;
    } catch {
      const all = this.getStorageLocations();
      const newLoc: StorageLocation = {
        ...payload,
        id: `loc-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      all.push(newLoc);
      this.saveLocations(all);
      return newLoc;
    }
  }

  async updateLocation(
    id: string,
    payload: Partial<Omit<StorageLocation, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<StorageLocation> {
    try {
      const response = await this.put<StorageLocation>(`/storage-locations/${id}`, payload);
      return response.data;
    } catch {
      const all = this.getStorageLocations();
      const index = all.findIndex((l) => l.id === id);
      if (index === -1) throw new Error('Storage location not found');

      const updated: StorageLocation = {
        ...all[index]!,
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      all[index] = updated;
      this.saveLocations(all);
      return updated;
    }
  }

  async deleteLocation(id: string): Promise<void> {
    try {
      await this.delete<void>(`/storage-locations/${id}`);
    } catch {
      const all = this.getStorageLocations();
      const updated = all.filter((l) => l.id !== id);
      this.saveLocations(updated);
    }
  }
}

export const storageLocationService = new StorageLocationService();

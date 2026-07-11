import { Status } from '@prisma/client';

export interface BrandResponse {
  id: string;
  companyId: string;
  name: string;
  description: string | null;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandListResult {
  brands: BrandResponse[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

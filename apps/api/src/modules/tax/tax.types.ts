import { Decimal } from '@prisma/client/runtime/library';
import { Status } from '@prisma/client';

export interface TaxResponse {
  id: string;
  companyId: string;
  name: string;
  percentage: Decimal;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaxListResult {
  taxes: TaxResponse[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

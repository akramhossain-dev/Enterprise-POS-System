import { Status } from '@prisma/client';

export interface UnitResponse {
  id: string;
  companyId: string;
  name: string;
  shortName: string;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnitListResult {
  units: UnitResponse[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

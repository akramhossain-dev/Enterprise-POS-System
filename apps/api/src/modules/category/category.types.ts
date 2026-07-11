import { Status } from '@prisma/client';

// ─────────────────────────────────────────────
// Category Domain Types
// ─────────────────────────────────────────────

export interface CategoryResponse {
  id: string;
  companyId: string;
  name: string;
  description: string | null;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryListResult {
  categories: CategoryResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

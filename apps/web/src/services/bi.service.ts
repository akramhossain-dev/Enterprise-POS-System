import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { KpiWidget, ForecastPoint, HeatmapPoint, DrillDownNode } from '@/types/bi';

export interface BiFilterParams {
  [key: string]: string | number | boolean | undefined;
  startDate?: string;
  endDate?: string;
  branchId?: string;
  warehouseId?: string;
  categoryId?: string;
}

class BiService extends ApiClient {
  async getKpisList(): Promise<KpiWidget[]> {
    const response = await this.get<KpiWidget[]>(apiConfig.endpoints.bi.widgets);
    return response.data;
  }

  async getForecastData(
    type: 'sales' | 'purchase' | 'inventory' | 'demand',
  ): Promise<ForecastPoint[]> {
    const response = await this.get<ForecastPoint[]>(`${apiConfig.endpoints.bi.forecast}/${type}`);
    return response.data;
  }

  async getHeatmapData(type: 'sales' | 'inventory' | 'branch'): Promise<HeatmapPoint[]> {
    const response = await this.get<HeatmapPoint[]>(
      `${apiConfig.endpoints.bi.analytics}/heatmap/${type}`,
    );
    return response.data;
  }

  async getDrilldownData(level: number, parentId?: string): Promise<DrillDownNode[]> {
    const response = await this.get<DrillDownNode[]>(
      `${apiConfig.endpoints.bi.analytics}/drilldown`,
      { level, parentId },
    );
    return response.data;
  }
}

export const biService = new BiService();

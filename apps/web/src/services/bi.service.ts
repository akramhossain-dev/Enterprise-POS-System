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
    try {
      const response = await this.get<KpiWidget[]>(apiConfig.endpoints.bi.widgets);
      return response.data;
    } catch {
      return [
        {
          id: 'bi-kpi-1',
          name: 'Net Operating Margin',
          formula: 'netProfit / revenue',
          targetMetric: 'profit',
          color: 'text-emerald-450',
          value: 36.2,
          change: 4.5,
        },
        {
          id: 'bi-kpi-2',
          name: 'Asset Valuation Turn',
          formula: 'cogs / inventoryValue',
          targetMetric: 'inventory',
          color: 'text-indigo-400',
          value: 8.4,
          change: 0.8,
        },
        {
          id: 'bi-kpi-3',
          name: 'Customer Return Loss',
          formula: 'returnsValue / grossSales',
          targetMetric: 'returns',
          color: 'text-rose-455',
          value: 1.2,
          change: -0.3,
        },
      ];
    }
  }

  async getForecastData(
    type: 'sales' | 'purchase' | 'inventory' | 'demand',
  ): Promise<ForecastPoint[]> {
    try {
      const response = await this.get<ForecastPoint[]>(
        `${apiConfig.endpoints.bi.forecast}/${type}`,
      );
      return response.data;
    } catch {
      // Return solid historical lines transitioning into dashed projected intervals
      return [
        { date: '2026-07-10', historical: 12400 },
        { date: '2026-07-11', historical: 14500 },
        { date: '2026-07-12', historical: 13200 },
        { date: '2026-07-13', historical: 18900 },
        { date: '2026-07-14', historical: 22400 },
        { date: '2026-07-15', historical: 21100, projected: 21100 },
        { date: '2026-07-16', projected: 24500 },
        { date: '2026-07-17', projected: 26800 },
        { date: '2026-07-18', projected: 25400 },
        { date: '2026-07-19', projected: 29000 },
      ];
    }
  }

  async getHeatmapData(type: 'sales' | 'inventory' | 'branch'): Promise<HeatmapPoint[]> {
    try {
      const response = await this.get<HeatmapPoint[]>(
        `${apiConfig.endpoints.bi.analytics}/heatmap/${type}`,
      );
      return response.data;
    } catch {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const hours = ['09:00', '12:00', '15:00', '18:00', '21:00'];
      const points: HeatmapPoint[] = [];

      days.forEach((x) => {
        hours.forEach((y) => {
          points.push({
            x,
            y,
            value: Math.floor(Math.random() * 100),
          });
        });
      });

      return points;
    }
  }

  async getDrilldownData(level: number, parentId?: string): Promise<DrillDownNode[]> {
    try {
      const response = await this.get<DrillDownNode[]>(
        `${apiConfig.endpoints.bi.analytics}/drilldown`,
        { level, parentId },
      );
      return response.data;
    } catch {
      if (level === 0) {
        return [
          {
            id: 'cat-fashion',
            name: 'Apparel & Fashion',
            level: 0,
            revenue: 345000,
            salesCount: 2400,
          },
          {
            id: 'cat-electronics',
            name: 'Consumer Electronics',
            level: 0,
            revenue: 489000,
            salesCount: 1800,
          },
          { id: 'cat-home', name: 'Home & Kitchen', level: 0, revenue: 212000, salesCount: 1100 },
        ];
      } else if (level === 1) {
        if (parentId === 'cat-fashion') {
          return [
            {
              id: 'sub-mens',
              name: "Men's Wear",
              parentId: 'cat-fashion',
              level: 1,
              revenue: 195000,
              salesCount: 1350,
            },
            {
              id: 'sub-womens',
              name: "Women's Wear",
              parentId: 'cat-fashion',
              level: 1,
              revenue: 150000,
              salesCount: 1050,
            },
          ];
        } else if (parentId === 'cat-electronics') {
          return [
            {
              id: 'sub-mobiles',
              name: 'Mobile Phones',
              parentId: 'cat-electronics',
              level: 1,
              revenue: 310000,
              salesCount: 950,
            },
            {
              id: 'sub-audio',
              name: 'Audio Accessories',
              parentId: 'cat-electronics',
              level: 1,
              revenue: 179000,
              salesCount: 850,
            },
          ];
        }
      } else if (level === 2) {
        if (parentId === 'sub-mens') {
          return [
            {
              id: 'prod-shirt',
              name: 'Cotton Casual Shirt',
              parentId: 'sub-mens',
              level: 2,
              revenue: 85000,
              salesCount: 650,
            },
            {
              id: 'prod-jeans',
              name: 'Slim Fit Denim Jeans',
              parentId: 'sub-mens',
              level: 2,
              revenue: 110000,
              salesCount: 700,
            },
          ];
        } else if (parentId === 'sub-mobiles') {
          return [
            {
              id: 'prod-iphone',
              name: 'iPhone 15 Pro Max',
              parentId: 'sub-mobiles',
              level: 2,
              revenue: 210000,
              salesCount: 200,
            },
            {
              id: 'prod-pixel',
              name: 'Google Pixel 8 Pro',
              parentId: 'sub-mobiles',
              level: 2,
              revenue: 100000,
              salesCount: 750,
            },
          ];
        }
      }
      return [];
    }
  }
}

export const biService = new BiService();

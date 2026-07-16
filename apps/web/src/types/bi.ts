export interface KpiWidget {
  id: string;
  name: string;
  formula: string; // e.g. "revenue - purchaseCost"
  targetMetric: string;
  color: string;
  value: number;
  change: number;
}

export interface ForecastPoint {
  date: string;
  historical?: number;
  projected?: number;
}

export interface HeatmapPoint {
  x: string; // e.g. "Monday", "Dhaka Central"
  y: string; // e.g. "12:00", "Shoes"
  value: number;
}

export interface DrillDownNode {
  id: string;
  name: string;
  parentId?: string;
  level: number; // 0 = Category, 1 = Subcategory, 2 = Product
  revenue: number;
  salesCount: number;
}

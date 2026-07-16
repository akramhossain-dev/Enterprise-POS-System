'use client';

import { useQuery } from '@tanstack/react-query';
import { biService } from '@/services/bi.service';

export const BI_KPIS_KEY = ['bi-kpis-list'] as const;
export const BI_FORECAST_KEY = ['bi-forecast-data'] as const;
export const BI_HEATMAP_KEY = ['bi-heatmap-data'] as const;
export const BI_DRILLDOWN_KEY = ['bi-drilldown-data'] as const;

export function useKpisListQuery() {
  return useQuery({
    queryKey: BI_KPIS_KEY,
    queryFn: () => biService.getKpisList(),
  });
}

export function useForecastQuery(type: 'sales' | 'purchase' | 'inventory' | 'demand') {
  return useQuery({
    queryKey: [...BI_FORECAST_KEY, type],
    queryFn: () => biService.getForecastData(type),
  });
}

export function useHeatmapQuery(type: 'sales' | 'inventory' | 'branch') {
  return useQuery({
    queryKey: [...BI_HEATMAP_KEY, type],
    queryFn: () => biService.getHeatmapData(type),
  });
}

export function useDrilldownQuery(level: number, parentId?: string) {
  return useQuery({
    queryKey: [...BI_DRILLDOWN_KEY, level, parentId],
    queryFn: () => biService.getDrilldownData(level, parentId),
  });
}

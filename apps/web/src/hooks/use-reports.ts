'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsService, type ReportQueryParams } from '@/services/reports.service';
import type { ScheduledReport } from '@/types/reports';

export const REPORTS_LIST_KEY = ['reports-list'] as const;
export const REPORT_DATA_KEY = ['report-data'] as const;
export const SCHEDULED_REPORTS_KEY = ['scheduled-reports'] as const;
export const EXPORT_LOGS_KEY = ['export-logs'] as const;

export function useReportsListQuery() {
  return useQuery({
    queryKey: REPORTS_LIST_KEY,
    queryFn: () => reportsService.getReportsList(),
  });
}

export function useReportQuery(reportId: string, params?: ReportQueryParams, enabled = true) {
  return useQuery({
    queryKey: [...REPORT_DATA_KEY, reportId, params],
    queryFn: () => reportsService.getReportData(reportId, params),
    enabled: !!reportId && enabled,
  });
}

export function useScheduledReportsQuery() {
  return useQuery({
    queryKey: SCHEDULED_REPORTS_KEY,
    queryFn: () => reportsService.getScheduledReports(),
  });
}

export function useCreateScheduledReportMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ScheduledReport, 'id' | 'lastSent'>) =>
      reportsService.createScheduledReport(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SCHEDULED_REPORTS_KEY });
    },
  });
}

export function useUpdateScheduledReportStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'paused' }) =>
      reportsService.updateScheduledReportStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SCHEDULED_REPORTS_KEY });
    },
  });
}

export function useExportLogsQuery() {
  return useQuery({
    queryKey: EXPORT_LOGS_KEY,
    queryFn: () => reportsService.getExportLogs(),
  });
}

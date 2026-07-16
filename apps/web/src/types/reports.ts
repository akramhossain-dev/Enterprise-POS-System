export interface ReportMetadata {
  id: string;
  name: string;
  category:
    | 'sales'
    | 'purchase'
    | 'inventory'
    | 'customer'
    | 'supplier'
    | 'employee'
    | 'payments'
    | 'tax'
    | 'audit';
  description: string;
  lastRun?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'on-demand';
  isFavorite?: boolean;
}

export interface ReportColumn {
  id: string;
  header: string;
  accessorKey: string;
  visible: boolean;
}

export interface CustomReportConfig {
  id?: string;
  name: string;
  module: string;
  columns: string[];
  filters: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  groupBy?: string;
}

export interface ScheduledReport {
  id: string;
  reportId: string;
  reportName: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  emailList: string[];
  timeOfDay: string; // e.g. "09:00"
  lastSent?: string;
  status: 'active' | 'paused';
}

export interface ReportExecutionLog {
  id: string;
  reportId: string;
  reportName: string;
  format: 'pdf' | 'xlsx' | 'csv' | 'json';
  generatedBy: string;
  timestamp: string;
  status: 'completed' | 'failed';
  downloadUrl?: string;
}

'use client';

import React, { useState } from 'react';
import { useReportQuery } from '@/hooks/use-reports';
import { FilterBuilder } from './filter-builder';
import { ReportTable } from './report-table';
import { ExportDialog } from './export-dialog';
import { PrintDialog } from './print-dialog';
import { Button } from '@/components/ui/button';
import { FileDown, Printer, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ReportViewerProps {
  reportId: string;
  reportName: string;
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
  showBranchSelector?: boolean;
  showWarehouseSelector?: boolean;
  showSupplierSelector?: boolean;
  showCustomerSelector?: boolean;
  showEmployeeSelector?: boolean;
  showCategorySelector?: boolean;
}

export function ReportViewer({
  reportId,
  reportName,
  category,
  showBranchSelector = false,
  showWarehouseSelector = false,
  showSupplierSelector = false,
  showCustomerSelector = false,
  showEmployeeSelector = false,
  showCategorySelector = false,
}: ReportViewerProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [branchId, setBranchId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  // Fetch report data based on parameters
  const { data, isLoading, refetch } = useReportQuery(reportId, {
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    branchId: branchId || undefined,
    warehouseId: warehouseId || undefined,
    supplierId: supplierId || undefined,
    customerId: customerId || undefined,
    employeeId: employeeId || undefined,
    categoryId: categoryId || undefined,
    search: searchQuery || undefined,
  });

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setBranchId('');
    setWarehouseId('');
    setSupplierId('');
    setCustomerId('');
    setEmployeeId('');
    setCategoryId('');
    setSearchQuery('');
    toast.success('Report query parameters reset.');
  };

  const handleRefresh = () => {
    void refetch();
    toast.success('Report data updated from ledger.');
  };

  return (
    <div className="space-y-6 text-left select-none print:bg-white print:text-black">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-lg font-black uppercase text-foreground tracking-wider font-sans">
            {reportName}
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            Operational ledger reporting for {category} operations.
          </p>
        </div>

        <div className="flex gap-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            className="h-8 border-border bg-cardard hover:bg-accent text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            onClick={() => setIsExportOpen(true)}
            className="h-8 bg-cardard border border-border hover:bg-accent text-xs gap-1.5 text-muted-foreground"
          >
            <FileDown className="h-4 w-4" />
            <span>Export File</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsPrintOpen(true)}
            className="h-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-1.5"
          >
            <Printer className="h-4 w-4" />
            <span>Send spool</span>
          </Button>
        </div>
      </div>

      {/* Filter Builder Panel */}
      <FilterBuilder
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        branchId={showBranchSelector ? branchId : undefined}
        setBranchId={showBranchSelector ? setBranchId : undefined}
        warehouseId={showWarehouseSelector ? warehouseId : undefined}
        setWarehouseId={showWarehouseSelector ? setWarehouseId : undefined}
        supplierId={showSupplierSelector ? supplierId : undefined}
        setSupplierId={showSupplierSelector ? setSupplierId : undefined}
        customerId={showCustomerSelector ? customerId : undefined}
        setCustomerId={showCustomerSelector ? setCustomerId : undefined}
        employeeId={showEmployeeSelector ? employeeId : undefined}
        setEmployeeId={showEmployeeSelector ? setEmployeeId : undefined}
        categoryId={showCategorySelector ? categoryId : undefined}
        setCategoryId={showCategorySelector ? setCategoryId : undefined}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onReset={handleResetFilters}
        onApply={handleRefresh}
      />

      {/* Report Data Table Grid */}
      <div className="print:block">
        <ReportTable columns={data?.columns || []} rows={data?.rows || []} isLoading={isLoading} />
      </div>

      {/* Modals */}
      <ExportDialog
        isOpen={isExportOpen}
        onOpenChange={setIsExportOpen}
        reportName={reportName}
        columns={data?.columns || []}
        rows={data?.rows || []}
      />

      <PrintDialog isOpen={isPrintOpen} onOpenChange={setIsPrintOpen} reportName={reportName} />
    </div>
  );
}

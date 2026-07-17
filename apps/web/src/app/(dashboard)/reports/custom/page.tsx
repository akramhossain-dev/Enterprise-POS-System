'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Sparkles, Save, FileText, Settings, Play } from 'lucide-react';
import { toast } from 'sonner';
import { ReportTable } from '@/components/reports/report-table';

interface Template {
  id: string;
  name: string;
  module: string;
  columns: string[];
}

export default function CustomReportsPage() {
  const [selectedModule, setSelectedModule] = useState('sales');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'Date',
    'Invoice ID',
    'Total ($)',
  ]);
  const [reportName, setReportName] = useState('My Custom Sales Ledger');
  const [runData, setRunData] = useState<{ columns: string[]; rows: any[] } | null>(null);

  const availableColumns: Record<string, string[]> = {
    sales: ['Date', 'Invoice ID', 'Product', 'Category', 'Quantity', 'Total ($)', 'Cashier'],
    purchase: ['Date', 'PO Number', 'Supplier', 'Items Qty', 'Total Cost ($)', 'Status'],
    inventory: [
      'SKU',
      'Product Name',
      'Warehouse',
      'Current Stock',
      'Safety Level',
      'Valuation ($)',
    ],
  };

  const handleColumnToggle = (col: string) => {
    if (selectedColumns.includes(col)) {
      setSelectedColumns(selectedColumns.filter((c) => c !== col));
    } else {
      setSelectedColumns([...selectedColumns, col]);
    }
  };

  const handleSaveTemplate = () => {
    toast.success(`Custom template "${reportName}" saved successfully.`);
  };

  const handleRunReport = () => {
    toast.success('Query executed on POS dataset.');
    // Generate dummy rows matching columns
    const dummyRows = [
      {
        Date: '2026-07-16',
        'Invoice ID': 'INV-9081',
        Product: 'Leather Wallet',
        Category: 'Accessories',
        Quantity: 2,
        'Total ($)': 150,
        'Revenue ($)': 150,
        Cashier: 'Tanvir H.',
        SKU: 'SKU-WAL-09',
        'Product Name': 'Leather Wallet',
        Warehouse: 'Main Hub A',
        'Current Stock': 450,
        'Safety Level': 50,
        'Valuation ($)': 13500,
        'PO Number': 'PO-4512',
        Supplier: 'Global Importers Inc.',
        'Items Qty': 150,
        'Total Cost ($)': 4500,
        Status: 'Received',
      },
      {
        Date: '2026-07-15',
        'Invoice ID': 'INV-9075',
        Product: 'Bluetooth Headset',
        Category: 'Electronics',
        Quantity: 3,
        'Total ($)': 270,
        'Revenue ($)': 270,
        Cashier: 'Tanvir H.',
        SKU: 'SKU-BT-88',
        'Product Name': 'Bluetooth Headset',
        Warehouse: 'Main Hub A',
        'Current Stock': 85,
        'Safety Level': 15,
        'Valuation ($)': 5100,
        'PO Number': 'PO-4509',
        Supplier: 'Elite Distributors Ltd',
        'Items Qty': 80,
        'Total Cost ($)': 2400,
        Status: 'Pending',
      },
    ];
    setRunData({
      columns: selectedColumns,
      rows: dummyRows,
    });
  };

  return (
    <PageContainer className="text-foreground select-none text-left print:bg-white print:text-black">
      <div className="mb-4 print:hidden">
        <Link href="/reports">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Reports Center</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Custom Report Builder"
        description="Query transactional POS and procurement databases using selective columns and sorting tools."
      />

      <div className="grid gap-6 lg:grid-cols-3 mt-6 print:hidden">
        {/* Left Side: Builder Control Box */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-cardard border-border p-4 space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest font-sans flex items-center gap-1.5">
              <Settings className="h-4 w-4 text-emerald-450" />
              <span>Query Settings</span>
            </h3>

            {/* Template naming */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                Template Name
              </label>
              <input
                type="text"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                className="w-full h-8 px-2 bg-muted border border-slate-855 rounded text-xs text-foreground focus:outline-none"
              />
            </div>

            {/* Select Module */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                Target Database Module
              </label>
              <select
                value={selectedModule}
                onChange={(e) => {
                  setSelectedModule(e.target.value);
                  setSelectedColumns(availableColumns[e.target.value]?.slice(0, 3) || []);
                }}
                className="w-full h-8 px-2 bg-muted border border-slate-855 rounded text-xs text-foreground focus:outline-none"
              >
                <option value="sales">Sales Transactions Log</option>
                <option value="purchase">Purchase Orders Ledger</option>
                <option value="inventory">Asset Inventory Valuation</option>
              </select>
            </div>

            {/* Checkbox columns */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide block">
                Select Output Columns
              </label>
              <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                {(availableColumns[selectedModule] || []).map((col) => (
                  <div
                    key={col}
                    onClick={() => handleColumnToggle(col)}
                    className={`flex justify-between items-center p-1.5 border rounded-lg bg-muted/20 cursor-pointer transition-colors ${
                      selectedColumns.includes(col)
                        ? 'border-emerald-500/40 text-emerald-400'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    <span className="text-[10px] font-mono">{col}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSaveTemplate}
                className="flex-1 h-8 bg-muted border border-border hover:bg-accent text-muted-foreground text-xs font-bold gap-1"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Config</span>
              </Button>
              <Button
                onClick={handleRunReport}
                className="flex-1 h-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-1"
              >
                <Play className="h-3.5 w-3.5" />
                <span>Run Query</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Side: Execution Output Display */}
        <div className="lg:col-span-2">
          {runData ? (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-sans flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-indigo-400" />
                <span>Custom Query Output</span>
              </h3>
              <ReportTable columns={runData.columns} rows={runData.rows} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl text-muted-foreground text-xs gap-3">
              <Sparkles className="h-8 w-8 text-slate-700" />
              <span>Configure query parameters and click Run Query to load dataset.</span>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

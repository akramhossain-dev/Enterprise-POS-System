'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileDown, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ExportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reportName: string;
  columns: string[];
  rows: any[];
}

export function ExportDialog({
  isOpen,
  onOpenChange,
  reportName,
  columns,
  rows,
}: ExportDialogProps) {
  const [format, setFormat] = useState<'pdf' | 'xlsx' | 'csv' | 'json'>('csv');
  const [isExporting, setIsExporting] = useState(false);

  const handleTriggerExport = () => {
    setIsExporting(true);

    setTimeout(() => {
      try {
        if (format === 'csv' || format === 'xlsx') {
          // Trigger CSV export
          const headers = columns.join(',');
          const csvRows = rows.map((row) =>
            columns.map((col) => String(row[col] ?? '').replace(/,/g, ' ')).join(','),
          );
          const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...csvRows].join('\n');
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement('a');
          link.setAttribute('href', encodedUri);
          link.setAttribute(
            'download',
            `${reportName.toLowerCase().replace(/\s+/g, '_')}.${format}`,
          );
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (format === 'json') {
          // Trigger JSON export
          const dataStr =
            'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(rows, null, 2));
          const link = document.createElement('a');
          link.setAttribute('href', dataStr);
          link.setAttribute('download', `${reportName.toLowerCase().replace(/\s+/g, '_')}.json`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (format === 'pdf') {
          // Trigger PDF print mode
          window.print();
        }

        toast.success(`Export of ${reportName} in ${format.toUpperCase()} completed successfully.`);
        onOpenChange(false);
      } catch (err) {
        toast.error('Failed to compile export data file.');
      } finally {
        setIsExporting(false);
      }
    }, 1200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0c1220] border border-slate-800 text-slate-100 max-w-sm p-6 select-none text-left">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-sm font-black uppercase text-slate-200 tracking-wider flex items-center gap-1.5 font-sans">
            <FileDown className="h-5 w-5 text-indigo-400" />
            <span>Export Report Sheet</span>
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-xs mt-1">
            Choose format layout to download corporate dataset logs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-xs">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
              Output Format Choice
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'csv', name: 'Comma Separated (CSV)' },
                  { id: 'xlsx', name: 'Excel Worksheet (XLSX)' },
                  { id: 'json', name: 'Structured JSON Document' },
                  { id: 'pdf', name: 'PDF Worksheet (Print)' },
                ] as const
              ).map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setFormat(fmt.id)}
                  className={`p-3 border rounded-xl text-left transition-all ${
                    format === fmt.id
                      ? 'border-indigo-500 bg-indigo-500/10 text-slate-100 font-bold'
                      : 'border-slate-900 bg-slate-950/20 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="font-bold text-[11px] leading-tight">{fmt.name}</p>
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="flex sm:justify-between items-center pt-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                className="h-9 text-slate-500 hover:text-slate-200 hover:bg-slate-900"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleTriggerExport}
              disabled={isExporting}
              className="h-9 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold uppercase text-xs gap-1.5"
            >
              <span>{isExporting ? 'Compiling File...' : 'Generate File'}</span>
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

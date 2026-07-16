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
import { Printer } from 'lucide-react';
import { toast } from 'sonner';

interface PrintDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reportName: string;
}

export function PrintDialog({ isOpen, onOpenChange, reportName }: PrintDialogProps) {
  const [pageSize, setPageSize] = useState<'A4' | 'Letter' | 'Legal'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [includeHeaders, setIncludeHeaders] = useState(true);

  const handlePrintTrigger = () => {
    toast.success(`Preparing print spooler for ${reportName}...`);
    setTimeout(() => {
      window.print();
      onOpenChange(false);
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0c1220] border border-slate-800 text-slate-100 max-w-sm p-6 select-none text-left">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-sm font-black uppercase text-slate-200 tracking-wider flex items-center gap-1.5 font-sans">
            <Printer className="h-5 w-5 text-indigo-400" />
            <span>Print Spooler Manager</span>
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-xs mt-1">
            Configure layout preferences before triggering system printing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-xs">
          {/* Page Size Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
              Sheet Paper Size
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['A4', 'Letter', 'Legal'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setPageSize(sz)}
                  className={`py-2 text-center border rounded-lg text-[10px] uppercase font-bold transition-all ${
                    pageSize === sz
                      ? 'border-indigo-500 bg-indigo-500/10 text-slate-100'
                      : 'border-slate-900 bg-slate-950/20 text-slate-400'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Orientation selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
              Layout Orientation
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'portrait', name: 'Portrait (Tall)' },
                  { id: 'landscape', name: 'Landscape (Wide)' },
                ] as const
              ).map((orient) => (
                <button
                  key={orient.id}
                  type="button"
                  onClick={() => setOrientation(orient.id)}
                  className={`py-2 text-center border rounded-lg text-[10px] font-bold transition-all ${
                    orientation === orient.id
                      ? 'border-indigo-500 bg-indigo-500/10 text-slate-100'
                      : 'border-slate-900 bg-slate-950/20 text-slate-400'
                  }`}
                >
                  {orient.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-2 border border-slate-900 rounded-xl bg-slate-950/20">
            <span className="font-bold text-slate-200">Include Audit Header Meta</span>
            <input
              type="checkbox"
              checked={includeHeaders}
              onChange={(e) => setIncludeHeaders(e.target.checked)}
              className="accent-emerald-500 h-4 w-4 rounded cursor-pointer"
            />
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
              onClick={handlePrintTrigger}
              className="h-9 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold uppercase text-xs gap-1.5"
            >
              <Printer className="h-4 w-4" />
              <span>Send spool</span>
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

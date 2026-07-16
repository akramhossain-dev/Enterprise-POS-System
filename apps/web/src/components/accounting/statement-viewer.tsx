'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, Printer, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

export interface StatementSection {
  title: string;
  items: { code: string; name: string; balance: number }[];
  showTotal?: boolean;
  totalLabel?: string;
  totalValue?: number;
}

interface StatementViewerProps {
  title: string;
  subtitle: string;
  sections: StatementSection[];
  netValueLabel?: string;
  netValue?: number;
  netValueColor?: string;
  footerNotes?: string;
  onPrint?: () => void;
}

export function StatementViewer({
  title,
  subtitle,
  sections,
  netValueLabel,
  netValue,
  netValueColor = 'text-slate-100',
  footerNotes,
  onPrint,
}: StatementViewerProps) {
  const formatCurrency = (val: number) => {
    return '$' + val.toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  const handleExportCSV = () => {
    const rows = [['Statement:', title], ['Period:', subtitle], []];
    rows.push(['Account Code', 'Particulars / Account Name', 'Balance ($)']);

    sections.forEach((sec) => {
      rows.push(['', `[ SECTION: ${sec.title.toUpperCase()} ]`, '']);
      sec.items.forEach((item) => {
        rows.push([item.code, item.name, item.balance.toString()]);
      });
      if (sec.showTotal && sec.totalValue !== undefined) {
        rows.push(['', sec.totalLabel || 'Total', sec.totalValue.toString()]);
      }
      rows.push([]);
    });

    if (netValueLabel !== undefined && netValue !== undefined) {
      rows.push(['', netValueLabel.toUpperCase(), netValue.toString()]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => e.map((x) => x.replace(/,/g, ' ')).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title.toLowerCase().replace(/\s/g, '_')}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${title} statement exported to CSV.`);
  };

  const executePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <Card className="bg-[#0c1220] border-slate-800 text-slate-100 print:bg-white print:text-black print:border-none print:shadow-none select-none text-left">
      {/* Actions header (Hidden when printing) */}
      <div className="p-4 bg-slate-950/45 border-b border-slate-900 flex justify-between items-center print:hidden">
        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-sans flex items-center gap-1.5">
          <HelpCircle className="h-4 w-4 text-emerald-450" />
          <span>Statement Worksheets</span>
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            className="h-8 border-slate-800 bg-[#0c1220] hover:bg-slate-900 text-xs gap-1.5"
          >
            <FileDown className="h-4 w-4 text-slate-450" />
            <span>Export CSV</span>
          </Button>
          <Button
            size="sm"
            onClick={executePrint}
            className="h-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-1.5"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      <CardContent className="p-6 sm:p-8 space-y-6 max-w-3xl mx-auto print:p-0">
        {/* Title details */}
        <div className="text-center border-b border-slate-855 pb-4 print:border-black">
          <h2 className="text-base font-black uppercase text-slate-200 print:text-black font-sans tracking-wide">
            {title}
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">{subtitle}</p>
        </div>

        {/* Sections layout */}
        <div className="space-y-6">
          {sections.map((sec, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-900/60 pb-1.5 print:text-black print:border-black font-sans">
                {sec.title}
              </h3>

              <div className="divide-y divide-slate-900/50 print:divide-gray-200">
                {sec.items.length > 0 ? (
                  sec.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="flex justify-between items-center py-2 text-xs font-mono font-medium"
                    >
                      <div className="flex gap-2">
                        <span className="text-slate-500">{item.code}</span>
                        <span className="text-slate-300 print:text-black">{item.name}</span>
                      </div>
                      <span className="text-slate-200 print:text-black">
                        {formatCurrency(item.balance)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-2 text-[11px] text-slate-500 font-sans">
                    No transactions logged under this classification.
                  </p>
                )}
              </div>

              {sec.showTotal && sec.totalValue !== undefined && (
                <div className="flex justify-between items-center py-2.5 border-t-2 border-slate-855 text-xs font-mono font-black text-slate-200 print:border-black print:text-black">
                  <span>{sec.totalLabel || 'Total'}</span>
                  <span>{formatCurrency(sec.totalValue)}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Statement net value display (Net profit / Net cash flow / equity matching) */}
        {netValueLabel !== undefined && netValue !== undefined && (
          <div className="flex justify-between items-center py-4 border-t-2 border-double border-slate-700 text-sm font-mono font-black uppercase tracking-wider print:border-black print:text-black bg-slate-955/20 px-3 rounded-lg print:bg-transparent print:px-0">
            <span>{netValueLabel}</span>
            <span className={netValueColor}>{formatCurrency(netValue)}</span>
          </div>
        )}

        {footerNotes && (
          <div className="text-[10px] text-slate-500 leading-normal text-left font-sans border-t border-slate-855 pt-4 print:border-black">
            <span className="font-bold text-slate-400 uppercase tracking-widest block mb-1">
              Accounting Disclosures:
            </span>
            <p>{footerNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

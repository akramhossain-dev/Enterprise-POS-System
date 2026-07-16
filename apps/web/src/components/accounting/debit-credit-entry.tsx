'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, ShieldAlert, CheckCircle } from 'lucide-react';
import type { ChartAccount } from '@/types/accounting';

export interface EntryLine {
  id?: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
}

interface DebitCreditEntryProps {
  value: EntryLine[];
  onChange: (lines: EntryLine[]) => void;
  accounts: ChartAccount[];
}

export function DebitCreditEntry({ value, onChange, accounts }: DebitCreditEntryProps) {
  const activeAccounts = accounts.filter((a) => a.status === 'ACTIVE');

  const addLine = () => {
    const newline: EntryLine = {
      accountId: '',
      accountCode: '',
      accountName: '',
      description: '',
      debitAmount: 0,
      creditAmount: 0,
    };
    onChange([...value, newline]);
  };

  const removeLine = (idx: number) => {
    const copy = [...value];
    copy.splice(idx, 1);
    onChange(copy);
  };

  const updateLine = (idx: number, field: keyof EntryLine, val: any) => {
    const copy = [...value];
    const line = { ...copy[idx]! };

    if (field === 'accountId') {
      const acc = activeAccounts.find((a) => a.id === val);
      line.accountId = val;
      line.accountCode = acc ? acc.code : '';
      line.accountName = acc ? acc.name : '';
    } else if (field === 'debitAmount') {
      const num = Math.max(0, Number(val));
      line.debitAmount = num;
      if (num > 0) line.creditAmount = 0; // Double-entry: a line cannot have both debit and credit
    } else if (field === 'creditAmount') {
      const num = Math.max(0, Number(val));
      line.creditAmount = num;
      if (num > 0) line.debitAmount = 0;
    } else {
      (line as any)[field] = val;
    }

    copy[idx] = line;
    onChange(copy);
  };

  // Calculations
  const totalDebit = value.reduce((sum, l) => sum + (l.debitAmount || 0), 0);
  const totalCredit = value.reduce((sum, l) => sum + (l.creditAmount || 0), 0);
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = totalDebit > 0 && totalDebit === totalCredit;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Double-Entry Line Items
        </h3>
        <Button
          type="button"
          size="sm"
          onClick={addLine}
          className="h-8 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-xs font-bold gap-1 text-slate-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Line</span>
        </Button>
      </div>

      {/* Entry Rows */}
      <div className="bg-[#0c1220] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-855 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-955/35">
                <th className="py-3 px-4 w-[280px]">Ledger Account *</th>
                <th className="py-3 px-3">Line Memo / Description</th>
                <th className="py-3 px-3 w-[120px] text-right font-mono">Debit ($)</th>
                <th className="py-3 px-3 w-[120px] text-right font-mono">Credit ($)</th>
                <th className="py-3 px-4 w-[60px] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 font-medium text-slate-350">
              {value.map((line, idx) => (
                <tr key={idx} className="hover:bg-slate-900/20">
                  <td className="py-2.5 px-4">
                    <select
                      value={line.accountId}
                      required
                      onChange={(e) => updateLine(idx, 'accountId', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-855 rounded p-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer font-sans"
                    >
                      <option value="">-- Choose Account --</option>
                      {activeAccounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.code} — {a.name} ({a.type})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2.5 px-3">
                    <Input
                      type="text"
                      value={line.description}
                      placeholder="Optional memo..."
                      onChange={(e) => updateLine(idx, 'description', e.target.value)}
                      className="bg-slate-950 border-slate-855 text-xs text-slate-100 font-sans focus-visible:ring-emerald-500 h-8"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      value={line.debitAmount || ''}
                      placeholder="0.00"
                      onChange={(e) => updateLine(idx, 'debitAmount', e.target.value)}
                      className="bg-slate-950 border-slate-855 text-xs text-slate-100 font-mono text-right focus-visible:ring-emerald-500 h-8"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      value={line.creditAmount || ''}
                      placeholder="0.00"
                      onChange={(e) => updateLine(idx, 'creditAmount', e.target.value)}
                      className="bg-slate-950 border-slate-855 text-xs text-slate-100 font-mono text-right focus-visible:ring-emerald-500 h-8"
                    />
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={value.length <= 2}
                      onClick={() => removeLine(idx)}
                      className="h-7 w-7 text-slate-500 hover:text-rose-455 hover:bg-transparent"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Totals Footer */}
            <tfoot>
              <tr className="bg-slate-955/25 font-black border-t border-slate-855 font-mono text-slate-200">
                <td
                  colSpan={2}
                  className="py-3 px-4 font-sans text-right uppercase tracking-wider text-slate-400"
                >
                  Total Alignment:
                </td>
                <td className="py-3 px-3 text-right text-emerald-400">
                  ${totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right text-rose-455">
                  ${totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Validation Warning / Balancing helper */}
      {value.length > 0 && (
        <div className="flex justify-between items-center text-xs font-mono p-3 rounded-xl border bg-slate-950">
          <div className="flex items-center gap-2">
            {isBalanced ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                <span>Balanced Double Entry (Debits = Credits)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-rose-455 font-bold">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 animate-bounce" />
                <span>
                  Unbalanced Journal Difference: $
                  {difference.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </span>
            )}
          </div>
          <div className="text-slate-500">
            <span>Lines Count: {value.length} (Min 2)</span>
          </div>
        </div>
      )}
    </div>
  );
}

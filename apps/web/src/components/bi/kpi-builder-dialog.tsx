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
import { Sliders, CheckCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface KpiBuilderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveKpi: (kpi: { name: string; formula: string; color: string }) => void;
}

export function KpiBuilderDialog({ isOpen, onOpenChange, onSaveKpi }: KpiBuilderDialogProps) {
  const [name, setName] = useState('Operating Margin');
  const [metricA, setMetricA] = useState('revenue');
  const [operator, setOperator] = useState('/');
  const [metricB, setMetricB] = useState('expenses');
  const [color, setColor] = useState('text-emerald-450');

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Formula name cannot be blank.');
      return;
    }
    const formulaStr = `${metricA} ${operator} ${metricB}`;
    onSaveKpi({
      name,
      formula: formulaStr,
      color,
    });
    toast.success(`Formula KPI "${name}" saved to widgets library.`);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border border-border text-foreground max-w-sm p-6 select-none text-left">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-sm font-black uppercase text-foreground tracking-wider flex items-center gap-1.5 font-sans">
            <Sliders className="h-5 w-5 text-indigo-400" />
            <span>Create Custom KPI Formula</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs mt-1">
            Build custom ratios by combining ledger metrics and arithmetic operations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-xs font-sans">
          {/* Formula Name */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
              KPI Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-8 px-2 bg-muted border border-slate-855 rounded text-xs text-foreground focus:outline-none"
            />
          </div>

          {/* Metric A */}
          <div className="grid grid-cols-3 gap-2 items-center">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                Metric A
              </label>
              <select
                value={metricA}
                onChange={(e) => setMetricA(e.target.value)}
                className="bg-muted border border-slate-855 rounded p-1 text-[10px] h-8 text-foreground"
              >
                <option value="revenue">Revenue</option>
                <option value="netProfit">Net Profit</option>
                <option value="purchaseCost">Purchase Cost</option>
                <option value="cogs">COGS</option>
              </select>
            </div>

            {/* Operator */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide text-center">
                Operator
              </label>
              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="bg-muted border border-slate-855 rounded p-1 text-[10px] h-8 text-center text-foreground"
              >
                <option value="+">+</option>
                <option value="-">-</option>
                <option value="*">*</option>
                <option value="/">/</option>
              </select>
            </div>

            {/* Metric B */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                Metric B
              </label>
              <select
                value={metricB}
                onChange={(e) => setMetricB(e.target.value)}
                className="bg-muted border border-slate-855 rounded p-1 text-[10px] h-8 text-foreground"
              >
                <option value="revenue">Revenue</option>
                <option value="expenses">Expenses</option>
                <option value="inventoryValue">Inventory Value</option>
                <option value="grossSales">Gross Sales</option>
              </select>
            </div>
          </div>

          {/* Theme selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
              KPI Value Color
            </label>
            <div className="flex gap-2">
              {[
                { class: 'text-emerald-450', name: 'Emerald' },
                { class: 'text-indigo-400', name: 'Blue' },
                { class: 'text-amber-500', name: 'Amber' },
                { class: 'text-rose-455', name: 'Rose' },
              ].map((c) => (
                <button
                  key={c.class}
                  type="button"
                  onClick={() => setColor(c.class)}
                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                    color === c.class
                      ? 'border-indigo-500 bg-indigo-500/10 ' + c.class
                      : 'border-border bg-muted/20 text-muted-foreground'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Formula Display Preview */}
          <div className="p-2 bg-muted rounded border border-border text-center text-[10px] font-mono text-muted-foreground">
            Preview:{' '}
            <span className="text-foreground font-bold">
              {name} = {metricA} {operator} {metricB}
            </span>
          </div>

          <DialogFooter className="flex sm:justify-between items-center pt-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                className="h-9 text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleSave}
              className="h-9 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold uppercase text-xs gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>Create KPI</span>
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Delete, Trash2 } from 'lucide-react';

interface CalculatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CalculatorModal({ open, onOpenChange }: CalculatorModalProps) {
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState('');

  const calculateExpr = () => {
    try {
      // Evaluate basic mathematical operations safely (avoid eval where possible, or replace sanitised operations)
      const sanitized = expr.replace(/[^0-9\+\-\*\/\.\%]/g, '');
      if (!sanitized) return;
      // Use Function constructor instead of eval for isolated execution
      const fn = new Function(`return (${sanitized})`);
      const val = fn();
      setResult(Number(val).toLocaleString(undefined, { maximumFractionDigits: 4 }));
    } catch {
      setResult('Error');
    }
  };

  const handleKeyPress = (val: string) => {
    setExpr((prev) => prev + val);
  };

  const clearAll = () => {
    setExpr('');
    setResult('');
  };

  const deleteLast = () => {
    setExpr((prev) => prev.slice(0, -1));
  };

  // Handle keyboard inputs when modal is active
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const { key } = e;
      if (/[0-9\+\-\*\/\.\%]/.test(key)) {
        e.preventDefault();
        setExpr((prev) => prev + key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculateExpr();
      } else if (key === 'Backspace') {
        e.preventDefault();
        setExpr((prev) => prev.slice(0, -1));
      } else if (key === 'Escape') {
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, expr]);

  const keys = [
    ['C', 'del', '%', '/'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '=', ''],
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[340px] bg-card border-border text-foreground p-4">
        <DialogHeader>
          <DialogTitle className="text-foreground text-sm font-bold flex items-center gap-2">
            <span>Cashier Calculator Widget</span>
          </DialogTitle>
        </DialogHeader>

        {/* Display Screen */}
        <div className="bg-muted border border-border rounded-xl p-4 text-right mb-4 min-h-[90px] flex flex-col justify-between">
          <p className="text-muted-foreground font-mono text-xs break-all tracking-wide min-h-6">
            {expr || '0'}
          </p>
          <p className="text-2xl font-black font-mono text-emerald-400 select-all truncate">
            {result || '0'}
          </p>
        </div>

        {/* Keypad Grid */}
        <div className="grid grid-cols-4 gap-2">
          {keys.map((row, rIdx) =>
            row.map((key, cIdx) => {
              if (key === '') return null;

              let btnClass =
                'bg-accent border-border text-foreground hover:bg-slate-800 font-mono text-base h-12';
              if (['/', '*', '-', '+'].includes(key)) {
                btnClass =
                  'bg-muted border-border text-emerald-400 hover:bg-accent font-mono text-lg font-bold h-12';
              } else if (key === 'C') {
                btnClass =
                  'bg-rose-950/20 border-rose-900/30 text-rose-400 hover:bg-rose-900/20 font-bold h-12';
              } else if (key === '=') {
                btnClass =
                  'bg-emerald-500 text-slate-950 hover:bg-emerald-600 font-bold col-span-2 text-lg h-12';
              }

              const handleClick = () => {
                if (key === 'C') clearAll();
                else if (key === 'del') deleteLast();
                else if (key === '=') calculateExpr();
                else handleKeyPress(key);
              };

              return (
                <Button
                  key={`${rIdx}-${cIdx}`}
                  variant="outline"
                  onClick={handleClick}
                  className={btnClass}
                >
                  {key === 'del' ? <Delete className="h-4.5 w-4.5" /> : key}
                </Button>
              );
            }),
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

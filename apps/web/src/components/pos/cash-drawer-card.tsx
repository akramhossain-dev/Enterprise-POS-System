'use client';

import React, { useState } from 'react';
import { useActiveShift, useOpenShift, useCloseShift, useLogCashEntry } from '@/hooks/use-checkout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Unlock,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';

export function CashDrawerCard() {
  const { data: activeShift, isLoading } = useActiveShift();
  const openShiftMutation = useOpenShift();
  const closeShiftMutation = useCloseShift();
  const logCashMutation = useLogCashEntry();

  // Local state forms
  const [cashierName, setCashierName] = useState('Cashier Admin');
  const [openingFloat, setOpeningFloat] = useState('');

  // Cash In/Out state
  const [entryType, setEntryType] = useState<'IN' | 'OUT'>('IN');
  const [entryAmount, setEntryAmount] = useState('');
  const [entryNotes, setEntryNotes] = useState('');

  const handleOpenShift = () => {
    const float = parseFloat(openingFloat);
    if (isNaN(float) || float < 0) {
      toast.error('Please enter a valid starting float balance.');
      return;
    }
    openShiftMutation.mutate({ cashierName, openingBalance: float });
    setOpeningFloat('');
  };

  const handleCloseShift = () => {
    const confirm = window.confirm(
      'Are you sure you want to CLOSE the shift and LOCK the cash drawer register?',
    );
    if (confirm) {
      closeShiftMutation.mutate();
    }
  };

  const handlePostEntry = () => {
    const amount = parseFloat(entryAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }
    if (!entryNotes.trim()) {
      toast.error('Please add note description details.');
      return;
    }

    logCashMutation.mutate(
      { type: entryType, amount, notes: entryNotes },
      {
        onSuccess: () => {
          setEntryAmount('');
          setEntryNotes('');
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-xs text-slate-500">Retrieving shift status...</div>
    );
  }

  // 1. SHIFT NOT OPENED YET: Render check-in setup form
  if (!activeShift) {
    return (
      <Card className="bg-[#0c1220] border-slate-800 text-slate-100 max-w-md mx-auto text-left">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-200">
            <Lock className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
            <span>Open Cash Drawer Register</span>
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            Start a new terminal cashier session by initializing the register float.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs sm:text-sm">
          <div className="grid gap-2">
            <label className="text-slate-400 font-semibold text-xs">Cashier Name</label>
            <Input
              type="text"
              value={cashierName}
              onChange={(e) => setCashierName(e.target.value)}
              className="bg-slate-950 border-slate-800 text-xs text-slate-100 focus-visible:ring-emerald-500"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-slate-400 font-semibold text-xs font-mono">
              Starting Cash Float ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 font-mono text-sm">$</span>
              <Input
                type="number"
                placeholder="100.00"
                value={openingFloat}
                onChange={(e) => setOpeningFloat(e.target.value)}
                className="pl-7 bg-slate-950 border-slate-855 text-xs text-slate-100 font-mono focus-visible:ring-emerald-500"
              />
            </div>
            <p className="text-[10px] text-slate-500 leading-normal">
              Enter starting cash change float value currently inside physical drawer box.
            </p>
          </div>

          <Button
            onClick={handleOpenShift}
            disabled={openShiftMutation.isPending}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs uppercase tracking-wider gap-1.5 h-10 mt-2"
          >
            <Unlock className="h-4 w-4" />
            <span>Open Session drawer</span>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 2. ACTIVE OPEN SHIFT: Render register logs, totals, and Cash-In/Out panel
  return (
    <div className="grid gap-6 md:grid-cols-3 text-left text-slate-100 select-none">
      {/* Drawer stats overview */}
      <div className="md:col-span-1 space-y-4">
        <Card className="bg-[#0c1220] border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Unlock className="h-4 w-4 text-emerald-400" />
              <span>Shift Drawer Balance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-2xl font-black font-mono text-emerald-400">
                ${activeShift.currentBalance.toFixed(2)}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Cashier: {activeShift.cashierName}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-slate-900 pt-3 text-[11px] font-mono text-slate-400">
              <div>
                <span>Starting Float:</span>
                <p className="text-slate-200 font-bold">${activeShift.openingBalance.toFixed(2)}</p>
              </div>
              <div>
                <span>POS Checkouts:</span>
                <p className="text-slate-200 font-bold">${activeShift.shiftBalance.toFixed(2)}</p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleCloseShift}
              disabled={closeShiftMutation.isPending}
              className="w-full h-8 border-rose-900/40 bg-[#0c1220] text-rose-400 text-xs hover:bg-rose-950/20 uppercase tracking-wider font-bold mt-2"
            >
              <span>Close Shift & Lock</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Record Cash In/Out logs form */}
      <div className="md:col-span-1">
        <Card className="bg-[#0c1220] border-slate-800 h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Log Cash Adjustment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs">
            {/* Type selector */}
            <div className="flex bg-slate-950 p-1 border border-slate-900 rounded-lg">
              <Button
                size="sm"
                onClick={() => setEntryType('IN')}
                className={`flex-1 h-7 text-xs rounded-md ${
                  entryType === 'IN'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                <span>Cash In</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setEntryType('OUT')}
                className={`flex-1 h-7 text-xs rounded-md ${
                  entryType === 'OUT'
                    ? 'bg-rose-500 text-slate-950 font-bold'
                    : 'bg-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowDownRight className="h-3.5 w-3.5 mr-1" />
                <span>Cash Out</span>
              </Button>
            </div>

            {/* Amount */}
            <div className="grid gap-1">
              <label className="text-slate-400 font-semibold font-mono">Amount ($)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={entryAmount}
                onChange={(e) => setEntryAmount(e.target.value)}
                className="bg-slate-950 border-slate-855 h-8 text-xs focus-visible:ring-emerald-500 font-mono"
              />
            </div>

            {/* Notes description */}
            <div className="grid gap-1">
              <label className="text-slate-400 font-semibold">Notes / Reason</label>
              <Input
                type="text"
                placeholder="E.g., Cash float addition, expense payout"
                value={entryNotes}
                onChange={(e) => setEntryNotes(e.target.value)}
                className="bg-slate-950 border-slate-855 h-8 text-xs focus-visible:ring-emerald-500"
              />
            </div>

            <Button
              onClick={handlePostEntry}
              disabled={logCashMutation.isPending}
              className={`w-full h-8 text-slate-950 font-bold text-xs uppercase tracking-wider mt-2 ${
                entryType === 'IN'
                  ? 'bg-emerald-500 hover:bg-emerald-600'
                  : 'bg-rose-500 hover:bg-rose-600'
              }`}
            >
              <span>Record adjustment</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Cash register transaction logs log history */}
      <div className="md:col-span-1">
        <Card className="bg-[#0c1220] border-slate-800 h-full flex flex-col overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-900 shrink-0">
            <CardTitle className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardList className="h-4.5 w-4.5 text-slate-400" />
              <span>Shift Transaction Logs</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-3 space-y-2 max-h-56 custom-scrollbar text-[11px]">
            {activeShift.logs.length > 0 ? (
              activeShift.logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2 bg-slate-950/20 border border-slate-900 rounded-md"
                >
                  <div className="min-w-0 text-left">
                    <p className="font-bold text-slate-300">{log.notes}</p>
                    <p className="text-[9px] text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-mono font-bold flex items-center gap-0.5 ${
                        log.type === 'IN' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {log.type === 'IN' ? '+' : '-'}${log.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                No shift adjustment events registered.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

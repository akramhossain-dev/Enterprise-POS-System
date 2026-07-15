'use client';

import React from 'react';
import Link from 'next/link';
import { usePOSStore } from '@/stores/pos.store';
import { useWarehouses } from '@/hooks/use-warehouse';
import { useCustomers } from '@/hooks/use-customer';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Printer, Barcode, Key, Warehouse, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function POSSettingsPage() {
  const { settings, updateSettings } = usePOSStore();

  // Load warehouses & default customers list
  const { data: warehousesData } = useWarehouses({ status: 'ACTIVE' });
  const { data: customersData } = useCustomers({ limit: 100 });

  const warehouses = warehousesData?.data || [];
  const customers = customersData?.data || [];

  const handleToggleAutoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    updateSettings({ barcodeScanningAutoAdd: checked });
    toast.success(`Barcode Auto-Add ${checked ? 'enabled' : 'disabled'}`);
  };

  const handlePrinterWidth = (width: 58 | 80) => {
    updateSettings({ receiptPrinterWidth: width });
    toast.success(`Receipt printing width updated to ${width}mm`);
  };

  const handleWarehouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ defaultWarehouseId: e.target.value });
    toast.success('Default warehouse updated');
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ defaultCustomerId: e.target.value });
    toast.success('Default customer updated');
  };

  const handleDrawerCode = (e: React.FocusEvent<HTMLInputElement>) => {
    updateSettings({ cashDrawerTriggerCode: e.target.value });
    toast.success('Cash Drawer escape code updated');
  };

  return (
    <PageContainer className="max-w-4xl mx-auto py-6 text-slate-100 select-none">
      {/* Back to workspace header */}
      <div className="mb-4">
        <Link href="/pos">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-200 gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to POS Terminal</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title="POS Settings Configurations"
        description="Configure terminal printing options, barcode scanner, and default cash register registers."
      />

      <div className="grid gap-6 mt-6">
        {/* Receipt Printer configuration card */}
        <Card className="bg-[#0c1220] border-slate-800 text-slate-100">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-200">
              <Printer className="h-4.5 w-4.5 text-emerald-400" />
              <span>Receipt Printer Settings</span>
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Select receipt format sizes and default printer options.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div>
                <p className="font-semibold text-slate-200">Paper Roll Print Width</p>
                <p className="text-[11px] text-slate-500">Choose standard thermal receipt width.</p>
              </div>
              <div className="flex bg-slate-950 p-1 border border-slate-900 rounded-lg animate-fade-in">
                <Button
                  size="sm"
                  onClick={() => handlePrinterWidth(58)}
                  className={`h-7 px-3 text-xs rounded-md ${
                    settings.receiptPrinterWidth === 58
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  58 mm
                </Button>
                <Button
                  size="sm"
                  onClick={() => handlePrinterWidth(80)}
                  className={`h-7 px-3 text-xs rounded-md ${
                    settings.receiptPrinterWidth === 80
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  80 mm
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Barcode scanner configurations */}
        <Card className="bg-[#0c1220] border-slate-800 text-slate-100">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-200">
              <Barcode className="h-4.5 w-4.5 text-emerald-400" />
              <span>Barcode Scanner Options</span>
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Set preferences for hand-held laser/optical barcode scanners.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-200">Auto Add matched products</p>
                <p className="text-[11px] text-slate-500">
                  Automatically adds product to cart when scan match is 100%.
                </p>
              </div>

              {/* Custom CSS Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.barcodeScanningAutoAdd}
                  onChange={handleToggleAutoAdd}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Defaults & Facilities configurations */}
        <Card className="bg-[#0c1220] border-slate-800 text-slate-100">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-200">
              <Warehouse className="h-4.5 w-4.5 text-emerald-400" />
              <span>Register & Defaults Configurations</span>
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Configure defaults for checkout locations.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 text-xs sm:text-sm">
            {/* Default warehouse */}
            <div className="grid gap-2 text-left">
              <label className="text-slate-400 text-xs font-semibold">
                Default Warehouse Location
              </label>
              <select
                value={settings.defaultWarehouseId}
                onChange={handleWarehouseChange}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select default warehouse...</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Default Customer */}
            <div className="grid gap-2 text-left">
              <label className="text-slate-400 text-xs font-semibold">
                Default Customer account
              </label>
              <select
                value={settings.defaultCustomerId}
                onChange={handleCustomerChange}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="walk-in">Walk-in Customer (Default)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Cash Drawer trigger code */}
            <div className="grid gap-2 text-left">
              <label className="text-slate-400 text-xs font-semibold">
                Cash Drawer Kick Trigger Code
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="27,112,0,25,250"
                  defaultValue={settings.cashDrawerTriggerCode}
                  onBlur={handleDrawerCode}
                  className="bg-slate-950 border-slate-850 text-slate-100 text-xs focus-visible:ring-emerald-500"
                />
              </div>
              <p className="text-[10px] text-slate-500">
                ASCII escape commands sent to POS printer to trigger cash drawers.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

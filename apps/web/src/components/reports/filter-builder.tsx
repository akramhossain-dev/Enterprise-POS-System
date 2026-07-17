'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, RotateCcw, Search } from 'lucide-react';

interface FilterBuilderProps {
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  branchId?: string;
  setBranchId?: (val: string) => void;
  warehouseId?: string;
  setWarehouseId?: (val: string) => void;
  supplierId?: string;
  setSupplierId?: (val: string) => void;
  customerId?: string;
  setCustomerId?: (val: string) => void;
  employeeId?: string;
  setEmployeeId?: (val: string) => void;
  categoryId?: string;
  setCategoryId?: (val: string) => void;
  searchQuery?: string;
  setSearchQuery?: (val: string) => void;
  onReset: () => void;
  onApply?: () => void;
}

export function FilterBuilder({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  branchId,
  setBranchId,
  warehouseId,
  setWarehouseId,
  supplierId,
  setSupplierId,
  customerId,
  setCustomerId,
  employeeId,
  setEmployeeId,
  categoryId,
  setCategoryId,
  searchQuery,
  setSearchQuery,
  onReset,
  onApply,
}: FilterBuilderProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4 select-none text-left print:hidden">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-widest font-sans flex items-center gap-1.5">
          <SlidersHorizontal className="h-4 w-4 text-emerald-450" />
          <span>Report Parameter Filters</span>
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-7 text-[10px] text-muted-foreground hover:text-muted-foreground hover:bg-accent gap-1"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset Parameters</span>
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        {/* Date Ranges */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full h-8 px-2 bg-muted border border-border rounded text-xs text-foreground focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full h-8 px-2 bg-muted border border-border rounded text-xs text-foreground focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Branch Select */}
        {setBranchId !== undefined && (
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
              Branch Office
            </label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full h-8 px-2 bg-muted border border-slate-855 rounded text-xs text-foreground focus:outline-none"
            >
              <option value="">All Branches</option>
              <option value="b-1">Dhaka Central (HQ)</option>
              <option value="b-2">Chittagong Port</option>
              <option value="b-3">Sylhet Valley</option>
            </select>
          </div>
        )}

        {/* Warehouse Select */}
        {setWarehouseId !== undefined && (
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
              Warehouse Outlet
            </label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="w-full h-8 px-2 bg-muted border border-slate-855 rounded text-xs text-foreground focus:outline-none"
            >
              <option value="">All Warehouses</option>
              <option value="w-1">Main Hub A</option>
              <option value="w-2">Transit Depot B</option>
            </select>
          </div>
        )}

        {/* Category Select */}
        {setCategoryId !== undefined && (
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
              Product Group Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full h-8 px-2 bg-muted border border-slate-855 rounded text-xs text-foreground focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="c-1">Apparel & Fashion</option>
              <option value="c-2">Consumer Electronics</option>
              <option value="c-3">Home & Kitchen</option>
            </select>
          </div>
        )}

        {/* Supplier Select */}
        {setSupplierId !== undefined && (
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
              Active Supplier
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full h-8 px-2 bg-muted border border-slate-855 rounded text-xs text-foreground focus:outline-none"
            >
              <option value="">All Suppliers</option>
              <option value="s-201">Global Importers Inc.</option>
              <option value="s-205">Elite Distributors Ltd</option>
            </select>
          </div>
        )}

        {/* Customer Select */}
        {setCustomerId !== undefined && (
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
              VIP Customer Loyalty
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full h-8 px-2 bg-muted border border-slate-855 rounded text-xs text-foreground focus:outline-none"
            >
              <option value="">All Customers</option>
              <option value="c-451">Zayn Malik</option>
              <option value="c-459">Alia Bhatt</option>
            </select>
          </div>
        )}

        {/* Employee Select */}
        {setEmployeeId !== undefined && (
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
              Cashier Clerk Agent
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full h-8 px-2 bg-muted border border-slate-855 rounded text-xs text-foreground focus:outline-none"
            >
              <option value="">All Cashiers</option>
              <option value="emp-101">Tanvir Hossain</option>
              <option value="emp-105">Nabila Rahman</option>
            </select>
          </div>
        )}
      </div>

      {/* Query Search */}
      {setSearchQuery !== undefined && (
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search matching invoices, product SKU models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 bg-muted border border-slate-855 rounded text-xs text-foreground focus:outline-none focus:border-emerald-500"
          />
        </div>
      )}

      {onApply && (
        <div className="flex justify-end pt-1">
          <Button
            size="sm"
            onClick={onApply}
            className="h-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs"
          >
            Generate Filtered Report
          </Button>
        </div>
      )}
    </div>
  );
}

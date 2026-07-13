'use client';

import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
  type PaginationState,
} from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  totalCount?: number;
  // Controlled pagination (for server-side)
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  // Row selection
  enableRowSelection?: boolean;
  onRowSelectionChange?: (rows: TData[]) => void;
  // Appearance
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  totalCount,
  page = 1,
  pageSize = 25,
  onPageChange,
  onPageSizeChange,
  enableRowSelection = false,
  onRowSelectionChange,
  emptyTitle = 'No data',
  emptyDescription = 'There are no records to display.',
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: page - 1,
    pageSize,
  });

  const isServerSide = !!onPageChange;

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: isServerSide ? { pageIndex: page - 1, pageSize } : pagination,
    },
    enableRowSelection,
    manualPagination: isServerSide,
    pageCount: isServerSide && totalCount ? Math.ceil(totalCount / pageSize) : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      setRowSelection(updater);
      if (onRowSelectionChange) {
        const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
        const selectedRows = Object.keys(newSelection)
          .filter((key) => newSelection[key])
          .map((key) => data[Number(key)] as TData);
        onRowSelectionChange(selectedRows);
      }
    },
    onPaginationChange: isServerSide ? undefined : setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: isServerSide ? undefined : getPaginationRowModel(),
  });

  const currentPage = isServerSide ? page : pagination.pageIndex + 1;
  const currentPageSize = isServerSide ? pageSize : pagination.pageSize;
  const currentTotal = totalCount ?? data.length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border bg-muted/50">
                  {headerGroup.headers.map((header) => {
                    const isSorted = header.column.getIsSorted();
                    const canSort = header.column.getCanSort();

                    return (
                      <th
                        key={header.id}
                        className={cn(
                          'px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide',
                          canSort &&
                            'cursor-pointer select-none hover:text-foreground transition-colors',
                        )}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        aria-sort={
                          isSorted === 'asc'
                            ? 'ascending'
                            : isSorted === 'desc'
                              ? 'descending'
                              : undefined
                        }
                      >
                        {header.isPlaceholder ? null : (
                          <div className="flex items-center gap-1.5">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {canSort && (
                              <span aria-hidden="true">
                                {isSorted === 'asc' ? (
                                  <ArrowUp className="h-3 w-3 text-primary" />
                                ) : isSorted === 'desc' ? (
                                  <ArrowDown className="h-3 w-3 text-primary" />
                                ) : (
                                  <ArrowUpDown className="h-3 w-3 opacity-40" />
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                // Loading skeleton rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {columns.map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton variant="text" className="w-full h-4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState title={emptyTitle} description={emptyDescription} />
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      'border-b border-border last:border-0 transition-colors',
                      'hover:bg-muted/30',
                      row.getIsSelected() && 'bg-primary/5',
                    )}
                    data-state={row.getIsSelected() ? 'selected' : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-foreground">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        page={currentPage}
        pageSize={currentPageSize}
        total={currentTotal}
        onPageChange={(p) => {
          if (isServerSide) {
            onPageChange?.(p);
          } else {
            setPagination((prev) => ({ ...prev, pageIndex: p - 1 }));
          }
        }}
        onPageSizeChange={
          onPageSizeChange ??
          (!isServerSide ? (size) => setPagination({ pageIndex: 0, pageSize: size }) : undefined)
        }
      />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface ReportTableProps {
  columns: string[];
  rows: any[];
  isLoading?: boolean;
}

export function ReportTable({ columns, rows, isLoading = false }: ReportTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterQuery, setFilterQuery] = useState('');

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  // 1. Filter, Sort, and Paginate rows
  const { paginatedRows, totalPages, totalItems } = React.useMemo(() => {
    const filtered = rows.filter((row) =>
      columns.some((col) =>
        String(row[col] ?? '')
          .toLowerCase()
          .includes(filterQuery.toLowerCase()),
      ),
    );

    const sorted = [...filtered];
    if (sortColumn) {
      sorted.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
        if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const total = sorted.length;
    const pages = Math.ceil(total / pageSize) || 1;
    const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return {
      paginatedRows: paginated,
      totalPages: pages,
      totalItems: total,
    };
  }, [rows, columns, filterQuery, sortColumn, sortDirection, currentPage, pageSize]);

  return (
    <Card className="bg-card border-border text-foreground select-none text-left print:border-none print:shadow-none print:bg-white print:text-black">
      {/* Top search controls */}
      <div className="p-3 border-b border-border flex flex-col sm:flex-row items-center gap-3 print:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Quick search active records..."
            value={filterQuery}
            onChange={(e) => {
              setFilterQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-8 pl-8 bg-muted border border-slate-855 rounded text-xs text-foreground focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
          <span>Show:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-card border border-border rounded p-1 text-[10px]"
          >
            <option value={5}>5 Rows</option>
            <option value={10}>10 Rows</option>
            <option value={20}>20 Rows</option>
            <option value={50}>50 Rows</option>
          </select>
        </div>
      </div>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-muted-foreground font-bold uppercase tracking-wider text-[10px] print:border-black">
                {columns.map((col) => (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="py-2.5 px-4 cursor-pointer hover:bg-accent/40 select-none transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>{col}</span>
                      {sortColumn === col && (
                        <span className="text-[9px] text-indigo-400">
                          {sortDirection === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-muted-foreground print:text-black print:divide-gray-300">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                    Loading records data...
                  </td>
                </tr>
              ) : paginatedRows.length > 0 ? (
                paginatedRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/10">
                    {columns.map((col) => (
                      <td key={col} className="py-2.5 px-4 text-foreground print:text-black">
                        {row[col] ?? ''}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="p-3 border-t border-border flex justify-between items-center text-xs text-muted-foreground font-mono print:hidden">
          <span>
            Page {currentPage} of {totalPages} ({totalItems} items)
          </span>

          <div className="flex gap-1.5">
            <Button
              size="icon"
              variant="ghost"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="h-7 w-7 border border-border text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="h-7 w-7 border border-border text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

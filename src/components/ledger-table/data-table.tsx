"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { columns } from "./columns"
import { Account, JournalEntry } from "@/lib/types"

interface DataTableProps {
  data: JournalEntry[]
  accounts: Account[]
}

export function DataTable({
  data,
  accounts,
}: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  // Get unique months from data
  const months = React.useMemo(() => {
    const uniqueDates = new Set(
      data.map((entry) => entry.date.substring(0, 7)) // Get YYYY-MM format
    )
    return Array.from(uniqueDates).sort().reverse() // Sort in descending order
  }, [data])

  const tableColumns = React.useMemo(
    () => columns({ accounts }),
    [accounts]
  )

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  // Format month for display
  const formatMonth = (yearMonth: string) => {
    if (yearMonth === 'all') return 'All months'
    const [year, month] = yearMonth.split('-')
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { 
      month: 'long', 
      year: 'numeric' 
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select
          value={(table.getColumn("date")?.getFilterValue() as string) ?? "all"}
          onValueChange={(value) => table.getColumn("date")?.setFilterValue(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by month">
              {formatMonth((table.getColumn("date")?.getFilterValue() as string) ?? "all")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All months</SelectItem>
            {months.map((month) => (
              <SelectItem key={month} value={month}>
                {formatMonth(month)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={(table.getColumn("accounts")?.getFilterValue() as string) ?? "all"}
          onValueChange={(value) => {
            table.getColumn("accounts")?.setFilterValue(value)
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by account">
              {(() => {
                const value = table.getColumn("accounts")?.getFilterValue() as string
                if (value === "all") return "All accounts"
                const account = accounts.find(a => a.id === value)
                return account?.name || "All accounts"
              })()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All accounts</SelectItem>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <div className="overflow-auto relative">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                {table.getHeaderGroups().map((headerGroup) => (
                  headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
} 
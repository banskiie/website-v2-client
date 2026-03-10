"use client"
import React, {
  cloneElement,
  ReactElement,
  ReactNode,
  useEffect,
  useState,
} from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../ui/table"
import LoadingPage from "@/components/loading-page"
import { on } from "events"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface DataTableProps<TData, TValue> {
  loading?: boolean
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

const ConvoDataTable = <TData, TValue>({
  loading = false,
  columns,
  data,
}: DataTableProps<TData, TValue>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
  const router = useRouter()

  if (loading) return <LoadingPage />

  return (
    <div className="rounded-md border">
      <Table>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                onClick={() =>
                  router.push(`/conversations/${(row.original as any)._id}`)
                }
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      cell.column.id !== "select" && "cursor-pointer",
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default ConvoDataTable

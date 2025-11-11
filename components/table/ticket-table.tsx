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
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  actionsColumn?: ReactNode
  rowView?: ReactNode
}

const TicketTable = <TData, TValue>({
  columns,
  data,
  actionsColumn,
  rowView,
}: DataTableProps<TData, TValue>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
  // For row view dialog
  const [viewId, setViewId] = useState<string | null>(null)
  const [openView, setOpenView] = useState(false)
  const router = useRouter()

  return (
    <div className="rounded-md border">
      {rowView &&
        cloneElement(rowView as ReactElement<any>, {
          _id: viewId,
          rowSettings: {
            clearId: () => setViewId(null),
            open: openView,
            onOpenChange: setOpenView,
          },
        })}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
          {/* {table.getFooterGroups().map((footerGroup) => (
            <TableRow key={footerGroup.id}>
              {footerGroup.headers.map((footer) => {
                return (
                  <TableHead
                    key={footer.id}
                    style={{
                      width: `${footer.getSize()}px`,
                    }}
                  >
                    {footer.isPlaceholder
                      ? null
                      : flexRender(
                          footer.column.columnDef.footer,
                          footer.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))} */}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={cn(
                  "hover:bg-muted/50",
                  (row.original as any)?.hasNewMessage &&
                    "bg-success/10 hover:bg-success/20 cursor-pointer"
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      cell.column.id !== "select" && "cursor-pointer"
                    )}
                    onClick={() =>
                      router.push(`/tickets/${(row.original as any)._id}`)
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
                {actionsColumn ? (
                  <TableCell className="w-1 whitespace-nowrap">
                    {React.cloneElement(
                      actionsColumn as React.ReactElement<any>,
                      {
                        data: row.original,
                      }
                    )}
                  </TableCell>
                ) : undefined}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Fetching data...
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default TicketTable

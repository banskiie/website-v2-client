"use client"
import React, { cloneElement, ReactElement, ReactNode, useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
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
import { cn } from "@/lib/utils"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { toast } from "sonner"
import { Copy } from "lucide-react"

interface DataTableProps<TData, TValue> {
  loading?: boolean
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  actionsColumn?: ReactNode
  rowView?: ReactNode
}

const DataTable = <TData, TValue>({
  loading = false,
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

  if (loading) return <LoadingPage />

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
          {table.getFooterGroups().map((footerGroup) => (
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
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={cn(
                  (row.original as any).isInSoftware
                    ? "bg-amber-50 hover:bg-amber-100"
                    : (row.original as any).isEarlyBird &&
                        "bg-cyan-50 hover:bg-cyan-100"
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      cell.column.id !== "select" && "cursor-pointer"
                    )}
                    onClick={() => {
                      if (cell.column.id === "select") return
                      setViewId((row.original as any)._id)
                      setOpenView((prev) => !prev)
                    }}
                  >
                    <ContextMenu>
                      <ContextMenuTrigger>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(
                              `${(row.original as any).entryNumber}_${
                                (row.original as any).entryKey
                              }`
                            )
                            toast.success(
                              `${(row.original as any).entryNumber}_${
                                (row.original as any).entryKey
                              }` + " copied to clipboard!"
                            )
                          }}
                        >
                          <Copy />
                          Copy Reference No.
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
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
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default DataTable

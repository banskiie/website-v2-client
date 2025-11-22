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
import { ITicket } from "@/types/ticket.interface"
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import AssignTicketDialog from "@/app/(auth)/tickets/dialogs/assign"

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
}: DataTableProps<TData, TValue>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
  const router = useRouter()

  return (
    <div className="border">
      <Table>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={cn(
                  "hover:bg-muted",
                  (row.original as ITicket).hasNewMessages &&
                    "bg-info/10 hover:bg-info/20"
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      cell.column.id !== "select" && "cursor-pointer"
                    )}
                    onClick={(e) => {
                      if (
                        !(e.target as HTMLElement).closest(
                          "[data-context-menu], [role='alertdialog'], [role='dialog']"
                        )
                      ) {
                        router.push(`/tickets/${(row.original as ITicket)._id}`)
                      }
                    }}
                  >
                    <ContextMenu>
                      <ContextMenuTrigger>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </ContextMenuTrigger>
                      <ContextMenuContent data-context-menu>
                        <AssignTicketDialog
                          _id={(row.original as ITicket)._id}
                        />
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
                No data found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default TicketTable

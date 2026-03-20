"use client"
import ColumnFilter from "@/components/table/column-filter"
import DataTable from "@/components/table/data-table"
import SortHeader from "@/components/table/sort-header"
import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group"
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { EntryStatus, IEntry, IEntryNode } from "@/types/entry.interface"
import { gql } from "@apollo/client"
import { useQuery } from "@apollo/client/react"
import { ColumnDef } from "@tanstack/react-table"
import { InfoIcon, Settings, Trash2Icon, Flag } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import FormDialog from "./dialogs/form"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ViewDialog from "./dialogs/view"
import { Checkbox } from "@/components/ui/checkbox"
import BatchMenu from "./dialogs/batch"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { format } from "date-fns/format"
import EntryStatusBadge from "@/components/badges/entry-status-badge"
import EntryTable from "@/components/table/entry-table"
import AssignDialog from "./dialogs/assign"
import ApproveDialog from "./dialogs/approve"
import RejectDialog from "./dialogs/reject"
import TransferDialog from "./dialogs/transfer-payment"
import ExportMenu from "./dialogs/export"
import CancelDialog from "./dialogs/cancel"

const ENTRIES = gql`
  query Entries(
    $first: Int
    $after: String
    $search: String
    $filter: [Filter]
    $sort: Sort
  ) {
    entries(
      first: $first
      after: $after
      search: $search
      filter: $filter
      sort: $sort
    ) {
      total
      pages
      edges {
        cursor
        node {
          _id
          dateUpdated
          entryNumber
          entryKey
          eventName
          tournamentName
          club
          isInSoftware
          isEarlyBird
          currentStatus
          hasOverpayment
          totalExcess
          pendingAmount
          latestPaymentAmount
          totalRefundAmount
          hasRefunds
          totalPaid
          playerList {
            player1Name
            player2Name
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

const ENTRY_CHANGED = gql`
  subscription EntryChanged {
    entryChanged {
      type
      entry {
        _id
        dateUpdated
        entryNumber
        entryKey
        eventName
        tournamentName
        club
        isInSoftware
        isEarlyBird
        currentStatus
        hasOverpayment
        totalExcess
        pendingAmount
        latestPaymentAmount
        totalRefundAmount
        hasRefunds
        totalPaid
        playerList {
          player1Name
          player2Name
        }
      }
      entries {
        _id
        dateUpdated
        entryNumber
        entryKey
        eventName
        tournamentName
        club
        isInSoftware
        isEarlyBird
        currentStatus
        hasOverpayment
        totalExcess
        pendingAmount
        latestPaymentAmount
        totalRefundAmount
        hasRefunds
        totalPaid
        playerList {
          player1Name
          player2Name
        }
      }
    }
  }
`

const REFUND_CHANGED = gql`
  subscription RefundChanged {
    refundChanged {
      type
      refund {
        _id
        payerName
        referenceNumber
        amount
        method
        refundDate
        entries
      }
    }
  }
`

const ActionsColumn = ({ data }: { data?: IEntryNode }) => {
  const entry = useMemo(() => data, [data])
  const [menuOpen, setMenuOpen] = useState(false)
  const status = useMemo(() => entry?.currentStatus, [entry])

  const canTransfer = useMemo(() => {
    const transferableStatuses = [
      "PAYMENT_PENDING",
      "PAYMENT_PARTIALLY_PAID",
      "PAYMENT_PAID",
      "PAYMENT_VERIFIED",
      "VERIFIED",
      "CANCELLED",
    ]
    return status && transferableStatuses.includes(status)
  }, [status])

  return (
    <DropdownMenu modal open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <Settings />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="left" align="start">
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <ViewDialog _id={entry?._id} />
          <FormDialog _id={entry?._id} onClose={() => setMenuOpen(false)} />

          {canTransfer && (
            <TransferDialog
              entryId={entry?._id}
              onClose={() => setMenuOpen(false)}
            />
          )}

          {status === "LEVEL_PENDING" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Level</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <ApproveDialog
                      _id={entry?._id}
                      onClose={() => setMenuOpen(false)}
                    />
                    <RejectDialog
                      _id={entry?._id}
                      onClose={() => setMenuOpen(false)}
                    />
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </>
          )}
          <DropdownMenuSeparator />
          <AssignDialog
            _id={entry?._id}
            onClose={() => setMenuOpen(false)}
            title={status === EntryStatus.PENDING ? "Assign" : "Reassign"}
          />

          <DropdownMenuSeparator />
          {status !== "CANCELLED" && (
            <>
              <CancelDialog
                _id={entry?._id}
                entryNumber={entry?.entryNumber}
                onClose={() => setMenuOpen(false)}
              />
            </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const Page = () => {
  // Pagination
  const [rows, setRows] = useState<number>(10)
  const [page, setPage] = useState<{
    current: number
    loaded: number
    max: number
  }>({
    current: 1,
    loaded: 1,
    max: 1,
  })
  // Global Search
  const [search, setSearch] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  // Column Sorting
  const [sort, setSort] = useState<{
    key: string
    order: "ASC" | "DESC"
  } | null>(null)
  // Column Filtering
  const [filter, setFilter] = useState<
    { key: string; value: string; type: string }[]
  >([])
  // Selected Rows
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  // Table Data Fetching
  const { data, loading, fetchMore, subscribeToMore, error }: any = useQuery(
    ENTRIES,
    {
      variables: {
        first: rows,
        search,
        sort: sort || {
          key: "dateUpdated",
          order: "DESC",
        }, // Default sort
        filter,
      },
      fetchPolicy: "network-only",
      notifyOnNetworkStatusChange: true,
    },
  )

  if (error) console.error(error)

  useEffect(() => {
    const unsubscribeRefund = subscribeToMore({
      document: REFUND_CHANGED,
      updateQuery: (prev: any, { subscriptionData }: any) => {
        if (!subscriptionData.data) return prev
        const { type, refund } = subscriptionData.data.refundChanged

        if (type === "CREATE") {
          toast.success(
            `Refund of ₱${refund.amount.toLocaleString()} processed for entries: ${refund.entries}`,
          )
        }

        return prev
      },
    })

    return () => unsubscribeRefund?.()
  }, [subscribeToMore])

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: ENTRY_CHANGED,
      updateQuery: (prev: any, { subscriptionData }: any) => {
        if (!subscriptionData.data) return prev
        const { type, entry, entries } = subscriptionData.data.entryChanged

        switch (type) {
          case "CREATE":
            const newEntry = entry
            const newEntryExists = prev.entries.edges.find(
              (edge: any) => edge.node._id === newEntry?._id,
            )
            if (newEntryExists) return prev

            if (!search && !sort && filter.length === 0) {
              toast.success(
                `Entry (${newEntry?.entryNumber}) has been created.`,
              )
            }

            return {
              entries: {
                ...prev.entries,
                total: prev.entries.total + 1,
                edges: [
                  { cursor: newEntry?._id, node: newEntry },
                  ...prev.entries.edges,
                ],
              },
            }
          case "VERIFIED":
            const verifiedEntry = entry

            toast.success(
              `Entry (${verifiedEntry?.entryNumber}) has been fully paid and verified! 🎉`,
            )

            const verifiedEdges = prev.entries.edges.map((edge: any) =>
              edge.node._id === verifiedEntry._id
                ? { ...edge, node: { ...verifiedEntry } }
                : edge,
            )

            return {
              entries: {
                ...prev.entries,
                edges: verifiedEdges,
              },
            }

          case "PAYMENT_TRANSFERRED":
          case "UPDATE": // Also handle UPDATE since transfers might come as UPDATE type
            const transferredEntry = entry

            // Check if this is a transfer by looking at the data
            const isTransfer =
              transferredEntry?.totalRefundAmount > 0 ||
              transferredEntry?.pendingAmount !== undefined

            if (isTransfer) {
              toast.info(
                `Payment transferred from entry (${transferredEntry?.entryNumber})`,
                {
                  description: `New balance: ₱${transferredEntry?.pendingAmount?.toLocaleString()}`,
                  duration: 5000,
                },
              )
            }

            const transferredEdges = prev.entries.edges.map((edge: any) => {
              if (edge.node._id === transferredEntry._id) {
                // Calculate remaining principal to ensure isFullyRefunded is correct
                const totalPaid =
                  transferredEntry.totalPaid ?? edge.node.totalPaid ?? 0
                const totalRefundAmount =
                  transferredEntry.totalRefundAmount ??
                  edge.node.totalRefundAmount ??
                  0
                const remainingPrincipal = totalPaid - totalRefundAmount

                return {
                  ...edge,
                  node: {
                    ...edge.node,
                    ...transferredEntry,
                    // Ensure all financial fields are explicitly set
                    pendingAmount:
                      transferredEntry.pendingAmount ?? edge.node.pendingAmount,
                    totalPaid: totalPaid,
                    totalRefundAmount: totalRefundAmount,
                    hasRefunds:
                      transferredEntry.hasRefunds ?? totalRefundAmount > 0,
                    hasOverpayment:
                      transferredEntry.hasOverpayment ??
                      transferredEntry.pendingAmount < 0,
                    totalExcess:
                      transferredEntry.totalExcess ??
                      (transferredEntry.pendingAmount < 0
                        ? Math.abs(transferredEntry.pendingAmount)
                        : 0),
                    currentStatus:
                      transferredEntry.currentStatus ?? edge.node.currentStatus,
                  },
                }
              }
              return edge
            })

            return {
              entries: {
                ...prev.entries,
                edges: transferredEdges,
              },
            }

          case "CANCEL":
            const cancelledEntry = entry

            if (
              cancelledEntry?.hasOverpayment &&
              cancelledEntry?.totalExcess > 0
            ) {
              toast.warning(
                `Entry (${cancelledEntry?.entryNumber}) has been cancelled. Excess amount: ₱${cancelledEntry?.totalExcess?.toLocaleString()}`,
                {
                  description:
                    "A refund may be required for the excess payment.",
                  duration: 5000,
                },
              )
            } else {
              toast.warning(
                `Entry (${cancelledEntry?.entryNumber}) has been cancelled.`,
                {
                  duration: 5000,
                },
              )
            }

            // console.log('Entry cancelled:', {
            //   entryNumber: cancelledEntry?.entryNumber,
            //   hasOverpayment: cancelledEntry?.hasOverpayment,
            //   totalExcess: cancelledEntry?.totalExcess,
            //   pendingAmount: cancelledEntry?.pendingAmount,
            //   totalRefundAmount: cancelledEntry?.totalRefundAmount,
            //   hasRefunds: cancelledEntry?.hasRefunds,
            //   totalPaid: cancelledEntry?.totalPaid,
            //   currentStatus: cancelledEntry?.currentStatus
            // })

            const cancelledEdges = prev.entries.edges.map((edge: any) =>
              edge.node._id === cancelledEntry._id
                ? {
                    ...edge,
                    node: {
                      ...edge.node,
                      ...cancelledEntry,
                      currentStatus: "CANCELLED",
                      hasOverpayment: cancelledEntry.hasOverpayment,
                      totalExcess: cancelledEntry.totalExcess,
                      pendingAmount: cancelledEntry.pendingAmount,
                      totalRefundAmount:
                        cancelledEntry.totalRefundAmount ||
                        edge.node.totalRefundAmount,
                      hasRefunds:
                        cancelledEntry.hasRefunds || edge.node.hasRefunds,
                      totalPaid:
                        cancelledEntry.totalPaid || edge.node.totalPaid,
                    },
                  }
                : edge,
            )

            return {
              entries: {
                ...prev.entries,
                edges: cancelledEdges,
              },
            }

          case "REFUND":
            // console.log('🟢 REFUND subscription received:', {
            //   entryNumber: entry?.entryNumber,
            //   totalRefundAmount: entry?.totalRefundAmount,
            //   hasRefunds: entry?.hasRefunds,
            //   totalPaid: entry?.totalPaid,
            //   pendingAmount: entry?.pendingAmount
            // });

            const refundedEntry = entry

            const refundMessage = refundedEntry?.hasOverRefund
              ? `Entry (${refundedEntry?.entryNumber}) has been over-refunded. Excess amount: ₱${refundedEntry?.totalOverRefund?.toLocaleString()}`
              : `Refund processed for entry (${refundedEntry?.entryNumber})`

            toast.info(refundMessage)

            const refundEdges = prev.entries.edges.map((edge: any) => {
              if (edge.node._id === refundedEntry._id) {
                // console.log('🟢 Updating edge for entry:', refundedEntry.entryNumber, 'with data:', refundedEntry);
                return {
                  ...edge,
                  node: {
                    ...edge.node,
                    ...refundedEntry,
                    hasOverpayment: refundedEntry.hasOverpayment,
                    totalExcess: refundedEntry.totalExcess,
                    pendingAmount: refundedEntry.pendingAmount,
                    totalRefundAmount: refundedEntry.totalRefundAmount,
                    hasRefunds: refundedEntry.hasRefunds,
                    totalPaid: refundedEntry.totalPaid,
                    latestPaymentAmount: refundedEntry.latestPaymentAmount,
                    currentStatus: refundedEntry.currentStatus,
                  },
                }
              }
              return edge
            })

            return {
              entries: {
                ...prev.entries,
                edges: refundEdges,
              },
            }

          case "UPDATE":
          case "ASSIGN":
          case "APPROVE":
          case "PAID":
          case "PARTIALLY_PAID":
          case "REJECT":
            const updatedEntry = entry

            if (
              type === "UPDATE" &&
              updatedEntry?.isEarlyBird === false &&
              updatedEntry?.pendingAmount > 0
            ) {
              // console.log('🕒 Early bird expired for entry:', {
              //   entryNumber: updatedEntry.entryNumber,
              //   newAmount: updatedEntry.pendingAmount
              // });

              if (!search && !sort && filter.length === 0) {
                toast.info(
                  `Early bird period expired for entry (${updatedEntry?.entryNumber}). ` +
                    `Amount updated to ₱${updatedEntry?.pendingAmount?.toLocaleString()}`,
                )
              }
            }
            // Handle regular approve
            else if (
              type === "APPROVE" &&
              !search &&
              !sort &&
              filter.length === 0
            ) {
              toast.success(
                `Entry (${updatedEntry?.entryNumber}) has been approved.`,
              )
            }
            // Handle paid
            else if (
              type === "PAID" &&
              !search &&
              !sort &&
              filter.length === 0
            ) {
              toast.success(
                `Entry (${updatedEntry?.entryNumber}) has been paid.`,
              )
            }
            // Handle reject
            else if (
              type === "REJECT" &&
              !search &&
              !sort &&
              filter.length === 0
            ) {
              toast.warning(
                `Entry (${updatedEntry?.entryNumber}) has been rejected.`,
              )
            }
            // Handle assign
            else if (
              type === "ASSIGN" &&
              !search &&
              !sort &&
              filter.length === 0
            ) {
              toast.info(
                `Entry (${updatedEntry?.entryNumber}) has been assigned.`,
              )
            }
            // Handle regular updates (including refunds)
            else if (
              type === "UPDATE" &&
              !search &&
              !sort &&
              filter.length === 0
            ) {
              if (
                updatedEntry?.hasRefunds ||
                updatedEntry?.totalRefundAmount > 0
              ) {
                const refundMessage = updatedEntry?.hasOverpayment
                  ? `Entry (${updatedEntry?.entryNumber}) refund processed. Excess amount: ₱${updatedEntry?.totalExcess?.toLocaleString()}`
                  : `Refund processed for entry (${updatedEntry?.entryNumber})`
                toast.info(refundMessage)
              } else {
                toast.success(
                  `Entry (${updatedEntry?.entryNumber}) has been updated.`,
                )
              }
            }

            const updatedEdges = prev.entries.edges.map((edge: any) => {
              if (edge.node._id === updatedEntry._id) {
                // Merge the updated data with existing data to ensure all fields are preserved
                return {
                  ...edge,
                  node: {
                    ...edge.node,
                    ...updatedEntry,
                    // Ensure these fields are properly updated
                    hasOverpayment:
                      updatedEntry.hasOverpayment ?? edge.node.hasOverpayment,
                    totalExcess:
                      updatedEntry.totalExcess ?? edge.node.totalExcess,
                    pendingAmount:
                      updatedEntry.pendingAmount ?? edge.node.pendingAmount,
                    totalRefundAmount:
                      updatedEntry.totalRefundAmount ??
                      edge.node.totalRefundAmount,
                    hasRefunds: updatedEntry.hasRefunds ?? edge.node.hasRefunds,
                    totalPaid: updatedEntry.totalPaid ?? edge.node.totalPaid,
                    latestPaymentAmount:
                      updatedEntry.latestPaymentAmount ??
                      edge.node.latestPaymentAmount,
                    currentStatus:
                      updatedEntry.currentStatus ?? edge.node.currentStatus,
                    isEarlyBird:
                      updatedEntry.isEarlyBird ?? edge.node.isEarlyBird,
                  },
                }
              }
              return edge
            })

            return {
              entries: {
                ...prev.entries,
                edges: updatedEdges,
              },
            }

          case "DELETE":
            const deletedEntry = entry

            if (!search && !sort && filter.length === 0) {
              toast.success(
                `Entry (${deletedEntry?.entryNumber}) has been deleted.`,
              )
            }

            return {
              entries: {
                ...prev.entries,
                total: prev.entries.total - 1,
                edges: prev.entries.edges.filter(
                  (edge: any) => edge.node._id !== deletedEntry._id,
                ),
              },
            }

          case "BATCH_UPDATE":
            const updatedEntries = entries

            if (!search && !sort && filter.length === 0) {
              toast.success(
                `Batch update successful for ${updatedEntries.length} entries.`,
              )
            }

            const updatedIds = new Set(updatedEntries.map((u: any) => u._id))

            return {
              entries: {
                ...prev.entries,
                edges: prev.entries.edges.map((edge: any) =>
                  updatedIds.has(edge.node._id)
                    ? {
                        ...edge,
                        node: {
                          ...edge.node,
                          ...updatedEntries.find(
                            (u: any) => u._id === edge.node._id,
                          ),
                        },
                      }
                    : edge,
                ),
              },
            }

          default:
            return prev
        }
      },
    })

    return () => unsubscribe?.()
  }, [subscribeToMore, search, sort, filter])

  // Memoized Data Processing
  const { total, nodes, pageInfo } = useMemo(() => {
    const nodes = data?.entries.edges.map((edge: any) => edge.node) || []
    const pageInfo = data?.entries.pageInfo

    setPage((prev) => ({
      ...prev,
      max: data?.entries.pages || 1,
    }))

    return {
      total: data?.entries.total || 0,
      nodes,
      pageInfo,
    }
  }, [data])

  // Reset to First Page
  const resetPage = () => setPage({ current: 1, loaded: 1, max: 1 })

  // On Search
  const onSearch = (value: string) => {
    setSearch(value)
    resetPage()
  }

  // On Filter
  const onFilter = useCallback((value: any) => {
    setFilter(value)
    resetPage()
  }, [])

  // On Sort
  const onSort = useCallback((value: any) => {
    setSort(value)
    resetPage()
  }, [])

  // Table Columns
  // Table Columns
  const columns: ColumnDef<IEntryNode>[] = useMemo(
    () => [
      {
        id: "select",
        footer: () => {
          return (
            <Checkbox
              checked={
                selectedIds.size === data?.entries.edges.length &&
                data?.entries.edges.length > 0
              }
              className="hover:cursor-pointer"
              onCheckedChange={(value: boolean) => {
                if (value) {
                  const allIds = new Set<string>(
                    data?.entries.edges.map((edge: any) => edge.node._id),
                  )
                  setSelectedIds(allIds)
                } else {
                  setSelectedIds(new Set())
                }
              }}
            />
          )
        },
        cell: ({ row }) => {
          const isChecked = selectedIds.has((row.original as any)._id)
          return (
            <Checkbox
              checked={isChecked}
              className="hover:cursor-pointer"
              onCheckedChange={(value: boolean) => {
                setSelectedIds((prev) => {
                  const newSet = new Set(prev)
                  if (value) {
                    newSet.add((row.original as any)._id)
                  } else {
                    newSet.delete((row.original as any)._id)
                  }
                  return newSet
                })
              }}
            />
          )
        },
        size: 10,
      },
      {
        accessorKey: "dateUpdated",
        header: () => (
          <SortHeader
            label="Date"
            sortKey="dateUpdated"
            sortState={sort}
            onSortChange={onSort}
          />
        ),
        footer: () => (
          <ColumnFilter
            label="Date"
            filterKey="dateUpdated"
            filterType="DATE_RANGE"
            filterValue={filter}
            onFilterChange={onFilter}
          />
        ),
        cell: ({ row }) => (
          <div className="h-full flex flex-col items-start">
            <span className="block">
              {format(
                new Date((row.original as any).dateUpdated),
                "MMM dd, p",
              )}{" "}
            </span>
            <div className="inline-flex gap-1">
              {row.original.isEarlyBird && (
                <Badge variant="outline-info" className="text-[0.65rem] px-1.5">
                  Early Bird
                </Badge>
              )}
              {row.original.isInSoftware && (
                <Badge
                  variant="outline-warning"
                  className="text-[0.65rem] px-1.5"
                >
                  In Software
                </Badge>
              )}
            </div>
          </div>
        ),
        size: 80,
      },
      {
        accessorKey: "entryNumber",
        header: () => (
          <SortHeader
            label="Entry No."
            sortKey="entryDetails"
            sortState={sort}
            onSortChange={onSort}
          />
        ),
        footer: () => (
          <ColumnFilter
            label="Entry No."
            filterKey="entryDetails"
            filterType="TEXT"
            filterValue={filter}
            onFilterChange={onFilter}
          />
        ),
        cell: ({ row }) => {
          const { entryNumber, entryKey, hasOverpayment, totalExcess } =
            row.original as any

          return (
            <div className="h-full flex flex-col justify-center">
              <div className="flex items-center gap-1">
                <span className="block">{entryNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="block text-xs text-muted-foreground">
                  {entryKey}
                </span>
              </div>
            </div>
          )
        },
        size: 120,
      },
      {
        accessorKey: "eventName",
        header: () => (
          <SortHeader
            label="Event"
            sortKey="event"
            sortState={sort}
            onSortChange={onSort}
          />
        ),
        footer: () => (
          <ColumnFilter
            label="Event"
            filterKey="event"
            filterType="TEXT"
            filterValue={filter}
            onFilterChange={onFilter}
          />
        ),
        cell: ({ row }) => {
          const { eventName, tournamentName } = row.original as any
          return (
            <div className="h-full flex flex-col justify-center">
              <span className="block capitalize">
                {eventName.toLocaleLowerCase()}
              </span>
              <span className="block text-xs text-muted-foreground">
                {tournamentName}
              </span>
            </div>
          )
        },
        size: 80,
      },
      {
        accessorKey: "playerList",
        header: "Players",
        footer: () => (
          <ColumnFilter
            label="Players"
            filterKey="players"
            filterType="TEXT"
            filterValue={filter}
            onFilterChange={onFilter}
          />
        ),
        cell: ({ row }) => {
          const { playerList, club } = row.original as any
          return (
            <div className="h-full flex flex-col justify-center">
              <span className="block">{playerList.player1Name}</span>
              <span className="block">{playerList.player2Name}</span>
              <span className="block text-xs text-muted-foreground">
                {club}
              </span>
            </div>
          )
        },
        size: 200,
      },
      {
        accessorKey: "currentStatus",
        header: () => (
          <SortHeader
            label="Status"
            sortKey="currentStatus"
            sortState={sort}
            onSortChange={onSort}
          />
        ),
        footer: () => (
          <ColumnFilter
            label="Status"
            filterKey="currentStatus"
            filterType="SELECT"
            options={Object.values(EntryStatus).map((status) => ({
              label: status.toLocaleLowerCase().replaceAll("_", " "),
              value: status,
            }))}
            filterValue={filter}
            onFilterChange={onFilter}
          />
        ),
        cell: ({ row }) => {
          const {
            currentStatus,
            pendingAmount,
            totalRefundAmount,
            hasRefunds,
            totalPaid,
          } = row.original as any

          const remainingPrincipal = totalPaid
            ? totalPaid - (totalRefundAmount || 0)
            : 0
          const isFullyRefunded = remainingPrincipal === 0

          return (
            <div className="flex flex-col justify-center gap-1">
              <EntryStatusBadge status={currentStatus as EntryStatus} />

              {currentStatus === "CANCELLED" && (
                <div className="flex flex-col gap-0.5 mt-1">
                  <div className="flex items-center gap-1 flex-wrap">
                    {/* Show Refunded amount only if NOT fully refunded */}
                    {hasRefunds &&
                      totalRefundAmount > 0 &&
                      !isFullyRefunded && (
                        <span className="text-[11px] font-medium text-green-600">
                          Refunded: ₱{totalRefundAmount.toLocaleString()}
                        </span>
                      )}

                    {remainingPrincipal > 0 && (
                      <>
                        {hasRefunds && !isFullyRefunded && (
                          <span className="text-[11px] text-gray-400">•</span>
                        )}
                        <span className="text-[11px] font-medium text-orange-600">
                          Remaining: ₱{remainingPrincipal.toLocaleString()}
                        </span>
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="size-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              Total paid: ₱{totalPaid.toLocaleString()} |
                              Refunded: ₱{totalRefundAmount.toLocaleString()} |
                              Remaining: ₱{remainingPrincipal.toLocaleString()}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </>
                    )}

                    {/* Show nothing when fully refunded - just the CANCELLED badge */}
                    {isFullyRefunded && !remainingPrincipal && (
                      <span className="text-[11px] font-medium text-gray-500">
                        Fully refunded
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* DON'T show any balance information for REJECTED status */}
              {currentStatus === "REJECTED" && (
                <div className="flex items-center gap-1 mt-1">
                  {/* No balance or excess information shown for rejected entries */}
                </div>
              )}

              {/* Only show excess and balance for non-cancelled, non-rejected entries */}
              {currentStatus !== "CANCELLED" &&
                currentStatus !== "REJECTED" &&
                pendingAmount < 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[11px] font-medium text-blue-600">
                      Excess: ₱{Math.abs(pendingAmount).toLocaleString()}
                    </span>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="size-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          This entry has an overpayment of ₱
                          {Math.abs(pendingAmount).toLocaleString()}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}

              {currentStatus !== "CANCELLED" &&
                currentStatus !== "REJECTED" &&
                pendingAmount > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[11px] font-medium text-orange-600">
                      Balance Due: ₱{pendingAmount.toLocaleString()}
                    </span>
                  </div>
                )}
            </div>
          )
        },
        size: 20,
      },
      // {
      //   accessorKey: "currentStatus",
      //   header: () => (
      //     <SortHeader
      //       label="Status"
      //       sortKey="currentStatus"
      //       sortState={sort}
      //       onSortChange={onSort}
      //     />
      //   ),
      //   footer: () => (
      //     <ColumnFilter
      //       label="Status"
      //       filterKey="currentStatus"
      //       filterType="SELECT"
      //       options={Object.values(EntryStatus).map((status) => ({
      //         label: status.toLocaleLowerCase().replaceAll("_", " "),
      //         value: status,
      //       }))}
      //       filterValue={filter}
      //       onFilterChange={onFilter}
      //     />
      //   ),
      //   cell: ({ row }) => {
      //     const {
      //       currentStatus,
      //       totalExcess,
      //       hasOverpayment,
      //       hasOverRefund,
      //       totalOverRefund,
      //       latestPaymentAmount,
      //       pendingAmount
      //     } = row.original as any

      //     return (
      //       <div className="flex flex-col justify-center gap-1">
      //         <EntryStatusBadge status={currentStatus as EntryStatus} />

      //         {/* Show over-refund indicator */}
      //         {hasOverRefund && totalOverRefund > 0 && (
      //           <div className="flex items-center gap-1 mt-1">
      //             <span className="text-[11px] font-medium text-orange-600">
      //               Over-refund: ₱{totalOverRefund.toLocaleString()}
      //             </span>
      //           </div>
      //         )}

      //         {/* Show excess payment indicator */}
      //         {hasOverpayment && totalExcess > 0 && (
      //           <div className="flex items-center gap-1 mt-1">
      //             <span className="text-[11px] font-medium text-blue-600">
      //               Excess: ₱{totalExcess.toLocaleString()}
      //             </span>
      //           </div>
      //         )}

      //         {/* Show current balance */}
      //         {pendingAmount > 0 && (
      //           <div className="flex items-center gap-1 mt-1">
      //             <span className="text-[11px] font-medium text-purple-600">
      //               Balance: ₱{pendingAmount.toLocaleString()}
      //             </span>
      //           </div>
      //         )}

      //         {/* Show refund amount for cancelled entries */}
      //         {currentStatus === "CANCELLED" && latestPaymentAmount > 0 && (
      //           <div className="flex items-center gap-1 mt-1">
      //             <span className="text-[11px] font-medium text-green-600">
      //               Refund Amount: ₱{latestPaymentAmount.toLocaleString()}
      //             </span>
      //           </div>
      //         )}
      //       </div>
      //     )
      //   },
      //   size: 20,
      // },
    ],
    [sort, onSort, filter, onFilter, selectedIds, data?.entries],
  )

  const goNext = async () => {
    if (page.current === page.max) return
    if (page.current === page.loaded) {
      await fetchMore({
        variables: {
          first: rows,
          after: pageInfo.endCursor,
          search,
          sort,
          filter,
        },
        updateQuery: (prev: any, { fetchMoreResult: more }: any) => {
          if (!more) return prev
          return {
            entries: {
              ...prev.entries,
              edges: [...prev.entries.edges, ...more.entries.edges],
              pageInfo: more.entries.pageInfo,
            },
          }
        },
      })
      setPage((prev) => ({
        ...prev,
        loaded: prev.loaded + 1,
      }))
    }

    setPage((prev) => ({
      ...prev,
      current: prev.current + 1,
    }))
  }

  const goPrev = () => {
    if (page.current === 1) return
    setPage((prev) => ({
      ...prev,
      current: prev.current - 1,
    }))
  }

  return (
    <div className="w-full h-full flex-1 flex flex-col gap-2">
      <div className="flex items-center gap-1 text-slate-900 -mb-1.5">
        <Flag className="size-5" />
        <Label className="text-2xl">Entries</Label>
      </div>
      <div className="w-full flex justify-between">
        <InputGroup className="w-[350px]">
          <InputGroupInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
            placeholder="Type to search..."
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearch(searchTerm)
              if (e.key === "Escape") {
                setSearchTerm("")
                onSearch("")
              }
            }}
          />
          <InputGroupAddon align="inline-end" className="-mr-1.5">
            <InputGroupButton onClick={() => onSearch(searchTerm)}>
              Search
            </InputGroupButton>
          </InputGroupAddon>
          {searchTerm && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                onClick={() => {
                  onSearch("")
                  setSearchTerm("")
                }}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive hover:border-destructive"
                variant="outline"
              >
                Clear
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
        <div className="flex items-center gap-2">
          <ExportMenu />
          {selectedIds.size > 0 && (
            <>
              <BatchMenu
                ids={Array.from(selectedIds)}
                clearSelected={() => setSelectedIds(new Set())}
              />
              <Button
                variant="outline-destructive"
                onClick={() => setSelectedIds(new Set())}
              >
                <Trash2Icon className="size-3.5" />
                Clear Selection
              </Button>
            </>
          )}
          {sort && (
            <Button variant="outline-destructive" onClick={() => onSort(null)}>
              <Trash2Icon className="size-3.5" />
              Clear Sorting
            </Button>
          )}
          {filter.length > 0 && (
            <Button variant="outline-destructive" onClick={() => onFilter([])}>
              <Trash2Icon className="size-3.5" />
              Clear Filtering
            </Button>
          )}
          <FormDialog />
        </div>
      </div>
      <div className="w-full flex justify-between">
        <div className="px-1.5 flex items-center justify-center">
          {loading ? (
            <span className="text-sm text-muted-foreground">Loading...</span>
          ) : total === 0 ? (
            <span className="text-sm text-muted-foreground">No results.</span>
          ) : (
            <div className="space-x-0.5">
              <span className="text-sm text-muted-foreground">
                Showing {(page.current - 1) * rows + 1}-
                {page.current === page.max ? total : page.current * rows} out of{" "}
                {total} result{total === 1 ? "" : "s"}.{" "}
                {selectedIds.size > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ({selectedIds.size} row{selectedIds.size > 1 ? "s" : ""}{" "}
                    selected)
                  </span>
                )}
              </span>
              {(sort || filter.length > 0 || search) && (
                <Tooltip>
                  <TooltipTrigger className="hover:cursor-pointer text-muted-foreground">
                    <InfoIcon className="size-3.25" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center">
                    <div className="flex flex-col">
                      {search && (
                        <div>
                          <span className="block">
                            Search term:{" "}
                            <span className="block"> • "{search}"</span>
                          </span>
                        </div>
                      )}
                      {sort && (
                        <div>
                          <span className="block">
                            Sorted by:
                            <span className="block">
                              • {sort.key} → {sort.order}
                            </span>
                          </span>
                        </div>
                      )}
                      {filter.length > 0 && (
                        <div>
                          <span className="block">
                            Filtered by:
                            {filter.map((f, i) => (
                              <span className="block" key={i}>
                                • {f.key} → {f.value}
                              </span>
                            ))}
                          </span>
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <div className="flex items-center justify-center gap-2">
            <ButtonGroup>
              <ButtonGroupText className="font-normal text-muted-foreground">
                Rows
              </ButtonGroupText>
              <Select
                onValueChange={(value) => setRows(parseInt(value))}
                value={rows.toString()}
              >
                <SelectTrigger size="sm" className="hover:bg-gray-100">
                  <SelectValue placeholder="Row Count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Row Count</SelectLabel>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </ButtonGroup>
          </div>
          <div className="flex items-center gap-2">
            <ButtonGroup>
              <Button
                size="sm"
                variant="outline"
                disabled={page.current === 1}
                onClick={goPrev}
                className="disabled:bg-muted disabled:border-gray-300"
              >
                Prev
              </Button>
              <ButtonGroupText className="font-normal text-muted-foreground">
                Page {page.current} of {page.max}
              </ButtonGroupText>
              <Button
                variant="outline"
                disabled={page.current === page.max}
                onClick={goNext}
                size="sm"
                className="disabled:bg-muted disabled:border-gray-300"
              >
                Next
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </div>
      <EntryTable
        loading={loading}
        columns={columns}
        data={nodes.slice((page.current - 1) * rows, page.current * rows)}
        actionsColumn={<ActionsColumn />}
        rowView={<ViewDialog row />}
      />
    </div>
  )
}

export default Page

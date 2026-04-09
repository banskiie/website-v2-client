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
                    <ApproveDialog _id={entry?._id} onClose={() => setMenuOpen(false)} variant="dropdown" />
                    <RejectDialog _id={entry?._id} onClose={() => setMenuOpen(false)} variant="dropdown" />
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
        },
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
    return () => {
      if (typeof unsubscribeRefund === "function") {
        unsubscribeRefund()
      }
    }
  }, [subscribeToMore])

  // March 9
  // useEffect(() => {
  //   const unsubscribe = subscribeToMore({
  //     document: ENTRY_CHANGED,
  //     updateQuery: (prev: any, { subscriptionData }: any) => {
  //       if (!subscriptionData.data) return prev
  //       const { type, entry, entries } = subscriptionData.data.entryChanged

  //       switch (type) {
  //         case "CREATE":
  //           const newEntry = entry
  //           const newEntryExists = prev.entries.edges.find(
  //             (edge: any) => edge.node._id === newEntry?._id,
  //           )
  //           if (newEntryExists) return prev

  //           if (!search && !sort && filter.length === 0) {
  //             toast.success(
  //               `Entry (${newEntry?.entryNumber}) has been created.`,
  //             )
  //           }

  //           return {
  //             entries: {
  //               ...prev.entries,
  //               total: prev.entries.total + 1,
  //               edges: [
  //                 { cursor: newEntry?._id, node: newEntry },
  //                 ...prev.entries.edges,
  //               ],
  //             },
  //           }

  //         case "VERIFIED":
  //           const verifiedEntry = entry

  //           toast.success(
  //             `Entry (${verifiedEntry?.entryNumber}) has been fully paid and verified! 🎉`,
  //           )

  //           const verifiedEdges = prev.entries.edges.map((edge: any) =>
  //             edge.node._id === verifiedEntry._id
  //               ? { ...edge, node: { ...verifiedEntry } }
  //               : edge,
  //           )

  //           return {
  //             entries: {
  //               ...prev.entries,
  //               edges: verifiedEdges,
  //             },
  //           }

  //         case "PAYMENT_TRANSFERRED":
  //           const paymentTransferredEntry = entry

  //           // Only show the payment transferred toast for this specific type
  //           toast.info(
  //             `Payment transferred from entry (${paymentTransferredEntry?.entryNumber})`,
  //             {
  //               description: `New balance: ₱${paymentTransferredEntry?.pendingAmount?.toLocaleString()}`,
  //               duration: 5000,
  //             },
  //           )

  //           const paymentTransferredEdges = prev.entries.edges.map((edge: any) => {
  //             if (edge.node._id === paymentTransferredEntry._id) {
  //               const totalPaid =
  //                 paymentTransferredEntry.totalPaid ?? edge.node.totalPaid ?? 0
  //               const totalRefundAmount =
  //                 paymentTransferredEntry.totalRefundAmount ??
  //                 edge.node.totalRefundAmount ??
  //                 0
  //               const remainingPrincipal = totalPaid - totalRefundAmount

  //               return {
  //                 ...edge,
  //                 node: {
  //                   ...edge.node,
  //                   ...paymentTransferredEntry,
  //                   pendingAmount:
  //                     paymentTransferredEntry.pendingAmount ?? edge.node.pendingAmount,
  //                   totalPaid: totalPaid,
  //                   totalRefundAmount: totalRefundAmount,
  //                   hasRefunds:
  //                     paymentTransferredEntry.hasRefunds ?? totalRefundAmount > 0,
  //                   hasOverpayment:
  //                     paymentTransferredEntry.hasOverpayment ??
  //                     paymentTransferredEntry.pendingAmount < 0,
  //                   totalExcess:
  //                     paymentTransferredEntry.totalExcess ??
  //                     (paymentTransferredEntry.pendingAmount < 0
  //                       ? Math.abs(paymentTransferredEntry.pendingAmount)
  //                       : 0),
  //                   currentStatus:
  //                     paymentTransferredEntry.currentStatus ?? edge.node.currentStatus,
  //                 },
  //               }
  //             }
  //             return edge
  //           })

  //           return {
  //             entries: {
  //               ...prev.entries,
  //               edges: paymentTransferredEdges,
  //             },
  //           }

  //         case "CANCEL":
  //           const cancelledEntry = entry

  //           if (
  //             cancelledEntry?.hasOverpayment &&
  //             cancelledEntry?.totalExcess > 0
  //           ) {
  //             toast.warning(
  //               `Entry (${cancelledEntry?.entryNumber}) has been cancelled. Excess amount: ₱${cancelledEntry?.totalExcess?.toLocaleString()}`,
  //               {
  //                 description:
  //                   "A refund may be required for the excess payment.",
  //                 duration: 5000,
  //               },
  //             )
  //           } else {
  //             toast.warning(
  //               `Entry (${cancelledEntry?.entryNumber}) has been cancelled.`,
  //               {
  //                 duration: 5000,
  //               },
  //             )
  //           }

  //           const cancelledEdges = prev.entries.edges.map((edge: any) =>
  //             edge.node._id === cancelledEntry._id
  //               ? {
  //                 ...edge,
  //                 node: {
  //                   ...edge.node,
  //                   ...cancelledEntry,
  //                   currentStatus: "CANCELLED",
  //                   hasOverpayment: cancelledEntry.hasOverpayment,
  //                   totalExcess: cancelledEntry.totalExcess,
  //                   pendingAmount: cancelledEntry.pendingAmount,
  //                   totalRefundAmount:
  //                     cancelledEntry.totalRefundAmount ||
  //                     edge.node.totalRefundAmount,
  //                   hasRefunds:
  //                     cancelledEntry.hasRefunds || edge.node.hasRefunds,
  //                   totalPaid:
  //                     cancelledEntry.totalPaid || edge.node.totalPaid,
  //                 },
  //               }
  //               : edge,
  //           )

  //           return {
  //             entries: {
  //               ...prev.entries,
  //               edges: cancelledEdges,
  //             },
  //           }

  //         case "REFUND":
  //           const refundedEntry = entry

  //           const refundMessage = refundedEntry?.isFullyRefunded
  //             ? `Entry (${refundedEntry?.entryNumber}) has been fully refunded.`
  //             : `Refund processed for entry (${refundedEntry?.entryNumber})`

  //           toast.info(refundMessage)

  //           const refundEdges = prev.entries.edges.map((edge: any) => {
  //             if (edge.node._id === refundedEntry._id) {
  //               return {
  //                 ...edge,
  //                 node: {
  //                   ...edge.node,
  //                   ...refundedEntry,
  //                   hasOverpayment: refundedEntry.hasOverpayment,
  //                   totalExcess: refundedEntry.totalExcess,
  //                   pendingAmount: refundedEntry.pendingAmount,
  //                   totalRefundAmount: refundedEntry.totalRefundAmount,
  //                   hasRefunds: refundedEntry.hasRefunds,
  //                   totalPaid: refundedEntry.totalPaid,
  //                   latestPaymentAmount: refundedEntry.latestPaymentAmount,
  //                   currentStatus: refundedEntry.currentStatus,
  //                   remainingPrincipal: refundedEntry.remainingPrincipal,
  //                   isFullyRefunded: refundedEntry.isFullyRefunded,
  //                 },
  //               }
  //             }
  //             return edge
  //           })

  //           return {
  //             entries: {
  //               ...prev.entries,
  //               edges: refundEdges,
  //             },
  //           }

  //         case "UPDATE":
  //           const updatedEntry = entry

  //           // Only show toast for regular updates (not payment related)
  //           // Check if this is a regular update (changing player info, club, etc.)
  //           const isRegularUpdate =
  //             updatedEntry?.totalRefundAmount === undefined &&
  //             updatedEntry?.pendingAmount === undefined &&
  //             updatedEntry?.hasOverpayment === undefined

  //           // Check if this is an early bird expiry (coming from a scheduled job)
  //           // You need to add a flag in your resolver to indicate this is an automatic expiry
  //           const isAutoEarlyBirdExpiry = updatedEntry?.isAutoEarlyBirdExpiry === true

  //           if (isAutoEarlyBirdExpiry && updatedEntry?.isEarlyBird === false && updatedEntry?.pendingAmount > 0) {
  //             if (!search && !sort && filter.length === 0) {
  //               toast.info(
  //                 `Early bird period expired for entry (${updatedEntry?.entryNumber}). ` +
  //                 `Amount updated to ₱${updatedEntry?.pendingAmount?.toLocaleString()}`,
  //               )
  //             }
  //           } else if (isRegularUpdate && !search && !sort && filter.length === 0) {
  //             toast.success(
  //               `Entry (${updatedEntry?.entryNumber}) has been updated.`,
  //             )
  //           }

  //           const updatedEdges = prev.entries.edges.map((edge: any) => {
  //             if (edge.node._id === updatedEntry._id) {
  //               return {
  //                 ...edge,
  //                 node: {
  //                   ...edge.node,
  //                   ...updatedEntry,
  //                   hasOverpayment:
  //                     updatedEntry.hasOverpayment ?? edge.node.hasOverpayment,
  //                   totalExcess:
  //                     updatedEntry.totalExcess ?? edge.node.totalExcess,
  //                   pendingAmount:
  //                     updatedEntry.pendingAmount ?? edge.node.pendingAmount,
  //                   totalRefundAmount:
  //                     updatedEntry.totalRefundAmount ??
  //                     edge.node.totalRefundAmount,
  //                   hasRefunds: updatedEntry.hasRefunds ?? edge.node.hasRefunds,
  //                   totalPaid: updatedEntry.totalPaid ?? edge.node.totalPaid,
  //                   latestPaymentAmount:
  //                     updatedEntry.latestPaymentAmount ??
  //                     edge.node.latestPaymentAmount,
  //                   currentStatus:
  //                     updatedEntry.currentStatus ?? edge.node.currentStatus,
  //                   isEarlyBird:
  //                     updatedEntry.isEarlyBird ?? edge.node.isEarlyBird,
  //                 },
  //               }
  //             }
  //             return edge
  //           })

  //           return {
  //             entries: {
  //               ...prev.entries,
  //               edges: updatedEdges,
  //             },
  //           }

  //         case "ASSIGN":
  //           const assignEntry = entry

  //           if (!search && !sort && filter.length === 0) {
  //             toast.info(
  //               `Entry (${assignEntry?.entryNumber}) has been assigned.`,
  //             )
  //           }

  //           const assignEdges = prev.entries.edges.map((edge: any) => {
  //             if (edge.node._id === assignEntry._id) {
  //               return {
  //                 ...edge,
  //                 node: {
  //                   ...edge.node,
  //                   ...assignEntry,
  //                 },
  //               }
  //             }
  //             return edge
  //           })

  //           return {
  //             entries: {
  //               ...prev.entries,
  //               edges: assignEdges,
  //             },
  //           }

  //         case "APPROVE":
  //           const approveEntry = entry

  //           if (!search && !sort && filter.length === 0) {
  //             toast.success(
  //               `Entry (${approveEntry?.entryNumber}) has been approved.`,
  //             )
  //           }

  //           const approveEdges = prev.entries.edges.map((edge: any) => {
  //             if (edge.node._id === approveEntry._id) {
  //               return {
  //                 ...edge,
  //                 node: {
  //                   ...edge.node,
  //                   ...approveEntry,
  //                 },
  //               }
  //             }
  //             return edge
  //           })

  //           return {
  //             entries: {
  //               ...prev.entries,
  //               edges: approveEdges,
  //             },
  //           }

  //         case "PAID":
  //           const paidEntry = entry

  //           if (!search && !sort && filter.length === 0) {
  //             toast.success(
  //               `Entry (${paidEntry?.entryNumber}) has been paid.`,
  //             )
  //           }

  //           const paidEdges = prev.entries.edges.map((edge: any) => {
  //             if (edge.node._id === paidEntry._id) {
  //               return {
  //                 ...edge,
  //                 node: {
  //                   ...edge.node,
  //                   ...paidEntry,
  //                 },
  //               }
  //             }
  //             return edge
  //           })

  //           return {
  //             entries: {
  //               ...prev.entries,
  //               edges: paidEdges,
  //             },
  //           }

  //         case "PARTIALLY_PAID":
  //           const partiallyPaidEntry = entry

  //           if (!search && !sort && filter.length === 0) {
  //             toast.info(
  //               `Entry (${partiallyPaidEntry?.entryNumber}) has been partially paid.`,
  //             )
  //           }

  //           const partiallyPaidEdges = prev.entries.edges.map((edge: any) => {
  //             if (edge.node._id === partiallyPaidEntry._id) {
  //               return {
  //                 ...edge,
  //                 node: {
  //                   ...edge.node,
  //                   ...partiallyPaidEntry,
  //                 },
  //               }
  //             }
  //             return edge
  //           })

  //           return {
  //             entries: {
  //               ...prev.entries,
  //               edges: partiallyPaidEdges,
  //             },
  //           }

  //         case "REJECT":
  //           const rejectEntry = entry

  //           if (!search && !sort && filter.length === 0) {
  //             toast.warning(
  //               `Entry (${rejectEntry?.entryNumber}) has been rejected.`,
  //             )
  //           }

  //           const rejectEdges = prev.entries.edges.map((edge: any) => {
  //             if (edge.node._id === rejectEntry._id) {
  //               return {
  //                 ...edge,
  //                 node: {
  //                   ...edge.node,
  //                   ...rejectEntry,
  //                 },
  //               }
  //             }
  //             return edge
  //           })

  //           return {
  //             entries: {
  //               ...prev.entries,
  //               edges: rejectEdges,
  //             },
  //           }

  //         case "DELETE":
  //           const deletedEntry = entry

  //           if (!search && !sort && filter.length === 0) {
  //             toast.success(
  //               `Entry (${deletedEntry?.entryNumber}) has been deleted.`,
  //             )
  //           }

  //           return {
  //             entries: {
  //               ...prev.entries,
  //               total: prev.entries.total - 1,
  //               edges: prev.entries.edges.filter(
  //                 (edge: any) => edge.node._id !== deletedEntry._id,
  //               ),
  //             },
  //           }

  //         case "BATCH_UPDATE":
  //           const updatedEntries = entries

  //           if (!search && !sort && filter.length === 0) {
  //             toast.success(
  //               `Batch update successful for ${updatedEntries.length} entries.`,
  //             )
  //           }

  //           const updatedIds = new Set(updatedEntries.map((u: any) => u._id))

  //           return {
  //             entries: {
  //               ...prev.entries,
  //               edges: prev.entries.edges.map((edge: any) =>
  //                 updatedIds.has(edge.node._id)
  //                   ? {
  //                     ...edge,
  //                     node: {
  //                       ...edge.node,
  //                       ...updatedEntries.find(
  //                         (u: any) => u._id === edge.node._id,
  //                       ),
  //                     },
  //                   }
  //                   : edge,
  //               ),
  //             },
  //           }

  //         default:
  //           return prev
  //       }
  //     },
  //   })

  //   return () => {
  //     if (typeof unsubscribe === "function") {
  //       unsubscribe()
  //     }
  //   }
  // }, [subscribeToMore, search, sort, filter])
  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: ENTRY_CHANGED,
      updateQuery: (prev: any, { subscriptionData }: any) => {
        if (!subscriptionData.data) return prev
        const { type, entry, entries } = subscriptionData.data.entryChanged

        // Get current user role (implement based on your auth system)
        const userRole = localStorage.getItem('userRole'); // Replace with your actual auth method

        // Helper function to check if entry should be shown for LEVELLER
        const shouldShowForLeveller = (entryNode: any) => {
          if (userRole !== "LEVELLER") return true;
          return entryNode?.currentStatus === "LEVEL_PENDING";
        };

        switch (type) {
          case "CREATE":
            const newEntry = entry

            // Skip adding if LEVELLER and entry is not LEVEL_PENDING
            if (!shouldShowForLeveller(newEntry)) return prev;

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

            // Skip if LEVELLER and entry is not LEVEL_PENDING
            if (!shouldShowForLeveller(verifiedEntry)) {
              // Remove from existing edges if present
              const filteredEdges = prev.entries.edges.filter(
                (edge: any) => edge.node._id !== verifiedEntry._id
              );
              return {
                entries: {
                  ...prev.entries,
                  total: filteredEdges.length,
                  edges: filteredEdges,
                },
              };
            }

            // Check if entry exists
            const existingVerifiedEdge = prev.entries.edges.find(
              (edge: any) => edge.node._id === verifiedEntry._id
            );

            let verifiedEdges;
            if (existingVerifiedEdge) {
              verifiedEdges = prev.entries.edges.map((edge: any) =>
                edge.node._id === verifiedEntry._id
                  ? { ...edge, node: { ...edge.node, ...verifiedEntry } }
                  : edge
              );
            } else {
              verifiedEdges = [{ cursor: verifiedEntry?._id, node: verifiedEntry }, ...prev.entries.edges];
            }

            toast.success(
              `Entry (${verifiedEntry?.entryNumber}) has been fully paid and verified! 🎉`,
            )

            return {
              entries: {
                ...prev.entries,
                total: existingVerifiedEdge ? prev.entries.total : prev.entries.total + 1,
                edges: verifiedEdges,
              },
            }

          case "PAYMENT_TRANSFERRED":
            const paymentTransferredEntry = entry

            // Skip update if LEVELLER and entry is not LEVEL_PENDING
            if (!shouldShowForLeveller(paymentTransferredEntry)) {
              // Remove from existing edges if present
              const filteredEdges = prev.entries.edges.filter(
                (edge: any) => edge.node._id !== paymentTransferredEntry._id
              );
              return {
                entries: {
                  ...prev.entries,
                  total: filteredEdges.length,
                  edges: filteredEdges,
                },
              };
            }

            const existingPaymentEdge = prev.entries.edges.find(
              (edge: any) => edge.node._id === paymentTransferredEntry._id
            );

            let paymentTransferredEdges;
            if (existingPaymentEdge) {
              paymentTransferredEdges = prev.entries.edges.map((edge: any) => {
                if (edge.node._id === paymentTransferredEntry._id) {
                  const totalPaid =
                    paymentTransferredEntry.totalPaid ?? edge.node.totalPaid ?? 0
                  const totalRefundAmount =
                    paymentTransferredEntry.totalRefundAmount ??
                    edge.node.totalRefundAmount ??
                    0
                  const remainingPrincipal = totalPaid - totalRefundAmount

                  return {
                    ...edge,
                    node: {
                      ...edge.node,
                      ...paymentTransferredEntry,
                      pendingAmount:
                        paymentTransferredEntry.pendingAmount ?? edge.node.pendingAmount,
                      totalPaid: totalPaid,
                      totalRefundAmount: totalRefundAmount,
                      hasRefunds:
                        paymentTransferredEntry.hasRefunds ?? totalRefundAmount > 0,
                      hasOverpayment:
                        paymentTransferredEntry.hasOverpayment ??
                        paymentTransferredEntry.pendingAmount < 0,
                      totalExcess:
                        paymentTransferredEntry.totalExcess ??
                        (paymentTransferredEntry.pendingAmount < 0
                          ? Math.abs(paymentTransferredEntry.pendingAmount)
                          : 0),
                      currentStatus:
                        paymentTransferredEntry.currentStatus ?? edge.node.currentStatus,
                    },
                  }
                }
                return edge
              });
            } else {
              paymentTransferredEdges = [{ cursor: paymentTransferredEntry?._id, node: paymentTransferredEntry }, ...prev.entries.edges];
            }

            toast.info(
              `Payment transferred from entry (${paymentTransferredEntry?.entryNumber})`,
              {
                description: `New balance: ₱${paymentTransferredEntry?.pendingAmount?.toLocaleString()}`,
                duration: 5000,
              },
            )

            return {
              entries: {
                ...prev.entries,
                total: existingPaymentEdge ? prev.entries.total : prev.entries.total + 1,
                edges: paymentTransferredEdges,
              },
            }

          case "CANCEL":
            const cancelledEntry = entry

            // Skip if LEVELLER and entry is not LEVEL_PENDING
            if (!shouldShowForLeveller(cancelledEntry)) {
              // Remove from existing edges if present
              const filteredEdges = prev.entries.edges.filter(
                (edge: any) => edge.node._id !== cancelledEntry._id
              );
              return {
                entries: {
                  ...prev.entries,
                  total: filteredEdges.length,
                  edges: filteredEdges,
                },
              };
            }

            const existingCancelEdge = prev.entries.edges.find(
              (edge: any) => edge.node._id === cancelledEntry._id
            );

            let cancelledEdges;
            if (existingCancelEdge) {
              cancelledEdges = prev.entries.edges.map((edge: any) =>
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
                  : edge
              );
            } else {
              cancelledEdges = [{ cursor: cancelledEntry?._id, node: cancelledEntry }, ...prev.entries.edges];
            }

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

            return {
              entries: {
                ...prev.entries,
                total: existingCancelEdge ? prev.entries.total : prev.entries.total + 1,
                edges: cancelledEdges,
              },
            }

          case "REFUND":
            const refundedEntry = entry

            // Skip if LEVELLER and entry is not LEVEL_PENDING
            if (!shouldShowForLeveller(refundedEntry)) {
              const filteredEdges = prev.entries.edges.filter(
                (edge: any) => edge.node._id !== refundedEntry._id
              );
              return {
                entries: {
                  ...prev.entries,
                  total: filteredEdges.length,
                  edges: filteredEdges,
                },
              };
            }

            const existingRefundEdge = prev.entries.edges.find(
              (edge: any) => edge.node._id === refundedEntry._id
            );

            let refundEdges;
            if (existingRefundEdge) {
              refundEdges = prev.entries.edges.map((edge: any) => {
                if (edge.node._id === refundedEntry._id) {
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
                      remainingPrincipal: refundedEntry.remainingPrincipal,
                      isFullyRefunded: refundedEntry.isFullyRefunded,
                    },
                  }
                }
                return edge
              });
            } else {
              refundEdges = [{ cursor: refundedEntry?._id, node: refundedEntry }, ...prev.entries.edges];
            }

            const refundMessage = refundedEntry?.isFullyRefunded
              ? `Entry (${refundedEntry?.entryNumber}) has been fully refunded.`
              : `Refund processed for entry (${refundedEntry?.entryNumber})`

            toast.info(refundMessage)

            return {
              entries: {
                ...prev.entries,
                total: existingRefundEdge ? prev.entries.total : prev.entries.total + 1,
                edges: refundEdges,
              },
            }

          case "UPDATE":
            const updatedEntry = entry

            // Skip update if LEVELLER and entry is not LEVEL_PENDING
            if (!shouldShowForLeveller(updatedEntry)) {
              // Remove from existing edges if present
              const filteredEdges = prev.entries.edges.filter(
                (edge: any) => edge.node._id !== updatedEntry._id
              );
              return {
                entries: {
                  ...prev.entries,
                  total: filteredEdges.length,
                  edges: filteredEdges,
                },
              };
            }

            const existingUpdateEdge = prev.entries.edges.find(
              (edge: any) => edge.node._id === updatedEntry._id
            );

            let updatedEdges;
            if (existingUpdateEdge) {
              updatedEdges = prev.entries.edges.map((edge: any) => {
                if (edge.node._id === updatedEntry._id) {
                  return {
                    ...edge,
                    node: {
                      ...edge.node,
                      ...updatedEntry,
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
              });
            } else {
              updatedEdges = [{ cursor: updatedEntry?._id, node: updatedEntry }, ...prev.entries.edges];
            }

            // Only show toast for regular updates (not payment related)
            const isRegularUpdate =
              updatedEntry?.totalRefundAmount === undefined &&
              updatedEntry?.pendingAmount === undefined &&
              updatedEntry?.hasOverpayment === undefined

            const isAutoEarlyBirdExpiry = updatedEntry?.isAutoEarlyBirdExpiry === true

            if (isAutoEarlyBirdExpiry && updatedEntry?.isEarlyBird === false && updatedEntry?.pendingAmount > 0) {
              if (!search && !sort && filter.length === 0) {
                toast.info(
                  `Early bird period expired for entry (${updatedEntry?.entryNumber}). ` +
                  `Amount updated to ₱${updatedEntry?.pendingAmount?.toLocaleString()}`,
                )
              }
            } else if (isRegularUpdate && !search && !sort && filter.length === 0) {
              toast.success(
                `Entry (${updatedEntry?.entryNumber}) has been updated.`,
              )
            }

            return {
              entries: {
                ...prev.entries,
                total: existingUpdateEdge ? prev.entries.total : prev.entries.total + 1,
                edges: updatedEdges,
              },
            }

          case "ASSIGN":
            const assignEntry = entry

            // Check if this entry should be shown for LEVELLER
            if (!shouldShowForLeveller(assignEntry)) {
              // Remove from existing edges if present
              const filteredEdges = prev.entries.edges.filter(
                (edge: any) => edge.node._id !== assignEntry._id
              );
              return {
                entries: {
                  ...prev.entries,
                  total: filteredEdges.length,
                  edges: filteredEdges,
                },
              };
            }

            // Check if entry already exists in the list
            const existingAssignEdge = prev.entries.edges.find(
              (edge: any) => edge.node._id === assignEntry._id
            );

            let assignEdges;
            if (existingAssignEdge) {
              // Update existing entry
              assignEdges = prev.entries.edges.map((edge: any) =>
                edge.node._id === assignEntry._id
                  ? { ...edge, node: { ...edge.node, ...assignEntry } }
                  : edge
              );
            } else {
              // Add new entry at the beginning
              assignEdges = [{ cursor: assignEntry?._id, node: assignEntry }, ...prev.entries.edges];
            }

            if (!search && !sort && filter.length === 0) {
              toast.info(
                `Entry (${assignEntry?.entryNumber}) has been assigned.`,
              )
            }

            return {
              entries: {
                ...prev.entries,
                total: existingAssignEdge ? prev.entries.total : prev.entries.total + 1,
                edges: assignEdges,
              },
            }

          case "APPROVE":
            const approveEntry = entry

            if (!shouldShowForLeveller(approveEntry)) {
              const filteredEdges = prev.entries.edges.filter(
                (edge: any) => edge.node._id !== approveEntry._id
              );
              return {
                entries: {
                  ...prev.entries,
                  total: filteredEdges.length,
                  edges: filteredEdges,
                },
              };
            }

            const existingApproveEdge = prev.entries.edges.find(
              (edge: any) => edge.node._id === approveEntry._id
            );

            let approveEdges;
            if (existingApproveEdge) {
              approveEdges = prev.entries.edges.map((edge: any) =>
                edge.node._id === approveEntry._id
                  ? { ...edge, node: { ...edge.node, ...approveEntry } }
                  : edge
              );
            } else {
              approveEdges = [{ cursor: approveEntry?._id, node: approveEntry }, ...prev.entries.edges];
            }

            if (!search && !sort && filter.length === 0) {
              toast.success(
                `Entry (${approveEntry?.entryNumber}) has been approved.`,
              )
            }

            return {
              entries: {
                ...prev.entries,
                total: existingApproveEdge ? prev.entries.total : prev.entries.total + 1,
                edges: approveEdges,
              },
            }

          case "PAID":
            const paidEntry = entry

            if (!shouldShowForLeveller(paidEntry)) {
              const filteredEdges = prev.entries.edges.filter(
                (edge: any) => edge.node._id !== paidEntry._id
              );
              return {
                entries: {
                  ...prev.entries,
                  total: filteredEdges.length,
                  edges: filteredEdges,
                },
              };
            }

            const existingPaidEdge = prev.entries.edges.find(
              (edge: any) => edge.node._id === paidEntry._id
            );

            let paidEdges;
            if (existingPaidEdge) {
              paidEdges = prev.entries.edges.map((edge: any) =>
                edge.node._id === paidEntry._id
                  ? { ...edge, node: { ...edge.node, ...paidEntry } }
                  : edge
              );
            } else {
              paidEdges = [{ cursor: paidEntry?._id, node: paidEntry }, ...prev.entries.edges];
            }

            if (!search && !sort && filter.length === 0) {
              toast.success(
                `Entry (${paidEntry?.entryNumber}) has been paid.`,
              )
            }

            return {
              entries: {
                ...prev.entries,
                total: existingPaidEdge ? prev.entries.total : prev.entries.total + 1,
                edges: paidEdges,
              },
            }

          case "PARTIALLY_PAID":
            const partiallyPaidEntry = entry

            if (!shouldShowForLeveller(partiallyPaidEntry)) {
              const filteredEdges = prev.entries.edges.filter(
                (edge: any) => edge.node._id !== partiallyPaidEntry._id
              );
              return {
                entries: {
                  ...prev.entries,
                  total: filteredEdges.length,
                  edges: filteredEdges,
                },
              };
            }

            const existingPartialEdge = prev.entries.edges.find(
              (edge: any) => edge.node._id === partiallyPaidEntry._id
            );

            let partialEdges;
            if (existingPartialEdge) {
              partialEdges = prev.entries.edges.map((edge: any) =>
                edge.node._id === partiallyPaidEntry._id
                  ? { ...edge, node: { ...edge.node, ...partiallyPaidEntry } }
                  : edge
              );
            } else {
              partialEdges = [{ cursor: partiallyPaidEntry?._id, node: partiallyPaidEntry }, ...prev.entries.edges];
            }

            if (!search && !sort && filter.length === 0) {
              toast.info(
                `Entry (${partiallyPaidEntry?.entryNumber}) has been partially paid.`,
              )
            }

            return {
              entries: {
                ...prev.entries,
                total: existingPartialEdge ? prev.entries.total : prev.entries.total + 1,
                edges: partialEdges,
              },
            }

          case "REJECT":
            const rejectEntry = entry

            if (!shouldShowForLeveller(rejectEntry)) {
              const filteredEdges = prev.entries.edges.filter(
                (edge: any) => edge.node._id !== rejectEntry._id
              );
              return {
                entries: {
                  ...prev.entries,
                  total: filteredEdges.length,
                  edges: filteredEdges,
                },
              };
            }

            const existingRejectEdge = prev.entries.edges.find(
              (edge: any) => edge.node._id === rejectEntry._id
            );

            let rejectEdges;
            if (existingRejectEdge) {
              rejectEdges = prev.entries.edges.map((edge: any) =>
                edge.node._id === rejectEntry._id
                  ? { ...edge, node: { ...edge.node, ...rejectEntry } }
                  : edge
              );
            } else {
              rejectEdges = [{ cursor: rejectEntry?._id, node: rejectEntry }, ...prev.entries.edges];
            }

            if (!search && !sort && filter.length === 0) {
              toast.warning(
                `Entry (${rejectEntry?.entryNumber}) has been rejected.`,
              )
            }

            return {
              entries: {
                ...prev.entries,
                total: existingRejectEdge ? prev.entries.total : prev.entries.total + 1,
                edges: rejectEdges,
              },
            }

          case "DELETE":
            const deletedEntry = entry

            // For delete, just remove if exists
            const afterDeleteEdges = prev.entries.edges.filter(
              (edge: any) => edge.node._id !== deletedEntry._id,
            )

            if (!search && !sort && filter.length === 0) {
              toast.success(
                `Entry (${deletedEntry?.entryNumber}) has been deleted.`,
              )
            }

            return {
              entries: {
                ...prev.entries,
                total: afterDeleteEdges.length,
                edges: afterDeleteEdges,
              },
            }

          case "BATCH_UPDATE":
            const updatedEntries = entries

            // Filter batch updates for LEVELLER
            const filteredBatchEntries = userRole === "LEVELLER"
              ? updatedEntries.filter((e: any) => e.currentStatus === "LEVEL_PENDING")
              : updatedEntries;

            if (!search && !sort && filter.length === 0) {
              toast.success(
                `Batch update successful for ${filteredBatchEntries.length} entries.`,
              )
            }

            const updatedIds = new Set(filteredBatchEntries.map((u: any) => u._id))

            return {
              entries: {
                ...prev.entries,
                edges: prev.entries.edges.map((edge: any) =>
                  updatedIds.has(edge.node._id)
                    ? {
                      ...edge,
                      node: {
                        ...edge.node,
                        ...filteredBatchEntries.find(
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

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe()
      }
    }
  }, [subscribeToMore, search, sort, filter])

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
        footer: () => {
          // You need to get the user role from your auth context
          // Add this at the top of the Page component:
          // const { user } = useAuth(); // or however you get the current user
          // const userRole = user?.role;

          // For now, let's assume you have a way to get the role
          // Replace this with your actual role retrieval method
          const userRole = localStorage.getItem('userRole'); // Example, replace with your actual method

          // Don't show filter for LEVELLER role
          if (userRole === "LEVELLER") {
            return null;
          }

          return (
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
          );
        },
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
          // An entry is fully refunded when:
          // 1. It's cancelled AND
          // 2. Total refund amount equals total paid (and total paid > 0) OR no remaining principal
          const isFullyRefunded = currentStatus === "CANCELLED" &&
            ((totalPaid > 0 && totalRefundAmount >= totalPaid) || remainingPrincipal === 0)
          const isPartiallyRefunded = currentStatus === "CANCELLED" && hasRefunds && !isFullyRefunded

          return (
            <div className="flex flex-col justify-center gap-1">
              <EntryStatusBadge status={currentStatus as EntryStatus} />

              {/* Show refund information for CANCELLED entries */}
              {currentStatus === "CANCELLED" && (
                <div className="flex flex-col gap-0.5 mt-1">
                  <div className="flex items-center gap-1 flex-wrap">
                    {/* Show Refunded amount if any refunds have been processed */}
                    {hasRefunds && totalRefundAmount > 0 && (
                      <span className="text-[11px] font-medium text-green-600">
                        Refunded: ₱{totalRefundAmount.toLocaleString()}
                      </span>
                    )}

                    {/* Show remaining amount ONLY if NOT fully refunded and there's remaining principal */}
                    {!isFullyRefunded && remainingPrincipal > 0 && (
                      <>
                        {hasRefunds && (
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

                    {/* Show "Fully refunded" message when fully refunded */}
                    {isFullyRefunded && (
                      <span className="text-[11px] font-medium text-gray-500">
                        Fully refunded
                      </span>
                    )}

                    {/* Show "Refund pending" when cancelled with payments but no refunds yet */}
                    {!hasRefunds && totalPaid > 0 && !isFullyRefunded && (
                      <span className="text-[11px] font-medium text-yellow-600">
                        Refund pending: ₱{totalPaid.toLocaleString()}
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

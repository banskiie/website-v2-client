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
import { gql } from "@apollo/client"
import { useQuery } from "@apollo/client/react"
import { ColumnDef } from "@tanstack/react-table"
import { InfoIcon, Settings, Trash2Icon, PhilippinePeso, Eye, Edit, Receipt, Plus, ArrowRight } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import ViewRefundDialog from "./dialogs/view"
import { format } from "date-fns"
import PaymentMethodBadge from "@/components/badges/payment-method-badge"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

const REFUNDS = gql`
  query Refunds(
    $first: Int
    $after: String
    $search: String
    $filter: [Filter!]
    $sort: Sort
  ) {
    refunds(
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
          payerName
          referenceNumber
          amount
          entry {
            _id
            entryNumber
            entryKey
          }
          method
          paymentDate
          createdAt
          uploadedBy {
            _id
            firstName
            lastName
            email
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

const REFUND_CHANGED = gql`
  subscription OnRefundChanged {
    refundChanged {
      type
      refund {
        _id
        payerName
        referenceNumber
        amount
        entry {
          _id
          entryNumber
          entryKey
        }
        method
        paymentDate
        uploadedBy {
          _id
          firstName
          lastName
          email
        }
      }
    }
  }
`

const ActionsColumn = ({ data }: { data?: any }) => {
  const refund = useMemo(() => data, [data])
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <DropdownMenu modal open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <Settings />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="left" align="start">
        <DropdownMenuLabel>Refund Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <ViewRefundDialog _id={refund?._id} />
          {/* <EditRefundDialog refund={refund} onClose={() => setMenuOpen(false)} /> */}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const RefundsPage = () => {
  const router = useRouter()
  
  const [createRefundOpen, setCreateRefundOpen] = useState(false)
  const [paymentReference, setPaymentReference] = useState("")
  
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
  const [search, setSearch] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [sort, setSort] = useState<{
    key: string
    order: "ASC" | "DESC"
  } | null>(null)
  const [filter, setFilter] = useState<
    { key: string; value: string; type: string }[]
  >([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  
  const { data, loading, fetchMore, subscribeToMore }: any = useQuery(
    REFUNDS,
    {
      variables: {
        first: rows,
        search,
        sort,
        filter,
      },
      fetchPolicy: "network-only",
      notifyOnNetworkStatusChange: true,
    }
  )

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: REFUND_CHANGED,
      updateQuery: (prev: any, { subscriptionData }: any) => {
        if (!subscriptionData.data) return prev
        const { type, refund } = subscriptionData.data.refundChanged
        
        switch (type) {
          case "CREATE":
            toast.success(`Refund (${refund?.referenceNumber}) has been created.`)
            return Object.assign({}, prev, {
              refunds: {
                ...prev.refunds,
                total: prev.refunds.total + 1,
                edges: [
                  { cursor: refund?._id, node: refund },
                  ...prev.refunds.edges,
                ],
              },
            })
          case "UPDATE":
            toast.success(`Refund (${refund?.referenceNumber}) has been updated.`)
            return Object.assign({}, prev, {
              refunds: {
                ...prev.refunds,
                edges: prev.refunds.edges.map((edge: any) =>
                  edge.node._id === refund._id
                    ? { ...edge, node: refund }
                    : edge
                ),
              },
            })
          case "DELETE":
            toast.success(`Refund has been deleted.`)
            return Object.assign({}, prev, {
              refunds: {
                ...prev.refunds,
                total: prev.refunds.total - 1,
                edges: prev.refunds.edges.filter(
                  (edge: any) => edge.node._id !== refund._id
                ),
              },
            })
          default:
            return prev
        }
      },
    })
    return () => unsubscribe()
  }, [subscribeToMore, search, sort, filter])

  const { total, nodes, pageInfo } = useMemo(() => {
    const nodes = data?.refunds?.edges.map((edge: any) => edge.node) || []
    const pageInfo = data?.refunds?.pageInfo

    setPage((prev) => ({
      ...prev,
      max: data?.refunds?.pages || 1,
    }))

    return {
      total: data?.refunds?.total || 0,
      nodes,
      pageInfo,
    }
  }, [data])

  const resetPage = () => setPage({ current: 1, loaded: 1, max: 1 })

  const onSearch = (value: string) => {
    setSearch(value)
    resetPage()
  }

  const onFilter = useCallback((value: any) => {
    setFilter(value)
    resetPage()
  }, [])

  const onSort = useCallback((value: any) => {
    setSort(value)
    resetPage()
  }, [])

  const handleCreateRefund = () => {
    if (paymentReference.trim()) {
      router.push(`/dashboard/payments?search=${encodeURIComponent(paymentReference)}`)
    } else {
      router.push('/dashboard/payments')
    }
    setCreateRefundOpen(false)
    setPaymentReference("")
  }

  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        id: "select",
        footer: () => {
          return (
            <Checkbox
              checked={
                selectedIds.size === data?.refunds?.edges.length &&
                data?.refunds?.edges.length > 0
              }
              className="hover:cursor-pointer"
              onCheckedChange={(value: boolean) => {
                if (value) {
                  const allIds = new Set<string>(
                    data?.refunds?.edges.map((edge: any) => edge.node._id)
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
        accessorKey: "referenceNumber",
        header: () => (
          <SortHeader
            label="Reference Number"
            sortKey="referenceNumber"
            sortState={sort}
            onSortChange={onSort}
          />
        ),
        footer: () => (
          <ColumnFilter
            label="Reference"
            filterKey="referenceNumber"
            filterType="TEXT"
            filterValue={filter}
            onFilterChange={onFilter}
          />
        ),
      },
      {
        accessorKey: "payerName",
        header: () => (
          <SortHeader
            label="Payer Name"
            sortKey="payerName"
            sortState={sort}
            onSortChange={onSort}
          />
        ),
        footer: () => (
          <ColumnFilter
            label="Payer Name"
            filterKey="payerName"
            filterType="TEXT"
            filterValue={filter}
            onFilterChange={onFilter}
          />
        ),
      },
      {
        accessorKey: "entry.entryNumber",
        header: () => (
          <SortHeader
            label="Entry Number"
            sortKey="entry.entryNumber"
            sortState={sort}
            onSortChange={onSort}
          />
        ),
        footer: () => (
          <ColumnFilter
            label="Entry Number"
            filterKey="entry.entryNumber"
            filterType="TEXT"
            filterValue={filter}
            onFilterChange={onFilter}
          />
        ),
        cell: ({ row }) => row.original.entry?.entryNumber || "N/A",
      },
      {
        accessorKey: "amount",
        header: () => (
          <SortHeader
            label="Amount"
            sortKey="amount"
            sortState={sort}
            onSortChange={onSort}
          />
        ),
        footer: () => (
          <ColumnFilter
            label="Amount"
            filterKey="amount"
            filterType="NUMBER"
            filterValue={filter}
            onFilterChange={onFilter}
          />
        ),
        cell: ({ row }) =>
          `₱${parseFloat(row.original.amount).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
      },
      {
        accessorKey: "method",
        header: () => (
          <SortHeader
            label="Method"
            sortKey="method"
            sortState={sort}
            onSortChange={onSort}
          />
        ),
        footer: () => (
          <ColumnFilter
            label="Method"
            filterKey="method"
            filterType="SELECT"
            options={[
              { label: "GCash", value: "GCASH" },
              { label: "Bank Transfer", value: "BANK_TRANSFER" },
              { label: "Over the Counter", value: "OVER_THE_COUNTER" },
            ]}
            filterValue={filter}
            onFilterChange={onFilter}
          />
        ),
        cell: ({ row }) => <PaymentMethodBadge method={row.original.method} />,
      },
      {
        accessorKey: "paymentDate",
        header: () => (
          <SortHeader
            label="Payment Date"
            sortKey="paymentDate"
            sortState={sort}
            onSortChange={onSort}
          />
        ),
        cell: ({ row }) => format(new Date(row.original.paymentDate), "MMM dd, yyyy"),
      },
      {
        accessorKey: "uploadedBy",
        header: "Uploaded By",
        cell: ({ row }) => 
          `${row.original.uploadedBy?.firstName} ${row.original.uploadedBy?.lastName}`,
      },
      {
        accessorKey: "createdAt",
        header: () => (
          <SortHeader
            label="Created At"
            sortKey="createdAt"
            sortState={sort}
            onSortChange={onSort}
          />
        ),
        cell: ({ row }) => format(new Date(row.original.createdAt), "MMM dd, yyyy HH:mm"),
      },
    ],
    [sort, onSort, filter, onFilter, selectedIds, data?.refunds]
  )

  // Pagination functions
  const goNext = async () => {
    if (page.current === page.max) return
    if (page.current === page.loaded) {
      await fetchMore({
        variables: {
          first: rows,
          after: pageInfo?.endCursor,
          search,
          sort,
          filter,
        },
        updateQuery: (prev: any, { fetchMoreResult: more }: any) => {
          if (!more) return prev
          return {
            refunds: {
              ...prev.refunds,
              edges: [...prev.refunds.edges, ...more.refunds.edges],
              pageInfo: more.refunds.pageInfo,
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
    <>
      <div className="w-full h-full flex-1 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-slate-900 -mb-1.5">
            <Receipt className="size-5" />
            <Label className="text-2xl">Refunds</Label>
          </div>
          <Button
            onClick={() => setCreateRefundOpen(true)}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <Plus className="size-4 mr-2" />
            Create Refund
          </Button>
        </div>
        
        <div className="w-full flex justify-between">
          <InputGroup className="w-[350px]">
            <InputGroupInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              placeholder="Search by reference, payer name..."
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
            {selectedIds.size > 0 && (
              <>
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
          </div>
        </div>
        
        <div className="w-full flex justify-between">
          <div className="px-1.5 flex items-center justify-center">
            {loading ? (
              <span className="text-sm text-muted-foreground">Loading...</span>
            ) : total === 0 ? (
              <span className="text-sm text-muted-foreground">No refunds found.</span>
            ) : (
              <div className="space-x-0.5">
                <span className="text-sm text-muted-foreground">
                  Showing {(page.current - 1) * rows + 1}-
                  {page.current === page.max ? total : page.current * rows} out of{" "}
                  {total} refund{total === 1 ? "" : "s"}.{" "}
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
        
        <DataTable
          loading={loading}
          columns={columns}
          data={nodes.slice((page.current - 1) * rows, page.current * rows)}
          actionsColumn={<ActionsColumn />}
        />
      </div>

      {/* Create Refund Dialog */}
      <Dialog open={createRefundOpen} onOpenChange={setCreateRefundOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Refund</DialogTitle>
            <DialogDescription>
              Refunds are created from specific payments. Go to the Payments page to create a refund.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <div className="flex items-start gap-2">
                <ArrowRight className="size-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">How to Create a Refund</h4>
                  <ul className="text-sm text-blue-700 space-y-1 mt-1">
                    <li>1. Go to the Payments page</li>
                    <li>2. Find the verified payment you want to refund</li>
                    <li>3. Click "Settings" on the payment</li>
                    <li>4. Select "Refund" from the dropdown menu</li>
                    <li>5. Review and confirm the refund</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentReference">
                Looking for a specific payment?
              </Label>
              <Input
                id="paymentReference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Enter payment reference number..."
              />
              <p className="text-xs text-muted-foreground">
                Optional: We'll search for this payment on the Payments page
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateRefundOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRefund}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Go to Payments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default RefundsPage
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
import { IRefund, IRefundInput, IRefundNode } from "@/types/refund.interface"
import { gql } from "@apollo/client"
import { useQuery } from "@apollo/client/react"
import { ColumnDef } from "@tanstack/react-table"
import { InfoIcon, Settings, Trash2Icon, PhilippinePeso } from "lucide-react"
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

const REFUNDS = gql`
  query Refunds(
    $first: Int
    $after: String
    $search: String
    $filter: [Filter]
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
          method
          refundDate
          entries
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
      refunds {
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

const ActionsColumn = ({ data }: { data?: IRefundNode }) => {
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
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <ViewDialog _id={refund?._id} />
          <FormDialog _id={refund?._id} onClose={() => setMenuOpen(false)} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const Page = () => {
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
  const { data, loading, fetchMore, subscribeToMore, error }: any = useQuery(
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
        const { type, refund, refunds } = subscriptionData.data.refundChanged
        switch (type) {
          case "CREATE":
            const newRefund = refund
            const newRefundExists = prev.refunds.edges.find(
              (edge: any) => edge.node._id === newRefund?._id
            )
            if (newRefundExists || search || sort || filter.length > 0)
              return prev
            toast.success(`Refund (${newRefund?.payerName}) has been created.`)
            return Object.assign({}, prev, {
              refunds: {
                ...prev.refunds,
                total: prev.refunds.total + 1,
                edges: [
                  { cursor: newRefund?._id, node: newRefund },
                  ...prev.refunds.edges,
                ],
              },
            })
          case "UPDATE":
            const updatedRefund = refund
            if (search || sort || filter.length > 0) return prev
            toast.success(
              `Refund (${updatedRefund?.payerName}) has been updated.`
            )
            return Object.assign({}, prev, {
              refunds: {
                ...prev.refunds,
                edges: prev.refunds.edges.map((edge: any) =>
                  edge.node._id === updatedRefund._id
                    ? { ...edge, node: updatedRefund }
                    : edge
                ),
              },
            })
          default:
            return prev
        }
      },
    })
    return () => unsubscribe?.()
  }, [subscribeToMore, search, sort, filter])

  const { total, nodes, pageInfo } = useMemo(() => {
    const nodes = data?.refunds.edges.map((edge: any) => edge.node) || []
    const pageInfo = data?.refunds.pageInfo

    setPage((prev) => ({
      ...prev,
      max: data?.refunds.pages || 1,
    }))

    return {
      total: data?.refunds.total || 0,
      nodes,
      pageInfo,
    }
  }, [data])

  const resetPage = () => setPage({ current: 1, loaded: 1, max: 1 })

  const onSearch = (value: string) => {
    setSearch(value)
    resetPage()
  }

  const existingRefunds = useMemo(() => {
    return (data?.refunds.edges || []).map((edge: any) => ({
      referenceNumber: edge.node.referenceNumber,
      payerName: edge.node.payerName
    }))
  }, [data?.refunds])

  const onFilter = useCallback((value: any) => {
    setFilter(value)
    resetPage()
  }, [])

  const onSort = useCallback((value: any) => {
    setSort(value)
    resetPage()
  }, [])

  const columns: ColumnDef<IRefund>[] = useMemo(
    () => [
      {
        id: "select",
        footer: () => {
          return (
            <Checkbox
              checked={
                selectedIds.size === data?.refunds.edges.length &&
                data?.refunds.edges.length > 0
              }
              className="hover:cursor-pointer"
              onCheckedChange={(value: boolean) => {
                if (value) {
                  const allIds = new Set<string>(
                    data?.refunds.edges.map((edge: any) => edge.node._id)
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
            label="Ref. No."
            sortKey="referenceNumber"
            sortState={sort}
            onSortChange={onSort}
          />
        ),
        footer: () => (
          <ColumnFilter
            label="Ref. No."
            filterKey="referenceNumber"
            filterType="TEXT"
            filterValue={filter}
            onFilterChange={onFilter}
          />
        ),
      },
      {
        accessorKey: "entries",
        header: () => (
          <SortHeader
            label="Entries"
            sortKey="entries"
            sortState={sort}
            onSortChange={onSort}
          />
        ),
        footer: () => (
          <ColumnFilter
            label="Entries"
            filterKey="entries"
            filterType="TEXT"
            filterValue={filter}
            onFilterChange={onFilter}
          />
        ),
        cell: ({ row }) => {
          const entries = (row.original as any).entries as string
          const entryList = entries.split(",").map((e) => e.trim())
          return <span>{entryList.join(", ")}</span>
        },
      },
      {
        accessorKey: "payerName",
        header: () => (
          <SortHeader
            label="Paid By"
            sortKey="payerName"
            sortState={sort}
            onSortChange={onSort}
          />
        ),
        footer: () => (
          <ColumnFilter
            label="Paid By"
            filterKey="payerName"
            filterType="TEXT"
            filterValue={filter}
            onFilterChange={onFilter}
          />
        ),
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
            filterType="TEXT"
            filterValue={filter}
            onFilterChange={onFilter}
          />
        ),
        cell: ({ row }) =>
          `₱${parseFloat((row.original as any).amount).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
      },
    ],
    [sort, onSort, filter, onFilter, selectedIds, data?.refunds]
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
    <div className="w-full h-full flex-1 flex flex-col gap-2">
      <div className="flex items-center gap-1 text-slate-900 -mb-1.5">
        <PhilippinePeso className="size-5" />
        <Label className="text-2xl">Refunds</Label>
      </div>
      <div className="w-full flex justify-between">
        <InputGroup className="w-87.5">
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
          {<FormDialog existingRefunds={existingRefunds} />}
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
      <DataTable
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

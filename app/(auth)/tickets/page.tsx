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
import { ITicket } from "@/types/ticket.interface"
import { gql } from "@apollo/client"
import { useQuery } from "@apollo/client/react"
import { ColumnDef } from "@tanstack/react-table"
import { Dot, InfoIcon, Trash2Icon, UserCircle } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import TicketTable from "@/components/table/ticket-table"
import { format, formatDistanceToNowStrict } from "date-fns"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"

const TICKETS = gql`
  query Tickets(
    $first: Int
    $after: String
    $search: String
    $filter: [Filter]
    $sort: Sort
  ) {
    tickets(
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
          email
          name
          lastSentAt
          hasNewMessage
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

const TICKET_UPDATED = gql`
  subscription TicketUpdated {
    ticketUpdated {
      type
      ticket {
        _id
        email
        name
        lastSentAt
        hasNewMessage
      }
    }
  }
`

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
  const { data, loading, fetchMore, subscribeToMore }: any = useQuery(TICKETS, {
    variables: {
      first: rows,
      search,
      sort,
      filter,
    },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    pollInterval: 30000,
  })

  // Subscription to Ticket Changes
  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: TICKET_UPDATED,
      updateQuery: (prev: any, { subscriptionData }: any) => {
        if (!subscriptionData.data) return prev
        const { type, ticket } = subscriptionData.data.ticketUpdated
        // Update the tickets list based on the type of change
        switch (type) {
          case "CREATE":
            // Add the new ticket to the top of the list
            const newTicket = ticket
            const newTicketExists = prev.tickets.edges.find(
              (edge: any) => edge.node._id === newTicket?._id
            )
            if (newTicketExists || search || sort || filter.length > 0)
              return prev // Skip updating during search/sort/filter
            toast.success(`Ticket (${newTicket?.name}) has been created.`)
            return Object.assign({}, prev, {
              tickets: {
                ...prev.tickets,
                total: prev.tickets.total + 1,
                edges: [
                  { cursor: newTicket?._id, node: newTicket },
                  ...prev.tickets.edges,
                ],
              },
            })
          case "UPDATE":
            // Update the existing ticket in the list
            const updatedTicket = ticket
            if (search || sort || filter.length > 0) return prev // Skip updating during search/sort/filter
            toast.success(`Ticket (${updatedTicket?.name}) has been updated.`)
            // Move the updated ticket to the top of the list
            const updatedEdges = prev.tickets.edges
              .map((edge: any) =>
                edge.node._id === updatedTicket._id
                  ? { ...edge, node: updatedTicket }
                  : edge
              )
              .filter((edge: any) => edge.node._id !== updatedTicket._id)
            return Object.assign({}, prev, {
              tickets: {
                ...prev.tickets,
                edges: [
                  { cursor: updatedTicket._id, node: updatedTicket },
                  ...updatedEdges,
                ],
              },
            })
          default:
            return prev
        }
      },
    })
    return () => unsubscribe()
  }, [subscribeToMore, search, sort, filter])

  // Memoized Data Processing
  const { total, nodes, pageInfo } = useMemo(() => {
    const nodes = data?.tickets.edges.map((edge: any) => edge.node) || []
    const pageInfo = data?.tickets.pageInfo

    setPage((prev) => ({
      ...prev,
      max: data?.tickets.pages || 1,
    }))

    return {
      total: data?.tickets.total || 0,
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
  const columns: ColumnDef<ITicket>[] = useMemo(
    () => [
      // {
      //   id: "select",
      //   footer: () => {
      //     return (
      //       <Checkbox
      //         checked={
      //           selectedIds.size === data?.tickets.edges.length &&
      //           data?.tickets.edges.length > 0
      //         }
      //         className="hover:cursor-pointer"
      //         onCheckedChange={(value: boolean) => {
      //           if (value) {
      //             const allIds = new Set<string>(
      //               data?.tickets.edges.map((edge: any) => edge.node._id)
      //             )
      //             setSelectedIds(allIds)
      //           } else {
      //             setSelectedIds(new Set())
      //           }
      //         }}
      //       />
      //     )
      //   },
      //   cell: ({ row }) => {
      //     const isChecked = selectedIds.has((row.original as any)._id)
      //     return (
      //       <Checkbox
      //         checked={isChecked}
      //         className="hover:cursor-pointer"
      //         onCheckedChange={(value: boolean) => {
      //           setSelectedIds((prev) => {
      //             const newSet = new Set(prev)
      //             if (value) {
      //               newSet.add((row.original as any)._id)
      //             } else {
      //               newSet.delete((row.original as any)._id)
      //             }
      //             return newSet
      //           })
      //         }}
      //       />
      //     )
      //   },
      //   size: 10,
      // },
      {
        accessorKey: "name",
        header: () => (
          <SortHeader
            label="Name"
            sortKey="name"
            sortState={sort}
            onSortChange={onSort}
          />
        ),
        footer: () => (
          <ColumnFilter
            label="Name"
            filterKey="name"
            filterType="TEXT"
            filterValue={filter}
            onFilterChange={onFilter}
          />
        ),
        cell: ({ row }) => {
          const ticket = row.original as ITicket
          return (
            <div className="flex justify-between">
              <HoverCard>
                <HoverCardTrigger>
                  <span
                    className={cn(
                      "flex items-center",
                      ticket.hasNewMessage
                        ? "font-semibold"
                        : "text-muted-foreground"
                    )}
                  >
                    {ticket.name}{" "}
                    <Dot
                      className={cn(
                        "size-5 scale-250",
                        ticket.hasNewMessage ? "text-success" : "hidden"
                      )}
                    />
                  </span>
                </HoverCardTrigger>
                <HoverCardContent
                  align="center"
                  side="right"
                  className="px-1 py-0.5 w-fit rounded-none bg-white/80"
                >
                  <span className="block text-xs">{row.original.email}</span>
                </HoverCardContent>
              </HoverCard>
              <HoverCard>
                <HoverCardTrigger>
                  <span
                    className={cn(
                      "block",
                      ticket.hasNewMessage
                        ? "font-semibold"
                        : "text-muted-foreground"
                    )}
                  >
                    {formatDistanceToNowStrict(
                      new Date(row.original.lastSentAt as Date)
                    )}{" "}
                    ago
                  </span>
                </HoverCardTrigger>
                <HoverCardContent
                  align="center"
                  side="left"
                  className="px-1 py-0.5 w-fit rounded-none bg-white/80"
                >
                  <span className="block text-xs">
                    {format(
                      new Date(row.original.lastSentAt as Date),
                      "MMM dd, yyyy, hh:mm a"
                    )}
                  </span>
                </HoverCardContent>
              </HoverCard>
            </div>
          )
        },
      },
    ],
    [sort, onSort, filter, onFilter, selectedIds, data?.tickets]
  )

  // Next Page
  const goNext = async () => {
    // Next Page only works when page
    if (page.current === page.max) return
    // Fetch More only when the current page is the same as loaded page
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
            tickets: {
              ...prev.tickets,
              edges: [...prev.tickets.edges, ...more.tickets.edges],
              pageInfo: more.tickets.pageInfo,
            },
          }
        },
      })
      setPage((prev) => ({
        ...prev,
        loaded: prev.loaded + 1,
      }))
    }

    // Go to Next Page
    setPage((prev) => ({
      ...prev,
      current: prev.current + 1,
    }))
  }

  const goPrev = () => {
    // Current Page is the First Page
    if (page.current === 1) return
    // Go to Prev Page
    setPage((prev) => ({
      ...prev,
      current: prev.current - 1,
    }))
  }

  return (
    <div className="w-full h-full flex-1 flex flex-col gap-2">
      <div className="flex items-center gap-1 text-slate-900 -mb-1.5">
        <UserCircle className="size-5" />
        <Label className="text-2xl">Tickets</Label>
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
            <span className="text-sm text-muted-foreground">No results.</span>
          ) : (
            <div className="space-x-0.5">
              <span className="text-sm text-muted-foreground">
                Showing {(page.current - 1) * rows + 1}-
                {page.current === page.max ? total : page.current * rows} out of{" "}
                {total} ticket{total === 1 ? "" : "s"}.{" "}
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
      <TicketTable
        columns={columns}
        data={nodes.slice((page.current - 1) * rows, page.current * rows)}
        // actionsColumn={<ActionsColumn />}
        // rowView={
        //   <a href="#" className="sr-only">
        //     View Details
        //   </a>
        // }
      />
    </div>
  )
}

export default Page

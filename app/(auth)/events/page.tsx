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
import {
  EventGender,
  EventType,
  IEvent,
  IEventInput,
} from "@/types/event.interface"
import { gql } from "@apollo/client"
import { useQuery } from "@apollo/client/react"
import { ColumnDef } from "@tanstack/react-table"
import { InfoIcon, Settings, Trash2Icon, Trophy } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import FormDialog from "./dialogs/form"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ViewDialog from "./dialogs/view"
import RoleBadge from "@/components/badges/role-badge"
import DissolveDialog from "./dialogs/dissolve"
import ActiveBadge from "@/components/badges/active-badge"
import { Checkbox } from "@/components/ui/checkbox"
import BatchMenu from "./dialogs/batch"
import StatusBadge from "@/components/badges/status-badge"
import { Badge } from "@/components/ui/badge"

const EVENTS = gql`
  query Events(
    $first: Int
    $after: String
    $search: String
    $filter: [Filter]
    $sort: Sort
  ) {
    events(
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
          name
          gender
          type
          tournamentName
          isDissolved
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

const EVENT_CHANGED = gql`
  subscription EventChanged {
    eventChanged {
      type
      event {
        _id
        name
        gender
        type
        tournamentName
        isDissolved
      }
      events {
        _id
        name
        gender
        type
        tournamentName
        isDissolved
      }
    }
  }
`

const ActionsColumn = ({ data }: { data?: IEventInput }) => {
  const event = useMemo(() => data, [data])
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
          <ViewDialog _id={event?._id} />
          <FormDialog _id={event?._id} onClose={() => setMenuOpen(false)} />
          <DropdownMenuSeparator />
          <DissolveDialog
            _id={event?._id}
            onClose={() => setMenuOpen(false)}
            isDissolved={event?.isDissolved}
          />
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
  const { data, loading, fetchMore, subscribeToMore }: any = useQuery(EVENTS, {
    variables: {
      first: rows,
      search,
      sort,
      filter,
    },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  })

  // Subscription to Event Changes
  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: EVENT_CHANGED,
      updateQuery: (prev: any, { subscriptionData }: any) => {
        if (!subscriptionData.data) return prev
        const { type, event, events } = subscriptionData.data.eventChanged
        // Update the events list based on the type of change
        switch (type) {
          case "CREATE":
            // Add the new event to the top of the list
            const newEvent = event
            const newEventExists = prev.events.edges.find(
              (edge: any) => edge.node._id === newEvent?._id
            )
            if (newEventExists || search || sort || filter.length > 0)
              return prev // Skip updating during search/sort/filter
            toast.success(`Event (${newEvent?.name}) has been created.`)
            return Object.assign({}, prev, {
              events: {
                ...prev.events,
                total: prev.events.total + 1,
                edges: [
                  { cursor: newEvent?._id, node: newEvent },
                  ...prev.events.edges,
                ],
              },
            })
          case "UPDATE":
            // Update the existing event in the list
            const updatedEvent = event
            if (search || sort || filter.length > 0) return prev // Skip updating during search/sort/filter
            toast.success(`Event (${updatedEvent?.name}) has been updated.`)
            return Object.assign({}, prev, {
              events: {
                ...prev.events,
                edges: prev.events.edges.map((edge: any) =>
                  edge.node._id === updatedEvent._id
                    ? { ...edge, node: updatedEvent }
                    : edge
                ),
              },
            })
          case "DELETE":
            // Remove the deleted event from the list
            const deletedEvent = event
            if (search || sort || filter.length > 0) return prev // Skip updating during search/sort/filter
            toast.success(`Event (${deletedEvent?.name}) has been deleted.`)
            return Object.assign({}, prev, {
              events: {
                ...prev.events,
                total: prev.events.total - 1,
                edges: prev.events.edges.filter(
                  (edge: any) => edge.node._id !== deletedEvent._id
                ),
              },
            })
          case "BATCH_UPDATE":
            const updatedEvents = events
            if (search || sort || filter.length > 0) return prev // Skip updating during search/sort/filter
            toast.success(
              `Batch update successful for ${updatedEvents.length} events.`
            )
            const updatedIds = new Set(updatedEvents.map((u: any) => u._id))
            return Object.assign({}, prev, {
              events: {
                ...prev.events,
                edges: prev.events.edges.map((edge: any) =>
                  updatedIds.has(edge.node._id)
                    ? {
                        ...edge,
                        node: {
                          ...edge.node,
                          ...updatedEvents.find(
                            (u: any) => u._id === edge.node._id
                          ),
                        },
                      }
                    : edge
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

  // Memoized Data Processing
  const { total, nodes, pageInfo } = useMemo(() => {
    const nodes = data?.events.edges.map((edge: any) => edge.node) || []
    const pageInfo = data?.events.pageInfo

    setPage((prev) => ({
      ...prev,
      max: data?.events.pages || 1,
    }))

    return {
      total: data?.events.total || 0,
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
  const columns: ColumnDef<IEvent>[] = useMemo(
    () => [
      {
        id: "select",
        footer: () => {
          return (
            <Checkbox
              checked={
                selectedIds.size === data?.events.edges.length &&
                data?.events.edges.length > 0
              }
              className="hover:cursor-pointer"
              onCheckedChange={(value: boolean) => {
                if (value) {
                  const allIds = new Set<string>(
                    data?.events.edges.map((edge: any) => edge.node._id)
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
      },
      {
        accessorKey: "tournamentName",
        header: () => (
          <SortHeader
            label="Tournament"
            sortKey="tournamentName"
            sortState={sort}
            onSortChange={onSort}
          />
        ),
        footer: () => (
          <ColumnFilter
            label="Tournament"
            filterKey="tournamentName"
            filterType="TEXT"
            filterValue={filter}
            onFilterChange={onFilter}
          />
        ),
      },
      {
        accessorKey: "gender",
        header: () => (
          <SortHeader
            label="Gender"
            sortKey="gender"
            sortState={sort}
            onSortChange={onSort}
          />
        ),
        footer: () => (
          <ColumnFilter
            label="Gender"
            filterKey="gender"
            filterType="SELECT"
            filterValue={filter}
            onFilterChange={onFilter}
            options={Object.entries(EventGender).map(([value, label]) => ({
              label: label.toLocaleLowerCase().replaceAll("_", " "),
              value,
            }))}
          />
        ),
        cell: ({ row }) => (
          <span className="capitalize">
            {row.original.gender.toLocaleLowerCase()}
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: () => (
          <SortHeader
            label="Type"
            sortKey="type"
            sortState={sort}
            onSortChange={onSort}
          />
        ),
        footer: () => (
          <ColumnFilter
            label="Type"
            filterKey="type"
            filterType="SELECT"
            filterValue={filter}
            onFilterChange={onFilter}
            options={Object.entries(EventType).map(([value, label]) => ({
              label: label.toLocaleLowerCase().replaceAll("_", " "),
              value,
            }))}
          />
        ),
        cell: ({ row }) => (
          <span className="capitalize">
            {row.original.type.toLocaleLowerCase()}
          </span>
        ),
      },
      {
        accessorKey: "isDissolved",
        header: () => (
          <SortHeader
            label="Dissolved"
            sortKey="isDissolved"
            sortState={sort}
            onSortChange={onSort}
          />
        ),
        footer: () => (
          <ColumnFilter
            label="Dissolved"
            filterKey="isDissolved"
            filterType="BOOLEAN"
            filterValue={filter}
            onFilterChange={onFilter}
          />
        ),
        cell: ({ row }) => (
          <Badge variant={row.original.isDissolved ? "destructive" : "success"}>
            {row.original.isDissolved ? "Dissolved" : "Active"}
          </Badge>
        ),
      },
    ],
    [sort, onSort, filter, onFilter, selectedIds, data?.events]
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
            events: {
              ...prev.events,
              edges: [...prev.events.edges, ...more.events.edges],
              pageInfo: more.events.pageInfo,
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
        <Trophy className="size-5" />
        <Label className="text-2xl">Events</Label>
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
          {<FormDialog />}
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

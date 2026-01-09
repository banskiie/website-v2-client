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
import { InfoIcon, Settings, Trash2Icon, Shirt } from "lucide-react"
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
import JerseyBadge from "@/components/badges/jersey-badge"
import { JerseyStatus, JerseySize } from "@/types/jersey.interface"
import FormDialog from "./dialogs/form"
import DeleteDialog from "./dialogs/delete"

const JERSEYS = gql`
  query Jerseys(
    $first: Int
    $after: String
    $search: String
    $filter: [Filter]
    $sort: Sort
  ) {
    jerseys(
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
          size
          currentStatus
          playerName
          tournamentName
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

const JERSEY_CHANGED = gql`
  subscription JerseyChanged {
    jerseyChanged {
      type
      jersey {
        _id
        size
        createdAt
        updatedAt
        statuses {
          status
          dateUpdated
        }
        player {
          _id
          firstName
          middleName
          lastName
          suffix
        }
        tournament {
          _id
          name
        }
      }
    }
  }
`

const ActionsColumn = ({ data }: { data?: any }) => {
  const jersey = useMemo(() => data, [data])
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
          {/* <ViewDialog _id={jersey?._id} />*/}
          <FormDialog _id={jersey?._id} onClose={() => setMenuOpen(false)} />
          <DropdownMenuSeparator />
          {/* <StatusDialog
            _id={jersey?._id}
            onClose={() => setMenuOpen(false)}
            currentStatus={jersey?.currentStatus}
          /> */}
          <DeleteDialog
            _id={jersey?._id}
            playerName={jersey?.playerName}
            onClose={() => setMenuOpen(false)}
            variant="menu-item"
          />
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
  const { data, loading, fetchMore, subscribeToMore }: any = useQuery(JERSEYS, {
    variables: {
      first: rows,
      search,
      sort,
      filter,
    },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  })

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: JERSEY_CHANGED,
      updateQuery: (prev: any, { subscriptionData }: any) => {
        if (!subscriptionData.data) return prev
        const { type, jersey } = subscriptionData.data.jerseyChanged

        // Helper function to compute required fields
        const computeJerseyFields = (jerseyData: any) => {
          if (!jerseyData) return jerseyData

          // Compute playerName
          const playerName = jerseyData.player
            ? `${jerseyData.player.firstName || ''} ${jerseyData.player.lastName || ''}`.trim()
            : 'Unknown Player'

          // Compute tournamentName
          const tournamentName = jerseyData.tournament?.name || 'Unknown Tournament'

          // Compute currentStatus - get the last status from statuses array
          const currentStatus = jerseyData.statuses?.length > 0
            ? jerseyData.statuses[jerseyData.statuses.length - 1]?.status
            : 'UNKNOWN'

          return {
            ...jerseyData,
            playerName,
            tournamentName,
            currentStatus,
          }
        }

        switch (type) {
          case "CREATE":
            const newJersey = computeJerseyFields(jersey)
            const newJerseyExists = prev.jerseys.edges.find(
              (edge: any) => edge.node._id === newJersey?._id
            )
            if (newJerseyExists || search || sort || filter.length > 0) return prev

            toast.success(`Jersey for ${newJersey?.playerName} has been created.`)
            return Object.assign({}, prev, {
              jerseys: {
                ...prev.jerseys,
                total: prev.jerseys.total + 1,
                edges: [
                  { cursor: newJersey?._id, node: newJersey },
                  ...prev.jerseys.edges,
                ],
              },
            })
          case "UPDATE":
            const updatedJersey = computeJerseyFields(jersey)
            if (search || sort || filter.length > 0) return prev

            toast.success(`Jersey for ${updatedJersey?.playerName} has been updated.`)
            return Object.assign({}, prev, {
              jerseys: {
                ...prev.jerseys,
                edges: prev.jerseys.edges.map((edge: any) =>
                  edge.node._id === updatedJersey._id
                    ? { ...edge, node: updatedJersey }
                    : edge
                ),
              },
            })
          case "DELETE":
            const deletedJersey = computeJerseyFields(jersey)
            if (search || sort || filter.length > 0) return prev

            toast.success(`Jersey for ${deletedJersey?.playerName} has been deleted.`)
            return Object.assign({}, prev, {
              jerseys: {
                ...prev.jerseys,
                total: prev.jerseys.total - 1,
                edges: prev.jerseys.edges.filter(
                  (edge: any) => edge.node._id !== deletedJersey._id
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
    const nodes = data?.jerseys.edges.map((edge: any) => edge.node) || []
    const pageInfo = data?.jerseys.pageInfo

    setPage((prev) => ({
      ...prev,
      max: data?.jerseys.pages || 1,
    }))

    return {
      total: data?.jerseys.total || 0,
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

  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        id: "select",
        footer: () => {
          return (
            <Checkbox
              checked={
                selectedIds.size === data?.jerseys.edges.length &&
                data?.jerseys.edges.length > 0
              }
              className="hover:cursor-pointer"
              onCheckedChange={(value: boolean) => {
                if (value) {
                  const allIds = new Set<string>(
                    data?.jerseys.edges.map((edge: any) => edge.node._id)
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
        accessorKey: "playerName",
        header: () => (
          <SortHeader
            label="Player"
            sortKey="playerName"
            sortState={sort}
            onSortChange={onSort}
          />
        ),
        footer: () => (
          <ColumnFilter
            label="Player"
            filterKey="playerName"
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
        accessorKey: "size",
        header: () => (
          <SortHeader
            label="Size"
            sortKey="size"
            sortState={sort}
            onSortChange={onSort}
          />
        ),
        footer: () => (
          <ColumnFilter
            label="Size"
            filterKey="size"
            filterType="SELECT"
            filterValue={filter}
            onFilterChange={onFilter}
            options={[
              { label: "XXS", value: "XXS" },
              { label: "XS", value: "XS" },
              { label: "S", value: "S" },
              { label: "M", value: "M" },
              { label: "L", value: "L" },
              { label: "XL", value: "XL" },
              { label: "XXL", value: "XXL" },
              { label: "3XL", value: "XXXL" },
              { label: "4XL", value: "XXXXL" },
              { label: "5XL", value: "XXXXXL" },
            ]}
          />
        ),
        cell: ({ row }) => (
          <JerseyBadge value={row.original.size} />
        ),
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
            filterValue={filter}
            onFilterChange={onFilter}
            options={[
              { label: "Pending", value: "PENDING" },
              { label: "Paid", value: "PAID" },
              { label: "Claimed", value: "CLAIMED" },
              { label: "Cancelled", value: "CANCELLED" },
            ]}
          />
        ),
        cell: ({ row }) => (
          <JerseyBadge value={row.original.currentStatus} />
        ),
      },
    ],
    [sort, onSort, filter, onFilter, selectedIds, data?.jerseys]
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
            jerseys: {
              ...prev.jerseys,
              edges: [...prev.jerseys.edges, ...more.jerseys.edges],
              pageInfo: more.jerseys.pageInfo,
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
        <Shirt className="size-5" />
        <Label className="text-2xl">Jerseys</Label>
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
              {/* <BatchMenu
                ids={Array.from(selectedIds)}
                clearSelected={() => setSelectedIds(new Set())}
              /> */}
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
      // rowView={<ViewDialog row />}
      />
    </div>
  )
}

export default Page
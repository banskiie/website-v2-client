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
import { InfoIcon, Settings, Trash2Icon, Clock } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { format } from "date-fns/format"
import { Checkbox } from "@/components/ui/checkbox"

const LOGS = gql`
  query Logs(
    $first: Int!
    $after: String
    $search: String
    $filter: [Filter]
    $sort: Sort
  ) {
    logs(
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
          action
          createdAt
          updatedAt
          user {
            _id
            name
            email
            role
            contactNumber
            username
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

const LOG_CHANGED = gql`
  subscription LogChanged {
    logChanged {
      type
      log {
        _id
        action
        createdAt
        updatedAt
        user {
          _id
          name
          email
          role
          contactNumber
          username
        }
      }
    }
  }
`

interface ILog {
  _id: string
  action: string
  createdAt: string
  updatedAt: string
  user: {
    _id: string
    name: string
    email: string
    role: string
    contactNumber?: string
    username: string
  }
}

const ActionsColumn = ({ data }: { data?: ILog }) => {
  const log = useMemo(() => data, [data])
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
      // onClick={() => {
      //   console.log("View log:", log)
      // }}
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
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
  const { data, loading, fetchMore, subscribeToMore }: any = useQuery(LOGS, {
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
      document: LOG_CHANGED,
      updateQuery: (prev: any, { subscriptionData }: any) => {
        if (!subscriptionData.data) return prev
        const { type, log } = subscriptionData.data.logChanged

        switch (type) {
          case "CREATE":
            const newLog = log
            const newLogExists = prev.logs.edges.find(
              (edge: any) => edge.node._id === newLog?._id
            )
            if (newLogExists || search || sort || filter.length > 0)
              return prev
            toast.success(`New log entry has been created.`)
            return Object.assign({}, prev, {
              logs: {
                ...prev.logs,
                total: prev.logs.total + 1,
                edges: [
                  { cursor: newLog?._id, node: newLog },
                  ...prev.logs.edges,
                ],
              },
            })
          case "UPDATE":
            const updatedLog = log
            if (search || sort || filter.length > 0) return prev
            toast.success(`Log has been updated.`)
            return Object.assign({}, prev, {
              logs: {
                ...prev.logs,
                edges: prev.logs.edges.map((edge: any) =>
                  edge.node._id === updatedLog._id
                    ? { ...edge, node: updatedLog }
                    : edge
                ),
              },
            })
          case "DELETE":
            const deletedLog = log
            if (search || sort || filter.length > 0) return prev
            toast.success(`Log has been deleted.`)
            return Object.assign({}, prev, {
              logs: {
                ...prev.logs,
                total: prev.logs.total - 1,
                edges: prev.logs.edges.filter(
                  (edge: any) => edge.node._id !== deletedLog._id
                ),
              },
            })
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
    const nodes = data?.logs.edges.map((edge: any) => edge.node) || []
    const pageInfo = data?.logs.pageInfo

    setPage((prev) => ({
      ...prev,
      max: data?.logs.pages || 1,
    }))

    return {
      total: data?.logs.total || 0,
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

  const columns: ColumnDef<ILog>[] = useMemo(
    () => [
      {
        id: "select",
        footer: () => {
          return (
            <Checkbox
              checked={
                selectedIds.size === data?.logs.edges.length &&
                data?.logs.edges.length > 0
              }
              className="hover:cursor-pointer"
              onCheckedChange={(value: boolean) => {
                if (value) {
                  const allIds = new Set<string>(
                    data?.logs.edges.map((edge: any) => edge.node._id)
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
        accessorKey: "user.name",
        header: () => (
          <SortHeader
            label="User"
            sortKey="user.name"
            sortState={sort}
            onSortChange={onSort}
          />
        ),
        footer: () => (
          <ColumnFilter
            label="User"
            filterKey="user.name"
            filterType="TEXT"
            filterValue={filter}
            onFilterChange={onFilter}
          />
        ),
        cell: ({ row }) => {
          const user = (row.original as any).user
          return (
            <div>
              <div className="font-medium">{user.name || user.email}</div>
              <div className="text-sm text-muted-foreground">
                {user.email}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "action",
        header: () => (
          <SortHeader
            label="Action"
            sortKey="action"
            sortState={sort}
            onSortChange={onSort}
          />
        ),
        footer: () => (
          <ColumnFilter
            label="Action"
            filterKey="action"
            filterType="TEXT"
            filterValue={filter}
            onFilterChange={onFilter}
          />
        ),
        cell: ({ row }) => {
          const action = (row.original as any).action
          return (
            <div className="max-w-[300px] truncate" title={action}>
              {action}
            </div>
          )
        },
      },

      {
        accessorKey: "user.role",
        header: () => (
          <SortHeader
            label="User Role"
            sortKey="user.role"
            sortState={sort}
            onSortChange={onSort}
          />
        ),
        footer: () => (
          <ColumnFilter
            label="User Role"
            filterKey="user.role"
            filterType="SELECT"
            options={[
              { label: "Admin", value: "ADMIN" },
              { label: "Organizer", value: "ORGANIZER" },
              { label: "Support", value: "SUPPORT" },
            ]}
            filterValue={filter}
            onFilterChange={onFilter}
          />
        ),
        cell: ({ row }) => {
          const user = (row.original as any).user
          const role = user.role || "UNKNOWN"
          const roleColors: Record<string, string> = {
            ADMIN: "bg-purple-100 text-purple-800",
            ORGANIZER: "bg-blue-100 text-blue-800",
            SUPPORT: "bg-green-100 text-green-800",
          }
          return (
            <Badge
              className={cn(
                roleColors[role] || "bg-gray-100 text-gray-800",
                "capitalize"
              )}
            >
              {role.toLowerCase()}
            </Badge>
          )
        },
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
        footer: () => (
          <ColumnFilter
            label="Created At"
            filterKey="createdAt"
            filterType="DATE_RANGE"
            filterValue={filter}
            onFilterChange={onFilter}
          />
        ),
        cell: ({ row }) => {
          const createdAt = (row.original as any).createdAt
          return (
            <div>
              <div>{format(new Date(createdAt), "PP")}</div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(createdAt), "p")}
              </div>
            </div>
          )
        },
      },
    ],
    [sort, onSort, filter, onFilter, selectedIds, data?.logs]
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
            logs: {
              ...prev.logs,
              edges: [...prev.logs.edges, ...more.logs.edges],
              pageInfo: more.logs.pageInfo,
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
        <Clock className="size-5" />
        <Label className="text-2xl">Activity Logs</Label>
      </div>
      <div className="w-full flex justify-between">
        <InputGroup className="w-[350px]">
          <InputGroupInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
            placeholder="Search actions or users..."
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
            <span className="text-sm text-muted-foreground">Loading logs...</span>
          ) : total === 0 ? (
            <span className="text-sm text-muted-foreground">No logs found.</span>
          ) : (
            <div className="space-x-0.5">
              <span className="text-sm text-muted-foreground">
                Showing {(page.current - 1) * rows + 1}-
                {page.current === page.max ? total : page.current * rows} out of{" "}
                {total} log{total === 1 ? "" : "s"}.{" "}
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
  )
}

export default Page
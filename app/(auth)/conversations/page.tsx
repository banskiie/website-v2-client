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
// import { IConversation, IConversationInput, Role } from "@/types/conversation.interface"
import { gql } from "@apollo/client"
import { useQuery } from "@apollo/client/react"
import { ColumnDef } from "@tanstack/react-table"
import { InfoIcon, MessageCircle, Settings } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
// import FormDialog from "./dialogs/form"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// import ViewDialog from "./dialogs/view"
import RoleBadge from "@/components/badges/role-badge"
// import StatusDialog from "./dialogs/status"
import ActiveBadge from "@/components/badges/active-badge"
import { Checkbox } from "@/components/ui/checkbox"
// import BatchMenu from "./dialogs/batch"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import ConvoDataTable from "@/components/table/convo-table"
import { format, formatDistanceToNow } from "date-fns"

const CONVERSATIONS = gql`
  query Conversations(
    $first: Int
    $after: String
    $search: String
    $filter: [Filter]
    $sort: Sort
  ) {
    conversations(
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
          customerName
          customerEmail
          assignedAgentName
          lastMessageText
          sentAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

// const CONVERSATION_CHANGED = gql`
//   subscription ConversationChanged {
//     conversationChanged {
//       type
//       conversation {
//         _id
//         name
//         conversationname
//         role
//         isActive
//       }
//       conversations {
//         _id
//         name
//         conversationname
//         role
//         isActive
//       }
//     }
//   }
// `

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
    CONVERSATIONS,
    {
      variables: {
        first: rows,
        search,
        sort,
        filter,
      },
      fetchPolicy: "network-only",
      notifyOnNetworkStatusChange: true,
    },
  )


  // // Subscription to Conversation Changes
  // useEffect(() => {
  //   const unsubscribe = subscribeToMore({
  //     document: CONVERSATION_CHANGED,
  //     updateQuery: (prev: any, { subscriptionData }: any) => {
  //       if (!subscriptionData.data) return prev
  //       const { type, conversation, conversations } = subscriptionData.data.conversationChanged
  //       // Update the conversations list based on the type of change
  //       switch (type) {
  //         case "CREATE":
  //           // Add the new conversation to the top of the list
  //           const newConversation = conversation
  //           const newConversationExists = prev.conversations.edges.find(
  //             (edge: any) => edge.node._id === newConversation?._id,
  //           )
  //           if (newConversationExists || search || sort || filter.length > 0)
  //             return prev // Skip updating during search/sort/filter
  //           toast.success(`Conversation (${newConversation?.name}) has been created.`)
  //           return Object.assign({}, prev, {
  //             conversations: {
  //               ...prev.conversations,
  //               total: prev.conversations.total + 1,
  //               edges: [
  //                 { cursor: newConversation?._id, node: newConversation },
  //                 ...prev.conversations.edges,
  //               ],
  //             },
  //           })
  //         case "UPDATE":
  //           // Update the existing conversation in the list
  //           const updatedConversation = conversation
  //           if (search || sort || filter.length > 0) return prev // Skip updating during search/sort/filter
  //           toast.success(`Conversation (${updatedConversation?.name}) has been updated.`)
  //           return Object.assign({}, prev, {
  //             conversations: {
  //               ...prev.conversations,
  //               edges: prev.conversations.edges.map((edge: any) =>
  //                 edge.node._id === updatedConversation._id
  //                   ? { ...edge, node: updatedConversation }
  //                   : edge,
  //               ),
  //             },
  //           })
  //         case "DELETE":
  //           // Remove the deleted conversation from the list
  //           const deletedConversation = conversation
  //           if (search || sort || filter.length > 0) return prev // Skip updating during search/sort/filter
  //           toast.success(`Conversation (${deletedConversation?.name}) has been deleted.`)
  //           return Object.assign({}, prev, {
  //             conversations: {
  //               ...prev.conversations,
  //               total: prev.conversations.total - 1,
  //               edges: prev.conversations.edges.filter(
  //                 (edge: any) => edge.node._id !== deletedConversation._id,
  //               ),
  //             },
  //           })
  //         case "BATCH_UPDATE":
  //           const updatedConversations = conversations
  //           if (search || sort || filter.length > 0) return prev // Skip updating during search/sort/filter
  //           toast.success(
  //             `Batch update successful for ${updatedConversations.length} conversations.`,
  //           )
  //           const updatedIds = new Set(updatedConversations.map((u: any) => u._id))
  //           return Object.assign({}, prev, {
  //             conversations: {
  //               ...prev.conversations,
  //               edges: prev.conversations.edges.map((edge: any) =>
  //                 updatedIds.has(edge.node._id)
  //                   ? {
  //                       ...edge,
  //                       node: {
  //                         ...edge.node,
  //                         ...updatedConversations.find(
  //                           (u: any) => u._id === edge.node._id,
  //                         ),
  //                       },
  //                     }
  //                   : edge,
  //               ),
  //             },
  //           })
  //         default:
  //           return prev
  //       }
  //     },
  //   })
  //   return () => unsubscribe()
  // }, [subscribeToMore, search, sort, filter])

  // Memoized Data Processing
  const { total, nodes, pageInfo } = useMemo(() => {
    const nodes = data?.conversations.edges.map((edge: any) => edge.node) || []
    const pageInfo = data?.conversations.pageInfo

    setPage((prev) => ({
      ...prev,
      max: data?.conversations.pages || 1,
    }))

    return {
      total: data?.conversations.total || 0,
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
  const columns = useMemo(
    () => [
      {
        accessorKey: "customerEmail",
        cell: ({ row }) => (
          <HoverCard>
            <HoverCardTrigger className="truncate block">
              {row.original.customerName || row.original.customerEmail}
            </HoverCardTrigger>
            <HoverCardContent className="px-2 py-1 text-sm text-muted-foreground w-fit">
              <span className="block -mb-0.5">{row.original.customerName}</span>
              <span className="block text-xs">
                {row.original.customerEmail}
              </span>
              <span className="block text-xs">
                {format(new Date(row.original.sentAt), "PPpp")}
              </span>
            </HoverCardContent>
          </HoverCard>
        ),
        size: 50,
      },
      {
        accessorKey: "lastMessage",
        cell: ({ row }) => (
          <div className="flex">
            <span className="text-muted-foreground flex-1">
              {row.original.lastMessageText}
            </span>
            <span>
              {formatDistanceToNow(new Date(row.original.sentAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        ),
        size: 800,
      },
    ],
    [sort, onSort, filter, onFilter, selectedIds, data?.conversations],
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
            conversations: {
              ...prev.conversations,
              edges: [...prev.conversations.edges, ...more.conversations.edges],
              pageInfo: more.conversations.pageInfo,
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
        <MessageCircle className="size-5" />
        <Label className="text-2xl">Conversations</Label>
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
          {/* {selectedIds.size > 0 && (
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
          )} */}
          {/* <FormDialog /> */}
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
      <ConvoDataTable
        loading={loading}
        columns={columns}
        data={nodes.slice((page.current - 1) * rows, page.current * rows)}
      />
    </div>
  )
}

export default Page

"use client"
import UploadDialog from "./dialogs/upload"
import { gql } from "@apollo/client"
import { useQuery } from "@apollo/client/react"
import { useMemo, useState } from "react"
import { formatDistanceToNowStrict, differenceInWeeks, format } from "date-fns"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { UserCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const VIDEOS = gql`
  query Videos($first: Int, $after: String, $search: String) {
    videos(first: $first, after: $after, search: $search) {
      total
      pages
      edges {
        cursor
        node {
          _id
          title
          dateUploaded
          youtubeId
          players {
            _id
            firstName
            lastName
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

const Page = () => {
  const router = useRouter()
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
  const { data, loading }: any = useQuery(VIDEOS, {
    variables: { first: rows, search },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  })

  const { total, nodes, pageInfo } = useMemo(() => {
    const nodes = data?.videos.edges.map((edge: any) => edge.node) || []
    const pageInfo = data?.videos.pageInfo

    setPage((prev) => ({
      ...prev,
      max: data?.videos.pages || 1,
    }))

    return {
      total: data?.videos.total || 0,
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

  const formatVideoDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInWeeks = differenceInWeeks(now, date)
    if (diffInWeeks > 2) {
      return format(date, "MMM dd, yyyy")
    }
    return formatDistanceToNowStrict(date, { addSuffix: true })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="h-12 w-full flex items-between justify-between gap-2 sticky top-0 bg-background z-10">
        <InputGroup className="flex-1 max-w-[580px]">
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
        <UploadDialog />
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 flex-1 gap-x-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-fit w-full flex flex-col rounded-none items-start gap-1 hover:bg-accent/50 cursor-pointer"
            >
              <Skeleton className="h-76 w-full flex flex-col rounded items-start gap-px p-2 hover:bg-accent/50 cursor-pointer" />
              <Skeleton className="h-4 w-3/4 flex flex-col rounded items-start gap-px p-2 hover:bg-accent/50 cursor-pointer" />
              <Skeleton className="h-4 w-1/3 flex flex-col rounded items-start gap-px p-2 hover:bg-accent/50 cursor-pointer" />
              <Skeleton className="h-4 w-1/2 flex flex-col rounded items-start gap-px p-2 hover:bg-accent/50 cursor-pointer" />
            </div>
          ))}
        </div>
      ) : nodes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 flex-1 gap-x-2">
          {nodes.map((video: any) => (
            <div
              className="h-fit w-full flex flex-col items-start hover:bg-accent/50 cursor-pointer rounded-md"
              key={video._id}
              onClick={() => router.push(`/videos/${video._id}`)}
            >
              <Image
                width={300}
                height={300}
                src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                alt={video.title}
                className="object-cover w-full aspect-video rounded"
              />
              <span className="text-lg font-medium truncate block">
                {video.title}
              </span>
              {video?.players?.length > 0 ? (
                <div className="flex items-center gap-1 -my-1">
                  <UserCircle className="size-3.5" />
                  <span className="truncate block">
                    {video?.players.length > 2
                      ? `${video.players[0].firstName} ${
                          video.players[0].lastName
                        }, ${video.players[1].firstName} ${
                          video.players[1].lastName
                        } and ${video.players.length - 2} more`
                      : video?.players
                          .map(
                            (player: any) =>
                              `${player.firstName} ${player.lastName}`
                          )
                          .join(", ")}
                  </span>
                </div>
              ) : (
                <span className="truncate block pb-1 -mb-px text-muted-foreground">
                  No players
                </span>
              )}
              <span className="truncate block pb-1 -mb-px">
                {formatVideoDate(video.dateUploaded)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full flex-1 bg-slate-100 rounded-xl">
          <span className="text-muted-foreground text-2xl">
            Please upload videos to see them here. 😒
          </span>
        </div>
      )}
    </div>
  )
}

export default Page

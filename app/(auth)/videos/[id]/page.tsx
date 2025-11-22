"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { gql } from "@apollo/client"
import { useQuery } from "@apollo/client/react"
import {
  format,
  formatDistanceToNow,
  formatDistanceToNowStrict,
} from "date-fns"
import { EllipsisVertical } from "lucide-react"
import Link from "next/link"
import React, { use } from "react"
import LiteYouTubeEmbed from "react-lite-youtube-embed"
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css"

const VIDEO = gql`
  query Video($_id: ID!) {
    video(_id: $_id) {
      _id
      title
      youtubeUrl
      youtubeId
      players {
        firstName
        lastName
      }
      comments {
        content
        by {
          name
        }
      }
      dateUploaded
      uploadedBy {
        name
      }
    }
  }
`

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: _id } = use(params)
  const { data, loading }: any = useQuery(VIDEO, {
    variables: { _id },
    skip: !_id,
    fetchPolicy: "network-only",
  })

  if (loading) return <div>Loading...</div>

  return (
    <div className="flex gap-3 flex-col xl:flex-row ">
      <div className="w-full flex flex-col gap-2 xl:flex-1">
        <div className="rounded-md overflow-hidden aspect-video">
          <LiteYouTubeEmbed
            id={data?.video?.youtubeId}
            title={data?.video?.title}
            enableJsApi
            autoplay={true}
            lazyLoad={true}
            adNetwork={true}
            poster="default"
            style={{
              height: "100%",
              width: "100%",
            }}
          />
        </div>
        <div className="w-full flex justify-between items-center gap-2">
          <div className="flex-1">
            <span className="block text-2xl">{data?.video?.title}</span>
            <span className="block text-lg">
              {format(new Date(data?.video?.dateUploaded), "MMMM dd, yyyy")} •{" "}
              {formatDistanceToNowStrict(new Date(data?.video?.dateUploaded), {
                addSuffix: true,
              })}
            </span>
            <div>
              {data?.video?.players?.length > 0 ? (
                <div>
                  <span className="font-semibold">Players: </span>
                  {data.video.players.map((player: any, index: number) => (
                    <Link
                      key={index}
                      href="#"
                      className="hover:underline"
                    >{`${player.firstName} ${player.lastName}`}</Link>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground">
                  No players tagged.
                </span>
              )}
            </div>
          </div>
          <Button size="icon-lg" className="mr-2 scale-150" variant="ghost">
            <EllipsisVertical />
          </Button>
        </div>
      </div>
      <Separator className="block xl:hidden" />
      <div className="w-full xl:w-96">
        <span className="text-xl">
          Comments ({data?.video?.comments?.length || 0})
        </span>
      </div>
    </div>
  )
}

export default Page

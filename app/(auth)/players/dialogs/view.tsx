"use client"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { gql } from "@apollo/client"
import { useQuery } from "@apollo/client/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { IPlayer } from "@/types/player.interface"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

const PLAYER = gql`
  query Player($_id: ID!) {
    player(_id: $_id) {
      _id
      firstName
      middleName
      lastName
      suffix
      gender
      birthDate
      email
      phoneNumber
      levels {
        level
        dateLevelled
      }
      validDocuments {
        documentURL
        documentType
        dateUploaded
      }
      videos {
        _id
        title
        dateUploaded
        youtubeId
      }
      isActive
    }
  }
`

type Props = {
  _id?: string
  row?: boolean
  openFromParent?: boolean
  setOpenFromParent?: (open: boolean) => void
  externalUse?: boolean
  title?: string
  titleClassName?: string
  rowSettings?: {
    clearId: () => void
    open: boolean
    onOpenChange: (open: boolean) => void
  }
}

const ViewDialog = (props: Props) => {
  // Dialog open state
  const [open, setOpen] = useState(false)
  // Determine open state based on whether it's row view or not
  const isOpen = props.row ? props.rowSettings?.open || false : open
  const setIsOpen = (value: boolean) => {
    if (props.row) {
      props.rowSettings?.onOpenChange(value)
    } else {
      setOpen(value)
    }
  }
  const { data, loading }: any = useQuery(PLAYER, {
    variables: { _id: props._id },
    skip: !isOpen || !Boolean(props._id),
    fetchPolicy: "network-only",
  })
  const player = data?.player as IPlayer

  const onClose = () => {
    if (props.row) {
      props.rowSettings?.clearId()
      props.rowSettings?.onOpenChange(false)
    } else {
      setOpen(false)
    }
  }

  return (
    <Dialog modal open={isOpen} onOpenChange={setIsOpen}>
      <form>
        <DialogTrigger asChild>
          {props.row ? null : props.externalUse ? (
            <span
              className={cn(
                "hover:underline hover:cursor-pointer",
                props.titleClassName
              )}
            >
              {props.title || "View"}
            </span>
          ) : (
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              View
            </DropdownMenuItem>
          )}
        </DialogTrigger>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle>View Player</DialogTitle>
            <DialogDescription>
              View the details of this player below.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="details" className="">
            <TabsList className="w-full grid grid-cols-4 -mt-2 mb-1">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="levels">Levels</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <div className="grid grid-cols-2 gap-2 -mt-2 h-[36vh] overflow-y-auto place-content-start">
                <div className="col-span-2">
                  <Label>Name</Label>
                  {loading ? (
                    <Skeleton className="w-full my-1 h-3" />
                  ) : (
                    <span className="block text-sm">
                      {player?.firstName} {player?.middleName}{" "}
                      {player?.lastName} {player?.suffix}
                    </span>
                  )}
                </div>
                <div className="col-span-2">
                  <Label>Gender</Label>
                  {loading ? (
                    <Skeleton className="w-full my-1 h-3" />
                  ) : (
                    <span className="block text-sm capitalize">
                      {player?.gender.toLocaleLowerCase()}
                    </span>
                  )}
                </div>
                <div className="col-span-2">
                  <Label>Birthday</Label>
                  {loading ? (
                    <Skeleton className="w-full my-1 h-3" />
                  ) : (
                    <span className="block text-sm capitalize">
                      {format(
                        player?.birthDate
                          ? new Date(player?.birthDate)
                          : new Date(),
                        "PP"
                      )}{" "}
                      <span className="text-muted-foreground lowercase">
                        (
                        {player?.birthDate
                          ? `${Math.floor(
                              (Date.now() -
                                new Date(player?.birthDate).getTime()) /
                                (1000 * 60 * 60 * 24 * 365.25)
                            )} y.o.`
                          : "N/A"}
                        )
                      </span>
                    </span>
                  )}
                </div>
                <div className="col-span-2">
                  <Label>Email Address</Label>
                  {loading ? (
                    <Skeleton className="w-full my-1 h-3" />
                  ) : (
                    <span className="block text-sm">
                      {player?.email || "N/A"}
                    </span>
                  )}
                </div>
                <div className="col-span-2">
                  <Label>Phone No.</Label>
                  {loading ? (
                    <Skeleton className="w-full my-1 h-3" />
                  ) : (
                    <span
                      className={cn(
                        "block text-sm",
                        !player?.phoneNumber && "text-muted-foreground"
                      )}
                    >
                      {player?.phoneNumber || "N/A"}
                    </span>
                  )}
                </div>
                <div className="col-span-2">
                  <Label>Active</Label>
                  {loading ? (
                    <Skeleton className="w-full my-1 h-3" />
                  ) : (
                    <span
                      className={cn(
                        "block text-sm",
                        !player?.isActive && "text-muted-foreground"
                      )}
                    >
                      {player?.isActive ? "Yes" : "No"}
                    </span>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="levels">
              <div className="grid grid-cols-2 gap-2 -mt-2 h-[36vh] overflow-y-auto place-content-start">
                {player?.levels && player.levels?.length > 0 ? (
                  player?.levels.length
                ) : (
                  <div className="text-muted-foreground text-sm text-center col-span-2 h-[36vh] flex items-center justify-center">
                    Unlevelled. 😿
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="requirements">
              <div className="grid grid-cols-2 gap-2 -mt-2 h-[36vh] overflow-y-auto place-content-start">
                {player?.validDocuments && player.validDocuments?.length > 0 ? (
                  player?.validDocuments.length
                ) : (
                  <div className="text-muted-foreground text-sm text-center col-span-2 h-[36vh] flex items-center justify-center">
                    No documents submitted.
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="videos">
              <div className="flex flex-col gap-2 -mt-2 h-[36vh] overflow-y-auto place-content-start">
                {player?.videos && player.videos?.length > 0 ? (
                  <div className="flex flex-col gap-px">
                    <Label>Links</Label>
                    {player?.videos.map((video, index) => (
                      <div key={video._id}>
                        <Link
                          href={`/videos/${video._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline w-full"
                        >
                          <span className="block text-sm">
                            {index + 1}. {video.title}
                          </span>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm text-center col-span-2 h-[36vh] flex items-center justify-center">
                    No documents submitted.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <DialogClose asChild>
              <Button className="w-20" onClick={onClose} variant="outline">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}

export default ViewDialog

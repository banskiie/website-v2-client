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
import { IEntry } from "@/types/entry.interface"
import { format, formatDistanceToNowStrict } from "date-fns"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { toast } from "sonner"
import { Copy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const ENTRY = gql`
  query Entry($_id: ID!) {
    entry(_id: $_id) {
      _id
      entryNumber
      entryKey
      club
      isInSoftware
      isEarlyBird
      event {
        name
        type
        pricePerPlayer
        earlyBirdPricePerPlayer
        currency
        isDissolved
        tournament {
          name
        }
      }
      player1Entry {
        firstName
        middleName
        lastName
        suffix
        gender
        birthDate
        email
        phoneNumber
        jerseySize
      }
      player2Entry {
        firstName
        middleName
        lastName
        suffix
        gender
        birthDate
        email
        phoneNumber
        jerseySize
      }
    }
  }
`

type Props = {
  _id?: string
  row?: boolean
  openFromParent?: boolean
  setOpenFromParent?: (open: boolean) => void

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
  const { data, loading, error }: any = useQuery(ENTRY, {
    variables: { _id: props._id },
    skip: !isOpen || !Boolean(props._id),
    fetchPolicy: "network-only",
  })
  const entry = data?.entry as IEntry

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
          {props.row ? null : (
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
            <DialogTitle className="flex items-center justify-start gap-1.5">
              <span>Entry: {entry?.entryNumber} </span>
              {entry?.isEarlyBird && (
                <Badge variant="outline-info" className="text-xs py-px -my-px">
                  Early Bird
                </Badge>
              )}
              {entry?.isInSoftware && (
                <Badge
                  variant="outline-warning"
                  className="text-xs py-px -my-px"
                >
                  In Software
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              View the details of this entry below.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="details" className="">
            <TabsList className="w-full grid grid-cols-3 -mt-2 mb-1">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="players">Players</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <div className="grid grid-cols-2 gap-2 h-[36vh] overflow-y-auto place-content-start">
                <div
                  className="col-span-2 hover:cursor-pointer"
                  onClick={(e) => {
                    toast.success(
                      `${entry.entryNumber}_${entry.entryKey}` +
                        " copied to clipboard!"
                    )
                    e.stopPropagation()
                    navigator.clipboard.writeText(
                      `${entry.entryNumber}_${entry.entryKey}`
                    )
                  }}
                  title="Click to copy to clipboard"
                >
                  <Label>
                    Reference No. <Copy className="size-3 -ml-1" />
                  </Label>
                  {loading ? (
                    <Skeleton className="w-full my-1 h-3" />
                  ) : (
                    <span className="block text-sm">
                      {entry?.entryNumber}_{entry?.entryKey}
                    </span>
                  )}
                </div>
                <div>
                  <Label>Entry Number</Label>
                  {loading ? (
                    <Skeleton className="w-full my-1 h-3" />
                  ) : (
                    <span className="block text-sm">{entry?.entryNumber}</span>
                  )}
                </div>
                <div>
                  <Label>Entry Key</Label>
                  {loading ? (
                    <Skeleton className="w-full my-1 h-3" />
                  ) : (
                    <span className="block text-sm">{entry?.entryKey}</span>
                  )}
                </div>
                <div className="col-span-2">
                  <Label>Event</Label>
                  {loading ? (
                    <Skeleton className="w-full my-1 h-3" />
                  ) : (
                    <span className="block text-sm">
                      <span
                        className={cn(
                          entry?.event?.isDissolved && "line-through"
                        )}
                      >
                        {entry?.event?.name} (
                        <span className="capitalize">
                          {entry?.event?.type.toLocaleLowerCase()}
                        </span>
                        )
                      </span>
                      {entry?.event?.isDissolved && (
                        <span className="text-destructive ml-1">
                          (Dissolved)
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <div className="col-span-2">
                  <Label>Tournament</Label>
                  {loading ? (
                    <Skeleton className="w-full my-1 h-3" />
                  ) : (
                    <span className="block text-sm">
                      {entry?.event?.tournament.name}
                    </span>
                  )}
                </div>
                <div className="col-span-2">
                  <Label>Total Event Fee</Label>
                  {loading ? (
                    <Skeleton className="w-full my-1 h-3" />
                  ) : (
                    <span className="block text-sm">
                      {(
                        ((entry?.isEarlyBird
                          ? entry?.event?.earlyBirdPricePerPlayer
                          : entry?.event?.pricePerPlayer) || 0) *
                        (entry?.event?.type === "DOUBLES" ? 2 : 1)
                      )?.toLocaleString("en-PH", {
                        style: "currency",
                        currency: entry?.event?.currency || "PHP",
                        minimumFractionDigits: 2,
                      })}{" "}
                      {entry?.event?.type === "DOUBLES" ? (
                        <span className="text-muted-foreground">
                          (
                          {(entry?.isEarlyBird
                            ? entry?.event?.earlyBirdPricePerPlayer
                            : entry?.event?.pricePerPlayer
                          )?.toLocaleString("en-PH", {
                            style: "currency",
                            currency: entry?.event?.currency || "PHP",
                            minimumFractionDigits: 2,
                          })}{" "}
                          per player)
                        </span>
                      ) : (
                        ""
                      )}
                    </span>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="players">
              <div className="grid grid-cols-2 gap-2 h-[36vh] overflow-y-auto place-content-start">
                {entry?.player1Entry && (
                  <div className="col-span-2 grid grid-cols-2 gap-2 bg-info/10 p-2">
                    <Label className="font-medium col-span-2">Player 1</Label>
                    <div className="col-span-2">
                      <Label>Entry Name</Label>
                      {loading ? (
                        <Skeleton className="w-full my-1 h-3" />
                      ) : (
                        <span className="block text-sm">
                          {entry?.player1Entry.firstName}{" "}
                          {entry?.player1Entry.middleName}{" "}
                          {entry?.player1Entry.lastName}
                          {entry?.player1Entry.suffix}
                        </span>
                      )}
                    </div>
                    <div>
                      <Label>Jersey Size</Label>
                      {loading ? (
                        <Skeleton className="w-full my-1 h-3" />
                      ) : (
                        <span className="block text-sm">
                          {entry?.player1Entry.jerseySize || "N/A"}
                        </span>
                      )}
                    </div>
                    <div>
                      <Label>Email</Label>
                      {loading ? (
                        <Skeleton className="w-full my-1 h-3" />
                      ) : (
                        <span className="block text-sm">
                          {entry?.player1Entry.email || "N/A"}
                        </span>
                      )}
                    </div>
                    <div>
                      <Label>Contact No.</Label>
                      {loading ? (
                        <Skeleton className="w-full my-1 h-3" />
                      ) : (
                        <span className="block text-sm">
                          {entry?.player1Entry.phoneNumber || "N/A"}
                        </span>
                      )}
                    </div>
                    <div>
                      <Label>Birthday (Age)</Label>
                      {loading ? (
                        <Skeleton className="w-full my-1 h-3" />
                      ) : (
                        <span className="block text-sm">
                          {format(entry?.player1Entry.birthDate, "PP")} (
                          {`${formatDistanceToNowStrict(
                            entry?.player1Entry.birthDate
                          )} old`}
                          )
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {entry?.event?.type === "DOUBLES" && (
                  <div className="col-span-2 grid grid-cols-2 gap-2 bg-destructive/20">
                    <Separator className="col-span-2" />
                    <Label className="font-medium col-span-2">Player 2</Label>
                    {entry?.player2Entry && (
                      <>
                        <div className="col-span-2">
                          <Label>Entry Name</Label>
                          {loading ? (
                            <Skeleton className="w-full my-1 h-3" />
                          ) : (
                            <span className="block text-sm">
                              {entry?.player2Entry.firstName}{" "}
                              {entry?.player2Entry.middleName}{" "}
                              {entry?.player2Entry.lastName}
                              {entry?.player2Entry.suffix}
                            </span>
                          )}
                        </div>
                        <div>
                          <Label>Jersey Size</Label>
                          {loading ? (
                            <Skeleton className="w-full my-1 h-3" />
                          ) : (
                            <span className="block text-sm">
                              {entry?.player2Entry.jerseySize || "N/A"}
                            </span>
                          )}
                        </div>
                        <div>
                          <Label>Email</Label>
                          {loading ? (
                            <Skeleton className="w-full my-1 h-3" />
                          ) : (
                            <span className="block text-sm">
                              {entry?.player2Entry.email || "N/A"}
                            </span>
                          )}
                        </div>
                        <div>
                          <Label>Contact No.</Label>
                          {loading ? (
                            <Skeleton className="w-full my-1 h-3" />
                          ) : (
                            <span className="block text-sm">
                              {entry?.player2Entry.phoneNumber || "N/A"}
                            </span>
                          )}
                        </div>
                        <div>
                          <Label>Birthday (Age)</Label>
                          {loading ? (
                            <Skeleton className="w-full my-1 h-3" />
                          ) : (
                            <span className="block text-sm">
                              {format(entry?.player2Entry.birthDate, "PP")} (
                              {`${formatDistanceToNowStrict(
                                entry?.player2Entry.birthDate
                              )} old`}
                              )
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="status">
              <div className="grid grid-cols-2 gap-2 h-[36vh] overflow-y-auto place-content-start"></div>
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

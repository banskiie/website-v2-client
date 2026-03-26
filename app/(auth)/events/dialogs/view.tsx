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
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

const EVENT = gql`
  query Event($_id: ID!) {
    event(_id: $_id) {
      name
      gender
      type
      maxEntries
      pricePerPlayer
      earlyBirdPricePerPlayer
      currency
      location
      maxAge
      minAge
      isClosed
      tournament {
        name
        settings {
          hasEarlyBird
        }
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
  const { data, loading }: any = useQuery(EVENT, {
    variables: { _id: props._id },
    skip: !isOpen || !Boolean(props._id),
    fetchPolicy: "network-only",
  })
  const event = data?.event

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
            <DialogTitle>View Event</DialogTitle>
            <DialogDescription>
              View the details of this event below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 -mt-2 max-h-[36vh] overflow-y-auto">
            <div className="col-span-2">
              <Label>Name</Label>
              {loading ? (
                <Skeleton className="w-full my-1 h-3" />
              ) : (
                <span className="block text-sm">{event?.name}</span>
              )}
            </div>
            <div className="col-span-2">
              <Label>Tournament</Label>
              {loading ? (
                <Skeleton className="w-full my-1 h-3" />
              ) : (
                <span className="block text-sm">{event?.tournament?.name}</span>
              )}
            </div>
            <div>
              <Label>Location</Label>
              {loading ? (
                <Skeleton className="w-full my-1 h-3" />
              ) : (
                <span className="block text-sm capitalize">
                  {event?.location.split("_").join(" ").toLocaleLowerCase()}
                </span>
              )}
            </div>
            <div>
              <Label>Gender</Label>
              {loading ? (
                <Skeleton className="w-full my-1 h-3" />
              ) : (
                <span className="block text-sm capitalize">
                  {event?.gender.toLocaleLowerCase().replaceAll("_", " ")}
                </span>
              )}
            </div>
            <div>
              <Label>Type</Label>
              {loading ? (
                <Skeleton className="w-full my-1 h-3" />
              ) : (
                <span className="block text-sm capitalize">
                  {event?.type.toLocaleLowerCase()}
                </span>
              )}
            </div>
            {event?.maxEntries ? (
              <div>
                <Label>Max Entries</Label>
                {loading ? (
                  <Skeleton className="w-full my-1 h-3" />
                ) : (
                  <span className="block text-sm capitalize">
                    {event?.maxEntries === 0 ? "Unlimited" : event?.maxEntries}
                  </span>
                )}
              </div>
            ) : null}

            <Separator className="col-span-2" />
            <div>
              <Label>Registration Fee</Label>
              {loading ? (
                <Skeleton className="w-full my-1 h-3" />
              ) : (
                <span className="block text-sm capitalize">
                  {!!(
                    event?.type === "SINGLES" &&
                    event?.pricePerPlayer !== undefined &&
                    event?.currency
                  ) ? (
                    Number(event?.pricePerPlayer || 0).toLocaleString("en-US", {
                      style: "currency",
                      currency: event?.currency || "PHP",
                    })
                  ) : (
                    <span>
                      {(Number(event?.pricePerPlayer || 0) * 2).toLocaleString(
                        "en-US",
                        {
                          style: "currency",
                          currency: event?.currency || "PHP",
                        }
                      )}{" "}
                      <span className="lowercase text-muted-foreground">
                        (
                        {Number(event?.pricePerPlayer || 0).toLocaleString(
                          "en-US",
                          {
                            style: "currency",
                            currency: event?.currency || "PHP",
                          }
                        )}{" "}
                        per player)
                      </span>
                    </span>
                  )}
                </span>
              )}
            </div>
            {event?.tournament?.settings?.hasEarlyBird ? (
              <div>
                <Label>Early Bird Reg. Fee</Label>
                {loading ? (
                  <Skeleton className="w-full my-1 h-3" />
                ) : (
                  <span className="block text-sm capitalize">
                    {!!(
                      event?.type === "SINGLES" &&
                      event?.earlyBirdPricePerPlayer !== undefined &&
                      event?.currency
                    ) ? (
                      Number(
                        event?.earlyBirdPricePerPlayer || 0
                      ).toLocaleString("en-US", {
                        style: "currency",
                        currency: event?.currency || "PHP",
                      })
                    ) : (
                      <span>
                        {(
                          Number(event?.earlyBirdPricePerPlayer || 0) * 2
                        ).toLocaleString("en-US", {
                          style: "currency",
                          currency: event?.currency || "PHP",
                        })}{" "}
                        <span className="lowercase text-muted-foreground">
                          (
                          {Number(
                            event?.earlyBirdPricePerPlayer || 0
                          ).toLocaleString("en-US", {
                            style: "currency",
                            currency: event?.currency || "PHP",
                          })}{" "}
                          per player)
                        </span>
                      </span>
                    )}
                  </span>
                )}
              </div>
            ) : null}
            {!!(event?.minAge || event?.maxAge) ? (
              <>
                <Separator className="col-span-2" />
                {event?.minAge ? (
                  <div>
                    <Label>Minimum Age</Label>
                    {loading ? (
                      <Skeleton className="w-full my-1 h-3" />
                    ) : (
                      <span className="block text-sm">
                        {event?.minAge} year{event?.minAge > 1 ? "s" : ""} old
                      </span>
                    )}
                  </div>
                ) : null}
                {event?.maxAge ? (
                  <div>
                    <Label>Maximum Age</Label>
                    {loading ? (
                      <Skeleton className="w-full my-1 h-3" />
                    ) : (
                      <span className="block text-sm">
                        {event?.maxAge} year{event?.maxAge > 1 ? "s" : ""} old
                      </span>
                    )}
                  </div>
                ) : null}
              </>
            ) : null}
            {event?.isClosed ? (
              <>
                <Separator className="col-span-2" />
                <div>
                  <Label className="text-destructive">Closed</Label>
                  {loading ? (
                    <Skeleton className="my-1 w-20 h-4.25" />
                  ) : (
                    <span className="block text-sm">
                      {event?.isClosed ? "Yes" : "No"}
                    </span>
                  )}
                </div>
              </>
            ) : null}
          </div>
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

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StatusBadge from "@/components/badges/status-badge"
import ActiveBadge from "@/components/badges/active-badge"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Info } from "lucide-react"
import { formatDateRange } from "little-date"

const TOURNAMENT = gql`
  query Tournament($_id: ID!) {
    tournament(_id: $_id) {
      _id
      name
      isActive
      createdAt
      updatedAt
      settings {
        hasEarlyBird
        hasFreeJersey
        ticket
        maxEntriesPerPlayer
      }
      dates {
        registrationStart
        registrationEnd
        earlyBirdRegistrationEnd
        earlyBirdPaymentEnd
        registrationPaymentEnd
        tournamentStart
        tournamentEnd
      }
      banks {
        name
        accountNumber
        imageURL
      }
      events {
        name
        gender
        type
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
  // Fetch existing date if updating
  const { data }: any = useQuery(TOURNAMENT, {
    variables: { _id: props._id },
    skip: !isOpen || !Boolean(props._id),
    fetchPolicy: "no-cache",
  })
  const tournament = data?.tournament

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
            <DialogTitle>View Tournament: {tournament?.name}</DialogTitle>
            <DialogDescription>
              View the details of this tournament below.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="details" className="">
            <TabsList className="w-full grid grid-cols-4 -mt-2 mb-1">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="dates">Dates</TabsTrigger>
              <TabsTrigger value="banks">Banks</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <div className="grid grid-cols-1 content-start gap-2 h-[36vh] overflow-y-auto">
                <div className="col-span-2">
                  <Label>Name</Label>
                  <span className="block text-sm">{tournament?.name}</span>
                </div>
                <div>
                  <Label>
                    Ticket No.{" "}
                    <HoverCard>
                      <HoverCardTrigger className="inline-block -ml-1 hover:cursor-pointer">
                        <Info className="size-3.25" />
                      </HoverCardTrigger>
                      <HoverCardContent
                        className="p-2 text-xs w-56"
                        side="right"
                      >
                        This is the ticket number assigned for each entry in
                        this tournament. ex.{" "}
                        <span className="font-medium underline">
                          {tournament?.settings?.ticket}
                          -00000
                        </span>
                      </HoverCardContent>
                    </HoverCard>
                  </Label>
                  <span className="block text-sm">
                    {tournament?.settings?.ticket}
                  </span>
                </div>
                <div>
                  <Label>
                    Max Entries Per Player{" "}
                    <HoverCard>
                      <HoverCardTrigger className="inline-block -ml-1 hover:cursor-pointer">
                        <Info className="size-3.25" />
                      </HoverCardTrigger>
                      <HoverCardContent
                        className="p-2 text-xs w-56"
                        side="right"
                      >
                        Each player can only register up to{" "}
                        <span className="font-medium underline">3 entries</span>{" "}
                        for this tournament.
                      </HoverCardContent>
                    </HoverCard>
                  </Label>
                  <span className="block text-sm">
                    {tournament?.settings?.maxEntriesPerPlayer}
                  </span>
                </div>
                <div>
                  <Label>
                    Free Jersey
                    <HoverCard>
                      <HoverCardTrigger className="inline-block -ml-1 hover:cursor-pointer">
                        <Info className="size-3.25" />
                      </HoverCardTrigger>
                      <HoverCardContent
                        className="p-2 text-xs w-56"
                        side="right"
                      >
                        Players{" "}
                        {tournament?.settings?.hasFreeJersey
                          ? "receive"
                          : "do not receive"}{" "}
                        a free jersey upon registration.
                      </HoverCardContent>
                    </HoverCard>
                  </Label>
                  <StatusBadge status={tournament?.settings?.hasFreeJersey} />
                </div>
                <div>
                  <Label>
                    Early Bird{" "}
                    <HoverCard>
                      <HoverCardTrigger className="inline-block -ml-1 hover:cursor-pointer">
                        <Info className="size-3.25" />
                      </HoverCardTrigger>
                      <HoverCardContent
                        className="p-2 text-xs w-56"
                        side="right"
                      >
                        This tournament{" "}
                        {tournament?.settings?.hasEarlyBird ? "has" : "has no"}{" "}
                        early bird bonuses and deadlines.
                      </HoverCardContent>
                    </HoverCard>
                  </Label>
                  <StatusBadge status={tournament?.settings?.hasEarlyBird} />
                </div>
                <div>
                  <Label>Status</Label>
                  <ActiveBadge isActive={tournament?.isActive} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="dates">
              <div className="grid grid-cols-1 content-start gap-2 h-[36vh] overflow-y-auto">
                <div>
                  <Label>Tournament Period</Label>
                  <span className="block text-sm">
                    {formatDateRange(
                      new Date(
                        tournament?.dates?.tournamentStart || new Date()
                      ),
                      new Date(tournament?.dates?.tournamentEnd || new Date())
                    )}
                  </span>
                </div>
                {tournament?.settings?.hasEarlyBird ? (
                  <>
                    <div>
                      <Label>Early Bird Registration Period</Label>
                      <span className="block text-sm">
                        {formatDateRange(
                          new Date(
                            tournament?.dates?.registrationStart || new Date()
                          ),
                          new Date(
                            tournament?.dates?.earlyBirdRegistrationEnd ||
                              new Date()
                          )
                        )}
                      </span>
                    </div>
                    <div>
                      <Label>Early Bird Payment Deadline</Label>
                      <span className="block text-sm">
                        {formatDateRange(
                          new Date(
                            tournament?.dates?.earlyBirdPaymentEnd || new Date()
                          ),
                          new Date(
                            tournament?.dates?.earlyBirdPaymentEnd || new Date()
                          ),
                          {
                            includeTime: false,
                          }
                        )}
                      </span>
                    </div>
                  </>
                ) : null}
                <div>
                  <Label>Registration Period</Label>
                  <span className="block text-sm">
                    {formatDateRange(
                      new Date(
                        tournament?.dates?.registrationStart || new Date()
                      ),
                      new Date(tournament?.dates?.registrationEnd || new Date())
                    )}
                  </span>
                </div>
                <div>
                  <Label>Registration Payment Deadline</Label>
                  <span className="block text-sm">
                    {formatDateRange(
                      new Date(
                        tournament?.dates?.registrationPaymentEnd || new Date()
                      ),
                      new Date(
                        tournament?.dates?.registrationPaymentEnd || new Date()
                      ),
                      {
                        includeTime: false,
                      }
                    )}
                  </span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="banks" className="flex flex-col gap-2">
              <div className="grid grid-cols-1 content-start gap-2 h-[36vh] overflow-y-auto">
                {tournament?.banks?.length > 0 ? (
                  <div>
                    <Label>Banks ({tournament?.banks?.length}) </Label>
                    {tournament?.banks.map((bank: any, index: number) => (
                      <span className="block text-sm" key={index}>
                        {index + 1}. {bank?.name} - {bank?.accountNumber}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </TabsContent>
            <TabsContent value="events" className="flex flex-col gap-2">
              <div className="grid grid-cols-1 content-start gap-2 h-[36vh] overflow-y-auto">
                {tournament?.events?.length > 0 ? (
                  <div>
                    <Label>Events ({tournament?.events?.length}) </Label>
                    {tournament?.events.map((event: any, index: number) => (
                      <span className="block text-sm" key={index}>
                        {index + 1}. {event?.name}
                      </span>
                    ))}
                  </div>
                ) : null}
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

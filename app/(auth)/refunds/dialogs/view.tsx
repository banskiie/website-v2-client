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
import { useLazyQuery, useQuery } from "@apollo/client/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Paperclip,
  User,
  Calendar,
  MapPin,
  Tag,
  Building,
  CreditCard,
  BadgeCheck,
  BadgeX,
  Mail,
  Phone,
  Cake,
  ZoomIn
} from "lucide-react"
import { cn } from "@/lib/utils"

const REFUND = gql`
  query Refund($_id: ID!) {
    refund(_id: $_id) {
      _id
      payerName
      referenceNumber
      amount
      method
      proofOfRefundURL
      refundDate
      entryList {
        _id
        entryNumber
      }
      remarks {
        remark
        date
        by {
          _id
          name
          email
          contactNumber
          username
          role
          isActive
          createdAt
          updatedAt
        }
      }
      uploadedBy {
        _id
        name
        email
        contactNumber
        username
        role
        isActive
        createdAt
        updatedAt
      }
    }
  }
`

const GET_ENTRY_DETAILS = gql`
  query GetEntryDetails($_id: ID!) {
    entry(_id: $_id) {
      _id
      entryNumber
      entryKey
      club
      isInSoftware
      isEarlyBird
      event {
        _id
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
        createdAt
        updatedAt
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
      connectedPlayer1 {
        _id
        firstName
        middleName
        lastName
        suffix
        gender
        birthDate
        email
        phoneNumber
        isActive
        createdAt
        updatedAt
      }
      connectedPlayer2 {
        _id
        firstName
        middleName
        lastName
        suffix
        gender
        birthDate
        email
        phoneNumber
        isActive
        createdAt
        updatedAt
      }
      statuses {
        status
        date
        reason
      }
      transactions {
        transactionId
        transactionType
        pendingAmount
        amountChanged
        transactionDate
      }
      remarks {
        remark
        date
      }
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

// Entry Details Dialog Component
const EntryDetailsDialog = ({ entryId, entryNumber, children }: {
  entryId: string,
  entryNumber: string,
  children: React.ReactNode
}) => {
  const [open, setOpen] = useState(false)

  const [getEntryDetails, { data, loading, error }] = useLazyQuery<any>(GET_ENTRY_DETAILS, {
    fetchPolicy: "network-only"
  })

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && entryId) {
      getEntryDetails({ variables: { _id: entryId } })
    }
  }

  const entry = data?.entry

  const formatPlayerName = (player: any) => {
    if (!player) return "—"
    const parts = [player.firstName, player.middleName, player.lastName].filter(Boolean)
    let name = parts.join(' ')
    if (player.suffix) name += ` ${player.suffix}`
    return name || "—"
  }

  // Check if there are players
  const hasPlayer1 = entry?.player1Entry || entry?.connectedPlayer1
  const hasPlayer2 = entry?.player2Entry || entry?.connectedPlayer2
  const hasBothPlayers = hasPlayer1 && hasPlayer2
  const totalPlayers = (hasPlayer1 ? 1 : 0) + (hasPlayer2 ? 1 : 0)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
        className="max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Entry Details
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1">
            <span className="font-medium text-foreground">{entryNumber}</span>
            <span className="text-muted-foreground">•</span>
            <span>View comprehensive entry information</span>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="h-[60vh]">
            <Tabs defaultValue="details" className="h-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <Tag className="w-3 h-3" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="event" className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Event
                </TabsTrigger>
                <TabsTrigger value="players" className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  Players ({totalPlayers})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="h-[calc(60vh-3.5rem)] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : error ? (
          <div className="h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Failed to load entry details
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => getEntryDetails({ variables: { _id: entryId } })}
              >
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-[60vh]">
            <Tabs defaultValue="details" className="h-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <Tag className="w-3 h-3" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="event" className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Event
                </TabsTrigger>
                <TabsTrigger value="players" className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  Players ({totalPlayers})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="h-[calc(60vh-3.5rem)] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Entry Number
                    </Label>
                    <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{entry?.entryNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Entry Key</Label>
                    <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{entry?.entryKey}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      Club
                    </Label>
                    <p className="text-sm font-medium">{entry?.club || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Software Status</Label>
                    <div className="flex items-center gap-0.5">
                      {entry?.isInSoftware ? (
                        <>
                          <BadgeCheck className="w-3 h-3 text-green-500" />
                          <span className="text-xs italic underline underline-offset-3 tracking-wider text-green-600">In Software</span>
                        </>
                      ) : (
                        <>
                          <BadgeX className="w-3 h-3 text-red-500" />
                          <span className="text-xs underline underline-offset-3 tracking-wider text-red-600 italic">Not in Software</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Pricing Type</Label>
                    <div className="flex items-center gap-1">
                      {entry?.isEarlyBird ? (
                        <>
                          <BadgeCheck className="w-3 h-3 text-blue-500" />
                          <span className="text-sm text-blue-600 font-medium">Early Bird</span>
                        </>
                      ) : (
                        <span className="text-sm black">Regular</span>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Event Information */}
              <TabsContent value="event" className="h-[calc(60vh-3.5rem)] overflow-y-auto">
                {entry?.event ? (
                  <div className="space-y-4">
                    <div className="pb-4 border-b">
                      <h3 className="text-sm font-medium mb-1">{entry.event.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {entry.event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {entry.event.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Event Type</Label>
                        <p className="text-sm capitalize">{entry.event.type?.toLowerCase()}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Gender</Label>
                        <p className="text-sm capitalize">{entry.event.gender?.toLowerCase()}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          Regular Price
                        </Label>
                        <p className="text-sm font-medium">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: entry.event.currency || "PHP",
                          }).format(entry.event.pricePerPlayer || 0)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          Early Bird Price
                        </Label>
                        <p className="text-sm font-medium">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: entry.event.currency || "PHP",
                          }).format(entry.event.earlyBirdPricePerPlayer || 0)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Max Entries</Label>
                        <p className="text-sm">{entry.event.maxEntries || "—"}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Age Range</Label>
                        <p className="text-sm">
                          {entry.event.minAge && entry.event.maxAge
                            ? `${entry.event.minAge}-${entry.event.maxAge}`
                            : "—"
                          }
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Status</Label>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${entry.event.isClosed ? 'bg-red-500' : 'bg-green-500'}`} />
                          <span className="text-sm">{entry.event.isClosed ? "Closed" : "Active"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No event information</p>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Tab 3: Players Information */}
              <TabsContent value="players" className="h-[calc(60vh-3.5rem)] overflow-y-auto">
                {hasPlayer1 || hasPlayer2 ? (
                  <div className="space-y-6">
                    {/* Single Player Display */}
                    {!hasBothPlayers && (
                      <div className="bg-card rounded-lg border p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Player Information</Label>
                            <p className="text-xs text-muted-foreground">Single player entry</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {/* Player 1 */}
                          {hasPlayer1 && (
                            <>
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Full Name</Label>
                                <p className="text-sm font-medium">{formatPlayerName(entry?.player1Entry || entry?.connectedPlayer1)}</p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Gender</Label>
                                <p className="text-sm capitalize">
                                  {(entry?.player1Entry?.gender || entry?.connectedPlayer1?.gender || "—").toLowerCase()}
                                </p>
                              </div>
                              {(entry?.player1Entry?.birthDate || entry?.connectedPlayer1?.birthDate) && (
                                <div className="space-y-1">
                                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Cake className="w-3 h-3" />
                                    Birth Date
                                  </Label>
                                  <p className="text-sm">
                                    {format(
                                      new Date(entry?.player1Entry?.birthDate || entry?.connectedPlayer1?.birthDate),
                                      "MMM dd, yyyy"
                                    )}
                                  </p>
                                </div>
                              )}
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  Email
                                </Label>
                                <p className="text-sm truncate">
                                  {entry?.player1Entry?.email || entry?.connectedPlayer1?.email || "—"}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  Phone
                                </Label>
                                <p className="text-sm">
                                  {entry?.player1Entry?.phoneNumber || entry?.connectedPlayer1?.phoneNumber || "—"}
                                </p>
                              </div>
                              {entry?.player1Entry?.jerseySize && (
                                <div className="space-y-1">
                                  <Label className="text-xs text-muted-foreground">Jersey Size</Label>
                                  <p className="text-sm">{entry.player1Entry.jerseySize}</p>
                                </div>
                              )}
                            </>
                          )}

                          {/* Player 2 (if only player 2 exists) */}
                          {hasPlayer2 && !hasPlayer1 && (
                            <>
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Full Name</Label>
                                <p className="text-sm font-medium">{formatPlayerName(entry?.player2Entry || entry?.connectedPlayer2)}</p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Gender</Label>
                                <p className="text-sm capitalize">
                                  {(entry?.player2Entry?.gender || entry?.connectedPlayer2?.gender || "—").toLowerCase()}
                                </p>
                              </div>
                              {(entry?.player2Entry?.birthDate || entry?.connectedPlayer2?.birthDate) && (
                                <div className="space-y-1">
                                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Cake className="w-3 h-3" />
                                    Birth Date
                                  </Label>
                                  <p className="text-sm">
                                    {format(
                                      new Date(entry?.player2Entry?.birthDate || entry?.connectedPlayer2?.birthDate),
                                      "MMM dd, yyyy"
                                    )}
                                  </p>
                                </div>
                              )}
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  Email
                                </Label>
                                <p className="text-sm truncate">
                                  {entry?.player2Entry?.email || entry?.connectedPlayer2?.email || "—"}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  Phone
                                </Label>
                                <p className="text-sm">
                                  {entry?.player2Entry?.phoneNumber || entry?.connectedPlayer2?.phoneNumber || "—"}
                                </p>
                              </div>
                              {entry?.player2Entry?.jerseySize && (
                                <div className="space-y-1">
                                  <Label className="text-xs text-muted-foreground">Jersey Size</Label>
                                  <p className="text-sm">{entry.player2Entry.jerseySize}</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Dual Players Display */}
                    {hasBothPlayers && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Player 1 Card */}
                        <div className="bg-card rounded-lg border p-4">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="bg-primary/10 p-2 rounded-lg">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Player 1</Label>
                              <p className="text-xs text-muted-foreground">Primary player</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs text-muted-foreground">Full Name</Label>
                              <p className="text-sm font-medium">{formatPlayerName(entry?.player1Entry || entry?.connectedPlayer1)}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs text-muted-foreground">Gender</Label>
                                <p className="text-sm capitalize">
                                  {(entry?.player1Entry?.gender || entry?.connectedPlayer1?.gender || "—").toLowerCase()}
                                </p>
                              </div>
                              {(entry?.player1Entry?.birthDate || entry?.connectedPlayer1?.birthDate) && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Birth Date</Label>
                                  <p className="text-sm">
                                    {format(
                                      new Date(entry?.player1Entry?.birthDate || entry?.connectedPlayer1?.birthDate),
                                      "MMM dd, yyyy"
                                    )}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Email</Label>
                              <p className="text-sm truncate">
                                {entry?.player1Entry?.email || entry?.connectedPlayer1?.email || "—"}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Phone</Label>
                              <p className="text-sm">
                                {entry?.player1Entry?.phoneNumber || entry?.connectedPlayer1?.phoneNumber || "—"}
                              </p>
                            </div>
                            {entry?.player1Entry?.jerseySize && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Jersey Size</Label>
                                <p className="text-sm">{entry.player1Entry.jerseySize}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Player 2 Card */}
                        <div className="bg-card rounded-lg border p-4">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="bg-muted p-2 rounded-lg">
                              <User className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Player 2</Label>
                              <p className="text-xs text-muted-foreground">Secondary player</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs text-muted-foreground">Full Name</Label>
                              <p className="text-sm font-medium">{formatPlayerName(entry?.player2Entry || entry?.connectedPlayer2)}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs text-muted-foreground">Gender</Label>
                                <p className="text-sm capitalize">
                                  {(entry?.player2Entry?.gender || entry?.connectedPlayer2?.gender || "—").toLowerCase()}
                                </p>
                              </div>
                              {(entry?.player2Entry?.birthDate || entry?.connectedPlayer2?.birthDate) && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Birth Date</Label>
                                  <p className="text-sm">
                                    {format(
                                      new Date(entry?.player2Entry?.birthDate || entry?.connectedPlayer2?.birthDate),
                                      "MMM dd, yyyy"
                                    )}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Email</Label>
                              <p className="text-sm truncate">
                                {entry?.player2Entry?.email || entry?.connectedPlayer2?.email || "—"}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Phone</Label>
                              <p className="text-sm">
                                {entry?.player2Entry?.phoneNumber || entry?.connectedPlayer2?.phoneNumber || "—"}
                              </p>
                            </div>
                            {entry?.player2Entry?.jerseySize && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Jersey Size</Label>
                                <p className="text-sm">{entry.player2Entry.jerseySize}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No player information</p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        <DialogFooter className="pt-4 border-t">
          <DialogClose asChild>
            <Button variant="outline" className="cursor-pointer" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const ViewDialog = (props: Props) => {
  const [open, setOpen] = useState(false)
  const isOpen = props.row ? props.rowSettings?.open || false : open
  const setIsOpen = (value: boolean) => {
    if (props.row) {
      props.rowSettings?.onOpenChange(value)
    } else {
      setOpen(value)
    }
  }
  const { data, loading, error }: any = useQuery(REFUND, {
    variables: { _id: props._id },
    skip: !isOpen || !Boolean(props._id),
    fetchPolicy: "network-only",
  })

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
          className="max-w-4xl"
        >
          <DialogHeader>
            <DialogTitle>View Refund</DialogTitle>
            <DialogDescription>
              View the details of this refund below.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="details" className="">
            <TabsList className="w-full grid grid-cols-2 -mt-2 mb-1">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="proof">Proof</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <div className="h-[60vh] overflow-y-auto">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="h-4 w-1 bg-red-600" />
                  <Label className="text-xs text-muted-foreground">
                    Refund Details
                  </Label>
                </div>
                <div className="border border-b-0 rounded-t-lg p-4 hover:bg-muted/80 transition-colors">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Reference No.</Label>
                    {loading ? (
                      <Skeleton className="w-full my-1 h-3" />
                    ) : (
                      <span className="block text-sm tracking-wide font-medium">
                        {data?.refund?.referenceNumber}
                      </span>
                    )}
                  </div>
                </div>

                <div className="border p-4 hover:bg-muted/80 transition-colors">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Paid By</Label>
                      {loading ? (
                        <Skeleton className="w-full my-1 h-3" />
                      ) : (
                        <span className="block text-sm tracking-wide uppercase underline">
                          {data?.refund?.payerName}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Amount</Label>
                      {loading ? (
                        <Skeleton className="w-full my-1 h-3" />
                      ) : (
                        <span className="block text-sm tracking-wide font-medium">
                          {loading
                            ? null
                            : new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "PHP",
                            }).format(data?.refund?.amount)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border border-t-0 rounded-b-lg p-4 mb-4 hover:bg-muted/80 transition-colors">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Payment Method</Label>
                      {loading ? (
                        <Skeleton className="w-full my-1 h-3" />
                      ) : (
                        <span className="block text-sm font-medium tracking-wide capitalize">
                          {data?.refund?.method.toLowerCase().replaceAll("_", " ")}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Refund Date</Label>
                      {loading ? (
                        <Skeleton className="my-1 w-20 h-4.25" />
                      ) : (
                        <span className="block text-sm tracking-wide font-medium capitalize">
                          {data?.refund?.refundDate &&
                            format(new Date(data?.refund?.refundDate), "PP")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {data?.refund?.entryList && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-4 w-1 bg-red-600" />
                      <Label className="text-xs text-muted-foreground">
                        Entries Involved
                      </Label>
                    </div>

                    <div className="bg-white border rounded-lg p-3">
                      {loading ? (
                        <Skeleton className="w-24 h-5" />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {data.refund.entryList.map((entry: any) => (
                            <EntryDetailsDialog
                              key={entry._id}
                              entryId={entry._id}
                              entryNumber={entry.entryNumber}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs cursor-pointer text-blue-600 underline hover:scale-105 hover:bg-gray-100"
                              >
                                {entry.entryNumber}
                              </Button>
                            </EntryDetailsDialog>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </TabsContent>
            <TabsContent value="proof">
              <div className="h-[60vh]">
                {!data?.refund?.proofOfRefundURL && !loading ? (
                  <span className="text-sm italic text-muted-foreground">
                    No proof of refund uploaded.
                  </span>
                ) : (
                  <Sheet>
                    <SheetTrigger className="cursor-pointer w-full flex items-center justify-center relative group">
                      {data?.refund?.proofOfRefundURL ? (
                        <>
                          <Image
                            width={500}
                            height={500}
                            src={data?.refund?.proofOfRefundURL}
                            alt="Uploaded Image"
                            className="object-contain bg-gray max-h-[60vh] w-full group-hover:bg-gray-100 transition-all duration-200"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 shadow-md">
                              <ZoomIn className="w-4 h-4" />
                              <span className="text-sm font-medium">Click to Expand Image</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Paperclip className="w-6 h-6 text-muted-foreground absolute z-10" />
                          <Skeleton className="w-full h-full rounded-md bg-slate-200" />
                        </div>
                      )}
                    </SheetTrigger>
                    <SheetContent className="h-screen p-[2%]" side="bottom">
                      <SheetHeader hidden>
                        <SheetTitle>Preview</SheetTitle>
                        <SheetDescription>Description</SheetDescription>
                      </SheetHeader>
                      <Image
                        src={data?.refund?.proofOfRefundURL}
                        alt="Uploaded Image"
                        width={500}
                        height={500}
                        className="object-contain h-full w-full"
                      />
                    </SheetContent>
                  </Sheet>
                )}
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <DialogClose asChild>
              <Button className="w-20 cursor-pointer" onClick={onClose} variant="outline">
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
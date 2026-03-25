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
import { toast } from "sonner"
import {
  CheckCircle,
  CheckCircle2,
  CircleAlert,
  CircleQuestionMark,
  Copy,
  MessageSquare,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import PlayerViewDialog from "@/app/(auth)/players/dialogs/view"
import PaymentViewDialog from "@/app/(auth)/payments/dialogs/view"
import RefundViewDialog from "@/app/(auth)/refunds/dialogs/view"

const ENTRY = gql`
  query Entry($_id: ID!) {
    entry(_id: $_id) {
      _id
      entryNumber
      entryKey
      club
      isInSoftware
      isEarlyBird
      statuses {
        status
        date
        reason
        by {
          name
        }
      }
      event {
        name
        type
        pricePerPlayer
        earlyBirdPricePerPlayer
        currency
        isClosed
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
      connectedPlayer1 {
        _id
        firstName
        middleName
        lastName
        suffix
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
      connectedPlayer2 {
        _id
        firstName
        middleName
        lastName
        suffix
      }
      transactions {
        transactionId
        transactionType
        pendingAmount
        amountChanged
        transactionDate
      }
    }
  }
`

const PAYMENT_REMARKS = gql`
  query PaymentRemarksByEntryId($entryId: ID!) {
    paymentRemarksByEntryId(entryId: $entryId) {
      paymentId
      paymentReferenceNumber
      payerName
      amount
      remark
      date
      by {
        name
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

// Define proper types for events
type StatusEvent = {
  type: 'status'
  id: string
  status: string
  date: Date | string
  reason?: string
  by?: { name?: string }
  isStatus: true
  isPaymentRemark: false
}

type PaymentRemarkEvent = {
  type: 'paymentRemark'
  id: string
  status: string
  date: Date | string
  remark: string
  paymentId: string
  paymentReferenceNumber?: string
  payerName: string
  amount: number
  by?: { name?: string }
  isStatus: false
  isPaymentRemark: true
}

type TimelineEvent = StatusEvent | PaymentRemarkEvent

// Helper function to combine and sort events
const combineEvents = (statuses: any[], paymentRemarks: any[]): TimelineEvent[] => {
  const statusEvents: StatusEvent[] = (statuses || []).map((status, index) => ({
    type: 'status',
    id: `status-${index}`,
    status: status.status,
    date: status.date,
    reason: status.reason,
    by: status.by,
    isStatus: true,
    isPaymentRemark: false
  }))

  const remarkEvents: PaymentRemarkEvent[] = (paymentRemarks || []).map((remark, index) => ({
    type: 'paymentRemark',
    id: `remark-${index}`,
    status: 'PAYMENT_REMARK',
    date: remark.date,
    remark: remark.remark,
    paymentId: remark.paymentId,
    paymentReferenceNumber: remark.paymentReferenceNumber,
    payerName: remark.payerName,
    amount: remark.amount,
    by: remark.by,
    isStatus: false,
    isPaymentRemark: true
  }))

  return [...statusEvents, ...remarkEvents]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Type guard functions
const isPaymentRemarkEvent = (event: TimelineEvent): event is PaymentRemarkEvent => {
  return event.isPaymentRemark
}

const isStatusEvent = (event: TimelineEvent): event is StatusEvent => {
  return event.isStatus
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

  // Entry query
  const { data: entryData, loading: entryLoading, error: entryError }: any = useQuery(ENTRY, {
    variables: { _id: props._id },
    skip: !isOpen || !Boolean(props._id),
    fetchPolicy: "network-only",
  })

  // Payment remarks query
  const { data: paymentRemarksData, loading: paymentRemarksLoading, error: paymentRemarksError }: any = useQuery(PAYMENT_REMARKS, {
    variables: { entryId: props._id },
    skip: !isOpen || !Boolean(props._id),
    fetchPolicy: "network-only",
  })

  const entry = entryData?.entry as IEntry
  const paymentRemarks = paymentRemarksData?.paymentRemarksByEntryId || []

  // Combine all events
  const allEvents = combineEvents(entry?.statuses || [], paymentRemarks)

  if (entryError) console.error(entryError)
  if (paymentRemarksError) console.error(paymentRemarksError)

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
            <TabsList className="w-full grid grid-cols-4 -mt-2 mb-1">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="players">Players</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="transactions">Trans.</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <div className="grid grid-cols-2 gap-2 h-[50vh] overflow-y-auto place-content-start">
                <div
                  className="col-span-2 hover:cursor-pointer"
                  onClick={(e) => {
                    toast.success(
                      `${entry?.entryNumber}_${entry?.entryKey}` +
                      " copied to clipboard!"
                    )
                    e.stopPropagation()
                    navigator.clipboard.writeText(
                      `${entry?.entryNumber}_${entry?.entryKey}`
                    )
                  }}
                  title="Click to copy to clipboard"
                >
                  <Label>
                    Reference No. <Copy className="size-3 -ml-1" />
                  </Label>
                  {entryLoading ? (
                    <Skeleton className="w-full my-1 h-3" />
                  ) : (
                    <span className="block text-sm">
                      {entry?.entryNumber}_{entry?.entryKey}
                    </span>
                  )}
                </div>
                <div>
                  <Label>Entry Number</Label>
                  {entryLoading ? (
                    <Skeleton className="w-full my-1 h-3" />
                  ) : (
                    <span className="block text-sm">{entry?.entryNumber}</span>
                  )}
                </div>
                <div>
                  <Label>Entry Key</Label>
                  {entryLoading ? (
                    <Skeleton className="w-full my-1 h-3" />
                  ) : (
                    <span className="block text-sm">{entry?.entryKey}</span>
                  )}
                </div>
                <div className="col-span-2">
                  <Label>Event</Label>
                  {entryLoading ? (
                    <Skeleton className="w-full my-1 h-3" />
                  ) : (
                    <span className="block text-sm">
                      <span
                        className={cn(
                          entry?.event?.isClosed && "line-through"
                        )}
                      >
                        {entry?.event?.name} (
                        <span className="capitalize">
                          {entry?.event?.type.toLocaleLowerCase()}
                        </span>
                        )
                      </span>
                      {entry?.event?.isClosed && (
                        <span className="text-destructive ml-1">
                          (Closed)
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <div className="col-span-2">
                  <Label>Tournament</Label>
                  {entryLoading ? (
                    <Skeleton className="w-full my-1 h-3" />
                  ) : (
                    <span className="block text-sm">
                      {entry?.event?.tournament.name}
                    </span>
                  )}
                </div>
                <div className="col-span-2">
                  <Label>Total Event Fee</Label>
                  {entryLoading ? (
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
              <div className="grid grid-cols-2 gap-2 h-[50vh] overflow-y-auto place-content-start">
                {entry?.player1Entry && (
                  <div className="col-span-2 grid grid-cols-2 gap-2 bg-info/10 p-2">
                    <Label className="font-medium col-span-2">Player 1</Label>
                    {entry?.connectedPlayer1 && (
                      <div className="col-span-2">
                        <Label>Connected Player</Label>
                        {entryLoading ? (
                          <Skeleton className="w-full my-1 h-3" />
                        ) : (
                          <PlayerViewDialog
                            externalUse
                            _id={entry?.connectedPlayer1?._id}
                            title={`${entry?.connectedPlayer1.firstName} ${entry?.connectedPlayer1.middleName} ${entry?.connectedPlayer1.lastName} ${entry?.connectedPlayer1.suffix}`}
                            titleClassName="block text-sm text-blue-600"
                          />
                        )}
                      </div>
                    )}
                    <div className="col-span-2">
                      <Label>Entry Name</Label>
                      {entryLoading ? (
                        <Skeleton className="w-full my-1 h-3" />
                      ) : (
                        <span className="block text-sm">
                          {entry?.player1Entry.firstName}{" "}
                          {entry?.player1Entry.middleName}{" "}
                          {entry?.player1Entry.lastName}{" "}
                          {entry?.player1Entry.suffix}
                        </span>
                      )}
                    </div>
                    <div>
                      <Label>Jersey Size</Label>
                      {entryLoading ? (
                        <Skeleton className="w-full my-1 h-3" />
                      ) : (
                        <span className="block text-sm">
                          {entry?.player1Entry.jerseySize || "N/A"}
                        </span>
                      )}
                    </div>
                    <div>
                      <Label>Email</Label>
                      {entryLoading ? (
                        <Skeleton className="w-full my-1 h-3" />
                      ) : (
                        <span className="block text-sm">
                          {entry?.player1Entry.email || "N/A"}
                        </span>
                      )}
                    </div>
                    <div>
                      <Label>Contact No.</Label>
                      {entryLoading ? (
                        <Skeleton className="w-full my-1 h-3" />
                      ) : (
                        <span className="block text-sm">
                          {entry?.player1Entry.phoneNumber
                            ? `${entry.player1Entry.phoneNumber}`
                            : "N/A"}
                        </span>
                      )}
                    </div>
                    <div>
                      <Label>Birthday (Age)</Label>
                      {entryLoading ? (
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
                  <div className="col-span-2 grid grid-cols-2 gap-2 bg-destructive/10 p-2">
                    <Label className="font-medium col-span-2">Player 2</Label>
                    {entry?.player2Entry && (
                      <>
                        {entry?.connectedPlayer2 && (
                          <div className="col-span-2">
                            <Label>Connected Player</Label>
                            {entryLoading ? (
                              <Skeleton className="w-full my-1 h-3" />
                            ) : (
                              <PlayerViewDialog
                                externalUse
                                _id={entry?.connectedPlayer2?._id}
                                title={`${entry?.connectedPlayer2.firstName} ${entry?.connectedPlayer2.middleName} ${entry?.connectedPlayer2.lastName} ${entry?.connectedPlayer2.suffix}`}
                                titleClassName="block text-sm text-blue-600"
                              />
                            )}
                          </div>
                        )}
                        <div className="col-span-2">
                          <Label>Entry Name</Label>
                          {entryLoading ? (
                            <Skeleton className="w-full my-1 h-3" />
                          ) : (
                            <span className="block text-sm">
                              {entry?.player2Entry.firstName}{" "}
                              {entry?.player2Entry.middleName}{" "}
                              {entry?.player2Entry.lastName}{" "}
                              {entry?.player2Entry.suffix}
                            </span>
                          )}
                        </div>
                        <div>
                          <Label>Jersey Size</Label>
                          {entryLoading ? (
                            <Skeleton className="w-full my-1 h-3" />
                          ) : (
                            <span className="block text-sm">
                              {entry?.player2Entry.jerseySize || "N/A"}
                            </span>
                          )}
                        </div>
                        <div>
                          <Label>Email</Label>
                          {entryLoading ? (
                            <Skeleton className="w-full my-1 h-3" />
                          ) : (
                            <span className="block text-sm">
                              {entry?.player2Entry.email || "N/A"}
                            </span>
                          )}
                        </div>
                        <div>
                          <Label>Contact No.</Label>
                          {entryLoading ? (
                            <Skeleton className="w-full my-1 h-3" />
                          ) : (
                            <span className="block text-sm">
                              {entry?.player2Entry.phoneNumber || "N/A"}
                            </span>
                          )}
                        </div>
                        <div>
                          <Label>Birthday (Age)</Label>
                          {entryLoading ? (
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
              <div className="flex flex-col gap-2 h-[50vh] overflow-y-auto place-content-start">
                {entryLoading || paymentRemarksLoading ? (
                  <Skeleton className="w-full my-1 h-3" />
                ) : allEvents.length > 0 ? (
                  <div className="h-full">
                    {allEvents.map((event, index) => (
                      <div key={event.id} className="flex gap-2">
                        <div className="flex flex-col justify-start items-center">
                          {(() => {
                            if (isPaymentRemarkEvent(event)) {
                              return (
                                <MessageSquare className="size-4 my-3 text-blue-500" />
                              )
                            }

                            if (index === 0) {
                              switch (event.status) {
                                case "PENDING":
                                  return (
                                    <CheckCircle2 className="size-4 my-2 text-success" />
                                  )
                                case "CANCELLED":
                                case "REJECTED":
                                  return (
                                    <CircleAlert className="size-4 my-2 text-destructive" />
                                  )
                                case "VERIFIED":
                                  return (
                                    <CheckCircle className="size-4 my-2 text-success" />
                                  )
                              }
                              return (
                                <CircleAlert
                                  className={cn(
                                    "size-4 my-2",
                                    index > 0
                                      ? "text-muted-foreground/50"
                                      : "text-info"
                                  )}
                                />
                              )
                            } else {
                              return (
                                <CheckCircle
                                  className={cn(
                                    "size-4 my-2",
                                    index > 0
                                      ? "text-muted-foreground/50"
                                      : "text-success"
                                  )}
                                />
                              )
                            }
                          })()}

                          {index < allEvents.length - 1 && (
                            <div className="min-h-11 w-px bg-gray-200"></div>
                          )}
                        </div>
                        <div className="mt-2">
                          <span
                            className={cn(
                              "capitalize block -mb-0.5",
                              index === 0
                                ? "font-mono"
                                : "text-muted-foreground",
                              isPaymentRemarkEvent(event) && "text-muted-foreground font-medium"
                            )}
                          >
                            {isPaymentRemarkEvent(event)
                              ? 'Payment Remark'
                              : event.status
                                .split("_")
                                .join(" ")
                                .toLocaleLowerCase()}
                          </span>
                          <span className="text-xs text-muted-foreground block">
                            {format(new Date(event.date), "PPpp")}
                          </span>

                          {isPaymentRemarkEvent(event) ? (
                            <>
                              <span className="text-xs text-muted-foreground block mt-0.5">
                                <span className="">Remark:</span>{" "}
                                <span className="italic font-medium">{event.remark}</span>
                              </span>
                              <div className="text-xs text-muted-foreground space-y-0.5">
                                <div>Payment Ref: {event.paymentReferenceNumber}</div>
                                <div>Payer: {event.payerName}</div>
                                <div>Amount: <span className="font-medium">₱{event.amount?.toLocaleString()}</span></div>
                              </div>
                              <div className="-mt-1 underline underline-offset-2">
                                <PaymentViewDialog
                                  externalUse
                                  _id={event.paymentId}
                                  title={`View Payment Details`}
                                  titleClassName="text-xs text-blue-600 hover:text-blue-800"
                                />
                              </div>
                            </>
                          ) : isStatusEvent(event) && event.reason && (
                            <span className="text-xs text-muted-foreground block my-0.5">
                              Note:{" "}
                              <span className="italic underline">
                                {event.reason}
                              </span>
                            </span>
                          )}

                          {event.by?.name && (
                            <span className="text-xs text-muted-foreground block mt-0.5">
                              By: <span className="underline underline-offset-2 ml-0.5"> {event.by.name} </span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No status history available.
                  </span>
                )}
              </div>
            </TabsContent>
            <TabsContent value="transactions">
              <div className="flex flex-col h-[50vh]">
                <div className="sticky top-0 z-10 bg-blue-50 border border-blue-200 rounded-md p-3 mb-3 shadow-sm">
                  <div className="flex items-start gap-2">
                    <CircleAlert className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <div className="flex flex-row gap-1">
                      <p className="text-sm font-medium text-blue-800">Total Entry Fee Required:</p>
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">
                          {(
                            ((entry?.isEarlyBird
                              ? entry?.event?.earlyBirdPricePerPlayer
                              : entry?.event?.pricePerPlayer) || 0) *
                            (entry?.event?.type === "DOUBLES" ? 2 : 1)
                          )?.toLocaleString("en-PH", {
                            style: "currency",
                            currency: entry?.event?.currency || "PHP",
                            minimumFractionDigits: 2,
                          })}
                        </span>
                        {entry?.event?.type === "DOUBLES" && (
                          <span className="text-blue-500 text-xs underline underline-offset-2">
                            {' '}(
                            {(entry?.isEarlyBird
                              ? entry?.event?.earlyBirdPricePerPlayer
                              : entry?.event?.pricePerPlayer
                            )?.toLocaleString("en-PH", {
                              style: "currency",
                              currency: entry?.event?.currency || "PHP",
                              minimumFractionDigits: 2,
                            })} per player)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                  {entryLoading ? (
                    <Skeleton className="w-full my-1 h-3" />
                  ) : entry?.transactions && entry?.transactions.length ? (
                    <div className="h-full">
                      {entry.transactions
                        .slice()
                        .reverse()
                        .map((transaction, index) => (
                          <div key={index} className="flex gap-2">
                            <div className="flex flex-col justify-start items-center">
                              {(() => {
                                switch (transaction.transactionType) {
                                  case "INITIAL_FEE":
                                    return (
                                      <CircleQuestionMark className="size-4 my-2 text-success" />
                                    )
                                  case "BALANCE_PAYMENT":
                                    return (
                                      <CheckCircle2 className="size-4 my-2 text-destructive" />
                                    )
                                  case "REVERT_TRANSACTION":
                                    return (
                                      <CircleAlert className="size-4 my-2 text-muted-foreground" />
                                    )
                                  case "REFUND_PAYMENT":
                                    return (
                                      <CircleAlert className="size-4 my-2 text-muted-foreground" />
                                    )
                                  default:
                                    return (
                                      <CircleQuestionMark className="size-4 my-2 text-muted-foreground" />
                                    )
                                }
                              })()}

                              {index < entry.transactions.length - 1 && (
                                <div className="min-h-11 w-px bg-gray-200"></div>
                              )}
                            </div>
                            <div className="mt-1">
                              <span
                                className={cn(
                                  "capitalize block -mb-0.5",
                                  index === 0
                                    ? "font-mono"
                                    : "text-muted-foreground"
                                )}
                              >
                                {transaction.transactionType
                                  .replaceAll("_", " ")
                                  .toLocaleLowerCase()}
                              </span>

                              <span
                                className={cn(
                                  "capitalize block text-xs underline underline-offset-2 mb-0.5",
                                  index === 0
                                    ? "font-mono"
                                    : "text-muted-foreground",
                                  transaction.pendingAmount == 0
                                    ? "text-destructive"
                                    : transaction.pendingAmount > 0
                                      ? "text-success"
                                      : "text-info"
                                )}
                              >
                                {(() => {
                                  const isCancelled = entry?.statuses?.some(s => s.status === "CANCELLED");
                                  const isRefundPayment = transaction.transactionType === "REFUND_PAYMENT";

                                  // mao ning naas view kay -635 ang gakakita
                                  // if (isCancelled && isRefundPayment) {
                                  //   const balancePayment = entry?.transactions?.find(
                                  //     t => t.transactionType === "BALANCE_PAYMENT" && t.amountChanged > 0
                                  //   );
                                  //   const totalPaid = balancePayment?.amountChanged || 0;

                                  //   const totalRefunded = entry?.transactions
                                  //     ?.filter(t => t.transactionType === "REFUND_PAYMENT")
                                  //     .reduce((sum, t) => sum + Math.abs(t.amountChanged), 0) || 0;

                                  //   const remainingPrincipal = totalPaid - totalRefunded;

                                  //   if (transaction.amountChanged < 0) {
                                  //     return `Remaining Balance: ₱${remainingPrincipal.toLocaleString()}`;
                                  //   }
                                  // }

                                  if (isCancelled && isRefundPayment) {
                                    const totalPaid = entry?.transactions
                                      ?.filter(t => t.transactionType === "BALANCE_PAYMENT" && t.amountChanged > 0)
                                      .reduce((sum, t) => sum + (t.amountChanged || 0), 0) || 0;

                                    const totalRefunded = entry?.transactions
                                      ?.filter(t => t.transactionType === "REFUND_PAYMENT")
                                      .reduce((sum, t) => sum + Math.abs(t.amountChanged), 0) || 0;

                                    const remainingPrincipal = totalPaid - totalRefunded;

                                    if (transaction.amountChanged < 0) {
                                      return `Remaining Balance: ₱${remainingPrincipal.toLocaleString()}`;
                                    }
                                  }

                                  if (isCancelled && transaction.transactionType === "BALANCE_PAYMENT") {
                                    return "Exceeded Paid";
                                  }

                                  return transaction.pendingAmount >= 0
                                    ? "Pending Amount"
                                    : "Excess Amount";
                                })()}

                                {!(
                                  entry?.statuses?.some(s => s.status === "CANCELLED") &&
                                  transaction.transactionType === "REFUND_PAYMENT"
                                ) && (
                                    <>:{" "}
                                      {Math.abs(transaction.pendingAmount).toLocaleString("en-PH", {
                                        style: "currency",
                                        currency: "PHP",
                                        minimumFractionDigits: 2,
                                      })}
                                    </>
                                  )}
                              </span>
                              {transaction.amountChanged !== null ? (
                                <span
                                  className={cn(
                                    "capitalize block text-xs",
                                    index === 0
                                      ? "font-muted-foreground"
                                      : "text-muted-foreground"
                                  )}
                                >
                                  Amount{" "}
                                  {transaction.transactionType ==
                                    "BALANCE_PAYMENT"
                                    ? "Paid"
                                    : "Refunded"}
                                  :{" "}
                                  {`${transaction.amountChanged > 0 ? "+" : "-"
                                    }${Math.abs(
                                      transaction.amountChanged
                                    ).toLocaleString("en-PH", {
                                      style: "currency",
                                      currency: "PHP",
                                      minimumFractionDigits: 2,
                                    })}`}
                                </span>
                              ) : null}
                              {transaction.transactionId && (
                                <>
                                  {transaction.transactionType === "BALANCE_PAYMENT" && (
                                    <PaymentViewDialog
                                      externalUse
                                      _id={transaction.transactionId}
                                      title="Click here for more details 🔍"
                                      titleClassName="block text-xs text-muted-foreground hover:text-foreground"
                                    />
                                  )}

                                  {transaction.transactionType === "REFUND_PAYMENT" && (
                                    <RefundViewDialog
                                      externalUse
                                      _id={transaction.transactionId}
                                      title="Click here to see Refund Details 🔍"
                                      titleClassName="block text-xs text-muted-foreground hover:text-foreground"
                                    />
                                  )}
                                </>
                              )}

                              <span className="text-xs text-muted-foreground block">
                                {format(transaction.transactionDate, "PPpp")}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No transaction history available.
                    </span>
                  )}
                </div>
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
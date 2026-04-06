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
  Eye,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  X,
  ZoomIn,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import PlayerViewDialog from "@/app/(auth)/players/dialogs/view"
import PaymentViewDialog from "@/app/(auth)/payments/dialogs/view"
import {
  Dialog as ImageDialog,
  DialogContent as ImageDialogContent,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

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
        validDocuments {
          documentURL
          documentType
          dateUploaded
        }
      }
      connectedPlayer1 {
        _id
        firstName
        middleName
        lastName
        suffix
        validDocuments {
          documentURL
          documentType
          dateUploaded
        }
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
        validDocuments {
          documentURL
          documentType
          dateUploaded
        }
      }
      connectedPlayer2 {
        _id
        firstName
        middleName
        lastName
        suffix
        validDocuments {
          documentURL
          documentType
          dateUploaded
        }
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
  title?: string | React.ReactNode 
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

// Image Gallery Component for immediate display
const ImageGallery = ({ images }: { images: any[] }) => {
  const [selectedImage, setSelectedImage] = useState<any>(null)
  const [isImageOpen, setIsImageOpen] = useState(false)

  if (!images || images.length === 0) return null

  return (
    <>
      <div className="grid grid-cols-3 gap-2 mt-2">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="relative aspect-square cursor-pointer group rounded-lg overflow-hidden border"
            onClick={() => {
              setSelectedImage(img)
              setIsImageOpen(true)
            }}
          >
            <img
              src={img.documentURL}
              alt={img.documentType || `Document ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Eye className="h-6 w-6 text-white" />
            </div>
          </div>
        ))}
      </div>

      <ImageDialog open={isImageOpen} onOpenChange={setIsImageOpen}>
        <ImageDialogContent className="max-w-4xl max-h-[90vh] p-0">
          <div className="relative h-full w-full">
            <button
              onClick={() => setIsImageOpen(false)}
              className="absolute top-2 right-2 z-10 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
            >
              <X className="h-4 w-4" />
            </button>
            {selectedImage && (
              <img
                src={selectedImage.documentURL}
                alt={selectedImage.documentType || "Document"}
                className="max-w-full max-h-[90vh] object-contain mx-auto"
              />
            )}
          </div>
        </ImageDialogContent>
      </ImageDialog>
    </>
  )
}

const DocumentViewer = ({ documents, title }: { documents: any[]; title: string }) => {
  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // Check if documents array is empty or undefined
  if (!documents || documents.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic">
        No documents uploaded
      </div>
    )
  }

  // Get the first image/document to display (similar to payment view)
  const mainDocument = documents[0]

  const getFileType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension || '')) {
      return 'image'
    }
    if (['pdf'].includes(extension || '')) {
      return 'pdf'
    }
    return 'other'
  }

  const isImage = getFileType(mainDocument.documentURL) === 'image'

  const handleViewDocument = () => {
    const fileType = getFileType(mainDocument.documentURL)
    if (fileType === 'image') {
      setSelectedDoc(mainDocument)
      setIsSheetOpen(true)
    } else {
      window.open(mainDocument.documentURL, '_blank')
    }
  }

  const hasMultipleDocuments = documents.length > 1

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="font-medium">{title}</Label>
        {hasMultipleDocuments && (
          <span className="text-xs text-muted-foreground">
            +{documents.length - 1} more document(s)
          </span>
        )}
      </div>

      <Sheet open={isSheetOpen && selectedDoc?.documentURL === mainDocument.documentURL} onOpenChange={(open) => {
        if (!open) setIsSheetOpen(false)
      }}>
        <SheetTrigger asChild>
          <div
            className="cursor-pointer w-full flex items-center justify-center relative group"
            onClick={handleViewDocument}
          >
            {isImage ? (
              <>
                <img
                  src={mainDocument.documentURL}
                  alt={mainDocument.documentType || "Document"}
                  className="object-contain bg-gray-50 max-h-[200px] w-full rounded-lg border group-hover:bg-gray-100 transition-all duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 shadow-md">
                    <ZoomIn className="w-4 h-4" />
                    <span className="text-sm font-medium">Click to Expand</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center w-full p-8 border rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-all duration-200">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">{mainDocument.documentType || 'Document'}</p>
                  <p className="text-xs text-muted-foreground mt-1">Click to view</p>
                </div>
              </div>
            )}
          </div>
        </SheetTrigger>
        <SheetContent className="h-screen p-[2%]" side="bottom">
          <SheetHeader hidden>
            <SheetTitle>Document Preview</SheetTitle>
            <SheetDescription>{mainDocument.documentType || 'Document'}</SheetDescription>
          </SheetHeader>
          <div className="relative h-full w-full">
            {isImage ? (
              <img
                src={mainDocument.documentURL}
                alt={mainDocument.documentType || "Document"}
                className="object-contain h-full w-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="w-24 h-24 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">{mainDocument.documentType || 'Document'}</p>
                  <Button
                    onClick={() => window.open(mainDocument.documentURL, '_blank')}
                    className="mt-4"
                  >
                    Open Document
                  </Button>
                </div>
              </div>
            )}
            {mainDocument.documentType && (
              <div className="absolute bottom-4 left-4 bg-black/60 text-white text-sm px-3 py-1.5 rounded-lg">
                {mainDocument.documentType}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* If there are multiple documents, show additional info */}
      {hasMultipleDocuments && (
        <div className="text-xs text-muted-foreground text-center mt-2">
          {documents.length} document(s) total. Click to view the first one.
        </div>
      )}
    </div>
  )
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

  const getPlayer1Documents = () => {
    const entryDocs = entry?.player1Entry?.validDocuments || []
    const connectedDocs = entry?.connectedPlayer1?.validDocuments || []
    return [...entryDocs, ...connectedDocs]
  }

  const getPlayer2Documents = () => {
    const entryDocs = entry?.player2Entry?.validDocuments || []
    const connectedDocs = entry?.connectedPlayer2?.validDocuments || []
    return [...entryDocs, ...connectedDocs]
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
          className="max-w-5xl"
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
            <TabsList className="flex flex-wrap w-full gap-1 -mt-2 mb-1">
              <TabsTrigger value="details" className="flex-1 min-w-[80px]">Details</TabsTrigger>
              <TabsTrigger value="players" className="flex-1 min-w-[80px]">Players</TabsTrigger>
              <TabsTrigger value="documents" className="flex-1 min-w-[80px]">Documents</TabsTrigger>
              <TabsTrigger value="status" className="flex-1 min-w-[80px]">Status</TabsTrigger>
              <TabsTrigger value="transactions" className="flex-1 min-w-[80px]">Trans.</TabsTrigger>
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
            <TabsContent value="documents">
              <div className="flex flex-col gap-4 h-[50vh] overflow-y-auto p-2">
                {entryLoading ? (
                  <Skeleton className="w-full h-20" />
                ) : (
                  <>
                    <div className="border rounded-lg p-3 bg-info/5">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-info" />
                        <Label className="font-semibold">Player 1 Documents</Label>
                      </div>
                      <DocumentViewer
                        documents={getPlayer1Documents()}
                        title="Document"
                      />
                    </div>

                    {entry?.event?.type === "DOUBLES" && (
                      <div className="border rounded-lg p-3 bg-destructive/5">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-destructive" />
                          <Label className="font-semibold">Player 2 Documents</Label>
                        </div>
                        <DocumentViewer
                          documents={getPlayer2Documents()}
                          title="Document"
                        />
                      </div>
                    )}

                    {/* Connected Player Documents Info */}
                    {/* {(entry?.connectedPlayer1?.validDocuments && entry.connectedPlayer1.validDocuments.length > 0) && (
                      <div className="border rounded-lg p-3 bg-muted/5">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <Label className="font-semibold">Connected Player Documents</Label>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          These documents are from the connected player profile and may apply to multiple entries.
                        </p>
                        <DocumentViewer
                          documents={entry?.connectedPlayer1?.validDocuments || []}
                          title="Connected Player 1 Documents"
                        />
                        {(entry?.connectedPlayer2?.validDocuments && entry.connectedPlayer2.validDocuments.length > 0) && (
                          <div className="mt-3">
                            <DocumentViewer
                              documents={entry?.connectedPlayer2?.validDocuments || []}
                              title="Connected Player 2 Documents"
                            />
                          </div>
                        )}
                      </div>
                    )} */}
                  </>
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
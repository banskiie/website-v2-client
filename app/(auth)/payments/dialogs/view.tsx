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
import { CheckCircle, CheckCircle2, CircleAlert, Paperclip, ZoomIn, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

const PAYMENT = gql`
  query Payment($_id: ID!) {
    payment(_id: $_id) {
      _id
      payerName
      referenceNumber
      amount
      method
      proofOfPaymentURL
      paymentDate
      statuses {
        status
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
      entryList {
        isFullyPaid
        entry {
          _id
          entryNumber
          entryKey
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
  const { data, loading, error }: any = useQuery(PAYMENT, {
    variables: { _id: props._id },
    skip: !isOpen || !Boolean(props._id),
  })

  if (error) console.error(error)

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
            <DialogTitle>View Payment</DialogTitle>
            <DialogDescription>
              View the details of this payment below.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="details" className="">
            <TabsList className="w-full grid grid-cols-3 -mt-2 mb-1">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="proof">Proof</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <div className="h-[60vh] overflow-y-auto">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="h-4 w-1 bg-green-600" />
                  <Label className="text-xs text-muted-foreground">
                    Payment Details
                  </Label>
                </div>

                <div className="border border-b-0 rounded-t-lg p-4 hover:bg-muted/80 transition-colors">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Reference No.</Label>
                    {loading ? (
                      <Skeleton className="w-full my-1 h-3" />
                    ) : (
                      <span className="block text-[13px] tracking-wide font-medium">
                        {data?.payment?.referenceNumber}
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
                        <span className="block text-[13px] font-[420] tracking-normal uppercase underline underline-offset-2">
                          {data?.payment?.payerName}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Amount</Label>
                      {loading ? (
                        <Skeleton className="w-full my-1 h-3" />
                      ) : (
                        <span className="block text-[13px] tracking-wide font-medium">
                          {loading
                            ? null
                            : new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "PHP",
                            }).format(data?.payment?.amount)}
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
                        <span className="block text-[13px] font-medium tracking-wide capitalize">
                          {data?.payment?.method.toLowerCase().replaceAll("_", " ")}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Payment Date</Label>
                      {loading ? (
                        <Skeleton className="my-1 w-20 h-4.25" />
                      ) : (
                        <span className="block text-[13px] tracking-wide font-medium capitalize">
                          {data?.payment?.paymentDate &&
                            format(new Date(data?.payment?.paymentDate), "PP")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-4 w-1 bg-green-600" />
                    <Label className="text-xs text-muted-foreground">
                      Entries Involved
                    </Label>
                  </div>

                  <div className="bg-white border rounded-lg p-3">
                    {loading ? (
                      <Skeleton className="my-1 w-20 h-4.25" />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {data?.payment?.entryList.map((s: any, index: number) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className={cn(
                              "h-7 px-2 text-xs cursor-default",
                              s.isFullyPaid
                                ? "text-green-600 bg-green-50 border-green-200"
                                : "text-blue-600"
                            )}
                          >
                            <span className="text-black">{s.entry.entryNumber}</span>
                            {s.isFullyPaid && <span className="-ml-1">(Fully Paid)</span>}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="proof">
              <div className="h-[60vh]">
                {!data?.payment?.proofOfPaymentURL && !loading ? (
                  <span className="text-sm italic text-muted-foreground">
                    No proof of payment uploaded.
                  </span>
                ) : (
                  <Sheet>
                    <SheetTrigger className="cursor-pointer w-full flex items-center justify-center relative group">
                      {data?.payment?.proofOfPaymentURL ? (
                        <>
                          <Image
                            width={500}
                            height={500}
                            src={data?.payment?.proofOfPaymentURL}
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
                        src={data?.payment?.proofOfPaymentURL}
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

            <TabsContent value="status">
              <div className="flex flex-col gap-2 h-[60vh] overflow-y-auto place-content-start">
                {loading ? (
                  <Skeleton className="w-full my-1 h-3" />
                ) : data?.payment?.statuses && data?.payment?.statuses.length ? (
                  <div className="h-full">
                    {data?.payment.statuses
                      .slice()
                      .reverse()
                      .map((status: any, index: number) => (
                        <div key={index} className="flex gap-2">
                          <div className="flex flex-col justify-start items-center">
                            {(() => {
                              if (index === 0) {
                                switch (status.status) {
                                  case "SENT":
                                    return (
                                      <CheckCircle2 className="size-4 my-2 text-success" />
                                    )
                                  case "DUPLICATE":
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

                            {index < data?.payment.statuses.length - 1 && (
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
                              {status.status
                                .split("_")
                                .join(" ")
                                .toLocaleLowerCase()}
                            </span>
                            <span className="text-xs text-muted-foreground block">
                              {format(status.date, "PPpp")}
                            </span>
                            {status.reason && (
                              <span className="text-xs text-muted-foreground block">
                                Note:{" "}
                                <span className="italic underline">
                                  {status?.reason}
                                </span>
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground block">
                              {status.by?.name}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Wallet className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No status history available.</p>
                    </div>
                  </div>
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
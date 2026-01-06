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
import { CheckCircle, CheckCircle2, CircleAlert, Paperclip } from "lucide-react"
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
  const { data, loading, error }: any = useQuery(REFUND, {
    variables: { _id: props._id },
    skip: !isOpen || !Boolean(props._id),
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
              <div className="grid grid-cols-2 gap-2 place-content-start h-[60vh] overflow-y-auto">
                <div className="col-span-2">
                  <Label>Reference No.</Label>
                  {loading ? (
                    <Skeleton className="w-full my-1 h-3" />
                  ) : (
                    <span className="block text-sm">
                      {data?.refund?.referenceNumber}
                    </span>
                  )}
                </div>
                <div>
                  <Label>Paid By</Label>
                  {loading ? (
                    <Skeleton className="w-full my-1 h-3" />
                  ) : (
                    <span className="block text-sm">
                      {data?.refund?.payerName}
                    </span>
                  )}
                </div>
                <div>
                  <Label>Amount</Label>
                  {loading ? (
                    <Skeleton className="w-full my-1 h-3" />
                  ) : (
                    <span className="block text-sm">
                      {loading
                        ? null
                        : new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "PHP",
                          }).format(data?.refund?.amount)}
                    </span>
                  )}
                </div>
                <div>
                  <Label>Payment Method</Label>
                  {loading ? (
                    <Skeleton className="w-full my-1 h-3" />
                  ) : (
                    <span className="block text-sm capitalize">
                      {data?.refund?.method.toLowerCase().replaceAll("_", " ")}
                    </span>
                  )}
                </div>
                <div>
                  <Label>Refund Date</Label>
                  {loading ? (
                    <Skeleton className="my-1 w-20 h-4.25" />
                  ) : (
                    <span className="block text-sm capitalize">
                      {data?.refund?.refundDate &&
                        format(new Date(data?.refund?.refundDate), "PP")}
                    </span>
                  )}
                </div>
                {data?.refund?.entryList && (
                  <div>
                    <Label>Entries Involved</Label>
                    {loading ? (
                      <Skeleton className="my-1 w-20 h-4.25" />
                    ) : (
                      <ol className="text-sm">
                        {data?.refund?.entryList.map(
                          (s: any, index: number) => (
                            <li key={index}>{s.entryNumber}</li>
                          )
                        )}
                      </ol>
                    )}
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
                    <SheetTrigger className="cursor-pointer w-full flex items-center justify-center">
                      {data?.refund?.proofOfRefundURL ? (
                        <Image
                          width={500}
                          height={500}
                          src={data?.refund?.proofOfRefundURL}
                          alt="Uploaded Image"
                          className="object-contain bg-gray max-h-[60vh] w-full"
                        />
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

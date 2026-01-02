"use client"

import { gql } from "@apollo/client"
import { useMutation, useQuery } from "@apollo/client/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ViewDialog from "./view"

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

const REJECT = gql`
  mutation RejectPayment($_id: ID!, $reason: String) {
    rejectPayment(_id: $_id, reason: $reason) {
      ok
      message
    }
  }
`

type Props = {
  _id?: string
  onClose?: () => void
}

const RejectDialog = (props: Props) => {
  const [open, setOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState<string>("")
  const [customReason, setCustomReason] = useState<string>("")
  const [rejectionType, setRejectionType] = useState<"REJECTED" | "DUPLICATE">("REJECTED")
  
  const {
    data,
    loading: paymentLoading,
    error,
  }: any = useQuery(PAYMENT, {
    variables: { _id: props._id },
    skip: !open || !Boolean(props._id),
    fetchPolicy: "network-only",
  })

  const [rejectPayment, { loading: rejectPaymentLoading }] = useMutation(REJECT)
  
  const loading = paymentLoading || rejectPaymentLoading

  const predefinedReasons = [
    "Incorrect payment amount",
    "Invalid reference number",
    "Payment date mismatch",
    "Missing proof of payment",
    "Blurred/unreadable proof",
    "Account name mismatch",
    "Partial payment not allowed",
    "Payment method not accepted",
  ]

  const handleReasonChange = (value: string) => {
    if (value === "custom") {
      setRejectionReason("")
    } else {
      setRejectionReason(value)
      setCustomReason("")
    }
  }

  const onSubmit = async () => {
    try {
      if (!rejectionReason && !customReason) {
        toast.error("Please provide a rejection reason")
        return
      }

      const reasonToSend = rejectionType === "DUPLICATE" 
        ? "DUPLICATE" 
        : customReason || rejectionReason

      const result: any = await rejectPayment({
        variables: { 
          _id: props._id,
          reason: reasonToSend
        }
      })
      
      if (result.data?.rejectPayment?.ok) {
        toast.success("Payment has been rejected")
        onClose()
      }
    } catch (error: any) {
      console.error("Error rejecting payment:", error)
      toast.error(error.message || "Failed to reject payment.")
    }
  }

  const onClose = () => {
    setOpen(false)
    setRejectionReason("")
    setCustomReason("")
    setRejectionType("REJECTED")
    props.onClose?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogTrigger asChild>
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          >
            Reject
          </DropdownMenuItem>
        </DialogTrigger>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>
              <span className="block text-foreground">
                Are you sure you want to reject this payment?
              </span>
            </DialogDescription>
          </DialogHeader>
          
          <ViewDialog
            externalUse
            _id={data?.payment?._id}
            title={`Click to view details: Ref. No. ${data?.payment?.referenceNumber}`}
            titleClassName="block text-sm font-medium"
          />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-type">Rejection Type</Label>
              <Select 
                value={rejectionType} 
                onValueChange={(value: "REJECTED" | "DUPLICATE") => setRejectionType(value)}
              >
                <SelectTrigger id="rejection-type">
                  <SelectValue placeholder="Select rejection type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REJECTED">Reject Payment</SelectItem>
                  <SelectItem value="DUPLICATE">Mark as Duplicate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {rejectionType === "REJECTED" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="rejection-reason">
                    Reason for Rejection <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={rejectionReason} 
                    onValueChange={handleReasonChange}
                  >
                    <SelectTrigger id="rejection-reason">
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedReasons.map((reason, index) => (
                        <SelectItem key={index} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom reason...</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(rejectionReason === "custom" || rejectionReason === "") && (
                  <div className="space-y-2">
                    <Label htmlFor="custom-reason">
                      Custom Reason <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="custom-reason"
                      placeholder="Please provide a detailed reason for rejection..."
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}
              </>
            )}

            {rejectionType === "DUPLICATE" && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm text-destructive font-medium">
                  This will mark the payment as "DUPLICATE" status.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  This action should only be used when this payment is a duplicate of another payment.
                </p>
              </div>
            )}

            <div className="space-y-1">
              <span className="block text-xs">
                <span className="font-bold text-red-500">* </span>This will send an
                email notification to the payer about the rejection.
              </span>
              <span className="block text-xs">
                <span className="font-bold text-red-500">* </span>Payment status will be updated to{" "}
                <span className="font-semibold">
                  {rejectionType === "DUPLICATE" ? "DUPLICATE" : "REJECTED"}
                </span>
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              loading={loading}
              variant="destructive"
              onClick={onSubmit}
              disabled={rejectionType === "REJECTED" && !rejectionReason && !customReason}
            >
              {rejectionType === "DUPLICATE" ? "Mark as Duplicate" : "Reject Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}

export default RejectDialog
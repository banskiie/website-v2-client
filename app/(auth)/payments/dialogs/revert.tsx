"use client"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2 } from "lucide-react"
import { gql } from "@apollo/client"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMutation } from "@apollo/client/react"

interface RevertPaymentResponse {
  revertPayment: {
    ok: boolean
    message: string
  }
}

interface RevertPaymentVariables {
  _id: string
}

const REVERT_PAYMENT = gql`
  mutation RevertPayment($_id: ID!) {
    revertPayment(_id: $_id) {
      ok
      message
    }
  }
`

interface RevertDialogProps {
  _id: string
  onClose?: () => void
  paymentData?: {
    payerName: string
    referenceNumber: string
    amount: number
    method: string
    paymentDate: string
    entries: string
    entryList?: Array<{
      isFullyPaid: boolean
      entry: {
        entryNumber: string
        currentStatus: string
      }
    }>
  }
}

const RevertDialog = ({ _id, onClose, paymentData }: RevertDialogProps) => {
  const [open, setOpen] = useState(true)
  const [revertPayment, { loading }] = useMutation<RevertPaymentResponse, RevertPaymentVariables>(REVERT_PAYMENT)

  useEffect(() => {
    setOpen(true)
  }, [_id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const handleRevert = async () => {
    try {
      const response = await revertPayment({
        variables: { _id },
      })

      if (response.data?.revertPayment?.ok) {
        toast.success(response.data.revertPayment.message)
        setOpen(false)
        onClose?.()
      } else {
        toast.error(response.data?.revertPayment?.message || "Failed to revert payment")
      }
    } catch (error: any) {
      console.error("Error reverting payment:", error)
      toast.error(error.message || "An error occurred while reverting the payment")
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setOpen(false)
      onClose?.()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-md!"
        onPointerDownOutside={(e) => {
          e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Revert Payment
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to revert this payment?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {paymentData && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-red-800">Payment Details:</h4>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payer:</span>
                  <span className="text-sm font-medium">{paymentData.payerName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Reference:</span>
                  <span className="text-sm font-medium">{paymentData.referenceNumber}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="text-sm font-bold text-red-600">
                    ₱{formatAmount(paymentData.amount)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Method:</span>
                  <Badge variant="outline" className="capitalize">
                    {paymentData.method?.replace("_", " ")}
                  </Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Date:</span>
                  <span className="text-sm">{formatDate(paymentData.paymentDate)}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Affected Entries:</Label>
                <ScrollArea className="max-h-32">
                  <div className="space-y-2 pr-2">
                    {paymentData.entryList && paymentData.entryList.length > 0 ? (
                      paymentData.entryList.map((item, index) => (
                        <div key={index} className="p-2 bg-white rounded border text-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{item.entry.entryNumber}</span>
                            <Badge
                              variant="outline"
                              className={item.isFullyPaid
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                              }
                            >
                              {item.isFullyPaid ? "Fully Paid" : "Partial"}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Status: {item.entry.currentStatus?.replace("_", " ")}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">
                        {paymentData.entries?.split(",").map((entry, i) => (
                          <div key={i} className="p-1">{entry.trim()}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={loading} className="cursor-pointer">
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleRevert}
            disabled={loading}
            className="gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Reverting...
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4" />
                Revert Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RevertDialog
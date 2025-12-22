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

const VERIFY = gql`
  mutation VerifyPayment($_id: ID!) {
    verifyPayment(_id: $_id) {
      ok
      message
    }
  }
`

type Props = {
  _id?: string
  onClose?: () => void
}

const VerifyDialog = (props: Props) => {
  // Dialog open state
  const [open, setOpen] = useState(false)
  // Fetch existing date if updating
  const {
    data,
    loading: paymentLoading,
    error,
  }: any = useQuery(PAYMENT, {
    variables: { _id: props._id },
    skip: !open || !Boolean(props._id),
    fetchPolicy: "network-only",
  })
  console.log(data, error)

  // Mutation for changing status
  const [verifyPayment, { loading: changeStatusLoading }] = useMutation(
    VERIFY,
    {
      variables: { _id: props._id },
    }
  )
  // Loading State
  const loading = paymentLoading || changeStatusLoading

  const onSubmit = async () => {
    try {
      const result: any = await verifyPayment()
      if (result) onClose()
    } catch (error: any) {
      console.error("Error changing player status:", error)
      toast.error(error.message || "Failed to change player status.")
    }
  }

  const onClose = () => {
    setOpen(false)
    props.onClose?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogTrigger asChild>
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            className="text-success focus:bg-success/10 focus:text-success"
          >
            Verify
          </DropdownMenuItem>
        </DialogTrigger>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Verify Payment</DialogTitle>
            <DialogDescription>
              <span className="block text-foreground">
                Are you sure you want to verify this payment?
              </span>
            </DialogDescription>
          </DialogHeader>
          <ViewDialog
            externalUse
            _id={data?.payment?._id}
            title={`Click to view details: Ref. No. #${data?.payment?.referenceNumber} 🔍`}
            titleClassName="block text-sm font-medium"
          />
          <div>
            <span className="block text-xs">
              <span className="font-bold text-info">*</span>This will send an
              email notification to the players.
            </span>
            <span className="block text-xs">
              <span className="font-bold text-info">*</span>This will also
              verify the player entries involved that are fully paid by this
              payment.
            </span>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={loading}
              variant="success"
              onClick={onSubmit}
              className="w-22.5"
            >
              Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}

export default VerifyDialog

"use client"

import { gql } from "@apollo/client"
import { useMutation, useQuery } from "@apollo/client/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
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

const PLAYER = gql`
  query Entry($_id: ID!) {
    entry(_id: $_id) {
      _id
      entryNumber
    }
  }
`

const APPROVE = gql`
  mutation ApproveEntry($_id: ID!) {
    approveEntry(_id: $_id) {
      ok
      message
    }
  }
`

type Props = {
  _id?: string
  onClose?: () => void
  triggerClassName?: string
  variant?: "dropdown" | "button"
}

const ApproveDialog = (props: Props) => {
  // Dialog open state
  const [open, setOpen] = useState(false)
  // Fetch existing date if updating
  const { data, loading: playerLoading }: any = useQuery(PLAYER, {
    variables: { _id: props._id },
    skip: !open || !Boolean(props._id),
    fetchPolicy: "network-only",
  })
  // Mutation for changing status
  const [approveEntry, { loading: changeStatusLoading }] = useMutation(
    APPROVE,
    {
      variables: { _id: props._id },
    }
  )
  // Loading State
  const loading = playerLoading || changeStatusLoading

  const onSubmit = async () => {
    try {
      const result: any = await approveEntry()
      if (result) {
        setOpen(false)
        props.onClose?.()
      }
    } catch (error: any) {
      console.error("Error changing player status:", error)
      toast.error(error.message || "Failed to change player status.")
    }
  }

  const onClose = () => {
    setOpen(false)
    props.onClose?.()
  }

  const isDropdown = props.variant === "dropdown"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isDropdown ? (
          <div
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-success/10 hover:text-success focus:bg-success/10 focus:text-success text-success"
            onSelect={(e) => e.preventDefault()}
          >
            Approve
          </div>
        ) : (
          <Button variant="success" className="w-full sm:w-auto">
            Approve
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[95vw] max-w-lg mx-auto p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="text-base sm:text-lg">
            Approve Entry: {data?.entry?.entryNumber}
          </DialogTitle>
          <DialogDescription>
            <span className="block text-foreground text-sm sm:text-base">
              Are you sure you want to approve this entry?
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="my-3 sm:my-4">
          <ViewDialog
            externalUse
            _id={data?.entry?._id}
            title={`Click to view details: ${data?.entry?.entryNumber} 🔍`}
            titleClassName="block text-sm font-medium text-blue-600 hover:text-blue-800 break-words"
          />
        </div>

        <div className="space-y-1.5 sm:space-y-2 my-3 sm:my-4">
          <span className="text-destructive block text-xs sm:text-sm">
            <span className="font-bold">*</span>
            <span className="underline">This action cannot be reversed.</span>
          </span>
          <span className="block text-xs sm:text-sm text-muted-foreground">
            <span className="font-bold text-info">*</span>This will send an
            email notification to the players.
          </span>
          <span className="block text-xs sm:text-sm text-muted-foreground">
            <span className="font-bold text-info">*</span>This will allow the
            players to pay for their entry.
          </span>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            loading={loading}
            variant="success"
            onClick={onSubmit}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ApproveDialog
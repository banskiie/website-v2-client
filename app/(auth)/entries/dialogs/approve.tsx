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
            Approve
          </DropdownMenuItem>
        </DialogTrigger>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Approve Entry: {data?.entry?.entryNumber}</DialogTitle>
            <DialogDescription>
              <span className="block text-foreground">
                Are you sure you want to approve this entry?
              </span>
            </DialogDescription>
          </DialogHeader>
          <ViewDialog
            externalUse
            _id={data?.entry?._id}
            title={`Click to view details: ${data?.entry?.entryNumber} 🔍`}
            titleClassName="block text-sm font-medium"
          />
          <div>
            <span className="text-destructive block text-xs">
              <span className="font-bold">*</span>
              <span className="underline">This action cannot be reversed.</span>
            </span>
            <span className="block text-xs">
              <span className="font-bold text-info">*</span>This will send an
              email notification to the players.
            </span>
            <span className="block text-xs">
              <span className="font-bold text-info">*</span>This will allow the
              players to pay for their entry.
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
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}

export default ApproveDialog

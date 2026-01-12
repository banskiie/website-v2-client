"use client"

import { gql } from "@apollo/client"
import { useMutation, useQuery } from "@apollo/client/react"
import { use, useEffect, useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const PLAYER = gql`
  query Entry($_id: ID!) {
    entry(_id: $_id) {
      entryNumber
    }
  }
`

const REJECT = gql`
  mutation RejectEntry($input: CancelEntryInput!) {
    rejectEntry(input: $input) {
      ok
      message
    }
  }
`

const REASON_OPTIONS = [
  {
    label: "Move to higher level event",
    value: "MOVE_TO_HIGHER_LEVEL",
  },
  {
    label: "Invalid documents submitted",
    value: "INVALID_DOCUMENTS",
  },
  {
    label: "Wrong information provided",
    value: "WRONG_INFORMATION",
  },
  {
    label: "Other",
    value: "OTHER",
  },
]

type Props = {
  _id?: string
  onClose?: () => void
}

const RejectDialog = (props: Props) => {
  // Dialog open state
  const [open, setOpen] = useState(false)
  // Fetch existing date if updating
  const { data, loading: playerLoading }: any = useQuery(PLAYER, {
    variables: { _id: props._id },
    skip: !open || !Boolean(props._id),
    fetchPolicy: "network-only",
  })
  // Reason handling
  const [selectedReason, setSelectReason] = useState<string>(
    "MOVE_TO_HIGHER_LEVEL"
  )
  const [rejectDescription, setRejectDescription] = useState<string>("")

  // Mutation for changing status
  const [rejectEntry, { loading: changeStatusLoading }] = useMutation(REJECT)
  // Loading State
  const loading = playerLoading || changeStatusLoading

  const [reasonError, setReasonError] = useState<string>("")

  useEffect(() => {
    setReasonError("")
  }, [selectedReason])

  const onSubmit = async () => {
    try {
      if (selectedReason === "OTHER" && rejectDescription.trim() === "") {
        setReasonError(
          "Please enter a reason for rejection when selecting 'Other'."
        )
        return
      }
      const result: any = await rejectEntry({
        variables: {
          input: {
            _id: props._id,
            reason: `${REASON_OPTIONS.find((option) => option.value === selectedReason)
              ?.label
              }${rejectDescription ? `: ${rejectDescription}` : ""}`,
          },
        },
      })
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
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          >
            Reject
          </DropdownMenuItem>
        </DialogTrigger>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Reject Entry: {data?.entry?.entryNumber}</DialogTitle>
            <DialogDescription>
              <span className="block text-foreground">
                Are you sure you want to reject this entry?
              </span>
            </DialogDescription>
            <Select value={selectedReason} onValueChange={setSelectReason}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Reasons</SelectLabel>
                  {REASON_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => setSelectReason(option.value)}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <div>
              <Textarea
                placeholder="Additional details (optional)"
                value={rejectDescription}
                onChange={(e) => setRejectDescription(e.target.value)}
                className="resize-none"
                rows={4}
                aria-invalid={reasonError ? "true" : "false"}
                aria-errormessage={reasonError ? "reason-error" : undefined}
              />
              {reasonError && (
                <p className="text-destructive text-sm mt-1" id="reason-error">
                  {reasonError}
                </p>
              )}
            </div>
            <div>
              <span className="text-destructive block text-xs">
                <span className="font-bold">*</span>
                <span className="underline">
                  This action cannot be reversed.
                </span>
              </span>
              <span className="block text-xs">
                <span className="font-bold text-info">*</span>This will send an
                email notification to the players.
              </span>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={loading}
              variant="destructive"
              onClick={onSubmit}
              className="w-20"
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}

export default RejectDialog

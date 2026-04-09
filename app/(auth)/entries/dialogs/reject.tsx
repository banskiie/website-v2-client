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
  triggerClassName?: string
  variant?: "dropdown" | "button"
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
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive text-destructive"
            onSelect={(e) => e.preventDefault()}
          >
            Reject
          </div>
        ) : (
          <Button variant="destructive" className="w-full sm:w-auto">
            Reject
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[95vw] max-w-lg mx-auto p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="text-base sm:text-lg">
            Reject Entry: {data?.entry?.entryNumber}
          </DialogTitle>
          <DialogDescription>
            <span className="block text-foreground text-sm sm:text-base">
              Are you sure you want to reject this entry?
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 my-3 sm:my-4">
          <Select value={selectedReason} onValueChange={setSelectReason}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Reasons</SelectLabel>
                {REASON_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
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
              className="resize-none min-h-[80px] sm:min-h-[100px]"
              rows={4}
              aria-invalid={reasonError ? "true" : "false"}
              aria-errormessage={reasonError ? "reason-error" : undefined}
            />
            {reasonError && (
              <p className="text-destructive text-xs sm:text-sm mt-1" id="reason-error">
                {reasonError}
              </p>
            )}
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <span className="text-destructive block text-xs sm:text-sm">
              <span className="font-bold">*</span>
              <span className="underline">This action cannot be reversed.</span>
            </span>
            <span className="block text-xs sm:text-sm text-muted-foreground">
              <span className="font-bold text-info">*</span>This will send an
              email notification to the players.
            </span>
          </div>
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
            variant="destructive"
            onClick={onSubmit}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RejectDialog
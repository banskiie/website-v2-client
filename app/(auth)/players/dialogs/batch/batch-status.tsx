"use client"

import { gql } from "@apollo/client"
import { useMutation } from "@apollo/client/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  Select,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const BATCH_CHANGE_EVENT_DISSOLVE_STATUS = gql`
  mutation BatchChangeEventDissolveStatus(
    $input: BatchChangeEventDissolveStatusInput!
  ) {
    batchChangeEventDissolveStatus(input: $input) {
      ok
      message
    }
  }
`

type Props = {
  _ids?: string[]
  onClose?: () => void
  clearSelected?: () => void
}

const BatchStatusDialog = (props: Props) => {
  // Dialog open state
  const [open, setOpen] = useState(false)
  const [isDissolved, setIsDissolved] = useState(true)

  // Mutation for changing status
  const [changeStatus, { loading: changeStatusLoading }] = useMutation(
    BATCH_CHANGE_EVENT_DISSOLVE_STATUS,
    {
      variables: { input: { _ids: props._ids, isDissolved } },
    }
  )
  // Loading State
  const loading = changeStatusLoading

  const onSubmit = async () => {
    try {
      const result: any = await changeStatus()
      if (result) {
        onClose()
        props.clearSelected?.()
      }
    } catch (error: any) {
      console.error("Error changing event dissolve status:", error)
      toast.error(error.message || "Failed to change event dissolve status.")
    }
  }

  const onClose = () => {
    setOpen(false)
    props.onClose?.()
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <form>
        <AlertDialogTrigger asChild>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            Change Dissolve Status
          </DropdownMenuItem>
        </AlertDialogTrigger>
        <AlertDialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Batch Change Event Dissolve Status
            </AlertDialogTitle>
            <AlertDialogDescription>
              <span className="block text-foreground">
                Are you sure you want to change the status of the selected event
                dissolve?
              </span>
              <Select
                onValueChange={(value) => setIsDissolved(value === "true")}
                value={isDissolved.toString()}
              >
                <SelectTrigger className="w-full mt-2 mb-3 text-black">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="true">Dissolve</SelectItem>
                    <SelectItem value="false">Reactivate</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={isDissolved ? "destructive" : "success"}
              className={cn(isDissolved ? "w-22" : "w-26")}
              loading={loading}
              onClick={onSubmit}
            >
              {isDissolved ? "Dissolve" : "Reactivate"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </form>
    </AlertDialog>
  )
}

export default BatchStatusDialog

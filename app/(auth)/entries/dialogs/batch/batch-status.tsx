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

const BATCH_CHANGE_PLAYER_STATUS = gql`
  mutation BatchChangePlayerStatus($input: BatchChangePlayerStatusInput!) {
    batchChangePlayerStatus(input: $input) {
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
  const [isActive, setIsActive] = useState(true)

  // Mutation for changing status
  const [changeStatus, { loading: changeStatusLoading }] = useMutation(
    BATCH_CHANGE_PLAYER_STATUS,
    {
      variables: { input: { _ids: props._ids, isActive } },
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
      console.error("Error changing player status:", error)
      toast.error(error.message || "Failed to change player status.")
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
            Change Status
          </DropdownMenuItem>
        </AlertDialogTrigger>
        <AlertDialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Batch Change Player Status</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="block text-foreground">
                Are you sure you want to change the status of the selected
                players?
              </span>
              <Select
                onValueChange={(value) => setIsActive(value === "true")}
                value={isActive.toString()}
              >
                <SelectTrigger className="w-full mt-2 mb-3 text-black">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <span className="block text-xs">
                <span className="text-destructive">*</span> Note: This will
                affect their access to the system
              </span>
              <span className="block text-xs">
                <span className="text-info">**</span> Additional Note: You
                cannot change the status of your own player account.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={isActive ? "success" : "destructive"}
              className={cn(isActive ? "w-22" : "w-26")}
              loading={loading}
              onClick={onSubmit}
            >
              {isActive ? "Activate" : "Deactivate"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </form>
    </AlertDialog>
  )
}

export default BatchStatusDialog

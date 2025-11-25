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

const BATCH_CHANGE_PLAYER_ARCHIVE_STATUS = gql`
  mutation batchChangePlayerArchiveStatus(
    $input: batchChangePlayerArchiveStatusInput!
  ) {
    batchChangePlayerArchiveStatus(input: $input) {
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
  const [isArchived, setisArchived] = useState(true)

  // Mutation for changing status
  const [changeStatus, { loading: changeStatusLoading }] = useMutation(
    BATCH_CHANGE_PLAYER_ARCHIVE_STATUS,
    {
      variables: { input: { _ids: props._ids, isArchived } },
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
            Change Archive Status
          </DropdownMenuItem>
        </AlertDialogTrigger>
        <AlertDialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Batch Change Player Archive Status
            </AlertDialogTitle>
            <AlertDialogDescription>
              <span className="block text-xs text-red-600">
                {!isArchived
                  ? "Are you sure you want to reactivate this archived players info? Please confirm the one who archived it before proceeding."
                  : "Archiving this players will permanently delete duplicate players information after the tournament. Please carefully review the players to ensure they are a duplicate before proceeding."}
              </span>
              <Select
                onValueChange={(value) => setisArchived(value === "true")}
                value={isArchived.toString()}
              >
                <SelectTrigger className="w-full mt-2 mb-3 text-black">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="true">Archive</SelectItem>
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
              variant={isArchived ? "destructive" : "success"}
              className={cn(isArchived ? "w-22" : "w-26")}
              loading={loading}
              onClick={onSubmit}
            >
              {isArchived ? "Archive" : "Reactivate"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </form>
    </AlertDialog>
  )
}

export default BatchStatusDialog

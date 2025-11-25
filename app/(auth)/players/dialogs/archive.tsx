"use client"
import { gql } from "@apollo/client"
import { useMutation, useQuery } from "@apollo/client/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
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

const PLAYER = gql`
  query Player($_id: ID!) {
    player(_id: $_id) {
      firstName
      middleName
      lastName
      suffix
    }
  }
`

const CHANGE_ARCHIVE_STATUS = gql`
  mutation changePlayerArchiveStatus($_id: ID!) {
    changePlayerArchiveStatus(_id: $_id) {
      ok
      message
    }
  }
`

type Props = {
  _id?: string
  onClose?: () => void
  isArchived?: boolean
}

const ArchiveDialog = (props: Props) => {
  // Dialog open state
  const [open, setOpen] = useState(false)
  // Fetch existing date if updating
  const { data, loading: eventLoading }: any = useQuery(PLAYER, {
    variables: { _id: props._id },
    skip: !open || !Boolean(props._id),
    fetchPolicy: "network-only",
  })
  // Mutation for changing status
  const [changeStatus, { loading: changeStatusLoading }] = useMutation(
    CHANGE_ARCHIVE_STATUS,
    {
      variables: { _id: props._id },
    }
  )
  // Loading State
  const loading = eventLoading || changeStatusLoading

  const onSubmit = async () => {
    try {
      const result: any = await changeStatus()
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
    <AlertDialog open={open} onOpenChange={setOpen}>
      <form>
        <AlertDialogTrigger asChild>
          <DropdownMenuItem
            className={cn(
              props?.isArchived ? "text-success" : "text-destructive "
            )}
            onSelect={(e) => e.preventDefault()}
          >
            {props?.isArchived ? "Reactivate" : "Archive"}
          </DropdownMenuItem>
        </AlertDialogTrigger>
        <AlertDialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {props?.isArchived ? "Reactivate" : "Archive"} Player:{" "}
              {[
                data?.player?.firstName,
                data?.player?.middleName,
                data?.player?.lastName,
                data?.player?.suffix,
              ]
                .filter(Boolean)
                .join(" ")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              <span className="block text-foreground">
                Are you sure you want to{" "}
                <span
                  className={cn(
                    props?.isArchived ? "text-success" : "text-destructive",
                    "font-semibold underline"
                  )}
                >
                  {props?.isArchived ? "reactivate" : "archive"}
                </span>{" "}
                this player?
              </span>
              <span className="block text-xs text-red-600">
                {props?.isArchived
                  ? "Are you sure you want to reactivate this archived player info? Please confirm the one who archived it before proceeding."
                  : "Archiving this player will permanently delete duplicate player information after the tournament. Please carefully review the player to ensure they are a duplicate before proceeding."}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={loading}
              onClick={onSubmit}
              variant={props?.isArchived ? "success" : "destructive"}
              className={cn(props?.isArchived ? "w-26" : "w-22")}
            >
              {props?.isArchived ? "Reactivate" : "Archive"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </form>
    </AlertDialog>
  )
}

export default ArchiveDialog

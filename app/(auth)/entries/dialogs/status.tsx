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
      lastName
      isActive
    }
  }
`

const CHANGE_STATUS = gql`
  mutation ChangePlayerStatus($_id: ID!) {
    changePlayerStatus(_id: $_id) {
      ok
      message
    }
  }
`

type Props = {
  _id?: string
  onClose?: () => void
  isActive?: boolean
}

const StatusDialog = (props: Props) => {
  // Dialog open state
  const [open, setOpen] = useState(false)
  // Fetch existing date if updating
  const { data, loading: playerLoading }: any = useQuery(PLAYER, {
    variables: { _id: props._id },
    skip: !open || !Boolean(props._id),
    fetchPolicy: "network-only",
  })
  // Mutation for changing status
  const [changeStatus, { loading: changeStatusLoading }] = useMutation(
    CHANGE_STATUS,
    {
      variables: { _id: props._id },
    }
  )
  // Loading State
  const loading = playerLoading || changeStatusLoading

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
              props?.isActive ? "text-destructive" : "text-success"
            )}
            onSelect={(e) => e.preventDefault()}
          >
            {props?.isActive ? "Deactivate" : "Activate"}
          </DropdownMenuItem>
        </AlertDialogTrigger>
        <AlertDialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {props?.isActive ? "Deactivate" : "Activate"} Player:{" "}
              {data?.player?.firstName} {data?.player?.lastName}
            </AlertDialogTitle>
            <AlertDialogDescription>
              <span className="block text-foreground">
                Are you sure you want to{" "}
                <span
                  className={cn(
                    props?.isActive ? "text-destructive" : "text-success",
                    "font-semibold underline"
                  )}
                >
                  {props?.isActive ? "deactivate" : "activate"}
                </span>{" "}
                this player?
              </span>
              <span className="block text-xs">
                (This may have unintended consequences on their access to the
                system.)
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={loading}
              variant={props?.isActive ? "destructive" : "success"}
              onClick={onSubmit}
              className={cn(
                props?.isActive ? "bg-destructive w-26" : "bg-success w-22"
              )}
            >
              {props?.isActive ? "Deactivate" : "Activate"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </form>
    </AlertDialog>
  )
}

export default StatusDialog

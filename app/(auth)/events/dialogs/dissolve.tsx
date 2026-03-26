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

const EVENT = gql`
  query Event($_id: ID!) {
    event(_id: $_id) {
      name
    }
  }
`

const CHANGE_DISSOLVE_STATUS = gql`
  mutation ChangeEventDissolveStatus($_id: ID!) {
    changeEventDissolveStatus(_id: $_id) {
      ok
      message
    }
  }
`

type Props = {
  _id?: string
  onClose?: () => void
  isClosed?: boolean
}

const DissolveDialog = (props: Props) => {
  // Dialog open state
  const [open, setOpen] = useState(false)
  // Fetch existing date if updating
  const { data, loading: eventLoading }: any = useQuery(EVENT, {
    variables: { _id: props._id },
    skip: !open || !Boolean(props._id),
    fetchPolicy: "network-only",
  })
  // Mutation for changing status
  const [changeStatus, { loading: changeStatusLoading }] = useMutation(
    CHANGE_DISSOLVE_STATUS,
    {
      variables: { _id: props._id },
    },
  )
  // Loading State
  const loading = eventLoading || changeStatusLoading

  const onSubmit = async () => {
    try {
      const result: any = await changeStatus()
      if (result) onClose()
    } catch (error: any) {
      console.error("Error changing event status:", error)
      toast.error(error.message || "Failed to change event status.")
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
              props?.isClosed ? "text-success" : "text-destructive ",
            )}
            onSelect={(e) => e.preventDefault()}
          >
            {props?.isClosed ? "Reactivate" : "Dissolve"}
          </DropdownMenuItem>
        </AlertDialogTrigger>
        <AlertDialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {props?.isClosed ? "Reactivate" : "Dissolve"} Event:{" "}
              {data?.event?.name}
            </AlertDialogTitle>
            <AlertDialogDescription>
              <span className="block text-foreground">
                Are you sure you want to{" "}
                <span
                  className={cn(
                    props?.isClosed ? "text-success" : "text-destructive",
                    "font-semibold underline",
                  )}
                >
                  {props?.isClosed ? "reactivate" : "dissolve"}
                </span>{" "}
                this event?
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
              onClick={onSubmit}
              variant={props?.isClosed ? "success" : "destructive"}
              className={cn(props?.isClosed ? "w-26" : "w-22")}
            >
              {props?.isClosed ? "Reactivate" : "Dissolve"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </form>
    </AlertDialog>
  )
}

export default DissolveDialog

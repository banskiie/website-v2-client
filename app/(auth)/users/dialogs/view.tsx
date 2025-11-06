"use client"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { gql } from "@apollo/client"
import { useQuery } from "@apollo/client/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import RoleBadge from "@/components/badges/role-badge"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

const USER = gql`
  query User($_id: ID!) {
    user(_id: $_id) {
      name
      email
      contactNumber
      username
      role
    }
  }
`

type Props = {
  _id?: string
  row?: boolean
  openFromParent?: boolean
  setOpenFromParent?: (open: boolean) => void
  rowSettings?: {
    clearId: () => void
    open: boolean
    onOpenChange: (open: boolean) => void
  }
}

const ViewDialog = (props: Props) => {
  // Dialog open state
  const [open, setOpen] = useState(false)
  // Determine open state based on whether it's row view or not
  const isOpen = props.row ? props.rowSettings?.open || false : open
  const setIsOpen = (value: boolean) => {
    if (props.row) {
      props.rowSettings?.onOpenChange(value)
    } else {
      setOpen(value)
    }
  }
  const { data, loading }: any = useQuery(USER, {
    variables: { _id: props._id },
    skip: !isOpen || !Boolean(props._id),
  })

  const onClose = () => {
    if (props.row) {
      props.rowSettings?.clearId()
      props.rowSettings?.onOpenChange(false)
    } else {
      setOpen(false)
    }
  }

  return (
    <Dialog modal open={isOpen} onOpenChange={setIsOpen}>
      <form>
        <DialogTrigger asChild>
          {props.row ? null : (
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              View
            </DropdownMenuItem>
          )}
        </DialogTrigger>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle>View User</DialogTitle>
            <DialogDescription>
              View the details of this user below.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 -mt-2 max-h-[36vh] overflow-y-auto">
            <div>
              <Label>Name</Label>
              {loading ? (
                <Skeleton className="w-full my-1 h-3" />
              ) : (
                <span className="block text-sm">{data?.user?.name}</span>
              )}
            </div>
            <div>
              <Label>Email</Label>
              {loading ? (
                <Skeleton className="w-full my-1 h-3" />
              ) : (
                <span className="block text-sm">{data?.user?.email}</span>
              )}
            </div>
            <div>
              <Label>Contact Number</Label>
              {loading ? (
                <Skeleton className="w-full my-1 h-3" />
              ) : (
                <span className="block text-sm">
                  {data?.user?.contactNumber}
                </span>
              )}
            </div>
            <div>
              <Label>Username</Label>
              {loading ? (
                <Skeleton className="w-full my-1 h-3" />
              ) : (
                <span className="block text-sm">{data?.user?.username}</span>
              )}
            </div>
            <div>
              <Label>Role</Label>
              {loading ? (
                <Skeleton className="my-1 w-20 h-4.25" />
              ) : (
                <RoleBadge role={data?.user?.role} />
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button className="w-20" onClick={onClose} variant="outline">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}

export default ViewDialog

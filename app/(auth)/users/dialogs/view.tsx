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
import { Role } from "@/types/user.interface"
import { UserSchema } from "@/validators/user.validator"
import { gql } from "@apollo/client"
import { useMutation, useQuery } from "@apollo/client/react"
import { useForm } from "@tanstack/react-form"
import React, { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { CheckIcon, ChevronsUpDownIcon, CirclePlus, Eraser } from "lucide-react"
import { Field, FieldLabel, FieldError, FieldSet } from "@/components/ui/field"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import RoleBadge from "@/components/badges/role-badge"

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
  // Fetch existing date if updating
  const { data }: any = useQuery(USER, {
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
            <DialogTitle>View User: {data?.user?.name}</DialogTitle>
            <DialogDescription>
              View the details of this user below.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 -mt-2">
            <div>
              <span className="block text-sm text-muted-foreground">Name</span>
              <span className="block text-sm">{data?.user?.name}</span>
            </div>
            <div>
              <span className="block text-sm text-muted-foreground">Email</span>
              <span className="block text-sm">{data?.user?.email}</span>
            </div>
            <div>
              <span className="block text-sm text-muted-foreground">
                Contact Number
              </span>
              <span className="block text-sm">{data?.user?.contactNumber}</span>
            </div>
            <div>
              <span className="block text-sm text-muted-foreground">
                Username
              </span>
              <span className="block text-sm">{data?.user?.username}</span>
            </div>
            <div>
              <span className="block text-sm text-muted-foreground">Role</span>
              <RoleBadge role={data?.user?.role} />
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

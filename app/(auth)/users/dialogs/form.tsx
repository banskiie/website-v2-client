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
import { IUser, Role } from "@/types/user.interface"
import { UserSchema } from "@/validators/user.validator"
import { gql } from "@apollo/client"
import { useMutation, useQuery } from "@apollo/client/react"
import { useForm } from "@tanstack/react-form"
import React, { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
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

const CREATE = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      ok
      message
    }
  }
`

const UPDATE = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      ok
      message
    }
  }
`

type Props = {
  _id?: string
  onClose?: () => void
}

const FormDialog = (props: Props) => {
  const [open, setOpen] = useState(false)
  const isUpdate = Boolean(props._id)
  const [isPending, startTransition] = useTransition()
  const { data, loading: fetchLoading }: any = useQuery(USER, {
    variables: { _id: props._id },
    skip: !open || !isUpdate,
    fetchPolicy: "no-cache",
  })
  const user = data?.user as IUser
  // Mutation hook
  const [submitForm] = useMutation(isUpdate ? UPDATE : CREATE)
  const isLoading = isUpdate ? isPending || fetchLoading : false
  const [openRoles, setOpenRoles] = useState(false)
  const Roles = Object.values(Role).map((role) => ({
    label: role.toLocaleLowerCase().replaceAll("_", " "),
    value: role,
  }))
  const loading = isPending || fetchLoading

  const form = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      contactNumber: user?.contactNumber || "",
      username: user?.username || "",
      role: user?.role || Role.SUPPORT,
    },
    validators: {
      onSubmit: ({ formApi, value }) => {
        try {
          UserSchema.parse(value)
        } catch (error: any) {
          const formErrors = JSON.parse(error)
          formErrors.map(
            ({ path, message }: { path: string; message: string }) =>
              formApi.fieldInfo[
                path as keyof typeof formApi.fieldInfo
              ].instance?.setErrorMap({
                onSubmit: { message },
              })
          )
        }
      },
    },
    listeners: {
      onChange: ({ formApi, fieldApi }) => {
      },
    },
    onSubmit: ({ value, formApi }) =>
      startTransition(async () => {
        try {
          const response: any = await submitForm({
            variables: {
              input: isUpdate ? { _id: props._id, ...value } : { ...value },
            },
          })
          if (response) onClose()
        } catch (error: any) {
          console.error(error.errors)
          if (error.name == "CombinedGraphQLErrors") {
            const fieldErrors = error.errors[0].extensions.fields
            if (fieldErrors)
              fieldErrors.map(
                ({ path, message }: { path: string; message: string }) =>
                  formApi.fieldInfo[
                    path as keyof typeof formApi.fieldInfo
                  ].instance?.setErrorMap({
                    onSubmit: { message },
                  })
              )
          }
        }
      }),
  })

  const onClose = () => {
    setOpen(false)
    props.onClose?.()
    form.reset()
  }

  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isUpdate ? (
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            Edit
          </DropdownMenuItem>
        ) : (
          <Button variant="outline-success">
            <CirclePlus className="size-3.5" />
            Add User
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>{isUpdate ? "Edit User" : "Create User"}</DialogTitle>
          <DialogDescription>
            {isUpdate
              ? "Update existing user details."
              : "Create a new user in the system."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="-mt-2 mb-2"
          id="user-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldSet>
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <InputGroup className="-my-1">
                      <InputGroupInput
                        placeholder="Name"
                        disabled={loading}
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                      />
                    </InputGroup>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
            <form.Field
              name="username"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                    <InputGroup className="-my-1.5">
                      <InputGroupInput
                        disabled={loading}
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Username"
                      />
                    </InputGroup>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
            <form.Field
              name="contactNumber"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Contact No.</FieldLabel>
                    <InputGroup className="-my-1.5">
                      <InputGroupInput
                        disabled={loading}
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Contact No."
                      />
                    </InputGroup>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
            <form.Field
              name="email"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email Address</FieldLabel>
                    <InputGroup className="-my-1.5">
                      <InputGroupInput
                        disabled={loading}
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Email Address"
                        type="email"
                      />
                    </InputGroup>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
            <form.Field
              name="role"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                    <Popover open={openRoles} onOpenChange={setOpenRoles}>
                      <PopoverTrigger asChild>
                        <Button
                          id={field.name}
                          name={field.name}
                          disabled={loading}
                          aria-expanded={openRoles}
                          onBlur={field.handleBlur}
                          variant="outline"
                          role="combobox"
                          aria-invalid={isInvalid}
                          className="w-full justify-between font-normal capitalize -mt-2"
                          type="button"
                        >
                          {field.state.value
                            ? Roles.find((o) => o.value === field.state.value)
                                ?.label
                            : "Select Role"}
                          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command
                          filter={(value, search) =>
                            Roles.find(
                              (t: { value: string; label: string }) =>
                                t.value === value
                            )
                              ?.label.toLowerCase()
                              .includes(search.toLowerCase())
                              ? 1
                              : 0
                          }
                        >
                          <CommandInput placeholder="Select Role" />
                          <CommandList className="max-h-72 overflow-y-auto">
                            <CommandEmpty>No role found.</CommandEmpty>
                            <CommandGroup>
                              <Label className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
                                Roles
                              </Label>
                              {Roles?.map((o) => (
                                <CommandItem
                                  key={o.value}
                                  value={o.value}
                                  onSelect={(v) => {
                                    field.handleChange(v as Role)
                                    setOpenRoles(false)
                                  }}
                                  className="capitalize"
                                >
                                  <CheckIcon
                                    className={cn(
                                      "h-4 w-4",
                                      field.state.value === o.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {o.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
          </FieldSet>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button className="w-20" onClick={onClose} variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            className="w-20"
            loading={isLoading}
            type="submit"
            form="user-form"
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FormDialog

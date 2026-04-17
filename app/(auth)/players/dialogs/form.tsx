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
import { PlayerSchema } from "@/validators/player.validator"
import { gql } from "@apollo/client"
import { useMutation, useQuery } from "@apollo/client/react"
import { useForm } from "@tanstack/react-form"
import React, { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  CalendarIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  CirclePlus,
  Eraser,
} from "lucide-react"
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
import { Gender } from "@/types/shared.interface"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"

const PLAYER = gql`
  query Player($_id: ID!) {
    player(_id: $_id) {
      firstName
      middleName
      lastName
      suffix
      email
      phoneNumber
      birthDate
      gender
    }
  }
`

const CREATE = gql`
  mutation CreatePlayer($input: CreatePlayerInput!) {
    createPlayer(input: $input) {
      ok
      message
    }
  }
`

const UPDATE = gql`
  mutation UpdatePlayer($input: UpdatePlayerInput!) {
    updatePlayer(input: $input) {
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
  // Dialog open state
  const [open, setOpen] = useState(false)
  // Determine if it's an update or create operation
  const isUpdate = Boolean(props._id)
  const [isPending, startTransition] = useTransition()
  // Fetch existing date if updating
  const { data, loading: fetchLoading }: any = useQuery(PLAYER, {
    variables: { _id: props._id },
    skip: !open || !isUpdate,
    fetchPolicy: "no-cache",
  })
  // Mutation hook
  const [submitForm] = useMutation(isUpdate ? UPDATE : CREATE)
  // Combined loading state
  const isLoading = isUpdate ? isPending || fetchLoading : false
  // Gender Options
  const [openGenders, setOpenGenders] = useState(false)
  const genders = Object.values(Gender).map((gender) => ({
    label: gender.toLocaleLowerCase().replaceAll("_", " "),
    value: gender,
  }))
  // Combined loading state
  const loading = isPending || fetchLoading

  const form = useForm({
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      email: "",
      phoneNumber: "",
      birthDate: new Date(),
      gender: Gender.MALE,
    },
    validators: {
      onSubmit: ({ formApi, value }) => {
        try {
          PlayerSchema.parse(value)
        } catch (error: any) {
          const formErrors = JSON.parse(error)
          formErrors.map(
            ({ path, message }: { path: string; message: string }) =>
              formApi.fieldInfo[
                path as keyof typeof formApi.fieldInfo
              ]?.instance?.setErrorMap({
                onSubmit: { message },
              })
          )
        }
      },
    },
    listeners: {
      onChange: ({ formApi, fieldApi }) => {
        // console.log(fieldApi.name, fieldApi.state.value)
      },
    }, // this is just for demo purposes
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
                  ]?.instance?.setErrorMap({
                    onSubmit: { message },
                  })
              )
          }
        }
      }),
  })

  useEffect(() => {
    if (data) {
      form.reset({
        firstName: data.player.firstName || "",
        middleName: data.player.middleName || "",
        lastName: data.player.lastName || "",
        suffix: data.player.suffix || "",
        email: data.player.email || "",
        phoneNumber: data.player.phoneNumber || "",
        birthDate: data.player.birthDate
          ? new Date(data.player.birthDate)
          : new Date(),
        gender: data.player.gender || Gender.MALE,
      })
    }
  }, [isUpdate, data])

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
            Add Player
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? "Edit Player" : "Create Player"}
          </DialogTitle>
          <DialogDescription>
            {isUpdate
              ? "Update existing player details."
              : "Create a new player in the system."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="-mt-2 mb-2"
          id="player-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldSet className="grid grid-cols-2 place-content-start gap-3 h-[48vh] overflow-y-auto">
            <form.Field
              name="firstName"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid} className="col-span-2">
                    <FieldLabel htmlFor={field.name}>First Name</FieldLabel>
                    <InputGroup className="-my-1">
                      <InputGroupInput
                        required
                        placeholder="First Name"
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
              name="middleName"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid} className="col-span-2">
                    <FieldLabel htmlFor={field.name}>Middle Name</FieldLabel>
                    <InputGroup className="-my-1">
                      <InputGroupInput
                        placeholder="Middle Name"
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
            <div className="col-span-2 flex gap-3">
              <form.Field
                name="lastName"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Last Name</FieldLabel>
                      <InputGroup className="-my-1">
                        <InputGroupInput
                          required
                          placeholder="Last Name"
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
                name="suffix"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field className="w-24" data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Ext.</FieldLabel>
                      <InputGroup className="-my-1">
                        <InputGroupInput
                          placeholder="Ext."
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
            </div>

            <form.Field
              name="email"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <InputGroup className="-my-1">
                      <InputGroupInput
                        placeholder="Email"
                        disabled={loading}
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
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
              name="phoneNumber"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Phone Number</FieldLabel>
                    <InputGroup className="-my-1">
                      <InputGroupInput
                        placeholder="Phone Number"
                        disabled={loading}
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        maxLength={11}
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
              name="birthDate"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel id="birth-date" htmlFor="birth-date">
                      Birth Date
                    </FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="birth-date"
                          name="birth-date"
                          variant="outline"
                          data-empty={!field.state.value}
                          className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal flex -mt-1"
                          disabled={loading}
                        >
                          <CalendarIcon className="size-3.5" />
                          {field.state.value ? (
                            format(field.state.value, "PP")
                          ) : (
                            <span>Select Birth Date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          captionLayout="dropdown"
                          required
                          selected={field.state.value}
                          onSelect={field.handleChange}
                        />
                      </PopoverContent>
                    </Popover>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <form.Field
              name="gender"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                    <Popover open={openGenders} onOpenChange={setOpenGenders}>
                      <PopoverTrigger asChild>
                        <Button
                          id={field.name}
                          name={field.name}
                          disabled={loading}
                          aria-expanded={openGenders}
                          onBlur={field.handleBlur}
                          variant="outline"
                          role="combobox"
                          aria-invalid={isInvalid}
                          className="w-full justify-between font-normal capitalize -mt-1"
                          type="button"
                        >
                          {field.state.value
                            ? genders.find((o) => o.value === field.state.value)
                              ?.label
                            : "Select Role"}
                          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command
                          filter={(value, search) =>
                            genders
                              .find(
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
                                Gender
                              </Label>
                              {genders?.map((o) => (
                                <CommandItem
                                  key={o.value}
                                  value={o.value}
                                  onSelect={(val) => {
                                    field.handleChange(val as Gender)
                                    setOpenGenders(false)
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
            form="player-form"
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FormDialog

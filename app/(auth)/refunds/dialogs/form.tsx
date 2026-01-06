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
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react"
import { useForm } from "@tanstack/react-form"
import React, { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  CalendarIcon,
  Check,
  CheckIcon,
  ChevronsUpDown,
  ChevronsUpDownIcon,
  CirclePlus,
  Eraser,
} from "lucide-react"
import { Field, FieldLabel, FieldError, FieldSet } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
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
import { IRefund } from "@/types/refund.interface"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"

const USER = gql`
  query Refund($_id: ID!) {
    refund(_id: $_id) {
      _id
      payerName
      referenceNumber
      amount
      method
      proofOfRefundURL
      refundDate
      entryList {
        _id
        entryNumber
      }
    }
  }
`

const CREATE = gql`
  mutation CreateRefund($input: CreateRefundInput!) {
    createRefund(input: $input) {
      ok
      message
    }
  }
`

const UPDATE = gql`
  mutation UpdateRefund($input: UpdateRefundInput!) {
    updateRefund(input: $input) {
      ok
      message
    }
  }
`

const SEARCH_ENTRY = gql`
  query SearchEntryOptionsByKeyword($keyword: String!) {
    searchEntryOptionsByKeyword(keyword: $keyword) {
      label
      value
      players {
        firstName
        lastName
      }
      event
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
  const { data, loading: fetchLoading }: any = useQuery(USER, {
    variables: { _id: props._id },
    skip: !open || !isUpdate,
    fetchPolicy: "no-cache",
  })
  const refund = data?.refund as IRefund
  // Mutation hook
  const [submitForm] = useMutation(isUpdate ? UPDATE : CREATE)
  // Combined loading state
  const isLoading = isUpdate ? isPending || fetchLoading : false

  // Combined loading state
  const loading = isPending || fetchLoading

  // // Entry Auto Search
  const [search, { data: entryOptionsData, loading: optionsLoading }] =
    useLazyQuery(SEARCH_ENTRY, {
      fetchPolicy: "no-cache",
    })
  const [openFilteredEntries, setOpenFilteredEntries] = useState(false)
  const [entryKeyword, setEntryKeyword] = useState<string>("")
  const entryOptions =
    (entryOptionsData as any)?.searchEntryOptionsByKeyword || []

  useEffect(() => {
    const handler = setTimeout(() => {
      if (entryKeyword) search({ variables: { keyword: entryKeyword } })
    }, 350)

    return () => {
      clearTimeout(handler)
    }
  }, [entryKeyword, search])

  // FIXME: Entry search bug when v9-0001 is typed it wont work
  useEffect(() => {
    console.log(entryOptions)
  }, [entryOptions])

  const form = useForm({
    defaultValues: {
      payerName: refund?.payerName || "",
      referenceNumber: refund?.referenceNumber || "",
      amount: refund?.amount || 0,
      method: refund?.method || "",
      proofOfRefundURL: refund?.proofOfRefundURL || "",
      refundDate: refund?.refundDate || new Date(),
      entryList: refund?.entryList[0] || "",
    },
    validators: {
      onSubmit: ({ formApi, value }) => {
        try {
          UserSchema.parse(value)
        } catch (error: any) {
          const formErrors = JSON.parse(error)
          formErrors.map(
            ({ path, message }: { path: string; message: string }) =>
              (formApi.fieldInfo as Record<string, any>)[
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
          <Button variant="outline-warning">
            <CirclePlus className="size-3.5 -mx-0.5" />
            Create Refund
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
            {isUpdate ? "Edit Refund" : "Create Refund"}
          </DialogTitle>
          <DialogDescription>
            {isUpdate
              ? "Update existing refund details."
              : "Create a new refund in the system."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="-mt-2 mb-2"
          id="refund-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldSet className="grid grid-cols-2">
            <form.Field
              name="payerName"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid} className="col-span-2">
                    <FieldLabel htmlFor={field.name}>Payer Name</FieldLabel>
                    <InputGroup className="-my-1">
                      <InputGroupInput
                        required
                        placeholder="Payer Name"
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
              name="referenceNumber"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid} className="col-span-2">
                    <FieldLabel htmlFor={field.name}>Reference No.</FieldLabel>
                    <InputGroup className="-my-1.5">
                      <InputGroupInput
                        placeholder="Reference No."
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
              name="amount"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Amount</FieldLabel>
                    <InputGroup className="-my-1.5">
                      <InputGroupAddon>
                        <span className="font-thin">₱</span>
                      </InputGroupAddon>
                      <InputGroupInput
                        placeholder="Amount"
                        disabled={loading}
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(parseFloat(e.target.value))
                        }
                        aria-invalid={isInvalid}
                        type="number"
                        step={0.01}
                        min={0}
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
              name="refundDate"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel id="refund-date">Refund Date</FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="refund-date"
                          name="refund-date"
                          variant="outline"
                          data-empty={!field.state.value}
                          className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal flex -mt-1"
                          disabled={loading}
                        >
                          <CalendarIcon className="size-3.5" />
                          {field.state.value ? (
                            format(field.state.value, "PP")
                          ) : (
                            <span>Select Refund Date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          required={true}
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
              name="entryList"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid} className="col-span-2">
                    <FieldLabel id="Entry">Entries Involved</FieldLabel>
                    <Popover
                      open={openFilteredEntries}
                      onOpenChange={setOpenFilteredEntries}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          id={field.name}
                          name={field.name}
                          aria-expanded={openFilteredEntries}
                          onBlur={field.handleBlur}
                          variant="outline"
                          role="combobox"
                          aria-invalid={isInvalid}
                          className={cn(
                            "w-full justify-between font-normal capitalize -mt-2",
                            !field.state.value && "text-muted-foreground"
                          )}
                          type="button"
                        >
                          {field.state.value
                            ? entryOptions.find(
                                (entry: any) =>
                                  entry.value === field.state.value
                              )?.label
                            : "Select entry..."}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-50 p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search entry..."
                            onValueChange={(value) => setEntryKeyword(value)}
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>No entry found.</CommandEmpty>
                            <CommandGroup>
                              {entryOptions.map((entry: any) => (
                                <CommandItem
                                  key={entry.value}
                                  value={entry.value}
                                  onSelect={(currentValue: any) => {
                                    field.handleChange(currentValue)
                                    setOpenFilteredEntries(false)
                                    setEntryKeyword("")
                                  }}
                                >
                                  {entry.label}
                                  <Check
                                    className={cn(
                                      "ml-auto",
                                      field.state.value === entry.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
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
            form="refund-form"
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FormDialog

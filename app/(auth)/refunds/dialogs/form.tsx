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
  Paperclip,
  Video,
  XIcon,
} from "lucide-react"
import {
  Field,
  FieldLabel,
  FieldError,
  FieldSet,
  FieldDescription,
} from "@/components/ui/field"
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
import { cn } from "@/lib/utils"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { IRefund } from "@/types/refund.interface"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { PaymentMethod } from "@/types/payment.interface"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useDropzone } from "react-dropzone"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { RefundSchema } from "@/validators/refund.validator"

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

const ALL_ACTIVE_ENTRIES = gql`
  query AllActiveEntryOptions {
    allActiveEntryOptions {
      event
      players {
        firstName
        lastName
      }
      entryNumber
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

  const { data: entryOptionsData, loading: optionsLoading } = useQuery(
    ALL_ACTIVE_ENTRIES,
    {
      fetchPolicy: "no-cache",
    }
  )
  const [openFilteredEntries, setOpenFilteredEntries] = useState(false)
  const entryOptions = (entryOptionsData as any)?.allActiveEntryOptions || []
  // Payment Methods
  const [openMethods, setOpenMethods] = useState(false)
  const Methods = Object.values(PaymentMethod).map((method) => ({
    label: method.toLocaleLowerCase().replaceAll("_", " "),
    value: method,
  }))
  // Handle image
  // Handle Image
  const [files, setFiles] = useState<any[]>([])
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": [],
      "image/jpg": [],
      "image/jpeg": [],
    },
    multiple: false,
    maxSize: 3 * 1024 * 1024, // 30MB
    onDrop: (acceptedFiles: any, fileRejections: any) => {
      if (fileRejections.length > 0) {
        toast.error("File too large or unsupported type. (Max size: 3MB)")
        return
      }
      setFiles(
        acceptedFiles.map((file: any) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      )
    },
  })

  const form = useForm({
    defaultValues: {
      payerName: refund?.payerName || "",
      referenceNumber: refund?.referenceNumber || "",
      amount: refund?.amount || 0,
      method: refund?.method || "BANK_TRANSFER",
      proofOfRefundURL: refund?.proofOfRefundURL || "",
      refundDate: refund?.refundDate || new Date(),
      entryList: refund?.entryList.map((e) => e.entryNumber) || [],
    },
    validators: {
      onSubmit: ({ formApi, value }) => {
        try {
          RefundSchema.parse(value)
        } catch (error: any) {
          console.error(error)
          JSON.parse(error).map(({ path, message }) => {
            const pathName = path.join(".")
            formApi.fieldInfo[pathName].instance?.setErrorMap({
              onSubmit: { message },
            })
          })
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
          const payload = value
          if (files.length > 0) {
            const formData = new FormData()
            const file = files[0]

            formData.append(
              "file",
              file,
              `REFUND${payload.entryList.join("-").toUpperCase()}-${Date.now()}`
            )

            await fetch("/api/upload/refund", {
              method: "POST",
              body: formData,
            }).then(async (res) => {
              const data = await res.json()
              if (!res.ok) throw new Error("Upload failed")
              payload.proofOfRefundURL = data.url
            })
          }

          const response = await submitForm({
            variables: {
              input: isUpdate ? { _id: props._id, ...payload } : payload,
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
                  (formApi as any).fieldInfo[path as any].instance?.setErrorMap(
                    {
                      onSubmit: { message },
                    }
                  )
              )
          }
        }
      }),
  })

  const onClose = () => {
    setOpen(false)
    props.onClose?.()
    form.reset()
    setFiles([])
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
            <CirclePlus className="size-3.5 -mx-0.5" />
            Add Refund
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
          <FieldSet className="grid grid-cols-2 h-[60vh] overflow-y-auto">
            <form.Field
              name="payerName"
              children={(field: any) => {
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
              children={(field: any) => {
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
              children={(field: any) => {
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
              children={(field: any) => {
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
              name="method"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Payment Method</FieldLabel>
                    <Popover open={openMethods} onOpenChange={setOpenMethods}>
                      <PopoverTrigger asChild>
                        <Button
                          id={field.name}
                          name={field.name}
                          disabled={loading}
                          aria-expanded={openMethods}
                          onBlur={field.handleBlur}
                          variant="outline"
                          role="combobox"
                          aria-invalid={isInvalid}
                          className="w-full justify-between font-normal capitalize -mt-2"
                          type="button"
                        >
                          {field.state.value
                            ? Methods.find((o) => o.value === field.state.value)
                                ?.label
                            : "Select Method"}
                          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command
                          filter={(value, search) =>
                            Methods.find(
                              (t: { value: string; label: string }) =>
                                t.value === value
                            )
                              ?.label.toLowerCase()
                              .includes(search.toLowerCase())
                              ? 1
                              : 0
                          }
                        >
                          <CommandInput placeholder="Select Method" />
                          <CommandList className="max-h-72 overflow-y-auto">
                            <CommandEmpty>No Method found.</CommandEmpty>
                            <CommandGroup>
                              <Label className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
                                Methods
                              </Label>
                              {Methods?.map((o, i) => (
                                <CommandItem
                                  key={i}
                                  value={o.value}
                                  onSelect={(v) => {
                                    field.handleChange(v as PaymentMethod)
                                    setOpenMethods(false)
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
            <form.Field
              name="entryList"
              children={(field: any) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                const entryList = field.state.value
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
                            "w-full justify-between font-normal capitalize -mt-2 h-fit",
                            !entryList && "text-muted-foreground"
                          )}
                          type="button"
                        >
                          {entryList.length > 0
                            ? `${entryList.length} selected entr${
                                entryList.length == 1 ? "y" : "ies"
                              }`
                            : "Select entry"}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-100 p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search entry..."
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>No entry found.</CommandEmpty>
                            <CommandGroup>
                              {entryOptions.map((entry: any) => (
                                <CommandItem
                                  key={entry.entryNumber}
                                  value={entry.entryNumber}
                                  onSelect={(currentValue: any) => {
                                    field.handleChange((prev) => {
                                      if (prev.includes(currentValue))
                                        return prev.filter(
                                          (e) => e != currentValue
                                        )
                                      else return [...prev, currentValue]
                                    })
                                    setOpenFilteredEntries(false)
                                  }}
                                >
                                  <div
                                    className={cn(
                                      "flex justify-between w-full items-center"
                                    )}
                                  >
                                    <div className="flex flex-col">
                                      <span className="block">
                                        {entry.entryNumber}
                                      </span>
                                      <span className="block text-xs">
                                        {entry.event}
                                      </span>
                                      <span className="block text-xs">
                                        {entry.players
                                          .map(
                                            (p) =>
                                              `${p.firstName} ${p.lastName}`
                                          )
                                          .join(", ")}
                                      </span>
                                    </div>
                                    <Check
                                      className={cn(
                                        "ml-auto",
                                        entryList.includes(entry.entryNumber)
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                  </div>
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
                    {entryList.length > 0 && (
                      <div className="flex flex-col gap-1">
                        {entryList.map((e, i) => {
                          const selectedEntry = entryOptions.find(
                            (entry) => entry.entryNumber == e
                          )
                          return (
                            <div key={i} className="flex gap-1.5">
                              <div className="w-4 text-sm">{i + 1}.</div>
                              <div>
                                <span className="block text-foreground text-sm">
                                  {selectedEntry.entryNumber}
                                </span>
                                <span className="block text-xs text-muted-foreground">
                                  {selectedEntry.event}
                                </span>
                                <span className="block text-xs text-muted-foreground">
                                  {selectedEntry.players
                                    .map((p) => `${p.firstName} ${p.lastName}`)
                                    .join(", ")}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </Field>
                )
              }}
            />
            <form.Field
              name="proofOfRefundURL"
              children={(field) => {
                const imageUrl = field.state.value || ""
                return (
                  <div className="col-span-2">
                    <div {...getRootProps({ className: "dropzone space-y-1" })}>
                      <Label>Proof of Refund</Label>
                      <Input disabled={files.length > 0} {...getInputProps()} />
                      {imageUrl && (
                        <div className="border flex justify-around p-1.75">
                          {files.length > 0 &&
                            files.map((file: any, idx: number) => (
                              <Sheet key={file.name}>
                                <SheetTrigger className="flex flex-col items-center">
                                  <div className="flex gap-1">
                                    <Label>New Proof</Label>
                                    <Button
                                      onClick={() => {
                                        setFiles((prev) =>
                                          prev.filter((_, i) => i !== idx)
                                        )
                                      }}
                                      disabled={isPending}
                                      className="scale-40 -m-2 rounded-full opacity-70 cursor-pointer"
                                      size="icon-sm"
                                      variant="destructive"
                                      title="Remove image"
                                    >
                                      <XIcon />
                                    </Button>
                                  </div>
                                  <Image
                                    height={150}
                                    width={150}
                                    className="object-contain w-24 h-24 bg-gray-200 cursor-pointer rounded"
                                    src={file.preview}
                                    title={`${file.name}: ${(
                                      file.size / 1024
                                    ).toFixed(2)} KB`}
                                    alt="Preview"
                                  />
                                </SheetTrigger>
                                <SheetContent
                                  className="h-screen p-[2%]"
                                  side="bottom"
                                >
                                  <SheetHeader hidden>
                                    <SheetTitle>Preview</SheetTitle>
                                    <SheetDescription>
                                      Description
                                    </SheetDescription>
                                  </SheetHeader>
                                  <img
                                    className="object-contain h-full"
                                    src={file.preview}
                                    title={`${file.name}: ${(
                                      file.size / 1024
                                    ).toFixed(2)} KB`}
                                  />
                                </SheetContent>
                              </Sheet>
                            ))}

                          <Sheet>
                            <SheetTrigger className="flex flex-col items-center">
                              <div className="flex gap-1">
                                <Label>Old Proof</Label>
                              </div>
                              <Image
                                height={150}
                                width={150}
                                className="object-contain w-24 h-24 bg-gray-200 cursor-pointer rounded"
                                src={imageUrl}
                                title={`Old Proof`}
                                alt="Preview"
                              />
                            </SheetTrigger>
                            <SheetContent
                              className="h-screen p-[2%]"
                              side="bottom"
                            >
                              <SheetHeader hidden>
                                <SheetTitle>Preview</SheetTitle>
                                <SheetDescription>Description</SheetDescription>
                              </SheetHeader>
                              <img
                                className="object-contain h-full"
                                src={imageUrl}
                                title="Old proof"
                              />
                            </SheetContent>
                          </Sheet>
                        </div>
                      )}

                      <div
                        className={cn(
                          "flex flex-col items-center justify-center",
                          files.length > 0 && "hidden"
                        )}
                      >
                        <Button
                          variant="outline"
                          title="Attach image/document"
                          type="button"
                          disabled={files.length > 0}
                          className={cn(
                            "flex flex-col h-fit min-h-32 border-dashed w-full"
                          )}
                        >
                          <div className={cn("flex flex-col")}>
                            <span className="block">
                              Upload attachment here
                            </span>
                            <span className="text-muted-foreground font-normal">
                              (Accepted: .png, .jpg, .jpeg)
                            </span>
                            <span className="text-muted-foreground font-normal">
                              (Max: 3MB)
                            </span>
                          </div>
                        </Button>
                      </div>
                    </div>
                    <div></div>
                  </div>
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

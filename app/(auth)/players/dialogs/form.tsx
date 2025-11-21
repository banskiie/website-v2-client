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
import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { CalendarIcon, CirclePlus } from "lucide-react"
import { Field, FieldLabel, FieldError, FieldSet } from "@/components/ui/field"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
  Gender,
  PlayerLevel,
  ValidDocumentType,
} from "@/types/player.interface"

const PLAYER = gql`
  query Player($_id: ID!) {
    player(_id: $_id) {
      _id
      firstName
      middleName
      lastName
      suffix
      gender
      birthDate
      email
      phoneNumber
      isArchived
      createdAt
      updatedAt
      levels {
        level
        dateLevelled
      }
      validDocuments {
        documentURL
        documentType
        dateUploaded
      }
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

  // Player Information Options
  const genders = Object.values(Gender).map((gender) => ({
    label: gender.toLocaleLowerCase().replaceAll("_", " "),
    value: gender,
  }))
  // Player Level Options
  const levels = Object.values(PlayerLevel).map((level) => ({
    label: level.toLocaleLowerCase().replaceAll("_", " "),
    value: level,
  }))
  // Player Level Options
  const documents = Object.values(ValidDocumentType).map((document) => ({
    label: document.toLocaleLowerCase().replaceAll("_", " "),
    value: document,
  }))
  // Combined loading state
  const loading = isUpdate ? isPending || fetchLoading : false
  // Form setup
  const form = useForm({
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      gender: "MALE",
      birthDate: undefined as Date | undefined,
      email: "",
      phoneNumber: "",
      isArchived: false,
      levels: [
        {
          level: "",
          dateLevelled: undefined as Date | undefined,
        },
      ],
      validDocuments: [
        {
          documentURL: "",
          documentType: "",
          dateUploaded: undefined as Date | undefined,
        },
      ],
    },

    validators: {
      onSubmit: ({ formApi, value }) => {
        try {
          PlayerSchema.parse(value)
        } catch (error: any) {
          const formErrors = JSON.parse(error)
          formErrors.map(
            ({ path, message }: { path: string[]; message: string }) => {
              const fieldPath = path.join(".")
              formApi.fieldInfo[
                fieldPath as keyof typeof formApi.fieldInfo
              ]?.instance?.setErrorMap({
                onSubmit: { message },
              })
            }
          )
        }
      },
    },
    onSubmit: ({ value, formApi }) =>
      startTransition(async () => {
        try {
          console.log(value, "check onSubmit value")
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
                ({ path, message }: { path: string; message: string }) => {
                  formApi.fieldInfo[
                    path as keyof typeof formApi.fieldInfo
                  ]?.instance?.setErrorMap({
                    onSubmit: { message },
                  })
                }
              )
          }
        }
      }),
  })

  useEffect(() => {
    if (data) {
      const {
        firstName,
        middleName,
        lastName,
        suffix,
        gender,
        birthDate,
        email,
        phoneNumber,
        isArchived,
        levels,
        validDocuments,
      } = data.player
      form.reset({
        firstName,
        middleName,
        lastName,
        suffix,
        gender,
        birthDate,
        email,
        phoneNumber,
        isArchived,
        levels: (levels ?? []).map((level: any) => ({
          level: level.level,
          dateLevelled: level.dateLevelled
            ? new Date(level.dateLevelled)
            : undefined,
        })),
        validDocuments: (validDocuments ?? []).map((validDocument: any) => ({
          documentURL: validDocument.documentURL,
          documentType: validDocument.documentType,
          dateUploaded: validDocument.dateUploaded
            ? new Date(validDocument.dateUploaded)
            : undefined,
        })),
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
      <form>
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
            className=""
            id="player-form"
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <form.Subscribe
              selector={(state) => state.values}
              children={(state) => (
                <Tabs defaultValue="details" className="">
                  <TabsList className="w-full grid grid-cols-3 -mt-2 mb-1">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="levels">Levels</TabsTrigger>
                    <TabsTrigger value="validDocuments">
                      Valid Documents
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="details">
                    <FieldSet className="h-[48vh] overflow-y-auto">
                      <form.Field
                        name="firstName"
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                First Name
                              </FieldLabel>
                              <InputGroup className="-my-1">
                                <InputGroupInput
                                  placeholder="First Name"
                                  disabled={loading}
                                  id={field.name}
                                  name={field.name}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) =>
                                    field.handleChange(e.target.value)
                                  }
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
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                Middle Name
                              </FieldLabel>
                              <InputGroup className="-my-1">
                                <InputGroupInput
                                  placeholder="Middle Name"
                                  disabled={loading}
                                  id={field.name}
                                  name={field.name}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) =>
                                    field.handleChange(e.target.value)
                                  }
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
                        name="lastName"
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                Last Name
                              </FieldLabel>
                              <InputGroup className="-my-1">
                                <InputGroupInput
                                  placeholder="Last Name"
                                  disabled={loading}
                                  id={field.name}
                                  name={field.name}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) =>
                                    field.handleChange(e.target.value)
                                  }
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
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                Suffix
                              </FieldLabel>
                              <InputGroup className="-my-1">
                                <InputGroupInput
                                  placeholder="Suffix"
                                  disabled={loading}
                                  id={field.name}
                                  name={field.name}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) =>
                                    field.handleChange(e.target.value)
                                  }
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
                        name="gender"
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                Gender
                              </FieldLabel>
                              <Select
                                name={field.name}
                                value={field.state.value}
                                onValueChange={field.handleChange}
                              >
                                <SelectTrigger
                                  aria-invalid={isInvalid}
                                  className="-mt-1 capitalize"
                                  disabled={loading}
                                >
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  {genders.map(({ label, value }) => (
                                    <SelectItem
                                      className="capitalize"
                                      key={value}
                                      value={value}
                                    >
                                      {label
                                        .toLocaleLowerCase()
                                        .replaceAll("_", " ")}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel id="player-start-date">
                                Start Date
                              </FieldLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    id="player-start-date"
                                    name="player-start-date"
                                    variant="outline"
                                    data-empty={!field.state.value}
                                    className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal flex -mt-1"
                                    disabled={loading}
                                  >
                                    <CalendarIcon className="size-3.5" />
                                    {field.state.value ? (
                                      format(field.state.value, "PP")
                                    ) : (
                                      <span>Select Start Date</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={field.state.value}
                                    onSelect={field.handleChange}
                                    // disabled={{
                                    //   before:
                                    //     (state.dates.registrationEnd as Date) ||
                                    //     undefined,
                                    //   after:
                                    //     (state.dates.playerEnd as Date) ||
                                    //     undefined,
                                    // }}
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
                        name="email"
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                Email
                              </FieldLabel>
                              <InputGroup className="-my-1">
                                <InputGroupInput
                                  placeholder="Email"
                                  disabled={loading}
                                  id={field.name}
                                  name={field.name}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) =>
                                    field.handleChange(e.target.value)
                                  }
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
                        name="phoneNumber"
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                Phone Number
                              </FieldLabel>
                              <InputGroup className="-my-1">
                                <InputGroupInput
                                  placeholder="Phone Number"
                                  disabled={loading}
                                  id={field.name}
                                  name={field.name}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) =>
                                    field.handleChange(e.target.value)
                                  }
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
                    </FieldSet>
                  </TabsContent>
                  <TabsContent value="levels">
                    <FieldSet className="h-[48vh] overflow-y-auto">
                      <form.Field
                        name="levels"
                        mode="array"
                        children={(field) => (
                          <>
                            {field.state.value.map((_, index) => (
                              <FieldSet
                                className="p-2.5 pb-4 border rounded-md"
                                key={index}
                                disabled={loading}
                              >
                                <form.Field
                                  name={`levels[${index}].level`}
                                  children={(field) => {
                                    const isInvalid =
                                      field.state.meta.isTouched &&
                                      !field.state.meta.isValid
                                    return (
                                      <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>
                                          Levels
                                        </FieldLabel>
                                        <Select
                                          name={field.name}
                                          value={field.state.value}
                                          onValueChange={field.handleChange}
                                        >
                                          <SelectTrigger
                                            aria-invalid={isInvalid}
                                            className="-mt-1 capitalize"
                                            disabled={loading}
                                          >
                                            <SelectValue placeholder="Select Level" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {levels.map(({ label, value }) => (
                                              <SelectItem
                                                className="capitalize"
                                                key={value}
                                                value={value}
                                              >
                                                {label
                                                  .toLocaleLowerCase()
                                                  .replaceAll("_", " ")}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        {isInvalid && (
                                          <FieldError
                                            errors={field.state.meta.errors}
                                          />
                                        )}
                                      </Field>
                                    )
                                  }}
                                />
                                <form.Field
                                  name={`levels[${index}].dateLevelled`}
                                  children={(field) => {
                                    const isInvalid =
                                      field.state.meta.isTouched &&
                                      !field.state.meta.isValid
                                    return (
                                      <Field data-invalid={isInvalid}>
                                        <FieldLabel id="player-start-date">
                                          Date Levelled
                                        </FieldLabel>
                                        <Popover>
                                          <PopoverTrigger asChild>
                                            <Button
                                              id="player-start-date"
                                              name="player-start-date"
                                              variant="outline"
                                              data-empty={!field.state.value}
                                              className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal flex -mt-1"
                                              disabled={loading}
                                            >
                                              <CalendarIcon className="size-3.5" />
                                              {field.state.value ? (
                                                format(field.state.value, "PP")
                                              ) : (
                                                <span>
                                                  Select Date Levelled
                                                </span>
                                              )}
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-0">
                                            <Calendar
                                              mode="single"
                                              selected={field.state.value}
                                              onSelect={field.handleChange}
                                              // disabled={{
                                              //   before:
                                              //     (state.dates.registrationEnd as Date) ||
                                              //     undefined,
                                              //   after:
                                              //     (state.dates.playerEnd as Date) ||
                                              //     undefined,
                                              // }}
                                            />
                                          </PopoverContent>
                                        </Popover>
                                        {isInvalid && (
                                          <FieldError
                                            errors={field.state.meta.errors}
                                          />
                                        )}
                                      </Field>
                                    )
                                  }}
                                />
                                {/* <form.Field
                                  name={`levels[${index}].dateLevelled`}
                                  children={(subField) => {
                                    const isInvalid =
                                      subField.state.meta.isTouched &&
                                      !subField.state.meta.isValid
                                    return (
                                      <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={subField.name}>
                                          Date Levelled
                                        </FieldLabel>
                                        <InputGroup className="-my-1">
                                          <InputGroupInput
                                            placeholder="Date Levelled"
                                            disabled={isPending}
                                            id={subField.name}
                                            name={subField.name}
                                            value={subField.state.value}
                                            onBlur={subField.handleBlur}
                                            onChange={(e) =>
                                              subField.handleChange(
                                                e.target.value
                                              )
                                            }
                                            aria-invalid={isInvalid}
                                          />
                                        </InputGroup>
                                        {isInvalid && (
                                          <FieldError
                                            errors={subField.state.meta.errors}
                                          />
                                        )}
                                      </Field>
                                    )
                                  }}
                                /> */}
                                {field.state.value.length > 1 && (
                                  <Button
                                    onClick={() => field.removeValue(index)}
                                    aria-label={`Remove email ${index + 1}`}
                                    type="button"
                                    variant="outline-destructive"
                                  >
                                    Remove Bank
                                  </Button>
                                )}
                              </FieldSet>
                            ))}
                            <Button
                              type="button"
                              variant="outline-info"
                              size="sm"
                              onClick={() =>
                                field.pushValue({
                                  level: "",
                                  dateLevelled: undefined as Date | undefined,
                                })
                              }
                              disabled={loading}
                            >
                              Add Level
                            </Button>
                          </>
                        )}
                      />
                    </FieldSet>
                  </TabsContent>
                  <TabsContent value="validDocuments">
                    <FieldSet className="h-[48vh] overflow-y-auto">
                      <form.Field
                        name="validDocuments"
                        mode="array"
                        children={(field) => (
                          <>
                            {field.state.value.map((_, index) => (
                              <FieldSet
                                className="p-2.5 pb-4 border rounded-md"
                                key={index}
                                disabled={loading}
                              >
                                <form.Field
                                  name={`validDocuments[${index}].documentURL`}
                                  children={(field) => {
                                    const isInvalid =
                                      field.state.meta.isTouched &&
                                      !field.state.meta.isValid
                                    return (
                                      <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>
                                          Document URL
                                        </FieldLabel>
                                        <InputGroup className="-my-1">
                                          <InputGroupInput
                                            placeholder="Document URL"
                                            disabled={loading}
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) =>
                                              field.handleChange(e.target.value)
                                            }
                                            aria-invalid={isInvalid}
                                          />
                                        </InputGroup>
                                        {isInvalid && (
                                          <FieldError
                                            errors={field.state.meta.errors}
                                          />
                                        )}
                                      </Field>
                                    )
                                  }}
                                />
                                <form.Field
                                  name={`validDocuments[${index}].documentType`}
                                  children={(field) => {
                                    const isInvalid =
                                      field.state.meta.isTouched &&
                                      !field.state.meta.isValid
                                    return (
                                      <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>
                                          Document Type
                                        </FieldLabel>
                                        <Select
                                          name={field.name}
                                          value={field.state.value}
                                          onValueChange={field.handleChange}
                                        >
                                          <SelectTrigger
                                            aria-invalid={isInvalid}
                                            className="-mt-1 capitalize"
                                            disabled={loading}
                                          >
                                            <SelectValue placeholder="Select Document Type" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {documents.map(
                                              ({ label, value }) => (
                                                <SelectItem
                                                  className="capitalize"
                                                  key={value}
                                                  value={value}
                                                >
                                                  {label
                                                    .toLocaleLowerCase()
                                                    .replaceAll("_", " ")}
                                                </SelectItem>
                                              )
                                            )}
                                          </SelectContent>
                                        </Select>
                                        {isInvalid && (
                                          <FieldError
                                            errors={field.state.meta.errors}
                                          />
                                        )}
                                      </Field>
                                    )
                                  }}
                                />
                                <form.Field
                                  name={`validDocuments[${index}].dateUploaded`}
                                  children={(field) => {
                                    const isInvalid =
                                      field.state.meta.isTouched &&
                                      !field.state.meta.isValid
                                    return (
                                      <Field data-invalid={isInvalid}>
                                        <FieldLabel id="player-start-date">
                                          Date Uploaded
                                        </FieldLabel>
                                        <Popover>
                                          <PopoverTrigger asChild>
                                            <Button
                                              id="player-start-date"
                                              name="player-start-date"
                                              variant="outline"
                                              data-empty={!field.state.value}
                                              className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal flex -mt-1"
                                              disabled={loading}
                                            >
                                              <CalendarIcon className="size-3.5" />
                                              {field.state.value ? (
                                                format(field.state.value, "PP")
                                              ) : (
                                                <span>
                                                  Select Date Uploaded
                                                </span>
                                              )}
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-0">
                                            <Calendar
                                              mode="single"
                                              selected={field.state.value}
                                              onSelect={field.handleChange}
                                              // disabled={{
                                              //   before:
                                              //     (state.dates.registrationEnd as Date) ||
                                              //     undefined,
                                              //   after:
                                              //     (state.dates.playerEnd as Date) ||
                                              //     undefined,
                                              // }}
                                            />
                                          </PopoverContent>
                                        </Popover>
                                        {isInvalid && (
                                          <FieldError
                                            errors={field.state.meta.errors}
                                          />
                                        )}
                                      </Field>
                                    )
                                  }}
                                />
                                {field.state.value.length > 1 && (
                                  <Button
                                    onClick={() => field.removeValue(index)}
                                    aria-label={`Remove email ${index + 1}`}
                                    type="button"
                                    variant="outline-destructive"
                                  >
                                    Remove Bank
                                  </Button>
                                )}
                              </FieldSet>
                            ))}
                            <Button
                              type="button"
                              variant="outline-info"
                              size="sm"
                              onClick={() =>
                                field.pushValue({
                                  documentURL: "",
                                  documentType: "",
                                  dateUploaded: undefined as Date | undefined,
                                })
                              }
                              disabled={loading}
                            >
                              Add Level
                            </Button>
                          </>
                        )}
                      />
                    </FieldSet>
                  </TabsContent>
                </Tabs>
              )}
            />
          </form>
          <DialogFooter>
            <DialogClose asChild>
              <Button className="w-20" onClick={onClose} variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="w-20"
              loading={loading}
              type="submit"
              form="player-form"
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}

export default FormDialog

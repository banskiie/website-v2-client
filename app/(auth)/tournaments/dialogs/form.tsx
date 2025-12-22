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
import { TournamentSchema } from "@/validators/tournament.validator"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"

const TOURNAMENT = gql`
  query Tournament($_id: ID!) {
    tournament(_id: $_id) {
      name
      settings {
        hasEarlyBird
        hasFreeJersey
        ticket
        maxEntriesPerPlayer
      }
      dates {
        registrationStart
        registrationEnd
        earlyBirdRegistrationEnd
        earlyBirdPaymentEnd
        registrationPaymentEnd
        tournamentStart
        tournamentEnd
      }
      banks {
        name
        accountNumber
        imageURL
      }
    }
  }
`

const CREATE = gql`
  mutation CreateTournament($input: CreateTournamentInput!) {
    createTournament(input: $input) {
      ok
      message
    }
  }
`

const UPDATE = gql`
  mutation UpdateTournament($input: UpdateTournamentInput!) {
    updateTournament(input: $input) {
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
  const { data, loading: fetchLoading }: any = useQuery(TOURNAMENT, {
    variables: { _id: props._id },
    skip: !open || !isUpdate,
    fetchPolicy: "no-cache",
  })
  // Mutation hook
  const [submitForm] = useMutation(isUpdate ? UPDATE : CREATE)
  // Combined loading state
  const loading = isUpdate ? isPending || fetchLoading : false
  // Form setup
  const form = useForm({
    defaultValues: {
      name: "",
      banks: [{ name: "", accountNumber: "", imageURL: "" }],
      settings: {
        hasEarlyBird: false,
        hasFreeJersey: false,
        ticket: "",
        maxEntriesPerPlayer: 3,
      },
      dates: {
        registrationStart: undefined as Date | undefined,
        registrationEnd: undefined as Date | undefined,
        earlyBirdRegistrationEnd: undefined as Date | undefined,
        earlyBirdPaymentEnd: undefined as Date | undefined,
        registrationPaymentEnd: undefined as Date | undefined,
        tournamentStart: undefined as Date | undefined,
        tournamentEnd: undefined as Date | undefined,
      },
    },

    validators: {
      onSubmit: ({ formApi, value }) => {
        try {
          TournamentSchema.parse(value)
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
      const { name, settings, banks, dates } = data.tournament
      form.setFieldValue("name", name)
      form.setFieldValue("settings.hasEarlyBird", settings.hasEarlyBird)
      form.setFieldValue("settings.hasFreeJersey", settings.hasFreeJersey)
      form.setFieldValue("settings.ticket", settings.ticket)
      form.setFieldValue(
        "settings.maxEntriesPerPlayer",
        settings.maxEntriesPerPlayer
      )
      form.setFieldValue(
        "banks",
        banks.map((bank: any) => ({
          name: bank.name,
          accountNumber: bank.accountNumber,
          imageURL: bank.imageURL,
        }))
      )
      form.setFieldValue(
        "dates.registrationStart",
        dates.registrationStart ? new Date(dates.registrationStart) : undefined
      )
      form.setFieldValue(
        "dates.registrationEnd",
        dates.registrationEnd ? new Date(dates.registrationEnd) : undefined
      )
      form.setFieldValue(
        "dates.earlyBirdRegistrationEnd",
        dates.earlyBirdRegistrationEnd
          ? new Date(dates.earlyBirdRegistrationEnd)
          : undefined
      )
      form.setFieldValue(
        "dates.earlyBirdPaymentEnd",
        dates.earlyBirdPaymentEnd
          ? new Date(dates.earlyBirdPaymentEnd)
          : undefined
      )
      form.setFieldValue(
        "dates.registrationPaymentEnd",
        dates.registrationPaymentEnd
          ? new Date(dates.registrationPaymentEnd)
          : undefined
      )
      form.setFieldValue(
        "dates.tournamentStart",
        dates.tournamentStart ? new Date(dates.tournamentStart) : undefined
      )
      form.setFieldValue(
        "dates.tournamentEnd",
        dates.tournamentEnd ? new Date(dates.tournamentEnd) : undefined
      )
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
              Add Tournament
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
              {isUpdate ? "Edit Tournament" : "Create Tournament"}
            </DialogTitle>
            <DialogDescription>
              {isUpdate
                ? "Update existing tournament details."
                : "Create a new tournament in the system."}
            </DialogDescription>
          </DialogHeader>
          <form
            className=""
            id="tournament-form"
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
                    <TabsTrigger value="dates">Dates</TabsTrigger>
                    <TabsTrigger value="banks">Banks</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details">
                    <FieldSet className="h-[48vh] overflow-y-auto">
                      <form.Field
                        name="name"
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
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
                      <div className="grid grid-cols-3 gap-2">
                        <form.Field
                          name="settings.ticket"
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            return (
                              <Field
                                data-invalid={isInvalid}
                                className="col-span-2"
                              >
                                <FieldLabel htmlFor={field.name}>
                                  Ticket Name
                                </FieldLabel>
                                <InputGroup className="-my-1">
                                  <InputGroupInput
                                    placeholder="ex. V8"
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
                          name="settings.maxEntriesPerPlayer"
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>
                                  Entries Per Player
                                </FieldLabel>
                                <InputGroup className="-my-1">
                                  <InputGroupInput
                                    placeholder="Name"
                                    disabled={loading}
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                      field.handleChange(
                                        parseInt(e.target.value)
                                      )
                                    }
                                    type="number"
                                    aria-invalid={isInvalid}
                                    min={0}
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
                      </div>
                      <div className="space-y-2">
                        <Label>Settings</Label>
                        <div className="rounded-md border py-3 space-y-2">
                          <form.Field
                            name="settings.hasEarlyBird"
                            children={(field) => {
                              const isInvalid =
                                field.state.meta.isTouched &&
                                !field.state.meta.isValid
                              return (
                                <Field data-invalid={isInvalid}>
                                  <div className="flex items-start gap-1 px-1.5">
                                    <Checkbox
                                      id={field.name}
                                      name={field.name}
                                      checked={field.state.value}
                                      onBlur={field.handleBlur}
                                      onCheckedChange={(val) => {
                                        field.handleChange(val as boolean)
                                        form.setFieldValue(
                                          "dates.earlyBirdRegistrationEnd",
                                          undefined
                                        )
                                        form.setFieldValue(
                                          "dates.earlyBirdPaymentEnd",
                                          undefined
                                        )
                                      }}
                                      className="m-1"
                                      aria-invalid={isInvalid}
                                      disabled={loading}
                                    />
                                    <div className="grid">
                                      <FieldLabel htmlFor={field.name}>
                                        Early Bird
                                      </FieldLabel>
                                      <span className="text-muted-foreground text-xs">
                                        This tournament has{" "}
                                        <span className="underline font-medium">
                                          {field.state.value ? "" : " no"} early
                                          bird bonuses and deadlines.
                                        </span>
                                      </span>
                                    </div>
                                  </div>
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
                            name="settings.hasFreeJersey"
                            children={(field) => {
                              const isInvalid =
                                field.state.meta.isTouched &&
                                !field.state.meta.isValid
                              return (
                                <Field data-invalid={isInvalid}>
                                  <div className="flex items-start gap-1 px-1.5">
                                    <Checkbox
                                      id={field.name}
                                      name={field.name}
                                      checked={field.state.value}
                                      onBlur={field.handleBlur}
                                      onCheckedChange={(val) => {
                                        field.handleChange(val as boolean)
                                      }}
                                      className="m-1"
                                      aria-invalid={isInvalid}
                                      disabled={loading}
                                    />
                                    <div className="grid">
                                      <FieldLabel htmlFor={field.name}>
                                        Free Jersey
                                      </FieldLabel>
                                      <span className="text-muted-foreground text-xs">
                                        Players{" "}
                                        <span className="font-medium underline">
                                          {field.state.value
                                            ? "receive"
                                            : "do not receive"}{" "}
                                          a free jersey upon registration.
                                        </span>
                                      </span>
                                    </div>
                                  </div>
                                  {isInvalid && (
                                    <FieldError
                                      errors={field.state.meta.errors}
                                    />
                                  )}
                                </Field>
                              )
                            }}
                          />
                        </div>
                      </div>
                    </FieldSet>
                  </TabsContent>
                  <TabsContent value="dates">
                    <FieldSet className="h-[48vh] overflow-y-auto">
                      <div className="grid grid-cols-2 p-2.5 border rounded-md gap-2">
                        <form.Field
                          name="dates.tournamentStart"
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel id="tournament-start-date">
                                  Start Date
                                </FieldLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      id="tournament-start-date"
                                      name="tournament-start-date"
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
                                      disabled={{
                                        before:
                                          (state.dates
                                            .registrationEnd as Date) ||
                                          undefined,
                                        after:
                                          (state.dates.tournamentEnd as Date) ||
                                          undefined,
                                      }}
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
                        <form.Field
                          name="dates.tournamentEnd"
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel id="tournament-end-date">
                                  End Date
                                </FieldLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      id="tournament-end-date"
                                      name="tournament-end-date"
                                      variant="outline"
                                      data-empty={!field.state.value}
                                      className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal flex -mt-1"
                                      disabled={loading}
                                    >
                                      <CalendarIcon className="size-3.5" />
                                      {field.state.value ? (
                                        format(field.state.value, "PP")
                                      ) : (
                                        <span>Select End Date</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      mode="single"
                                      selected={field.state.value}
                                      onSelect={field.handleChange}
                                      disabled={{
                                        before:
                                          (state.dates
                                            .tournamentStart as Date) ||
                                          undefined,
                                      }}
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
                      </div>
                      <div className="grid grid-cols-2 p-2.5 border rounded-md gap-2">
                        <form.Field
                          name="dates.registrationStart"
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel id="registration-start-date">
                                  Reg. Start
                                </FieldLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      id="registration-start-date"
                                      name="registration-start-date"
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
                                      disabled={{
                                        after:
                                          (state.dates
                                            .registrationEnd as Date) ||
                                          undefined,
                                      }}
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
                        <form.Field
                          name="dates.registrationEnd"
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel id="registration-end-date">
                                  Reg. End
                                </FieldLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      id="registration-end-date"
                                      name="registration-end-date"
                                      variant="outline"
                                      data-empty={!field.state.value}
                                      className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal flex -mt-1"
                                      disabled={loading}
                                    >
                                      <CalendarIcon className="size-3.5" />
                                      {field.state.value ? (
                                        format(field.state.value, "PP")
                                      ) : (
                                        <span>Select End Date</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      mode="single"
                                      selected={field.state.value}
                                      onSelect={field.handleChange}
                                      disabled={{
                                        before:
                                          (state.dates
                                            .registrationStart as Date) ||
                                          undefined,
                                      }}
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
                        <form.Field
                          name="dates.registrationPaymentEnd"
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel id="registration-payment-end-date">
                                  Reg. Payment End
                                </FieldLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      id="registration-payment-end-date"
                                      name="registration-payment-end-date"
                                      variant="outline"
                                      data-empty={!field.state.value}
                                      className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal flex -mt-1"
                                      disabled={loading}
                                    >
                                      <CalendarIcon className="size-3.5" />
                                      {field.state.value ? (
                                        format(field.state.value, "PP")
                                      ) : (
                                        <span>Select Payment End Date</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      mode="single"
                                      selected={field.state.value}
                                      onSelect={field.handleChange}
                                      disabled={{
                                        after:
                                          (state.dates
                                            .tournamentStart as Date) ||
                                          undefined,
                                      }}
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
                      </div>
                      {state.settings.hasEarlyBird && (
                        <div className="grid grid-cols-2 p-2.5 border rounded-md gap-2">
                          <form.Field
                            name="dates.earlyBirdRegistrationEnd"
                            children={(field) => {
                              const isInvalid =
                                field.state.meta.isTouched &&
                                !field.state.meta.isValid
                              return (
                                <Field data-invalid={isInvalid}>
                                  <FieldLabel id="eb-end-date">
                                    Early Bird End Date
                                  </FieldLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        id="eb-end-date"
                                        name="eb-end-date"
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
                                            Select Early Bird End Date
                                          </span>
                                        )}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <Calendar
                                        mode="single"
                                        selected={field.state.value}
                                        onSelect={field.handleChange}
                                        disabled={{
                                          before:
                                            (state.dates
                                              .registrationStart as Date) ||
                                            undefined,
                                        }}
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
                          <form.Field
                            name="dates.earlyBirdPaymentEnd"
                            children={(field) => {
                              const isInvalid =
                                field.state.meta.isTouched &&
                                !field.state.meta.isValid
                              return (
                                <Field data-invalid={isInvalid}>
                                  <FieldLabel id="eb-payment-end-date">
                                    Early Bird Payment End Date
                                  </FieldLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        id="eb-payment-end-date"
                                        name="eb-payment-end-date"
                                        variant="outline"
                                        data-empty={!field.state.value}
                                        className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal flex -mt-1"
                                        disabled={loading}
                                      >
                                        <CalendarIcon className="size-3.5" />
                                        {field.state.value ? (
                                          format(field.state.value, "PP")
                                        ) : (
                                          <span>Select Payment End Date</span>
                                        )}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <Calendar
                                        mode="single"
                                        selected={field.state.value}
                                        onSelect={field.handleChange}
                                        disabled={{
                                          after:
                                            (state.dates
                                              .registrationEnd as Date) ||
                                            undefined,
                                          before:
                                            (state.dates
                                              .earlyBirdRegistrationEnd as Date) ||
                                            undefined,
                                        }}
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
                        </div>
                      )}
                    </FieldSet>
                  </TabsContent>
                  <TabsContent value="banks">
                    <FieldSet className="h-[48vh] overflow-y-auto">
                      <form.Field
                        name="banks"
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
                                  name={`banks[${index}].name`}
                                  children={(subField) => {
                                    const isInvalid =
                                      subField.state.meta.isTouched &&
                                      !subField.state.meta.isValid
                                    return (
                                      <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={subField.name}>
                                          Name
                                        </FieldLabel>
                                        <InputGroup className="-my-1">
                                          <InputGroupInput
                                            placeholder="Name"
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
                                />
                                <form.Field
                                  name={`banks[${index}].accountNumber`}
                                  children={(subField) => {
                                    const isInvalid =
                                      subField.state.meta.isTouched &&
                                      !subField.state.meta.isValid
                                    return (
                                      <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={subField.name}>
                                          Account Number
                                        </FieldLabel>
                                        <InputGroup className="-my-1">
                                          <InputGroupInput
                                            placeholder="Account Number"
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
                                  name: "",
                                  accountNumber: "",
                                  imageURL: "",
                                })
                              }
                              disabled={loading}
                            >
                              Add Bank
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
              form="tournament-form"
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

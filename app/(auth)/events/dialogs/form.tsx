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
import {
  EventGender,
  EventLocation,
  EventType,
  EventCurrency,
} from "@/types/event.interface"
import { EventSchema } from "@/validators/event.validator"
import { gql } from "@apollo/client"
import { useMutation, useQuery } from "@apollo/client/react"
import { useForm } from "@tanstack/react-form"
import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { CheckIcon, ChevronsUpDownIcon, CirclePlus, Info } from "lucide-react"
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

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Separator } from "@/components/ui/separator"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const EVENT = gql`
  query event($_id: ID!) {
    event(_id: $_id) {
      _id
      name
      gender
      type
      maxEntries
      pricePerPlayer
      earlyBirdPricePerPlayer
      currency
      location
      maxAge
      minAge
      isClosed
      tournament {
        _id
      }
    }
  }
`

const OPTIONS = gql`
  query tournamentOptions {
    tournamentOptions {
      label
      value
      hasEarlyBird
    }
  }
`

const CREATE = gql`
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      ok
      message
    }
  }
`

const UPDATE = gql`
  mutation UpdateEvent($input: UpdateEventInput!) {
    updateEvent(input: $input) {
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
  const { data, loading: fetchLoading }: any = useQuery(EVENT, {
    variables: { _id: props._id },
    skip: !open || !isUpdate,
    fetchPolicy: "no-cache",
  })
  // Mutation hook
  const [submitForm] = useMutation(isUpdate ? UPDATE : CREATE)

  // Tournament Options
  const genders = Object.values(EventGender).map((gender) => ({
    label: gender.toLocaleLowerCase().replaceAll("_", " "),
    value: gender,
  }))
  // Location Options
  const locations = Object.values(EventLocation).map((location) => ({
    label: location.toLocaleLowerCase().replaceAll("_", " "),
    value: location,
  }))
  // Currency Options
  const currencies = Object.values(EventCurrency).map((curr) => ({
    label: curr.toLocaleLowerCase().replaceAll("_", " "),
    value: curr,
  }))
  // Location Options
  const types = Object.values(EventType).map((t) => ({
    label: t.toLocaleLowerCase().replaceAll("_", " "),
    value: t,
  }))
  // Tournament Options
  const [openTournaments, setOpenTournaments] = useState(false)
  const { data: optionsData, loading: optionsLoading }: any = useQuery(
    OPTIONS,
    {
      skip: !open,
      fetchPolicy: "no-cache",
    }
  )
  const tournaments = optionsData?.tournamentOptions || []
  // Combined loading state
  const loading = isUpdate ? isPending || fetchLoading || optionsLoading : false

  const form = useForm({
    defaultValues: {
      name: "",
      gender: "",
      type: "",
      location: "",
      tournament: "",
      currency: "",
      pricePerPlayer: 0,
      earlyBirdPricePerPlayer: 0,
      maxEntries: 0,
      maxAge: 0,
      minAge: 0,
    },
    validators: {
      onSubmit: ({ formApi, value }) => {
        try {
          EventSchema.parse(value)
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

    onSubmit: ({ value, formApi }) =>
      startTransition(async () => {
        try {
          const response: any = await submitForm({
            variables: {
              input: isUpdate
                ? {
                    _id: props._id,
                    ...value,
                    minAge: value.minAge == 0 ? null : value.minAge,
                    maxAge: value.maxAge == 0 ? null : value.maxAge,
                    earlyBirdPricePerPlayer: tournaments.find(
                      (t: { value: string; hasEarlyBird: boolean }) =>
                        t.value === value.tournament
                    )?.hasEarlyBird
                      ? value.earlyBirdPricePerPlayer
                      : null,
                  }
                : { ...value,
                   maxEntries: value.maxEntries == 0 ? null : value.maxEntries,
                 },
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
      const {
        name,
        gender,
        type,
        location,
        pricePerPlayer,
        earlyBirdPricePerPlayer,
        currency,
        tournament,
        maxEntries,
        minAge,
        maxAge,
      } = data.event
      form.setFieldValue("name", name)
      form.setFieldValue("gender", gender)
      form.setFieldValue("type", type)
      form.setFieldValue("location", location)
      form.setFieldValue("currency", currency)
      form.setFieldValue("pricePerPlayer", pricePerPlayer || 0)
      form.setFieldValue(
        "earlyBirdPricePerPlayer",
        earlyBirdPricePerPlayer || 0
      )
      form.setFieldValue("maxEntries", maxEntries === null ? 0 : maxEntries)
      form.setFieldValue("tournament", tournament._id)
      form.setFieldValue("maxEntries", maxEntries || 0)
      form.setFieldValue("minAge", minAge || 0)
      form.setFieldValue("maxAge", maxAge || 0)
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
              Add Event
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
              {isUpdate ? "Edit Event" : "Create Event"}
            </DialogTitle>
            <DialogDescription>
              {isUpdate
                ? "Update existing event details."
                : "Create a new event in the system."}
            </DialogDescription>
          </DialogHeader>
          <form
            className="-mt-2 mb-2"
            id="event-form"
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
                    <TabsTrigger value="fees">Fees</TabsTrigger>
                    <TabsTrigger value="restrictions">Restrictions</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details">
                    <FieldSet className="flex flex-col gap-3 h-[48vh] overflow-y-auto">
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
                      <form.Field
                        name="tournament"
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                Tournament
                              </FieldLabel>
                              <Popover
                                open={openTournaments}
                                onOpenChange={setOpenTournaments}
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    id={field.name}
                                    name={field.name}
                                    disabled={optionsLoading}
                                    aria-expanded={openTournaments}
                                    onBlur={field.handleBlur}
                                    variant="outline"
                                    role="combobox"
                                    aria-invalid={isInvalid}
                                    className="w-full justify-between font-normal capitalize -mt-2"
                                    type="button"
                                  >
                                    {field.state.value
                                      ? tournaments.find(
                                          (o: {
                                            value: string
                                            label: string
                                            hasEarlyBird: boolean
                                          }) => o.value === field.state.value
                                        )?.label
                                      : "Select Tournament"}
                                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                  <Command
                                    filter={(value, search) =>
                                      tournaments
                                        .find(
                                          (t: {
                                            value: string
                                            label: string
                                          }) => t.value === value
                                        )
                                        ?.label.toLowerCase()
                                        .includes(search.toLowerCase())
                                        ? 1
                                        : 0
                                    }
                                  >
                                    <CommandInput placeholder="Select Tournament" />
                                    <CommandList className="max-h-72 overflow-y-auto">
                                      <CommandEmpty>
                                        No tournament found.
                                      </CommandEmpty>
                                      <CommandGroup>
                                        <Label className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
                                          Tournaments
                                        </Label>
                                        {tournaments?.map(
                                          (o: {
                                            value: string
                                            label: string
                                            hasEarlyBird: boolean
                                          }) => (
                                            <CommandItem
                                              key={o.value}
                                              value={o.value}
                                              onSelect={() => {
                                                field.handleChange(o.value)
                                                setOpenTournaments(false)
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
                                          )
                                        )}
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
                        name="type"
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>Type</FieldLabel>
                              <Select
                                name={field.name}
                                value={field.state.value}
                                onValueChange={field.handleChange}
                                disabled={loading}
                              >
                                <SelectTrigger
                                  aria-invalid={isInvalid}
                                  className="-mt-1 capitalize"
                                >
                                  <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {types.map(({ label, value }) => (
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
                        name="location"
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                Location
                              </FieldLabel>
                              <Select
                                name={field.name}
                                value={field.state.value}
                                onValueChange={field.handleChange}
                                disabled={loading}
                              >
                                <SelectTrigger
                                  aria-invalid={isInvalid}
                                  className="-mt-1 capitalize"
                                >
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  {locations.map(({ label, value }) => (
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
                    </FieldSet>
                  </TabsContent>
                  <TabsContent value="fees">
                    <FieldSet className="flex flex-col gap-3 h-[48vh] overflow-y-auto">
                      <form.Field
                        name="currency"
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                Currency
                              </FieldLabel>
                              <Select
                                name={field.name}
                                value={field.state.value}
                                onValueChange={field.handleChange}
                                disabled={loading}
                              >
                                <SelectTrigger
                                  aria-invalid={isInvalid}
                                  className={cn("-mt-1", "uppercase")}
                                >
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  {currencies.map(({ label, value }) => (
                                    <SelectItem
                                      className="uppercase"
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
                        name="pricePerPlayer"
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                Price Per Player{" "}
                                <HoverCard>
                                  <HoverCardTrigger className="inline-block -ml-1 hover:cursor-pointer">
                                    <Info className="size-3.25" />
                                  </HoverCardTrigger>
                                  <HoverCardContent
                                    className="p-2 text-xs w-56"
                                    side="right"
                                  >
                                    If doubles, registration fee price will be
                                    multiplied by 2.
                                  </HoverCardContent>
                                </HoverCard>
                              </FieldLabel>
                              <InputGroup className="-my-1">
                                {state.currency && (
                                  <InputGroupAddon>
                                    <span className="font-thin">
                                      {state.currency === "PHP"
                                        ? "₱"
                                        : state.currency === "USD"
                                        ? "$"
                                        : state.currency}
                                    </span>
                                  </InputGroupAddon>
                                )}
                                <InputGroupInput
                                  placeholder="Price Per Player"
                                  disabled={loading}
                                  id={field.name}
                                  name={field.name}
                                  value={field.state.value.toString()}
                                  onBlur={field.handleBlur}
                                  onChange={(e) =>
                                    field.handleChange(
                                      parseFloat(e.target.value)
                                    )
                                  }
                                  min={0}
                                  type="number"
                                  aria-invalid={isInvalid}
                                  step="any"
                                />
                              </InputGroup>
                              <FieldDescription className="text-xs">
                                Total:{" "}
                                <span className="font-medium">
                                  {state.currency === "PHP"
                                    ? "₱"
                                    : state.currency === "USD"
                                    ? "$"
                                    : state.currency}
                                  {(
                                    field.state.value *
                                    (state.type === "DOUBLES" ? 2 : 1)
                                  ).toFixed(2)}
                                </span>
                                {state.type === "DOUBLES" ? " (Doubles)" : ""}
                              </FieldDescription>
                              {isInvalid && (
                                <FieldError errors={field.state.meta.errors} />
                              )}
                            </Field>
                          )
                        }}
                      />
                      {state.tournament &&
                        tournaments.find(
                          (t: { value: string; hasEarlyBird: boolean }) =>
                            t.value === state.tournament
                        )?.hasEarlyBird && (
                          <>
                            <form.Field
                              name="earlyBirdPricePerPlayer"
                              children={(field) => {
                                const isInvalid =
                                  field.state.meta.isTouched &&
                                  !field.state.meta.isValid
                                return (
                                  <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>
                                      Early Bird Price Per Player{" "}
                                      <HoverCard>
                                        <HoverCardTrigger className="inline-block -ml-1 hover:cursor-pointer">
                                          <Info className="size-3.25" />
                                        </HoverCardTrigger>
                                        <HoverCardContent
                                          className="p-2 text-xs w-56"
                                          side="right"
                                        >
                                          If doubles, early bird registration
                                          fee price will be multiplied by 2.
                                        </HoverCardContent>
                                      </HoverCard>
                                    </FieldLabel>
                                    <InputGroup className="-my-1">
                                      {state.currency && (
                                        <InputGroupAddon>
                                          <span className="font-thin">
                                            {state.currency === "PHP"
                                              ? "₱"
                                              : state.currency === "USD"
                                              ? "$"
                                              : state.currency}
                                          </span>
                                        </InputGroupAddon>
                                      )}
                                      <InputGroupInput
                                        placeholder="Early Bird Price Per Player"
                                        disabled={loading}
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) =>
                                          field.handleChange(+e.target.value)
                                        }
                                        type="number"
                                        step="any"
                                        min={0}
                                        max={state.pricePerPlayer}
                                        aria-invalid={isInvalid}
                                      />
                                    </InputGroup>
                                    <FieldDescription className="text-xs">
                                      Total:{" "}
                                      <span className="font-medium">
                                        {state.currency === "PHP"
                                          ? "₱"
                                          : state.currency === "USD"
                                          ? "$"
                                          : state.currency}
                                        {(
                                          field.state.value *
                                          (state.type === "DOUBLES" ? 2 : 1)
                                        ).toFixed(2)}
                                      </span>
                                      {state.type === "DOUBLES"
                                        ? " (Doubles)"
                                        : ""}
                                    </FieldDescription>
                                    {isInvalid && (
                                      <FieldError
                                        errors={field.state.meta.errors}
                                      />
                                    )}
                                  </Field>
                                )
                              }}
                            />
                          </>
                        )}
                    </FieldSet>
                  </TabsContent>
                  <TabsContent value="restrictions">
                    <FieldSet className="flex flex-col gap-3 h-[48vh] overflow-y-auto">
                      <form.Field
                        name="maxEntries"
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                Max Entries{" "}
                                <HoverCard>
                                  <HoverCardTrigger className="inline-block -ml-1 hover:cursor-pointer">
                                    <Info className="size-3.25" />
                                  </HoverCardTrigger>
                                  <HoverCardContent
                                    className="p-2 text-xs w-56"
                                    side="right"
                                  >
                                    Maximum number of entries allowed for this
                                    event. (Set: 0 for unlimited)
                                  </HoverCardContent>
                                </HoverCard>
                              </FieldLabel>
                              <InputGroup className="-my-1">
                                <InputGroupInput
                                  placeholder="Max Entries"
                                  disabled={loading}
                                  id={field.name}
                                  name={field.name}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) =>
                                    field.handleChange(+e.target.value)
                                  }
                                  type="number"
                                  min={0}
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
                        name="maxAge"
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                Maximum Age
                                <HoverCard>
                                  <HoverCardTrigger className="inline-block -ml-1 hover:cursor-pointer">
                                    <Info className="size-3.25" />
                                  </HoverCardTrigger>
                                  <HoverCardContent
                                    className="p-2 text-xs w-56"
                                    side="right"
                                  >
                                    Set: 0 for no minimum age restriction
                                  </HoverCardContent>
                                </HoverCard>
                              </FieldLabel>
                              <InputGroup className="-my-1">
                                <InputGroupInput
                                  placeholder="Minimum Age"
                                  disabled={loading}
                                  id={field.name}
                                  name={field.name}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) =>
                                    field.handleChange(+e.target.value)
                                  }
                                  type="number"
                                  min={0}
                                  aria-invalid={isInvalid}
                                />
                                <InputGroupAddon
                                  align="inline-end"
                                  className="w-28 px-0 text-center"
                                >
                                  years old
                                </InputGroupAddon>
                              </InputGroup>

                              {isInvalid && (
                                <FieldError errors={field.state.meta.errors} />
                              )}
                            </Field>
                          )
                        }}
                      />
                      <form.Field
                        name="minAge"
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                Minimum Age
                                <HoverCard>
                                  <HoverCardTrigger className="inline-block -ml-1 hover:cursor-pointer">
                                    <Info className="size-3.25" />
                                  </HoverCardTrigger>
                                  <HoverCardContent
                                    className="p-2 text-xs w-56"
                                    side="right"
                                  >
                                    Set: 0 for no maximum age restriction
                                  </HoverCardContent>
                                </HoverCard>
                              </FieldLabel>
                              <InputGroup className="-my-1">
                                <InputGroupInput
                                  placeholder="Maximum Age"
                                  disabled={loading}
                                  id={field.name}
                                  name={field.name}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) =>
                                    field.handleChange(+e.target.value)
                                  }
                                  type="number"
                                  min={0}
                                  aria-invalid={isInvalid}
                                />
                                <InputGroupAddon
                                  align="inline-end"
                                  className="w-28 px-0 text-center"
                                >
                                  years old
                                </InputGroupAddon>
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
              form="event-form"
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

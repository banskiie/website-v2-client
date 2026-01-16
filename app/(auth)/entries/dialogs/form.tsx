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
import { CreateEntrySchema } from "@/validators/entry.validator"
import { gql } from "@apollo/client"
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react"
import { useForm } from "@tanstack/react-form"
import React, { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  CalendarIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  CirclePlus,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventGender, EventType } from "@/types/event.interface"
import { Checkbox } from "@/components/ui/checkbox"
import { JerseySize } from "@/types/jersey.interface"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"

const ENTRY = gql`
  query Entry($_id: ID!) {
    entry(_id: $_id) {
      _id
      entryNumber
      entryKey
      club
      isInSoftware
      isEarlyBird
      statuses {
        status
        date
        reason
        by {
          name
        }
      }
      event {
        _id
        tournament {
          _id
        }
      }
      player1Entry {
        firstName
        middleName
        lastName
        suffix
        gender
        birthDate
        email
        phoneNumber
        jerseySize
      }
      connectedPlayer1 {
        _id
      }
      player2Entry {
        firstName
        middleName
        lastName
        suffix
        gender
        birthDate
        email
        phoneNumber
        jerseySize
      }
      connectedPlayer2 {
        _id
      }
    }
  }
`

const CREATE = gql`
  mutation CreateEntry($input: CreateEntryInput!) {
    createEntry(input: $input) {
      ok
      message
    }
  }
`

const UPDATE = gql`
  mutation UpdateEntry($input: UpdateEntryInput!) {
    updateEntry(input: $input) {
      ok
      message
    }
  }
`

const OPTIONS = gql`
  query Options {
    tournamentOptions {
      label
      value
      hasEarlyBird
      earlyBirdRegistrationEnd
    }
    playerOptions {
      label
      value
    }
  }
`

const EVENT_OPTIONS_BY_TOURNAMENT = gql`
  query Options($tournamentId: ID!) {
    eventOptionsByTournament(tournamentId: $tournamentId) {
      label
      value
      type
      gender
    }
  }
`

const PLAYER = gql`
  query Player($_id: ID!) {
    player(_id: $_id) {
      _id
      firstName
      middleName
      lastName
      suffix
      email
      phoneNumber
      birthDate
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
  const { data, loading: fetchLoading }: any = useQuery(ENTRY, {
    variables: { _id: props._id },
    skip: !open || !isUpdate,
    fetchPolicy: "no-cache",
  })
  const entry = data?.entry
  // Mutation hook
  const [submitForm] = useMutation(isUpdate ? UPDATE : CREATE)
  const [fetchPlayer, { data: playerData, loading: playerLoading }] =
    useLazyQuery(PLAYER, {
      fetchPolicy: "no-cache",
    })

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
  // Player Options
  const [openPlayers, setOpenPlayers] = useState(false)
  const players = optionsData?.playerOptions || []
  // Fetch Player
  // Event Options by Tournament
  const [tournamentId, setTournamentId] = useState<string | null>(null)
  const [openEvents, setOpenEvents] = useState(false)
  const { data: eventOptionsData, loading: eventOptionsLoading }: any =
    useQuery(EVENT_OPTIONS_BY_TOURNAMENT, {
      skip: !tournamentId,
      fetchPolicy: "no-cache",
      variables: { tournamentId },
    })
  const events = eventOptionsData?.eventOptionsByTournament || []
  // Jersey Size Options
  const [openJerseySizes, setOpenJerseySizes] = useState(false)
  const jerseySizes = Object.values(JerseySize).map((size) => ({
    label: size,
    value: size,
  }))
  // Gender Options
  const [openGenders, setOpenGenders] = useState(false)
  const genders = Object.values(Gender).map((gender) => ({
    label: gender.toLocaleLowerCase().replaceAll("_", " "),
    value: gender,
  }))
  // Combined loading state
  const isLoading =
    isPending || optionsLoading || eventOptionsLoading || fetchLoading

  const form = useForm({
    defaultValues: {
      tournament: entry?.event?.tournament?._id || "",
      event: entry?.event?._id || "",
      club: entry?.club || "",
      player1Entry: {
        firstName: entry?.player1Entry?.firstName || "",
        middleName: entry?.player1Entry?.middleName || "",
        lastName: entry?.player1Entry?.lastName || "",
        suffix: entry?.player1Entry?.suffix || "",
        email: entry?.player1Entry?.email || "",
        phoneNumber: entry?.player1Entry?.phoneNumber || "",
        birthDate: entry?.player1Entry?.birthDate
          ? new Date(entry?.player1Entry.birthDate)
          : new Date(),
        gender: entry?.player1Entry?.gender || Gender.MALE,
        jerseySize: entry?.player1Entry?.jerseySize || "M",
      },
      player2Entry: {
        firstName: entry?.player2Entry?.firstName || "",
        middleName: entry?.player2Entry?.middleName || "",
        lastName: entry?.player2Entry?.lastName || "",
        suffix: entry?.player2Entry?.suffix || "",
        email: entry?.player2Entry?.email || "",
        phoneNumber: entry?.player2Entry?.phoneNumber || "",
        birthDate: entry?.player2Entry?.birthDate
          ? new Date(entry?.player2Entry.birthDate)
          : new Date(),
        gender: entry?.player2Entry?.gender || Gender.MALE,
        jerseySize: entry?.player2Entry?.jerseySize || "M",
      },
      connectedPlayer1: entry?.connectedPlayer1?._id || null,
      connectedPlayer2: entry?.connectedPlayer2?._id || null,
      isInSoftware: entry?.isInSoftware || false,
      isEarlyBird: entry?.isEarlyBird || false,
      ...(isUpdate ? {} : { isPlayer1New: false, isPlayer2New: false }),
    },
    validators: {
      onSubmit: ({ formApi, value: payload }) => {
        try {
          const event = events.find(
            (e: { value: string }) => e.value === payload.event
          )
          const isDoubles = event?.type === EventType.DOUBLES
          const { tournament, ...modifiedPayload } = {
            ...payload,
            player2Entry: isDoubles ? payload.player2Entry : null,
          }
          CreateEntrySchema.parse(modifiedPayload)
        } catch (error: any) {
          console.error(error)
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
      onChange: async ({ formApi, fieldApi }) => {
        const fieldName = fieldApi.name
        const fieldValue = fieldApi.state.value

        switch (fieldName) {
          case "tournament":
            if (fieldValue === "") {
              setTournamentId(null)
              formApi.resetField("event")
            } else {
              setTournamentId(fieldValue as string)
              const { hasEarlyBird, earlyBirdRegistrationEnd } =
                tournaments.find(
                  (t: {
                    value: string
                    label: string
                    hasEarlyBird: boolean
                    earlyBirdRegistrationEnd: Date
                  }) => t.value === fieldValue
                )
              const isEarlyBird =
                hasEarlyBird &&
                earlyBirdRegistrationEnd &&
                new Date() <= new Date(earlyBirdRegistrationEnd)
              formApi.setFieldValue("isEarlyBird", isEarlyBird)
              formApi.resetField("event")
            }
            break
          case "connectedPlayer1":
            if (fieldValue) {
              await fetchPlayer({
                variables: { _id: fieldValue },
              }).then((r: any) => {
                const player1 = r.data.player
                formApi.setFieldValue("player1Entry", {
                  firstName: player1.firstName,
                  middleName: player1.middleName,
                  lastName: player1.lastName,
                  suffix: player1.suffix,
                  email: player1.email,
                  phoneNumber: player1.phoneNumber,
                  birthDate: new Date(player1.birthDate),
                  gender: player1.gender,
                  jerseySize: "M",
                })
              })
            } else {
              formApi.setFieldValue("player1Entry", {
                firstName: "",
                middleName: "",
                lastName: "",
                suffix: "",
                email: "",
                phoneNumber: "",
                birthDate: new Date(),
                gender: Gender.MALE,
                jerseySize: "M",
              })
            }
            break
          case "isPlayer1New":
            if (fieldValue) {
              formApi.setFieldValue("connectedPlayer1", null)
            } else {
              formApi.resetField("connectedPlayer1")
            }
            break
          case "connectedPlayer2":
            if (fieldValue) {
              await fetchPlayer({
                variables: { _id: fieldValue },
              }).then((r: any) => {
                const player2 = r.data.player
                formApi.setFieldValue("player2Entry", {
                  firstName: player2.firstName,
                  middleName: player2.middleName,
                  lastName: player2.lastName,
                  suffix: player2.suffix,
                  email: player2.email,
                  phoneNumber: player2.phoneNumber,
                  birthDate: new Date(player2.birthDate),
                  gender: player2.gender,
                  jerseySize: "M",
                })
              })
            } else {
              formApi.setFieldValue("player2Entry", {
                firstName: "",
                middleName: "",
                lastName: "",
                suffix: "",
                email: "",
                phoneNumber: "",
                birthDate: new Date(),
                gender: Gender.MALE,
                jerseySize: "M",
              })
            }
            break
          case "isPlayer2New":
            if (fieldValue) {
              formApi.setFieldValue("connectedPlayer2", null)
            } else {
              formApi.resetField("connectedPlayer2")
            }
            break
        }
      },
    }, // this is just for demo purposes
    onSubmit: ({ value: payload, formApi }) =>
      startTransition(async () => {
        try {
          const event = events.find(
            (e: { value: string }) => e.value === payload.event
          )
          const isDoubles = event?.type === EventType.DOUBLES
          const { tournament, ...modifiedPayload } = {
            ...payload,
            player2Entry: isDoubles ? payload.player2Entry : null,
          }
          const response: any = await submitForm({
            variables: {
              input: isUpdate
                ? { _id: props._id, ...modifiedPayload }
                : { ...modifiedPayload },
            },
          })
          if (response) onClose()
        } catch (error: any) {
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

  // Set tournamentId when data is fetched
  useEffect(() => {
    if (data && !tournamentId) {
      setTournamentId(data.entry.event.tournament._id)
    }
  }, [data, tournamentId])

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
            Add Entry
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>{isUpdate ? "Edit Entry" : "Create Entry"}</DialogTitle>
          <DialogDescription>
            {isUpdate
              ? "Update existing entry details."
              : "Create a new entry in the system."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="-mt-2 mb-2"
          id="entry-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <form.Subscribe
            selector={(state) => state.values}
            children={(state) => (
              <Tabs defaultValue="details" className="">
                <TabsList
                  className={cn(
                    "w-full -mt-2 mb-1",
                    (() => {
                      if (state.event) {
                        const event = events.find(
                          (e: { value: string }) => e.value === state.event
                        )
                        if (event?.type === EventType.DOUBLES)
                          return "grid grid-cols-3"
                        else return "grid grid-cols-2"
                      } else {
                        return "flex"
                      }
                    })()
                  )}
                >
                  <TabsTrigger value="details">Details</TabsTrigger>
                  {(() => {
                    if (state.event) {
                      const event = events.find(
                        (e: { value: string }) => e.value === state.event
                      )
                      if (event?.type === EventType.DOUBLES)
                        return (
                          <>
                            <TabsTrigger value="player1">Player 1</TabsTrigger>
                            <TabsTrigger value="player2">Player 2</TabsTrigger>
                          </>
                        )
                      else
                        return (
                          <TabsTrigger value="player1">Player 1</TabsTrigger>
                        )
                    }
                  })()}
                </TabsList>
                <TabsContent value="details">
                  <FieldSet className="flex flex-col gap-3 h-[52vh] overflow-y-auto">
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
                                        (t: { value: string; label: string }) =>
                                          t.value === value
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
                                            onSelect={(v) => {
                                              field.handleChange(v.toString())
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
                      name="event"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Event</FieldLabel>
                            <Popover
                              open={openEvents}
                              onOpenChange={setOpenEvents}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  id={field.name}
                                  name={field.name}
                                  disabled={
                                    eventOptionsLoading || !state.tournament
                                  }
                                  aria-expanded={openEvents}
                                  onBlur={field.handleBlur}
                                  variant="outline"
                                  role="combobox"
                                  aria-invalid={isInvalid}
                                  className="w-full justify-between font-normal capitalize -mt-2 h-fit"
                                  type="button"
                                >
                                  {field.state.value ? (
                                    <div>
                                      {(() => {
                                        const selectedEvent = events.find(
                                          (o: {
                                            value: string
                                            label: string
                                            gender: EventGender
                                            type: EventType
                                          }) => o.value === field.state.value
                                        )
                                        return (
                                          <div className="w-full flex flex-col items-start">
                                            <span>{selectedEvent?.label}</span>
                                            <span className="block text-xs text-muted-foreground capitalize">
                                              {selectedEvent?.gender.toLocaleLowerCase()}{" "}
                                              (
                                              {selectedEvent?.type.toLowerCase()}
                                              )
                                            </span>
                                          </div>
                                        )
                                      })()}
                                    </div>
                                  ) : (
                                    "Select Event"
                                  )}
                                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command
                                  filter={(value, search) =>
                                    events
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
                                  <CommandInput placeholder="Select Event" />
                                  <CommandList className="max-h-72 overflow-y-auto">
                                    <CommandEmpty>No event found.</CommandEmpty>
                                    <CommandGroup>
                                      <Label className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
                                        Events
                                      </Label>
                                      {events?.map(
                                        (o: {
                                          value: string
                                          label: string
                                          gender: EventGender
                                          type: EventType
                                        }) => (
                                          <CommandItem
                                            key={o.value}
                                            value={o.value}
                                            onSelect={(v) => {
                                              field.handleChange(v.toString())
                                              setOpenEvents(false)
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
                                            <div>
                                              <span className="block">
                                                {o.label}
                                              </span>
                                              <span className="block text-xs text-muted-foreground capitalize">
                                                {o.gender.toLocaleLowerCase()} (
                                                {o.type.toLowerCase()})
                                              </span>
                                            </div>
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
                      name="club"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              Club Name
                            </FieldLabel>
                            <InputGroup className="-mt-1.5">
                              <InputGroupInput
                                placeholder="Name"
                                disabled={isLoading}
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
                      name="isEarlyBird"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field
                            className="px-1 py-3 border rounded-md"
                            data-invalid={isInvalid}
                          >
                            <div className="flex items-center">
                              <Checkbox
                                id={field.name}
                                name={field.name}
                                checked={field.state.value}
                                onBlur={field.handleBlur}
                                onCheckedChange={(checked) =>
                                  field.handleChange(checked === true)
                                }
                                className="mx-2"
                                aria-invalid={isInvalid}
                                disabled={isLoading}
                              />
                              <div className="grid">
                                <FieldLabel htmlFor={field.name}>
                                  Early Bird
                                </FieldLabel>
                                <span className="text-muted-foreground text-xs">
                                  Indicates if the entry qualifies for early
                                  bird.
                                </span>
                              </div>
                            </div>
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    />
                  </FieldSet>
                </TabsContent>
                <TabsContent value="player1">
                  <FieldSet className="grid grid-cols-2 place-content-start justify-start gap-3 h-[52vh] overflow-y-auto">
                    {!isUpdate && (
                      <div className="col-span-2 p-3 flex flex-col gap-2.5 border rounded-md">
                        <form.Field
                          name="isPlayer1New"
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            return (
                              <Field data-invalid={isInvalid}>
                                <div className="flex items-center">
                                  <Checkbox
                                    id={field.name}
                                    name={field.name}
                                    checked={field.state.value}
                                    onBlur={field.handleBlur}
                                    onCheckedChange={(checked) =>
                                      field.handleChange(checked === true)
                                    }
                                    className="mr-2"
                                    aria-invalid={isInvalid}
                                    disabled={isLoading}
                                  />
                                  <div className="grid">
                                    <FieldLabel htmlFor={field.name}>
                                      Is New Player? (Player 1)
                                    </FieldLabel>
                                    <span className="text-muted-foreground text-xs">
                                      Checking this will create a new player
                                      profile.
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

                        {!state.isPlayer1New && (
                          <form.Field
                            name="connectedPlayer1"
                            children={(field) => {
                              const isInvalid =
                                field.state.meta.isTouched &&
                                !field.state.meta.isValid
                              return (
                                <Field data-invalid={isInvalid}>
                                  <FieldLabel htmlFor={field.name}>
                                    Connected Player 1
                                  </FieldLabel>
                                  <Popover
                                    open={openPlayers}
                                    onOpenChange={setOpenPlayers}
                                  >
                                    <PopoverTrigger asChild>
                                      <Button
                                        id={field.name}
                                        name={field.name}
                                        disabled={
                                          optionsLoading || playerLoading
                                        }
                                        aria-expanded={openPlayers}
                                        onBlur={field.handleBlur}
                                        variant="outline"
                                        role="combobox"
                                        aria-invalid={isInvalid}
                                        className={cn(
                                          "w-full justify-between font-normal capitalize -mt-2",
                                          !field.state.value &&
                                          "text-muted-foreground"
                                        )}
                                        type="button"
                                      >
                                        {field.state.value
                                          ? players.find(
                                            (o: {
                                              value: string
                                              label: string
                                              hasEarlyBird: boolean
                                            }) =>
                                              o.value === field.state.value
                                          )?.label
                                          : "Select Player"}
                                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                      <Command
                                        filter={(value, search) =>
                                          players
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
                                        <CommandInput placeholder="Select Player" />
                                        <CommandList className="max-h-72 overflow-y-auto">
                                          <CommandEmpty>
                                            No player found.
                                          </CommandEmpty>
                                          <CommandGroup>
                                            <Label className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
                                              Players
                                            </Label>
                                            {players?.map(
                                              (o: {
                                                value: string
                                                label: string
                                                hasEarlyBird: boolean
                                              }) => (
                                                <CommandItem
                                                  key={o.value}
                                                  value={o.value}
                                                  onSelect={(v) => {
                                                    field.handleChange(
                                                      v.toString()
                                                    )
                                                    setOpenPlayers(false)
                                                  }}
                                                  className="capitalize"
                                                >
                                                  <CheckIcon
                                                    className={cn(
                                                      "h-4 w-4",
                                                      field.state.value ===
                                                        o.value
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
                                    <FieldError
                                      errors={field.state.meta.errors}
                                    />
                                  )}
                                </Field>
                              )
                            }}
                          />
                        )}
                      </div>
                    )}

                    <form.Field
                      name="player1Entry.firstName"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              First Name
                            </FieldLabel>
                            <InputGroup className="-mt-1.5">
                              <InputGroupInput
                                placeholder="Name"
                                disabled={isLoading}
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
                      name="player1Entry.middleName"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              Middle Name
                            </FieldLabel>
                            <InputGroup className="-mt-1.5">
                              <InputGroupInput
                                placeholder="Name"
                                disabled={isLoading}
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

                    <div className="col-span-2 flex gap-3">
                      <form.Field
                        name="player1Entry.lastName"
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                Last Name
                              </FieldLabel>
                              <InputGroup className="-mt-1.5">
                                <InputGroupInput
                                  placeholder="Name"
                                  disabled={isLoading}
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
                        name="player1Entry.suffix"
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid} className="w-24">
                              <FieldLabel htmlFor={field.name}>Ext.</FieldLabel>
                              <InputGroup className="-mt-1.5">
                                <InputGroupInput
                                  placeholder="Ext."
                                  disabled={isLoading}
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
                    </div>
                    <form.Field
                      name="player1Entry.birthDate"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel
                              id="p1-birth-date"
                              htmlFor="p1-birth-date"
                            >
                              Birth Date
                            </FieldLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  id="p1-birth-date"
                                  name="p1-birth-date"
                                  variant="outline"
                                  data-empty={!field.state.value}
                                  className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal flex -my-1.5"
                                  disabled={isLoading}
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
                      name="player1Entry.gender"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Gender</FieldLabel>
                            <Popover
                              open={openGenders}
                              onOpenChange={setOpenGenders}
                              modal
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  id={field.name}
                                  name={field.name}
                                  disabled={isLoading}
                                  aria-expanded={openGenders}
                                  onBlur={field.handleBlur}
                                  variant="outline"
                                  role="combobox"
                                  aria-invalid={isInvalid}
                                  className="w-full justify-between font-normal capitalize -mt-2"
                                  type="button"
                                >
                                  {field.state.value
                                    ? genders.find(
                                      (o) => o.value === field.state.value
                                    )?.label
                                    : "Select Gender"}
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
                                    <CommandEmpty>
                                      No gennder found.
                                    </CommandEmpty>
                                    <CommandGroup>
                                      <Label className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
                                        Gender
                                      </Label>
                                      {genders?.map((o) => (
                                        <CommandItem
                                          key={o.value}
                                          value={o.value}
                                          onSelect={(v) => {
                                            field.handleChange(v as Gender)
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

                    <form.Field
                      name="player1Entry.phoneNumber"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              Phone No.
                            </FieldLabel>
                            <InputGroup className="-mt-1.5">
                              <InputGroupInput
                                placeholder="Phone No."
                                disabled={isLoading}
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
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
                      name="player1Entry.jerseySize"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              Jersey Size
                            </FieldLabel>
                            <Popover
                              open={openJerseySizes}
                              onOpenChange={setOpenJerseySizes}
                              modal
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  id={field.name}
                                  name={field.name}
                                  disabled={isLoading}
                                  aria-expanded={openJerseySizes}
                                  onBlur={field.handleBlur}
                                  variant="outline"
                                  role="combobox"
                                  aria-invalid={isInvalid}
                                  className="w-full justify-between font-normal capitalize -mt-2"
                                  type="button"
                                >
                                  {field.state.value
                                    ? jerseySizes.find(
                                      (o) => o.value === field.state.value
                                    )?.label
                                    : "Select Jersey Size"}
                                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command
                                  filter={(value, search) =>
                                    jerseySizes
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
                                    <CommandEmpty>
                                      No jersey size found.
                                    </CommandEmpty>
                                    <CommandGroup>
                                      <Label className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
                                        Jersey Sizes
                                      </Label>
                                      {jerseySizes?.map((o) => (
                                        <CommandItem
                                          key={o.value}
                                          value={o.value}
                                          onSelect={(v) => {
                                            field.handleChange(v as JerseySize)
                                            setOpenJerseySizes(false)
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
                      name="player1Entry.email"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field
                            className="col-span-2"
                            data-invalid={isInvalid}
                          >
                            <FieldLabel htmlFor={field.name}>
                              Email Address
                            </FieldLabel>
                            <InputGroup className="-mt-1.5">
                              <InputGroupInput
                                placeholder="Email Address"
                                disabled={isLoading}
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
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
                  </FieldSet>
                </TabsContent>
                <TabsContent value="player2">
                  <FieldSet className="grid grid-cols-2 place-content-start justify-start gap-3 h-[52vh] overflow-y-auto">
                    {!isUpdate && (
                      <div className="col-span-2 p-3 flex flex-col gap-2.5 border rounded-md">
                        <form.Field
                          name="isPlayer2New"
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            return (
                              <Field data-invalid={isInvalid}>
                                <div className="flex items-center">
                                  <Checkbox
                                    id={field.name}
                                    name={field.name}
                                    checked={field.state.value}
                                    onBlur={field.handleBlur}
                                    onCheckedChange={(checked) =>
                                      field.handleChange(checked === true)
                                    }
                                    className="mr-2"
                                    aria-invalid={isInvalid}
                                    disabled={isLoading}
                                  />
                                  <div className="grid">
                                    <FieldLabel htmlFor={field.name}>
                                      Is New Player? (Player 2)
                                    </FieldLabel>
                                    <span className="text-muted-foreground text-xs">
                                      Checking this will create a new player
                                      profile.
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
                        {!state.isPlayer2New && (
                          <form.Field
                            name="connectedPlayer2"
                            children={(field) => {
                              const isInvalid =
                                field.state.meta.isTouched &&
                                !field.state.meta.isValid
                              return (
                                <Field data-invalid={isInvalid}>
                                  <FieldLabel htmlFor={field.name}>
                                    Connected Player 2
                                  </FieldLabel>
                                  <Popover
                                    open={openPlayers}
                                    onOpenChange={setOpenPlayers}
                                  >
                                    <PopoverTrigger asChild>
                                      <Button
                                        id={field.name}
                                        name={field.name}
                                        disabled={
                                          optionsLoading || playerLoading
                                        }
                                        aria-expanded={openPlayers}
                                        onBlur={field.handleBlur}
                                        variant="outline"
                                        role="combobox"
                                        aria-invalid={isInvalid}
                                        className={cn(
                                          "w-full justify-between font-normal capitalize -mt-2",
                                          !field.state.value &&
                                          "text-muted-foreground"
                                        )}
                                        type="button"
                                      >
                                        {field.state.value
                                          ? players.find(
                                            (o: {
                                              value: string
                                              label: string
                                              hasEarlyBird: boolean
                                            }) =>
                                              o.value === field.state.value
                                          )?.label
                                          : "Select Player"}
                                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                      <Command
                                        filter={(value, search) =>
                                          players
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
                                        <CommandInput placeholder="Select Player" />
                                        <CommandList className="max-h-72 overflow-y-auto">
                                          <CommandEmpty>
                                            No player found.
                                          </CommandEmpty>
                                          <CommandGroup>
                                            <Label className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
                                              Players
                                            </Label>
                                            {players?.map(
                                              (o: {
                                                value: string
                                                label: string
                                                hasEarlyBird: boolean
                                              }) => (
                                                <CommandItem
                                                  key={o.value}
                                                  value={o.value}
                                                  onSelect={(v) => {
                                                    field.handleChange(
                                                      v.toString()
                                                    )
                                                    setOpenPlayers(false)
                                                  }}
                                                  className="capitalize"
                                                >
                                                  <CheckIcon
                                                    className={cn(
                                                      "h-4 w-4",
                                                      field.state.value ===
                                                        o.value
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
                                    <FieldError
                                      errors={field.state.meta.errors}
                                    />
                                  )}
                                </Field>
                              )
                            }}
                          />
                        )}
                      </div>
                    )}

                    <form.Field
                      name="player2Entry.firstName"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              First Name
                            </FieldLabel>
                            <InputGroup className="-mt-1.5">
                              <InputGroupInput
                                placeholder="Name"
                                disabled={isLoading}
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
                      name="player2Entry.middleName"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              Middle Name
                            </FieldLabel>
                            <InputGroup className="-mt-1.5">
                              <InputGroupInput
                                placeholder="Name"
                                disabled={isLoading}
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

                    <div className="col-span-2 flex gap-3">
                      <form.Field
                        name="player2Entry.lastName"
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                Last Name
                              </FieldLabel>
                              <InputGroup className="-mt-1.5">
                                <InputGroupInput
                                  placeholder="Name"
                                  disabled={isLoading}
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
                        name="player2Entry.suffix"
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid} className="w-24">
                              <FieldLabel htmlFor={field.name}>Ext.</FieldLabel>
                              <InputGroup className="-mt-1.5">
                                <InputGroupInput
                                  placeholder="Ext."
                                  disabled={isLoading}
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
                    </div>
                    <form.Field
                      name="player2Entry.birthDate"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel
                              id="p1-birth-date"
                              htmlFor="p1-birth-date"
                            >
                              Birth Date
                            </FieldLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  id="p1-birth-date"
                                  name="p1-birth-date"
                                  variant="outline"
                                  data-empty={!field.state.value}
                                  className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal flex -my-1.5"
                                  disabled={isLoading}
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
                      name="player2Entry.gender"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Gender</FieldLabel>
                            <Popover
                              open={openGenders}
                              onOpenChange={setOpenGenders}
                              modal
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  id={field.name}
                                  name={field.name}
                                  disabled={isLoading}
                                  aria-expanded={openGenders}
                                  onBlur={field.handleBlur}
                                  variant="outline"
                                  role="combobox"
                                  aria-invalid={isInvalid}
                                  className="w-full justify-between font-normal capitalize -mt-2"
                                  type="button"
                                >
                                  {field.state.value
                                    ? genders.find(
                                      (o) => o.value === field.state.value
                                    )?.label
                                    : "Select Gender"}
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
                                    <CommandEmpty>
                                      No gender found.
                                    </CommandEmpty>
                                    <CommandGroup>
                                      <Label className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
                                        Gender
                                      </Label>
                                      {genders?.map((o) => (
                                        <CommandItem
                                          key={o.value}
                                          value={o.value}
                                          onSelect={(v) => {
                                            field.handleChange(v as Gender)
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

                    <form.Field
                      name="player2Entry.phoneNumber"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              Phone No.
                            </FieldLabel>
                            <InputGroup className="-mt-1.5">
                              <InputGroupInput
                                placeholder="Phone No."
                                disabled={isLoading}
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
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
                      name="player2Entry.jerseySize"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              Jersey Size
                            </FieldLabel>
                            <Popover
                              open={openJerseySizes}
                              onOpenChange={setOpenJerseySizes}
                              modal
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  id={field.name}
                                  name={field.name}
                                  disabled={isLoading}
                                  aria-expanded={openJerseySizes}
                                  onBlur={field.handleBlur}
                                  variant="outline"
                                  role="combobox"
                                  aria-invalid={isInvalid}
                                  className="w-full justify-between font-normal capitalize -mt-2"
                                  type="button"
                                >
                                  {field.state.value
                                    ? jerseySizes.find(
                                      (o) => o.value === field.state.value
                                    )?.label
                                    : "Select Jersey Size"}
                                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command
                                  filter={(value, search) =>
                                    jerseySizes
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
                                    <CommandEmpty>
                                      No jersey size found.
                                    </CommandEmpty>
                                    <CommandGroup>
                                      <Label className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
                                        Jersey Sizes
                                      </Label>
                                      {jerseySizes?.map((o) => (
                                        <CommandItem
                                          key={o.value}
                                          value={o.value}
                                          onSelect={(v) => {
                                            field.handleChange(v as JerseySize)
                                            setOpenJerseySizes(false)
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
                      name="player2Entry.email"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field
                            className="col-span-2"
                            data-invalid={isInvalid}
                          >
                            <FieldLabel htmlFor={field.name}>
                              Email Address
                            </FieldLabel>
                            <InputGroup className="-mt-1.5">
                              <InputGroupInput
                                placeholder="Email Address"
                                disabled={isLoading}
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
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
            loading={isLoading}
            type="submit"
            form="entry-form"
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FormDialog

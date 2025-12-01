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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventGender, EventType } from "@/types/event.interface"
import { Checkbox } from "@/components/ui/checkbox"
import { JerseySize } from "@/types/jersey.interface"

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
        firstName
        middleName
        lastName
        suffix
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
      connectedPlayer1 {
        firstName
        middleName
        lastName
        suffix
        gender
        birthDate
        email
        phoneNumber
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
  // Mutation hook
  const [submitForm] = useMutation(isUpdate ? UPDATE : CREATE)
  // Combined loading state
  const isLoading =
    // isUpdate ?
    isPending
  // || fetchLoading : false
  // Tournament Options
  const [openTournaments, setOpenTournaments] = useState(false)
  const { data: optionsData, loading: tournamentOptionsLoading }: any =
    useQuery(OPTIONS, {
      skip: !open,
      fetchPolicy: "no-cache",
    })
  const tournaments = optionsData?.tournamentOptions || []
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
  // Combined loading state
  const loading =
    isPending || tournamentOptionsLoading || eventOptionsLoading || fetchLoading

  const form = useForm({
    defaultValues: {
      tournament: "",
      event: "",
      club: "",
      player1Entry: {
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        email: "",
        phoneNumber: "",
        birthDate: new Date(),
        gender: Gender.MALE,
        jerseySize: "M",
      },
      player2Entry: {
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        email: "",
        phoneNumber: "",
        birthDate: new Date(),
        gender: Gender.MALE,
        jerseySize: "M",
      },
      connectedPlayer1: null as string | null,
      connectedPlayer2: null as string | null,
      isInSoftware: false,
      isEarlyBird: false,
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

          console.log("Validated Payload:", modifiedPayload)
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
      onChange: ({ formApi, fieldApi }) => {
        if (fieldApi.name === "tournament") {
          if (fieldApi.state.value === "") {
            setTournamentId(null)
            formApi.resetField("event")
          } else {
            setTournamentId(fieldApi.state.value as string)
            formApi.resetField("event")
          }
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
          console.error(error.errors)
          // if (error.name == "CombinedGraphQLErrors") {
          //   const fieldErrors = error.errors[0].extensions.fields
          //   if (fieldErrors)
          //     fieldErrors.map(
          //       ({ path, message }: { path: string; message: string }) =>
          //         formApi.fieldInfo[
          //           path as keyof typeof formApi.fieldInfo
          //         ].instance?.setErrorMap({
          //           onSubmit: { message },
          //         })
          //     )
          // }
        }
      }),
  })

  // Set tournamentId when data is fetched
  useEffect(() => {
    if (data && !tournamentId) {
      setTournamentId(data.entry.event.tournament._id)
    }
  }, [data, tournamentId])

  // Populate form when data is fetched
  useEffect(() => {
    if (data && tournamentId && events.length > 0) {
      const {
        event,
        club,
        player1Entry,
        player2Entry,
        connectedPlayer1,
        connectedPlayer2,
        isInSoftware,
        isEarlyBird,
      } = data.entry
      form.setFieldValue("tournament", event?.tournament._id.toString() || "")
      form.setFieldValue(
        "event",
        events.find((e: { value: string }) => e.value === event._id)
          ? event._id.toString()
          : ""
      )
      form.setFieldValue("club", club)
      form.setFieldValue("player1Entry.firstName", player1Entry.firstName)
      form.setFieldValue("player1Entry.middleName", player1Entry.middleName)
      form.setFieldValue("player1Entry.lastName", player1Entry.lastName)
      form.setFieldValue("player1Entry.suffix", player1Entry.suffix)
      form.setFieldValue("player1Entry.email", player1Entry.email)
      form.setFieldValue("player1Entry.phoneNumber", player1Entry.phoneNumber)
      form.setFieldValue(
        "player1Entry.birthDate",
        player1Entry.birthDate ? new Date(player1Entry.birthDate) : new Date()
      )
      form.setFieldValue("player1Entry.jerseySize", player1Entry.jerseySize)
      form.setFieldValue("player1Entry.gender", player1Entry.gender)

      form.setFieldValue(
        "player2Entry.firstName",
        player2Entry?.firstName || ""
      )
      form.setFieldValue(
        "player2Entry.middleName",
        player2Entry?.middleName || ""
      )
      form.setFieldValue("player2Entry.lastName", player2Entry?.lastName || "")
      form.setFieldValue("player2Entry.suffix", player2Entry?.suffix || "")
      form.setFieldValue("player2Entry.email", player2Entry?.email || "")
      form.setFieldValue(
        "player2Entry.phoneNumber",
        player2Entry?.phoneNumber || ""
      )
      form.setFieldValue(
        "player2Entry.birthDate",
        player2Entry?.birthDate ? new Date(player2Entry.birthDate) : new Date()
      )
      form.setFieldValue(
        "player2Entry.jerseySize",
        player2Entry?.jerseySize || "M"
      )
      form.setFieldValue("player2Entry.gender", player2Entry?.gender || "MALE")

      form.setFieldValue("connectedPlayer1", connectedPlayer1?._id || null)
      form.setFieldValue("connectedPlayer2", connectedPlayer2?._id || null)
      form.setFieldValue("isInSoftware", isInSoftware || false)
      form.setFieldValue("isEarlyBird", isEarlyBird || false)
    }
  }, [data, tournamentId, events])

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
                  <FieldSet className="flex flex-col gap-3 h-[48vh] overflow-y-auto">
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
                                  disabled={tournamentOptionsLoading}
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
                                <Command>
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
                                <Command>
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
                                disabled={loading}
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
                  <FieldSet className="flex flex-col gap-3 h-[48vh] overflow-y-auto">
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
                    </div>
                    <form.Field
                      name="player1Entry.email"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              Email Address
                            </FieldLabel>
                            <InputGroup className="-mt-1.5">
                              <InputGroupInput
                                placeholder="Email Address"
                                disabled={loading}
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
                      name="player1Entry.jerseySize"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                            <Popover
                              open={openJerseySizes}
                              onOpenChange={setOpenJerseySizes}
                              modal
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  id={field.name}
                                  name={field.name}
                                  disabled={loading}
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
                                <Command>
                                  <CommandInput placeholder="Select Role" />
                                  <CommandList className="max-h-72 overflow-y-auto">
                                    <CommandEmpty>No role found.</CommandEmpty>
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
                  </FieldSet>
                </TabsContent>
                <TabsContent value="player2">
                  <FieldSet className="flex flex-col gap-3 h-[48vh] overflow-y-auto">
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
                    </div>
                    <form.Field
                      name="player2Entry.email"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              Email Address
                            </FieldLabel>
                            <InputGroup className="-mt-1.5">
                              <InputGroupInput
                                placeholder="Email Address"
                                disabled={loading}
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
                      name="player2Entry.jerseySize"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                            <Popover
                              open={openJerseySizes}
                              onOpenChange={setOpenJerseySizes}
                              modal
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  id={field.name}
                                  name={field.name}
                                  disabled={loading}
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
                                <Command>
                                  <CommandInput placeholder="Select Role" />
                                  <CommandList className="max-h-72 overflow-y-auto">
                                    <CommandEmpty>No role found.</CommandEmpty>
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

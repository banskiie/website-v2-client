"use client"

import { gql } from "@apollo/client"
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  Select,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { IEntry } from "@/types/entry.interface"
import { useForm } from "@tanstack/react-form"
import { AssignPlayersSchema } from "@/validators/entry.validator"
import { useTransition } from "react"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"

const ASSIGN_PLAYERS = gql`
  mutation AssignPlayers($input: assignPlayersInput!) {
    assignPlayers(input: $input) {
      ok
      message
    }
  }
`

const ENTRY = gql`
  query Entry($_id: ID!) {
    entry(_id: $_id) {
      _id
      entryNumber
      player1Entry {
        firstName
        middleName
        lastName
        suffix
        gender
        birthDate
        email
        phoneNumber
      }
      connectedPlayer1 {
        _id
        firstName
        middleName
        lastName
        suffix
        gender
        birthDate
        email
        phoneNumber
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
      }
      connectedPlayer2 {
        _id
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

const OPTIONS = gql`
  query Options {
    playerOptions {
      label
      value
    }
  }
`

const PLAYER_1 = gql`
  query Player1($_id: ID!) {
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
    }
  }
`

const PLAYER_2 = gql`
  query Player2($_id: ID!) {
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
    }
  }
`

type Props = {
  _id?: string
  onClose?: () => void
  title?: string
}

const AssignDialog = (props: Props) => {
  const [isPending, startTransition] = useTransition()
  // Dialog open state
  const [open, setOpen] = useState(false)
  // Mutation for changing status
  const [assignPlayers, { loading: assignLoading }] =
    useMutation(ASSIGN_PLAYERS)
  // Entry Data
  const { data, loading: entryLoading }: any = useQuery(ENTRY, {
    variables: { _id: props._id },
    skip: !open || !Boolean(props._id),
    fetchPolicy: "network-only",
  })
  const entry = data?.entry as IEntry
  // Options
  const { data: optionsData, loading: optionsLoading }: any = useQuery(
    OPTIONS,
    {
      skip: !open,
      fetchPolicy: "no-cache",
    }
  )
  // Players
  const [openPlayers1, setOpenPlayers1] = useState(false)
  const [openPlayers2, setOpenPlayers2] = useState(false)
  const players = optionsData?.playerOptions || []
  // Fetch Player
  const [fetchPlayer1, { data: player1Data, loading: player1Loading }]: any =
    useLazyQuery(PLAYER_1, {
      fetchPolicy: "no-cache",
    })
  const [fetchPlayer2, { data: player2Data, loading: player2Loading }]: any =
    useLazyQuery(PLAYER_2, {
      fetchPolicy: "no-cache",
    })
  const player1 = player1Data?.player
  const player2 = player2Data?.player
  // Loading State
  const isLoading =
    assignLoading ||
    entryLoading ||
    optionsLoading ||
    player1Loading ||
    player2Loading

  // Form State
  const form = useForm({
    defaultValues: {
      entry: props._id || "",
      isPlayer1New: false,
      isPlayer2New: false,
      connectedPlayer1: entry?.connectedPlayer1?._id || null,
      connectedPlayer2: entry?.connectedPlayer2?._id || null,
      migratePlayer1Data: {
        firstName: false,
        middleName: false,
        lastName: false,
        suffix: false,
        birthDate: false,
        phoneNumber: false,
        email: false,
      },
      migratePlayer2Data: {
        firstName: false,
        middleName: false,
        lastName: false,
        suffix: false,
        birthDate: false,
        phoneNumber: false,
        email: false,
      },
    },
    listeners: {
      onChange: ({ formApi, fieldApi }) => {
        // Player 1 Listeners
        if (fieldApi.name === "isPlayer1New" && fieldApi.state.value) {
          formApi.setFieldValue("connectedPlayer1", null)
          formApi.setFieldValue("migratePlayer1Data", {
            firstName: false,
            middleName: false,
            lastName: false,
            suffix: false,
            birthDate: false,
            phoneNumber: false,
            email: false,
          })
        }
        if (fieldApi.name === "connectedPlayer1" && fieldApi.state.value) {
          fetchPlayer1({ variables: { _id: fieldApi.state.value } })
        }

        // Player 2 Listeners
        if (fieldApi.name === "isPlayer2New" && fieldApi.state.value) {
          formApi.setFieldValue("connectedPlayer2", null)
          formApi.setFieldValue("migratePlayer2Data", {
            firstName: false,
            middleName: false,
            lastName: false,
            suffix: false,
            birthDate: false,
            phoneNumber: false,
            email: false,
          })
        }
        if (fieldApi.name === "connectedPlayer2" && fieldApi.state.value) {
          fetchPlayer2({ variables: { _id: fieldApi.state.value } })
        }
      },
    }, // this is just for demo purposes
    validators: {
      onSubmit: ({ formApi, value }) => {
        try {
          AssignPlayersSchema.parse(value)
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
    onSubmit: ({ value: payload, formApi }) =>
      startTransition(async () => {
        try {
          const response: any = await assignPlayers({
            variables: {
              input: payload,
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

  useEffect(() => {
    if (open && entry?.connectedPlayer1) {
      fetchPlayer1({
        variables: {
          _id: entry.connectedPlayer1._id,
        },
      })
    }
  }, [open, entry, fetchPlayer1])

  useEffect(() => {
    if (open && entry?.connectedPlayer2) {
      fetchPlayer2({
        variables: {
          _id: entry.connectedPlayer2._id,
        },
      })
    }
  }, [open, entry, fetchPlayer2])

  const onClose = () => {
    form.reset()
    setOpen(false)
    props.onClose?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogTrigger asChild>
          <DropdownMenuItem
            className="text-info focus:bg-info/10 focus:text-info"
            onSelect={(e) => e.preventDefault()}
          >
            {props.title}
          </DropdownMenuItem>
        </DialogTrigger>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle>Player Assignment: {entry?.entryNumber}</DialogTitle>
            <DialogDescription>
              Assign players to this entry for streamlined data management.
            </DialogDescription>
          </DialogHeader>
          <form
            className="-mt-2 mb-2"
            id="assign-players-form"
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <form.Subscribe
              selector={(state) => state.values}
              children={(state) => (
                <Tabs defaultValue="player1">
                  <TabsList
                    className={cn(
                      entry?.player2Entry ? "flex" : "hidden",
                      "w-full"
                    )}
                  >
                    <TabsTrigger value="player1">Player 1</TabsTrigger>
                    {!!(entry?.player2Entry || entry?.connectedPlayer2) && (
                      <TabsTrigger value="player2">Player 2</TabsTrigger>
                    )}
                  </TabsList>
                  <TabsContent value="player1">
                    <FieldSet className="flex flex-col gap-2.5 h-[52vh] overflow-y-auto">
                      <form.Field
                        name="isPlayer1New"
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid}>
                              <div className="flex items-center py-1">
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
                                <FieldError errors={field.state.meta.errors} />
                              )}
                            </Field>
                          )
                        }}
                      />
                      {!state.isPlayer1New && (
                        <>
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
                                    open={openPlayers1}
                                    onOpenChange={setOpenPlayers1}
                                  >
                                    <PopoverTrigger asChild>
                                      <Button
                                        id={field.name}
                                        name={field.name}
                                        disabled={optionsLoading}
                                        aria-expanded={openPlayers1}
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
                                              }) =>
                                                o.value === field.state.value
                                            )?.label
                                          : "Select Player 1"}
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
                                        <CommandInput placeholder="Select Player 1" />
                                        <CommandList className="max-h-72 overflow-y-auto">
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
                                                    setOpenPlayers1(false)
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
                                          <CommandEmpty>
                                            No players found.
                                          </CommandEmpty>
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
                          <Separator />
                          <div className="flex flex-col">
                            <div className="col-span-2">
                              <Label>Migrate Data</Label>
                              <span className="text-xs text-muted-foreground">
                                Checked fields will update the player database
                                with entry data.
                              </span>
                            </div>
                            <div className="flex items-center w-full gap-2">
                              <div className="h-full flex items-center justify-center">
                                <Checkbox
                                  disabled={
                                    isLoading || !state.connectedPlayer1
                                  }
                                  onCheckedChange={(checked) => {
                                    form.setFieldValue("migratePlayer1Data", {
                                      firstName: checked === true,
                                      middleName: checked === true,
                                      lastName: checked === true,
                                      suffix: checked === true,
                                      birthDate: checked === true,
                                      phoneNumber: checked === true,
                                      email: checked === true,
                                    })
                                  }}
                                />
                              </div>
                              <div className="text-xs grid grid-cols-5 col-span-2 h-full w-full">
                                <div className="px-2 h-full border w-full flex items-center justify-center min-h-8"></div>
                                <span
                                  className={cn(
                                    "px-2 h-full border w-full flex items-center justify-center",
                                    state.connectedPlayer1
                                      ? "col-span-2"
                                      : "hidden"
                                  )}
                                >
                                  From Database (Current)
                                </span>{" "}
                                <span
                                  className={cn(
                                    "px-2 h-full border w-full flex items-center justify-center",
                                    state.connectedPlayer1
                                      ? "col-span-2"
                                      : "col-span-4"
                                  )}
                                >
                                  From Entry (New)
                                </span>
                              </div>
                            </div>
                            <div>
                              <form.Field
                                name="migratePlayer1Data.firstName"
                                children={(field) => {
                                  const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid
                                  return (
                                    <Field>
                                      <div className="flex items-center w-full gap-2">
                                        <div className="h-full flex items-center justify-center">
                                          <Checkbox
                                            id={field.name}
                                            name={field.name}
                                            checked={field.state.value}
                                            onBlur={field.handleBlur}
                                            onCheckedChange={(checked) =>
                                              field.handleChange(
                                                checked === true
                                              )
                                            }
                                            aria-invalid={isInvalid}
                                            disabled={
                                              isLoading ||
                                              !state.connectedPlayer1
                                            }
                                          />
                                        </div>
                                        <div className="text-xs grid grid-cols-5 col-span-2 min-h-8 w-full">
                                          <span className="px-2 h-full border w-full flex items-center justify-center py-1 text-center">
                                            First Name
                                          </span>
                                          {state.connectedPlayer1 ? (
                                            <>
                                              <span
                                                className={cn(
                                                  !field.state.value &&
                                                    "text-success bg-success/5",
                                                  "col-span-2 px-2 h-full border w-full flex items-center justify-start py-1"
                                                )}
                                              >
                                                {player1?.firstName}
                                              </span>{" "}
                                              <span
                                                className={cn(
                                                  field.state.value &&
                                                    "text-success bg-success/5",
                                                  "col-span-2 px-2 h-full border w-full flex items-center justify-start py-1"
                                                )}
                                              >
                                                {entry?.player1Entry.firstName}
                                              </span>
                                            </>
                                          ) : (
                                            <span
                                              className={cn(
                                                field.state.value &&
                                                  "text-success",
                                                "col-span-4 px-2 h-full border w-full flex items-center justify-start"
                                              )}
                                            >
                                              {entry?.player1Entry.firstName}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </Field>
                                  )
                                }}
                              />
                            </div>
                            <div>
                              <form.Field
                                name="migratePlayer1Data.middleName"
                                children={(field) => {
                                  const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid
                                  return (
                                    <Field>
                                      <div className="flex items-center w-full gap-2">
                                        <div className="h-full flex items-center justify-center text-center">
                                          <Checkbox
                                            id={field.name}
                                            name={field.name}
                                            checked={field.state.value}
                                            onBlur={field.handleBlur}
                                            onCheckedChange={(checked) =>
                                              field.handleChange(
                                                checked === true
                                              )
                                            }
                                            aria-invalid={isInvalid}
                                            disabled={
                                              isLoading ||
                                              !state.connectedPlayer1
                                            }
                                          />
                                        </div>
                                        <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                          <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                            Middle Name
                                          </span>
                                          {state.connectedPlayer1 ? (
                                            <>
                                              <span
                                                className={cn(
                                                  !field.state.value &&
                                                    "text-success bg-success/5",
                                                  "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                                  !player1?.middleName &&
                                                    "italic"
                                                )}
                                              >
                                                {player1?.middleName || "N/A"}
                                              </span>{" "}
                                              <span
                                                className={cn(
                                                  field.state.value &&
                                                    "text-success bg-success/5",
                                                  "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                                  !player1?.middleName &&
                                                    "italic"
                                                )}
                                              >
                                                {entry?.player1Entry
                                                  .middleName || "N/A"}
                                              </span>
                                            </>
                                          ) : (
                                            <span
                                              className={cn(
                                                field.state.value &&
                                                  "text-success",
                                                "col-span-4 px-2 border w-full flex items-center justify-start py-1",
                                                !player1?.middleName && "italic"
                                              )}
                                            >
                                              {entry?.player1Entry.middleName ||
                                                "N/A"}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </Field>
                                  )
                                }}
                              />
                            </div>
                            <div>
                              <form.Field
                                name="migratePlayer1Data.lastName"
                                children={(field) => {
                                  const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid
                                  return (
                                    <Field>
                                      <div className="flex items-center w-full gap-2">
                                        <div className="flex items-center justify-center">
                                          <Checkbox
                                            id={field.name}
                                            name={field.name}
                                            checked={field.state.value}
                                            onBlur={field.handleBlur}
                                            onCheckedChange={(checked) =>
                                              field.handleChange(
                                                checked === true
                                              )
                                            }
                                            aria-invalid={isInvalid}
                                            disabled={
                                              isLoading ||
                                              !state.connectedPlayer1
                                            }
                                          />
                                        </div>
                                        <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                          <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                            Last Name
                                          </span>
                                          {state.connectedPlayer1 ? (
                                            <>
                                              <span
                                                className={cn(
                                                  !field.state.value &&
                                                    "text-success bg-success/5",
                                                  "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                                  !player1?.lastName && "italic"
                                                )}
                                              >
                                                {player1?.lastName || "N/A"}
                                              </span>{" "}
                                              <span
                                                className={cn(
                                                  field.state.value &&
                                                    "text-success bg-success/5",
                                                  "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                                  !player1?.lastName && "italic"
                                                )}
                                              >
                                                {entry?.player1Entry.lastName ||
                                                  "N/A"}
                                              </span>
                                            </>
                                          ) : (
                                            <span
                                              className={cn(
                                                field.state.value &&
                                                  "text-success",
                                                "col-span-4 px-2 border w-full flex items-center justify-start py-1",
                                                !player1?.lastName && "italic"
                                              )}
                                            >
                                              {entry?.player1Entry.lastName ||
                                                "N/A"}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </Field>
                                  )
                                }}
                              />
                            </div>
                            <div>
                              <form.Field
                                name="migratePlayer1Data.suffix"
                                children={(field) => {
                                  const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid
                                  return (
                                    <Field>
                                      <div className="flex items-center w-full gap-2">
                                        <div className="flex items-center justify-center">
                                          <Checkbox
                                            id={field.name}
                                            name={field.name}
                                            checked={field.state.value}
                                            onBlur={field.handleBlur}
                                            onCheckedChange={(checked) =>
                                              field.handleChange(
                                                checked === true
                                              )
                                            }
                                            aria-invalid={isInvalid}
                                            disabled={
                                              isLoading ||
                                              !state.connectedPlayer1
                                            }
                                          />
                                        </div>
                                        <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                          <span className="px-2 border w-full flex items-center py-1 justify-center text-center">
                                            Ext.
                                          </span>
                                          {state.connectedPlayer1 ? (
                                            <>
                                              <span
                                                className={cn(
                                                  !field.state.value &&
                                                    "text-success bg-success/5",
                                                  "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                  !player1?.suffix && "italic"
                                                )}
                                              >
                                                {player1?.suffix || "N/A"}
                                              </span>{" "}
                                              <span
                                                className={cn(
                                                  field.state.value &&
                                                    "text-success bg-success/5",
                                                  "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                  !player1?.suffix && "italic"
                                                )}
                                              >
                                                {entry?.player1Entry.suffix ||
                                                  "N/A"}
                                              </span>
                                            </>
                                          ) : (
                                            <span
                                              className={cn(
                                                field.state.value &&
                                                  "text-success",
                                                "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                                !player1?.suffix && "italic"
                                              )}
                                            >
                                              {entry?.player1Entry.suffix ||
                                                "N/A"}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </Field>
                                  )
                                }}
                              />
                            </div>
                            <div>
                              <form.Field
                                name="migratePlayer1Data.email"
                                children={(field) => {
                                  const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid
                                  return (
                                    <Field>
                                      <div className="flex items-center w-full gap-2">
                                        <div className="flex items-center justify-center">
                                          <Checkbox
                                            id={field.name}
                                            name={field.name}
                                            checked={field.state.value}
                                            onBlur={field.handleBlur}
                                            onCheckedChange={(checked) =>
                                              field.handleChange(
                                                checked === true
                                              )
                                            }
                                            aria-invalid={isInvalid}
                                            disabled={
                                              isLoading ||
                                              !state.connectedPlayer1
                                            }
                                          />
                                        </div>
                                        <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                          <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                            Email
                                          </span>
                                          {state.connectedPlayer1 ? (
                                            <>
                                              <span
                                                className={cn(
                                                  !field.state.value &&
                                                    "text-success bg-success/5",
                                                  "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                  !player1?.email && "italic"
                                                )}
                                              >
                                                {player1?.email || "N/A"}
                                              </span>{" "}
                                              <span
                                                className={cn(
                                                  field.state.value &&
                                                    "text-success bg-success/5",
                                                  "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                  !player1?.email && "italic"
                                                )}
                                              >
                                                {entry?.player1Entry.email ||
                                                  "N/A"}
                                              </span>
                                            </>
                                          ) : (
                                            <span
                                              className={cn(
                                                field.state.value &&
                                                  "text-success",
                                                "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                                !player1?.email && "italic"
                                              )}
                                            >
                                              {entry?.player1Entry.email ||
                                                "N/A"}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </Field>
                                  )
                                }}
                              />
                            </div>
                            <div>
                              <form.Field
                                name="migratePlayer1Data.phoneNumber"
                                children={(field) => {
                                  const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid
                                  return (
                                    <Field>
                                      <div className="flex items-center w-full gap-2">
                                        <div className="flex items-center justify-center">
                                          <Checkbox
                                            id={field.name}
                                            name={field.name}
                                            checked={field.state.value}
                                            onBlur={field.handleBlur}
                                            onCheckedChange={(checked) =>
                                              field.handleChange(
                                                checked === true
                                              )
                                            }
                                            aria-invalid={isInvalid}
                                            disabled={
                                              isLoading ||
                                              !state.connectedPlayer1
                                            }
                                          />
                                        </div>
                                        <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                          <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                            Phone No.
                                          </span>
                                          {state.connectedPlayer1 ? (
                                            <>
                                              <span
                                                className={cn(
                                                  !field.state.value &&
                                                    "text-success bg-success/5",
                                                  "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                  !player1?.phoneNumber &&
                                                    "italic"
                                                )}
                                              >
                                                {player1?.phoneNumber || "N/A"}
                                              </span>{" "}
                                              <span
                                                className={cn(
                                                  field.state.value &&
                                                    "text-success bg-success/5",
                                                  "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                  !player1?.phoneNumber &&
                                                    "italic"
                                                )}
                                              >
                                                {entry?.player1Entry
                                                  .phoneNumber || "N/A"}
                                              </span>
                                            </>
                                          ) : (
                                            <span
                                              className={cn(
                                                field.state.value &&
                                                  "text-success",
                                                "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                                !player1?.phoneNumber &&
                                                  "italic"
                                              )}
                                            >
                                              {entry?.player1Entry
                                                .phoneNumber || "N/A"}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </Field>
                                  )
                                }}
                              />
                            </div>
                            <div>
                              <form.Field
                                name="migratePlayer1Data.birthDate"
                                children={(field) => {
                                  const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid
                                  return (
                                    <Field>
                                      <div className="flex items-center w-full gap-2">
                                        <div className="flex items-center justify-center">
                                          <Checkbox
                                            id={field.name}
                                            name={field.name}
                                            checked={field.state.value}
                                            onBlur={field.handleBlur}
                                            onCheckedChange={(checked) =>
                                              field.handleChange(
                                                checked === true
                                              )
                                            }
                                            aria-invalid={isInvalid}
                                            disabled={
                                              isLoading ||
                                              !state.connectedPlayer1
                                            }
                                          />
                                        </div>
                                        <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                          <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                            Birthday
                                          </span>
                                          {state.connectedPlayer1 ? (
                                            <>
                                              <span
                                                className={cn(
                                                  !field.state.value &&
                                                    "text-success bg-success/5",
                                                  "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                  !player1?.birthDate &&
                                                    "italic"
                                                )}
                                              >
                                                {player1?.birthDate
                                                  ? format(
                                                      new Date(
                                                        player1.birthDate
                                                      ),
                                                      "PP"
                                                    )
                                                  : "N/A"}
                                              </span>{" "}
                                              <span
                                                className={cn(
                                                  field.state.value &&
                                                    "text-success bg-success/5",
                                                  "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                  !player1?.birthDate &&
                                                    "italic"
                                                )}
                                              >
                                                {entry?.player1Entry.birthDate
                                                  ? format(
                                                      new Date(
                                                        entry.player1Entry.birthDate
                                                      ),
                                                      "PP"
                                                    )
                                                  : "N/A"}
                                              </span>
                                            </>
                                          ) : (
                                            <span
                                              className={cn(
                                                field.state.value &&
                                                  "text-success",
                                                "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                                !player1?.birthDate && "italic"
                                              )}
                                            >
                                              {entry?.player1Entry.birthDate
                                                ? format(
                                                    new Date(
                                                      entry.player1Entry.birthDate
                                                    ),
                                                    "PP"
                                                  )
                                                : "N/A"}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </Field>
                                  )
                                }}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </FieldSet>
                  </TabsContent>
                  <TabsContent value="player2">
                    <FieldSet className="flex flex-col gap-2.5 h-[52vh] overflow-y-auto">
                      <form.Field
                        name="isPlayer2New"
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid}>
                              <div className="flex items-center py-1">
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
                                <FieldError errors={field.state.meta.errors} />
                              )}
                            </Field>
                          )
                        }}
                      />
                      {!state.isPlayer2New && (
                        <>
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
                                    open={openPlayers2}
                                    onOpenChange={setOpenPlayers2}
                                  >
                                    <PopoverTrigger asChild>
                                      <Button
                                        id={field.name}
                                        name={field.name}
                                        disabled={optionsLoading}
                                        aria-expanded={openPlayers2}
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
                                              }) =>
                                                o.value === field.state.value
                                            )?.label
                                          : "Select Player 2"}
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
                                        <CommandInput placeholder="Select Player 2" />
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
                                                    setOpenPlayers2(false)
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
                          <Separator />
                          <div className="flex flex-col">
                            <div className="col-span-2">
                              <Label>Migrate Data</Label>
                              <span className="text-xs text-muted-foreground">
                                Checked fields will update the player database
                                with entry data.
                              </span>
                            </div>
                            <div className="flex items-center w-full gap-2">
                              <div className="h-full flex items-center justify-center">
                                <Checkbox
                                  disabled={
                                    isLoading || !state.connectedPlayer2
                                  }
                                  onCheckedChange={(checked) => {
                                    form.setFieldValue("migratePlayer2Data", {
                                      firstName: checked === true,
                                      middleName: checked === true,
                                      lastName: checked === true,
                                      suffix: checked === true,
                                      birthDate: checked === true,
                                      phoneNumber: checked === true,
                                      email: checked === true,
                                    })
                                  }}
                                />
                              </div>
                              <div className="text-xs grid grid-cols-5 col-span-2 h-full w-full">
                                <div className="px-2 h-full border w-full flex items-center justify-center min-h-8"></div>
                                <span
                                  className={cn(
                                    "px-2 h-full border w-full flex items-center justify-center",
                                    state.connectedPlayer2
                                      ? "col-span-2"
                                      : "hidden"
                                  )}
                                >
                                  From Database (Current)
                                </span>{" "}
                                <span
                                  className={cn(
                                    "px-2 h-full border w-full flex items-center justify-center",
                                    state.connectedPlayer2
                                      ? "col-span-2"
                                      : "col-span-4"
                                  )}
                                >
                                  From Entry (New)
                                </span>
                              </div>
                            </div>
                            <div>
                              <form.Field
                                name="migratePlayer2Data.firstName"
                                children={(field) => {
                                  const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid
                                  return (
                                    <Field>
                                      <div className="flex items-center w-full gap-2">
                                        <div className="h-full flex items-center justify-center">
                                          <Checkbox
                                            id={field.name}
                                            name={field.name}
                                            checked={field.state.value}
                                            onBlur={field.handleBlur}
                                            onCheckedChange={(checked) =>
                                              field.handleChange(
                                                checked === true
                                              )
                                            }
                                            aria-invalid={isInvalid}
                                            disabled={
                                              isLoading ||
                                              !state.connectedPlayer2
                                            }
                                          />
                                        </div>
                                        <div className="text-xs grid grid-cols-5 col-span-2 min-h-8 w-full">
                                          <span className="px-2 h-full border w-full flex items-center justify-center py-1 text-center">
                                            First Name
                                          </span>
                                          {state.connectedPlayer2 ? (
                                            <>
                                              <span
                                                className={cn(
                                                  !field.state.value &&
                                                    "text-success bg-success/5",
                                                  "col-span-2 px-2 h-full border w-full flex items-center justify-start py-1"
                                                )}
                                              >
                                                {player2?.firstName}
                                              </span>{" "}
                                              <span
                                                className={cn(
                                                  field.state.value &&
                                                    "text-success bg-success/5",
                                                  "col-span-2 px-2 h-full border w-full flex items-center justify-start py-1"
                                                )}
                                              >
                                                {entry?.player2Entry &&
                                                  entry?.player2Entry.firstName}
                                              </span>
                                            </>
                                          ) : (
                                            <span
                                              className={cn(
                                                field.state.value &&
                                                  "text-success",
                                                "col-span-4 px-2 h-full border w-full flex items-center justify-start"
                                              )}
                                            >
                                              {entry?.player2Entry &&
                                                entry?.player2Entry.firstName}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </Field>
                                  )
                                }}
                              />
                            </div>
                            <div>
                              <form.Field
                                name="migratePlayer2Data.middleName"
                                children={(field) => {
                                  const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid
                                  return (
                                    <Field>
                                      <div className="flex items-center w-full gap-2">
                                        <div className="h-full flex items-center justify-center text-center">
                                          <Checkbox
                                            id={field.name}
                                            name={field.name}
                                            checked={field.state.value}
                                            onBlur={field.handleBlur}
                                            onCheckedChange={(checked) =>
                                              field.handleChange(
                                                checked === true
                                              )
                                            }
                                            aria-invalid={isInvalid}
                                            disabled={
                                              isLoading ||
                                              !state.connectedPlayer2
                                            }
                                          />
                                        </div>
                                        <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                          <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                            Middle Name
                                          </span>
                                          {state.connectedPlayer2 ? (
                                            <>
                                              <span
                                                className={cn(
                                                  !field.state.value &&
                                                    "text-success bg-success/5",
                                                  "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                                  !player2?.middleName &&
                                                    "italic"
                                                )}
                                              >
                                                {player2?.middleName || "N/A"}
                                              </span>{" "}
                                              <span
                                                className={cn(
                                                  field.state.value &&
                                                    "text-success bg-success/5",
                                                  "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                                  !player2?.middleName &&
                                                    "italic"
                                                )}
                                              >
                                                {entry?.player2Entry
                                                  ? entry?.player2Entry
                                                      .middleName
                                                  : "N/A"}
                                              </span>
                                            </>
                                          ) : (
                                            <span
                                              className={cn(
                                                field.state.value &&
                                                  "text-success",
                                                "col-span-4 px-2 border w-full flex items-center justify-start py-1",
                                                !player2?.middleName && "italic"
                                              )}
                                            >
                                              {entry?.player2Entry
                                                ? entry?.player2Entry.middleName
                                                : "N/A"}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </Field>
                                  )
                                }}
                              />
                            </div>
                            <div>
                              <form.Field
                                name="migratePlayer2Data.lastName"
                                children={(field) => {
                                  const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid
                                  return (
                                    <Field>
                                      <div className="flex items-center w-full gap-2">
                                        <div className="flex items-center justify-center">
                                          <Checkbox
                                            id={field.name}
                                            name={field.name}
                                            checked={field.state.value}
                                            onBlur={field.handleBlur}
                                            onCheckedChange={(checked) =>
                                              field.handleChange(
                                                checked === true
                                              )
                                            }
                                            aria-invalid={isInvalid}
                                            disabled={
                                              isLoading ||
                                              !state.connectedPlayer2
                                            }
                                          />
                                        </div>
                                        <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                          <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                            Last Name
                                          </span>
                                          {state.connectedPlayer2 ? (
                                            <>
                                              <span
                                                className={cn(
                                                  !field.state.value &&
                                                    "text-success bg-success/5",
                                                  "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                                  !player2?.lastName && "italic"
                                                )}
                                              >
                                                {player2?.lastName || "N/A"}
                                              </span>{" "}
                                              <span
                                                className={cn(
                                                  field.state.value &&
                                                    "text-success bg-success/5",
                                                  "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                                  !player2?.lastName && "italic"
                                                )}
                                              >
                                                {entry?.player2Entry
                                                  ? entry?.player2Entry.lastName
                                                  : "N/A"}
                                              </span>
                                            </>
                                          ) : (
                                            <span
                                              className={cn(
                                                field.state.value &&
                                                  "text-success",
                                                "col-span-4 px-2 border w-full flex items-center justify-start py-1",
                                                !player2?.lastName && "italic"
                                              )}
                                            >
                                              {entry?.player2Entry
                                                ? entry?.player2Entry.lastName
                                                : "N/A"}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </Field>
                                  )
                                }}
                              />
                            </div>
                            <div>
                              <form.Field
                                name="migratePlayer2Data.suffix"
                                children={(field) => {
                                  const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid
                                  return (
                                    <Field>
                                      <div className="flex items-center w-full gap-2">
                                        <div className="flex items-center justify-center">
                                          <Checkbox
                                            id={field.name}
                                            name={field.name}
                                            checked={field.state.value}
                                            onBlur={field.handleBlur}
                                            onCheckedChange={(checked) =>
                                              field.handleChange(
                                                checked === true
                                              )
                                            }
                                            aria-invalid={isInvalid}
                                            disabled={
                                              isLoading ||
                                              !state.connectedPlayer2
                                            }
                                          />
                                        </div>
                                        <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                          <span className="px-2 border w-full flex items-center py-1 justify-center text-center">
                                            Ext.
                                          </span>
                                          {state.connectedPlayer2 ? (
                                            <>
                                              <span
                                                className={cn(
                                                  !field.state.value &&
                                                    "text-success bg-success/5",
                                                  "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                  !player2?.suffix && "italic"
                                                )}
                                              >
                                                {player2?.suffix || "N/A"}
                                              </span>{" "}
                                              <span
                                                className={cn(
                                                  field.state.value &&
                                                    "text-success bg-success/5",
                                                  "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                  !player2?.suffix && "italic"
                                                )}
                                              >
                                                {entry?.player2Entry
                                                  ? entry?.player2Entry.suffix
                                                  : "N/A"}
                                              </span>
                                            </>
                                          ) : (
                                            <span
                                              className={cn(
                                                field.state.value &&
                                                  "text-success",
                                                "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                                !player2?.suffix && "italic"
                                              )}
                                            >
                                              {entry?.player2Entry
                                                ? entry?.player2Entry.suffix
                                                : "N/A"}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </Field>
                                  )
                                }}
                              />
                            </div>
                            <div>
                              <form.Field
                                name="migratePlayer2Data.email"
                                children={(field) => {
                                  const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid
                                  return (
                                    <Field>
                                      <div className="flex items-center w-full gap-2">
                                        <div className="flex items-center justify-center">
                                          <Checkbox
                                            id={field.name}
                                            name={field.name}
                                            checked={field.state.value}
                                            onBlur={field.handleBlur}
                                            onCheckedChange={(checked) =>
                                              field.handleChange(
                                                checked === true
                                              )
                                            }
                                            aria-invalid={isInvalid}
                                            disabled={
                                              isLoading ||
                                              !state.connectedPlayer2
                                            }
                                          />
                                        </div>
                                        <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                          <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                            Email
                                          </span>
                                          {state.connectedPlayer2 ? (
                                            <>
                                              <span
                                                className={cn(
                                                  !field.state.value &&
                                                    "text-success bg-success/5",
                                                  "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                  !player2?.email && "italic"
                                                )}
                                              >
                                                {player2?.email || "N/A"}
                                              </span>{" "}
                                              <span
                                                className={cn(
                                                  field.state.value &&
                                                    "text-success bg-success/5",
                                                  "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                  !player2?.email && "italic"
                                                )}
                                              >
                                                {entry?.player2Entry
                                                  ? entry?.player2Entry.email
                                                  : "N/A"}
                                              </span>
                                            </>
                                          ) : (
                                            <span
                                              className={cn(
                                                field.state.value &&
                                                  "text-success",
                                                "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                                !player2?.email && "italic"
                                              )}
                                            >
                                              {entry?.player2Entry
                                                ? entry?.player2Entry.email
                                                : "N/A"}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </Field>
                                  )
                                }}
                              />
                            </div>
                            <div>
                              <form.Field
                                name="migratePlayer2Data.phoneNumber"
                                children={(field) => {
                                  const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid
                                  return (
                                    <Field>
                                      <div className="flex items-center w-full gap-2">
                                        <div className="flex items-center justify-center">
                                          <Checkbox
                                            id={field.name}
                                            name={field.name}
                                            checked={field.state.value}
                                            onBlur={field.handleBlur}
                                            onCheckedChange={(checked) =>
                                              field.handleChange(
                                                checked === true
                                              )
                                            }
                                            aria-invalid={isInvalid}
                                            disabled={
                                              isLoading ||
                                              !state.connectedPlayer2
                                            }
                                          />
                                        </div>
                                        <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                          <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                            Phone No.
                                          </span>
                                          {state.connectedPlayer2 ? (
                                            <>
                                              <span
                                                className={cn(
                                                  !field.state.value &&
                                                    "text-success bg-success/5",
                                                  "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                  !player2?.phoneNumber &&
                                                    "italic"
                                                )}
                                              >
                                                {player2?.phoneNumber || "N/A"}
                                              </span>{" "}
                                              <span
                                                className={cn(
                                                  field.state.value &&
                                                    "text-success bg-success/5",
                                                  "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                  !player2?.phoneNumber &&
                                                    "italic"
                                                )}
                                              >
                                                {entry?.player2Entry
                                                  ? entry?.player2Entry
                                                      .phoneNumber
                                                  : "N/A"}
                                              </span>
                                            </>
                                          ) : (
                                            <span
                                              className={cn(
                                                field.state.value &&
                                                  "text-success",
                                                "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                                !player2?.phoneNumber &&
                                                  "italic"
                                              )}
                                            >
                                              {entry?.player2Entry
                                                ? entry?.player2Entry
                                                    .phoneNumber
                                                : "N/A"}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </Field>
                                  )
                                }}
                              />
                            </div>
                            <div>
                              <form.Field
                                name="migratePlayer2Data.birthDate"
                                children={(field) => {
                                  const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid
                                  return (
                                    <Field>
                                      <div className="flex items-center w-full gap-2">
                                        <div className="flex items-center justify-center">
                                          <Checkbox
                                            id={field.name}
                                            name={field.name}
                                            checked={field.state.value}
                                            onBlur={field.handleBlur}
                                            onCheckedChange={(checked) =>
                                              field.handleChange(
                                                checked === true
                                              )
                                            }
                                            aria-invalid={isInvalid}
                                            disabled={
                                              isLoading ||
                                              !state.connectedPlayer2
                                            }
                                          />
                                        </div>
                                        <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                          <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                            Birthday
                                          </span>
                                          {state.connectedPlayer2 ? (
                                            <>
                                              <span
                                                className={cn(
                                                  !field.state.value &&
                                                    "text-success bg-success/5",
                                                  "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                  !player2?.birthDate &&
                                                    "italic"
                                                )}
                                              >
                                                {player2?.birthDate
                                                  ? format(
                                                      new Date(
                                                        player2.birthDate
                                                      ),
                                                      "PP"
                                                    )
                                                  : "N/A"}
                                              </span>{" "}
                                              <span
                                                className={cn(
                                                  field.state.value &&
                                                    "text-success bg-success/5",
                                                  "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                  !player2?.birthDate &&
                                                    "italic"
                                                )}
                                              >
                                                {entry?.player2Entry &&
                                                entry?.player2Entry.birthDate
                                                  ? format(
                                                      new Date(
                                                        entry.player2Entry.birthDate
                                                      ),
                                                      "PP"
                                                    )
                                                  : "N/A"}
                                              </span>
                                            </>
                                          ) : (
                                            <span
                                              className={cn(
                                                field.state.value &&
                                                  "text-success",
                                                "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                                !player2?.birthDate && "italic"
                                              )}
                                            >
                                              {entry?.player2Entry &&
                                              entry?.player2Entry.birthDate
                                                ? format(
                                                    new Date(
                                                      entry.player2Entry.birthDate
                                                    ),
                                                    "PP"
                                                  )
                                                : "N/A"}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </Field>
                                  )
                                }}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </FieldSet>
                  </TabsContent>
                </Tabs>
              )}
            />
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="w-20"
              loading={isLoading}
              type="submit"
              form="assign-players-form"
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}

export default AssignDialog

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
import { gql } from "@apollo/client"
import { useMutation, useQuery } from "@apollo/client/react"
import { useForm } from "@tanstack/react-form"
import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckIcon, ChevronsUpDownIcon, CirclePlus } from "lucide-react"
import { Field, FieldLabel, FieldError, FieldSet } from "@/components/ui/field"
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
import { JerseySize, JerseyStatus } from "@/types/jersey.interface"
import { JerseySchema } from "@/validators/jersey.validator"

// Interface for Player Option
interface PlayerOption {
    label: string
    value: string
}

// Interface for Tournament Option
interface TournamentOption {
    label: string
    value: string
    hasEarlyBird?: boolean
    earlyBirdRegistrationEnd?: string
}

// GraphQL Response Types
interface PlayerOptionsResponse {
    playerOptions: PlayerOption[]
}

interface TournamentOptionsResponse {
    tournamentOptions: TournamentOption[]
}

interface CreateJerseyResponse {
    createJersey: {
        ok: boolean
        message: string
    }
}

interface UpdateJerseyResponse {
    updateJersey: {
        ok: boolean
        message: string
    }
}

// GraphQL Queries
const PLAYER_OPTIONS = gql`
  query PlayerOptions {
    playerOptions {
      label
      value
    }
  }
`

const TOURNAMENT_OPTIONS = gql`
  query TournamentOptions {
    tournamentOptions {
      label
      value
      hasEarlyBird
      earlyBirdRegistrationEnd
    }
  }
`

const CREATE_JERSEY = gql`
  mutation CreateJersey($input: CreateJerseyInput!) {
    createJersey(input: $input) {
      ok
      message
    }
  }
`

const UPDATE_JERSEY = gql`
  mutation UpdateJersey($input: UpdateJerseyInput!) {
    updateJersey(input: $input) {
      ok
      message
    }
  }
`

// Form data interface based on JerseySchema
type JerseyFormData = {
    size: JerseySize
    player: string
    tournament: string
}

type Props = {
    _id?: string
    onClose?: () => void
}

const JerseyFormDialog = (props: Props) => {
    const [open, setOpen] = useState(false)
    const isUpdate = Boolean(props._id)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Fetch player options
    const { data: playersData, loading: playersLoading } = useQuery<PlayerOptionsResponse>(
        PLAYER_OPTIONS,
        {
            skip: !open,
        }
    )

    // Fetch tournament options
    const { data: tournamentsData, loading: tournamentsLoading } = useQuery<TournamentOptionsResponse>(
        TOURNAMENT_OPTIONS,
        {
            skip: !open,
        }
    )

    // Mutation for creating/updating jerseys
    const [createJersey] = useMutation<CreateJerseyResponse>(CREATE_JERSEY)
    const [updateJersey] = useMutation<UpdateJerseyResponse>(UPDATE_JERSEY)

    // State for popover controls
    const [openSize, setOpenSize] = useState(false)
    const [openPlayer, setOpenPlayer] = useState(false)
    const [openTournament, setOpenTournament] = useState(false)

    // Size options from JerseySize enum
    const sizeOptions = Object.values(JerseySize).map((size) => ({
        label: size,
        value: size,
    }))

    // Get options from queries
    const playerOptions = playersData?.playerOptions || []
    const tournamentOptions = tournamentsData?.tournamentOptions || []

    // Initialize form with proper typing
    const form = useForm({
        defaultValues: {
            size: JerseySize.M,
            player: "",
            tournament: "",
        },
        onSubmit: async ({ value }) => {
            setIsSubmitting(true)
            try {
                // Validate with JerseySchema first
                const fullData = {
                    size: value.size,
                    player: value.player,
                    tournament: value.tournament,
                    statuses: [{
                        status: JerseyStatus.PENDING,
                        dateUpdated: new Date().toISOString()
                    }]
                }

                const validationResult = JerseySchema.safeParse(fullData)
                if (!validationResult.success) {
                    console.error("Validation error:", validationResult.error)
                    return
                }

                // Prepare the input with automatic PENDING status
                const input = validationResult.data

                // Execute mutation based on update/create
                let response
                if (isUpdate) {
                    response = await updateJersey({
                        variables: {
                            input: { _id: props._id, ...input },
                        },
                    })
                } else {
                    response = await createJersey({
                        variables: {
                            input: input,
                        },
                    })
                }

                // Check for success
                if (isUpdate) {
                    if (response.data?.updateJersey?.ok) {
                        onClose()
                    } else {
                        console.error("Update failed:", response.data?.updateJersey?.message)
                    }
                } else {
                    if (response.data?.createJersey?.ok) {
                        onClose()
                    } else {
                        console.error("Create failed:", response.data?.createJersey?.message)
                    }
                }
            } catch (error: any) {
                console.error("Form submission error:", error)

                // Handle GraphQL errors
                if (error.graphQLErrors && error.graphQLErrors.length > 0) {
                    error.graphQLErrors.forEach((err: any) => {
                        console.error("GraphQL Error:", err.message)
                    })
                }

                // Handle network errors
                if (error.networkError) {
                    console.error("Network Error:", error.networkError)
                }
            } finally {
                setIsSubmitting(false)
            }
        },
    })

    // Reset form and close dialog
    const onClose = () => {
        setOpen(false)
        props.onClose?.()
        form.reset()
    }

    // Helper functions to get display names
    const getPlayerDisplayName = (playerId: string) => {
        const player = playerOptions.find(p => p.value === playerId)
        return player?.label || "Select Player"
    }

    const getTournamentDisplayName = (tournamentId: string) => {
        const tournament = tournamentOptions.find(t => t.value === tournamentId)
        return tournament?.label || "Select Tournament"
    }

    const isLoading = playersLoading || tournamentsLoading || isSubmitting

    return (
        <Dialog modal open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isUpdate ? (
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Edit Jersey
                    </DropdownMenuItem>
                ) : (
                    <Button variant="outline-success">
                        <CirclePlus className="size-3.5" />
                        Add Jersey
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent
                onOpenAutoFocus={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
                showCloseButton={false}
                className="sm:max-w-[425px]"
            >
                <DialogHeader>
                    <DialogTitle>{isUpdate ? "Edit Jersey" : "Create New Jersey"}</DialogTitle>
                    <DialogDescription>
                        {isUpdate
                            ? "Update jersey details."
                            : "Assign a new jersey to a player for a tournament."}
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4"
                    id="jersey-form"
                    onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}
                >
                    <FieldSet>
                        {/* Player Selection */}
                        <form.Field
                            name="player"
                            children={(field) => {
                                const isInvalid = field.state.meta.errors.length > 0
                                return (
                                    <Field data-invalid={isInvalid} className="space-y-2">
                                        <FieldLabel htmlFor={field.name}>Player *</FieldLabel>
                                        <Popover open={openPlayer} onOpenChange={setOpenPlayer}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    id={field.name}
                                                    name={field.name}
                                                    disabled={isLoading}
                                                    aria-expanded={openPlayer}
                                                    onBlur={field.handleBlur}
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-invalid={isInvalid}
                                                    className="w-full justify-between font-normal"
                                                    type="button"
                                                >
                                                    {field.state.value ? getPlayerDisplayName(field.state.value) : "Select Player"}
                                                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder="Search players..." />
                                                    <CommandList className="max-h-72 overflow-y-auto">
                                                        <CommandEmpty>No player found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {playerOptions?.map((player) => (
                                                                <CommandItem
                                                                    key={player.value}
                                                                    value={player.value}
                                                                    onSelect={() => {
                                                                        field.handleChange(player.value)
                                                                        setOpenPlayer(false)
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            field.state.value === player.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {player.label}
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

                        {/* Tournament Selection */}
                        <form.Field
                            name="tournament"
                            children={(field) => {
                                const isInvalid = field.state.meta.errors.length > 0
                                return (
                                    <Field data-invalid={isInvalid} className="space-y-2">
                                        <FieldLabel htmlFor={field.name}>Tournament *</FieldLabel>
                                        <Popover open={openTournament} onOpenChange={setOpenTournament}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    id={field.name}
                                                    name={field.name}
                                                    disabled={isLoading}
                                                    aria-expanded={openTournament}
                                                    onBlur={field.handleBlur}
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-invalid={isInvalid}
                                                    className="w-full justify-between font-normal"
                                                    type="button"
                                                >
                                                    {field.state.value ? getTournamentDisplayName(field.state.value) : "Select Tournament"}
                                                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder="Search tournaments..." />
                                                    <CommandList className="max-h-72 overflow-y-auto">
                                                        <CommandEmpty>No tournament found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {tournamentOptions?.map((tournament) => (
                                                                <CommandItem
                                                                    key={tournament.value}
                                                                    value={tournament.value}
                                                                    onSelect={() => {
                                                                        field.handleChange(tournament.value)
                                                                        setOpenTournament(false)
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            field.state.value === tournament.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {tournament.label}
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

                        {/* Jersey Size */}
                        <form.Field
                            name="size"
                            children={(field) => {
                                const isInvalid = field.state.meta.errors.length > 0
                                return (
                                    <Field data-invalid={isInvalid} className="space-y-2">
                                        <FieldLabel htmlFor={field.name}>Size *</FieldLabel>
                                        <Popover open={openSize} onOpenChange={setOpenSize}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    id={field.name}
                                                    name={field.name}
                                                    disabled={isLoading}
                                                    aria-expanded={openSize}
                                                    onBlur={field.handleBlur}
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-invalid={isInvalid}
                                                    className="w-full justify-between font-normal"
                                                    type="button"
                                                >
                                                    {field.state.value || "Select Size"}
                                                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder="Search sizes..." />
                                                    <CommandList className="max-h-72 overflow-y-auto">
                                                        <CommandEmpty>No size found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {sizeOptions?.map((size) => (
                                                                <CommandItem
                                                                    key={size.value}
                                                                    value={size.value}
                                                                    onSelect={() => {
                                                                        field.handleChange(size.value as JerseySize)
                                                                        setOpenSize(false)
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            field.state.value === size.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {size.label}
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

                        {/* Status Info (Read-only) */}
                        <div className="pt-2">
                            <FieldLabel>Status</FieldLabel>
                            <div className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                                <span className="text-sm font-medium">{JerseyStatus.PENDING}</span>
                                <span className="text-xs text-muted-foreground">
                                    (Automatically set for new jerseys)
                                </span>
                            </div>
                        </div>
                    </FieldSet>
                </form>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        type="submit"
                        form="jersey-form"
                        disabled={isLoading}
                        onClick={(e) => {
                            e.preventDefault()
                            form.handleSubmit()
                        }}
                    >
                        {isLoading ? "Saving..." : "Save Jersey"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default JerseyFormDialog
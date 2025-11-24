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
import React, { useEffect, useState, useTransition } from "react"
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

interface PlayerNode {
    _id: string
    name: string
    currentLevel: string
    gender: string
    birthDate: string
}

interface TournamentNode {
    _id: string
    name: string
}

interface PlayerEdge {
    node: PlayerNode
}

interface TournamentEdge {
    node: TournamentNode
}

interface PlayersResponse {
    players: {
        edges: PlayerEdge[]
    }
}

interface TournamentsResponse {
    tournaments: {
        edges: TournamentEdge[]
    }
}

interface JerseyResponse {
    jersey: {
        _id: string
        size: JerseySize
        player: PlayerNode
        tournament: TournamentNode
        statuses: Array<{
            status: JerseyStatus
            dateUpdated: string
        }>
    }
}

const JERSEY = gql`
  query Jersey($_id: ID!) {
    jersey(_id: $_id) {
      _id
      size
      player {
        _id
        name
      }
      tournament {
        _id
        name
      }
      statuses {
        status
        dateUpdated
      }
    }
  }
`

const PLAYERS = gql`
  query Players {
    players(first: 100) {
      edges {
        node {
          _id
          name
        }
      }
    }
  }
`

const TOURNAMENTS = gql`
  query Tournaments {
    tournaments(first: 100) {
      edges {
        node {
          _id
          name
        }
      }
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

type Props = {
    _id?: string
    onClose?: () => void
}

const FormDialog = (props: Props) => {
    const [open, setOpen] = useState(false)
    const isUpdate = Boolean(props._id)
    const [isPending, startTransition] = useTransition()

    const { data: jerseyData, loading: fetchLoading } = useQuery<JerseyResponse>(JERSEY, {
        variables: { _id: props._id },
        skip: !open || !isUpdate,
        fetchPolicy: "no-cache",
    })

    const { data: playersData } = useQuery<PlayersResponse>(PLAYERS, {
        skip: !open,
    })

    const { data: tournamentsData } = useQuery<TournamentsResponse>(TOURNAMENTS, {
        skip: !open,
    })

    const [submitForm] = useMutation(isUpdate ? UPDATE_JERSEY : CREATE_JERSEY)

    const isLoading = isUpdate ? isPending || fetchLoading : false

    const [openSize, setOpenSize] = useState(false)
    const [openPlayer, setOpenPlayer] = useState(false)
    const [openTournament, setOpenTournament] = useState(false)

    const sizeOptions = Object.values(JerseySize).map((size) => ({
        label: size,
        value: size,
    }))

    const playerOptions = playersData?.players?.edges?.map((edge: PlayerEdge) => {
        const player = edge.node;
        return {
            label: player.name,
            value: player._id,
        }
    }) || []

    const tournamentOptions = tournamentsData?.tournaments?.edges?.map((edge: TournamentEdge) => {
        const tournament = edge.node;
        return {
            label: tournament.name,
            value: tournament._id,
        }
    }) || []

    const form = useForm({
        defaultValues: {
            size: JerseySize.M,
            player: "",
            tournament: "",
            statuses: [{ status: JerseyStatus.PENDING, dateUpdated: new Date().toISOString() }]
        },
        validators: {
            onSubmit: ({ formApi, value }) => {
                try {
                    JerseySchema.parse(value)
                } catch (error: any) {
                    if (error.errors) {
                        error.errors.forEach(
                            (zodError: any) => {
                                const fieldName = zodError.path[0] as keyof typeof formApi.fieldInfo
                                formApi.fieldInfo[fieldName]?.instance?.setErrorMap({
                                    onSubmit: { message: zodError.message },
                                })
                            }
                        )
                    }
                }
            },
        },
        onSubmit: ({ value, formApi }) =>
            startTransition(async () => {
                try {
                    const input = {
                        size: value.size,
                        player: value.player,
                        tournament: value.tournament,
                        statuses: value.statuses
                    }

                    const response: any = await submitForm({
                        variables: {
                            input: isUpdate ? { _id: props._id, ...input } : input,
                        },
                    })

                    if (response.data?.createJersey?.ok || response.data?.updateJersey?.ok) {
                        onClose()
                    }
                } catch (error: any) {
                    console.error(error)
                    if (error.name == "CombinedGraphQLErrors") {
                        const fieldErrors = error.errors[0]?.extensions?.fields
                        if (fieldErrors) {
                            fieldErrors.forEach(
                                ({ path, message }: { path: string; message: string }) =>
                                    formApi.fieldInfo[
                                        path as keyof typeof formApi.fieldInfo
                                    ]?.instance?.setErrorMap({
                                        onSubmit: { message },
                                    })
                            )
                        }
                    }
                }
            }),
    })

    useEffect(() => {
        if (jerseyData?.jersey) {
            const { size, player, tournament, statuses } = jerseyData.jersey
            form.setFieldValue("size", size)
            form.setFieldValue("player", player._id)
            form.setFieldValue("tournament", tournament._id)
            form.setFieldValue("statuses", statuses)
        }
    }, [isUpdate, jerseyData])

    const onClose = () => {
        setOpen(false)
        props.onClose?.()
        form.reset()
    }

    const getPlayerDisplayName = (playerId: string) => {
        const player = playerOptions.find(p => p.value === playerId)
        return player?.label || "Select Player"
    }

    const getTournamentDisplayName = (tournamentId: string) => {
        const tournament = tournamentOptions.find(t => t.value === tournamentId)
        return tournament?.label || "Select Tournament"
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
                            Add Jersey
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onInteractOutside={(e) => e.preventDefault()}
                    showCloseButton={false}
                >
                    <DialogHeader>
                        <DialogTitle>{isUpdate ? "Edit Jersey" : "Create Jersey"}</DialogTitle>
                        <DialogDescription>
                            {isUpdate
                                ? "Update existing jersey details."
                                : "Create a new jersey assignment."}
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        className="-mt-2 mb-2"
                        id="jersey-form"
                        onSubmit={(e) => {
                            e.preventDefault()
                            form.handleSubmit()
                        }}
                    >
                        <FieldSet>
                            <form.Field
                                name="size"
                                children={(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Size</FieldLabel>
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
                                                        className="w-full justify-between font-normal -mt-2"
                                                        type="button"
                                                    >
                                                        {field.state.value || "Select Size"}
                                                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0">
                                                    <Command className="w-full">
                                                        <CommandInput placeholder="Search sizes..." />
                                                        <CommandList className="max-h-72 overflow-y-auto">
                                                            <CommandEmpty>No size found.</CommandEmpty>
                                                            <CommandGroup>
                                                                <Label className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
                                                                    Sizes
                                                                </Label>
                                                                {sizeOptions?.map((size) => (
                                                                    <CommandItem
                                                                        key={size.value}
                                                                        value={size.value}
                                                                        onSelect={(value) => {
                                                                            field.handleChange(value as JerseySize)
                                                                            setOpenSize(false)
                                                                        }}
                                                                    >
                                                                        <CheckIcon
                                                                            className={cn(
                                                                                "h-4 w-4",
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

                            <form.Field
                                name="player"
                                children={(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Player</FieldLabel>
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
                                                        className="w-full justify-between font-normal -mt-2"
                                                        type="button"
                                                    >
                                                        {getPlayerDisplayName(field.state.value)}
                                                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search players..." />
                                                        <CommandList className="max-h-72 overflow-y-auto">
                                                            <CommandEmpty>No player found.</CommandEmpty>
                                                            <CommandGroup>
                                                                <Label className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
                                                                    Players
                                                                </Label>
                                                                {playerOptions?.map((player) => (
                                                                    <CommandItem
                                                                        key={player.value}
                                                                        value={player.value}
                                                                        onSelect={(value) => {
                                                                            field.handleChange(value)
                                                                            setOpenPlayer(false)
                                                                        }}
                                                                        
                                                                    >
                                                                        <CheckIcon
                                                                            className={cn(
                                                                                "h-4 w-4",
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

                            <form.Field
                                name="tournament"
                                children={(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Tournament</FieldLabel>
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
                                                        className="w-full justify-between font-normal -mt-2"
                                                        type="button"
                                                    >
                                                        {getTournamentDisplayName(field.state.value)}
                                                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0">
                                                    <Command className="w-full">
                                                        <CommandInput placeholder="Search tournaments..." />
                                                        <CommandList className="max-h-72 overflow-y-auto">
                                                            <CommandEmpty>No tournament found.</CommandEmpty>
                                                            <CommandGroup>
                                                                <Label className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
                                                                    Tournaments
                                                                </Label>
                                                                {tournamentOptions?.map((tournament) => (
                                                                    <CommandItem
                                                                        key={tournament.value}
                                                                        value={tournament.value}
                                                                        onSelect={(value) => {
                                                                            field.handleChange(value)
                                                                            setOpenTournament(false)
                                                                        }}
                                                                    >
                                                                        <CheckIcon
                                                                            className={cn(
                                                                                "h-4 w-4",
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
                            form="jersey-form"
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
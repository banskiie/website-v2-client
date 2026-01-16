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
import React, { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { CheckIcon, ChevronsUpDownIcon, CirclePlus, CreditCard, Loader2 } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { JerseySize, JerseyStatus } from "@/types/jersey.interface"
import { JerseySchema } from "@/validators/jersey.validator"

interface PlayerOption {
    label: string
    value: string
}

interface Tournament {
    _id: string
    name: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

interface PlayerPaymentStatusEntry {
    entryNumber: string
    status: string
    pendingAmount: number
}

interface PlayerPaymentStatus {
    playerId: string
    tournamentId: string
    hasFullyPaidEntry: boolean
    paidEntryNumber: string
    latestStatus: string
    entries: PlayerPaymentStatusEntry[]
}

interface PlayerOptionsResponse {
    playerOptions: PlayerOption[]
}

interface PublicTournamentsResponse {
    publicTournaments: Tournament[]
}

interface PlayerPaymentStatusResponse {
    playerPaymentStatuses: PlayerPaymentStatus
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

interface ExistingJersey {
    playerName: string
    tournamentName: string
}

const PLAYER_OPTIONS = gql`
  query PlayerOptions {
    playerOptions {
      label
      value
    }
  }
`

const PUBLIC_TOURNAMENTS = gql`
  query PublicTournaments {
    publicTournaments {
      _id
      name
      isActive
      createdAt
      updatedAt
    }
  }
`

const PLAYER_PAYMENT_STATUS = gql`
  query PlayerPaymentStatus($playerId: ID!, $tournamentId: ID!) {
    playerPaymentStatuses(playerId: $playerId, tournamentId: $tournamentId) {
      playerId
      tournamentId
      hasFullyPaidEntry
      paidEntryNumber
      latestStatus
      entries {
        entryNumber
        status
        pendingAmount
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

type JerseyFormData = {
    size: JerseySize
    player: string
    tournament: string
}

type Props = {
    _id?: string
    onClose?: () => void
    defaultTournamentId?: string
    existingJerseys?: ExistingJersey[]
}

const JerseyFormDialog = (props: Props) => {
    const [open, setOpen] = useState(false)
    const isUpdate = Boolean(props._id)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [paymentStatus, setPaymentStatus] = useState<PlayerPaymentStatus | null>(null)
    const [checkingPayment, setCheckingPayment] = useState(false)

    const { data: playersData, loading: playersLoading } = useQuery<PlayerOptionsResponse>(
        PLAYER_OPTIONS,
        {
            skip: !open,
        }
    )

    const { data: tournamentsData, loading: tournamentsLoading } = useQuery<PublicTournamentsResponse>(
        PUBLIC_TOURNAMENTS,
        {
            skip: !open,
        }
    )

    const { refetch: checkPaymentStatus, loading: paymentStatusLoading } = useQuery<PlayerPaymentStatusResponse>(
        PLAYER_PAYMENT_STATUS,
        {
            skip: true,
        }
    )

    const [createJersey] = useMutation<CreateJerseyResponse>(CREATE_JERSEY)
    const [updateJersey] = useMutation<UpdateJerseyResponse>(UPDATE_JERSEY)

    const [openSize, setOpenSize] = useState(false)
    const [openPlayer, setOpenPlayer] = useState(false)
    const [openTournament, setOpenTournament] = useState(false)

    const sizeOptions = Object.values(JerseySize).map((size) => ({
        label: size,
        value: size,
    }))

    const playerOptions = playersData?.playerOptions || []

    const tournamentOptions = tournamentsData?.publicTournaments?.map(tournament => ({
        label: tournament.name,
        value: tournament._id,
        isActive: tournament.isActive
    })) || []

    const getActiveTournamentId = () => {
        if (props.defaultTournamentId) {
            return props.defaultTournamentId
        }

        if (tournamentOptions.length > 0) {
            return tournamentOptions[0].value
        }

        return ""
    }

    const checkPlayerPaymentStatus = async (playerId: string, tournamentId: string) => {
        if (!playerId || !tournamentId) {
            setPaymentStatus(null)
            return
        }

        setCheckingPayment(true)
        try {
            const result = await checkPaymentStatus({
                playerId,
                tournamentId
            })

            if (result.data?.playerPaymentStatuses) {
                setPaymentStatus(result.data.playerPaymentStatuses)
            } else {
                setPaymentStatus(null)
            }
        } catch (error) {
            setPaymentStatus(null)
        } finally {
            setCheckingPayment(false)
        }
    }

    const form = useForm({
        defaultValues: {
            size: JerseySize.M,
            player: "",
            tournament: "",
        },
        onSubmit: async ({ value }) => {
            setIsSubmitting(true)
            try {
                const shouldBePaid = paymentStatus?.hasFullyPaidEntry || false

                const fullData = {
                    size: value.size,
                    player: value.player,
                    tournament: value.tournament,
                    statuses: [{
                        status: shouldBePaid ? JerseyStatus.PAID : JerseyStatus.PENDING,
                        dateUpdated: new Date().toISOString(),
                        reason: shouldBePaid
                            ? `Automatically set to PAID due to fully paid entry (${paymentStatus?.paidEntryNumber})`
                            : "Initial status"
                    }]
                }

                const validationResult = JerseySchema.safeParse(fullData)
                if (!validationResult.success) {
                    console.error("Validation error:", validationResult.error)
                    return
                }

                const input = validationResult.data

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

                if (error.graphQLErrors && error.graphQLErrors.length > 0) {
                    error.graphQLErrors.forEach((err: any) => {
                        console.error("GraphQL Error:", err.message)
                    })
                }

                if (error.networkError) {
                    console.error("Network Error:", error.networkError)
                }
            } finally {
                setIsSubmitting(false)
            }
        },
    })

    // Auto-select tournament when dialog opens
    useEffect(() => {
        if (open && tournamentOptions.length > 0 && !isUpdate) {
            const activeTournamentId = getActiveTournamentId()
            if (activeTournamentId) {
                form.setFieldValue("tournament", activeTournamentId)
            }
        }
    }, [open, tournamentOptions, isUpdate])

    // Check payment status when player or tournament changes
    useEffect(() => {
        const playerId = form.getFieldValue('player')
        const tournamentId = form.getFieldValue('tournament')

        if (playerId && tournamentId) {
            checkPlayerPaymentStatus(playerId, tournamentId)
        } else {
            setPaymentStatus(null)
        }
    }, [form.getFieldValue('player'), form.getFieldValue('tournament')])

    const onClose = () => {
        setOpen(false)
        props.onClose?.()
        form.reset()
        setPaymentStatus(null)
    }

    const getPlayerDisplayName = (playerId: string) => {
        const player = playerOptions.find(p => p.value === playerId)
        return player?.label || "Select Player"
    }

    const getTournamentDisplayName = (tournamentId: string) => {
        const tournament = tournamentOptions.find(t => t.value === tournamentId)
        return tournament?.label || "Select Tournament"
    }

    const isLoading = playersLoading || tournamentsLoading || isSubmitting || checkingPayment || paymentStatusLoading

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
                        <form.Field
                            name="player"
                            children={(field) => {
                                const isInvalid = field.state.meta.errors.length > 0
                                return (
                                    <Field data-invalid={isInvalid}>
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
                                                    {field.state.value ? (
                                                        <span>{getPlayerDisplayName(field.state.value)}</span>
                                                    ) : (
                                                        "Select Player"
                                                    )}
                                                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder="Search players..." />
                                                    <CommandList className="max-h-72 overflow-y-auto">
                                                        <CommandEmpty>No player found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {playerOptions.map((player) => (
                                                                <CommandItem
                                                                    key={player.value}
                                                                    value={player.label}
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

                        <form.Field
                            name="tournament"
                            children={(field) => {
                                const isInvalid = field.state.meta.errors.length > 0
                                const currentTournament = tournamentOptions.find(t => t.value === field.state.value)

                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>Tournament *</FieldLabel>

                                        {tournamentOptions.length === 1 ? (
                                            <div className="p-2 border rounded-md bg-muted/50">
                                                <div className="text-sm font-medium">
                                                    {currentTournament?.label}
                                                    {currentTournament?.isActive && (
                                                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                                            Active
                                                        </span>
                                                    )}
                                                </div>
                                                <input
                                                    type="hidden"
                                                    name="tournament"
                                                    value={field.state.value}
                                                />
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    (Active tournament - automatically selected)
                                                </div>
                                            </div>
                                        ) : (
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
                                                            <CommandEmpty>No active tournaments found.</CommandEmpty>
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
                                                                        <div className="flex items-center justify-between w-full">
                                                                            <span>{tournament.label}</span>
                                                                            {tournament.isActive && (
                                                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                                                                    Active
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        )}

                                        {isInvalid && (
                                            <FieldError errors={field.state.meta.errors} />
                                        )}
                                    </Field>
                                )
                            }}
                        />

                        <form.Field
                            name="size"
                            children={(field) => {
                                const isInvalid = field.state.meta.errors.length > 0
                                return (
                                    <Field data-invalid={isInvalid}>
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
                                            <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
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

                        {/* Payment Status Display */}
                        {form.getFieldValue('player') && form.getFieldValue('tournament') && (
                            <div className="pt-2">
                                <FieldLabel>Payment Status</FieldLabel>
                                <div className="p-3 border rounded-md bg-muted/50">
                                    {checkingPayment || paymentStatusLoading ? (
                                        <div className="flex items-center justify-center p-2">
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            <span className="text-sm">Checking payment status...</span>
                                        </div>
                                    ) : paymentStatus ? (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium">
                                                    {getPlayerDisplayName(form.getFieldValue('player'))}
                                                </span>
                                                {paymentStatus.hasFullyPaidEntry ? (
                                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex items-center">
                                                        <CreditCard className="h-3 w-3 mr-1" />
                                                        Fully Paid
                                                    </span>
                                                ) : (
                                                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                                        Payment Pending
                                                    </span>
                                                )}
                                            </div>

                                            <div className="text-xs space-y-1">
                                                {paymentStatus.entries.length > 0 ? (
                                                    paymentStatus.entries.map((entry, index) => (
                                                        <div key={index} className="flex justify-between items-center p-1 border-b last:border-b-0">
                                                            <span>Entry {entry.entryNumber}:</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className={entry.pendingAmount === 0 ? "text-green-600" : "text-amber-600"}>
                                                                    ₱{entry.pendingAmount.toFixed(2)} pending
                                                                </span>
                                                                <span className="text-muted-foreground">({entry.status})</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-muted-foreground italic">
                                                        No entries found for this player in the selected tournament
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-2 text-xs text-muted-foreground">
                                                {paymentStatus.hasFullyPaidEntry ? (
                                                    <div className="text-green-600 flex items-center">
                                                        <CreditCard className="h-3 w-3 mr-1" />
                                                        Jersey is <strong className="ml-1">PAID</strong>
                                                    </div>
                                                ) : (
                                                    <div className="text-amber-600">
                                                        Jersey is <strong>PENDING</strong> until payment is completed
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground italic">
                                            No payment information found
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </FieldSet>
                </form>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        className="w-20"
                        type="submit"
                        form="jersey-form"
                        loading={isLoading}
                    >
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default JerseyFormDialog
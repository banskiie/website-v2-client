"use client"

import { useField, useForm } from "@tanstack/react-form"
import { createFormSchema } from "@/components/custom/data/reg_validator"
import { toast } from "sonner"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Mail, Phone, User, Users2, Check, UploadIcon, MailIcon, PhoneIcon, InfoIcon, User2, VenusAndMarsIcon, RulerIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { startTransition, use, useEffect, useState } from "react"
import Header from "@/components/custom/header-white"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useMutation, useQuery } from "@apollo/client/react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import Image from "next/image"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { PUBLIC_TOURNAMENTS } from "@/graphql/events/queries"
import { REGISTRY_ENTRY } from "@/graphql/registration/resolver"
import { PublicTournamentsData } from "@/components/custom/category-selection"
import { RegisterEntryResponse, RegisterEntryVariables } from "@/app/(public)/types/entry.interface"
import FloatingTicketing from "@/components/custom/ticket"

interface RegistrationPageProps {
    params: Promise<{ slug: string[] }>
}
const SuccessModal = ({ isOpen, onClose, message }: {
    isOpen: boolean;
    onClose: () => void;
    message: string;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="animate-in fade-in-90 zoom-in-90 duration-300 w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-center transform transition-all duration-300 scale-100">
                    <div className="mx-auto mb-4 sm:mb-6 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-green-500 animate-in zoom-in-50 duration-500">
                        <Check className="h-8 w-8 sm:h-10 sm:w-10 text-white animate-in fade-in-50 duration-700 delay-300" />
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 animate-in fade-in-50 duration-500 delay-200">
                        Successfully Registered!
                    </h3>

                    <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 animate-in fade-in-50 duration-500 delay-300">
                        {message}
                    </p>

                    <Button
                        onClick={onClose}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 animate-in fade-in-50 duration-500 delay-400"
                    >
                        OK
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function Page({ params }: RegistrationPageProps) {
    const paramData = use(params)
    const [tournamentId, eventId] = paramData.slug ?? []

    const { data, loading, error } = useQuery<PublicTournamentsData>(PUBLIC_TOURNAMENTS, {
        variables: { id: eventId ?? "" },
        skip: !eventId,
    })

    const [registryEntry, { loading: submitting, error: submitError }] = useMutation<RegisterEntryResponse, RegisterEntryVariables>(REGISTRY_ENTRY)

    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")
    const [syncPlayer1, setSyncPlayer1] = useState(false)
    const [syncPlayer2, setSyncPlayer2] = useState(false)

    const [player1IdPreview, setPlayer1IdPreview] = useState<string | null>(null)
    const [player2IdPreview, setPlayer2IdPreview] = useState<string | null>(null)

    const tournaments = data?.publicTournaments ?? []
    const tournament = tournaments.find((t: any) => t._id === tournamentId) ?? tournaments.find((t: any) => t.isActive)
    const event = tournament?.events?.find((e: any) => e._id === eventId) ?? tournament?.events?.[0]
    const hasFreeJersey = tournament?.settings?.hasFreeJersey || false

    // Add this useEffect to log price details automatically if ang page mag loads
    useEffect(() => {
        if (event && tournament) {
            console.log("=== 🎯 AUTOMATIC EARLY BIRD PRICE CHECK ===");
            console.log("Event:", event.name);
            console.log("Event Type:", event.type);
            console.log("Tournament settings.hasEarlyBird:", tournament.settings?.hasEarlyBird);

            // Check early bird at tournament level (settings.hasEarlyBird)
            const hasEarlyBird = tournament.settings?.hasEarlyBird;
            console.log("✅ Early Bird Active:", hasEarlyBird ? "YES" : "NO");

            // console.log("Regular Price:", event.pricePerPlayer);
            // console.log("Early Bird Price:", event.earlyBirdPricePerPlayer);

            const actualPricePerPlayer = hasEarlyBird && event?.earlyBirdPricePerPlayer
                ? event.earlyBirdPricePerPlayer
                : event.pricePerPlayer

            // console.log("💰 Price That Will Be Charged:", actualPricePerPlayer)

            if (actualPricePerPlayer) {
                const totalPrice = event.type === "DOUBLES"
                    ? actualPricePerPlayer * 2
                    : actualPricePerPlayer;
                console.log("💵 Total Amount:", totalPrice, event.currency)
            }

            console.log("=============================================");
        }
    }, [event, tournament])

    const isMixed = /mixed/i.test(event?.gender || "")
    const autoGender = event ? (
        /women|girls|female/i.test(event?.gender ?? "") ? "FEMALE" :
            /men|boys|male/i.test(event?.gender ?? "") ? "MALE" : null
    ) : null

    type FormFieldNames =
        | "club" | "clubEmail" | "clubContactNumber"
        | "player1FirstName" | "player1LastName" | "player1MiddleName" | "player1Suffix" | "player1Birthday"
        | "player1Email" | "player1ContactNumber" | "player1Gender" | "player1JerseySize" | "player1IdUpload"
        | "player2FirstName" | "player2LastName" | "player2MiddleName" | "player2Suffix" | "player2Birthday"
        | "player2Email" | "player2ContactNumber" | "player2Gender" | "player2JerseySize" | "player2IdUpload";

    const form = useForm({
        defaultValues: {
            club: "",
            clubEmail: "",
            clubContactNumber: "",
            player1FirstName: "",
            player1LastName: "",
            player1MiddleName: "",
            player1Suffix: "",
            player1Birthday: "",
            player1Email: "",
            player1ContactNumber: "",
            player1Gender: autoGender || "",
            player1IdUpload: null as FileList | null,
            ...(hasFreeJersey && { player1JerseySize: "" }),
            player2FirstName: "",
            player2LastName: "",
            player2MiddleName: "",
            player2Suffix: "",
            player2Birthday: "",
            player2Email: "",
            player2ContactNumber: "",
            player2Gender: autoGender || "",
            player2IdUpload: null as FileList | null,
            ...(hasFreeJersey && { player2JerseySize: "" }),
        },
        validators: {
            onChange: createFormSchema(event?.type || "SINGLES", hasFreeJersey) as any,
            onSubmit: createFormSchema(event?.type || "SINGLES", hasFreeJersey) as any,
        },
        onSubmit: async ({ value }) => {
            startTransition(async () => {
                console.log("=== FORM SUBMISSION TRIGGERED ===");
                console.log("Form Data:", JSON.stringify(value, null, 2));

                try {
                    console.log("Preparing GraphQL mutation input...");

                    const finalFormData = {
                        ...value,
                        player1Gender: value.player1Gender || autoGender || "",
                        player2Gender: value.player2Gender || autoGender || "",
                    };

                    const convertToISODateTime = (dateString?: string) => {
                        if (!dateString) return "";
                        return new Date(dateString + 'T00:00:00.000Z').toISOString();
                    };

                    const createPlayerEntry = (playerData: any, playerNum: number) => {
                        const baseEntry = {
                            firstName: playerData[`player${playerNum}FirstName`],
                            lastName: playerData[`player${playerNum}LastName`],
                            middleName: playerData[`player${playerNum}MiddleName`],
                            suffix: playerData[`player${playerNum}Suffix`],
                            birthDate: convertToISODateTime(playerData[`player${playerNum}Birthday`]),
                            email: playerData[`player${playerNum}Email`],
                            phoneNumber: playerData[`player${playerNum}ContactNumber`],
                            gender: playerData[`player${playerNum}Gender`],
                            // idUpload: playerData[`player${playerNum}IdUpload`]?.[0],
                        };

                        if (hasFreeJersey && playerData[`player${playerNum}JerseySize`]) {
                            return {
                                ...baseEntry,
                                jerseySize: playerData[`player${playerNum}JerseySize`]
                            };
                        }

                        return baseEntry;
                    };

                    // const hasEarlyBird = event?.hasEarlyBird || tournament?.hasEarlyBird
                    // const actualPricePerPlayer = hasEarlyBird && event?.earlyBirdPricePerPlayer
                    //     ? event.earlyBirdPricePerPlayer
                    //     : event?.pricePerPlayer;

                    const input = {
                        event: eventId,
                        club: finalFormData.club,
                        player1Entry: createPlayerEntry(finalFormData, 1),
                        ...(event?.type === "DOUBLES" && {
                            player2Entry: createPlayerEntry(finalFormData, 2)
                        })
                    }

                    console.log("GraphQL Input:", JSON.stringify(input, null, 2));
                    console.log("Calling registryEntry mutation...");

                    const result = await registryEntry({
                        variables: { input }
                    })

                    console.log("Mutation result:", result);

                    if (result.data?.registerEntry?.ok) {
                        console.log("Registration successful!", result.data.registerEntry.message)
                        const successMessage =
                            result.data?.registerEntry?.message ?? "You have been registered successfully."

                        setSuccessMessage(successMessage);
                        setShowSuccessModal(true);

                    } else {
                        console.error("Registration failed:", result.data?.registerEntry?.message);
                        toast.error(`Registration failed: ${result.data?.registerEntry?.message || "Unknown error"}`);
                    }
                } catch (error) {
                    console.error("Submission error:", error);
                    toast.error("An error occurred during submission. Please check the console for details.");
                }
            });
        },
    });

    const clubEmailField = useField({ form, name: 'clubEmail' })
    const clubContactNumberField = useField({ form, name: 'clubContactNumber' })

    const player1EmailField = useField({ form, name: 'player1Email' })
    const player1ContactNumberField = useField({ form, name: 'player1ContactNumber' })

    const player2EmailField = useField({ form, name: 'player2Email' })
    const player2ContactNumberField = useField({ form, name: 'player2ContactNumber' })

    useEffect(() => {
        const clubEmail = clubEmailField.getValue()
        const clubContact = clubContactNumberField.getValue()

        if (syncPlayer1) {
            player1EmailField.setValue(clubEmail ?? '')
            player1ContactNumberField.setValue(clubContact ?? '')
        }

        if (syncPlayer2 && event?.type === 'DOUBLES') {
            player2EmailField.setValue(clubEmail ?? '')
            player2ContactNumberField.setValue(clubContact ?? '')
        }
    }, [
        clubEmailField,
        clubContactNumberField,
        syncPlayer1,
        syncPlayer2,
        event?.type,
    ])

    const handleFileUpload = (playerNum: number, files: FileList | null, field: any) => {
        field.handleChange(files);

        if (files && files[0]) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (playerNum === 1) {
                        setPlayer1IdPreview(reader.result as string);
                    } else {
                        setPlayer2IdPreview(reader.result as string);
                    }
                };
                reader.readAsDataURL(file);
            } else {
                if (playerNum === 1) {
                    setPlayer1IdPreview(null);
                } else {
                    setPlayer2IdPreview(null);
                }
            }
        } else {
            if (playerNum === 1) {
                setPlayer1IdPreview(null);
            } else {
                setPlayer2IdPreview(null);
            }
        }
    };

    const handleModalClose = () => {
        setShowSuccessModal(false);
        setSyncPlayer1(false);
        setSyncPlayer2(false);
        setPlayer1IdPreview(null);
        setPlayer2IdPreview(null);

        form.reset({
            club: "",
            clubEmail: "",
            clubContactNumber: "",
            player1FirstName: "",
            player1LastName: "",
            player1MiddleName: "",
            player1Suffix: "",
            player1Birthday: "",
            player1Email: "",
            player1ContactNumber: "",
            player1Gender: autoGender || "",
            player1IdUpload: null,
            ...(hasFreeJersey && { player1JerseySize: "" }),
            player2FirstName: "",
            player2LastName: "",
            player2MiddleName: "",
            player2Suffix: "",
            player2Birthday: "",
            player2Email: "",
            player2ContactNumber: "",
            player2Gender: autoGender || "",
            player2IdUpload: null,
            ...(hasFreeJersey && { player2JerseySize: "" }),
        });

        const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
        fileInputs.forEach(input => {
            input.value = '';
        });
    }

    const getPlayerFieldNames = (playerKey: string): FormFieldNames[] => {
        const baseFields: FormFieldNames[] = [
            `${playerKey}FirstName` as FormFieldNames,
            `${playerKey}LastName` as FormFieldNames,
            `${playerKey}MiddleName` as FormFieldNames,
            `${playerKey}Suffix` as FormFieldNames,
            `${playerKey}Birthday` as FormFieldNames,
            `${playerKey}Gender` as FormFieldNames,
        ];

        if (hasFreeJersey) {
            return [...baseFields, `${playerKey}JerseySize` as FormFieldNames];
        }

        return baseFields;
    };

    const getContactFieldNames = (playerKey: string): FormFieldNames[] => {
        return [
            `${playerKey}Email` as FormFieldNames,
            `${playerKey}ContactNumber` as FormFieldNames,
        ];
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-green-700 text-lg font-medium">Loading tournament...</p>
            </div>
        )
    }

    if (!tournament) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-red-600 text-lg font-medium">
                    Tournament not found. Please go back and try again.
                </p>
            </div>
        )
    }

    return (
        <div className="bg-linear-to-br from-green-50 to-emerald-100">
            <Header />

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleModalClose}
                message={successMessage}
            />

            {submitError && (
                <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    <strong>Submission Error:</strong> {submitError.message}
                </div>
            )}

            <Card className="w-full max-w-6xl mx-auto mt-16">
                <CardHeader className="mx-auto w-full max-w-md text-center px-4 sm:px-6">
                    <CardTitle className="text-xl sm:text-2xl font-semibold">
                        {tournament.name}
                    </CardTitle>
                    <div className="flex items-center mt-2 sm:mt-3 justify-center gap-2 text-base sm:text-lg text-muted-foreground">
                        <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <CardDescription>
                            <span>
                                {`${new Date(
                                    tournament.dates.tournamentStart
                                ).toLocaleString("default", { month: "long" })} 
                ${new Date(tournament.dates.tournamentStart).getDate()}–${new Date(
                                    tournament.dates.tournamentEnd
                                ).getDate()}, 
                ${new Date(tournament.dates.tournamentStart).getFullYear()}`}
                            </span>
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent>
                    <form
                        id="registration-form"
                        onSubmit={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            form.handleSubmit()
                        }}
                        className="space-y-6"
                    >
                        <div className="max-w-5xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-md border border-green-200">
                            <div className="text-center space-y-4 mt-4">
                                <CardTitle className="flex items-center gap-2 text-green-800 justify-center">
                                    <div className="p-2 bg-linear-to-r from-green-400 to-teal-500 rounded-lg shadow-md">
                                        <Users2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                    <span className="text-xl sm:text-2xl font-semibold">Club Information</span>
                                </CardTitle>

                                <p className="text-green-800 text-sm">
                                    Provide your club details. You can use these contact details for players below.
                                </p>

                                <div className="max-w-2xl mx-auto">
                                    <form.Field
                                        name="club"
                                        children={(field) => {
                                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                            return (
                                                <Field data-invalid={isInvalid} className="text-left">
                                                    <FieldLabel htmlFor={field.name} className="text-green-800">
                                                        Club
                                                    </FieldLabel>

                                                    <InputGroup>
                                                        <InputGroupInput
                                                            id={field.name}
                                                            name={field.name}
                                                            value={field.state.value}
                                                            onBlur={field.handleBlur}
                                                            onChange={(e) => field.handleChange(e.target.value)}
                                                            placeholder="example.com"
                                                            aria-invalid={isInvalid}
                                                            className="!pl-5"
                                                        />

                                                        <InputGroupAddon align="inline-end">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <InputGroupButton className="rounded-full" size="icon-xs">
                                                                        <InfoIcon />
                                                                    </InputGroupButton>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Enter your Club Name or Affiliation Here.
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </InputGroupAddon>
                                                    </InputGroup>

                                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                </Field>
                                            )
                                        }}
                                    />
                                </div>
                                <div className="flex items-center justify-center gap-2 mt-6 mb-4">
                                    <div className="p-2 bg-linear-to-r from-green-400 to-teal-500 rounded-lg">
                                        <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                    <span className="text-green-800 font-semibold text-lg">
                                        Club Contact Information (Optional)
                                    </span>
                                </div>

                                <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                    {(["clubEmail", "clubContactNumber"] as FormFieldNames[]).map((name) => (
                                        <form.Field
                                            key={name}
                                            name={name}
                                            children={(field) => {
                                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                                const label =
                                                    name === "clubEmail" ? "Email Address" : "Contact Number"

                                                const inputType = name === "clubEmail" ? "email" : "tel"
                                                const placeholder =
                                                    name === "clubEmail" ? "Enter your email" : "Enter contact number"

                                                return (
                                                    <Field data-invalid={isInvalid} className="text-left">
                                                        <FieldLabel
                                                            htmlFor={field.name}
                                                            className="text-green-800"
                                                        >
                                                            {label}
                                                        </FieldLabel>

                                                        <InputGroup>
                                                            <InputGroupInput
                                                                id={field.name}
                                                                name={field.name}
                                                                type={inputType}
                                                                value={typeof field.state.value === "string" ? field.state.value : ""}
                                                                onBlur={field.handleBlur}
                                                                onChange={(e) => field.handleChange(e.target.value)}
                                                                placeholder={placeholder}
                                                                aria-invalid={isInvalid}
                                                                className="!pl-3"
                                                            />
                                                            <InputGroupAddon>
                                                                {name === "clubEmail" ? (
                                                                    <MailIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                                                                ) : (
                                                                    <div className="flex items-center gap-1 text-gray-500">
                                                                        <PhoneIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                                                        <span className="text-sm font-medium">+63</span>
                                                                    </div>
                                                                )}
                                                            </InputGroupAddon>
                                                        </InputGroup>

                                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                    </Field>
                                                )
                                            }}
                                        />
                                    ))}
                                </FieldGroup>


                                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 max-w-2xl mx-auto">
                                    <p className="text-green-700 text-sm text-left">
                                        💡 <strong>Tip:</strong> Use the switches in player contact sections below to automatically fill their contact information with these club details.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="text-start space-y-4 max-w-5xl mx-auto px-4 sm:px-0">
                            <CardTitle className="flex items-center gap-2 text-green-800 justify-start">
                                <div className="p-2 bg-linear-to-r from-yellow-400 to-orange-500 rounded-lg">
                                    <span className="text-white font-bold">💰</span>
                                </div>
                                <span className="text-lg sm:text-xl font-semibold">Registration Fee</span>
                            </CardTitle>

                            {event && tournament && (
                                <div className="bg-linear-to-r from-green-50 to-teal-50 p-4 sm:p-6 rounded-lg border border-green-200">

                                    <div className="flex flex-row justify-between items-start gap-4">

                                        <div>
                                            {tournament.settings?.hasEarlyBird ? (
                                                <Badge className="bg-green-100 text-green-800 border-green-300">
                                                    Early Bird Pricing
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-gray-100 text-gray-800 border-gray-300">
                                                    Regular Pricing
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="text-left sm:text-right">

                                            {tournament.settings?.hasEarlyBird &&
                                                event.earlyBirdPricePerPlayer && (
                                                    <div className="text-sm text-gray-500 line-through">
                                                        ₱{event.pricePerPlayer?.toLocaleString()}
                                                    </div>
                                                )}

                                            <div className="text-lg font-bold text-green-700">
                                                ₱{(
                                                    tournament.settings?.hasEarlyBird &&
                                                        event.earlyBirdPricePerPlayer
                                                        ? event.earlyBirdPricePerPlayer
                                                        : event.pricePerPlayer
                                                )?.toLocaleString()}
                                            </div>

                                            {/* Savings */}
                                            {/* {tournament.settings?.hasEarlyBird &&
                                                event.earlyBirdPricePerPlayer &&
                                                event.pricePerPlayer && (
                                                    <div className="text-xs text-yellow-700 flex items-center justify-end gap-1 mt-1">
                                                        🎉
                                                        <span>
                                                            ₱{(
                                                                event.pricePerPlayer -
                                                                event.earlyBirdPricePerPlayer
                                                            )?.toLocaleString()} Saved!
                                                        </span>
                                                    </div>
                                                )} */}
                                        </div>
                                    </div>

                                    <div className="mt-4 p-4 bg-green-100 text-green-800 border-green-300 rounded-lg border">
                                        <h4 className="font-semibold text-green-800 mb-2">Payment Instructions</h4>
                                        <p className="text-green-700 text-sm">
                                            After submitting this registration, you will receive payment instructions via email.
                                            Please complete your payment within 24 hours to secure your spot.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="max-w-5xl mx-auto mt-6 p-4 sm:p-6 bg-white rounded-xl shadow-md border border-green-200">
                            <div className="text-start space-y-4">
                                <CardTitle className="flex flex-col items-center gap-2 text-green-800 justify-center">
                                    <p className="text-green-700 text-sm">
                                        You are registering for this category
                                    </p>
                                    <div className="mx-auto p-3 bg-linear-to-r from-teal-100 to-teal-200 border border-teal-200 rounded-xl shadow-md w-max">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-linear-to-r from-teal-200 to-teal-300 rounded-full shadow-inner"></div>
                                            <span className="text-lg sm:text-xl font-semibold">
                                                {event?.name}
                                                {event?.type
                                                    ? ` (${event.type.charAt(0).toUpperCase()}${event.type.slice(1).toLowerCase()})`
                                                    : ""}
                                            </span>
                                        </div>
                                    </div>
                                </CardTitle>

                                {(event?.type === "DOUBLES" ? [1, 2] : [1]).map((playerNum) => {
                                    const playerKey = `player${playerNum}`;

                                    return (
                                        <div key={playerNum} className="pt-4">
                                            <div className="flex items-start gap-2 justify-start text-lime-800">
                                                <div className="p-2 rounded-lg bg-linear-to-r from-lime-400 to-emerald-500 mb-4">
                                                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                                </div>
                                                <span className="text-lg sm:text-xl font-semibold">
                                                    Personal Information for Player {playerNum}
                                                </span>
                                            </div>

                                            <FieldGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {getPlayerFieldNames(playerKey).map((name) => (
                                                    <form.Field
                                                        key={name}
                                                        name={name}
                                                        children={(field) => {
                                                            const isInvalid =
                                                                field.state.meta.isTouched && !field.state.meta.isValid;
                                                            const label =
                                                                name.includes("FirstName")
                                                                    ? "First Name"
                                                                    : name.includes("LastName")
                                                                        ? "Last Name"
                                                                        : name.includes("MiddleName")
                                                                            ? "Middle Name"
                                                                            : name.includes("Birthday")
                                                                                ? "Birthday"
                                                                                : name.includes("Gender")
                                                                                    ? "Gender"
                                                                                    : name.includes("JerseySize")
                                                                                        ? "Jersey Size"
                                                                                        : "Suffix";

                                                            return (
                                                                <Field data-invalid={isInvalid}>
                                                                    <FieldLabel htmlFor={field.name}>{label}</FieldLabel>

                                                                    {name.includes("Gender") ? (
                                                                        isMixed ? (
                                                                            <InputGroup>
                                                                                <InputGroupAddon className="mx-auto px-3">
                                                                                    <VenusAndMarsIcon className="w-4 h-4" />
                                                                                </InputGroupAddon>

                                                                                <Select
                                                                                    name={field.name}
                                                                                    value={typeof field.state.value === "string" ? field.state.value : ""}
                                                                                    onValueChange={field.handleChange}
                                                                                    aria-invalid={isInvalid}
                                                                                >
                                                                                    <SelectTrigger id={field.name} className="flex-1 !border-none">
                                                                                        <SelectValue placeholder="Select Gender" />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="MALE">Male</SelectItem>
                                                                                        <SelectItem value="FEMALE">Female</SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </InputGroup>
                                                                        ) : (
                                                                            <InputGroup>
                                                                                <InputGroupAddon className="mx-auto px-3">
                                                                                    <VenusAndMarsIcon className="w-4 h-4" />
                                                                                </InputGroupAddon>

                                                                                <InputGroupInput
                                                                                    value={autoGender === "MALE" ? "Male" : "Female"}
                                                                                    disabled
                                                                                    className="!border-green-200 !bg-gray-100 !pl-3"
                                                                                />
                                                                            </InputGroup>
                                                                        )
                                                                    ) : name.includes("JerseySize") ? (

                                                                        <InputGroup>
                                                                            <InputGroupAddon className="mx-auto px-3">
                                                                                <RulerIcon className="w-4 h-4" />
                                                                            </InputGroupAddon>
                                                                            <Select
                                                                                name={field.name}
                                                                                value={typeof field.state.value === "string" ? field.state.value : ""}
                                                                                onValueChange={field.handleChange}
                                                                                aria-invalid={isInvalid}
                                                                            >
                                                                                <SelectTrigger id={field.name} className="flex-1 !border-none">
                                                                                    <SelectValue placeholder="Select Jersey Size" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value="XS">Extra Small</SelectItem>
                                                                                    <SelectItem value="S">Small</SelectItem>
                                                                                    <SelectItem value="M">Medium</SelectItem>
                                                                                    <SelectItem value="L">Large</SelectItem>
                                                                                    <SelectItem value="XL">Extra Large</SelectItem>
                                                                                    <SelectItem value="XXL">Double Extra Large</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </InputGroup>

                                                                    ) : name.includes("Birthday") ? (
                                                                        <Popover>
                                                                            <PopoverTrigger asChild>
                                                                                <Button
                                                                                    variant="outline"
                                                                                    className={`w-full justify-start text-left font-normal border-green-200 bg-white ${!field.state.value && "text-muted-foreground"}`}
                                                                                >
                                                                                    {typeof field.state.value === "string" && field.state.value
                                                                                        ? format(new Date(field.state.value), "PPP")
                                                                                        : "Pick a date"}
                                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                                </Button>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                                <Calendar
                                                                                    mode="single"
                                                                                    selected={
                                                                                        typeof field.state.value === "string"
                                                                                            ? new Date(field.state.value)
                                                                                            : undefined
                                                                                    }
                                                                                    onSelect={(date) => {
                                                                                        field.handleChange(date ? format(date, "yyyy-MM-dd") : "")
                                                                                    }}
                                                                                    initialFocus
                                                                                    captionLayout="dropdown"
                                                                                    fromYear={1800}
                                                                                    toYear={new Date().getFullYear()}
                                                                                    className="rounded-md border cursor-pointer"
                                                                                />
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                    ) : (
                                                                        <InputGroup>
                                                                            <InputGroupInput
                                                                                id={field.name}
                                                                                name={field.name}
                                                                                value={typeof field.state.value === "string" ? field.state.value : ""}
                                                                                onBlur={field.handleBlur}
                                                                                onChange={(e) => field.handleChange(e.target.value)}
                                                                                placeholder={`Enter ${label}`}
                                                                                aria-invalid={isInvalid}
                                                                                className="!pl-4"
                                                                            />
                                                                            <InputGroupAddon className="mx-auto px-3">
                                                                                <User2 className="w-4 h-4" />
                                                                            </InputGroupAddon>
                                                                        </InputGroup>

                                                                    )}

                                                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                                </Field>
                                                            );
                                                        }}
                                                    />
                                                ))}
                                            </FieldGroup>

                                            <div className="mt-6">
                                                <form.Field
                                                    name={`player${playerNum}IdUpload` as FormFieldNames}
                                                    children={(field) => {
                                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                                        const preview = playerNum === 1 ? player1IdPreview : player2IdPreview;

                                                        return (
                                                            <Field data-invalid={isInvalid} className="text-left">
                                                                <div className="border-2 border-dashed border-green-300 rounded-2xl p-4 sm:p-6 bg-white flex flex-col items-center justify-center text-center gap-4">
                                                                    <div className="w-full flex flex-col text-left">
                                                                        <FieldLabel htmlFor={field.name} className="text-green-800 font-bold text-lg">
                                                                            Important: Please Upload a Clear ID for Verification <span className="text-red-500">*</span>
                                                                        </FieldLabel>
                                                                        <p className="text-gray-600 text-sm mt-1">
                                                                            To Complete your Registration, we need a Clear Copy of any type of Valid ID.
                                                                            Make sure the details are clearly visible and readable.
                                                                        </p>
                                                                    </div>

                                                                    <div className="w-full flex justify-center">
                                                                        {preview ? (
                                                                            <Image
                                                                                src={preview}
                                                                                alt="Uploaded ID Preview"
                                                                                width={400}
                                                                                height={250}
                                                                                className="max-w-full h-auto rounded-lg border shadow"
                                                                                style={{ maxWidth: 'min(400px, 100%)' }}
                                                                            />
                                                                        ) : (
                                                                            <Image
                                                                                src="/id.png"
                                                                                alt="Sample ID"
                                                                                width={400}
                                                                                height={250}
                                                                                className="max-w-full h-auto rounded-lg border shadow"
                                                                                style={{ maxWidth: 'min(400px, 100%)' }}
                                                                            />
                                                                        )}
                                                                    </div>

                                                                    <label
                                                                        htmlFor={`player${playerNum}IdUpload`}
                                                                        className="cursor-pointer w-full flex flex-col items-center justify-center p-4 sm:p-6 border-2 border-dashed border-green-300 rounded-xl bg-green-50 hover:bg-green-100 transition"
                                                                    >
                                                                        <UploadIcon className='w-6 h-6 sm:w-8 sm:h-8 text-green-600 mb-2' />

                                                                        <span className="text-green-700 font-medium text-sm sm:text-base">
                                                                            Drag & Drop your files or <span className="underline">Browse</span>
                                                                        </span>

                                                                        <input
                                                                            id={`player${playerNum}IdUpload`}
                                                                            name={field.name}
                                                                            type='file'
                                                                            accept='image/*,.pdf'
                                                                            className='hidden'
                                                                            onChange={(e) => {
                                                                                handleFileUpload(playerNum, e.target.files, field);
                                                                            }}
                                                                        />
                                                                    </label>
                                                                </div>
                                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                            </Field>
                                                        );
                                                    }}
                                                />
                                            </div>

                                            <div className="flex items-start justify-start gap-2 mt-6 mb-2">
                                                <div className="p-2 bg-linear-to-r from-green-500 to-teal-600 rounded-lg">
                                                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                                </div>
                                                <span className="text-green-800 font-semibold text-lg">
                                                    Contact Information {playerNum}
                                                </span>
                                            </div>

                                            <div className="flex items-start space-x-2 p-3 bg-green-100/50 rounded-lg border border-green-200 mb-4">
                                                <Switch
                                                    checked={playerNum === 1 ? syncPlayer1 : syncPlayer2}
                                                    onCheckedChange={(checked) => {
                                                        if (playerNum === 1) {
                                                            setSyncPlayer1(checked);
                                                            if (checked) {
                                                                form.setFieldValue("player1Email", form.getFieldValue("clubEmail") ?? "");
                                                                form.setFieldValue("player1ContactNumber", form.getFieldValue("clubContactNumber") ?? "");
                                                            }
                                                        } else {
                                                            setSyncPlayer2(checked);
                                                            if (checked) {
                                                                form.setFieldValue("player2Email", form.getFieldValue("clubEmail") ?? "");
                                                                form.setFieldValue("player2ContactNumber", form.getFieldValue("clubContactNumber") ?? "");
                                                            }
                                                        }
                                                    }}
                                                    className="cursor-pointer flex-shrink-0 mt-1"
                                                />
                                                <label className="text-sm text-green-800 font-medium flex-1">
                                                    Use Club Contact Information
                                                </label>
                                            </div>

                                            <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                                                {getContactFieldNames(playerKey).map((name) => (
                                                    <form.Field
                                                        key={name}
                                                        name={name}
                                                        children={(field) => {
                                                            const isInvalid =
                                                                field.state.meta.isTouched && !field.state.meta.isValid;
                                                            const label = name.includes("Email")
                                                                ? "Email Address"
                                                                : "Contact Number"

                                                            return (
                                                                <Field data-invalid={isInvalid} className="text-left">
                                                                    <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                                                                    <InputGroup>
                                                                        <InputGroupInput
                                                                            id={field.name}
                                                                            name={field.name}
                                                                            value={typeof field.state.value === "string" ? field.state.value : ""}
                                                                            onBlur={field.handleBlur}
                                                                            onChange={(e) => field.handleChange(e.target.value)}
                                                                            placeholder={`Enter ${label}`}
                                                                            aria-invalid={isInvalid}
                                                                            disabled={
                                                                                playerNum === 1 ? syncPlayer1 : syncPlayer2
                                                                            }
                                                                            className="!pl-3"
                                                                        />
                                                                        <InputGroupAddon className="mx-auto px-3">
                                                                            {name.includes("Email") ? (
                                                                                <MailIcon className="w-4 h-4" />
                                                                            ) : (
                                                                                <PhoneIcon className="w-4 h-4" />
                                                                            )}
                                                                        </InputGroupAddon>
                                                                    </InputGroup>

                                                                    {isInvalid && (
                                                                        <FieldError errors={field.state.meta.errors} />
                                                                    )}
                                                                </Field>
                                                            )
                                                        }}
                                                    />
                                                ))}
                                            </FieldGroup>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </form>
                </CardContent>

                <CardFooter>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 w-full">
                        <Button type="button" variant="outline" onClick={() => form.reset()} className="lg:w-1/2! w-auto! px-6 py-5 cursor-pointer">
                            Reset
                        </Button>
                        <Button
                            type="submit"
                            form="registration-form"
                            disabled={submitting}
                            className="lg:w-1/2! w-auto!  px-6 py-5 cursor-pointer"
                        >
                            {submitting ? "Submitting..." : "Submit"}
                        </Button>
                    </div>
                </CardFooter>
                <FloatingTicketing />
            </Card>
        </div>
    )
}
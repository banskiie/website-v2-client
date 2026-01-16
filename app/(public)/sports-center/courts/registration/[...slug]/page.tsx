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
import { CalendarIcon, Mail, Phone, User, Users2, Check, UploadIcon, MailIcon, PhoneIcon, InfoIcon, User2, VenusAndMarsIcon, RulerIcon, AlertCircle, ArrowLeftIcon } from "lucide-react"
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
import Link from "next/link"

interface RegistrationPageProps {
    params: Promise<{ slug: string[] }>
}

const RegistrationFeeModal = ({
    isOpen,
    onClose,
    event,
    tournament,
    onDontShowAgain
}: {
    isOpen: boolean,
    onClose: () => void,
    event: any,
    tournament: any,
    onDontShowAgain?: () => void
}) => {
    if (!isOpen || !event || !tournament) return null

    const pricePerPlayer = tournament.settings?.hasEarlyBird && event.earlyBirdPricePerPlayer ?
        event.earlyBirdPricePerPlayer :
        event.pricePerPlayer

    const totalPrice = event.type === "DOUBLES"
        ? pricePerPlayer * 2
        : pricePerPlayer

    const isDoubles = event.type === "DOUBLES"
    const isEarlyBird = tournament.settings?.hasEarlyBird

    const [dontShowChecked, setDontShowChecked] = useState(false)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="animate-in fade-in-90 zoom-in-90 duration-300 w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl p-6 text-center transform transition-all duration-300 scale-100 border border-green-200">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-green-800">
                            <div className="p-2 bg-linear-to-r bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-600 rounded-lg">
                                <span className="text-white font-bold text-xl">💰</span>
                            </div>
                            <span className="text-xl font-semibold">Registration Fee</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Close"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Event Info */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-teal-50 to-green-50 rounded-xl border border-teal-200">
                        <div className="text-sm text-green-700 mb-1">Event Category</div>
                        <div className="font-bold text-green-800 text-lg">
                            {event.name} ({event.type.charAt(0).toUpperCase() + event.type.slice(1).toLowerCase()})
                        </div>
                        {isEarlyBird && (
                            <div className="inline-block mt-2">
                                <Badge className="bg-linear-to-r from-yellow-100 to-orange-100 text-orange-800 border-orange-200">
                                    ⚡ Early Bird Discount Applied
                                </Badge>
                            </div>
                        )}
                    </div>

                    <div className="mb-6">
                        <h3 className="text-left text-sm font-semibold text-gray-700 mb-3">Fee Breakdown</h3>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-100">
                                <div className="flex items-center gap-1 text-left">
                                    <User className="w-4 h-4 text-green-600" />
                                    <div className="font-medium text-green-800">Per Player Fee</div>
                                </div>
                                <div className="font-bold text-green-700">
                                    ₱{pricePerPlayer?.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-linear-to-r from-green-50 to-teal-50 rounded-xl border border-green-300">
                            <div className="flex justify-between items-center">
                                <div className="text-left">
                                    <div className="font-semibold text-green-800 text-[15px] ">{isDoubles ? "Doubles" : "Single"} Category Total Amount</div>
                                    <div className="text-sm text-gray-600">
                                        {isDoubles ? "For both players" : "For single player"}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-green-700">
                                        ₱{totalPrice.toLocaleString()}
                                    </div>
                                    {isDoubles && (
                                        <div className="text-xs text-green-600 mt-1">
                                            (₱{pricePerPlayer?.toLocaleString()} × 2)
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-green-50 text-green-800 rounded-xl border border-green-200 text-left mb-4">
                        <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Payment Instructions
                        </h4>
                        <p className="text-green-700 text-xs">
                            After submitting this registration, you will receive payment instructions via email.
                            Please complete your payment within 24 hours to secure your spot.
                        </p>
                    </div>

                    {onDontShowAgain && (
                        <div className="flex items-center justify-start mb-4 p-2 bg-gray-50 rounded-lg">
                            <input
                                type="checkbox"
                                id="dontShowAgain"
                                checked={dontShowChecked}
                                onChange={(e) => setDontShowChecked(e.target.checked)}
                                className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor="dontShowAgain" className="text-sm text-gray-600 cursor-pointer">
                                Don't show this message again
                            </label>
                        </div>
                    )}

                    <Button
                        onClick={() => {
                            if (dontShowChecked && onDontShowAgain) {
                                onDontShowAgain()
                            }
                            onClose()
                        }}
                        className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-md"
                    >
                        Continue Registration
                    </Button>

                    <p className="text-xs text-gray-500 mt-4">
                        You can view this information anytime during registration
                    </p>
                </div>
            </div>
        </div>
    )
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
                        <Check className="h-8 w-8 sm:h-10 sm:h-10 text-white animate-in fade-in-50 duration-700 delay-300" />
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

const ValidationToast = ({ errors, title = "Validation Failed" }: { errors: string[], title?: string }) => {
    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-md">
            <div className="flex items-start gap-3">
                <div className="bg-red-100 p-2 rounded-full">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-red-800 mb-2">{title}</h4>
                    <div className="space-y-1">
                        {errors.map((error, index) => (
                            <p key={index} className="text-sm text-red-700">
                                • {error}
                            </p>
                        ))}
                    </div>
                    <div className="mt-3 flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-red-700 border-red-300 hover:bg-red-100"
                            onClick={() => toast.dismiss()}
                        >
                            Dismiss
                        </Button>
                        <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => {
                                const firstError = document.querySelector('[data-invalid="true"]');
                                if (firstError) {
                                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                                toast.dismiss();
                            }}
                        >
                            View Details
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const showValidationToast = (errors: string[], title?: string) => {
    toast.custom((t) => <ValidationToast errors={errors} title={title} />, {
        duration: 10000,
    });
}

export default function Page({ params }: RegistrationPageProps) {
    const paramData = use(params)
    const [tournamentId, eventId] = paramData.slug ?? []
    const [showFeeModal, setShowFeeModal] = useState(false)

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

    // Check if modal should be shown
    useEffect(() => {
        if (event && tournament && !showSuccessModal) {
            // Check if modal has been shown before (using localStorage for permanent storage)
            const modalKey = `registrationFeeModalShown-${tournamentId}-${eventId}`
            const hasSeenModalBefore = localStorage.getItem(modalKey)

            // Also check sessionStorage for current session
            const sessionKey = `registrationFeeModalSession-${tournamentId}-${eventId}`
            const hasSeenThisSession = sessionStorage.getItem(sessionKey)

            // Only show modal if user hasn't seen it before in localStorage AND hasn't seen it this session
            if (!hasSeenModalBefore && !hasSeenThisSession) {
                const timer = setTimeout(() => {
                    setShowFeeModal(true)
                }, 500)

                return () => clearTimeout(timer)
            }
        }
    }, [event, tournament, showSuccessModal, tournamentId, eventId])

    const handleFeeModalClose = () => {
        // Mark as seen for this session
        const sessionKey = `registrationFeeModalSession-${tournamentId}-${eventId}`
        sessionStorage.setItem(sessionKey, 'true')
        setShowFeeModal(false)
    }

    const handleDontShowAgain = () => {
        // Mark as permanently seen in localStorage
        const modalKey = `registrationFeeModalShown-${tournamentId}-${eventId}`
        localStorage.setItem(modalKey, 'true')
    }

    // Reset modal preferences when tournament/event changes
    useEffect(() => {
        // Clear any existing modal preferences when component mounts
        // This ensures modal shows when user visits a different tournament/event
        const modalKey = `registrationFeeModalSession-${tournamentId}-${eventId}`
        sessionStorage.removeItem(modalKey)
    }, [tournamentId, eventId])

    useEffect(() => {
        if (event && tournament) {
            console.log("=== 🎯 AUTOMATIC EARLY BIRD PRICE CHECK ===");
            console.log("Event:", event.name);
            console.log("Event Type:", event.type);
            console.log("Tournament settings.hasEarlyBird:", tournament.settings?.hasEarlyBird);

            const hasEarlyBird = tournament.settings?.hasEarlyBird;
            console.log("✅ Early Bird Active:", hasEarlyBird ? "YES" : "NO");

            const actualPricePerPlayer = hasEarlyBird && event?.earlyBirdPricePerPlayer
                ? event.earlyBirdPricePerPlayer
                : event.pricePerPlayer

            if (actualPricePerPlayer) {
                const totalPrice = event.type === "DOUBLES"
                    ? actualPricePerPlayer * 2
                    : actualPricePerPlayer;
                console.log("💵 Total Amount:", totalPrice, event.currency)
            }

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

    const calculateAgeAtTournament = (birthday: string | FileList | null): number | null => {
        if (typeof birthday !== 'string' || !birthday || !tournament?.dates?.tournamentStart) return null;

        const birthDate = new Date(birthday);
        const tournamentDate = new Date(tournament.dates.tournamentStart);

        let age = tournamentDate.getFullYear() - birthDate.getFullYear();
        const monthDiff = tournamentDate.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && tournamentDate.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    const getBirthdayString = (fieldValue: any): string | null => {
        if (typeof fieldValue === 'string' && fieldValue) {
            return fieldValue;
        }
        return null;
    };

    const extractAndDisplayBackendErrors = (graphQLError: any, form: any) => {
        const validationErrors = graphQLError?.extensions?.validationErrors;

        if (validationErrors && Array.isArray(validationErrors)) {
            console.log("Backend validation errors:", validationErrors);

            const fieldMapping: Record<string, string> = {
                'player1Entry.birthDate': 'player1Birthday',
                'player2Entry.birthDate': 'player2Birthday',
                'player1Entry.birthdate': 'player1Birthday',
                'player2Entry.birthdate': 'player2Birthday',
                'player1Entry.gender': 'player1Gender',
                'player2Entry.gender': 'player2Gender',
                'player1Entry.phoneNumber': 'player1ContactNumber',
                'player2Entry.phoneNumber': 'player2ContactNumber',
                'player1Entry.email': 'player1Email',
                'player2Entry.email': 'player2Email',
                'player1Entry.firstName': 'player1FirstName',
                'player2Entry.firstName': 'player2FirstName',
                'player1Entry.lastName': 'player1LastName',
                'player2Entry.lastName': 'player2LastName',
                'player1Entry.middleName': 'player1MiddleName',
                'player2Entry.middleName': 'player2MiddleName',
                'player1Entry.suffix': 'player1Suffix',
                'player2Entry.suffix': 'player2Suffix',
                'club': 'club',
            };

            let hasAgeError = false;
            let hasGenderError = false;
            const ageErrorMessages: string[] = [];
            const genderErrorMessages: string[] = [];

            validationErrors.forEach((err: any) => {
                const backendPath = Array.isArray(err.path) ? err.path.join('.') : err.path;
                const frontendFieldName = fieldMapping[backendPath] || err.path?.[0];

                if (frontendFieldName) {
                    console.log(`Mapping backend error: ${backendPath} -> ${frontendFieldName}`);

                    if (backendPath.includes('birthDate') || backendPath.includes('birthdate') ||
                        err.message.toLowerCase().includes('age') ||
                        err.message.toLowerCase().includes('birth year')) {
                        hasAgeError = true;
                        ageErrorMessages.push(err.message);
                    }

                    if (backendPath.includes('gender') ||
                        err.message.toLowerCase().includes('gender') ||
                        err.message.toLowerCase().includes('mixed') ||
                        err.message.toLowerCase().includes('different')) {
                        hasGenderError = true;
                        genderErrorMessages.push(err.message);
                    }

                    form.setFieldMeta(frontendFieldName as any, {
                        isTouched: true,
                        errors: [err.message],
                        errorMap: { onBlur: err.message }
                    });
                }
            });

            if (hasAgeError && ageErrorMessages.length > 0) {
                showValidationToast(ageErrorMessages, "Age Validation Failed");
            }

            if (hasGenderError && genderErrorMessages.length > 0) {
                showValidationToast(genderErrorMessages, "Gender Validation Failed");
            }

            return { hasAgeError, hasGenderError };
        }
        return { hasAgeError: false, hasGenderError: false };
    };

    const eventDataForValidation = event && tournament ? {
        ...event,
        tournamentStart: tournament.dates.tournamentStart,
        minAge: event.minAge,
        maxAge: event.maxAge,
        gender: event.gender
    } : undefined;

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
            onChange: createFormSchema(event?.type || "SINGLES", hasFreeJersey, eventDataForValidation) as any,
            onSubmit: createFormSchema(event?.type || "SINGLES", hasFreeJersey, eventDataForValidation) as any,
        },
        onSubmit: async ({ value }) => {
            startTransition(async () => {
                console.log("=== FORM SUBMISSION TRIGGERED ===");
                console.log("Form Data:", JSON.stringify(value, null, 2));

                try {
                    console.log("Preparing GraphQL mutation input...");

                    const schema = createFormSchema(event?.type || "SINGLES", hasFreeJersey, eventDataForValidation);
                    const validationResult = schema.safeParse(value);

                    if (!validationResult.success) {
                        const ageErrors = validationResult.error.issues.filter((err: any) =>
                            err.path.includes('Birthday') ||
                            err.message.toLowerCase().includes('age')
                        );

                        const genderErrors = validationResult.error.issues.filter((err: any) =>
                            err.path.includes('Gender') ||
                            err.message.toLowerCase().includes('gender') ||
                            err.message.toLowerCase().includes('mixed')
                        );

                        if (ageErrors.length > 0) {
                            const ageErrorMessages = ageErrors.map((err: any) => err.message);
                            showValidationToast(ageErrorMessages, "Age Validation Failed");

                            console.log("Age validation failed, stopping submission");
                            return;
                        }

                        if (genderErrors.length > 0) {
                            const genderErrorMessages = genderErrors.map((err: any) => err.message);
                            showValidationToast(genderErrorMessages, "Gender Validation Failed");

                            console.log("Gender validation failed, stopping submission");
                            return;
                        }

                        console.log("Form validation failed:", validationResult.error);
                        toast.error("Validation Error", {
                            description: "Please check all required fields.",
                            duration: 5000,
                        });
                        return;
                    }

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
                        };

                        if (hasFreeJersey && playerData[`player${playerNum}JerseySize`]) {
                            return {
                                ...baseEntry,
                                jerseySize: playerData[`player${playerNum}JerseySize`]
                            };
                        }

                        return baseEntry;
                    };

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
                } catch (error: any) {
                    console.error("Submission error:", error);

                    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
                        const graphQLError = error.graphQLErrors[0];

                        extractAndDisplayBackendErrors(graphQLError, form);

                        if (graphQLError.message) {
                            toast.error("Validation Error", {
                                description: graphQLError.message,
                                duration: 5000,
                            });
                        } else {
                            toast.error("Validation failed", {
                                description: "Please check all fields and try again.",
                                duration: 5000,
                            });
                        }
                    } else if (error.networkError) {
                        toast.error("Network Error", {
                            description: "Please check your internet connection and try again.",
                            duration: 5000,
                        });
                    } else {
                        toast.error("Submission Error", {
                            description: "An unexpected error occurred. Please try again.",
                            duration: 5000,
                        });
                    }
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

    const getAgeRequirementsText = () => {
        if (!event) return null;

        const minAge = (event as any).minAge;
        const maxAge = (event as any).maxAge;

        if (minAge && maxAge) {
            return `Ages ${minAge} to ${maxAge}`;
        } else if (minAge) {
            return `Minimum age: ${minAge}`;
        } else if (maxAge) {
            return `Maximum age: ${maxAge}`;
        }
        return null;
    };

    const EnhancedFieldError = ({ errors }: { errors: any[] }) => {
        if (!errors || errors.length === 0) return null;

        return (
            <div className="mt-2 space-y-1">
                {errors.map((error, index) => {
                    const errorMessage = typeof error === 'object' && error.message
                        ? error.message
                        : String(error);

                    return (
                        <div
                            key={index}
                            className="flex items-start gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200"
                        >
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                    );
                })}
            </div>
        );
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

            <RegistrationFeeModal
                isOpen={showFeeModal}
                onClose={handleFeeModalClose}
                onDontShowAgain={handleDontShowAgain}
                event={event}
                tournament={tournament}
            />

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleModalClose}
                message={successMessage}
            />
            <div className="p-4 sm:p-6 pb-0 mt-20">
                <Button variant="ghost" asChild className="text-green-700 hover:text-green-800 hover:bg-green-200">
                    <Link href="/sports-center/courts/categories" className="flex items-center gap-2">
                        <ArrowLeftIcon className="w-6 h-6" />
                        <span className="underline text-base">Back</span>
                    </Link>
                </Button>
            </div>
            <Card className="w-full max-w-6xl mx-auto -mt-1 mb-20 shadow-xl border border-green-200">
                <CardHeader className="mx-auto w-full max-w-md text-center px-4 sm:px-6">
                    <CardTitle className="text-xl sm:text-2xl font-semibold">
                        {tournament.name}
                    </CardTitle>
                    <div className="flex items-center mt-2 sm:mt-3 justify-center gap-2 text-base sm:text-lg text-muted-foreground">
                        <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <CardDescription>
                            <span>
                                {`${format(new Date(tournament.dates.tournamentStart), "MMM d")}–${format(
                                    new Date(tournament.dates.tournamentEnd),
                                    "d"
                                )}, ${format(new Date(tournament.dates.tournamentStart), "yyyy")}`}
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
                                    <span className="text-lg font-semibold">Club Information</span>
                                </CardTitle>

                                <p className="text-green-800 text-xs">
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
                                                        Club<span className="text-red-500">*</span>
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
                                                    {isInvalid && <EnhancedFieldError errors={field.state.meta.errors} />}
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
                                                            {label}<span className="text-red-500">*</span>
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

                                                        {isInvalid && <EnhancedFieldError errors={field.state.meta.errors} />}
                                                    </Field>
                                                )
                                            }}
                                        />
                                    ))}
                                </FieldGroup>


                                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 max-w-2xl mx-auto">
                                    <p className="text-green-700 text-sm text-left">
                                        💡 <strong>Tip:</strong> Use the <span className="font-medium">SWITCH</span> in <span className="font-bold">PLAYER CONTACT INFORMATION</span> below to automatically fill their contact information with these club details.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="max-w-5xl mx-auto mt-6 p-4 bg-white rounded-xl shadow-md">
                            <div className="text-start space-y-4">
                                <CardTitle className="flex flex-col items-center gap-2 text-green-800 justify-center">
                                    <p className="text-green-700 text-sm">
                                        You are registering for this category
                                    </p>

                                    <div className="flex flex-col sm:flex-row items-center justify-center">
                                        <div className="flex items-center gap-2">
                                            <div className="p-3 bg-linear-to-r from-teal-100 to-teal-200 border border-teal-200 rounded-xl shadow-md">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-linear-to-r from-teal-200 to-teal-300 rounded-full shadow-inner"></div>
                                                    <span className="text-md font-semibold">
                                                        {event?.name}
                                                        {event?.type
                                                            ? ` (${event.type.charAt(0).toUpperCase()}${event.type.slice(1).toLowerCase()})`
                                                            : ""}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {event && tournament && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        onClick={() => setShowFeeModal(true)}
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-10 w-10 rounded-full bg-white/80 hover:bg-green-50 cursor-pointer"
                                                    >
                                                        <InfoIcon className="w-5 h-5 text-green-700" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="text-sm">View registration fee details</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </div>
                                </CardTitle>

                                {(event?.type === "DOUBLES" ? [1, 2] : [1]).map((playerNum) => {
                                    const playerKey = `player${playerNum}`;

                                    return (
                                        <div key={playerNum} className="pt-4">
                                            <div className="flex items-start gap-2 justify-start text-lime-800">
                                                <div className="p-1.5 rounded-lg bg-linear-to-r from-lime-400 to-emerald-500 mb-4">
                                                    <User className="w-4 h-4 md:w-5 lg:h-5 text-white" />
                                                </div>
                                                <span className="text-md md:text-xl lg:text-xl font-semibold">
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

                                                            const birthdayString = name.includes("Birthday")
                                                                ? getBirthdayString(field.state.value)
                                                                : null;
                                                            const calculatedAge = birthdayString
                                                                ? calculateAgeAtTournament(birthdayString)
                                                                : null;
                                                            const minAge = (event as any)?.minAge;
                                                            const maxAge = (event as any)?.maxAge;

                                                            return (
                                                                <Field data-invalid={isInvalid} className="text-left">
                                                                    <div className="flex justify-between items-center mb-1">
                                                                        <FieldLabel htmlFor={field.name} className="text-green-800">
                                                                            {label} {!name.includes("MiddleName") && !name.includes("Suffix") && <span className="text-red-500">*</span>}
                                                                        </FieldLabel>

                                                                        {name.includes("Birthday") && birthdayString && tournament?.dates?.tournamentStart && (
                                                                            <div className="flex items-center gap-1">
                                                                                <span className={`text-xs font-medium px-2 py-0.5 rounded ${minAge !== undefined && maxAge !== undefined &&
                                                                                    calculatedAge !== null &&
                                                                                    calculatedAge >= minAge &&
                                                                                    calculatedAge <= maxAge
                                                                                    ? 'text-green-600 bg-green-50 border border-green-200'
                                                                                    : 'text-red-600 bg-red-50 border border-red-200'
                                                                                    }`}>
                                                                                    Age: {calculatedAge}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>

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
                                                                                    <SelectTrigger
                                                                                        id={field.name}
                                                                                        className={`flex-1 ${isInvalid ? 'border-red-300 bg-red-50' : 'border-green-200'}`}
                                                                                    >
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
                                                                                <SelectTrigger
                                                                                    id={field.name}
                                                                                    className={`flex-1 ${isInvalid ? 'border-red-300 bg-red-50' : 'border-green-200'}`}
                                                                                >
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
                                                                        <div className="space-y-2">
                                                                            <Popover>
                                                                                <PopoverTrigger asChild>
                                                                                    <Button
                                                                                        variant="outline"
                                                                                        className={`w-full justify-start text-left font-normal ${isInvalid ? 'border-red-300 bg-red-50' : 'border-green-200 bg-white'} ${!field.state.value && "text-muted-foreground"}`}
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
                                                                                        fromYear={1900}
                                                                                        toYear={new Date().getFullYear()}
                                                                                        className="rounded-md border cursor-pointer"
                                                                                    />
                                                                                </PopoverContent>
                                                                            </Popover>

                                                                        </div>
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
                                                                                className={`!pl-4 ${isInvalid ? 'border-red-300 bg-red-50' : ''}`}
                                                                            />
                                                                            <InputGroupAddon className="mx-auto px-3">
                                                                                <User2 className="w-4 h-4" />
                                                                            </InputGroupAddon>
                                                                        </InputGroup>

                                                                    )}

                                                                    {isInvalid && <EnhancedFieldError errors={field.state.meta.errors} />}
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
                                                                {isInvalid && <EnhancedFieldError errors={field.state.meta.errors} />}
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
                                                                    <FieldLabel htmlFor={field.name} className="text-green-800">
                                                                        {label} <span className="text-red-500">*</span>
                                                                    </FieldLabel>
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
                                                                            className={`!pl-3 ${isInvalid ? 'border-red-300 bg-red-50' : ''}`}
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
                                                                        <EnhancedFieldError errors={field.state.meta.errors} />
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
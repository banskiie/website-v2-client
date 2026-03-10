"use client"

import { useField, useForm } from "@tanstack/react-form"
import { createFormSchema } from "@/components/custom/data/reg_validator"
import { toast, Toaster } from "sonner"
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
import { CalendarIcon, Mail, Phone, User, Users2, Check, UploadIcon, MailIcon, PhoneIcon, InfoIcon, User2, VenusAndMarsIcon, RulerIcon, AlertCircle, ArrowLeftIcon, Loader2, Paperclip, XCircle, ChevronsUpDown, CheckIcon, File, Maximize2, ExternalLink, Download, Eye } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { startTransition, use, useEffect, useRef, useState } from "react"
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
import { motion, AnimatePresence } from "framer-motion"
import { ValidDocumentType } from "@/types/player.interface"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

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

    // Calculate if early bird is active based on date
    const hasEarlyBirdSetting = tournament.settings?.hasEarlyBird;
    const earlyBirdEndDate = tournament.dates?.earlyBirdPaymentEnd;
    const now = new Date();

    let isEarlyBirdActive = false;

    if (hasEarlyBirdSetting && earlyBirdEndDate) {
        const endDate = new Date(earlyBirdEndDate);
        isEarlyBirdActive = now <= endDate; // Early bird is active if current date is before/equal to end date
    }

    // Use early bird price only if early bird is active
    const pricePerPlayer = isEarlyBirdActive && event.earlyBirdPricePerPlayer ?
        event.earlyBirdPricePerPlayer :
        event.pricePerPlayer

    const totalPrice = event.type === "DOUBLES"
        ? pricePerPlayer * 2
        : pricePerPlayer

    const isDoubles = event.type === "DOUBLES"
    const isEarlyBird = isEarlyBirdActive; // Use the calculated value

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
                        {isEarlyBirdActive && (
                            <div className="inline-block mt-2">
                                <Badge className="bg-linear-to-r from-yellow-100 to-orange-100 text-orange-800 border-orange-200">
                                    Early Bird Discount Applied
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
                            After submitting this registration, please wait for an approval notice via <strong className="underline underline-offset-2">email</strong> before making any payment.
                            The <strong className="underline underline-offset-2">payment instructions</strong> will also be sent to your email. I advise <strong className="underline underline-offset-2">not to pay</strong> until you receive the approval notice.
                            Please complete your payment within the payment deadline.
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

const showValidationToast = (errors: string[], title?: string) => {
    // console.log("Showing Validation toast:", title, errors);

    if (!errors || errors.length === 0) return;

    toast.error(
        <div className="py-2">
            <h4 className="font-semibold text-red-800 mb-2">{title || "Validation Failed"}</h4>
            <div className="space-y-1 max-h-60 overflow-y-auto">
                {errors.slice(0, 5).map((error, index) => (
                    <p key={index} className="text-sm text-red-700">
                        • {error}
                    </p>
                ))}
                {errors.length > 5 && (
                    <p className="text-xs text-red-600 mt-1">
                        ...and {errors.length - 5} more errors
                    </p>
                )}
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
        </div>,
        {
            duration: 10000,
            position: 'bottom-right',
            icon: <AlertCircle className="w-5 h-5 text-red-600" />,
        }
    );
};

// New function to show field-specific toast
const showFieldErrorToast = (fieldName: string, errors: any[]) => {
    if (!errors || errors.length === 0) return;

    const errorMessages = errors.map(err =>
        typeof err === 'object' && err.message ? err.message : String(err)
    );

    // Format field name for display
    const displayFieldName = fieldName
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .replace('player1', 'Player 1')
        .replace('player2', 'Player 2');

    toast.warning(
        <div className="py-2">
            <h4 className="font-semibold text-amber-800 mb-2">{displayFieldName}</h4>
            <div className="space-y-1">
                {errorMessages.map((error, index) => (
                    <p key={index} className="text-sm text-amber-700">
                        • {error}
                    </p>
                ))}
            </div>
        </div>,
        {
            duration: 6000,
            position: 'bottom-right',
            icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
            id: `field-${fieldName}-${Date.now()}`,
        }
    );
};

const UploadingOverlay = () => (
    <motion.div
        className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        key="uploading-overlay"
    >
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-lg border">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mb-4"></div>
            <p className="text-lg font-medium text-gray-800 mb-2">
                Uploading document...
            </p>
            <p className="text-sm text-gray-500">Please wait</p>
        </div>
    </motion.div>
)

const FormSubmittingOverlay = () => (
    <motion.div
        className="fixed inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        key="submitting-overlay"
    >
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-2xl border border-green-200 max-w-md mx-4">
            <div className="relative mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-8 w-8 bg-green-600 rounded-full animate-pulse"></div>
                </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Processing Registration
            </h3>
            <p className="text-gray-600 text-center mb-4">
                Please wait while we submit your registration. This may take a few moments.
            </p>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <motion.div
                    className="bg-green-600 h-2 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "60%" }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                />
            </div>

            <p className="text-xs text-gray-500 mt-2">
                Do not close or refresh this page
            </p>
        </div>
    </motion.div>
)

// Document type options
const documentTypes = Object.values(ValidDocumentType).map((type) => ({
    label: type.toLocaleLowerCase().replaceAll("_", " "),
    value: type,
}))

// Document Preview Dialog Component
const DocumentPreviewDialog = ({
    open,
    onOpenChange,
    file,
    documentType
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    file: File | null;
    documentType: string;
}) => {
    if (!file) return null;

    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Document Preview: {documentType}
                    </DialogTitle>
                    <DialogDescription>
                        {file.name} - {(file.size / 1024 / 1024).toFixed(2)} MB
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-auto bg-gray-50 rounded-lg p-4">
                    {isImage ? (
                        <div className="flex items-center justify-center min-h-[60vh]">
                            <img
                                src={URL.createObjectURL(file)}
                                alt="Document Preview"
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>
                    ) : isPDF ? (
                        <div className="w-full h-[120vh]">
                            <iframe
                                src={URL.createObjectURL(file)}
                                className="w-full h-full border-0"
                                title={`PDF Preview: ${file.name}`}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[60vh]">
                            <File className="w-24 h-24 text-gray-400 mb-4" />
                            <p className="text-gray-600">This file type cannot be previewed</p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => window.open(URL.createObjectURL(file), '_blank')}
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Open in new tab
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                    <Button
                        onClick={() => {
                            const link = document.createElement('a');
                            link.href = URL.createObjectURL(file);
                            link.download = file.name;
                            link.click();
                        }}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

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
    const [filePlayer1, setFilePlayer1] = useState<File | null>(null)
    const [filePlayer2, setFilePlayer2] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const [selectedDocumentTypePlayer1, setSelectedDocumentTypePlayer1] = useState<ValidDocumentType>(ValidDocumentType.BIRTH_CERTIFICATE)
    const [selectedDocumentTypePlayer2, setSelectedDocumentTypePlayer2] = useState<ValidDocumentType>(ValidDocumentType.BIRTH_CERTIFICATE)
    const [openDocumentTypesPlayer1, setOpenDocumentTypesPlayer1] = useState(false)
    const [openDocumentTypesPlayer2, setOpenDocumentTypesPlayer2] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
    const [previewFile, setPreviewFile] = useState<File | null>(null)
    const [previewDocumentType, setPreviewDocumentType] = useState("")

    // Track shown field errors to prevent duplicate toasts
    const [shownFieldErrors, setShownFieldErrors] = useState<Set<string>>(new Set());

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
        const sessionKey = `registrationFeeModalSession-${tournamentId}-${eventId}`
        sessionStorage.setItem(sessionKey, 'true')
        setShowFeeModal(false)
    }

    const handleDontShowAgain = () => {
        const modalKey = `registrationFeeModalShown-${tournamentId}-${eventId}`
        localStorage.setItem(modalKey, 'true')
    }

    useEffect(() => {
        const modalKey = `registrationFeeModalSession-${tournamentId}-${eventId}`
        sessionStorage.removeItem(modalKey)
    }, [tournamentId, eventId])

    useEffect(() => {
        if (event && tournament) {
            const hasEarlyBird = tournament.settings?.hasEarlyBird;
            const earlyBirdEndDate = tournament.dates?.earlyBirdPaymentEnd;
            const now = new Date();

            let isEarlyBirdActive = false;

            if (hasEarlyBird && earlyBirdEndDate) {
                const endDate = new Date(earlyBirdEndDate);
                isEarlyBirdActive = now <= endDate
                // console.log("Early Bird End Date:", endDate);
                // console.log("Current Date:", now);
                // console.log("Is Early Bird Active:", isEarlyBirdActive);
            }
            // console.log("✅ Early Bird Active:", isEarlyBirdActive ? "YES" : "NO")

            const actualPricePerPlayer = isEarlyBirdActive && event?.earlyBirdPricePerPlayer
                ? event.earlyBirdPricePerPlayer
                : event.pricePerPlayer

            if (actualPricePerPlayer) {
                const totalPrice = event.type === "DOUBLES"
                    ? actualPricePerPlayer * 2
                    : actualPricePerPlayer;
                // console.log("💵 Total Amount:", totalPrice, event.currency)
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
            // console.log("Backend validation errors:", validationErrors);

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
                    // console.log(`Mapping backend error: ${backendPath} -> ${frontendFieldName}`);

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

            return { hasAgeError: false, hasGenderError: false };
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

    const uploadFile = async (file: File, folder: string): Promise<string | null> => {
        try {
            setIsUploading(true)

            const formData = new FormData()
            const fileExt = file.name.split('.').pop() || ''
            const fileName = `${folder}-${Date.now()}.${fileExt}`
            formData.append("file", file, fileName)

            const response = await fetch(`/api/upload/entry_requirement`, {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                throw new Error("Upload Failed")
            }

            const data = await response.json()
            toast.success("Document uploaded successfully!")
            return data.url
        } catch (error) {
            console.error("Error uploading file:", error)
            toast.error("Error uploading document. Please try again.")
            return null
        } finally {
            setIsUploading(false)
        }
    }

    const handleFileUpload = (playerNum: number, event: React.ChangeEvent<HTMLInputElement>, field: any) => {
        const uploadedFile = event.target.files?.[0]
        if (!uploadedFile) return

        // Validate file
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf']
        if (!validTypes.includes(uploadedFile.type)) {
            toast.error('Please upload a valid image file (JPEG, PNG, JPG, WEBP) or PDF')
            setFieldErrors(prev => ({ ...prev, [`filePlayer${playerNum}`]: 'Please upload a valid image file or PDF' }))
            return
        }
        if (uploadedFile.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB')
            setFieldErrors(prev => ({ ...prev, [`filePlayer${playerNum}`]: 'File size must be less than 10MB' }))
            return
        }

        field.handleChange([uploadedFile])

        if (playerNum === 1) {
            setFilePlayer1(uploadedFile)
        } else {
            setFilePlayer2(uploadedFile)
        }

        setFieldErrors(prev => ({ ...prev, [`filePlayer${playerNum}`]: '' }))

        // Create preview for images only
        if (uploadedFile.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = () => {
                const imageData = reader.result as string
                if (playerNum === 1) {
                    setPlayer1IdPreview(imageData)
                } else {
                    setPlayer2IdPreview(imageData)
                }
            }
            reader.readAsDataURL(uploadedFile)
        } else {
            // For PDFs, clear the image preview
            if (playerNum === 1) {
                setPlayer1IdPreview(null)
            } else {
                setPlayer2IdPreview(null)
            }
        }
    }

    const handleRemoveFile = (playerNum: number, field: any) => {
        field.handleChange(null)

        if (playerNum === 1) {
            setFilePlayer1(null)
            setPlayer1IdPreview(null)
        } else {
            setFilePlayer2(null)
            setPlayer2IdPreview(null)
        }

        setFieldErrors(prev => ({ ...prev, [`filePlayer${playerNum}`]: '' }))

        // Clear file input
        const fileInput = document.getElementById(`player${playerNum}IdUpload`) as HTMLInputElement
        if (fileInput) {
            fileInput.value = ''
        }
    }

    const handlePreviewFile = (file: File, documentType: string) => {
        setPreviewFile(file)
        setPreviewDocumentType(documentType)
        setPreviewDialogOpen(true)
    }

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
            // console.log("=== FORM SUBMISSION TRIGGERED ===");

            // Don't proceed if already submitting
            if (isSubmitting || isUploading) {
                // console.log("Already submitting, skipping...");
                return;
            }

            try {
                // console.log("Starting form submission...");

                setIsSubmitting(true);

                setShownFieldErrors(new Set());

                const schema = createFormSchema(event?.type || "SINGLES", hasFreeJersey, eventDataForValidation);
                const validationResult = schema.safeParse(value);

                if (!validationResult.success) {
                    // console.log("Form validation failed:", validationResult.error);
                    // console.log("Number of errors:", validationResult.error.issues.length);

                    const allErrors = validationResult.error.issues.map((err: any) => err.message);

                    const fieldErrors: Record<string, string[]> = {};
                    validationResult.error.issues.forEach((err: any) => {
                        const fieldPath = err.path.join('.');
                        if (!fieldErrors[fieldPath]) {
                            fieldErrors[fieldPath] = [];
                        }
                        fieldErrors[fieldPath].push(err.message);
                    });

                    const ageErrors = validationResult.error.issues.filter((err: any) =>
                        err.path.some(path =>
                            String(path).toLowerCase().includes('birthday') ||
                            String(path).toLowerCase().includes('age') ||
                            String(path).toLowerCase().includes('birth')
                        ) ||
                        err.message.toLowerCase().includes('age') ||
                        err.message.toLowerCase().includes('birth year') ||
                        err.message.toLowerCase().includes('minimum age') ||
                        err.message.toLowerCase().includes('maximum age')
                    );

                    const genderErrors = validationResult.error.issues.filter((err: any) =>
                        err.path.some(path =>
                            String(path).toLowerCase().includes('gender')
                        ) ||
                        err.message.toLowerCase().includes('gender') ||
                        err.message.toLowerCase().includes('mixed') ||
                        err.message.toLowerCase().includes('male') ||
                        err.message.toLowerCase().includes('female')
                    );

                    const requiredFieldErrors = validationResult.error.issues.filter((err: any) =>
                        err.message.toLowerCase().includes('required') ||
                        err.code === 'invalid_type' && err.message.includes('Required')
                    );

                    const documentErrors = validationResult.error.issues.filter((err: any) =>
                        err.path.some(path =>
                            String(path).toLowerCase().includes('upload') ||
                            String(path).toLowerCase().includes('document') ||
                            String(path).toLowerCase().includes('file')
                        ) ||
                        err.message.toLowerCase().includes('upload') ||
                        err.message.toLowerCase().includes('document') ||
                        err.message.toLowerCase().includes('file')
                    );

                    const contactErrors = validationResult.error.issues.filter((err: any) =>
                        err.path.some(path =>
                            String(path).toLowerCase().includes('email') ||
                            String(path).toLowerCase().includes('contact') ||
                            String(path).toLowerCase().includes('phone')
                        ) ||
                        err.message.toLowerCase().includes('email') ||
                        err.message.toLowerCase().includes('phone') ||
                        err.message.toLowerCase().includes('contact')
                    );

                    // Show appropriate toast based on error types
                    if (ageErrors.length > 0) {
                        const ageErrorMessages = ageErrors.map((err: any) => err.message);
                        showValidationToast(ageErrorMessages, "🎂 Age Validation Failed");

                        // Also scroll to the first age-related field
                        setTimeout(() => {
                            const firstAgeField = document.querySelector('[name*="Birthday"]');
                            if (firstAgeField) {
                                firstAgeField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }, 100);
                    }

                    if (genderErrors.length > 0) {
                        const genderErrorMessages = genderErrors.map((err: any) => err.message);
                        showValidationToast(genderErrorMessages, "⚥ Gender Validation Failed");
                    }

                    if (documentErrors.length > 0) {
                        const documentErrorMessages = documentErrors.map((err: any) => err.message);
                        showValidationToast(documentErrorMessages, "📄 Document Upload Required");
                    }

                    if (contactErrors.length > 0) {
                        const contactErrorMessages = contactErrors.map((err: any) => err.message);
                        showValidationToast(contactErrorMessages, "📞 Contact Information Error");
                    }

                    // If there are other errors but no specific categories, show a general validation toast
                    const otherErrors = validationResult.error.issues.filter((err: any) =>
                        !ageErrors.includes(err) &&
                        !genderErrors.includes(err) &&
                        !documentErrors.includes(err) &&
                        !contactErrors.includes(err)
                    );

                    if (otherErrors.length > 0) {
                        const otherErrorMessages = otherErrors.map((err: any) => err.message);
                        showValidationToast(otherErrorMessages, "❌ Validation Failed");
                    } else if (requiredFieldErrors.length > 0 &&
                        ageErrors.length === 0 &&
                        genderErrors.length === 0 &&
                        documentErrors.length === 0 &&
                        contactErrors.length === 0) {
                        showValidationToast(
                            requiredFieldErrors.map((err: any) => err.message),
                            "⚠️ Required Fields Missing"
                        );
                    }

                    Object.entries(fieldErrors).forEach(([fieldPath, errors]) => {
                        const fieldName = fieldPath as any;

                        try {
                            // @ts-ignore - Bypass TypeScript for this line if needed
                            form.setFieldMeta(fieldName, {
                                isTouched: true,
                                errorMap: {
                                    onBlur: errors[0],
                                    onChange: errors[0]
                                }
                            });
                        } catch (e) {
                            // console.log("Error setting field meta:", e);
                        }

                        const currentValue = form.getFieldValue(fieldName);
                        if (currentValue !== undefined) {
                            form.setFieldValue(fieldName, currentValue);
                        }
                    });

                    if (allErrors.length > 3) {
                        toast.error(
                            <div>
                                <strong>Multiple Fields Need Attention</strong>
                                <p className="text-sm mt-1">Found {allErrors.length} validation error(s). Please check the highlighted fields below.</p>
                            </div>,
                            {
                                duration: 8000,
                                position: 'bottom-right',
                            }
                        );
                    }

                    setIsSubmitting(false);
                    return;
                }

                // console.log("Form validation passed, proceeding...");

                const finalFormData = {
                    ...value,
                    player1Gender: value.player1Gender || autoGender || "",
                    player2Gender: value.player2Gender || autoGender || "",
                };

                const convertToISODateTime = (dateString?: string) => {
                    if (!dateString) return "";
                    return new Date(dateString + 'T00:00:00.000Z').toISOString();
                };

                let documentUrlPlayer1 = ""
                let documentUrlPlayer2 = ""

                if (filePlayer1) {
                    // console.log("Uploading player 1 document...");
                    setIsUploading(true);
                    try {
                        const uploadedUrl = await uploadFile(filePlayer1, `registration-player1-${Date.now()}`)
                        if (uploadedUrl) {
                            documentUrlPlayer1 = uploadedUrl
                            // console.log("Player 1 document uploaded:", uploadedUrl);
                        }
                    } catch (error) {
                        // console.error("Failed to upload player 1 document:", error);
                        toast.error("Failed to upload document for Player 1", {
                            description: "Please try again or contact support if the issue persists.",
                            duration: 5000,
                        });
                        setIsSubmitting(false);
                        return;
                    } finally {
                        setIsUploading(false);
                    }
                }

                if (filePlayer2 && event?.type === "DOUBLES") {
                    // console.log("Uploading player 2 document...");
                    setIsUploading(true);
                    try {
                        const uploadedUrl = await uploadFile(filePlayer2, `registration-player2-${Date.now()}`)
                        if (uploadedUrl) {
                            documentUrlPlayer2 = uploadedUrl
                            // console.log("Player 2 document uploaded:", uploadedUrl);
                        }
                    } catch (error) {
                        // console.error("Failed to upload player 2 document:", error);
                        toast.error("Failed to upload document for Player 2", {
                            description: "Please try again or contact support if the issue persists.",
                            duration: 5000,
                        });
                        setIsSubmitting(false);
                        return;
                    } finally {
                        setIsUploading(false);
                    }
                }

                const createPlayerEntry = (playerData: any, playerNum: number, documentUrl: string) => {
                    const baseEntry = {
                        firstName: playerData[`player${playerNum}FirstName`],
                        middleName: playerData[`player${playerNum}MiddleName`],
                        lastName: playerData[`player${playerNum}LastName`],
                        suffix: playerData[`player${playerNum}Suffix`],
                        birthDate: convertToISODateTime(playerData[`player${playerNum}Birthday`]),
                        email: playerData[`player${playerNum}Email`],
                        phoneNumber: playerData[`player${playerNum}ContactNumber`],
                        gender: playerData[`player${playerNum}Gender`],
                    };

                    const jerseySize = playerData[`player${playerNum}JerseySize`];
                    const entryWithJersey = jerseySize
                        ? { ...baseEntry, jerseySize }
                        : baseEntry

                    if (documentUrl) {
                        const documentType = playerNum === 1 ? selectedDocumentTypePlayer1 : selectedDocumentTypePlayer2;
                        return {
                            ...entryWithJersey,
                            validDocuments: [{
                                documentURL: documentUrl,
                                documentType: documentType,
                                dateUploaded: new Date().toISOString(),
                            }]
                        };
                    }

                    return entryWithJersey;
                };

                const input = {
                    event: eventId,
                    club: finalFormData.club,
                    player1Entry: createPlayerEntry(finalFormData, 1, documentUrlPlayer1),
                    ...(event?.type === "DOUBLES" && {
                        player2Entry: createPlayerEntry(finalFormData, 2, documentUrlPlayer2)
                    })
                }

                // console.log("GraphQL Input:", JSON.stringify(input, null, 2));
                // console.log("Calling registryEntry mutation...");

                const result = await registryEntry({
                    variables: { input }
                })

                // console.log("Mutation result:", result);

                if (result.data?.registerEntry?.ok) {
                    // console.log("Registration successful!", result.data.registerEntry.message)
                    const successMessage =
                        result.data?.registerEntry?.message ?? "You have been registered successfully."

                    setSuccessMessage(successMessage);
                    setShowSuccessModal(true);

                    toast.success("Registration Successful!", {
                        description: successMessage,
                        duration: 5000,
                    });

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
            } finally {
                // console.log("Submission process completed, resetting submitting state");
                setIsSubmitting(false);
            }
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

    const handleModalClose = () => {
        setIsSubmitting(false);
        setShowSuccessModal(false);
        setSyncPlayer1(false);
        setSyncPlayer2(false);
        setPlayer1IdPreview(null);
        setPlayer2IdPreview(null);
        setFilePlayer1(null);
        setFilePlayer2(null);
        setFieldErrors({});
        setSelectedDocumentTypePlayer1(ValidDocumentType.BIRTH_CERTIFICATE);
        setSelectedDocumentTypePlayer2(ValidDocumentType.BIRTH_CERTIFICATE);

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
            `${playerKey}MiddleName` as FormFieldNames,
            `${playerKey}LastName` as FormFieldNames,
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

    const EnhancedFieldError = ({ errors, fieldName }: { errors: any[], fieldName?: string }) => {
        const hasShownToast = useRef(false);

        useEffect(() => {
            if (errors && errors.length > 0 && fieldName && !hasShownToast.current) {
                const firstError = typeof errors[0] === 'object' && errors[0].message
                    ? errors[0].message
                    : String(errors[0]);

                const errorKey = `${fieldName}-${firstError}`;

                if (!shownFieldErrors.has(errorKey)) {
                    showFieldErrorToast(fieldName, errors);

                    setShownFieldErrors(prev => new Set(prev).add(errorKey));
                    hasShownToast.current = true;
                }
            } else if (!errors || errors.length === 0) {
                hasShownToast.current = false;
            }
        }, [errors, fieldName]);

        if (!errors || errors.length === 0) return null;

        return (
            <div className="space-y-1">
                {errors.map((error, index) => {
                    const errorMessage = typeof error === 'object' && error.message
                        ? error.message
                        : String(error);

                    return (
                        <div
                            key={index}
                            className="flex items-start gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200"
                        >
                            <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const DocumentTypeSelector = ({ playerNum }: { playerNum: number }) => {
        const selectedDocumentType = playerNum === 1 ? selectedDocumentTypePlayer1 : selectedDocumentTypePlayer2;
        const setSelectedDocumentType = playerNum === 1 ? setSelectedDocumentTypePlayer1 : setSelectedDocumentTypePlayer2;
        const openDocumentTypes = playerNum === 1 ? openDocumentTypesPlayer1 : openDocumentTypesPlayer2;
        const setOpenDocumentTypes = playerNum === 1 ? setOpenDocumentTypesPlayer1 : setOpenDocumentTypesPlayer2;

        return (
            <Field className="text-left">
                <FieldLabel htmlFor={`documentType${playerNum}`} className="text-green-800">
                    Document Type (Player {playerNum}) <span className="text-red-500">*</span>
                </FieldLabel>
                <Popover
                    open={openDocumentTypes}
                    onOpenChange={setOpenDocumentTypes}
                    modal
                >
                    <PopoverTrigger asChild>
                        <Button
                            id={`documentType${playerNum}`}
                            name={`documentType${playerNum}`}
                            disabled={isUploading || submitting}
                            aria-expanded={openDocumentTypes}
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between font-normal capitalize -mt-2"
                            type="button"
                        >
                            {selectedDocumentType
                                ? documentTypes.find(
                                    (o) => o.value === selectedDocumentType
                                )?.label
                                : "Select Document Type"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                        <Command
                            filter={(value, search) =>
                                documentTypes
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
                            <CommandInput placeholder="Search document type..." />
                            <CommandList className="max-h-72 overflow-y-auto">
                                <CommandEmpty>
                                    No document type found.
                                </CommandEmpty>
                                <CommandGroup>
                                    <Label className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
                                        Document Types
                                    </Label>
                                    {documentTypes?.map((o) => (
                                        <CommandItem
                                            key={o.value}
                                            value={o.value}
                                            onSelect={(v) => {
                                                setSelectedDocumentType(v as ValidDocumentType)
                                                setOpenDocumentTypes(false)
                                            }}
                                            className="capitalize"
                                        >
                                            <CheckIcon
                                                className={cn(
                                                    "h-4 w-4",
                                                    selectedDocumentType === o.value
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
                <p className="text-xs text-gray-500 mt-1">
                    Select the type of document you're uploading (ID, Passport, etc.)
                </p>
            </Field>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen gap-4">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-green-200"></div>
                    <div className="w-16 h-16 rounded-full border-4 border-green-600 border-t-transparent animate-spin absolute top-0 left-0"></div>
                </div>
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

            <Toaster
                position="bottom-right"
                richColors
                closeButton
                theme="light"
                expand={true}
                duration={5000}
                visibleToasts={5}
                toastOptions={{
                    style: {
                        zIndex: 9999,
                    },
                }}
            />

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

            <DocumentPreviewDialog
                open={previewDialogOpen}
                onOpenChange={setPreviewDialogOpen}
                file={previewFile}
                documentType={previewDocumentType}
            />

            <AnimatePresence>
                {isUploading && <UploadingOverlay key="uploading-overlay" />}
                {(isSubmitting || submitting) && <FormSubmittingOverlay key="submitting-overlay" />}
            </AnimatePresence>

            <div className="p-4 sm:p-6 pb-0 mt-20 mb-2 md:mb-0 lg:mb-0 xl:mb-0 2xl:mb-0">
                <Button variant="ghost" asChild className="text-green-700 hover:text-green-800 hover:bg-green-200">
                    <Link href="/sports-center/courts/categories" className="flex items-center gap-2">
                        <ArrowLeftIcon className="w-6 h-6" />
                        <span className="underline text-md ">Back</span>
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
                        onSubmit={async (e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            await form.handleSubmit()
                        }}
                        className="space-y-6"
                    >
                        <div className="max-w-5xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-md border border-green-200">
                            <div className="text-center space-y-4 mt-4">
                                <CardTitle className="flex items-center gap-2 text-green-800 justify-center">
                                    <div className="p-2 bg-linear-to-r from-green-400 to-teal-500 rounded-lg shadow-md">
                                        <Users2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                    <span className="text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-semibold">Club Information</span>
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
                                                            placeholder="Enter your Club Name or Affiliation Here"
                                                            aria-invalid={isInvalid}
                                                            className="!pl-5 pb-1.5 placeholder:text-sm"
                                                            disabled={isSubmitting || isUploading}

                                                        />

                                                        <InputGroupAddon align="inline-end">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <InputGroupButton className="rounded-full" size="icon-xs" disabled={isSubmitting || isUploading}>
                                                                        <InfoIcon />
                                                                    </InputGroupButton>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Enter your Club Name or Affiliation Here.
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </InputGroupAddon>
                                                    </InputGroup>
                                                    {isInvalid && <EnhancedFieldError errors={field.state.meta.errors} fieldName={field.name} />}
                                                </Field>
                                            )
                                        }}
                                    />
                                </div>
                                <div className="flex items-center justify-center gap-2 mt-6 mb-4">
                                    <div className="p-2 bg-linear-to-r from-green-400 to-teal-500 rounded-lg">
                                        <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                    <span className="text-green-800 font-semibold text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg">
                                        Club Contact Information (Optional)
                                    </span>
                                </div>

                                <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                    {(["clubEmail", "clubContactNumber"] as FormFieldNames[]).map((name) => (
                                        <form.Field
                                            key={name}
                                            name={name}
                                            children={(field) => {
                                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                                const label = name === "clubEmail" ? "Email Address" : "Contact Number";
                                                const isEmail = name === "clubEmail";

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
                                                                type={isEmail ? "email" : "tel"}
                                                                value={typeof field.state.value === "string" ? field.state.value : ""}
                                                                onBlur={field.handleBlur}
                                                                onChange={(e) => {
                                                                    if (isEmail) {
                                                                        field.handleChange(e.target.value);
                                                                    } else {
                                                                        // Phone number field - fixed for 11 digits starting with 09
                                                                        // Remove any non-digit characters
                                                                        const rawValue = e.target.value.replace(/\D/g, '');

                                                                        // Ensure it starts with 09 and limit to 11 digits
                                                                        let formattedValue = rawValue;
                                                                        if (formattedValue && !formattedValue.startsWith('9')) {
                                                                            // If it starts with just 9, make it 09
                                                                            if (formattedValue.startsWith('9')) {
                                                                                formattedValue = '0' + formattedValue;
                                                                            } else {
                                                                                formattedValue = '9' + formattedValue;
                                                                            }
                                                                        }
                                                                        if (formattedValue.length > 10) {
                                                                            formattedValue = formattedValue.substring(0, 10);
                                                                        }

                                                                        field.handleChange(formattedValue);
                                                                    }
                                                                }}
                                                                placeholder={isEmail ? "Enter your email" : "Enter 10-digit number starting with 9"}
                                                                aria-invalid={isInvalid}
                                                                className="!pl-3 pb-1.5 placeholder:text-sm"
                                                                disabled={isSubmitting || isUploading}
                                                            />
                                                            <InputGroupAddon>
                                                                {isEmail ? (
                                                                    <MailIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                                                                ) : (
                                                                    <div className="flex items-center gap-1 text-gray-500">
                                                                        <PhoneIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                                                        <span className="text-sm font-medium">+63</span>
                                                                    </div>
                                                                )}
                                                            </InputGroupAddon>
                                                        </InputGroup>

                                                        {!isEmail && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Example: 9123456789
                                                            </div>
                                                        )}

                                                        {isInvalid && <EnhancedFieldError errors={field.state.meta.errors} fieldName={field.name} />}
                                                    </Field>
                                                );
                                            }}
                                        />
                                    ))}
                                </FieldGroup>


                                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 max-w-2xl mx-auto">
                                    <p className="text-green-700 text-sm text-left">
                                        💡 <strong>Tip:</strong> Use the <span className="font-medium">Button</span> in <span className="font-bold">PLAYER CONTACT INFORMATION</span> below to automatically fill in their contact information with these club details that you input.
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
                                                        type="button"
                                                        className="h-10 w-10 rounded-full bg-white/80 hover:bg-green-50 cursor-pointer"
                                                        disabled={isSubmitting || isUploading}
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
                                                                    : name.includes("MiddleName")
                                                                        ? "Middle Name"
                                                                        : name.includes("LastName")
                                                                            ? "Last Name"
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
                                                                                <span className={`text-xs font-medium px-2 rounded ${minAge !== undefined && maxAge !== undefined &&
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
                                                                                    disabled={isSubmitting || isUploading}
                                                                                >
                                                                                    <SelectTrigger
                                                                                        id={field.name}
                                                                                        className={`flex-1 ${isInvalid ? 'border-red-300 bg-red-50' : 'border-green-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
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
                                                                                disabled={isSubmitting || isUploading}
                                                                            >
                                                                                <SelectTrigger
                                                                                    id={field.name}
                                                                                    className={`flex-1 ${isInvalid ? 'border-red-300 bg-red-50' : 'border-green-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
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
                                                                                        className={`w-full justify-start text-left font-normal ${isInvalid ? 'border-red-300 bg-red-50' : 'border-green-200 bg-white'} ${!field.state.value && "text-muted-foreground"} disabled:opacity-50 disabled:cursor-not-allowed`}
                                                                                        disabled={isSubmitting || isUploading}
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
                                                                                        disabled={isSubmitting || isUploading}
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
                                                                                className={`${isInvalid ? 'border-red-300 bg-red-50' : ''} disabled:opacity-50 disabled:cursor-not-allowed pb-1.5 placeholder:text-sm`}
                                                                                disabled={isSubmitting || isUploading}
                                                                            />
                                                                            <InputGroupAddon className="mx-auto px-3">
                                                                                <User2 className="w-4 h-4" />
                                                                            </InputGroupAddon>
                                                                        </InputGroup>

                                                                    )}

                                                                    {isInvalid && <EnhancedFieldError errors={field.state.meta.errors} fieldName={field.name} />}
                                                                </Field>
                                                            );
                                                        }}
                                                    />
                                                ))}
                                            </FieldGroup>

                                            <div className="mt-6">
                                                {/* Document Type Selector */}
                                                <div className="mb-4">
                                                    <DocumentTypeSelector playerNum={playerNum} />
                                                </div>

                                                <form.Field
                                                    name={`player${playerNum}IdUpload` as FormFieldNames}
                                                    children={(field) => {
                                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                                        const preview = playerNum === 1 ? player1IdPreview : player2IdPreview;
                                                        const file = playerNum === 1 ? filePlayer1 : filePlayer2;
                                                        const selectedDocumentType = playerNum === 1 ? selectedDocumentTypePlayer1 : selectedDocumentTypePlayer2;

                                                        return (
                                                            <Field data-invalid={isInvalid} className="text-left">
                                                                <div className="border-2 border-dashed border-green-300 rounded-2xl p-4 sm:p-6 bg-white flex flex-col items-center justify-center text-center gap-4">
                                                                    <div className="w-full flex flex-col text-left">
                                                                        <FieldLabel htmlFor={field.name} className="text-green-800 font-bold text-md text-center md:text-lg lg:text-lg xl:text-lg 2xl:text-lg">
                                                                            Upload your Document for Verification <span className="text-red-500">*</span>
                                                                        </FieldLabel>
                                                                        <p className="text-gray-600 text-xs md:text-sm lg:text-sm xl:text-sm 2xl:text-sm mt-1">
                                                                            To complete your registration, we need a clear copy of your {selectedDocumentType.replaceAll("_", " ").toLowerCase()}.
                                                                            Make sure the details are clearly visible and readable.
                                                                        </p>
                                                                    </div>

                                                                    {file && (
                                                                        <div className="w-full mb-4 p-3 bg-white border rounded-lg">
                                                                            <div className="flex items-center gap-2">
                                                                                <Paperclip className="w-4 h-4 text-gray-500" />
                                                                                <div className="flex-1">
                                                                                    <p className="text-sm font-medium truncate">
                                                                                        {file.name}
                                                                                    </p>
                                                                                    <p className="text-xs text-gray-500">
                                                                                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="flex items-center gap-1">
                                                                                    <Button
                                                                                        type="button"
                                                                                        onClick={() => handleRemoveFile(playerNum, field)}
                                                                                        disabled={isUploading || submitting}
                                                                                        className="text-gray-500 hover:text-red-500 hover:bg-gray-200! bg-transparent transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed p-1"
                                                                                        size="icon"
                                                                                    >
                                                                                        <XCircle className="w-4 h-4" />
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                            {isUploading && (
                                                                                <div className="mt-2">
                                                                                    <div className="w-full bg-gray-200 rounded-full h-1">
                                                                                        <div className="bg-green-600 h-1 rounded-full animate-pulse"></div>
                                                                                    </div>
                                                                                    <p className="text-xs text-gray-500 mt-1">Uploading...</p>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    <div className="w-full flex justify-center mb-4">
                                                                        {preview && file?.type?.startsWith('image/') ? (
                                                                            <Image
                                                                                src={preview}
                                                                                alt={`Uploaded ${selectedDocumentType} Preview`}
                                                                                width={400}
                                                                                height={250}
                                                                                className="max-w-full h-auto rounded-lg border shadow cursor-pointer hover:opacity-90 transition-opacity"
                                                                                style={{ maxWidth: 'min(400px, 100%)' }}
                                                                                onClick={() => file && handlePreviewFile(file, selectedDocumentType.replaceAll("_", " "))}
                                                                            />
                                                                        ) : file && file.type === 'application/pdf' ? (
                                                                            <div className="w-[70%]">
                                                                                <div className="h-[500px] border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                                                                                    <iframe
                                                                                        src={URL.createObjectURL(file)}
                                                                                        className="w-full h-full border-0"
                                                                                        title={`PDF Preview: ${file.name}`}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        ) : file && !file.type?.startsWith('image/') ? (
                                                                            <div className="w-full max-w-[300px] h-[200px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                                                                                <div className="text-center">
                                                                                    <File className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                                                                    <p className="text-sm font-medium text-gray-700">{file.name}</p>
                                                                                    <p className="text-xs text-gray-500 mt-1">Document</p>
                                                                                    <div className="mt-2 flex items-center justify-center gap-1 text-blue-600 text-xs">
                                                                                        <Eye className="w-3 h-3" />
                                                                                        <span>Uploaded successfully</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
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
                                                                        className={`cursor-pointer w-full flex flex-col items-center justify-center p-4 sm:p-6 border-2 border-dashed rounded-xl transition ${fieldErrors[`filePlayer${playerNum}`]
                                                                            ? 'border-red-300 bg-red-50 hover:bg-red-100'
                                                                            : 'border-green-300 bg-green-50 hover:bg-green-100'
                                                                            } ${(submitting || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                    >
                                                                        {isUploading && (playerNum === 1 && filePlayer1 || playerNum === 2 && filePlayer2) ? (
                                                                            <div className="flex flex-col items-center">
                                                                                <Loader2 className="w-6 h-6 mb-2 animate-spin text-green-600" />
                                                                                <span className="font-medium text-sm text-green-700">Uploading...</span>
                                                                                <span className="text-xs text-gray-500 mt-1">Please wait</span>
                                                                            </div>
                                                                        ) : (
                                                                            <>
                                                                                <UploadIcon className={`w-6 h-6 mb-2 ${fieldErrors[`filePlayer${playerNum}`] ? 'text-red-500' : 'text-green-600'
                                                                                    }`} />
                                                                                <span className={`font-medium text-sm ${fieldErrors[`filePlayer${playerNum}`] ? 'text-red-700' : 'text-green-700'
                                                                                    }`}>
                                                                                    Upload your files or <span className="underline">Browse</span>
                                                                                </span>
                                                                                <span className="text-xs text-gray-500 mt-1">
                                                                                    Supports images (JPEG, PNG, JPG, WEBP) and PDF files up to 10MB
                                                                                </span>
                                                                            </>
                                                                        )}
                                                                        <input
                                                                            id={`player${playerNum}IdUpload`}
                                                                            name={field.name}
                                                                            type='file'
                                                                            accept='image/*,.pdf'
                                                                            className='hidden'
                                                                            onChange={(e) => handleFileUpload(playerNum, e, field)}
                                                                            disabled={isUploading || submitting}
                                                                        />
                                                                    </label>

                                                                    {fieldErrors[`filePlayer${playerNum}`] && (
                                                                        <p className="text-xs text-red-500 mt-2">{fieldErrors[`filePlayer${playerNum}`]}</p>
                                                                    )}
                                                                </div>
                                                                {isInvalid && <EnhancedFieldError errors={field.state.meta.errors} fieldName={field.name} />}
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

                                            <div className="flex items-start gap-4 p-4 bg-green-100 rounded-lg border-2 border-green-300 mb-4">

                                                <div className="flex flex-col items-center">
                                                    <Switch
                                                        checked={playerNum === 1 ? syncPlayer1 : syncPlayer2}
                                                        onCheckedChange={(checked) => {
                                                            if (playerNum === 1) {
                                                                setSyncPlayer1(checked);
                                                                if (checked) {
                                                                    form.setFieldValue(
                                                                        "player1Email",
                                                                        form.getFieldValue("clubEmail") ?? ""
                                                                    );
                                                                    form.setFieldValue(
                                                                        "player1ContactNumber",
                                                                        form.getFieldValue("clubContactNumber") ?? ""
                                                                    );
                                                                }
                                                            } else {
                                                                setSyncPlayer2(checked);
                                                                if (checked) {
                                                                    form.setFieldValue(
                                                                        "player2Email",
                                                                        form.getFieldValue("clubEmail") ?? ""
                                                                    );
                                                                    form.setFieldValue(
                                                                        "player2ContactNumber",
                                                                        form.getFieldValue("clubContactNumber") ?? ""
                                                                    );
                                                                }
                                                            }
                                                        }}
                                                        className="scale-110 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={isSubmitting || isUploading}
                                                    />

                                                    <span
                                                        className={`mt-1 text-xs font-semibold ${(playerNum === 1 ? syncPlayer1 : syncPlayer2)
                                                            ? "text-green-700"
                                                            : "text-gray-500"
                                                            }`}
                                                    >
                                                        {(playerNum === 1 ? syncPlayer1 : syncPlayer2) ? "ON" : "OFF"}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-green-900">
                                                        Use Club Contact Information
                                                    </span>
                                                    <span className="text-xs text-green-700">
                                                        Click here to Turn <span className="font-semibold">ON</span> to <span className="italic font-medium underline underline-offset-2">copy the club email & contact number</span> from the <span className="font-medium underline underline-offset-2"> Club Contact Information </span> Above.
                                                    </span>
                                                </div>

                                            </div>

                                            <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                                                {([`player${playerNum}Email`, `player${playerNum}ContactNumber`] as FormFieldNames[]).map((name) => (
                                                    <form.Field
                                                        key={name}
                                                        name={name}
                                                        children={(field) => {
                                                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                                            const label = name.includes("Email") ? "Email Address" : "Contact Number";
                                                            const isEmail = name.includes("Email");

                                                            return (
                                                                <Field data-invalid={isInvalid} className="text-left">
                                                                    <FieldLabel htmlFor={field.name} className="text-green-800">
                                                                        {label} <span className="text-red-500">*</span>
                                                                    </FieldLabel>
                                                                    <InputGroup>
                                                                        <InputGroupInput
                                                                            id={field.name}
                                                                            name={field.name}
                                                                            type={isEmail ? "email" : "tel"}
                                                                            value={typeof field.state.value === "string" ? field.state.value : ""}
                                                                            onBlur={field.handleBlur}
                                                                            onChange={(e) => {
                                                                                if (isEmail) {
                                                                                    field.handleChange(e.target.value);
                                                                                } else {
                                                                                    // Phone number field - fixed for 11 digits starting with 09
                                                                                    // Remove any non-digit characters
                                                                                    const rawValue = e.target.value.replace(/\D/g, '');

                                                                                    // Ensure it starts with 09 and limit to 11 digits
                                                                                    let formattedValue = rawValue;
                                                                                    if (formattedValue && !formattedValue.startsWith('9')) {
                                                                                        // If it starts with just 9, make it 09
                                                                                        if (formattedValue.startsWith('9')) {
                                                                                            formattedValue = '0' + formattedValue;
                                                                                        } else {
                                                                                            formattedValue = '9' + formattedValue;
                                                                                        }
                                                                                    }
                                                                                    if (formattedValue.length > 10) {
                                                                                        formattedValue = formattedValue.substring(0, 10);
                                                                                    }

                                                                                    field.handleChange(formattedValue);
                                                                                }
                                                                            }}
                                                                            placeholder={isEmail ? "Enter email address" : "Enter 10-digit number starting with 9"}
                                                                            aria-invalid={isInvalid}
                                                                            disabled={
                                                                                (playerNum === 1 ? syncPlayer1 : syncPlayer2) || submitting || isUploading
                                                                            }
                                                                            className={`!pl-3 ${isInvalid ? 'border-red-300 bg-red-50' : ''} disabled:opacity-50 disabled:cursor-not-allowed pb-1.5 placeholder:text-sm`}
                                                                        />
                                                                        <InputGroupAddon className="mx-auto px-3">
                                                                            {isEmail ? (
                                                                                <MailIcon className="w-4 h-4" />
                                                                            ) : (
                                                                                <PhoneIcon className="w-4 h-4" />
                                                                            )}
                                                                        </InputGroupAddon>
                                                                    </InputGroup>

                                                                    {/* Helper text for phone number only */}
                                                                    {!isEmail && (
                                                                        <div className="text-xs text-gray-500 mt-1">
                                                                            Example: 9123456789
                                                                        </div>
                                                                    )}

                                                                    {isInvalid && (
                                                                        <EnhancedFieldError errors={field.state.meta.errors} fieldName={field.name} />
                                                                    )}
                                                                </Field>
                                                            );
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
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => form.reset()}
                            disabled={isSubmitting || isUploading}
                            className="lg:w-1/2! w-auto! px-6 py-5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Reset
                        </Button>
                        <Button
                            type="submit"
                            form="registration-form"
                            disabled={isSubmitting || submitting || isUploading}
                            className="lg:w-1/2! w-auto! px-6 py-5 cursor-pointer disabled:cursor-not-allowed relative overflow-hidden bg-green-600 hover:bg-green-700 text-white"
                        >
                            <span className={`transition-opacity duration-200 ${isSubmitting || submitting ? 'opacity-0' : 'opacity-100'}`}>
                                Submit Registration
                            </span>
                            {(isSubmitting || submitting) && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span className="ml-2">Submitting...</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </CardFooter>
                <FloatingTicketing />
            </Card>
        </div>
    )
}
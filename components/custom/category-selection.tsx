"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Trophy, ExternalLink, Users, User, X, Search, UploadIcon, Clock, CheckCircle, Mail, Wallet2Icon, AlertTriangle, Trash, GripVertical, Loader2, Paperclip, XCircle } from "lucide-react"
import { categories, Gender } from "./data/items"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import SortableEntry from "./sortable-entries"
import useSmoothScroll from '@/hooks/useSmoothScroll'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DataReconciliationModal } from "./data-reconciliation"
import ScrollIndicator from "./scroll-indicator"
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react"
import { ENTRY_EVENT_AMOUNT_DETAILS, PUBLIC_TOURNAMENTS } from "@/graphql/events/queries"
import { ENTRY_STATUS_HISTORY } from "@/graphql/entries/queries"
import { ITournament } from "@/app/(public)/types/tournament.interface"
import { CheckEntryData, EntryAmountDetailsData, EntryStatusHistoryData, IEntryAmountDetails, IEntryStatus } from "@/app/(public)/types/entry.interface"
import Tesseract from "tesseract.js"
import { CreatePaymentInput, createPaymentResponse } from "@/app/(public)/types/payment.interface"
import { CREATE_PAYMENT } from "@/graphql/payments/mutation"
import { toast } from "sonner"
import { Input } from "../ui/input"
// const tournament = tournaments.find(t => t.isActive)

export type PublicTournamentsData = {
  publicTournaments: ITournament[]
}

const getCategoryPrice = (category: string, type?: string) => {
  if (category.includes("Beginner"))
    return { perPlayer: "₱675.00 per player", perPair: "₱1,350.00 per pair" }

  if (category.includes(" G"))
    return { perPlayer: "₱1,000.00 per player", perPair: "₱2,000.00 per pair" }

  if (category.includes(" F"))
    return { perPlayer: "₱1,200.00 per player", perPair: "₱2,400.00 per pair" }

  if (category.includes(" E"))
    return { perPlayer: "₱1,400.00 per player", perPair: "₱2,800.00 per pair" }

  if (category.includes("Advanced"))
    return { perPlayer: "₱1,600.00 per player", perPair: "₱3,200.00 per pair" }

  if (category.includes("Open")) {
    if (type === "Doubles" || category.includes("Doubles"))
      return { perPlayer: "₱2,900.00 per player", perPair: "₱5,800.00 per pair" }
    if (type === "Singles" || category.includes("Singles"))
      return { perPlayer: "₱1,450.00 per player" }
  }

  if (category.includes("Legend"))
    return { perPlayer: "₱1,600.00 per player", perPair: "₱3,200.00 per pair" }

  return { perPlayer: "Pricing TBA" }
}

export function CategoryCard({
  name,
  type,
  level,
  gender,
  onClick
}: {
  name: string
  type: "Doubles" | "Singles"
  level: string
  gender: Gender
  onClick: () => void
}) {
  const levelColor = {
    "13U": "bg-green-100 text-green-800",
    "16U": "bg-blue-100 text-blue-800",
    "9U": "bg-yellow-100 text-yellow-800",
    Beginners: "bg-yellow-100 text-yellow-800",
    Advanced: "bg-orange-100 text-orange-800",
    Open: "bg-red-100 text-red-800",
    Legend: "bg-purple-100 text-purple-800",
    G: "bg-green-100 text-green-800",
    F: "bg-yellow-100 text-yellow-800",
    E: "bg-blue-100 text-blue-800",
  }[level] || "bg-gray-100 text-gray-800"

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start p-2 rounded-md border cursor-pointer border-gray-200 bg-white hover:shadow-md hover:border-gray-300 transition w-48"
    >
      <div className="flex items-center gap-2 mb-2">
        {type === "Doubles"
          ? <Users className="w-4 h-4 text-gray-600" />
          : <User className="w-4 h-4 text-gray-600" />}
        <Badge className={`text-xs px-2 ${levelColor}`}>{level}</Badge>
        <Badge className={`text-xs px-2 ${gender === 'Male' ? 'bg-blue-100 text-blue-800' : gender === 'Women' ? 'bg-pink-100 text-pink-800' : 'bg-purple-100 text-purple-800'}`}>
          {gender}
        </Badge>
      </div>
      <span className="font-medium text-gray-800 text-base">{name}</span>
      <div className="text-xs text-gray-500">{type}</div>
    </button>
  )
}

export function CategoryModal({
  isOpen,
  onClose,
  category,
}: {
  isOpen: boolean
  onClose: () => void
  category: {
    id: string
    name: string
    type: "Doubles" | "Singles"
    level?: string
    gender?: string
    pricePerPlayer?: number
    earlyBirdPricePerPlayer?: number
    hasEarlyBird?: boolean
    currency?: string
  } | null
}) {
  const { data, loading, error } = useQuery<PublicTournamentsData>(PUBLIC_TOURNAMENTS)

  if (!isOpen || !category) return null
  if (loading) return <p>Loading...</p>
  if (error) return <p>Error loading tournaments: {error.message}</p>

  const activeTournament = data?.publicTournaments?.find((t: any) => t.isActive)
  const tournament = activeTournament || data?.publicTournaments?.[0]

  const hasEarlyBird = category.hasEarlyBird || tournament?.settings.hasEarlyBird
  const displayPricePerPlayer = hasEarlyBird && category.earlyBirdPricePerPlayer
    ? category.earlyBirdPricePerPlayer
    : category.pricePerPlayer

  const getCurrencySymbol = (currency?: string) => {
    if (!currency) return ""
    return currency.toUpperCase() === "USD" ? "$" : "₱"
  }

  const symbol = getCurrencySymbol(category.currency)
  const perPlayerPrice = displayPricePerPlayer
    ? `${symbol}${displayPricePerPlayer.toLocaleString()}`
    : "N/A"

  const earlyBirdPerPlayer = category.earlyBirdPricePerPlayer
    ? `${symbol}${category.earlyBirdPricePerPlayer.toLocaleString()}`
    : null

  const perPairPrice =
    category.type === "Doubles" && displayPricePerPlayer
      ? `${symbol}${(displayPricePerPlayer * 2).toLocaleString()}`
      : null

  const earlyBirdPerPair =
    category.type === "Doubles" && category.earlyBirdPricePerPlayer
      ? `${symbol}${(category.earlyBirdPricePerPlayer * 2).toLocaleString()}`
      : null

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-3 text-gray-400 cursor-pointer hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h2 className="text-lg font-bold">Category Registration</h2>
        </div>

        <div className="mb-4 text-left">
          <div className="flex items-center gap-2 mb-2">
            <Users
              className={`w-5 h-5 text-gray-600 ${category.type === "Singles" ? "hidden" : ""
                }`}
            />
            <User
              className={`w-5 h-5 text-gray-600 ${category.type === "Doubles" ? "hidden" : ""
                }`}
            />
            <span className="font-semibold text-gray-800 text-sm">
              {category.name}
            </span>
            <Badge
              variant="outline"
              className="bg-yellow-100 text-yellow-800 text-xs"
            >
              {category.level || category.name.split(" ")[1]}
            </Badge>
            {hasEarlyBird && (
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 text-xs"
              >
                Early Bird
              </Badge>
            )}
          </div>

          <p className="text-sm text-gray-500">
            {category.level || category.name.split(" ")[1]} level. This is a{" "}
            {category.type.toLowerCase()} category where{" "}
            {category.type === "Doubles" ? "pairs" : "players"} compete together.
          </p>
        </div>

        <div className="bg-green-50/50 p-4 rounded-md mb-6 text-left">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-700 text-md">💰</span>
            <span className="font-semibold text-gray-800 text-md">
              Registration Fee
              {hasEarlyBird && " (Early Bird Active)"}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-green-700">👤</span>
              <p className="text-green-700 font-medium text-sm">
                Per Player: {perPlayerPrice}
                {!hasEarlyBird && earlyBirdPerPlayer && ` (Early Bird: ${earlyBirdPerPlayer})`}
              </p>
            </div>

            {perPairPrice && (
              <div className="flex items-center gap-2">
                <span className="text-green-700">👥</span>
                <p className="text-green-700 font-medium text-sm">
                  Per Pair: {perPairPrice}
                  {!hasEarlyBird && earlyBirdPerPair && ` (Early Bird: ${earlyBirdPerPair})`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Rest of the component remains the same */}
        <div className="bg-blue-50 p-4 rounded-md mb-6 text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-700 text-sm">📅</span>
            <span className="font-semibold text-gray-800 text-sm">
              Tournament Details
            </span>
          </div>
          <p className="text-gray-700 text-xs font-medium mb-1">
            {tournament?.name || "Tournament TBA"}
          </p>
          <p className="text-gray-700 text-xs font-medium">
            {tournament?.isActive ? "Active" : "Inactive"}
          </p>
          <p className="text-gray-700 text-xs font-medium">
            {tournament
              ? `${new Date(tournament.dates.tournamentStart).toLocaleDateString()} - ${new Date(
                tournament.dates.tournamentEnd
              ).toLocaleDateString()}`
              : "Dates TBD"}
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/sports-center/courts/registration/${tournament?._id}/${category.id}`}
            className="flex-1"
          >
            <Button className="w-full bg-black text-white cursor-pointer hover:bg-gray-900 px-4 py-2">
              Register Now
            </Button>
          </Link>

          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              window.open(
                "https://www.facebook.com/c.onebadmintonchallenge/",
                "_blank"
              )
            }
            className="cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}


function SubmissionSuccessModal({ isOpen, onClose }: {
  isOpen: boolean
  onClose: () => void

}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative flex flex-col items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="mb-4"
            >
              <CheckCircle className="w-16 h-16 text-green-500" />
            </motion.div>

            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Submitted Successfully!
            </h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              Your entry has been submitted. Proceed to upload proof of payment.
            </p>

            <Button
              onClick={onClose}
              className="w-full bg-green-600 text-white hover:bg-green-700"
            >
              Continue
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function UploadProofMergedModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [entriesState, setEntriesState] = useState([{ entryNumber: "", entryKey: "" }])
  const [amount, setAmount] = useState("")
  const [isJointPayment, setIsJointPayment] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileType, setFileType] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [priceReminder, setPriceReminder] = useState<string | null>(null)
  const [totalRequired, setTotalRequired] = useState(0)
  const [payerName, setPayerName] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const [entryAmounts, setEntryAmounts] = useState<Record<number, number | null>>({})
  const [entryLoadingStates, setEntryLoadingStates] = useState<Record<number, boolean>>({})
  const [entryErrors, setEntryErrors] = useState<Record<number, string>>({})
  const [entryDetails, setEntryDetails] = useState<Record<number, IEntryAmountDetails | null>>({})

  const [loading, setLoading] = useState(false)
  const [scannedTotal, setScannedTotal] = useState<string | null>(null)
  const [reference, setReference] = useState<string | null>(null)
  const [scannedText, setScannedText] = useState<string>("")
  const [showConfirmationInput, setShowConfirmationInput] = useState(false)
  const [confirmationNumber, setConfirmationNumber] = useState<string>("")
  const [amountLabel, setAmountLabel] = useState("Total")
  const [referenceLabel, setReferenceLabel] = useState("Reference No.")

  const { data: tournamentsData, loading: tournamentsLoading, error: tournamentsError } = useQuery<PublicTournamentsData>(PUBLIC_TOURNAMENTS)
  const [createPayment, { loading: createPaymentLoading, error: createPaymentError }] = useMutation<createPaymentResponse, { input: CreatePaymentInput }>(CREATE_PAYMENT)

  const [fetchEntryAmount, { data: entryAmountData, loading: entryAmountLoading, error: entryAmountError }] = useLazyQuery<EntryAmountDetailsData>(ENTRY_EVENT_AMOUNT_DETAILS)

  const sensors = useSensors(useSensor(PointerSensor))

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true)
      const formData = new FormData()
      const fileExt = file.name.split('.').pop() || ''

      const fileName = `payment-${Date.now()}.${fileExt}`
      formData.append("file", file, fileName)

      console.log('Uploading file:', {
        name: file.name,
        size: file.size,
        type: file.type,
        fileName: fileName
      })
      // /api/upload/payments
      const response = await fetch("/api/upload/attachment", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload Failed")
      }

      const data = await response.json()
      console.log('Upload API response:', data)

      return data.url
    } catch (error) {
      console.error("Error Uploading file:", error)
      toast.error("Error uploading file. Please try again.")
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const getPayerNames = (): string => {
    if (payerName.trim()) {
      return payerName.trim()
    }

    return "User"
  }

  const getEntryAmountDetails = async (entryNumber: string, entryKey: string, index: number) => {
    const referenceNumber = `${entryNumber}_${entryKey}`
    console.log('Fetching amount details for reference:', referenceNumber)

    try {
      const result = await fetchEntryAmount({
        variables: { referenceNumber }
      })

      if (result.error) {
        console.log('GraphQL errors:', result.error)
        const errorMessage = result.error.message || ''

        if (errorMessage.toLowerCase().includes('not found') ||
          errorMessage.toLowerCase().includes('no entry') ||
          errorMessage.toLowerCase().includes('invalid')) {
          return {
            data: null,
            error: "Entry not found. Please check your Entry Number and Entry Key."
          }
        } else {
          return {
            data: null,
            error: "Error fetching entry details. Please try again."
          }
        }
      }

      if (result.data?.entryEventAmountDetails) {
        return {
          data: result.data.entryEventAmountDetails,
          error: null
        }
      } else {
        return {
          data: null,
          error: "Entry not found. Please check your Entry Number and Entry Key."
        }
      }
    } catch (error: any) {
      console.error('Network/other error:', error)

      const errorMessage = error.message?.toLowerCase() || ''

      if (errorMessage.includes('not found') ||
        errorMessage.includes('404') ||
        errorMessage.includes('no entry') ||
        errorMessage.includes('invalid')) {
        return {
          data: null,
          error: "Entry not found. Please check your Entry Number and Entry Key."
        }
      }

      return {
        data: null,
        error: "Error fetching entry details. Please try again."
      }
    }
  }

  const resetForm = () => {
    setEntriesState([{ entryNumber: "", entryKey: "" }])
    setAmount("")
    setIsJointPayment(false)
    setPreview(null)
    setFileType(null)
    setError("")
    setSuccess(false)
    setPriceReminder(null)
    setTotalRequired(0)
    setPayerName("")
    setIsUploading(false)
    setUploadedFileUrl(null)
    setFile(null)
    setEntryAmounts({})
    setEntryLoadingStates({})
    setEntryErrors({})
    setEntryDetails({})
    setLoading(false)
    setScannedTotal(null)
    setReference(null)
    setScannedText("")
    setShowConfirmationInput(false)
    setConfirmationNumber("")
    setAmountLabel("Total")
    setReferenceLabel("Reference No.")
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const preprocessImage = (imageData: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image()
      img.src = imageData
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")!
        canvas.width = img.width * 2
        canvas.height = img.height * 2

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        ctx.fillStyle = "white"
        ctx.fillRect(canvas.width * 0.8, canvas.height * 0.7, 50, 50)

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        for (let i = 0; i < imgData.data.length; i += 4) {
          const avg = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3
          imgData.data[i] = avg
          imgData.data[i + 1] = avg
          imgData.data[i + 2] = avg
        }
        ctx.putImageData(imgData, 0, 0)

        resolve(canvas.toDataURL("image/png"))
      }
    })
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (!uploadedFile) return

    setFile(uploadedFile)

    const reader = new FileReader()
    reader.onload = async () => {
      const imageData = reader.result as string
      setPreview(imageData)
      setFileType("image")
      setLoading(true)
      setScannedTotal(null)
      setReference(null)
      setConfirmationNumber("")
      setScannedText("")

      try {
        const preprocessedData = await preprocessImage(imageData)

        const result = await Tesseract.recognize(preprocessedData, "eng", {
          logger: (m) => console.log(m),
        })

        const text = result.data.text
        setScannedText(text)

        const confirmationMatch = text.match(/confirmation[\s#:=-]*no\.?\s*([A-Z0-9-]{5,})/i)
        if (confirmationMatch) {
          setShowConfirmationInput(true)
          setConfirmationNumber(confirmationMatch[1])
        } else {
          setShowConfirmationInput(false)
          setConfirmationNumber("")
        }

        const traceMatch = text.match(/Trace no\.\s*([A-Z0-9-]+)/i)
        if (traceMatch) {
          setShowConfirmationInput(true)
          setConfirmationNumber(traceMatch[1])
        }

        const landBankTransactionRefMatch = text.match(/Transaction Reference Number\s*([A-Z0-9\/]+)/i)
        if (landBankTransactionRefMatch) {
          setShowConfirmationInput(true)
          setConfirmationNumber(landBankTransactionRefMatch[1])
        }

        const currencyPattern = "(?:₱|PHP|F|P|£)"

        const bdoAmountMatch = text.match(/PHP\s*([\d,]+\.[\d]{2})/i)

        const paidMatch = text.match(
          new RegExp(`paid\\s*${currencyPattern}?\\s?([\\d,]+\\.\\d{2})`, "i")
        )
        const transferMatch = text.match(
          new RegExp(`transfer\\s*amount[\\s\\S]*?${currencyPattern}\\s?([\\d,]+\\.\\d{2})`, "i")
        )

        const totalMatch =
          text.match(new RegExp(`total[\\s#:=-]*${currencyPattern}?\\s?([\\d,]+\\.\\d{2})`, "i")) ||
          text.match(new RegExp(`amount[\\s#:=-]*${currencyPattern}?\\s?([\\d,]+\\.\\d{2})`, "i")) ||
          text.match(new RegExp(`total\\s*amount\\s*sent[\\s#:=-]*${currencyPattern}?\\s?([\\d,]+\\.\\d{2})`, "i"))

        let detectedAmount = null
        if (bdoAmountMatch) {
          setAmountLabel("Paid Amount")
          detectedAmount = bdoAmountMatch[1]
        } else if (paidMatch) {
          setAmountLabel("Paid Amount")
          detectedAmount = paidMatch[1]
        } else if (transferMatch) {
          setAmountLabel("Transfer Amount")
          detectedAmount = transferMatch[1]
        } else if (totalMatch) {
          setAmountLabel("Total")
          detectedAmount = totalMatch[1]
        } else {
          setAmountLabel("Total")
          detectedAmount = null
        }

        if (detectedAmount) {
          setScannedTotal(`₱${detectedAmount}`)
          setAmount(detectedAmount.replace(/,/g, ''))
        } else {
          setScannedTotal("Not found")
        }

        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

        let refNumber = "Not found"
        let refLabel = "Reference No."
        let foundTransactionRef = false

        const bdoRefMatch = text.match(/Reference no\.\s*([A-Z0-9-]+)/i)
        if (bdoRefMatch) {
          refNumber = bdoRefMatch[1]
        }

        if (refNumber === "Not found") {
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].toLowerCase()

            if (line.includes("transaction reference no") || line.includes("transaction ref")) {
              refLabel = "Transaction Reference No."
              foundTransactionRef = true
            }

            if (
              line.includes("reference no") ||
              line.includes("ref no") ||
              line.includes("ref. no.") ||
              line.includes("transaction reference no") ||
              line.includes("transaction ref no")
            ) {
              const inlineMatch = lines[i].match(
                /(?:ref(?:\.|erence)?(?: no\.?)?[:\s]*)\s*([A-Z0-9\s-]{4,})(?=\s|$|[A-Za-z]|\.)/i
              )

              if (inlineMatch) {
                refNumber = inlineMatch[1]
                  .replace(/\s+/g, ' ')
                  .trim()
                break
              }

              for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
                const candidate = lines[j].trim()
                if (/^[A-Z0-9\s-]{8,}$/i.test(candidate)) {
                  refNumber = candidate
                    .replace(/\s+/g, ' ')
                    .trim()
                  break
                }
              }

              if (refNumber !== "Not found") break
            }
          }
        }

        if (refNumber === "Not found") {
          const refPatterns = [
            /Reference no\.\s*([A-Z0-9-]+)/i,
            /Ref No\.\s*([A-Z0-9\s-]{4,})(?=\s|$|[A-Za-z]|\.)/i,
            /Reference No\.\s*([A-Z0-9\s-]{4,})(?=\s|$|[A-Za-z]|\.)/i,
            /Ref No[\s:]*([A-Z0-9\s-]{4,})(?=\s|$|[A-Za-z]|\.)/i,
            /Transaction Ref\. No\.\s*([A-Z0-9\s-]{4,})(?=\s|$|[A-Za-z]|\.)/i,
            /Transaction Reference No\.\s*([A-Z0-9\s-]{4,})(?=\s|$|[A-Za-z]|\.)/i,
            /Ref\. No\.\s*([A-Z0-9\s-]{4,})(?=\s|$|[A-Za-z]|\.)/i
          ]

          for (const pattern of refPatterns) {
            const match = text.match(pattern)
            if (match) {
              refNumber = match[1]
                .replace(/\s+/g, ' ')
                .trim()
              break
            }
          }
        }

        if (refNumber !== "Not found") {
          refNumber = refNumber.replace(/\s.$/, '')
          refNumber = refNumber.replace(/(\s.)+$/, '')
          refNumber = refNumber.trim()

          if (!refNumber.includes('-')) {
            refNumber = refNumber.replace(/[^\d\s-]/g, '')
          }

          refNumber = refNumber.replace(/\s+/g, ' ').trim()

          if (refNumber.replace(/[\s-]/g, '').length < 4) {
            refNumber = "Not found"
          }
        }

        if (foundTransactionRef) {
          refLabel = "Transaction Reference No."
        }

        setReference(refNumber)
        setReferenceLabel(refLabel)

      } catch (err) {
        setScannedText("Error: Could not read text.")
      } finally {
        setLoading(false)
      }
    }

    reader.readAsDataURL(uploadedFile)
  }

  const handleRemoveFile = () => {
    setFile(null)
    setPreview(null)
    setUploadedFileUrl(null)
  }

  useEffect(() => {
    const fetchAllEntryAmounts = async () => {
      const newAmounts: Record<number, number | null> = {}
      const newDetails: Record<number, IEntryAmountDetails | null> = {}
      const newLoadingStates: Record<number, boolean> = {}
      const newErrors: Record<number, string> = {}

      for (let i = 0; i < entriesState.length; i++) {
        const entry = entriesState[i]
        if (entry.entryNumber && entry.entryKey) {
          newLoadingStates[i] = true
          setEntryLoadingStates(prev => ({ ...prev, [i]: true }))

          const result = await getEntryAmountDetails(entry.entryNumber, entry.entryKey, i)
          newAmounts[i] = result.data ? result.data.amount : null
          newDetails[i] = result.data || null
          newErrors[i] = result.error || ""
          newLoadingStates[i] = false
        } else {
          newAmounts[i] = null
          newDetails[i] = null
          newLoadingStates[i] = false
          newErrors[i] = ""
        }
      }

      setEntryAmounts(newAmounts)
      setEntryDetails(newDetails)
      setEntryLoadingStates(newLoadingStates)
      setEntryErrors(newErrors)
    }

    fetchAllEntryAmounts()
  }, [entriesState])

  useEffect(() => {
    const calculateTotal = async () => {
      let total = 0

      Object.values(entryAmounts).forEach(amount => {
        if (amount) {
          total += amount
        }
      })

      setTotalRequired(total)

      const numAmount = parseFloat(amount) || 0
      if (numAmount === 0 || total === 0) {
        setPriceReminder(null)
      } else if (numAmount >= total) {
        setPriceReminder(`✅ Amount is enough and matches the total price of ₱${total}.`)
      } else {
        const diff = total - numAmount
        setPriceReminder(`⚠️ Amount is not enough. Missing ₱${diff.toFixed(2)} from ₱${total}.`)
      }
    }

    calculateTotal()
  }, [entryAmounts, amount])

  const handleSubmit = async () => {
    const hasEntryErrors = Object.values(entryErrors).some(error => error !== "")
    if (hasEntryErrors) {
      setError("Please fix the entry errors before submitting.")
      return
    }

    const incomplete = entriesState.some((e) => !e.entryNumber || !e.entryKey)
    if (incomplete || !file || !amount) {
      setError("Please complete all required fields.")
      return
    }

    // Check if all entries have valid entryIds
    const invalidEntries = entriesState.map((_, index) => {
      const details = entryDetails[index]
      if (!details?.entryId) {
        return `Entry ${index + 1}`
      }
      return null
    }).filter(Boolean)

    if (invalidEntries.length > 0) {
      setError(`Could not find entry data for: ${invalidEntries.join(', ')}. Please check your entry details.`)
      return
    }

    try {
      setIsUploading(true)

      const imageUrl = await uploadFile(file)

      if (!imageUrl) {
        setError("Failed to upload receipt image. Please try again.")
        setIsUploading(false)
        return
      }

      setUploadedFileUrl(imageUrl)

      const totalAmount = parseFloat(amount) || 0

      // Create entry list with proper entryIds and isFullyPaid calculation
      const entryList = entriesState.map((entry, index) => {
        const entryAmount = entryAmounts[index] || 0
        const entryDetailsData = entryDetails[index]

        if (!entryDetailsData?.entryId) {
          throw new Error(`No entryId found for entry ${index + 1}`)
        }

        const isFullyPaid = totalAmount >= entryAmount

        return {
          entry: entryDetailsData.entryId,
          isFullyPaid
        }
      })

      const finalPayerName = payerName.trim() || "Player"

      const finalReferenceNumber = reference && reference !== "Not found" ? reference : confirmationNumber || `ref_${Date.now()}`

      const input: CreatePaymentInput = {
        referenceNumber: finalReferenceNumber,
        amount: totalAmount,
        paymentDate: new Date().toISOString(),
        proofOfPaymentURL: imageUrl,
        payerName: finalPayerName,
        entryList
      }

      console.log('Submitting payment:', input)

      const result = await createPayment({
        variables: { input }
      })

      if (result.data?.createPayment.ok) {
        setError("")
        setSuccess(true)
        console.log('Payment created successfully:', result.data.createPayment.message)
      } else {
        setError("Failed to create payment. Please try again.")
      }
    } catch (err: any) {
      console.error('Error creating payment:', err)
      setError(`Error creating payment: ${err.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleAddEntry = () => {
    setEntriesState([...entriesState, { entryNumber: "", entryKey: "" }])
  }

  const handleJointPaymentChange = (checked: boolean) => {
    setIsJointPayment(checked)
    if (!checked) {
      setEntriesState([{ entryNumber: entriesState[0].entryNumber, entryKey: entriesState[0].entryKey }])
      setEntryAmounts({ 0: entryAmounts[0] || null })
      setEntryLoadingStates({ 0: entryLoadingStates[0] || false })
      setEntryErrors({ 0: entryErrors[0] || "" })
      setEntryDetails({ 0: entryDetails[0] || null })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = entriesState.findIndex((_, i) => i.toString() === active.id)
      const newIndex = entriesState.findIndex((_, i) => i.toString() === over?.id)

      const reorderedEntries = arrayMove(entriesState, oldIndex, newIndex)
      setEntriesState(reorderedEntries)

      const reorderedAmounts: Record<number, number | null> = {}
      const reorderedLoadingStates: Record<number, boolean> = {}
      const reorderedErrors: Record<number, string> = {}
      const reorderedDetails: Record<number, IEntryAmountDetails | null> = {}

      reorderedEntries.forEach((_, newIdx) => {
        reorderedAmounts[newIdx] = entryAmounts[oldIndex === newIdx ? newIndex : (newIdx === newIndex ? oldIndex : newIdx)] || null
        reorderedLoadingStates[newIdx] = entryLoadingStates[oldIndex === newIdx ? newIndex : (newIdx === newIndex ? oldIndex : newIdx)] || false
        reorderedErrors[newIdx] = entryErrors[oldIndex === newIdx ? newIndex : (newIdx === newIndex ? oldIndex : newIdx)] || ""
        reorderedDetails[newIdx] = entryDetails[oldIndex === newIdx ? newIndex : (newIdx === newIndex ? oldIndex : newIdx)] || null
      })

      setEntryAmounts(reorderedAmounts)
      setEntryLoadingStates(reorderedLoadingStates)
      setEntryErrors(reorderedErrors)
      setEntryDetails(reorderedDetails)
    }
  }

  const calculateCumulativeAmounts = () => {
    const cumulative: Record<number, number> = {}
    let runningTotal = 0

    entriesState.forEach((_, index) => {
      cumulative[index] = runningTotal
      const currentAmount = entryAmounts[index] || 0
      runningTotal += currentAmount
    })

    return cumulative
  }

  const SuccessModal = () => (
    <motion.div
      className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center rounded-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <p className="text-green-600 font-bold text-lg mb-2">Submitted!</p>
      <p className="text-gray-600 text-sm mb-4 text-center">
        Your proof of payment was submitted successfully.
      </p>
      <Button
        onClick={() => {
          setSuccess(false)
          resetForm()
          onClose()
        }}
        className="bg-green-600 text-white hover:bg-green-700"
      >
        Close
      </Button>
    </motion.div>
  )


  const cumulativeAmounts = calculateCumulativeAmounts()

  if (tournamentsLoading) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative flex flex-col items-center justify-center"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
              <div className="text-gray-500">Loading data...</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  if (tournamentsError) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative flex flex-col items-center justify-center"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
              <div className="text-red-500">Error loading data. Please try again.</div>
              <Button onClick={onClose} className="mt-4">
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl relative flex flex-col max-h-[83vh] mt-14"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="relative p-6 border-b">
              <h2 className="text-lg font-bold text-gray-800 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                Upload Proof of Payment
              </h2>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClose()
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
              {error && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {createPaymentError && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-700 text-sm font-medium">
                    Payment Error: {createPaymentError.message}
                  </p>
                </div>
              )}

              <div className="w-full">
                <div className="px-14 pb-2 space-y-3">
                  {/* {Object.values(entryErrors).some(error => error !== "") && (
                    <div className="text-sm font-medium text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                      Please fix the entry errors below before proceeding.
                    </div>
                  )} */}

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      {Object.values(entryAmounts).some(amount => amount !== null) ? (
                        <div className="text-sm font-medium text-blue-600">
                          <div className="font-semibold mb-1">Total Amount Required</div>
                          {totalRequired > 0 && (
                            <div className="text-red-600 text-lg">
                              <span className="font-medium">₱</span>
                              {totalRequired.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </div>
                          )}
                        </div>
                      ) : amount ? (
                        <div className="text-sm font-medium text-green-600">
                          <div className="font-semibold mb-1">Payment Amount</div>
                          <div className="text-lg">
                            ₱{parseFloat(amount).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm font-medium text-gray-600">
                          No Amount Displayed yet.
                        </div>
                      )}


                    </div>

                    <div>
                      {(reference || confirmationNumber) && (
                        <div className="text-sm font-medium text-blue-600">
                          <div className="font-semibold mb-1">{referenceLabel}</div>
                          <div className="text-lg font-mono bg-blue-50 p-2 rounded border">
                            {reference && reference !== "Not found" ? reference : confirmationNumber}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Separator className="mx-2 mb-2" />
                <div className="grid grid-cols-2 gap-14 px-14">
                  <label className="block text-sm font-medium text-gray-700 text-start">
                    Entry Number <span className="text-red-500">*</span>
                  </label>
                  <label className="block text-sm font-medium text-gray-700 text-start">
                    Entry Key <span className="text-red-500">*</span>
                  </label>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext
                    items={entriesState.map((_, i) => i.toString())}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-2">
                      {entriesState.map((entry, index) => {
                        const entryAmount = entryAmounts[index]
                        const entryError = entryErrors[index]
                        const entryLoading = entryLoadingStates[index]
                        const details = entryDetails[index]

                        return (
                          <div key={index} className="mt-2 -mb-2">
                            {entry.entryNumber && entry.entryKey && !entryError && entryAmount && details && (
                              <div className="px-14">
                                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border w-full">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <strong>Entry {index + 1}:</strong> {details.eventType} Event - ₱
                                      {entryAmounts[index]?.toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </div>

                                    <div className="text-gray-600 text-xs">
                                      {details.eventType} Event
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {entryLoading && (
                              <div className="text-sm font-medium px-14 text-gray-600">
                                Loading entry {index + 1} details...
                              </div>
                            )}

                            {entryError && (
                              <div className="text-sm font-medium px-14 text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                                {entryError}
                              </div>
                            )}

                            <SortableEntry
                              id={index.toString()}
                              index={index}
                              entry={entry}
                              isJointPayment={isJointPayment}
                              onChange={(i, field, value) => {
                                const updated = [...entriesState]
                                updated[i] = { ...updated[i], [field]: value }
                                setEntriesState(updated)
                              }}
                              onDelete={(i) => {
                                setEntriesState(entriesState.filter((_, idx) => idx !== i))
                                setEntryAmounts(prev => {
                                  const newAmounts = { ...prev }
                                  delete newAmounts[i]
                                  return newAmounts
                                })
                                setEntryLoadingStates(prev => {
                                  const newLoadingStates = { ...prev }
                                  delete newLoadingStates[i]
                                  return newLoadingStates
                                })
                                setEntryErrors(prev => {
                                  const newErrors = { ...prev }
                                  delete newErrors[i]
                                  return newErrors
                                })
                                setEntryDetails(prev => {
                                  const newDetails = { ...prev }
                                  delete newDetails[i]
                                  return newDetails
                                })
                              }}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>

              {isJointPayment && (
                <Button
                  type="button"
                  onClick={handleAddEntry}
                  className="w-full bg-green-600 text-white cursor-pointer hover:bg-green-500"
                >
                  Add Entry/Entries
                </Button>
              )}

              <div className="mb-4 mt-6">
                <label className="block text-sm font-medium text-gray-700 text-start mb-2">
                  Payer Name 
                </label>
                <input
                  type="text"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="Enter payer name"
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-400 border-gray-300"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {payerName
                    ? "Using manually entered payer name"
                    : "Will use 'Player' as default if left blank"
                  }
                </p>
              </div>

              <div className="border-2 border-dashed border-green-300 rounded-xl p-4 bg-green-50 flex flex-col items-center">
                <div className="w-full text-left mb-3">
                  <div className="text-green-800 font-bold text-sm mb-1">
                    Upload Proof of Payment <span className="text-red-500">*</span>
                  </div>
                  <p className="text-gray-600 text-xs">
                    Upload your GCash, Maya, or bank receipt to automatically scan the amount and reference number.
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
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={handleRemoveFile}
                        disabled={isUploading}
                        className="text-gray-500 hover:text-red-500 hover:bg-gray-200! bg-transparent transition-colors cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
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
                  {preview ? (
                    <img
                      src={preview}
                      alt="Uploaded receipt"
                      className="w-full max-w-[300px] rounded-lg border shadow"
                    />
                  ) : (
                    <Image
                      src="/id.png"
                      alt="Sample Proof Placeholder"
                      width={400}
                      height={250}
                      className="w-full max-w-[300px] rounded-lg border shadow"
                    />
                  )}
                </div>

                <label
                  htmlFor="proofUpload"
                  className="cursor-pointer w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-green-400 rounded-xl bg-white hover:bg-green-100 transition"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 text-green-600 mb-2 animate-spin" />
                  ) : (
                    <UploadIcon className="w-6 h-6 text-green-600 mb-2" />
                  )}
                  <span className="text-green-700 font-medium text-sm">
                    {loading ? "Scanning..." : "Drag & Drop your receipt or Browse"}
                  </span>
                  <input
                    id="proofUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>

                {(scannedTotal || reference || confirmationNumber) && (
                  <div className="w-full mt-4 space-y-3">
                    {scannedTotal && scannedTotal !== "Not found" && (
                      <div className="p-3 bg-green-100 rounded-xl">
                        <p className="text-sm text-gray-500">{amountLabel} (Scanned)</p>
                        <p className="text-lg font-bold text-green-700">{scannedTotal}</p>
                      </div>
                    )}

                    {reference && reference !== "Not found" && (
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <p className="text-sm text-gray-500">{referenceLabel}</p>
                        <p className="text-lg font-bold text-blue-700">{reference}</p>
                      </div>
                    )}

                    {showConfirmationInput && confirmationNumber && (
                      <div className="p-3 bg-yellow-100 rounded-xl">
                        <p className="text-sm text-gray-500">
                          {confirmationNumber && (confirmationNumber.includes("MB") || confirmationNumber.includes("/"))
                            ? "Transaction Reference No."
                            : confirmationNumber && confirmationNumber.length <= 10
                              ? "Trace No."
                              : "Confirmation No."
                          }
                        </p>
                        <p className="text-lg font-bold text-yellow-700">{confirmationNumber}</p>
                      </div>
                    )}

                    {preview && (
                      <Button
                        onClick={() => {
                          setPreview(null)
                          setScannedTotal(null)
                          setReference(null)
                          setScannedText("")
                          setConfirmationNumber("")
                          setFile(null)
                          setUploadedFileUrl(null)
                        }}
                        className="w-full bg-red-200 text-gray-800 hover:bg-red-300"
                      >
                       Remove
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {priceReminder && (
                <div className={`text-sm font-medium ${priceReminder.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
                  {priceReminder}
                </div>
              )}
            </div>

            <div className="p-3 border-t bg-white border-gray-200">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 text-start mb-2">
                  Amount <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  disabled
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount: ₱1000.00"
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-400 border-gray-300"
                />
              </div>

              <div className="flex items-center gap-2 mb-4">
                <input
                  id="jointPayment"
                  type="checkbox"
                  checked={isJointPayment}
                  onChange={(e) => handleJointPaymentChange(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="jointPayment"
                  className="text-sm text-red-500 font-medium cursor-pointer"
                >
                  Want to Pay for Multiple Entries?
                </label>
              </div>

              <Button
                className="w-full bg-green-600 text-white cursor-pointer hover:bg-green-700"
                onClick={handleSubmit}
                disabled={createPaymentLoading || isUploading || !file}
              >
                {isUploading ? "Uploading..." : createPaymentLoading ? "Submitting..." : "Submit"}
              </Button>
            </div>

            <AnimatePresence>
              {success && <SuccessModal />}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function CheckEntryModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [showResult, setShowResult] = useState(false)
  const [entryValue, setEntryValue] = useState("")
  const [statuses, setStatuses] = useState<IEntryStatus[]>([])
  const [error, setError] = useState("")

  const [fetchStatusHistory, { loading, error: queryError }] =
    useLazyQuery<EntryStatusHistoryData>(ENTRY_STATUS_HISTORY)

  useEffect(() => {
    if (isOpen) {
      setEntryValue("")
      setError("")
      setStatuses([])
      setShowResult(false)
    }
  }, [isOpen])

  const handleCheck = async () => {
    if (!entryValue.trim()) {
      setError("Please enter your Entry Reference Number.")
      return
    }

    if (!entryValue.includes("_")) {
      setError("Invalid format. Use EntryNum_EntryKey (e.g. V8-009809_kajKER55).")
      return
    }

    try {
      const { data } = await fetchStatusHistory({
        variables: { referenceNumber: entryValue },
      })

      // Always show the result modal, even if data is empty
      setStatuses(data?.entryStatusHistory || [])
      setShowResult(true)
      setError("")
    } catch (err) {
      console.error(err)
      setError("Something went wrong while checking. Please try again.")
    }
  }

  const getStatusIcon = (status: string) => {
    if (status.includes("PENDING")) return <Clock className="w-5 h-5 text-yellow-500" />
    if (status.includes("APPROVED") || status.includes("ASSIGNED")) return <CheckCircle className="w-5 h-5 text-green-600" />
    if (status.includes("VERIFIED")) return <Mail className="w-5 h-5 text-blue-600" />
    if (status.includes("PAYMENT")) return <Wallet2Icon className="w-5 h-5 text-emerald-600" />
    if (status.includes("REJECTED") || status.includes("CANCELLED")) return <AlertTriangle className="w-5 h-5 text-red-500" />
    return <Clock className="w-5 h-5 text-gray-400" />
  }

  const getStatusColor = (status: string) => {
    if (status.includes("PENDING")) return "text-yellow-600"
    if (status.includes("APPROVED") || status.includes("ASSIGNED")) return "text-green-700"
    if (status.includes("VERIFIED")) return "text-blue-700"
    if (status.includes("PAYMENT")) return "text-emerald-700"
    if (status.includes("REJECTED") || status.includes("CANCELLED")) return "text-red-700"
    return "text-gray-700"
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && !showResult && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-1">
                  Check Entry
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Enter your <strong>Entry Reference Number</strong> to view its status.
                </p>
              </div>

              <div className="mb-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="V8-00001_ABCDEFGH"
                    value={entryValue}
                    onChange={(e) => {
                      setEntryValue(e.target.value)
                      setError("")
                    }}
                    className={`w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition ${error
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300 focus:ring-green-400"
                      }`}
                  />
                </div>
                {(error || queryError) && (
                  <p className="text-red-500 text-xs mt-1 text-start">
                    {error || queryError?.message}
                  </p>
                )}
              </div>

              <Button
                className="w-full py-2.5 bg-green-600 text-white font-medium hover:bg-green-700 transition disabled:opacity-70"
                onClick={handleCheck}
                disabled={loading}
              >
                {loading ? "Checking..." : "Check Entry"}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✳️ Result Modal - Now shows even when statuses is empty */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative overflow-y-auto max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <button
                onClick={() => {
                  setShowResult(false)
                  onClose()
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <Trophy className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Entry Status History
                </h2>

                <div className="mt-3 inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-sm font-medium px-4 py-2 rounded-full shadow-sm border border-amber-100">
                  Reference Number:&nbsp;
                  <span className="font-semibold text-amber-800">{entryValue}</span>
                </div>

                <p className="text-sm text-gray-500 mt-3">
                  {statuses.length > 0 
                    ? "Here's the detailed status history for your entry."
                    : "No status history found for this entry."
                  }
                </p>
              </div>

              {statuses.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {statuses.map((statusItem, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      {getStatusIcon(statusItem.status)}
                      <div>
                        <p
                          className={`${getStatusColor(
                            statusItem.status
                          )} font-medium text-sm`}
                        >
                          {new Date(statusItem.date).toLocaleString()} →{" "}
                          {statusItem.status.replaceAll("_", " ")}
                        </p>
                        {statusItem.reason && (
                          <p className="text-sm text-gray-500 mt-1">
                            Reason: {statusItem.reason}
                          </p>
                        )}
                        {statusItem.by && (
                          <p className="text-xs text-gray-400 italic">
                            by {statusItem.by.name} ({statusItem.by.role})
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-3">
                    <Search className="w-12 h-12 text-gray-300" />
                  </div>
                  <p className="text-gray-500 text-sm">
                    No status history records found for this entry reference number.
                  </p>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <Button
                  onClick={() => {
                    setShowResult(false)
                    onClose()
                  }}
                  className="bg-green-600 text-white hover:bg-green-700 transition px-6 py-2.5"
                >
                  Done
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default function App() {
  useSmoothScroll()

  const [selectedCategory, setSelectedCategory] = useState<{
    id: string
    name: string
    type: "Doubles" | "Singles"
    level?: string
    gender?: string
  } | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isCheckEntryModalOpen, setIsCheckEntryModalOpen] = useState(false)
  const [submittedEntryValue, setSubmittedEntryValue] = useState("")
  const [showReconciliation, setShowReconciliation] = useState(false)

  const oldData = {
    firstName: "Juan",
    lastName: "Dela Cruz",
    email: "juan@example.com",
    phone: "09123456789",
  }

  const newData = {
    firstName: "Juanito",
    lastName: "Cruz",
    email: "juanito.cruz@example.com",
    phone: "09123456789",
  }

  const handleMerge = (mergedData: Record<string, any>) => {
    console.log("✅ Merged Data:", mergedData)
    setShowReconciliation(false)
  }

  const { data, loading, error } = useQuery<PublicTournamentsData>(PUBLIC_TOURNAMENTS)

  const activeTournament = data?.publicTournaments?.find((t: any) => t.isActive)
  const events = activeTournament?.events?.map((event: any) => {
    const rawGender = event.gender?.toLowerCase()
    let gender = "Mixed"

    if (rawGender === "m" || rawGender === "male") gender = "Men's"
    else if (rawGender === "w" || rawGender === "f" || rawGender === "female") gender = "Women's"
    else if (rawGender === "x" || rawGender === "mixed") gender = "Mixed"

    const type =
      event.type?.toUpperCase() === "DOUBLES" ? "Doubles" : "Singles"

    return {
      id: event._id,
      name: event.name,
      level: event.level || "Open",
      type,
      gender,
      pricePerPlayer: event.pricePerPlayer,
      currency: event.currency,
      isActive: event.isActive,
    }
  }) || []

  console.log("Fetched events from GraphQL:", events)

  const sortCategoriesByGender = (list: typeof events) => {
    const mens = list.filter((level: any) => level.gender === "Men's")
    const womens = list.filter((level: any) => level.gender === "Women's")
    const mixed = list.filter((level: any) => level.gender === "Mixed")
    return [...mens, ...womens, ...mixed]
  }

  const doublesCategories = sortCategoriesByGender(
    events.filter((level: any) => level.type === "Doubles")
  )
  const singlesCategories = sortCategoriesByGender(
    events.filter((level: any) => level.type === "Singles")
  )

  const handleCategoryClick = (category: any) => {
    setSelectedCategory(category)
    setIsModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500">Loading tournament details...</div>
      </div>
    )
  }


  if (error) {
    console.error("GraphQL Error:", error)

    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <div className="text-red-500 font-bold text-3xl">
          Error loading tournaments
        </div>
        <pre className="bg-gray-100 text-red-700 p-4 rounded max-w-lg overflow-x-auto">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    )
  }
  if (!data?.publicTournaments?.length) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500 font-bold text-3xl">
          There is No Current Tournament...
        </div>
      </div>
    )
  }

  const renderGenderSection = (
    group: string,
    categories: typeof events,
    title: string
  ) => {
    const groupCategories = categories.filter((level: any) => level.gender === group)
    if (groupCategories.length === 0) return null

    const colorClass =
      group === "Men's"
        ? "bg-blue-500"
        : group === "Women's"
          ? "bg-pink-500"
          : "bg-purple-500"

    return (
      <div key={group} className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${colorClass}`} />
          {group} {title}
        </h3>
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          {groupCategories.map((category: any, idx: any) => (
            <CategoryCard
              key={idx}
              name={category.name}
              type={category.type}
              level={category.level}
              gender={category.gender}
              onClick={() => handleCategoryClick(category)}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-y-auto min-h-screen bg-linear-to-br from-green-50 via-white to-green-100 relative">
      <div className="container mx-auto px-4 py-8 max-w-7xl relative">
        <div className="mb-8 text-center">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <Badge className="bg-green-100 text-green-800 px-3 py-1">
              Registration Open
            </Badge>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            C-ONE Badminton Challenge
          </h1>

          <div className="max-w-6xl mx-auto text-left text-sm space-y-2 mb-6">
            <p>
              Welcome to the C-ONE Badminton Challenge! This exciting event is
              hosted by C-ONE badminton, offering players of all levels an
              opportunity to showcase their skills and compete in a friendly and
              supportive environment.
            </p>
            <p>
              The challenge includes various categories, such as singles,
              doubles, and mixed doubles, with winners awarded prizes at the end
              of the event.
            </p>
            <p>
              Join us for thrilling badminton matches and meet other enthusiasts
              of the sport. Register now and be part of the C-ONE community!
            </p>
          </div>

          <div className="-mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => setIsCheckEntryModalOpen(true)}
              className="w-full py-6 cursor-pointer bg-teal-600 text-white hover:bg-teal-700 hover:text-white flex items-center justify-center gap-3"
            >
              <Search className="w-5 h-5 mr-2" />
              Check Entry
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsUploadModalOpen(true)}
              className="w-full py-6 cursor-pointer bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-3"
            >
              Upload Proof of Payment
            </Button>

            <Button
              variant="outline"
              className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
              onClick={() => setShowReconciliation(true)}
            >
              Open Data Reconciliation
            </Button>

          </div>

          {showReconciliation && (
            <DataReconciliationModal
              isOpen={showReconciliation}
              onClose={() => setShowReconciliation(false)}
              oldData={oldData}
              newData={newData}
              onMerge={handleMerge}
            />
          )}

          <div className="max-w-6xl mx-auto my-6 text-center border-b border-t pt-4 border-gray-300 pb-4">
            <p className="text-black font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-2"></span>
              Choose your category below and click “Register” to proceed with
              registration and payment instructions.
            </p>
          </div>
        </div>

        <div className="mb-10 mt-7">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-900">
              Doubles Categories
            </h2>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {doublesCategories.length} categories
            </Badge>
          </div>

          {["Men's", "Women's", "Mixed"].map((group) =>
            renderGenderSection(group, doublesCategories, "Doubles")
          )}
        </div>

        <Separator className="my-8" />

        {/* ✅ SINGLES CATEGORIES */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-purple-600" />
            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-900">
              Singles Categories
            </h2>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              {singlesCategories.length} categories
            </Badge>
          </div>

          {["Men's", "Women's", "Mixed"].map((group) =>
            renderGenderSection(group, singlesCategories, "Singles")
          )}
        </div>

        <div className="bg-white rounded-lg p-6 mt-20 flex items-center justify-center">
          <div className="max-w-4xl text-center">
            <p className="text-gray-600 mb-4">
              Need help choosing the right category? Contact us through our
              Facebook page.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 mx-auto mb-4 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              Facebook Page
            </Button>
            <p className="text-sm text-gray-500">
              Registration fees vary by category level. Payment details will be
              provided after category selection.
            </p>
          </div>
        </div>
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
      />
      {/* 
      <UploadProofMergedModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      /> */}

      <CheckEntryModal
        isOpen={isCheckEntryModalOpen}
        onClose={() => {
          setIsCheckEntryModalOpen(false)
          setSubmittedEntryValue("")
        }}
      />
    </div>
  )
}
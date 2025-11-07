"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Trophy, ExternalLink, Users, User, X, Search, UploadIcon, Clock, CheckCircle, Mail, Wallet2Icon, AlertTriangle, Trash, GripVertical } from "lucide-react"
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
import { useLazyQuery, useQuery } from "@apollo/client/react"
import { PUBLIC_TOURNAMENTS } from "@/graphql/events/queries"
import { CHECK_ENTRY } from "@/graphql/entries/queries"
import { ITournament } from "@/app/(public)/types/tournament.interface"
import { CheckEntryData } from "@/app/(public)/types/entry.interface"
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

// export function UploadProofMergedModal({
//   isOpen,
//   onClose,
// }: {
//   isOpen: boolean
//   onClose: () => void
// }) {
//   const [entriesState, setEntriesState] = useState([{ entryNumber: "", entryKey: "" }])
//   const [amount, setAmount] = useState("")
//   const [isJointPayment, setIsJointPayment] = useState(false)
//   const [preview, setPreview] = useState<string | null>(null)
//   const [fileType, setFileType] = useState<string | null>(null)
//   const [error, setError] = useState("")
//   const [success, setSuccess] = useState(false)
//   const [priceReminder, setPriceReminder] = useState<string | null>(null)
//   const [totalRequired, setTotalRequired] = useState(0)

//   const sensors = useSensors(useSensor(PointerSensor))

//   useEffect(() => {
//     let total = 0
//     const now = new Date()

//     entriesState.forEach((entryItem) => {
//       if (!entryItem.entryNumber || !entryItem.entryKey) return

//       const matchedEntry = entries.find(
//         (e) => e.entryKey === entryItem.entryKey && e.entryNumber === entryItem.entryNumber
//       )
//       if (!matchedEntry) return

//       const eventInfo = events.find((ev) => ev._id === matchedEntry.event.event_id)
//       const tournamentInfo = tournaments.find((t) => t._id === eventInfo?.tournamentID)
//       if (!eventInfo || !tournamentInfo) return

//       const earlyBirdEnd = new Date(tournamentInfo.dates.earlyBirdPaymentEnd)
//       const isEarlyBird = now <= earlyBirdEnd && tournamentInfo.settings.hasEB
//       const pricePerPlayer = isEarlyBird
//         ? eventInfo.earlyBirdPricePerPlayer
//         : eventInfo.pricePerPlayer

//       const isDoubles = eventInfo.type === "DOUBLES"
//       const playerCount = isDoubles ? 2 : 1

//       total += pricePerPlayer * playerCount
//     })

//     setTotalRequired(total)

//     const numAmount = parseFloat(amount) || 0
//     if (numAmount === 0 || total === 0) {
//       setPriceReminder(null)
//     } else if (numAmount >= total) {
//       setPriceReminder(`✅ Amount is enough and matches the total price of ₱${total}.`)
//     } else {
//       const diff = total - numAmount
//       setPriceReminder(`⚠️ Amount is not enough. Missing ₱${diff.toFixed(2)} from ₱${total}.`)
//     }
//   }, [entriesState, amount])

//   const handleSubmit = () => {
//     const incomplete = entriesState.some((e) => !e.entryNumber || !e.entryKey)
//     if (incomplete || !preview || !amount) {
//       setError("Please complete all required fields.")
//       return
//     }

//     setError("")
//     setSuccess(true)
//   }

//   const handleAddEntry = () => {
//     setEntriesState([...entriesState, { entryNumber: "", entryKey: "" }])
//   }

//   const handleJointPaymentChange = (checked: boolean) => {
//     setIsJointPayment(checked)
//     if (!checked) {
//       setEntriesState([{ entryNumber: entriesState[0].entryNumber, entryKey: entriesState[0].entryKey }])
//     }
//   }

//   const handleDragEnd = (event: any) => {
//     const { active, over } = event
//     if (active.id !== over?.id) {
//       const oldIndex = entriesState.findIndex((_, i) => i.toString() === active.id)
//       const newIndex = entriesState.findIndex((_, i) => i.toString() === over?.id)
//       setEntriesState((items) => arrayMove(items, oldIndex, newIndex))
//     }
//   }

//   if (!isOpen) return null

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <motion.div
//           className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
//           onClick={(e) => e.stopPropagation()}
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//         >
//           <motion.div
//             className="bg-white rounded-xl shadow-xl w-full max-w-2xl relative flex flex-col max-h-[83vh] mt-14"
//             onClick={(e) => e.stopPropagation()}
//             initial={{ y: 50, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: 50, opacity: 0 }}
//             transition={{ type: "spring", stiffness: 300, damping: 30 }}
//           >
//             <div className="relative p-6 border-b">
//               <h2 className="text-lg font-bold text-gray-800 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
//                 Upload Proof of Payment
//               </h2>
//               <button
//                 type="button"
//                 onClick={(e) => {
//                   e.stopPropagation()
//                   onClose()
//                 }}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1">

//               <div className="w-full">
//                 {/* 💡 Move reminder above the Entry Number / Entry Key labels */}
//                 {!amount && (
//                   <div className="text-sm font-medium text-gray-600 px-14 pb-2">
//                     💡 Enter an amount to check if this entry is covered.
//                   </div>
//                 )}

//                 <div className="grid grid-cols-2 gap-14 px-14">
//                   <label className="block text-sm font-medium text-gray-700 text-start">
//                     Entry Number <span className="text-red-500">*</span>
//                   </label>
//                   <label className="block text-sm font-medium text-gray-700 text-start">
//                     Entry Key <span className="text-red-500">*</span>
//                   </label>
//                 </div>

//                 <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//                   <SortableContext
//                     items={entriesState.map((_, i) => i.toString())}
//                     strategy={verticalListSortingStrategy}
//                   >
//                     <div className="flex flex-col gap-2">
//                       {entriesState.map((entry, index) => {
//                         const matchedEntry = entries.find(
//                           (e) => e.entryKey === entry.entryKey && e.entryNumber === entry.entryNumber
//                         )

//                         let entryTotal = 0
//                         if (matchedEntry) {
//                           const eventInfo = events.find((ev) => ev._id === matchedEntry.event.event_id)
//                           const tournamentInfo = tournaments.find(
//                             (t) => t._id === eventInfo?.tournamentID
//                           )
//                           if (eventInfo && tournamentInfo) {
//                             const now = new Date()
//                             const earlyBirdEnd = new Date(tournamentInfo.dates.earlyBirdPaymentEnd)
//                             const isEarlyBird = now <= earlyBirdEnd && tournamentInfo.settings.hasEB
//                             const pricePerPlayer = isEarlyBird
//                               ? eventInfo.earlyBirdPricePerPlayer
//                               : eventInfo.pricePerPlayer
//                             const isDoubles = eventInfo.type === "DOUBLES"
//                             const playerCount = isDoubles ? 2 : 1
//                             entryTotal = pricePerPlayer * playerCount
//                           }
//                         }

//                         // Kani ang ga based sa reminder na verification sa amount
//                         let cumulativeBefore = 0
//                         for (let i = 0; i < index; i++) {
//                           const prevEntry = entriesState[i]
//                           const prevMatched = entries.find(
//                             (e) => e.entryKey === prevEntry.entryKey && e.entryNumber === prevEntry.entryNumber
//                           )
//                           if (!prevMatched) continue
//                           const prevEvent = events.find((ev) => ev._id === prevMatched.event.event_id)
//                           const prevTournament = tournaments.find((t) => t._id === prevEvent?.tournamentID)
//                           if (!prevEvent || !prevTournament) continue
//                           const now = new Date()
//                           const prevEarlyBirdEnd = new Date(prevTournament.dates.earlyBirdPaymentEnd)
//                           const prevIsEB = now <= prevEarlyBirdEnd && prevTournament.settings.hasEB
//                           const prevPrice = prevIsEB ? prevEvent.earlyBirdPricePerPlayer : prevEvent.pricePerPlayer
//                           const prevCount = prevEvent.type === "DOUBLES" ? 2 : 1
//                           cumulativeBefore += prevPrice * prevCount
//                         }

//                         const numAmount = Number(amount || 0)
//                         let reminderText = ""

//                         if (!amount) {
//                           reminderText = "" // remove per-entry reminders when no amount
//                         } else if (entryTotal === 0) {
//                           reminderText = ""
//                         } else {
//                           const cumulativeAfter = cumulativeBefore + entryTotal

//                           if (cumulativeAfter <= numAmount) {
//                             reminderText = `✅ Amount is enough and matches the total price of ₱${entryTotal}.`
//                           } else {
//                             const diff = cumulativeAfter - numAmount
//                             reminderText = `⚠️ Amount is not enough. Missing ₱${diff.toFixed(2)} from ₱${numAmount}.`
//                           }
//                         }

//                         return (
//                           <div key={index} className="space-y-2">
//                             {reminderText && (
//                               <div
//                                 className={`text-sm font-medium px-14 ${reminderText.startsWith("✅")
//                                   ? "text-green-600"
//                                   : reminderText.startsWith("⚠️")
//                                     ? "text-red-600"
//                                     : "text-gray-600"
//                                   }`}
//                               >
//                                 {reminderText}
//                               </div>
//                             )}

//                             <SortableEntry
//                               id={index.toString()}
//                               index={index}
//                               entry={entry}
//                               isJointPayment={isJointPayment}
//                               onChange={(i, field, value) => {
//                                 const updated = [...entriesState]
//                                 updated[i] = { ...updated[i], [field]: value }
//                                 setEntriesState(updated)
//                               }}
//                               onDelete={(i) =>
//                                 setEntriesState(entriesState.filter((_, idx) => idx !== i))
//                               }
//                             />
//                           </div>
//                         )
//                       })}
//                     </div>
//                   </SortableContext>
//                 </DndContext>
//               </div>

//               {isJointPayment && (
//                 <Button
//                   type="button"
//                   onClick={handleAddEntry}
//                   className="w-full bg-green-600 text-white cursor-pointer hover:bg-green-500"
//                 >
//                   Add Entry/Entries
//                 </Button>
//               )}

//               <div className="border-2 border-dashed border-green-300 rounded-xl p-4 bg-green-50 flex flex-col items-center">
//                 <div className="w-full text-left mb-3">
//                   <div className="text-green-800 font-bold text-sm mb-1">
//                     Upload Proof of Payment <span className="text-red-500">*</span>
//                   </div>
//                   <p className="text-gray-600 text-xs">
//                     Make sure the uploaded image or file is clear and readable.
//                   </p>
//                 </div>

//                 <div className="w-full flex justify-center mb-4">
//                   {preview ? (
//                     fileType === "image" ? (
//                       <Image
//                         src={preview}
//                         alt="Uploaded Preview"
//                         width={400}
//                         height={250}
//                         className="w-full max-w-[300px] rounded-lg border shadow"
//                       />
//                     ) : (
//                       <embed
//                         src={preview}
//                         type="application/pdf"
//                         className="w-full h-[300px] rounded-lg border shadow"
//                       />
//                     )
//                   ) : (
//                     <Image
//                       src="/id.png"
//                       alt="Sample Proof Placeholder"
//                       width={400}
//                       height={250}
//                       className="w-full max-w-[300px] rounded-lg border shadow"
//                     />
//                   )}
//                 </div>

//                 <label
//                   htmlFor="proofUpload"
//                   className="cursor-pointer w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-green-400 rounded-xl bg-white hover:bg-green-100 transition"
//                 >
//                   <UploadIcon className="w-6 h-6 text-green-600 mb-2" />
//                   <span className="text-green-700 font-medium text-sm">
//                     Drag & Drop your files or <span className="underline">Browse</span>
//                   </span>
//                   <input
//                     id="proofUpload"
//                     type="file"
//                     accept="image/*,.pdf"
//                     className="hidden"
//                     onChange={(e) => {
//                       const file = e.target.files?.[0]
//                       if (!file) return
//                       if (file.type.startsWith("image/")) {
//                         const reader = new FileReader()
//                         reader.onloadend = () => {
//                           setPreview(reader.result as string)
//                           setFileType("image")
//                         }
//                         reader.readAsDataURL(file)
//                       } else if (file.type === "application/pdf") {
//                         const pdfUrl = URL.createObjectURL(file)
//                         setPreview(pdfUrl)
//                         setFileType("pdf")
//                       } else {
//                         setPreview(null)
//                         setFileType(null)
//                       }
//                     }}
//                   />
//                 </label>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 text-start">
//                   Amount <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="number"
//                   value={amount}
//                   onChange={(e) => setAmount(e.target.value)}
//                   placeholder="Enter amount: ₱1000.00"
//                   className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-400 border-gray-300"
//                 />
//               </div>
//             </div>

//             <div className="p-3 border-t bg-white">
//               <div className="flex items-center gap-2 mb-4">
//                 <input
//                   id="jointPayment"
//                   type="checkbox"
//                   checked={isJointPayment}
//                   onChange={(e) => handleJointPaymentChange(e.target.checked)}
//                   className="w-4 h-4 text-green-600 border-gray-300 rounded"
//                 />
//                 <label
//                   htmlFor="jointPayment"
//                   className="text-sm text-red-500 font-medium cursor-pointer"
//                 >
//                   Payment for Multiple Entries
//                 </label>
//               </div>

//               <Button
//                 className="w-full bg-green-600 text-white cursor-pointer hover:bg-green-700"
//                 onClick={handleSubmit}
//               >
//                 Submit
//               </Button>
//             </div>

//             <AnimatePresence>
//               {success && (
//                 <motion.div
//                   className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center rounded-xl"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   exit={{ opacity: 0 }}
//                 >
//                   <p className="text-green-600 font-bold text-lg mb-2">Submitted!</p>
//                   <p className="text-gray-600 text-sm mb-4 text-center">
//                     Your proof of payment was submitted successfully.
//                   </p>
//                   <Button
//                     onClick={() => {
//                       setSuccess(false)
//                       onClose()
//                     }}
//                     className="bg-green-600 text-white hover:bg-green-700"
//                   >
//                     Close
//                   </Button>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   )
// }

export function CheckEntryModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [showResult, setShowResult] = useState(false)
  const [entryValue, setEntryValue] = useState("")
  const [foundEntry, setFoundEntry] = useState<any | null>(null)
  const [error, setError] = useState("")

  const [checkEntry, { loading, data, error: queryError }] =
    useLazyQuery<CheckEntryData>(CHECK_ENTRY)

  useEffect(() => {
    if (isOpen) {
      setEntryValue("")
      setError("")
      setFoundEntry(null)
      setShowResult(false)
    }
  }, [isOpen])

  const handleCheck = async () => {
    if (!entryValue.trim()) {
      setError("Please enter your Entry Number and Entry Key.")
      return
    }

    if (!entryValue.includes("_")) {
      setError(
        "Invalid format. Use EntryNum_EntryKey (e.g. V8-009809_kajKER55)."
      )
      return
    }

    const [entryNumber, entryKey] = entryValue.split("_")

    try {
      const { data } = await checkEntry({ variables: { entryNumber, entryKey } })

      if (data?.checkEntry) {
        setFoundEntry(data.checkEntry)
        setShowResult(true)
        setError("")
      } else {
        setError("Entry not found. Please double-check your Entry Number and Key.")
      }
    } catch (err) {
      console.error(err)
      setError("Something went wrong while searching. Please try again.")
    }
  }

  const getStatusIcon = (status: string) => {
    if (status.includes("PENDING"))
      return <Clock className="w-5 h-5 text-yellow-500" />
    if (status.includes("APPROVED"))
      return <CheckCircle className="w-5 h-5 text-green-600" />
    if (status.includes("VERIFIED"))
      return <Mail className="w-5 h-5 text-blue-600" />
    if (status.includes("PAYMENT"))
      return <Wallet2Icon className="w-5 h-5 text-emerald-600" />
    if (status.includes("REJECTED"))
      return <AlertTriangle className="w-5 h-5 text-red-500" />
    return <Clock className="w-5 h-5 text-gray-400" />
  }

  const getStatusColor = (status: string) => {
    if (status.includes("PENDING")) return "text-yellow-600"
    if (status.includes("APPROVED")) return "text-green-700"
    if (status.includes("VERIFIED")) return "text-blue-700"
    if (status.includes("PAYMENT")) return "text-emerald-700"
    if (status.includes("REJECTED")) return "text-red-700"
    return "text-gray-700"
  }

  return (
    <>
      {/* 🔹 Input Modal */}
      <AnimatePresence>
        {isOpen && !showResult && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Check Entry
              </h2>

              <p className="text-sm text-gray-600 mb-4 text-left">
                Enter your <strong>Entry Reference Number</strong> below:
              </p>


              <div className="mb-4">
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
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${error
                      ? "border-red-500 focus:ring-red-400"
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
                className="w-full bg-green-600 text-white cursor-pointer hover:bg-green-700"
                onClick={handleCheck}
                disabled={loading}
              >
                {loading ? "Checking..." : "Check Entry"}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showResult && foundEntry && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
            onClick={() => {
              setShowResult(false)
              onClose()
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <button
                onClick={() => {
                  setShowResult(false)
                  onClose()
                }}
                className="absolute top-6 right-3 text-gray-400 cursor-pointer hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Entry Status
              </h2>

              <div className="text-sm text-gray-700 space-y-2 mb-4">
                <p>
                  <strong>Entry:</strong>{" "}
                  <span className="font-mono">
                    {foundEntry.entryNumber}_{foundEntry.entryKey}
                  </span>
                </p>
                <p>
                  <strong>Event:</strong> {foundEntry.event?.name}
                </p>
                <p>
                  <strong>Club:</strong> {foundEntry.club || "N/A"}
                </p>
                <p>
                  <strong>In Software:</strong>{" "}
                  {foundEntry.isInSoftware ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Early Bird:</strong>{" "}
                  {foundEntry.isEarlyBird ? "Yes" : "No"}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Statuses</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {foundEntry.statuses.map((statusItem: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3">
                      {getStatusIcon(statusItem.status)}
                      <div>
                        <p
                          className={`${getStatusColor(
                            statusItem.status
                          )} font-medium`}
                        >
                          {new Date(statusItem.date).toLocaleString()} →{" "}
                          {statusItem.status.replaceAll("_", " ")}
                        </p>
                        {statusItem.reason && (
                          <p className="text-sm text-gray-500">
                            Reason: {statusItem.reason}
                          </p>
                        )}
                        {statusItem.by && (
                          <p className="text-xs text-gray-400 italic">
                            by {statusItem.by.name} ({statusItem.by.role})
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {foundEntry.remarks?.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-800 mb-2">Remarks</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {foundEntry.remarks.map((remark: any, idx: number) => (
                      <div
                        key={idx}
                        className="border p-2 rounded-md text-sm bg-gray-50"
                      >
                        <p>{remark.remark}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(remark.date).toLocaleString()} —{" "}
                          {remark.by?.name || "System"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => {
                    setShowResult(false)
                    onClose()
                  }}
                  className="bg-green-600 cursor-pointer text-white hover:bg-green-700"
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
// "use client"

// import { Suspense, useEffect, useState } from "react"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Separator } from "@/components/ui/separator"
// import { Trophy, ExternalLink, Users, User, Search, UploadIcon, Calendar, Ampersand } from "lucide-react"
// import Link from "next/link"
// import { motion } from "framer-motion"
// import { useQuery, useSubscription } from "@apollo/client/react"
// import { CategoryModal, CheckEntryModal, PublicTournamentsData, UploadProofMergedModal } from "@/components/custom/category-selection"
// import { format, isSameMonth, isSameYear } from "date-fns"
// import Header from "@/components/custom/header-white"
// import { EVENT_CHANGED_SUBSCRIPTION, PUBLIC_TOURNAMENTS } from "@/graphql/events/queries"
// import FloatingTicketing from "@/components/custom/ticket"
// import Image from "next/image"
// import { useSearchParams } from "next/navigation"

// interface EventChangedResponse {
//     eventChanged: {
//         type: string;
//         event: {
//             _id: string;
//             name: string;
//             gender: string;
//             type: string;
//             isClosed: boolean;
//         };
//     };
// }

// function CategoryCard({
//     name,
//     type,
//     level,
//     gender,
//     isClosed,
//     onClick
// }: {
//     name: string
//     type: "Doubles" | "Singles"
//     level: string
//     gender: string
//     isClosed?: boolean
//     onClick: () => void
// }) {
//     const levelColor = {
//         "13U": "bg-green-100 text-green-800",
//         "16U": "bg-blue-100 text-blue-800",
//         "9U": "bg-yellow-100 text-yellow-800",
//         Beginners: "bg-yellow-100 text-yellow-800",
//         Advanced: "bg-orange-100 text-orange-800",
//         Open: "bg-red-100 text-red-800",
//         Legend: "bg-purple-100 text-purple-800",
//         G: "bg-green-100 text-green-800",
//         F: "bg-yellow-100 text-yellow-800",
//         E: "bg-blue-100 text-blue-800",
//     }[level] || "bg-gray-100 text-gray-800"

//     const genderColor = gender === "Men's" ? 'bg-blue-100 text-blue-800' :
//         gender === "Women's" ? 'bg-pink-100 text-pink-800' :
//             'bg-purple-100 text-purple-800'

//     return (
//         <button
//             onClick={onClick}
//             className={`flex flex-col items-start p-4 rounded-lg border cursor-pointer transition w-full min-w-0 ${isClosed
//                 ? 'border-red-200 bg-red-50/50 hover:bg-red-100/50'
//                 : 'border-gray-200 bg-white hover:shadow-md hover:border-gray-300'
//                 }`}
//         >
//             <div className="flex flex-wrap items-center gap-2 mb-2 w-full relative">
//                 {type === "Doubles"
//                     ? <Users className="w-4 h-4 text-gray-600 flex-shrink-0" />
//                     : <User className="w-4 h-4 text-gray-600 flex-shrink-0" />}
//                 <Badge className={`text-xs px-2 py-0.5 ${levelColor} flex-shrink-0`}>{level}</Badge>
//                 <Badge className={`text-xs px-2 py-0.5 ${genderColor} flex-shrink-0`}>
//                     {gender}
//                 </Badge>
//                 {isClosed && (
//                     <Badge className="absolute top-0 right-0 bg-red-100 text-red-800 text-xs px-2 py-0.5 border border-red-300">
//                         Closed
//                     </Badge>
//                 )}
//             </div>
//             <span className="font-medium text-gray-800 text-sm md:text-base lg:text-base xl:text-base 2xl:text-base text-left break-words w-full">{name}</span>
//             <div className="text-xs text-gray-500 mt-1">{type}</div>
//         </button>
//     )
// }

// export default function CategoriesPage() {

//     const searchParams = useSearchParams()
//     const tournamentId = searchParams.get("tournament")
//     const [selectedCategory, setSelectedCategory] = useState<{
//         id: string
//         name: string
//         type: "Doubles" | "Singles"
//         level?: string
//         gender?: string
//         isClosed?: boolean
//         pricePerPlayer?: number
//         earlyBirdPricePerPlayer?: number
//         currency?: string
//         hasEarlyBird?: boolean
//     } | null>(null)

//     const [isModalOpen, setIsModalOpen] = useState(false)
//     const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
//     const [isCheckEntryModalOpen, setIsCheckEntryModalOpen] = useState(false)
//     const [showReconciliation, setShowReconciliation] = useState(false)
//     const [localEvents, setLocalEvents] = useState<any[]>([])

//     const handleMerge = (mergedData: Record<string, any>) => {
//         console.log("✅ Merged Data:", mergedData)
//         setShowReconciliation(false)
//     }

//     const { data, loading, error } = useQuery<PublicTournamentsData>(PUBLIC_TOURNAMENTS)

//     useSubscription<EventChangedResponse>(EVENT_CHANGED_SUBSCRIPTION, {
//         onData: ({ data }) => {
//             const eventChanged = data.data?.eventChanged;

//             if (eventChanged) {
//                 const { type, event } = eventChanged;

//                 // Update local events based on subscription
//                 setLocalEvents(prevEvents => {
//                     const updatedEvents = prevEvents.map(e => {
//                         if (e.id === event._id) {
//                             return {
//                                 ...e,
//                                 isClosed: event.isClosed
//                             };
//                         }
//                         return e;
//                     });
//                     return updatedEvents;
//                 });

//                 console.log(`Event ${type}: ${event.name} - Closed: ${event.isClosed}`);
//             }
//         }
//     })

//     const activeTournament = tournamentId
//         ? data?.publicTournaments?.find((t: any) => t._id === tournamentId)
//         : data?.publicTournaments?.find((t: any) => t.isActive)

//     useEffect(() => {
//         if (activeTournament && activeTournament.events) {

//             activeTournament.events.forEach((event: any, index: number) => {
//                 // Check early bird at tournament level (settings.hasEarlyBird)
//                 const hasEarlyBird = activeTournament.settings?.hasEarlyBird;
//                 const actualPrice = hasEarlyBird && event.earlyBirdPricePerPlayer
//                     ? event.earlyBirdPricePerPlayer
//                     : event.pricePerPlayer;

//             });

//             const earlyBirdCategories = activeTournament.settings?.hasEarlyBird
//                 ? activeTournament.events.length
//                 : 0;

//         }
//     }, [activeTournament])

//     useEffect(() => {
//         if (activeTournament?.events) {
//             const mappedEvents = activeTournament.events.map((event: any) => {
//                 const rawGender = event.gender?.toLowerCase()
//                 let gender = "Mixed"

//                 if (rawGender === "m" || rawGender === "male") gender = "Men's"
//                 else if (rawGender === "w" || rawGender === "f" || rawGender === "female") gender = "Women's"
//                 else if (rawGender === "x" || rawGender === "mixed") gender = "Mixed"

//                 const type = event.type?.toUpperCase() === "DOUBLES" ? "Doubles" : "Singles"

//                 return {
//                     id: event._id,
//                     name: event.name,
//                     level: event.level || "Open",
//                     type,
//                     gender,
//                     pricePerPlayer: event.pricePerPlayer,
//                     earlyBirdPricePerPlayer: event.earlyBirdPricePerPlayer,
//                     currency: event.currency,
//                     isClosed: event.isClosed,
//                 }
//             });
//             setLocalEvents(mappedEvents);
//         }
//     }, [activeTournament]);

//     function formatDateRange(start?: string | number | null, end?: string | number | null): string {
//         if (!start || !end) return ""

//         const startDate = new Date(start)
//         const endDate = new Date(end)

//         if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return ""

//         if (isSameYear(startDate, endDate)) {
//             if (isSameMonth(startDate, endDate)) {
//                 return `${format(startDate, "MMMM d")} - ${format(endDate, "d, yyyy")}`
//             }
//             return `${format(startDate, "MMMM d")} - ${format(endDate, "MMMM d, yyyy")}`
//         }

//         return `${format(startDate, "MMMM d, yyyy")} - ${format(endDate, "MMMM d, yyyy")}`
//     }

//     const formattedRange = formatDateRange(
//         activeTournament?.dates?.tournamentStart?.toString(),
//         activeTournament?.dates?.tournamentEnd?.toString()
//     )

//     const events = localEvents

//     const sortCategoriesByGender = (list: typeof events) => {
//         const mens = list.filter((level: any) => level.gender === "Men's")
//         const womens = list.filter((level: any) => level.gender === "Women's")
//         const mixed = list.filter((level: any) => level.gender === "Mixed")
//         return [...mens, ...womens, ...mixed]
//     }

//     const doublesCategories = sortCategoriesByGender(
//         events.filter((level: any) => level.type === "Doubles")
//     )
//     const singlesCategories = sortCategoriesByGender(
//         events.filter((level: any) => level.type === "Singles")
//     )

//     const handleCategoryClick = (category: any) => {
//         setSelectedCategory({
//             id: category.id,
//             name: category.name,
//             type: category.type,
//             level: category.level,
//             gender: category.gender,
//             isClosed: category.isClosed,
//             pricePerPlayer: category.pricePerPlayer,
//             earlyBirdPricePerPlayer: category.earlyBirdPricePerPlayer,
//             currency: category.currency,
//             hasEarlyBird: activeTournament?.settings?.hasEarlyBird
//         })
//         setIsModalOpen(true)
//     }

//     const renderGenderSection = (
//         group: string,
//         categories: typeof events,
//         title: string
//     ) => {
//         const groupCategories = categories.filter((level: any) => level.gender === group)
//         if (groupCategories.length === 0) return null

//         const colorClass =
//             group === "Men's"
//                 ? "bg-blue-500"
//                 : group === "Women's"
//                     ? "bg-pink-500"
//                     : "bg-purple-500"

//         return (
//             <div key={group} className="mb-8">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                     <div className={`w-2 h-2 rounded-full ${colorClass}`} />
//                     {group} {title}
//                 </h3>
//                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
//                     {groupCategories.map((category: any, idx: any) => (
//                         <CategoryCard
//                             key={category.id || idx}
//                             name={category.name}
//                             type={category.type}
//                             level={category.level}
//                             gender={category.gender}
//                             isClosed={category.isClosed}
//                             onClick={() => handleCategoryClick(category)}
//                         />
//                     ))}
//                 </div>
//             </div>
//         )
//     }

//     if (loading) {
//         return (
//             <div className="flex justify-center items-center h-screen">
//                 <div className="text-gray-500">Loading tournament details...</div>
//             </div>
//         )
//     }

//     if (error) {
//         console.error("GraphQL Error:", error)
//         return (
//             <div className="flex flex-col justify-center items-center h-screen gap-4">
//                 <div className="text-red-500 font-bold text-3xl">
//                     Error loading tournaments
//                 </div>
//                 <pre className="bg-gray-100 text-red-700 p-4 rounded max-w-lg overflow-x-auto">
//                     {JSON.stringify(error, null, 2)}
//                 </pre>
//             </div>
//         )
//     }

//     if (!data?.publicTournaments?.length) {
//         return (
//             <div className="relative h-screen w-screen">
//                 <Image
//                     src="/images/no_tour.jpg"
//                     alt="No tournament"
//                     fill
//                     priority
//                     className="object-cover"
//                 />

//                 <div className="absolute inset-0 bg-black/60" />

//                 <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center gap-4">
//                     <Image
//                         src="/assets/c-one-logo-white.png"
//                         alt="C-One Logo"
//                         width={300}
//                         height={80}
//                         priority
//                         className="object-contain"
//                     />

//                     <h1 className="text-white font-bold text-2xl sm:text-3xl md:text-4xl">
//                         There is no Current{" "}
//                         <span className="text-green-400">Active Badminton Tournament</span>
//                     </h1>

//                     <p className="text-white text-lg">
//                         Please Check our{" "}
//                         <Link
//                             href="https://www.facebook.com/c.onebadmintonchallenge/"
//                             className=" text-blue-300"
//                         >
//                             <span className="underline underline-offset-2 inline-block hover:scale-105 transition-transform duration-300">
//                                 FB Page
//                             </span>
//                         </Link>{" "}
//                         to see the updates and more information.
//                     </p>
//                 </div>
//             </div>
//         )
//     }

//     return (

//         <div className="min-h-screen bg-linear-to-b from-green-50/30 to-green-100/30 relative">
//             <Header />
//             <div className="relative bg-white border-b shadow-sm overflow-hidden mt-16">
//                 <div
//                     className="
//     absolute
//     top-5 md:top-7
//     right-[-39px] md:right-[-70px] lg:top-9 lg:right-[-65px]
//     rotate-45
//     bg-linear-to-br from-green-600 to-green-800
//     text-white
//     text-[10px] md:text-base
//     font-medium md:font-semibold
//     py-2 sm:py-3 md:py-5
//     px-8 sm:px-12 md:px-16
//     shadow-md
//     whitespace-nowrap
//   "
//                 >
//                     {formattedRange}
//                 </div>

//                 <div className="container mx-auto px-4 py-8 text-center">
//                     <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
//                         Categories
//                     </h2>
//                     <div className="h-1 w-36 mx-auto rounded-full bg-linear-to-r from-green-400 to-green-700 mb-6"></div>

//                     <div className="flex items-center gap-2 mb-4 justify-center">
//                         <Trophy className="w-8 h-8 text-yellow-500" />
//                         <Badge className="bg-green-100 text-green-800 px-3 py-1">
//                             Registration Open
//                         </Badge>
//                     </div>

//                     <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//                         C-ONE Badminton Challenge
//                     </h1>

//                     <div className="max-w-3xl mx-auto text-gray-600 space-y-3 mb-6">
//                         <p>
//                             Welcome to the C-ONE Badminton Challenge! This exciting event is hosted by
//                             C-ONE badminton, offering players of all levels an opportunity to showcase
//                             their skills and compete in a friendly and supportive environment.
//                         </p>
//                         <p>
//                             The challenge includes various categories, such as singles, doubles, and
//                             mixed doubles, with winners awarded prizes at the end of the event.
//                         </p>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
//                         <Button
//                             variant="outline"
//                             onClick={() => setIsCheckEntryModalOpen(true)}
//                             className="cursor-pointer text-base bg-teal-600 text-white hover:bg-teal-700 flex items-center justify-center px-5 py-6 gap-2"
//                         >
//                             <Search className="!w-5 !h-5" />
//                             Check Entry
//                         </Button>
//                         <Button
//                             variant="outline"
//                             onClick={() => setIsUploadModalOpen(true)}
//                             className="cursor-pointer text-base bg-green-600 text-white hover:bg-green-700 flex items-center justify-center px-5 py-6 gap-2"
//                         >
//                             <UploadIcon className="!w-5 !h-5" />
//                             Upload Payment
//                         </Button>
//                     </div>

//                 </div>

//             </div>

//             <div className="container mx-auto px-4 py-12">
//                 <div className="text-center mb-5">
//                     <motion.h2
//                         className="text-3xl font-extrabold text-gray-900"
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ duration: 0.6 }}
//                     >
//                         Tournament Categories
//                     </motion.h2>
//                     <motion.div
//                         className="mt-2 h-1 w-36 mx-auto rounded-full bg-linear-to-r from-green-400 to-green-700"
//                         initial={{ width: 0 }}
//                         animate={{ width: "9rem" }}
//                         transition={{ duration: 0.8, delay: 0.3 }}
//                     />
//                     <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
//                         Choose your category below and click on any category to view details and register.
//                     </p>
//                 </div>

//                 {activeTournament?.settings?.hasEarlyBird && (
//                     <div className="container mx-auto px-4 mb-6">
//                         <motion.div
//                             initial={{ opacity: 0, y: 20 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{ duration: 0.5 }}
//                             className="max-w-2xl mx-auto"
//                         >
//                             <div className="text-center mb-4">
//                                 <div className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full mb-2">
//                                     <Calendar className="w-3.5 h-3.5" />
//                                     <span className="font-medium text-xs">Important Dates</span>
//                                 </div>
//                                 <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-0.5">
//                                     Registration Deadlines
//                                 </h2>
//                                 <p className="text-xs text-gray-600">Mark your calendar and don't miss out!</p>
//                             </div>

//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
//                                 <motion.div
//                                     initial={{ opacity: 0, x: -50 }}
//                                     animate={{ opacity: 1, x: 0 }}
//                                     transition={{ delay: 0.2, duration: 0.6 }}
//                                     className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-md p-4 border-2 border-yellow-400 relative overflow-hidden"
//                                 >
//                                     <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[8px] font-bold px-2 py-0.5 rounded-bl-lg">
//                                         Early Bird
//                                     </div>
//                                     <div className="mt-3">
//                                         <div className="flex items-center gap-2 mb-3">
//                                             <div className="bg-yellow-400 p-1.5 rounded-md shadow-sm">
//                                                 <Calendar className="w-4 h-4 text-yellow-900" />
//                                             </div>
//                                             <div>
//                                                 <p className="text-[8px] text-yellow-700 uppercase tracking-wider font-semibold">
//                                                     Save More Payment
//                                                 </p>
//                                                 <h3 className="text-sm font-bold text-gray-900">
//                                                     Early Bird Payment End
//                                                 </h3>
//                                             </div>
//                                         </div>
//                                         <div className="text-center bg-white rounded-lg p-3 shadow-inner">
//                                             <p className="text-[10px] text-gray-500 mb-0.5">Early Bird Payment Closes On</p>
//                                             <p className="text-2xl font-bold text-yellow-600 mb-0.5">
//                                                 {activeTournament?.dates?.earlyBirdPaymentEnd ?
//                                                     format(new Date(activeTournament.dates.earlyBirdPaymentEnd), "dd") : "—"}
//                                             </p>
//                                             <p className="text-xs font-semibold text-yellow-700">
//                                                 {activeTournament?.dates?.earlyBirdPaymentEnd ?
//                                                     format(new Date(activeTournament.dates.earlyBirdPaymentEnd), "MMMM yyyy") : "—"}
//                                             </p>
//                                             <div className="mt-2 pt-2 border-t border-yellow-200">
//                                                 <p className="text-[10px] text-gray-600">
//                                                     Register now to enjoy discounted rates!
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </motion.div>

//                                 <motion.div
//                                     initial={{ opacity: 0, x: 50 }}
//                                     animate={{ opacity: 1, x: 0 }}
//                                     transition={{ delay: 0.4, duration: 0.6 }}
//                                     className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-4 border-2 border-green-400 relative overflow-hidden"
//                                 >
//                                     <div className="absolute top-0 right-0 bg-green-400 text-green-900 text-[8px] font-bold px-2 py-0.5 rounded-bl-lg">
//                                         Final Deadline
//                                     </div>
//                                     <div className="mt-3">
//                                         <div className="flex items-center gap-2 mb-3">
//                                             <div className="bg-green-400 p-1.5 rounded-md shadow-sm">
//                                                 <Calendar className="w-4 h-4 text-green-900" />
//                                             </div>
//                                             <div>
//                                                 <p className="text-[8px] text-green-700 uppercase tracking-wider font-semibold">
//                                                     Last Chance Payment
//                                                 </p>
//                                                 <h3 className="text-sm font-bold text-gray-900">
//                                                     Registration Closes
//                                                 </h3>
//                                             </div>
//                                         </div>
//                                         <div className="text-center bg-white rounded-lg p-3 shadow-inner">
//                                             <p className="text-[10px] text-gray-500 mb-0.5">Final Date</p>
//                                             <p className="text-2xl font-bold text-green-600 mb-0.5">
//                                                 {activeTournament?.dates?.registrationEnd ?
//                                                     format(new Date(activeTournament.dates.registrationEnd), "dd") : "—"}
//                                             </p>
//                                             <p className="text-xs font-semibold text-green-700">
//                                                 {activeTournament?.dates?.registrationEnd ?
//                                                     format(new Date(activeTournament.dates.registrationEnd), "MMMM yyyy") : "—"}
//                                             </p>
//                                             <div className="mt-2 pt-2 border-t border-green-200">
//                                                 <p className="text-[10px] text-gray-600">
//                                                     No registrations accepted after this date
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </motion.div>

//                                 <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
//                                     <div className="bg-white rounded-full p-1.5 shadow-sm border border-gray-300">
//                                         <Ampersand className="h-4 w-4" />
//                                     </div>
//                                 </div>
//                             </div>
//                         </motion.div>
//                     </div>
//                 )}

//                 <div className="mb-12">
//                     <div className="flex items-center gap-3 mb-6">
//                         <Users className="w-6 h-6 text-blue-600" />
//                         <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
//                             Doubles Categories
//                         </h2>
//                         <Badge variant="outline" className="bg-blue-50 text-blue-700">
//                             {doublesCategories.length} categories
//                         </Badge>
//                     </div>

//                     {["Men's", "Women's", "Mixed"].map((group) =>
//                         renderGenderSection(group, doublesCategories, "Doubles")
//                     )}
//                 </div>

//                 <Separator className="my-8" />

//                 <div className="mb-12">
//                     <div className="flex items-center gap-3 mb-6">
//                         <User className="w-6 h-6 text-purple-600" />
//                         <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
//                             Singles Categories
//                         </h2>
//                         <Badge variant="outline" className="bg-purple-50 text-purple-700">
//                             {singlesCategories.length} categories
//                         </Badge>
//                     </div>

//                     {["Men's", "Women's", "Mixed"].map((group) =>
//                         renderGenderSection(group, singlesCategories, "Singles")
//                     )}
//                 </div>

//                 <div className="bg-white rounded-lg p-6 mt-12 text-center shadow-sm">
//                     <div className="max-w-2xl mx-auto">
//                         <p className="text-gray-600 mb-4">
//                             Need help choosing the right category? Contact us through our Facebook page.
//                         </p>
//                         <Button
//                             variant="outline"
//                             size="sm"
//                             className="flex items-center gap-2 mx-auto mb-4 cursor-pointer"
//                             onClick={() =>
//                                 window.open(
//                                     "https://www.facebook.com/c.onebadmintonchallenge/",
//                                     "_blank"
//                                 )
//                             }
//                         >
//                             <ExternalLink className="w-4 h-4" />
//                             Facebook Page
//                         </Button>
//                         <p className="text-sm text-gray-500">
//                             Registration fees vary by category level. Payment details will be provided
//                             after category selection.
//                         </p>
//                     </div>
//                 </div>
//             </div>

//             <FloatingTicketing />
//             <CategoryModal
//                 isOpen={isModalOpen}
//                 onClose={() => setIsModalOpen(false)}
//                 category={selectedCategory}
//             />

//             <UploadProofMergedModal
//                 isOpen={isUploadModalOpen}
//                 onClose={() => setIsUploadModalOpen(false)}
//             />

//             <CheckEntryModal
//                 isOpen={isCheckEntryModalOpen}
//                 onClose={() => setIsCheckEntryModalOpen(false)}
//             />

//         </div>
//     )
// }

"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Trophy,
  ExternalLink,
  Users,
  User,
  Search,
  UploadIcon,
  Calendar,
  Ampersand,
  ArrowLeftIcon,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useQuery, useSubscription } from "@apollo/client/react"
import {
  CategoryModal,
  CheckEntryModal,
  PublicTournamentsData,
  UploadProofMergedModal,
} from "@/components/custom/category-selection"
import { DataReconciliationModal } from "@/components/custom/data-reconciliation"
import { format, isSameMonth, isSameYear } from "date-fns"
import Header from "@/components/custom/header-white"
import {
  EVENT_CHANGED_SUBSCRIPTION,
  PUBLIC_TOURNAMENTS,
} from "@/graphql/events/queries"
import FloatingTicketing from "@/components/custom/ticket"
import Image from "next/image"
import { useSearchParams } from "next/navigation"

interface EventChangedResponse {
  eventChanged: {
    type: string
    event: {
      _id: string
      name: string
      gender: string
      type: string
      isClosed: boolean
    }
  }
}

function CategoryCard({
  name,
  type,
  level,
  gender,
  isClosed,
  onClick,
}: {
  name: string
  type: "Doubles" | "Singles"
  level: string
  gender: string
  isClosed?: boolean
  onClick: () => void
  tournamentId?: string
}) {
  const levelColor =
    {
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

  const genderColor =
    gender === "Men's"
      ? "bg-blue-100 text-blue-800"
      : gender === "Women's"
        ? "bg-pink-100 text-pink-800"
        : "bg-purple-100 text-purple-800"

  const getGenderBadgeColor = () => {
    if (gender === "Men's") return "bg-blue-100 text-blue-800"
    if (gender === "Women's") return "bg-pink-100 text-pink-800"
    if (gender === "Mixed") return "bg-purple-100 text-purple-800"
    if (gender === "No Gender") return "bg-gray-100 text-gray-800"
    return "bg-gray-100 text-gray-800"
  }

  const getBorderColor = () => {
    if (isClosed) return "border-red-200"
    if (gender === "Men's") return "border-blue-500 hover:border-blue-600"
    if (gender === "Women's") return "border-pink-500 hover:border-pink-600"
    if (gender === "Mixed") return "border-purple-500 hover:border-purple-600"
    if (gender === "No Gender") return "border-gray-500 hover:border-gray-600"
    return "border-gray-200 hover:border-gray-300"
  }

  const getHoverBackground = () => {
    if (isClosed) return "hover:bg-red-100/10"
    if (gender === "Men's") return "hover:bg-blue-100/50"
    if (gender === "Women's") return "hover:bg-pink-100/50"
    if (gender === "Mixed") return "hover:bg-purple-100/50"
    if (gender === "No Gender") return "hover:bg-gray-100/50"
    return "hover:bg-gray-100/50"
  }

  const genderBadgeColor = getGenderBadgeColor()
  const borderColor = getBorderColor()
  const hoverBackground = getHoverBackground()

  return (
    <motion.button
      onClick={onClick}
      className={`relative flex flex-col items-start p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 w-full min-w-0 overflow-hidden group ${borderColor} ${hoverBackground} ${isClosed
        ? "border-red-200 bg-red-50/50 hover:bg-red-100/20"
        : "bg-white"
        }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "tween",
        duration: 0.2,
        ease: "easeOut"
      }}
    >
      <motion.div
        className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        initial={false}
      >
        <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
          Click to Register
        </span>
      </motion.div>

      <div className="flex flex-wrap items-center gap-2 mb-2 w-full relative">
        {type === "Doubles" ? (
          <Users className="w-4 h-4 text-gray-600 flex-shrink-0" />
        ) : (
          <User className="w-4 h-4 text-gray-600 flex-shrink-0" />
        )}
        <Badge className={`text-xs px-2 py-0.5 ${levelColor} flex-shrink-0`}>
          {level}
        </Badge>
        <Badge className={`text-xs px-2 py-0.5 ${genderBadgeColor} flex-shrink-0`}>
          {gender === "No Gender" ? "No Gender" : gender}
        </Badge>
        {isClosed && (
          <Badge className="absolute top-0 right-0 bg-red-100 text-red-800 text-xs px-2 py-0.5 border border-red-300">
            Closed
          </Badge>
        )}
      </div>
      <span className="font-medium text-gray-800 text-sm md:text-base lg:text-base xl:text-base 2xl:text-base text-left break-words w-full">
        {name}
      </span>
      <div className="text-xs text-gray-500 mt-1">{type}</div>
    </motion.button>
  )
}

function CategoriesContent() {
  const searchParams = useSearchParams()
  const tournamentId = searchParams.get("tournament")
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string
    name: string
    type: "Doubles" | "Singles"
    level?: string
    gender?: string
    isClosed?: boolean
    pricePerPlayer?: number
    earlyBirdPricePerPlayer?: number
    currency?: string
    hasEarlyBird?: boolean
    tournamentId?: string
  } | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isCheckEntryModalOpen, setIsCheckEntryModalOpen] = useState(false)
  const [showReconciliation, setShowReconciliation] = useState(false)
  const [localEvents, setLocalEvents] = useState<any[]>([])
  const doublesSectionRef = useRef<HTMLDivElement>(null)

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
    // console.log("✅ Merged Data:", mergedData)
    setShowReconciliation(false)
  }

  const { data, loading, error } =
    useQuery<PublicTournamentsData>(PUBLIC_TOURNAMENTS)

  useSubscription<EventChangedResponse>(EVENT_CHANGED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const eventChanged = data.data?.eventChanged

      if (eventChanged) {
        const { type, event } = eventChanged

        setLocalEvents((prevEvents) => {
          const updatedEvents = prevEvents.map((e) => {
            if (e.id === event._id) {
              return {
                ...e,
                isClosed: event.isClosed,
              }
            }
            return e
          })
          return updatedEvents
        })
      }
    },
  })

  const activeTournament = tournamentId
    ? data?.publicTournaments?.find((t: any) => t._id === tournamentId)
    : data?.publicTournaments?.find((t: any) => t.isActive)

  const tournamentName = activeTournament?.name || "C-ONE Badminton Tournament"

  useEffect(() => {
    if (activeTournament && activeTournament.events) {
      activeTournament.events.forEach((event: any, index: number) => {
        const hasEarlyBird = activeTournament.settings?.hasEarlyBird
        const actualPrice =
          hasEarlyBird && event.earlyBirdPricePerPlayer
            ? event.earlyBirdPricePerPlayer
            : event.pricePerPlayer
      })
    }
  }, [activeTournament])

  useEffect(() => {
    if (activeTournament?.events) {
      const mappedEvents = activeTournament.events.map((event: any) => {
        const rawGender = event.gender?.toLowerCase()
        let gender = "Mixed"

        if (rawGender === "m" || rawGender === "male") gender = "Men's"
        else if (
          rawGender === "w" ||
          rawGender === "f" ||
          rawGender === "female"
        )
          gender = "Women's"
        else if (rawGender === "x" || rawGender === "mixed") gender = "Mixed"
        else if (rawGender === "no_gender" || rawGender === "no gender") gender = "No Gender"

        const type =
          event.type?.toUpperCase() === "DOUBLES" ? "Doubles" : "Singles"

        return {
          id: event._id,
          name: event.name,
          level: event.level || "Open",
          type,
          gender,
          pricePerPlayer: event.pricePerPlayer,
          earlyBirdPricePerPlayer: event.earlyBirdPricePerPlayer,
          currency: event.currency,
          isClosed: event.isClosed,
          tournamentId: activeTournament._id,
        }
      })
      setLocalEvents(mappedEvents)
    }
  }, [activeTournament])

  function formatDateRange(
    start?: string | number | null,
    end?: string | number | null,
  ): string {
    if (!start || !end) return ""

    const startDate = new Date(start)
    const endDate = new Date(end)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return ""

    if (isSameYear(startDate, endDate)) {
      if (isSameMonth(startDate, endDate)) {
        return `${format(startDate, "MMMM d")} - ${format(endDate, "d, yyyy")}`
      }
      return `${format(startDate, "MMMM d")} - ${format(endDate, "MMMM d, yyyy")}`
    }

    return `${format(startDate, "MMMM d, yyyy")} - ${format(endDate, "MMMM d, yyyy")}`
  }

  const formattedRange = formatDateRange(
    activeTournament?.dates?.tournamentStart?.toString(),
    activeTournament?.dates?.tournamentEnd?.toString(),
  )

  const events = localEvents

  const sortCategoriesByGender = (list: typeof events) => {
    const mens = list.filter((level: any) => level.gender === "Men's")
    const womens = list.filter((level: any) => level.gender === "Women's")
    const noGender = list.filter((level: any) => level.gender === "No Gender")
    const mixed = list.filter((level: any) => level.gender === "Mixed")
    return [...mens, ...womens, ...noGender, ...mixed]
  }

  const doublesCategories = sortCategoriesByGender(
    events.filter((level: any) => level.type === "Doubles"),
  )
  const singlesCategories = sortCategoriesByGender(
    events.filter((level: any) => level.type === "Singles"),
  )

  const handleCategoryClick = (category: any) => {
    setSelectedCategory({
      id: category.id,
      name: category.name,
      type: category.type,
      level: category.level,
      gender: category.gender,
      isClosed: category.isClosed,
      pricePerPlayer: category.pricePerPlayer,
      earlyBirdPricePerPlayer: category.earlyBirdPricePerPlayer,
      currency: category.currency,
      hasEarlyBird: activeTournament?.settings?.hasEarlyBird,
      tournamentId: activeTournament?._id,
    })
    setIsModalOpen(true)
  }

  const renderGenderSection = (
    group: string,
    categories: typeof events,
    title: string,
  ) => {
    const groupCategories = categories.filter(
      (level: any) => level.gender === group,
    )
    if (groupCategories.length === 0) return null

    const colorClass =
      group === "Men's"
        ? "bg-blue-500"
        : group === "Women's"
          ? "bg-pink-500"
          : group === "Mixed"
            ? "bg-purple-500"
            : "bg-gray-500"

    const displayGroupName = group === "No Gender" ? "No Gender" : group

    return (
      <div key={group} className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${colorClass}`} />
          {displayGroupName} {title}
        </h3>

        <div className="mb-3 text-xs text-gray-500 italic flex items-center gap-1 md:hidden">
          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
          Tap any card to register
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {groupCategories.map((category: any, idx: any) => (
            <CategoryCard
              key={category.id || idx}
              name={category.name}
              type={category.type}
              level={category.level}
              gender={category.gender}
              isClosed={category.isClosed}
              onClick={() => handleCategoryClick(category)}
            />
          ))}
        </div>
      </div>
    )
  }

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
      <div className="relative h-screen w-screen">
        <Image
          src="/images/no_tour.jpg"
          alt="No tournament"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center gap-4">
          <Image
            src="/assets/c-one-logo-white.png"
            alt="C-One Logo"
            width={300}
            height={80}
            priority
            className="object-contain"
          />

          <h1 className="text-white font-bold text-2xl sm:text-3xl md:text-4xl">
            There is no Current{" "}
            <span className="text-green-400">Active Badminton Tournament</span>
          </h1>

          <p className="text-white text-lg">
            Please Check our{" "}
            <Link
              href="https://www.facebook.com/c.onebadmintonchallenge/"
              className=" text-blue-300"
            >
              <span className="underline underline-offset-2 inline-block hover:scale-105 transition-transform duration-300">
                FB Page
              </span>
            </Link>{" "}
            to see the updates and more information.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50/30 to-green-100/30 relative">
      <Header />

      <div className="p-4 sm:p-6 pb-0 mt-20 mb-2 md:mb-0 lg:mb-0 xl:mb-0 2xl:mb-0">
        <Button
          variant="ghost"
          asChild
          className="text-green-700 hover:text-green-800 hover:bg-green-200 transition-all duration-300 hover:scale-105"
        >
          <Link href="/sports-center/courts#tournament" className="flex items-center gap-2">
            <ArrowLeftIcon className="w-6 h-6 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="underline text-md">Back to Tournament</span>
          </Link>
        </Button>
      </div>

      <div className="relative bg-white border-b shadow-sm overflow-hidden mt-16">
        <div
          className="
    absolute
    top-5 md:top-7
    right-[-39px] md:right-[-70px] lg:top-9 lg:right-[-65px]
    rotate-45
    bg-linear-to-br from-green-600 to-green-800
    text-white
    text-[10px] md:text-base
    font-medium md:font-semibold
    py-2 sm:py-3 md:py-5
    px-8 sm:px-12 md:px-16
    shadow-md
    whitespace-nowrap
  "
        >
          {formattedRange}
        </div>

        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            Categories
          </h2>
          <div className="h-1 w-36 mx-auto rounded-full bg-linear-to-r from-green-400 to-green-700 mb-6"></div>

          <div className="flex items-center gap-2 mb-4 justify-center">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <Badge className="bg-green-100 text-green-800 px-3 py-1">
              Registration Open
            </Badge>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {tournamentName}
          </h1>

          <div className="max-w-3xl mx-auto text-gray-600 space-y-3 mb-6">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Button
              variant="outline"
              onClick={() => setIsCheckEntryModalOpen(true)}
              className="cursor-pointer text-base bg-teal-600 text-white hover:bg-teal-700 flex items-center justify-center px-5 py-6 gap-2"
            >
              <Search className="!w-5 !h-5" />
              Check Entry
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsUploadModalOpen(true)}
              className="cursor-pointer text-base bg-green-600 text-white hover:bg-green-700 flex items-center justify-center px-5 py-6 gap-2"
            >
              <UploadIcon className="!w-5 !h-5" />
              Upload Payment
            </Button>
          </div>

          <motion.div
            className="mt-2 flex flex-col items-center justify-center gap-2 cursor-pointer group"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            onClick={() =>
              doublesSectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
            }
          >
            <div className="relative">
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-gray-500 group-hover:text-green-600 transition-colors duration-200"
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7-7-7m14-6l-7 7-7-7"
                  />
                </svg>
              </motion.div>

              {/* <motion.div
                                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-green-500 rounded-full group-hover:bg-green-600 transition-colors duration-200"
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            /> */}
            </div>

            <motion.p
              className="text-sm font-medium hover:scale-105 text-gray-600 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-md border border-gray-200 group-hover:bg-green-50 group-hover:text-green-700 group-hover:border-green-300 transition-all duration-200"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              ⬇️ Click here to see the Categories to Register ⬇️
            </motion.p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-5">
          <motion.h2
            className="text-3xl font-extrabold text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Tournament Categories
          </motion.h2>
          <motion.div
            className="mt-2 h-1 w-36 mx-auto rounded-full bg-linear-to-r from-green-400 to-green-700"
            initial={{ width: 0 }}
            animate={{ width: "9rem" }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
          <motion.div
            className="mt-4 text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200 shadow-sm">
              <span className="text-sm font-medium">💡</span>
              <span className="text-sm font-medium">
                {" "}
                Choose your category below and click on any category to view
                details and register.
              </span>
            </div>
          </motion.div>
        </div>

        {activeTournament?.settings?.hasEarlyBird && (
          <div className="container mx-auto px-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="font-medium text-xs">Important Dates</span>
                </div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-0.5">
                  Registration Deadlines
                </h2>
                <p className="text-xs text-gray-600">
                  Mark your calendar and don't miss out!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-md p-4 border-2 border-yellow-400 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[8px] font-bold px-2 py-0.5 rounded-bl-lg">
                    Early Bird
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-yellow-400 p-1.5 rounded-md shadow-sm">
                        <Calendar className="w-4 h-4 text-yellow-900" />
                      </div>
                      <div>
                        <p className="text-[8px] text-yellow-700 uppercase tracking-wider font-semibold">
                          Save More Payment
                        </p>
                        <h3 className="text-sm font-bold text-gray-900">
                          Early Bird Payment End
                        </h3>
                      </div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-3 shadow-inner">
                      <p className="text-[10px] text-gray-500 mb-0.5">
                        Early Bird Payment Closes On
                      </p>
                      <p className="text-2xl font-bold text-yellow-600 mb-0.5">
                        {activeTournament?.dates?.earlyBirdPaymentEnd
                          ? format(
                            new Date(
                              activeTournament.dates.earlyBirdPaymentEnd,
                            ),
                            "dd",
                          )
                          : "—"}
                      </p>
                      <p className="text-xs font-semibold text-yellow-700">
                        {activeTournament?.dates?.earlyBirdPaymentEnd
                          ? format(
                            new Date(
                              activeTournament.dates.earlyBirdPaymentEnd,
                            ),
                            "MMMM yyyy",
                          )
                          : "—"}
                      </p>
                      <div className="mt-2 pt-2 border-t border-yellow-200">
                        <p className="text-[10px] text-gray-600">
                          Register now to enjoy discounted rates!
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-4 border-2 border-green-400 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-green-400 text-green-900 text-[8px] font-bold px-2 py-0.5 rounded-bl-lg">
                    Final Deadline
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-green-400 p-1.5 rounded-md shadow-sm">
                        <Calendar className="w-4 h-4 text-green-900" />
                      </div>
                      <div>
                        <p className="text-[8px] text-green-700 uppercase tracking-wider font-semibold">
                          Last Chance Payment
                        </p>
                        <h3 className="text-sm font-bold text-gray-900">
                          Registration Closes
                        </h3>
                      </div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-3 shadow-inner">
                      <p className="text-[10px] text-gray-500 mb-0.5">
                        Final Date
                      </p>
                      <p className="text-2xl font-bold text-green-600 mb-0.5">
                        {activeTournament?.dates?.registrationEnd
                          ? format(
                            new Date(activeTournament.dates.registrationEnd),
                            "dd",
                          )
                          : "—"}
                      </p>
                      <p className="text-xs font-semibold text-green-700">
                        {activeTournament?.dates?.registrationEnd
                          ? format(
                            new Date(activeTournament.dates.registrationEnd),
                            "MMMM yyyy",
                          )
                          : "—"}
                      </p>
                      <div className="mt-2 pt-2 border-t border-green-200">
                        <p className="text-[10px] text-gray-600">
                          No registrations accepted after this date
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="bg-white rounded-full p-1.5 shadow-sm border border-gray-300">
                    <Ampersand className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        <div ref={doublesSectionRef} className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
              Doubles Categories
            </h2>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {doublesCategories.length} categories
            </Badge>
          </div>

          {["Men's", "Women's", "No Gender", "Mixed"].map((group) =>
            renderGenderSection(group, doublesCategories, "Doubles"),
          )}
        </div>

        <Separator className="my-8" />

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
              Singles Categories
            </h2>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              {singlesCategories.length} categories
            </Badge>
          </div>

          {["Men's", "Women's", "No Gender", "Mixed"].map((group) =>
            renderGenderSection(group, singlesCategories, "Singles"),
          )}
        </div>

        <div className="bg-white rounded-lg p-6 mt-12 text-center shadow-sm">
          <div className="max-w-2xl mx-auto">
            <p className="text-gray-600 mb-4">
              Need help choosing the right category? Contact us through our
              Facebook page.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 mx-auto mb-4 cursor-pointer"
              onClick={() =>
                window.open(
                  "https://www.facebook.com/c.onebadmintonchallenge/",
                  "_blank",
                )
              }
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

      <FloatingTicketing />
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
      />

      <UploadProofMergedModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      <CheckEntryModal
        isOpen={isCheckEntryModalOpen}
        onClose={() => setIsCheckEntryModalOpen(false)}
      />

      {showReconciliation && (
        <DataReconciliationModal
          isOpen={showReconciliation}
          onClose={() => setShowReconciliation(false)}
          oldData={oldData}
          newData={newData}
          onMerge={handleMerge}
        />
      )}
    </div>
  )
}

export default function CategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col justify-center items-center h-screen gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-green-200"></div>
            <div className="w-16 h-16 rounded-full border-4 border-green-600 border-t-transparent animate-spin absolute top-0 left-0"></div>
          </div>
        </div>
      }
    >
      <CategoriesContent />
    </Suspense>
  )
}

// "use client"

// import { useState, useEffect } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import Header from "@/components/custom/header-white"
// import FloatingChatWidget from '@/components/custom/ticket'
// import { VERIFIED_ENTRIES_BY_TOURNAMENT } from "@/graphql/verified-entries/queries"
// import { useQuery } from "@apollo/client/react"
// import { Box, ChevronDown, RefreshCw, Search, Filter, X, ChevronUp, ArrowLeft, ArrowLeftIcon } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Badge } from "@/components/ui/badge"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
// import router from "next/router"
// import Link from "next/link"
// import { useSearchParams } from "next/navigation"

// interface VerifiedEntryEvent {
//     eventId: string
//     eventName: string
//     totalEntries: number
//     entryNumbers: string[]
// }

// interface VerifiedEntriesResponse {
//     verifiedEntriesByTournament: VerifiedEntryEvent[]
// }

// export default function VerifiedEntriesPage() {
//     const [searchQuery, setSearchQuery] = useState("")
//     const [selectedEventFilter, setSelectedEventFilter] = useState<string>("all")
//     const [accordionValue, setAccordionValue] = useState<string[]>([])

//     const searchParams = useSearchParams()
//     const tournamentId = searchParams.get('tournament') || "68f89331ee08f676e59a469a"

//     const { data, loading, error, refetch } = useQuery<VerifiedEntriesResponse>(
//         VERIFIED_ENTRIES_BY_TOURNAMENT,
//         {
//             variables: { tournamentId },
//             fetchPolicy: "network-only"
//         }
//     )

//     // Set all events to be open by default when data loads
//     useEffect(() => {
//         if (data?.verifiedEntriesByTournament) {
//             const allEventIds = data.verifiedEntriesByTournament.map(event => event.eventId)
//             setAccordionValue(allEventIds)
//         }
//     }, [data])

//     const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setSearchQuery(e.target.value.toLowerCase())
//     }

//     const toggleAllEvents = (expand: boolean) => {
//         if (!data?.verifiedEntriesByTournament) return

//         if (expand) {
//             const allEventIds = data.verifiedEntriesByTournament.map(event => event.eventId)
//             setAccordionValue(allEventIds)
//         } else {
//             setAccordionValue([])
//         }
//     }

//     const formatEntryNumber = (entryNumber: string) => {
//         return entryNumber
//     }

//     const getFilteredEvents = () => {
//         if (!data?.verifiedEntriesByTournament) return []

//         let filtered = data.verifiedEntriesByTournament

//         // Apply event name filter
//         if (selectedEventFilter !== "all") {
//             filtered = filtered.filter(event =>
//                 event.eventName.toLowerCase() === selectedEventFilter.toLowerCase()
//             )
//         }

//         // Apply search query filter
//         if (searchQuery.trim()) {
//             filtered = filtered.filter(event => {
//                 if (event.eventName.toLowerCase().includes(searchQuery)) return true

//                 const matchingEntries = event.entryNumbers.filter(entry =>
//                     entry.toLowerCase().includes(searchQuery)
//                 )

//                 return matchingEntries.length > 0
//             })
//         }

//         return filtered
//     }

//     // Get unique event names for filter dropdown
//     const uniqueEventNames = data?.verifiedEntriesByTournament
//         ? Array.from(new Set(data.verifiedEntriesByTournament.map(event => event.eventName))).sort()
//         : []

//     if (loading) {
//         return (
//             <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#eef3ff] to-[#e2e8ff] relative overflow-hidden px-4">
//                 <Header />
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
//                     <p className="text-gray-600">Loading verified entries...</p>
//                 </div>
//             </div>
//         )
//     }

//     if (error) {
//         return (
//             <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#eef3ff] to-[#e2e8ff] relative overflow-hidden px-4">
//                 <Header />
//                 <div className="text-center max-w-md mx-auto">
//                     <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
//                         <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                     </div>
//                     <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
//                     <p className="text-gray-500 mb-4">{error.message}</p>
//                     <Button
//                         onClick={() => refetch()}
//                         className="px-4 py-2"
//                     >
//                         Try Again
//                     </Button>
//                 </div>
//             </div>
//         )
//     }

//     const filteredEvents = getFilteredEvents()

//     return (
//         <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#eef3ff] to-[#e2e8ff] relative overflow-hidden">
//             <Header />

//             <div className="p-4 sm:p-6 pb-0 mt-20 mb-2 md:mb-0 lg:mb-0 xl:mb-0 2xl:mb-0">
//                 <Button variant="ghost" asChild className="text-green-700 hover:text-green-800 hover:bg-green-200">
//                     <Link href="/sports-center/courts" className="flex items-center gap-2">
//                         <ArrowLeftIcon className="w-6 h-6" />
//                         <span className="underline text-md ">Back</span>
//                     </Link>
//                 </Button>
//             </div>
//             <main className="flex-1 container mx-auto px-4 py-8 mt-5">
//                 <div className="mb-8">
//                     <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
//                         <div>
//                             <h1 className="text-3xl font-bold text-gray-900 mb-2">Verified Entries</h1>
//                             <p className="text-gray-600">View all verified tournament entries by event</p>
//                             <div className="mt-2">
//                                 <Badge variant="outline" className="text-blue-600 border-blue-300">
//                                     Tournament ID: {tournamentId}
//                                 </Badge>
//                             </div>
//                         </div>
//                         <div className="flex flex-wrap gap-2">
//                             <Button
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={() => toggleAllEvents(false)}
//                                 className="gap-2"
//                             >
//                                 <ChevronDown className="h-4 w-4" />
//                                 Collapse All
//                             </Button>
//                             <Button
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={() => toggleAllEvents(true)}
//                                 className="gap-2"
//                             >
//                                 <ChevronUp className="h-4 w-4" />
//                                 Expand All
//                             </Button>
//                             <Button
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={() => refetch()}
//                                 className="gap-2"
//                             >
//                                 <RefreshCw className="h-4 w-4" />
//                                 Refresh
//                             </Button>
//                         </div>
//                     </div>
//                 </div>

//                 <Card className="mb-6">
//                     <CardContent className="pt-6">
//                         <div className="space-y-4">
//                             {/* Filters Section */}
//                             <div className="flex flex-col lg:flex-row gap-4">
//                                 {/* Event Filter */}
//                                 <div className="w-full lg:w-auto">
//                                     <label htmlFor="eventFilter" className="block text-sm font-medium text-gray-700 mb-2">
//                                         <Filter className="h-4 w-4 inline mr-1" />
//                                         Filter by Event
//                                     </label>
//                                     <Select value={selectedEventFilter} onValueChange={setSelectedEventFilter}>
//                                         <SelectTrigger className="w-full lg:w-[250px]">
//                                             <SelectValue placeholder="Select an event" />
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                             <SelectItem value="all">All Events</SelectItem>
//                                             {uniqueEventNames.map(eventName => (
//                                                 <SelectItem key={eventName} value={eventName}>
//                                                     {eventName}
//                                                 </SelectItem>
//                                             ))}
//                                         </SelectContent>
//                                     </Select>
//                                 </div>

//                                 {/* Search Input */}
//                                 <div className="flex-1">
//                                     <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
//                                         <Search className="h-4 w-4 inline mr-1" />
//                                         Search Events or Entry Numbers
//                                     </label>
//                                     <div className="relative">
//                                         <Input
//                                             id="search"
//                                             type="text"
//                                             placeholder="Search events or entry numbers..."
//                                             value={searchQuery}
//                                             onChange={handleSearch}
//                                             className="pl-10"
//                                         />
//                                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Active Filters Display */}
//                             {(selectedEventFilter !== "all" || searchQuery) && (
//                                 <div className="flex flex-wrap items-center gap-2 pt-2">
//                                     <span className="text-sm text-gray-600">Active filters:</span>
//                                     {selectedEventFilter !== "all" && (
//                                         <Badge variant="secondary" className="gap-1">
//                                             Event: {selectedEventFilter}
//                                             <Button
//                                                 variant="ghost"
//                                                 size="sm"
//                                                 className="h-4 w-4 p-0 hover:bg-transparent"
//                                                 onClick={() => setSelectedEventFilter("all")}
//                                             >
//                                                 <X className="h-3 w-3" />
//                                             </Button>
//                                         </Badge>
//                                     )}
//                                     {searchQuery && (
//                                         <Badge variant="secondary" className="gap-1">
//                                             Search: "{searchQuery}"
//                                             <Button
//                                                 variant="ghost"
//                                                 size="sm"
//                                                 className="h-4 w-4 p-0 hover:bg-transparent"
//                                                 onClick={() => setSearchQuery("")}
//                                             >
//                                                 <X className="h-3 w-3" />
//                                             </Button>
//                                         </Badge>
//                                     )}
//                                 </div>
//                             )}
//                         </div>
//                     </CardContent>
//                 </Card>

//                 <div className="space-y-4">
//                     {filteredEvents.length === 0 ? (
//                         <Card>
//                             <CardContent className="py-12">
//                                 <div className="text-center">
//                                     <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
//                                         <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                         </svg>
//                                     </div>
//                                     <h3 className="text-lg font-medium text-gray-900 mb-2">
//                                         {searchQuery || selectedEventFilter !== "all" ? "No matching events found" : "No verified entries found"}
//                                     </h3>
//                                     <p className="text-gray-500">
//                                         {searchQuery || selectedEventFilter !== "all"
//                                             ? "Try adjusting your search or filter criteria"
//                                             : "There are no verified entries for this tournament"}
//                                     </p>
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     ) : (
//                         <Accordion
//                             type="multiple"
//                             value={accordionValue}
//                             onValueChange={setAccordionValue}
//                             className="space-y-4"
//                         >
//                             <AnimatePresence>
//                                 {filteredEvents.map((event) => (
//                                     <motion.div
//                                         key={event.eventId}
//                                         initial={{ opacity: 0, y: 20 }}
//                                         animate={{ opacity: 1, y: 0 }}
//                                         exit={{ opacity: 0, y: -20 }}
//                                     >
//                                         <AccordionItem value={event.eventId} className="border rounded-xl bg-white shadow-sm overflow-hidden">
//                                             <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
//                                                 <div className="flex items-center gap-4 text-left">
//                                                     <div className={`p-2 rounded-lg ${event.totalEntries > 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
//                                                         <Box size={20} />
//                                                     </div>
//                                                     <div>
//                                                         <h3 className="font-medium text-gray-900 text-md underline underline-offset-2">{event.eventName}</h3>
//                                                         <div className="flex items-center gap-2 mt-1">
//                                                             <span className="text-xs text-gray-500">
//                                                                 ({event.totalEntries} {event.totalEntries === 1 ? 'entry' : 'entries'})
//                                                             </span>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </AccordionTrigger>
//                                             <AccordionContent>
//                                                 {event.entryNumbers.length > 0 ? (
//                                                     <div className="p-6 border-t">
//                                                         <div className="flex items-center justify-between mb-4">
//                                                             <h4 className="font-medium text-gray-900">Entry Numbers</h4>
//                                                             <span className="text-sm text-gray-500">
//                                                                 {event.entryNumbers.length} total
//                                                             </span>
//                                                         </div>

//                                                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
//                                                             {event.entryNumbers.map((entryNumber, index) => (
//                                                                 <motion.div
//                                                                     key={entryNumber}
//                                                                     initial={{ opacity: 0, scale: 0.9 }}
//                                                                     animate={{ opacity: 1, scale: 1 }}
//                                                                     transition={{ delay: index * 0.03 }}
//                                                                     className="bg-green-100 rounded-lg p-4 border hover:bg-green-200 transition-colors"
//                                                                 >
//                                                                     <div className="flex items-center justify-between">
//                                                                         <div>
//                                                                             <p className="text-base font-medium text-gray-800">Entry Number: </p>
//                                                                         </div>
//                                                                         <div className="flex items-baseline gap-2 underline underline-offset-2">
//                                                                             <span className="text-lg font-bold text-gray-900">
//                                                                                 {formatEntryNumber(entryNumber)}
//                                                                             </span>
//                                                                         </div>
//                                                                     </div>
//                                                                 </motion.div>
//                                                             ))}
//                                                         </div>
//                                                     </div>
//                                                 ) : (
//                                                     <div className="p-6 border-t">
//                                                         <p className="text-gray-500 text-center">No entries found for this event</p>
//                                                     </div>
//                                                 )}
//                                             </AccordionContent>
//                                         </AccordionItem>
//                                     </motion.div>
//                                 ))}
//                             </AnimatePresence>
//                         </Accordion>
//                     )}
//                 </div>

//                 {!loading && !data?.verifiedEntriesByTournament?.length && !searchQuery && selectedEventFilter === "all" && (
//                     <Card>
//                         <CardContent className="py-12">
//                             <div className="text-center">
//                                 <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
//                                     <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
//                                     </svg>
//                                 </div>
//                                 <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
//                                 <p className="text-gray-500 mb-4">There are no verified entries for this tournament</p>
//                             </div>
//                         </CardContent>
//                     </Card>
//                 )}
//             </main>

//             <FloatingChatWidget />
//         </div>
//     )
// }

"use client"

import { Suspense, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Header from "@/components/custom/header-white"
import FloatingChatWidget from '@/components/custom/ticket'
import { VERIFIED_ENTRIES_BY_TOURNAMENT } from "@/graphql/verified-entries/queries"
import { useQuery } from "@apollo/client/react"
import { Box, ChevronDown, RefreshCw, Search, Filter, X, ChevronUp, ArrowLeftIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

interface VerifiedEntryEvent {
    eventId: string
    eventName: string
    totalEntries: number
    entryNumbers: string[]
}

interface VerifiedEntriesResponse {
    verifiedEntriesByTournament: VerifiedEntryEvent[]
}

// Loading spinner component
function LoadingSpinner() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#eef3ff] to-[#e2e8ff] relative overflow-hidden px-4">
            <Header />
            <div className="text-center">
                <div className="relative">
                    {/* Outer ring */}
                    <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
                    {/* Spinning ring with brand color */}
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <p className="text-gray-600 mt-4 animate-pulse">Loading verified entries...</p>
            </div>
        </div>
    )
}

// Main content component that uses useSearchParams
function VerifiedEntriesContent() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedEventFilter, setSelectedEventFilter] = useState<string>("all")
    const [accordionValue, setAccordionValue] = useState<string[]>([])

    const searchParams = useSearchParams()
    const tournamentId = searchParams.get('tournament') || "68f89331ee08f676e59a469a"

    const { data, loading, error, refetch } = useQuery<VerifiedEntriesResponse>(
        VERIFIED_ENTRIES_BY_TOURNAMENT,
        {
            variables: { tournamentId },
            fetchPolicy: "network-only"
        }
    )

    // Set all events to be open by default when data loads
    useEffect(() => {
        if (data?.verifiedEntriesByTournament) {
            const allEventIds = data.verifiedEntriesByTournament.map(event => event.eventId)
            setAccordionValue(allEventIds)
        }
    }, [data])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value.toLowerCase())
    }

    const toggleAllEvents = (expand: boolean) => {
        if (!data?.verifiedEntriesByTournament) return

        if (expand) {
            const allEventIds = data.verifiedEntriesByTournament.map(event => event.eventId)
            setAccordionValue(allEventIds)
        } else {
            setAccordionValue([])
        }
    }

    const formatEntryNumber = (entryNumber: string) => {
        return entryNumber
    }

    const getFilteredEvents = () => {
        if (!data?.verifiedEntriesByTournament) return []

        let filtered = data.verifiedEntriesByTournament

        // Apply event name filter
        if (selectedEventFilter !== "all") {
            filtered = filtered.filter(event =>
                event.eventName.toLowerCase() === selectedEventFilter.toLowerCase()
            )
        }

        // Apply search query filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(event => {
                if (event.eventName.toLowerCase().includes(searchQuery)) return true

                const matchingEntries = event.entryNumbers.filter(entry =>
                    entry.toLowerCase().includes(searchQuery)
                )

                return matchingEntries.length > 0
            })
        }

        return filtered
    }

    const uniqueEventNames = data?.verifiedEntriesByTournament
        ? Array.from(new Set(data.verifiedEntriesByTournament.map(event => event.eventName))).sort()
        : []

    if (loading) {
        return <LoadingSpinner />
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#eef3ff] to-[#e2e8ff] relative overflow-hidden px-4">
                <Header />
                <div className="text-center max-w-md mx-auto">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
                    <p className="text-gray-500 mb-4">{error.message}</p>
                    <Button
                        onClick={() => refetch()}
                        className="px-4 py-2"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        )
    }

    const filteredEvents = getFilteredEvents()

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#eef3ff] to-[#e2e8ff] relative overflow-hidden">
            <Header />

            <div className="p-4 sm:p-6 pb-0 mt-20 mb-2 md:mb-0 lg:mb-0 xl:mb-0 2xl:mb-0">
                <Button variant="ghost" asChild className="text-green-700 hover:text-green-800 hover:bg-green-200">
                    <Link href="/sports-center/courts" className="flex items-center gap-2">
                        <ArrowLeftIcon className="w-6 h-6" />
                        <span className="underline text-md ">Back</span>
                    </Link>
                </Button>
            </div>
            <main className="flex-1 container mx-auto px-4 py-8 mt-5">
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Verified Entries</h1>
                            <p className="text-gray-600">View all verified tournament entries by event</p>
                            {/* <div className="mt-2">
                                <Badge variant="outline" className="text-blue-600 border-blue-300">
                                    Tournament ID: {tournamentId}
                                </Badge>
                            </div> */}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleAllEvents(false)}
                                className="gap-2"
                            >
                                <ChevronDown className="h-4 w-4" />
                                Collapse All
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleAllEvents(true)}
                                className="gap-2"
                            >
                                <ChevronUp className="h-4 w-4" />
                                Expand All
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refetch()}
                                className="gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </div>

                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {/* Filters Section */}
                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Event Filter */}
                                <div className="w-full lg:w-auto">
                                    <label htmlFor="eventFilter" className="block text-sm font-medium text-gray-700 mb-2">
                                        <Filter className="h-4 w-4 inline mr-1" />
                                        Filter by Event
                                    </label>
                                    <Select value={selectedEventFilter} onValueChange={setSelectedEventFilter}>
                                        <SelectTrigger className="w-full lg:w-[250px]">
                                            <SelectValue placeholder="Select an event" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Events</SelectItem>
                                            {uniqueEventNames.map(eventName => (
                                                <SelectItem key={eventName} value={eventName}>
                                                    {eventName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Search Input */}
                                <div className="flex-1">
                                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                                        <Search className="h-4 w-4 inline mr-1" />
                                        Search Events or Entry Numbers
                                    </label>
                                    <div className="relative">
                                        <Input
                                            id="search"
                                            type="text"
                                            placeholder="Search events or entry numbers..."
                                            value={searchQuery}
                                            onChange={handleSearch}
                                            className="pl-10"
                                        />
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Active Filters Display */}
                            {(selectedEventFilter !== "all" || searchQuery) && (
                                <div className="flex flex-wrap items-center gap-2 pt-2">
                                    <span className="text-sm text-gray-600">Active filters:</span>
                                    {selectedEventFilter !== "all" && (
                                        <Badge variant="secondary" className="gap-1">
                                            Event: {selectedEventFilter}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-4 w-4 p-0 hover:bg-transparent"
                                                onClick={() => setSelectedEventFilter("all")}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </Badge>
                                    )}
                                    {searchQuery && (
                                        <Badge variant="secondary" className="gap-1">
                                            Search: "{searchQuery}"
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-4 w-4 p-0 hover:bg-transparent"
                                                onClick={() => setSearchQuery("")}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    {filteredEvents.length === 0 ? (
                        <Card>
                            <CardContent className="py-12">
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        {searchQuery || selectedEventFilter !== "all" ? "No matching events found" : "No verified entries found"}
                                    </h3>
                                    <p className="text-gray-500">
                                        {searchQuery || selectedEventFilter !== "all"
                                            ? "Try adjusting your search or filter criteria"
                                            : "There are no verified entries for this tournament"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Accordion
                            type="multiple"
                            value={accordionValue}
                            onValueChange={setAccordionValue}
                            className="space-y-4"
                        >
                            <AnimatePresence>
                                {filteredEvents.map((event) => (
                                    <motion.div
                                        key={event.eventId}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                    >
                                        <AccordionItem value={event.eventId} className="border rounded-xl bg-white shadow-sm overflow-hidden">
                                            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
                                                <div className="flex items-center gap-4 text-left">
                                                    <div className={`p-2 rounded-lg ${event.totalEntries > 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                                        <Box size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-gray-900 text-md underline underline-offset-2">{event.eventName}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs text-gray-500">
                                                                ({event.totalEntries} {event.totalEntries === 1 ? 'entry' : 'entries'})
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                {event.entryNumbers.length > 0 ? (
                                                    <div className="p-6 border-t">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h4 className="font-medium text-gray-900">Entry Numbers</h4>
                                                            <span className="text-sm text-gray-500">
                                                                {event.entryNumbers.length} total
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                                            {event.entryNumbers.map((entryNumber, index) => (
                                                                <motion.div
                                                                    key={entryNumber}
                                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    transition={{ delay: index * 0.03 }}
                                                                    className="bg-green-100 rounded-lg p-4 border hover:bg-green-200 transition-colors"
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <div>
                                                                            <p className="text-base font-medium text-gray-800">Entry Number: </p>
                                                                        </div>
                                                                        <div className="flex items-baseline gap-2 underline underline-offset-2">
                                                                            <span className="text-lg font-bold text-gray-900">
                                                                                {formatEntryNumber(entryNumber)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-6 border-t">
                                                        <p className="text-gray-500 text-center">No entries found for this event</p>
                                                    </div>
                                                )}
                                            </AccordionContent>
                                        </AccordionItem>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </Accordion>
                    )}
                </div>

                {!loading && !data?.verifiedEntriesByTournament?.length && !searchQuery && selectedEventFilter === "all" && (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                                <p className="text-gray-500 mb-4">There are no verified entries for this tournament</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>

            <FloatingChatWidget />
        </div>
    )
}

export default function VerifiedEntriesPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <VerifiedEntriesContent />
        </Suspense>
    )
}
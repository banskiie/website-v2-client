"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Trophy, ExternalLink, Users, User, Search, UploadIcon } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useQuery } from "@apollo/client/react"
import { CategoryModal, CheckEntryModal, PublicTournamentsData } from "@/components/custom/category-selection"
import { DataReconciliationModal } from "@/components/custom/data-reconciliation"
import { format, isSameMonth, isSameYear } from "date-fns"
import Header from "@/components/custom/header-white"
import { PUBLIC_TOURNAMENTS } from "@/graphql/events/queries"
function CategoryCard({
    name,
    type,
    level,
    gender,
    onClick
}: {
    name: string
    type: "Doubles" | "Singles"
    level: string
    gender: string
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

    const genderColor = gender === "Men's" ? 'bg-blue-100 text-blue-800' :
        gender === "Women's" ? 'bg-pink-100 text-pink-800' :
            'bg-purple-100 text-purple-800'

    return (
        <button
            onClick={onClick}
            className="flex flex-col items-start p-4 rounded-lg border cursor-pointer border-gray-200 bg-white hover:shadow-md hover:border-gray-300 transition w-full sm:w-56"
        >
            <div className="flex items-center gap-2 mb-2">
                {type === "Doubles"
                    ? <Users className="w-4 h-4 text-gray-600" />
                    : <User className="w-4 h-4 text-gray-600" />}
                <Badge className={`text-xs px-2 ${levelColor}`}>{level}</Badge>
                <Badge className={`text-xs px-2 ${genderColor}`}>
                    {gender}
                </Badge>
            </div>
            <span className="font-medium text-gray-800 text-base text-left">{name}</span>
            <div className="text-xs text-gray-500">{type}</div>
        </button>
    )
}

export default function CategoriesPage() {
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

    useEffect(() => {
        if (activeTournament && activeTournament.events) {
            console.log("=== 🎯 CATEGORIES PAGE - EARLY BIRD PRICING OVERVIEW ===");
            console.log("Tournament:", activeTournament.name);
            console.log("Tournament settings.hasEarlyBird:", activeTournament.settings?.hasEarlyBird);
            console.log("Total Categories:", activeTournament.events.length);
            console.log("");

            activeTournament.events.forEach((event: any, index: number) => {
                // Check early bird at tournament level (settings.hasEarlyBird)
                const hasEarlyBird = activeTournament.settings?.hasEarlyBird;
                const actualPrice = hasEarlyBird && event.earlyBirdPricePerPlayer
                    ? event.earlyBirdPricePerPlayer
                    : event.pricePerPlayer;

                console.log(`📊 Category ${index + 1}: ${event.name}`);
                console.log(`   - Type: ${event.type}`);
                console.log(`   - Gender: ${event.gender}`);
                console.log(`   - Tournament Early Bird: ${activeTournament.settings?.hasEarlyBird ? "YES ✅" : "NO ❌"}`);
                console.log(`   - Early Bird Active: ${hasEarlyBird ? "YES ✅" : "NO ❌"}`);
                console.log(`   - Regular Price: ${event.currency}${event.pricePerPlayer}`);
                console.log(`   - Early Bird Price: ${event.currency}${event.earlyBirdPricePerPlayer || "N/A"}`);
                console.log(`   - Price to Charge: ${event.currency}${actualPrice}`);

                if (event.type === "DOUBLES") {
                    console.log(`   - Total per Pair: ${event.currency}${actualPrice * 2}`);
                }
                console.log("");
            });

            // Summary statistics
            const earlyBirdCategories = activeTournament.settings?.hasEarlyBird
                ? activeTournament.events.length
                : 0;

            console.log("=== 📈 SUMMARY ===");
            console.log(`Tournament Early Bird Enabled: ${activeTournament.settings?.hasEarlyBird ? "YES" : "NO"}`);
            console.log(`Categories with Early Bird: ${earlyBirdCategories}/${activeTournament.events.length}`);
            console.log("==================================================");
        }
    }, [activeTournament])

    function formatDateRange(start?: string | number | null, end?: string | number | null): string {
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
        activeTournament?.dates?.tournamentEnd?.toString()
    )
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
            earlyBirdPricePerPlayer: event.earlyBirdPricePerPlayer,
            // hasEarlyBird: event.hasEarlyBird, it is in the event tourtnament foreign key id and teh settings hasearlybird
            currency: event.currency,
            isActive: event.isActive,
        }
    }) || []

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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

    return (
        <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-green-100 relative">
            <Header />
            <div className="relative bg-white border-b shadow-sm overflow-hidden mt-16">
                <div className="absolute top-12 right-[-76px] rotate-45 bg-linear-to-br from-green-600 to-green-800 text-white text-base font-semibold py-5 px-16 shadow-md">
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
                        C-ONE Badminton Challenge
                    </h1>

                    <div className="max-w-3xl mx-auto text-gray-600 space-y-3 mb-6">
                        <p>
                            Welcome to the C-ONE Badminton Challenge! This exciting event is hosted by
                            C-ONE badminton, offering players of all levels an opportunity to showcase
                            their skills and compete in a friendly and supportive environment.
                        </p>
                        <p>
                            The challenge includes various categories, such as singles, doubles, and
                            mixed doubles, with winners awarded prizes at the end of the event.
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
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="text-center mb-12">
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
                    <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                        Choose your category below and click on any category to view details and register.
                    </p>
                </div>

                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <Users className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
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

                    {["Men's", "Women's", "Mixed"].map((group) =>
                        renderGenderSection(group, singlesCategories, "Singles")
                    )}
                </div>

                <div className="bg-white rounded-lg p-6 mt-12 text-center shadow-sm">
                    <div className="max-w-2xl mx-auto">
                        <p className="text-gray-600 mb-4">
                            Need help choosing the right category? Contact us through our Facebook page.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 mx-auto mb-4 cursor-pointer"
                            onClick={() =>
                                window.open(
                                    "https://www.facebook.com/c.onebadmintonchallenge/",
                                    "_blank"
                                )
                            }
                        >
                            <ExternalLink className="w-4 h-4" />
                            Facebook Page
                        </Button>
                        <p className="text-sm text-gray-500">
                            Registration fees vary by category level. Payment details will be provided
                            after category selection.
                        </p>
                    </div>
                </div>
            </div>

            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                category={selectedCategory}
            />

            {/* <UploadProofMergedModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
            /> */}

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
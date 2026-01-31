// app/(public)/guidelines/page.tsx
"use client"

import { motion } from 'framer-motion'
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function GuidelinesPage() {
    const [hasAgreed, setHasAgreed] = useState(false)
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
    const [activeTab, setActiveTab] = useState<'mens-womens' | 'mixed'>('mens-womens')
    const router = useRouter()
    const searchParams = useSearchParams()

    // Get category and tournament info from URL if available
    const categoryId = searchParams.get('category')
    const tournamentId = searchParams.get('tournament')
    const categoryName = searchParams.get('categoryName') || ''

    useEffect(() => {
        // When accessed as standalone page
        document.body.style.overflow = 'unset'

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [])

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const element = e.currentTarget
        const scrollBottom = element.scrollHeight - element.scrollTop - element.clientHeight

        // Check if scrolled to bottom (within 100px)
        if (scrollBottom < 100) {
            setHasScrolledToBottom(true)
        }
    }

    const registrationFees = [
        {
            level: 'Beginners',
            pricePlayer: '675.00',
            pricePair: '1350.00',
            img: 'v8/Beginners.jpg',
            notes: [
                {
                    type: 'dot',
                    content: 'Beginners event is exclusively for Northern Mindanao residents only (Bukidnon, Camiguin, Lanao del Norte, Misamis Occidental, and Misamis Oriental)',
                    subdots: [
                        'Players are required to have resided at the provided address for a minimum of two years.',
                        'Random checks will be conducted on players to verify that they reside within the designated region.'
                    ]
                },
                {
                    type: 'dot',
                    content: 'The Beginners category is strictly for players who have never finished first in the round robin stage of any tournament they previously joined.'
                },
                {
                    type: 'dot',
                    content: 'Based on player database online'
                }
            ]
        },
        {
            level: 'Level G',
            pricePlayer: '1,000.00',
            pricePair: '2,000.00',
            img: 'v8/G.jpg',
            notes: [
                {
                    type: 'dot',
                    content: 'Based on player database online'
                }
            ]
        },
        {
            level: 'Level F',
            pricePlayer: '1,200.00',
            pricePair: '2,400.00',
            img: 'v8/F.jpg',
            notes: [
                {
                    type: 'dot',
                    content: 'Based on player database online'
                }
            ]
        },
        {
            level: 'Level E',
            pricePlayer: '1,400.00',
            pricePair: '2,800.00',
            img: 'v8/E.jpg',
            notes: [
                {
                    type: 'dot',
                    content: 'Based on player database online'
                }
            ]
        },
        {
            level: 'Advanced',
            pricePlayer: '1,600.00',
            pricePair: '3,200.00',
            img: 'v8/Advanced.jpg',
            notes: [
                {
                    type: 'dot',
                    content: 'Filipino citizens only'
                },
                {
                    type: 'dot',
                    content: 'All entries are subject to the leveling committee\'s approval.'
                },
                {
                    type: 'dot',
                    content: 'UAAP players who graduated in 2023 or earlier are eligible to participate. Those who graduated in 2024 or later are not allowed in this category/event.'
                },
                {
                    type: 'dot',
                    content: 'Pair must consist of any of the following levels:'
                },
                {
                    type: 'dot',
                    content: 'Level B and D'
                },
                {
                    type: 'dot',
                    content: 'Level C and C'
                },
                {
                    type: 'dot',
                    content: 'Level C and D'
                },
                {
                    type: 'dot',
                    content: 'Level Definition',
                    subnote: '(Source: 18th Equi-Parco Fiesta Cup 2024)'
                },
                {
                    type: 'dot',
                    content: 'Level B',
                    subdots: [
                        'Players in the Roster of NCAA 2024',
                        'Medalist of the 2024 National PRISAA',
                        'Former National Team Players 40 years and above, members of the Nationals under 17 Junior Team'
                    ]
                },
                {
                    type: 'dot',
                    content: 'Level C',
                    subdots: [
                        'Non-medalist PRISAA Players, Other College, University Varsity Player',
                        'Former National Team Members 45 years old and above'
                    ]
                },
                {
                    type: 'dot',
                    content: 'Class D',
                    subdots: [
                        'Former members of the National Team 46 years old and above'
                    ]
                }
            ],
            acceptablePairs: 'B/D, C/C, C/D'
        },
        {
            level: 'Open (Doubles)',
            pricePlayer: '2900.00',
            pricePair: '5800.00',
            img: 'v8/opendoubles.jpg',
            notes: [
                {
                    type: 'dot',
                    content: 'Open to all interested players (Foreign/International or Local)'
                }
            ]
        },
        {
            level: 'Open (Singles)',
            pricePlayer: '1450.00',
            pricePair: '-',
            img: 'v8/opensingles.jpg',
            notes: [
                {
                    type: 'dot',
                    content: 'Open to all interested players (Foreign/International or Local)'
                }
            ]
        },
        {
            level: 'Legends',
            pricePlayer: '1,600.00',
            pricePair: '3,200.00',
            img: 'v8/Legends.jpg',
            notes: [
                {
                    type: 'dot',
                    content: 'The ages of players are determined by their year of birth.'
                },
                {
                    type: 'dot',
                    content: 'Players must be at least 40 years old.'
                },
                {
                    type: 'dot',
                    content: 'For the Men\'s category, the combined age of the two players must be a minimum of 95 years.'
                },
                {
                    type: 'dot',
                    content: 'For Women\'s category, the combined age of the two players must be a minimum of 85 years.'
                },
                {
                    type: 'dot',
                    content: 'For the Mixed category, the combined age of the two players must be a minimum of 90 years.'
                },
                {
                    type: 'dot',
                    content: 'Former or current members of the Philippine or National Team are not accepted.'
                },
                {
                    type: 'dot',
                    content: 'Filipino Citizens only.'
                }
            ]
        },
        {
            level: 'Juniors (Singles)',
            pricePlayer: '800.00',
            pricePair: '-',
            img: 'v8/juniorsingles.jpg',
            notes: [
                {
                    type: 'dot',
                    content: 'The ages of players are determined by their year of birth.'
                },
                {
                    type: 'dot',
                    content: 'Events',
                    subdots: [
                        'Girls 9 and under',
                        'Boys 9 and under',
                        'Girls 13 and under',
                        'Boys 13 and under',
                        'Girls 16 and under',
                        'Boys 16 and under'
                    ]
                }
            ]
        },
        {
            level: 'Juniors (Doubles)',
            pricePlayer: '675.00',
            pricePair: '1350.00',
            img: 'v8/juniordoubles.jpg',
            notes: [
                {
                    type: 'dot',
                    content: 'The ages of players are determined by their year of birth.'
                },
                {
                    type: 'dot',
                    content: 'Events',
                    subdots: [
                        'Girls 9 and under',
                        'Boys 9 and under',
                        'Girls 13 and under',
                        'Boys 13 and under',
                        'Girls 16 and under',
                        'Boys 16 and under'
                    ]
                }
            ]
        }
    ]

    // Prizes images for Men's & Women's
    const mensWomensPrizes = [
        { id: 'beginners', src: '/assets/img/courts/prizes/v8/prizebreakdown_category_Beginners.jpg', alt: 'Beginners Prize' },
        { id: 'catg', src: '/assets/img/courts/prizes/v8/prizebreakdown_category_CatG.jpg', alt: 'Category G Prize' },
        { id: 'catf', src: '/assets/img/courts/prizes/v8/prizebreakdown_category_CatF.jpg', alt: 'Category F Prize' },
        { id: 'cate', src: '/assets/img/courts/prizes/v8/prizebreakdown_category_CatE.jpg', alt: 'Category E Prize' },
        { id: 'advanced', src: '/assets/img/courts/prizes/v8/prizebreakdown_category_Advanced.jpg', alt: 'Advanced Prize' },
        { id: 'opendoubles', src: '/assets/img/courts/prizes/v8/prizebreakdown_category_OpenDoubles.jpg', alt: 'Open Doubles Prize' },
        { id: 'opensingles', src: '/assets/img/courts/prizes/v8/prizebreakdown_category_OpenSingles.jpg', alt: 'Open Singles Prize' },
        { id: 'legends', src: '/assets/img/courts/prizes/v8/prizebreakdown_category_Legends.jpg', alt: 'Legends Prize' },
        { id: 'juniorsdoubles', src: '/assets/img/courts/prizes/v8/prizebreakdown_category_JuniorsDoubles.jpg', alt: 'Juniors Doubles Prize' },
        { id: 'juniorssingles', src: '/assets/img/courts/prizes/v8/prizebreakdown_category_JuniorsSingles.jpg', alt: 'Juniors Singles Prize' }
    ]

    // Prizes images for Mixed
    const mixedPrizes = [
        { id: 'beginnersmixed', src: '/assets/img/courts/prizes/v8/prizebreakdown_category_BeginnersMixed.jpg', alt: 'Beginners Mixed Prize' },
        { id: 'catgmixed', src: '/assets/img/courts/prizes/v8/prizebreakdown_category_CatGmixed.jpg', alt: 'Category G Mixed Prize' },
        { id: 'catfmixed', src: '/assets/img/courts/prizes/v8/prizebreakdown_category_CatFmixed.jpg', alt: 'Category F Mixed Prize' },
        { id: 'catemixed', src: '/assets/img/courts/prizes/v8/prizebreakdown_category_CatEmixed.jpg', alt: 'Category E Mixed Prize' },
        { id: 'advancedmixed', src: '/assets/img/courts/prizes/v8/prizebreakdown_category_AdvancedMixed.jpg', alt: 'Advanced Mixed Prize' },
        { id: 'openmixed', src: '/assets/img/courts/prizes/v8/prizebreakdown_category_OpenMixed.jpg', alt: 'Open Mixed Prize' },
        { id: 'legendsmixed', src: '/assets/img/courts/prizes/v8/prizebreakdown_category_LegendsMixed.jpg', alt: 'Legends Mixed Prize' },
        { id: 'juniorsmixed', src: '/assets/img/courts/prizes/v8/prizebreakdown_category_JuniorsMixed.jpg', alt: 'Juniors Mixed Prize' }
    ]

    return (
        <div className="min-h-screen bg-white">
            <div className="sticky top-0 z-50 bg-white border-b border-gray-200 p-4 shadow-sm">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-16 h-10">
                            <img
                                src="/assets/img/logo/cone_badminton_logo.png"
                                alt="Badminton Challenge Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-lg lg:text-xl font-bold">
                                C-ONE Badminton Challenge V9 Guidelines
                            </h1>
                            {categoryName && (
                                <p className="text-sm text-green-700 font-medium">
                                    Category: {categoryName}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>

            <div
                className="max-w-6xl mx-auto px-4 py-12"
                onScroll={handleScroll}
            >
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-xl md:text-2xl lg:text-5xl font-black tracking-tight text-gray-800 mb-4 uppercase">
                        <span className='text-[#0D8E3D]'>C-ONE</span> Badminton Challenge V9 Guidelines
                    </h2>
                    <p className="text-sm md:text-base lg:text-lg underline underline-offset-2 text-gray-600 max-w-3xl mx-auto font-medium">
                        Please scroll down and read all sections carefully before proceeding.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-12"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">
                            Registration Fees
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                        {registrationFees.map((fee, index) => (
                            <div key={index} className="border border-gray-300 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="p-6">
                                    <div className="text-center mb-4">
                                        <div className="w-24 h-24 mx-auto mb-3">
                                            <img
                                                src={`/assets/img/logo/${fee.img}`}
                                                alt={fee.level}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">{fee.level}</h3>
                                    </div>

                                    <div className="mb-4 text-center space-y-1">
                                        <p className="font-medium text-lg text-gray-800">
                                            ₱{fee.pricePlayer} per player
                                        </p>

                                        {fee.pricePair !== "-" && (
                                            <p className="font-medium text-lg text-gray-800">
                                                ₱{fee.pricePair} per pair
                                            </p>
                                        )}
                                    </div>

                                    <div className="border-t border-gray-200 pt-4">
                                        <h4 className="font-semibold text-gray-700 mb-2">Qualification:</h4>
                                        <ul className="space-y-2">
                                            {fee.notes.map((note, noteIndex) => (
                                                <li key={noteIndex} className="text-sm text-gray-600">
                                                    {note.type === 'dot' && (
                                                        <div className="mb-2">
                                                            <div className="flex items-start">
                                                                <span className="mr-2">•</span>
                                                                <span className="flex-1 text-sm">
                                                                    {note.content}
                                                                    {note.subnote && (
                                                                        <span className="block text-sm text-gray-500 mt-1">
                                                                            {note.subnote}
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </div>

                                                            {note.subdots && note.subdots.length > 0 && (
                                                                <ul className="ml-4 mt-1 space-y-1">
                                                                    {note.subdots.map((subdot, subIndex) => (
                                                                        <li key={subIndex} className="flex items-start">
                                                                            <span className="mr-2 text-sm">◦</span>
                                                                            <span className="text-sm text-gray-600">{subdot}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {fee.acceptablePairs && (
                                        <div className="mt-4">
                                            <p className="text-sm font-semibold text-green-800">
                                                <span className="font-bold">Acceptable pairs: </span>
                                                {fee.acceptablePairs}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Important Notice */}
                    <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-red-700 font-medium text-center">
                            * Any player not found on the database, and/or who has presented his skill set to be at a certain level during the verification call, but has NOT played according to his claimed playing capability, it is at the sole discretion of the tournament committee to disqualify the player at any point in the competition. No refund will be given.
                        </p>
                    </div>
                </motion.div>

                {/* Prizes Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-12"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">
                            Tournament Prizes
                        </h2>
                        <p className="text-gray-600 max-w-3xl mx-auto">
                            The C-ONE Badminton Challenge Prizes are awarded to the top 3 teams in each category.
                        </p>

                        <div className="inline-flex bg-gray-100 rounded-lg p-1 mb-8 mt-6">
                            <button
                                className={`px-8 py-3 rounded-lg font-medium cursor-pointer transition-all duration-300 ${activeTab === 'mens-womens'
                                    ? 'bg-white shadow text-green-600'
                                    : 'text-gray-600 hover:text-gray-800'}`}
                                onClick={() => setActiveTab('mens-womens')}
                            >
                                Men's & Women's Categories
                            </button>
                            <button
                                className={`px-8 py-3 rounded-lg font-medium cursor-pointer transition-all duration-300 ${activeTab === 'mixed'
                                    ? 'bg-white shadow text-green-600'
                                    : 'text-gray-600 hover:text-gray-800'}`}
                                onClick={() => setActiveTab('mixed')}
                            >
                                Mixed Categories
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {activeTab === 'mens-womens' ? (
                            mensWomensPrizes.map((prize) => (
                                <div key={prize.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                                    <img
                                        src={prize.src}
                                        alt={prize.alt}
                                        className="w-full h-64 object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            ))
                        ) : (
                            mixedPrizes.map((prize) => (
                                <div key={prize.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                                    <img
                                        src={prize.src}
                                        alt={prize.alt}
                                        className="w-full h-64 object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>

                {/* Complete Guidelines Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-12"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">
                            Complete Guidelines
                        </h2>
                        <p className="text-gray-600 max-w-3xl mx-auto mb-8 font-bold underline underline-offset-2">
                            Please read the complete guidelines document below carefully before proceeding.
                        </p>
                    </div>

                    {/* Clean Google Docs iframe */}
                    <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-12" style={{ height: '800px' }}>
                        <iframe
                            src="https://docs.google.com/document/d/11-n0GXR3yOe5PthJddTaBJyhyrPRjaLQw5X0ya_O7R0/preview?rm=minimal&navpanes=0&pagenumber=no&toolbar=0&chrome=false&embedded=true"
                            className="w-full h-full border-0"
                            title="C-ONE Badminton Challenge V9 Guidelines"
                            loading="lazy"
                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                            allow="autoplay"
                        />
                    </div>

                    <div className="text-center text-gray-600 text-sm italic">
                        Please ensure you've scrolled through the entire document above.
                    </div>
                </motion.div>

                {/* Agreement Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

                        <button
                            onClick={() => router.push('/sports-center/courts/categories')}
                            className={`w-full px-8 py-3 text-base font-medium rounded-lg transition-all duration-300 border bg-green-600 text-white hover:bg-green-700 cursor-pointer border-green-600 shadow-md hover:shadow-lg`}
                        >
                            Proceed to Registration
                        </button>
                    </div>
                </motion.div>

                <div className="text-center py-6 border-t border-gray-200">
                    <p className="text-gray-600 font-medium">
                        *Any revisions or updates to these guidelines will be communicated via email to registered players.
                    </p>
                </div>
            </div>
        </div>
    )
}
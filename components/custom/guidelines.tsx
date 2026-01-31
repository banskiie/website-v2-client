import { AnimatePresence, motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';

interface GuidelinesProps {
    isOpen: boolean;
    onClose: () => void;
    onAgree: () => void;
    categoryName?: string;
}

const Guidelines: React.FC<GuidelinesProps> = ({ isOpen, onClose, onAgree, categoryName }) => {
    const [hasAgreed, setHasAgreed] = useState(false);
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const [activeTab, setActiveTab] = useState<'mens-womens' | 'mixed'>('mens-womens');
    const [showGuidelines, setShowGuidelines] = useState(false);

    // Prevent body scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setHasScrolledToBottom(false);
            setShowGuidelines(false);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Function to handle popup acknowledgment
    const handlePopupAcknowledge = () => {
        setShowGuidelines(true);
    };

    if (!isOpen) return null;

    const handleAgree = () => {
        if (hasAgreed && hasScrolledToBottom) {
            onAgree();
            setHasAgreed(false);
            onClose();
        }
    };

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
    ];

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
    ];

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
    ];

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const element = e.currentTarget;
        const scrollBottom = element.scrollHeight - element.scrollTop - element.clientHeight;

        // Check if scrolled to bottom (within 100px)
        if (scrollBottom < 100) {
            setHasScrolledToBottom(true);
        }
    };

    // Initial popup modal
    if (!showGuidelines) {
        return (
            <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        transition={{
                            duration: 0.3,
                            type: "spring",
                            damping: 20,
                            stiffness: 200
                        }}
                        className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.4 }}
                            className="text-center mb-8"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    delay: 0.2,
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 15
                                }}
                                className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
                            >
                                <motion.svg
                                    initial={{ rotate: -180, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    transition={{
                                        delay: 0.3,
                                        duration: 0.5,
                                        type: "spring"
                                    }}
                                    className="w-10 h-10 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </motion.svg>
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.4 }}
                                className="text-2xl font-bold text-gray-800 mb-4"
                            >
                                Important Notice
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.4 }}
                                className="text-gray-600 text-base mb-6"
                            >
                                Please scroll down and read <span className="font-bold text-green-600">all sections carefully</span> before proceeding to registration.
                            </motion.p>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6, duration: 0.4 }}
                                className="text-gray-500 mb-8 text-sm"
                            >
                                This includes registration fees, tournament prizes, and complete guidelines.
                            </motion.p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.4 }}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handlePopupAcknowledge}
                                className="flex-1 px-6 py-3 text-sm cursor-pointer font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-md hover:shadow-lg"
                            >
                                I Understand, Show Guidelines
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-white z-[9999] flex flex-col"
            style={{
                width: '100vw',
                height: '100vh',
                position: 'fixed',
                top: 0,
                left: 0,
            }}
        >
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-between border-b p-4 border-gray-200 bg-white sticky top-0 z-20 shadow-sm"
            >
                <div className="flex items-center gap-3">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring" }}
                        className="w-16 h-10 flex-shrink-0"
                    >
                        <img
                            src="/assets/img/logo/cone_badminton_logo.png"
                            alt="Badminton Challenge Logo"
                            className="w-full h-full object-contain"
                        />
                    </motion.div>
                    <div className="min-w-0">
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                            className="text-lg md:text-lg lg:text-xl font-bold text-center md:text-left mb-0"
                        >
                            C-ONE Badminton Challenge V9 Guidelines
                        </motion.h1>
                    </div>
                </div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="text-sm text-gray-500 font-medium"
                >
                    Please read all sections below
                </motion.div>
            </motion.div>

            <div
                className="flex-1 overflow-y-auto"
                onScroll={handleScroll}
            >
                <div className="max-w-6xl mx-auto px-4 py-8">
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

                    {/* Registration Fees Section */}
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
                        className="mb-30"
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

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {activeTab === 'mens-womens' ? (
                                mensWomensPrizes.map((prize) => (
                                    <div key={prize.id} className="border cursor-pointer hover:scale-105  border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                                        <img
                                            src={prize.src}
                                            alt={prize.alt}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    </div>
                                ))
                            ) : (
                                mixedPrizes.map((prize) => (
                                    <div key={prize.id} className="border cursor-pointer hover:scale-105 transition-all duration-300 border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg ">
                                        <img
                                            src={prize.src}
                                            alt={prize.alt}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mb-12 "
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">
                                Complete Guidelines
                            </h2>
                            <p className="text-gray-600 max-w-3xl mx-auto mb-8 font-bold underline underline-offset-2">
                                Please read the complete guidelines document below carefully before proceeding.
                            </p>
                        </div>

                        <div className="relative w-full  bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-12" style={{ height: '800px' }}>
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


                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

                            <label
                                htmlFor="agree-guidelines"
                                className="flex items-center gap-3 border border-gray-200 rounded-xl p-4 cursor-pointer hover:bg-gray-50 transition w-full lg:w-auto"
                            >
                                <motion.input
                                    whileTap={{ scale: 0.95 }}
                                    type="checkbox"
                                    id="agree-guidelines"
                                    checked={hasAgreed}
                                    onChange={(e) => setHasAgreed(e.target.checked)}
                                    className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
                                />

                                <span className="text-sm font-medium text-gray-900">
                                    I have <span className='text-green-600 underline underline-offset-2 font-bold'>read and accepted the guidelines</span> and will follow the rules
                                </span>
                            </label>

                            <div className="flex items-center gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onClose}
                                    className="px-8 py-3 text-base font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300"
                                >
                                    Cancel
                                </motion.button>

                                <motion.button
                                    whileHover={hasAgreed && hasScrolledToBottom ? { scale: 1.05 } : {}}
                                    whileTap={hasAgreed && hasScrolledToBottom ? { scale: 0.95 } : {}}
                                    onClick={handleAgree}
                                    disabled={!hasAgreed || !hasScrolledToBottom}
                                    className={`px-8 py-3 text-base font-medium rounded-lg transition-all duration-300 border
          ${hasAgreed && hasScrolledToBottom
                                            ? "bg-green-600 text-white hover:bg-green-700 border-green-600 shadow-md hover:shadow-lg"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300"
                                        }
        `}
                                >
                                    Proceed to Registration
                                </motion.button>
                            </div>

                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="text-center py-6 border-t border-gray-200"
                    >
                        <p className="text-gray-600 font-medium">
                            *Any revisions or updates to these guidelines will be communicated via email to registered players.
                        </p>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default Guidelines;
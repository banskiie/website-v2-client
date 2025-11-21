"use client"

import CategorySelection from '@/components/custom/category-selection'
import EventsSection from '@/components/custom/event-section'
import Footer from '@/components/custom/footer'
import Header from '@/components/custom/header'
import ScrollIndicator from '@/components/custom/scroll-indicator'
import LocationSection from '@/components/custom/sports-center-loc'
import SportsFacts from '@/components/custom/sports-facts'
import FloatingChatWidget from '@/components/custom/ticket'
import useSmoothScroll from '@/hooks/useSmoothScroll'
import { AnimatePresence, m, motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

// const images = [

//     "/assets/c-one-logo2.png",
//     "/assets/img/sports-center/shuttlebrew/sb_icon.png",
//     "/assets/img/sports-center/court/LOGO-NEW-SPORTSCENTER_BLACK.png",
//     "/assets/img/sports-center/suite/courtsidelogo_transparent_black.png",
//     "/assets/c-one-logo2.png",
//     "/assets/img/sports-center/court/LOGO-NEW-SPORTSCENTER_BLACK.png",
//     "/assets/img/sports-center/suite/courtsidelogo_transparent_black.png",
// ]

const scrollImages = [
    {
        src: "/assets/img/sports-center/shuttlebrew/sb_icon.png",
        alt: "Shuttle Brew Logo"
    },
    {
        src: "/assets/img/sports-center/court/LOGO-NEW-SPORTSCENTER_BLACK.png",
        alt: "C-One Sports Center Logo"
    },
    {
        src: "/assets/img/sports-center/suite/courtsidelogo_transparent_black.png",
        alt: "Courtside Logo"
    },
    {
        src: "/assets/c-one-logo2.png",
        alt: "C-One Logo"
    }
]

const infiniteImages = [...scrollImages, ...scrollImages, ...scrollImages, ...scrollImages]
// const gradeOptions = ["G", "F", "Advanced", "Open", "Legend", "E"]
function page() {
    useSmoothScroll()
    const [_scrolled, setScrolled] = useState(false)
    const [_isLoading, setIsLoading] = useState(true)
    const [showPanel, setShowPanel] = useState(false)


    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 1000)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > window.innerHeight - 80) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        }
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [])

    const handleClosePanel = () => {
        setShowPanel(false);
    }

    return (
        <div className="min-h-screen flex flex-col ">
            <Header />

            <div className="w-full h-screen relative overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src="/assets/img/sports-center/court/Background-Badminton.png"
                        alt="Badminton Court"
                        fill
                        className="object-cover w-full h-full"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>

                <div className="absolute inset-0 flex flex-col justify-center items-start max-w-3xl px-8 md:px-16 text-white space-y-6 z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        className="text-4xl md:text-6xl font-bold"
                    >
                        Welcome to C-One Sports Center
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="text-lg md:text-xl leading-relaxed"
                    >
                        Serve, Smash, and Win! Come and play with your loved ones at the largest badminton court in Cagayan de Oro City. With stunning surroundings and a large group of players. Table tennis is also offered here. Book now at C-ONE Badminton Courts.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.6 }}
                    >
                        <motion.div
                            className="bg-green-600 cursor-pointer hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition"
                            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
                        >

                            Explore More
                        </motion.div>
                    </motion.div>
                </div>

                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer z-10 rounded-full w-12 h-12 flex items-center justify-center"
                    initial={{ y: 0, backgroundColor: "#22c55e" }}
                    animate={{
                        y: [0, -15, 0],
                        backgroundColor: ["#22c55e", "#16a34a", "#22c55e"],
                    }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
                >
                    <motion.span
                        className="text-white text-2xl"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    >
                        ↓
                    </motion.span>
                </motion.div>
            </div>

            <section className="w-full bg-[#F9F9F9] pt-20 relative overflow-hidden">
                <motion.div
                    className="absolute inset-0 -top-10 left-0 w-full h-82 bg-gradient-to-r from-yellow-300 via-green-300 to-green-500 opacity-30 z-0 rounded-xl"
                    animate={{ x: [-10, 10, -10] }}
                    transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
                ></motion.div>

                <motion.div
                    className="max-w-5xl mx-auto text-center mb-16 px-8 relative z-10"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 1 }}
                >
                    <motion.h2
                        className="text-3xl md:text-4xl font-bold mb-4 text-gray-900"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3 }}
                    >
                        C-One Sports Center
                    </motion.h2>
                    <motion.p
                        className="text-lg md:text-xl text-gray-800"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                    >
                        Discover our premium Badminton Courts and Ping Pong facilities. Perfect
                        for families, friends, and enthusiasts of all levels. Enjoy fun,
                        fitness, and friendly competitions in a safe and modern environment.
                    </motion.p>
                </motion.div>

                {/* ✅ Responsive layout: no gap in sm/md, small gap in lg */}
                <div className="flex flex-col lg:flex-row w-full h-auto lg:h-[80vh] gap-0 lg:gap-1">

                    {/* Badminton Court */}
                    <div className="relative flex-1 min-h-[50vh] lg:min-h-0 min-w-[20%] overflow-hidden cursor-pointer shadow-lg transition-all duration-900 ease-in-out hover:lg:flex-[5]">
                        <motion.div
                            className="absolute inset-0 overflow-hidden transform hover:scale-105"
                            variants={{
                                hidden: { opacity: 0, x: -40 },
                                visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
                            }}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                        >
                            <Image
                                src="/assets/img/sports-center/court/Background-Badminton.png"
                                alt="Badminton Court"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-green-900/40 via-green-800/30 to-transparent"></div>
                        </motion.div>

                        <div className="absolute inset-0 flex flex-col justify-end p-8 text-white space-y-4 z-10">
                            <h3 className="text-md lg:text-2xl md:text-2xl font-semibold">Badminton Courts</h3>
                            <p className="text-sm lg:text-xl md:text-base">
                                Play in the largest badminton courts in Cagayan de Oro. Perfect for competitive games or casual fun with friends and family.
                            </p>
                            <Link
                                href="/sports-center/courts/badminton-courts/"
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-700 text-white font-medium text-sm rounded-md shadow-md hover:bg-green-800 hover:shadow-xl hover:scale-105 transition-all duration-300"
                            >
                                View Courts
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                                </svg>
                            </Link>
                        </div>
                    </div>

                    <div className="relative flex-1 min-h-[50vh] lg:min-h-0 min-w-[20%] overflow-hidden cursor-pointer shadow-lg transition-all duration-900 ease-in-out hover:lg:flex-[5]">
                        <motion.div
                            className="absolute inset-0 overflow-hidden transform hover:scale-105"
                            variants={{
                                hidden: { opacity: 0, x: -40 },
                                visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
                            }}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                        >
                            <Image
                                src="/assets/img/sports-center/court/DSC_0052.png"
                                alt="Ping Pong Court"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-red-800/40 via-red-700/30 to-transparent"></div>
                        </motion.div>

                        <div className="absolute inset-0 flex flex-col justify-end p-8 text-white space-y-4 z-10">
                            <h3 className="text-md lg:text-2xl md:text-2xl font-semibold">Ping Pong Courts</h3>
                            <p className="text-sm lg:text-xl md:text-base">
                                Enjoy exciting table tennis matches in a clean and modern setting. Perfect for all ages and skill levels.
                            </p>
                            <Link
                                href="/sports-center/courts/ping-pong-courts/"
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-800 text-white font-medium text-sm rounded-md shadow-md hover:bg-red-900 hover:shadow-xl hover:scale-105 transition-all duration-300"
                            >
                                View Ping Pong
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <div id='badminton-tournament' className="w-full bg-gradient-to-r from-gray-100 via-white to-gray-100 py-2 relative flex overflow-x-hidden shadow-lg">
                <div className="absolute right-0 top-0 h-full w-40 bg-gradient-to-l from-[#F4F3EE] via-[#F4F3EE]/80 to-transparent z-10 backdrop-blur-md" />
                <motion.div
                    className="flex items-center gap-16 w-max"
                    animate={{ x: ["0%", "-24%"] }}
                    transition={{
                        duration: 20,
                        ease: "linear",
                        repeat: Infinity,
                    }}
                >
                    {infiniteImages.map((img, index) => (
                        <div key={index} className="flex-shrink-0 h-20 w-40 flex items-center justify-center">
                            <Image
                                src={img.src}
                                alt={img.alt}
                                width={80}
                                height={80}
                                className="object-contain"
                            />
                        </div>
                    ))}
                </motion.div>
            </div >

            <div className="w-full bg-linear-to-b from-green-80 to-gray-250 py-70 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('/assets/img/sports-center/court/bg-badminton2.jpg')] bg-center bg-cover bg-no-repeat"></div>

                <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-green-800 drop-shadow-sm">
                        Badminton Tournament {new Date().getFullYear()}
                    </h2>

                    <p className="mt-4 text-lg md:text-xl text-gray-800">
                        Join the <span className="font-semibold text-green-700">C-ONE Sports Center </span>
                        for exciting competitions and a chance to prove your skills on the court.
                    </p>

                    <div className="flex justify-center my-8">
                        <div className="border-t-4 border-yellow-300 w-44"></div>
                    </div>

                    <p className="text-base md:text-lg text-gray-600 mb-6">
                        <span className="font-bold text-green-800">Smash your Way to Victory! </span>
                        Register now and secure your spot in the upcoming tournament.
                    </p>

                    <div className="flex justify-center">
                        <Link href="/sports-center/courts/categories/">
                            <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
                                Register Now
                            </button>
                        </Link>
                    </div>

                </div>
            </div>

            {/* FAQ sa Tournament */}
            <div>

            </div>


            <div>
                <SportsFacts />
            </div>

            <div>
                <EventsSection />
            </div>

            <div>
                <LocationSection />
            </div>

            <div className="flex flex-col">
                <Footer />
            </div>

            <ScrollIndicator />
            <FloatingChatWidget />
        </div >
    )
}

export default page

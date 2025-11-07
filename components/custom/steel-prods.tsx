"use client"

import { Menu, Search, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import Footer from '@/components/custom/footer'
import ScrollLink from '@/components/custom/scroll-link'

const steelProductsMap: Record<string, string> = {
    "Galvanized C-Purlins": "/assets/img/steel/steelprods/GALVANIZED_C-PURLINS.png",
    "Metal Studs": "/assets/img/steel/steelprods/METAL_STUDS.png",
    "Metal Furring": "/assets/img/steel/steelprods/METAL_FURRING.png",
    "Floor Deck": "/assets/img/steel/steelprods/SteelDeck.jpg",
    "Metal Cladding": "/assets/img/steel/steelprods/MetalCladding.jpg",
    "Spandrel": "/assets/img/steel/steelprods/SPANDREL.png",
}

function SteelProducts() {
    const [isOpen, setIsOpen] = useState(false)
    const searchParams = useSearchParams()
    const category = searchParams.get("category") || "Products"
    const [loading, setLoading] = useState(false)
    const [zoomed, setZoomed] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const [activeTab, setActiveTab] = useState("Galvanized C-Purlins")
    const [_highlightStyle, setHighlightStyle] = useState({ left: 0, width: 0 })

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (!containerRef.current) return
        const buttons = Array.from(containerRef.current.querySelectorAll("button"))
        const activeButton = buttons.find(
            (btn) => btn.textContent === activeTab
        ) as HTMLButtonElement

        if (activeButton) {
            setHighlightStyle({
                left: activeButton.offsetLeft,
                width: activeButton.offsetWidth,
            })
        }
    }, [activeTab])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen w-full bg-white">
                <div className="animate-spin rounded-full h-16 w-16 border-6 border-[#2FB44D] border-t-transparent"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col">
            <div
                className={`fixed top-0 left-0 right-0 z-20 transition-all duration-200 bg-white shadow-md`}
            >
                <div className="max-w-screen-xl mx-auto flex justify-between items-center h-16 px-8 relative">
                    <div>
                        <Link href="/">
                            <Image
                                src="/assets/c-one-logo2.png"
                                alt="C-One Steel Logo"
                                width={120}
                                height={40}
                                className="h-auto w-auto cursor-pointer"
                            />
                        </Link>
                    </div>

                    <div className="hidden md:flex space-x-8 items-center">
                        <Link href="/steel" className="text-sm font-medium text-black hover:text-gray-700">Steel</Link>
                        <Link href="/trucks" className="text-sm font-medium text-black hover:text-gray-700">Trucks & Equipment</Link>
                        <Link href="/sports-center" className="text-sm font-medium text-black hover:text-gray-700">Sports Center</Link>
                        <Link href="/rentals" className="text-sm font-medium text-black hover:text-gray-700">Rentals</Link>
                    </div>

                    <button
                        className="md:hidden text-black"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>

                    {isOpen && (
                        <div className="md:hidden border-t flex flex-col px-8 py-4 space-y-4 bg-white text-black">
                            <a href="/steel" className="hover:text-green-600">Steel</a>
                            <a href="/trucks-equipment" className="hover:text-green-600">Trucks & Equipment</a>
                            <a href="/sports-center" className="hover:text-green-600">Sports Center</a>
                            <a href="/rentals" className="hover:text-green-600">Rentals</a>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col min-h-screen">
                <div className="flex flex-col items-start mt-20 ml-20">
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="text-xl font-bold tracking-wider"
                    >
                        C-ONE
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                        className="text-sm text-gray-400 mt-2 tracking-wide"
                    >
                        <ScrollLink
                            href="/steel#steel-products"
                            className="hover:text-green-600 cursor-pointer"
                        >
                            Steel
                        </ScrollLink>{" "}
                        &gt; {category}
                    </motion.div>
                </div>

                <div className="flex gap-10 my-10 ml-20">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                        className="relative w-[1100px] h-[800px] bg-white rounded-xl border shadow-inner flex items-center justify-center overflow-hidden"
                    >
                        <motion.div
                            animate={{
                                scale: zoomed ? 1.2 : 1,
                                rotate: zoomed ? 15.4 : 0,
                            }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="absolute inset-0 flex items-center justify-center z-0"
                        >
                            <Image
                                src={steelProductsMap[activeTab]}
                                alt={activeTab}
                                width={750}
                                height={600}
                                className="object-contain max-h-[1000px] mt-1"
                            />
                        </motion.div>

                        <div className="absolute bottom-15 left-1/2 -translate-x-1/2 w-[800px] h-6 bg-black/30 rounded-full blur-lg" />
                        {zoomed && (
                            <div className="absolute inset-0 z-10" />
                        )}

                        <button
                            onClick={() => setZoomed(!zoomed)}
                            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-green-500 hover:text-white transition cursor-pointer z-10"
                            aria-label="Inspect"
                        >
                            <Search size={24} />
                        </button>

                        {zoomed && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.5 }}
                                className="absolute z-15 flex items-center justify-center"
                            >
                            </motion.div>
                        )}
                    </motion.div>

                    <div className="flex flex-col flex-1 mt-20">
                        <h2 className="text-2xl text-center font-bold">
                            {activeTab.toUpperCase()}
                        </h2>

                        <p className="text-gray-600 text-base mt-2">
                            Products
                        </p>

                        <div className="mt-2 gap-2 mr-10 flex items-center w-full justify-center">
                            {Object.entries(steelProductsMap).map(([name, img]) => (
                                <div
                                    key={name}
                                    onClick={() => setActiveTab(name)}
                                    className={`w-28 h-28 rounded shadow border 
        ${activeTab === name ? "border-green-500" : "border-gray-200"}
        bg-white flex items-center justify-center cursor-pointer 
        hover:scale-105 transition`}
                                    title={name}
                                >
                                    <Image
                                        src={img}
                                        alt={name}
                                        width={120}
                                        height={120}
                                        className="object-contain"
                                    />
                                </div>

                            ))}

                        </div>

                        <div className="flex items-center justify-center w-[95%] text-left mt-5 mx-auto">
                            <p className="text-base text-gray-400">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            </p>
                        </div>


                    </div>
                </div>
            </div>

            <div className="flex flex-col">
                <Footer />
            </div>

        </div >
    )
}

export default SteelProducts
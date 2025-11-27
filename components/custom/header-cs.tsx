"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ChevronDown, MapPin, Phone, Mail, Facebook, Instagram } from "lucide-react"
import { CLOUD } from "./main-faq"

export default function Header() {
    const [isOpen, setIsOpen] = useState(false)
    const [isCompanyOpen, setIsCompanyOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 0)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <div className="relative z-50">
            <div className="w-full bg-[#2FB44D] text-white text-xs sm:text-sm py-2 fixed top-0 z-50">
                <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center gap-4 px-8">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>C-ONE Trading, Zone 1 Kauswagan, Cagayan De Oro, Philippines</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                <span>+63 917 129 5706</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                <span>courtsidesuites@c-one.ph</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:ml-auto">
                        <a href="https://www.facebook.com/courtsidesuites" target="_blank" rel="noopener noreferrer">
                            <Facebook className="w-4 h-4 hover:text-gray-200 transition-colors" />
                        </a>

                        <a href="https://www.airbnb.com/rooms/1440871946921101799?fbclid=IwY2xjawM94U5leHRuA2FlbQIxMABicmlkETFOaENIdThsR2hVMXY1cll3AR7YNHD-kad0zqwo80_FTAITQocoUNuvpI1i7t2PJDGmukxPMD7SMVS6Gt4NRQ_aem_vNxkRKa4xM_3NH9M8oRZ_A&source_impression_id=p3_1758528003_P3iItwHaZ1X1fBrB" target="_blank" rel="noopener noreferrer">
                            <Image
                                src="/assets/img/sports-center/suite/airbnb.png"
                                alt="Airbnb"
                                width={18}
                                height={18}
                                className="hover:opacity-80 transition-opacity"
                            />
                        </a>
                        
                        <a href="https://www.instagram.com/courtsidesuites/" target="_blank" rel="noopener noreferrer">
                            <Instagram className="w-4 h-4 hover:text-gray-200 transition-colors" />
                        </a>
                    </div>
                </div>
            </div>

            <motion.div
                className={`w-full fixed top-[36px] left-0 right-0 z-40 transition-all duration-500 ${scrolled ? "bg-white shadow-md" : "bg-transparent"
                    }`}
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <div className="w-full max-w-screen-xl mx-auto flex justify-between items-center h-16 px-8">
                    <Link href="/">
                        <Image
                            src={scrolled ? `${CLOUD}/v1764038540/c-one-logo2_y4elbf.png` : `${CLOUD}/v1764038543/c-one-logo-white_ic5zyc.png`}
                            alt="C-One Steel Logo"
                            width={120}
                            height={40}
                            className="h-auto w-auto cursor-pointer"
                        />
                    </Link>

                    <div className="hidden md:flex space-x-8 items-center">
                        {[{ href: "/steel", label: "Steel" },
                        { href: "/trucks", label: "Trucks & Equipment" },
                        { href: "/sports-center", label: "Sports Center" },
                        { href: "/rentals", label: "Rentals" }
                        ].map((item, idx) => (
                            <Link
                                key={idx}
                                href={item.href}
                                className={`text-sm font-medium transition ${scrolled ? "text-gray-800 hover:text-green-600" : "text-white hover:text-gray-200"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}

                        <div className="relative group">
                            <button
                                className={`text-sm font-medium flex items-center transition ${scrolled ? "text-gray-800 hover:text-green-600" : "text-white hover:text-gray-200"
                                    }`}
                            >
                                Company <span className="ml-1">▼</span>
                            </button>
                            <div className="absolute hidden group-hover:block bg-white shadow-md mt-2 rounded-md w-40">
                                <a href="/about" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    About
                                </a>
                                <a href="/contact" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    Contact
                                </a>
                            </div>
                        </div>
                    </div>

                    <button className={`md:hidden ${scrolled ? "text-gray-800" : "text-white"}`} onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            className={`md:hidden border-t flex flex-col px-8 py-4 space-y-4 ${scrolled ? "bg-white text-gray-800" : "bg-[#211A1A]/90 text-white"
                                }`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <a href="/steel" className="hover:text-green-600">Steel</a>
                            <a href="/trucks" className="hover:text-green-600">Trucks & Equipment</a>
                            <a href="/sports-center" className="hover:text-green-600">Sports Center</a>
                            <a href="/rentals" className="hover:text-green-600">Rentals</a>
                            <div>
                                <button onClick={() => setIsCompanyOpen(!isCompanyOpen)} className="flex items-center justify-between w-full font-medium">
                                    Company
                                    <motion.span animate={{ rotate: isCompanyOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                        <ChevronDown size={18} />
                                    </motion.span>
                                </button>
                                <AnimatePresence>
                                    {isCompanyOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="ml-4 mt-2 space-y-2 overflow-hidden"
                                        >
                                            <a href="/about" className="block hover:text-green-600">About</a>
                                            <a href="/contact" className="block hover:text-green-600">Contact</a>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div >
    )
}

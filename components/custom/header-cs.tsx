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
            {/* Top Info Bar - Hidden on sm/md, visible on lg */}
            <div className="hidden lg:block w-full bg-[#2FB44D] text-white text-sm py-2 fixed top-0 z-50">
                <div className="max-w-screen-xl mx-auto flex flex-row items-center justify-between gap-6 px-8">
                    {/* Contact Info */}
                    <div className="flex flex-row items-center gap-6 w-full justify-start">
                        {/* Address */}
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span>C-ONE Trading, Zone 1 Kauswagan, Cagayan De Oro, Philippines</span>
                        </div>

                        {/* Phone & Email */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4 flex-shrink-0" />
                                <span className="whitespace-nowrap">+63 917 129 5706</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4 flex-shrink-0" />
                                <span>courtsidesuites@c-one.ph</span>
                            </div>
                        </div>
                    </div>

                    {/* Social Media Links */}
                    <div className="flex items-center gap-4 ml-auto">
                        <a 
                            href="https://www.facebook.com/courtsidesuites" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-gray-200 transition-colors"
                            aria-label="Facebook"
                        >
                            <Facebook className="w-4 h-4" />
                        </a>

                        <a 
                            href="https://www.airbnb.com/rooms/1440871946921101799?fbclid=IwY2xjawM94U5leHRuA2FlbQIxMABicmlkETFOaENIdThsR2hVMXY1cll3AR7YNHD-kad0zqwo80_FTAITQocoUNuvpI1i7t2PJDGmukxPMD7SMVS6Gt4NRQ_aem_vNxkRKa4xM_3NH9M8oRZ_A&source_impression_id=p3_1758528003_P3iItwHaZ1X1fBrB" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:opacity-80 transition-opacity"
                            aria-label="Airbnb"
                        >
                            <Image
                                src="/assets/img/sports-center/suite/airbnb.png"
                                alt="Airbnb"
                                width={16}
                                height={16}
                                className="w-4 h-4"
                            />
                        </a>
                        
                        <a 
                            href="https://www.instagram.com/courtsidesuites/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-gray-200 transition-colors"
                            aria-label="Instagram"
                        >
                            <Instagram className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Navigation - Adjusted top position based on screen size */}
            <motion.div
                className={`w-full fixed z-40 transition-all duration-500 ${
                    scrolled ? "bg-white shadow-md" : "bg-transparent"
                } ${
                    // Adjust top position: if green bar is hidden (sm/md), stick to top, otherwise below green bar
                    "lg:top-[36px] top-0"
                }`}
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <div className="w-full max-w-screen-xl mx-auto flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0">
                        <Image
                            src={scrolled ? `${CLOUD}/v1764038540/c-one-logo2_y4elbf.png` : `${CLOUD}/v1764038543/c-one-logo-white_ic5zyc.png`}
                            alt="C-One Steel Logo"
                            width={120}
                            height={40}
                            className="h-8 w-auto sm:h-10 cursor-pointer transition-all duration-300"
                            priority
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-6 lg:space-x-8 items-center">
                        {[
                            { href: "/steel", label: "Steel" },
                            { href: "/trucks", label: "Trucks & Equipment" },
                            { href: "/sports-center", label: "Sports Center" },
                            { href: "/rentals", label: "Rentals" }
                        ].map((item, idx) => (
                            <Link
                                key={idx}
                                href={item.href}
                                className={`text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                                    scrolled 
                                        ? "text-gray-800 hover:text-green-600" 
                                        : "text-white hover:text-gray-200"
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}

                        {/* Company Dropdown */}
                        <div className="relative group">
                            <button
                                className={`text-sm font-medium flex items-center transition-colors duration-200 whitespace-nowrap ${
                                    scrolled 
                                        ? "text-gray-800 hover:text-green-600" 
                                        : "text-white hover:text-gray-200"
                                }`}
                            >
                                Company 
                                <ChevronDown className="ml-1 w-3 h-3 transform group-hover:rotate-180 transition-transform duration-200" />
                            </button>
                            <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-md w-48 py-2 mt-2 left-1/2 transform -translate-x-1/2 border border-gray-100">
                                <a 
                                    href="/about" 
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors"
                                >
                                    About
                                </a>
                                <a 
                                    href="/contact" 
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors"
                                >
                                    Contact
                                </a>
                            </div>
                        </div>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button 
                        className={`md:hidden p-2 rounded-md transition-colors ${
                            scrolled ? "text-gray-800 hover:bg-gray-100" : "text-white hover:bg-white/10"
                        }`} 
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            className={`md:hidden border-t flex flex-col px-4 sm:px-6 py-4 space-y-3 ${
                                scrolled 
                                    ? "bg-white text-gray-800 border-gray-200" 
                                    : "bg-[#211A1A]/95 text-white border-white/20"
                            }`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {[
                                { href: "/steel", label: "Steel" },
                                { href: "/trucks", label: "Trucks & Equipment" },
                                { href: "/sports-center", label: "Sports Center" },
                                { href: "/rentals", label: "Rentals" }
                            ].map((item, idx) => (
                                <a
                                    key={idx}
                                    href={item.href}
                                    className="py-2 px-2 hover:text-green-600 transition-colors font-medium border-b border-gray-200 last:border-b-0"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.label}
                                </a>
                            ))}
                            
                            {/* Mobile Company Dropdown */}
                            <div className="border-b border-gray-200 last:border-b-0">
                                <button 
                                    onClick={() => setIsCompanyOpen(!isCompanyOpen)} 
                                    className="flex items-center justify-between w-full py-2 px-2 font-medium hover:text-green-600 transition-colors"
                                >
                                    Company
                                    <motion.span 
                                        animate={{ rotate: isCompanyOpen ? 180 : 0 }} 
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ChevronDown size={18} />
                                    </motion.span>
                                </button>
                                <AnimatePresence>
                                    {isCompanyOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="ml-4 mt-1 space-y-2 overflow-hidden border-l-2 border-green-500 pl-3"
                                        >
                                            <a 
                                                href="/about" 
                                                className="block py-2 hover:text-green-600 transition-colors"
                                                onClick={() => {
                                                    setIsOpen(false)
                                                    setIsCompanyOpen(false)
                                                }}
                                            >
                                                About
                                            </a>
                                            <a 
                                                href="/contact" 
                                                className="block py-2 hover:text-green-600 transition-colors"
                                                onClick={() => {
                                                    setIsOpen(false)
                                                    setIsCompanyOpen(false)
                                                }}
                                            >
                                                Contact
                                            </a>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Spacer to prevent content from being hidden under fixed header */}
            <div className="h-16 lg:h-[100px]" />
        </div>
    )
}
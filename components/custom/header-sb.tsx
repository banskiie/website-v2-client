"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ChevronDown } from "lucide-react"
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
        <div>
            <motion.div
                className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm"
                initial={{ y: -100, opacity: 0 }}
                animate={{
                    y: 0,
                    opacity: 1,
                    background: scrolled
                        ? "linear-gradient(to bottom right, #FFBC52, #B45309)"
                        : "rgba(0,0,0,0)",
                    boxShadow: scrolled
                        ? "0px 4px 20px rgba(0,0,0,0.3)"
                        : "0px 0px 0px rgba(0,0,0,0)",
                }}
                transition={{
                    duration: 0.5,
                    ease: "easeInOut",
                }}
            >

                <div className="w-full max-w-screen-xl mx-auto flex justify-between items-center h-16 px-8">
                    <Link href="/">
                        <Image
                            src={`${CLOUD}/v1764038543/c-one-logo-white_ic5zyc.png`}
                            alt="C-One Steel Logo"
                            width={120}
                            height={40}
                            className="h-auto w-auto cursor-pointer"
                        />
                    </Link>

                    <div className="hidden md:flex space-x-8 items-center">
                        {[
                            { href: "/steel", label: "Steel" },
                            { href: "/trucks", label: "Trucks & Equipment" },
                            { href: "/sports-center", label: "Sports Center" },
                            { href: "/rentals", label: "Rentals" },
                        ].map((item, idx) => (
                            <Link
                                key={idx}
                                href={item.href}
                                className={`text-sm font-medium transition bg-gradient-to-r cursor-pointer ${scrolled
                                        ? "text-white bg-clip-text hover:text-[#FFBC52]"
                                        : "text-white bg-clip-text hover:text-[#FFBC52]"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}

                        <div className="relative group">
                            <button
                                className={`text-sm font-medium flex items-center cursor-pointer transition ${scrolled ? "text-white bg-clip-text hover:text-[#FFBC52]" : "text-white hover:text-[#FFBC52]"
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
                            <a href="/steel" className="hover:text-green-600">
                                Steel
                            </a>
                            <a href="/trucks" className="hover:text-green-600">
                                Trucks & Equipment
                            </a>
                            <a href="/sports-center" className="hover:text-green-600">
                                Sports Center
                            </a>
                            <a href="/rentals" className="hover:text-green-600">
                                Rentals
                            </a>
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
                                            <a href="/about" className="block hover:text-green-600">
                                                About
                                            </a>
                                            <a href="/contact" className="block hover:text-green-600">
                                                Contact
                                            </a>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div >
        </div >
    )
}

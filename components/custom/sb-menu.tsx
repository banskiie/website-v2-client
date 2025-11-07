"use client"

import React, { useState } from "react"
import ShuttleBrewMenu from "./sb-drinks-menu"
import ShuttleBrewFoodMenu from "./sb-food-menu"
import { motion } from "framer-motion"

export default function MenuTabs() {
    const [activeTab, setActiveTab] = useState<"drinks" | "food">("drinks")

    return (
        <div className="w-full flex flex-col items-center">
            <div className="relative w-full min-h-screen bg-gradient-to-r from-[#5c2d0c] via-[#7b3f0f] to-[#3a1b07] flex flex-col justify-start items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <motion.div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] rounded-full bg-gradient-to-r from-[#7b3f0f]/20 via-[#5c2d0c]/10 to-[#3a1b07]/10 blur-3xl"
                        animate={{ rotate: 360, scale: [1, 1.02, 1] }}
                        transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
                    />
                    <motion.div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] rounded-full bg-gradient-to-r from-[#7b3f0f]/15 via-[#5c2d0c]/5 to-[#3a1b07]/5 blur-2xl"
                        animate={{ rotate: -360, scale: [1, 1.015, 1] }}
                        transition={{ repeat: Infinity, duration: 80, ease: "linear" }}
                    />
                    <motion.div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] rounded-full bg-gradient-to-r from-[#7b3f0f]/10 via-[#5c2d0c]/5 to-[#3a1b07]/0 blur-xl"
                        animate={{ rotate: 360, scale: [1, 1.01, 1] }}
                        transition={{ repeat: Infinity, duration: 100, ease: "linear" }}
                    />
                </div>

                <motion.h2
                    className="text-4xl md:text-6xl font-bold mt-20 mb-4 text-center bg-gradient-to-r from-[#ffe6b3] via-[#ffd27f] to-[#ffc34d] bg-clip-text text-transparent z-10"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 1 }}
                >
                    Featured Menu
                </motion.h2>

                <div className="w-24 h-1 bg-gradient-to-r from-[#ffe6b3] via-[#ffd27f] to-[#ffc34d] mx-auto rounded-full mb-8"></div>

                <div className="flex gap-4 mb-12 z-20">
                    <button
                        onClick={() => setActiveTab("drinks")}
                        className={`px-6 py-2 rounded-full font-semibold transition-colors duration-200 cursor-pointer
                            ${activeTab === "drinks"
                                ? "bg-gradient-to-r from-[#ffbc52] to-[#b45309] text-white shadow-lg"
                                : "bg-[#3a1b07]/30 text-gray-300 hover:bg-[#5c2d0c]/50"
                            }`}
                    >
                        Drinks
                    </button>
                    <button
                        onClick={() => setActiveTab("food")}
                        className={`px-6 py-2 rounded-full font-semibold transition-colors duration-200 cursor-pointer
                            ${activeTab === "food"
                                ? "bg-gradient-to-r from-[#ffbc52] to-[#b45309] text-white shadow-lg"
                                : "bg-[#3a1b07]/30 text-gray-300 hover:bg-[#5c2d0c]/50"
                            }`}
                    >
                        Food
                    </button>
                </div>

                <div className="w-full">
                    {activeTab === "drinks" && <ShuttleBrewMenu />}
                    {activeTab === "food" && <ShuttleBrewFoodMenu />}
                </div>
            </div>
        </div>
    )
}
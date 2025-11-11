"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { rentals } from "./data/items"

export default function RentalsSection() {
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
    const [showAll, setShowAll] = useState(false)

    const sectionRef = useRef<HTMLDivElement>(null)

    const handleInquire = (vehicle: any) => setSelectedVehicle(vehicle)
    const closeModal = () => setSelectedVehicle(null)

    const displayedRentals = showAll ? rentals : rentals.slice(0, 6)

    const handleToggleShowAll = () => {
        if (showAll) {
            sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
        setShowAll(!showAll)
    }

    const handleScrollToVisitUs = () => {
        const visitSection = document.getElementById("visit-us")
        visitSection?.scrollIntoView({ behavior: "smooth", block: "start" })
    }

    return (
        <div className="bg-white py-20 px-6 md:px-16 shadow-black shadow-2xl" ref={sectionRef}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                viewport={{ once: true }}
                className="max-w-7xl mx-auto text-center space-y-4"
            >
                <div className="inline-flex items-center justify-center bg-yellow-100 text-yellow-700 font-medium px-5 py-2 rounded-full">
                    Our Rents
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
                    Choose the Perfect Vehicle for Your Needs
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    From compact delivery vans to heavy-duty cargo trucks, C-ONE offers a comprehensive fleet maintained to the highest standards to ensure reliability and safety.
                </p>
            </motion.div>

            <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                <AnimatePresence>
                    {displayedRentals.map((item, i) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.4, delay: i * 0.05 }}
                            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-4 border border-gray-200"
                        >
                            <div className="relative rounded-xl overflow-hidden">
                                <img
                                    src={item.img}
                                    alt={item.title}
                                    className="w-60 h-60 mx-auto object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute top-3 left-3 bg-yellow-400 text-black text-xs font-medium px-3 py-1 rounded-full">
                                    {item.label}
                                </div>
                                <div className="absolute bottom-3 left-3 bg-black/60 text-white text-sm px-3 py-1 rounded-full flex items-center gap-2">
                                    <span>{item.emoji}</span> {item.capacity}
                                </div>
                            </div>

                            <div className="mt-2 text-center">
                                <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
                                {item.extra && (
                                    <p className="text-sm text-gray-600 font-medium">{item.extra}</p>
                                )}
                            </div>

                            <div className="p-5 space-y-3 text-left">
                                <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                                <p className="text-gray-600 text-sm">{item.desc}</p>

                                {item.units && (
                                    <div className="text-sm text-gray-700 mt-2 grid grid-cols-3 gap-2 text-center">
                                        {item.units.map((u, idx) => (
                                            <div key={idx} className="border border-gray-200 rounded px-2 py-1">
                                                <p>
                                                    {u.quantity} {u.quantity > 1 ? "units" : "unit"} | {u.capacity}
                                                    {'stages' in u && u.stages && ` (${u.stages})`}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    {item.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-yellow-700 bg-yellow-100 text-xs font-medium px-3 py-1 rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handleInquire(item)}
                                    className="text-yellow-600 hover:text-yellow-700 font-medium text-sm"
                                >
                                    Inquire About This Vehicle →
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {rentals.length > 6 && (
                <div className="text-center mt-8">
                    <button
                        onClick={handleToggleShowAll}
                        className="text-yellow-600 hover:text-yellow-700 font-semibold"
                    >
                        {showAll ? "See Less" : "See More"}
                    </button>
                </div>
            )}

            {selectedVehicle && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 relative"
                    >
                        <button
                            onClick={closeModal}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>

                        <div className="text-center">
                            <img
                                src={selectedVehicle.img}
                                alt={selectedVehicle.title}
                                className="w-40 h-40 mx-auto object-cover rounded-xl"
                            />
                            <h3 className="text-lg font-semibold mt-4 text-gray-800">
                                {selectedVehicle.title}
                            </h3>

                            {selectedVehicle.capacity && selectedVehicle.extra && (
                                <p className="text-sm font-medium text-gray-600 mt-1">
                                    MAX LOAD: {selectedVehicle.capacity.toUpperCase()} / {selectedVehicle.extra}
                                </p>
                            )}

                            <p className="text-gray-600 text-sm mt-2">{selectedVehicle.desc}</p>

                            {selectedVehicle.units && (
                                <div className="mt-4 border-t border-gray-200 pt-3 text-sm text-gray-700 text-center">
                                    <h4 className="font-semibold text-gray-800 mb-2 text-center">Available Units</h4>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        {selectedVehicle.units.map((u: any, i: number) => (
                                            <div key={i} className="border border-gray-200 rounded px-2 py-1">
                                                {u.quantity} {u.quantity > 1 ? "units" : "unit"} | {u.capacity}
                                                {u.stages && <span> ({u.stages})</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-center gap-2 mt-3 flex-wrap">
                                {selectedVehicle.tags.map((tag: string) => (
                                    <span
                                        key={tag}
                                        className="text-yellow-700 bg-yellow-100 text-xs font-medium px-3 py-1 rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <button
                                onClick={() => {
                                    closeModal()
                                    handleScrollToVisitUs()
                                }}
                                className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-full font-medium"
                            >
                                Send Inquiry
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}

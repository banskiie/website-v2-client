"use client"

import { Menu, Search, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import Footer from '@/components/custom/footer'

const colors = [
    "#F2F3F5",
    "#F5F5DC",
    "#F37A48",
    "#800000",
    "#93E9BE",
    "#0000FF",
    "#E3735E",
    "#008000",
    "#FFA500",
    "#8F00FF",
    "#FFC0CB",
    "#FFFF00",
    "#808080",
    "#BAA48A",
    "/assets/img/steel/color/Oakwood.png",
    "#322320",
]

const colorNames: Record<string, string> = {
    "#F2F3F5": "Gray White",
    "#F5F5DC": "Beige",
    "#F37A48": "Mandarin Red",
    "#800000": "Maroon Red",
    "#93E9BE": "Foam Green",
    "#0000FF": "Blue",
    "#E3735E": "Terra Cota",
    "#008000": "Green",
    "#FFA500": "Orange",
    "#8F00FF": "Violet",
    "#FFC0CB": "Pink",
    "#FFFF00": "Yellow",
    "#808080": "Gray",
    "#BAA48A": "Silver",
    "/assets/img/steel/color/Oakwood.png": "OakWood",
    "#322320": "Brown"
}

const tabImages: Record<string, string> = {
    "Rib Type Roof": "/assets/img/steel/roofing/colors/2.png",
    "Tile Roof": "/assets/img/steel/roofing/colors/TileRoof/1.png",
    "Box Gutter": "/assets/img/steel/roofing/colors/BoxGutter/1.png",
}
const zoomImages: Record<string, string> = {
    "Rib Type Roof": "/assets/img/steel/roofing/size/RibType.png",
    "Tile Roof": "/assets/img/steel/roofing/size/TileRoof.png",
    "Box Gutter": "/assets/img/steel/roofing/size/CorrugatedType.png",
}

const colorToImageMap: Record<string, string> = {
    "#F2F3F5": "/assets/img/steel/roofing/colors/2.png",
    "#F5F5DC": "/assets/img/steel/roofing/colors/1.png",
    "#F37A48": "/assets/img/steel/roofing/colors/3.png",
    "#800000": "/assets/img/steel/roofing/colors/4.png",
    "#93E9BE": "/assets/img/steel/roofing/colors/5.png",
    "#0000FF": "/assets/img/steel/roofing/colors/6.png",
    "#E3735E": "/assets/img/steel/roofing/colors/7.png",
    "#008000": "/assets/img/steel/roofing/colors/8.png",
    "#FFA500": "/assets/img/steel/roofing/colors/9.png",
    "#8F00FF": "/assets/img/steel/roofing/colors/10.png",
    "#FFC0CB": "/assets/img/steel/roofing/colors/11.png",
    "#FFFF00": "/assets/img/steel/roofing/colors/12.png",
    "#808080": "/assets/img/steel/roofing/colors/13.png",
    "#BAA48A": "/assets/img/steel/roofing/colors/14.png",
    "/assets/img/steel/color/Oakwood.png": "/assets/img/steel/roofing/colors/15.png",
    "#322320": "/assets/img/steel/roofing/colors/16.png"
}

const colorImageMapRoofingTile: Record<string, string> = {
    "#F2F3F5": "/assets/img/steel/roofing/colors/TileRoof/1.png",
    "#F5F5DC": "/assets/img/steel/roofing/colors/TileRoof/2.png",
    "#F37A48": "/assets/img/steel/roofing/colors/TileRoof/3.png",
    "#800000": "/assets/img/steel/roofing/colors/TileRoof/4.png",
    "#93E9BE": "/assets/img/steel/roofing/colors/TileRoof/5.png",
    "#0000FF": "/assets/img/steel/roofing/colors/TileRoof/6.png",
    "#E3735E": "/assets/img/steel/roofing/colors/TileRoof/7.png",
    "#008000": "/assets/img/steel/roofing/colors/TileRoof/8.png",
    "#FFA500": "/assets/img/steel/roofing/colors/TileRoof/9.png",
    "#8F00FF": "/assets/img/steel/roofing/colors/TileRoof/10.png",
    "#FFC0CB": "/assets/img/steel/roofing/colors/TileRoof/11.png",
    "#FFFF00": "/assets/img/steel/roofing/colors/TileRoof/12.png",
    "#808080": "/assets/img/steel/roofing/colors/TileRoof/13.png",
    "#BAA48A": "/assets/img/steel/roofing/colors/TileRoof/14.png",
    "/assets/img/steel/color/Oakwood.png": "/assets/img/steel/roofing/colors/15.png",
    "#322320": "/assets/img/steel/roofing/colors/TileRoof/16.png"
}

const colorImageMapBoxGutter: Record<string, string> = {
    "#F2F3F5": "/assets/img/steel/roofing/colors/BoxGutter/1.png",
    "#F5F5DC": "/assets/img/steel/roofing/colors/BoxGutter/2.png",
    "#F37A48": "/assets/img/steel/roofing/colors/BoxGutter/3.png",
    "#800000": "/assets/img/steel/roofing/colors/BoxGutter/4.png",
    "#93E9BE": "/assets/img/steel/roofing/colors/BoxGutter/5.png",
    "#0000FF": "/assets/img/steel/roofing/colors/BoxGutter/6.png",
    "#E3735E": "/assets/img/steel/roofing/colors/BoxGutter/7.png",
    "#008000": "/assets/img/steel/roofing/colors/BoxGutter/8.png",
    "#FFA500": "/assets/img/steel/roofing/colors/BoxGutter/9.png",
    "#8F00FF": "/assets/img/steel/roofing/colors/BoxGutter/10.png",
    "#FFC0CB": "/assets/img/steel/roofing/colors/BoxGutter/11.png",
    "#FFFF00": "/assets/img/steel/roofing/colors/BoxGutter/12.png",
    "#808080": "/assets/img/steel/roofing/colors/BoxGutter/13.png",
    "#BAA48A": "/assets/img/steel/roofing/colors/BoxGutter/14.png",
    "/assets/img/steel/color/Oakwood.png": "/assets/img/steel/roofing/colors/15.png",
    "#322320": "/assets/img/steel/roofing/colors/BoxGutter/16.png"
}

const thicknessOptions: Record<string, string[]> = {
    "Rib Type Roof": ["0.35 mm", "0.40 mm", "0.50 mm"],
    "Tile Roof": ["0.40 mm", "0.50 mm", "0.60 mm"],
    "Box Gutter": ["0.35 mm", "0.40 mm", "0.50 mm"],
}

function MetalRoofingContent() {
    const [isOpen, setIsOpen] = useState(false)
    const searchParams = useSearchParams()
    const category = searchParams.get("category") || "Products"
    const [activeTab, setActiveTab] = useState("Rib Type Roof")
    const tabs = ["Rib Type Roof", "Tile Roof", "Box Gutter"]
    const [highlightStyle, setHighlightStyle] = useState({ left: 0, width: 0 })
    const containerRef = useRef<HTMLDivElement>(null)
    const [zoomed, setZoomed] = useState(false)
    const [selectedColor, setSelectedColor] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

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
                        <Link
                            href={`/steel#${category.toLowerCase().replace(/\s+/g, "-")}`}
                            className="hover:text-green-600 cursor-pointer"
                        >
                            Steel
                        </Link>{" "}
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
                                src={selectedColor ? activeTab === "Tile Roof" ? colorImageMapRoofingTile[selectedColor] || tabImages[activeTab] :
                                    activeTab === "Box Gutter" ? colorImageMapBoxGutter[selectedColor] || tabImages[activeTab] : colorToImageMap[selectedColor] || tabImages[activeTab]
                                    : tabImages[activeTab]
                                }
                                alt={activeTab}
                                width={1000}
                                height={600}
                                className="object-contain max-h-[1000px] mt-25"
                            />

                        </motion.div>
                        <div className="absolute bottom-22 left-1/2 -translate-x-1/2 w-[810px] h-6 bg-black/30 rounded-full blur-lg" />
                        {zoomed && (
                            <div className="absolute inset-0 bg-[#B1B1B1]/70 z-10" />
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
                                <Image
                                    src={zoomImages[activeTab]}
                                    alt={activeTab + " Zoom"}
                                    width={1000}
                                    height={600}
                                    className="object-contain"
                                />
                            </motion.div>
                        )}
                    </motion.div>

                    <div className="flex flex-col flex-1">
                        <h2 className="text-2xl text-center font-bold mb-6">
                            {activeTab.toUpperCase()} ({selectedColor ? colorNames[selectedColor] : "Gray"})
                        </h2>

                        <div
                            ref={containerRef}
                            className="relative flex bg-[#E6E6E6] rounded-lg overflow-hidden w-[558px] mx-auto"
                        >
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setActiveTab(tab)
                                        setSelectedColor(null)
                                    }}
                                    className={`relative z-10 flex-1 py-3 text-sm font-medium transition ${activeTab === tab ? "text-black" : "text-gray-600"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}

                            <motion.div
                                animate={highlightStyle}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="absolute top-0 bottom-0 bg-white rounded-md shadow-md"
                            />
                        </div>


                        <div className="mt-10 grid grid-cols-2 gap-8 px-6">
                            <div className="flex flex-col">
                                <h3 className="text-lg text-center font-semibold mb-4">Thickness</h3>
                                <div className="w-[85%] h-40 bg-white rounded-lg border shadow-inner flex flex-col items-center justify-center mx-auto px-4 py-6 overflow-y-auto">
                                    <ul className="text-sm text-gray-700 space-y-3 flex flex-col items-center">
                                        {thicknessOptions[activeTab].map((item, i) => (
                                            <li
                                                key={i}
                                                className="relative pl-5 before:content-['•'] before:absolute before:left-0 
                 before:top-1/2 before:-translate-y-1/2 before:text-green-500 before:text-lg"
                                            >
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <h3 className="text-lg text-center font-semibold mb-4">Properties</h3>
                                <div className="w-[85%] h-60 bg-white rounded-lg border shadow-inner flex flex-col items-start justify-start mx-auto px-4 py-6 overflow-y-auto">
                                    <p className="text-sm text-[#A3A3A3] mb-2">
                                        (Length may vary upon request)
                                    </p>
                                    <ul className="text-sm text-gray-700 space-y-3 flex flex-col items-start">
                                        {["Paint: Nippon Paint | AKZO Nobel Paint", "Front: Primer – 5 Microns", "Front: Coat Color – 13 Microns", "Back: 5–7 Microns"].map((item, i) => (
                                            <li key={i} className="relative pl-5 before:content-['•'] before:absolute before:left-0
                                        before:top-1/2 before:-translate-y-1/2 before:text-green-500 before:text-lg">
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>


                        <div className="mt-8 px-6 w-[85%] mx-auto text-left">
                            <p className="text-sm text-[#505050] leading-relaxed text-justify">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                                quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                                consequat.
                            </p>
                        </div>

                        <div className="mt-12 px-6 w-full">
                            <p className="text-lg font-semibold text-center text-[#505050] leading-relaxed">
                                Color Swatch
                            </p>

                            <div className="flex flex-col items-center mt-6 gap-6">
                                {[0, 1].map((row) => (
                                    <div key={row} className="flex flex-row gap-4 justify-center">
                                        {colors.slice(row * 8, row * 8 + 8).map((color, col) => (
                                            <div
                                                key={col}
                                                className="flex flex-col items-center gap-1"
                                                style={{ width: "72px" }}
                                            >
                                                <div
                                                    onClick={() => setSelectedColor(color)}
                                                    className="w-12 h-12 border border-black rounded-xl transition-transform duration-200 cursor-pointer hover:scale-110"
                                                    style={
                                                        color.startsWith("#")
                                                            ? { backgroundColor: color }
                                                            : {
                                                                backgroundImage: `url(${color})`,
                                                                backgroundSize: "cover",
                                                                backgroundPosition: "center",
                                                            }
                                                    }
                                                />
                                                <span className="text-xs text-center break-words">{colorNames[color]}</span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                        </div>

                    </div>
                </div>
            </div>

            <div className="flex flex-col">
                <Footer />
            </div>
        </div>
    )
}

export default MetalRoofingContent

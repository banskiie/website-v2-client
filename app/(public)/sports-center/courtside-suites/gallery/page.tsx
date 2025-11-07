"use client"

import Footer from '@/components/custom/footer'
import Header from '@/components/custom/header'
import { ChevronRight, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ScrollIndicator from '@/components/custom/scroll-indicator'
import FloatingChatWidget from '@/components/custom/ticket'

const images = [
    { src: "/assets/img/sports-center/suite/gallery/_ALP5448.jpg", alt: "Courtside Suite 1", caption: "Spacious Courtside Suite" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP5449.jpg", alt: "Courtside Suite 2", caption: "Modern Lounge Area" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP5452.jpg", alt: "Courtside Suite 3", caption: "Suite with Court View" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9378.jpg", alt: "Courtside Suite 4", caption: "Elegant Interior Design" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9436.jpg", alt: "Courtside Suite 5", caption: "Luxury Seating" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP5458.jpg", alt: "Courtside Suite 6", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP5384.jpg", alt: "Courtside Suite 7", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP5387.jpg", alt: "Courtside Suite 8", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP5393.jpg", alt: "Courtside Suite 9", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP5398.jpg", alt: "Courtside Suite 10", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP5411.jpg", alt: "Courtside Suite 11", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP5438.jpg", alt: "Courtside Suite 12", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP5441.jpg", alt: "Courtside Suite 13", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP5448.jpg", alt: "Courtside Suite 14", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP5449.jpg", alt: "Courtside Suite 15", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP5452.jpg", alt: "Courtside Suite 16", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP5453.jpg", alt: "Courtside Suite 17", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP5458.jpg", alt: "Courtside Suite 18", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP5460.jpg", alt: "Courtside Suite 19", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP5463.jpg", alt: "Courtside Suite 20", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP7809.jpg", alt: "Courtside Suite 21", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP7811.jpg", alt: "Courtside Suite 22", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP7819.jpg", alt: "Courtside Suite 23", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9371.jpg", alt: "Courtside Suite 24", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9373.jpg", alt: "Courtside Suite 25", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9375.jpg", alt: "Courtside Suite 26", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9377.jpg", alt: "Courtside Suite 27", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9378.jpg", alt: "Courtside Suite 28", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9379.jpg", alt: "Courtside Suite 29", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9380.jpg", alt: "Courtside Suite 30", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9381.jpg", alt: "Courtside Suite 31", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9382.jpg", alt: "Courtside Suite 32", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9387.jpg", alt: "Courtside Suite 33", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9398.jpg", alt: "Courtside Suite 34", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9399.jpg", alt: "Courtside Suite 35", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9400.jpg", alt: "Courtside Suite 36", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9403.jpg", alt: "Courtside Suite 37", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9406.jpg", alt: "Courtside Suite 38", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9411.jpg", alt: "Courtside Suite 39", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9413.jpg", alt: "Courtside Suite 40", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9422.jpg", alt: "Courtside Suite 41", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9425.jpg", alt: "Courtside Suite 42", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9426.jpg", alt: "Courtside Suite 43", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9430.jpg", alt: "Courtside Suite 44", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9432.jpg", alt: "Courtside Suite 45", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9433.jpg", alt: "Courtside Suite 46", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9435.jpg", alt: "Courtside Suite 47", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9436.jpg", alt: "Courtside Suite 48", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9442.jpg", alt: "Courtside Suite 49", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9451.jpg", alt: "Courtside Suite 50", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9452.jpg", alt: "Courtside Suite 51", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9455.jpg", alt: "Courtside Suite 52", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9605-Enhanced-NR.jpg", alt: "Courtside Suite 53", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9608-Enhanced-NR.jpg", alt: "Courtside Suite 54", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9611-Enhanced-NR.jpg", alt: "Courtside Suite 55", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9612-Enhanced-NR.jpg", alt: "Courtside Suite 56", caption: "Cozy Atmosphere" },
    { src: "/assets/img/sports-center/suite/gallery/_ALP9615-Enhanced-NR.jpg", alt: "Courtside Suite 57", caption: "Cozy Atmosphere" },
]

function GalleryImage({
    src,
    alt,
    caption,
    span,
    onClick,
}: {
    src: string
    alt: string
    caption: string
    span: string
    onClick: () => void
}) {
    const [loaded, setLoaded] = useState(false)

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className={`relative overflow-hidden rounded-lg shadow-md ${span} cursor-pointer`}
            onClick={onClick}
        >
            {!loaded && <div className="absolute inset-0 bg-gray-300 animate-pulse" />}

            <Image
                src={src}
                alt={alt}
                fill
                className={`object-cover transition-transform duration-300 hover:scale-105 ${loaded ? "opacity-100" : "opacity-0"}`}
                onLoadingComplete={() => setLoaded(true)}
            />

            <div className="absolute bottom-0 left-0 w-full bg-black/50 text-white text-sm px-3 py-2">
                {caption}
            </div>
        </motion.div>
    )
}

function Page() {
    const INITIAL_COUNT = 12
    const [spans, setSpans] = useState<string[]>([])
    const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null)
    const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT)

    useEffect(() => {
        const generated = images.map(() => {
            const colSpan = Math.random() > 0.85 ? "col-span-2" : "col-span-1"
            const rowRand = Math.random()
            const rowSpan = rowRand > 0.95 ? "row-span-3" : rowRand > 0.7 ? "row-span-2" : "row-span-1"
            return `${colSpan} ${rowSpan}`
        })
        setSpans(generated)
    }, [])

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <section className="w-full min-h-screen bg-[#f5f2ec] p-12">
                <nav className="flex items-center text-gray-600 text-sm mb-6 mt-7">
                    <Link
                        href="/sports-center/"
                        className="hover:text-[#2FB44D] font-medium transition-colors"
                    >
                        Sports Center
                    </Link>
                    <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
                    <Link
                        href="/sports-center/courtside-suites/#facilities"
                        className="hover:text-[#2FB44D] font-medium transition-colors"
                    >
                        Courtside-Suite
                    </Link>
                    <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
                    <span className="font-medium text-gray-600">Gallery</span>
                </nav>

                <h1 className="text-3xl font-bold mb-6">Gallery</h1>
                <p className="text-lg text-gray-700 mb-6">
                    Experience our premium Courtside Suites, offering comfortable seating, exclusive amenities, and a perfect view of the action.
                </p>

                <AnimatePresence>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 auto-rows-[180px] gap-4">
                        {images.slice(0, visibleCount).map((img, idx) => (
                            <GalleryImage
                                key={idx}
                                src={img.src}
                                alt={img.alt}
                                caption={img.caption}
                                span={spans[idx] || "col-span-1 row-span-1"}
                                onClick={() => setModalImage({ src: img.src, alt: img.alt })}
                            />
                        ))}
                    </div>
                </AnimatePresence>

                <div className="flex justify-center mt-6 gap-4">
                    {visibleCount < images.length && (
                        <button
                            className="px-6 py-2 bg-[#2FB44D]/80 text-white font-semibold rounded shadow hover:bg-[#2FB44D]/60 transition cursor-pointer"
                            onClick={() => setVisibleCount(prev => Math.min(prev + 12, images.length))}
                        >
                            See More
                        </button>
                    )}
                    {visibleCount > INITIAL_COUNT && (
                        <button
                            className="px-6 py-2 bg-[#d0d0d8] text-gray-900 font-semibold rounded shadow hover:bg-[#cbd5e1] transition cursor-pointer"
                            onClick={() => setVisibleCount(INITIAL_COUNT)}
                        >
                            See Less
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {modalImage && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                            onClick={() => setModalImage(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8 }}
                                className="relative max-w-4xl w-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <X
                                    className="absolute top-2 right-2 text-white w-6 h-6 cursor-pointer z-50"
                                    onClick={() => setModalImage(null)}
                                />
                                <Image
                                    src={modalImage.src}
                                    alt={modalImage.alt}
                                    width={1600}
                                    height={1200}
                                    className="w-full h-auto rounded-lg"
                                />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
            <Footer />
            <ScrollIndicator />
            <FloatingChatWidget />
        </div>
    )
}

export default Page
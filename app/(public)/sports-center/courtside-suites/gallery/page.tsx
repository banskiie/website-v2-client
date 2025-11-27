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
import { CLOUD } from '@/components/custom/main-faq'

const images = [
    { src: `${CLOUD}/v1764224736/_ALP5448_nk2wby.jpg`, alt: "Courtside Suite 1", caption: "Spacious Courtside Suite" },
    { src: `${CLOUD}/v1764224691/_ALP5449_yjqfnm.jpg`, alt: "Courtside Suite 2", caption: "Modern Lounge Area" },
    { src: `${CLOUD}/v1764224693/_ALP5452_xcttqp.jpg`, alt: "Courtside Suite 3", caption: "Suite with Court View" },
    { src: `${CLOUD}/v1764224744/_ALP9378_vmstfw.jpg`, alt: "Courtside Suite 4", caption: "Elegant Interior Design" },
    { src: `${CLOUD}/v1764224773/_ALP9436_cvj5qb.jpg`, alt: "Courtside Suite 5", caption: "Luxury Seating" },
    { src: `${CLOUD}/v1764224737/_ALP5458_xzzy7g.jpg`, alt: "Courtside Suite 6", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224698/_ALP5384_vefluk.jpg`, alt: "Courtside Suite 7", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224686/_ALP5387_s0ter7.jpg`, alt: "Courtside Suite 8", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224689/_ALP5393_f1j8s3.jpg`, alt: "Courtside Suite 9", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224729/_ALP5398_zxo1uh.jpg`, alt: "Courtside Suite 10", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224687/_ALP5411_pfn0vj.jpg`, alt: "Courtside Suite 11", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224731/_ALP5438_xhsckb.jpg`, alt: "Courtside Suite 12", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224732/_ALP5441_dgzvua.jpg`, alt: "Courtside Suite 13", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224694/_ALP5453_puqevh.jpg`, alt: "Courtside Suite 14", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224700/_ALP5460_rjrbiq.jpg`, alt: "Courtside Suite 15", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224702/_ALP5463_sjowf9.jpg`, alt: "Courtside Suite 16", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224704/_ALP7809_kn3sh7.jpg`, alt: "Courtside Suite 17", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224740/_ALP7811_feonru.jpg`, alt: "Courtside Suite 18", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224742/_ALP7819_a4nbla.jpg`, alt: "Courtside Suite 19", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224706/_ALP9371_t7czml.jpg`, alt: "Courtside Suite 20", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224708/_ALP9373_tsuhkc.jpg`, alt: "Courtside Suite 21", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224710/_ALP9375_jacn80.jpg`, alt: "Courtside Suite 22", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224712/_ALP9377_a7qsqx.jpg`, alt: "Courtside Suite 23", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224747/_ALP9379_siizg4.jpg`, alt: "Courtside Suite 24", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224748/_ALP9380_p4lris.jpg`, alt: "Courtside Suite 25", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224751/_ALP9381_ukrj1m.jpg`, alt: "Courtside Suite 26", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224752/_ALP9382_l50b6u.jpg`, alt: "Courtside Suite 27", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224757/_ALP9387_ymjec3.jpg`, alt: "Courtside Suite 28", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224755/_ALP9398_te525q.jpg`, alt: "Courtside Suite 29", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224760/_ALP9399_covumj.jpg`, alt: "Courtside Suite 30", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224762/_ALP9400_yrmbx3.jpg`, alt: "Courtside Suite 31", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224764/_ALP9403_r5eodn.jpg`, alt: "Courtside Suite 32", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224766/_ALP9406_azdtko.jpg`, alt: "Courtside Suite 33", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224769/_ALP9411_lxadsm.jpg`, alt: "Courtside Suite 34", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224770/_ALP9413_jljrej.jpg`, alt: "Courtside Suite 35", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224727/_ALP9442_zoexzq.jpg`, alt: "Courtside Suite 36", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224716/_ALP9425_ii3chm.jpg`, alt: "Courtside Suite 37", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224718/_ALP9426_ib5ysb.jpg`, alt: "Courtside Suite 38", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224720/_ALP9430_u8a9js.jpg`, alt: "Courtside Suite 39", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224722/_ALP9433_tilcnt.jpg`, alt: "Courtside Suite 40", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224725/_ALP9435_pslmki.jpg`, alt: "Courtside Suite 41", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224773/_ALP9436_cvj5qb.jpg`, alt: "Courtside Suite 42", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224677/_ALP9451_fts3gf.jpg`, alt: "Courtside Suite 43", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224679/_ALP9452_p7gwt7.jpg`, alt: "Courtside Suite 44", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224681/_ALP9455_mf4a8c.jpg`, alt: "Courtside Suite 45", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224696/_ALP9605-Enhanced-NR_jr4qqd.jpg`, alt: "Courtside Suite 46", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224775/_ALP9608-Enhanced-NR_ltvhkn.jpg`, alt: "Courtside Suite 47", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224682/_ALP9611-Enhanced-NR_jtlcfn.jpg`, alt: "Courtside Suite 48", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224684/_ALP9612-Enhanced-NR_m2pobp.jpg`, alt: "Courtside Suite 49", caption: "Cozy Atmosphere" },
    { src: `${CLOUD}/v1764224777/_ALP9615-Enhanced-NR_d06o8t.jpg`, alt: "Courtside Suite 50", caption: "Cozy Atmosphere" },
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
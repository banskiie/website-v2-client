"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { CLOUD } from "./main-faq"

const highlights = [
    {
        id: 1,
        image: `${CLOUD}/v1764118209/2_t2c0ok.png`,
        badge: "Kumbira 2025",
        date: "October 15 – 17,2025",
        title: "Winner at the Latte Art Contest ",
        description: `Warm congratulations to our very own Luke Anthony Lim Navales for winning the Latte Art Contest at Kumbira 2025, held last October 15–17, 2025 at the Limketkai Atrium, Cagayan de Oro City! ☕✨

Your dedication, creativity, and love for coffee continue to inspire us every single day. From every pour to every design, your passion reminds us that coffee is truly an art from the heart. 💫

We couldn't be prouder to have you on the ShuttleBrew team — keep chasing dreams and creating beautiful moments, one cup at a time. 💚`,
        gallery: [],
    },
    {
        id: 2,
        image: `${CLOUD}/v1764118312/557267221_122144346476406293_1247136813454960039_n_jgicqu.jpg`,
        badge: "BREW FESTIVAL 2025",
        date: "September 26 – 28, 2025",
        title: "BREW FESTIVAL 2025 ",
        description: `From September 26–28, 2025, our ShuttleBrew baristas had a journey to remember at the Brew Festival in Ayala Malls Centrio. 

         It wasn't just about the competition—it was about passion, friendship, and the love for coffee that brought everyone together. Every cup poured carried dedication, every smile shared created connections, and every moment was a reminder of why we brew. 🌿

We're beyond proud of our team for stepping up, representing ShuttleBrew, and bringing home not just experiences, but memories that will inspire us for years to come. 🙌🤎`,
        gallery: [],
    },
    {
        id: 3,
        image: `${CLOUD}/v1764118394/coc_bl05vv.jpg`,
        badge: "ORO BEST EXPO 2025",
        date: "October 30 – 31, 2025",
        title: "3RD PLACER - CDO ORO CHAMBER OF COMMERCE",
        description: `Huge Congratulations to our very own champions! ✨

We are incredibly proud of Barista Rolly for winning Champion – Latte Art Category, and Barista Luke for placing 3rd at the recent 𝗢𝗥𝗢 𝗕𝗘𝗦𝗧 𝗘𝗫𝗣𝗢 𝟮𝟬𝟮𝟱  by the 𝐂𝐃𝐎 𝐎𝐑𝐎 𝐂𝐇𝐀𝐌𝐁𝐄𝐑 𝐎𝐅 𝐂𝐎𝐌𝐌𝐄𝐑𝐂𝐄, held at Ayala Centrio Mall! 

Your passion, creativity, and dedication to your craft inspire us every day. Thank you for representing us with excellence — you truly make the Shuttle Brew family proud! 💛🔥

Here's to more brews, more wins, and more milestones ahead! 🚀`,
        gallery: [],
    },
    {
        id: 4,
        image: `${CLOUD}/v1774939214/Untitled_design_80_xzqul2.png`,
        badge: "ShuttleBrew Valentines",
        date: "February 14, 2026",
        title: "ShuttleBrew #LoveAtFirstBrew",
        description: `From the warm lights to the romantic touches and cozy corners, ShuttleBrew was transformed into the perfect Valentine’s setting. ☕✨
        A space made for good food, sweet moments, and memories worth keeping.
        `,
        gallery: [
            `${CLOUD}/v1774939214/Untitled_design_80_xzqul2.png`,
            `${CLOUD}/v1774939214/Untitled_design_78_ba6zkl.png`,
            `${CLOUD}/v1774938604/636113021_122154984362406293_1412084824859969865_n_psi3ds.jpg`,
            `${CLOUD}/v1774939214/Untitled_design_81_rbt1e9.png`,
            `${CLOUD}/v1774939214/Untitled_design_79_chircu.png`,
            `${CLOUD}/v1774939215/Untitled_design_83_k3ns1h.png`,
            `${CLOUD}/v1774939215/Untitled_design_84_gjdelz.png`,
            `${CLOUD}/v1774939215/Untitled_design_86_hhpwmh.png`,
            `${CLOUD}/v1774939215/Untitled_design_85_ipfwqr.png`,
            `${CLOUD}/v1774939215/Untitled_design_87_nuoojo.png`,
            `${CLOUD}/v1774939216/Untitled_design_88_onfqwq.png`,
            `${CLOUD}/v1774939218/Untitled_design_89_fsdl2m.png`,
            `${CLOUD}/v1774939219/Untitled_design_90_b32tnb.png`,
            `${CLOUD}/v1774939219/Untitled_design_91_zephl6.png`,
            `${CLOUD}/v1774939219/Untitled_design_92_nxahys.png`,
            `${CLOUD}/v1774939220/Untitled_design_93_lrcbe1.png`,
            `${CLOUD}/v1774939221/Untitled_design_49_zuy5z5.png`,
            `${CLOUD}/v1774939222/Untitled_design_50_n3kbw4.png`,
            `${CLOUD}/v1774939223/Untitled_design_52_s2by4g.png`,
            `${CLOUD}/v1774939223/Untitled_design_53_kw6dg5.png`,
            `${CLOUD}/v1774939224/Untitled_design_82_phgg8v.png`,
            `${CLOUD}/v1774939226/Untitled_design_55_myzsoe.png`,
            `${CLOUD}/v1774939227/Untitled_design_56_hjyshx.png`,
            `${CLOUD}/v1774939227/Untitled_design_57_lfbfl5.png`,
            `${CLOUD}/v1774939227/Untitled_design_58_ell2iq.png`,
            `${CLOUD}/v1774939231/Untitled_design_59_wzvniz.png`,
            `${CLOUD}/v1774939231/Untitled_design_60_qznfmg.png`,
            `${CLOUD}/v1774939231/Untitled_design_61_wxvzt6.png`,
            `${CLOUD}/v1774939232/Untitled_design_62_upexio.png`,
            `${CLOUD}/v1774939232/Untitled_design_63_fgi9r5.png`,
            `${CLOUD}/v1774939239/Untitled_design_67_saoobh.png`,
            `${CLOUD}/v1774939240/Untitled_design_68_qv4cvv.png`,
            `${CLOUD}/v1774939242/Untitled_design_69_fsua2p.png`,
            `${CLOUD}/v1774939243/Untitled_design_70_r0tptm.png`,
            `${CLOUD}/v1774939244/Untitled_design_71_hax8kb.png`,
            `${CLOUD}/v1774939246/Untitled_design_72_gcyijg.png`,
            `${CLOUD}/v1774939246/Untitled_design_73_nheoju.png`,
            `${CLOUD}/v1774939248/Untitled_design_75_ybnrg0.png`,
            `${CLOUD}/v1774939248/Untitled_design_74_ajfxhp.png`,
            `${CLOUD}/v1774939249/Untitled_design_76_vvbbqo.png`,
            `${CLOUD}/v1774939249/Untitled_design_77_ukvf6a.png`,
            `${CLOUD}/v1774939259/Untitled_design_54_id5m2j.png`,
        ],
    },
    {
        id: 5,
        image: `${CLOUD}/v1774936160/Untitled_design_12_qocba7.png`,
        badge: "International Womens Day Buffet",
        date: "March 8, 2026",
        title: "International Women’s Day",
        description: `From the warm lights to the romantic touches and cozy corners, ShuttleBrew was transformed into the perfect Valentine’s setting. ☕✨
        A space made for good food, sweet moments, and memories worth keeping.
        `,
        gallery: [
            `${CLOUD}/v1774936160/Untitled_design_12_qocba7.png`,
            `${CLOUD}/v1774936155/Untitled_design_32_yslfzd.png`,
            `${CLOUD}/v1774936154/Untitled_design_31_h5dao6.png`,
            `${CLOUD}/v1774936150/Untitled_design_30_eiukhm.png`,
            `${CLOUD}/v1774936150/Untitled_design_29_d01oss.png`,
            `${CLOUD}/v1774936150/Untitled_design_28_varlsh.png`,
            `${CLOUD}/v1774936150/Untitled_design_27_gns8xr.png`,
            `${CLOUD}/v1774936149/Untitled_design_26_my051q.png`,
            `${CLOUD}/v1774936149/Untitled_design_25_i54jqc.png`,
            `${CLOUD}/v1774936146/Untitled_design_24_hxsmyr.png`,
            `${CLOUD}/v1774936145/Untitled_design_23_dt5mul.png`,
            `${CLOUD}/v1774936145/Untitled_design_22_ipe2ss.png`,
            `${CLOUD}/v1774936145/Untitled_design_21_oalbo6.png`,
            `${CLOUD}/v1774936145/Untitled_design_20_kdjgul.png`,
            `${CLOUD}/v1774936140/Untitled_design_19_lwahmy.png`,
            `${CLOUD}/v1774936140/Untitled_design_18_ytoaqu.png`,
            `${CLOUD}/v1774936140/Untitled_design_17_m4jnui.png`,
            `${CLOUD}/v1774936140/Untitled_design_16_c3fk1v.png`,
            `${CLOUD}/v1774936139/Untitled_design_15_lrdoz7.png`,
            `${CLOUD}/v1774936139/Untitled_design_14_pgz4vp.png`,
            `${CLOUD}/v1774936135/Untitled_design_13_vcckgi.png`,
            `${CLOUD}/v1774936135/Untitled_design_11_liasut.png`,
            `${CLOUD}/v1774936134/Untitled_design_9_zgoz5g.png`,
            `${CLOUD}/v1774936134/Untitled_design_10_lkc3xi.png`,
            `${CLOUD}/v1774936134/Untitled_design_2_ipwspp.png`,
            `${CLOUD}/v1774936134/Untitled_design_8_irqclc.png`,
            `${CLOUD}/v1774936131/Untitled_design_7_gatu53.png`,
            `${CLOUD}/v1774936130/Untitled_design_6_hzckte.png`,
            `${CLOUD}/v1774936130/Untitled_design_4_mc5xcc.png`,
            `${CLOUD}/v1774936130/Untitled_design_5_y0ka4m.png`,
            `${CLOUD}/v1774936129/Untitled_design_3_vvizmw.png`,
            `${CLOUD}/v1774936129/Untitled_design_1_qtrh3s.png`,
            `${CLOUD}/v1774936126/Untitled_design_pzvtbu.png`,
            `${CLOUD}/v1774936126/Untitled_design_39_aofrw6.png`,
            `${CLOUD}/v1774936125/Untitled_design_47_dyu0wj.png`,
            `${CLOUD}/v1774936125/Untitled_design_48_mdbeif.png`,
            `${CLOUD}/v1774936124/Untitled_design_42_ox7fod.png`,
            `${CLOUD}/v1774936124/Untitled_design_45_omb4nc.png`,
            `${CLOUD}/v1774936124/Untitled_design_44_nhsvyd.png`,
            `${CLOUD}/v1774936124/Untitled_design_41_bjbukv.png`,
            `${CLOUD}/v1774936123/Untitled_design_37_z0bero.png`,
            `${CLOUD}/v1774936123/Untitled_design_40_r9jo0p.png`,
            `${CLOUD}/v1774936123/Untitled_design_33_bvwrq0.png`,
            `${CLOUD}/v1774936123/Untitled_design_36_urs0rb.png`,
            `${CLOUD}/v1774936123/Untitled_design_35_qct46z.png`,
            `${CLOUD}/v1774936122/Untitled_design_38_znozlh.png`,
            `${CLOUD}/v1774936122/Untitled_design_34_ex7vzo.png`,
        ],
    },
]

// Masonry Gallery Component
function MasonryGallery({ images, onClose }: any) {
    const [selectedImage, setSelectedImage] = useState(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [])

    // Handle escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (selectedImage) {
                    setSelectedImage(null)
                } else {
                    onClose()
                }
            }
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [selectedImage, onClose])

    return (
        <>
            <div
                className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <div
                    className="relative bg-[#fff9f4] rounded-2xl w-full max-w-6xl max-h-[85vh] flex flex-col shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                    onWheel={(e) => e.stopPropagation()}
                >
                    <div className="sticky top-0 z-10 bg-[#fff9f4] border-b border-[#5c3d1e]/20 px-6 py-4 flex justify-between items-center rounded-t-2xl">
                        <h3 className="text-xl sm:text-2xl font-bold text-[#5c3d1e]">Gallery</h3>
                        <button
                            onClick={onClose}
                            className="text-[#5c3d1e] text-2xl sm:text-3xl font-bold cursor-pointer hover:text-[#f38a12] transition-colors bg-[#5c3d1e]/10 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center"
                        >
                            ×
                        </button>
                    </div>

                    <div
                        ref={scrollRef}
                        className="overflow-y-auto p-4 sm:p-6 flex-1"
                        style={{
                            scrollbarWidth: "thin",
                            // scrollbarWidth: "auto", 
                            overscrollBehavior: "contain",
                        }}
                    >
                        <div className="columns-2 xs:columns-2 sm:columns-3 md:columns-4 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
                            {images.map((img: any, idx: any) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: Math.min(idx * 0.05, 1) }}
                                    className="break-inside-avoid mb-3 sm:mb-4 cursor-pointer relative group"
                                    onClick={() => setSelectedImage(img)}
                                >
                                    <div className="relative overflow-hidden rounded-lg shadow-lg">
                                        <Image
                                            src={img}
                                            alt={`Gallery image ${idx + 1}`}
                                            width={500}
                                            height={500}
                                            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <svg className="w-8 h-8 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                            </svg>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-7xl max-h-[90vh]">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-10 sm:-top-12 right-0 text-white text-2xl sm:text-3xl font-bold cursor-pointer hover:text-[#f38a12] transition-colors bg-black/50 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center"
                        >
                            ×
                        </button>
                        <Image
                            src={selectedImage}
                            alt="Selected gallery image"
                            width={1200}
                            height={800}
                            className="object-contain max-h-[80vh] sm:max-h-[85vh] w-auto"
                        />
                    </div>
                </div>
            )}
        </>
    )
}

export default function HighlightsSection() {
    const [showAll, setShowAll] = useState(false)
    const [galleryOpen, setGalleryOpen] = useState(false)
    const [currentGalleryImages, setCurrentGalleryImages] = useState([])

    // Sort highlights in descending order (newest first based on id)
    const sortedHighlights = [...highlights].sort((a, b) => b.id - a.id)

    const displayedHighlights = showAll ? sortedHighlights : sortedHighlights.slice(0, 3)
    const hasMore = sortedHighlights.length > 3

    const openGallery = (galleryImages: any) => {
        if (galleryImages && galleryImages.length > 0) {
            setCurrentGalleryImages(galleryImages)
            setGalleryOpen(true)
        }
    }

    return (
        <section className="relative w-full py-20 px-4 sm:px-6 md:px-20 bg-[#fff9f4] overflow-hidden">
            <motion.div
                className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8 }}
            >
                <div>
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-medium text-[#5c3d1e] tracking-tight">
                        Highlights
                    </h2>
                </div>

                <p className="text-[#5c3d1e]/80 font-nunito-sans text-base md:text-lg max-w-sm text-center sm:text-right">
                    Happenings in the{" "}
                    <span className="text-[#f38a12] font-semibold">ShuttleBrew</span>
                </p>
            </motion.div>

            <div className="border-t-2 border-dashed border-[#5c3d1e]/30 mb-16"></div>

            <div className="space-y-24 sm:space-y-32">
                {displayedHighlights.map((item, index) => {
                    const isEven = index % 2 !== 0
                    const hasGallery = item.gallery && item.gallery.length > 0

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className={`flex flex-col ${isEven ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-8 md:gap-16`}
                        >
                            <div className="relative w-full lg:w-1/2">
                                <div className="overflow-hidden rounded-2xl shadow-lg">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        width={1000}
                                        height={600}
                                        className="object-cover w-full h-[300px] sm:h-[350px] md:h-[450px] lg:h-[500px] transition-transform duration-700 hover:scale-105"
                                        loading="lazy"
                                        blurDataURL={item.image}
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#fda12f]/10 via-transparent to-[#f38a12]/10 rounded-2xl blur-2xl -z-10"></div>
                            </div>

                            <div className="w-full lg:w-1/2 text-center lg:text-left">
                                <div className="flex items-center justify-center lg:justify-start gap-3 mb-4 flex-wrap">
                                    <span className="px-4 py-1.5 bg-[#5c3d1e] text-[#fcefdc] rounded-full text-sm font-nunito-sans font-semibold">
                                        {item.badge}
                                    </span>
                                    <span className="text-[#5c3d1e]/70 font-nunito-sans text-sm">
                                        {item.date}
                                    </span>
                                </div>
                                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#3a2a1a] font-nunito-sans mb-4">
                                    {item.title}
                                </h3>
                                <p className="text-[#5c3d1e]/90 font-nunito-sans text-base sm:text-lg leading-relaxed mb-6" style={{ whiteSpace: "pre-line" }}>
                                    {item.description}
                                </p>

                                {hasGallery && (
                                    <motion.button
                                        onClick={() => openGallery(item.gallery)}
                                        className="inline-flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 bg-[#f38a12] text-white rounded-full font-semibold text-sm sm:text-base hover:bg-[#5c3d1e] transition-all duration-300 shadow-md hover:shadow-lg"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        View Gallery
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {hasMore && (
                <div className="mt-16 text-center">
                    <motion.button
                        onClick={() => setShowAll(!showAll)}
                        className="px-8 py-3 bg-[#f38a12] text-white rounded-full font-semibold text-lg hover:bg-[#5c3d1e] transition-all duration-300 shadow-lg hover:shadow-xl"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        {showAll ? "See Less" : "See More"}
                    </motion.button>
                </div>
            )}

            <div className="mt-24 border-t-2 border-dashed border-[#5c3d1e]/30"></div>

            {galleryOpen && (
                <MasonryGallery
                    images={currentGalleryImages}
                    onClose={() => setGalleryOpen(false)}
                />
            )}
        </section>
    )
}
// Brown Theme

// "use client"

// import { useState, useRef } from "react"
// import { motion } from "framer-motion"
// import Image from "next/image"
// import Autoplay from "embla-carousel-autoplay"
// import {
//     Carousel,
//     CarouselContent,
//     CarouselItem,
// } from "@/components/ui/carousel"

// export default function StoryCarousel() {
//     const [zoomedImage, setZoomedImage] = useState<string | null>(null)

//     const autoplay = useRef(
//         Autoplay({ delay: 1800, stopOnInteraction: false })
//     )

//     const images = [
//         "/assets/img/sports-center/shuttlebrew/image1.jpg",
//         "/assets/img/sports-center/shuttlebrew/iamge.jpg",
//         "/assets/img/sports-center/shuttlebrew/image2.jpg",
//         "/assets/img/sports-center/shuttlebrew/image4.jpg",
//     ]

//     return (
//         <div className="relative w-full bg-gradient-to-b from-[#1a1009] via-[#20140c] to-[#1a1009] py-24 px-8 md:px-20 overflow-hidden">
//             <motion.h1
//                 className="absolute top-24 left-1/2 -translate-x-1/2 text-[5rem] md:text-[9rem] font-extrabold text-[#2b1b10] opacity-10 select-none pointer-events-none whitespace-nowrap z-0"
//                 initial={{ opacity: 0, y: 40 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true, amount: 0.3 }}
//                 transition={{ duration: 1 }}
//             >
//                 Our Story
//             </motion.h1>

//             <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center z-10">
//                 <motion.div
//                     initial={{ opacity: 0, x: -60 }}
//                     whileInView={{ opacity: 1, x: 0 }}
//                     viewport={{ once: true, amount: 0.3 }}
//                     transition={{ duration: 1 }}
//                     className="relative"
//                 >
//                     <Carousel
//                         plugins={[autoplay.current]}
//                         className="w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
//                     >
//                         <CarouselContent>
//                             {images.map((src, idx) => (
//                                 <CarouselItem key={idx} className="cursor-pointer">
//                                     <Image
//                                         src={src}
//                                         alt={`Story image ${idx + 1}`}
//                                         width={650}
//                                         height={650}
//                                         className="object-cover rounded-3xl h-[400px] md:h-[500px] bg-[#1a1009]"
//                                         onClick={() => setZoomedImage(src)}
//                                     />
//                                 </CarouselItem>
//                             ))}
//                         </CarouselContent>
//                     </Carousel>

//                     <div className="absolute -inset-4 bg-gradient-to-tr from-[#fda12f]/20 via-transparent to-[#f38a12]/10 rounded-3xl blur-2xl -z-10"></div>
//                 </motion.div>

//                 <motion.div
//                     initial={{ opacity: 0, x: 60 }}
//                     whileInView={{ opacity: 1, x: 0 }}
//                     viewport={{ once: true, amount: 0.3 }}
//                     transition={{ duration: 1, delay: 0.2 }}
//                     className="text-white"
//                 >
//                     <h2 className="text-4xl md:text-5xl font-extrabold mb-8 leading-tight">
//                         The Story of{" "}
//                         <span className="bg-gradient-to-r from-[#fda12f] to-[#f38a12] bg-clip-text text-transparent">
//                             ShuttleBrew
//                         </span>
//                     </h2>

//                     <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-6">
//                         Born from the fusion of <span className="text-white font-semibold">sports energy</span>{" "}
//                         and <span className="text-white font-semibold">coffee passion</span>, ShuttleBrew is
//                         more than just a café. It’s where adrenaline meets aroma — a hub for champions,
//                         dreamers, and coffee lovers alike.
//                     </p>

//                     <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-6">
//                         Every cup we brew is a celebration of{" "}
//                         <span className="text-[#fda12f] font-semibold">drive</span>,{" "}
//                         <span className="text-[#fda12f] font-semibold">dedication</span>, and{" "}
//                         <span className="text-[#fda12f] font-semibold">community</span>. From handpicked beans
//                         to crafted blends, each sip is designed to fuel ambition and spark connections.
//                     </p>

//                     <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
//                         Whether you’re cooling down after a match or seeking your daily inspiration,
//                         ShuttleBrew is where <span className="italic">your story</span> becomes part of ours.
//                     </p>

//                     <div className="flex flex-wrap gap-4 mt-10">
//                         <button className="bg-gradient-to-r from-[#fda12f] to-[#f38a12] text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:opacity-90 transition cursor-pointer">
//                             Learn More
//                         </button>
//                         <a
//                             href="https://www.google.com/maps/place/ShuttleBrew+Coffee+Shop/@8.5001182,124.6394385,1169m/data=!3m2!1e3!4b1!4m6!3m5!1s0x32fff30000cb1cd9:0x3e795eb7c067f7c!8m2!3d8.5001129!4d124.6420134!16s%2Fg%2F11wpztntx9?entry=ttu&g_ep=EgoyMDI1MDkxMC4wIKXMDSoASAFQAw%3D%3D"
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="bg-transparent border border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white hover:text-[#20140c] transition cursor-pointer"
//                         >
//                             Visit Us
//                         </a>
//                     </div>
//                 </motion.div>
//             </div>

//             {/* Zoom modal */}
//             {zoomedImage && (
//                 <motion.div
//                     className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 cursor-zoom-out"
//                     onClick={() => setZoomedImage(null)}
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                 >
//                     <motion.img
//                         src={zoomedImage}
//                         alt="Zoomed"
//                         className="max-w-[90%] max-h-[90%] rounded-xl shadow-2xl"
//                         initial={{ scale: 0.8 }}
//                         animate={{ scale: 1 }}
//                         transition={{ type: "spring", stiffness: 120 }}
//                     />
//                 </motion.div>
//             )}
//         </div>
//     )
// }


// Green theme

// "use client"

// import { useState, useRef, useEffect, useMemo } from "react"
// import { motion } from "framer-motion"
// import Image from "next/image"
// import Autoplay from "embla-carousel-autoplay"
// import {
//     Carousel,
//     CarouselContent,
//     CarouselItem,
// } from "@/components/ui/carousel"

// export default function StoryCarousel() {
//     const [zoomedImage, setZoomedImage] = useState<string | null>(null)
// const [_zoomedActiveIndex, setZoomedActiveIndex] = useState(0)
// const zoomedCarouselRef = useRef<any>(null)
// const touchStartRef = useRef(0)

// const handlePrev = () => {
//     const idx = images.indexOf(zoomedImage!)
//     const prevIdx = idx === 0 ? images.length - 1 : idx - 1
//     setZoomedImage(images[prevIdx])
// }

// const handleNext = () => {
//     const idx = images.indexOf(zoomedImage!)
//     const nextIdx = idx === images.length - 1 ? 0 : idx + 1
//     setZoomedImage(images[nextIdx])
// }

// const autoplay = useRef(Autoplay({ delay: 1800, stopOnInteraction: false }))

// // ✅ Memoize images so it doesn’t get recreated every render
// const images = useMemo(() => [
//     "/assets/img/sports-center/shuttlebrew/image1.jpg",
//     "/assets/img/sports-center/shuttlebrew/iamge.jpg",
//     "/assets/img/sports-center/shuttlebrew/image2.jpg",
//     "/assets/img/sports-center/shuttlebrew/image4.jpg",
// ], [])

// useEffect(() => {
//     if (zoomedImage) {
//         const initialIndex = images.findIndex(img => img === zoomedImage)
//         setZoomedActiveIndex(initialIndex)
//     }
// }, [zoomedImage, images])

// useEffect(() => {
//     if (!zoomedCarouselRef.current) return
//     const carousel = zoomedCarouselRef.current

//     const onSelect = () => {
//         if (carousel.selectedScrollSnap) {
//             setZoomedActiveIndex(carousel.selectedScrollSnap())
//         }
//     }

//     if (carousel.on) {
//         carousel.on("select", onSelect)
//     }

//     return () => {
//         if (carousel.off) {
//             carousel.off("select", onSelect)
//         }
//     }
// }, [zoomedCarouselRef])

//     return (
//         <div className="relative w-full bg-white py-24 px-8 md:px-20 overflow-hidden">

//             {/* <motion.h1
//                 className="absolute top-24 left-1/2 -translate-x-1/2 text-[5rem] md:text-[9rem] font-extrabold text-[#2b1b10] opacity-10 select-none pointer-events-none whitespace-nowrap z-0"
//                 initial={{ opacity: 0, y: 40 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true, amount: 0.3 }}
//                 transition={{ duration: 1 }}
//             >
//                 Our Story
//             </motion.h1> */}

//             <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center z-10">
//                 <motion.div
//                     initial={{ opacity: 0, x: -60 }}
//                     whileInView={{ opacity: 1, x: 0 }}
//                     viewport={{ once: true, amount: 0.3 }}
//                     transition={{ duration: 1 }}
//                     className="relative"
//                 >
//                     <div className="absolute -top-5 -left-5 w-[95%] h-[99%] bg-[#1eb96c] rounded-3xl shadow-xl -z-10"></div>

//                     <Carousel
//                         plugins={[autoplay.current]}
//                         className="w-full max-w-2xl rounded-3xl overflow-hidden relative z-10"
//                     >
//                         <CarouselContent>
//                             {images.map((src, idx) => (
//                                 <CarouselItem key={idx} className="cursor-pointer">
//                                     <Image
//                                         src={src}
//                                         alt={`Story image ${idx + 1}`}
//                                         width={650}
//                                         height={650}
//                                         className="object-cover rounded-3xl h-[400px] md:h-[500px]"
//                                         onClick={() => setZoomedImage(src)}
//                                     />
//                                 </CarouselItem>
//                             ))}
//                         </CarouselContent>
//                     </Carousel>

//                     <div className="absolute -inset-4 bg-gradient-to-tr from-[#fda12f]/20 via-transparent to-[#f38a12]/10 rounded-3xl blur-2xl -z-20"></div>
//                 </motion.div>


//                 <motion.div
//                     initial={{ opacity: 0, x: 60 }}
//                     whileInView={{ opacity: 1, x: 0 }}
//                     viewport={{ once: true, amount: 0.3 }}
//                     transition={{ duration: 1, delay: 0.2 }}
//                     className="text-[#2b6343]"
//                 >
//                     <h2 className="mb-8 leading-tight flex flex-col gap-4">
//                         <span className="text-2xl md:text-3xl font-semibold"> About{" "} </span>
//                         <span className="text-4xl md:text-5xl font-extrabold bg-clip-text text-[#1e6843]">
//                             ShuttleBrew
//                         </span>
//                     </h2>

//                     <p className="text-lg md:text-xl text-[#2b6343] leading-relaxed mb-6">
//                         Born from the fusion of <span className="text-[#20945a] font-semibold">sports energy</span>{" "}
//                         and <span className="text-[#20945a] font-semibold">coffee passion</span>, ShuttleBrew is
//                         more than just a café. Its where adrenaline meets aroma — a hub for champions,
//                         dreamers, and coffee lovers alike.
//                     </p>

//                     <p className="text-lg md:text-xl text-[#2b6343] leading-relaxed mb-6">
//                         Every cup we brew is a celebration of{" "}
//                         <span className="text-[#20945a] font-semibold">drive</span>,{" "}
//                         <span className="text-[#20945a] font-semibold">dedication</span>, and{" "}
//                         <span className="text-[#20945a] font-semibold">community</span>. From handpicked beans
//                         to crafted blends, each sip is designed to fuel ambition and spark connections.
//                     </p>

//                     <p className="text-lg md:text-xl text-[#2b6343] leading-relaxed">
//                         Whether you&apos;re cooling down after a match or seeking your daily inspiration,
//                         ShuttleBrew is where <span className="italic">your story</span> becomes part of ours.
//                     </p>

//                     <div className="flex flex-wrap gap-4 mt-10">
//                         <a
//                             href="/sports-center/shuttlebrew/about-us/"
//                             className="bg-[#1eb96c] text-white hover:bg-[#143324] font-semibold px-8 py-3 rounded-lg shadow-md transition cursor-pointer"
//                         >
//                             Learn More
//                         </a>
//                         <a
//                             href="https://www.google.com/maps/place/ShuttleBrew+Coffee+Shop/@8.5001182,124.6394385,1169m/data=!3m2!1e3!4b1!4m6!3m5!1s0x32fff30000cb1cd9:0x3e795eb7c067f7c!8m2!3d8.5001129!4d124.6420134!16s%2Fg%2F11wpztntx9?entry=ttu&g_ep=EgoyMDI1MDkxMC4wIKXMDSoASAFQAw%3D%3D"
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="bg-transparent border border-black text-black font-semibold px-8 py-3 rounded-lg hover:bg-[#1eb96c] hover:border-[#1eb96c] hover:text-white transition cursor-pointer"
//                         >
//                             Visit Us
//                         </a>
//                     </div>
//                 </motion.div>
//             </div>

//             {/* Zoom modal */}
//             {zoomedImage && (
//                 <motion.div
//                     className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                 >
//                     <div
//                         className="relative w-[90%] max-h-[90%] flex items-center justify-center overflow-hidden"
//                         onTouchStart={(e) => {
//                             touchStartRef.current = e.touches[0].clientX
//                         }}
//                         onTouchEnd={(e) => {
//                             const touchEndX = e.changedTouches[0].clientX
//                             const diff = touchStartRef.current - touchEndX

//                             if (diff > 50) handleNext()
//                             else if (diff < -50) handlePrev()
//                         }}
//                     >
//                         <button
//                             className="absolute cursor-pointer left-2 z-20 text-white text-3xl w-12 h-12 flex items-center justify-center bg-black/40 rounded-full hover:bg-black/60 transition"
//                             onClick={(e) => {
//                                 e.stopPropagation()
//                                 handlePrev()
//                             }}
//                         >
//                             ‹
//                         </button>

//                         {/* Zoomed Image */}
//                         <Image
//                             src={zoomedImage}
//                             alt="Zoomed"
//                             width={1200}
//                             height={1200}
//                             className="object-contain max-h-[90vh] rounded-xl shadow-2xl cursor-zoom-out"
//                             onClick={() => setZoomedImage(null)}
//                         />

//                         <button
//                             className="absolute cursor-pointer right-2 z-20 text-white text-3xl w-12 h-12 flex items-center justify-center bg-black/40 rounded-full hover:bg-black/60 transition"
//                             onClick={(e) => {
//                                 e.stopPropagation()
//                                 handleNext()
//                             }}
//                         >
//                             ›
//                         </button>
//                     </div>

//                     {/* Carousel dots */}
//                     <div className="flex gap-2 mt-4">
//                         {images.map((img, idx) => (
//                             <span
//                                 key={idx}
//                                 className={`w-3 h-3 rounded-full transition ${img === zoomedImage ? "bg-white" : "bg-white/50"
//                                     }`}
//                             />
//                         ))}
//                     </div>
//                 </motion.div>
//             )}

//         </div>
//     )
// }


"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Autoplay from "embla-carousel-autoplay"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel"
import { CLOUD } from "./main-faq"

export default function StoryCarousel() {
    const [zoomedImage, setZoomedImage] = useState<string | null>(null)
    const touchStartRef = useRef(0)
    const zoomedCarouselRef = useRef<any>(null)

    const handlePrev = () => {
        const idx = images.indexOf(zoomedImage!)
        const prevIdx = idx === 0 ? images.length - 1 : idx - 1
        setZoomedImage(images[prevIdx])
    }
    const [_zoomedActiveIndex, setZoomedActiveIndex] = useState(0)

    const handleNext = () => {
        const idx = images.indexOf(zoomedImage!)
        const nextIdx = idx === images.length - 1 ? 0 : idx + 1
        setZoomedImage(images[nextIdx])
    }

    const autoplay = useRef(Autoplay({ delay: 1800, stopOnInteraction: false }))

    const images = useMemo(() => [
        `${CLOUD}/v1764116759/iamge_l6rrwu.jpg`,
        `${CLOUD}/v1764116754/image1_ngwjkd.jpg`,
        `${CLOUD}/v1764116755/image2_oib9lo.jpg`,
        `${CLOUD}/v1764116756/image4_cldrsz.jpg`,
    ], [])

    useEffect(() => {
        if (zoomedImage) {
            const initialIndex = images.findIndex(img => img === zoomedImage)
            setZoomedActiveIndex(initialIndex)
        }
    }, [zoomedImage, images])

    useEffect(() => {
        if (!zoomedCarouselRef.current) return
        const carousel = zoomedCarouselRef.current

        const onSelect = () => {
            if (carousel.selectedScrollSnap) {
                setZoomedActiveIndex(carousel.selectedScrollSnap())
            }
        }

        if (carousel.on) {
            carousel.on("select", onSelect)
        }

        return () => {
            if (carousel.off) {
                carousel.off("select", onSelect)
            }
        }
    }, [zoomedCarouselRef])

    return (
        <div className="relative w-full py-24 px-8 md:px-20 overflow-hidden bg-[#FFF2E6]">
            <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20">
                <div className="bg-[#644C45] tracking-wider font-pacifico text-[#fcefdc] text-lg md:text-xl font-medium px-8 py-1 rounded-full shadow-lg ">
                    About
                </div>
            </div>
            <div className="absolute inset-0 w-full h-full ">
                <div className="absolute opacity-30 -bottom-70 -left-50 w-48 h-48 md:w-72 md:h-72 lg:w-170 lg:h-170 rotate-[20deg] pointer-events-none select-none">
                    <Image
                        src="/coffee-bean-roast-brew-svgrepo-com.svg"
                        alt="Coffee Bean"
                        fill
                        className="object-contain"
                    />
                </div>
                <div className="absolute opacity-30 -top-70 -right-40 w-48 h-48 md:w-72 md:h-72 lg:w-170 lg:h-170 rotate-[20deg] pointer-events-none select-none">
                    <Image
                        src="/coffee-bean-roast-brew-svgrepo-com.svg"
                        alt="Coffee Bean"
                        fill
                        className="object-contain"
                    />
                </div>
            </div>

            <motion.h1
                className="absolute top-60 left-1/2 -translate-x-1/2 text-[5rem] md:text-[9rem] font-extrabold text-[#e7d7bc] select-none pointer-events-none whitespace-nowrap z-0"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 0.4, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1 }}
            >
                Our Story
            </motion.h1>

            <div className=" border-b-4 absolute inset-0 pointer-events-none select-none">

            </div>
            <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center z-10">
                <motion.div
                    initial={{ opacity: 0, x: -60 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 1 }}
                    className="relative"
                >
                    <div className="absolute -inset-2 -top-5 mb-10 left-10 -right-5 rounded-3xl border-[#5c3d1e] border-2 pointer-events-none -z-10"></div>

                    <Carousel
                        plugins={[autoplay.current]}
                        className="w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <CarouselContent>
                            {images.map((src, idx) => (
                                <CarouselItem key={idx} className="cursor-pointer">
                                    <Image
                                        src={src}
                                        alt={`Story image ${idx + 1}`}
                                        width={650}
                                        height={650}
                                        className="object-cover rounded-3xl h-[400px] md:h-[500px]"
                                        onClick={() => setZoomedImage(src)}
                                        blurDataURL={src}
                                    />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>

                    <div className="absolute -inset-4 bg-gradient-to-tr from-[#fda12f]/25 via-transparent to-[#f38a12]/10 rounded-3xl blur-2xl -z-10"></div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 60 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="text-[#3a2a1a]"
                >
                    <h2 className="mb-8 leading-tight flex flex-col gap-4">
                        <span className="font-nunito-sans text-2xl md:text-3xl font-semibold text-[#5c3d1e]">
                            About
                        </span>
                        <span className="w-20 h-1 bg-[#5c3d1e] block -mt-4" />
                        <span className="font-nunito-sans text-4xl tracking-wider md:text-5xl font-extrabold bg-gradient-to-r from-[#FDA12F] to-[#F38A12] bg-clip-text text-transparent">
                            ShuttleBrew
                        </span>
                    </h2>

                    <p className="font-nunito-sans text-lg md:text-xl text-[#5c3d1e]/90 leading-relaxed mb-6">
                        Born from the fusion of{" "}
                        <span className="font-semibold text-[#FDA12F]">sports energy</span> and{" "}
                        <span className="font-semibold text-[#FDA12F]">coffee passion</span>,
                        ShuttleBrew is more than just a café. It’s where adrenaline meets aroma —
                        a hub for champions, dreamers, and coffee lovers alike.
                    </p>

                    <p className="font-nunito-sans text-lg md:text-xl text-[#5c3d1e]/90 leading-relaxed mb-6">
                        Every cup we brew is a celebration of{" "}
                        <span className="text-[#FDA12F] font-semibold">drive</span>,{" "}
                        <span className="text-[#FDA12F] font-semibold">dedication</span>, and{" "}
                        <span className="text-[#FDA12F] font-semibold">community</span>. From
                        handpicked beans to crafted blends, each sip fuels ambition and sparks
                        connection.
                    </p>

                    <p className="font-nunito-sans text-lg md:text-xl text-[#5c3d1e]/90 leading-relaxed">
                        Whether you’re cooling down after a match or seeking your daily
                        inspiration, ShuttleBrew is where{" "}
                        <span className="italic">your story</span> becomes part of ours.
                    </p>

                    <div className="flex flex-wrap gap-4 mt-10">
                        <a
                            href="/sports-center/shuttlebrew/about-us/"
                            className="font-nunito-sans bg-gradient-to-r from-[#d77b27] to-[#b85c18] text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:opacity-90 transition cursor-pointer"
                        >
                            View Gallery
                        </a>
                        <a
                            href="https://www.google.com/maps/place/ShuttleBrew+Coffee+Shop/@8.5001182,124.6394385,1169m"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-nunito-sans bg-transparent border border-[#5c3d1e] text-[#5c3d1e] font-semibold px-8 py-3 rounded-lg hover:bg-[#5c3d1e] hover:text-[#efdfc4] transition cursor-pointer"
                        >
                            Visit Us
                        </a>
                    </div>
                </motion.div>
            </div>

            {/* ZOOM MODAL */}
            {zoomedImage && (
                <motion.div
                    className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div
                        className="relative w-[90%] max-h-[90%] flex items-center justify-center overflow-hidden"
                        onTouchStart={(e) => {
                            touchStartRef.current = e.touches[0].clientX;
                        }}
                        onTouchEnd={(e) => {
                            const touchEndX = e.changedTouches[0].clientX;
                            const diff = touchStartRef.current - touchEndX;
                            if (diff > 50) handleNext();
                            else if (diff < -50) handlePrev();
                        }}
                    >
                        <button
                            className="absolute left-2 z-20 text-white text-3xl w-12 h-12 flex items-center justify-center bg-black/40 rounded-full hover:bg-black/60 transition"
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePrev();
                            }}
                        >
                            ‹
                        </button>

                        <Image
                            src={zoomedImage}
                            alt="Zoomed"
                            width={1200}
                            height={1200}
                            loading="lazy"
                            className="object-contain max-h-[90vh] rounded-xl shadow-2xl cursor-zoom-out"
                            onClick={() => setZoomedImage(null)}
                        />

                        <button
                            className="absolute right-2 z-20 text-white text-3xl w-12 h-12 flex items-center justify-center bg-black/40 rounded-full hover:bg-black/60 transition"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleNext();
                            }}
                        >
                            ›
                        </button>
                    </div>

                    <div className="flex gap-2 mt-4">
                        {images.map((img, idx) => (
                            <span
                                key={idx}
                                className={`w-3 h-3 rounded-full transition ${img === zoomedImage ? "bg-white" : "bg-white/50"
                                    }`}
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    )
}
"use client"

import React, { ReactNode, Ref, useRef, useState } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { CLOUD } from "./main-faq"

// Food data array
const food = [
    {
        number: 1,
        title: "Ramen",
        description: (
            <>
                <span className="text-[#ffbc52] font-semibold">Ramen</span> served in a rich broth with
                fresh vegetables and a soft-boiled egg.
            </>
        ),
        img: `${CLOUD}/v1764117505/ramen_wlyath.png`,
        href: "/menu/ramen",
        bigger: true,
        reverse: false
    },
    {
        number: 2,
        title: "Power Smash Carbonara",
        description: (
            <>
                Classic <span className="text-[#ffbc52] font-semibold">carbonara</span> pasta with creamy sauce, crispy bacon, and parmesan cheese.
            </>
        ),
        img: `${CLOUD}/v1764117559/carbonara_bperbg.png`,
        href: "/menu/power-smash-carbonara",
        bigger: false,
        reverse: true
    },
    {
        number: 3,
        title: "Shuttle Buns Burger",
        description: (
            <>
                Juicy <span className="text-[#ffbc52] font-semibold">burger</span> stacked with crispy fries inside, fresh lettuce, tomato, and our special sauce.
            </>
        ),
        img: `${CLOUD}/v1764117571/buns-burger_fwvi73.png`,
        href: "/menu/shuttle-buns-burger",
        bigger: false,
        reverse: false
    },
    {
        number: 4,
        title: "Smash N' Cheese Fries",
        description: (
            <>
                Crispy fries topped with melted <span className="text-[#ffbc52] font-semibold">cheese</span> and savory smash sauce, perfect for sharing or snacking.
            </>
        ),
        img: `${CLOUD}/v1764117581/fries_n4e92h.png`,
        href: "/menu/cheese-fries",
        bigger: false,
        reverse: true
    },
    // {
    //     number: 5,
    //     title: "Net Play Aglio Olio",
    //     description: (
    //         <>
    //             Classic <span className="text-[#ffbc52] font-semibold">aglio e olio</span> pasta tossed with garlic, olive oil, chili flakes, and fresh parsley.
    //         </>
    //     ),
    //     img: "/assets/img/sports-center/shuttlebrew/menu/aglioolio.png",
    //     href: "/menu/net-play-aglio-olio",
    //     bigger: true,
    //     reverse: false
    // },
    {
        number: 5,
        title: "Crunch Serve Nachos",
        description: (
            <>
                Crispy <span className="text-[#ffbc52] font-semibold">nachos</span> topped with melted cheese, jalapeños, and our special sauce.
            </>
        ),
        img: `${CLOUD}/v1764118079/nachos_gj1o07.png`,
        href: "/menu/crunch-serve-nachos",
        bigger: true,
        reverse: true
    },
    // {
    //     number: 7,
    //     title: "Shuttle Fries",
    //     description: (
    //         <>
    //             Delicious and crunchy <span className="text-[#ffbc52] font-semibold">fries</span> served golden brown, perfectly seasoned, and irresistibly crisp—ideal for snacking or sharing!
    //         </>
    //     ),
    //     img: "/assets/img/sports-center/shuttlebrew/menu/shuttle-fries.png",
    //     href: "/menu/shuttle-fries",
    //     bigger: false,
    //     reverse: true
    // }
]

function FoodMenuItem({
    number,
    title,
    description,
    img,
    reverse = false,
    bigger = false,
    forwardRef,
    href,
}: {
    number: number
    title: string
    description: ReactNode
    img: string
    reverse?: boolean
    bigger?: boolean
    forwardRef?: Ref<HTMLDivElement>
    href?: string
}) {
    const internalRef = useRef<HTMLDivElement>(null)
    const targetRef =
        forwardRef && typeof forwardRef !== "function"
            ? (forwardRef as React.RefObject<HTMLDivElement>)
            : internalRef

    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start 70%", "end 50%"],
    })

    const yText = useTransform(scrollYProgress, [0, 1], ["20%", "0%"])
    const yImg = useTransform(scrollYProgress, [0, 1], ["-30%", "0%"])
    const rotateImg = useTransform(scrollYProgress, [0, 1], [-20, 0])
    const scaleImg = useTransform(
        scrollYProgress,
        [0, 1],
        bigger ? [1.05, 1.2] : [0.9, 1]
    )

    return (
        <div
            ref={targetRef}
            className={`relative w-full max-w-7xl mx-auto flex flex-col items-center justify-between px-4 sm:px-6 md:px-12 mt-20 sm:mt-24 md:mt-32 scroll-mt-20 md:scroll-mt-32
                ${reverse ? "lg:flex-row-reverse" : "lg:flex-row"}`}
        >
            <motion.span
                style={{ y: yText }}
                className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/10 font-extrabold text-[5rem] md:text-[6rem] lg:text-[8rem] select-none z-0 whitespace-nowrap pointer-events-none"
                initial={{ opacity: 0, x: reverse ? -80 : 80 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
            >
                {title}
            </motion.span>

            <div className="flex flex-col items-center w-full lg:hidden">
                <div className="w-full flex justify-center mb-8 sm:mb-10 md:mb-12">
                    <motion.div
                        style={{ y: yText }}
                        className="bg-[#20140c]/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-7 md:p-8 text-white border border-white/10 relative z-10 w-full max-w-sm sm:max-w-md"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.4 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                    >
                        <div className="absolute -top-5 -left-5 sm:-top-6 sm:-left-6 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-[#ffbc52] to-[#b45309] text-white font-bold text-base sm:text-lg md:text-xl shadow-lg">
                            {number}
                        </div>

                        <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-3 sm:mb-4 bg-gradient-to-r from-[#fff8f0] to-[#fada8a] bg-clip-text text-transparent text-center px-2">
                            {title}
                        </h3>

                        <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 text-gray-200 leading-relaxed text-center px-2">
                            {description}
                        </p>

                        {/* {href && (
                            <div className="text-center">
                                <Link href={href}>
                                    <span className="inline-block px-4 py-2 bg-gradient-to-r from-[#ffbc52] to-[#b45309] text-white rounded-full font-semibold shadow-lg hover:scale-105 transition-transform duration-200 text-sm sm:text-base">
                                        See More →
                                    </span>
                                </Link>
                            </div>
                        )} */}
                    </motion.div>
                </div>

                <div className="w-full flex justify-center mb-12 sm:mb-16 md:mb-20">
                    <div className="relative">
                        <div className="absolute w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-[#ffbc52]/30 to-[#b45309]/30 z-0 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2" />
                        <motion.div
                            style={{ y: yImg, rotate: rotateImg, scale: scaleImg }}
                            className={`relative z-10 ${bigger
                                ? "w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px]"
                                : "w-[220px] h-[220px] sm:w-[250px] sm:h-[250px] md:w-[280px] md:h-[280px]"
                                }`}
                        >
                            <Image src={img} alt={title} fill className="object-contain drop-shadow-2xl" />
                        </motion.div>
                    </div>
                </div>

                <div className="absolute bottom-[-70px] sm:bottom-[-80px] left-1/2 -translate-x-1/2 flex flex-col items-center z-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#ffbc52]/50 to-[#b45309]/50 shadow-2xl" />
                    <div className="w-1 h-14 sm:h-16 bg-gradient-to-b from-[#ffbc52]/50 to-[#b45309]/50 mt-1" />
                </div>
            </div>

            <div className={`hidden lg:flex w-full ${reverse ? "lg:flex-row-reverse" : "lg:flex-row"} items-center justify-between`}>
                <div className={`lg:w-1/2 ${reverse ? "-mr-40" : "-ml-40"} relative`}>
                    <motion.div
                        style={{ y: yText }}
                        className="bg-[#20140c]/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-12 text-white border border-white/10 relative z-10 pb-28"
                        initial={{ opacity: 0, x: reverse ? 80 : -80 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.4 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                    >
                        <div className="absolute -top-8 -left-8 w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-[#ffbc52] to-[#b45309] text-white font-bold text-xl md:text-2xl shadow-lg">
                            {number}
                        </div>

                        <h3 className="text-3xl md:text-4xl font-extrabold mb-6 bg-gradient-to-r from-[#fff8f0] to-[#fada8a] bg-clip-text text-transparent">
                            {title}
                        </h3>

                        <p className="text-lg md:text-xl mb-8 text-gray-200 leading-relaxed">
                            {description}
                        </p>

                        {/* {href && (
                            <Link href={href}>
                                <span className="self-start mt-4 px-4 py-2 bg-gradient-to-r from-[#ffbc52] to-[#b45309] text-white rounded-full font-semibold shadow-lg hover:scale-105 transition-transform duration-200">
                                    See More →
                                </span>
                            </Link>
                        )} */}

                        <div className="absolute bottom-[-104px] left-1/2 -translate-x-1/2 flex flex-col items-center z-0">
                            <div className="w-10 h-10 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#ffbc52]/50 to-[#b45309]/50 shadow-2xl" />
                            <div className="w-1 h-20 bg-gradient-to-b from-[#ffbc52]/50 to-[#b45309]/50 mt-1" />
                        </div>
                    </motion.div>
                </div>

                <div className={`lg:w-1/2 flex justify-center items-center relative ${reverse ? "-ml-35" : "-mr-35"}`}>
                    <div className="absolute w-56 h-56 md:w-72 md:h-72 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-[#ffbc52]/30 to-[#b45309]/30 z-0" />
                    <motion.div
                        style={{ y: yImg, rotate: rotateImg, scale: scaleImg }}
                        className={`relative z-10 ${bigger
                            ? "w-[420px] h-[420px] md:w-[580px] md:h-[580px] lg:w-[700px] lg:h-[700px]"
                            : "w-[380px] h-[380px] md:w-[520px] md:h-[520px] lg:w-[600px] lg:h-[600px]"
                            }`}
                    >
                        <Image src={img} alt={title} fill className="object-contain drop-shadow-2xl" />
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default function ShuttleBrewFoodMenu() {
    const [showMore, setShowMore] = useState(false)
    const fourthRef = useRef<HTMLDivElement>(null)
    const fifthRef = useRef<HTMLDivElement>(null)

    const handleShowMore = () => {
        setShowMore(true)
        setTimeout(() => {
            fifthRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
        }, 15)
    }

    const handleShowLess = () => {
        setShowMore(false)
        requestAnimationFrame(() => {
            setTimeout(() => {
                fourthRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            }, 400)
        })
    }

    return (
        <div className="relative w-full min-h-screen bg-gradient-to-r from-[#5c2d0c] via-[#7b3f0f] to-[#3a1b07] flex flex-col justify-start items-center overflow-hidden">
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] rounded-full bg-gradient-to-r from-[#7b3f0f]/20 via-[#5c2d0c]/10 to-[#3a1b07]/10 blur-3xl z-0"
                animate={{ rotate: 360, scale: [1, 1.02, 1] }}
                transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
            />
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] rounded-full bg-gradient-to-r from-[#7b3f0f]/15 via-[#5c2d0c]/5 to-[#3a1b07]/5 blur-2xl z-0"
                animate={{ rotate: -360, scale: [1, 1.015, 1] }}
                transition={{ repeat: Infinity, duration: 80, ease: "linear" }}
            />

            {food.slice(0, 4).map((item, idx) => (
                <FoodMenuItem
                    key={item.number}
                    number={item.number}
                    title={item.title}
                    description={item.description}
                    img={item.img}
                    href={item.href}
                    bigger={item.bigger}
                    reverse={item.reverse}
                    forwardRef={idx === 3 ? fourthRef : undefined}
                />
            ))}

            <AnimatePresence>
                {showMore && (
                    <motion.div
                        initial={{ opacity: 0, y: 80 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 80 }}
                        transition={{ duration: 0.2, ease: "easeIn" }}
                    >
                        {food.slice(4).map((item, idx) => (
                            <FoodMenuItem
                                key={item.number}
                                number={item.number}
                                title={item.title}
                                description={item.description}
                                img={item.img}
                                href={item.href}
                                bigger={item.bigger}
                                reverse={item.reverse}
                                forwardRef={idx === 0 ? fifthRef : undefined}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {!showMore && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShowMore}
                    className="cursor-pointer mt-22 mb-12 flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#ffbc52] to-[#b45309] text-white font-semibold shadow-lg text-sm sm:text-base sm:mt-10 sm:mb-18 md:mt-12 md:mb-20 lg:text-lg"
                >
                    More <span className="text-lg sm:text-xl">↓</span>
                </motion.button>
            )}

            {showMore && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShowLess}
                    className="cursor-pointer mt-22 mb-12 flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#b45309] to-[#ffbc52] text-white font-semibold shadow-lg text-sm sm:text-base sm:mt-10 sm:mb-18 md:mt-12 md:mb-20 lg:text-lg"
                >
                    Show Less <span className="text-lg sm:text-xl">↑</span>
                </motion.button>
            )}
        </div>
    )
}
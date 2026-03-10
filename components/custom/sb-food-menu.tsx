"use client"

import React, { ReactNode, Ref, useRef, useState } from "react"
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from "framer-motion"
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
        img: `${CLOUD}/v1773106913/ramen_wlyath.png`,
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
        img: `${CLOUD}/v1773106249/carbonara_bperbg.png`,
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
        img: `${CLOUD}/v1773106054/buns-burger_fwvi73.png`,
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
        img: `${CLOUD}/v1773105918/fries_n4e92h.png`,
        href: "/menu/cheese-fries",
        bigger: false,
        reverse: true
    },
    {
        number: 5,
        title: "Crunch Serve Nachos",
        description: (
            <>
                Crispy <span className="text-[#ffbc52] font-semibold">nachos</span> topped with melted cheese, jalapeños, and our special sauce.
            </>
        ),
        img: `${CLOUD}/v1773105666/nachos_gj1o07.png`,
        href: "/menu/crunch-serve-nachos",
        bigger: true,
        reverse: true
    }
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
        // offset: ["start 80%", "end 20%"],
        offset: ["start 90%", "end 10%"],
    })

    const yTextRaw = useTransform(scrollYProgress, [0, 1], [40, 0])
    const yImgRaw = useTransform(scrollYProgress, [0, 1], ["-10%", "0%"])
    const rotateImgRaw = useTransform(scrollYProgress, [0, 1], [-6, 0])
    const scaleImgRaw = useTransform(
        scrollYProgress,
        [0, 1],
        bigger ? [1.03, 1.1] : [0.97, 1]
    )

    const yText = useSpring(yTextRaw, { stiffness: 80, damping: 20 })
    const yImg = useSpring(yImgRaw, { stiffness: 80, damping: 20 })
    const rotateImg = useSpring(rotateImgRaw, { stiffness: 80, damping: 20 })
    const scaleImg = useSpring(scaleImgRaw, { stiffness: 80, damping: 20 })

    const getImageSize = () => {
        if (bigger) {
            return "w-[280px] h-[280px] lg:w-[400px] lg:h-[400px] xl:w-[500px] xl:h-[500px]"
        }
        return "w-[280px] h-[280px] lg:w-[350px] lg:h-[350px] xl:w-[450px] xl:h-[450px]"
    }

    return (
        <div
            ref={targetRef}
            className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:py-24 lg:py-32 scroll-mt-20 md:scroll-mt-32"
        >
            <motion.span
                style={{ y: yText }}
                className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 font-extrabold text-[8rem] xl:text-[10rem] select-none z-0 whitespace-nowrap pointer-events-none"
                initial={{ opacity: 0, x: reverse ? -80 : 80 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
            >
                {title}
            </motion.span>

            <div className={`relative z-10 flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-8 md:gap-12 lg:gap-16`}>

                <div className="w-full lg:w-1/2">
                    <motion.div
                        style={{ y: yText }}
                        className="relative bg-[#20140c]/90 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 text-white border border-white/10"
                        initial={{ opacity: 0, x: reverse ? 50 : -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <div className={`absolute -top-4 -left-4 sm:-top-5 sm:-left-5 md:-top-6 md:-left-6 lg:-top-8 lg:-left-8 
                            w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 
                            flex items-center justify-center rounded-full bg-gradient-to-br from-[#ffbc52] to-[#b45309] 
                            text-white font-bold text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl shadow-lg`}
                        >
                            {number}
                        </div>

                        {/* Title */}
                        <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold mb-4 sm:mb-5 md:mb-6 lg:mb-8 
                            bg-gradient-to-r from-[#fff8f0] to-[#fada8a] bg-clip-text text-transparent pr-4">
                            {title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 leading-relaxed mb-6 sm:mb-8 lg:mb-10">
                            {description}
                        </p>

                        {/* CTA Button - commented out but kept for consistency */}
                        {href && (
                            <Link href={href}>
                                <span className="inline-block px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 
                                    bg-gradient-to-r from-[#ffbc52] to-[#b45309] text-white rounded-full 
                                    font-semibold text-sm sm:text-base md:text-lg shadow-lg 
                                    hover:scale-105 transition-transform duration-200">
                                    See More →
                                </span>
                            </Link>
                        )}

                        {/* Decorative vertical line - hidden on small screens */}
                        <div className="hidden lg:block absolute -bottom-16 left-1/2 -translate-x-1/2">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#ffbc52]/50 to-[#b45309]/50 shadow-2xl" />
                            <div className="w-1 h-16 md:h-20 bg-gradient-to-b from-[#ffbc52]/50 to-[#b45309]/50 mx-auto mt-1" />
                        </div>
                    </motion.div>
                </div>

                {/* Image section */}
                <div className="w-full lg:w-1/2 flex justify-center items-center relative">
                    {/* Decorative background circles - responsive sizing */}
                    <div className="absolute w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 
                        rounded-full bg-gradient-to-br from-[#ffbc52]/20 to-[#b45309]/20 blur-xl sm:blur-2xl z-0" />
                    <div className="absolute w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 xl:w-80 xl:h-80 
                        rounded-full bg-gradient-to-br from-[#ffbc52]/10 to-[#b45309]/10 blur-lg z-0" />

                    <motion.div
                        style={{ y: yImg, rotate: rotateImg, scale: scaleImg }}
                        // className={`relative z-10 ${getImageSize()}`}
                        className={`relative z-10 ${getImageSize()} will-change-transform`}
                    >
                        <Image
                            src={img}
                            alt={title}
                            fill
                            sizes="(max-width: 640px) 180px, (max-width: 768px) 220px, (max-width: 1024px) 280px, (max-width: 1280px) 400px, 500px"
                            priority={number <= 2}
                            loading={number <= 2 ? "eager" : "lazy"}
                            className="object-contain drop-shadow-2xl"
                        />
                    </motion.div>
                </div>
            </div>

            {/* Mobile decorative line - only visible on small screens */}
            <div className="lg:hidden flex justify-center mt-12 sm:mt-16">
                <div className="flex flex-col items-center">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-[#ffbc52]/50 to-[#b45309]/50 shadow-2xl" />
                    <div className="w-1 h-12 sm:h-14 md:h-16 bg-gradient-to-b from-[#ffbc52]/50 to-[#b45309]/50 mt-1" />
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
        }, 100)
    }

    const handleShowLess = () => {
        setShowMore(false)
        setTimeout(() => {
            fourthRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
        }, 100)
    }

    return (
        <div className="relative w-full min-h-screen bg-gradient-to-r from-[#5c2d0c] via-[#7b3f0f] to-[#3a1b07] flex flex-col justify-start items-center overflow-hidden">
            {/* Animated background elements */}
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

            {/* First 4 items */}
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

            {/* Additional items with animation */}
            <AnimatePresence mode="wait">
                {showMore && (
                    <motion.div
                        key="more-items"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="w-full"
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

            {/* Buttons - responsive spacing */}
            <div className="w-full flex justify-center py-12 sm:py-16 md:py-20">
                {!showMore ? (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleShowMore}
                        className="cursor-pointer flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 
                            rounded-full bg-gradient-to-r from-[#ffbc52] to-[#b45309] 
                            text-white font-semibold text-sm sm:text-base shadow-lg
                            hover:shadow-xl transition-shadow"
                    >
                        More <span className="text-xl sm:text-2xl">↓</span>
                    </motion.button>
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleShowLess}
                        className="cursor-pointer flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 
                            rounded-full bg-gradient-to-r from-[#b45309] to-[#ffbc52] 
                            text-white font-semibold text-sm sm:text-base shadow-lg
                            hover:shadow-xl transition-shadow"
                    >
                        Show Less <span className="text-xl sm:text-2xl">↑</span>
                    </motion.button>
                )}
            </div>
        </div>
    )
}
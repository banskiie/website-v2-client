"use client"

import Footer from '@/components/custom/footer'
import Header from '@/components/custom/header'
import { CLOUD } from '@/components/custom/main-faq'
import ScrollIndicator from '@/components/custom/scroll-indicator'
import FloatingChatWidget from '@/components/custom/ticket'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import useSmoothScroll from '@/hooks/useSmoothScroll'
import { AnimatePresence, motion } from 'framer-motion'
import { Badge, Clock, Map, MapPin, MouseIcon, Phone } from 'lucide-react'
import Image from 'next/image'
import React, { useCallback, useEffect, useState } from 'react'

const courtFiles = [
    "v1764121318/court-1_vj1uxt.png",
    "v1764121322/court-2_cqiygl.png",
    "v1764121324/court-3_mu0wnq.png",
    "v1764121326/court-4_vfiy0e.png",
    "v1764121329/court-5_e2as1g.png",
    "v1764121331/court-6_mrxr9z.png",
    "v1764121333/court-7_f1hovc.png",
    "v1764121335/court-8_q5cmcv.png",
    "v1764121339/court-9_k7k4nb.png",
    "v1764121317/court-10_jwx4ts.png",
    "v1764121319/court-11_pokcfw.png",
]

const badmintonCourts = courtFiles.map(file => ({
    image: `${CLOUD}/${file}`,
}))

const locations = [
    {
        name: "Kauswagan Court",
        img: `${CLOUD}/v1764120981/kauswagan_quoxl9.jpg`,
        hours: "6:00 AM - 12:00 AM",
        fields: 11,
        phone: "0917-123-4567",
        map: "C-ONE Trading Corporation, Zone 1, Rodolfo N. Pelaez St,. Kauswagan"
    },
    {
        name: "SM Uptown Court",
        img: `${CLOUD}/v1764120984/uptown_a1vgyb.png`,
        hours: "6:00 AM - 12:00 AM",
        fields: 2,
        phone: "0917-134-4695",
        map: "SM Uptown CDO (2nd Level, Main Maill Beside Cinema 3)"
    },
    {
        name: "Limketkai Mall Court",
        img: `${CLOUD}/v1764120982/limketkai_p27fd9.jpg`,
        hours: "10:00 AM - 12:00 AM",
        fields: 4,
        phone: "0917-134-4695",
        map: "Limketkai Mall, Cinema 2"

    },
]

const performanceEnhancers = [
    {
        title: 'Control',
        description:
            'Control in badminton refers to having the freedom to place your shots where you want. Good control translates into accurate shooting as a result.',
        image: `${CLOUD}/v1764121996/Control_nokrsg.png`,
    },
    {
        title: 'Strength',
        description:
            'Badminton also requires strength, which the player will be exerting power against resistance. One of the important components to increasing speed and power on the court is developing strength.',
        image: `${CLOUD}/v1764122001/Strength_mtvcse.png`,
    },
    {
        title: 'Mindplay',
        description:
            'Keep your thoughts active. Badminton undoubtedly is a mind game; it demands the player to think while playing. Your talents will improve as a result of developing your mental game.',
        image: `${CLOUD}/v1764121994/Mindplay_y5xm1m.png`,
    },
    {
        title: 'Movements',
        description:
            'In badminton, there are five main strokes: service, clear shot, drive shot, drop shot, and smash shot. Learning these motions is crucial if you want to advance your playing abilities.',
        image: `${CLOUD}/v1764121996/Movements_iwhy5r.png`,
    },
]

const tournamentData = [
    { src: `${CLOUD}/v1764122107/DSC_0030_f2i5vu.png`, alt: 'DSC_0030' },
    { src: `${CLOUD}/v1764122132/DSC_0036_myth54.png`, alt: 'DSC_0036' },
    { src: `${CLOUD}/v1764122110/DSC_0059_b7x9g9.png`, alt: 'DSC_0059' },
    { src: `${CLOUD}/v1764122156/DSC_0083_hqhxrq.png`, alt: 'DSC_0083' },
    { src: `${CLOUD}/v1764122114/DSC_0086_mqcyar.png`, alt: 'DSC_0086' },
    { src: `${CLOUD}/v1764122159/DSC_0160_dthuci.png`, alt: 'DSC_0160' },
    { src: `${CLOUD}/v1764122116/DSC_0204_xlimoe.png`, alt: 'DSC_0204' },
    { src: `${CLOUD}/v1764122121/DSC_0251_ufeahg.png`, alt: 'DSC_0251' },
    { src: `${CLOUD}/v1764122122/DSC_0263_wfcd5d.png`, alt: 'DSC_0263' },
    { src: `${CLOUD}/v1764122126/DSC_0303_rllzam.png`, alt: 'DSC_0303' },
    { src: `${CLOUD}/v1764122129/DSC_0304_ejyvpi.png`, alt: 'DSC_0304' },
    { src: `${CLOUD}/v1764122135/DSC_0341_c9gfrz.png`, alt: 'DSC_0341' },
    { src: `${CLOUD}/v1764122138/DSC_0351_nwz1kn.png`, alt: 'DSC_0351' },
    { src: `${CLOUD}/v1764122141/DSC_0363_yhvbgg.png`, alt: 'DSC_0363' },
    { src: `${CLOUD}/v1764122144/DSC_0683_w6ccfd.png`, alt: 'DSC_0683' },
    { src: `${CLOUD}/v1764122162/DSC_0694_w87da7.png`, alt: 'DSC_0694' },
    { src: `${CLOUD}/v1764122147/DSC_0892_mhvhv5.png`, alt: 'DSC_0892' },
    { src: `${CLOUD}/v1764122150/DSC_0954_qzy0tf.png`, alt: 'DSC_0954' },
    { src: `${CLOUD}/v1764122153/DSC_0968_mfd1gr.png`, alt: 'DSC_0968' },
]

function page() {
    useSmoothScroll()
    const [selectedCourt, setSelectedCourt] = useState<number | null>(null)
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
    const [showAll, setShowAll] = useState(false)

    const initialCount = 8
    const visibleData = showAll ? tournamentData : tournamentData.slice(0, initialCount)

    // const getRandomSize = () => {
    //     const size = [
    //         "h-64 md:h-72 lg:h-80 basis-1/3",
    //         "h-72 md:h-80 lg:h-96 basis-1/2",
    //         "h-56 md:h-64 lg:h-72 basis-1/4",
    //     ]
    //     return size[Math.floor(Math.random() * size.length)]
    // }

    const handlePrev = useCallback(() => {
        if (lightboxIndex !== null) {
            setLightboxIndex((lightboxIndex - 1 + tournamentData.length) % tournamentData.length)
        }
    }, [lightboxIndex])

    const handleNext = useCallback(() => {
        if (lightboxIndex !== null) {
            setLightboxIndex((lightboxIndex + 1) % tournamentData.length)
        }
    }, [lightboxIndex])

    // Keyboard navigation para sa next next
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxIndex !== null) {
                if (e.key === "ArrowLeft") handlePrev()
                if (e.key === "ArrowRight") handleNext()
                if (e.key === "Escape") setLightboxIndex(null)
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [lightboxIndex, handlePrev, handleNext])

    return (
        <div className="min-h-screen flex flex-col overflow-x-hidden">
            <Header />

            <div
                className="relative h-screen bg-fixed bg-center bg-cover"
                style={{
                    backgroundImage: `url('${CLOUD}/v1764116059/Background-Badminton_vmiblr.png')`,
                }}
            >
                <div className="absolute inset-0 bg-black/60"></div>

                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
                    <h1 className="text-white text-4xl md:text-6xl font-extrabold tracking-wide drop-shadow-lg">
                        Badminton Courts
                    </h1>

                    <p className="text-[#cfbe00] text-lg md:text-2xl font-semibold mt-4">
                        Serve, Smash, and Win!
                    </p>

                    <p className="text-gray-200 text-base md:text-lg max-w-2xl mt-6 leading-relaxed">
                        Come and play with your loved ones at the largest badminton court in
                        Cagayan de Oro City. With stunning surroundings and a large group of
                        players. Table tennis is also offered here. Book now at{" "}
                        <span className="font-semibold text-white">C-ONE Badminton Courts</span>.
                    </p>

                    <button
                        className="mt-8 px-6 py-3 bg-[#0c5c40] text-white rounded-lg shadow-lg hover:bg-green-700 transition-colors cursor-pointer"
                        onClick={() => {
                            const section = document.getElementById('court-rates');
                            if (section) {
                                section.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                    >
                        View Court Rates
                    </button>
                </div>
            </div>

            <section
                id="court-rates"
                className="flex flex-col lg:flex-row w-full h-auto lg:h-[400px] mb-1"
            >
                <div className="relative flex-1 min-h-[300px] md:min-h-[400px] lg:min-h-0 overflow-hidden cursor-pointer shadow-lg transition-all duration-900 ease-in-out hover:lg:flex-[2]">
                    <motion.div
                        className="absolute inset-0 overflow-hidden transform hover:scale-105"
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <Image
                            src={`${CLOUD}/v1764121340/Rubberized_Landscape_vi8wr0.png`}
                            alt="Rubberized Court"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/60 to-transparent"></div>
                    </motion.div>

                    <motion.div className="absolute inset-0 flex flex-col justify-center items-center lg:items-end text-center lg:text-right p-6 md:p-8 text-white space-y-3 md:space-y-4 z-10">
                        <motion.h3
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="text-2xl md:text-4xl lg:text-6xl font-semibold leading-tight"
                        >
                            Rubberized <br /> Court
                        </motion.h3>
                        <motion.p
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                            className="text-sm md:text-base max-w-md mt-2"
                        >
                            C-ONE Sports Center offers rubberized badminton courts. The rubberized
                            court prioritizes security, ease of use, and affordability. Rubberized
                            flooring offers a soft landing that helps prevent slipping.
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                            className="text-white font-semibold"
                        >
                            P190.00/hr
                        </motion.p>
                    </motion.div>
                </div>

                <div className="relative flex-1 min-h-[300px] md:min-h-[400px] lg:min-h-0 overflow-hidden cursor-pointer shadow-lg transition-all duration-900 ease-in-out hover:lg:flex-[2]">
                    <motion.div
                        className="absolute inset-0 overflow-hidden transform hover:scale-105"
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <Image
                            src={`${CLOUD}/v1764121345/Wood_Court_Landscape_x3uk9v.png`}
                            alt="Wooden Court"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/60 to-transparent"></div>
                    </motion.div>

                    <motion.div className="absolute inset-0 flex flex-col justify-center items-center lg:items-start text-center lg:text-left p-6 md:p-8 text-white space-y-3 md:space-y-4 z-10">
                        <motion.h3
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="text-2xl md:text-4xl lg:text-6xl font-semibold leading-tight mb-6 lg:mb-12"
                        >
                            Wooden <br /> Court
                        </motion.h3>

                        <motion.p
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                            className="text-sm md:text-base max-w-md"
                        >
                            C-ONE Sports Center offers wooden courts to provide cushion and soothe
                            shuttlers as they maneuver across the court to score points with smashes
                            and deft strokes.
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                            className="text-white font-semibold"
                        >
                            P250.00/hr
                        </motion.p>
                    </motion.div>
                </div>
            </section>


            <section className="relative py-12 px-4 sm:py-16 sm:px-8 md:py-20 md:px-12 lg:py-20 lg:px-16 mt-10 md:mt-16 lg:mt-20">
                <div className="absolute inset-0 z-0">
                    <Image
                        src={`${CLOUD}/v1764210392/carousel-3_jctyuh.png`}
                        alt="Background"
                        fill
                        className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/80"></div>
                </div>

                <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                    <div className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-1">
                        <motion.h2
                            className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4 sm:mb-5 md:mb-6 text-center lg:text-left"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            Badminton Essentials
                        </motion.h2>
                        <motion.p
                            className="text-xs sm:text-sm md:text-base text-white leading-relaxed text-center lg:text-left"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            Learn the core aspects that help elevate your badminton game, from skill to strategy. Improve your badminton performance by focusing on the fundamentals of the game—from footwork and racket control to match strategy and court awareness. Whether you&apos;re a beginner learning the basics or an experienced player sharpening your skills, our courts and facilities provide the perfect environment to train, compete, and enjoy the sport.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-x-6 sm:gap-x-10 md:gap-x-20 lg:gap-x-60 gap-y-8 sm:gap-y-10 col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-1">
                        {performanceEnhancers.map((enhancer, index) => (
                            <motion.div
                                key={index}
                                className="relative w-[250px] sm:w-[280px] md:w-[370px] mx-auto"
                                initial={{ opacity: 0, y: 60 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: index * 0.2 }}
                            >
                                <div className="relative w-full h-56 sm:h-68 md:h-90 overflow-hidden rounded-lg">
                                    <Image
                                        src={enhancer.image}
                                        alt={enhancer.title}
                                        fill
                                        className="object-cover w-full h-full"
                                    />
                                </div>

                                <motion.div
                                    className="relative mx-auto bg-[#002522] text-white px-3 sm:px-4 py-2 mt-[-20px] sm:mt-[-25px] cursor-pointer overflow-hidden h-10 lg:h-[50px]"
                                    style={{ width: "80%" }}
                                    whileHover={{ height: 180 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                >
                                    <h3 className="text-center text-sm sm:text-base md:text-xl mt-1 font-semibold">
                                        {enhancer.title}
                                    </h3>
                                    <motion.p
                                        className="text-center text-xs sm:text-sm mt-2 opacity-0"
                                        initial={{ opacity: 1 }}
                                        whileHover={{ opacity: 1 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                    >
                                        {enhancer.description}
                                    </motion.p>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative py-16 px-6 md:px-16 bg-gray-100">
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 w-25 h-16 bg-gray-100 rounded-t-full flex items-center justify-center">
                    <MouseIcon className="w-8 h-8 text-gray-600 animate-bounce" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 items-center max-w-8xl mx-auto">
                    <motion.div
                        className="text-center sm:text-center sm:mt-6 md:text-left lg:text-left sm:ml-0 md:ml-10 lg:ml-60"
                        initial={{ opacity: 0, x: -100 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold lg:text-start md:text-center text-center text-gray-800 mb-4">
                            C-ONE Badminton Courts
                        </h2>
                        <p className="text-lg text-gray-600 font-medium md:text-center lg:text-start text-center">
                            C-ONE <span className="text-[#cfbe00]">Sports</span> Center
                        </p>
                    </motion.div>

                    <motion.div
                        className="absolute lg:absolute sm:relative md:relative top-28 sm:top-0 md:top-0 right-0 h-[65%] sm:h-auto md:h-auto sm:w-full md:w-full lg:w-1/2 bg-[#002522]"
                        initial={{ opacity: 0, x: 100 }}
                        whileInView={{ opacity: 0.9, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    />

                    <div className="sm:ml-0 md:ml-4 lg:-ml-25">
                        <Carousel opts={{ loop: true, align: "start" }}>
                            <CarouselContent className="space-x-4 sm:space-x-6 md:space-x-10 lg:space-x-23">
                                {badmintonCourts.map((court, index) => (
                                    <CarouselItem
                                        key={index}
                                        className="pl-4 basis-1/1 sm:basis-1/2 md:basis-1/3"
                                    >
                                        <div className="w-full sm:w-full md:w-[115%] lg:w-[130%]">
                                            <motion.div
                                                className="
      relative 
      h-90 md:h-[28rem] lg:w-full lg:h-80 
      overflow-hidden cursor-pointer flex
    "
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                whileInView={{ opacity: 1, scale: 1 }}
                                                whileHover={{ scale: 1.05 }}
                                                viewport={{ once: true, amount: 0.2 }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                                onClick={() => setSelectedCourt(index)}
                                            >
                                                <Image
                                                    src={court.image}
                                                    alt={`Court ${index + 1}`}
                                                    width={1200}
                                                    height={800}
                                                    className="object-contain w-full h-full"
                                                />

                                                <p
                                                    className="
        hidden md:block
        absolute bottom-30 left-0 lg:bottom-2
        w-full bg-white text-black p-2 text-center font-medium h-10
        rounded-b-lg
      "
                                                >
                                                    Court {index + 1}
                                                </p>

                                            </motion.div>

                                            <p
                                                className="
      block md:hidden
      w-full bg-white text-black p-2 text-center font-medium h-10
      rounded-b-lg -mt-6
    "
                                            >
                                                Court {index + 1}
                                            </p>
                                        </div>


                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    </div>
                </div>

                {
                    selectedCourt !== null && (
                        <div
                            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
                            onClick={() => setSelectedCourt(null)}
                        >
                            <div
                                className="relative rounded-lg p-0 inline-block flex items-center justify-center"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    className="absolute cursor-pointer left-[-60px] top-1/2 transform -translate-y-1/2 
                     text-white text-3xl font-bold px-3 py-1 bg-black/50 rounded hover:bg-black/70"
                                    onClick={() =>
                                        setSelectedCourt(
                                            (selectedCourt - 1 + badmintonCourts.length) % badmintonCourts.length
                                        )
                                    }
                                >
                                    ‹
                                </button>

                                <div className="relative">
                                    <Image
                                        src={badmintonCourts[selectedCourt].image}
                                        alt={`Court ${selectedCourt + 1}`}
                                        width={1600}
                                        height={1080}
                                        className="object-contain rounded-lg border-4 border-white"
                                    />
                                    <p className="mt-4 text-lg font-semibold text-white text-center">
                                        C-ONE Badminton Court No. {selectedCourt + 1} ({selectedCourt + 1} /{" "}
                                        {badmintonCourts.length})
                                    </p>
                                    <button
                                        className="absolute top-2 right-2 text-white text-2xl font-bold cursor-pointer"
                                        onClick={() => setSelectedCourt(null)}
                                    >
                                        ×
                                    </button>
                                </div>

                                <button
                                    className="absolute cursor-pointer right-[-60px] top-1/2 transform -translate-y-1/2 
                     text-white text-3xl font-bold px-3 py-1 bg-black/50 rounded hover:bg-black/70"
                                    onClick={() =>
                                        setSelectedCourt((selectedCourt + 1) % badmintonCourts.length)
                                    }
                                >
                                    ›
                                </button>
                            </div>
                        </div>
                    )
                }
            </section >


            <section
                className="relative h-[400px] md:h-[600px] w-full bg-center bg-cover bg-fixed"
                style={{ backgroundImage: `url(${CLOUD}/v1764121317/court-10_jwx4ts.png)` }}
            >
                <div className="absolute inset-0 bg-black/30"></div>
            </section>

            <section className="relative py-16 px-6 md:px-12 lg:px-16 bg-[#002522] flex flex-col items-center overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <MapPin className="w-[300px] md:w-[350px] lg:w-[400px] h-[300px] md:h-[350px] lg:h-[400px] text-[#cfbe00]" />
                </div>

                <motion.h2
                    className="relative text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 flex items-center mb-10 md:mb-12 z-10"
                    initial={{ opacity: 0, y: -30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <MapPin className="w-6 h-6 md:w-6 md:h-6 mr-3 text-[#cfbe00]" />
                    <span className="text-white">Location</span>
                </motion.h2>

                <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 lg:gap-16 max-w-7xl z-10">
                    {locations.map((loc, index) => (
                        <motion.div
                            key={index}
                            className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col items-center w-full"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                        >
                            <div className="relative w-full h-56 md:h-72 lg:h-80 p-4">
                                <div className="relative w-full h-full rounded-lg overflow-hidden">
                                    <Image
                                        src={loc.img}
                                        alt={loc.name}
                                        fill
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            </div>

                            <h3 className="text-lg md:text-xl font-semibold text-gray-800 -mt-2">
                                {loc.name}
                            </h3>

                            <div className="flex items-center text-gray-600 mb-2 text-sm md:text-base">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>{loc.hours}</span>
                            </div>

                            <div className="w-full flex justify-between items-center px-4 md:px-6 py-3 md:py-4 border-t border-gray-200">
                                <div className="flex flex-col space-y-2 text-sm md:text-base">
                                    <div className="flex items-center text-gray-700">
                                        <Badge className="w-4 h-4 mr-2" /> {loc.fields} Courts
                                    </div>
                                    <div className="flex items-center text-gray-700">
                                        <Phone className="w-4 h-4 mr-2" /> {loc.phone}
                                    </div>
                                </div>
                                <div className="flex items-start text-gray-700 cursor-pointer text-xs md:text-sm leading-snug max-w-[160px] md:max-w-[200px]">
                                    <Map className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                    <span className="break-normal">{loc.map}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>




            {/* <section className="py-20 px-6 md:px-16 bg-gray-50">
                <motion.h2
                    className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12"
                    initial={{ opacity: 0, y: -30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    Last Tournament
                </motion.h2>

                <Carousel
                    opts={{
                        loop: true,
                        align: "start",
                    }}
                >
                    <CarouselContent className="space-x-6">
                        {tournamentData.map((item, index) => (
                            <CarouselItem
                                key={index}
                                className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                            >
                                <motion.div
                                    className="relative overflow-hidden rounded-xl shadow-lg cursor-pointer group"
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                >
                                    <Image
                                        src={item.src}
                                        alt={item.alt}
                                        width={500}
                                        height={500}
                                        className="object-cover w-full h-64 md:h-72 lg:h-80 transform group-hover:scale-105 transition-transform duration-500 rounded-xl"
                                    />
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <p className="text-white font-semibold text-center px-4">
                                            {item.alt}
                                        </p>
                                    </div>
                                </motion.div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    <CarouselPrevious>
                        <button className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70">
                            ‹
                        </button>
                    </CarouselPrevious>

                    <CarouselNext>
                        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70">
                            ›
                        </button>
                    </CarouselNext>
                </Carousel>
            </section> */}

            <section className="py-20 px-6 md:px-16 bg-gray-100">
                <motion.h2
                    className="text-3xl md:text-4xl tracking-widest font-bold text-[#002522] text-center mb-12"
                    initial={{ opacity: 0, y: -30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    TOURNAMENT
                </motion.h2>

                {/* Masonry Gallery */}
                <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 [column-fill:_balance]">
                    {visibleData.map((item, index) => (
                        <motion.div
                            key={index}
                            className="mb-6 break-inside-avoid relative overflow-hidden rounded-xl shadow-lg cursor-pointer group"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.6, delay: index * 0.05 }}
                            onClick={() => setLightboxIndex(index)}
                        >
                            <Image
                                src={item.src}
                                alt={item.alt}
                                width={600}
                                height={600}
                                className="w-full h-auto object-cover rounded-xl transform group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <p className="text-white font-semibold text-center px-4">
                                    {item.alt}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {tournamentData.length > initialCount && (
                    <div className="flex justify-center mt-10">
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="px-6 cursor-pointer py-2 bg-[#0c5c40] text-white rounded-lg shadow hover:bg-green-700 transition-colors"
                        >
                            {showAll ? "View Less" : "View More"}
                        </button>
                    </div>
                )}

                <AnimatePresence>
                    {lightboxIndex !== null && (
                        <motion.div
                            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            onClick={() => setLightboxIndex(null)}
                        >
                            <button
                                className="fixed top-6 left-6 text-white text-4xl font-bold z-[60]"
                                onClick={() => setLightboxIndex(null)}
                            >
                                ✕
                            </button>

                            <motion.div
                                className="relative flex flex-col items-center justify-center max-h-[90vh] px-6"
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Image
                                    src={tournamentData[lightboxIndex].src}
                                    alt={tournamentData[lightboxIndex].alt}
                                    width={1000}
                                    height={1000}
                                    className="max-h-[80vh] w-auto rounded-xl shadow-lg"
                                />
                                <p className="mt-4 text-lg text-white font-medium text-center">
                                    {tournamentData[lightboxIndex].alt} ({lightboxIndex + 1} / {tournamentData.length})
                                </p>
                            </motion.div>

                            <button
                                className="absolute cursor-pointer left-8 top-1/2 -translate-y-1/2 text-white text-5xl font-bold p-2 bg-black/40 rounded-full hover:bg-black/60"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handlePrev()
                                }}
                            >
                                ‹
                            </button>
                            <button
                                className="absolute cursor-pointer right-8 top-1/2 -translate-y-1/2 text-white text-5xl font-bold p-2 bg-black/40 rounded-full hover:bg-black/60"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleNext()
                                }}
                            >
                                ›
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>


            <Footer />
            <ScrollIndicator />
            <FloatingChatWidget />
        </div >
    )
}

export default page

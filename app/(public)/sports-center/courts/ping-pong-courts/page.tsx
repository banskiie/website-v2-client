"use client"

import Header from '@/components/custom/header'
import { CircleDollarSign, Facebook, Phone } from 'lucide-react'
import Image from 'next/image'
import React, { useRef } from 'react'
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion"
import Footer from '@/components/custom/footer'
import ScrollIndicator from '@/components/custom/scroll-indicator'
import FloatingChatWidget from '@/components/custom/ticket'

const table_tennis_courts = [
    "DSC_0034.png",
    "DSC_0036.png",
    "DSC_0037.png",
    "DSC_0042.png",
    "DSC_0045.png",
    "DSC_0052.png",
    "DSC_0055.png",
    "DSC_0062.png",
]
function page() {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], [0, -80]);

    const cardRef = useRef<HTMLDivElement>(null);
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);
    const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 20 });
    const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 20 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const rotateYVal = ((x / rect.width) - 0.5) * 20
        const rotateXVal = -((y / rect.height) - 0.5) * 20

        rotateX.set(rotateXVal);
        rotateY.set(rotateYVal);
    };

    const handleMouseLeave = () => {
        rotateX.set(0);
        rotateY.set(0);
    }
    return (

        <div className="min-h-screen flex flex-col overflow-hidden">
            <Header />

                <div
                    className="relative h-screen bg-fixed bg-center bg-cover"
                    style={{
                        backgroundImage: "url('/assets/img/sports-center/court/DSC_0052.png')",
                    }}
                >
                    <div className="absolute inset-0 bg-black/60"></div>

                    <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-white text-4xl md:text-6xl font-extrabold tracking-wide drop-shadow-lg"
                        >
                            Table Tennis
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="text-[#cfbe00] text-lg md:text-2xl font-semibold mt-4"
                        >
                            Serve, Smash, and Win!
                        </motion.p>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            className="text-gray-200 text-sm md:text-base max-w-3xl mt-6 leading-relaxed"
                        >
                            Table tennis, also known as <span className="italic">Ping-Pong</span>, is an indoor game
                            played on a flat table between two players. The goal is to hit the ball over the net
                            and bounce it to the other side of the table in a way that the opponent cannot return it.
                            This exciting and fast-paced sport is popular worldwide and now available at{" "}
                            <span className="font-semibold text-white">C-ONE Sports Center</span>.
                        </motion.p>

                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9, duration: 0.8 }}
                            className="mt-8 px-6 py-3 bg-[#0c5c40] text-white rounded-lg shadow-lg hover:bg-green-700 transition-colors cursor-pointer"
                            onClick={() => {
                                const section = document.getElementById('tb-rates');
                                if (section) section.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            View Court Rates
                        </motion.button>
                    </div>
                </div>


            <section
                id='tb-rates'
                className="py-20 px-6 md:px-16 bg-gray-100 overflow-x-visible relative"
            >
                <div className="relative max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                        <motion.div
                            className="relative w-[140%] lg:w-[150%] h-96 lg:h-[500px] group perspective-1000 -ml-20 lg:-ml-32 z-0"
                            style={{ y: y }}
                            ref={cardRef}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="absolute inset-0 border-4 border-[#cfbe00] rounded-xl -translate-x-2 -translate-y-2 shadow-xl transition-transform duration-500 group-hover:rotate-2 group-hover:-translate-x-1 group-hover:-translate-y-1"></div>
                            <div className="absolute inset-0 border-2 border-white rounded-xl translate-x-2 translate-y-2 shadow-lg transition-transform duration-500 group-hover:-rotate-2 group-hover:translate-x-1 group-hover:translate-y-1"></div>

                            <motion.div
                                className="relative w-full h-full rounded-xl overflow-hidden transform transition-transform duration-700"
                                style={{ rotateX: springRotateX, rotateY: springRotateY, transformPerspective: 1000 }}
                            >
                                <Image
                                    src="/assets/img/sports-center/court/DSC_0052.png"
                                    alt="Table Tennis Room"
                                    fill
                                    className="object-cover w-full h-full"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
                                <div className="absolute top-4 left-4 bg-[#cfbe00] text-black font-semibold px-3 py-1 rounded-full text-sm shadow">
                                    Fully Air-Conditioned
                                </div>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            className="relative z-10"
                            style={{ y: useTransform(y, [0, 1], [0, -30]) }}
                        >
                            <div className="bg-white/90 p-6 rounded-xl shadow-lg backdrop-blur-md">
                                <h2 className="text-xl md:text-2xl font-bold text-[#002522] mb-4">
                                    Avail Now for Our Table Tennis with Fully Air-Conditioned Room
                                </h2>
                                <p className="text-gray-600 mb-8 leading-relaxed">
                                    Come and play Table Tennis with C-ONE Sports Center&apos;s fully air-conditioned room.
                                    We have <span className="font-semibold">3 tables</span> and paddles available for you,
                                    your family, and friends to enjoy!
                                </p>

                                <div className="mb-6">
                                    <div className="flex items-center text-[#002522] font-base">
                                        <CircleDollarSign className="w-5 h-5 mr-2 text-[#0c5c40]" />
                                        Court Pricing
                                    </div>
                                    <p className="ml-7 text-sm font-base text-gray-800 font-medium">₱150.00 / HR</p>
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-center text-[#002522] font-base">
                                        <Phone className="w-5 h-5 mr-2 text-[#0c5c40]" />
                                        Contact Number
                                    </div>
                                    <p className="ml-7 text-sm text-gray-800 font-medium">+63 917-1344-695</p>
                                </div>

                                <div>
                                    <div className="flex items-center text-[#002522] font-base">
                                        <Facebook className="w-5 h-5 mr-2 text-[#0c5c40]" />
                                        Facebook Page
                                    </div>
                                    <p className="ml-7 text-sm font-medium text-gray-800">C-ONE Badminton Courts</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section
                className="relative h-screen bg-fixed bg-center bg-cover"
                style={{ backgroundImage: "url('/assets/img/courts/tbltennis/court/DSC_0062.png')" }}
            >
                <div className="absolute inset-0 bg-black/60"></div>

                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-6 md:px-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.8 }}
                        className="text-3xl md:text-5xl font-bold drop-shadow-lg"
                    >
                        Explore Our Table Tennis Courts
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="mt-4 max-w-2xl text-lg md:text-xl drop-shadow"
                    >
                        Enjoy professional-grade tables, fully air-conditioned rooms, and all the equipment you need for a great game.
                    </motion.p>

                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        onClick={() => {
                            const section = document.getElementById("table_courts");
                            if (section) section.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex items-center justify-center w-12 h-12 bg-[#0c5c40]/80 rounded-full text-white text-3xl animate-bounce shadow-lg hover:bg-[#0c5c40]/50 transition-all"
                        aria-label="Scroll to Table Courts"
                    >
                        &#x2193;
                    </motion.button>
                </div>
            </section>

            <section id="table_courts" className="py-20 px-6 md:px-16 bg-gray-100">
                <div className="max-w-7xl mx-auto">
                    <div className="text-3xl md:text-4xl font-bold text-center mb-12">
                        Table Tennis Courts
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {table_tennis_courts.map((img, index) => (
                            <motion.div
                                key={img}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                className="relative w-full h-64 rounded-xl overflow-hidden shadow-lg"
                            >
                                <Image
                                    src={`/assets/img/courts/tbltennis/court/${img}`}
                                    alt={img}
                                    fill
                                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>


            <Footer />
            <ScrollIndicator />
            <FloatingChatWidget />
        </div >

    )
}

export default page
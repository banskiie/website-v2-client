"use client"

import Footer from '@/components/custom/footer'
import Header from '@/components/custom/header-cs'
import ScrollIndicator from '@/components/custom/scroll-indicator'
import { BedDouble, Check, ChevronRight, RulerDimensionLine, Users2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Playfair_Display } from 'next/font/google'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import FloatingChatWidget from '@/components/custom/ticket'
import { CLOUD } from '@/components/custom/main-faq'

const images = [
    `${CLOUD}/v1764213470/_ALP7813_nggedx.jpg`,
    `${CLOUD}/v1764213380/_ALP7816_wlw409.jpg`,
    `${CLOUD}/v1764213469/_ALP7851_zirbpu.jpg`,
    `${CLOUD}/v1764213471/_ALP8910_ywql1u.jpg`,
    `${CLOUD}/v1764213471/_ALP8926_zd5ipu.jpg`,
    `${CLOUD}/v1764213380/_ALP9375_lmxrre.jpg`,
    `${CLOUD}/v1764213470/_ALP9378_n5k8yo.jpg`,
    `${CLOUD}/v1764213470/_ALP9379_hrh1j8.jpg`,
    `${CLOUD}/v1764213380/_ALP9390_vwpetm.jpg`,
    `${CLOUD}/v1764213469/_ALP9396_jgjo4i.jpg`,
    `${CLOUD}/v1764213380/_ALP9397_qzxzfm.jpg`,
    `${CLOUD}/v1764213418/_ALP9407_s8e69i.jpg`,
    `${CLOUD}/v1764213469/_ALP9412_h8zlyu.jpg`,
    `${CLOUD}/v1764213883/9418_suhlas.png`,
]

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] })

function Page() {
    const carouselRef = useRef<HTMLDivElement>(null)
    const innerRef = useRef<HTMLDivElement>(null)
    const [width, setWidth] = useState(0)

    useEffect(() => {
        if (carouselRef.current && innerRef.current) {
            const scrollWidth = innerRef.current.scrollWidth
            const containerWidth = carouselRef.current.offsetWidth
            setWidth(scrollWidth - containerWidth)
        }
    }, [])

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <section
                className="relative w-full min-h-screen bg-center bg-cover bg-fixed flex flex-col justify-center items-center text-white"
                style={{
                    backgroundImage: `url(${CLOUD}/v1764213380/_ALP9397_qzxzfm.jpg)`,
                }}
            >
                <div className="absolute inset-0 bg-black/40" />

                <nav className="absolute top-28 left-16 flex items-center text-gray-100 text-sm z-20">
                    <Link
                        href="/sports-center/"
                        className="hover:text-[#651b07] font-medium transition-colors"
                    >
                        Sports Center
                    </Link>
                    <ChevronRight className="w-4 h-4 mx-2 text-gray-200" />
                    <Link
                        href="/sports-center/courtside-suites/#accommodations"
                        className="hover:text-[#651b07] font-medium transition-colors"
                    >
                        Courtside-Suite
                    </Link>
                    <ChevronRight className="w-4 h-4 mx-2 text-gray-200" />
                    <span className="font-medium text-gray-100">Twin Bed Space</span>
                </nav>

                <div className="relative z-10 text-center px-4 sm:px-0 max-w-3xl">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">TWIN BED ROOM</h1>
                    <div className="border-b-2 border-[#e2d1cb] w-36 mx-auto mb-4" />
                    <p className="text-md sm:text-lg">
                        Experience comfort and luxury in our Twin Bed Room, designed to provide a peaceful and relaxing stay with exclusive amenities and elegant interiors.
                    </p>
                </div>
            </section>

            <section
                className="w-full h-[60vh] flex items-center overflow-x-hidden bg-gray-900 cursor-grab"
                ref={carouselRef}
            >
                <motion.div
                    ref={innerRef}
                    className="flex h-full"
                    drag="x"
                    dragConstraints={{ left: -width, right: 0 }}
                    whileTap={{ cursor: "grabbing" }}
                >
                    {images.map((img) => (
                        <div
                            key={img}
                            className="flex-shrink-0 w-80 h-80 sm:w-149 sm:h-149 snap-start relative overflow-hidden"
                        >
                            <Image
                                src={img}
                                alt="Twin Bed Room"
                                fill
                                className="object-cover"
                                priority={false}
                            />
                            <div className="absolute inset-0 bg-black/10"></div>
                        </div>
                    ))}
                </motion.div>
            </section>

            <section className="w-full bg-[#c7ab9a]/20 py-12">
                <div className="container mx-auto max-w-5xl space-y-8 text-white py-12">
                    <h2 className={`${playfair.className} text-5xl text-[#651b07]/80 font-bold`}>Single Room – Twin Bed</h2>

                    <div className="flex items-center gap-6 to-fontmedium">
                        <div className="flex items-center text-[#651b07]/80 gap-2"><Users2 className="w-5 h-5" />2-4 Guests</div>
                        <div className="flex items-center gap-2 text-[#651b07]/80"><RulerDimensionLine className="w-5 h-5" />32 m²</div>
                        <div className="flex items-center gap-2 text-[#651b07]/80"><BedDouble className="w-5 h-5" />Twin Bed</div>
                    </div>

                    <p className="text-[#651b07] font-medium tracking-wide leading-relaxed">
                        Relax in a modern twin bed room with elegant interiors, cozy bedding, and premium amenities. Ea sunt tempor dolor id do nisi est sint culpa in eiusmod sed aliqua elit nisi nulla mollit proident minim commodo aute elit ut mollit velit exercitation cillum quis sed dolore quis laboris nostrud exercitation magna anim aliquip exercitation est reprehenderit labore officia dolore eu non in do exercitation deserunt tempor aliqua enim esse ex deserunt magna in esse nostrud.
                    </p>

                    <div className="grid md:grid-cols-2 gap-12 mt-8">
                        <div>
                            <h3 className="text-2xl text-[#651b07] font-semibold mb-4">Room Features</h3>
                            <ul className="space-y-2 text-[#651b07]/80 font-normal">
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#651b07]/80" /> High-speed Wi-Fi</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#651b07]/80" /> Individual climate control</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#651b07]/80" /> 50-inch flat-screen TV</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#651b07]/80" /> Ergonomic workspace</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#651b07]/80" /> In-room safe</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#651b07]/80" /> Direct-dial phone</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#651b07]/80" /> Alarm clock, iron, and ironing board</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className={`${playfair.className} text-2xl font-semibold text-[#651b07] mb-4`}>Convenience Features</h3>
                            <ul className="space-y-2 text-[#651b07]/80 font-normal">
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#651b07]/80" /> Self check-in</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#651b07]/80" /> Free parking</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#651b07]/80" /> 24/7 security</li>
                            </ul>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <button className="mt-4 px-4 py-2 bg-[#651b07] text-white rounded hover:bg-[#651b07]/70 transition-colors cursor-pointer">
                                        Show More
                                    </button>
                                </DialogTrigger>

                                <DialogContent
                                    className="w-[95%] !max-w-3xl border-2 border-gray-300 rounded-lg p-6"
                                >
                                    <DialogHeader>
                                        <DialogTitle>About This Space</DialogTitle>
                                        <DialogDescription asChild>
                                            <div className="space-y-4 text-[#651b07]  overflow-y-auto max-h-[80vh] pr-2 pt-3">

                                                <div>
                                                    Welcome to our unique container house accommodation, designed for comfort and style! Perfectly located steps away from the bustling C-ONE Sports Center, it&apos;s an ideal retreat for athletes, sports enthusiasts, and spectators alike. A charming coffee shop nearby adds a touch of daily indulgence, offering fresh brews and tasty bites to complement your stay.
                                                </div>

                                                <div>
                                                    <strong>The space:</strong> Location: C-ONE Trading, Zone 1 Kauswagan, Cagayan de Oro City
                                                </div>

                                                <div>
                                                    <strong>What You&apos;ll Love About Your Stay:</strong>
                                                    <ul className="list-none pl-3 space-y-1 mt-2">
                                                        <li>🏡 Modern Industrial Design: Enjoy a chic and functional space with creative use of repurposed materials.</li>
                                                        <li>🏡 Comfortable Amenities: Relax in air-conditioned rooms with soft beds, free Wi-Fi, and a private bathroom.</li>
                                                        <li>🏡 Prime Location: Stay close to the action, with the sports center right next door and convenient access to local shops and restaurants.</li>
                                                    </ul>
                                                </div>

                                                <div>
                                                    Whether you&apos;re here for a competition, a concert, or just exploring the city, our container house offers a truly unique Airbnb experience. Book your stay now!
                                                </div>

                                                <div>
                                                    <strong>Amenities - Your stay includes:</strong>
                                                    <ul className="list-none pl-3 space-y-1 mt-2">
                                                        <li>✅ Comfortable Accommodations: Air-conditioned rooms with one queen-sized bed, and work desk.</li>
                                                        <li>✅ Private Bathroom: Equipped with a hot and cold shower, fresh towels, toiletries, and a hairdryer.</li>
                                                        <li>✅ Entertainment: Free high-speed Wi-Fi and a smart TV with Netflix access.</li>
                                                        <li>✅ Dining Options: Complimentary bottled water, coffee, and tea. The nearby coffee shop offers breakfast and all-day dining for guests.</li>
                                                        <li>✅ Free Parking: Overnight parking for registered guests only.</li>
                                                        <li>✅ Shuttle Service: Shuttle transport from reception to the guests&apos; unit.</li>
                                                        <li>✅ 5% Discount on all drinks at ShuttleBrew for registered and paid guests.</li>
                                                    </ul>
                                                </div>

                                                <div>
                                                    <strong>Convenience Features:</strong> Self check-in, free parking, and 24/7 security.
                                                </div>

                                                <div>
                                                    <strong>Nearby:</strong>
                                                    <ul className="list-none pl-3 space-y-1 mt-2">
                                                        <li>🚶 1 min. walk to ShuttleBrew and C-ONE Sports Center</li>
                                                        <li>🚗 10 min. drive to Savemore Supermarket</li>
                                                        <li>🚗 15 min. drive to Gaisano Mall / Centrio Mall / SM Downtown</li>
                                                        <li>🚗 15 min. drive to Divisoria</li>
                                                    </ul>
                                                </div>

                                                <div>
                                                    <strong>Guest access:</strong> Guests can access the entire space including shared spaces (hallway).
                                                </div>

                                                <div>
                                                    <strong>Other things to note - POLICIES:</strong>
                                                    <ul className="list-disc pl-5 space-y-1 mt-2">
                                                        <li>Check-in Time: 2:00 PM | Check-out Time: 12:00 NN</li>
                                                        <li>Early check-in / late check-out is subject to availability and may incur extra charges.</li>
                                                    </ul>
                                                </div>

                                            </div>
                                        </DialogDescription>
                                    </DialogHeader>
                                </DialogContent>
                            </Dialog>


                        </div>
                    </div>
                </div>
            </section>

            <section className="w-full bg-white py-12">
                <div className="container mx-auto text-center max-w-3xl">
                    <h2 className={`${playfair.className} text-2xl text-[#651b07] font-bold mb-4`}>
                        Why Choose Our Suites?
                    </h2>
                    <p className="text-[#651b07]/80 leading-relaxed">
                        From modern amenities to personalized service, we ensure every stay feels relaxing, safe, and memorable. Your comfort is our top priority.
                    </p>
                </div>
            </section>

            <section className="w-full bg-[#651b07] py-12">
                <div className="container mx-auto max-w-4xl text-center text-white space-y-6">
                    <h2 className={`${playfair.className} text-3xl font-bold`}>
                        For inquiries, please contact our Reservation Team
                    </h2>
                    <p className="text-lg text-[#e2d1cb]">
                        We’re happy to assist you with any questions or provide more details about this room.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-6">
                        <div className="flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#e2d1cb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2 5.5C2 4.12 3.12 3 4.5 3h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V8.5c0 .828-.672 1.5-1.5 1.5H7c0 4.694 3.806 8.5 8.5 8.5v-1.5c0-.828.672-1.5 1.5-1.5h2.086a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V19.5c0 1.38-1.12 2.5-2.5 2.5C9.492 22 2 14.508 2 5.5z" />
                            </svg>
                            <span className="text-lg font-medium">0917-129-5706</span>
                        </div>

                        <div className="hidden sm:block w-px h-8 bg-white/40"></div>

                        <div className="flex items-center gap-3">
                            <Image src="/assets/img/sports-center/suite/airbnb.png" alt="Airbnb" width={28} height={28} className="rounded" />
                            <Link href="https://www.airbnb.com/rooms/1440871946921101799" target="_blank" className="underline hover:text-[#e2d1cb] transition-colors text-lg font-medium">
                                Find us on Airbnb
                            </Link>
                        </div>
                    </div>

                    <p className="text-sm text-white/70 mt-4">
                        We look forward to welcoming you to our Twin Bed Room!
                    </p>
                </div>
            </section>

            <Footer />
            <ScrollIndicator />
            <FloatingChatWidget />
        </div>
    )
}

export default Page

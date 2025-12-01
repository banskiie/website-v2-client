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
    `${CLOUD}/v1764214331/_ALP5384_hkuvdx.jpg`,
    `${CLOUD}/v1764214330/_ALP5387_kijnk6.jpg`,
    `${CLOUD}/v1764214334/_ALP5415_rq3ilw.jpg`,
    `${CLOUD}/v1764214332/_ALP5438_mxem1m.jpg`,
    `${CLOUD}/v1764214333/_ALP5440_almsfx.jpg`,
    `${CLOUD}/v1764214335/_ALP5448_lsmuk1.jpg`,
    `${CLOUD}/v1764214330/_ALP5453_pycmnw.jpg`,
    `${CLOUD}/v1764214331/_ALP9421_cjj7se.jpg`,
    `${CLOUD}/v1764214331/_ALP9448_d97bqg.jpg`,
    `${CLOUD}/v1764214332/_ALP9452_gw4kgw.jpg`,
    `${CLOUD}/v1764214332/_ALP9455_xgpxso.jpg`,
]

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] })

function Page() {
    const carouselRef = useRef<HTMLDivElement>(null)
    const innerRef = useRef<HTMLDivElement>(null)
    const [width, setWidth] = useState(0)

    useEffect(() => {
        const updateWidth = () => {
            if (carouselRef.current && innerRef.current) {
                const scrollWidth = innerRef.current.scrollWidth
                const containerWidth = carouselRef.current.offsetWidth
                setWidth(scrollWidth - containerWidth)
            }
        }

        updateWidth()
        window.addEventListener('resize', updateWidth)
        
        return () => window.removeEventListener('resize', updateWidth)
    }, [])

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            {/* Hero Section */}
            <section
                className="relative w-full min-h-screen bg-center bg-cover bg-fixed flex flex-col justify-center items-center text-white"
                style={{
                    backgroundImage: `url(${CLOUD}/v1764214334/_ALP5415_rq3ilw.jpg)`,
                }}
            >
                <div className="absolute inset-0 bg-black/40" />

                {/* Breadcrumb Navigation */}
                <nav className="absolute top-28 left-4 sm:left-8 lg:left-16 flex items-center text-gray-100 text-sm z-20 flex-wrap gap-1">
                    <Link
                        href="/sports-center/"
                        className="hover:text-[#651b07] font-medium transition-colors text-xs sm:text-sm"
                    >
                        Sports Center
                    </Link>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2 text-gray-200" />
                    <Link
                        href="/sports-center/courtside-suites/#accommodations"
                        className="hover:text-[#651b07] font-medium transition-colors text-xs sm:text-sm"
                    >
                        Courtside-Suite
                    </Link>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2 text-gray-200" />
                    <span className="font-medium text-gray-100 text-xs sm:text-sm">Single Bed Space</span>
                </nav>

                <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">SINGLE BED ROOM</h1>
                    <div className="border-b-2 border-[#e2d1cb] w-24 sm:w-36 mx-auto mb-4 sm:mb-6" />
                    <p className="text-sm sm:text-base lg:text-lg leading-relaxed">
                        Experience comfort and luxury in our Single Bed Room, designed to provide a peaceful and relaxing stay with exclusive amenities and elegant interiors.
                    </p>
                </div>
            </section>

            <section
                className="w-full h-[40vh] sm:h-[50vh] lg:h-[60vh] flex items-center overflow-x-hidden bg-gray-900 cursor-grab"
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
                            className="flex-shrink-0 w-64 h-64 sm:w-96 sm:h-96 lg:w-149 lg:h-149 snap-start relative overflow-hidden"
                        >
                            <Image
                                src={img}
                                alt="Single Bed Room"
                                fill
                                className="object-cover"
                                priority={false}
                                sizes="(max-width: 640px) 256px, (max-width: 1024px) 384px, 596px"
                            />
                            <div className="absolute inset-0 bg-black/10"></div>
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* Room Details Section */}
            <section className="w-full bg-[#c7ab9a]/20 py-8 sm:py-12 lg:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl space-y-6 sm:space-y-8 text-white py-8 sm:py-12">
                    <h2 className={`${playfair.className} text-3xl sm:text-4xl lg:text-5xl text-[#651b07]/80 font-bold`}>
                        Single Room – Twin Bed
                    </h2>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-sm sm:text-base">
                        <div className="flex items-center text-[#651b07]/80 gap-2">
                            <Users2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>2 Guests</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#651b07]/80">
                            <RulerDimensionLine className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>32 m²</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#651b07]/80">
                            <BedDouble className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>1 Twin Bed</span>
                        </div>
                    </div>

                    <p className="text-[#651b07] font-medium tracking-wide leading-relaxed text-sm sm:text-base">
                        Relax in a modern single room with elegant interiors, cozy bedding, and premium amenities. Ea sunt tempor dolor id do nisi est sint culpa in eiusmod sed aliqua elit nisi nulla mollit proident minim commodo aute elit ut mollit velit exercitation cillum quis sed dolore quis laboris nostrud exercitation magna anim aliquip exercitation est reprehenderit labore officia dolore eu non in do exercitation deserunt tempor aliqua enim esse ex deserunt magna in esse nostrud.
                    </p>

                    <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 mt-6 sm:mt-8">
                        <div>
                            <h3 className="text-xl sm:text-2xl text-[#651b07] font-semibold mb-3 sm:mb-4">Room Features</h3>
                            <ul className="space-y-2 text-[#651b07]/80 font-normal text-sm sm:text-base">
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#651b07]/80 flex-shrink-0" /> High-speed Wi-Fi</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#651b07]/80 flex-shrink-0" /> Individual climate control</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#651b07]/80 flex-shrink-0" /> 50-inch flat-screen TV</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#651b07]/80 flex-shrink-0" /> Ergonomic workspace</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#651b07]/80 flex-shrink-0" /> In-room safe</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#651b07]/80 flex-shrink-0" /> Direct-dial phone</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#651b07]/80 flex-shrink-0" /> Alarm clock, iron, and ironing board</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className={`${playfair.className} text-xl sm:text-2xl font-semibold text-[#651b07] mb-3 sm:mb-4`}>
                                Convenience Features
                            </h3>
                            <ul className="space-y-2 text-[#651b07]/80 font-normal text-sm sm:text-base">
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#651b07]/80 flex-shrink-0" /> Self check-in</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#651b07]/80 flex-shrink-0" /> Free parking</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#651b07]/80 flex-shrink-0" /> 24/7 security</li>
                            </ul>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <button className="mt-4 px-4 py-2 bg-[#651b07] text-white rounded hover:bg-[#651b07]/70 transition-colors cursor-pointer text-sm sm:text-base">
                                        Show More
                                    </button>
                                </DialogTrigger>

                                <DialogContent
                                    className="w-[95vw] sm:max-w-2xl lg:max-w-3xl border-2 border-gray-300 rounded-lg p-4 sm:p-6 max-h-[90vh] overflow-hidden"
                                >
                                    <DialogHeader>
                                        <DialogTitle className="text-lg sm:text-xl">About This Space</DialogTitle>
                                        <DialogDescription asChild>
                                            <div className="space-y-4 text-[#651b07] overflow-y-auto max-h-[60vh] sm:max-h-[70vh] pr-2 pt-3 text-sm sm:text-base">

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

            {/* Why Choose Section */}
            <section className="w-full bg-white py-8 sm:py-12 lg:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
                    <h2 className={`${playfair.className} text-xl sm:text-2xl lg:text-3xl text-[#651b07] font-bold mb-3 sm:mb-4`}>
                        Why Choose Our Suites?
                    </h2>
                    <p className="text-[#651b07]/80 leading-relaxed text-sm sm:text-base">
                        From modern amenities to personalized service, we ensure every stay feels relaxing, safe, and memorable. Your comfort is our top priority.
                    </p>
                </div>
            </section>

            {/* Contact Section */}
            <section className="w-full bg-[#651b07] py-8 sm:py-12 lg:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center text-white space-y-4 sm:space-y-6">
                    <h2 className={`${playfair.className} text-xl sm:text-2xl lg:text-3xl font-bold`}>
                        For inquiries, please contact our Reservation Team
                    </h2>
                    <p className="text-base sm:text-lg text-[#e2d1cb]">
                        We're happy to assist you with any questions or provide more details about this room.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-4 sm:mt-6">
                        <div className="flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6 text-[#e2d1cb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2 5.5C2 4.12 3.12 3 4.5 3h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V8.5c0 .828-.672 1.5-1.5 1.5H7c0 4.694 3.806 8.5 8.5 8.5v-1.5c0-.828.672-1.5 1.5-1.5h2.086a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V19.5c0 1.38-1.12 2.5-2.5 2.5C9.492 22 2 14.508 2 5.5z" />
                            </svg>
                            <span className="text-base sm:text-lg font-medium">0917-129-5706</span>
                        </div>

                        <div className="hidden sm:block w-px h-6 sm:h-8 bg-white/40"></div>

                        <div className="flex items-center gap-3">
                            <Image 
                                src="/assets/img/sports-center/suite/airbnb.png" 
                                alt="Airbnb" 
                                width={24} 
                                height={24} 
                                className="rounded sm:w-7 sm:h-7"
                            />
                            <Link 
                                href="https://www.airbnb.com/rooms/1440871946921101799" 
                                target="_blank" 
                                className="underline hover:text-[#e2d1cb] transition-colors text-base sm:text-lg font-medium"
                            >
                                Find us on Airbnb
                            </Link>
                        </div>
                    </div>

                    <p className="text-xs sm:text-sm text-white/70 mt-3 sm:mt-4">
                        We look forward to welcoming you to our Single Bed Room!
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
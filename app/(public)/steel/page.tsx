"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { ArrowRight, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ScrollIndicator from "@/components/custom/scroll-indicator"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Link from "next/link"
import Footer from "@/components/custom/footer"
import Header from "@/components/custom/header"
import FloatingTicketing from "@/components/custom/ticket"
import useSmoothScroll from "@/hooks/useSmoothScroll"
import VisitUsSection from "@/components/custom/visit-us-main"
import { Button } from "@/components/ui/button"
import { CLOUD } from "@/components/custom/main-faq"

const locations = [
  {
    text: "Zone 1 Kauswagan, Cagayan De Oro City",
  },
  {
    text: "Zone 1 Taytay El Salvador City, Misamis Oriental",
  },
]

const ads = [
  `${CLOUD}/v1764039737/ad1_zbepfj.png`,
  `${CLOUD}/v1764039736/ad2_bznq3q.png`,
  `${CLOUD}/v1764039737/ad3_d5yk6g.png`,
]

const faqs = [
  {
    title: "Uncompromising Quality",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    title: "Customized Services",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    title: "Reliable Delivery",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    title: "Customer-Centric Approach",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    title: "Industry Expertise",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
];

const categories = [
  {
    title: "Steel Products",
    image: `${CLOUD}/v1764048783/category1_yoc2vi.png`,
    description:
      "Producing High Quality Steel products since 2013. One of the Leading Steel Manufacturers in Mindanao. C-ONE Steel has been committed to Provide High Quality Products with Affordable cost.",
  },
  {
    title: "Roofing Access",
    image: `${CLOUD}/v1764048786/category2_vqmsvd.png`,
    description:
      "Producing High Quality Steel products since 2013. One of the Leading Steel Manufacturers in Mindanao. C-ONE Steel has been committed to Provide High Quality Products with Affordable cost.",
  },
  {
    title: "Metal Roofing",
    image: `${CLOUD}/v1764048790/category3_ktqtae.png`,
    description:
      "Producing High Quality Steel products since 2013. One of the Leading Steel Manufacturers in Mindanao. C-ONE Steel has been committed to Provide High Quality Products with Affordable cost.",
  },
]

const categoryRoutes: Record<string, string> = {
  "Steel Products": "/steel/products/steelProducts",
  "Roofing Access": "/steel/products/RoofingAccess",
  "Metal Roofing": "/steel/products/metalRoofing",
}

const infinteLocations = [...locations, ...locations, ...locations, ...locations]
export default function Page() {
  useSmoothScroll()
  // const currentYear = new Date().getFullYear()
  // const [isOpen, setIsOpen] = useState(false)
  const [_scrolled, setScrolled] = useState(false)
  const [activeCategory, setActiveCategory] = useState(0)
  const [openItem, setOpenItem] = useState<string | undefined>(undefined)
  const [activeAd, setActiveAd] = useState(0)
  const [loading, setLoading] = useState(true)
  const [hoveredPanel, setHoveredPanel] = useState<'left' | 'right' | null>(null)
  // const [isCompanyOpen, setIsCompanyOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAd((prev) => (prev + 1) % ads.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight - 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [])

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-6 border-[#2FB44D] border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header />

      <div id="steel-categories" className="relative w-full h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={`${CLOUD}/v1764039904/swiper1_rhirnr.png`}
            alt="C-ONE Steel Hero"
            fill
            loading="lazy"
            className="object-cover object-top"
            blurDataURL={`${CLOUD}/v1764039904/swiper1_rhirnr.png`}
          />
        </motion.div>

        <div className="absolute inset-0 bg-[#010101]/50"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
          className="relative z-10 text-center max-w-2xl px-4"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            C-ONE STEEL
          </h1>
          <p className="text-white text-sm lg:text-lg mb-8 leading-relaxed">
            {/* Looking for reliable steel products at great value? You’ve found it
            with C-ONE! Browse a wide selection of premium-quality
            steel—available in many stunning colors and customizable in size—
            designed to bring your vision to life while keeping your budget
            intact. */}
            Searching for Steel Products? We have your back. <span className="font-bold text-green-300">
              C-ONE</span> Offers the Best Pricing and STEELS of the
            Highest Quality for All your Demands. You havve Access to a Large
            Assortment of Steel Prodfucts. You can choose from a Variety of
            Colors to Suit your Preferences.
          </p>
          <p className="text-white text-sm lg:text-lg mb-6 leaeding-relaxed tracking-wide">
            "The <span className="font-bold">BEST STEEL</span> Builds more than Structures — <span className="font-bold text-green-300">IT BUILDS LEGACIES</span>"</p>
          <Button
            onClick={() =>
              window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
            }
            className="
    px-5 py-2
    text-sm
    lg:px-8 lg:py-3
    rounded-[25px]
    border border-white
    bg-[#211A1A]/80
    text-white font-medium
    cursor-pointer
    transition-transform duration-300 ease-in-out
    hover:scale-105
  "
          >
            Explore Steel
          </Button>
        </motion.div>

        <Button
          className="
    absolute bottom-6 left-1/2 -translate-x-1/2
    w-12 h-12
    rounded-full
    bg-[#2FB44D]!
    cursor-pointer
    flex items-center justify-center
    shadow-lg

    hover:bg-[#25993E]

    transition-transform duration-300 ease-in-out
    hover:scale-110

    animate-bounce
  "
          onClick={() =>
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </Button>
      </div>

      <div className="w-full h-[77px] overflow-hidden bg-white flex items-center">
        <div className="animate-marquee whitespace-nowrap flex">
          <motion.div
            className="flex items-center gap-16 w-max"
            animate={{ x: ["0%", "-24%"] }}
            transition={{
              duration: 20,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            {infinteLocations.map((loc, idx) => (
              <span key={idx} className="mx-12 text-black text-lg font-medium">
                {loc.text}
              </span>
            ))}</motion.div>
        </div>
      </div>


      <div
        id="steel-products"
        className="relative w-full min-h-screen lg:h-screen flex overflow-hidden"
      >
        <div className="flex h-full w-full">
          <motion.div
            className="relative cursor-pointer overflow-hidden"
            initial={{ width: "50%" }}
            animate={{
              width: hoveredPanel === "left" ? "60%" : hoveredPanel === "right" ? "40%" : "50%"
            }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            onMouseEnter={() => setHoveredPanel("left")}
            onMouseLeave={() => setHoveredPanel(null)}
            onClick={() => {
              const roofingAccessIndex = categories.findIndex(cat =>
                cat.title === "Roofing Access"
              );
              if (roofingAccessIndex !== -1) setActiveCategory(roofingAccessIndex);
            }}
          >
            <motion.div
              className="absolute inset-0"
              animate={{
                scale: hoveredPanel === "left" ? 1.1 : 1
              }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <Image
                src={categories[1]?.image || "/default-roofing-access.jpg"}
                alt="Roofing Access"
                fill
                className="object-cover"
                loading="lazy"
                sizes="50vw"
              />
            </motion.div>

            <div className={`absolute inset-0 bg-gradient-to-br from-slate-700/90 to-slate-900/90 transition-opacity duration-500 ${hoveredPanel === "left" ? "opacity-70" : "opacity-80"
              }`} />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20">
              <motion.div
                className="text-center max-w-md px-4"
                animate={{
                  y: hoveredPanel === "left" ? 0 : 20
                }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                  <span className="block">STEEL</span>
                  <span className="block">PRODUCTS</span>
                </h2>
                <motion.p
                  className="text-white/85 mb-4 text-sm md:text-base"
                  animate={{
                    opacity: hoveredPanel === "left" ? 1 : 0.7
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {categories[1]?.description || "Producing High Quality Steel products since 2013."}
                </motion.p>
                <motion.div
                  animate={{
                    opacity: hoveredPanel === "left" ? 1 : 0,
                    y: hoveredPanel === "left" ? 0 : 10
                  }}
                  transition={{ duration: 0.3, delay: hoveredPanel === "left" ? 0.1 : 0 }}
                >
                  <Link
                    href={`${categoryRoutes["Steel Products"] || "/products"}?category=Steel+Products`}
                  >
                    <motion.button
                      className="group inline-flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 rounded-full transition-all duration-300 hover:gap-3 hover:bg-white/95 text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Explore Products
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </motion.button>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="relative cursor-pointer overflow-hidden"
            initial={{ width: "50%" }}
            animate={{
              width: hoveredPanel === "right" ? "60%" : hoveredPanel === "left" ? "40%" : "50%"
            }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            onMouseEnter={() => setHoveredPanel("right")}
            onMouseLeave={() => setHoveredPanel(null)}
            onClick={() => {
              const metalRoofingIndex = categories.findIndex(cat =>
                cat.title === "Metal Roofing"
              );
              if (metalRoofingIndex !== -1) setActiveCategory(metalRoofingIndex);
            }}
          >
            <motion.div
              className="absolute inset-0"
              animate={{
                scale: hoveredPanel === "right" ? 1.1 : 1
              }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <Image
                src={categories[2]?.image || "/default-metal-roofing.jpg"}
                alt="Metal Roofing"
                fill
                className="object-cover"
                loading="lazy"
                sizes="50vw"
              />
            </motion.div>

            <div className={`absolute inset-0 bg-gradient-to-br from-slate-700/90 to-slate-900/90 transition-opacity duration-500 ${hoveredPanel === "right" ? "opacity-70" : "opacity-80"
              }`} />

            {/* CENTERED CONTENT - Right Panel */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20">
              <motion.div
                className="text-center max-w-md px-4"
                animate={{
                  y: hoveredPanel === "right" ? 0 : 20
                }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-3xl lg:text-5xl font-bold mb-2">
                  <span className="block">PPGL</span>
                  <span className="block">PRODUCTS</span>
                </h2>
                <motion.p
                  className="text-white/85 mb-4 text-sm md:text-base"
                  animate={{
                    opacity: hoveredPanel === "right" ? 1 : 0.7
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {categories[2]?.description || "Producing High Quality Steel products since 2013."}
                </motion.p>
                <motion.div
                  animate={{
                    opacity: hoveredPanel === "right" ? 1 : 0,
                    y: hoveredPanel === "right" ? 0 : 10
                  }}
                  transition={{ duration: 0.3, delay: hoveredPanel === "right" ? 0.1 : 0 }}
                >
                  <Link
                    href={`${categoryRoutes["Metal Roofing"] || "/products"}?category=Metal+Roofing`}
                  >
                    <motion.button
                      className="group inline-flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 rounded-full transition-all duration-300 hover:gap-3 hover:bg-white/95 text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Explore Products
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </motion.button>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="absolute top-8 md:top-12 lg:top-16 left-1/2 transform -translate-x-1/2 z-30 text-center w-full max-w-3xl px-6 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-lg lg:text-[34px] font-medium tracking-wide text-white">
              {categories[0]?.title || "Steel Products"}
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto opacity-50"></div>
            <p className="text-white/90 mt-4 max-w-2xl mx-auto text-sm">
              {categories[0]?.description.split(". ")[0] || "Premium quality steel solutions for every industrial need"}
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-6 left-1/4 transform -translate-x-1/2 z-30">
          {activeCategory === 1 && (
            <div className="h-1 w-24 md:w-32 bg-green-500 rounded-full"></div>
          )}
        </div>

        <div className="absolute bottom-6 right-1/4 transform translate-x-1/2 z-30">
          {activeCategory === 2 && (
            <div className="h-1 w-24 md:w-32 bg-green-500 rounded-full"></div>
          )}
        </div>
      </div>

      <div className="w-full bg-[#F4F3EE] py-20 px-6 md:px-12">
        <motion.div
          className="w-full bg-[#F4F3EE] py-20 px-6 md:px-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
        >
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <motion.div
              className="flex flex-col items-center md:items-start text-center md:text-left"
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
              }}
            >
              <motion.div
                className="flex items-center space-x-3 mb-6"
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
                }}
              >
                <div className="w-6 h-6 lg:w-8 lg:h-8 relative">
                  <Image
                    src="/message-pending-svgrepo-com.svg"
                    alt="Message Icon"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-black text-base lg:text-lg font-semibold">FAQ</span>
              </motion.div>

              <motion.h2
                className="text-2xl lg:text-4xl font-bold text-black mb-4"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                }}
              >
                Got Questions? We have Got Answers!
              </motion.h2>

              <motion.p
                className="text-sm lg:text-lg text-black/80 lg:max-w-xl mb-10"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } },
                }}
              >
                Your Questions about our Steel Products and Services and Learn More about C-ONE
              </motion.p>

              <motion.div
                className="w-full max-w-xl"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
                }}
              >
                <Accordion
                  type="single"
                  collapsible
                  value={openItem}
                  onValueChange={(val) => setOpenItem(val)}
                >
                  {faqs.map((faq, idx) => {
                    const value = `item-${idx}`;
                    const isOpen = openItem === value;

                    return (
                      <AccordionItem key={idx} value={value}>
                        <AccordionTrigger className="flex justify-between items-center lg:text-lg text-base font-medium text-black [&>svg]:hidden cursor-pointer">
                          <span className="text-base">{faq.title}</span>
                          <span className="ml-auto flex">
                            {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="text-black/80 text-sm lg:text-base">{faq.content}</AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              </motion.div>
            </motion.div>

            <motion.div
              className="flex justify-center md:justify-end relative"
              variants={{
                hidden: { opacity: 0, x: 40 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.6, ease: "easeOut" },
                },
              }}
            >
              <div className="w-full max-w-[900px] h-[220px] sm:h-[350px] md:h-[450px] lg:h-[528px] overflow-hidden rounded-xl shadow-md">
                <Image
                  src={`${CLOUD}/v1764048783/category1_yoc2vi.png`}
                  alt="Steel Category"
                  width={900}
                  height={900}
                  className="object-cover w-full h-full"
                  loading="lazy"
                  blurDataURL={`${CLOUD}/v1764048783/category1_yoc2vi.png`}
                />
              </div>

              <div className="absolute flex gap-3 sm:gap-4 right-1/2 translate-x-1/2 md:translate-x-0 md:right-0 top-full -mt-10 sm:-mt-12 md:-mt-16">
                <motion.div
                  className="w-[100px] h-[120px] sm:w-[110px] sm:h-[130px] md:w-[124px] md:h-[145px] bg-black flex flex-col items-start justify-center shadow-lg rounded-md p-3"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5, delay: 0.1 },
                    },
                  }}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mb-2">
                    <Image
                      src="/diamond-svgrepo-com.svg"
                      alt="Diamond Icon"
                      width={60}
                      height={60}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-white text-sm lg:text-xl font-bold">500+</span>
                  <span className="text-white/40 text-xs lg:text-sm">Steel Produced</span>
                </motion.div>

                <motion.div
                  className="w-[100px] h-[120px] sm:w-[110px] sm:h-[130px] md:w-[124px] md:h-[145px] bg-black flex flex-col items-start justify-center shadow-lg rounded-md p-3"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5, delay: 0.2 },
                    },
                  }}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mb-2">
                    <Image
                      src="/diamond-svgrepo-com.svg"
                      alt="Diamond Icon"
                      width={60}
                      height={60}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-white text-sm lg:text-xl font-bold">1000+</span>
                  <span className="text-white/40 text-xs lg:text-sm">Roof Produced</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="
    w-full 
    bg-linear-to-r from-[#fef08a] via-[#fef08a] to-[#16a34a] 
    p-4 
    lg:h-[166px] lg:py-0 
    py-6
  "
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.15 } },
        }}
      >
        <div
          className="
      flex items-center justify-center h-full
      flex-wrap gap-8
      lg:flex-nowrap lg:gap-0 lg:space-x-40
    "
        >
          {[
            { title: "China Heavy Equipment Parts", icon: "/box-svgrepo-com2.svg" },
            { title: "Japan Surplus Parts", icon: "/box-svgrepo-com2.svg" },
            { title: "Brand New Parts", icon: "/box-tick-svgrepo-com.svg" },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="
          flex flex-col items-center text-center
          w-[140px] sm:w-[160px]
          lg:items-start lg:text-left
        "
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.95 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.5, ease: "easeOut" },
                },
              }}
            >
              <div className="relative w-12 h-12 lg:w-[90px] lg:h-[90px] mb-2">
                <div className="absolute bottom-0 right-0 w-6 h-6 lg:w-9 lg:h-9 rounded-full bg-[#2FB44D]/60 z-0"></div>
                <Image
                  src={item.icon}
                  alt={`${item.title} Icon`}
                  width={60}
                  height={60}
                  className="object-contain relative z-20 w-full h-full"
                />
              </div>

              <div className="flex items-center justify-center lg:justify-start space-x-1">
                <span className="text-black font-semibold text-xs sm:text-sm">
                  {item.title}
                </span>
                <Image
                  src="/check-circle-svgrepo-com.svg"
                  alt="Check Icon"
                  width={16}
                  height={16}
                  className="object-contain"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>


      <motion.div
        className="w-full h-[500px] md:h-[600px] overflow-hidden relative mt-13"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.2 },
          },
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeAd}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full h-full"
          >
            <Image
              src={ads[activeAd]}
              alt={`Advertisement ${activeAd + 1}`}
              fill
              className="object-contain w-full h-full"
            />
          </motion.div>
        </AnimatePresence>

        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2"
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
          }}
        >
          {ads.map((_, idx) => (
            <motion.span
              key={idx}
              className={`w-3 h-3 rounded-full transition-all ${idx === activeAd ? "bg-green-500" : "bg-gray-300"}`}
              variants={{
                hidden: { opacity: 0, scale: 0.5 },
                visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        className="relative w-full mt-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.2 } },
        }}
      >
        <div className="absolute inset-0">
          <Image
            src={`${CLOUD}/v1764047597/rentals-bg_cblsrb.png`}
            alt="Rentals Background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/70"></div>
        </div>

        <motion.div
          className="relative z-10 flex flex-col items-center text-center px-6 py-20"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
          }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
          >
            Steel Quality Without Compromise.
          </motion.h2>
          <motion.p
            className="text-white text-base md:text-lg max-w-3xl mb-12 tracking-wider"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } } }}
          >
            {/* At C-ONE, we deliver durable, reliable, and precisely crafted steel
            products—giving you the strength and value your projects deserve. */}
            One of the leading Steel Manufacturers in Mindanao. Has Been committed to provide High Quality Products with Affordable Cost.
          </motion.p>

          <motion.div
            className="bg-white w-[1000px] h-[548px] flex items-center justify-center rounded-xl overflow-hidden shadow-lg max-w-full"
            variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.6, delay: 0.4 } } }}
          >
            <Image
              src={`${CLOUD}/v1764048790/category3_ktqtae.png`}
              alt="Steel Category"
              width={1112}
              height={520}
              className="object-contain w-[1112px] h-[520px]"
              loading="lazy"
              blurDataURL={`${CLOUD}/v1764048790/category3_ktqtae.png`}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      <div>
        <VisitUsSection />
      </div>

      <div className="flex flex-col">
        <Footer />
      </div>

      <ScrollIndicator />
      <FloatingTicketing />
    </div >
  );
}

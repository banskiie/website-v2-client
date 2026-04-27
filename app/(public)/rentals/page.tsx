"use client"

import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, easeOut, motion, useInView } from "framer-motion"
import Image from "next/image"
import Header from "@/components/custom/header-white"
import { Award, Calendar, CheckCircleIcon, Clock, FileTextIcon, Fuel, Headset, Mail, MapPin, PhilippinePeso, Phone, Search, SearchIcon, Shield, ShieldCheck, ThumbsUp, Truck, Users, Users2, Wrench, WrenchIcon } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import Footer from "@/components/custom/footer"
import ScrollIndicator from "@/components/custom/scroll-indicator"
import Link from "next/link"
import FloatingChatWidget from "@/components/custom/ticket"
import useSmoothScroll from "@/hooks/useSmoothScroll"
import { InfoCard, Stat, Step } from "@/components/custom/step"
import { Separator } from "@/components/ui/separator"
import { features, rentals } from "@/components/custom/data/items"
import RentalsSection from "@/components/custom/rentals-section"
import { CLOUD } from "@/components/custom/main-faq"


function Page() {
  useSmoothScroll()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [selectedMeasurement, setSelectedMeasurement] = useState<string | null>(
    null
  )
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "250px" })

  const [categoryOpen, setCategoryOpen] = useState(false)
  const [itemOpen, setItemOpen] = useState(false)
  const [measurementOpen, setMeasurementOpen] = useState(false)

  const [activeAd, setActiveAd] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleScrollToRentals = () => {
    const element = document.getElementById("rentals")
    element?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleScrollToVisitUs = () => {
    const visitSection = document.getElementById("visit-us")
    visitSection?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-6 border-[#2FB44D] border-t-transparent"></div>
      </div>
    )
  }

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    setSelectedItem(null)
    setSelectedMeasurement(null)
    setCategoryOpen(false)
    setItemOpen(true)
  }

  const handleItemSelect = (item: string) => {
    setSelectedItem(item)
    setSelectedMeasurement(null)
    setItemOpen(false)
    setMeasurementOpen(true)
  }

  const handleMeasurementSelect = (measurement: string) => {
    setSelectedMeasurement(measurement)
    setMeasurementOpen(false)
  }

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  }


  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  }

  const fadeLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0 },
  }

  const fadeRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0 },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        ease: easeOut,
      },
    }),
  } as const

  return (

    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="relative flex flex-col justify-center min-h-screen px-4 sm:px-6 md:px-12 lg:px-16 bg-black/80 text-white overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <Image
            src={`${CLOUD}/v1764038557/c_one_background_hjai7k.jpg`}
            alt="C-ONE Background"
            fill
            className="object-cover w-full h-full opacity-40"
            loading="lazy"
            blurDataURL={`${CLOUD}/v1764038557/c_one_background_hjai7k.jpg`}
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/60 to-black/80"></div>
        </motion.div>

        <div className="relative z-10 space-y-4 sm:space-y-5 md:space-y-6 max-w-7xl text-center mx-auto lg:text-left px-2 sm:px-4 lg:px-9">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-flex items-center gap-2 bg-yellow-600/10 text-white font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-yellow-500/20 text-xs sm:text-sm"
          >
            <Image
              src={`${CLOUD}/v1764038543/c-one-logo_tgi6rl.png`}
              alt="Truck Icon"
              width={24}
              height={24}
              className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
            />
            <span>C-ONE Trading Corporation</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-xs sm:text-sm md:text-base text-gray-300"
          >
            <span className="text-yellow-400 font-medium">Truck Rental</span> Services in Cagayan de Oro
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight sm:leading-snug md:leading-normal"
          >
            C-ONE Trading Corporation offers reliable and well-maintained truck rental services
            for businesses and individuals in Northern Mindanao.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-gray-300 leading-relaxed text-sm sm:text-base md:text-lg max-w-4xl mx-auto lg:mx-0"
          >
            Whether you need to transport goods, move equipment, or deliver products, we have the
            right vehicle for your needs. Our fleet includes various truck sizes — from light delivery
            vans to heavy-duty cargo trucks — all maintained to the highest standards to ensure your
            cargo arrives safely and on time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1 }}
            className="flex flex-row gap-3 sm:gap-4 justify-center lg:justify-start items-stretch"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleScrollToRentals}
              className="bg-yellow-500 cursor-pointer hover:bg-yellow-600 text-black font-semibold px-3 sm:px-4 lg:px-4 py-2 sm:py-2.5 lg:py-2 rounded-lg shadow-lg transition-all text-xs sm:text-sm lg:text-sm w-full lg:w-auto min-h-[44px] flex items-center justify-center"
            >
              View Our Rents →
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="bg-transparent border cursor-pointer border-yellow-400 hover:bg-yellow-400 hover:text-black text-yellow-400 font-semibold px-3 sm:px-4 lg:px-4 py-2 sm:py-2.5 lg:py-2 rounded-lg transition-all text-xs sm:text-sm lg:text-sm w-full lg:w-auto min-h-[44px] flex items-center justify-center"
              onClick={handleScrollToVisitUs}
            >
              Contact Us Now
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
            className="w-full h-px bg-yellow-600/30 my-4 sm:my-5 md:my-6 origin-left"
          ></motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { staggerChildren: 0.2, delayChildren: 1.4 },
              },
            }}
            className="flex flex-wrap justify-center lg:justify-start gap-6 sm:gap-8 md:gap-10 text-yellow-400 font-semibold"
          >
            {[
              { value: "15+", label: "Years of Experience" },
              { value: "24/7", label: "Customer Support" },
              { value: "100%", label: "Reliable Service" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.6 }}
                className="text-center lg:text-left"
              >
                <p className="text-2xl sm:text-3xl md:text-4xl">{stat.value}</p>
                <p className="text-xs sm:text-sm text-gray-300 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="relative w-full py-16 px-6 md:px-20 bg-[#F9F9F9] overflow-hidden shadow-md">
        <div
          className="absolute inset-0 bg-[radial-gradient(#b7e4c7_2px,transparent_2px)] [background-size:24px_24px] opacity-30"
          aria-hidden="true"
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto text-center space-y-4 relative z-10"
        >
          <div className="inline-flex items-center justify-center bg-yellow-100 text-yellow-700 font-medium px-5 py-2 rounded-full">
            Why C-ONE?
          </div>

          <h2 className="text-lg md:text-xl font-semibold text-gray-700">
            Your Success Is Our Priority
          </h2>

          <p className="text-gray-600 max-w-3xl mx-auto">
            We go beyond just providing trucks. C-ONE delivers reliability, quality, and exceptional
            service that keeps your business moving forward.
          </p>
        </motion.div>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto z-10 relative">
          {features.map(({ icon: Icon, title, text }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
              className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-transform transform hover:scale-[1.03]"
            >
              <div className="flex flex-col items-start space-y-3 text-left">
                <div className="bg-yellow-100 p-3 rounded-xl transition-all duration-300 group-hover:bg-yellow-500 group-hover:scale-110">
                  <Icon className="w-6 h-6 text-yellow-600 transition-colors duration-300 group-hover:text-white" strokeWidth={2} />
                </div>
                <h3 className="text-base font-semibold text-gray-800">{title}</h3>
                <p className="text-gray-600 text-sm">{text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div id="rentals">
        <RentalsSection />
      </div>

      <div className="relative bg-black/90 py-24 px-6 md:px-16 text-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-amber-950/20 to-transparent pointer-events-none" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            visible: {
              transition: { staggerChildren: 0.15 },
            },
          }}
          className="max-w-5xl mx-auto space-y-6 relative z-10"
        >
          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center justify-center bg-amber-200/30 text-amber-300 border border-amber-400/40 font-medium px-5 py-2 rounded-full">
              Trust & Credibility
            </div>
          </motion.div>

          <motion.h4 variants={fadeUp} className="text-amber-200 text-sm tracking-wide">
            Your Trusted Partner Since 2008
          </motion.h4>

          <motion.p variants={fadeUp} className="text-amber-100 max-w-3xl mx-auto leading-relaxed">
            C-ONE Trading Corporation has been providing reliable truck rental services in
            Cagayan de Oro for over 15 years. We are committed to excellence, safety, and
            customer satisfaction.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            visible: { transition: { staggerChildren: 0.15 } },
          }}
          className="max-w-6xl mx-auto mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10"
        >
          <InfoCard
            Icon={Award}
            title="Licensed & Registered"
            desc="Fully licensed by DTI and compliant with LTO regulations for commercial vehicle rentals."
          />
          <InfoCard
            Icon={Shield}
            title="Comprehensive Insurance"
            desc="All vehicles covered by comprehensive insurance for your protection and peace of mind."
          />
          <InfoCard
            Icon={Users2}
            title="Experienced Team"
            desc="Professional staff with decades of combined experience in logistics and rental services."
          />
          <InfoCard
            Icon={ShieldCheck}
            title="Proven Track Record"
            desc="Serving businesses across Northern Mindanao with thousands of satisfied clients."
          />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="mt-16 max-w-4xl mx-auto border-t border-amber-400/40 pt-10 grid grid-cols-2 sm:grid-cols-4 gap-10 text-amber-200 relative z-10"
        >
          <Stat number="15+" label="Years in Business" />
          <Stat number="1000+" label="Satisfied Clients" />
          <Stat number="50+" label="Vehicles Available" />
          <Stat number="24/7" label="Support Available" />
        </motion.div>
      </div>

      <div className="relative bg-[#F9F9F9] py-20 px-6 md:px-16 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              visible: { transition: { staggerChildren: 0.15 } },
            }}
            className="flex-1 space-y-6"
          >
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center justify-center bg-yellow-100 text-yellow-700 font-medium px-5 py-2 rounded-full">
                Features & Benefits
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <h2 className="text-sm font-semibold text-gray-700 mb-1">
                Everything You Need for Seamless Operations
              </h2>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                C-ONE provides more than just trucks.
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We offer a complete rental experience designed to support your business operations
                in Cagayan de Oro and surrounding areas.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-x-6 gap-y-3 text-gray-700 text-sm">
              {[
                "Modern and clean vehicles",
                "Fuel-efficient fleet",
                "Flexible pickup locations",
                "Easy booking process",
                "Multiple payment options",
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-yellow-500">
                    <CheckCircleIcon />
                  </span>
                  {text}
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp}>
              <Separator className="my-6" />
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="flex flex-wrap gap-8 mt-8 justify-start"
            >
              {[
                { icon: Fuel, text: "Fuel Options Available" },
                { icon: Calendar, text: "Flexible Scheduling" },
                { icon: MapPin, text: "CDO Based" },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-200 mb-2">
                    <Icon className="text-yellow-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-700 text-center">{text}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeRight}
            transition={{ duration: 0.8 }}
            className="flex-1 relative"
          >
            <div className="border-3 border-yellow-400 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={`${CLOUD}/v1764221142/rentals-bg-2_mjga7a.png`}
                alt="C-ONE Truck Fleet"
                width={600}
                height={400}
                className="object-cover w-full h-full"
                loading="lazy"
                blurDataURL={`${CLOUD}/v1764221142/rentals-bg-2_mjga7a.png`}
              />
            </div>

            <motion.div
              variants={fadeUp}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-4 py-4 lg:translate-x-0 lg:-bottom-10 lg:-left-10 bg-black/90 border-3 border-yellow-400 text-black font-semibold lg:px-5 lg:py-7 rounded-xl shadow-md flex items-start gap-3"
            >
              <div className="mt-1 text-yellow-400">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="leading-tight text-left">
                <div className="text-sm lg:text-base text-yellow-400">15+ Years</div>
                <div className="text-xs lg:text-sm font-normal mt-0.5 text-gray-200">Industry Experience</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            visible: { transition: { staggerChildren: 0.15 } },
          }}
          className="mt-24 text-center max-w-4xl mx-auto"
        >
          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center justify-center bg-yellow-100 text-yellow-700 font-medium px-5 py-2 rounded-full">
              How It Works
            </div>
          </motion.div>

          <motion.h3 variants={fadeUp} className="text-sm font-semibold text-gray-700 mt-4">
            Simple Process, Reliable Results
          </motion.h3>

          <motion.p variants={fadeUp} className="text-gray-600 max-w-2xl mx-auto mt-4">
            Getting started with C-ONE is easy. Follow these simple steps to rent your truck and get your business moving.
          </motion.p>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative"
          >
            <Step
              number="01"
              title="Choose Your Vehicle"
              desc="Browse our fleet and select the perfect truck that matches your cargo and delivery needs."
              Icon={SearchIcon}
            />
            <Step
              number="02"
              title="Submit Request"
              desc="Contact us via phone or visit our office. Provide your rental requirements and preferred dates."
              Icon={FileTextIcon}
            />
            <Step
              number="03"
              title="Get Your Truck"
              desc="Pick up the truck from our location in Cagayan de Oro or arrange for delivery service."
              Icon={Truck}
            />
            <Step
              number="04"
              title="Start Your Journey"
              desc="Hit the road with confidence. Our support team is available 24/7 for any assistance you need."
              Icon={ThumbsUp}
              isLast
            />
          </motion.div>
        </motion.div>
      </div>

      <div className="relative w-full py-16 px-6 md:px-20 bg-white overflow-hidden">
        <div
          className="absolute inset-0 bg-[radial-gradient(#b7e4c7_2px,transparent_2px)] [background-size:24px_24px] opacity-30"
          aria-hidden="true"
        />

        <motion.div
          id="visit-us"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative z-10 text-center mb-12"
        >
          <h2 className="font-judson text-5xl font-bold text-gray-900">Visit Us</h2>
          <p className="font-judson mt-3 text-gray-600 text-lg max-w-2xl mx-auto">
            We’re here to serve you! Stop by our location to discuss your steel needs,
            get expert advice, or explore our products. Our team is ready to assist you
            with quality steel solutions.
          </p>
        </motion.div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-10 px-4 md:px-8">
          <div className="flex flex-col gap-4 w-full max-w-md text-left lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-green-50 rounded-xl p-4 shadow-sm flex items-start gap-4"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-b from-[#00AB4D] to-[#00BF63] shadow-md">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-700 text-lg font-semibold font-judson">
                  Phone Number
                </p>
                <p className="text-gray-600 mt-1 font-judson">+63 917 629 7457</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-linear-to-b from-[#FEFCE8] to-[#FFFBEB] rounded-xl p-4 shadow-sm flex items-start gap-4"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-b from-[#FDB913] to-[#FFA500] shadow-md">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-700 font-semibold font-judson">Our Location</p>
                <p className="text-gray-600 mt-1 font-judson">
                  Zone A-1, Taytay<br />City of El Salvador<br />Misamis Oriental
                </p>
                <a
                  href="https://www.google.com/maps/place/C-ONE+STEEL/@8.5400202,124.5376785,17z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 text-sm mt-1 inline-block hover:underline font-judson"
                >
                  View on Google Maps
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-green-50 rounded-xl p-4 shadow-sm flex items-start gap-4"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-b from-[#00AB4D] to-[#00BF63] shadow-md">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-700 font-semibold font-judson">Business Hours</p>
                <p className="text-gray-600 mt-1 font-judson">
                  Monday – Friday: <span className="font-bold">8:00 AM – 5:00 PM</span><br />
                  Saturday: <span className="font-bold">8:00 AM – 12:00 PM</span><br />
                  Sunday: <span className="font-bold">Closed</span>
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="bg-linear-to-b from-[#FEFCE8] to-[#FFFBEB] border border-[#FDB913]/30 rounded-xl p-4 text-center shadow-sm"
            >
              <p className="text-md text-gray-700 font-judson">
                <span className="text-green-700 font-semibold">Need directions?</span>{" "}
                We’re located in the heart of Taytay, easily accessible from major roads.
                Call us if you need assistance finding our location!
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 w-full max-w-lg md:max-w-2xl lg:max-w-[750px]"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3879.081809595!2d124.5376731!3d8.5400149!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32fff53ca949a1d7%3A0x776357fb78fef53!2sC-ONE%20STEEL!5e0!3m2!1sen!2sph!4v1694420000000!5m2!1sen!2sph"
              allowFullScreen
              loading="lazy"
              className="border-0 w-full h-[350px] md:h-[450px] lg:h-[500px]"
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="relative z-10 mt-16 bg-white rounded-2xl shadow-[inset_0_2px_6px_rgba(0,0,0,0.20)] p-10 text-center max-w-5xl mx-auto"
        >
          <h3 className="font-judson text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Why Visit C-ONE STEEL?
          </h3>
          <p className="font-judson text-gray-700 max-w-3xl mx-auto mb-8">
            As your trusted steel supplier in Misamis Oriental, we offer premium quality
            steel products, competitive pricing, and exceptional customer service. Visit
            us to experience the difference!
          </p>

          <div className="font-judson flex flex-col md:flex-row justify-center items-center gap-8 text-base text-gray-700">
            <div>
              <p>✓ <span className="font-semibold">Quality Products</span></p>
              <p>Premium steel materials</p>
            </div>
            <div>
              <p>✓ <span className="font-semibold">Expert Advice</span></p>
              <p>Knowledgeable staff ready to help</p>
            </div>
            <div>
              <p>✓ <span className="font-semibold">Great Service</span></p>
              <p>Customer satisfaction guaranteed</p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="w-full relative overflow-hidden pb-20 pt-3 flex justify-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >

        <div
          className="absolute inset-0 bg-[radial-gradient(#b7e4c7_2px,transparent_2px)] [background-size:24px_24px] opacity-30"
          aria-hidden="true"
        />

        <div className="relative w-full max-w-6xl bg-[#0a0a0a] rounded-2xl border-4 border-yellow-400 shadow-[0_0_30px_rgba(255,215,0,0.15)] p-10 md:p-14 text-white">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">

            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <p className="text-sm text-yellow-400 font-medium tracking-wide">
                Ready to <span className="text-yellow-500">Rent a Truck?</span>
              </p>

              <p className="text-lg md:text-xl font-medium leading-relaxed text-gray-200">
                Contact{" "}
                <span className="font-semibold text-white">
                  C-ONE Trading Corporation
                </span>{" "}
                today and let us help you find the perfect vehicle for your
                transportation needs. Our team is ready to assist you with
                professional service and competitive rates.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-linear-to-r cursor-pointer transition-transform ease-in-out from-yellow-400 to-yellow-500 text-black font-semibold px-5 py-2.5 rounded-md shadow hover:from-yellow-300 hover:to-yellow-400 transition"
                >
                  Get a Quote Now
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleScrollToRentals}
                  className="border border-gray-500 transition-transform ease-in-out cursor-pointer text-gray-300 px-5 py-2.5 rounded-md hover:border-yellow-400 hover:text-yellow-400 transition"
                >
                  View Rentals
                </motion.button>
              </div>

              <div className="pt-6 border-t border-gray-700 space-y-3 text-sm">
                <p className="text-gray-400">Contact us directly:</p>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center bg-yellow-500/10 text-yellow-400 rounded-md">
                    📞
                  </div>
                  <span>+63 912 345 6789</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center bg-yellow-500/10 text-yellow-400 rounded-md">
                    📧
                  </div>
                  <span>rentals@c-one.ph</span>
                </div>
              </div>
            </motion.div>

            <div className="grid sm:grid-cols-1 gap-5">
              {[
                {
                  emoji: "💬",
                  title: "Instant Response",
                  desc: "Our team responds quickly to all inquiries. Get answers within hours, not days.",
                },
                {
                  emoji: "🚚",
                  title: "Same-Day Availability",
                  desc: "Need a truck urgently? We offer same-day rentals based on availability.",
                },
                {
                  emoji: "🏢",
                  title: "Corporate Packages",
                  desc: "Special rates and priority service for ongoing rental needs. Ask about our corporate plans.",
                },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="bg-[#111111] border border-yellow-400/20 rounded-lg p-5 flex items-start gap-4 hover:bg-[#151515] transition"
                >
                  <div className="text-yellow-400 text-2xl">{card.emoji}</div>
                  <div>
                    <p className="font-semibold text-yellow-400 mb-1">
                      {card.title}
                    </p>
                    <p className="text-gray-300 text-sm">{card.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <Footer />
      <ScrollIndicator />
      {/* <FloatingChatWidget /> */}
    </div>

  )
}

export default Page
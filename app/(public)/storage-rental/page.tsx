"use client"

import React, { useEffect, useState } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Header from "@/components/custom/header-white"
import {
  Warehouse,
  Lock,
  Truck,
  Clock,
  Camera,
  Shield,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Key,
  Sparkles,
  Building2,
  Users,
  Award,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import Footer from "@/components/custom/footer"
import ScrollIndicator from "@/components/custom/scroll-indicator"
import FloatingChatWidget from "@/components/custom/ticket"
import useSmoothScroll from "@/hooks/useSmoothScroll"
import { CLOUD } from "@/components/custom/main-faq"

const Page = () => {
  useSmoothScroll()
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])

  const galleryImages = [
    {
      id: 1,
      src: `${CLOUD}/v1774873429/1_vtvq2t.png`,
      title: "Premium Storage Unit - Large",
      category: "Storage Units",
      height: "h-96",
      description: "Spacious 100 sqm unit perfect for business inventory"
    },
    {
      id: 2,
      src: `${CLOUD}/v1774873429/2.2_rhlyl5.png`,
      title: "Secure Storage - Medium",
      category: "Storage Units",
      height: "h-80",
      description: "Climate-controlled medium unit for sensitive items"
    },
    {
      id: 3,
      src: `${CLOUD}/v1774873429/5.5_lxql9d.png`,
      title: "Compact Storage - Small",
      category: "Storage Units",
      height: "h-64",
      description: "Perfect for personal belongings and documents"
    },
    {
      id: 4,
      src: `${CLOUD}/v1774873429/6.5_fh7u6e.png`,
      title: "Extra Large Warehouse Space",
      category: "Commercial Storage",
      height: "h-96",
      description: "Industrial-grade storage for bulk inventory"
    },
    {
      id: 5,
      src: `${CLOUD}/v1774873429/7.5_lg7uup.png`,
      title: "Drive-Up Access Units",
      category: "Convenience",
      height: "h-72",
      description: "Easy loading and unloading with vehicle access"
    },
    {

      id: 6,
      src: `${CLOUD}/v1774836543/bg_rqjach.png`,
      title: "Drive-Up Access Units",
      category: "Convenience",
      height: "h-72",
      description: "Easy loading and unloading with vehicle access"
    },
    {
      id: 7,
      src: `${CLOUD}/v1775015130/Untitled_design_-_2026-04-01T114509.259_gyuwbx.png`,
      title: "Drive-Up Access Units",
      category: "Convenience",
      height: "h-72",
      description: "Easy loading and unloading with vehicle access"
    },
    {
      id: 8,
      src: `${CLOUD}/v1775020112/Untitled_design_-_2026-04-01T114607.521_xzoi65.png`,
      title: "Drive-Up Access Units",
      category: "Convenience",
      height: "h-72",
      description: "Easy loading and unloading with vehicle access"
    },
    {
      id: 9,
      src: `${CLOUD}/v1775020113/Untitled_design_-_2026-04-01T114712.312_h91rez.png`,
      title: "Drive-Up Access Units",
      category: "Convenience",
      height: "h-72",
      description: "Easy loading and unloading with vehicle access"
    },
    {
      id: 10,
      src: `${CLOUD}/v1775020135/Untitled_design_-_2026-04-01T114716.373_oax8lt.png`,
      title: "Drive-Up Access Units",
      category: "Convenience",
      height: "h-72",
      description: "Easy loading and unloading with vehicle access"
    },
  ]

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-yellow-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  const features = [
    { icon: Warehouse, title: "Multiple Unit Sizes", description: "From small lockers to large warehouse spaces available" },
    { icon: Lock, title: "24/7 Security", description: "CCTV surveillance and security personnel on-site" },
    { icon: Truck, title: "Easy Access", description: "Drive-up access for convenient loading and unloading" },
    { icon: Clock, title: "Flexible Hours", description: "Access your unit during extended business hours" },
    { icon: Camera, title: "24/7 Monitoring", description: "Advanced security system with round-the-clock recording" },
    { icon: Shield, title: "Secure Facility", description: "Gated access with secure entry system" },
  ]

  const benefits = [
    "Clean and well-maintained units",
    "Flexible rental terms",
    "Strategic Kauswagan location",
    "Professional staff assistance",
  ]

  const handleContact = () => {
    const contactSection = document.getElementById("contact")
    contactSection?.scrollIntoView({ behavior: "smooth", block: "start" })
    setIsModalOpen(false)
  }

  const openModal = () => {
    setIsModalOpen(true)
    document.body.style.overflow = "hidden"
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedImage(null)
    document.body.style.overflow = "auto"
  }

  const nextImage = () => {
    if (selectedImage !== null && selectedImage < galleryImages.length - 1) {
      setSelectedImage(selectedImage + 1)
    }
  }

  const prevImage = () => {
    if (selectedImage !== null && selectedImage > 0) {
      setSelectedImage(selectedImage - 1)
    }
  }

  const DonutCircle = ({ className = "", size = "w-[500px] h-[500px]" }) => (
    <div className={`absolute ${className} pointer-events-none`}>
      <div className={`relative ${size}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/15 to-yellow-400/10 rounded-full blur-2xl"></div>
        <div className="absolute inset-[15%] bg-gradient-to-r from-yellow-500/20 to-yellow-400/15 rounded-full blur-2xl"></div>
        <div className="absolute inset-[30%] bg-gradient-to-r from-yellow-400/25 to-yellow-300/20 rounded-full blur-xl"></div>
        <div className="absolute inset-[45%] bg-yellow-400/30 rounded-full blur-xl"></div>
      </div>
    </div>
  )

  const ChessboardPattern = () => (
    <div className="absolute inset-0 opacity-20 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(45deg, rgba(234, 179, 8, 0.3) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(234, 179, 8, 0.3) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(234, 179, 8, 0.3) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(234, 179, 8, 0.3) 75%)
          `,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px',
        }}
      />
    </div>
  )

  const GridPattern = () => (
    <div className="absolute inset-0 opacity-30 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(0deg, rgba(156, 163, 175, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(156, 163, 175, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />

      <div className="relative min-h-screen pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={`${CLOUD}/v1774836543/bg_rqjach.png`}
            alt="Storage Facility"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/70"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-32 z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 px-4 py-2 rounded-full"
              >
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-500 text-sm">Premium Storage Solutions</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl lg:text-6xl font-bold leading-tight"
              >
                <span className="text-white">Maximize Your Space with</span>
                <br />
                <span className="text-yellow-500">Premium Storage Rentals</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-300 text-lg leading-relaxed"
              >
                Located strategically in Kauswagan, our facilities offer a clean, secure, and highly
                accessible environment for your inventory, equipment, or personal belongings.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4 pt-4"
              >
                <button
                  onClick={handleContact}
                  className="group bg-yellow-500 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-all duration-300 flex items-center gap-2"
                >
                  Inquire Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={openModal}
                  className="border-2 border-yellow-500 text-yellow-500 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-500 hover:text-black transition-all duration-300"
                >
                  View Facilities
                </button>
              </motion.div>

            </motion.div>

            <div className="relative" />
          </div>
        </div>

        <motion.div
          style={{ opacity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div className="w-6 h-10 border-2 border-yellow-500/50 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg p-4"
          // onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-7xl max-h-[90vh] bg-[#0a0a0a] rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10 sticky top-0 bg-[#0a0a0a] z-10">
                <div>
                  <h2 className="text-2xl font-bold text-white">Our Storage Facilities</h2>
                  <p className="text-gray-400 text-sm mt-1">Browse through our premium storage spaces</p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                  {galleryImages.map((image, index) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.1, 0.5) }}
                      className="break-inside-avoid cursor-pointer group relative rounded-xl overflow-hidden"
                      onClick={() => setSelectedImage(index)}
                    >
                      <div className={`relative w-full ${image.height} overflow-hidden`}>
                        <Image
                          src={image.src}
                          alt={image.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <p className="text-white font-semibold text-lg">{image.title}</p>
                            <p className="text-yellow-400 text-sm mt-1">{image.category}</p>
                            <p className="text-gray-300 text-xs mt-2">{image.description}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {selectedImage !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/98"
                onClick={() => setSelectedImage(null)}
              >
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-lg transition-colors z-20"
                >
                  <X className="w-8 h-8 text-white" />
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  disabled={selectedImage === 0}
                  className={`absolute left-6 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 z-20 ${selectedImage === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                >
                  <ChevronLeft className="w-8 h-8 text-white" />
                </button>

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative max-w-6xl max-h-[85vh] w-full mx-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative w-full h-[85vh]">
                    <Image
                      src={galleryImages[selectedImage].src}
                      alt={galleryImages[selectedImage].title}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8">
                    <h3 className="text-white text-2xl font-semibold">{galleryImages[selectedImage].title}</h3>
                    <p className="text-yellow-400 text-lg mt-1">{galleryImages[selectedImage].category}</p>
                    <p className="text-gray-300 text-sm mt-2">{galleryImages[selectedImage].description}</p>
                    <p className="text-gray-400 text-xs mt-3">
                      {selectedImage + 1} of {galleryImages.length}
                    </p>
                  </div>
                </motion.div>

                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  disabled={selectedImage === galleryImages.length - 1}
                  className={`absolute right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 z-20 ${selectedImage === galleryImages.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                >
                  <ChevronRight className="w-8 h-8 text-white" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <ChessboardPattern />
        <DonutCircle className="top-0 -right-80" size="w-[550px] h-[550px]" />

        <div className="relative max-w-7xl mx-auto z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              <span className="text-yellow-500">Why Choose Our Storage?</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Experience premium storage solutions with unmatched security and convenience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-yellow-500/50 hover:bg-white/10 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-500 group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-yellow-500 group-hover:text-black" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative py-20 overflow-hidden bg-yellow-500">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "5000+", label: "Sq Ft Available", icon: Building2 },
              { number: "24/7", label: "Security Monitoring", icon: Shield },
              { number: "100%", label: "Clean & Secure", icon: CheckCircle2 },
              { number: "3+", label: "Years Experience", icon: Award },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-black" />
                <div className="text-3xl lg:text-4xl font-bold text-black mb-2">{stat.number}</div>
                <div className="text-black/80 text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <DonutCircle className="top-20 -left-96" size="w-[700px] h-[700px]" />

        <div className="relative max-w-7xl mx-auto z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 px-4 py-2 rounded-full">
                <Key className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-500 text-sm">What We Offer</span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-white">
                Everything You Need for Peace of Mind
              </h2>

              <p className="text-gray-400">
                Our storage facilities are designed to provide the perfect balance of security,
                accessibility, and convenience. Whether for business or personal use, we have the
                right solution for you.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    <span className="text-gray-300">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <Image
                  src={`${CLOUD}/v1774836543/bg_rqjach.png`}
                  alt="Storage Facility"
                  width={600}
                  height={400}
                  className="object-cover w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div id="contact" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <ChessboardPattern />

        <div className="relative max-w-7xl mx-auto z-10">
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-white">Contact Us Today</h3>
                <p className="text-gray-400 text-sm mt-1">For inquiries and reservations</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-yellow-500/10 transition-colors">
                  <Phone className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-gray-500 text-xs">Call us</p>
                    <p className="text-white font-semibold">0917-712-4665</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-yellow-500/10 transition-colors">
                  <Mail className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-gray-500 text-xs">Email us</p>
                    <p className="text-white font-semibold">warehouse@c-one.ph</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-yellow-500/10 transition-colors">
                  <MapPin className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-gray-500 text-xs">Visit us</p>
                    <p className="text-white font-semibold">Zone 1 Kauswagan, Rodolfo N. Pelaez Blvd, Cagayan De Oro City</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-yellow-500/10 transition-colors">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-gray-500 text-xs">Access Hours</p>
                    <p className="text-white font-semibold">Mon-Sat: 8AM - 5PM</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-yellow-500 rounded-2xl p-8 shadow-lg"
            >
              <div className="text-center max-w-lg mx-auto">
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-bold text-black">
                    Ready to Secure Your Storage Space?
                  </h2>
                  <p className="text-black/80 text-lg">
                    Reserve your unit today or schedule a facility tour. Our team is ready to assist you.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                    <button className="bg-black text-yellow-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-900 transition-all duration-300 flex items-center justify-center gap-2">
                      <Phone className="w-5 h-5" />
                      Call 0917-712-4665
                    </button>
                    <button className="border-2 border-black text-black px-8 py-3 rounded-lg font-semibold hover:bg-black hover:text-yellow-500 transition-all duration-300">
                      Request a Quote
                    </button>
                  </div>

                  <div className="pt-8 border-t border-black/20">
                    <div className="flex flex-wrap justify-center gap-6 text-sm">
                      <div className="flex items-center gap-2 text-black/70">
                        <Mail className="w-4 h-4" />
                        <span>warehouse@c-one.ph</span>
                      </div>
                      <div className="flex items-center gap-2 text-black/70">
                        <MapPin className="w-4 h-4" />
                        <span>Zone 1 Kauswagan, Rodolfo N. Pelaez Blvd, Cagayan De Oro City</span>
                      </div>
                      <div className="flex items-center gap-2 text-black/70">
                        <Clock className="w-4 h-4" />
                        <span>Mon-Sat: 8AM - 5PM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <GridPattern />
        <DonutCircle className="bottom-0 -right-96" size="w-[600px] h-[600px]" />

        <div className="relative max-w-7xl mx-auto z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Find Us Here</h2>
            <p className="text-gray-400">Visit our facility in Kauswagan, Cagayan de Oro</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.123456789!2d124.6414118!3d8.5001386!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32fff2d0e1e2e3e5%3A0x123456789abcdef!2sC-ONE%20Trading%20Corporation%20Storage%20Facility!5e0!3m2!1sen!2sph!4v1694420000000!5m2!1sen!2sph"
              allowFullScreen
              loading="lazy"
              className="border-0 w-full h-[400px] lg:h-[450px]"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>

          <div className="text-center mt-6">
            <a
              href="https://www.google.com/maps/search/c-one+kauswagan/@8.5001386,124.6414118,18.75z"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-yellow-500 hover:text-yellow-400 transition-colors text-sm"
            >
              <MapPin className="w-4 h-4" />
              Open in Google Maps
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      <Footer />
      <ScrollIndicator />
      {/* <FloatingChatWidget /> */}
    </div>
  )
}

export default Page
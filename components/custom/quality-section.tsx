"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { CLOUD } from "./main-faq"
import { useState } from "react"
import { X, MapPin, Phone, Clock, Navigation, Mail } from "lucide-react"

export default function QualitySection() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState("Cagayan De Oro City")

  const branches = {
    "Cagayan De Oro City": {
      province: "Misamis Oriental",
      address: "Kauswagan Branch",
      fullAddress: "Kauswagan, Cagayan de Oro City, Philippines",
      // details: "Main branch with full services including showroom, warehouse, and delivery services.",
      contact: "(088) 123-4567",
      hours: "Mon-Sat: 8:00 AM - 6:00 PM",
      features: ["Showroom", "Warehouse", "Sales Office", "Delivery Services", "Technical Support"],
      coordinates: "8.4855° N, 124.6569° E"
    },
    "El Salvador City": {
      province: "Misamis Oriental",
      address: "Zone 1, Taytay",
      fullAddress: "Zone 1, Taytay, El Salvador City, Misamis Oriental",
      // details: "Satellite branch serving northern areas with sales office and consultation services.",
      contact: "(088) 234-5678",
      hours: "Mon-Fri: 8:00 AM - 5:00 PM, Sat: 8:00 AM - 12:00 PM",
      features: ["Sales Office", "Pick-up Point", "Consultation", "Order Processing"],
      coordinates: "8.5592° N, 124.5236° E"
    },
    "Davao City": {
      province: "Davao del Norte",
      address: "Purok 24, Malagmot Panacan",
      fullAddress: "Purok 24, Malagmot Panacan, Davao City, Philippines",
      // details: "Southern Mindanao branch with full warehouse facilities and technical support team.",
      contact: "(082) 345-6789",
      hours: "Mon-Sat: 7:30 AM - 5:30 PM",
      features: ["Warehouse", "Sales Office", "Technical Support", "Delivery Hub", "Equipment Rental"],
      coordinates: "7.0785° N, 125.5949° E"
    }
  }

  const currentBranch = branches[selectedBranch as keyof typeof branches]

  return (
    <>
      <section className="w-full bg-[#FFFFFF] py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 relative">
        <div className="relative max-w-[2000px] mx-auto rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl -mt-10 sm:-mt-16 md:-mt-24">
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.1 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1 }}
          >
            <Image
              src={`${CLOUD}/v1764038557/c_one_background_hjai7k.jpg`}
              alt="C-ONE Background"
              fill
              className="object-cover transition-opacity duration-700 ease-out"
              loading="lazy"
              blurDataURL={`${CLOUD}/v1764038557/c_one_background_hjai7k.jpg`}
            />
            <div className="absolute inset-0 bg-black/50"></div>
          </motion.div>

          <div className="relative text-white flex flex-col items-center justify-center text-center py-32 sm:py-44 md:py-60 px-4 sm:px-8 md:px-12">
            <motion.h2
              className="font-joanna text-xl md:text-3xl lg:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              Quality You Can Build On
            </motion.h2>

            <motion.p
              className="font-joanna text-base md:text-xl lg:text-2xl font-medium max-w-3xl mb-10 tracking-wider"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Durable Materials. Reliable Service. Proven Results. <br />
              Your one-stop partner for materials, rentals, and full project support.
            </motion.p>

            <motion.button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-3 cursor-pointer bg-white/10 backdrop-blur-md border border-white/30 text-white font-medium text-sm md:text-md lg:text-lg px-10 py-4 rounded-full hover:bg-white/20 transition-all"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span>View Branches</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="lg:w-6 lg:h-6 md:w-4 md:h-4 w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.button>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="shrink-0 bg-white border-b">
              <div className="px-6 pt-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Our Branches</h3>
                    <p className="text-gray-500 text-sm mt-1">Select a branch to view details</p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="sticky top-0 z-10 bg-white px-6 pb-5 border-b">
                <div className="flex flex-wrap gap-2">
                  {Object.keys(branches).map((city) => (
                    <button
                      key={city}
                      onClick={() => setSelectedBranch(city)}
                      className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 border ${selectedBranch === city
                          ? "bg-linear-to-r from-green-600 to-green-700 text-white border-green-700 shadow-md scale-[1.02]"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 cursor-pointer"
                        }`}
                    >
                      <MapPin className={`w-4 h-4 ${selectedBranch === city ? 'text-white' : 'text-gray-500'}`} />
                      <span className="font-semibold text-md">{city}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <motion.div
                  key={selectedBranch}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-2xl font-bold text-gray-800">{selectedBranch}</h4>
                        {currentBranch.province && (
                          <p className="text-green-600 font-medium mt-1">{currentBranch.province}</p>
                        )}
                      </div>
                      <div className="px-3 py-1.5 bg-linear-to-r from-green-100 to-emerald-100 text-green-800 rounded-full text-sm font-semibold border border-green-200">
                        C-ONE Branch
                      </div>
                    </div>

                    <div className="p-5 bg-linear-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0">
                          <div className="w-12 h-12 rounded-full bg-linear-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
                            <MapPin className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800 text-lg">{currentBranch.address}</p>
                          <p className="text-gray-600 mt-1">{currentBranch.fullAddress}</p>
                          {/* <p className="text-gray-700 mt-3">{currentBranch.details}</p> */}
                          <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                            <Navigation className="w-4 h-4" />
                            <span>Coordinates: {currentBranch.coordinates}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-blue-200 bg-linear-to-br from-blue-50 to-white">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-linear-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                          <Phone className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-800">Contact Information</h5>
                          <p className="text-gray-600 text-sm">Direct line to branch</p>
                        </div>
                      </div>
                      <div className="pl-13">
                        <p className="text-lg font-bold text-blue-700">{currentBranch.contact}</p>
                        {/* <button className="mt-3 flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all text-sm shadow-sm">
                          <PhoneCall className="w-4 h-4" />
                          Call Now
                        </button> */}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-amber-200 bg-linear-to-br from-amber-50 to-white">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-linear-to-r from-amber-500 to-amber-600 flex items-center justify-center shadow-sm">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-800">Business Hours</h5>
                          <p className="text-gray-600 text-sm">Open for service</p>
                        </div>
                      </div>
                      <div className="pl-13">
                        <p className="font-bold text-gray-800 text-md">{currentBranch.hours}</p>
                        <p className="text-gray-600 text-sm mt-2">Sunday: Closed</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Available Services
                    </h5>
                    <div className="flex flex-wrap gap-3">
                      {currentBranch.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-4 py-2.5 bg-linear-to-r from-gray-50 to-white border border-gray-300 rounded-lg text-gray-800 font-semibold text-sm hover:border-green-400 hover:shadow-sm transition-all"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-linear-to-r from-gray-50 to-gray-100/50 border border-gray-300">
                    <h5 className="font-bold text-gray-800 text-lg mb-4">Quick Actions</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button className="px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all text-sm flex items-center justify-center gap-2">
                        <Navigation className="w-4 h-4" />
                        Get Directions
                      </button>
                      <button className="px-4 py-3 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all text-sm flex items-center justify-center gap-2 shadow-sm">
                        <Mail className="w-4 h-4" />
                        Email
                      </button>
                      <button className="px-4 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all text-sm flex items-center justify-center gap-2 shadow-sm">
                        <MapPin className="w-4 h-4" />
                        View on Map
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="hrink-0 bg-linear-to-r from-gray-50 to-white px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-gray-700 text-sm font-medium">
                    Currently viewing: <span className="font-bold text-gray-900">{selectedBranch}</span>
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-linear-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-lg hover:from-gray-900 hover:to-black transition-all text-sm shadow-md"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
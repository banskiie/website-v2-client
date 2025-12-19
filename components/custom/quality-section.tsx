"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { CLOUD } from "./main-faq"
import { useState } from "react"
import { X, MapPin, Phone, Clock, Navigation, Mail, PhoneCall, ImageIcon } from "lucide-react"
import { Button } from "../ui/button"

export default function QualitySection() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState("Cagayan De Oro City")
  const [showStaticMapDialog, setShowStaticMapDialog] = useState(false)

  const branches = {
    "Cagayan De Oro City": {
      province: "Misamis Oriental",
      address: "Kauswagan Branch",
      fullAddress: "Kauswagan, Cagayan de Oro City, Philippines",
      contact: "(088) 123-4567",
      hours: "Mon-Sat: 8:00 AM - 6:00 PM",
      features: ["Showroom", "Warehouse", "Sales Office", "Delivery Services", "Technical Support"],
      coordinates: "8.4855° N, 124.6569° E",
      mapsUrl: "https://www.google.com/maps/place/C-ONE+Trading+Corporation/@8.5001166,124.6393809,1027m/data=!3m2!1e3!4b1!4m6!3m5!1s0x32fff30285143bd9:0xe7534fc8d109658c!8m2!3d8.5001166!4d124.6419612!16s%2Fg%2F1tm8bj63?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D",
      lat: 8.5001166,
      lng: 124.6419612,
      embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3879.292081809595!2d124.6394518!3d8.5001149!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32fff30019327e95%3A0xf0787044cac856fe!2sC-ONE%20Sports%20Center!5e0!3m2!1sen!2sph!4v1694420000000!5m2!1sen!2sph"
    },
    "El Salvador City": {
      province: "Misamis Oriental",
      address: "Zone 1, Taytay",
      fullAddress: "Zone 1, Taytay, El Salvador City, Misamis Oriental",
      contact: "(088) 234-5678",
      hours: "Mon-Fri: 8:00 AM - 5:00 PM, Sat: 8:00 AM - 12:00 PM",
      features: ["Sales Office", "Pick-up Point", "Consultation", "Order Processing"],
      coordinates: "8.5592° N, 124.5236° E",
      mapsUrl: "https://www.google.com/maps/place/C-ONE+STEEL/@8.5400149,124.5376731,1026m/data=!3m2!1e3!4b1!4m6!3m5!1s0x32fff53ca949a1d7:0x776357fb78fef53!8m2!3d8.5400149!4d124.5402534!16s%2Fg%2F11gslv11kb?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D",
      lat: 8.5400149,
      lng: 124.5402534,
      embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.1854211135117!2d124.5376731!3d8.5400149!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32fff53ca949a1d7%3A0x776357fb78fef53!2sC-ONE%20STEEL!5e0!3m2!1sen!2sph!4v1744360296708!5m2!1sen!2sph"
    },
    "Davao City": {
      province: "Davao del Norte",
      address: "Purok 24, Malagmot Panacan",
      fullAddress: "Purok 24, Malagmot Panacan, Davao City, Philippines",
      contact: "(082) 345-6789",
      hours: "Mon-Sat: 7:30 AM - 5:30 PM",
      features: ["Warehouse", "Sales Office", "Technical Support", "Delivery Hub", "Equipment Rental"],
      coordinates: "7.0785° N, 125.5949° E",
      mapsUrl: "https://www.google.com/maps/place/C-One/@7.1605765,125.6355661,3a,75y,300.74h,88.04t/data=!3m7!1e1!3m5!1sgkx6KVPwhvB4tNg116439A!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D1.9560503138775402%26panoid%3Dgkx6KVPwhvB4tNg116439A%26yaw%3D300.7395304022639!7i16384!8i8192!4m14!1m7!3m6!1s0x32f96bcbcfe6d94f:0x8e0baab9430cb429!2sC-One!8m2!3d7.1605795!4d125.6354062!16s%2Fg%2F11c1r23lnj!3m5!1s0x32f96bcbcfe6d94f:0x8e0baab9430cb429!8m2!3d7.1605795!4d125.6354062!16s%2Fg%2F11c1r23lnj?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D",
      lat: 7.1605795,
      lng: 125.6354062,
      embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.854280271726!2d125.6332313!3d7.1605795!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32f96bcbcfe6d94f%3A0x8e0baab9430cb429!2sC-One!5e0!3m2!1sen!2sph!4v1744360296708!5m2!1sen!2sph"
    }
  }

  const currentBranch = branches[selectedBranch as keyof typeof branches]

  const handleGetDirections = () => {
    const mapsUrl = branches[selectedBranch as keyof typeof branches].mapsUrl;

    if (!mapsUrl) return;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = `https://maps.google.com/maps?daddr=${encodeURIComponent(currentBranch.fullAddress)}`;
    } else {
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    }
  }

  const handleViewStaticMap = () => {
    setShowStaticMapDialog(true);
  }

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
                <div className="flex flex-wrap justify-center items-center gap-2">
                  {Object.keys(branches).map((city) => (
                    <Button
                      key={city}
                      onClick={() => setSelectedBranch(city)}
                      className={`px-4 py-2 bg-transparent! rounded-lg font-medium transition-all flex flex-row gap-2 border ${selectedBranch === city
                        ? "bg-linear-to-r from-green-600 to-green-700 text-white border-green-700 shadow-md scale-[1.02]"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 cursor-pointer"
                        }`}
                    >
                      <MapPin className={`w-4 h-4 ${selectedBranch === city ? 'text-white' : 'text-gray-500'}`} />
                      <span className="font-medium text-sm">{city}</span>
                    </Button>
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
                        <h4 className="text-lg font-semibold text-gray-800">{selectedBranch}</h4>
                        {currentBranch.province && (
                          <p className="text-green-600 font-medium text-sm mt-1">{currentBranch.province}</p>
                        )}
                      </div>
                      <div className="px-3 py-1.5 bg-linear-to-r from-green-100 to-emerald-100 text-green-800 rounded-full text-xs font-semibold border border-green-200">
                        C-ONE Branch
                      </div>
                    </div>

                    <div className="p-5 bg-linear-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0">
                          <div className="w-8 h-8 rounded-full bg-linear-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
                            <MapPin className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 text-md">{currentBranch.address}</p>
                          <p className="text-gray-600 text-sm mt-1">{currentBranch.fullAddress}</p>
                          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                            <Navigation className="w-4 h-4" />
                            <span>Coordinates: {currentBranch.coordinates}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-blue-200 bg-linear-to-br from-blue-50 to-white">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-linear-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                          <Phone className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-800">Contact Information</h5>
                          <p className="text-gray-600 text-sm">Direct line to branch</p>
                        </div>
                      </div>
                      <div className="pl-11">
                        <p className="text-sm font-bold text-blue-700">{currentBranch.contact}</p>
                        <button className="mt-3 flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all text-xs shadow-sm">
                          <PhoneCall className="w-4 h-4" />
                          Call Now
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-amber-200 bg-linear-to-br from-amber-50 to-white">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-linear-to-r from-amber-500 to-amber-600 flex items-center justify-center shadow-sm">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-sm text-gray-800">Business Hours</h5>
                          <p className="text-gray-600 text-xs">Open for service</p>
                        </div>
                      </div>
                      <div className="pl-11">
                        <p className="font-medium text-gray-800 text-sm">{currentBranch.hours}</p>
                        <p className="text-gray-600 text-sm font-medium mt-2">Sunday: Closed</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-linear-to-r from-gray-50 to-gray-100/50 border border-gray-300">
                    <h5 className="font-bold text-gray-800 text-md mb-4">Quick Actions</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Button
                        onClick={handleGetDirections}
                        className="px-3 cursor-pointer py-2 bg-white border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all text-sm flex items-center justify-center gap-2"
                      >
                        <Navigation className="w-4 h-4" />
                        Get Directions
                      </Button>
                      <Button
                        onClick={() => window.location.href = `mailto:inquiry@c-one.ph?subject=Inquiry for ${selectedBranch} Branch`}
                        className="px-3 cursor-pointer py-2 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Mail className="w-4 h-4" />
                        Email
                      </Button>
                      <Button
                        onClick={handleViewStaticMap}
                        className="px-3 cursor-pointer py-2 bg-linear-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
                      >
                        <ImageIcon className="w-4 h-4" />
                        View Map
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="shrink-0 bg-linear-to-r from-gray-50 to-white px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-gray-700 text-sm font-medium">
                    Currently viewing: <span className="font-bold text-gray-900">{selectedBranch}</span>
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 cursor-pointer bg-linear-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-lg hover:from-gray-900 hover:to-black transition-all text-sm shadow-md"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showStaticMapDialog && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
          >
            <div className="shrink-0 bg-white border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedBranch} Location</h3>
                  <p className="text-gray-500 text-sm mt-1">Interactive map view of selected branch</p>
                </div>
                <button
                  onClick={() => setShowStaticMapDialog(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close map"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 w-full max-w-lg md:max-w-2xl lg:max-w-[750px] mx-auto"
              >
                <iframe
                  src={currentBranch.embedUrl}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="border-0 w-full h-[350px] md:h-[450px] lg:h-[450px]"
                  title={`${selectedBranch} Google Map`}
                />
              </motion.div>

              <div className="mt-6 p-4 rounded-lg bg-gray-50 border border-gray-200 max-w-lg md:max-w-2xl lg:max-w-[750px] mx-auto">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{selectedBranch}</h4>
                    <p className="text-gray-600 text-sm">{currentBranch.address}</p>
                    <p className="text-gray-500 text-xs mt-1">{currentBranch.fullAddress}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-700">{currentBranch.contact}</p>
                    <p className="text-xs text-gray-500">{currentBranch.hours}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Latitude</p>
                    <p className="font-medium text-sm text-gray-800">{currentBranch.lat.toFixed(6)}° N</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Longitude</p>
                    <p className="font-medium text-sm text-gray-800">{currentBranch.lng.toFixed(6)}° E</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 bg-gray-50 px-6 py-4 border-t">
              <div className="flex items-center justify-between max-w-lg md:max-w-2xl lg:max-w-[750px] mx-auto">
                <div>
                  <p className="text-gray-600 text-sm">
                    Showing: <span className="font-semibold text-gray-800">{selectedBranch}</span>
                  </p>
                  <p className="text-xs text-gray-500">Interactive Google Maps view</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowStaticMapDialog(false)}
                    className="px-4 py-2 cursor-pointer bg-gray-200! text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all text-sm"
                  >
                    Close
                  </Button>
                  <button
                    onClick={handleGetDirections}
                    className="px-4 py-2 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all text-sm shadow-sm"
                  >
                    Get Directions
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
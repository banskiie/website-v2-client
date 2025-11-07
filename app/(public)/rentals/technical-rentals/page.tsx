"use client"

import Header from '@/components/custom/header-white'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import React, { useState } from 'react'
import Footer from '@/components/custom/footer'
import ScrollIndicator from '@/components/custom/scroll-indicator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

const technicalProducts = [
  {
    img: "/assets/img/rentals/items/technical/DJ.png",
    label: "Pioneer DDJ-REV1",
    details: [
      "2-channel DJ controller (Serato DJ Lite)",
      "Battle-style layout with long pitch faders",
      "Larger jog wheels (same as DDJ-SR2)",
      "Lever FX (lock / push effects)",
      "USB bus powered",
      "Dimensions: 50.8 × 25.4 × 5.08 cm",
      "Weight: 3.175 kg",
      "As per quotation"
    ]
  },
  {
    img: "/assets/img/rentals/items/technical/speaker.jpg",
    label: "Speaker System",
    details: [
      "2x 15\" Active Speakers",
      "1x Subwoofer",
      "Speaker Stands",
      "Mixer Included",
      "Cables & Power Supply",
      "As per quotation"
    ]
  },
  {
    img: "/assets/img/rentals/items/technical/lights.jpg",
    label: "Party Lights Set",
    details: [
      "2x Moving Head Lights",
      "4x LED Par Lights",
      "1x Laser Light",
      "Lighting Controller",
      "Cables & Power Supply",
      "As per quotation"
    ]
  },
  {
    img: "/assets/img/rentals/items/technical/projector.jpg",
    label: "Projector",
    details: [
      "Full HD 1080p",
      "3500 Lumens Brightness",
      "HDMI / VGA Input",
      "Tripod Screen Included",
      "As per quotation"
    ]
  },
  {
    img: "/assets/img/rentals/items/technical/Fog.jpg",
    label: "SM400 Mini Fog Machine",
    details: [
      "400W Power Output",
      "Warm-up Time: ~3–5 minutes (estimation)",
      "Continuous Fog Output",
      "Remote Control (wired / wireless)",
      "Fluid Tank Capacity: ~0.3-0.5L (typical for units this size)",
      "Includes power cable & fluid (as per quotation)",
      "As per quotation"
    ]
  }
]

function TechnicalPage() {
  const [selectedProduct, setSelectedProduct] =
    useState<typeof technicalProducts[0] | null>(null)

  const openModal = (product: typeof technicalProducts[0]) =>
    setSelectedProduct(product)
  const closeModal = () => setSelectedProduct(null)

  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 })

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f2ec]">
      <Header />

      <div className="w-full min-h-screen p-12" ref={ref}>
        <div className="flex items-center text-gray-600 text-sm mb-10 mt-13">
          <Link
            href="/rentals/#featured-products"
            className="hover:text-[#2FB44D] font-medium transition-colors"
          >
            Rentals
          </Link>
          <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          <span className="font-medium text-gray-600">Technical Rentals</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8"
        >
          {technicalProducts.map((product, idx) => (
            <motion.div
              key={product.label}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: "easeOut", delay: idx * 0.1 }}
              onClick={() => openModal(product)}
              className="bg-white cursor-pointer shadow-md rounded-2xl overflow-hidden flex flex-col transform transition duration-300 hover:shadow-xl hover:scale-105"
            >
              <div className="relative w-full h-48">
                <Image
                  src={product.img}
                  alt={product.label}
                  fill
                  className="object-contain w-full h-full mt-3"
                />
              </div>
              <div className="p-4 flex flex-col items-center justify-between flex-1">
                <h3 className="text-lg font-semibold text-gray-900 text-center mt-2">
                  {product.label}
                </h3>
                <Button
                  className="mt-4 w-[60%] flex items-center justify-center gap-2 rounded-lg bg-yellow-600 text-white font-semibold hover:bg-yellow-500 transition cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    openModal(product)
                  }}
                >
                  View Details <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <Footer />
      <ScrollIndicator />

      {/* Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={closeModal}>
        <DialogContent className="max-w-lg w-full rounded-2xl shadow-xl p-6">
          <DialogHeader className="pb-2 border-b border-gray-200 relative">
            <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
              {selectedProduct?.label}
            </DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="flex flex-col items-center mt-6">
              <Image
                src={selectedProduct.img}
                alt={selectedProduct.label}
                width={350}
                height={220}
                className="object-contain rounded-xl mb-6"
              />

              <div className="w-full bg-gray-50 p-5 rounded-xl shadow-inner space-y-4 relative">
                <p className="absolute -top-5 left-2 text-gray-700 font-semibold text-sm tracking-wide">
                  Description
                </p>
                <div className="text-left space-y-3">
                  {selectedProduct.details.map((line, idx) => (
                    <p key={idx} className="text-gray-400 text-sm font-medium">
                      <span className="text-gray-900">{"> "}</span>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TechnicalPage

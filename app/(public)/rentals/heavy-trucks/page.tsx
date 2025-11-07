"use client"

import Header from '@/components/custom/header-white'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import Footer from '@/components/custom/footer'
import ScrollIndicator from '@/components/custom/scroll-indicator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

const products = [
  {
    img: "/assets/img/rentals/items/dryvan.png",
    label: "Dry Van",
    details: ["6 Wheels", "4 Wheels", "PER KM TRUCKING AS PER QUOTATION"]
  },
  {
    img: "/assets/img/rentals/items/generator.png",
    label: "Generator",
    details: ["25 KVA", "45 KVA", "60 KVA"]
  },
  {
    img: "/assets/img/rentals/items/loader.png",
    label: "Loader",
    details: ["10 Wheelers", "Max Load: 25 Tons", "PER KM TRUCKING AS PER QUOTATION"]
  },
  {
    img: "/assets/img/rentals/items/prime.png",
    label: "Prime Mover",
    details: ["10 Wheels", "6 Wheels", "PER KM TRUCKING AS PER QUOTATION"]
  },
  {
    img: "/assets/img/rentals/items/roller.png",
    label: "Roller",
    details: ["1 Ton (Walk Behind)", "w/o Operator", "w/o Fuel", "3,000/Day"]
  },
  {
    img: "/assets/img/rentals/items/placeholder.png",
    label: "Low Bed Double Axel",
    details: [
      "Length: 19ft ",
      "Width: 10ft",
      "Height: 4ft",
      "Max Load: 25 Tons",
      "As per quotation w/ Prime Mover"
    ]
  },
  {
    img: "/assets/img/rentals/items/placeholder.png",
    label: "Flat Bed Triple Axel",
    details: [
      "Length: 37ft",
      "Width: 9ft",
      "Height: 5.3ft",
      "Max Load: 50 Tons",
      "As per quotation w/ Prime Mover"
    ]
  },
  {
    img: "/assets/img/rentals/items/placeholder.png",
    label: "Boom Truck",
    details: [
      "2 units",
      " (2.5 Tons; 3 Stages)",
      "1 unit ",
      "(3.0 Tons; 5 Stages)"
    ]
  },
  {
    img: "/assets/img/rentals/items/placeholder.png",
    label: "Fighter Self Loader",
    details: [
      "7 Tons / 6 Wheelers"
    ]
  },
  {
    img: "/assets/img/rentals/items/placeholder.png",
    label: "Forklift",
    details: [
      "2 units 3.5 Tons",
      "1 unit 5.0 Tons",
      "1 unit 10 Tons"
    ]
  },
  {
    img: "/assets/img/rentals/items/placeholder.png",
    label: "Crane",
    details: [
      "5 Tons",
      "25 Tons"
    ]
  },
  {
    img: "/assets/img/rentals/items/placeholder.png",
    label: "Backhoe",
    details: [
      "0.08 CBM",
      "0.30 CBM",
      "0.40 CBM",
      "0.50 CBM",
      "0.55 CBM",
      "0.75 CBM",
      "0.80 CBM"
    ]
  }
]

function Page() {
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null)

  const openModal = (product: typeof products[0]) => setSelectedProduct(product)
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
          <span className="font-medium text-gray-600">Heavy Trucks & Equipments</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8"
        >
          {products.map((product, idx) => (
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

      <Dialog open={!!selectedProduct} onOpenChange={closeModal}>
        <DialogContent className="max-w-lg w-full rounded-2xl shadow-xl p-6">
          <DialogHeader className="pb-2 border-b border-gray-200 relative">
            <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
              {selectedProduct?.label}
            </DialogTitle>
          </DialogHeader>

          {/* Product Modal */}
          {selectedProduct && (
            <div
              className="flex flex-col items-center mt-6"
            >
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
                  {selectedProduct.label === "Generator" ? (
                    <>
                      <p className="text-gray-800 font-semibold text-base">Apparent Power Rating</p>
                      {selectedProduct.details.map((line, index) => (
                        <p key={index} className="text-gray-400 text-sm font-medium">
                          <span className="text-gray-900">{"> "}</span> {line}
                        </p>
                      ))}
                    </>
                  ) : selectedProduct.label === "Dry Van" ? (
                    <>
                      <p className="text-gray-800 font-semibold text-base">Wheels</p>
                      {selectedProduct.details.slice(0, 2).map((line, idx) => (
                        <p key={idx} className="text-gray-400 text-sm font-medium">
                          <span className="text-gray-900">{"> "}</span>{line}
                        </p>
                      ))}

                      <p className="text-gray-800 font-semibold text-base mt-3">Price Rate</p>
                      <p className="text-gray-400 text-sm font-medium">
                        <span className="text-gray-900">{"> "}</span>{selectedProduct.details[2]}
                      </p>
                    </>
                  ) : selectedProduct.label === "Loader" ? (
                    <>
                      <p className="text-gray-800 font-semibold text-base">Wheels</p>
                      <p className="text-gray-400 text-sm font-medium">
                        <span className="text-gray-900">{"> "}</span>{selectedProduct.details[0]}
                      </p>

                      <p className="text-gray-800 font-semibold text-base mt-3">Max Load</p>
                      <p className="text-gray-400 text-sm font-medium">
                        <span className="text-gray-900">{"> "}</span>{selectedProduct.details[1]}
                      </p>

                      <p className="text-gray-800 font-semibold text-base mt-3">Price Rate</p>
                      <p className="text-gray-400 text-sm font-medium">
                        <span className="text-gray-900">{"> "}</span>{selectedProduct.details[2]}
                      </p>
                    </>
                  ) : selectedProduct.label === "Prime Mover" ? (
                    <>
                      <p className="text-gray-800 font-semibold text-base">Wheels</p>
                      <p className="text-gray-400 text-sm font-medium">
                        <span className="text-gray-900">{"> "}</span>{selectedProduct.details[0]}
                      </p>

                      <p className="text-gray-800 font-semibold text-base mt-3">Type</p>
                      <p className="text-gray-400 text-sm font-medium">
                        <span className="text-gray-900">{"> "}</span>{selectedProduct.details[1]}
                      </p>

                      <p className="text-gray-800 font-semibold text-base mt-3">Price Rate</p>
                      <p className="text-gray-400 text-sm font-medium">
                        <span className="text-gray-900">{"> "}</span>{selectedProduct.details[2]}
                      </p>
                    </>
                  ) : selectedProduct.label === "Crane" ? (
                    <>
                      <p className="text-gray-800 font-semibold text-base">Capacity</p>
                      {selectedProduct.details.map((line, index) => (
                        <p key={index} className="text-gray-400 text-sm font-medium">
                          <span className="text-gray-900">{"> "}</span>{line}
                        </p>
                      ))}
                    </>
                  ) : selectedProduct.label === "Backhoe" ? (
                    <>
                      <p className="text-gray-800 font-semibold text-base">Capacities in Cubic Meters</p>
                      {selectedProduct.details.map((line, index) => (
                        <p key={index} className="text-gray-400 text-sm font-medium">
                          <span className="text-gray-900">{"> "}</span>{line}
                        </p>
                      ))}
                    </>
                  ) : (
                    <>
                      {selectedProduct.details.map((line, index) => (
                        <p key={index} className="text-gray-400 text-sm font-medium">
                          <span className="text-gray-900">{"> "}</span>{line}
                        </p>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Page

"use client"

import React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import Image from "next/image"
import Header from "@/components/custom/header"

export default function Page() {
  const products = [
    { id: 1, name: "Passion Tropics", price: 130.0, image: "/assets/img/sports-center/shuttlebrew/menu/20241007_150656.jpg" },
    { id: 2, name: "Peach Mango", price: 130.0, image: "/assets/img/sports-center/shuttlebrew/menu/20241007_141958.jpg" },
    { id: 3, name: "Granny Smith", price: 130.0, image: "/assets/img/sports-center/shuttlebrew/menu/20241007_104247.jpg" },
    { id: 4, name: "Tropical", price: 130.0, image: "/assets/img/sports-center/shuttlebrew/menu/20241007_101559.jpg" },
    { id: 5, name: "Natures Harmony", price: 130.0, image: "/assets/img/sports-center/shuttlebrew/menu/espresso-soda.jpg" },
    { id: 6, name: "Strawberry Breeze", price: 130.0, image: "/assets/img/sports-center/shuttlebrew/menu/20241007_141958.jpg" },
    { id: 7, name: "Lychee Flora", price: 130.0, image: "/assets/img/sports-center/shuttlebrew/menu/20241007_142045.jpg" },
    { id: 8, name: "Fuji Mint Apple", price: 130.0, image: "/assets/img/sports-center/shuttlebrew/menu/20241007_101809.jpg" },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <section className="w-full min-h-screen bg-[#f5f2ec] p-6 md:p-12">
        {/* Breadcrumb */}
        <nav className="flex items-center text-gray-600 text-sm mb-6 mt-7">
          <Link href="/sports-center/shuttlebrew/#menu" className="hover:text-amber-600 font-medium transition-colors">
            Shuttlebrew
          </Link>
          <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          <span className="font-medium text-gray-600">Product</span>
          <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          <span className="font-medium text-gray-900">Sparkling Drinks</span>
        </nav>

        <div className="relative inline-block mb-6 pl-5 pt-3">
          <div className="absolute top-1 left-1 w-6 h-0.5 bg-amber-600 rounded"></div>
          <div className="absolute top-1 left-1 w-0.5 h-6 bg-amber-600 rounded"></div>
          <div className="absolute bottom-1 right-1 w-7 h-0.5 bg-amber-600 rounded translate-x-4 translate-y-3"></div>
          <div className="absolute bottom-1 right-1 w-0.5 h-7 bg-amber-600 rounded translate-x-4 translate-y-3"></div>
          <h1 className="text-3xl md:text-4xl font-bold">Sparkling Drinks</h1>
        </div>

        <p className="text-gray-700 text-base md:text-lg mb-10">
          Explore our selection of refreshing sparkling drinks, each crafted to delight your taste buds.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 mt-40">
          {products.map((product) => (
            <div
              key={product.id}
              className="relative flex flex-col items-center cursor-pointer group transform transition duration-300 hover:scale-105 mb-30"
            >
              {/* Card */}
              <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 w-64 md:w-80 pt-28 md:pt-36 text-center transition-transform duration-300 group-hover:shadow-2xl">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800">{product.name}</h3>
                <p className="text-amber-600 font-bold mt-2 text-lg md:text-2xl">₱ {product.price.toFixed(2)}</p>
                <button className="mt-6 md:mt-8 px-5 md:px-6 py-2 md:py-3 bg-amber-600 text-white rounded-lg text-sm md:text-base hover:bg-amber-700 cursor-pointer transition-transform duration-300 hover:scale-110">
                  See More
                </button>
              </div>

              {/* Circle Image */}
              <div className="absolute -top-20 md:-top-24 w-44 md:w-52 h-44 md:h-52 rounded-full overflow-hidden border-4 border-green-600 shadow-xl transition duration-500 group-hover:scale-110 group-hover:shadow-[0_0_25px_6px_rgba(34,197,94,0.6)]">
                <div className="relative w-full h-[110%] transition-transform duration-700 ease-in-out group-hover:scale-110">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

"use client"

import React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default function page() {
  return (
    <section className="w-full min-h-screen bg-[#f5f2ec] p-12">

      <nav className="flex items-center text-gray-600 text-sm mb-6">
        <Link
          href="/sports-center/shuttlebrew/#menu"
          className="hover:text-amber-600 font-medium transition-colors"
        >
          Shuttlebrew
        </Link>
        <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />

        <span className="font-medium text-gray-600">Product</span>
        <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />

        <span className="font-medium text-gray-900">Smoothies</span>
      </nav>
      <div className="relative inline-block mb-6 pl-4 pt-2">
        <div className="absolute top-1 left-1 w-6 h-0.5 bg-amber-600"></div>
        <div className="absolute top-1 left-1 w-0.5 h-6 bg-amber-600"></div>

        <div className="absolute bottom-0 right-0 w-7 h-0.5 bg-amber-600 translate-x-2 translate-y-1"></div>
        <div className="absolute bottom-0 right-0 w-0.5 h-7 bg-amber-600 translate-x-2 translate-y-1"></div>

        <h1 className="text-3xl font-semibold">Smoothies</h1>
      </div>
     
      <p className="text-lg text-gray-700">
        Here you can display all the Smoothies items, their images, descriptions, and prices.
      </p>
    </section>
  )
}

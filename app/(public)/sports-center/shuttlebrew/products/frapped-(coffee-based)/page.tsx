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

        <span className="font-medium text-gray-900">Frapped (Coffee Based)</span>
      </nav>

      <h1 className="text-3xl font-bold mb-6">Frapped (Coffee Based)</h1>
      <p className="text-lg text-gray-700">
        Here you can display all the Frapped (Coffee Based) items, their images, descriptions, and prices.
      </p>
    </section>
  )
}

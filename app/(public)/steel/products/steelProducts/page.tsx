"use client"

import PageTransitionWrapper from "@/components/custom/page-transition-wrapper"
import SteelProducts from "@/components/custom/steel-prods"
import React, { Suspense } from "react"

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen w-full bg-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
        </div>
      }
    >
      <PageTransitionWrapper>
        <SteelProducts />
      </PageTransitionWrapper>
    </Suspense>
  )
}

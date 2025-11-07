"use client"

import RoofingAccess from "@/components/custom/roofing-access"
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
      <RoofingAccess />
    </Suspense>
  )
}

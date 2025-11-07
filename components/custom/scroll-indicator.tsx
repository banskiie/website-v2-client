"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export default function ScrollIndicator() {
  const [scrollPercent, setScrollPercent] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.body.scrollHeight - window.innerHeight
      const scrolled = (scrollTop / docHeight) * 100
      setScrollPercent(scrolled)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const circleColor = scrollPercent >= 99 ? "#22c55e" : "#22c55e"

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <div className="relative w-14 h-14">
        <svg className="w-14 h-14 transform -rotate-90">
          <circle
            cx="28"
            cy="28"
            r="24"
            stroke="#e5e7eb"
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx="28"
            cy="28"
            r="24"
            stroke={circleColor}
            strokeWidth="4"
            strokeDasharray={2 * Math.PI * 24}
            strokeDashoffset={
              2 * Math.PI * 24 - (scrollPercent / 100) * (2 * Math.PI * 24)
            }
            fill="none"
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/assets/img/icon/favicon-16x16.png"
            alt="Logo"
            width={16}
            height={16}
            className="w-6 h-6"
          />
        </div>
      </div>
    </div>
  )
}

"use client"

import React, { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { CLOUD } from "@/components/custom/main-faq"

export default function Page() {
  const router = useRouter()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [comingBack, setComingBack] = useState(false)
  const [lastSelectedLocal, setLastSelectedLocal] = useState<string | null>(null)
  const [showNotification, setShowNotification] = useState(false)
  const [_isLargeScreen, setIsLargeScreen] = useState(false)

  const timeoutsRef = useRef<number[]>([])

  const ANIM_DURATION = 800
  const NAV_DELAY = 80
  const REVERSE_START_DELAY = 40

  const images = [
    {
      src: `${CLOUD}/v1764115964/_ALP1992_mygjrm.jpg`,
      id: "shuttlebrew",
      alt: "ShuttleBrew",
      label: "ShuttleBrew",
      description: "This is the best coffee shuttle experience.",
      link: "/sports-center/shuttlebrew",
    },
    {
      src: `${CLOUD}/v1764116059/Background-Badminton_vmiblr.png`,
      id: "courts",
      alt: "Sports Center",
      label: "Sports Center",
      description: "This is the best badminton court experience.",
      link: "/sports-center/courts",
    },
    {
      src: `${CLOUD}/v1764116192/_ALP9611-Enhanced-NR_mtutma.jpg`,
      id: "suites",
      alt: "Courtside Suites",
      label: "Courtside Suites",
      description: "Enjoy premium courtside suites for your games.",
      link: "/sports-center/courtside-suites",
    },
  ]

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)

    setShowNotification(true)
    const t = window.setTimeout(() => {
      setShowNotification(false)
    }, 2000)
    timeoutsRef.current.push(t)

    const last = typeof window !== "undefined" ? sessionStorage.getItem("lastSelected") : null
    if (last) {
      setLastSelectedLocal(last)
      setIsAnimating(true)
      setComingBack(true)
      setSelectedId(last)

      const t1 = window.setTimeout(() => {
        setSelectedId(null)
        setComingBack(false)
        const t2 = window.setTimeout(() => {
          setIsAnimating(false)
          sessionStorage.removeItem("lastSelected")
          setLastSelectedLocal(null)
        }, ANIM_DURATION)
        timeoutsRef.current.push(t2)
      }, REVERSE_START_DELAY)
      timeoutsRef.current.push(t1)
    }

    return () => {
      window.removeEventListener("resize", checkScreenSize)
      timeoutsRef.current.forEach((id) => window.clearTimeout(id))
      timeoutsRef.current = []
    }
  }, [])

  const handleImageClick = (id: string, link: string) => {
    setIsAnimating(true)
    sessionStorage.setItem("lastSelected", id)
    setLastSelectedLocal(id)
    setSelectedId(id)

    const t = window.setTimeout(() => {
      router.push(link)
    }, NAV_DELAY)
    timeoutsRef.current.push(t)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="hidden lg:block w-full h-screen overflow-hidden relative">
        <AnimatePresence>
          {images.map(({ src, id, alt, label, description, link }, idx) => {
            const isSelected = selectedId === id
            const activeIndex = selectedId
              ? images.findIndex((img) => img.id === selectedId)
              : lastSelectedLocal
                ? images.findIndex((img) => img.id === lastSelectedLocal)
                : -1

            let animateProps: any = {}
            if (selectedId) {
              if (isSelected) {
                animateProps = { width: "100%", left: 0, zIndex: 30 }
              } else {
                animateProps =
                  idx < activeIndex
                    ? { width: "100%", left: "-100%", zIndex: 10 }
                    : { width: "100%", left: "100%", zIndex: 10 }
              }
            } else {
              animateProps = { width: "33.333%", left: `${idx * 33.333}%`, zIndex: 10 }
            }

            let initialProps: any
            if (comingBack && lastSelectedLocal) {
              const selIdx = images.findIndex((img) => img.id === lastSelectedLocal)
              if (id === lastSelectedLocal) {
                initialProps = { width: "100%", left: 0, zIndex: 20 }
              } else {
                initialProps =
                  idx < selIdx
                    ? { width: "0%", left: "-100%", zIndex: 10 }
                    : { width: "0%", left: "100%", zIndex: 10 }
              }
            } else {
              initialProps = { width: "33.333%", left: `${idx * 33.333}%` }
            }

            return (
              <motion.div
                key={id}
                initial={initialProps}
                animate={animateProps}
                transition={{ duration: ANIM_DURATION / 1000, ease: [0.4, 0.72, 0, 1] }}
                className="absolute top-0 h-full cursor-pointer"
                onClick={() => !isAnimating && handleImageClick(id, link)}
              >
                <div className="relative w-full h-full overflow-hidden group">
                  <motion.div
                    className="w-full h-full"
                    whileHover={!selectedId ? { scale: 1.08 } : {}}
                    transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                  >
                    <Image
                      src={src}
                      alt={alt}
                      fill
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
                      priority
                      blurDataURL={src}
                    />
                  </motion.div>

                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition duration-500"></div>

                  <AnimatePresence>
                    {!isAnimating && (
                      <motion.div
                        initial={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.38, ease: "easeInOut" }}
                        className="absolute top-[75px] left-12 text-white z-10"
                      >
                        <span className="text-3xl font-semibold tracking-wider">{label}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!isAnimating && (
                    <div className="absolute bottom-14 left-12 text-white z-10">
                      <span className="block text-base font-semibold mb-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                        {label}
                      </span>
                      <p className="text-base font-normal mb-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-200">
                        {description}
                      </p>
                      <span className="text-white hover:underline text-base inline-block opacity-0 -translate-x-6 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-600 delay-300">
                        Explore →
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <div className="block lg:hidden w-full h-screen relative">
        <AnimatePresence>
          {images.map(({ src, id, alt, label, description, link }, idx) => {
            const isSelected = selectedId === id
            const activeIndex = selectedId
              ? images.findIndex((img) => img.id === selectedId)
              : lastSelectedLocal
                ? images.findIndex((img) => img.id === lastSelectedLocal)
                : -1

            let animateProps: any = {}
            if (selectedId) {
              if (isSelected) {
                animateProps = { height: "100vh", top: 0, zIndex: 30 }
              } else {
                animateProps =
                  idx < activeIndex
                    ? { height: "100vh", top: "-100%", zIndex: 10 }
                    : { height: "100vh", top: "100%", zIndex: 10 }
              }
            } else {
              animateProps = { height: "33.333vh", top: `${idx * 33.333}%`, zIndex: 10 }
            }

            let initialProps: any
            if (comingBack && lastSelectedLocal) {
              const selIdx = images.findIndex((img) => img.id === lastSelectedLocal)
              if (id === lastSelectedLocal) {
                initialProps = { height: "100vh", top: 0, zIndex: 20 }
              } else {
                initialProps =
                  idx < selIdx
                    ? { height: "0%", top: "-100%", zIndex: 10 }
                    : { height: "0%", top: "100%", zIndex: 10 }
              }
            } else {
              initialProps = { height: "33.333vh", top: `${idx * 33.333}%` }
            }

            return (
              <motion.div
                key={id}
                initial={initialProps}
                animate={animateProps}
                transition={{ duration: ANIM_DURATION / 1000, ease: [0.4, 0.72, 0, 1] }}
                className="absolute left-0 w-full cursor-pointer"
                onClick={() => !isAnimating && handleImageClick(id, link)}
              >
                <div className="relative w-full h-full overflow-hidden group">
                  <motion.div
                    className="w-full h-full"
                    whileHover={!selectedId ? { scale: 1.08 } : {}}
                    transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                  >
                    <Image
                      src={src}
                      alt={alt}
                      fill
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
                      priority
                    />
                  </motion.div>

                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition duration-500"></div>

                  <AnimatePresence>
                    {!isAnimating && (
                      <motion.div
                        initial={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.38, ease: "easeInOut" }}
                        className="absolute top-[75px] left-12 text-white z-10"
                      >
                        <span className="text-3xl font-semibold tracking-wider">{label}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!isAnimating && (
                    <div className="absolute bottom-14 left-12 text-white z-10">
                      <span className="block text-base font-semibold mb-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                        {label}
                      </span>
                      <p className="text-base font-normal mb-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-200">
                        {description}
                      </p>
                      <span className="text-white hover:underline text-base inline-block opacity-0 -translate-x-6 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-600 delay-300">
                        Explore →
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{
              duration: 0.45,
              ease: "easeInOut",
            }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 
                 bg-blue-900 text-white px-6 py-3 
                 rounded-full shadow-lg z-50"
          >
            Please select one of the images to visit a page
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
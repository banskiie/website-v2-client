"use client"

import { useRef } from "react"
import { motion, useMotionValue, useSpring, useTransform, useInView } from "framer-motion"
import Image from "next/image"
import { CircleDollarSign, Facebook, Phone } from "lucide-react"

export default function TableTennisSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 20 })
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 20 })

  const isInView = useInView(sectionRef, { amount: 0.1 })
  const scrollYProgress = useMotionValue(0)

  const y = useTransform(scrollYProgress, [0, 1], [0, -50])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const rotateYVal = ((x / rect.width) - 0.5) * 20
    const rotateXVal = -((y / rect.height) - 0.5) * 20

    rotateX.set(rotateXVal)
    rotateY.set(rotateYVal)
  }

  const handleMouseLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <section
      id="tb-rates"
      ref={sectionRef}
      className="py-20 px-6 md:px-16 bg-gray-100 overflow-x-visible relative"
    >
      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            ref={cardRef}
            className="relative w-[140%] lg:w-[150%] h-96 lg:h-[500px] group perspective-1000 -ml-20 lg:-ml-32 z-0"
            style={{ y: isInView ? y : 0 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="absolute inset-0 border-4 border-[#cfbe00] rounded-xl -translate-x-2 -translate-y-2 shadow-xl transition-transform duration-500 group-hover:rotate-2 group-hover:-translate-x-1 group-hover:-translate-y-1"></div>
            <div className="absolute inset-0 border-2 border-white rounded-xl translate-x-2 translate-y-2 shadow-lg transition-transform duration-500 group-hover:-rotate-2 group-hover:translate-x-1 group-hover:translate-y-1"></div>

            <motion.div
              className="relative w-full h-full rounded-xl overflow-hidden transform transition-transform duration-700"
              style={{ rotateX: springRotateX, rotateY: springRotateY, transformPerspective: 1000 }}
            >
              <Image
                src="/assets/img/sports-center/court/DSC_0052.png"
                alt="Table Tennis Room"
                fill
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
              <div className="absolute top-4 left-4 bg-[#cfbe00] text-black font-semibold px-3 py-1 rounded-full text-sm shadow">
                Fully Air-Conditioned
              </div>
            </motion.div>
          </motion.div>

          <div className="relative z-10">
            <div className="bg-white/90 p-6 rounded-xl shadow-lg backdrop-blur-md">
              <h2 className="text-xl md:text-2xl font-bold text-[#002522] mb-4">
                Avail Now for Our Table Tennis with Fully Air-Conditioned Room
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Come and play Table Tennis with C-ONE Sports Center&apos;s fully air-conditioned room.
                We have <span className="font-semibold">3 tables</span> and paddles available for you,
                your family, and friends to enjoy!
              </p>

              <div className="mb-6">
                <div className="flex items-center text-[#002522] font-base">
                  <CircleDollarSign className="w-5 h-5 mr-2 text-[#cfbe00]" />
                  Court Pricing
                </div>
                <p className="ml-7 text-sm font-base text-gray-800 font-medium">₱150.00 / HR</p>
              </div>

              <div className="mb-6">
                <div className="flex items-center text-[#002522] font-base">
                  <Phone className="w-5 h-5 mr-2 text-[#cfbe00]" />
                  Contact Number
                </div>
                <p className="ml-7 text-sm text-gray-800 font-medium">+63 917-1344-695</p>
              </div>

              <div>
                <div className="flex items-center text-[#002522] font-base">
                  <Facebook className="w-5 h-5 mr-2 text-[#cfbe00]" />
                  Facebook Page
                </div>
                <p className="ml-7 text-sm font-medium text-gray-800">C-ONE Badminton Courts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

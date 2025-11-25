"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { CLOUD } from "./main-faq"

export default function QualitySection() {
  return (
    <section className="w-full bg-[#FFFFFF] py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 relative">

      <div className="relative max-w-[2000px] mx-auto rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl -mt-10 sm:-mt-16 md:-mt-24">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.1 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1 }}
        >
          <Image
            src={`${CLOUD}/v1764038557/c_one_background_hjai7k.jpg`}
            alt="C-ONE Background"
            fill
            className="object-cover transition-opacity duration-700 ease-out"
            loading="lazy"
            blurDataURL={`${CLOUD}/v1764038557/c_one_background_hjai7k.jpg`}
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </motion.div>

        <div className="relative text-white flex flex-col items-center justify-center text-center py-32 sm:py-44 md:py-60 px-4 sm:px-8 md:px-12">
          <motion.h2
            className="font-joanna text-xl md:text-3xl lg:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            Quality You Can Build On
          </motion.h2>

          <motion.p
            className="font-joanna text-base md:text-xl lg:text-2xl font-medium max-w-3xl mb-10 tracking-wider"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Durable Materials. Reliable Service. Proven Results. <br />
            Your one-stop partner for materials, rentals, and full project support.
          </motion.p>

          <motion.button
            className="flex items-center gap-3 cursor-pointer bg-white/10 backdrop-blur-md border border-white/30 text-white font-medium text-sm md:text-md lg:text-lg px-10 py-4 rounded-full hover:bg-white/20 transition-all"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span>Let&apos;s Start</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="lg:w-6 lg:h-6 md:w-4 md:h-4 w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.button>
        </div>
      </div>
    </section>
  )
}

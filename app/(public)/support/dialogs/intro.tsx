"use client"

import { motion } from "framer-motion"
import { MessageCircle } from "lucide-react"

const PulsingIcon = ({ 
  icon: Icon, 
  className = "", 
  iconClassName = "" 
}: { 
  icon: any
  className?: string
  iconClassName?: string
}) => (
  <div className={`relative aspect-square ${className}`}>
    <motion.div
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0.6, 0, 0.6],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute inset-0 rounded-full bg-green-400"
    />
    <div className="relative bg-green-100 p-3 rounded-full shadow-xl aspect-square flex items-center justify-center">
      <Icon className={`text-green-600 ${iconClassName}`} />
    </div>
  </div>
)

export function IntroAnimation() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-[#eef3ff] to-[#e2e8ff] relative overflow-hidden px-4">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className="relative flex items-center justify-center"
      >
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border-[3px] border-green-400"
            style={{
              width: `clamp(60px, 15vw, 128px)`,
              height: `clamp(60px, 15vw, 128px)`,
            }}
            initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
            animate={{
              opacity: [0, 1, 0.5, 1],
              scale: [0.8, 1.1, 0.9, 1],
              rotate: i * 30,
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "easeInOut",
              delay: i * 0.05,
            }}
          />
        ))}

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
          transition={{ duration: 1.2, delay: 1.2, ease: "easeOut" }}
          className="relative"
        >
          <PulsingIcon
            icon={MessageCircle}
            className="w-[80px] h-[80px] md:w-[160px] md:h-[160px] lg:w-32 lg:h-32"
            iconClassName="w-10 h-10 md:w-14 md:h-14 lg:w-10 lg:h-10"
          />
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 2.5 }}
        className="mt-10 text-center text-2xl md:text-3xl font-semibold text-gray-800"
      >
        Welcome to <span className="text-green-600">C-ONE</span> Live Support
      </motion.h1>
    </div>
  )
}
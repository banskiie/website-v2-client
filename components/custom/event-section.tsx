"use client"

import React from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Calendar, Users } from "lucide-react"
import { CLOUD } from "./main-faq"

const events = [
  {
    title: "C-One Badminton Tournament V9 2026",
    date: "Aug 21, 2026",
    type: "Upcoming",
    participants: 32,
    image: `${CLOUD}/v1764120746/no_img_hsdism.png`,
    link: "/sports-center/tournaments/2026-badminton",
  },
  {
    title: "KCZ 2025",
    date: "Aug 12, 2025",
    type: "Past",
    participants: 20,
    image: `${CLOUD}/v1764120746/no_img_hsdism.png`,
    link: "/sports-center/tournaments/kcz-2025",
  },
  {
    title: "C-One Badminton Tournament V8 2025",
    date: "Aug 21, 2025",
    type: "Past",
    participants: 40,
    image: `${CLOUD}/v1764120595/v8_uip3jv.jpg`,
    link: "/sports-center/tournaments/badminton-tournament-2025",
  },
]

export default function EventsSection() {
  return (
    <section className="w-full relative py-20 px-4 md:px-16">
      <div className="absolute inset-0">
        <Image
          src={`${CLOUD}/v1764047597/rentals-bg_cblsrb.png`}
          alt="Events Background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <motion.div
        className="relative max-w-6xl mx-auto text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          Sports Center Events
        </h2>
        <p className="text-lg md:text-xl text-gray-200">
          Join upcoming tournaments or check out past events and results!
        </p>
      </motion.div>

      <div
        className="
    relative max-w-6xl mx-auto 
    grid grid-cols-1 gap-8 
    md:grid-cols-2 md:justify-center md:gap-x-12 md:gap-y-4
    lg:grid-cols-3 lg:justify-normal lg:gap-8
  "
      >
        {events.map((event, idx) => (
          <motion.div
            key={idx}
            className={`
      bg-white backdrop-blur-md rounded-xl overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer flex flex-col
      md:w-[340px] lg:w-auto 
      ${idx === 2 ? 'md:col-span-2 md:justify-self-center lg:col-span-1' : ''}
    `}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.2 }}
          >
            <div className="relative w-full h-48 md:h-56 overflow-hidden group bg-black">
              <motion.div
                className="absolute inset-0"
                whileHover={{ scale: [1, 0.95], objectPosition: ["center", "top"] }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              </motion.div>
              <span
                className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-semibold ${event.type === "Upcoming"
                  ? "bg-green-600 text-white"
                  : "bg-gray-500 text-white"
                  }`}
              >
                {event.type}
              </span>
            </div>

            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-xl font-semibold mb-2 drop-shadow-md">
                {event.title}
              </h3>
              <div className="flex items-center text-gray-500 mb-4 space-x-4">
                <div className="flex items-center gap-1">
                  <Calendar size={16} /> <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={16} /> <span>{event.participants} participants</span>
                </div>
              </div>
              <a
                href={event.link}
                className={`mt-auto inline-block text-center px-4 py-2 rounded-md font-medium text-white ${event.type === "Upcoming"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-600 hover:bg-gray-700"
                  } transition`}
              >
                {event.type === "Upcoming" ? "Register Now" : "View Results"}
              </a>
            </div>
          </motion.div>
        ))}
      </div>

    </section>
  )
}

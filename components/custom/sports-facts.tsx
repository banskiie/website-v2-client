"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity, Heart, Users, Zap, Brain, Shield } from "lucide-react";

const badmintonFacts = [
  {
    title: "Full-Body Workout",
    description:
      "Badminton engages your entire body, helping improve strength, flexibility, and endurance.",
    icon: Activity,
    color: "text-green-600",
  },
  {
    title: "Cardio & Fitness",
    description:
      "Playing badminton boosts your heart rate, improves circulation, and keeps you fit.",
    icon: Heart,
    color: "text-red-500",
  },
  {
    title: "Fun & Social",
    description:
      "A great way to connect with friends and meet new players while staying active.",
    icon: Users,
    color: "text-blue-500",
  },
]

const tableTennisFacts = [
  {
    title: "Hand-Eye Coordination",
    description:
      "Table Tennis improves reflexes, precision, and coordination with fast-paced gameplay.",
    icon: Zap,
    color: "text-yellow-500",
  },
  {
    title: "Mental Agility",
    description:
      "Enhances strategic thinking and sharpens concentration during every match.",
    icon: Brain,
    color: "text-purple-500",
  },
  {
    title: "Low Impact Fitness",
    description:
      "A fun sport suitable for all ages that helps maintain fitness without strain.",
    icon: Shield,
    color: "text-teal-500",
  },
]

export default function SportsFact() {
  return (
    <section className="w-full bg-gray-50 py-20 px-4 md:px-16">
      <motion.div
        className="max-w-6xl mx-auto text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl md:text-5xl font-extrabold text-green-700 mb-4">
          Did You Know?
        </h2>
        <p className="text-lg md:text-xl text-gray-700">
          Discover interesting facts about Badminton and Table Tennis. Stay fit,
          have fun, and improve your skills!
        </p>
        <div className="mt-4 flex justify-center gap-4">
          <motion.a
            href="https://sportadvice-en.decathlon.com.hk/badminton-top-15-health-benefits-of-playing-badminton"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-700 font-semibold hover:underline flex items-center"
            whileHover={{ scale: 1.1, y: -5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            Read More &rarr;
          </motion.a>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto mb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {badmintonFacts.map((fact, idx) => {
          const Icon = fact.icon;
          return (
            <motion.div
              key={idx}
              className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-2xl transition-shadow  cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
            >
              <div className={`w-12 h-12 mb-4 ${fact.color}`}>
                <Icon size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-green-700">{fact.title}</h3>
              <p className="text-gray-600">{fact.description}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {tableTennisFacts.map((fact, idx) => {
          const Icon = fact.icon;
          return (
            <motion.div
              key={idx}
              className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-2xl transition-shadow  cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
            >
              <div className={`w-12 h-12 mb-4 ${fact.color}`}>
                <Icon size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-red-700">{fact.title}</h3>
              <p className="text-gray-600">{fact.description}</p>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Plus, Minus } from "lucide-react"

function FaqsTourna() {
  const [openItem, setOpenItem] = useState<string | undefined>(undefined)

  const faqs = [
    {
      title: "Uncompromising Quality",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      title: "Customized Services",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      title: "Reliable Delivery",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      title: "Customer-Centric Approach",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      title: "Industry Expertise",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
  ]

  return (
    <div className="flex flex-col items-center text-center px-4">
      <motion.h2
        className="text-2xl lg:text-4xl font-bold text-black mb-4"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        Got Questions? We’ve Got Answers!
      </motion.h2>

      <motion.p
        className="text-sm lg:text-lg text-black/80 lg:max-w-xl mb-10"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } },
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        Your Questions about our Steel Products and Services — Learn More about C-ONE
      </motion.p>

      <motion.div
        className="w-full max-w-xl text-left"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <Accordion
          type="single"
          collapsible
          value={openItem}
          onValueChange={(val) => setOpenItem(val)}
        >
          {faqs.map((faq, idx) => {
            const value = `item-${idx}`
            const isOpen = openItem === value

            return (
              <AccordionItem key={idx} value={value}>
                <AccordionTrigger className="flex justify-between items-center text-base lg:text-lg font-medium text-black cursor-pointer">
                  <span>{faq.title}</span>
                  <span className="ml-auto flex">
                    {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-black/80 text-sm lg:text-base">
                  {faq.content}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </motion.div>
    </div>
  )
}

export default FaqsTourna

"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Facebook, Instagram } from "lucide-react"

export default function LocationSection() {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<string | null>(null)
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setStatus(null)

        try {
            const res = await fetch("/api/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, message }),
            })

            const data = await res.json()

            if (data.success) {
                setStatus("Your message has been sent successfully!")
                setEmail("")
                setMessage("")
            } else {
                setStatus("Failed to send your message. Please try again.")
            }
        } catch (error) {
            console.error(error)
            setStatus("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="w-full relative py-20 px-4 md:px-16 bg-white">
            <motion.div
                className="max-w-6xl mx-auto text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
                    Visit C-ONE Sports Center
                </h2>
                <p className="text-lg md:text-xl text-gray-700">
                    Come and enjoy our premium Badminton and Table Tennis facilities. Heres where you can find us:
                </p>
            </motion.div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                <div className="w-full flex flex-row md:flex-col rounded-xl overflow-hidden shadow-lg">
                    <div className="w-full h-80 md:h-96 overflow-hidden flex flex-col">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3879.292081809595!2d124.6394518!3d8.5001149!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32fff30019327e95%3A0xf0787044cac856fe!2sC-ONE%20Sports%20Center!5e0!3m2!1sen!2sph!4v1694420000000!5m2!1sen!2sph"
                            width="100%"
                            height="100%"
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="w-full h-full rounded-xl"
                        ></iframe>

                    </div>

                    <motion.div
                        className="w-full flex flex-col justify-center 
             px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 mb-4 sm:mb-6 md:mb-8"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={{
                            visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
                            hidden: { opacity: 0 },
                        }}
                    >
                        <motion.p
                            className="text-gray-400 font-medium 
               text-center sm:text-center md:text-left 
               text-sm sm:text-base md:text-lg lg:text-center"
                            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                            transition={{ duration: 0.5 }}
                        >
                            Visit us on our social media:
                        </motion.p>

                        <div className="flex justify-center items-center mt-3 sm:mt-4 md:mt-5 lg:mt-6">
                            <div className="flex flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-5  justify-center items-center">
                                {[
                                    {
                                        href: "https://www.facebook.com/coneconesportscenter/",
                                        label: "Fb",
                                        bg: "bg-blue-600",
                                        hoverBg: "bg-blue-700",
                                        icon: <Facebook />,
                                    },
                                    {
                                        href: "https://www.instagram.com/coneconesportscenter/",
                                        label: "IG",
                                        bg: "bg-pink-500",
                                        hoverBg: "bg-pink-600",
                                        icon: <Instagram />,
                                    },
                                ].map((item, index) => (
                                    <motion.a
                                        key={index}
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`text-white 
          w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 
          rounded-xl flex items-center justify-center ${item.bg} shadow-md`}
                                        whileHover={{
                                            scale: 1.1,
                                            boxShadow: "0px 8px 15px rgba(0,0,0,0.3)",
                                            backgroundColor: item.hoverBg,
                                        }}
                                        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <motion.span
                                            className="flex items-center justify-center 
            w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8"
                                            whileHover={{ y: [-2, -5, -2] }}
                                            transition={{ duration: 0.5, repeat: Infinity, repeatType: "loop" }}
                                        >
                                            {item.icon}
                                        </motion.span>
                                    </motion.a>
                                ))}
                            </div>
                        </div>

                    </motion.div>
                </div>
                <motion.div
                    className="bg-white p-8 rounded-xl shadow-lg flex flex-col justify-center space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h3 className="text-2xl font-semibold text-gray-800">
                        Get in Touch
                    </h3>
                    <p className="text-gray-600">
                        Have questions or want to book a session? Reach out to us below:
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input
                            type="email"
                            required
                            placeholder="Your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <textarea
                            required
                            placeholder="Your message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 h-32 resize-none"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-700 text-white px-4 py-2 rounded-md font-medium hover:bg-green-800 transition disabled:opacity-50"
                        >
                            {loading ? "Sending..." : "Send Inquiry"}
                        </button>
                    </form>

                    {status && <p className="text-sm text-gray-600 pt-2">{status}</p>}

                    <div className="pt-4 border-t border-gray-200">
                        <p className="text-gray-600">
                            Contact: <span className="font-medium text-green-700">+63 917-705-9132</span>
                        </p>
                        <p className="text-gray-600">
                            Email: <span className="font-medium text-green-700">inquiry@c-one.ph</span>
                        </p>
                        <p className="text-gray-600">
                            Location: Cagayan de Oro City, Philippines
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

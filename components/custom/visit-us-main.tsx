"use client";

import { Clock, MapPin, Phone } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";

export default function VisitUsSection() {
    return (
        <section className="relative w-full py-16 px-6 md:px-20 bg-white overflow-hidden">
            <div
                className="absolute inset-0 bg-[radial-gradient(#b7e4c7_2px,transparent_2px)] [background-size:24px_24px] opacity-30"
                aria-hidden="true"
            />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="relative z-10 text-center mb-12"
            >
                <h2 className="font-judson text-5xl font-bold text-gray-900">Visit Us</h2>
                <p className="font-judson mt-3 text-gray-600 text-lg max-w-2xl mx-auto">
                    We’re here to serve you! Stop by our location to discuss your steel needs,
                    get expert advice, or explore our products. Our team is ready to assist you
                    with quality steel solutions.
                </p>
            </motion.div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-10 px-4 md:px-8">
                <div className="flex flex-col gap-4 w-full max-w-md text-left lg:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="bg-green-50 rounded-xl p-4 shadow-sm flex items-start gap-4"
                    >
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-b from-[#00AB4D] to-[#00BF63] shadow-md">
                            <Phone className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-gray-700 text-lg font-semibold font-judson">
                                Phone Number
                            </p>
                            <p className="text-gray-600 mt-1 font-judson">+63 917 629 7457</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-b from-[#FEFCE8] to-[#FFFBEB] rounded-xl p-4 shadow-sm flex items-start gap-4"
                    >
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-b from-[#FDB913] to-[#FFA500] shadow-md">
                            <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-gray-700 font-semibold font-judson">Our Location</p>
                            <p className="text-gray-600 mt-1 font-judson">
                                Zone A-1, Taytay<br />City of El Salvador<br />Misamis Oriental
                            </p>
                            <a
                                href="https://www.google.com/maps/place/C-ONE+STEEL/@8.5400202,124.5376785,17z"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 text-sm mt-1 inline-block hover:underline font-judson"
                            >
                                View on Google Maps
                            </a>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        viewport={{ once: true }}
                        className="bg-green-50 rounded-xl p-4 shadow-sm flex items-start gap-4"
                    >
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-b from-[#00AB4D] to-[#00BF63] shadow-md">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-gray-700 font-semibold font-judson">Business Hours</p>
                            <p className="text-gray-600 mt-1 font-judson">
                                Monday – Friday: <span className="font-bold">8:00 AM – 5:00 PM</span><br />
                                Saturday: <span className="font-bold">8:00 AM – 12:00 PM</span><br />
                                Sunday: <span className="font-bold">Closed</span>
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-b from-[#FEFCE8] to-[#FFFBEB] border border-[#FDB913]/30 rounded-xl p-4 text-center shadow-sm"
                    >
                        <p className="text-md text-gray-700 font-judson">
                            <span className="text-green-700 font-semibold">Need directions?</span>{" "}
                            We’re located in the heart of Taytay, easily accessible from major roads.
                            Call us if you need assistance finding our location!
                        </p>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 w-full max-w-lg md:max-w-2xl lg:max-w-[750px]"
                >
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3879.081809595!2d124.5376731!3d8.5400149!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32fff53ca949a1d7%3A0x776357fb78fef53!2sC-ONE%20STEEL!5e0!3m2!1sen!2sph!4v1694420000000!5m2!1sen!2sph"
                        allowFullScreen
                        loading="lazy"
                        className="border-0 w-full h-[350px] md:h-[450px] lg:h-[500px]"
                    />
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="relative z-10 mt-16 bg-white rounded-2xl shadow-[inset_0_2px_6px_rgba(0,0,0,0.20)] p-10 text-center max-w-5xl mx-auto"
            >
                <h3 className="font-judson text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    Why Visit C-ONE STEEL?
                </h3>
                <p className="font-judson text-gray-700 max-w-3xl mx-auto mb-8">
                    As your trusted steel supplier in Misamis Oriental, we offer premium quality
                    steel products, competitive pricing, and exceptional customer service. Visit
                    us to experience the difference!
                </p>

                <div className="font-judson flex flex-col md:flex-row justify-center items-center gap-8 text-base text-gray-700">
                    <div>
                        <p>✓ <span className="font-semibold">Quality Products</span></p>
                        <p>Premium steel materials</p>
                    </div>
                    <div>
                        <p>✓ <span className="font-semibold">Expert Advice</span></p>
                        <p>Knowledgeable staff ready to help</p>
                    </div>
                    <div>
                        <p>✓ <span className="font-semibold">Great Service</span></p>
                        <p>Customer satisfaction guaranteed</p>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}

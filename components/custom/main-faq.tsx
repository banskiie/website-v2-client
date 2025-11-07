"use client";

import Image from "next/image";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";

export default function FAQSection() {
    return (
        <section className="relative w-full bg-white py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,_#e5e7eb_1px,_transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

            <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
                {/* Left Image */}
                <div className="flex justify-center md:justify-start">
                    <Image
                        src="/FAQ.png"
                        alt="FAQ Illustration"
                        width={450}
                        height={450}
                        className="object-contain w-[80%] sm:w-[70%] md:w-auto"
                    />
                </div>

                {/* Right Content */}
                <div className="relative z-10 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8 md:p-10">
                    <div className="rounded-full shadow-md bg-white w-20 h-9 sm:h-10 flex items-center justify-center mb-4 mx-auto md:mx-0">
                        <p className="text-green-600 font-medium text-sm sm:text-base">
                            FAQs
                        </p>
                    </div>

                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center md:text-left">
                        Frequently Asked Questions
                    </h2>

                    <p className="text-gray-600 mb-8 max-w-md text-center md:text-left text-sm sm:text-base">
                        Curious about what{" "}
                        <span className="text-green-600 font-semibold">C-ONE</span> can do
                        for you? Explore our FAQs to discover how our platform helps you
                        connect, collaborate, and create effortlessly.
                    </p>

                    {/* Accordion */}
                    <Accordion
                        type="single"
                        collapsible
                        className="w-full space-y-4 text-sm sm:text-base"
                    >
                        <AccordionItem value="item-1">
                            <AccordionTrigger>What is C-ONE?</AccordionTrigger>
                            <AccordionContent>
                                C-ONE is a comprehensive platform designed to simplify project
                                collaboration, resource management, and communication for teams
                                of any size.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-2">
                            <AccordionTrigger>What services does C-ONE offer?</AccordionTrigger>
                            <AccordionContent>
                                We provide services including material rentals, logistics
                                support, and full project assistance for industrial and
                                construction operations.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-3">
                            <AccordionTrigger>
                                How can I request a quote or order services?
                            </AccordionTrigger>
                            <AccordionContent>
                                You can request a quote directly through our website or by
                                contacting our sales team via the contact page.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-4">
                            <AccordionTrigger>
                                What materials and equipment do you use?
                            </AccordionTrigger>
                            <AccordionContent>
                                We use high-quality, durable materials and top-grade equipment
                                sourced from trusted suppliers to ensure reliability and safety.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-5">
                            <AccordionTrigger>
                                What are the service areas or coverage locations?
                            </AccordionTrigger>
                            <AccordionContent>
                                Our services are available nationwide, with dedicated teams
                                ready to assist across various key locations.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </section>
    )
}

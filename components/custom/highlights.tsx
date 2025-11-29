"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { CLOUD } from "./main-faq"

const highlights = [
    {
        id: 1,
        image: `${CLOUD}/v1764118209/2_t2c0ok.png`,
        badge: "Kumbira 2025",
        date: "October 15 – 17,2025",
        title: "Winner at the Latte Art Contest ",
        description: `Warm congratulations to our very own Luke Anthony Lim Navales for winning the Latte Art Contest at Kumbira 2025, held last October 15–17, 2025 at the Limketkai Atrium, Cagayan de Oro City! ☕✨

Your dedication, creativity, and love for coffee continue to inspire us every single day. From every pour to every design, your passion reminds us that coffee is truly an art from the heart. 💫

We couldn't be prouder to have you on the ShuttleBrew team — keep chasing dreams and creating beautiful moments, one cup at a time. 💚`,
    },
    {
        id: 2,
        image: `${CLOUD}/v1764118312/557267221_122144346476406293_1247136813454960039_n_jgicqu.jpg`,
        badge: "BREW FESTIVAL 2025",
        date: "September 26 – 28, 2025",
        title: "BREW FESTIVAL 2025 ",
        description: `From September 26–28, 2025, our ShuttleBrew baristas had a journey to remember at the Brew Festival in Ayala Malls Centrio. 

         It wasn't just about the competition—it was about passion, friendship, and the love for coffee that brought everyone together. Every cup poured carried dedication, every smile shared created connections, and every moment was a reminder of why we brew. 🌿

We're beyond proud of our team for stepping up, representing ShuttleBrew, and bringing home not just experiences, but memories that will inspire us for years to come. 🙌🤎`,
    },
    {
        id: 3,
        image: `${CLOUD}/v1764118394/coc_bl05vv.jpg`,
        badge: "ORO BEST EXPO 2025", //𝐂𝐃𝐎 𝐎𝐑𝐎 𝐂𝐇𝐀𝐌𝐁𝐄𝐑 𝐎𝐅 𝐂𝐎𝐌𝐌𝐄𝐑𝐂𝐄 
        date: "October 30 – 31, 2025",
        title: "3RD PLACER - CDO ORO CHAMBER OF COMMERCE",
        description: `Huge Congratulations to our very own champions! ✨

We are incredibly proud of Barista Rolly for winning Champion – Latte Art Category, and Barista Luke for placing 3rd at the recent 𝗢𝗥𝗢 𝗕𝗘𝗦𝗧 𝗘𝗫𝗣𝗢 𝟮𝟬𝟮𝟱  by the 𝐂𝐃𝐎 𝐎𝐑𝐎 𝐂𝐇𝐀𝐌𝐁𝐄𝐑 𝐎𝐅 𝐂𝐎𝐌𝐌𝐄𝐑𝐂𝐄, held at Ayala Centrio Mall! 

Your passion, creativity, and dedication to your craft inspire us every day. Thank you for representing us with excellence — you truly make the Shuttle Brew family proud! 💛🔥

Here's to more brews, more wins, and more milestones ahead! 🚀`,
    },
]

export default function HighlightsSection() {
    return (
        <section className="relative w-full py-20 px-6 md:px-20 bg-[#fff9f4] overflow-hidden">
            <motion.div
                className="flex justify-between items-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8 }}
            >
                <div>
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-medium text-[#5c3d1e] tracking-tight">
                        Highlights
                    </h2>
                </div>

                <p className="text-[#5c3d1e]/80 font-nunito-sans text-base md:text-lg max-w-sm text-right">
                    Happenings in the{" "}
                    <span className="text-[#f38a12] font-semibold">ShuttleBrew</span>
                </p>
            </motion.div>

            <div className="border-t-2 border-dashed border-[#5c3d1e]/30 mb-16"></div>

            <div className="space-y-32">
                {highlights.map((item, index) => {
                    const isEven = index % 2 !== 0
                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className={`flex flex-col ${isEven ? "lg:flex-row-reverse" : "lg:flex-row"
                                } items-center gap-10 md:gap-16`}
                        >
                            <div className="relative w-full lg:w-1/2">
                                <div className="overflow-hidden rounded-2xl shadow-lg">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        width={1000}
                                        height={600}
                                        className="object-cover w-full h-[350px] md:h-[450px] lg:h-[500px] transition-transform duration-700 hover:scale-105"
                                        loading="lazy"
                                        blurDataURL={item.image}
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#fda12f]/10 via-transparent to-[#f38a12]/10 rounded-2xl blur-2xl -z-10"></div>
                            </div>

                            <div className="w-full lg:w-1/2 text-center lg:text-left">
                                <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                                    <span className="px-4 py-1.5 bg-[#5c3d1e] text-[#fcefdc] rounded-full text-sm font-nunito-sans font-semibold">
                                        {item.badge}
                                    </span>
                                    <span className="text-[#5c3d1e]/70 font-nunito-sans text-sm">
                                        {item.date}
                                    </span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-extrabold text-[#3a2a1a] font-nunito-sans mb-4">
                                    {item.title}
                                </h3>
                                <p className="text-[#5c3d1e]/90 font-nunito-sans text-lg leading-relaxed" style={{ whiteSpace: "pre-line" }}>
                                    {item.description}
                                </p>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            <div className="mt-24 border-t-2 border-dashed border-[#5c3d1e]/30"></div>
        </section>
    )
}
// IBAGO NI SA BROWN CREME THEME

"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import FloatingCard from "@/components/custom/floating-card"
import { CLOUD } from "./main-faq"

type ElementType = "cup" | "light"

export default function ShuttleBrewExperience() {
    const [elements, setElements] = useState<
        {
            type: ElementType
            size: number
            top: number
            left: number
            opacity: number
            rotate: number
            duration: number
            xDrift: number
            yDrift: number
            sway: number
        }[]
    >([])

    useEffect(() => {
        const generated = Array.from({ length: 20 }, () => {
            const rand = Math.random()
            const type: ElementType = rand < 0.3 ? "cup" : "light"
            return {
                type,
                size: Math.floor(Math.random() * 30) + 20,
                top: Math.random() * 90,
                left: Math.random() * 100,
                opacity: Math.random() * 0.3 + 0.3,
                rotate: (Math.random() * 30) - 15,
                duration: Math.random() * 8 + 6,
                xDrift: (Math.random() * 40) - 20,
                yDrift: (Math.random() * 30) - 15,
                sway: Math.random() * 20 - 10,
            }
        })
        setElements(generated)
    }, [])

    const renderElement = (el: typeof elements[0]) => {
        switch (el.type) {
            case "cup":
                return (
                    <motion.svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 64 64"
                        fill="currentColor"
                        className="w-full h-full text-[#C19A6B]"
                    >
                        <rect x="16" y="28" width="32" height="20" rx="6" fill="currentColor" />
                        <ellipse cx="32" cy="28" rx="16" ry="4" fill="currentColor" />
                        <path
                            d="M48 32c4 4 0 12-4 12"
                            stroke="currentColor"
                            strokeWidth={3}
                            fill="none"
                            strokeLinecap="round"
                        />
                        <motion.path
                            d="M24 28c0-6 6-6 6-12s-6-6-6-12"
                            stroke="#fff"
                            strokeWidth={2}
                            fill="none"
                            strokeLinecap="round"
                            animate={{
                                y: [0, -8, -16, -24],
                                rotate: [0, 3, -3, 0],
                                opacity: [0.6, 0.4, 0.2, 0],
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.path
                            d="M32 28c0-5 5-5 5-10s-5-5-5-10"
                            stroke="#fff"
                            strokeWidth={2}
                            fill="none"
                            strokeLinecap="round"
                            animate={{
                                y: [0, -6, -12, -18],
                                rotate: [0, -3, 3, 0],
                                opacity: [0.6, 0.4, 0.2, 0],
                            }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.path
                            d="M40 28c0-4 4-4 4-8s-4-4-4-8"
                            stroke="#fff"
                            strokeWidth={2}
                            fill="none"
                            strokeLinecap="round"
                            animate={{
                                y: [0, -5, -10, -15],
                                rotate: [0, 2, -2, 0],
                                opacity: [0.5, 0.3, 0.1, 0],
                            }}
                            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </motion.svg>
                )
            case "light":
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="6" fill="rgba(255, 220, 180, 0.2)" />
                    </svg>
                )
            default:
                return null
        }
    }

    return (
        <div
            id="experience-section"
            className="w-full relative bg-[#3a1b07] py-32 px-6 md:px-20 flex flex-col items-center text-center overflow-hidden"
        >
            {elements.map((el, i) => (
                <motion.div
                    key={i}
                    className="absolute"
                    style={{
                        top: `${el.top}%`,
                        left: `${el.left}%`,
                        width: `${el.size}px`,
                        height: `${el.size}px`,
                        color: `rgba(255, 230, 180, ${el.opacity})`,
                        zIndex: 0,
                    }}
                    animate={{
                        x: [0, el.xDrift, 0],
                        y: [0, -el.yDrift, 0],
                        rotate: [0, el.rotate, -el.rotate, 0],
                        opacity: el.opacity,
                    }}
                    transition={{
                        duration: el.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.1,
                    }}
                >
                    {renderElement(el)}
                </motion.div>
            ))}

            <motion.h2
                className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FFBC52] to-[#B45309] mb-10 relative z-10"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1 }}
            >
                The ShuttleBrew Experience
            </motion.h2>

            <motion.p
                className="text-gray-200 text-lg md:text-xl max-w-3xl mb-16 relative z-10"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1, delay: 0.3 }}
            >
                More than just coffee — enjoy the perfect vibe, freshly roasted beans, and exclusive offers crafted for café lovers.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl relative z-10">
                <FloatingCard
                    img={`${CLOUD}/v1764118899/hcd_wk6cg1.jpg`}
                    title="Happy International Coffee Day"
                    description="This year’s theme, “Embracing Collaboration More Than Ever,” reminds us that every cup of coffee is a story of teamwork — from farmers growing the beans, to roasters perfecting the flavor, to baristas crafting each cup with care, and to YOU, our coffee community, who share in the joy of every sip. "
                    delay={0}
                />
                <FloatingCard
                    img={`${CLOUD}/v1773111910/beans_q4flfw.png`}
                    title="Freshly Roasted Beans"
                    description="Only the finest beans are hand-selected and roasted for peak flavor."
                    delay={0.2}
                />
                <FloatingCard
                    img={`${CLOUD}/v1764118912/3_qn77lk.jpg`}
                    title="Exclusive Specials"
                    description="Enjoy seasonal drinks, promotions, and unique coffee blends only at ShuttleBrew."
                    delay={0.4}
                />
            </div>
        </div>
    )
}


// 2nd
// "use client"

// import { motion } from "framer-motion"
// import { useEffect, useState } from "react"
// import FloatingCard from "@/components/custom/floating-card"

// type ElementType = "cup" | "light"

// export default function ShuttleBrewExperience() {
//     const [elements, setElements] = useState<
//         {
//             type: ElementType
//             size: number
//             top: number
//             left: number
//             opacity: number
//             rotate: number
//             duration: number
//             xDrift: number
//             yDrift: number
//             sway: number
//         }[]
//     >([])

//     useEffect(() => {
//         const generated = Array.from({ length: 30 }, () => {
//             const rand = Math.random()
//             const type: ElementType = rand < 0.3 ? "cup" : "light"
//             return {
//                 type,
//                 size: Math.floor(Math.random() * 30) + 20,
//                 top: Math.random() * 90,
//                 left: Math.random() * 100,
//                 opacity: Math.random() * 0.3 + 0.3,
//                 rotate: (Math.random() * 30) - 15,
//                 duration: Math.random() * 8 + 6,
//                 xDrift: (Math.random() * 40) - 20,
//                 yDrift: (Math.random() * 30) - 15,
//                 sway: Math.random() * 20 - 10,
//             }
//         })
//         setElements(generated)
//     }, [])

//     const renderElement = (el: typeof elements[0]) => {
//         switch (el.type) {
//             case "cup":
//                 return (
//                     <motion.svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         viewBox="0 0 64 64"
//                         fill="currentColor"
//                         className="w-full h-full text-[#C19A6B]"
//                     >
//                         <rect x="16" y="28" width="32" height="20" rx="6" fill="currentColor" />
//                         <ellipse cx="32" cy="28" rx="16" ry="4" fill="currentColor" />
//                         <path
//                             d="M48 32c4 4 0 12-4 12"
//                             stroke="currentColor"
//                             strokeWidth={3}
//                             fill="none"
//                             strokeLinecap="round"
//                         />
//                         <motion.path
//                             d="M24 28c0-6 6-6 6-12s-6-6-6-12"
//                             stroke="#fff"
//                             strokeWidth={2}
//                             fill="none"
//                             strokeLinecap="round"
//                             animate={{
//                                 y: [0, -8, -16, -24],
//                                 rotate: [0, 3, -3, 0],
//                                 opacity: [0.6, 0.4, 0.2, 0],
//                             }}
//                             transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
//                         />
//                         <motion.path
//                             d="M32 28c0-5 5-5 5-10s-5-5-5-10"
//                             stroke="#fff"
//                             strokeWidth={2}
//                             fill="none"
//                             strokeLinecap="round"
//                             animate={{
//                                 y: [0, -6, -12, -18],
//                                 rotate: [0, -3, 3, 0],
//                                 opacity: [0.6, 0.4, 0.2, 0],
//                             }}
//                             transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
//                         />
//                         <motion.path
//                             d="M40 28c0-4 4-4 4-8s-4-4-4-8"
//                             stroke="#fff"
//                             strokeWidth={2}
//                             fill="none"
//                             strokeLinecap="round"
//                             animate={{
//                                 y: [0, -5, -10, -15],
//                                 rotate: [0, 2, -2, 0],
//                                 opacity: [0.5, 0.3, 0.1, 0],
//                             }}
//                             transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
//                         />
//                     </motion.svg>
//                 )
//             case "light":
//                 return (
//                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
//                         <circle cx="12" cy="12" r="6" fill="rgba(255, 220, 180, 0.2)" />
//                     </svg>
//                 )
//             default:
//                 return null
//         }
//     }

//     return (
//         <div
//             id="experience-section"
//             className="w-full relative bg-[#143324] py-32 px-6 md:px-20 flex flex-col items-center text-center overflow-hidden"
//         >
//             {elements.map((el, i) => (
//                 <motion.div
//                     key={i}
//                     className="absolute"
//                     style={{
//                         top: `${el.top}%`,
//                         left: `${el.left}%`,
//                         width: `${el.size}px`,
//                         height: `${el.size}px`,
//                         color: `rgba(255, 230, 180, ${el.opacity})`,
//                         zIndex: 0,
//                     }}
//                     animate={{
//                         x: [0, el.xDrift, 0],
//                         y: [0, -el.yDrift, 0],
//                         rotate: [0, el.rotate, -el.rotate, 0],
//                         opacity: el.opacity,
//                     }}
//                     transition={{
//                         duration: el.duration,
//                         repeat: Infinity,
//                         ease: "easeInOut",
//                         delay: i * 0.1,
//                     }}
//                 >
//                     {renderElement(el)}
//                 </motion.div>
//             ))}

//             <motion.h2
//                 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-[#F3F2ED] mb-10 relative z-10"
//                 initial={{ opacity: 0, y: 50 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true, amount: 0.3 }}
//                 transition={{ duration: 1 }}
//             >
//                 The ShuttleBrew Experience
//             </motion.h2>

//             <motion.p
//                 className="text-[#F3F2ED] text-lg md:text-xl max-w-3xl mb-16 relative z-10"
//                 initial={{ opacity: 0, y: 50 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true, amount: 0.3 }}
//                 transition={{ duration: 1, delay: 0.3 }}
//             >
//                 More than just coffee — enjoy the perfect vibe, freshly roasted beans, and exclusive offers crafted for café lovers.
//             </motion.p>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl relative z-10">
//                 <FloatingCard
//                     img="/assets/img/sports-center/shuttlebrew/menu/1.jpg"
//                     title="Cozy Ambience"
//                     description="Relax in our inviting atmosphere, perfect for work, study, or meeting friends."
//                     delay={0}
//                 />
//                 <FloatingCard
//                     img="/assets/img/sports-center/shuttlebrew/menu/2.jpg"
//                     title="Freshly Roasted Beans"
//                     description="Only the finest beans are hand-selected and roasted for peak flavor."
//                     delay={0.2}
//                 />
//                 <FloatingCard
//                     img="/assets/img/sports-center/shuttlebrew/menu/3.jpg"
//                     title="Exclusive Specials"
//                     description="Enjoy seasonal drinks, promotions, and unique coffee blends only at ShuttleBrew."
//                     delay={0.4}
//                 />
//             </div>
//         </div>
//     )
// }

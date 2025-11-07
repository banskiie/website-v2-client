"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function VisitUsSection() {
  const [beans, setBeans] = useState<
    { size: number; top: number; left: number; opacity: number; rotate: number; duration: number; xDrift: number; yDrift: number }[]
  >([])

  useEffect(() => {
    const generatedBeans = Array.from({ length: 15 }, () => ({
      size: Math.floor(Math.random() * 30) + 20,
      top: Math.floor(Math.random() * 90),
      left: Math.floor(Math.random() * 100),
      opacity: Math.random() * 0.25 + 0.2,
      rotate: (Math.random() * 30) - 15,
      duration: Math.random() * 10 + 8,
      xDrift: (Math.random() * 30) - 15,
      yDrift: (Math.random() * 20) - 10,
    }))
    setBeans(generatedBeans)
  }, [])

  return (
    <div className="relative w-full bg-[#FFF0E5] py-24 px-6 md:px-20 text-center overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        {beans.map((bean, index) => (
          <motion.div
            key={index}
            className="absolute"
            style={{
              top: `${bean.top}%`,
              left: `${bean.left}%`,
              width: `${bean.size}px`,
              height: `${bean.size}px`,
              color: `rgba(139,94,60,${bean.opacity})`,
            }}
            animate={{
              x: [0, bean.xDrift, 0],
              y: [0, -bean.yDrift, 0],
              rotate: [0, bean.rotate, -bean.rotate, 0],
            }}
            transition={{ duration: bean.duration, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="currentColor">
              <path d="M32 2C20 2 12 18 12 32s8 30 20 30 20-16 20-30S44 2 32 2zm0 4c9.94 0 16 12 16 26S41.94 58 32 58 16 46 16 32 22.06 6 32 6z" />
              <path d="M28 10c-6 8-6 36 0 44 1 1 3 0 2-1-5-7-5-34 0-42 1-1-1-2-2-1z" />
            </svg>
          </motion.div>
        ))}
      </div>

      <motion.h2
        className="relative text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-[#FFBC52] to-[#B45309] mb-6 z-10"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1 }}
      >
        Visit Us
      </motion.h2>

      <motion.p
        className="relative text-[#7A3E18] text-lg md:text-xl max-w-2xl mx-auto mb-10 z-10"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        Come experience ShuttleBrew in person — great coffee, warm vibes, and a community that feels like home.
      </motion.p>

      <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-lg mb-10 z-10">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3879.292081809595!2d124.6394518!3d8.5001149!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32fff30019327e95%3A0xf0787044cac856fe!2sC-ONE%20Sports%20Center!5e0!3m2!1sen!2sph!4v1694420000000!5m2!1sen!2sph"
          width="100%"
          height="350"
          allowFullScreen
          loading="lazy"
          className="border-0 w-full h-[350px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="relative z-10"
      >
        <a
          href="https://www.google.com/maps/place/ShuttleBrew+Coffee+Shop/@8.5001182,124.6394385,1169m/data=!3m2!1e3!4b1!4m6!3m5!1s0x32fff30000cb1cd9:0x3e795eb7c067f7c!8m2!3d8.5001129!4d124.6420134!16s%2Fg%2F11wpztntx9?entry=ttu&g_ep=EgoyMDI1MDkxMC4wIKXMDSoASAFQAw%3D%3D"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-linear-to-r from-[#FFBC52] to-[#B45309] text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:opacity-90 transition"
        >
          Get Directions
        </a>
      </motion.div>
    </div>
  )
}

// 2nd one


// "use client"

// import { motion } from "framer-motion"
// import { useEffect, useState } from "react"

// export default function VisitUsSection() {
//   const [beans, setBeans] = useState<
//     { size: number; top: number; left: number; opacity: number; rotate: number; duration: number; xDrift: number; yDrift: number }[]
//   >([])

//   useEffect(() => {
//     const generatedBeans = Array.from({ length: 15 }, () => ({
//       size: Math.floor(Math.random() * 30) + 20,
//       top: Math.floor(Math.random() * 90),
//       left: Math.floor(Math.random() * 100),
//       opacity: Math.random() * 0.25 + 0.2,
//       rotate: (Math.random() * 30) - 15,
//       duration: Math.random() * 10 + 8,
//       xDrift: (Math.random() * 30) - 15,
//       yDrift: (Math.random() * 20) - 10,
//     }))
//     setBeans(generatedBeans)
//   }, [])

//   return (
//     <div className="relative w-full bg-[#F3F2ED] py-24 px-6 md:px-20 text-center overflow-hidden">
//       {/* Beans background wrapper */}
//       <div className="absolute inset-0 z-0 pointer-events-none">
//         {beans.map((bean, index) => (
//           <motion.div
//             key={index}
//             className="absolute"
//             style={{
//               top: `${bean.top}%`,
//               left: `${bean.left}%`,
//               width: `${bean.size}px`,
//               height: `${bean.size}px`,
//               color: `rgba(139,94,60,${bean.opacity})`,
//             }}
//             animate={{
//               x: [0, bean.xDrift, 0],
//               y: [0, -bean.yDrift, 0],
//               rotate: [0, bean.rotate, -bean.rotate, 0],
//             }}
//             transition={{ duration: bean.duration, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="currentColor">
//               <path d="M32 2C20 2 12 18 12 32s8 30 20 30 20-16 20-30S44 2 32 2zm0 4c9.94 0 16 12 16 26S41.94 58 32 58 16 46 16 32 22.06 6 32 6z" />
//               <path d="M28 10c-6 8-6 36 0 44 1 1 3 0 2-1-5-7-5-34 0-42 1-1-1-2-2-1z" />
//             </svg>
//           </motion.div>
//         ))}
//       </div>

//       {/* Section content */}
//       <motion.h2
//         className="relative text-4xl md:text-6xl font-extrabold text-[#143324]/90 mb-6 z-10"
//         initial={{ opacity: 0, y: 50 }}
//         whileInView={{ opacity: 1, y: 0 }}
//         viewport={{ once: true, amount: 0.3 }}
//         transition={{ duration: 1 }}
//       >
//         Visit Us
//       </motion.h2>

//       <motion.p
//         className="relative text-[#143324]/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 z-10"
//         initial={{ opacity: 0, y: 50 }}
//         whileInView={{ opacity: 1, y: 0 }}
//         viewport={{ once: true, amount: 0.3 }}
//         transition={{ duration: 1, delay: 0.3 }}
//       >
//         Come experience ShuttleBrew in person — great coffee, warm vibes, and a community that feels like home.
//       </motion.p>

//       <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-lg mb-10 z-10">
//         <iframe
//           src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3879.292081809595!2d124.6394518!3d8.5001149!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32fff30019327e95%3A0xf0787044cac856fe!2sC-ONE%20Sports%20Center!5e0!3m2!1sen!2sph!4v1694420000000!5m2!1sen!2sph"
//           width="100%"
//           height="350"
//           allowFullScreen
//           loading="lazy"
//           className="border-0 w-full h-[350px]"
//         />
//       </div>

//       <motion.div
//         initial={{ opacity: 0, y: 30 }}
//         whileInView={{ opacity: 1, y: 0 }}
//         viewport={{ once: true, amount: 0.3 }}
//         transition={{ duration: 1, delay: 0.5 }}
//         className="relative z-10"
//       >
//         <a
//           href="https://www.google.com/maps/place/Courtside+Suites/@8.5001211,124.6393863,1169m/data=!3m2!1e3!4b1!4m6!3m5!1s0x32fff3001aa17ef3:0xc01cdb364269b417!8m2!3d8.5001158!4d124.6419612!16s%2Fg%2F11x16q80kj?entry=ttu"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="inline-block bg-[#143324]/90 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:opacity-90 hover:scale-95 transition"
//         >
//           Get Directions
//         </a>
//       </motion.div>
//     </div>
//   )
// }

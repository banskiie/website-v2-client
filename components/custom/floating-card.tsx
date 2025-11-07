// import { motion } from "framer-motion";

// export default function FloatingCard({
//   img,
//   title,
//   description,
//   delay = 0,
// }: {
//   img: string
//   title: string
//   description: string
//   delay?: number
// }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 50 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       whileHover={{ y: -10, scale: 1.05 }}
//       viewport={{ once: true, amount: 0.3 }}
//       transition={{ duration: 0.3, delay }}
//       className="bg-[#20140c]/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden text-center flex flex-col cursor-pointer"
//     >
//       <div className="w-full h-64 md:h-72 lg:h-80 relative">
//         <img
//           src={img}
//           alt={title}
//           className="w-full h-full object-cover"
//         />
//       </div>

//       <div className="p-6 md:p-8">
//         <h3 className="text-xl md:text-2xl font-bold mb-3 bg-gradient-to-r from-[#fff8f0] to-[#fada8a] bg-clip-text text-transparent">
//           {title}
//         </h3>
//         <p className="text-gray-200 text-sm md:text-base leading-relaxed">
//           {description}
//         </p>
//       </div>
//     </motion.div>

//   )
// }
import { motion } from "framer-motion"
import Image from "next/image"

export default function FloatingCard({
  img,
  title,
  description,
  delay = 0,
}: {
  img: string
  title: string
  description: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10, scale: 1.05 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.3, delay }}
      className="bg-white text-[#143324] backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden text-center flex flex-col cursor-pointer"
    >
      <div className="w-full h-64 md:h-72 lg:h-80 relative">
        <Image
          src={img}
          alt={title}
          fill
          loading="lazy"
          className="object-cover"
          sizes="(max-width: 768px) 100vw,
                 (max-width: 1200px) 50vw,
                 33vw"
        />
      </div>

      <div className="p-6 md:p-8">
        <h3 className="text-xl md:text-2xl font-bold mb-3 bg-clip-text text-gray-900">
          {title}
        </h3>
        <p className="text-gray-700 text-sm md:text-base leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  )
}
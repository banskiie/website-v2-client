// "use client";

// import { motion, AnimatePresence } from "framer-motion";
// import Image from "next/image";
// import Link from "next/link";
// import React from "react";

// type FeatureSectionProps = {
//   items: {
//     id: number;
//     title: string;
//     description: string;
//     img: string;
//     badgeColor: string;
//     badgeNum: string;
//     activeColor: string;
//     link: string;
//   }[];
//   activeIndex: number;
//   setActiveIndex: (index: number) => void;
// };

// export default function FeatureSection({
//   items,
//   activeIndex,
//   setActiveIndex,
// }: FeatureSectionProps) {
//   const activeItem = items[activeIndex];

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
//       <AnimatePresence mode="wait">
//         <motion.div
//           key={activeItem.id}
//           initial={{ opacity: 0, x: 50 }}
//           animate={{ opacity: 1, x: 0 }}
//           exit={{ opacity: 0, x: 50 }}
//           transition={{ duration: 0.6, ease: "easeOut" }}
//           className="relative p-6 rounded-md bg-white shadow min-w-[362px]"
//         >
//           <div
//             className="absolute -top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
//             style={{ backgroundColor: activeItem.badgeColor }}
//           >
//             {activeItem.badgeNum}
//           </div>

//           <h3 className="text-lg font-bold uppercase text-gray-900 mb-2">
//             {activeItem.title}
//           </h3>
//           <p className="text-gray-700 text-sm leading-relaxed mb-6">
//             {activeItem.description}
//           </p>
//           <Link
//             href={activeItem.link}
//             className="inline-block px-4 py-2 text-sm font-semibold text-white rounded-md transition-colors duration-300"
//             style={{ backgroundColor: activeItem.activeColor }}
//           >
//             Learn More →
//           </Link>
//         </motion.div>
//       </AnimatePresence>


//       <div className="flex flex-col items-start relative">
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={activeItem.id + "-img"}
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: 50 }}
//             transition={{ duration: 0.6, ease: "easeOut" }}
//             className="w-full"
//           >
//             <div
//               className="absolute -top-6 -right-6 w-16 h-16 rotate-45 z-0"
//               style={{ backgroundColor: activeItem.activeColor }}
//             ></div>

//             <div className="relative z-10 bg-[#F4F3EE] p-2">
//               <div className="bg-white p-2 relative w-full h-auto">
//                 <Image
//                   src={activeItem.img}
//                   alt={activeItem.title}
//                   width={800}
//                   height={600}
//                   className="w-full h-auto object-cover"
//                 />
//               </div>
//             </div>
//           </motion.div>
//         </AnimatePresence>

//         <div className="relative z-10 mt-10 ml-10 text-sm font-semibold text-gray-800">
//           <div className="flex space-x-6 justify-start">
//             {items.map((item, index) => (
//               <span
//                 key={item.id}
//                 className="relative cursor-pointer"
//                 style={{
//                   color: activeIndex === index ? item.activeColor : "#333",
//                 }}
//                 onClick={() => setActiveIndex(index)}
//               >
//                 {item.title}
//                 <span
//                   className="absolute left-0 bottom-[-4px] h-[3px] transition-all duration-300"
//                   style={{
//                     backgroundColor: item.activeColor,
//                     width: activeIndex === index ? "100%" : "0",
//                   }}
//                 ></span>
//               </span>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// "use client";

// import { motion, AnimatePresence } from "framer-motion";
// import Image from "next/image";
// import Link from "next/link";
// import React from "react";

// type FeatureSectionProps = {
//   items: {
//     id: number;
//     title: string;
//     description: string;
//     img: string;
//     badgeColor: string;
//     badgeNum: string;
//     activeColor: string;
//     link: string;
//   }[];
//   activeIndex: number;
//   setActiveIndex: (index: number) => void;
// };

// export default function FeatureSection({
//   items,
//   activeIndex,
//   setActiveIndex,
// }: FeatureSectionProps) {
//   const activeItem = items[activeIndex];

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
//       {/* Card Section */}
//       <AnimatePresence mode="wait">
//         <motion.div
//           key={activeItem.id}
//           initial={{ opacity: 0, x: 50 }}
//           animate={{ opacity: 1, x: 0 }}
//           exit={{ opacity: 0, x: 50 }}
//           transition={{ duration: 0.6, ease: "easeOut" }}
//           className="relative p-6 rounded-md bg-white shadow min-w-[300px] order-2 md:order-1
//                      flex flex-col items-center text-center md:items-start md:text-left"
//         >
//           <div
//             className="absolute -top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
//             style={{ backgroundColor: activeItem.badgeColor }}
//           >
//             {activeItem.badgeNum}
//           </div>

//           <h3 className="text-lg font-bold uppercase text-gray-900 mb-2">
//             {activeItem.title}
//           </h3>
//           <p className="text-gray-700 text-sm leading-relaxed mb-6">
//             {activeItem.description}
//           </p>
//           <Link
//             href={activeItem.link}
//             className="inline-block px-4 py-2 text-sm font-semibold text-white rounded-md transition-colors duration-300"
//             style={{ backgroundColor: activeItem.activeColor }}
//           >
//             Learn More →
//           </Link>
//         </motion.div>
//       </AnimatePresence>

//       <div className="flex flex-col items-center md:items-start relative order-1 md:order-2">
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={activeItem.id + "-img"}
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: 50 }}
//             transition={{ duration: 0.6, ease: "easeOut" }}
//             className="w-full"
//           >
//             <div
//               className="absolute -top-6 -right-6 w-16 h-16 rotate-45 z-0"
//               style={{ backgroundColor: activeItem.activeColor }}
//             ></div>

//             <div className="relative z-10 bg-[#F4F3EE] p-2">
//               <div className="bg-white p-2 relative w-full h-auto">
//                 <Image
//                   src={activeItem.img}
//                   alt={activeItem.title}
//                   width={800}
//                   height={600}
//                   className="w-full h-auto object-cover"
//                 />
//               </div>
//             </div>
//           </motion.div>
//         </AnimatePresence>

//         <div className="relative z-10 mt-10 ml-0 md:ml-10 text-xs md:text-sm font-semibold text-gray-800 text-center md:text-left">
//           <div className="flex flex-wrap justify-center md:justify-start space-x-0 md:space-x-6 gap-4">
//             {items.map((item, index) => (
//               <span
//                 key={item.id}
//                 className="relative cursor-pointer"
//                 style={{
//                   color: activeIndex === index ? item.activeColor : "#333",
//                 }}
//                 onClick={() => setActiveIndex(index)}
//               >
//                 {item.title}
//                 <span
//                   className="absolute left-0 bottom-[-4px] h-[3px] transition-all duration-300"
//                   style={{
//                     backgroundColor: item.activeColor,
//                     width: activeIndex === index ? "100%" : "0",
//                   }}
//                 ></span>
//               </span>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type FeatureSectionProps = {
  items: {
    id: number;
    title: string;
    description: string;
    img: string;
    badgeColor: string;
    badgeNum: string;
    activeColor: string;
    link: string;
  }[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
};

export default function FeatureSection({
  items,
  activeIndex,
  setActiveIndex,
}: FeatureSectionProps) {
  const activeItem = items[activeIndex];

  return (
    <div className="max-w-[110rem] mx-auto grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-md overflow-hidden min-h-[620px] md:min-h-[680px]">
      {/* LEFT SIDE - IMAGE */}
      <div className="relative w-full h-[350px] md:h-full">
        {/* AnimatePresence only for image itself */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem.id + "-img"}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src={activeItem.img}
              alt={activeItem.title}
              fill
              className="object-cover"
            />

            <div className="absolute top-4 left-4 bg-white/90 text-gray-800 text-xs font-medium px-3 py-1 rounded shadow">
              {activeItem.title.toLowerCase() === "steel"
                ? "Taytay, El Salvador"
                : "Zone 1, Kauswagan, Cagayan De Oro"}
            </div>

          </motion.div>
        </AnimatePresence>

        <div className="absolute top-4 right-4 flex gap-2 z-20">
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setActiveIndex(index)}
              className={`w-6 h-1 rounded transition-all duration-300 ${activeIndex === index
                ? "bg-yellow-500"
                : "bg-white/90 hover:bg-white/80"
                }`}
              aria-label={`Go to ${item.title}`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeItem.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="p-10 md:p-16 flex flex-col justify-center text-left"
        >
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 uppercase mb-3 border-l-4 pl-3 border-yellow-500">
            {activeItem.title}
          </h3>

          <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-6">
            {activeItem.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-gray-800 mb-8">
            <div>
              <p className="font-semibold mb-1">Location</p>
              <p>Zone A1, Taytay City of El Salvador</p>
              <p>9017 Misamis Oriental</p>
            </div>
            <div>
              <p className="font-semibold mb-1">Business Hours</p>
              <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
              <p>Saturday: 8:00 AM - 12:00 PM</p>
              <p>Sunday: Closed</p>
            </div>
          </div>

          <Link
            href={activeItem.link}
            className="inline-flex items-center gap-2 text-[#2FB44D] font-semibold hover:underline transition-all"
          >
            Learn more <span>→</span>
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// "use client";

// import * as React from "react";
// import Image from "next/image";
// import Autoplay from "embla-carousel-autoplay";
// import { motion } from "framer-motion";
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
// } from "@/components/ui/carousel";

// const images = [
//   { src: "/assets/img/contents/swiper1.png", alt: "Featured Product 1" },
//   { src: "/assets/img/contents/swiper2.png", alt: "Featured Product 2" },
//   { src: "/assets/img/contents/swiper4.png", alt: "Featured Product 3" },
// ];

// export default function HeroCarousel() {
//   const autoplay = React.useRef(
//     Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })
//   );

//   return (
//     <div className="relative w-full h-[670px]">
//       <div className="absolute inset-0 z-20 flex items-center justify-start px-12">
//         <motion.div
//           className="max-w-6xl text-left"
//           initial={{ opacity: 0, x: -50 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 1, ease: "easeOut" }}
//         >
//           <div className="text-3xl md:text-5xl font-extrabold text-white uppercase leading-snug">
//             YOUR TRUSTED PARTNER IN STEEL SOLUTIONS, <br />
//             TRUCKS AND EQUIPMENT RENTALS AND SPORTS FACILITIES
//           </div>
//           <div className="mt-3 mb-3 w-100 h-2 bg-white"></div>

//           <p className="text-white text-sm md:text-base italic">
//             At <span className="font-bold not-italic text-white">C-ONE</span>,
//             we deliver excellence through{" "}
//             <span className="font-semibold text-blue-200 not-italic">
//               durable steel solutions
//             </span>
//             , reliable trucks and equipment for every project, and a premier
//             sports center designed for champions. Our commitment to quality and
//             service ensures lasting value in everything we do.
//           </p>

//           <motion.button
//             className="mt-6 bg-[#2FB44D] hover:bg-[#249c40] text-white px-6 py-3 rounded-md font-semibold shadow-lg"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
//           >
//             GET STARTED
//           </motion.button>
//         </motion.div>
//       </div>

//       <Carousel plugins={[autoplay.current]} className="w-full h-screen">
//         <CarouselContent>
//           {images.map((item, index) => (
//             <CarouselItem key={index}>
//               <div className="relative w-full h-[720px]">
//                 <Image
//                   src={item.src}
//                   alt={item.alt}
//                   fill
//                   priority={index === 0}
//                   className="object-cover"
//                 />
//                 <div className="absolute inset-0 bg-[#606060]/50"></div>
//               </div>
//             </CarouselItem>
//           ))}
//         </CarouselContent>
//       </Carousel>
//     </div>
//   )
// }
"use client"

import * as React from "react"
import Image from "next/image"
import Autoplay from "embla-carousel-autoplay"
import { motion } from "framer-motion"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { CLOUD } from "./main-faq"

const DRIVE = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_PUBLIC_FOLDER

const images = [
  { src: `${CLOUD}/v1764039904/swiper1_rhirnr.png`, alt: "Featured Product 1" },
  // { src: "/assets/img/contents/swiper2.png", alt: "Featured Product 2" },
  // { src: "/assets/img/contents/swiper4.png", alt: "Featured Product 3" },
]
export default function HeroCarousel() {
  const autoplay = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })
  )

  return (
    <div className="relative w-full h-[97vh]">
      <div className="absolute inset-0 z-20 flex items-center justify-center md:justify-start px-6 md:px-12">
        <motion.div
          className="max-w-7xl text-center mx-auto md:text-left lg:px-9"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h2 className="text-sm md:text-base lg:text-base font-semibold text-white mb-2 uppercase tracking-wide">
            <span className="text-[#1DE61D]"> C-ONE{" "}</span>
            Trading Corporation
          </h2>

          <div className="text-xl md:text-3xl font-extrabold text-white uppercase leading-snug">
            <span className="block md:inline">
              YOUR TRUSTED PARTNER IN STEEL SOLUTIONS,
            </span>{" "}
            <span className="block md:inline">
              TRUCKS AND EQUIPMENT RENTALS AND SPORTS FACILITIES
            </span>
          </div>

          <div className="mt-2 mb-3 mx-auto md:mx-0 w-20 md:w-100 h-[2px] md:h-2 bg-white"></div>

          <p className="text-white text-xs md:text-base italic">
            At <span className="font-bold not-italic text-white">C-ONE</span>, we deliver excellence through{" "}
            <span className="font-semibold text-blue-200 not-italic">
              durable steel solutions
            </span>
            , reliable trucks and equipment for every project, and a premier
            sports center designed for champions. Our commitment to quality and
            service ensures lasting value in everything we do.
          </p>

          <motion.button
            className="mt-6 bg-[#2FB44D] hover:bg-[#249c40] text-white px-4 py-2 md:px-6 md:py-3 rounded-md font-semibold shadow-lg text-sm md:text-base mx-auto md:mx-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
          >
            GET STARTED
          </motion.button>
        </motion.div>
      </div>

      <Carousel plugins={[autoplay.current]} className="w-full h-screen">
        <CarouselContent>
          {images.map((item, index) => (
            <CarouselItem key={index}>
              <div className="relative w-screen h-screen">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  priority={index === 0}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[#606060]/50"></div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}

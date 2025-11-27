import { Coffee } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { CLOUD } from "./main-faq"

export default function SecondSection({ scrollToMenu }: { scrollToMenu: () => void }) {
  return (
    <div
      id="second-section"
      className="relative w-full min-h-screen overflow-hidden bg-[#FFF2E6] flex flex-col lg:flex-row items-center justify-between px-6 sm:px-10 md:px-20 py-20"
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <Image
            key={i}
            src="/coffee-bean-roast-brew-svgrepo-com.svg"
            alt="Coffee Bean"
            width={60}
            height={60}
            className={`absolute opacity-10 rotate-[${Math.random() * 360}deg]`}
            style={{
              top: `${Math.random() * 40}%`,
              left: `${Math.random() * 45}%`,
            }}
          />
        ))}

        {[...Array(3)].map((_, i) => (
          <Coffee
            key={`cup-${i}`}
            size={80}
            className="absolute text-[#7B5C45]/20"
            style={{
              top: `${Math.random() * 40}%`,
              left: `${Math.random() * 45}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>

      <motion.h1
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[120%] text-[8rem] sm:text-[10rem] md:text-[14rem] lg:text-[18rem] font-extrabold text-[#d6bfa6] opacity-20 select-none pointer-events-none whitespace-nowrap z-0"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1 }}
      >
        ShuttleBrewf
      </motion.h1>

      <motion.div
        className="absolute top-0 left-0 z-10"
        initial={{ opacity: 0, y: -130 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <Image
          src={`${CLOUD}/v1764116604/_ALP9323_uewrgm.jpg`}
          alt="ShuttleBrew Gallery"
          width={900}
          height={1100}
          loading="lazy"
          className="object-cover shadow-lg h-[970px]"
        />
      </motion.div>

      <div className="w-full lg:w-1/2 z-20 flex flex-col items-end text-right ml-auto">
        <motion.h2
          className="relative text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-pacifico 
                    text-[#644C45] leading-[1.4] max-w-[12rem] sm:max-w-[16rem] md:max-w-[40rem] mr-70 text-center"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1 }}
        >
          <span className="absolute w-[133%] h-[122%] bg-[#D8BD92]/60 rounded-b-2xl scale-110 -translate-x-25 -translate-y-20 -z-10"></span>
          <span className="absolute w-[133%] h-[127%] bg-[#FFBC52]/70 rounded-b-2xl -translate-x-25 -translate-y-28 -z-20"></span>

          Discover
          <br />
          the Art of
          <br />
          Perfect
          <br />
          Coffee
        </motion.h2>

        <motion.div
          className="max-w-sm md:max-w-md lg:max-w-lg text-center mt-25 mr-55"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <p className="text-[#3e2b1b] text-sm sm:text-base md:text-lg leading-relaxed mb-10">
            Experience the craftsmanship behind every cup — from the finest beans to
            the perfect brew, enjoy the artistry that defines true coffee perfection.
          </p>

          <div className="flex flex-wrap justify-end gap-18 text-center mb-10">
            <div>
              <h3 className="text-3xl font-bold text-[#20140c]">50+</h3>
              <p className="text-sm text-[#3e2b1b]">Coffee Drinks</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-[#20140c]">50+</h3>
              <p className="text-sm text-[#3e2b1b]">Refresher Drinks</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-[#20140c]">5K+</h3>
              <p className="text-sm text-[#3e2b1b]">Happy Customers</p>
            </div>
          </div>

          <div className="flex flex-wrap font-pacifico gap-10 mt-4 justify-center">
            <button
              onClick={scrollToMenu}
              className="bg-[#20140c] text-[#FFF2E6] font-medium px-6 py-3 rounded-md hover:bg-[#3a2519] transition cursor-pointer"
            >
              See the Menu
            </button>
            <button className="bg-transparent border border-[#20140c] text-[#20140c] font-medium px-6 py-3 rounded-md hover:bg-[#20140c] hover:text-[#FFF2E6] transition cursor-pointer">
              Explore More
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

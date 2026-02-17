// Brown Theme

"use client"

import VisitUsSection from "@/components/custom/beans-floating"
import ShuttleBrewExperience from "@/components/custom/sb-experience"
import StoryCarousel from "@/components/custom/sb-story-section"
import ScrollIndicatorSB from "@/components/custom/scroll-indicator-sb"
import ShuttleBrewFooter from "@/components/custom/shuttle-brew-footer"
import { motion } from "framer-motion"
import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import MenuTabs from "@/components/custom/sb-menu"
import HeaderSB from "@/components/custom/header-sb"
import { Skeleton } from "@/components/ui/skeleton"
import FloatingChatWidget from "@/components/custom/ticket"
import useSmoothScroll from "@/hooks/useSmoothScroll"
import { Coffee } from "lucide-react"
import HighlightsSection from "@/components/custom/highlights"
import localFont from "next/font/local";
import { Button } from "@/components/ui/button"
import { CLOUD } from "@/components/custom/main-faq"

const Pacific = localFont({
  src: "../../../../public/assets/fonts/Pacifico.ttf",
})

const stats = [
  { label: "Coffee Drinks", value: 50 },
  { label: "Refresher Drinks", value: 50 },
  { label: "Happy Customers", value: 5000 },
]

export default function page() {
  useSmoothScroll()
  const [_slideX, setSlideX] = useState(0)
  const [counts, setCounts] = useState(stats.map(() => 0))
  const [hasAnimated, setHasAnimated] = useState(false)
  const statsRef = useRef<HTMLDivElement | null>(null)
const [heroLoaded, setHeroLoaded] = useState(false)
 const [isLoading, setIsLoading] = useState(true)
// const [buttonsLoaded, setButtonsLoaded] = useState(false)

  useEffect(() => {
    if(heroLoaded && document.readyState === "complete"){
      const timer = setTimeout(() => setIsLoading(false), 300)
      return () => clearTimeout(timer)
    }

    const handleReady = () => {
      if (heroLoaded) setIsLoading(false)
    }

    window.addEventListener("load", handleReady)
    return () => window.removeEventListener("load", handleReady)
  }, [heroLoaded])

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1).replace(".0", "") + "K"
    return num
  }

  useEffect(() => {
    if (!statsRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true)

          const duration = 2000
          const fps = 60
          const totalFrames = Math.round((duration / 1000) * fps)

          stats.forEach((stat, index) => {
            let frame = 0
            const counter = setInterval(() => {
              frame++
              const progress = frame / totalFrames
              const currentValue = Math.round(stat.value * progress)

              setCounts((prev) => {
                const newCounts = [...prev]
                newCounts[index] = currentValue
                return newCounts
              })

              if (frame === totalFrames) clearInterval(counter)
            }, duration / totalFrames)
          })
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [hasAnimated])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        if (window.innerWidth >= 1024) setSlideX(-400)
        else if (window.innerWidth >= 768) setSlideX(-300)
        else setSlideX(-150)
      }
      handleResize()
      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    }
  }, [])

  const scrollToMenu = () => {
    const menuSection = document.getElementById("menu")

    if (menuSection) {
      menuSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  {isLoading && (
  <motion.div
    initial={{ opacity: 1 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#1a0d07]"
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
      className="w-32 h-32 mb-6"
    >
      <Image
        src={`${CLOUD}/v1764048136/sb_icon_ftg2zo.png`}
        alt="Loading..."
        width={128}
        height={128}
        className="object-contain"
      />
    </motion.div>

    <div className="w-40 h-2 bg-[#3a1b07] rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-[#FFBC52] to-[#B45309]"
        initial={{ x: "-100%" }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
      />
    </div>

    <p className="mt-4 text-[#FFBC52] font-semibold text-lg tracking-wide">
      Brewing your experience...
    </p>
  </motion.div>
)}

 const generateRandomPosition = () => ({
    top: `${Math.random() * 90}%`,
    left: `${Math.random() * 90}%`,
  })

  const beanPositions = useMemo(() => Array.from({ length: 20 }, generateRandomPosition), [])
  const cupPositions = useMemo(() => Array.from({ length: 15 }, generateRandomPosition), [])

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderSB />
  <div className="w-full h-screen relative overflow-hidden">
  <div className="absolute inset-0">
  {!heroLoaded && (
    <Skeleton className="w-full h-full absolute inset-0 rounded-none" />
  )}
  <Image
    src={`${CLOUD}/v1764115964/_ALP1992_mygjrm.jpg`}
    alt="ShuttleBrew"
    fill
    className={`object-cover w-full h-full transition-opacity duration-700 ${heroLoaded ? "opacity-100" : "opacity-0"}`}
    onLoadingComplete={() => setHeroLoaded(true)}
  />
  <div className="absolute inset-0 bg-black/50" />
</div>

  <div className="absolute inset-0 flex flex-col justify-center items-center lg:items-end px-6 sm:px-10 md:px-20 z-10">
    <motion.div
      className={`${Pacific.className} text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white leading-snug lg:leading-tight text-center lg:text-right max-w-3xl lg:max-w-lg`}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1 }}
    >
      Welcome to{" "}
      <span className={`${Pacific.className} relative inline-block bg-gradient-to-b from-[#fda12f] to-[#f38a12] bg-clip-text text-transparent`}>
        ShuttleBrew
      </span>
    </motion.div>

    <motion.div
      className="mt-6 sm:mt-8 md:mt-10 flex justify-center lg:justify-end w-full"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.3 }}
    >
      <Image
        src={`${CLOUD}/v1764048136/sb_icon_ftg2zo.png`}
        alt="ShuttleBrew Icon"
        width={220}
        height={220}
        className="object-contain w-40 h-40 sm:w-40 sm:h-40 md:w-52 md:h-52 lg:w-64 lg:h-64"
      />
    </motion.div>

    <motion.p
      className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium leading-relaxed w-full max-w-3xl lg:max-w-[140%] mt-4 sm:mt-6 text-center lg:text-right"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, delay: 0.5 }}
    >
      Where every sip is a{" "}
      <span className="text-[#FFBC52] font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
        SMASH IT
      </span>
    </motion.p>

    <motion.p
      className="text-gray-300 text-base sm:text-lg md:text-xl italic leading-relaxed w-full max-w-3xl lg:max-w-[120%] mt-2 sm:mt-4 text-center lg:text-right"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, delay: 0.7 }}
    >
      Fuel your day with every sip and smash your goals with the energy and joy
      that only <span className="text-[#FFBC52] font-semibold">ShuttleBrew</span> can give.
    </motion.p>
  </div>

  <motion.div
    className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer z-20"
    animate={{ y: [0, 10, 0] }}
    transition={{ repeat: Infinity, duration: 1.5 }}
    onClick={() => {
      const secondSection = document.getElementById("second-section");
      if (secondSection) {
        secondSection.scrollIntoView({ behavior: "smooth" });
      }
    }}
  >
    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-[#FFBC52] to-[#B45309] text-white shadow-lg hover:opacity-90 transition">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </motion.div>
</div>

<div
  id="second-section"
  className="relative w-full min-h-screen overflow-hidden bg-[#FFF2E6] flex flex-col xl:flex-row items-center justify-between px-4 sm:px-6 md:px-10 lg:px-20 py-16 lg:py-20"
>
  {/* <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(2)].map((_, i) => (
      <motion.div
        key={`bean-${i}`}
        className="absolute"
        initial={generateRandomPosition()}
        animate={{
          opacity: [0, 0.7, 0],
          top: [`${Math.random() * 90}%`, `${Math.random() * 90}%`],
          left: [`${Math.random() * 90}%`, `${Math.random() * 90}%`],
          rotate: [`${Math.random() * 360}deg`, `${Math.random() * 360}deg`],
        }}
        transition={{
          duration: 10 + Math.random() * 10,
          repeat: Infinity,
          repeatDelay: Math.random() * 6,
          ease: "easeInOut",
        }}
      >
        <div className="relative w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] md:w-[80px] md:h-[80px] lg:w-[90px] lg:h-[90px]">
          <Image
            src="/coffee-bean-roast-brew-svgrepo-com.svg"
            alt="Coffee Bean"
            fill
            sizes="(max-width: 640px) 60px, (max-width: 768px) 70px, (max-width: 1024px) 80px, 90px"
            priority
            className="object-contain rotate-[20deg] opacity-90"
          />
        </div>
      </motion.div>
    ))}

    {[...Array(2)].map((_, i) => (
      <motion.div
        key={`cup-${i}`}
        className="absolute"
        initial={generateRandomPosition()}
        animate={{
          opacity: [0, 0.15, 0],
          top: [`${Math.random() * 90}%`, `${Math.random() * 90}%`],
          left: [`${Math.random() * 90}%`, `${Math.random() * 90}%`],
          rotate: [`${Math.random() * 360}deg`, `${Math.random() * 360}deg`],
        }}
        transition={{
          duration: 12 + Math.random() * 10,
          repeat: Infinity,
          repeatDelay: Math.random() * 6,
          ease: "easeInOut",
        }}
      >
        <Coffee 
          size={60} 
          className="sm:w-[70px] sm:h-[70px] md:w-[80px] md:h-[80px] lg:w-[90px] lg:h-[90px] opacity-60" 
          color="#20140c" 
        />
      </motion.div>
    ))}
  </div> */}

  <motion.h1
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[120%] text-[4rem] xs:text-[5rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem] xl:text-[14rem] 2xl:text-[18rem] font-extrabold text-[#d6bfa6]/30 opacity-10 select-none pointer-events-none whitespace-nowrap z-0"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 1 }}
  >
    ShuttleBrew
  </motion.h1>

  <motion.div
    className="hidden xl:block absolute top-0 left-0 z-10 w-full xl:w-auto"
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
      priority
      className="object-cover shadow-lg w-full h-[970px] xl:w-[900px]"
      blurDataURL={`${CLOUD}/v1764116604/_ALP9323_uewrgm.jpg`}
    />
  </motion.div>

  <div className="w-full xl:w-1/2 z-20 flex flex-col items-center xl:items-end text-center xl:text-right mt-0 xl:ml-auto">
    <motion.h2
      className={`relative text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl ${Pacific.className}
                text-[#644C45] leading-[1.3] text-center sm:leading-[1.4] max-w-[280px] xs:max-w-[320px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:mr-70`}
      initial={{ opacity: 0, y: -30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1 }}
    >
      <span className="absolute w-[133%] h-[122%] bg-[#D8BD92]/60 rounded-b-2xl scale-110 -translate-x-17 -translate-y-20 -z-10 hidden xl:block"></span>
      <span className="absolute w-[133%] h-[127%] bg-[#FFBC52]/70 rounded-b-2xl -translate-x-17 -translate-y-28 -z-20 hidden xl:block"></span>

      Discover
      <br />
      the Art of
      <br />
      Perfect
      <br />
      Coffee
    </motion.h2>

    <motion.div
      className="max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg xl:max-w-lg text-center mt-8 sm:mt-12 xl:mt-25 xl:mr-55"
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1, delay: 0.3 }}
    >
      <p className="text-[#3e2b1b] text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8 lg:mb-10">
        Experience the craftsmanship behind every cup — from the finest beans to
        the perfect brew, enjoy the artistry that defines true coffee perfection.
      </p>

      <div className="flex flex-wrap justify-center xl:justify-end gap-6 sm:gap-12 lg:gap-18 text-center mb-6 sm:mb-8 lg:mb-10">
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#20140c]">50+</h3>
          <p className="text-xs sm:text-sm text-[#3e2b1b]">Coffee Drinks</p>
        </div>
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#20140c]">50+</h3>
          <p className="text-xs sm:text-sm text-[#3e2b1b]">Refresher Drinks</p>
        </div>
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#20140c]">5K+</h3>
          <p className="text-xs sm:text-sm text-[#3e2b1b]">Happy Customers</p>
        </div>
      </div>

      <div className={`flex flex-col sm:flex-row ${Pacific.className} gap-4 sm:gap-6 lg:gap-10 mt-4 justify-center`}>
        <Button
          onClick={scrollToMenu}
          className="bg-[#20140c] text-base sm:text-lg text-[#FFF2E6] font-medium px-6! sm:px-8! py-4! sm:py-7! rounded-md hover:bg-[#3a2519] transition cursor-pointer w-full sm:w-auto"
          variant="default"
        >
          See the Menu
        </Button>
        <Button 
          className="bg-transparent text-base sm:text-lg border border-[#20140c] text-[#20140c] font-medium px-6! sm:px-8! py-4! sm:py-7! rounded-md hover:bg-[#20140c] hover:text-[#FFF2E6] transition cursor-pointer w-full sm:w-auto" 
          variant="default"
        >
          Explore More
        </Button>
      </div>
    </motion.div>
  </div>
</div>

      <div id="about-us">
        <StoryCarousel />
      </div>

      <div id="menu">
        <MenuTabs />
        {/* <Menu /> */}
      </div>

<div>
  <HighlightsSection />
</div>

      <div>
        <ShuttleBrewExperience />
      </div>

      <div>
        <VisitUsSection />
      </div>

      <div>
        <ShuttleBrewFooter />
      </div>

      <ScrollIndicatorSB />
      <FloatingChatWidget />
    </div>
  )
}


// 2nd One

// "use client"

// import VisitUsSection from "@/components/custom/beans-floating"
// import Header from "@/components/custom/header"
// import ShuttleBrewExperience from "@/components/custom/sb-experience"
// import StoryCarousel from "@/components/custom/sb-story-section"
// import ScrollIndicatorSB from "@/components/custom/scroll-indicator-sb"
// import { motion } from "framer-motion"
// import Image from "next/image"
// import { useEffect, useRef, useState } from "react"
// import Menu from "@/components/custom/menu-sb"
// import { Coffee, Dumbbell, Users } from "lucide-react"
// import Footer from "@/components/custom/footer"

// const stats = [
//   { label: "Coffee Drinks", value: 50 },
//   { label: "Refresher Drinks", value: 50 },
//   { label: "Happy Customers", value: 5000 },
// ]

// export default function page() {
//   const [slideX, setSlideX] = useState(0)
//   const [counts, setCounts] = useState(stats.map(() => 0))
//   const [hasAnimated, setHasAnimated] = useState(false)
//   const statsRef = useRef<HTMLDivElement | null>(null)
  
//   const formatNumber = (num: number) => {
//     if (num >= 1000) return (num / 1000).toFixed(1).replace(".0", "") + "K"
//     return num
//   }

//   useEffect(() => {
//     if (!statsRef.current) return

//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting && !hasAnimated) {
//           setHasAnimated(true)

//           const duration = 2000
//           const fps = 60
//           const totalFrames = Math.round((duration / 1000) * fps)

//           stats.forEach((stat, index) => {
//             let frame = 0
//             const counter = setInterval(() => {
//               frame++
//               const progress = frame / totalFrames
//               const currentValue = Math.round(stat.value * progress)

//               setCounts((prev) => {
//                 const newCounts = [...prev]
//                 newCounts[index] = currentValue
//                 return newCounts
//               })

//               if (frame === totalFrames) clearInterval(counter)
//             }, duration / totalFrames)
//           })
//         }
//       },
//       { threshold: 0.3 }
//     )

//     observer.observe(statsRef.current)
//     return () => observer.disconnect()
//   }, [hasAnimated])

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const handleResize = () => {
//         if (window.innerWidth >= 1024) setSlideX(-400)
//         else if (window.innerWidth >= 768) setSlideX(-300)
//         else setSlideX(-150)
//       }
//       handleResize()
//       window.addEventListener("resize", handleResize)
//       return () => window.removeEventListener("resize", handleResize)
//     }
//   }, [])

//   const scrollToMenu = () => {
//     const menuSection = document.getElementById("menu")

//     if (menuSection) {
//       menuSection.scrollIntoView({ behavior: "smooth" })
//     }
//   }

//   return (
//     <div className="min-h-screen flex flex-col">
//       <Header />
//       <div className="w-full h-screen relative overflow-hidden">
//         <div className="absolute inset-0">
//           <Image
//             src="/assets/img/sports-center/shuttlebrew/_ALP1992.jpg"
//             alt="ShuttleBrew"
//             fill
//             className="object-cover w-full h-full"
//           />
//           <div className="absolute inset-0 bg-black/50" />
//         </div>

//         <div className="absolute inset-y-0 right-0 mr-60 sm-20 flex flex-col justify-center items-end max-w-lg text-right z-10">
//           <motion.div
//             className="text-3xl sm:text-3xl md:text-xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-snug sm:leading-snug md:leading-snug lg:leading-tight text-right md:text-center"
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 1 }}
//           >
//             Welcome to <span className="relative inline-block bg-gradient-to-b from-[#fda12f] to-[#f38a12] bg-clip-text text-transparent">
//               ShuttleBrew
//             </span>

//           </motion.div>

//           <motion.div
//             className="w-full flex justify-center items-center mt-4 md:mt-6 lg:mt-8"
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 1, delay: 0.3 }}
//           >
//             <Image
//               src="/assets/img/sports-center/shuttlebrew/sb_icon.png"
//               alt="ShuttleBrew Icon"
//               width={220}
//               height={220}
//               className="object-contain sm:w-40 sm:h-40 md:w-52 md:h-52 lg:w-64 lg:h-64"
//             />
//           </motion.div>

//           <motion.p
//             className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-medium leading-relaxed sm:leading-relaxed md:leading-relaxed lg:leading-relaxed w-full md:w-[140%] lg:w-[120%] text-center md:text-center lg:text-right mt-4 sm:mt-6"
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 1, delay: 0.5 }}
//           >
//             Where every sip is a{' '}
//             <span className="text-[#FFBC52] font-bold text-3xl sm:text-4xl md:text-5xl lg:text-5xl leading-snug">
//               SMASH IT
//             </span>
//           </motion.p>

//           <motion.p
//             className="text-gray-300 text-base sm:text-lg md:text-xl lg:text-xl italic leading-relaxed sm:leading-relaxed md:leading-relaxed lg:leading-relaxed w-full md:w-[140%] lg:w-[120%] text-center md:text-center lg:text-right mt-2 sm:mt-4"
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 1, delay: 0.7 }}
//           >
//             Fuel your day with every sip and smash your goals with the energy and joy that only{' '}
//             <span className="text-[#FFBC52] font-semibold">ShuttleBrew</span> can give.
//           </motion.p>
//         </div>
//         <motion.div
//           className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer z-20"
//           animate={{ y: [0, 10, 0] }}
//           transition={{ repeat: Infinity, duration: 1.5 }}
//           onClick={() => {
//             const secondSection = document.getElementById("second-section");
//             if (secondSection) {
//               secondSection.scrollIntoView({ behavior: "smooth" });
//             }
//           }}
//         >
//           <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-[#FFBC52] to-[#B45309] text-white shadow-lg hover:opacity-90 transition">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="w-6 h-6"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//               strokeWidth={2}
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
//             </svg>
//           </div>
//         </motion.div>
//       </div>

//       {/* Coffee Second Section #ebeaea*/}
//       <div
//         id="second-section"
//         className="w-full h-screen relative overflow-hidden bg-[#f1f1f1] flex items-start justify-start px-10 md:px-20 pt-20"
//       >

//         <motion.h1
//           className="absolute top-1/2 left-1/2 -translate-x-[10%] -translate-y-[110%] text-[8rem] md:text-[12rem] lg:text-[16rem] font-extrabold text-[#281c14]/20 opacity-10 select-none pointer-events-none whitespace-nowrap z-0"
//           initial={{ opacity: 0, x: 50 }}
//           whileInView={{ opacity: 1, x: slideX }}
//           viewport={{ once: true, amount: 0.3 }}
//           transition={{ duration: 1 }}
//         >
//           ShuttleBrew
//         </motion.h1>

//         <motion.h1
//           className="absolute bottom-10 left-10 text-[8rem] md:text-[12rem] lg:text-[16rem] font-extrabold text-[#281c14]/20 opacity-10 select-none pointer-events-none z-0"
//           initial={{ opacity: 0, x: -100 }}
//           whileInView={{ opacity: 1, x: 0 }}
//           viewport={{ once: true, amount: 0.3 }}
//           transition={{ duration: 1, delay: 0.3 }}
//         >
//           ShuttleBrew
//         </motion.h1>

//         <div className="max-w-xl text-[#281c14] z-10">
//           <motion.h2
//             className="text-3xl sm:text-4xl md:text-8xl font-bold mb-7 mt-30"
//             initial={{ opacity: 0, x: -50 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             viewport={{ once: true, amount: 0.3 }}
//             transition={{ duration: 1 }}
//           >
//             Discover the Art of Perfect Coffee
//           </motion.h2>

//           <motion.p
//             className="text-sm sm:text-xs md:text-base leading-relaxed mb-10"
//             initial={{ opacity: 0, x: -50 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             viewport={{ once: true, amount: 0.3 }}
//             transition={{ duration: 1, delay: 0.3 }}
//           >
//             Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
//           </motion.p>

//           <div className="flex gap-4 mt-4">
//             <button
//               onClick={scrollToMenu}
//               className="bg-white text-[#20140c] font-semibold px-6 py-3 rounded-md hover:opacity-90 border border-black transition hover:bg-black hover:text-white cursor-pointer"
//             >
//               See the Menu
//             </button>
//             <button className="bg-black border border-black text-white font-semibold px-6 py-3 rounded-md hover:bg-white hover:text-[#20140c] transition cursor-pointer">
//               Explore More
//             </button>
//           </div>

//           <div ref={statsRef} className="flex gap-x-36 mt-20">
//             {stats.map((stat, index) => (
//               <div key={index} className="flex flex-col items-center whitespace-nowrap">
//                 <span className="text-3xl md:text-4xl font-bold">
//                   {formatNumber(counts[index])}
//                   <span className="ml-1 font-normal">+</span>
//                 </span>
//                 <span className="text-sm md:text-base text-gray-700">{stat.label}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         <motion.div
//           className="absolute top-0 right-0 mt-15 mr-20 md:mt-1 md:-mr-50 z-10"
//           initial={{ opacity: 0, rotate: -2.5, scale: 0.9 }}
//           whileInView={{ opacity: 1, rotate: -12.5, scale: 1 }}
//           viewport={{ once: true, amount: 0.3 }}
//           transition={{ duration: 1, delay: 0.5 }}
//         >
//           <Image
//             src="/assets/img/sports-center/shuttlebrew/cofee.png"
//             alt="Coffee"
//             width={1600}
//             height={1600}
//             className="object-contain"
//           />
//         </motion.div>
//       </div>


//       <div>
//         <StoryCarousel />
//       </div>

//       <div className="relative w-full bg-[#f1efe7] py-8 px-8 md:px-20">
//         <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">

//           <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition flex flex-col items-center">
//             <Coffee className="w-12 h-12 text-[#20140c] mb-4" />
//             <h3 className="text-xl font-bold text-[#20140c] mb-2">Premium Coffee</h3>
//             <p className="text-gray-600 text-sm">
//               Handpicked beans crafted into rich, flavorful brews.
//             </p>
//           </div>

//           <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition flex flex-col items-center">
//             <Dumbbell className="w-12 h-12 text-[#20140c] mb-4" />
//             <h3 className="text-xl font-bold text-[#20140c] mb-2">Sports Vibes</h3>
//             <p className="text-gray-600 text-sm">
//               A café designed for energy, passion, and champions.
//             </p>
//           </div>

//           <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition flex flex-col items-center">
//             <Users className="w-12 h-12 text-[#20140c] mb-4" />
//             <h3 className="text-xl font-bold text-[#20140c] mb-2">Community Space</h3>
//             <p className="text-gray-600 text-sm">
//               More than coffee — a hub to connect, share, and grow.
//             </p>
//           </div>

//         </div>
//       </div>

//       <div id="menu">
//         {/* <MenuTabs /> */} {/* Temporarily disabled- Ipatan.aw sa kay ed if gusto niya ang parallax or kaning normal lang */}
//         <Menu />
//       </div>

//       <div>
//         <ShuttleBrewExperience />
//       </div>

//       {/* <div className="w-full bg-[#2a160a] py-32 px-6 md:px-20 text-center overflow-hidden">
//         <motion.h2
//           className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FFBC52] to-[#B45309] mb-10"
//           initial={{ opacity: 0, y: 50 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true, amount: 0.3 }}
//           transition={{ duration: 1 }}
//         >
//           What Our Customers Say
//         </motion.h2>

//         <motion.p
//           className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto mb-16"
//           initial={{ opacity: 0, y: 50 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true, amount: 0.3 }}
//           transition={{ duration: 1, delay: 0.3 }}
//         >
//           Don’t just take our word for it — hear from our happy ShuttleBrew family.
//         </motion.p>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
//           {[
//             {
//               name: "Ivan Sinohon.",
//               review:
//                 "Absolutely love the cozy vibe here! The vanilla latte is my go-to every morning.",
//               img: "/assets/img/sports-center/shuttlebrew/testimonial1.jpg",
//             },
//             {
//               name: "Nagac P.",
//               review:
//                 "The beans are top-notch. You can taste the freshness in every sip!",
//               img: "/assets/img/sports-center/shuttlebrew/testimonial2.jpg",
//             },
//             {
//               name: "Hemnima J.",
//               review:
//                 "ShuttleBrew is my weekend chill spot. Great coffee and even better people.",
//               img: "/assets/img/sports-center/shuttlebrew/testimonial3.jpg",
//             },
//           ].map((t, i) => (
//             <motion.div
//               key={i}
//               className="bg-[#3a1b07] rounded-2xl shadow-lg p-6 flex flex-col items-center text-center"
//               initial={{ opacity: 0, y: 50 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true, amount: 0.3 }}
//               transition={{ duration: 0.6, delay: i * 0.2 }}
//             >
//               <Image
//                 src={t.img}
//                 alt={t.name}
//                 width={80}
//                 height={80}
//                 className="rounded-full mb-4 object-cover"
//               />
//               <p className="text-gray-200 italic mb-3">“{t.review}”</p>
//               <span className="text-[#FFBC52] font-semibold">{t.name}</span>
//             </motion.div>
//           ))}
//         </div>
//       </div> */}

//       <div>
//         <VisitUsSection />
//       </div>

//       <div>
//         <Footer />
//       </div>

//       <ScrollIndicatorSB />
//     </div>
//   )
// }
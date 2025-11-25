"use client"

import React, { useEffect, useState } from "react";
import Image from "next/image";
import ScrollIndicator from "@/components/custom/scroll-indicator";
import HeroCarousel from "@/components/custom/main-swiper";
import { animate, motion, useMotionValue } from "framer-motion";
import FeatureSection from "@/components/custom/feature-section";
import { items } from "@/components/custom/data/items";
import Footer from "@/components/custom/footer";
import Header from "@/components/custom/header";
import { useInView } from "react-intersection-observer";
import FloatingTicketing from "@/components/custom/ticket";
import { fa } from "zod/v4/locales";
import FAQSection, { CLOUD } from "@/components/custom/main-faq";
import QualitySection from "@/components/custom/quality-section";
import VisitUsSection from "@/components/custom/visit-us-main";
import { useIsMobile } from "@/hooks/use-mobile";
import useSmoothScroll from "@/hooks/useSmoothScroll";

const DRIVE = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_PUBLIC_FOLDER

const scrollImages = [
  {
    src: `${CLOUD}/v1764048136/sb_icon_ftg2zo.png`,
    alt: "Shuttlebrew",
  },
  {
    src: `${CLOUD}/v1764048167/LOGO-NEW-SPORTSCENTER_BLACK_wewxmw.png`,
    alt: "SportsCenter",
  },
  {
    src: `${CLOUD}/v1764048195/courtsidelogo_transparent_black_lkpssv.png`,
    alt: "Courtside",
  },
  {
    src: `${CLOUD}/v1764038540/c-one-logo2_y4elbf.png`,
    alt: "C-One Logo",
  },
  {
    src: `${CLOUD}/v1764038546/c-one-steel_ksla1g.png`,
    alt: "C-One Steel",
  },
]


const Home = () => {
  useSmoothScroll();

  const [_scrolled, setScrolled] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const clientMotion = useMotionValue(0);
  const projectMotion = useMotionValue(0);
  const cproductsSold = useMotionValue(0);
  const cteamMembers = useMotionValue(0);
  const [clientDisplay, setClientDisplay] = useState(0);
  const [projectDisplay, setProjectDisplay] = useState(0);
  const [productsSold, setProductsSold] = useState(0)
  const [teamMembers, setTeamMembers] = useState(0)

  const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.3 });

  useEffect(() => {
    const unsubscribeClient = clientMotion.onChange((v) => setClientDisplay(Math.floor(v)));
    const unsubscribeProject = projectMotion.onChange((v) => setProjectDisplay(Math.floor(v)));
    const unsubscribeSold = cproductsSold.onChange((v) => setProductsSold(Math.floor(v)));
    const unsubscribeTeam = cteamMembers.onChange((v) => setTeamMembers(Math.floor(v)));

    if (inView) {
      animate(clientMotion, 100, { duration: 2, ease: "easeOut" });
      animate(projectMotion, 50, { duration: 2, ease: "easeOut" });
      animate(cproductsSold, 120, { duration: 2, ease: "easeOut" });
      animate(cteamMembers, 80, { duration: 2, ease: "easeOut" });
    }

    return () => {
      unsubscribeClient();
      unsubscribeProject();
      unsubscribeSold();
      unsubscribeTeam();
    };
  }, [inView, clientMotion, projectMotion, cproductsSold, cteamMembers]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // const activeItem = items[activeIndex];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight - 150) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-6 border-[#2FB44D] border-t-transparent"></div>
      </div>
    );
  }
  const infiniteImages = [...scrollImages, ...scrollImages, ...scrollImages]

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header />

      <div className="flex-grow">
        <HeroCarousel />
        <div className="relative w-full overflow-hidden py-12 bg-white">
          <div className="absolute left-0 top-0 h-full w-40 bg-gradient-to-r from-[#F4F3EE] via-[#F4F3EE]/80 to-transparent z-10 backdrop-blur-md" />

          <div className="absolute right-0 top-0 h-full w-40 bg-gradient-to-l from-[#F4F3EE] via-[#F4F3EE]/80 to-transparent z-10 backdrop-blur-md" />

          <motion.div
            className="flex items-center gap-16 w-max"
            animate={{ x: ["0%", "-33.333%"] }}
            transition={{
              duration: 20,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            {infiniteImages.map((img, index) => (
              <div key={index} className="flex-shrink-0 h-20 w-40 flex items-center justify-center">
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={160}
                  height={80}
                  className="object-contain"
                />
              </div>
            ))}
          </motion.div>
        </div>

        <div className="bg-[#F4F3EE]">
          <div className="w-full max-w-none mx-auto px-6 md:px-8 py-10 flex flex-col items-center text-center">
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-[#2FB44D] text-base sm:text-lg font-semibold mb-1"
            >
              More Info. About C-ONE
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className="text-[26px] sm:text-[34px] font-bold text-gray-900 leading-tight mb-4"
            >
              Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="max-w-2xl text-[#777676] text-[15px] leading-snug mb-10"
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </motion.p>

            {/* <motion.button
              className="px-6 py-3 bg-[#2FB44D] text-white text-sm sm:text-base font-medium rounded-lg shadow-md hover:bg-green-600 transition"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Explore Solutions
            </motion.button> */}

            {/* Feature Section */}
            <div className="max-w-">
              <FeatureSection
                items={items}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
              />
            </div>
          </div>
        </div>
      </div >

      <div className="w-full bg-[#F4F3EE] py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 mt-10 md:mt-15 relative">
        <div className="absolute -top-10 -left-40 sm:-left-60 md:-left-80 w-[400px] sm:w-[600px] md:w-[800px] lg:w-[950px] h-[400px] sm:h-[600px] md:h-[800px] lg:h-[950px] bg-white/70 rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-10 -right-40 sm:-right-60 md:-right-80 w-[400px] sm:w-[600px] md:w-[800px] lg:w-[950px] h-[400px] sm:h-[600px] md:h-[800px] lg:h-[950px] bg-white/70 rounded-full pointer-events-none"></div>

        <div className="relative max-w-[1500px] mx-auto rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl -mt-10 sm:-mt-16 md:-mt-25">
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.1 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1 }}
          >
            <Image
              src={`${CLOUD}/v1764047597/rentals-bg_cblsrb.png`}
              alt="Rentals Background"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/70"></div>
          </motion.div>

          <div className="relative text-white flex flex-col-reverse lg:flex-row items-center lg:items-start gap-8 sm:gap-10 md:gap-12 lg:gap-16 px-4 sm:px-6 md:px-12 py-10 sm:py-12 md:py-20">
            <motion.div
              className="flex-1 flex justify-center lg:justify-end w-full"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl h-[250px] sm:h-[400px] md:h-[550px] lg:h-[700px]">
                <Image
                  src={`${CLOUD}/v1764047676/category2_fje9dh.png`}
                  alt="Steel Category"
                  width={1200}
                  height={1600}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </motion.div>

            <div className="flex-1 max-w-3xl text-center lg:text-left">
              <motion.h2
                className="text-xl sm:text-2xl md:text-4xl font-bold leading-snug md:leading-tight mb-4 sm:mb-6"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8 }}
              >
                <span className="block">
                  FOR THE LAST <span className="text-green-500">(25)</span> YEARS WE
                </span>
                <span className="block">
                  LOREM IPSUM{" "}
                  <span className="text-green-500">DOLOR SIT AMET</span> BUSINESS
                </span>
                <span className="block">WITH OUR PRODUCTS & SERVICES</span>
              </motion.h2>

              <motion.p
                className="text-xs sm:text-sm md:text-lg leading-relaxed mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
                minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat.
              </motion.p>

              <div className="grid grid-cols-2 gap-x-8 sm:gap-x-16 gap-y-10 sm:gap-y-14 md:gap-y-16 max-w-md sm:max-w-lg md:max-w-4xl mx-auto lg:mx-0 mt-10 sm:mt-14 md:mt-20">
                {[
                  { icon: "/pages-interface-symbol-of-black-squares-svgrepo-com.svg", label: "Happy Clients", value: clientDisplay },
                  { icon: "/graph-chart-2-svgrepo-com.svg", label: "Projects Done", value: projectDisplay },
                  { icon: "/chart-bar-svgrepo-com.svg", label: "Products Sold", value: productsSold },
                  { icon: "/user-svgrepo-com.svg", label: "Team Members", value: teamMembers },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center space-x-3 sm:space-x-5 justify-center lg:justify-start">
                    <Image src={stat.icon} alt={stat.label} width={50} height={50} className="sm:w-[65px] sm:h-[65px]" />
                    <div>
                      <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-500">{stat.value}+</p>
                      <p className="text-xs sm:text-sm md:text-base text-white">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="w-full relative bg-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full overflow-hidden -translate-y-22">
          <Image
            src={`${CLOUD}/v1764047593/wave_ikexbn.png`}
            alt="Wave"
            width={1917}
            height={347}
            className="w-full h-auto"
          />
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden rotate-180 translate-y-22">
          <Image
            src={`${CLOUD}/v1764047593/wave_ikexbn.png`}
            alt="Bottom Wave"
            width={1917}
            height={347}
            className="w-full h-auto"
          />
        </div>

        <div className="relative max-w-screen-4xl mx-auto px-4 sm:px-8 py-16 sm:py-24 text-center">
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            WHY CHOOSE C-ONE
          </motion.h2>

          <motion.p
            className="text-[#616161] text-sm sm:text-base md:text-base max-w-xl mx-auto mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </motion.p>

          <div className="flex flex-col lg:flex-row justify-center items-start gap-12 w-full">
            <motion.div
              className="relative w-full sm:w-[90%] md:w-full lg:w-[481px] h-[430px] rounded-xl overflow-hidden shadow-lg"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <Image
                src={`${DRIVE}/IMG_6922.jpg`}
                alt="Consultation to Installation"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[90%] sm:w-[412px] rounded-t-xl bg-[#F5F5F5]/11 backdrop-blur-md">
                <div className="relative flex justify-between items-center h-full p-4">
                  <div className="flex-1 flex flex-col justify-start">
                    <div className="flex items-center gap-2 mb-1">
                      <Image src={`${DRIVE}/c-one-logo.png`} alt="C-ONE Logo" width={24} height={24} />
                      <span className="text-white font-bold text-base">C-ONE</span>
                    </div>
                    <p className="text-white text-xs leading-relaxed text-left mr-2">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                      eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                  </div>
                  <div className="w-40 h-24 flex-shrink-0 relative hidden sm:block">
                    <Image
                      src={`${DRIVE}/img/contents/swiper1.png`}
                      alt="Swiper Image"
                      width={160}
                      height={96}
                      className="rounded-[17px] object-cover w-full h-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="flex flex-wrap justify-center lg:justify-center items-center gap-6 w-full lg:max-w-[550px]">
              {[
                {
                  icon: "/three-squares-svgrepo-com.svg",
                  title: "Uncompromising Quality",
                  text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
                  delay: 0.1,
                },
                {
                  icon: "/bulb-on-svgrepo-com.svg",
                  title: "Innovative Solutions",
                  text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
                  delay: 0.2,
                },
                {
                  icon: "/diamond-svgrepo-com.svg",
                  title: "Extensive Range",
                  text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
                  delay: 0.3,
                },
                {
                  icon: "/launcher-settings-svgrepo-com.svg",
                  title: "Customized Services",
                  text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
                  delay: 0.4,
                },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  className="w-full sm:w-[90%] md:w-full lg:w-[256px] lg:h-[241px] bg-white rounded-xl shadow-lg relative p-6 flex flex-col justify-between"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, delay: card.delay }}
                >
                  <div className="w-14 h-14 lg:w-[70px] lg:h-[70px] bg-black flex items-center justify-center rounded-md mb-4 mx-auto">
                    <Image
                      src={card.icon}
                      alt={card.title}
                      width={40}
                      height={40}
                      className="lg:w-[60px] lg:h-[60px]"
                    />
                  </div>

                  <div className="text-center lg:text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{card.title}</h3>
                    <p className="text-xs text-gray-700 leading-relaxed">{card.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <FAQSection />
      </div>

      <div>
        <QualitySection />
      </div>

      <div>
        <VisitUsSection />
      </div>


      <div className="flex flex-col">
        <Footer />
      </div>

      <div>
        <ScrollIndicator />
      </div>

      <div >
        <FloatingTicketing />
      </div>
    </div >

  );
}

export default Home

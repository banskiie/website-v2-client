"use client"

import Footer from '@/components/custom/footer'
import ProductGallery from '@/components/custom/product-gallery'
import ScrollIndicator from '@/components/custom/scroll-indicator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/custom/header'
import FloatingTicketing from "@/components/custom/ticket"
import useSmoothScroll from '@/hooks/useSmoothScroll'
import { CheckCircle2, Clock, Gift, MapPin, Phone, Plus, ShieldCheck } from 'lucide-react'
import VisitUsSection from '@/components/custom/visit-us-main'
import { CLOUD } from '@/components/custom/main-faq'

const products = [
  {
    title: "Excavator",
    description: "Reliable and well-maintained truck for your hauling needs.",
    images: [
      `${CLOUD}/v1764060411/XINIU_X80-E-2_f1l39j.jpg`,
      `${CLOUD}/v1764060418/XINIU_X80-E-3_kp0ayw.jpg`,
      `${CLOUD}/v1764060425/XINIU_X80-E-4_leya8x.jpg`,
      `${CLOUD}/v1764060432/XINIU_X80-E-5_sev8mh.jpg`,
      `${CLOUD}/v1764060439/XINIU_X80-E-6_zv5asb.jpg`,
      `${CLOUD}/v1764060445/XINIU_X80-E_uaodje.jpg`,
    ],
    alt: "Excavator",
  },
  {
    title: "SKW Cargo Truck",
    description: "Heavy-duty equipment ready to power your projects.",
    images: [
      `${CLOUD}/v1764060453/02_gkfkqd.jpg`,
      `${CLOUD}/v1764060460/03_zcspth.jpg`,
      `${CLOUD}/v1764060467/04_zoymse.jpg`,
      `${CLOUD}/v1764060474/05_cc46p9.jpg`,
      `${CLOUD}/v1764060481/06_cwg4zq.jpg`,
      `${CLOUD}/v1764060494/07_zizfnd.jpg`,
    ],
    alt: "SKW Cargo Truck",
  },
  {
    title: "Wheel Loader",
    description: "Top-of-the-line equipment for large-scale projects.",
    images: [
      `${CLOUD}/v1764060531/XIASHENG_XM935_jtoc8o.jpg`,
      `${CLOUD}/v1764060488/XIASHENG_XM935-2_ppgvjs.jpg`,
      `${CLOUD}/v1764060503/XIASHENG_XM935-3_zkcccc.jpg`,
      `${CLOUD}/v1764060510/XIASHENG_XM935-4_qchgoa.jpg`,
      `${CLOUD}/v1764060516/XIASHENG_XM935-5_x7kwmx.jpg`,
      `${CLOUD}/v1764060524/XIASHENG_XM935-6_w8s57f.jpg`,
    ],
    alt: "Wheel Loader",
  },
]
function page() {
  useSmoothScroll()
  // const currentYear = new Date().getFullYear()
  // const [isOpen, setIsOpen] = useState(false)
  const [_scrolled, setScrolled] = useState(false)
  // const [selectedUnit, setSelectedUnit] = useState(products[0])
  const availableUnitsRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  // const [isCompanyOpen, setIsCompanyOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight - 80) {
        setScrolled(true)
      }
      else {
        setScrolled(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const highlights = useMemo(() => {
    const boxes = []
    const used = new Set()
    const min = 60
    const max = 80
    const count = Math.floor(Math.random() * (max - min + 1)) + min

    const cellSize = 40

    const containerWidth = typeof window !== "undefined" ? window.innerWidth : 800
    const containerHeight = typeof window !== "undefined" ? window.innerHeight : 600

    const maxCols = Math.floor(containerWidth / cellSize)
    const maxRows = Math.floor(containerHeight / cellSize)

    while (boxes.length < count) {
      const xIndex = Math.floor(Math.random() * maxCols)
      const yIndex = Math.floor(Math.random() * maxRows)
      const key = `${xIndex},${yIndex}`
      if (!used.has(key)) {
        used.add(key)
        boxes.push({ x: xIndex * cellSize, y: yIndex * cellSize })
      }
    }

    return boxes
  }, [])


  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-6 border-[#2FB44D] border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="relative w-full h-screen flex items-center justify-center">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={`${CLOUD}/v1764039906/swiper2_fo8hcc.png`}
            alt="Trucks Hero"
            fill
            className="object-cover object-center"
            loading="lazy"
            blurDataURL={`${CLOUD}/v1764039906/swiper2_fo8hcc.png`}
          />
          <div className="absolute inset-0 bg-black/50" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-3xl text-center px-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-6xl font-extrabold text-white leading-snug"
          >
            Trucks & Equipment
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-4 text-white/90 text-lg text-center md:text-xl"
          >
            Looking for reliable steel products at great value?
            You&apos;ve found it with C-ONE! Browse a wide selection of premium-quality steel—available in many stunning colors and customizable in size—designed to bring your vision to life while keeping your budget intact.
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            onClick={() =>
              availableUnitsRef.current?.scrollIntoView({ behavior: "smooth" })
            }
            className="px-8 py-3 cursor-pointer rounded-[25px] border border-white bg-[#211A1A]/80 text-white font-medium hover:bg-[#211A1A]/90 transition mt-18"
          >
            See Products
          </motion.button>
        </motion.div>
      </div>


      <div className="relative w-full bg-[#032c24] py-20 overflow-hidden">

        {/* <div className="absolute inset-0 bg-[radial-gradient(circle,_#d4d4d4_2px,_transparent_1px)] [background-size:30px_30px] opacity-40"></div> */}

        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(144,238,144,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(144,238,144,0.25)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {highlights.map((box, i) => {
          const isEven = (Math.floor(box.x / 40) + Math.floor(box.y / 40)) % 2 === 0;
          const bgClass = isEven ? "bg-green-200/40" : "bg-green-600/70";

          return (
            <div
              key={i}
              className={`absolute w-[40px] h-[40px] ${bgClass}`}
              style={{ top: box.y, left: box.x }}
            />
          );
        })}

        {/* <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.25)_15%,transparent_70%)] blur-md" /> */}

        <div className="absolute -left-9 top-0 h-full w-[90%] bg-linear-to-r from-black/90 via-gray-500/40 to-transparent blur-xl" />
        <div className="absolute -right-9 top-0 h-full w-[90%] bg-linear-to-l from-black/90 via-gray-500/40 to-transparent blur-xl" />

        <motion.div
          className="text-center mb-16 relative z-10"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block bg-black text-white text-sm px-5 py-2 rounded-full mb-4">
            What We Offer
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
            What We Offer
          </h2>
          <p className="max-w-3xl mx-auto text-gray-300 leading-relaxed">
            Power up your projects with C-ONE’s top-quality trucks and equipment
            rentals. Whether you need hauling, lifting, or moving heavy loads, our
            reliable fleet and expert support ensure you get the job done faster,
            safer, and smarter. With us, you don’t just rent machines—you gain a
            partner committed to your success.
          </p>
        </motion.div>

        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 px-6 mb-20">
          {[
            {
              img: "/forklift-1-svgrepo-com.svg",
              title: "Brand New Heavy Equipment",
              desc: "Top-quality heavy equipment for construction and industrial projects",
            },
            {
              img: "/factory-svgrepo-com.svg",
              title: "Industrial Equipment",
              desc: "Comprehensive industrial machinery for all your operational needs",
            },
            {
              img: "/trucks-moving-svgrepo-com.svg",
              title: "Japan Reconditioned Trucks",
              desc: "Reliable reconditioned trucks imported from Japan",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="bg-white rounded-xl p-8 flex flex-col items-center text-center transition-all hover:shadow-lg shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)]"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
            >
              <div className="bg-green-600 rounded-2xl p-6 mb-4 flex items-center justify-center w-28 h-28 shadow-md">
                <Image
                  src={item.img}
                  alt={item.title}
                  width={80}
                  height={80}
                  className="mb-4"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="relative z-10 max-w-5xl mx-auto bg-white shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)] rounded-xl py-10 px-8 text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-gray-700 text-sm mb-2">
            Looking for reliable trucks and equipment rentals?
          </p>
          <h4 className="text-green-600 font-semibold mb-4">We’re here to help</h4>
          <p className="text-gray-700 max-w-2xl mx-auto mb-10">
            From hauling heavy loads to powering big builds,{" "}
            <span className="text-green-600 font-semibold">C-ONE</span> delivers
            the trucks and equipment you can count on. Fast, reliable, and ready
            when you are.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-8">
            <div className="flex items-center justify-center gap-3 bg-white rounded-lg shadow-md px-6 py-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.96802 4H18.032C18.4706 3.99999 18.8491 3.99998 19.1624 4.02135C19.4922 4.04386 19.8221 4.09336 20.1481 4.22836C20.8831 4.53284 21.4672 5.11687 21.7716 5.85195C21.9066 6.17788 21.9561 6.50779 21.9787 6.83762C22 7.15088 22 7.52936 22 7.96801V16.032C22 16.4706 22 16.8491 21.9787 17.1624C21.9561 17.4922 21.9066 17.8221 21.7716 18.1481C21.4672 18.8831 20.8831 19.4672 20.1481 19.7716C19.8221 19.9066 19.4922 19.9561 19.1624 19.9787C18.8491 20 18.4706 20 18.032 20H5.96801C5.52936 20 5.15088 20 4.83762 19.9787C4.50779 19.9561 4.17788 19.9066 3.85195 19.7716C3.11687 19.4672 2.53284 18.8831 2.22836 18.1481C2.09336 17.8221 2.04386 17.4922 2.02135 17.1624C1.99998 16.8491 1.99999 16.4706 2 16.032V7.96802C1.99999 7.52937 1.99998 7.15088 2.02135 6.83762C2.04386 6.50779 2.09336 6.17788 2.22836 5.85195C2.53284 5.11687 3.11687 4.53284 3.85195 4.22836C4.17788 4.09336 4.50779 4.04386 4.83762 4.02135C5.15088 3.99998 5.52937 3.99999 5.96802 4ZM4.31745 6.27777C4.68114 5.86214 5.3129 5.82002 5.72854 6.1837L11.3415 11.095C11.7185 11.4249 12.2815 11.4249 12.6585 11.095L18.2715 6.1837C18.6871 5.82002 19.3189 5.86214 19.6825 6.27777C20.0462 6.69341 20.0041 7.32517 19.5885 7.68885L13.9755 12.6002C12.8444 13.5899 11.1556 13.5899 10.0245 12.6002L4.41153 7.68885C3.99589 7.32517 3.95377 6.69341 4.31745 6.27777Z"
                ></path>
              </svg>
              <div className="text-left">
                <p className="text-sm text-gray-600">Email us</p>
                <p className="font-semibold text-gray-900">inquiry@c-one.ph</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 bg-white rounded-lg shadow-md px-6 py-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M15.5562 14.5477L15.1007 15.0272C15.1007 15.0272 14.0181 16.167 11.0631 13.0559C8.10812 9.94484 9.1907 8.80507 9.1907 8.80507L9.47752 8.50311C10.1841 7.75924 10.2507 6.56497 9.63424 5.6931L8.37326 3.90961C7.61028 2.8305 6.13596 2.68795 5.26145 3.60864L3.69185 5.26114C3.25823 5.71766 2.96765 6.30945 3.00289 6.96594C3.09304 8.64546 3.81071 12.259 7.81536 16.4752C12.0621 20.9462 16.0468 21.1239 17.6763 20.9631C18.1917 20.9122 18.6399 20.6343 19.0011 20.254L20.4217 18.7584C21.3806 17.7489 21.1102 16.0182 19.8833 15.312L17.9728 14.2123C17.1672 13.7486 16.1858 13.8848 15.5562 14.5477Z"></path>
              </svg>
              <div className="text-left">
                <p className="text-sm text-gray-600">Call us directly at</p>
                <p className="font-semibold text-gray-900">+(63) 917-705-9132</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="relative w-full bg-white py-20 overflow-hidden" ref={availableUnitsRef}>
        <div
          className="absolute inset-0 bg-[radial-gradient(circle,_#05c95c_2px,_transparent_1px)] [background-size:30px_30px] opacity-20"
        />
        <div className="max-w-6xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block bg-black text-white text-sm px-5 py-2 rounded-full mb-4">
              Available Now!
            </div>
            <div className="text-4xl font-bold text-black mb-4">Available Units</div>
            <p className="text-black text-opacity-60 text-base md:text-lg max-w-2xl mx-auto">
              Our trucks and equipment are well-maintained, dependable, and available when you need them most.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-23 mb-10">
            {products.map((product, idx) => {
              const variants = [
                {
                  hidden: { opacity: 0, x: -80 },
                  show: { opacity: 1, x: 0 },
                },
                {
                  hidden: { opacity: 0, scale: 0.8 },
                  show: { opacity: 1, scale: 1 },
                },
                {
                  hidden: { opacity: 0, x: 80 },
                  show: { opacity: 1, x: 0 },
                },
              ]

              return (
                <motion.div
                  key={idx}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={variants[idx % variants.length]}
                  transition={{ duration: 0.8, delay: idx * 0.2 }}
                >
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="relative cursor-pointer group">
                        <div className="absolute bottom-3 right-3 w-full h-full bg-[#2FB44D] rounded-lg transition-transform duration-300 group-hover:translate-y-[-10px] group-hover:scale-105"></div>

                        <div className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl hover:scale-105 transition-transform duration-300">
                          <Image
                            src={product.images[0]}
                            alt={product.alt}
                            width={400}
                            height={250}
                            className="object-cover w-full h-48"
                          />
                          <div className="p-4 text-left">
                            <h2 className="text-lg font-semibold">{product.title}</h2>
                            <p className="text-sm text-gray-600 mt-2">{product.description}</p>
                          </div>
                        </div>
                      </div>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-4xl w-full">
                      <DialogHeader>
                        <DialogTitle>{product.title}</DialogTitle>
                      </DialogHeader>
                      <ProductGallery
                        images={product.images}
                        description={product.description}
                      />
                    </DialogContent>
                  </Dialog>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>


      <div className="relative w-full bg-[#032c24] py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(144,238,144,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(144,238,144,0.25)_1px,transparent_1px)] bg-[size:40px_40px]" />



        <div className="absolute -left-9 top-0 h-full w-[90%] bg-linear-to-r from-black/90 via-gray-500/40 to-transparent blur-xl" />
        <div className="absolute -right-9 top-0 h-full w-[90%] bg-linear-to-l from-black/90 via-gray-500/40 to-transparent blur-xl" />

        <div className="relative">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block bg-[#00BF63] text-white text-sm px-5 py-2 rounded-full mb-4">
              Why C-One
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
              Why Choose C-ONE Company
            </h2>
            <p className="max-w-3xl mx-auto text-gray-300 leading-relaxed">
              We deliver excellence in every aspect of our service, from equipment
              quality to customer support.
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 px-6">
            {[
              {
                icon: "ShieldCheck",
                title: "Quality Assurance",
                desc: "All equipment undergoes rigorous inspection and testing before delivery.",
              },
              {
                icon: "BadgeCheck",
                title: "Industry Certified",
                desc: "ISO certified operations with industry-leading safety standards.",
              },
              {
                icon: "Users",
                title: "Expert Support",
                desc: "24/7 technical support and dedicated account management.",
              },
              {
                icon: "CheckCircle",
                title: "Warranty Coverage",
                desc: "Comprehensive warranty packages on all equipment and parts.",
              },
            ].map((item, i) => {
              const Icon = require("lucide-react")[item.icon]
              return (
                <motion.div
                  key={i}
                  className="flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <div className="bg-[#DCFCE7] rounded-full p-6 flex items-center justify-center w-20 h-20 mb-6">
                    <Icon className="w-10 h-10 text-[#00BF63]" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-100 text-sm leading-relaxed max-w-xs">
                    {item.desc}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>


      <div className="relative w-full py-16 px-6 md:px-20 bg-[#F9F9F9] overflow-hidden">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle,_#05c95c_2px,_transparent_1px)] [background-size:30px_30px] opacity-15"
        />
        <div className="absolute left-0 top-0 h-full w-1/4 bg-gradient-to-r from-white/90 to-transparent " />
        <div className="absolute right-0 top-0 h-full w-1/4 bg-gradient-to-l from-white/90 to-transparent " />


        <div className="relative z-10">
          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-stretch">
            <div className="space-y-6">
              <div className="inline-block bg-black text-white px-4 py-1 rounded-full text-sm font-semibold">
                Value Added Service
              </div>

              <h2 className="text-xl font-semibold text-gray-800">
                Everything You Need Included
              </h2>

              <p className="text-gray-600 text-sm leading-relaxed">
                At C-ONE, we believe in providing complete value. Every purchase
                comes with comprehensive benefits, warranties, and premium add-ons to
                ensure you get the best equipment experience.
              </p>

              <div className="bg-[#DCFCE7] p-6 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="bg-[#00BF63] p-2 rounded-lg text-white">
                    <Gift size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-lg">
                    Free Services Included
                  </h3>
                </div>

                <div className="pl-[52px] mt-2 space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#00BF63]" />
                    <span>TPL Insurance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#00BF63]" />
                    <span>Hydraulic Jack</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#00BF63]" />
                    <span>Complete Standard Accessories</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#00BF63]" />
                    <span>Emission Test</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#FFFBE8] p-6 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="bg-[#EAB308] p-2 rounded-lg text-white">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-lg">
                    Warranty Coverage
                  </h3>
                </div>

                <div className="pl-[52px] mt-2 space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#00BF63]" />
                    <span>1 Year Warranty – Brand New Equipment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#00BF63]" />
                    <span>1 Month Warranty – Trucks, Parts & Labor</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#DCFCE7] p-6 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="bg-[#00BF63] p-2 rounded-lg text-white">
                    <Plus size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-lg">
                    Premium Add-Ons
                  </h3>
                </div>

                <div className="pl-[52px] mt-2 space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#00BF63]" />
                    <span>New Battery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#00BF63]" />
                    <span>Brand New Tires</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#00BF63]" />
                    <span>Brand New Steel Plates</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative h-full">
              <div className="h-[500px] w-full relative">
                <Image
                  src={`${CLOUD}/v1764061092/bg_byzoel.jpg`}
                  alt="Technician working on vehicle"
                  fill
                  className="rounded-2xl object-cover shadow-xl"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                <div className="absolute -bottom-10 -left-5 bg-[#00BF63] text-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-4xl font-bold mb-1">100%</h3>
                  <p className="text-sm leading-tight">
                    Quality Guaranteed on <br /> All Equipment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <section className="relative w-full py-16 px-6 md:px-20 bg-white overflow-hidden">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative z-10 text-center mb-12"
        >
          <h2 className="font-judson text-5xl font-bold text-gray-900">Visit Us</h2>
          <p className="font-judson mt-3 text-gray-600 text-lg max-w-2xl mx-auto">
            We’re here to serve you! Stop by our location to discuss your steel needs,
            get expert advice, or explore our products. Our team is ready to assist you
            with quality steel solutions.
          </p>
        </motion.div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-10 px-4 md:px-8">
          <div className="flex flex-col gap-4 w-full max-w-md text-left lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-green-50 rounded-xl p-4 shadow-sm flex items-start gap-4"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-b from-[#00AB4D] to-[#00BF63] shadow-md">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-700 text-lg font-semibold font-judson">
                  Phone Number
                </p>
                <p className="text-gray-600 mt-1 font-judson">+63 917 629 7457</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-b from-[#FEFCE8] to-[#FFFBEB] rounded-xl p-4 shadow-sm flex items-start gap-4"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-b from-[#FDB913] to-[#FFA500] shadow-md">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-700 font-semibold font-judson">Our Location</p>
                <p className="text-gray-600 mt-1 font-judson">
                  Zone A-1, Taytay<br />City of El Salvador<br />Misamis Oriental
                </p>
                <a
                  href="https://www.google.com/maps/place/C-ONE+STEEL/@8.5400202,124.5376785,17z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 text-sm mt-1 inline-block hover:underline font-judson"
                >
                  View on Google Maps
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-green-50 rounded-xl p-4 shadow-sm flex items-start gap-4"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-b from-[#00AB4D] to-[#00BF63] shadow-md">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-700 font-semibold font-judson">Business Hours</p>
                <p className="text-gray-600 mt-1 font-judson">
                  Monday – Friday: <span className="font-bold">8:00 AM – 5:00 PM</span><br />
                  Saturday: <span className="font-bold">8:00 AM – 12:00 PM</span><br />
                  Sunday: <span className="font-bold">Closed</span>
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-b from-[#FEFCE8] to-[#FFFBEB] border border-[#FDB913]/30 rounded-xl p-4 text-center shadow-sm"
            >
              <p className="text-md text-gray-700 font-judson">
                <span className="text-green-700 font-semibold">Need directions?</span>{" "}
                We’re located in the heart of Taytay, easily accessible from major roads.
                Call us if you need assistance finding our location!
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 w-full max-w-lg md:max-w-2xl lg:max-w-[750px]"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3879.292081809595!2d124.6394518!3d8.5001149!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32fff30019327e95%3A0xf0787044cac856fe!2sC-ONE%20Sports%20Center!5e0!3m2!1sen!2sph!4v1694420000000!5m2!1sen!2sph"
              allowFullScreen
              loading="lazy"
              className="border-0 w-full h-[350px] md:h-[450px] lg:h-[500px]"
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="relative z-10 mt-16 bg-white rounded-2xl shadow-[inset_0_2px_6px_rgba(0,0,0,0.20)] p-10 text-center max-w-5xl mx-auto"
        >
          <h3 className="font-judson text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Why Visit C-ONE STEEL?
          </h3>
          <p className="font-judson text-gray-700 max-w-3xl mx-auto mb-8">
            As your trusted steel supplier in Misamis Oriental, we offer premium quality
            steel products, competitive pricing, and exceptional customer service. Visit
            us to experience the difference!
          </p>

          <div className="font-judson flex flex-col md:flex-row justify-center items-center gap-8 text-base text-gray-700">
            <div>
              <p>✓ <span className="font-semibold">Quality Products</span></p>
              <p>Premium steel materials</p>
            </div>
            <div>
              <p>✓ <span className="font-semibold">Expert Advice</span></p>
              <p>Knowledgeable staff ready to help</p>
            </div>
            <div>
              <p>✓ <span className="font-semibold">Great Service</span></p>
              <p>Customer satisfaction guaranteed</p>
            </div>
          </div>
        </motion.div>
      </section>

      <div className="flex flex-col">
        <Footer />
      </div>

      <ScrollIndicator />

      <FloatingTicketing />
    </div >

  )
}
export default page
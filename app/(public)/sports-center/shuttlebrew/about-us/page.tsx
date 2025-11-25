"use client"

import { MapPin, X } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import ShimmerSkeleton from '@/components/custom/shimmer-skeleton'

const DRIVE = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_PUBLIC_FOLDER
const galleryImages = [
  { src: `${DRIVE}/img/sports-center/shuttlebrew/gallery/_ALP6549-51.png`, alt: "Cafe 1", caption: "Spacious Cafe Vibe" },
  { src: `${DRIVE}/img/sports-center/shuttlebrew/gallery/_ALP6551-52.jpg`, alt: "Cafe 2", caption: "Spacious Cafe Vibe" },
  { src: `${DRIVE}/img/sports-center/shuttlebrew/gallery/_ALP6556-53.jpg`, alt: "Cafe 3", caption: "Spacious Cafe Vibe" },
  { src: `${DRIVE}/img/sports-center/shuttlebrew/gallery/_ALP9018.jpg`, alt: "Cafe 4", caption: "Spacious Cafe Vibe" },
  { src: `${DRIVE}/img/sports-center/shuttlebrew/gallery/_ALP9021.jpg`, alt: "Cafe 5", caption: "Spacious Cafe Vibe" },
  { src: `${DRIVE}/img/sports-center/shuttlebrew/gallery/_ALP9044.jpg`, alt: "Cafe 6", caption: "Spacious Cafe Vibe" },
  { src: `${DRIVE}/img/sports-center/shuttlebrew/gallery/_ALP9054.jpg`, alt: "Cafe 7", caption: "Spacious Cafe Vibe" },
  { src: `${DRIVE}/img/sports-center/shuttlebrew/gallery/_ALP9068.jpg`, alt: "Cafe 8", caption: "Spacious Cafe Vibe" },

  { src: "/assets/img/sports-center/shuttlebrew/gallery/_ALP2056.jpg", alt: "Cafe 9", caption: "Spacious Cafe Vibe" },
  { src: "/assets/img/sports-center/shuttlebrew/gallery/_ALP2060.jpg", alt: "Cafe 10", caption: "Spacious Cafe Vibe" },
  { src: "/assets/img/sports-center/shuttlebrew/gallery/_ALP9080.jpg", alt: "Cafe 11", caption: "Spacious Cafe Vibe" },
  { src: "/assets/img/sports-center/shuttlebrew/gallery/_ALP9122.jpg", alt: "Cafe 12", caption: "Spacious Cafe Vibe" },
  { src: "/assets/img/sports-center/shuttlebrew/gallery/_ALP9131.jpg", alt: "Cafe 13", caption: "Spacious Cafe Vibe" },
  { src: "/assets/img/sports-center/shuttlebrew/gallery/_ALP9173.jpg", alt: "Cafe 14", caption: "Spacious Cafe Vibe" },
  { src: "/assets/img/sports-center/shuttlebrew/gallery/_ALP9177.jpg", alt: "Cafe 15", caption: "Spacious Cafe Vibe" },
  { src: "/assets/img/sports-center/shuttlebrew/gallery/_ALP9200.jpg", alt: "Cafe 16", caption: "Spacious Cafe Vibe" },
  { src: "/assets/img/sports-center/shuttlebrew/gallery/_ALP9203.jpg", alt: "Cafe 17", caption: "Spacious Cafe Vibe" },
  { src: "/assets/img/sports-center/shuttlebrew/gallery/_ALP9204.jpg", alt: "Cafe 18", caption: "Spacious Cafe Vibe" },
  { src: "/assets/img/sports-center/shuttlebrew/gallery/_ALP9272.jpg", alt: "Cafe 19", caption: "Spacious Cafe Vibe" },
  { src: "/assets/img/sports-center/shuttlebrew/gallery/_ALP9273.jpg", alt: "Cafe 20", caption: "Spacious Cafe Vibe" },
  { src: "/assets/img/sports-center/shuttlebrew/gallery/_ALP9274.jpg", alt: "Cafe 21", caption: "Spacious Cafe Vibe" },
  { src: "/assets/img/sports-center/shuttlebrew/gallery/_ALP9286.jpg", alt: "Cafe 22", caption: "Spacious Cafe Vibe" },
  { src: "/assets/img/sports-center/shuttlebrew/gallery/_ALP9289.jpg", alt: "Cafe 23", caption: "Spacious Cafe Vibe" },
  { src: "/assets/img/sports-center/shuttlebrew/gallery/_ALP9291.jpg", alt: "Cafe 24", caption: "Spacious Cafe Vibe" },
  { src: "/assets/img/sports-center/shuttlebrew/gallery/_ALP9301.jpg", alt: "Cafe 25", caption: "Spacious Cafe Vibe" },
  { src: "/assets/img/sports-center/shuttlebrew/gallery/_ALP9314.jpg", alt: "Cafe 26", caption: "Spacious Cafe Vibe" },
  { src: "/assets/img/sports-center/shuttlebrew/gallery/_ALP9317.jpg", alt: "Cafe 27", caption: "Spacious Cafe Vibe" },
  { src: "/assets/img/sports-center/shuttlebrew/gallery/_ALP9321.jpg", alt: "Cafe 28", caption: "Spacious Cafe Vibe" },
  { src: "/assets/img/sports-center/shuttlebrew/gallery/_ALP9323.jpg", alt: "Cafe 29", caption: "Spacious Cafe Vibe" },
  { src: "/assets/img/sports-center/shuttlebrew/gallery/_ALP9335.jpg", alt: "Cafe 30", caption: "Spacious Cafe Vibe" },
  { src: "/assets/img/sports-center/shuttlebrew/gallery/_ALP9340.jpg", alt: "Cafe 31", caption: "Spacious Cafe Vibe" },
  { src: "/assets/img/sports-center/shuttlebrew/gallery/_ALP9344.jpg", alt: "Cafe 32", caption: "Spacious Cafe Vibe" },
  { src: "/assets/img/sports-center/shuttlebrew/gallery/_ALP9356.jpg", alt: "Cafe 33", caption: "Spacious Cafe Vibe" },
  { src: "/assets/img/sports-center/shuttlebrew/gallery/_ALP9359.jpg", alt: "Cafe 34", caption: "Spacious Cafe Vibe" },
  { src: "/assets/img/sports-center/shuttlebrew/gallery/_ALP9361.jpg", alt: "Cafe 35", caption: "Spacious Cafe Vibe" },
]


// function GalleryImage({ src, alt, caption, onClick }: { src: string; alt: string; caption: string; onClick: () => void }) {
//   const [loaded, setLoaded] = useState(false)

//   return (
//     <div className="relative overflow-hidden rounded-lg shadow-md cursor-pointer" onClick={onClick}>
//       {!loaded && <Skeleton className="absolute inset-0 w-full h-full rounded-lg" />}
//       <Image
//         src={src}
//         alt={alt}
//         fill
//         className={`object-cover transition-opacity duration-500 hover:scale-105 ${loaded ? "opacity-100" : "opacity-0"}`}
//         onLoadingComplete={() => setLoaded(true)}
//         loading="lazy"
//         sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//       />
//       <div className="absolute bottom-0 left-0 w-full bg-black/50 text-white text-sm px-3 py-2">
//         {caption}
//       </div>
//     </div>
//   )
// }

function Page() {
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null)
  const [learnMoreModal, setLearnMoreModal] = useState(false)
  const [viewGallery, setViewGallery] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handlePageLoad = () => {
      setIsLoading(false);
    };

    if (document.readyState === "complete") {
      setIsLoading(false)
    } else {
      window.addEventListener("load", handlePageLoad);
    }

    return () => window.removeEventListener("load", handlePageLoad);
  }, [])

  // const parentRef = useRef<HTMLDivElement>(null)

  // Virtualizer setup
  // const rowVirtualizer = useVirtualizer({
  //   count: galleryImages.length,
  //   getScrollElement: () => parentRef.current,
  //   estimateSize: () => 240, // approximate row height in px
  //   overscan: 5, // how many items to render outside viewport
  // })

  {
    isLoading && (
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
            src="/assets/img/sports-center/shuttlebrew/sb_icon.png"
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
    )
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen overflow-x-hidden">

      <motion.div
        className="bg-[#f5f2ec] w-full md:w-1/2 flex flex-col relative md:h-screen md:overflow-y-auto"
        animate={viewGallery ? { x: "-100%", opacity: 0 } : { x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      >
        <div className="absolute top-0 left-0 w-full z-10">
          <div className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-gray-300 min-w-[300px]">
            <Link
              href="/sports-center/shuttlebrew/#about-us" className="flex items-center gap-2 text-lg font-bold px-4 py-2 bg-white rounded-full shadow hover:bg-gray-100 transition">
              {"<-"}
            </Link>
            <div className="flex-1 flex justify-center">
              <Image src="/assets/img/logo/c-one-logo2.png" alt="C-One Logo" width={160} height={100} className="object-contain" />
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 md:px-8 py-10 md:py-13">
          <h2 className="text-3xl md:text-4xl font-bold tracking-[0.25em] uppercase mb-8 md:mb-10 text-center md:text-left mt-13">
            About ShuttleBrew
          </h2>

          <div className="relative w-full h-64 md:h-[30rem] mb-8">
            <Image src="/assets/img/sports-center/shuttlebrew/gallery/_ALP9301.jpg" alt="About ShuttleBrew" loading='lazy' fill className="object-cover rounded-lg" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-start">
            <p className="text-gray-700 text-base md:text-xl leading-relaxed md:leading-loose">
              This is ShuttleBrew Café—born from the love of coffee and community. A cozy nook where players unwind after a match, friends gather for warm conversations, and every cup is brewed with passion.
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut aliquam lacinia  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut aliquam lacinia
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut aliquam lacinia
            </p>

            <div className="relative w-full h-48 md:h-64">
              <Image
                src="/assets/img/sports-center/shuttlebrew/gallery/_ALP9314.jpg"
                alt="Cozy Cafe"
                fill
                className="object-cover rounded-md"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-black text-white w-full md:w-1/2 flex flex-col p-6 md:p-12 md:h-screen md:overflow-y-auto"
        animate={viewGallery ? { x: "100%", opacity: 0 } : { x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      >
        <h2 className="text-xl md:text-2xl font-bold tracking-[0.2em] mb-6 text-center md:text-left">
          C-One ShuttleBrew
        </h2>

        <div className="relative w-full h-48 md:h-72 mb-6 flex-shrink-0 cursor-pointer" onClick={() => setModalImage({ src: "/assets/img/sports-center/shuttlebrew/gallery/_ALP2060.jpg", alt: "Cafe Experience" })}>
          <Image src="/assets/img/sports-center/shuttlebrew/gallery/_ALP2060.jpg" alt="Cafe Experience" fill className="object-cover rounded-lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2 flex flex-col">
            <p className="text-lg tracking-widest uppercase font-semibold">Lorem ipsum dolor sit amet</p>
            <p className="mt-2 text-gray-300 line-clamp-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut aliquam lacinia
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut aliquam lacinia
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut aliquam lacinia
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut aliquam lacinia
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut aliquam lacinia
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut aliquam lacinia
            </p>
            <button onClick={() => setLearnMoreModal(true)} className="mt-4 px-6 py-2 bg-[#914b1d] hover:bg-[#723d19] text-white rounded-lg shadow-md transition-colors cursor-pointer self-start">
              Learn More +
            </button>
          </div>

          <div className="md:col-span-1 text-base text-gray-300 mt-4 md:mt-0">
            <p className="font-medium text-lg mb-2">Location</p>
            <p>
              Zone 1 Rodolfo N. Pelaez Blvd,
              <br />
              Kauswagan, Cagayan De Oro City,
              <br />
              Misamis Oriental
            </p>
          </div>
        </div>

        <div className="flex flex-col flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            
            {galleryImages.slice(0, 6).map((img, i) => (
              <div key={i} className="relative w-full h-24 sm:h-32 cursor-pointer" onClick={() => setModalImage({ src: img.src, alt: img.alt })}>
                <Image src={img.src} alt={img.alt} fill className="object-cover rounded-md" loading='lazy' />
              </div>
            ))}

          </div>

          <div className="flex justify-center mt-4">
            <button onClick={() => setViewGallery(true)} className="px-6 py-2 bg-[#914b1d] hover:bg-[#723d19] text-white font-semibold rounded-lg shadow cursor-pointer transition">
              View Gallery
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {viewGallery && (
          <motion.div
            key="gallery-page"
            initial={{ y: "100%" }}        // start completely offscreen (bottom)
            animate={{ y: 0 }}             // slide up into view
            exit={{ y: "100%" }}           // slide back down
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="fixed inset-0 z-50 flex justify-center items-end overflow-hidden"
          >
            <motion.div
              className="relative w-[95%] md:w-[85%] max-h-[95vh] bg-black rounded-t-xl shadow-lg overflow-y-auto scroll-smooth"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            >
              <div className="sticky top-0 z-50 bg-black p-4 flex items-center justify-center">
                <h2 className="text-white text-lg font-semibold">Gallery</h2>
                <button
                  onClick={() => setViewGallery(false)}
                  className="absolute right-4 text-white px-3 py-1 bg-[#914b1d] rounded-full shadow hover:bg-[#723d19] transition cursor-pointer"
                >
                  X
                </button>
              </div>

              <div className="p-4 overflow-x-hidden">
                <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2 [column-fill:_balance]">
                  {galleryImages.map((img, i) => (
                    <motion.div
                      key={i}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className="group mb-4 break-inside-avoid cursor-pointer relative overflow-hidden rounded-lg shadow-md border-2 border-transparent hover:border-white/40 hover:scale-105 transition-all duration-500"
                      onClick={() => setModalImage({ src: img.src, alt: img.alt })}
                    >
                      <Image
                        src={img.src}
                        alt={img.alt}
                        width={800}
                        height={600}
                        className="w-full h-auto object-cover rounded-lg"
                        loading='lazy'
                      />

                      <div className="absolute bottom-0 left-0 w-full bg-black/50 text-white text-sm px-3 py-2">
                        {img.caption}
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <button className="px-4 py-2 cursor-pointer bg-[#914b1d] text-white rounded shadow hover:bg-[#723d19] transition">
                          See More
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {learnMoreModal &&
          (<motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 md:p-6"
            onClick={() => setLearnMoreModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative w-full max-w-7xl h-[90vh] bg-white rounded-lg overflow-hidden flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              <X
                className="absolute top-3 right-3 text-black w-6 h-6 cursor-pointer z-50"
                onClick={() => setLearnMoreModal(false)}
              />
              <div className="md:w-1/2 p-2 md:p-4 flex flex-col h-1/2 md:h-full">
                <div className="relative flex-1 rounded-lg overflow-hidden p-2 md:p-4">
                  <Image
                    src="/assets/img/sports-center/shuttlebrew/gallery/_ALP2060.jpg"
                    alt="Learn More Image"
                    fill className="object-cover rounded-lg"
                  />
                  <div className="absolute bottom-4 left-4 text-white bg-black/50 p-2 md:p-3 rounded">
                    <p className="font-medium mb-1 md:mb-2">
                      <MapPin className="inline mr-1 w-4 h-4 md:w-5 md:h-5" />
                      Location
                    </p>
                    <p className="text-xs md:text-sm">
                      Zone 1 Rodolfo N. Pelaez Blvd,
                      <br /> Kauswagan, Cagayan De Oro City,
                      <br />
                      Misamis Oriental
                    </p>
                  </div>
                </div>
              </div>
              <div className="md:w-[45%] p-4 md:p-8 flex flex-col justify-start ml-4 h-full">
                <div className="mb-31 sticky top-0 bg-white z-10 pt-2">
                  <h3 className="text-lg md:text-xl font-medium tracking-wide text-gray-800">
                    C-ONE ShuttleBrew
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 tracking-wide">
                    2024, Zone 1 Kauswagan </p>
                  <p className="text-xs md:text-sm text-gray-600 tracking-wide"> Cozy Café & Community Hub
                  </p>
                </div>
                <h2 className="text-xl md:text-2xl font-base tracking-widest mb-10 text-gray-800">
                  Lorem ipsum dolor sit amet
                </h2>
                <p className="text-gray-700 text-base md:text-lg leading-relaxed md:leading-loose tracking-wider">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Sed euismod, nunc ut aliquam lacinia, nunc nisl aliquet nunc,
                  eu aliquam nisl nunc euismod nunc. Nunc nisl aliquet nunc, eu
                  aliquam nisl nunc euismod nunc. Nunc nisl aliquet nunc, eu aliquam
                  nisl nunc euismod nunc. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
            </motion.div>
          </motion.div>
          )}
        {modalImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setModalImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <X
                className="absolute top-2 right-2 text-white w-6 h-6 cursor-pointer z-50"
                onClick={() => setModalImage(null)}
              />
              <Image
                src={modalImage.src}
                alt={modalImage.alt}
                width={1600}
                height={1200}
                className="w-full h-auto rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>)
}

export default Page

{/* <h1 className="text-3xl font-bold mb-6">Gallery</h1>
        <p className="text-lg text-gray-700 mb-6">
          This is ShuttleBrew Café—born from the love of coffee and community.
          A cozy nook where players unwind after a match, friends gather for
          warm conversations, and every cup is brewed with passion. From
          handcrafted drinks to comforting meals, ShuttleBrew is more than
          just a café—it’s part of your game-day story.
        </p>


        <AnimatePresence>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 auto-rows-[180px] gap-4">
            {galleryImages.slice(0, visibleCount).map((img, indx) => (
              <GalleryImage
                key={indx}
                src={img.src}
                alt={img.alt}
                caption={img.caption}
                span={spans[indx] || "col-span-1 row-span-1"}
                onClick={() => setModalImage({ src: img.src, alt: img.alt })}
              />
            ))}
          </div>
        </AnimatePresence>

        <div className="flex justify-center mt-6 gap-4">
          {visibleCount < galleryImages.length && (
            <button
              onClick={() => setVisibleCount(prev => Math.min(prev + 12, galleryImages.length))}
              className="px-6 py-2 bg-[#2FB44D] cursor-pointer text-white rounded-md shadow-md hover:bg-[#27a243] transition-colors font-medium">
              See More
            </button>
          )}

          {visibleCount > INITIAL_COUNT && (
            <button
              className="px-6 py-2 bg-[#d0d0d8] text-gray-900 font-semibold rounded shadow hover:bg-[#cbd5e1] transition cursor-pointer"
              onClick={() => setVisibleCount(INITIAL_COUNT)}
            >
              See Less
            </button>
          )}
        </div>

        <AnimatePresence>
          {modalImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
              onClick={() => setModalImage(null)}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="relative max-w-4xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <X
                  className="absolute top-2 right-2 text-white w-6 h-6 cursor-pointer z-50"
                  onClick={() => setModalImage(null)}
                />

                <Image
                  src={modalImage.src}
                  alt={modalImage.alt}
                  width={1600}
                  height={1200}
                  className="w-full h-auto rounded-lg"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence> */}

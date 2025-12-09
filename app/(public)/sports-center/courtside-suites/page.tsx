// Many image sa Accommodation

// "use client"
// import Header from "@/components/custom/header";
// import { motion, useScroll, useTransform } from "framer-motion";
// import Image from "next/image";
// import { useEffect, useRef, useState } from "react";
// import { useInView } from "framer-motion";
// import Footer from "@/components/custom/footer";
// import ScrollIndicator from "@/components/custom/scroll-indicator";
// import Link from "next/link";
// import useSmoothScroll from "@/hooks/useSmoothScroll";
// import { RulerDimensionLine, Users2 } from "lucide-react";
// import FloatingChatWidget from "@/components/custom/ticket";

// const features = [
//   {
//     img: "/assets/img/sports-center/suite/_ALP9421.jpg",
//     title: "Luxury Lounges",
//     desc: "Relax in our premium lounges designed for ultimate comfort and exclusivity.",
//   },
//   {
//     img: "/assets/img/sports-center/suite/_ALP9397.jpg",
//     title: "Private Dining",
//     desc: "Enjoy gourmet catering with a wide range of delicious food and drinks.",
//   },
//   {
//     img: "/assets/img/sports-center/suite/_ALP9605-Enhanced-NR.jpg",
//     title: "Panoramic Views",
//     desc: "Take in stunning views of the game with prime seating locations.",
//   },
//   {
//     img: "/assets/img/sports-center/suite/_ALP9615-Enhanced-NR.jpg",
//     title: "World-Class Service",
//     desc: "Our dedicated staff ensures a seamless and unforgettable experience.",
//   },
//   {
//     img: "/assets/img/sports-center/suite/_ALP9615-Enhanced-NR.jpg",
//     title: "World-Class Service",
//     desc: "Our dedicated staff ensures a seamless and unforgettable experience.",
//   },
// ];

// const accommodationImages = [
//   "/assets/img/sports-center/suite/_ALP9421.jpg",
//   "/assets/img/sports-center/suite/_ALP9397.jpg",
//   "/assets/img/sports-center/suite/_ALP9605-Enhanced-NR.jpg",
//   "/assets/img/sports-center/suite/_ALP9615-Enhanced-NR.jpg",
//   "/assets/img/sports-center/suite/_ALP9615-Enhanced-NR.jpg",
// ]

// // const facilitiesImage = [
// //   "/assets/img/sports-center/suite/_ALP9421.jpg",
// //   "/assets/img/sports-center/suite/_ALP9615-Enhanced-NR.jpg",
// // ]

// const facilitiesCaptions = [
//   { title: "Luxury Lounges", desc: "Relax in our premium lounges designed for ultimate comfort.", statValue: 5, statLabel: "Rooms Available" },
//   { title: "Private Dining", desc: "Enjoy gourmet catering with a wide range of delicious food.", statValue: 1, statLabel: "Dining Area" },
// ]

// const accommodationCaptions = [
//   {
//     title: "Single Twin Bed",
//     desc: "Relax in our premium lounges designed for ultimate comfort and exclusivity.",
//     href: "/sports-center/courtside-suites/single-bed/",
//     capacity: "2 People",
//     size: "35 ft²",
//   },
//   {
//     title: "Twin Beds",
//     desc: "Enjoy gourmet catering with a wide range of delicious food and drinks.",
//     href: "/sports-center/courtside-suites/twin-beds",
//     capacity: "4 People",
//     size: "50 ft²",
//   },
//   {
//     title: "King Size Bed",
//     desc: "Take in stunning views of the game with prime seating locations.",
//     href: "/sports-center/courtside-suites/king-bed",
//     capacity: "6 People",
//     size: "65 ft²",
//   },
//   {
//     title: "Queen Size Bed",
//     desc: "Our dedicated staff ensures a seamless and unforgettable experience.",
//     href: "/sports-center/courtside-suites/queen-bed",
//     capacity: "3 People",
//     size: "40 ft²",
//   },
//   {
//     title: "Single Bed",
//     desc: "Experience the highest level of privacy and comfort in our suites.",
//     href: "/sports-center/courtside-suites/single-bed",
//     capacity: "5 People",
//     size: "55 ft²",
//   },
// ]

// function Counter({ target, duration = 2, images }: { target: number; duration?: number; images: string[] }) {
//   const [count, setCount] = useState(0);
//   const ref = useRef(null);
//   const isInView = useInView(ref, { once: true, amount: 0.5 });
//   const carouselRef = useRef<HTMLDivElement>(null);
//   const innerRef = useRef<HTMLDivElement>(null);
//   const [_width, setWidth] = useState(0);

//   useEffect(() => {
//     if (carouselRef.current && innerRef.current) {
//       const scrollWidth = innerRef.current.scrollWidth;
//       const containerWidth = carouselRef.current.offsetWidth;
//       setWidth(scrollWidth - containerWidth);
//     }
//   }, [images])

//   useEffect(() => {
//     if (!isInView) return;

//     const end = target;
//     const incrementTime = 1000 / 60;
//     const totalIncrements = (duration * 1000) / incrementTime;
//     let currentIncrement = 0;

//     const timer = setInterval(() => {
//       currentIncrement++;
//       const progress = currentIncrement / totalIncrements;
//       setCount(Math.floor(progress * end));

//       if (currentIncrement >= totalIncrements) {
//         clearInterval(timer);
//         setCount(end);
//       }
//     }, incrementTime);

//     return () => clearInterval(timer);
//   }, [isInView, target, duration]);

//   return <span ref={ref}>{count.toLocaleString()}</span>;
// }

// export default function Page() {
//   useSmoothScroll()
//   const stats = [
//     { label: "VIP Seats", value: 30 },
//     { label: "Exclusive Lounges", value: 4 },
//     { label: "Catering Options", value: 15 },
//   ];
//   const carouselRef = useRef<HTMLDivElement>(null)
//   const innerRef = useRef<HTMLDivElement>(null)
//   const [width, setWidth] = useState(0)
//   const images = accommodationImages
//   const expRef = useRef<HTMLDivElement>(null);
//   const { scrollYProgress: expProgress } = useScroll({
//     target: expRef,
//     offset: ["start end", "end start"],
//   });
//   const expBgY = useTransform(expProgress, [0, 1], ["0%", "30%"])
//   const heroRef = useRef<HTMLDivElement>(null);
//   const { scrollYProgress: heroProgress } = useScroll({
//     target: heroRef,
//     offset: ["start end", "end start"],
//   })
//   const heroBgY = useTransform(heroProgress, [0, 1], ["0%", "30%"])

//   const visitRef = useRef<HTMLDivElement>(null);
//   const { scrollYProgress: visitProgress } = useScroll({
//     target: visitRef,
//     offset: ["start end", "end start"],
//   })
//   const visitBgY = useTransform(visitProgress, [0, 1], ["0%", "30%"])

//   useEffect(() => {
//     if (carouselRef.current && innerRef.current) {
//       const scrollWidth = innerRef.current.scrollWidth
//       const containerWidth = carouselRef.current.offsetWidth
//       setWidth(scrollWidth - containerWidth)
//     }
//   }, [images])

//   return (
//     <div className="flex flex-col min-h-screen">
//       <Header />

//       <div ref={heroRef} className="relative w-full h-[100vh] md:h-screen overflow-hidden">
//         <motion.div
//           style={{
//             backgroundImage: "url(/assets/img/sports-center/suite/_ALP9611-Enhanced-NR.jpg)",
//             backgroundPosition: "center",
//             backgroundSize: "cover",
//             y: heroBgY,
//           }}
//           className="absolute inset-x-0 -top-[25%] -bottom-[20%]"
//         />
//         <div className="absolute inset-0 bg-black/50 flex items-center justify-center px-4 text-center">
//           <motion.h1
//             className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//           >
//             Courtside Suites
//           </motion.h1>
//         </div>
//       </div>

//       <div className="relative bg-[#181818] py-20 md:py-32">
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//           <motion.div
//             className="text-center mb-12 md:mb-20"
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.8 }}
//           >
//             <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6">
//               Premium Experience
//             </h2>
//             <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
//               Our courtside suites offer the ultimate viewing experience with luxury amenities and unparalleled comfort.
//             </p>
//           </motion.div>

//           <div className="mt-12 md:mt-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-center">
//             {stats.map((stat, i) => (
//               <motion.div
//                 key={stat.label}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true, amount: 0.5 }}
//                 transition={{ duration: 0.6, delay: i * 0.2 }}
//                 className="text-[#4CAF50]/90"
//               >
//                 <h3 className="text-4xl sm:text-5xl md:text-5xl lg:text-5xl font-bold text-[#4CAF50]/90">
//                   <Counter target={stat.value} images={accommodationImages} />+
//                 </h3>
//                 <p className="text-gray-300 mt-2 text-sm sm:text-base md:text-lg">{stat.label}</p>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="relative bg-[#232323] py-20 md:py-32">
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//           <motion.div
//             className="text-center mb-12 md:mb-20"
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.8 }}
//           >
//             <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6">
//               Suite Services & Amenities
//             </h2>
//             <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
//               Enjoy exceptional services and premium amenities designed for your comfort and satisfaction.
//             </p>
//           </motion.div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
//             {[
//               { icon: "/assets/img/sports-center/suite/cafe.png", title: "Café", desc: "Savor gourmet meals in our premium on-site café." },
//               { icon: "/assets/img/sports-center/suite/WiFi.png", title: "Fast WiFi", desc: "Stay connected with high-speed internet access throughout your stay." },
//               { icon: "/assets/img/sports-center/suite/complimentary_drinks.png", title: "Complimentary Drinks", desc: "Enjoy a selection of complimentary beverages and refreshments, served throughout your stay." },
//               { icon: "/assets/img/sports-center/suite/perks.png", title: "ShuttleBrew Perk", desc: "Exclusive 5% OFF at the trendy ShuttleBrew Cafe." },
//               { icon: "/assets/img/sports-center/suite/shower.png", title: "Shower", desc: "Convenient shower facilities for a refreshing experience. Modern Hot & Cold shower for a relaxing refresh." },
//               { icon: "/assets/img/sports-center/suite/badminton.png", title: "Badminton Courts", desc: "Enjoy a 1 Hour FREE access to the dynamic C-ONE Sports Center Badminton Court." },
//             ].map((item, i) => (
//               <motion.div
//                 key={i}
//                 className="flex flex-col items-center text-center"
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ duration: 0.6, delay: i * 0.2 }}
//               >
//                 <div className="bg-[#ab8965] rounded-t-full p-5 mb-4 max-h-25 flex items-center justify-center">
//                   <Image src={item.icon} alt={item.title} width={75} height={70} />
//                 </div>
//                 <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
//                 <p className="text-gray-400 text-sm sm:text-base max-w-xs">{item.desc}</p>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="relative bg-[#181818] py-20 md:py-32">
//         <div
//           className="absolute inset-0 z-0 opacity-40"
//           style={{
//             backgroundImage: `url("data:image/svg+xml,%3Csvg width='150' height='150' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23333333' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
//           }}
//         ></div>

//         <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//           <motion.div
//             className="text-center mb-12 md:mb-20"
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.8 }}
//           >
//             <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6">
//               Premium Features
//             </h2>
//             <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
//               Discover more exclusive benefits and amenities of our courtside suites.
//             </p>
//           </motion.div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
//             {features.map((feature, i) => (
//               <motion.div
//                 key={i}
//                 className="bg-[#222222] cursor-pointer p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300"
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ duration: 0.6, delay: i * 0.15 }}
//               >
//                 <div className="h-44 sm:h-56 relative mb-4">
//                   <Image
//                     src={feature.img}
//                     alt={feature.title}
//                     fill
//                     className="object-cover rounded-lg"
//                   />
//                 </div>
//                 <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
//                   {feature.title}
//                 </h3>
//                 <p className="text-gray-400 text-xs sm:text-sm md:text-sm">
//                   {feature.desc}
//                 </p>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div ref={expRef} className="relative w-full h-[60vh] md:h-screen overflow-hidden">
//         <motion.div
//           style={{
//             backgroundImage: "url(/assets/img/sports-center/suite/_ALP9605-Enhanced-NR.jpg)",
//             backgroundPosition: "center",
//             backgroundSize: "cover",
//             y: expBgY,
//           }}
//           className="absolute inset-x-0 -top-[20%] -bottom-[20%]"
//         />
//         <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 text-center">
//           <motion.h2
//             className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//           >
//             Experience Luxury & Comfort
//           </motion.h2>
//           <motion.p
//             className="text-gray-300 text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl"
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 1, delay: 0.3 }}
//           >
//             Immerse yourself in our premium courtside suites with stunning views, modern amenities, and unparalleled service for a memorable experience.
//           </motion.p>
//         </div>

//         <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 text-center">
//           <motion.h2
//             className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//           >
//             Experience Luxury & Comfort
//           </motion.h2>
//           <motion.p
//             className="text-gray-300 text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl"
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 1, delay: 0.3 }}
//           >
//             Immerse yourself in our premium courtside suites with stunning views, modern amenities, and unparalleled service for a memorable experience.
//           </motion.p>
//         </div>
//       </div>


//       <div id="accommodations"  className="py-20 md:py-32 bg-[#232323] relative">

//         <button
//           onClick={() => {
//             if (carouselRef.current) {
//               const el = carouselRef.current;
//               if (el.scrollLeft <= 0) {
//                 el.scrollTo({ left: el.scrollWidth - el.offsetWidth, behavior: "smooth" });
//               } else {
//                 el.scrollBy({ left: -518, behavior: "smooth" });
//               }
//             }
//           }}
//           className="absolute left-0 top-1/2 -translate-y-1/2 z-30 
//              bg-[#2FB44D]/60 text-white px-5 py-4 shadow-lg hover:bg-[#2FB44D]/80 transition
//              rounded-r-full cursor-pointer"
//         >
//           &lt;
//         </button>

//         <button
//           onClick={() => {
//             if (carouselRef.current) {
//               const el = carouselRef.current;
//               if (el.scrollLeft + el.offsetWidth >= el.scrollWidth - 10) {
//                 el.scrollTo({ left: 0, behavior: "smooth" });
//               } else {
//                 el.scrollBy({ left: 517, behavior: "smooth" });
//               }
//             }
//           }}
//           className="absolute right-0 top-1/2 -translate-y-1/2 z-30 
//              bg-[#2FB44D]/60 text-white px-5 py-4 shadow-lg hover:bg-[#2FB44D]/80 transition
//              rounded-l-full cursor-pointer"
//         >
//           &gt;
//         </button>

//         <div className="container mx-auto px-4 sm:px-6 lg:px-1 relative z-20">
//           <motion.div
//             className="text-center mb-12"
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.8 }}
//           >
//             <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6">
//               Accommodation
//             </h2>
//             <p className="text-[#a98864] text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
//               Stay in style with our elegant suites, refined interiors, and exceptional amenities.
//             </p>
//           </motion.div>

//           <motion.div ref={carouselRef} className="overflow-hidden cursor-grab">
//             <motion.div
//               ref={innerRef}
//               className="flex gap-6"
//               drag="x"
//               dragConstraints={{ left: -width, right: 0 }}
//               whileTap={{ cursor: "grabbing" }}
//             >
//               {accommodationImages.map((img, i) => (
//                 <motion.div
//                   key={i}
//                   className="flex-shrink-0 w-[calc(33.333%-16px)] h-[28rem] relative overflow-hidden shadow-lg border border-black rounded-t-full group"
//                 >
//                   <Image
//                     src={img}
//                     alt={accommodationCaptions[i].title}
//                     fill
//                     className="object-cover pointer-events-none transition-transform duration-500 group-hover:scale-110"
//                     onLoad={() => {
//                       if (carouselRef.current && innerRef.current) {
//                         const scrollWidth = innerRef.current.scrollWidth;
//                         const containerWidth = carouselRef.current.offsetWidth;
//                         setWidth(scrollWidth - containerWidth);
//                       }
//                     }}
//                   />

//                   <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#ac8d6e]/80 to-transparent" />

//                   <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center px-4 w-full">
//                     <p className="text-white text-lg font-semibold drop-shadow-md">
//                       {accommodationCaptions[i].title}
//                     </p>

//                     <div className="flex justify-center gap-4 mt-1 text-sm text-white/90">

//                       <div className="flex items-center gap-1">
//                         <Users2 className="w-4 h-4" />
//                         <span>{accommodationCaptions[i].capacity}</span>
//                       </div>

//                       <div className="flex items-center gap-1">
//                         <RulerDimensionLine className="w-4 h-4" />
//                         <span>{accommodationCaptions[i].size}</span>
//                       </div>
//                     </div>
//                   </div>


//                   <div className="absolute inset-0 bg-black/80 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-6 text-center">
//                     <h3 className="text-xl font-bold mb-3">{accommodationCaptions[i].title}</h3>
//                     <p className="text-sm mb-4">{accommodationCaptions[i].desc}</p>
//                     <Link href={accommodationCaptions[i].href} passHref>
//                       <button className="px-4 py-2 bg-[#a98864] text-white font-medium rounded-lg shadow-md hover:bg-[#8a6e4d] transition cursor-pointer">
//                         Learn More
//                       </button>
//                     </Link>
//                   </div>
//                 </motion.div>
//               ))}
//             </motion.div>
//           </motion.div>
//         </div>
//       </div>


//       <div className="py-20 md:py-45 bg-white relative z-30">
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//           <motion.div
//             className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.8 }}
//           >
//             <div>
//               <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
//                 More About Our Suites
//               </h2>
//               <p className="text-gray-700 text-sm sm:text-base md:text-lg mb-4 md:mb-6">
//                 Our courtside suites are designed to provide an exceptional experience for sports enthusiasts and corporate clients alike.
//               </p>
//               <p className="text-gray-700 text-sm sm:text-base md:text-lg mb-4 md:mb-6">
//                 Each suite features modern amenities including climate control, high-definition screens, and dedicated service staff to ensure your experience is nothing short of extraordinary.
//               </p>
//               <p className="text-gray-700 text-sm sm:text-base md:text-lg">
//                 Whether youre entertaining clients, celebrating with friends, or treating your family to a special outing, our courtside suites offer the perfect setting for creating unforgettable memories.
//               </p>
//             </div>

//             <div className="relative h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden shadow-xl">
//               <Image
//                 src="/assets/img/sports-center/suite/_ALP9374.jpg"
//                 alt="Suite Lounge"
//                 fill
//                 className="object-cover"
//               />
//             </div>
//           </motion.div>
//         </div>
//       </div>

//       <div id="facilities" className="py-20 md:py-32 bg-[#181818] relative z-30">
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//           <motion.div
//             className="text-center mb-12 md:mb-20"
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.8 }}
//           >
//             <p className="text-[#a0a0a0] text-sm sm:text-base uppercase tracking-widest mb-2">
//               Rooms & Suites
//             </p>
//             <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
//               Our Facilities
//             </h2>
//           </motion.div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//             {accommodationImages.slice(0, 2).map((img, i) => (
//               <motion.div
//                 key={i}
//                 className="flex flex-col items-start"
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ duration: 0.6, delay: i * 0.2 }}
//               >

//                 <div className="relative w-full h-72 sm:h-96 md:h-[28rem] overflow-hidden shadow-xl rounded-sm">
//                   <Image
//                     src={img}
//                     alt={facilitiesCaptions[i]?.title || `Facility ${i + 1}`}
//                     fill
//                     className="object-cover rounded-sm"
//                   />
//                 </div>

//                 <div className="-mt-9 mx-auto relative z-10 bg-[#ab8965] text-white p-6 rounded-sm shadow-lg max-w-lg">
//                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">

//                     {i === 0 ? (
//                       <div className="flex flex-col items-start">
//                         <span className="text-2xl font-semibold ml-14">{facilitiesCaptions[i]?.statValue || "Info"}</span>
//                         <span className="text-md font-medium">{facilitiesCaptions[i]?.statLabel || "Detail"}</span>
//                       </div>
//                     ) : (
//                       <div className="flex flex-col items-start">
//                         <span className="text-2xl font-semibold ml-10">{facilitiesCaptions[i]?.statValue || "Info"}</span>
//                         <span className="text-md font-medium">{facilitiesCaptions[i]?.statLabel || "Detail"}</span>
//                       </div>
//                     )}

//                     <p className="text-sm leading-relaxed text-left sm:text-right max-w-xs">
//                       {facilitiesCaptions[i]?.desc || "Enjoy our premium facilities."}
//                     </p>
//                   </div>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//           <div className="mt-12 flex justify-center">
//             <Link href="/sports-center/courtside-suites/gallery/" passHref>
//               <button className="px-8 py-4 bg-[#ab8965] text-white font-bold rounded-md shadow-lg hover:bg-[#99704d] transition cursor-pointer">
//                 View Full Gallery
//               </button>
//             </Link>
//           </div>
//         </div>
//       </div>



//       <div ref={visitRef} className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
//         <motion.div
//           style={{
//             backgroundImage: "url(/assets/img/sports-center/suite/_ALP9454.jpg)",
//             backgroundPosition: "center",
//             backgroundSize: "cover",
//             y: visitBgY,
//           }}
//           className="absolute inset-x-0 -top-[25%] -bottom-[20%]"
//         />

//         <div className="absolute inset-0 bg-black/60"></div>

//         <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-8">
//           <motion.h2
//             className="text-white text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.8 }}
//           >
//             Experience Luxury Courtside Suites
//           </motion.h2>
//           <motion.p
//             className="text-gray-300 text-base sm:text-lg md:text-xl max-w-2xl mb-8"
//             initial={{ opacity: 0, y: 10 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//           >
//             Visit our premium suites today and enjoy world-class service, breathtaking views, and unforgettable comfort.
//           </motion.p>
//           <motion.div
//             initial={{ opacity: 0, y: 10 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.8, delay: 0.4 }}
//           >

//             <button
//               className="px-8 py-4 bg-[#ab8965] text-white font-bold rounded-lg shadow-lg hover:bg-[#99704d] transition cursor-pointer"
//               onClick={() => {
//               window.open(
//                 "https://www.google.com/maps/place/Courtside+Suites/@8.5001211,124.6393863,1169m/data=!3m2!1e3!4b1!4m6!3m5!1s0x32fff3001aa17ef3:0xc01cdb364269b417!8m2!3d8.5001158!4d124.6419612!16s%2Fg%2F11x16q80kj?entry=ttu",
//                 "_blank",
//                 "noopener,noreferrer"
//               );
//               }}
//             >
//               Visit Us
//             </button>

//           </motion.div>
//         </div>
//       </div>

//       <Footer />
//       <ScrollIndicator />
//       <FloatingChatWidget />
//     </div >
//   );
// }




"use client"
import Header from "@/components/custom/header"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useInView } from "framer-motion"
import Footer from "@/components/custom/footer"
import ScrollIndicator from "@/components/custom/scroll-indicator"
import Link from "next/link"
import useSmoothScroll from "@/hooks/useSmoothScroll"
import { RulerDimensionLine, Users2 } from "lucide-react"
import FloatingChatWidget from "@/components/custom/ticket"
import { CLOUD } from "@/components/custom/main-faq"
import { Button } from "@/components/ui/button"

const features = [
  {
    img: `${CLOUD}/v1764211574/_ALP9421_c9phyg.jpg`,
    title: "Luxury Lounges",
    desc: "Relax in our premium lounges designed for ultimate comfort and exclusivity.",
  },
  {
    img: `${CLOUD}/v1764211576/_ALP9397_cjvv7r.jpg`,
    title: "Private Dining",
    desc: "Enjoy gourmet catering with a wide range of delicious food and drinks.",
  },
  {
    img: `${CLOUD}/v1764211575/_ALP9605-Enhanced-NR_hjo7u2.jpg`,
    title: "Panoramic Views",
    desc: "Take in stunning views of the game with prime seating locations.",
  },
  {
    img: `${CLOUD}/v1764211578/_ALP9615-Enhanced-NR_ksjfjg.jpg`,
    title: "World-Class Service",
    desc: "Our dedicated staff ensures a seamless and unforgettable experience.",
  },
  {
    img: `${CLOUD}/v1764211816/_ALP9608-Enhanced-NR_te67tf.jpg`,
    title: "World-Class Service",
    desc: "Our dedicated staff ensures a seamless and unforgettable experience.",
  },
]

const accommodationImages = [
  `${CLOUD}/v1764211864/_ALP9421_ype0yc.jpg`,
  `${CLOUD}/v1764211865/_ALP9397_wvlkwq.jpg`,
  // "/assets/img/sports-center/suite/_ALP9605-Enhanced-NR.jpg",
  // "/assets/img/sports-center/suite/_ALP9615-Enhanced-NR.jpg",
  // "/assets/img/sports-center/suite/_ALP9615-Enhanced-NR.jpg",
]

// const facilitiesImage = [
//   "/assets/img/sports-center/suite/_ALP9421.jpg",
//   "/assets/img/sports-center/suite/_ALP9615-Enhanced-NR.jpg",
// ]

const facilitiesCaptions = [
  { title: "Luxury Lounges", desc: "Relax in our premium lounges designed for ultimate comfort.", statValue: 5, statLabel: "Rooms Available" },
  { title: "Private Dining", desc: "Enjoy gourmet catering with a wide range of delicious food.", statValue: 1, statLabel: "Dining Area" },
]

const accommodationCaptions = [
  {
    title: "Single Twin Bed",
    desc: "Relax in our premium lounges designed for ultimate comfort and exclusivity.",
    href: "/sports-center/courtside-suites/single-bed/",
    capacity: "2 People",
    size: "35 ft²",
  },
  {
    title: "Twin Beds",
    desc: "Enjoy gourmet catering with a wide range of delicious food and drinks.",
    href: "/sports-center/courtside-suites/twin-beds",
    capacity: "4 People",
    size: "50 ft²",
  },
  // {
  //   title: "King Size Bed",
  //   desc: "Take in stunning views of the game with prime seating locations.",
  //   href: "/sports-center/courtside-suites/king-bed",
  //   capacity: "6 People",
  //   size: "65 ft²",
  // },
  // {
  //   title: "Queen Size Bed",
  //   desc: "Our dedicated staff ensures a seamless and unforgettable experience.",
  //   href: "/sports-center/courtside-suites/queen-bed",
  //   capacity: "3 People",
  //   size: "40 ft²",
  // },
  // {
  //   title: "Single Bed",
  //   desc: "Experience the highest level of privacy and comfort in our suites.",
  //   href: "/sports-center/courtside-suites/single-bed",
  //   capacity: "5 People",
  //   size: "55 ft²",
  // },
]

function Counter({ target, duration = 2, images }: { target: number; duration?: number; images: string[] }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const carouselRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [_width, setWidth] = useState(0)

  useEffect(() => {
    if (carouselRef.current && innerRef.current) {
      const scrollWidth = innerRef.current.scrollWidth
      const containerWidth = carouselRef.current.offsetWidth
      setWidth(scrollWidth - containerWidth)
    }
  }, [images])

  useEffect(() => {
    if (!isInView) return

    const end = target
    const incrementTime = 1000 / 60
    const totalIncrements = (duration * 1000) / incrementTime
    let currentIncrement = 0

    const timer = setInterval(() => {
      currentIncrement++
      const progress = currentIncrement / totalIncrements
      setCount(Math.floor(progress * end))

      if (currentIncrement >= totalIncrements) {
        clearInterval(timer)
        setCount(end)
      }
    }, incrementTime)

    return () => clearInterval(timer)
  }, [isInView, target, duration])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

export default function Page() {
  useSmoothScroll()
  const stats = [
    { label: "VIP Seats", value: 30 },
    { label: "Exclusive Lounges", value: 4 },
    { label: "Catering Options", value: 15 },
  ]
  const carouselRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const images = accommodationImages
  const expRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: expProgress } = useScroll({
    target: expRef,
    offset: ["start end", "end start"],
  })
  const expBgY = useTransform(expProgress, [0, 1], ["0%", "30%"])
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  })
  const heroBgY = useTransform(heroProgress, [0, 1], ["0%", "30%"])

  const visitRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: visitProgress } = useScroll({
    target: visitRef,
    offset: ["start end", "end start"],
  })
  const visitBgY = useTransform(visitProgress, [0, 1], ["0%", "30%"])

  useEffect(() => {
    if (carouselRef.current && innerRef.current) {
      const scrollWidth = innerRef.current.scrollWidth
      const containerWidth = carouselRef.current.offsetWidth
      setWidth(scrollWidth - containerWidth)
    }
  }, [images])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div ref={heroRef} className="relative w-full h-[100vh] md:h-screen overflow-hidden">
        <motion.div
          style={{
            backgroundImage: `url(${CLOUD}/v1764116192/_ALP9611-Enhanced-NR_mtutma.jpg)`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            y: heroBgY,
          }}
          className="absolute inset-x-0 -top-[25%] -bottom-[20%]"
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center px-4 text-center gap-10">
          <motion.h1
            className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Courtside Suites
          </motion.h1>

          <p className="text-white text-sm lg:text-xl leading-relaxed max-w-3xl">
            A Stylish Container House Accommodation beside C-ONE Sports Center near the action.{" "}
            <span className="font-bold text-amber-400">Courtside Suites</span> offers a modern
            container house experience - perfect for athletes, sports enthusiasts, and a coffee lovers who
            wants convenience and relaxation in one place!
          </p>
        </div>

      </div>

      <div className="relative bg-[#181818] py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-12 md:mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6">
              Premium Experience
            </h2>
            <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
              Our courtside suites offer the ultimate viewing experience with luxury amenities and unparalleled comfort.
            </p>
          </motion.div>

          <div className="mt-12 md:mt-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-center">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="text-[#4CAF50]/90"
              >
                <h3 className="text-4xl sm:text-5xl md:text-5xl lg:text-5xl font-bold text-[#4CAF50]/90">
                  <Counter target={stat.value} images={accommodationImages} />+
                </h3>
                <p className="text-gray-300 mt-2 text-sm sm:text-base md:text-lg">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative bg-[#232323] py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-12 md:mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6">
              Suite Services & Amenities
            </h2>
            <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
              Enjoy exceptional services and premium amenities designed for your comfort and satisfaction.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
            {[
              { icon: "/assets/img/sports-center/suite/cafe.png", title: "Café", desc: "Savor gourmet meals in our premium on-site café." },
              { icon: "/assets/img/sports-center/suite/WiFi.png", title: "Fast WiFi", desc: "Stay connected with high-speed internet access throughout your stay." },
              { icon: "/assets/img/sports-center/suite/complimentary_drinks.png", title: "Complimentary Drinks", desc: "Enjoy a selection of complimentary beverages and refreshments, served throughout your stay." },
              { icon: "/assets/img/sports-center/suite/perks.png", title: "ShuttleBrew Perk", desc: "Exclusive 5% OFF at the trendy ShuttleBrew Cafe." },
              { icon: "/assets/img/sports-center/suite/shower.png", title: "Shower", desc: "Convenient shower facilities for a refreshing experience. Modern Hot & Cold shower for a relaxing refresh." },
              { icon: "/assets/img/sports-center/suite/badminton.png", title: "Badminton Courts", desc: "Enjoy a 1 Hour FREE access to the dynamic C-ONE Sports Center Badminton Court." },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
              >
                <div className="bg-[#ab8965] rounded-t-full p-5 mb-4 max-h-25 flex items-center justify-center">
                  <Image src={item.icon} alt={item.title} width={75} height={70} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm sm:text-base max-w-xs">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative bg-[#181818] py-20 md:py-32">
        <div
          className="absolute inset-0 z-0 opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='150' height='150' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23333333' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-12 md:mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6">
              Premium Features
            </h2>
            <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
              Discover more exclusive benefits and amenities of our courtside suites.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="bg-[#222222] cursor-pointer p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <div className="h-44 sm:h-56 relative mb-4">
                  <Image
                    src={feature.img}
                    alt={feature.title}
                    fill
                    className="object-cover rounded-lg"
                    loading="lazy"
                    blurDataURL={feature.img}
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm md:text-sm">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div ref={expRef} className="relative w-full h-[60vh] md:h-screen overflow-hidden">
        <motion.div
          style={{
            backgroundImage: `url(${CLOUD}/v1764211575/_ALP9605-Enhanced-NR_hjo7u2.jpg)`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            y: expBgY,
          }}
          className="absolute inset-x-0 -top-[20%] -bottom-[20%]"
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 text-center">
          <motion.h2
            className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Experience Luxury & Comfort
          </motion.h2>
          <motion.p
            className="text-gray-300 text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Immerse yourself in our premium courtside suites with stunning views, modern amenities, and unparalleled service for a memorable experience.
          </motion.p>
        </div>

        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 text-center">
          <motion.h2
            className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Experience Luxury & Comfort
          </motion.h2>
          <motion.p
            className="text-gray-300 text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Immerse yourself in our premium courtside suites with stunning views, modern amenities, and unparalleled service for a memorable experience.
          </motion.p>
        </div>
      </div>


      <div id="accommodations" className="py-20 md:py-32 bg-[#232323] relative">

        <Button
          onClick={() => {
            if (carouselRef.current) {
              const el = carouselRef.current
              if (el.scrollLeft <= 0) {
                el.scrollTo({ left: el.scrollWidth - el.offsetWidth, behavior: "smooth" })
              } else {
                el.scrollBy({ left: -518, behavior: "smooth" })
              }
            }
          }}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-30 
             bg-[#2FB44D]/90 text-white px-6! py-9! shadow-lg hover:bg-[#2FB44D]/80 transition
             rounded-r-full cursor-pointer"
        >
          &lt;
        </Button>

        <Button
          onClick={() => {
            if (carouselRef.current) {
              const el = carouselRef.current
              if (el.scrollLeft + el.offsetWidth >= el.scrollWidth - 10) {
                el.scrollTo({ left: 0, behavior: "smooth" })
              } else {
                el.scrollBy({ left: 517, behavior: "smooth" })
              }
            }
          }}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-30 
             bg-[#2FB44D]/90 text-white px-6! py-9! shadow-lg hover:bg-[#2FB44D]/80 transition
             rounded-l-full cursor-pointer"
        >
          &gt;
        </Button>

        <div className="container mx-auto px-4 sm:px-6 lg:px-1 relative z-20">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6">
              Accommodation
            </h2>
            <p className="text-[#a98864] text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
              Stay in style with our elegant suites, refined interiors, and exceptional amenities.
            </p>
          </motion.div>

          <motion.div
            ref={carouselRef}
            className="cursor-grab overflow-hidden sm:overflow-x-auto sm:scroll-smooth sm:snap-x sm:snap-mandatory"
          >
            <motion.div
              ref={innerRef}
              className="
      flex gap-6
      justify-center
      sm:justify-start sm:flex-nowrap sm:px-4
      lg:flex-wrap lg:justify-center
    "
            >
              {accommodationImages.map((img, i) => (
                <motion.div
                  key={i}
                  className={`
          flex-shrink-0
          w-[90%] sm:w-[90%] md:w-[45%] lg:w-[calc(33.333%-16px)]
          h-[22rem] sm:h-[28rem] md:h-[26rem] lg:h-[28rem]
          relative overflow-hidden shadow-lg border border-black rounded-t-full group
          snap-center transition-all duration-300
         ${i === 0 ? 'ml-100 md:ml-0 lg:ml-0' : ""}
        `}
                >
                  <Image
                    src={img}
                    alt={accommodationCaptions[i].title}
                    fill
                    className="object-cover pointer-events-none transition-transform duration-500 group-hover:scale-110"
                    onLoad={() => {
                      if (carouselRef.current && innerRef.current) {
                        const scrollWidth = innerRef.current.scrollWidth
                        const containerWidth = carouselRef.current.offsetWidth
                        setWidth(scrollWidth - containerWidth)
                      }
                    }}
                  />

                  <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#ac8d6e]/80 to-transparent" />

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center px-4 w-full">
                    <p className="text-white text-lg font-semibold drop-shadow-md">
                      {accommodationCaptions[i].title}
                    </p>
                    <div className="flex justify-center gap-4 mt-1 text-sm text-white/90">
                      <div className="flex items-center gap-1">
                        <Users2 className="w-4 h-4" />
                        <span>{accommodationCaptions[i].capacity}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <RulerDimensionLine className="w-4 h-4" />
                        <span>{accommodationCaptions[i].size}</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-black/80 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-6 text-center">
                    <h3 className="text-xl font-bold mb-3">{accommodationCaptions[i].title}</h3>
                    <p className="text-sm mb-4">{accommodationCaptions[i].desc}</p>
                    <Link href={accommodationCaptions[i].href} passHref>
                      <button className="px-4 py-2 bg-[#a98864] text-white font-medium rounded-lg shadow-md hover:bg-[#8a6e4d] transition cursor-pointer">
                        Learn More
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="py-20 md:py-45 bg-white relative z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
                More About Our Suites
              </h2>
              <p className="text-gray-700 text-sm sm:text-base md:text-lg mb-4 md:mb-6">
                Our courtside suites are designed to provide an exceptional experience for sports enthusiasts and corporate clients alike.
              </p>
              <p className="text-gray-700 text-sm sm:text-base md:text-lg mb-4 md:mb-6">
                Each suite features modern amenities including climate control, high-definition screens, and dedicated service staff to ensure your experience is nothing short of extraordinary.
              </p>
              <p className="text-gray-700 text-sm sm:text-base md:text-lg">
                Whether youre entertaining clients, celebrating with friends, or treating your family to a special outing, our courtside suites offer the perfect setting for creating unforgettable memories.
              </p>
            </div>

            <div className="relative h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={`${CLOUD}/v1764212169/_ALP9374_lqst5s.jpg`}
                alt="Suite Lounge"
                fill
                className="object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div id="facilities" className="py-20 md:py-32 bg-[#181818] relative z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12 md:mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[#a0a0a0] text-sm sm:text-base uppercase tracking-widest mb-2">
              Rooms & Suites
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              Our Facilities
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {accommodationImages.slice(0, 2).map((img, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-start"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
              >

                <div className="relative w-full h-72 sm:h-96 md:h-[28rem] overflow-hidden shadow-xl rounded-sm">
                  <Image
                    src={img}
                    alt={facilitiesCaptions[i]?.title || `Facility ${i + 1}`}
                    fill
                    className="object-cover rounded-sm"
                  />
                </div>

                <div className="-mt-9 mx-auto relative z-10 bg-[#ab8965] text-white p-6 rounded-sm shadow-lg max-w-lg">
                  <div className="flex flex-col justify-between items-center md:items-center lg:flex-row lg:items-start sm:items-center w-full gap-4">

                    {i === 0 ? (
                      <div className="flex flex-col items-start">
                        <span className="text-2xl font-semibold ml-14">{facilitiesCaptions[i]?.statValue || "Info"}</span>
                        <span className="text-md font-medium">{facilitiesCaptions[i]?.statLabel || "Detail"}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start">
                        <span className="text-2xl font-semibold ml-10">{facilitiesCaptions[i]?.statValue || "Info"}</span>
                        <span className="text-md font-medium">{facilitiesCaptions[i]?.statLabel || "Detail"}</span>
                      </div>
                    )}

                    <p className="text-sm leading-relaxed text-center md:text-center lg:text-center max-w-xs">
                      {facilitiesCaptions[i]?.desc || "Enjoy our premium facilities."}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <Link href="/sports-center/courtside-suites/gallery/" passHref>
              <button className="px-8 py-4 bg-[#ab8965] text-white font-bold rounded-md shadow-lg hover:bg-[#99704d] transition cursor-pointer">
                View Full Gallery
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div ref={visitRef} className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
        <motion.div
          style={{
            backgroundImage: `url(${CLOUD}/v1764212237/_ALP9454_mfp6hs.jpg)`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            y: visitBgY,
          }}
          className="absolute inset-x-0 -top-[25%] -bottom-[20%]"
        />

        <div className="absolute inset-0 bg-black/60"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-8">
          <motion.h2
            className="text-white text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Experience Luxury Courtside Suites
          </motion.h2>
          <motion.p
            className="text-gray-300 text-base sm:text-lg md:text-xl max-w-2xl mb-8"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Visit our premium suites today and enjoy world-class service, breathtaking views, and unforgettable comfort.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >

            <button
              className="px-8 py-4 bg-[#ab8965] text-white font-bold rounded-lg shadow-lg hover:bg-[#99704d] transition cursor-pointer"
              onClick={() => {
                window.open(
                  "https://www.google.com/maps/place/Courtside+Suites/@8.5001211,124.6393863,1169m/data=!3m2!1e3!4b1!4m6!3m5!1s0x32fff3001aa17ef3:0xc01cdb364269b417!8m2!3d8.5001158!4d124.6419612!16s%2Fg%2F11x16q80kj?entry=ttu",
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
            >
              Visit Us
            </button>

          </motion.div>
        </div>
      </div>

      <Footer />
      <ScrollIndicator />
      <FloatingChatWidget />
    </div >
  )
}

"use client";

import React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import Link from "next/link";

const drinks = [
  { name: "Frapped (Coffee Based)", img: "/assets/img/sports-center/shuttlebrew/menu/20241007_100457.jpg" },
  { name: "Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/espresso.jpg" },
  { name: "Espresso Soda Signature", img: "/assets/img/sports-center/shuttlebrew/menu/espresso-soda.jpg" },
  { name: "Smoothies", img: "/assets/img/sports-center/shuttlebrew/menu/bananacreme.png" },
  { name: "Sparkling Drinks", img: "/assets/img/sports-center/shuttlebrew/menu/20241007_150656.jpg" },
];

const food = [
  { name: "Ramen", img: "/assets/img/sports-center/shuttlebrew/menu/ramen.png" },
  { name: "Power Smash Carbonara", img: "/assets/img/sports-center/shuttlebrew/menu/carbonara.png" },
  { name: "Shuttle Buns Burger", img: "/assets/img/sports-center/shuttlebrew/menu/buns-burger.png" },
  { name: "Smash N' Cheese Fries", img: "/assets/img/sports-center/shuttlebrew/menu/fries.png" },
  { name: "Net Play Aglio Olio", img: "/assets/img/sports-center/shuttlebrew/menu/aglioolio.png" },
  { name: "Crunch Serve Nachos", img: "/assets/img/sports-center/shuttlebrew/menu/nachos.png" },
  { name: "Shuttle Fries", img: "/assets/img/sports-center/shuttlebrew/menu/shuttle-fries.png" },
];

export default function Menu() {
  return (
    <section className="w-full py-20 px-6 md:px-20 bg-[#f5f2ec] relative">
      <div className="flex items-center justify-center mb-12 relative z-20">
        <span className="h-px sm:h-1 md:h-1.5 w-12 sm:w-16 md:w-20 border-t border-gray-400 mr-4"></span>
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-wider text-gray-900">
          Featured Menu
        </h2>
        <span className="h-px sm:h-1 md:h-1.5 w-12 sm:w-16 md:w-20 border-t border-gray-400 ml-4"></span>
      </div>

      <Tabs defaultValue="drinks" className="max-w-6xl mx-auto flex items-center justify-center">
        <TabsList className="flex justify-center gap-4 mb-8 ">
          <TabsTrigger value="drinks" className="cursor-pointer px-6 py-2 text-lg font-medium data-[state=active]:bg-amber-600 data-[state=active]:text-white">
            Drinks
          </TabsTrigger>
          <TabsTrigger value="food" className="cursor-pointer px-6 py-2 text-lg font-medium data-[state=active]:bg-amber-600 data-[state=active]:text-white">
            Food
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drinks">
          <div className="absolute left-0 w-screen h-90 bg-[#20140c] top-[24.8rem] z-10"></div>
          <Carousel opts={{ loop: true }} className="relative w-[120%] left-1/2 -translate-x-1/2 z-20">
            <CarouselContent className="flex gap-4">
              {drinks.map((item, index) => (
                <CarouselItem
                  key={index}
                  className="flex-none w-[calc((100%/3)-0.5rem)] flex flex-col items-center"
                >
                  <Link
                    href={`/sports-center/shuttlebrew/products/${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="group rounded-2xl overflow-hidden w-full"
                  >
                    <div className="cursor-pointer relative w-full h-64 sm:h-72 md:h-80 lg:h-96 transition-transform duration-500 transform group-hover:scale-105 rounded-2xl overflow-hidden">
                      <Image
                        src={item.img}
                        alt={item.name}
                        fill
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="mt-3 ml-2">
                      <h3 className="text-lg md:text-xl font-normal text-white">{item.name}</h3>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="cursor-pointer absolute -left-14 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-amber-600 hover:text-white transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </CarouselPrevious>
            <CarouselNext className="cursor-pointer absolute -right-14 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-amber-600 hover:text-white transition-colors">
              <ChevronRight className="w-6 h-6" />
            </CarouselNext>
          </Carousel>
        </TabsContent>

        <TabsContent value="food">
          <div className="absolute left-0 w-screen h-80 bg-[#20140c] top-[22.9rem] z-10"></div>
          <Carousel opts={{ loop: true }} className="relative z-20">
            <CarouselContent>
              {food.map((item, index) => (
                <CarouselItem
                  key={index}
                  className="sm:basis-1/2 md:basis-1/3 flex flex-col items-center"
                >
                  <div className="group rounded-2xl overflow-hidden w-full">
                    <div className="cursor-pointer relative w-full h-80 sm:h-96 md:h-[26rem] lg:h-[28rem] transition-transform duration-500 transform group-hover:scale-105 rounded-2xl overflow-hidden">
                      <Image
                        src={item.img}
                        alt={item.name}
                        fill
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="mt-3 ml-2">
                      <h3 className="text-lg md:text-xl font-normal text-white">{item.name}</h3>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="cursor-pointer absolute -left-14 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-amber-600 hover:text-white transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </CarouselPrevious>
            <CarouselNext className="cursor-pointer absolute -right-14 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-amber-600 hover:text-white transition-colors">
              <ChevronRight className="w-6 h-6" />
            </CarouselNext>
          </Carousel>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center mt-12">
        <Button variant="outline" className="px-6 py-2 text-lg font-medium border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white">
          See All
        </Button>
      </div>
    </section>
  );
}

// 2nd (Current One Using)

// "use client"

// import React, { useEffect, useRef, useState } from "react"
// import Image from "next/image"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Button } from "@/components/ui/button"
// import { Coffee } from "lucide-react"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog"
// import { drinks } from "./data/drink"
// import LazyImage from "./lazy-image"
// import { motion } from "framer-motion"

// const ITEMS_PER_PAGE = 5


// const food = [
//   { name: "Net Play Aglio Olio", img: "/assets/img/sports-center/shuttlebrew/menu/Net Play Aglio Olio.jpg", description: "Toasted bread, turkey, bacon, lettuce, tomato", ingredients: "Bread, Turkey, Bacon, Lettuce, Tomato, Mayo", price: 130.00, oldPrice: 7.0, tag: "Best Seller" },
//   { name: "Shuttle Buns Burger", img: "/assets/img/sports-center/shuttlebrew/menu/Shuttle Buns Burger.jpg", description: "Juicy grilled beef patty with melted cheese", ingredients: "Beef patty, Cheese, Lettuce, Tomato, Bun", price: 130.00, oldPrice: 8.0, tag: "" },
//   { name: "Power Smash Carbonara", img: "/assets/img/sports-center/shuttlebrew/menu/Power Smash Carbonara.jpg", description: "Juicy grilled beef patty with melted cheese", ingredients: "Beef patty, Cheese, Lettuce, Tomato, Bun", price: 184.80, oldPrice: 231.00, tag: "20% off" },
// ]

// const drinkCategories = [
//   "Espresso",
//   "Espresso Based",
//   "Milk-Based Espresso",
//   "Espresso Soda Signature",

//   "Cheese Cake Series",
//   "Banan Series",
//   "Yogurt Series",
//   "Frapped",
//   "Non-Caffeinated",
//   "Sparkling Drinks",
//   "Lemonade Coolers",
// ]


// function MenuList({ items, onItemClick }: { items: any[]; onItemClick: (item: any) => void }) {

//   return (
//     <div className="divide-y divide-gray-700">
//       {items.map((item, index) => (
//         <div
//           key={index}
//           onClick={() => onItemClick(item)}
//           className="flex flex-col md:flex-row items-start md:items-center justify-between py-6 gap-6 cursor-pointer hover:bg-gray-800/50 rounded-lg px-2"
//         >
//           {/* Number */}
//           <div className="text-[#C6AA58] font-normal text-xl md:w-12">
//             {String(index + 1).padStart(2, "0")} .
//           </div>

//           {/* Image with Tag */}
//           <div className="w-24 h-40 md:w-40 md:h-44 relative rounded-lg overflow-hidden flex-shrink-0">
//             <LazyImage
//               src={item.img}
//               alt={item.name}
//               width={300}
//               height={300}
//               className="object-cover object-bottom -mt-3"
//             />
//             {item.tag && (
//               <span className="absolute top-2 right-2 bg-[#C6AA58] text-black text-xs font-semibold px-2 py-0.5 rounded-full shadow-md">
//                 {item.tag}
//               </span>
//             )}
//           </div>

//           {/* Name + Description */}
//           <div className="flex-1 px-4">
//             <h3 className="text-lg text-[#F3F2ED] md:text-xl font-semibold">{item.name}</h3>
//             <p className="text-[#F3F2ED]/80 text-sm">{item.description}</p>
//           </div>

//           {/* Ingredients (NEW MIDDLE COLUMN) */}
//           <div className="hidden md:block flex-1 text-[#C6AA58] text-sm italic">
//             {item.ingredients}
//           </div>

//           {/* Price with Old Price */}
//           <div className="text-right">
//             {item.oldPrice && item.oldPrice > item.price && (
//               <p className="text-sm line-through text-gray-400">
//                 ₱ {item.oldPrice.toFixed(2)}
//               </p>
//             )}
//             <p className="text-[#C6AA58] font-bold text-lg">
//               ₱ {item.price.toFixed(2)}
//             </p>
//           </div>
//         </div>
//       ))}
//     </div>
//   )
// }

// export default function MenuTabs() {
//   const [activeDrinkCategory, setActiveDrinkCategory] = useState(drinkCategories[0])
//   const [showAllDrinks, setShowAllDrinks] = useState(false)
//   const [showAllFood, setShowAllFood] = useState(false)
//   const menuRef = useRef<HTMLDivElement>(null)
//   const espressoRef = useRef<HTMLDivElement>(null)
//   const [minHeight, setMinHeight] = useState<number | null>(null)
//   const [selectedItem, setSelectedItem] = useState<any | null>(null)
//   const [open, setOpen] = useState(false)
//   const [isExpanded, setIsExpanded] = useState(false);

//   const handleItemClick = (item: any) => {
//     setSelectedItem(item)
//     setOpen(true)
//   }

//   const filteredDrinks = drinks.filter(drink => drink.category === activeDrinkCategory)
//   const displayedDrinks = showAllDrinks ? filteredDrinks : filteredDrinks.slice(0, ITEMS_PER_PAGE)
//   const displayedFood = showAllFood ? food : food.slice(0, ITEMS_PER_PAGE)

//   useEffect(() => {
//     if (espressoRef.current) {
//       setMinHeight(espressoRef.current.offsetHeight)
//     }
//   }, [])

//   const handleToggleDrinks = () => {
//     setShowAllDrinks(prev => {
//       const next = !prev
//       if (!next && menuRef.current) {
//         menuRef.current.scrollIntoView({ behavior: "smooth" })
//       }
//       return next
//     })
//   }

//   const handleToggleFood = () => {
//     setShowAllFood(prev => {
//       const next = !prev
//       if (!next && menuRef.current) {
//         menuRef.current.scrollIntoView({ behavior: "smooth" })
//       }
//       return next
//     })
//   }

//   return (
//     // <section ref={menuRef} className="bg-gray-900 text-white py-20 px-6 md:px-20"> #143324
//     <section ref={menuRef} className="bg-[#296647] py-20 px-6 md:px-20">
//       <div className="text-center mb-12 flex flex-col items-center text-gray-900">
//         <Coffee className="w-12 h-12 text-white mb-4" />
//         <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Our Featured Menus</h2>
//         <p className="text-white max-w-2xl mx-auto">
//           Choose from our drinks and food selection. Freshly prepared, served with passion.
//         </p>
//       </div>

//       {/* modal */}
//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogContent
//           className="sm:max-w-4xl w-full max-h-[90vh] rounded-3xl bg-white shadow-2xl p-6 md:p-8"
//         >
//           {/* Scrollable content with vertical padding */}
//           <div className="flex flex-col overflow-y-auto max-h-[calc(90vh-3rem)] py-6">
//             {selectedItem && (
//               <>
//                 {/* Image container */}
//                 <div className="relative w-full mb-6">
//                   <motion.div
//                     initial={{ height: 240 }}
//                     animate={{ height: isExpanded ? "auto" : 240 }}
//                     transition={{ duration: 0.5, ease: "easeInOut" }}
//                     className="w-full rounded-2xl overflow-hidden shadow-lg"
//                   >
//                     <LazyImage
//                       src={selectedItem.img}
//                       alt={selectedItem.name}
//                       width={1200}
//                       height={800}
//                       className="w-full h-full object-cover"
//                     />

//                     {/* Tag Badge */}
//                     {selectedItem.tag && (
//                       <span className="absolute top-4 left-4 bg-[#C6AA58] text-black text-sm md:text-base font-semibold px-3 py-1 rounded-full shadow-md">
//                         {selectedItem.tag}
//                       </span>
//                     )}

//                     {/* Hot/Cold Badge */}
//                     {selectedItem.type && (
//                       <span
//                         className={`absolute top-4 right-4 text-sm md:text-base font-bold px-3 py-1 rounded-full shadow-md ${selectedItem.type === "Hot" ? "bg-red-500 text-white" : "bg-blue-500 text-white"
//                           }`}
//                       >
//                         {selectedItem.type}
//                       </span>
//                     )}
//                   </motion.div>

//                   {/* Expand Button */}
//                   <button
//                     onClick={() => setIsExpanded(!isExpanded)}
//                     className="absolute bottom-4 right-4 bg-gray-800 text-white px-3 py-1 rounded-full shadow-md hover:bg-gray-700 transition"
//                   >
//                     {isExpanded ? "Collapse" : "Expand"}
//                   </button>
//                 </div>

//                 {/* Text content */}
//                 <DialogHeader>
//                   <DialogTitle className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-2">
//                     {selectedItem.name}
//                   </DialogTitle>
//                   <DialogDescription className="text-gray-600 text-center mb-4 md:mb-6">
//                     {selectedItem.description}
//                   </DialogDescription>
//                 </DialogHeader>

//                 {selectedItem.ingredients && (
//                   <div className="bg-gray-100 text-gray-700 text-sm md:text-base rounded-full py-1 px-4 inline-block mb-4 mx-auto">
//                     {selectedItem.ingredients}
//                   </div>
//                 )}

//                 {/* Prices */}
//                 <div className="flex justify-center items-center gap-4 mb-4">
//                   {selectedItem.oldPrice && selectedItem.oldPrice > selectedItem.price && (
//                     <p className="text-red-500 line-through font-medium text-lg md:text-xl">
//                       ₱ {selectedItem.oldPrice.toFixed(2)}
//                     </p>
//                   )}
//                   <p className="text-[#C6AA58] text-2xl md:text-3xl font-bold">
//                     ₱ {selectedItem.price.toFixed(2)}
//                   </p>
//                 </div>

//                 <div className="text-center mb-4">
//                   <p className="text-gray-500 text-sm md:text-base">Freshly prepared & served with passion</p>
//                 </div>
//               </>
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>

//       <Tabs defaultValue="drinks" className="w-full min-h-[920]">
//         <TabsList className="flex mb-8 bg-[#F3F2ED] rounded-lg w-full max-w-[280px] md:max-w-sm mx-auto overflow-hidden">
//           <TabsTrigger
//             value="drinks"
//             className="flex-1 cursor-pointer text-center py-4 data-[state=active]:bg-[#C6AA58] data-[state=active]:text-white hover:bg-[#C6AA58] hover:text-white transition-colors"
//           >
//             Drinks
//           </TabsTrigger>
//           <TabsTrigger
//             value="food"
//             className="flex-1 cursor-pointer text-center py-4 data-[state=active]:bg-[#C6AA58] data-[state=active]:text-white hover:bg-[#C6AA58] hover:text-white transition-colors"
//           >
//             Food
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="drinks">
//           <div className="mb-6 flex gap-3 overflow-x-auto scrollbar-hide px-2 justify-start md:justify-center items-center">
//             {drinkCategories.map((category) => (
//               <button
//                 key={category}
//                 onClick={() => {
//                   setActiveDrinkCategory(category)
//                   setShowAllDrinks(false)
//                 }}
//                 className={`cursor-pointer whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeDrinkCategory === category
//                   ? "bg-[#C6AA58] text-[#F3F2ED]"
//                   : "bg-[#F3F2ED] text-black hover:bg-[#C6AA58] hover:text-[#F3F2ED]"
//                   }`}
//               >
//                 {category}
//               </button>
//             ))}
//           </div>

//           <MenuList items={displayedDrinks} onItemClick={handleItemClick} />

//           {filteredDrinks.length > ITEMS_PER_PAGE && (
//             <div className="flex justify-center mt-6">
//               <Button
//                 variant="outline"
//                 className="cursor-pointer px-6 py-2 border-[#C6AA58] text-black hover:bg-[#C6AA58] hover:text-[#F3F2ED]"
//                 onClick={handleToggleDrinks}
//               >
//                 {showAllDrinks ? "Show Less" : "View Full Menu +"}
//               </Button>
//             </div>
//           )}
//         </TabsContent>

//         <TabsContent value="food">
//           <MenuList items={displayedFood} onItemClick={handleItemClick} />

//           {food.length > ITEMS_PER_PAGE && (
//             <div className="flex justify-center mt-6">
//               <Button
//                 variant="outline"
//                 className="cursor-pointer px-6 py-2 border-[#C6AA58] text-black hover:bg-[#C6AA58] hover:text-[#F3F2ED]"
//                 onClick={handleToggleFood}
//               >
//                 {showAllFood ? "Show Less" : "View Full Menu +"}
//               </Button>
//             </div>
//           )}
//         </TabsContent>
//       </Tabs>
//     </section>
//   )
// }


// DARK


// "use client"

// import React, { useEffect, useRef, useState } from "react"
// import Image from "next/image"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Button } from "@/components/ui/button"
// import { Coffee } from "lucide-react"
// import {
//   Dialog,
//   DialogContent,
// } from "@/components/ui/dialog"
// import { drinks } from "./data/drink"

// const ITEMS_PER_PAGE = 5

// const food = [
//   { name: "Club Sandwich", img: "/assets/img/sports-center/shuttlebrew/menu/sandwich.jpg", description: "Toasted bread, turkey, bacon, lettuce, tomato", ingredients: "Bread, Turkey, Bacon, Lettuce, Tomato, Mayo", price: 130.00, oldPrice: 7.0, tag: "Best Seller" },
//   { name: "Cheese Burger", img: "/assets/img/sports-center/shuttlebrew/menu/burger.jpg", description: "Juicy grilled beef patty with melted cheese", ingredients: "Beef patty, Cheese, Lettuce, Tomato, Bun", price: 130.00, oldPrice: 8.0, tag: "" },
// ]

// const drinkCategories = [
//   "Espresso",
//   "Espresso Based",
//   "Milk-Based Espresso",
//   "Espresso Soda Signature",
//   "Cheese Cake Series",
//   "Banan Series",
//   "Yogurt Series",
//   "Frapped",
//   "Non-Caffeinated",
//   "Sparkling Drinks",
//   "Lemonade Coolers",
// ]

// // Image with loader
// function ImageWithLoader({ src, alt, ...props }: any) {
//   const [loading, setLoading] = useState(true)
//   return (
//     <div className="relative w-full h-full">
//       {loading && (
//         <div className="absolute inset-0 flex items-center justify-center bg-gray-800/30 animate-pulse">
//           <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//         </div>
//       )}
//       <Image
//         src={src}
//         alt={alt}
//         {...props}
//         onLoad={() => setLoading(false)}
//       />
//     </div>
//   )
// }

// function MenuList({ items, onItemClick }: { items: any[]; onItemClick: (item: any) => void }) {
//   return (
//     <div className="divide-y divide-gray-700">
//       {items.map((item, index) => (
//         <div
//           key={index}
//           onClick={() => onItemClick(item)}
//           className="flex flex-col md:flex-row items-start md:items-center justify-between py-6 gap-6 cursor-pointer hover:bg-gray-800/50 rounded-lg px-2"
//         >
//           <div className="text-[#C6AA58] font-normal text-xl md:w-12">
//             {String(index + 1).padStart(2, "0")}.
//           </div>
//           <div className="w-20 h-20 md:w-24 md:h-24 relative rounded-lg overflow-hidden flex-shrink-0">
//             <ImageWithLoader
//               src={item.img}
//               alt={item.name}
//               width={300}
//               height={300}
//               className="object-cover"
//               loading="lazy"
//             />
//           </div>
//           <div className="flex-1 px-4">
//             <h3 className="text-lg text-[#F3F2ED] md:text-xl font-semibold">{item.name}</h3>
//             <p className="text-[#F3F2ED]/80 text-sm">{item.description}</p>
//           </div>
//           <div className="text-right">
//             <p className="text-[#C6AA58] font-bold text-lg">₱ {item.price.toFixed(2)}</p>
//           </div>
//         </div>
//       ))}
//     </div>
//   )
// }

// export default function MenuTabs() {
//   const [activeTab, setActiveTab] = useState("drinks")
//   const [activeDrinkCategory, setActiveDrinkCategory] = useState(drinkCategories[0])
//   const [showAllDrinks, setShowAllDrinks] = useState(false)
//   const [showAllFood, setShowAllFood] = useState(false)
//   const menuRef = useRef<HTMLDivElement>(null)
//   const [selectedItem, setSelectedItem] = useState<any | null>(null)
//   const [open, setOpen] = useState(false)

//   const handleItemClick = (item: any) => {
//     setSelectedItem(item)
//     setOpen(true)
//   }

//   const filteredDrinks = drinks.filter(drink => drink.category === activeDrinkCategory)
//   const displayedDrinks = showAllDrinks ? filteredDrinks : filteredDrinks.slice(0, ITEMS_PER_PAGE)
//   const displayedFood = showAllFood ? food : food.slice(0, ITEMS_PER_PAGE)

//   return (
//     <section ref={menuRef} className="bg-gray-900 text-white py-20 px-6 md:px-20">
//       <div className="text-center mb-12 flex flex-col items-center text-gray-900">
//         <Coffee className="w-12 h-12 text-amber-600 mb-4" />
//         <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Our Featured Menus</h2>
//         <p className="text-white max-w-2xl mx-auto">
//           Choose from our drinks and food selection. Freshly prepared, served with passion.
//         </p>
//       </div>

//       {/* modal */}
//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogContent className="sm:max-w-2xl overflow-hidden rounded-2xl">
//           {selectedItem && (
//             <>
//               <div className="w-full flex justify-center items-center">
//                 <ImageWithLoader
//                   src={selectedItem.img}
//                   alt={selectedItem.name}
//                   width={800}
//                   height={600}
//                   className="w-auto h-auto max-w-full max-h-[60vh] object-contain"
//                 />
//               </div>

//               <div className="p-6 text-center">
//                 <h2 className="text-2xl font-bold text-[#20140c]">
//                   {selectedItem.name}
//                 </h2>
//                 <p className="text-xl font-semibold text-[#C6AA58] mt-2">
//                   ₱ {selectedItem.price.toFixed(2)}
//                 </p>
//                 <p className="text-sm text-gray-600 mt-3">
//                   {selectedItem.description}
//                 </p>
//               </div>
//             </>
//           )}
//         </DialogContent>
//       </Dialog>

//       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full min-h-[920]">
//         <TabsList className="flex mb-8 bg-[#F3F2ED] rounded-lg w-full max-w-[280px] md:max-w-sm mx-auto overflow-hidden">
//           <TabsTrigger
//             value="drinks"
//             className="flex-1 cursor-pointer text-center py-4 data-[state=active]:bg-[#C6AA58] data-[state=active]:text-white hover:bg-[#C6AA58] hover:text-white transition-colors"
//           >
//             Drinks
//           </TabsTrigger>
//           <TabsTrigger
//             value="food"
//             className="flex-1 cursor-pointer text-center py-4 data-[state=active]:bg-[#C6AA58] data-[state=active]:text-white hover:bg-[#C6AA58] hover:text-white transition-colors"
//           >
//             Food
//           </TabsTrigger>
//         </TabsList>

//         {/* Only render active tab */}
//         {activeTab === "drinks" && (
//           <TabsContent value="drinks">
//             <div className="mb-6 flex gap-3 overflow-x-auto scrollbar-hide px-2 justify-start md:justify-center items-center">
//               {drinkCategories.map((category) => (
//                 <button
//                   key={category}
//                   onClick={() => {
//                     setActiveDrinkCategory(category)
//                     setShowAllDrinks(false)
//                   }}
//                   className={`cursor-pointer whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeDrinkCategory === category
//                       ? "bg-[#C6AA58] text-[#F3F2ED]"
//                       : "bg-[#F3F2ED] text-black hover:bg-[#C6AA58] hover:text-[#F3F2ED]"
//                     }`}
//                 >
//                   {category}
//                 </button>
//               ))}
//             </div>

//             <MenuList items={displayedDrinks} onItemClick={handleItemClick} />

//             {filteredDrinks.length > ITEMS_PER_PAGE && (
//               <div className="flex justify-center mt-6">
//                 <Button
//                   variant="outline"
//                   className="cursor-pointer px-6 py-2 border-[#C6AA58] text-black hover:bg-[#C6AA58] hover:text-[#F3F2ED]"
//                   onClick={() => setShowAllDrinks(!showAllDrinks)}
//                 >
//                   {showAllDrinks ? "Show Less" : "View Full Menu +"}
//                 </Button>
//               </div>
//             )}
//           </TabsContent>
//         )}

//         {activeTab === "food" && (
//           <TabsContent value="food">
//             <MenuList items={displayedFood} onItemClick={handleItemClick} />

//             {food.length > ITEMS_PER_PAGE && (
//               <div className="flex justify-center mt-6">
//                 <Button
//                   variant="outline"
//                   className="cursor-pointer px-6 py-2 border-[#C6AA58] text-black hover:bg-[#C6AA58] hover:text-[#F3F2ED]"
//                   onClick={() => setShowAllFood(!showAllFood)}
//                 >
//                   {showAllFood ? "Show Less" : "View Full Menu +"}
//                 </Button>
//               </div>
//             )}
//           </TabsContent>
//         )}
//       </Tabs>
//     </section>
//   )
// }
"use client"

import { useState, useEffect, useCallback, TouchEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowRight, Home, FileText, X, Layers, Ruler, Sparkles, Palette, Gauge, Weight } from 'lucide-react';
import Footer from '@/components/custom/footer';
import { CLOUD } from './main-faq';

const colorSwatches = [
    { name: "Gray White", color: "#F2F3F5" },
    { name: "Terra Cotta", color: "#E3735E" },
    { name: "Mandarin Red", color: "#F37A48" },
    { name: "Maroon Red", color: "#800000" },
    { name: "Brown", color: "#322320" },
    { name: "Black", color: "#000000" },
    { name: "Pink", color: "#FFC0CB" },
    { name: "Light Yellow", color: "#FFFFE0" },
    { name: "Violet", color: "#8F00FF" },
    { name: "Foam Green", color: "#93E9BE" },
    { name: "Blue", color: "#0000FF" },
    { name: "Light Blue", color: "#ADD8E6" },
    { name: "Bamboo", color: "#D2B48C" },
    { name: "Beige", color: "#F5F5DC" },
    { name: "Oakwood", color: "#BAA48A" },
    { name: "Deep Orange", color: "#FF8C00" },
    { name: "Green", color: "#008000" },
    { name: "Apple Green", color: "#8DB600" },
    { name: "Gray", color: "#808080" }
];

const productData: Record<string, any> = {
    "Galvanized C-Purlins": {
        sizes: ["2x3", "2x4", "2x6"],
        thickness: ["0.8mm", "1.0mm", "1.2mm", "1.5mm", "1.8mm", "2.0mm"],
        images: {
            "2x3": "/assets/Products/galvanized_cpurlins2x3.jpeg",
            "2x4": "/assets/Products/galvanized_cpurlins2x4.jpeg",
            "2x6": "/assets/Products/galvanized_cpurlins2x6.jpeg"
        },
        blueprints: {
            "2x3": "/assets/blueprint/galvanized_2x3.png",
            "2x4": "/assets/blueprint/galvanized_2x4.png",
            "2x6": "/assets/blueprint/galvanized_2x6.png"
        },
        thumbnail: `${CLOUD}/v1764049645/GALVANIZED_C-PURLINS_czrbbj.png`
    },
    "PPGL Plain Sheets": {
        thickness: ["0.8mm", "1.0mm", "1.2mm", "1.5mm", "1.8mm", "2.0mm"],
        image: `/assets/Products/plain_sheets.png`,
        colorSwatches: colorSwatches,
        thumbnail: `/assets/Products/plain_sheet2.png`
    },
    "Metal Furring": {
        thickness: ["0.35mm"],
        image: `/assets/Products/furring2.jpg`,
        blueprints: {
            "default": "/assets/blueprint/metal_furring.png",
        },
        thumbnail: `${CLOUD}/v1764049624/METAL_FURRING_h8wyxu.png`
    },
    "Floor Deck": {
        thickness: ["0.75mm", "0.8mm", "1.0mm", "1.2mm"],
        image: `/assets/Products/floor-deck.png`,
        blueprints: {
            "default": "/assets/blueprint/floor_deck.png",
        },
        thumbnail: `${CLOUD}/v1764049639/SteelDeck_vu5cjr.jpg`
    },
    "Metal Cladding": {
        thickness: ["0.35mm", "0.40mm", "0.50mm"],
        image: `${CLOUD}/v1764049604/MetalCladding_evmqfe.jpg`,
        blueprints: {
            "default": "/assets/blueprint/metal_cladding.png",
        },
        thumbnail: `${CLOUD}/v1764049604/MetalCladding_evmqfe.jpg`
    },
    "Metal Cylinder": {
        weightVariations: ["32 Kilos", "43 Kilos"],
        image: `/assets/Products/MC1.png`,
        thumbnail: `/assets/Products/metal_cylinder.png`
    },
    "Hollow Blocks": {
        psiVariations: ["302 PSI", "600 PSI", "691 PSI", "798 PSI", "1130 PSI"],
        image: `/assets/Products/hb1.png`,
        thumbnail: `/assets/Products/hollow_blocks.png`
    }
};

const tabs = ["Galvanized C-Purlins", "Metal Furring", "Floor Deck", "Metal Cladding", "PPGL Plain Sheets", "Metal Cylinder", "Hollow Blocks"];

function SteelProducts() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const category = searchParams.get("category") || "Products";
    const [activeTab, setActiveTab] = useState('Galvanized C-Purlins');
    const [selectedSize, setSelectedSize] = useState('2x3');
    const [zoomed, setZoomed] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [touchStart, setTouchStart] = useState<number | null>(null)
    const [touchEnd, setTouchEnd] = useState<number | null>(null)

    const minSwipeDistance = 50 // Minimum distance pag swipe

    const [isTransitioning, setIsTransitioning] = useState(false)

    const onTouchStart = (e: TouchEvent) => {
        setTouchEnd(null)
        setTouchStart(e.targetTouches[0].clientX)
    }

    const onTouchMove = (e: TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX)
    }

    // const onTouchEnd = () => {
    //     if (!touchStart || !touchEnd) return
    //     const distance = touchStart - touchEnd
    //     if (distance > minSwipeDistance) {
    //         setActiveTab(tabs[(tabs.indexOf(activeTab) - 1 + tabs.length) % tabs.length])
    //     } else if (distance < -minSwipeDistance) {
    //         setActiveTab(tabs[(tabs.indexOf(activeTab) + 1 + tabs.length) % tabs.length])
    //     }
    // }

    const onTouchEnd = useCallback(() => {
        if (!touchStart || !touchEnd) return

        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > minSwipeDistance
        const isRightSwipe = distance < -minSwipeDistance

        if (isLeftSwipe) {
            setIsTransitioning(true)
            setTimeout(() => {
                router.push('/steel/products/ppglProducts?category=PPGL+Products')
            }, 300)
        }
    }, [touchStart, touchEnd, router])

    const handlePPGLClick = () => {
        setIsTransitioning(true)
        setTimeout(() => {
            router.push('/steel/products/ppglProducts?category=PPGL+Products')
        }, 300)
    }

    const currentProduct = productData[activeTab];

    const getBlueprintUrl = () => {
        if (!currentProduct.blueprints) return null;

        if (activeTab === 'Galvanized C-Purlins') {
            return currentProduct.blueprints[selectedSize];
        }

        return currentProduct.blueprints.default;
    };

    const blueprintUrl = getBlueprintUrl();

    const handleHomeClick = () => {
        // Navigate to home page with hash
        router.push('/steel#steel-products-head');

        // If somehow we're already on the steel page (edge case), scroll directly
        if (window.location.pathname === '/steel') {
            setTimeout(() => {
                const element = document.getElementById('steel-products-head');
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }, 100);
        }
    };

    return (
        <div className={`min-h-screen bg-white ${isTransitioning ? 'opacity-0 transition-opacity duration-300' : 'opacity-100 transition-opacity duration-300'}`}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 border-b border-gray-100">
                <div className="container mx-auto px-4 sm:px-5 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleHomeClick}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-700 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                        >
                            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="text-sm sm:text-base">Home</span>
                        </motion.button>

                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                Steel Products
                            </h2>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05, x: 5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handlePPGLClick}
                            className="hidden sm:flex cursor-pointer items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            <span className="text-sm">PPGL Products</span>
                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        </motion.button>

                        {/* <button
                            className="sm:hidden text-gray-700"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={20} /> : <span className="text-xl">☰</span>}
                        </button> */}
                        {/* For mobile */}
                        <div className="sm:hidden fixed bottom-4 right-4 z-40">
                            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg border border-gray-200">
                                <span className="text-xs text-gray-600">Swipe left for PPGL</span>
                                <ArrowRight className="w-3 h-3 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {isMenuOpen && (
                    <div className="sm:hidden bg-white border-t border-gray-100 px-4 py-3">
                        <div className="flex flex-col space-y-3">
                            <Link href="/steel#steel-products-head" className="text-sm text-gray-700 hover:text-green-600 transition-colors">
                                Steel
                            </Link>
                            <Link href="/trucks" className="text-sm text-gray-700 hover:text-green-600 transition-colors">
                                Trucks & Equipment
                            </Link>
                            <Link href="/sports-center" className="text-sm text-gray-700 hover:text-green-600 transition-colors">
                                Sports Center
                            </Link>
                            <Link href="/rentals" className="text-sm text-gray-700 hover:text-green-600 transition-colors">
                                Rentals
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            <div className="relative pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 xl:px-20">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mt-4 sm:mt-6"
                >
                    <div className="tracking-widest mb-1 sm:mb-2 text-gray-800 text-xs sm:text-sm md:text-base">
                        C-ONE STEEL
                    </div>
                    <div className="text-gray-500 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base">
                        <button
                            onClick={handleHomeClick}
                            className="hover:text-green-600 transition-colors"
                        >
                            Home
                        </button>
                        <span>/</span>
                        <span className="text-green-600">Steel Products</span>
                    </div>
                </motion.div>
            </div>

            <div className="relative flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8 my-4 sm:my-6 md:my-8 px-4 sm:px-6 lg:px-8 xl:px-20">
                <div className="flex flex-col w-full lg:w-[70%] xl:w-[800px] gap-4 sm:gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="relative h-[300px] xs:h-[350px] sm:h-[400px] md:h-[450px] lg:h-[480px] xl:h-[590px] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                            <motion.div
                                animate={{
                                    scale: zoomed ? 1.2 : 1,
                                    rotate: zoomed ? 15.4 : 0,
                                }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="absolute inset-0 flex items-center justify-center z-0 p-4 sm:p-6 md:p-6 lg:p-8 xl:p-8"
                            >
                                <Image
                                    src={currentProduct.images?.[selectedSize] || currentProduct.image}
                                    alt={activeTab}
                                    fill
                                    className="object-contain max-h-full"
                                    sizes="(max-width: 425px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, 800px"
                                    quality={100}
                                />
                            </motion.div>

                            {zoomed && (
                                // <div className="absolute inset-0 bg-[#B1B1B1]/90 z-10" />
                                <div className="absolute inset-0 bg-white/90 z-10" />
                            )}

                            <AnimatePresence>
                                {zoomed && blueprintUrl && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute z-20 flex items-center justify-center w-full h-full p-4 sm:p-6 md:p-6 lg:p-8 xl:p-8"
                                    >
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={blueprintUrl}
                                                alt={`${activeTab} Blueprint`}
                                                fill
                                                className="object-contain"
                                                sizes="(max-width: 425px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, 800px"
                                                quality={100}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {activeTab === 'Galvanized C-Purlins' && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="absolute top-3 left-3 sm:top-4 sm:left-4 lg:top-3 lg:left-3 xl:top-4 xl:left-4 z-30"
                                >
                                    <div className="px-3 py-1.5 sm:px-4 sm:py-2 md:px-3 md:py-1.5 lg:px-3 lg:py-1.5 xl:px-4 xl:py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full shadow-lg flex items-center gap-1 sm:gap-2">
                                        <Ruler className="w-3 h-3 sm:w-4 sm:h-4 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4" />
                                        <span className="font-semibold text-xs sm:text-sm md:text-xs lg:text-xs xl:text-sm">{selectedSize}</span>
                                    </div>
                                </motion.div>
                            )}

                            {zoomed && blueprintUrl && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute top-3 left-3 sm:top-4 sm:left-4 lg:top-3 lg:left-3 xl:top-4 xl:left-4 z-30"
                                >
                                    <div className="px-3 py-1.5 sm:px-4 sm:py-2 md:px-3 md:py-1.5 lg:px-3 lg:py-1.5 xl:px-4 xl:py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg flex items-center gap-1 sm:gap-2">
                                        <FileText className="w-3 h-3 sm:w-4 sm:h-4 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4" />
                                        <span className="font-semibold text-xs sm:text-sm md:text-xs lg:text-xs xl:text-sm">
                                            {activeTab === 'Galvanized C-Purlins'
                                                ? `Blueprint (${selectedSize})`
                                                : `${activeTab} Blueprint`
                                            }
                                        </span>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'Galvanized C-Purlins' && !zoomed && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
                                            <Ruler className="w-3.5 h-3.5 text-green-600" />
                                            <span className="text-xs font-medium text-gray-700">Select Size</span>
                                        </div>

                                        <div className="flex gap-1.5 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md border border-gray-200">
                                            {currentProduct.sizes.map((size: string) => (
                                                <motion.button
                                                    key={size}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setSelectedSize(size)}
                                                    className={`px-3 py-1.5 text-sm cursor-pointer rounded-md transition-all font-medium ${selectedSize === size
                                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                                                        : 'bg-gray-200 hover:bg-green-50 text-gray-700 hover:text-green-700'
                                                        }`}
                                                >
                                                    {size}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {currentProduct.blueprints && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setZoomed(!zoomed)}
                                    className={`absolute top-3 right-3 sm:top-4 sm:right-4 md:top-3 md:right-3 lg:top-3 lg:right-3 xl:top-4 xl:right-4 flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 rounded-lg transition-all shadow-md hover:shadow-lg z-30 border ${zoomed
                                        ? 'bg-red-500 text-white border-red-200 hover:bg-red-600'
                                        : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-green-200 hover:from-green-700 hover:to-emerald-700'
                                        }`}
                                >
                                    {zoomed ? (
                                        <>
                                            <X size={14} className="sm:w-4 sm:h-4 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4" />
                                            <span className="text-xs sm:text-sm md:text-xs lg:text-xs xl:text-sm cursor-pointer font-medium">Close Blueprint</span>
                                        </>
                                    ) : (
                                        <>
                                            <FileText size={14} className="sm:w-4 sm:h-4 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4" />
                                            <span className="text-xs sm:text-sm md:text-xs lg:text-xs xl:text-sm cursor-pointer font-medium">View Blueprint</span>
                                        </>
                                    )}
                                </motion.button>
                            )}
                        </div>
                    </motion.div>

                    {/* DUPLICATE DESCRIPTION - Visible ONLY at 1024px (lg) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 shadow-md p-4 sm:p-6 hidden lg:block xl:hidden"
                    >
                        <p className="text-gray-700 leading-relaxed text-sm sm:text-[15px] lg:text-sm">
                            Premium quality <span className="text-green-600 font-medium">{activeTab.toLowerCase()}</span> manufactured to the highest standards.
                            Ideal for construction and industrial applications, offering excellent durability
                            and performance. All products are quality tested and meet industry specifications.
                        </p>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col flex-1 gap-4 sm:gap-6"
                >
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent text-center">
                        <h1 className="text-lg sm:text-xl lg:text-xl xl:text-2xl font-bold">
                            {activeTab.toUpperCase()}
                            {activeTab === 'Galvanized C-Purlins' && ` (${selectedSize})`}
                            {activeTab === 'PPGL Plain Sheets' && selectedColor && ` (${selectedColor})`}
                        </h1>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white rounded-lg shadow-md border border-gray-100 p-2 sm:p-3"
                    >
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-3 xl:grid-cols-7 gap-1 sm:gap-2">
                            {tabs.map((tab, index) => (
                                <motion.div
                                    key={tab}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.7 + index * 0.05 }}
                                    className="flex flex-col items-center"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setActiveTab(tab);
                                            setZoomed(false);
                                            setSelectedColor(null);
                                        }}
                                        className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 xl:w-14 xl:h-14 rounded-md cursor-pointer transition-all shadow-sm border ${activeTab === tab
                                            ? 'border-green-500 ring-1 ring-green-500/20 shadow-green-500/10'
                                            : 'border-gray-200 hover:border-green-300'
                                            }`}
                                    >
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={productData[tab].thumbnail}
                                                alt={tab}
                                                fill
                                                className="object-contain p-0.5"
                                                sizes="(max-width: 425px) 40px, (max-width: 768px) 48px, (max-width: 1024px) 56px, 56px"
                                            />
                                        </div>
                                    </motion.div>
                                    <span className="text-[10px] xs:text-xs lg:text-[10px] xl:text-xs text-center text-gray-600 mt-1 truncate w-full px-0.5">
                                        {tab.split(' ').map((word, i) => (
                                            <span key={i}>
                                                {i > 0 ? ' ' : ''}
                                                {i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word}
                                            </span>
                                        ))}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {activeTab === 'PPGL Plain Sheets' && currentProduct.colorSwatches && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white rounded-lg shadow-md border border-gray-100 p-4 sm:p-6"
                        >
                            <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
                                <Palette className="w-4 h-4 sm:w-5 sm:h-5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-green-600" />
                                <h3 className="text-gray-800 font-semibold text-base sm:text-lg lg:text-base xl:text-lg">Available Colors</h3>
                            </div>

                            <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-1.5 sm:gap-2">
                                {currentProduct.colorSwatches.map((colorItem: any, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.6 + (index * 0.03) }}
                                        className="flex flex-col items-center"
                                    >
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelectedColor(colorItem.name)}
                                            className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-9 lg:h-9 xl:w-10 xl:h-10 rounded-md border-2 cursor-pointer transition-all ${selectedColor === colorItem.name
                                                ? 'border-green-600 ring-2 ring-green-600/20 shadow-md'
                                                : 'border-gray-300 hover:border-green-400'
                                                }`}
                                            style={{ backgroundColor: colorItem.color }}
                                            aria-label={`Select ${colorItem.name} color`}
                                        />
                                        <span className="text-[10px] xs:text-[11px] sm:text-[12px] lg:text-[10px] xl:text-[12px] text-gray-600 text-center mt-1 truncate w-full px-0.5">
                                            {colorItem.name.split(' ')[0]}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>

                            {selectedColor && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-3 sm:mt-4 p-2 sm:p-3 bg-green-50 rounded-lg border border-green-200"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <div
                                            className="w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5 xl:w-6 xl:h-6 rounded border border-gray-300"
                                            style={{
                                                backgroundColor: currentProduct.colorSwatches.find((c: any) => c.name === selectedColor)?.color
                                            }}
                                        />
                                        <span className="text-xs sm:text-sm lg:text-xs xl:text-sm font-medium text-gray-700">
                                            Selected: <span className="text-green-600 font-semibold">{selectedColor}</span>
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gray-50 rounded-lg shadow-lg border border-gray-200 p-4 sm:p-6"
                    >
                        <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
                            {activeTab === 'Hollow Blocks' ? (
                                <Gauge className="w-4 h-4 sm:w-5 sm:h-5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-green-600" />
                            ) : activeTab === 'Metal Cylinder' ? (
                                <Weight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-green-600" />
                            ) : (
                                <Layers className="w-4 h-4 sm:w-5 sm:h-5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-green-600" />
                            )}
                            <h3 className="text-gray-800 font-semibold text-base sm:text-lg lg:text-base xl:text-lg">
                                {activeTab === 'Hollow Blocks'
                                    ? 'PSI Specifications'
                                    : activeTab === 'Metal Cylinder'
                                        ? 'Weight Specifications'
                                        : 'Thickness Specifications'
                                }
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 sm:gap-3">
                            {activeTab === 'Hollow Blocks' ? (
                                currentProduct.psiVariations.map((item: string, i: number) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center justify-between gap-2 sm:gap-3 bg-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-sm border border-gray-200"
                                    >
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full group-hover:scale-125 transition-transform" />
                                            <span className="text-sm sm:text-base lg:text-sm xl:text-base text-gray-700 font-medium">{item}</span>
                                        </div>
                                        <div className="hidden xl:flex px-2 py-0.5 sm:px-3 sm:py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                            Strength
                                        </div>
                                    </motion.div>
                                ))
                            ) : activeTab === 'Metal Cylinder' ? (
                                currentProduct.weightVariations.map((item: string, i: number) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center justify-between gap-2 sm:gap-3 bg-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-sm border border-gray-200"
                                    >
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full group-hover:scale-125 transition-transform" />
                                            <span className="text-sm sm:text-base lg:text-sm xl:text-base text-gray-700 font-medium">{item}</span>
                                        </div>
                                        <div className="hidden xl:flex px-2 py-0.5 sm:px-3 sm:py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                                            Weight
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                currentProduct.thickness.map((item: string, i: number) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center justify-between gap-2 sm:gap-3 bg-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-sm border border-gray-200"
                                    >
                                        <div className="flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full group-hover:scale-125 transition-transform" />
                                            <span className="text-sm sm:text-base lg:text-sm xl:text-base text-gray-700 font-medium">{item}</span>
                                        </div>
                                        <div className="hidden xl:flex px-2 py-0.5 sm:px-3 sm:py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                            Thickness
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 shadow-md p-4 sm:p-6 lg:hidden xl:block"
                    >
                        <p className="text-gray-700 leading-relaxed text-sm sm:text-[15px] lg:text-sm xl:text-[15px]">
                            Premium quality <span className="text-green-600 font-medium">{activeTab.toLowerCase()}</span> manufactured to the highest standards.
                            Ideal for construction and industrial applications, offering excellent durability
                            and performance. All products are quality tested and meet industry specifications.
                        </p>
                    </motion.div>
                </motion.div>
            </div>

            <Footer />
        </div>
    )
}

export default SteelProducts
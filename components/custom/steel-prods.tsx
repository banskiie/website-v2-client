"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Home, FileText, X, Layers, Ruler, CheckCircle2, Sparkles, Maximize2 } from 'lucide-react';
import Footer from '@/components/custom/footer';
import { CLOUD } from './main-faq';

// Product Data Configuration
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
        properties: [
            'High-grade galvanized steel',
            'Corrosion resistant coating',
            'Available in custom lengths',
            'Meets ASTM standards'
        ],
        thumbnail: `${CLOUD}/v1764049645/GALVANIZED_C-PURLINS_czrbbj.png`
    },
    "Metal Studs": {
        thickness: ["0.8mm", "1.0mm", "1.2mm", "1.5mm", "1.8mm", "2.0mm"],
        image: `${CLOUD}/v1764049619/METAL_STUDS_iabav2.png`,
        properties: [
            'Lightweight construction',
            'Easy installation',
            'Suitable for ceiling and wall framing',
            'Durable and long-lasting'
        ],
        thumbnail: `${CLOUD}/v1764049619/METAL_STUDS_iabav2.png`
    },
    "Metal Furring": {
        thickness: ["0.35mm"],
        image: `${CLOUD}/v1764049624/METAL_FURRING_h8wyxu.png`,
        properties: [
            'Lightweight construction',
            'Easy installation',
            'Suitable for ceiling and wall framing',
            'Durable and long-lasting'
        ],
        thumbnail: `${CLOUD}/v1764049624/METAL_FURRING_h8wyxu.png`
    },
    "Floor Deck": {
        thickness: ["0.75mm", "0.8mm", "1.0mm", "1.2mm"],
        image: `${CLOUD}/v1764049639/SteelDeck_vu5cjr.jpg`,
        properties: [
            'High load-bearing capacity',
            'Composite action with concrete',
            'Fast installation with interlocking design',
            'Fire-rated options available'
        ],
        thumbnail: `${CLOUD}/v1764049639/SteelDeck_vu5cjr.jpg`
    },
    "Metal Cladding": {
        thickness: ["0.35mm", "0.40mm", "0.50mm"],
        image: `${CLOUD}/v1764049604/MetalCladding_evmqfe.jpg`,
        properties: [
            'Weather-resistant finishes',
            'Aesthetic appeal with various profiles',
            'Energy efficient insulation options',
            'Low maintenance and durable'
        ],
        thumbnail: `${CLOUD}/v1764049604/MetalCladding_evmqfe.jpg`
    },
    "Spandrel": {
        thickness: ["0.35mm", "0.40mm", "0.50mm"],
        image: `${CLOUD}/v1764049634/SPANDREL_m3i1x3.png`,
        properties: [
            'Architectural grade finishes',
            'Thermal break technology',
            'Custom colors and textures',
            'Wind load tested and certified'
        ],
        thumbnail: `${CLOUD}/v1764049634/SPANDREL_m3i1x3.png`
    }
};

const tabs = ["Galvanized C-Purlins", "Metal Studs", "Metal Furring", "Floor Deck", "Metal Cladding", "Spandrel"];

function SteelProducts() {
    const searchParams = useSearchParams();
    const category = searchParams.get("category") || "Products";
    const [activeTab, setActiveTab] = useState('Galvanized C-Purlins');
    const [selectedSize, setSelectedSize] = useState('2x3');
    const [zoomed, setZoomed] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const currentProduct = productData[activeTab];
    const displayImage = zoomed && currentProduct.blueprints?.[selectedSize] 
        ? currentProduct.blueprints[selectedSize] 
        : (currentProduct.images?.[selectedSize] || currentProduct.image);

    return (
        <div className="min-h-screen bg-white">
            {/* Blueprint Modal Overlay */}
            <AnimatePresence>
                {zoomed && currentProduct.blueprints?.[selectedSize] && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                        onClick={() => setZoomed(false)}
                    >
                        {/* Dark blurred background with original image */}
                        <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-md">
                            <div className="absolute inset-0 overflow-hidden">
                                <Image
                                    src={currentProduct.images?.[selectedSize] || currentProduct.image}
                                    alt="Background"
                                    fill
                                    className="object-cover scale-110 blur-xl opacity-30"
                                    sizes="100vw"
                                />
                            </div>
                        </div>
                        
                        {/* Blueprint Modal */}
                        <motion.div
                            initial={{ scale: 0.8, rotateY: -30, opacity: 0 }}
                            animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                            exit={{ scale: 0.8, rotateY: 30, opacity: 0 }}
                            transition={{ type: "spring", damping: 20, stiffness: 100 }}
                            className="relative w-full max-w-6xl h-[85vh] bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Blueprint Header */}
                            <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 backdrop-blur-sm text-white rounded-full shadow-lg"
                                >
                                    <FileText className="w-5 h-5" />
                                    <span className="text-lg font-semibold">
                                        Blueprint - {selectedSize} {activeTab}
                                    </span>
                                </motion.div>
                                
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setZoomed(false)}
                                    className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                                >
                                    <X size={24} />
                                </motion.button>
                            </div>

                            {/* Blueprint Content */}
                            <div className="relative w-full h-full flex items-center justify-center p-8">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="relative w-full h-full max-w-4xl"
                                >
                                    <Image
                                        src={currentProduct.blueprints[selectedSize]}
                                        alt={`${selectedSize} Blueprint`}
                                        fill
                                        className="object-contain"
                                        sizes="(max-width: 1200px) 100vw, 1200px"
                                        quality={100}
                                        priority
                                    />
                                </motion.div>
                            </div>

                            {/* Zoom Indicator */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-gray-800/80 backdrop-blur-sm text-gray-300 rounded-full shadow-lg flex items-center gap-2"
                            >
                                <Maximize2 className="w-4 h-4" />
                                <span className="text-sm">Scroll to zoom • Click outside to close</span>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header - Clean white header */}
            <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 border-b border-gray-100">
                <div className="container mx-auto px-5 py-4">
                    <div className="flex items-center justify-between">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                        >
                            <Home className="w-5 h-5" />
                            <Link href="/">
                                <span className="text-base">Home</span>
                            </Link>
                        </motion.button>
                        
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-green-600" />
                            <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                Steel Products
                            </h2>
                        </div>
                        
                        <motion.button
                            whileHover={{ scale: 1.05, x: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            <span className="text-base">Contact Us</span>
                            <ArrowRight className="w-4 h-4" />
                        </motion.button>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden text-gray-700"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={24} /> : <span className="text-xl">☰</span>}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 px-5 py-4">
                        <div className="flex flex-col space-y-3">
                            <Link href="/steel" className="text-base text-gray-700 hover:text-green-600 transition-colors">
                                Steel
                            </Link>
                            <Link href="/trucks" className="text-base text-gray-700 hover:text-green-600 transition-colors">
                                Trucks & Equipment
                            </Link>
                            <Link href="/sports-center" className="text-base text-gray-700 hover:text-green-600 transition-colors">
                                Sports Center
                            </Link>
                            <Link href="/rentals" className="text-base text-gray-700 hover:text-green-600 transition-colors">
                                Rentals
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            {/* Breadcrumb */}
            <div className="relative pt-24 px-6 lg:px-20">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mt-6"
                >
                    <div className="tracking-widest mb-2 text-gray-800 text-base">
                        C-ONE STEEL
                    </div>
                    <div className="text-gray-500 flex items-center gap-2 text-base">
                        <Link href="/" className="hover:text-green-600 transition-colors">
                            Home
                        </Link>
                        <span>/</span>
                        <span className="text-green-600">Steel Products</span>
                    </div>
                </motion.div>
            </div>

            {/* Main Content */}
            <div className="relative flex flex-col lg:flex-row gap-8 my-4 px-6 lg:px-20">
                {/* Left Column - Image */}
                <div className="flex flex-col w-full lg:w-[800px] gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="relative h-[450px] lg:h-[590px] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={displayImage}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute inset-0 flex items-center -mt-10 justify-center p-8"
                                >
                                    <Image
                                        src={displayImage}
                                        alt={activeTab}
                                        fill
                                        className={`object-contain ${zoomed ? 'scale-100' : 'scale-90'}`}
                                        sizes="(max-width: 768px) 100vw, 800px"
                                        quality={100}
                                        priority={zoomed}
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* Size Badge - Upper Left */}
                            {activeTab === 'Galvanized C-Purlins' && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="absolute top-4 left-4 z-10"
                                >
                                    <div className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full shadow-lg flex items-center gap-2">
                                        <Ruler className="w-4 h-4" />
                                        <span className="font-semibold text-sm">{selectedSize}</span>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'Galvanized C-Purlins' && !zoomed && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute bottom-4 left-4 right-4 "
                                >
                                    <div className="">
                                    {/* <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 p-3"> */}
                                        <div className="flex items-center justify-center gap-1.5 mb-2">
                                            <Ruler className="w-4 h-4 text-green-600" />
                                            <h3 className="text-gray-800 font-semibold text-sm">Select Size</h3>
                                        </div>
                                        <div className="flex justify-center gap-1.5">
                                            {currentProduct.sizes.map((size: string) => (
                                                <motion.button
                                                    key={size}
                                                    whileHover={{ scale: 1.03, y: -1 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={() => setSelectedSize(size)}
                                                    className={`px-5 py-3 cursor-pointer rounded-md transition-all text-sm font-medium ${
                                                        selectedSize === size
                                                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-sm'
                                                            : 'bg-gray-50 hover:bg-green-50 text-gray-700 border border-gray-200 hover:border-green-300'
                                                    }`}
                                                >
                                                    {size}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}


                            {/* View Blueprint Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setZoomed(true)}
                                className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg transition-all shadow-md hover:shadow-lg z-10 border ${
                                    zoomed 
                                        ? 'bg-red-500 text-white border-red-200 hover:bg-red-600' 
                                        : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-green-200 hover:from-green-700 hover:to-emerald-700'
                                }`}
                            >
                                {zoomed ? (
                                    <>
                                        <X size={16} />
                                        <span className="text-sm font-medium">Close Blueprint</span>
                                    </>
                                ) : (
                                    <>
                                        <FileText size={16} />
                                        <span className="text-sm font-medium">View Blueprint</span>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column - Product Details */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col flex-1 gap-6"
                >
                    {/* Title */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent text-center">
                        <h1 className="text-xl lg:text-2xl font-bold">
                            {activeTab.toUpperCase()}
                            {activeTab === 'Galvanized C-Purlins' && ` (${selectedSize})`}
                        </h1>
                    </div>

                    {/* Product Selection */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white rounded-lg shadow-md border border-gray-100 p-3"
                    >
                        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
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
                                        }}
                                        className={`w-12 h-12 lg:w-16 lg:h-14 rounded-md cursor-pointer transition-all shadow-sm border ${
                                            activeTab === tab
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
                                                sizes="(max-width: 780px) 50px, 58px"
                                            />
                                        </div>
                                    </motion.div>
                                    <span className="text-xs text-center text-gray-600 mt-1 truncate w-full px-0.5">
                                        {tab.split(' ')[0]}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col"
                        >
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <Layers className="w-4 h-4 text-green-600" />
                                <h3 className="text-gray-700 font-medium text-md">
                                    Thickness Options
                                </h3>
                            </div>
                            <div className="relative h-60 bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
                                <div className="relative h-full flex flex-col p-4">
                                    <div className="grid grid-cols-2 gap-2 w-full">
                                        {currentProduct.thickness.map((item: string, i: number) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="flex items-center gap-2 bg-gray-50/80 px-3 py-2 rounded-md hover:bg-green-50/80 transition-colors"
                                            >
                                                <div className="w-2 h-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full" />
                                                <span className="text-gray-700 text-sm font-medium">{item}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Properties */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col"
                        >
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <h3 className="text-gray-700 font-medium text-md">Key Features</h3>
                            </div>
                            <div className="relative h-60 bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
                                <div className="relative h-full flex flex-col items-start justify-start p-4 overflow-y-auto">
                                    <ul className="space-y-2 w-full">
                                        {currentProduct.properties.map((item: string, i: number) => (
                                            <motion.li
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.4 + i * 0.1 }}
                                                className="flex items-start gap-2 bg-gray-50/80 px-3 py-2 rounded-md hover:bg-green-50/80 transition-colors"
                                            >
                                                <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-700 text-sm">{item}</span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 shadow-md p-3"
                    >
                        <p className="text-gray-700 leading-relaxed text-[16px]">
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
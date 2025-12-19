"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
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
    const category = searchParams.get("category") || "Products";
    const [activeTab, setActiveTab] = useState('Galvanized C-Purlins');
    const [selectedSize, setSelectedSize] = useState('2x3');
    const [zoomed, setZoomed] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);

    const currentProduct = productData[activeTab];

    const getBlueprintUrl = () => {
        if (!currentProduct.blueprints) return null;

        if (activeTab === 'Galvanized C-Purlins') {
            return currentProduct.blueprints[selectedSize];
        }

        return currentProduct.blueprints.default;
    };

    const blueprintUrl = getBlueprintUrl();

    return (
        <div className="min-h-screen bg-white">
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

                        <button
                            className="md:hidden text-gray-700"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={24} /> : <span className="text-xl">☰</span>}
                        </button>
                    </div>
                </div>

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

            <div className="relative flex flex-col lg:flex-row gap-8 my-4 px-6 lg:px-20">
                <div className="flex flex-col w-full lg:w-[800px] gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="relative h-[450px] lg:h-[590px] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                            <motion.div
                                animate={{
                                    scale: zoomed ? 1.2 : 1,
                                    rotate: zoomed ? 15.4 : 0,
                                }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="absolute inset-0 flex items-center justify-center z-0 p-8"
                            >
                                <Image
                                    src={currentProduct.images?.[selectedSize] || currentProduct.image}
                                    alt={activeTab}
                                    fill
                                    className="object-contain max-h-full"
                                    sizes="(max-width: 768px) 100vw, 800px"
                                    quality={100}
                                />
                            </motion.div>

                            {zoomed && (
                                <div className="absolute inset-0 bg-[#B1B1B1]/70 z-10" />
                            )}

                            <AnimatePresence>
                                {zoomed && blueprintUrl && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute z-20 flex items-center justify-center w-full h-full p-8"
                                    >
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={blueprintUrl}
                                                alt={`${activeTab} Blueprint`}
                                                fill
                                                className="object-contain"
                                                sizes="(max-width: 768px) 100vw, 800px"
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
                                    className="absolute top-4 left-4 z-30"
                                >
                                    <div className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full shadow-lg flex items-center gap-2">
                                        <Ruler className="w-4 h-4" />
                                        <span className="font-semibold text-sm">{selectedSize}</span>
                                    </div>
                                </motion.div>
                            )}

                            {zoomed && blueprintUrl && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute top-4 left-4 z-30"
                                >
                                    <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        <span className="font-semibold text-sm">
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
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute bottom-2 left-4 right-4 z-30"
                                >
                                    <div className="">
                                        <div className="flex items-center justify-center gap-1.5 mb-2">
                                            <Ruler className="w-4 h-4 text-white" />
                                            <h3 className="text-white font-semibold text-lg">See Sizes</h3>
                                        </div>
                                        <div className="flex justify-center gap-1.5">
                                            {currentProduct.sizes.map((size: string) => (
                                                <motion.button
                                                    key={size}
                                                    whileHover={{ scale: 1.03, y: -1 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={() => setSelectedSize(size)}
                                                    className={`px-5 py-3 cursor-pointer rounded-md transition-all text-sm font-medium ${selectedSize === size
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

                            {currentProduct.blueprints && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setZoomed(!zoomed)}
                                    className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg transition-all shadow-md hover:shadow-lg z-30 border ${zoomed
                                        ? 'bg-red-500 text-white border-red-200 hover:bg-red-600'
                                        : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-green-200 hover:from-green-700 hover:to-emerald-700'
                                        }`}
                                >
                                    {zoomed ? (
                                        <>
                                            <X size={16} />
                                            <span className="text-sm cursor-pointer font-medium">Close Blueprint</span>
                                        </>
                                    ) : (
                                        <>
                                            <FileText size={16} />
                                            <span className="text-sm cursor-pointer font-medium">View Blueprint</span>
                                        </>
                                    )}
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col flex-1 gap-6"
                >
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent text-center">
                        <h1 className="text-xl lg:text-2xl font-bold">
                            {activeTab.toUpperCase()}
                            {activeTab === 'Galvanized C-Purlins' && ` (${selectedSize})`}
                            {activeTab === 'PPGL Plain Sheets' && selectedColor && ` (${selectedColor})`}
                        </h1>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white rounded-lg shadow-md border border-gray-100 p-3"
                    >
                        <div className="grid grid-cols-3 lg:grid-cols-7 gap-2">
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
                                        className={`w-12 h-12 lg:w-16 lg:h-14 rounded-md cursor-pointer transition-all shadow-sm border ${activeTab === tab
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
                                        {tab}
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
                            className="bg-white rounded-lg shadow-md border border-gray-100 p-6"
                        >
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Palette className="w-5 h-5 text-green-600" />
                                <h3 className="text-gray-800 font-semibold text-lg">Available Colors</h3>
                            </div>

                            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2">
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
                                            className={`w-10 h-10 rounded-md border-2 cursor-pointer transition-all ${selectedColor === colorItem.name
                                                ? 'border-green-600 ring-2 ring-green-600/20 shadow-md'
                                                : 'border-gray-300 hover:border-green-400'
                                                }`}
                                            style={{ backgroundColor: colorItem.color }}
                                            aria-label={`Select ${colorItem.name} color`}
                                        />
                                        <span className="text-[12px] text-gray-600 text-center mt-1 truncate w-full px-1">
                                            {colorItem.name}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>

                            {selectedColor && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <div
                                            className="w-6 h-6 rounded border border-gray-300"
                                            style={{
                                                backgroundColor: currentProduct.colorSwatches.find((c: any) => c.name === selectedColor)?.color
                                            }}
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Selected Color: <span className="text-green-600 font-semibold">{selectedColor}</span>
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
                        className="bg-gray-50 rounded-lg shadow-lg border border-gray-200 p-6"
                    >
                        <div className="flex items-center justify-center gap-2 mb-4">
                            {activeTab === 'Hollow Blocks' ? (
                                <Gauge className="w-5 h-5 text-green-600" />
                            ) : activeTab === 'Metal Cylinder' ? (
                                <Weight className="w-5 h-5 text-green-600" />
                            ) : (
                                <Layers className="w-5 h-5 text-green-600" />
                            )}
                            <h3 className="text-gray-800 font-semibold text-lg">
                                {activeTab === 'Hollow Blocks'
                                    ? 'PSI Specifications'
                                    : activeTab === 'Metal Cylinder'
                                        ? 'Weight Specifications'
                                        : 'Thickness Specifications'
                                }
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {activeTab === 'Hollow Blocks' ? (
                                currentProduct.psiVariations.map((item: string, i: number) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center justify-between gap-3 bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full group-hover:scale-125 transition-transform" />
                                            <span className="text-gray-700 font-medium">{item}</span>
                                        </div>
                                        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
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
                                        className="flex items-center justify-between gap-3 bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full group-hover:scale-125 transition-transform" />
                                            <span className="text-gray-700 font-medium">{item}</span>
                                        </div>
                                        <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
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
                                        className="flex items-center justify-between gap-3 bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full group-hover:scale-125 transition-transform" />
                                            <span className="text-gray-700 font-medium">{item}</span>
                                        </div>
                                        <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
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
                        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 shadow-md p-6"
                    >
                        <p className="text-gray-700 leading-relaxed text-[15px]">
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
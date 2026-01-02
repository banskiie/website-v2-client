"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    ArrowRight, Home, FileText, X, Layers, Ruler, Sparkles, Palette,
    Gauge, CheckCircle2, Search, Package, ThermometerSun, Shield,
    Waves, InspectionPanel, Leaf, Wrench, Thermometer, Grid3X3, House,
    Building, Zap, Award
} from 'lucide-react';
import Footer from '@/components/custom/footer';
import { CLOUD } from './main-faq';

const colorSwatches = [
    { name: "Gray White", color: "#F2F3F5", code: "GW" },
    { name: "Terra Cotta", color: "#E3735E", code: "TC" },
    { name: "Mandarin Red", color: "#F37A48", code: "MR" },
    { name: "Maroon Red", color: "#800000", code: "MAR" },
    { name: "Brown", color: "#322320", code: "BR" },
    { name: "Black", color: "#000000", code: "BL" },
    { name: "Pink", color: "#FFC0CB", code: "PK" },
    { name: "Light Yellow", color: "#FFFFE0", code: "LY" },
    { name: "Violet", color: "#8F00FF", code: "VI" },
    { name: "Foam Green", color: "#93E9BE", code: "FG" },
    { name: "Blue", color: "#0000FF", code: "BL" },
    { name: "Light Blue", color: "#ADD8E6", code: "LB" },
    { name: "Bamboo", color: "#D2B48C", code: "BA" },
    { name: "Beige", color: "#F5F5DC", code: "BE" },
    { name: "Oakwood", color: "#BAA48A", code: "OW" },
    { name: "Deep Orange", color: "#FF8C00", code: "DO" },
    { name: "Green", color: "#008000", code: "GR" },
    { name: "Apple Green", color: "#8DB600", code: "AG" },
    { name: "Gray", color: "#808080", code: "GY" }
];

// Main Category Tabs
const mainCategories = [
    {
        id: "ppgl_roofing",
        name: "PPGL Roofing",
        icon: House,
        color: "bg-gradient-to-r from-green-500 to-emerald-600",
        hasSubTabs: true
    },
    {
        id: "ppgl_spandrel",
        name: "PPGL Spandrel",
        icon: Building,
        color: "bg-gradient-to-r from-blue-500 to-cyan-600",
        hasSubTabs: false
    },
    {
        id: "ppgl_cladding",
        name: "PPGL Wall Cladding",
        icon: Zap,
        color: "bg-gradient-to-r from-purple-500 to-pink-600",
        hasSubTabs: false
    },
    {
        id: "gi_floor_deck",
        name: "G.I Floor Deck",
        icon: Award,
        color: "bg-gradient-to-r from-orange-500 to-amber-600",
        hasSubTabs: false
    }
];

// Sub Tabs for PPGL Roofing only
const roofingSubTabs = [
    {
        id: "rib_type",
        name: "Rib Type",
        icon: Waves,
        color: "bg-gradient-to-r from-green-500 to-emerald-600"
    },
    {
        id: "corrugated",
        name: "Corrugated",
        icon: Waves,
        color: "bg-gradient-to-r from-blue-500 to-cyan-600"
    },
    {
        id: "roof_tile",
        name: "Roof Tile",
        icon: InspectionPanel,
        color: "bg-gradient-to-r from-orange-500 to-amber-600"
    },
    {
        id: "frp",
        name: "FRP",
        icon: Leaf,
        color: "bg-gradient-to-r from-purple-500 to-pink-600"
    },
    {
        id: "accessories",
        name: "Roofing Accessories",
        icon: Wrench,
        color: "bg-gradient-to-r from-indigo-500 to-violet-600"
    },
    {
        id: "foam",
        name: "Foam Insulator",
        icon: ThermometerSun,
        color: "bg-gradient-to-r from-red-500 to-rose-600"
    }
];

// Product data for all categories
const productData: Record<string, any> = {
    // PPGL Roofing Products
    "rib_type": {
        name: "Rib Type Roofing",
        category: "PPGL Roofing",
        icon: Waves,
        thickness: ["0.30mm", "0.35mm", "0.40mm", "0.50mm"],
        image: `${CLOUD}/rib_type_roofing.jpg`,
        colorSwatches: colorSwatches,
        features: [
            "Premium Nippon Paint or AKZO Nobel Paint",
            "Front Primer: 5 Microns thickness",
            "Front Coat Color: 13 Microns thickness",
            "Back Coating: 5-7 Microns thickness",
            "Custom lengths available upon request",
            "Excellent weather resistance"
        ],
        description: "High-quality rib type PPGL roofing sheets designed for superior weather resistance and aesthetic appeal."
    },
    "corrugated": {
        name: "Corrugated Type Roofing",
        category: "PPGL Roofing",
        icon: Waves,
        thickness: ["0.30mm", "0.35mm", "0.40mm", "0.50mm"],
        image: `${CLOUD}/corrugated_roofing.jpg`,
        colorSwatches: colorSwatches,
        features: [
            "Classic corrugated profile design",
            "Excellent water drainage capability",
            "High strength-to-weight ratio",
            "Easy and quick installation"
        ],
        description: "Traditional corrugated PPGL roofing sheets offering robust durability and efficient water drainage."
    },
    "roof_tile": {
        name: "Roof Tile Sheets",
        category: "PPGL Roofing",
        icon: InspectionPanel,
        thickness: ["0.35mm", "0.40mm", "0.50mm"],
        image: `${CLOUD}/roof_tile.jpg`,
        colorSwatches: colorSwatches,
        features: [
            "Aesthetic tile-like appearance",
            "Lightweight yet durable construction",
            "UV resistant protective coating",
            "Easy installation with standard tools"
        ],
        description: "PPGL roofing sheets with beautiful tile-like appearance combining traditional aesthetics with modern durability."
    },
    "frp": {
        name: "FRP Roofing Sheets",
        category: "PPGL Roofing",
        icon: Leaf,
        thickness: ["1.20mm"],
        image: `${CLOUD}/frp_roofing.jpg`,
        colorSwatches: colorSwatches,
        features: [
            "Fiber-Reinforced Polymer construction",
            "High strength-to-weight ratio",
            "Translucent natural lighting options",
            "Excellent corrosion resistance"
        ],
        description: "Fiber-reinforced polymer roofing sheets that provide natural lighting while maintaining structural integrity."
    },
    "accessories": {
        name: "Roofing Accessories",
        category: "PPGL Roofing",
        icon: Wrench,
        thickness: ["0.30mm", "0.35mm", "0.40mm", "0.50mm"],
        image: `${CLOUD}/roofing_accessories.jpg`,
        accessories: [
            "Ridge Rolls",
            "Gutters & Downpipes",
            "Ridge Caps",
            "Fascia Boards",
            "Wall Angles",
            "Corner Flashing",
            "Valley Gutters",
            "End Flashing"
        ],
        features: [
            "Precision manufactured fittings",
            "Weather resistant coating",
            "Easy installation with standard tools",
            "Perfect match with roofing profiles"
        ],
        description: "Complete range of high-quality roofing accessories designed to complement PPGL roofing systems."
    },
    "foam": {
        name: "Foam Insulator",
        category: "PPGL Roofing",
        icon: ThermometerSun,
        specs: "1.00m Width x 50m Length",
        variants: [
            "9.0mm Double Sided Foil",
            "5.0mm Single Sided Foil",
            "7.0mm Double Sided Non-foil",
            "10.0mm Premium Double Sided"
        ],
        image: `${CLOUD}/foam_insulator.jpg`,
        features: [
            "Excellent thermal insulation properties",
            "Effective moisture barrier",
            "Reflective surface for heat reduction",
            "Easy installation with adhesive backing"
        ],
        description: "High-performance foam insulation for thermal and acoustic insulation in roofing systems."
    },

    // PPGL Spandrel
    "ppgl_spandrel": {
        name: "PPGL Spandrel",
        category: "Architectural",
        icon: Building,
        thickness: ["0.35mm", "0.40mm", "0.50mm", "0.60mm"],
        image: `${CLOUD}/spandrel.jpg`,
        colorSwatches: colorSwatches,
        features: [
            "Architectural spandrel panels",
            "Clean modern appearance",
            "Durable finish",
            "Custom lengths available",
            "Weather resistant coating"
        ],
        description: "High-quality PPGL spandrel panels designed for architectural applications with modern aesthetics and durability."
    },

    // PPGL Wall Cladding
    "ppgl_cladding": {
        name: "PPGL Wall Cladding",
        category: "Architectural",
        icon: Zap,
        thickness: ["0.35mm", "0.40mm", "0.50mm"],
        image: `${CLOUD}/wall_cladding.jpg`,
        colorSwatches: colorSwatches,
        features: [
            "Aesthetic wall cladding panels",
            "Weather and impact resistant",
            "Thermal insulation options",
            "Low maintenance",
            "Easy installation system"
        ],
        description: "Architectural PPGL wall cladding panels for building exteriors with excellent durability and modern design."
    },

    // G.I Floor Deck
    "gi_floor_deck": {
        name: "G.I Floor Deck",
        category: "Structural",
        icon: Award,
        thickness: ["0.75mm", "0.80mm", "1.00mm", "1.20mm"],
        image: `${CLOUD}/floor_deck.jpg`,
        features: [
            "High load-bearing capacity",
            "Composite action with concrete",
            "Fire resistant design",
            "Quick installation",
            "Galvanized finish"
        ],
        description: "Galvanized iron floor decking systems for composite construction with excellent strength-to-weight ratio."
    }
};

function PpglProducts() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [activeMainTab, setActiveMainTab] = useState("ppgl_roofing");
    const [activeSubTab, setActiveSubTab] = useState("rib_type");
    const [zoomed, setZoomed] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedColor, setSelectedColor] = useState<string | null>("Gray White");

    const currentMainCategory = mainCategories.find(cat => cat.id === activeMainTab);
    const currentProduct = activeMainTab === "ppgl_roofing"
        ? productData[activeSubTab]
        : productData[activeMainTab];

    const handleHomeClick = () => {
        router.push('/steel#steel-products-head');

        if (window.location.pathname === '/steel') {
            setTimeout(() => {
                const element = document.getElementById('steel-products-head');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    };

    const handleMainTabChange = (tabId: string) => {
        setActiveMainTab(tabId);
        // Reset sub tab to default when main tab changes
        if (tabId === "ppgl_roofing") {
            setActiveSubTab("rib_type");
        }
        setZoomed(false);
        setSelectedColor("Gray White");
    };

    const handleSubTabChange = (tabId: string) => {
        setActiveSubTab(tabId);
        setZoomed(false);
        setSelectedColor("Gray White");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header */}
            <header className="bg-white fixed top-0 left-0 right-0 z-50 border-b border-gray-200">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleHomeClick}
                            className="flex items-center cursor-pointer gap-2 px-3 py-2 text-gray-700 hover:text-green-600 transition-all rounded-lg hover:bg-green-50"
                        >
                            <Home className="w-4 h-4" />
                            <span className="text-sm font-medium ">Home</span>
                        </motion.button>

                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-green-600" />
                            <h2 className="text-base font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                PPGL Products
                            </h2>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05, x: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push('/steel')}
                            className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md"
                        >
                            <ArrowRight className="w-3 h-3 rotate-180" />
                            <span className="text-sm font-medium">Steel Products</span>
                        </motion.button>

                        <button
                            className="sm:hidden text-gray-700 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={18} /> : <span className="text-xl">☰</span>}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="sm:hidden bg-white border-t border-gray-100 px-4 py-2 overflow-hidden"
                        >
                            <div className="flex flex-col space-y-1">
                                <Link href="/steel#steel-products-head" className="text-sm text-gray-700 hover:text-green-600 transition-colors py-1">
                                    Steel Products
                                </Link>
                                <Link href="/trucks" className="text-sm text-gray-700 hover:text-green-600 transition-colors py-1">
                                    Trucks & Equipment
                                </Link>
                                <Link href="/sports-center" className="text-sm text-gray-700 hover:text-green-600 transition-colors py-1">
                                    Sports Center
                                </Link>
                                <Link href="/rentals" className="text-sm text-gray-700 hover:text-green-600 transition-colors py-1">
                                    Rentals
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Main Content */}
            <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-[1480px] mx-auto mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Grid3X3 className="w-4 h-4 text-green-600" />
                            <h3 className="text-sm font-semibold text-gray-800">Product Categories <span className="text-muted-foreground text-xs">(Select One to See Products)</span></h3>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {mainCategories.map((category) => {
                            const Icon = category.icon;
                            return (
                                <motion.button
                                    key={category.id}
                                    whileHover={{ scale: 1.05, y: -1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleMainTabChange(category.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 cursor-pointer rounded-lg transition-all text-sm ${activeMainTab === category.id
                                        ? `${category.color} text-white shadow-md scale-105`
                                        : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
                                        }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{category.name}</span>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                <div className="max-w-[1480px] mx-auto">
                    {/* Breadcrumb */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-6"
                    >
                        <div className="text-gray-500 flex items-center gap-1 text-xs mb-2">
                            <button
                                onClick={handleHomeClick}
                                className="hover:text-green-600 transition-colors cursor-pointer underline"
                            >
                                Home
                            </button>
                            <span>/</span>
                            <span className="text-green-600 font-medium">PPGL Products</span>
                            <span>/</span>
                            <span className="text-green-600 font-medium">
                                {activeMainTab === "ppgl_roofing" ? "PPGL Roofing" :
                                    activeMainTab === "ppgl_spandrel" ? "PPGL Spandrel" :
                                        activeMainTab === "ppgl_cladding" ? "PPGL Wall Cladding" :
                                            activeMainTab === "gi_floor_deck" ? "G.I Floor Deck" : ""}
                            </span>

                            {activeMainTab === "ppgl_roofing" && (
                                <>
                                    <span>/</span>
                                    <span className="font-semibold text-gray-800">{currentProduct?.name}</span>
                                </>
                            )}
                        </div>

                        <div className="mb-4">
                            <h1 className="text-xl font-bold text-gray-800 mb-2">
                                {currentProduct?.name}
                            </h1>
                            <p className="text-gray-600 text-sm">
                                {currentProduct?.description}
                            </p>
                        </div>
                    </motion.div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <motion.div
                                key={activeMainTab + activeSubTab}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="relative"
                            >
                                <div className="relative h-[320px] md:h-[400px] bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                                    <div className="absolute inset-0 flex items-center justify-center p-4">
                                        <Image
                                            src={currentProduct?.image || '/assets/placeholder.jpg'}
                                            alt={currentProduct?.name}
                                            fill
                                            className="object-contain"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            quality={100}
                                        />
                                    </div>

                                    <div className="absolute top-3 left-3">
                                        <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-md shadow-sm">
                                            <Shield className="w-3 h-3" />
                                            <span className="text-xs font-medium">Premium</span>
                                        </div>
                                    </div>

                                    {currentProduct?.blueprint && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setZoomed(!zoomed)}
                                            className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md transition-all text-xs ${zoomed
                                                ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                                                : 'bg-gray-800/80 text-white backdrop-blur-sm'
                                                }`}
                                        >
                                            {zoomed ? (
                                                <>
                                                    <X className="w-3 h-3" />
                                                    <span>Close</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Search className="w-3 h-3" />
                                                    <span>Zoom</span>
                                                </>
                                            )}
                                        </motion.button>
                                    )}
                                </div>
                            </motion.div>

                            {/* Product Features */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-xl shadow-md p-4 border border-gray-200"
                            >
                                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    Key Features
                                </h3>
                                <div className="grid md:grid-cols-2 gap-2">
                                    {currentProduct?.features?.map((feature: string, index: number) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100"
                                        >
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                                            <span className="text-sm text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        <div className="space-y-4">
                            {activeMainTab === "ppgl_roofing" && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white rounded-xl shadow-md p-4 border border-gray-200"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <House className="w-4 h-4 text-green-600" />
                                        <h3 className="text-sm font-semibold text-gray-800">Roofing Types <span className="text-xs text-gray-500">(Select One to See Products)</span> </h3>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        {roofingSubTabs.map((tab) => {
                                            const Icon = tab.icon;
                                            return (
                                                <motion.button
                                                    key={tab.id}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleSubTabChange(tab.id)}
                                                    className={`flex flex-col items-center justify-center p-2 rounded-md cursor-pointer transition-all ${activeSubTab === tab.id
                                                        ? `${tab.color} text-white shadow-md scale-105`
                                                        : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
                                                        }`}
                                                    title={tab.name}
                                                >
                                                    {/* <Icon className="w-3 h-3 mb-0.5" /> */}
                                                    <span className="text-xs font-medium text-center leading-relaxed tracking-wide">{tab.name}</span>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}

                            {/* Color Selection */}
                            {currentProduct?.colorSwatches && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-white rounded-xl shadow-md p-3 border border-gray-200"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-1.5">
                                            <Palette className="w-3.5 h-3.5 text-green-600" />
                                            <h3 className="text-sm font-semibold text-gray-800">Color Options</h3>
                                        </div>
                                        {selectedColor && (
                                            <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 rounded text-xs">
                                                <div
                                                    className="w-2.5 h-2.5 rounded border border-gray-300"
                                                    style={{
                                                        backgroundColor: colorSwatches.find(c => c.name === selectedColor)?.color
                                                    }}
                                                />
                                                <span className="font-medium text-gray-700">{selectedColor}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-4 gap-1.5">
                                        {colorSwatches.slice(0, 8).map((colorItem, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedColor(colorItem.name)}
                                                className="flex flex-col items-center"
                                            >
                                                <div
                                                    className={`w-7 h-7 rounded-md mb-0.5 transition-all border ${selectedColor === colorItem.name
                                                        ? 'border-green-500 shadow scale-105'
                                                        : 'border-gray-200 hover:border-green-300'
                                                        }`}
                                                    style={{ backgroundColor: colorItem.color }}
                                                />
                                                <span className="text-xs text-gray-600">
                                                    {colorItem.code}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Specifications */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white rounded-xl shadow-md p-3 border border-gray-200"
                            >
                                <div className="flex items-center gap-1.5 mb-2">
                                    <div className="p-1 bg-green-100 rounded">
                                        {activeMainTab === "ppgl_roofing" && activeSubTab === "foam" ? (
                                            <ThermometerSun className="w-3.5 h-3.5 text-green-600" />
                                        ) : activeMainTab === "ppgl_roofing" && activeSubTab === "accessories" ? (
                                            <Wrench className="w-3.5 h-3.5 text-green-600" />
                                        ) : (
                                            <Layers className="w-3.5 h-3.5 text-green-600" />
                                        )}
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-800">
                                        {activeMainTab === "ppgl_roofing" && activeSubTab === "accessories"
                                            ? 'Available Accessories'
                                            : activeMainTab === "ppgl_roofing" && activeSubTab === "foam"
                                                ? 'Available Variants'
                                                : 'Thickness Options'
                                        }
                                    </h3>
                                </div>

                                <div className="space-y-1.5">
                                    {activeMainTab === "ppgl_roofing" && activeSubTab === "accessories" ? (
                                        currentProduct?.accessories?.map((item: string, i: number) => (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between p-1.5 bg-gray-50 rounded border border-gray-100"
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                                    <span className="text-sm text-gray-700">{item}</span>
                                                </div>
                                                <span className="text-xs px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded">
                                                    Acc
                                                </span>
                                            </div>
                                        ))
                                    ) : activeMainTab === "ppgl_roofing" && activeSubTab === "foam" ? (
                                        currentProduct?.variants?.map((item: string, i: number) => (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between p-1.5 bg-gray-50 rounded border border-gray-100"
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                                    <span className="text-sm text-gray-700">{item}</span>
                                                </div>
                                                <span className="text-xs px-1.5 py-0.5 bg-red-50 text-red-700 rounded">
                                                    Var
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        currentProduct?.thickness?.map((item: string, i: number) => (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between p-1.5 bg-gray-50 rounded border border-gray-100"
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                    <span className="text-sm text-gray-700">{item}</span>
                                                </div>
                                                <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded">
                                                    Thick
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {activeMainTab === "ppgl_roofing" && activeSubTab === "foam" && (
                                    <div className="mt-2 p-1.5 bg-blue-50 rounded border border-blue-100">
                                        <div className="flex items-center gap-1.5">
                                            <Package className="w-3 h-3 text-blue-600" />
                                            <span className="text-xs text-blue-700 font-medium">
                                                Standard: {currentProduct?.specs}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </motion.div>

                            {/* Technical Details */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-green-50 rounded-xl shadow-md p-3 border border-green-100"
                            >
                                <h3 className="text-sm font-semibold text-gray-800 mb-2">Technical Details</h3>
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex justify-between py-1 border-b border-green-100">
                                        <span className="text-gray-600">Category</span>
                                        <span className="font-medium text-gray-700">{currentProduct?.category}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-green-100">
                                        <span className="text-gray-600">Material</span>
                                        <span className="font-medium text-gray-700">PPGL Steel</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-green-100">
                                        <span className="text-gray-600">Finish</span>
                                        <span className="font-medium text-gray-700">Pre-painted</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="text-gray-600">Warranty</span>
                                        <span className="font-medium text-green-600">1 Year</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default PpglProducts
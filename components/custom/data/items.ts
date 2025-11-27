import { Award, Clock, Headset, PhilippinePeso, Shield, WrenchIcon } from "lucide-react"
import { CLOUD } from "../main-faq"

const DRIVE = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_PUBLIC_FOLDER

// components/custom/data/items.ts
export const items = [
  {
    id: 1,
    title: "Steel",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    img: `${DRIVE}/img/steel/category/category3.png`,
    badgeColor: "#FEBA00",
    badgeNum: "01",
    activeColor: "#FEBA00",
    link: "/steel",
  },
  {
    id: 2,
    title: "Trucks & Equipment",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    img: `${DRIVE}/img/trucks_new/Wheel Loader/XIASHENG XM935-4.jpg`,
    badgeColor: "#FF3300",
    badgeNum: "02",
    activeColor: "#FF3300",
    link: "/trucks",
  },
  {
    id: 3,
    title: "Sports Center",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    img: `${DRIVE}/img/courts/Background-Badminton.png`,
    badgeColor: "#2AFE00",
    badgeNum: "03",
    activeColor: "#2AFE00",
    link: "/sports-center",
  },
  {
    id: 4,
    title: "Rentals",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    img: `${DRIVE}/img/rentals/rentals-bg-2.png`,
    badgeColor: "#00B3EF",
    badgeNum: "04",
    activeColor: "#00B3EF",
    link: "/rentals",
  },
]

export type CategoryType = "Singles" | "Doubles"
export type Gender = "Male" | "Women" | "Mixed"
export type CategoryCode = "13U" | "16U" | "9U" | "Advanced" | "Beginners" | "E" | "F" | "G" | "Legends" | "Open"

export interface Category {
  id: number
  name: string
  type: CategoryType
  level: CategoryCode
  gender: Gender
}

export const categories: readonly Category[] = [
  { id: 1, name: "Boys 13 and Under", type: "Doubles", level: "13U", gender: "Male" },
  { id: 2, name: "Boys 13 and Under", type: "Singles", level: "13U", gender: "Male" },
  { id: 3, name: "Boys 16 and Under", type: "Doubles", level: "16U", gender: "Male" },
  { id: 4, name: "Boys 16 and Under", type: "Singles", level: "16U", gender: "Male" },
  { id: 5, name: "Boys 9 and Under", type: "Doubles", level: "9U", gender: "Male" },
  { id: 6, name: "Boys 9 and Under", type: "Singles", level: "9U", gender: "Male" },

  { id: 7, name: "Girls 13 and Under", type: "Doubles", level: "13U", gender: "Women" },
  { id: 8, name: "Girls 13 and Under", type: "Singles", level: "13U", gender: "Women" },
  { id: 9, name: "Girls 16 and Under", type: "Doubles", level: "16U", gender: "Women" },
  { id: 10, name: "Girls 16 and Under", type: "Singles", level: "16U", gender: "Women" },
  { id: 11, name: "Girls 9 and Under", type: "Doubles", level: "9U", gender: "Women" },
  { id: 12, name: "Girls 9 and Under", type: "Singles", level: "9U", gender: "Women" },

  { id: 13, name: "Men's Advanced", type: "Doubles", level: "Advanced", gender: "Male" },
  { id: 14, name: "Men's Beginners", type: "Doubles", level: "Beginners", gender: "Male" },
  { id: 15, name: "Men's E", type: "Doubles", level: "E", gender: "Male" },
  { id: 16, name: "Men's F", type: "Doubles", level: "F", gender: "Male" },
  { id: 17, name: "Men's G", type: "Doubles", level: "G", gender: "Male" },
  { id: 18, name: "Men's Legends", type: "Doubles", level: "Legends", gender: "Male" },
  { id: 19, name: "Men's Open", type: "Doubles", level: "Open", gender: "Male" },
  { id: 20, name: "Men's Open", type: "Singles", level: "Open", gender: "Male" },

  { id: 21, name: "Mixed 13 and Under", type: "Doubles", level: "13U", gender: "Mixed" },
  { id: 22, name: "Mixed 16 and Under", type: "Doubles", level: "16U", gender: "Mixed" },
  { id: 23, name: "Mixed 9 and Under", type: "Doubles", level: "9U", gender: "Mixed" },
  { id: 24, name: "Mixed Advanced", type: "Doubles", level: "Advanced", gender: "Mixed" },
  { id: 25, name: "Mixed Beginners", type: "Doubles", level: "Beginners", gender: "Mixed" },
  { id: 26, name: "Mixed E", type: "Doubles", level: "E", gender: "Mixed" },
  { id: 27, name: "Mixed F", type: "Doubles", level: "F", gender: "Mixed" },
  { id: 28, name: "Mixed G", type: "Doubles", level: "G", gender: "Mixed" },
  { id: 29, name: "Mixed Legends", type: "Doubles", level: "Legends", gender: "Mixed" },
  { id: 30, name: "Mixed Open", type: "Doubles", level: "Open", gender: "Mixed" },

  { id: 31, name: "Women's Advanced", type: "Doubles", level: "Advanced", gender: "Women" },
  { id: 32, name: "Women's Beginners", type: "Doubles", level: "Beginners", gender: "Women" },
  { id: 33, name: "Women's E", type: "Doubles", level: "E", gender: "Women" },
  { id: 34, name: "Women's F", type: "Doubles", level: "F", gender: "Women" },
  { id: 35, name: "Women's G", type: "Doubles", level: "G", gender: "Women" },
  { id: 36, name: "Women's Legends", type: "Doubles", level: "Legends", gender: "Women" },
  { id: 37, name: "Women's Open", type: "Doubles", level: "Open", gender: "Women" },
  { id: 38, name: "Women's Open", type: "Singles", level: "Open", gender: "Women" },
] as const


export const features = [
  {
    icon: Shield,
    title: "Fully Insured Fleet",
    text: "All our vehicles come with comprehensive insurance coverage for your peace of mind and cargo protection.",
  },
  {
    icon: Clock,
    title: "Flexible Rental Terms",
    text: "Daily, weekly, or monthly rentals — choose the plan that works best for your business schedule and budget.",
  },
  {
    icon: WrenchIcon,
    title: "Well-Maintained Vehicles",
    text: "Regular maintenance and safety checks ensure reliability on every trip. Our trucks are always road-ready.",
  },
  {
    icon: PhilippinePeso,
    title: "Competitive Pricing",
    text: "Transparent pricing with no hidden fees. Get the best value for your investment with our affordable rates.",
  },
  {
    icon: Headset,
    title: "24/7 Support",
    text: "Round-the-clock customer support and roadside assistance whenever you need it. We're always here to help.",
  },
  {
    icon: Award,
    title: "Trusted in CDO",
    text: "Serving businesses in Cagayan de Oro and Northern Mindanao for over 15 years with reliable service.",
  },
]

export const rentals = [
  {
    img: `${CLOUD}/v1764223008/prime_mover_gynsht.png`,
    label: "Prime Mover Rentals",
    emoji: "📦",
    capacity: "Up to 1.5 tons",
    title: "Prime Mover",
    desc: "Perfect for small to medium deliveries, courier services, and urban logistics within the city.",
    tags: ["Fuel Efficient", "Easy to Drive", "City-Friendly"],
  },
  {
    img: `${CLOUD}/v1764223011/self_loader_b6p3r8.png`,
    label: "Self Loader Rentals",
    emoji: "🚛",
    capacity: "3–5 tons",
    title: "Self Loader",
    desc: "Ideal for moving, furniture delivery, and medium cargo transport. Enclosed cargo area protects your goods.",
    tags: ["Spacious Cargo Area", "Loading Ramp", "Weather Protected"],
  },
  {
    img: `${CLOUD}/v1764223014/no_img_rchb9c.png`,
    label: "Truck Rentals",
    emoji: "🚚",
    capacity: "10+ tons",
    title: "Boom Truck",
    desc: "Built for industrial logistics, bulk cargo, and long-haul transportation — tough, safe, and dependable.",
    tags: ["Heavy Load", "Long Distance", "Durable"],
  },
  {
    img: `${CLOUD}/v1764223014/no_img_rchb9c.png`,
    label: "Forklift Rentals",
    emoji: "🚚",
    capacity: "10+ tons",
    title: "Forklift",
    desc: "Built for industrial logistics, bulk cargo, and long-haul transportation — tough, safe, and dependable.",
    tags: ["Heavy Load", "Long Distance", "Durable"],
  },
  {
    img: `${CLOUD}/v1764223014/no_img_rchb9c.png`,
    label: "Backhoe Rentals",
    emoji: "🚚",
    capacity: "10+ tons",
    title: "Backhoe",
    desc: "Built for industrial logistics, bulk cargo, and long-haul transportation — tough, safe, and dependable.",
    tags: ["Heavy Load", "Long Distance", "Durable"],
  },
  {
    img: `${CLOUD}/v1764223166/xl_wheel_loader_rxkoqq.png`,
    label: "Wheel Loader Rentals",
    emoji: "🚚",
    capacity: "10+ tons",
    title: "Wheel Loader",
    desc: "Built for industrial logistics, bulk cargo, and long-haul transportation — tough, safe, and dependable.",
    tags: ["Heavy Load", "Long Distance", "Durable"],
  },
  {
    img: `${CLOUD}/v1764223014/no_img_rchb9c.png`,
    label: "Grader Rentals",
    emoji: "🚚",
    capacity: "25 Tons",
    title: "Grader",
    desc: "As per quotation w/ Prime Mover",
    tags: ["Length: 19ft", "Width: 10ft", "Height: 4ft"],
  },
  {
    img: `${CLOUD}/v1764223014/no_img_rchb9c.png`,
    label: "Low Bed Double Axle Rentals",
    emoji: "🚚",
    capacity: "50 Tons",
    title: "Low Bed Double Axle",
    desc: "As per quotation w/ Prime Mover",
    tags: ["Length: 37ft", "Width: 9ft", "Height: 5.3ft"],
  },
  {
    img: `${CLOUD}/v1764223014/no_img_rchb9c.png`,
    label: "Low Bed Triple Axle 120103 Rentals",
    emoji: "🚚",
    title: "Low Bed Triple Axle",
    desc: "As per quotation w/ Prime Mover",
    tags: ["Length: 37ft", "Width: 9ft", "Height: 5.3ft"],
    units: [
      { quantity: 2, capacity: "2.5 TONS", stages: "3 STAGES" },
      { quantity: 1, capacity: "3.0 TONS", stages: "5 STAGES" },
    ],
  },
  {
    img: `${CLOUD}/v1764223034/f_self_loader_gqwavq.png`,
    label: "Fighter Self Loader",
    emoji: "🚚",
    capacity: "7 Tons",
    title: "Fighter Self Loader",
    extra: "6 WHEELERS",
    tags: ["Length: 37ft", "Width: 9ft", "Height: 5.3ft"],
  },
  {
    img: `${CLOUD}/v1764223044/gen_45_dlamz7.png`,
    label: "Generator Rentals",
    emoji: "🏗️",
    capacity: "10 TONS",
    title: "Genset 45KVA",
    desc: "Ideal for material handling and warehouse operations.",
    tags: ["Diesel Powered", "High Lift", "Operator Included"],
    units: [
      { quantity: 2, capacity: "3.5 TONS" },
      { quantity: 1, capacity: "5.0 TONS" },
      { quantity: 1, capacity: "10 TONS" },
    ],
  },
  {
    title: "Genset 60KVA",
    label: "Generator Rentals",
    emoji: "🏗️",
    capacity: "25 TONS",
    extra: "5 TONS also available",
    desc: "Reliable cranes available for construction, heavy lifting, and transport operations. Perfect for large-scale industrial projects.",
    img: `${CLOUD}/v1764223048/gen_60_dnz4uo.png`,
    units: [
      { quantity: 1, capacity: "5 TONS", stages: "" },
      { quantity: 1, capacity: "25 TONS", stages: "" },
    ],
    tags: ["Construction", "Heavy Duty", "Crane"],
  },
  {
    title: "Rough Terrain Mobile Crane",
    label: "Rough Terrain Mobile Crane Rentals",
    emoji: "🚜",
    capacity: "0.80 CBM",
    extra: "Multiple sizes available",
    desc: "Versatile backhoe units for excavation, digging, and small-scale construction projects.",
    img: `${CLOUD}/v1764223014/no_img_rchb9c.png`,
    units: [
      { quantity: 1, capacity: "0.08 CBM" },
      { quantity: 1, capacity: "0.30 CBM" },
      { quantity: 1, capacity: "0.40 CBM" },
      { quantity: 1, capacity: "0.50 CBM" },
      { quantity: 1, capacity: "0.55 CBM" },
      { quantity: 1, capacity: "0.75 CBM" },
      { quantity: 1, capacity: "0.80 CBM" },
    ],
    tags: ["Excavation", "Versatile", "Construction"],
  },
  {
    title: "Breaker Sanha S140T Top Type 1",
    label: "Breaker Sanha Rentals",
    emoji: "🏗️",
    capacity: "25 TONS",
    extra: "5 TONS also available",
    desc: "Reliable cranes available for construction, heavy lifting, and transport operations. Perfect for large-scale industrial projects.",
    img: `${CLOUD}/v1764223014/no_img_rchb9c.png`,
    units: [
      { quantity: 1, capacity: "5 TONS", stages: "" },
      { quantity: 1, capacity: "25 TONS", stages: "" },
    ],
    tags: ["Construction", "Heavy Duty", "Crane"],
  },
  {
    title: "JPC-492; Sanha S140T Top Type 2",
    label: "Sanha Rentals",
    emoji: "🏗️",
    capacity: "25 TONS",
    extra: "5 TONS also available",
    desc: "Reliable cranes available for construction, heavy lifting, and transport operations. Perfect for large-scale industrial projects.",
    img: `${CLOUD}/v1764223014/no_img_rchb9c.png`,
    units: [
      { quantity: 1, capacity: "5 TONS", stages: "" },
      { quantity: 1, capacity: "25 TONS", stages: "" },
    ],
    tags: ["Construction", "Heavy Duty", "Crane"],
  },
  {
    title: "SDLG Excavator",
    label: "Excavator Rentals",
    emoji: "🏗️",
    capacity: "Brand New",
    extra: "5 TONS also available",
    desc: "Reliable cranes available for construction, heavy lifting, and transport operations. Perfect for large-scale industrial projects.",
    img: `${CLOUD}/v1764223014/no_img_rchb9c.png`,
    units: [
      { quantity: 1, capacity: "5 TONS", stages: "" },
      { quantity: 1, capacity: "25 TONS", stages: "" },
    ],
    tags: ["Construction", "Heavy Duty", "Crane"],
  },
  {
    title: "Xiniu Excavator",
    label: "Excavator Rentals",
    emoji: "🏗️",
    capacity: "Brand New",
    extra: "5 TONS also available",
    desc: "Reliable cranes available for construction, heavy lifting, and transport operations. Perfect for large-scale industrial projects.",
    img: `${CLOUD}/v1764223060/Xiniu_Excavator_yu76ug.png`,
    units: [
      { quantity: 1, capacity: "5 TONS", stages: "" },
      { quantity: 1, capacity: "25 TONS", stages: "" },
    ],
    tags: ["Construction", "Heavy Duty", "Crane"],
  },

]

import { FileTextIcon, SearchIcon, ThumbsUp, Truck } from "lucide-react";
import { motion } from "framer-motion"

const stepVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
}
export function Step({ number, title, desc, Icon, isLast = false }: any) {
  return (
    <motion.div
      variants={stepVariants}
      whileHover={{ scale: 1.05 }}
      className="relative flex flex-col items-center text-center space-y-4"
    >
      {!isLast && (
        <div className="hidden lg:block absolute left-[75%] top-8 w-[73%] h-0.5 bg-linear-to-r from-yellow-300 via-yellow-400/60 to-transparent" />
      )}

      <motion.div
        whileHover={{ rotate: 5, scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300, damping: 10 }}
        className="relative bg-yellow-100 p-4 rounded-2xl border border-yellow-200 w-16 h-16 flex items-center justify-center shadow-sm"
      >
        <span className="absolute -top-3 -right-3 bg-yellow-400 text-black text-xs font-bold rounded-md px-2 py-0.5 shadow-md">
          {number}
        </span>

        <Icon className="w-6 h-6 text-yellow-600" />
      </motion.div>

      <h4 className="text-base font-semibold text-gray-800">{title}</h4>
      <p className="text-sm text-gray-600 max-w-xs">{desc}</p>
    </motion.div>
  )
}

export function InfoCard({ Icon, title, desc }: any) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.5 }}
      className="border border-amber-400/40 rounded-xl p-6 text-left bg-black/20 backdrop-blur-sm hover:bg-black/30 transition"
    >
      <div className="flex flex-col md:flex-col items-center md:items-start text-center md:text-left">
        <div className="bg-amber-300/20 border border-amber-400/50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-amber-300" />
        </div>
        
        <div>
          <h3 className="text-amber-200 font-semibold mb-2">{title}</h3>
          <p className="text-amber-100/80 text-sm leading-relaxed">{desc}</p>
        </div>
      </div>
    </motion.div>
  )
}

export function Stat({ number, label }: any) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center space-y-1"
    >
      <span className="text-2xl font-bold text-amber-300">{number}</span>
      <span className="text-sm text-amber-200/80">{label}</span>
    </motion.div>
  )
}
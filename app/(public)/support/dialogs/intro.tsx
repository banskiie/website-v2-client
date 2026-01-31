import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

interface IntroStepProps {
  onIntroComplete?: () => void
  onStartChat?: () => void
  showStartButton?: boolean
}

const PulsingIcon = ({ icon: Icon, className = "", iconClassName = "", pulseColor = "bg-green-400" }: any) => (
  <div className={`relative aspect-square ${className}`}>
    <motion.div
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0.6, 0, 0.6],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`absolute inset-0 rounded-full ${pulseColor}`}
    />
    <div className="relative bg-green-100 p-3 rounded-full shadow-xl aspect-square flex items-center justify-center">
      <Icon className={`text-green-600 ${iconClassName}`} />
    </div>
  </div>
)

export default function IntroStep({
  onIntroComplete,
  onStartChat,
  showStartButton = false
}: IntroStepProps) {
  // If this is the initial intro (with timer)
  if (onIntroComplete && !showStartButton) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-[#eef3ff] to-[#e2e8ff] relative overflow-hidden px-4">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="relative flex items-center justify-center"
        >
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border-[3px] border-green-400"
              style={{
                width: `clamp(60px, 15vw, 128px)`,
                height: `clamp(60px, 15vw, 128px)`,
              }}
              initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
              animate={{
                opacity: [0, 1, 0.5, 1],
                scale: [0.8, 1.1, 0.9, 1],
                rotate: i * 30,
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut",
                delay: i * 0.05,
              }}
            />
          ))}

          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
            transition={{ duration: 1.2, delay: 1.2, ease: "easeOut" }}
            className="relative"
          >
            <PulsingIcon
              icon={MessageCircle}
              className="w-[80px] h-[80px] md:w-[160px] md:h-[160px] lg:w-32 lg:h-32"
              iconClassName="w-10 h-10 md:w-14 md:h-14 lg:w-10 lg:h-10"
            />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2.5 }}
          className="mt-10 text-center text-2xl md:text-3xl font-semibold text-gray-800"
        >
          Welcome to <span className="text-green-600">C-ONE</span> Live Support
        </motion.h1>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="bg-white rounded-2xl shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg p-6 sm:p-8 md:p-10 text-center"
    >
      <div className="flex justify-center mb-4 sm:mb-5">
        <PulsingIcon
          icon={MessageCircle}
          className="w-16 h-16 sm:w-20 sm:h-20 md:w-20 md:h-20"
          iconClassName="w-6 h-6 sm:w-8 sm:h-8 md:w-8 md:h-8"
        />
      </div>

      <h1 className="text-xl sm:text-2xl md:text-2xl font-semibold text-gray-800 mb-2">
        Welcome to Live Support
      </h1>

      <p className="text-sm sm:text-base md:text-base text-gray-600 mb-6 px-2 sm:px-4">
        Need Assistance? Our Support Team will respond to your Inquiries during <span className="font-semibold">Operational Availability</span>.
      </p>

      <Button
        onClick={onStartChat}
        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-medium px-4 sm:px-5 md:px-5 py-2 sm:py-2.5 md:py-2.5 rounded-md transition text-sm md:text-sm lg:text-sm cursor-pointer"
      >
        Start Chat
        <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4" />
      </Button>
    </motion.div>
  )
}
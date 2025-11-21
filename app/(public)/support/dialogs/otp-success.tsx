import { motion } from "framer-motion"
import { CheckCircle2Icon } from "lucide-react"

interface OTPSuccessStepProps {
  onNext: () => void
}

export default function OTPSuccessStep({
  onNext
}: OTPSuccessStepProps) {
  return (
    <motion.div
      key="otp-success"
      initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{
        duration: 0.8,
        ease: "easeOut",
        scale: { type: "spring", stiffness: 300, damping: 20 }
      }}
      className="bg-white rounded-xl shadow-xl w-full max-w-sm sm:max-w-md md:max-w-md lg:max-w-md p-6 sm:p-8 md:p-8 lg:p-8 text-center"
    >
      <div className="flex justify-center mb-4 sm:mb-5 md:mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="bg-green-100 p-4 sm:p-5 md:p-6 rounded-full"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 2
            }}
          >
            <CheckCircle2Icon className="w-10 h-10 sm:w-12 sm:h-12 md:w-12 md:h-12 text-green-600" />
          </motion.div>
        </motion.div>
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-xl sm:text-2xl md:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-4"
      >
        Verification Successful!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-sm sm:text-base md:text-base text-gray-600 mb-2"
      >
        Taking you to the Input your name now...
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center mt-4"
      >
        <div className="flex gap-1 sm:gap-2 md:gap-2">
          <motion.div
            className="w-2 h-2 sm:w-2.5 md:w-2.5 bg-green-500 rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-2 h-2 sm:w-2.5 md:w-2.5 bg-green-500 rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="w-2 h-2 sm:w-2.5 md:w-2.5 bg-green-500 rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
import { motion } from "framer-motion"
import { Mail } from "lucide-react"

interface OTPSendingStepProps {
  email: string
  onBack: () => void
}

export default function OTPSendingStep({
  email,
  onBack
}: OTPSendingStepProps) {
  return (
    <motion.div
      key="sending-otp"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-xl w-full max-w-sm sm:max-w-md md:max-w-md lg:max-w-md p-6 sm:p-8 md:p-8 lg:p-8 text-center"
    >
      <div className="flex justify-center mb-4 sm:mb-5 md:mb-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="bg-green-100 p-3 sm:p-4 md:p-4 rounded-full aspect-square flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-20 md:h-20"
        >
          <Mail className="w-6 h-6 sm:w-8 sm:h-8 md:w-8 md:h-8 text-green-600" />
        </motion.div>
      </div>

      <h2 className="text-lg sm:text-xl md:text-xl font-semibold text-gray-800 mb-2">
        Sending OTP...
      </h2>
      <p className="text-sm sm:text-base md:text-base text-gray-600 mb-2">
        We're sending a verification code to
      </p>
      <p className="text-green-600 font-medium mb-6 text-sm sm:text-base md:text-base">
        {email}
      </p>

      <div className="flex justify-center">
        <motion.div
          className="flex gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="w-2 h-2 sm:w-2.5 md:w-2.5 bg-gray-400 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-2 h-2 sm:w-2.5 md:w-2.5 bg-gray-400 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="w-2 h-2 sm:w-2.5 md:w-2.5 bg-gray-400 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
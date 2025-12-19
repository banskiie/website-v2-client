import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Mail, ArrowLeft, ArrowRight } from "lucide-react"

interface OTPStepProps {
  otp: string
  email: string
  error: string | null
  onOtpChange: (otp: string) => void
  onVerify: () => void
  onBack: () => void
  loading?: boolean
}

export default function OTPStep({
  otp,
  email,
  error,
  onOtpChange,
  onVerify,
  onBack,
  loading = false
}: OTPStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white rounded-xl shadow-xl w-full max-w-sm sm:max-w-md md:max-w-md lg:max-w-md p-6 sm:p-8 md:p-8 lg:p-8 text-left"
    >
      <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-green-100 p-2 sm:p-3 rounded-full">
            <Mail className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 text-green-600" />
          </div>
          <h2 className="text-lg sm:text-xl md:text-xl font-semibold text-gray-800">
            Email OTP Verification
          </h2>
        </div>

        <button
          onClick={onBack}
          className="text-gray-500 hover:text-green-700 flex items-center gap-1 text-sm bg-green-100 hover:bg-green-200 p-2 rounded-md cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
      </div>

      <div className="mb-2 pl-12 lg:pl-0 md:pl-0">
        <p className="text-[14px] text-gray-600">
          <span className=" font-medium"> Code Sent: </span><span className="text-green-600 italic font-normal underline tracking-wide">{email}</span>
        </p>
      </div>

      <p className="text-gray-600 mb-6 md:mb-6 text-base">
        We sent a 6-digit code to your email. Enter it below to verify.
      </p>

      <InputOTP
        maxLength={6}
        value={otp}
        onChange={onOtpChange}
        containerClassName="justify-center mb-4 sm:mb-6 md:mb-6 gap-2 sm:gap-3"
      >
        <InputOTPGroup className="gap-2 sm:gap-3 md:gap-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <InputOTPSlot
              key={i}
              index={i}
              className="w-12 h-12 md:w-12 md:h-12 text-base sm:text-lg md:text-lg border-2 rounded-lg"
            />
          ))}
        </InputOTPGroup>
      </InputOTP>

      {error && <p className="text-sm text-red-500 mb-4 text-center">{error}</p>}

      <Button
        className="w-full flex justify-center items-center gap-2 bg-black hover:bg-black/80 cursor-pointer text-sm sm:text-base md:text-base px-3 sm:px-4 md:px-4 py-2 sm:py-2.5 md:py-2.5"
        disabled={otp.length !== 6 || loading}
        onClick={onVerify}
      >
        {loading ? "Verifying..." : "Verify OTP"}
        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-4" />
      </Button>
    </motion.div>
  )
}
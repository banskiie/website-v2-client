"use client"

import { easeInOut, motion } from "framer-motion"
import { MessageCircle, Mail, User, ArrowRight, ArrowLeft, CheckCircle2Icon, XCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupTextarea } from "@/components/ui/input-group"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

interface AuthStepsProps {
  step: "start" | "email" | "sending-otp" | "otp" | "otp-success" | "name" | "chat"
  email: string
  setEmail: (email: string) => void
  isValid: boolean | null
  error: string | null
  loading: boolean
  verifying: boolean
  otp: string
  setOtp: (otp: string) => void
  name: string
  setName: (name: string) => void
  handleContinue: () => void
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleVerifyOtp: () => void
  handleNameSubmit: () => void
  handleBack: () => void
  setStep: (step: "start" | "email" | "sending-otp" | "otp" | "otp-success" | "name" | "chat") => void
}

const fadeTransition = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: { duration: 0.4, ease: easeInOut },
}

const PulsingIcon = ({ 
  icon: Icon, 
  className = "", 
  iconClassName = "", 
  pulseColor = "bg-green-400" 
}: { 
  icon: any
  className?: string
  iconClassName?: string
  pulseColor?: string
}) => (
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

export function AuthSteps({
  step,
  email,
  setEmail,
  isValid,
  error,
  loading,
  verifying,
  otp,
  setOtp,
  name,
  setName,
  handleContinue,
  handleEmailChange,
  handleVerifyOtp,
  handleNameSubmit,
  handleBack,
  setStep
}: AuthStepsProps) {
  return (
    <>
      {step === "start" && (
        <motion.div
          key="start"
          {...fadeTransition}
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
            Need assistance? Our support team is ready to chat with you in real-time.
          </p>

          <Button
            onClick={() => setStep("email")}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-medium px-4 sm:px-5 md:px-5 py-2 sm:py-2.5 md:py-2.5 rounded-md transition text-sm md:text-sm lg:text-sm cursor-pointer"
          >
            Start Chat
            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4" />
          </Button>
        </motion.div>
      )}

      {step === "email" && (
        <motion.div
          key="email"
          {...fadeTransition}
          className="bg-white rounded-xl shadow-xl w-full max-w-sm sm:max-w-md md:max-w-md lg:max-w-md p-6 sm:p-8 md:p-8 lg:p-8 text-center"
        >
          <div className="flex justify-center mb-4 sm:mb-5 md:mb-6">
            <div className="bg-green-100 p-3 sm:p-4 md:p-4 rounded-full aspect-square flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-20 md:h-20">
              <Mail className="w-6 h-6 sm:w-8 sm:h-8 md:w-8 md:h-8 text-green-600" />
            </div>
          </div>

          <h2 className="text-lg sm:text-xl md:text-xl font-semibold text-gray-800 mb-2">
            Enter your email
          </h2>
          <p className="text-sm md:text-sm lg:text-base text-gray-600 mb-6 px-2 sm:px-4">
            We'll send you a verification OTP code to confirm your identity.
          </p>

          <div className="mb-4">
            <InputGroup>
              <InputGroupInput
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={handleEmailChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    if (isValid) handleContinue()
                  }
                }}
                aria-invalid={isValid === false}
              />
              <InputGroupAddon align="inline-end">
                {isValid === null ? null : isValid ? (
                  <CheckCircle2Icon className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </InputGroupAddon>
            </InputGroup>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>

          <Button
            className="w-full flex justify-center items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-medium px-4 sm:px-5 py-2 sm:py-2.5 rounded-md text-sm md:text-sm lg:text-sm cursor-pointer"
            disabled={!isValid || loading}
            onClick={handleContinue}
          >
            Continue
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-4" />
          </Button>
        </motion.div>
      )}

      {step === "sending-otp" && (
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
      )}

      {/* OTP Step */}
      {step === "otp" && (
        <motion.div
          key="otp"
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
              onClick={handleBack}
              className="text-gray-500 hover:text-green-700 flex items-center gap-1 text-sm bg-green-100 hover:bg-green-200 p-2 rounded-md cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          <p className="text-gray-600 mb-6 md:mb-6 text-base">
            We sent a 6-digit code to your email. Enter it below to verify.
          </p>

          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
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

          <Button
            className="w-full flex justify-center items-center gap-2 bg-black hover:bg-black/80 cursor-pointer text-sm sm:text-base md:text-base px-3 sm:px-4 md:px-4 py-2 sm:py-2.5 md:py-2.5"
            disabled={otp.length !== 6 || verifying}
            onClick={handleVerifyOtp}
          >
            {verifying ? "Verifying..." : "Verify OTP"}
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-4" />
          </Button>
        </motion.div>
      )}

      {step === "otp-success" && (
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
      )}

      {step === "name" && (
        <motion.div
          key="name"
          {...fadeTransition}
          className="bg-white rounded-xl shadow-xl w-full max-w-sm sm:max-w-md md:max-w-md lg:max-w-md p-6 sm:p-7 md:p-8 text-left"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <PulsingIcon
                icon={User}
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
                iconClassName="w-5 h-5 sm:w-6 sm:h-6"
              />
              <h2 className="text-lg sm:text-xl md:text-xl font-semibold text-gray-800">
                What's your name?
              </h2>
            </div>
          </div>

          <p className="text-gray-600 mb-5 sm:mb-6 text-base">
            Please tell us your name so we know who we're chatting with.
          </p>

          <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
            Full Name
          </label>

          <InputGroup className="mb-4">
            <InputGroupInput
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) {
                  e.preventDefault()
                  handleNameSubmit()
                }
              }}
            />
          </InputGroup>

          <Button
            className="w-full flex justify-center items-center gap-2 bg-green-600 hover:bg-green-500 text-sm sm:text-base py-2 sm:py-2.5 md:py-3"
            disabled={!name.trim()}
            onClick={handleNameSubmit}
          >
            Start Chat
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </motion.div>
      )}
    </>
  )
}
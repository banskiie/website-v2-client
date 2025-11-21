import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"
import { Mail, ArrowRight, CheckCircle2Icon, XCircle } from "lucide-react"
import { emailValidator } from "@/components/custom/data/validator"
import { z } from "zod"

interface EmailStepProps {
  email: string
  isValid: boolean | null
  error: string | null
  pendingOtp: { email: string; active: boolean } | null
  onEmailChange: (email: string, isValid: boolean | null, error: string | null) => void
  onContinue: () => void
  onBack: () => void
  loading?: boolean
}

export default function EmailStep({
  email,
  isValid,
  error,
  pendingOtp,
  onEmailChange,
  onContinue,
  onBack,
  loading = false
}: EmailStepProps) {

  const handleEmailChange = (value: string) => {
    try {
      emailValidator.parse(value)
      onEmailChange(value, true, null)
    } catch (err) {
      if (err instanceof z.ZodError) {
        onEmailChange(value, false, err.issues[0]?.message || "Invalid email address.")
      } else {
        onEmailChange(value, false, "Invalid email address.")
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
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

      {pendingOtp?.active && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            OTP already sent to {pendingOtp.email}. Check your email or wait before requesting a new one.
          </p>
        </div>
      )}

      <div className="mb-4">
        <InputGroup>
          <InputGroupInput
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isValid) {
                e.preventDefault()
                onContinue()
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
        onClick={onContinue}
      >
        {loading ? "Sending..." : "Continue"}
        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-4" />
      </Button>
    </motion.div>
  )
}
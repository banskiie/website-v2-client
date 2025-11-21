import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import { Send, User } from "lucide-react"

interface NameStepProps {
  name: string
  onNameChange: (name: string) => void
  onSubmit: () => void
  onBack: () => void
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

export default function NameStep({
  name,
  onNameChange,
  onSubmit,
  onBack
}: NameStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
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
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) {
              e.preventDefault()
              onSubmit()
            }
          }}
        />
      </InputGroup>

      <Button
        className="w-full flex justify-center items-center gap-2 bg-green-600 hover:bg-green-500 text-sm sm:text-base py-2 sm:py-2.5 md:py-3"
        disabled={!name.trim()}
        onClick={onSubmit}
      >
        Start Chat
        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>
    </motion.div>
  )
}
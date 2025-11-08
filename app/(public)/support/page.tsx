"use client"

import { useState, ChangeEvent, useEffect, FormEvent } from "react"
import { motion, AnimatePresence, easeInOut } from "framer-motion"
import {
  Headphones,
  MessageCircle,
  ArrowRight,
  Mail,
  XCircle,
  User,
  Send,
  ArrowLeft,
  CheckCircle2Icon,
  LucideIcon,
  Inbox,
} from "lucide-react"
import Header from "@/components/custom/header-white"
import { Button } from "@/components/ui/button"
import { z } from "zod"
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { emailValidator } from "@/components/custom/data/validator"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useMutation } from "@apollo/client/react"
import { SEND_OTP, SEND_USER_MESSAGE, VERIFY_OTP } from "@/graphql/ticket/mutation"

type Message = {
  sender: "user" | "support"
  text: string
  time: string
  date: string
  status?: "seen" | "unread"
}

interface PulsingIconProps {
  icon: LucideIcon
  className?: string
  iconClassName?: string
  pulseColor?: string
}

export default function SupportPage() {
  const [introDone, setIntroDone] = useState(false)
  const [step, setStep] = useState<
    "start" | "email" | "sending-otp" | "otp" | "otp-success" | "name" | "chat"
  >("start")
  const [email, setEmail] = useState("")
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [otp, setOtp] = useState("")
  const [name, setName] = useState("")
  const [isReplying, setIsReplying] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [pendingOtp, setPendingOtp] = useState<{ email: string; active: boolean } | null>(null)
  const [sendUserMessageMutation, { loading: sendingMessage }] = useMutation(SEND_USER_MESSAGE, {
    onCompleted: (data: any) => {
      if (!data.sendUserMessage.ok) {
        setError(data.sendUserMessage.message);
      }
    },
    onError: (err: any) => {
      setError(err.message);
    },
  })

  const [sendOTP, { loading }] = useMutation(SEND_OTP, {
    onCompleted: (data: any) => {
      if (data.sendOTP.ok) {
        setPendingOtp({ email: "", active: false })
        // Show sending animation for 2 seconds before showing OTP
        setTimeout(() => setStep("otp"), 2000)
        setError(null)
      } else {
        setError(data.sendOTP.message)
      }
    },
    onError: (err: any) => {
      console.log("sendOTP error:", err)

      const pendingOtpError = err.graphQLErrors?.find(
        (e: any) => e.extensions?.code === "PENDING_OTP"
      )

      if (pendingOtpError) {
        setPendingOtp({ email, active: true })
        setError(null)
        setStep("email")
      } else {
        setPendingOtp({ email: "", active: false })
        setError(err.message)
      }
    },
  })

  const [verifyOTP, { loading: verifying }] = useMutation(VERIFY_OTP, {
    onCompleted: (data: any) => {
      if (data.verifyOTP.ok) {
        setStep("otp-success")
        // Show success animation for 2 seconds before going to name
        setTimeout(() => setStep("name"), 2000)
      } else {
        setError(data.verifyOTP.message)
      }
    },
    onError: (err: any) => {
      setError(err.message);
    },
  })

  // --- INTRO ANIMATION HANDLER ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setIntroDone(true)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  const handleContinue = () => {
    if (!isValid) return
    console.log("Sending OTP to:", email)
    setStep("sending-otp")
    sendOTP({ variables: { email } })
  }

  const handleGoToVerifyOtp = () => {
    setStep("otp");
    setError(null);
  }

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const now = new Date()
    const formattedTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    const formattedDate = now.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })

    const messageText = inputMessage.trim()

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: messageText,
        time: formattedTime,
        date: formattedDate,
        status: "unread" as const,
      },
    ])
    setInputMessage("")

    try {
      await sendUserMessageMutation({
        variables: { email, message: messageText },
      })

      setMessages((prev) =>
        prev.map((m) => (m.sender === "user" && m.status === "unread" ? { ...m, status: "seen" } : m))
      )

    } catch (err) {
      console.error(err)
    }

    setIsReplying(true)
    setTimeout(() => {
      setIsReplying(false)
      const replyNow = new Date()
      const replyTime = replyNow.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      const replyDate = replyNow.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })

      setMessages((prev) => [
        ...prev,
        {
          sender: "support",
          text: "Thanks for your message! Our team will get back to you shortly.",
          time: replyTime,
          date: replyDate,
          status: "unread" as const,
        },
      ])
    }, 1800)
  }

  useEffect(() => {
    const chat = document.getElementById("chat-container")
    if (chat) chat.scrollTop = chat.scrollHeight
  }, [messages, isReplying])

  useEffect(() => {
    if (step === "chat" && messages.length === 0) {
      const now = new Date()
      const formattedTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
      const fomrattedDate = now.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      })

      setMessages([
        {
          sender: "support",
          text: `Hello ${name}! How can we assist you today?`,
          time: formattedTime,
          date: fomrattedDate,
          status: "unread",
        },
      ])
    }
  }, [step])

  const handleDownloadChat = () => {
    if (messages.length === 0) return
    const chatText = messages
      .map(
        (msg) =>
          `[${msg.date} ${msg.time}] ${msg.sender === "user" ? "You" : "Support"}: ${msg.text}`
      )
      .join("\n")
    const blob = new Blob([chatText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `chat_${new Date().toISOString()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    try {
      emailValidator.parse(value)
      setIsValid(true)
      setError(null)
    } catch (err) {
      setIsValid(false)
      if (err instanceof z.ZodError) {
        setError(err.issues[0]?.message || "Invalid email address.")
      }
    }
  }

  const handleVerifyOtp = () => {
    if (otp.length !== 6) return
    setError(null)
    verifyOTP({ variables: { email, code: otp } })
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return

      if (step === "otp" && otp.length === 6) {
        e.preventDefault()
        handleVerifyOtp()
      }

      if (step === "name" && name.trim()) {
        e.preventDefault()
        setStep("chat")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [step, isValid, otp, name])

  const handleBack = () => {
    if (step === "email") setStep("start")
    else if (step === "sending-otp") setStep("email")
    else if (step === "otp") setStep("email")
    else if (step === "otp-success") setStep("otp")
    else if (step === "name") setStep("otp-success")
    else if (step === "chat") setStep("name")
  }

  const fadeTransition = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
    transition: { duration: 0.4, ease: easeInOut },
  }

  const pulseAnimation = {
    animate: {
      scale: [1, 1.5, 1],
      opacity: [0.6, 0, 0.6],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: easeInOut,
    },
  }

  const PulsingIcon = ({ icon: Icon, className = "", iconClassName = "", pulseColor = "bg-green-400" }: PulsingIconProps) => (
    <div className={`relative aspect-square ${className}`}>
      <motion.div
        {...pulseAnimation}
        className={`absolute inset-0 rounded-full ${pulseColor}`}
      />
      <div className="relative bg-green-100 p-3 rounded-full shadow-xl aspect-square flex items-center justify-center">
        <Icon className={`text-green-600 ${iconClassName}`} />
      </div>
    </div>
  )

  const LargePulsingIcon = ({ icon: Icon, className = "", iconClassName = "", pulseColor = "bg-green-400" }: PulsingIconProps) => (
    <div className={`relative aspect-square ${className}`}>
      <motion.div
        {...pulseAnimation}
        className={`absolute inset-0 rounded-full ${pulseColor}`}
      />
      <div className="relative bg-green-100 p-10 rounded-full shadow-xl aspect-square flex items-center justify-center">
        <Icon className={`text-green-600 ${iconClassName}`} />
      </div>
    </div>
  )

  // --- INTRO ANIMATION ---
  if (!introDone) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#eef3ff] to-[#e2e8ff] relative overflow-hidden">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="relative flex items-center justify-center"
        >
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 border-[3px] border-green-400 rounded-full"
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
            <LargePulsingIcon icon={MessageCircle} className="w-32 h-32" iconClassName="w-10 h-10" />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2.5 }}
          className="text-3xl font-semibold text-gray-800 mt-10"
        >
          Welcome to <span className="text-green-600">C-ONE</span> Live Support
        </motion.h1>
      </div>
    )
  }

  // --- MAIN CONTENT ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#eef3ff] to-[#e2e8ff] relative overflow-hidden">
      <Header />

      <AnimatePresence mode="wait">
        {step === "start" && (
          <motion.div
            key="start"
            {...fadeTransition}
            className="bg-white rounded-2xl shadow-lg p-10 max-w-lg w-full text-center"
          >
            <div className="flex justify-center mb-5">
              <PulsingIcon
                icon={MessageCircle}
                className="w-20 h-20"
                iconClassName="w-8 h-8"
              />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">
              Welcome to Live Support
            </h1>
            <p className="text-gray-600 mb-6">
              Need assistance? Our support team is ready to chat with you in real-time.
            </p>
            <Button
              onClick={() => setStep("email")}
              className="inline-flex cursor-pointer items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-medium px-5 py-2 rounded-md transition"
            >
              Start Chat
              <MessageCircle className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === "email" && (
          <motion.div
            key="email"
            {...fadeTransition}
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full aspect-square flex items-center justify-center w-20 h-20">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Enter your email
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
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
                      e.preventDefault();
                      if (isValid) {
                        handleContinue()
                      }
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
              className="w-full cursor-pointer flex justify-center items-center gap-2 bg-green-600 hover:bg-green-500"
              disabled={!isValid || loading}
              onClick={handleContinue}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === "sending-otp" && (
          <motion.div
            key="sending-otp"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 text-center"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="bg-green-100 p-4 rounded-full aspect-square flex items-center justify-center w-20 h-20"
              >
                <Mail className="w-8 h-8 text-green-600" />
              </motion.div>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Sending OTP...
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
              We're sending a verification code to
            </p>
            <p className="text-green-600 font-medium mb-6">
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
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === "otp" && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 text-left"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-full">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
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

            <p className="text-gray-600 mb-6 text-sm">
              We sent a 6-digit code to your email. Enter it below to verify.
            </p>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              containerClassName="justify-center mb-6 gap-3"
            >
              <InputOTPGroup className="gap-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="w-12 h-12 text-lg border-2 rounded-lg"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <Button
              className="w-full flex justify-center items-center gap-2 bg-black hover:bg-black/80 cursor-pointer"
              disabled={otp.length !== 6 || verifying}
              onClick={handleVerifyOtp}
            >
              {verifying ? "Verifying..." : "Verify OTP"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
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
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 text-center"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="bg-green-100 p-6 rounded-full"
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
                  <CheckCircle2Icon className="w-12 h-12 text-green-600" />
                </motion.div>
              </motion.div>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-semibold text-gray-800 mb-4"
            >
              Verification Successful!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-600 mb-2"
            >
              Taking you to the Input your name now...
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex justify-center mt-4"
            >
              <div className="flex gap-1">
                <motion.div
                  className="w-2 h-2 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === "name" && (
          <motion.div
            key="name"
            {...fadeTransition}
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 text-left"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <PulsingIcon
                  icon={User}
                  className="w-16 h-16"
                  iconClassName="w-6 h-6"
                />
                <h2 className="text-xl font-semibold text-gray-800">
                  What's your name?
                </h2>
              </div>
              <button
                onClick={handleBack}
                className="text-gray-500 hover:text-green-700 flex items-center gap-1 text-sm bg-green-100 hover:bg-green-200 p-2 rounded-md cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            <p className="text-gray-600 mb-6 text-sm">
              Please tell us your name so we know who we're chatting with.
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <InputGroup className="mb-4">
              <InputGroupInput
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </InputGroup>
            <Button
              className="w-full flex justify-center items-center gap-2 bg-green-600 hover:bg-green-500"
              disabled={!name.trim()}
              onClick={() => setStep("chat")}
            >
              Start Chat
              <Send className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === "chat" && (
          <motion.div
            key="chat"
            {...fadeTransition}
            className="bg-white rounded-2xl shadow-lg max-w-2xl w-full flex flex-col h-[600px] overflow-hidden"
          >
            <div className="bg-linear-to-r from-green-600 to-green-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                    <Headphones className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Live Support</h2>
                    <p className="text-sm text-white/80">{name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBack}
                    className="text-white/80 hover:text-white flex items-center gap-1 text-sm bg-white/20 hover:bg-white/30 p-2 rounded-md cursor-pointer backdrop-blur-sm transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDownloadChat}
                    className="text-white/80 hover:text-white flex items-center gap-1 text-sm bg-white/20 hover:bg-white/30 p-2 rounded-md cursor-pointer backdrop-blur-sm transition-all"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <div
                id="chat-container"
                className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-300"
              >
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div>
                      <div className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} mb-1`}>
                        <div className={`text-[11px] font-semibold mb-1 ${msg.sender === "user" ? "text-green-800 text-right" : "text-gray-500 text-left"}`}>
                          {msg.sender === "user" ? name : "Agent"}
                        </div>
                      </div>
                      <div className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} mb-2`}>
                        <div
                          className={`inline-block max-w-full px-4 py-2 rounded-2xl text-sm wrap-break-words ${msg.sender === "user"
                            ? "bg-green-600 text-white rounded-br-none"
                            : "bg-gray-100 text-gray-800 rounded-bl-none"
                            }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                      <div
                        className={`text-[11px] mt-1 flex items-center gap-2 ${msg.sender === "user"
                          ? "justify-end text-gray-300"
                          : "justify-start text-gray-400"
                          }`}
                      >
                        <div>{msg.time}</div>
                        {msg.sender === "user" && (
                          <div className={`${msg.status === "seen" ? "text-green-500" : "text-gray-400"}`}>
                            {msg.status === "seen" ? "• Seen" : "• Delivered"}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isReplying && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl rounded-bl-none max-w-xs sm:max-w-sm text-sm flex gap-1 items-center">
                      <motion.span
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <motion.span
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2, ease: "easeInOut" }}
                      />
                      <motion.span
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4, ease: "easeInOut" }}
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t p-4">
                <InputGroup className="flex-1">
                  <InputGroupTextarea
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(e as unknown as FormEvent)
                      }
                    }}
                    className="px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 max-h-32 overflow-y-auto"
                    rows={1}
                  />
                </InputGroup>

                <Button
                  type="submit"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-md"
                >
                  <Send className="w-4 h-4" />
                  Send
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
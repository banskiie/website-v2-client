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

type Message = {
  sender: "user" | "support"
  text: string
  time: string
  date: string
  status?: "seen" | "unread"
}


export default function SupportPage() {
  const [step, setStep] = useState<
    "start" | "email" | "otp" | "otp-success" | "name" | "chat"
  >("start")
  const [email, setEmail] = useState("")
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [otp, setOtp] = useState("")
  const [name, setName] = useState("")
  const [isReplying, setIsReplying] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    // time only
    // const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    const now = new Date()
    const formattedTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    const formattedDate = now.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })

    // i add ang user's message
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: inputMessage.trim(),
        time: formattedTime,
        date: formattedDate,
        status: "unread" as const,
      },
    ])
    setInputMessage("")

    // replying animation
    setIsReplying(true)

    setTimeout(() => {
      setIsReplying(false)
      const replyNow = new Date()
      const replyTime = replyNow.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      const replyDate = replyNow.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })

      setMessages((prev) => [
        ...prev.map((m) =>
          m.sender === "user" ? { ...m, status: "seen" as const } : m
        ),
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
    // readable text format
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
  // Test
  const handleVerifyOtp = () => {
    if (otp === "123456") {
      setStep("otp-success")
      setTimeout(() => setStep("name"), 1500)
    } else {
      alert("Invalid OTP. Please check your email for the correct code.")
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return
      if (step === "email" && isValid) setStep("otp")
      if (step === "otp" && otp.length === 6) handleVerifyOtp()
      if (step === "name" && name.trim()) setStep("chat")
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [step, isValid, otp, name])

  const handleBack = () => {
    if (step === "email") setStep("start")
    else if (step === "otp") setStep("email")
    else if (step === "name") setStep("otp")
    else if (step === "chat") setStep("name")
  }

  const fadeTransition = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
    transition: { duration: 0.4, ease: easeInOut },
  }

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
              <div className="bg-green-100 p-4 rounded-full">
                <Headphones className="w-8 h-8 text-green-600" />
              </div>
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
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 text-left"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-full">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Verify Your Email
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
              Enter your email address to continue to chat.
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <InputGroup className="mb-2">
              <InputGroupInput
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={handleEmailChange}
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
            {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
            <Button
              className="w-full cursor-pointer flex justify-center items-center gap-2 bg-gray-800 hover:bg-gray-700"
              disabled={!isValid}
              onClick={() => setStep("otp")}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === "otp" && (
          <motion.div
            key="otp"
            {...fadeTransition}
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
              disabled={otp.length !== 6}
              onClick={handleVerifyOtp}
            >
              Verify OTP
              <ArrowRight className="w-4 h-4" />
            </Button>
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
                <div className="bg-green-100 p-3 rounded-full">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  What’s your name?
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
              Please tell us your name so we know who we’re chatting with.
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
            className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 max-w-2xl w-full flex flex-col h-[600px]"
          >
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h2 className="text-xl font-semibold text-gray-800">Hi {name}!</h2>
              <button
                onClick={handleBack}
                className="text-gray-500 hover:text-green-700 flex items-center gap-1 text-sm bg-green-100 hover:bg-green-200 p-2 rounded-md cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownloadChat}
                className="text-gray-500 hover:text-green-700 flex items-center gap-1 text-sm bg-green-100 hover:bg-green-200 p-2 rounded-md cursor-pointer"
              >
                Download
              </button>
            </div>

            <div
              id="chat-container"
              className="flex-1 overflow-y-auto pr-2 mb-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300"
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

            <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t pt-3">
              <InputGroup className="flex-1">
                <InputGroupTextarea
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 max-h-32 overflow-y-auto" // max height + scroll
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
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

// "use client"

// import { FormEvent, useState, useEffect, useRef } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import { Button } from "../ui/button"
// import { Input } from "../ui/input"
// import { useLazyQuery } from "@apollo/client/react"
// import { MessageCircle, ChevronLeft, Minus, Send, Ticket, CheckCircle } from "lucide-react"
// import Image from "next/image"
// import { CHECK_ENTRY } from "@/graphql/entries/queries"
// import { CheckEntryData } from "@/app/(public)/types/entry.interface"
// import { emailValidator } from "./data/validator"
// import z from "zod"

// export default function FloatingChatWidget() {
//   const [open, setOpen] = useState(false)
//   const [email, setEmail] = useState("")
//   const [errors, setErrors] = useState<{ email?: string }>({})
//   const [otp, setOtp] = useState("")
//   const [otpSent, setOtpSent] = useState(false)
//   const [otpVerified, setOtpVerified] = useState(false)
//   const [showOtpSuccess, setShowOtpSuccess] = useState(false)
//   const [otpInput, setOtpInput] = useState(["", "", "", "", "", ""])
//   const [verifiedEntry, setVerifiedEntry] = useState<any>(null)
//   const [ticketCreated, setTicketCreated] = useState(false)
//   const [selectedTicketType, setSelectedTicketType] = useState("")
//   const [message, setMessage] = useState("")
//   const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean; timestamp: Date }>>([])
//   const [ticketNumber, setTicketNumber] = useState("")

//   const messagesEndRef = useRef<HTMLDivElement>(null)
//   const chatContainerRef = useRef<HTMLDivElement>(null)

//   const [checkEntry, { loading }] = useLazyQuery<CheckEntryData>(CHECK_ENTRY)

//   const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()
//   const generateTicketNumber = () => `TKT-${Date.now().toString().slice(-6)}`

//   const ticketTypes = [
//     "Technical Issue",
//     "Billing Problem",
//     "General Inquiry",
//     "Feature Request",
//     "Bug Report",
//     "Other"
//   ]

//   useEffect(() => {
//     if (otpVerified) {
//       setShowOtpSuccess(true)
//       const timer = setTimeout(() => {
//         setShowOtpSuccess(false)
//       }, 2000)
//       return () => clearTimeout(timer)
//     }
//   }, [otpVerified])

//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
//     }
//   }, [messages])

//   const handleSubmit = async (e?: FormEvent) => {
//     if (e) e.preventDefault()
//     setErrors({})

//     try {
//       emailValidator.parse(email)

//       const generatedOtp = generateOTP()
//       setOtp(generatedOtp)
//       console.log("Generated OTP:", generatedOtp)
//       console.log("Email to send OTP:", email)
//       setOtpSent(true)
//     } catch (err) {
//       if (err instanceof z.ZodError) {
//         const message = err.issues[0]?.message ?? "Please enter a valid email address."
//         setErrors({ email: message })
//       } else {
//         console.error("Unexpected error:", err)
//         setErrors({ email: "Something went wrong. Please try again." })
//       }
//     }
//   }

//   const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
//     const newOtpInput = [...otpInput]
//     newOtpInput[index] = e.target.value
//     setOtpInput(newOtpInput)

//     if (e.target.value && index < otpInput.length - 1) {
//       const nextInput = document.getElementById(`otp-input-${index + 1}`) as HTMLInputElement
//       nextInput?.focus()
//     }
//   }

//   const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
//     if (e.key === 'Backspace') {
//       e.preventDefault()

//       const newOtpInput = [...otpInput]

//       if (!newOtpInput[index] && index > 0) {
//         const prevInput = document.getElementById(`otp-input-${index - 1}`) as HTMLInputElement
//         prevInput?.focus()
//       }
//       else if (newOtpInput[index]) {
//         newOtpInput[index] = ""
//         setOtpInput(newOtpInput)
//       }
//     }

//     if (e.key === 'ArrowLeft' && index > 0) {
//       e.preventDefault()
//       const prevInput = document.getElementById(`otp-input-${index - 1}`) as HTMLInputElement
//       prevInput?.focus()
//     }

//     if (e.key === 'ArrowRight' && index < otpInput.length - 1) {
//       e.preventDefault()
//       const nextInput = document.getElementById(`otp-input-${index + 1}`) as HTMLInputElement
//       nextInput?.focus()
//     }
//   }

//   const handleOtpKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') {
//       e.preventDefault()
//       handleOtpSubmit()
//     }
//   }

//   const handleOtpSubmit = () => {
//     const enteredOtp = otpInput.join("")
//     if (enteredOtp === otp) {
//       setOtpVerified(true)
//     } else {
//       setErrors({
//         email: "Invalid OTP. Please try again.",
//       })
//     }
//   }

//   const handleCreateTicket = () => {
//     const newTicketNumber = generateTicketNumber()
//     setTicketNumber(newTicketNumber)

//     // Add personalized welcome message
//     const welcomeMessage = `Welcome! Your ticket has been created with number: ${newTicketNumber}. How can we help you today?`

//     setMessages([
//       {
//         text: welcomeMessage,
//         isUser: false,
//         timestamp: new Date()
//       }
//     ])
//     setTicketCreated(true)
//   }

//   const handleSendMessage = () => {
//     if (message.trim()) {
//       const newMessage = {
//         text: message,
//         isUser: true,
//         timestamp: new Date()
//       }
//       setMessages(prev => [...prev, newMessage])
//       setMessage("")

//       // Auto-reply after 1 second
//       setTimeout(() => {
//         setMessages(prev => [
//           ...prev,
//           {
//             text: "Thank you for your message. Our support team will get back to you shortly.",
//             isUser: false,
//             timestamp: new Date()
//           }
//         ])
//       }, 1000)
//     }
//   }

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault()
//       handleSendMessage()
//     }
//   }

//   const containerVariants = {
//     closed: { width: 56, height: 56, borderRadius: "50%" },
//     open: { width: "90%", maxWidth: 370, height: "70vh", borderRadius: "1rem" },
//   }

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial="closed"
//         animate={open ? "open" : "closed"}
//         variants={containerVariants}
//         transition={{ type: "spring", stiffness: 200, damping: 25 }}
//         className="fixed bottom-6 right-6 z-50 bg-white shadow-xl flex flex-col overflow-hidden"
//       >
//         {!open && (
//           <Button
//             size="icon"
//             className="w-full h-full rounded-full bg-black text-white"
//             onClick={() => setOpen(true)}
//           >
//             <MessageCircle className="!h-7 !w-7 text-white" />
//           </Button>
//         )}

//         {open && (
//           <motion.div
//             className="flex flex-col h-full"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.3 }}
//           >
//             <div className="flex justify-between items-center bg-green-600 text-white px-4 py-2">
//               <div className="flex items-center bg-white h-10 w-10 rounded-full p-1">
//                 <Image
//                   src="/assets/c-one-logo.png"
//                   alt="C-One Logo"
//                   width={37}
//                   height={37}
//                   className="object-contain"
//                 />
//               </div>

//               <Button size="icon" className="bg-transparent text-white" onClick={() => setOpen(false)}>
//                 <Minus className="h-6 w-6" />
//               </Button>
//             </div>

//             <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
//               {!ticketCreated ? (
//                 <>
//                   {!otpSent ? (
//                     <>
//                       <p className="font-semibold text-gray-800">Hi There!</p>
//                       <p className="text-gray-600 text-sm">
//                         We are delighted to help you. Please submit your concerns or problems here in the ticket.
//                       </p>

//                       <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-gray-700 mb-2">
//                         <p className="font-medium mb-1">Instructions:</p>
//                         <ul className="list-disc list-inside space-y-1">
//                           <li>
//                             Enter your <strong>email address</strong> to receive a verification code and continue.
//                           </li>
//                         </ul>
//                       </div>

//                       <form onSubmit={handleSubmit} className="space-y-3">
//                         <div>
//                           <Input
//                             type="input"
//                             placeholder="Enter your email address"
//                             value={email}
//                             onChange={(e) => {
//                               setEmail(e.target.value)
//                               if (errors.email) {
//                                 setErrors(prev => ({ ...prev, email: undefined }))
//                               }
//                             }}
//                             className={`transition-colors ${errors.email
//                               ? "border-red-500 focus-visible:ring-red-500 bg-red-50"
//                               : "border-gray-300"
//                               }`}
//                           />
//                           {errors.email && (
//                             <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
//                               <span>•</span>
//                               {errors.email}
//                             </p>
//                           )}
//                         </div>

//                         <Button
//                           type="submit"
//                           className="w-full bg-gradient-to-r from-lime-400 to-green-600 text-white hover:from-lime-500 hover:to-green-700 transition-all"
//                           disabled={loading}
//                         >
//                           {loading ? "Sending OTP..." : "Send Verification Code"}
//                         </Button>
//                       </form>
//                     </>
//                   ) : !otpVerified ? (
//                     <>
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         className="text-gray-600 hover:bg-gray-100 self-start"
//                         onClick={() => setOtpSent(false)}
//                       >
//                         <ChevronLeft className="h-5 w-5" />
//                       </Button>

//                       <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-gray-700 mb-2">
//                         <p className="font-medium mb-1">Instructions:</p>
//                         <ul className="list-disc list-inside space-y-1">
//                           <li>Enter the 6-digit verification code sent to your email address.</li>
//                           <li>The code is valid for 10 minutes.</li>
//                           <li>You can press Enter to submit the code.</li>
//                         </ul>
//                       </div>

//                       <p className="font-semibold text-gray-800">Enter the verification code sent to {email}:</p>
//                       <div className="flex gap-2 justify-center">
//                         {otpInput.map((digit, index) => (
//                           <input
//                             key={index}
//                             id={`otp-input-${index}`}
//                             type="text"
//                             maxLength={1}
//                             value={digit}
//                             onChange={(e) => handleOtpChange(e, index)}
//                             onKeyDown={(e) => handleOtpKeyDown(e, index)}
//                             onKeyPress={handleOtpKeyPress}
//                             className={`w-10 h-10 text-center border-2 rounded-md focus:outline-none transition-colors ${errors.email
//                               ? "border-red-500 bg-red-50"
//                               : "border-gray-300 focus:border-green-500"
//                               }`}
//                           />
//                         ))}
//                       </div>
//                       {errors.email && (
//                         <p className="text-red-500 text-xs text-center flex items-center justify-center gap-1">
//                           <span>•</span>
//                           {errors.email}
//                         </p>
//                       )}

//                       <Button
//                         onClick={handleOtpSubmit}
//                         className="w-full bg-gradient-to-r from-lime-400 to-green-600 text-white hover:from-lime-500 hover:to-green-700 transition-all"
//                       >
//                         Verify Code
//                       </Button>
//                     </>
//                   ) : (
//                     <>
//                       <AnimatePresence>
//                         {showOtpSuccess && (
//                           <motion.div
//                             initial={{ opacity: 0, scale: 0.8 }}
//                             animate={{ opacity: 1, scale: 1 }}
//                             exit={{ opacity: 0, scale: 0.8 }}
//                             transition={{ duration: 0.5 }}
//                             className="flex-1 flex flex-col items-center justify-center"
//                           >
//                             <motion.div
//                               initial={{ scale: 0 }}
//                               animate={{ scale: 1 }}
//                               transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
//                               className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4"
//                             >
//                               <CheckCircle className="h-10 w-10 text-green-600" />
//                             </motion.div>
//                             <motion.p
//                               initial={{ opacity: 0, y: 10 }}
//                               animate={{ opacity: 1, y: 0 }}
//                               transition={{ delay: 0.3 }}
//                               className="font-semibold text-green-800 text-xl text-center mb-2"
//                             >
//                               Email Verified Successfully!
//                             </motion.p>
//                             <motion.p
//                               initial={{ opacity: 0 }}
//                               animate={{ opacity: 1 }}
//                               transition={{ delay: 0.4 }}
//                               className="text-green-600 text-sm text-center"
//                             >
//                               Redirecting to ticket creation...
//                             </motion.p>
//                           </motion.div>
//                         )}
//                       </AnimatePresence>

//                       {!showOtpSuccess && (
//                         <motion.div
//                           initial={{ opacity: 0, y: 20 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ duration: 0.5 }}
//                           className="space-y-4"
//                         >
//                           <div className="text-center">
//                             <p className="font-semibold text-gray-800">Create Support Ticket</p>
//                             <p className="text-gray-600 text-sm">Please select the type of issue you're experiencing</p>
//                           </div>

//                           <div className="space-y-3">
//                             <label className="text-sm font-medium text-gray-700">
//                               Select Ticket Type:
//                             </label>
//                             <select
//                               value={selectedTicketType}
//                               onChange={(e) => setSelectedTicketType(e.target.value)}
//                               className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//                             >
//                               <option value="">Select a ticket type...</option>
//                               {ticketTypes.map((type) => (
//                                 <option key={type} value={type}>
//                                   {type}
//                                 </option>
//                               ))}
//                             </select>

//                             <Button
//                               onClick={handleCreateTicket}
//                               disabled={!selectedTicketType}
//                               className="w-full bg-gradient-to-r from-green-500 to-purple-600 text-white hover:from-green-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                             >
//                               <Ticket className="h-4 w-4 mr-2" />
//                               Create New Ticket
//                             </Button>
//                           </div>
//                         </motion.div>
//                       )}
//                     </>
//                   )}
//                 </>
//               ) : (
//                 <div className="flex flex-col h-full">
//                   {/* Ticket Info */}
//                   <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
//                     <p className="text-sm font-medium text-green-800">
//                       Ticket Number: <span className="font-bold">{ticketNumber}</span>
//                     </p>
//                     {selectedTicketType && (
//                       <p className="text-sm text-green-700 mt-1">
//                         Type: <span className="font-medium">{selectedTicketType}</span>
//                       </p>
//                     )}
//                   </div>

//                   <div
//                     ref={chatContainerRef}
//                     className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 min-h-0"
//                     style={{
//                       maxHeight: 'calc(100% - 120px)',
//                       scrollBehavior: 'smooth'
//                     }}
//                   >
//                     {messages.map((msg, index) => (
//                       <div
//                         key={index}
//                         className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
//                       >
//                         <div
//                           className={`max-w-[80%] rounded-lg p-3 ${msg.isUser
//                             ? 'bg-green-500 text-white rounded-br-none'
//                             : 'bg-gray-100 text-gray-800 rounded-bl-none'
//                             }`}
//                         >
//                           <p className="text-sm">{msg.text}</p>
//                           <p className={`text-xs mt-1 ${msg.isUser ? 'text-green-100' : 'text-gray-500'}`}>
//                             {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                     <div ref={messagesEndRef} />
//                   </div>

//                   <div className="flex gap-2 mt-auto">
//                     <Input
//                       placeholder="Type your message..."
//                       value={message}
//                       onChange={(e) => setMessage(e.target.value)}
//                       onKeyPress={handleKeyPress}
//                       className="flex-1"
//                     />
//                     <Button
//                       onClick={handleSendMessage}
//                       disabled={!message.trim()}
//                       className="bg-linear-to-r from-lime-400 to-green-600 text-white hover:from-lime-500 hover:to-green-700"
//                     >
//                       <Send className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </motion.div>
//         )}
//       </motion.div>
//     </AnimatePresence>
//   )
// }


"use client"

import { useState } from "react"
import Link from "next/link"
import { MessageCircle, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function TicketFloatingHelp() {
  const [open, setOpen] = useState(false)

  const toggleHelp = () => setOpen((prev) => !prev)
  const closeHelp = () => setOpen(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      <button
        onClick={toggleHelp}
        onMouseEnter={() => setOpen(true)}
        className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-105"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Modal / Tooltip */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 bg-white border border-gray-200 shadow-xl rounded-2xl p-4 w-64 text-sm"
            onMouseLeave={closeHelp}
          >
            <div className="flex justify-between items-start">
              <p className="text-gray-700">
                Having an issue with your ticket? Visit our{" "}
                <Link
                  href="/support"
                  className="text-green-600 font-semibold hover:underline"
                >
                  support page
                </Link>{" "}
                for help.
              </p>
              <button onClick={closeHelp} className="ml-2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 text-right">
              <Link
                href="/support"
                className="inline-block bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md"
              >
                Go to Support
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


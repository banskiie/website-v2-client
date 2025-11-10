"use client"

import { useState, ChangeEvent, useEffect, FormEvent, useRef, JSX } from "react"
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
import { useMutation, useQuery, useSubscription } from "@apollo/client/react"
import { ADD_TICKET_NAME, GET_TICKET_MESSAGES, NEW_MESSAGE_SUBSCRIPTION, SEND_OTP, SEND_USER_MESSAGE, VERIFY_OTP } from "@/graphql/ticket/mutation"
import { differenceInMinutes, format } from "date-fns"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

type Message = {
  sender: "user" | "support"
  text: string
  time: string
  date: string
  timestamp?: number
  status?: "seen" | "unread"
  senderName?: string
  showSender?: boolean
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
  const [ticketId, setTicketId] = useState<string | null>(null)
  const [pendingOtp, setPendingOtp] = useState<{ email: string; active: boolean } | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [lastUserMessageTime, setLastUserMessageTime] = useState<number | null>(null)
  const [showLoadMoreText, setShowLoadMoreText] = useState(false)
  const [autoResponseShown, setAutoResponseShown] = useState(false)
  const autoResponseTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [first, setFirst] = useState(15)
  const [userJustSentMessage, setUserJustSentMessage] = useState(false)
  const { data: ticketData, loading: ticketLoading } = useQuery<TicketResponse>(GET_TICKET_MESSAGES, {
    variables: {
      id: ticketId,
      first: first
    },
    skip: !ticketId,
    fetchPolicy: "network-only",

  })

  useEffect(() => {
    if (ticketData?.ticket?.total) {
      setIsLoadingMore(false)
      if (ticketData.ticket.total <= first) {
        setHasMore(false)
      } else {
        setHasMore(true)
      }
    }
  }, [ticketData, first])

  useEffect(() => {
    if (ticketData?.ticket?.conversation) {
      const formattedMessages = ticketData.ticket.conversation.map((msg) => {
        const date = new Date(Number(msg.timestamp))
        const formattedTime = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        const formattedDate = date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })

        const sender: "support" | "user" = msg.sender === "SUPPORT" ? "support" : "user"
        const senderName = sender === "support"
          ? (msg.agent?.name || "Agent")
          : name

        return {
          sender,
          text: msg.message,
          time: formattedTime,
          date: formattedDate,
          timestamp: Number(msg.timestamp),
          status: "unread" as const,
          senderName
        }
      })

      const chatContainer = chatContainerRef.current

      if (chatContainer && isLoadingMore) {
        const previousScrollHeight = chatContainer.scrollHeight
        const previousScrollTop = chatContainer.scrollTop

        setMessages(formattedMessages.reverse())

        setTimeout(() => {
          if (chatContainer) {
            const newScrollHeight = chatContainer.scrollHeight
            const scrollDifference = newScrollHeight - previousScrollHeight
            chatContainer.scrollTop = previousScrollTop + scrollDifference
            setIsLoadingMore(false)
          }
        }, 0)
      } else {
        setMessages(formattedMessages.reverse())
      }
    }
  }, [ticketData, name, isLoadingMore])

  const handleLoadMore = () => {
    if (ticketLoading || isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    setFirst(prevFirst => prevFirst + 15)
  }

  useEffect(() => {
    const chat = chatContainerRef.current
    if (chat) {

      const isAtBottom = chat.scrollHeight - chat.scrollTop - chat.clientHeight < 100

      if (userJustSentMessage ||
        (messages.length > 0 && isAtBottom && !isLoadingMore) ||
        (step === "chat" && messages.length <= 1)) {
        chat.scrollTop = chat.scrollHeight
        setUserJustSentMessage(false)
      }
    }
  }, [messages, isReplying, isLoadingMore, userJustSentMessage, step])

  useEffect(() => {
    const chatContainer = chatContainerRef.current
    if (!chatContainer || !hasMore || ticketLoading || isLoadingMore) return

    let isThrottled = false
    const throttleDelay = 100

    const handleScroll = () => {
      if (isThrottled) return

      isThrottled = true
      setTimeout(() => {
        isThrottled = false
      }, throttleDelay)

      const { scrollTop } = chatContainer

      const shouldShowLoadMore = scrollTop < 200 && hasMore && !isLoadingMore
      setShowLoadMoreText(shouldShowLoadMore)

      if (scrollTop < 50 && hasMore && !isLoadingMore) {
        console.log('Triggering load more...')
        handleLoadMore()
      }
    }

    chatContainer.addEventListener('scroll', handleScroll, { passive: true })
    return () => chatContainer.removeEventListener('scroll', handleScroll)
  }, [hasMore, ticketLoading, isLoadingMore, handleLoadMore])


  const groupMessageBlocks = (messages: Message[]) => {
    const blocks: {
      sender: "user" | "support"
      messages: Message[]
      senderName: string
      time: string
      status?: "seen" | "unread"
    }[] = []

    if (messages.length === 0) return blocks

    let currentBlock = {
      sender: messages[0].sender,
      messages: [messages[0]],
      senderName: messages[0].senderName || (messages[0].sender === "user" ? name : "Agent"),
      time: messages[0].time,
      status: messages[0].status
    }

    for (let i = 1; i < messages.length; i++) {
      const currentMessage = messages[i]
      const prevMessage = messages[i - 1]

      const currentTime = new Date(`${currentMessage.date} ${currentMessage.time}`).getTime()
      const prevTime = new Date(`${prevMessage.date} ${prevMessage.time}`).getTime()
      const timeDiff = Math.abs(currentTime - prevTime) / (1000 * 60)

      const shouldContinueBlock =
        currentMessage.sender === currentBlock.sender &&
        timeDiff <= 5 &&
        (currentMessage.sender !== "support" || currentMessage.senderName === currentBlock.senderName)

      if (shouldContinueBlock) {
        currentBlock.messages.push(currentMessage)
        currentBlock.time = currentMessage.time
        currentBlock.status = currentMessage.status
      } else {
        blocks.push(currentBlock)
        currentBlock = {
          sender: currentMessage.sender,
          messages: [currentMessage],
          senderName: currentMessage.senderName || (currentMessage.sender === "user" ? name : "Agent"),
          time: currentMessage.time,
          status: currentMessage.status
        }
      }
    }

    blocks.push(currentBlock)
    return blocks
  }

  // Old Design ni siya
  // const renderMessagesWithTimestamps = (messages: Message[]) => {
  //   if (messages.length === 0) return null

  //   const groupedBlocks = groupMessageBlocks(messages)
  //   const elements: JSX.Element[] = []

  //   groupedBlocks.forEach((block, blockIndex) => {
  //     if (blockIndex > 0) {
  //       const currentBlockFirstMessage = block.messages[0]
  //       const previousBlockLastMessage = groupedBlocks[blockIndex - 1].messages[
  //         groupedBlocks[blockIndex - 1].messages.length - 1
  //       ]

  //       if (currentBlockFirstMessage.timestamp && previousBlockLastMessage.timestamp) {
  //         const timeDifference = differenceInMinutes(
  //           new Date(currentBlockFirstMessage.timestamp),
  //           new Date(previousBlockLastMessage.timestamp)
  //         )

  //         if (timeDifference > 5) {
  //           elements.push(
  //             <div key={`timestamp-${currentBlockFirstMessage.timestamp}`} className="w-full flex justify-center my-4">
  //               <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
  //                 {format(new Date(currentBlockFirstMessage.timestamp), "MMM d, yyyy 'at' h:mm a")}
  //               </span>
  //             </div>
  //           )
  //         }
  //       }
  //     }

  //     elements.push(
  //       <motion.div
  //         key={blockIndex}
  //         initial={{ opacity: 0, y: 10 }}
  //         animate={{ opacity: 1, y: 0 }}
  //         transition={{ duration: 0.3 }}
  //         className={`flex ${block.sender === "user" ? "justify-end" : "justify-start"}`}
  //       >
  //         <div className="max-w-[80%]">
  //           <div className={`flex ${block.sender === "user" ? "justify-end" : "justify-start"} mb-1`}>
  //             <div className={`text-[11px] font-semibold mb-1 ${block.sender === "user" ? "text-green-800 text-right" : "text-gray-500 text-left"}`}>
  //               {block.senderName}
  //             </div>
  //           </div>

  //           <div className="space-y-1">
  //             {block.messages.map((msg, msgIndex) => (
  //               <HoverCard key={msgIndex} openDelay={200} closeDelay={200}>
  //                 <HoverCardTrigger asChild>
  //                   <div
  //                     className={`flex ${block.sender === "user" ? "justify-end" : "justify-start"} cursor-pointer`}
  //                   >
  //                     <div
  //                       className={`inline-block px-4 py-2 rounded-2xl text-sm wrap-break-words whitespace-pre-wrap max-w-full ${block.sender === "user"
  //                         ? "bg-green-600 text-white rounded-br-none hover:bg-green-700 transition-colors"
  //                         : "bg-gray-100 text-gray-800 rounded-bl-none hover:bg-gray-200 transition-colors"
  //                         }`}
  //                       style={{
  //                         wordBreak: 'break-word',
  //                         overflowWrap: 'break-word'
  //                       }}
  //                     >
  //                       {msg.text}
  //                     </div>
  //                   </div>
  //                 </HoverCardTrigger>
  //                 <HoverCardContent
  //                   className="w-64 p-3 text-sm"
  //                   side={block.sender === "user" ? "left" : "right"}
  //                   align="center"
  //                 >
  //                   <div className="space-y-2">
  //                     <div className="flex justify-between items-center">
  //                       <span className="font-medium text-gray-500">Date:</span>
  //                       <span className="text-gray-800">{msg.date}</span>
  //                     </div>
  //                     <div className="flex justify-between items-center">
  //                       <span className="font-medium text-gray-500">Time:</span>
  //                       <span className="text-gray-800">{msg.time}</span>
  //                     </div>
  //                     <div className="flex justify-between items-center">
  //                       <span className="font-medium text-gray-500">Sent by:</span>
  //                       <span className={`font-medium ${block.sender === "user" ? "text-green-600" : "text-blue-600"}`}>
  //                         {msg.senderName || (block.sender === "user" ? name : "Agent")}
  //                       </span>
  //                     </div>
  //                     {/* {msg.timestamp && (
  //                       <div className="pt-2 border-t border-gray-200">
  //                         <div className="flex justify-between items-center text-xs">
  //                           <span className="text-gray-500">Full timestamp:</span>
  //                           <span className="text-gray-600">
  //                             {format(new Date(msg.timestamp), "MMM d, yyyy 'at' h:mm:ss a")}
  //                           </span>
  //                         </div>
  //                       </div>
  //                     )} */}
  //                   </div>
  //                 </HoverCardContent>
  //               </HoverCard>
  //             ))}
  //           </div>

  //           <div
  //             className={`text-[11px] mt-1 flex items-center gap-2 ${block.sender === "user"
  //               ? "justify-end text-gray-300"
  //               : "justify-start text-gray-400"
  //               } ${block.sender === "user" ? "flex-row" : "flex-row-reverse"}`}
  //           >
  //             <div
  //               className={`${block.sender === "user"
  //                 ? block.status === "seen"
  //                   ? "text-green-500"
  //                   : "text-gray-400"
  //                 : block.status === "seen"
  //                   ? "text-blue-500"
  //                   : "text-gray-500"
  //                 }`}
  //             >
  //               {block.status === "seen" ? "Seen" : "Delivered"}
  //             </div>

  //             <div>{block.time}</div>
  //           </div>
  //         </div>
  //       </motion.div>
  //     )
  //   })

  //   return elements
  // }

  const renderMessagesWithTimestamps = (messages: Message[]) => {
    if (messages.length === 0) return null

    const groupedBlocks = groupMessageBlocks(messages)
    const elements: JSX.Element[] = []

    groupedBlocks.forEach((block, blockIndex) => {
      if (blockIndex > 0) {
        const currentBlockFirstMessage = block.messages[0]
        const previousBlockLastMessage = groupedBlocks[blockIndex - 1].messages[
          groupedBlocks[blockIndex - 1].messages.length - 1
        ]

        if (currentBlockFirstMessage.timestamp && previousBlockLastMessage.timestamp) {
          const timeDifference = differenceInMinutes(
            new Date(currentBlockFirstMessage.timestamp),
            new Date(previousBlockLastMessage.timestamp)
          )

          if (timeDifference > 5) {
            elements.push(
              <div key={`timestamp-${currentBlockFirstMessage.timestamp}`} className="w-full flex justify-center my-4">
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {format(new Date(currentBlockFirstMessage.timestamp), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
            )
          }
        }
      }

      elements.push(
        <motion.div
          key={blockIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`flex ${block.sender === "user" ? "justify-end" : "justify-start"}`}
        >
          <div className="max-w-[80%]">
            <div className={`flex ${block.sender === "user" ? "justify-end" : "justify-start"} mb-1`}>
              <div className={`text-[11px] font-semibold mb-1 ${block.sender === "user" ? "text-green-800 text-right" : "text-gray-500 text-left"}`}>
                {block.senderName}
              </div>
            </div>

            <div className="space-y-1">
              {block.messages.map((msg, msgIndex) => (
                <HoverCard key={msgIndex}>
                  <HoverCardTrigger asChild>
                    <div
                      className={`flex ${block.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`inline-block px-4 py-2 rounded-2xl text-sm wrap-break-words whitespace-pre-wrap max-w-full ${block.sender === "user"
                          ? "bg-green-600 text-white rounded-br-none"
                          : "bg-gray-100 text-gray-800 rounded-bl-none"
                          }`}
                        style={{
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word'
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent
                    className="w-auto p-3 bg-white/95 backdrop-blur-sm border shadow-lg"
                    align={block.sender === "user" ? "end" : "start"}
                    side="bottom"
                    sideOffset={5}
                  >
                    <div className="space-y-2 min-w-[180px]">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${block.sender === "user" ? "bg-green-500" : "bg-blue-500"}`} />
                        <span className="text-xs font-medium text-gray-700">
                          {block.sender === "user" ? "You" : "Support"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs text-gray-500">Date & Time:</span>
                          <span className="text-xs font-medium text-gray-800">
                            {msg.timestamp
                              ? format(new Date(msg.timestamp), "MMM dd, h:mm a")
                              : `${msg.date}, ${msg.time}`
                            }
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs text-gray-500">Sent by:</span>
                          <span className={`text-xs font-medium ${block.sender === "user" ? "text-green-600" : "text-blue-600"}`}>
                            {block.sender === "user" ? name : (msg.senderName || "Agent")}
                          </span>
                        </div>
                      </div>

                      {msg.timestamp && (
                        <div className="pt-1 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-400">Full:</span>
                            <span className="text-[10px] text-gray-500">
                              {format(new Date(msg.timestamp), "MMM dd, yyyy 'at' h:mm:ss a")}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))}
            </div>

            <div
              className={`text-[11px] mt-1 flex items-center gap-2 ${block.sender === "user"
                ? "justify-end text-gray-300"
                : "justify-start text-gray-400"
                } ${block.sender === "user" ? "flex-row" : "flex-row-reverse"}`}
            >
              <div
                className={`${block.sender === "user"
                  ? block.status === "seen"
                    ? "text-green-500"
                    : "text-gray-400"
                  : block.status === "seen"
                    ? "text-blue-500"
                    : "text-gray-500"
                  }`}
              >
                {block.status === "seen" ? "Seen" : "Delivered"}
              </div>

              <div>{block.time}</div>
            </div>
          </div>
        </motion.div>
      )
    })

    return elements
  }

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

  // Load messages and user info from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("chat_messages")
    const savedName = localStorage.getItem("chat_name")
    const savedEmail = localStorage.getItem("chat_email")
    const savedStep = localStorage.getItem("chat_step")

    if (savedMessages) setMessages(JSON.parse(savedMessages))
    if (savedName) setName(savedName)
    if (savedEmail) setEmail(savedEmail)
    if (savedStep) setStep(savedStep as typeof step)
  }, [])

  useEffect(() => {
    localStorage.setItem("chat_messages", JSON.stringify(messages))
    localStorage.setItem("chat_name", name)
    localStorage.setItem("chat_email", email)
    localStorage.setItem("chat_step", step)
  }, [messages, name, email, step])

  useEffect(() => {
    if (autoResponseTimeoutRef.current) {
      clearTimeout(autoResponseTimeoutRef.current)
    }

    if (lastUserMessageTime && !autoResponseShown) {
      const timeSinceLastUserMessage = Date.now() - lastUserMessageTime
      const timeUntilAutoResponse = Math.max(10000 - timeSinceLastUserMessage, 0)

      autoResponseTimeoutRef.current = setTimeout(() => {
        showAutoResponse()
      }, timeUntilAutoResponse)
    }

    return () => {
      if (autoResponseTimeoutRef.current) {
        clearTimeout(autoResponseTimeoutRef.current)
      }
    }
  }, [lastUserMessageTime, autoResponseShown, messages])

  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.sender === "support") {
      setLastUserMessageTime(null)
      setAutoResponseShown(false)

      // Clear the timeout since agent responded
      if (autoResponseTimeoutRef.current) {
        clearTimeout(autoResponseTimeoutRef.current)
      }
    }
  }, [messages])

  const showAutoResponse = () => {
    if (autoResponseShown) return

    const now = new Date()
    const formattedTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    const formattedDate = now.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })

    setMessages((prev) => [
      ...prev,
      {
        sender: "support",
        text: "Thanks for your message! Our team will get back to you shortly.",
        time: formattedTime,
        date: formattedDate,
        timestamp: now.getTime(),
        status: "unread",
        senderName: "Agent",
      },
    ])

    setAutoResponseShown(true)
  }

  const handleClearChat = () => {
    localStorage.removeItem("chat_messages")
    localStorage.removeItem("chat_name")
    localStorage.removeItem("chat_email")
    localStorage.removeItem("chat_step")
    setMessages([])
    setName("")
    setEmail("")
    setStep("start")
    setLastUserMessageTime(null)
    setAutoResponseShown(false)

    if (autoResponseTimeoutRef.current) {
      clearTimeout(autoResponseTimeoutRef.current)
    }
  }

  const { data: subscriptionData } = useSubscription<NewMessagePayload>(NEW_MESSAGE_SUBSCRIPTION, {
    variables: { id: ticketId },
    skip: !ticketId,
  })

  useEffect(() => {
    if (!subscriptionData?.newMessage?.latestMessage) return

    const msg = subscriptionData.newMessage.latestMessage
    console.log('New message received from subscription:', msg)

    const date = new Date(Number(msg.timestamp))
    const formattedTime = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    const formattedDate = date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })

    const sender = msg.sender === "SUPPORT" ? "support" : "user"

    let senderName = "Agent"
    if (sender === "support") {
      if (msg.agent?.name) {
        senderName = msg.agent.name
      }
    } else {
      senderName = name
    }

    setMessages((prev) => [
      ...prev,
      {
        sender,
        text: msg.message,
        time: formattedTime,
        date: formattedDate,
        timestamp: Number(msg.timestamp),
        status: "unread",
        senderName,
      },
    ])

  }, [subscriptionData, name])

  useEffect(() => {
    console.log('=== DEBUG INFO ===');
    console.log('Current ticketId:', ticketId);
    console.log('Current step:', step);
    console.log('Subscription data:', subscriptionData);
    console.log('Messages count:', messages.length);
    console.log('Messages:', messages);
    console.log('Last user message time:', lastUserMessageTime);
    console.log('Auto response shown:', autoResponseShown);
    console.log('==================');
  }, [ticketId, step, subscriptionData, messages, lastUserMessageTime, autoResponseShown])

  const [verifyOTP, { loading: verifying }] = useMutation(VERIFY_OTP, {
    onCompleted: (data: any) => {
      console.log('=== VERIFY OTP RESPONSE ===');
      console.log('Full response data:', data);
      console.log('verifyOTP.ok:', data.verifyOTP.ok);
      console.log('verifyOTP.message:', data.verifyOTP.message);
      console.log('verifyOTP.ticket:', data.verifyOTP.ticket);

      if (data.verifyOTP.ok) {
        const { ticket } = data.verifyOTP;
        console.log('Ticket object:', ticket);
        console.log('Ticket _id:', ticket?._id);
        console.log('Ticket name:', ticket?.name);
        console.log('Ticket email:', ticket?.email);

        if (ticket?._id) {
          setTicketId(ticket._id);
          console.log('Ticket ID set to state:', ticket._id)
        } else {
          console.log('No ticket _id found in response')
        }

        // Check if name already exists
        if (ticket?.name && ticket.name.trim() !== "") {
          console.log('Name exists, going directly to chat');
          setName(ticket.name)
          setStep("otp-success")
          setTimeout(() => setStep("chat"), 2000)
        } else {
          console.log('No name found, going to name input step');
          setStep("otp-success");
          setTimeout(() => setStep("name"), 2000)
        }
      } else {
        console.log('OTP verification failed');
        setError(data.verifyOTP.message)
      }
      console.log('========================');
    },
    onError: (err: any) => {
      console.log('=== VERIFY OTP ERROR ===');
      console.log('Error:', err);
      console.log('GraphQL Errors:', err.graphQLErrors);
      console.log('Network Error:', err.networkError);
      console.log('========================');
      setError(err.message)
    },
  })

  const [addTicketName] = useMutation(ADD_TICKET_NAME, {
    onCompleted: (data: any) => {
      if (data.addTicketUserName.ok) {
        setStep("chat");
      } else {
        setError(data.addTicketUserName.message);
      }
    },
    onError: (err: any) => {
      setError(err.message);
    },
  })

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

    const messageText = inputMessage.trim()
    setInputMessage("")

    setUserJustSentMessage(true)

    setLastUserMessageTime(Date.now());
    setAutoResponseShown(false);

    try {
      await sendUserMessageMutation({
        variables: { email, message: messageText },
      })
    } catch (err) {
      console.error(err)
    }
  }

  const handleNameSubmit = async () => {
    if (!name.trim()) return;

    try {
      await addTicketName({
        variables: { email, name: name.trim() },
      })
    } catch (err) {
      console.error(err)
      setStep("chat")
    }
  }

  useEffect(() => {
    if (step === "chat" && messages.length === 0) {
      const now = new Date()
      const formattedTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
      const formattedDate = now.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      })

      setMessages([
        {
          sender: "support",
          text: `Hello ${name}! How can we assist you today?`,
          time: formattedTime,
          date: formattedDate,
          timestamp: now.getTime(),
          status: "unread",
        },
      ])
    }
  }, [step, name])

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
        handleNameSubmit()
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

  if (!introDone) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#eef3ff] to-[#e2e8ff] relative overflow-hidden px-4">
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#eef3ff] to-[#e2e8ff] relative overflow-hidden">
      <Header />

      <AnimatePresence mode="wait">
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
      </AnimatePresence>

      <AnimatePresence mode="wait">
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
      </AnimatePresence>

      <AnimatePresence mode="wait">
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
      </AnimatePresence>

      <AnimatePresence mode="wait">
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
      </AnimatePresence>

      <AnimatePresence mode="wait">
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
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === "chat" && (
          <motion.div
            key="chat"
            {...fadeTransition}
            className="bg-white md:rounded-2xl lg:rounded-2xl shadow-lg max-w-full md:max-w-2xl lg:max-w-2xl w-full flex flex-col h-[94vh] mt-15 md:h-[700px] lg:h-[700px] overflow-x-hidden"
          >
            <div className="bg-linear-to-r from-green-600 to-green-500 p-6 text-white shrink-0">
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

                  {/* <button
                    onClick={handleDownloadChat}
                    className="text-white/80 hover:text-white flex items-center gap-1 text-sm bg-white/20 hover:bg-white/30 p-2 rounded-md cursor-pointer backdrop-blur-sm transition-all"
                  >
                    Download
                  </button> */}

                  <button
                    onClick={handleClearChat}
                    className="text-white hover:text-white flex items-center gap-1 text-sm bg-white/20 hover:bg-white/30 p-2 rounded-md cursor-pointer backdrop-blur-sm transition-all"
                  >
                    New Chat
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              <div
                ref={chatContainerRef}
                id="chat-container"
                className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-300"
              >

                {showLoadMoreText && hasMore && !isLoadingMore && (
                  <div className="flex justify-center py-2">
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <motion.div
                        className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Loading older messages...
                    </div>
                  </div>
                )}

                {!hasMore && messages.length > 0 && (
                  <div className="flex justify-center py-2">
                    <div className="text-gray-400 text-sm">
                      No more messages to load
                    </div>
                  </div>
                )}

                {/* {groupMessageBlocks(messages).map((block, blockIndex) => (
                  <motion.div
                    key={blockIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${block.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-[80%]">
                      <div className={`flex ${block.sender === "user" ? "justify-end" : "justify-start"} mb-1`}>
                        <div className={`text-[11px] font-semibold mb-1 ${block.sender === "user" ? "text-green-800 text-right" : "text-gray-500 text-left"}`}>
                          {block.senderName}
                        </div>
                      </div>

                      <div className="space-y-1">
                        {block.messages.map((msg, msgIndex) => (
                          <div
                            key={msgIndex}
                            className={`flex ${block.sender === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`inline-block px-4 py-2 rounded-2xl text-sm wrap-break-words whitespace-pre-wrap max-w-full ${block.sender === "user"
                                ? "bg-green-600 text-white rounded-br-none"
                                : "bg-gray-100 text-gray-800 rounded-bl-none"
                                }`}
                              style={{
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word'
                              }}
                            >
                              {msg.text}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div
                        className={`text-[11px] mt-1 flex items-center gap-2 ${block.sender === "user" ? "justify-end text-gray-300" : "justify-start text-gray-400"
                          }`}
                      >
                        <div>{block.time}</div>
                        {block.sender === "user" && (
                          <div
                            className={`${block.status === "seen" ? "text-green-500" : "text-gray-400"}`}
                          >
                            {block.status === "seen" ? "• Seen" : "• Delivered"}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))} */}

                {renderMessagesWithTimestamps(messages)}

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
                    className="px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 max-h-32 overflow-y-auto resize-none"
                    rows={1}
                    style={{
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word'
                    }}
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
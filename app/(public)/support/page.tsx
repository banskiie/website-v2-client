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
  ArrowDown,
  Paperclip,
  ImageIcon,
  File,
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
import Image from "next/image"
import { Dialog, DialogClose, DialogContent, DialogOverlay, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type Message = {
  sender: "user" | "support"
  text: string
  time: string
  date: string
  timestamp?: number
  status?: "seen" | "unread"
  senderName?: string
  readBy?: string[]
  showSender?: boolean
  attachment?: {
    type: string
    url: string | null
  }
}

interface PulsingIconProps {
  icon: LucideIcon
  className?: string
  iconClassName?: string
  pulseColor?: string
}

interface TicketResponse {
  ticket: {
    conversation: Array<{
      message: string
      sender: "USER" | "SUPPORT"
      timestamp: string
      readBy: string[]
      agent?: {
        name: string
      }
      attachment?: {
        type: string
        url: string | null
      }
    }>
    total: number
  }
}

interface NewMessagePayload {
  newMessage: {
    latestMessage: {
      message: string
      sender: "USER" | "SUPPORT"
      timestamp: string
      agent?: {
        name: string
      }
      attachment?: {
        type: string
        url: string | null
      }
      readBy: string[]
    }
  }
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [ticketId, setTicketId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("chat_ticketId")
    }
    return null
  })
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
  const [hasNewMessages, setHasNewMessages] = useState(false)
  const [lastSeenMessageIndex, setLastSeenMessageIndex] = useState(-1)
  const [isUserAtBottom, setIsUserAtBottom] = useState(true)
  const [isRecovering, setIsRecovering] = useState(true)
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({})

  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null)
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false)

  const updateTicketId = (id: string | null) => {
    setTicketId(id)
    if (id) {
      localStorage.setItem("chat_ticketId", id)
    } else {
      localStorage.removeItem("chat_ticketId")
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setAttachmentPreview(e.target?.result as string)
          setAttachmentFile(file)
          setIsAttachmentMenuOpen(false)
        }
        reader.readAsDataURL(file)
      } else {
        setAttachmentFile(file)
        setIsAttachmentMenuOpen(false)
      }
    }
  }

  const handleRemoveAttachment = () => {
    setAttachmentPreview(null)
    setAttachmentFile(null)
    const fileInput = document.getElementById('file-input') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  useEffect(() => {
    const savedMessages = localStorage.getItem("chat_messages")
    const savedName = localStorage.getItem("chat_name")
    const savedEmail = localStorage.getItem("chat_email")
    const savedStep = localStorage.getItem("chat_step")
    const savedTicketId = localStorage.getItem("chat_ticketId")

    if (savedMessages) setMessages(JSON.parse(savedMessages))
    if (savedName) setName(savedName)
    if (savedEmail) setEmail(savedEmail)
    if (savedStep) setStep(savedStep as typeof step)
    if (savedTicketId) updateTicketId(savedTicketId)

    setIsRecovering(false)
  }, [])

  useEffect(() => {
    if (!isRecovering && ticketId) {
      const savedName = localStorage.getItem("chat_name")
      const savedEmail = localStorage.getItem("chat_email")

      if (savedEmail) setEmail(savedEmail)

      if (savedName && savedName.trim() !== "" && step !== "chat") {
        setName(savedName)
        setStep("chat")
      } else if ((!savedName || savedName.trim() === "") && step !== "name" && step !== "chat") {
        setStep("name")
      }
    }
  }, [ticketId, step, isRecovering])

  useEffect(() => {
    localStorage.setItem("chat_messages", JSON.stringify(messages))
    localStorage.setItem("chat_name", name)
    localStorage.setItem("chat_email", email)
    localStorage.setItem("chat_step", step)
  }, [messages, name, email, step])

  const { data: ticketData, loading: ticketLoading } = useQuery<TicketResponse>(GET_TICKET_MESSAGES, {
    variables: {
      id: ticketId,
      first: first
    },
    skip: !ticketId,
    fetchPolicy: "network-only",

  })

  useEffect(() => {
    const chatContainer = chatContainerRef.current
    if (!chatContainer) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
      setIsUserAtBottom(isAtBottom)

      if (isAtBottom && hasNewMessages) {
        setHasNewMessages(false)
        setLastSeenMessageIndex(messages.length - 1)
      }
    }

    chatContainer.addEventListener('scroll', handleScroll)
    return () => chatContainer.removeEventListener('scroll', handleScroll)
  }, [messages, hasNewMessages])

  useEffect(() => {
    if (messages.length === 0) return

    const lastMessage = messages[messages.length - 1]
    const isNewSupportMessage = lastMessage.sender === "support" &&
      messages.length - 1 > lastSeenMessageIndex

    if (isNewSupportMessage && !isUserAtBottom) {
      setHasNewMessages(true)
    } else if (isUserAtBottom) {
      setLastSeenMessageIndex(messages.length - 1)
      setHasNewMessages(false)
    }
  }, [messages, isUserAtBottom, lastSeenMessageIndex])

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const chatContainer = chatContainerRef.current
    if (chatContainer) {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: behavior
      })
      setHasNewMessages(false)
      setLastSeenMessageIndex(messages.length - 1)
      setIsUserAtBottom(true)
    }
  }

  // const showWelcomeMessage = () => {
  //   const now = new Date()
  //   const formattedTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  //   const formattedDate = now.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })

  //   setMessages((prev) => [
  //     ...prev,
  //     {
  //       sender: "support",
  //       text: "Welcome to C-ONE Chat Live Support! Send your messages here regarding your concerns in the Current Tournament. We will reply to you as soon as possible. Thank you.",
  //       time: formattedTime,
  //       date: formattedDate,
  //       timestamp: now.getTime(),
  //       status: "unread",
  //       senderName: "Agent",
  //     },
  //   ])
  // }

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
        const senderName = sender === "support" ? "Agent" : name
        const status: "seen" | "unread" = msg.readBy && msg.readBy.length > 0 ? "seen" : "unread"
        return {
          sender,
          text: msg.message,
          time: formattedTime,
          date: formattedDate,
          timestamp: Number(msg.timestamp),
          status: status,
          senderName,
          readBy: msg.readBy,
          attachment: msg.attachment
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

        if (!isLoadingMore && chatContainer) {
          setTimeout(() => {
            scrollToBottom('auto')
          }, 100)
        }
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
    if (!chat) return

    const isAtBottom = chat.scrollHeight - chat.scrollTop - chat.clientHeight < 100

    setIsUserAtBottom(isAtBottom)

    const shouldAutoScroll =
      userJustSentMessage ||
      (isAtBottom && !isLoadingMore) ||
      (step === "chat" && messages.length <= 1) ||
      (isAtBottom && messages.length > 0)

    if (shouldAutoScroll) {
      setTimeout(() => {
        if (chat) {
          chat.scrollTop = chat.scrollHeight
          setUserJustSentMessage(false)
          setIsUserAtBottom(true)
          setHasNewMessages(false)
          setLastSeenMessageIndex(messages.length - 1)
        }
      }, 100)
    }
  }, [messages, isReplying, isLoadingMore, userJustSentMessage, step])

  useEffect(() => {
    const chatContainer = chatContainerRef.current
    if (!chatContainer) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100

      setIsUserAtBottom(isAtBottom)

      if (isAtBottom && hasNewMessages) {
        setHasNewMessages(false)
        setLastSeenMessageIndex(messages.length - 1)
      }

      const shouldShowLoadMore = scrollTop < 200 && hasMore && !isLoadingMore
      setShowLoadMoreText(shouldShowLoadMore)

      if (scrollTop < 50 && hasMore && !isLoadingMore && !ticketLoading) {
        handleLoadMore()
      }
    }

    chatContainer.addEventListener('scroll', handleScroll, { passive: true })

    setTimeout(() => {
      handleScroll()
    }, 500)

    return () => chatContainer.removeEventListener('scroll', handleScroll)
  }, [messages, hasNewMessages, hasMore, isLoadingMore, ticketLoading, handleLoadMore])

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
        if (currentBlock.sender === "support" && currentMessage.status === "seen") {
          currentBlock.status = "seen"
        }
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
              {block.messages.map((msg, msgIndex) => {
                const dialogKey = `${blockIndex}-${msgIndex}`;
                const isDialogOpen = openDialogs[dialogKey] || false;

                const imageContent = (
                  <div>
                    <Dialog
                      open={isDialogOpen}
                      onOpenChange={(open) => setOpenDialogs(prev => ({
                        ...prev,
                        [dialogKey]: open
                      }))}
                    >
                      <DialogTrigger asChild>
                        <div className={`
                        relative overflow-hidden cursor-pointer group
                        rounded-2xl
                        ${block.sender === "user" ? "rounded-br-md" : "rounded-bl-md"}
                        border border-gray-200
                        shadow-sm
                        hover:shadow-md transition-all duration-200
                        bg-transparent
                      `}>
                          <div className="relative overflow-hidden rounded-2xl">
                            <Image
                              src={msg.attachment?.url || ''}
                              alt="Attachment"
                              width={500}
                              height={500}
                              className={`
                              object-cover w-full
                              max-w-[280px] max-h-[280px]
                              transition-transform duration-200
                              group-hover:scale-105
                              rounded-2xl
                            `}
                              onError={(e) => {
                                console.error('Image failed to load:', msg.attachment?.url);
                              }}
                            />

                            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-200 rounded-2xl pointer-events-none" />
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent
                        className="
                        max-w-4xl max-h-[90vh] p-0 border-none
                        bg-black/0
                        pointer-events-auto
                        [&>button]:hidden
                      "
                      >
                        <DialogTitle className="sr-only">
                          Image attachment from {block.senderName}
                        </DialogTitle>

                        <div className="relative w-full h-full flex items-center justify-center p-4">
                          <DialogClose asChild>
                            <Button
                              className="absolute -top-7 right-0 z-50 bg-transparent hover:bg-transparent hover:text-black text-white rounded-full p-2 transition-colors cursor-pointer border-none"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <XCircle className="w-9! h-9!" />
                            </Button>
                          </DialogClose>

                          <div className="relative max-w-full max-h-full flex items-center justify-center">
                            <Image
                              src={msg.attachment?.url || ''}
                              alt="Attachment preview"
                              width={1200}
                              height={1200}
                              className="max-w-full max-h-[80vh] object-contain rounded-lg"
                              onError={(e) => {
                                console.error('Image failed to load in modal:', msg.attachment?.url);
                              }}
                            />
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {(msg.text && msg.text.trim()) && (
                      <div className="mt-2">
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
                    )}
                  </div>
                );

                const hoverCardContent = (
                  <HoverCardContent
                    className="w-auto p-3 bg-white/95 backdrop-blur-sm border shadow-lg"
                    align={block.sender === "user" ? "end" : "start"}
                    side="bottom"
                    sideOffset={2}
                  >
                    <div className="space-y-2 min-w-[180px]">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${block.sender === "user" ? "bg-green-500" : "bg-blue-500"}`} />
                        <span className="text-xs font-medium text-gray-700">
                          {block.sender === "user" ? "You" : "Agent"}
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
                            {block.sender === "user" ? name : "Agent"}
                          </span>
                        </div>

                        {msg.attachment && (
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-xs text-gray-500">Attachment:</span>
                            <span className="text-xs font-medium text-gray-800">
                              {msg.attachment.type}
                            </span>
                          </div>
                        )}
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
                );

                return (
                  <div
                    key={msgIndex}
                    className={`flex ${block.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.attachment && msg.attachment.url && msg.attachment.type === "IMAGE" && (
                      isDialogOpen ? (
                        <div>{imageContent}</div>
                      ) : (
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <div className="inline-block">{imageContent}</div>
                          </HoverCardTrigger>
                          {hoverCardContent}
                        </HoverCard>
                      )
                    )}

                    {(msg.text && msg.text.trim()) && !(msg.attachment && msg.attachment.url && msg.attachment.type === "IMAGE") && (
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <div
                            className={`inline-block px-4 py-2 rounded-2xl text-sm wrap-break-words whitespace-pre-wrap max-w-full ${block.sender === "user"
                              ? "bg-green-600 text-white rounded-br-none"
                              : "bg-white border border-black/20 text-gray-800 rounded-bl-none"
                              }`}
                            style={{
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word'
                            }}
                          >
                            {msg.text}
                          </div>
                        </HoverCardTrigger>

                        <HoverCardContent
                          className="w-auto p-3 bg-white/95 backdrop-blur-sm border shadow-lg"
                          align={block.sender === "user" ? "end" : "start"}
                          side="bottom"
                          sideOffset={2}
                        >
                          <div className="space-y-2 min-w-[180px]">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${block.sender === "user" ? "bg-green-500" : "bg-blue-500"}`} />
                              <span className="text-xs font-medium text-gray-700">
                                {block.sender === "user" ? "You" : "Agent"}
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
                                  {block.sender === "user" ? name : "Agent"}
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
                    )}
                  </div>
                );
              })}
            </div>

            <div
              className={`text-[11px] flex mt-1 items-center gap-2 ${block.sender === "user"
                ? "justify-end text-gray-300"
                : "justify-start text-gray-400"
                } ${block.sender === "user" ? "flex-row" : "flex-row"}`}
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
        setTimeout(() => setStep("otp"), 2000)
        setError(null)
      } else {
        setError(data.sendOTP.message)
      }
    },
    onError: (err: any) => {
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
    localStorage.removeItem("chat_ticketId")
    setMessages([])
    setName("")
    setEmail("")
    setOtp("")
    setStep("start")
    updateTicketId(null)
    setLastUserMessageTime(null)
    setAutoResponseShown(false)
    setHasNewMessages(false)
    setLastSeenMessageIndex(-1)
    setIsUserAtBottom(true)
    setIsValid(null)
    setError(null)

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

    const date = new Date(Number(msg.timestamp))
    const formattedTime = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    const formattedDate = date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })

    const sender: "support" | "user" = msg.sender === "SUPPORT" ? "support" : "user"
    const senderName = sender === "support" ? "Agent" : name
    const status = msg.readBy && msg.readBy.length > 0 ? "seen" : "unread"

    const newMessage: Message = {
      sender,
      text: msg.message,
      time: formattedTime,
      date: formattedDate,
      timestamp: Number(msg.timestamp),
      status,
      senderName,
      readBy: msg.readBy,
      attachment: msg.attachment
    }

    setMessages((prev) => [...prev, newMessage])

    const chatContainer = chatContainerRef.current
    if (chatContainer) {
      const isAtBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 100
      if (isAtBottom) {
        setTimeout(() => {
          scrollToBottom('smooth')
        }, 100)
      }
    }
  }, [subscriptionData, name])

  useEffect(() => {
    if (step === "chat" && chatContainerRef.current && !isRecovering) {
      setTimeout(() => {
        scrollToBottom('auto')
      }, 300)
    }
  }, [step, isRecovering])


  const [verifyOTP, { loading: verifying }] = useMutation(VERIFY_OTP, {
    onCompleted: (data: any) => {
     
      if (data.verifyOTP.ok) {
        const { ticket } = data.verifyOTP;

        if (ticket?._id) {
          updateTicketId(ticket._id)
        } 

        if (ticket?.name && ticket.name.trim() !== "") {
          setName(ticket.name)
          setStep("chat")
        } else {
          setStep("name")
        }
      } else {
        setError(data.verifyOTP.message);
      }
    },
    onError: (err: any) => {
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

    if (!messageText && !attachmentFile) return

    setInputMessage("")

    setUserJustSentMessage(true)

    setLastUserMessageTime(Date.now());
    setAutoResponseShown(false);

    if (attachmentPreview || attachmentFile) {
      const now = new Date()
      const formattedTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      const formattedDate = now.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })

      const tempMessage: Message = {
        sender: "user",
        text: messageText,
        time: formattedTime,
        date: formattedDate,
        timestamp: now.getTime(),
        status: "unread",
        senderName: name,
        attachment: attachmentPreview ? {
          type: "IMAGE",
          url: attachmentPreview
        } : attachmentFile ? {
          type: "FILE",
          url: null
        } : undefined
      }

      setMessages(prev => [...prev, tempMessage])

      setAttachmentPreview(null)
      setAttachmentFile(null)
    }

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
          senderName: "Agent",
        },
      ])
    }
  }, [step, name])

  const handleDownloadChat = () => {
    if (messages.length === 0) return
    const chatText = messages
      .map(
        (msg) =>
          `[${msg.date} ${msg.time}] ${msg.sender === "user" ? "You" : "Agent"}: ${msg.text}`
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
    if (step === "email") {
      setStep("start")
      setEmail("")
      setIsValid(null)
    }
    else if (step === "sending-otp") setStep("email")
    else if (step === "otp") {
      setStep("email")
      setOtp("")
    }
    else if (step === "otp-success") {
      setStep("otp")
      setOtp("")
    }
    else if (step === "name") setStep("otp")
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

  if (isRecovering) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#eef3ff] to-[#e2e8ff] relative overflow-hidden px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Restoring your chat session...</p>
        </div>
      </div>
    )
  }

  if (!introDone) {
    return (
      // bg-linear-to-b from-[#eef3ff] to-[#e2e8ff] 
      <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-[#eef3ff] to-[#e2e8ff] relative overflow-hidden px-4">
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-[#eef3ff] to-[#e2e8ff] relative overflow-hidden">
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
            className="w-full h-screen flex pt-16"
          >
            {/* Sidebar Balik rako */}
            <div className="w-64 bg-linear-to-b from-green-50 to-emerald-50 border-r border-green-100 shrink-0 p-6 space-y-6">
              <div>
                <h3 className="text-green-900 font-semibold mb-2">C-ONE Chat Support</h3>
                <p className="text-xs text-green-700">Your support conversation</p>
              </div>

              <div className="h-px bg-green-200"></div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs text-green-600">Email</p>
                  <p className="text-sm text-green-900 font-medium">{email}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-green-600">Name</p>
                  <p className="text-sm text-green-900 font-medium">{name}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-green-600">Last Activity</p>
                  <p className="text-sm text-green-900">
                    {messages.length > 0
                      ? `${new Date(messages[messages.length - 1].timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : 'Just now'
                    }
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-green-600">Status</p>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                    Active
                  </div>
                </div>
              </div>

              <div className="h-px bg-green-200"></div>

              <div className="space-y-3">
                <p className="text-xs text-green-600">Quick Actions</p>
                <Button
                  onClick={handleClearChat}
                  className="w-full justify-start bg-green-600 hover:bg-green-700 text-white text-sm"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  New Chat
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-green-700 border-green-300 hover:bg-green-100 text-sm"
                  onClick={handleDownloadChat}
                >
                  <File className="w-4 h-4 mr-2" />
                  Download Chat
                </Button>
              </div>
            </div>

            {/* bg-linear-to-r from-green-600 to-green-500 */}
            <div className="flex-1 flex flex-col bg-white shadow-lg overflow-hidden">
              <div className="bg-white p-3 text-black shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-linear-to-r from-green-600 to-green-500 text-white p-3 rounded-full backdrop-blur-sm">
                      <Headphones className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base text-gray-900 font-semibold">Live Support</h2>
                      <p className="text-sm text-black/80">{name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-1 text-sm bg-green-600 hover:bg-green-700 text-white p-2 rounded-md cursor-pointer backdrop-blur-sm transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    {/* <button
                      onClick={handleClearChat}
                      className="flex items-center gap-1 text-sm bg-green-600 hover:bg-green-700 text-white p-2 rounded-md cursor-pointer backdrop-blur-sm transition-all"
                    >
                      New Chat
                    </button> */}
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col overflow-hidden bg-gray-100 relative">
                <AnimatePresence>
                  {hasNewMessages && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10"
                    >
                      <div className="bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-medium">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        New Message
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {!isUserAtBottom && (
                    <motion.button
                      animate={{
                        y: [0, -25, 0],
                        transition: {
                          duration: 1.8,
                          repeat: Infinity,
                          repeatType: "loop",
                          ease: "easeInOut",
                        },
                      }}
                      onClick={() => scrollToBottom('smooth')}
                      className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10 bg-green-600 hover:bg-green-500 text-white p-3 rounded-full shadow-lg transition-all duration-200 cursor-pointer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ArrowDown className="w-5 h-5" />
                    </motion.button>
                  )}
                </AnimatePresence>

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

                <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t p-4 bg-white relative">
                  <AnimatePresence>
                    {isAttachmentMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border p-2 z-10"
                      >
                        <div className="flex gap-2">
                          <label className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors">
                            <ImageIcon className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="hidden"
                              id="image-input"
                            />
                          </label>

                          <label className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors">
                            <File className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">File</span>
                            <input
                              type="file"
                              onChange={handleFileSelect}
                              className="hidden"
                              id="file-input"
                            />
                          </label>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {attachmentPreview && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-white border rounded-lg mx-4">
                      <div className="flex items-center gap-2">
                        <Image
                          src={attachmentPreview}
                          alt="Attachment preview"
                          width={48}
                          height={48}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium truncate">
                            {attachmentFile?.name || 'Image'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(attachmentFile?.size || 0) / 1024} KB
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={handleRemoveAttachment}
                          className="text-gray-500 hover:text-red-500 hover:bg-gray-200! bg-transparent transition-colors cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)}
                    className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-green-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

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
                      className="px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-10! max-h-32 overflow-y-auto resize-none"
                      rows={1}
                      style={{
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word'
                      }}
                    />
                  </InputGroup>

                  <Button
                    type="submit"
                    disabled={!inputMessage.trim() && !attachmentFile}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-5 rounded-md"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
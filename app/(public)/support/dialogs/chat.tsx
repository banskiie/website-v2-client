"use client"

import { useState, ChangeEvent, useEffect, FormEvent, useRef, JSX } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  ArrowDown,
  Paperclip,
  ImageIcon,
  File,
  ChevronUp,
  FileText,
  Video,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { string, z } from "zod"
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
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

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
    name?: string
    size?: number
    ext?: string
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
        name?: string
        size?: number
        ext?: string
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
        name?: string
        size?: number
        ext?: string
      }
      readBy: string[]
    }
  }
}

interface ChatStepProps {
  email: string
  name: string
  ticketId: string | null
  onBack: () => void
  onTicketIdUpdate: (id: string | null) => void
  onResetChat: () => void
}

export default function ChatStep({
  email,
  name,
  ticketId,
  onBack,
  onTicketIdUpdate,
  onResetChat
}: ChatStepProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [lastUserMessageTime, setLastUserMessageTime] = useState<number | null>(null)
  const [autoResponseShown, setAutoResponseShown] = useState(false)
  const autoResponseTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [first, setFirst] = useState(15)
  const [userJustSentMessage, setUserJustSentMessage] = useState(false)
  const [hasNewMessages, setHasNewMessages] = useState(false)
  const [lastSeenMessageIndex, setLastSeenMessageIndex] = useState(-1)
  const [isUserAtBottom, setIsUserAtBottom] = useState(true)
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({})
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null)
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false)
  const [showLoadMoreButton, setShowLoadMoreButton] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Dropzone configuration
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": [],
      "image/jpg": [],
      "image/jpeg": [],
      "application/pdf": [],
      "application/msword": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
      "video/mp4": [],
      "video/quicktime": [],
    },
    multiple: false,
    maxSize: 30 * 1024 * 1024, // 30 MB
    onDrop: (acceptedFiles: File[], fileRejections: any) => {
      if (fileRejections.length > 0) {
        toast.error("File type not accepted or file too large. (Max Size: 30MB)")
        return
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setFiles([file])

        // if image create a preview
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (e) => {
            setAttachmentPreview(e.target?.result as string)
          }
          reader.readAsDataURL(file)
        }

        setAttachmentFile(file)
        setIsAttachmentMenuOpen(false)
      }
    },
  })

  const handleRemoveFile = () => {
    setFiles([])
    setAttachmentPreview(null)
    setAttachmentFile(null)
  }

  // Upload file to your api
  const uploadFile = async (file: File): Promise<{
    type: string
    url: string
    name: string
    size: number
    ext: string
  } | null> => {
    try {
      setIsUploading(true)
      const formData = new FormData()
      const fileExt = file.name.split('.').pop() || ''

      // Preserve the original filename with extension
      const fileName = `${ticketId}-${Date.now()}.${fileExt}`
      formData.append("file", file, fileName)

      console.log('Uploading file:', {
        name: file.name,
        size: file.size,
        type: file.type,
        fileName: fileName
      })

      const response = await fetch("/api/upload/attachment", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload Failed")
      }

      const data = await response.json()
      console.log('Upload API response:', data)

      // Ensure size is properly handled - use file.size as fallback
      const fileSize = Number(data.size) || file.size

      return {
        type: data.type || file.type,
        url: data.url,
        name: data.name || file.name,
        size: fileSize, // Make sure this is correctly set
        ext: data.ext || fileExt
      }
    } catch (error) {
      console.error("Error Uploading file:", error)
      toast.error("Error uploading file. Please try again.")
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const renderFileAttachment = (msg: Message, block: any) => {
    const isUser = msg.sender === "user"
    const hasText = msg.text && msg.text.trim().length > 0

    if (!msg.attachment?.url) return null

    return (
      <div className={`flex flex-col max-w-[280px] ${hasText ? 'mb-2' : ''}`}>
        <div className="mb-px">
          {(() => {
            switch (msg.attachment.type) {
              case "image/png":
              case "image/jpeg":
              case "image/jpg":
                return renderImageAttachment(msg, block, isUser)
              case "application/pdf":
                return renderPDFAttachment(msg, block, isUser)
              case "application/msword":
              case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                return renderDocumentAttachment(msg, block, isUser)
              case "video/mp4":
              case "video/quicktime":
                return renderVideoAttachment(msg, block, isUser)
              default:
                return renderGenericAttachment(msg, block, isUser)
            }
          })()}
        </div>

        {hasText && (
          <div
            className={`px-3 py-2 text-sm rounded-b-lg ${isUser
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-gray-100 text-gray-800 border border-gray-200"
              }`}
            style={{
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}
          >
            {msg.text}
          </div>
        )}
      </div>
    )
  }

  const renderImageAttachment = (msg: Message, block: any, isUser: boolean) => {
    const dialogKey = `image-${msg.timestamp}`
    const isDialogOpen = openDialogs[dialogKey] || false

    return (
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
          rounded-t-2xl border border-gray-200 border-b-0 shadow-sm hover:shadow-md transition-all duration-200
          bg-transparent w-full
        `}>
            <div className="relative overflow-hidden w-full">
              <Image
                src={msg.attachment?.url || ''}
                alt="Attachment"
                width={500}
                height={500}
                className="object-cover w-full max-w-[280px] max-h-[280px] rounded-t-2xl transition-transform duration-200 group-hover:scale-105"
                onError={(e) => {
                  console.error('Image failed to load:', msg.attachment?.url);
                }}
              />
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-200 rounded-t-2xl pointer-events-none" />
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 border-none bg-black/0 [&>button]:hidden">
          <DialogTitle className="sr-only">
            Image attachment from {block.senderName}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Enlarged image preview modal
          </DialogDescription>
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
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const renderPDFAttachment = (msg: Message, block: any, isUser: boolean) => {
    return (
      <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
        <Link
          href={msg.attachment?.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-slate-200 rounded-md p-2 h-32 w-32 flex flex-col items-center justify-center hover:bg-slate-300 transition-colors"
          title={`Sent by ${block.senderName}`}
        >
          <FileText className="size-12 text-muted-foreground" />
          <span className="text-xs text-center text-muted-foreground w-20 truncate block">
            PDF File
          </span>
          <span className="text-xs text-center text-muted-foreground w-20 truncate block">
            {msg.attachment?.size && msg.attachment.size >= 1024 * 1024
              ? `${(msg.attachment.size / (1024 * 1024)).toFixed(2)} MB`
              : `${((msg.attachment?.size || 0) / 1024).toFixed(2)} KB`}
          </span>
        </Link>
      </div>
    )
  }

  const renderDocumentAttachment = (msg: Message, block: any, isUser: boolean) => {
    return (
      <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
        <Link
          href={msg.attachment?.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-slate-200 rounded-md p-2 h-32 w-32 flex flex-col items-center justify-center hover:bg-slate-300 transition-colors"
          title={`Sent by ${block.senderName}`}
        >
          <FileText className="size-12 text-muted-foreground" />
          <span className="text-xs text-center text-muted-foreground w-20 truncate block">
            Document
          </span>
          <span className="text-xs text-center text-muted-foreground w-20 truncate block">
            {msg.attachment?.size && msg.attachment.size >= 1024 * 1024
              ? `${(msg.attachment.size / (1024 * 1024)).toFixed(2)} MB`
              : `${((msg.attachment?.size || 0) / 1024).toFixed(2)} KB`}
          </span>
        </Link>
      </div>
    )
  }

  const renderVideoAttachment = (msg: Message, block: any, isUser: boolean) => {
    return (
      <Link
        href={msg.attachment?.url?.replace("/preview", "/view") || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-slate-200 rounded-md p-2 h-32 w-32 flex flex-col items-center justify-center hover:bg-slate-300 transition-colors"
        title={`Sent by ${block.senderName}`}
      >
        <Video className="size-12 text-muted-foreground" />
        <span className="text-xs text-center text-muted-foreground w-20 truncate block">
          Video
        </span>
        <span className="text-xs text-center text-muted-foreground w-20 truncate block">
          {msg.attachment?.size && msg.attachment.size >= 1024 * 1024
            ? `${(msg.attachment.size / (1024 * 1024)).toFixed(2)} MB`
            : `${((msg.attachment?.size || 0) / 1024).toFixed(2)} KB`}
        </span>
      </Link>
    )
  }

  const renderGenericAttachment = (msg: Message, block: any, isUser: boolean) => {
    return (
      <Link
        href={msg.attachment?.url || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-slate-200 rounded-md p-2 h-32 w-32 flex flex-col items-center justify-center hover:bg-slate-300 transition-colors"
        title={`Sent by ${block.senderName}`}
      >
        <Paperclip className="size-12 text-muted-foreground" />
        <span className="text-xs text-center text-muted-foreground w-20 truncate block">
          {msg.attachment?.name || 'File'}
        </span>
        <span className="text-xs text-center text-muted-foreground w-20 truncate block">
          {msg.attachment?.size && msg.attachment.size >= 1024 * 1024
            ? `${(msg.attachment.size / (1024 * 1024)).toFixed(2)} MB`
            : `${((msg.attachment?.size || 0) / 1024).toFixed(2)} KB`}
        </span>
      </Link>
    )
  }

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

      const shouldShowLoadMoreButton = scrollTop < 200 && hasMore && !isLoadingMore
      setShowLoadMoreButton(shouldShowLoadMoreButton)
    }

    chatContainer.addEventListener('scroll', handleScroll)
    return () => chatContainer.removeEventListener('scroll', handleScroll)
  }, [messages, hasNewMessages, hasMore, isLoadingMore])

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
      const validMessages = ticketData.ticket.conversation.filter(msg =>
        (msg.message !== null && msg.message !== undefined && msg.message.trim() !== "") ||
        (msg.attachment && msg.attachment.url)
      );

      const formattedMessages = validMessages.map((msg) => {
        const date = new Date(Number(msg.timestamp))
        const formattedTime = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        const formattedDate = date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })

        const sender: "support" | "user" = msg.sender === "SUPPORT" ? "support" : "user"
        const senderName = sender === "support" ? "Agent" : name
        const status: "seen" | "unread" = msg.readBy && msg.readBy.length > 0 ? "seen" : "unread"

        return {
          sender,
          text: msg.message || "",
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
          const isAtBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 100
          if (isAtBottom || messages.length === 0) {
            setTimeout(() => {
              scrollToBottom('auto')
            }, 100)
          }
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
  }, [messages, isReplying, isLoadingMore, userJustSentMessage])

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

      // Show load more button when scrolled near the top and there are more messages
      const shouldShowLoadMoreButton = scrollTop < 200 && hasMore && !isLoadingMore
      setShowLoadMoreButton(shouldShowLoadMoreButton)
    }

    chatContainer.addEventListener('scroll', handleScroll, { passive: true })

    setTimeout(() => {
      handleScroll()
    }, 500)

    return () => chatContainer.removeEventListener('scroll', handleScroll)
  }, [messages, hasNewMessages, hasMore, isLoadingMore])

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
    if (messages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <MessageCircle className="w-12 h-12 mb-4 text-gray-300" />
          <p className="text-lg font-medium">No messages yet</p>
          <p className="text-sm mt-2">Start a conversation by sending a message</p>
        </div>
      )
    }

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
                const dialogKey = `${blockIndex}-${msgIndex}`
                const isDialogOpen = openDialogs[dialogKey] || false

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
                )

                return (
                  <div
                    key={msgIndex}
                    className={`flex ${block.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.attachment && msg.attachment.url && renderFileAttachment(msg, block)}

                    {msg.text && msg.text.trim() && (!msg.attachment || !msg.attachment.url) && (
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
                        {hoverCardContent}
                      </HoverCard>
                    )}

                    {(!msg.attachment || !msg.attachment.url) && (!msg.text || !msg.text.trim()) && (
                      <div
                        className={`inline-block px-4 py-2 rounded-2xl text-sm ${block.sender === "user"
                          ? "bg-green-600 text-white rounded-br-none"
                          : "bg-white border border-black/20 text-gray-800 rounded-bl-none"
                          }`}
                      >
                        <em>Empty message</em>
                      </div>
                    )}
                  </div>
                )
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
        // Handle error
      }
    },
    onError: (err: any) => {
      // Handle error
    },
  })

  useEffect(() => {
    if (autoResponseTimeoutRef.current) {
      clearTimeout(autoResponseTimeoutRef.current)
    }

    if (lastUserMessageTime && !autoResponseShown) {
      const timeSinceLastUserMessage = Date.now() - lastUserMessageTime
      const timeUntilAutoResponse = Math.max(50000 - timeSinceLastUserMessage, 0)

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
    onTicketIdUpdate(null)
    setLastUserMessageTime(null)
    setAutoResponseShown(false)
    setHasNewMessages(false)
    setLastSeenMessageIndex(-1)
    setIsUserAtBottom(true)

    if (autoResponseTimeoutRef.current) {
      clearTimeout(autoResponseTimeoutRef.current)
    }

    onResetChat()
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

    if (sender === "user") {
      setMessages(prev => {
        const newMessages = [...prev]

        const tempMessageIndex = newMessages.findIndex(m =>
          'tempId' in m &&
          m.text === newMessage.text &&
          m.sender === "user" &&
          (!m.attachment && !newMessage.attachment ||
            m.attachment?.url === newMessage.attachment?.url)
        )

        if (tempMessageIndex !== -1) {
          // Replace the temporary message
          newMessages[tempMessageIndex] = newMessage
          return newMessages
        } else {
          // Add as new message if no temporary found
          return [...prev, newMessage]
        }
      })
    } else {
      // For support messages, just add them normally
      setMessages(prev => [...prev, newMessage])
    }

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
    if (chatContainerRef.current) {
      setTimeout(() => {
        scrollToBottom('auto')
      }, 300)
    }
  }, [])

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() && files.length === 0) return

    if (!email) {
      return
    }

    const messageText = inputMessage.trim()
    setInputMessage("")
    setUserJustSentMessage(true)
    setLastUserMessageTime(Date.now())
    setAutoResponseShown(false)

    let attachmentData: {
      type: string
      url: string
      name: string
      size: number
      ext: string
    } | undefined

    // Upload file if exists
    if (files.length > 0) {
      const uploadedFile = await uploadFile(files[0])
      if (uploadedFile) {
        attachmentData = uploadedFile
      }
    }

    // Create temporary message. Katong mag reply sa chat na static
    const now = new Date()
    const tempMessageId = `temp-${now.getTime()}-${Math.random().toString(36).substr(2, 9)}`

    const formattedTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    const formattedDate = now.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })

    const tempMessage: Message & { tempId?: string } = {
      sender: "user",
      text: messageText,
      time: formattedTime,
      date: formattedDate,
      timestamp: now.getTime(),
      status: "unread",
      senderName: name,
      attachment: attachmentData,
      tempId: tempMessageId
    }

    setMessages(prev => [...prev, tempMessage])
    setFiles([])

    try {
      await sendUserMessageMutation({
        variables: {
          email: email,
          message: messageText,
          attachment: attachmentData ? {
            type: attachmentData.type,
            url: attachmentData.url,
            name: attachmentData.name,
            size: attachmentData.size,
            ext: attachmentData.ext
          } : undefined
        },
      })
    } catch (err) {
      console.error("Error sending message:", err)
      setMessages(prev => prev.filter(msg => !('tempId' in msg) || msg.tempId !== tempMessageId))
    }
  }

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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="w-full h-screen flex flex-col lg:flex-row pt-16"
    >
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-2 rounded-full">
            <Headphones className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base text-gray-900 font-semibold">Live Support</h2>
            <p className="text-sm text-black/80">{name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center gap-1 text-sm bg-green-600 hover:bg-green-700 text-white p-2 rounded-md cursor-pointer transition-all"
          >
            <Menu className="w-4 h-4" />
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm bg-green-600 hover:bg-green-700 text-white p-2 rounded-md cursor-pointer transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sidebar - Hidden on mobile, shown as overlay when open */}
      <div className={`
        fixed lg:relative inset-0 lg:inset-auto z-50 lg:z-auto
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-64 bg-gradient-to-b from-green-50 to-emerald-50 border-r border-green-100 
        shrink-0 p-6 space-y-6 lg:flex flex-col
      `}>
        {/* Close button for mobile */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-green-700 hover:text-green-900 z-10"
        >
          <XCircle className="w-6 h-6" />
        </button>

        <div>
          <h3 className="text-green-900 font-semibold mb-2">C-ONE Chat Support</h3>
          <p className="text-xs text-green-700">Your support conversation</p>
        </div>

        <div className="h-px bg-green-200"></div>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs text-green-600">Email</p>
            <p className="text-sm text-green-900 font-medium break-words">{email}</p>
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
          {/* <Button
            variant="outline"
            className="w-full justify-start text-green-700 border-green-300 hover:bg-green-100 text-sm"
            onClick={handleDownloadChat}
          >
            <File className="w-4 h-4 mr-2" />
            Download Chat
          </Button> */}
        </div>
      </div>

      {/* Overlay for mobile sidebar - Blurry transparent background */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-white/20 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white shadow-lg overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden lg:block bg-white p-3 text-black shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-3 rounded-full backdrop-blur-sm">
                <Headphones className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base text-gray-900 font-semibold">Live Support</h2>
                <p className="text-sm text-black/80">{name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onBack}
                className="flex items-center gap-1 text-sm bg-green-600 hover:bg-green-700 text-white p-2 rounded-md cursor-pointer backdrop-blur-sm transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
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
            className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-300"
          >
            {ticketData?.ticket?.total === 0 || ticketData?.ticket?.total && ticketData.ticket.total <= messages.length ? (
              <div className="flex flex-col items-center justify-center w-full py-4">
                <div className="flex w-full items-center justify-center relative mb-2">
                  <Separator className="absolute w-full" />
                  <span className="text-center text-xs text-muted-foreground px-2 bg-slate-50 z-10">
                    Send A Message... ☕
                  </span>
                </div>
                <span className="text-center text-xs text-muted-foreground">
                  {messages.length > 0 && messages[0]?.timestamp
                    ? format(messages[0].timestamp, "PPp")
                    : ""
                  }
                </span>
              </div>
            ) : (
              <div className="flex justify-center py-4">
                <Button
                  loading={isLoadingMore || ticketLoading}
                  variant="link"
                  onClick={handleLoadMore}
                  className="flex cursor-pointer no-underline hover:no-underline items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full shadow-lg transition-all duration-200"
                >
                  <ChevronUp className="w-4 h-4" />
                  See more messages
                </Button>
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
                  className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border p-2 z-10 min-w-[60px]"
                >
                  <div className="flex gap-2">
                    <div {...getRootProps({ className: "dropzone" })}>
                      <input {...getInputProps()} />
                      <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors">
                        <Paperclip className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">Attach File</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {files.length > 0 && (
              <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-white border rounded-lg mx-4">
                <div className="flex items-center gap-2">
                  {(() => {
                    const file = files[0]
                    const ext = file.name.split('.').pop()?.toLowerCase()

                    switch (ext) {
                      case 'png':
                      case 'jpg':
                      case 'jpeg':
                        return (
                          <Image
                            src={URL.createObjectURL(file)}
                            alt="Attachment preview"
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )
                      case 'pdf':
                        return (
                          <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center">
                            <FileText className="w-6 h-6 text-red-600" />
                          </div>
                        )
                      case 'doc':
                      case 'docx':
                        return (
                          <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>
                        )
                      case 'mp4':
                      case 'mov':
                        return (
                          <div className="w-12 h-12 bg-purple-100 rounded flex items-center justify-center">
                            <Video className="w-6 h-6 text-purple-600" />
                          </div>
                        )
                      default:
                        return (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <File className="w-6 h-6 text-gray-500" />
                          </div>
                        )
                    }
                  })()}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {files[0].name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(files[0].size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleRemoveFile}
                    disabled={isUploading}
                    className="text-gray-500 hover:text-red-500 hover:bg-gray-200! bg-transparent transition-colors cursor-pointer shrink-0"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
                {isUploading && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div className="bg-green-600 h-1 rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Uploading...</p>
                  </div>
                )}
              </div>
            )}

            <Button
              type="button"
              onClick={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)}
              className="flex bg-transparent! items-center justify-center w-10 h-10 text-gray-500 hover:text-green-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer shrink-0"
            >
              <Paperclip className="w-5 h-5" />
            </Button>

            <InputGroup className="flex-1 min-w-0">
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
              disabled={!inputMessage.trim() && files.length === 0}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-5 rounded-md shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  )
}
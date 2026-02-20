"use client"
import React, { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { gql } from "@apollo/client"
import { useMutation, useQuery, useSubscription } from "@apollo/client/react"
import { Textarea } from "@/components/ui/textarea"
import { useAuthStore } from "@/store/auth.store"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Paperclip } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group"

const FETCH_CONVERSATION = gql`
  query FetchDetailedConversation($_id: ID!, $first: Int!) {
    fetchDetailedConversation(_id: $_id, first: $first) {
      conversation {
        _id
        customer {
          name
          email
        }
        assignedAgent {
          _id
          name
        }
      }
      messages {
        text
        sender
        sentAt
      }
      totalMessages
    }
  }
`

const SEND_MESSAGE = gql`
  mutation SendMessage($input: MessageInput) {
    sendMessage(input: $input) {
      ok
      message
      sender
    }
  }
`

const NEW_MESSAGE_SUBSCRIPTION = gql`
  subscription NewMessage($_id: ID!) {
    newMessage(_id: $_id) {
      convoId
      latestMessage {
        text
        sender
        sentAt
        receivedAt
      }
    }
  }
`

const Page = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const params = useParams()
  const [messageCount, setMessageCount] = useState<number>(15)
  const { data, fetchMore, loading } = useQuery(FETCH_CONVERSATION, {
    fetchPolicy: "network-only",
    variables: {
      _id: params.id,
      first: messageCount,
    },
  })
  const [text, setText] = useState<string>("")
  const [sendMessage] = useMutation(SEND_MESSAGE, {
    variables: {
      input: {
        conversation: params?.id,
        text,
        sender: isAuthenticated ? "AGENT" : "CUSTOMER",
      },
    },
    onCompleted: (data: any) => {
      const message = data?.sendMessage?.message
      toast.success(message)
    },
  })
  const conversation =
    (data as any)?.fetchDetailedConversation?.conversation || null
  const totalMessages = (data as any)?.fetchDetailedConversation?.totalMessages
  const [messages, setMessages] = useState<any[]>([])
  useSubscription(NEW_MESSAGE_SUBSCRIPTION, {
    variables: { _id: params.id },
    onData: ({ data: subscriptionData }) => {
      const newMessage = (subscriptionData as any).data.newMessage
      if (newMessage.convoId === conversation?._id)
        setMessages((prev) => [newMessage.latestMessage, ...prev])
    },
    onError: (err) => {
      console.error("Subscription error:", err)
    },
  })
  const containerRef = useRef<HTMLDivElement>(null)
  // Handle Image
  const [files, setFiles] = useState<any[]>([])
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": [],
      "image/jpg": [],
      "image/jpeg": [],
      "application/pdf": [],
      "application/msword": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [],
      "video/mp4": [],
      "video/quicktime": [],
    },
    multiple: false,
    maxSize: 30 * 1024 * 1024, // 30MB
    onDrop: (acceptedFiles: any, fileRejections: any) => {
      if (fileRejections.length > 0) {
        toast.error("File too large or unsupported type. (Max size: 30MB)")
        return
      }
      setFiles(
        acceptedFiles.map((file: any) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      )
    },
  })

  useEffect(() => {
    if ((data as any)?.fetchDetailedConversation?.messages) {
      const messages = (data as any)?.fetchDetailedConversation?.messages
      setMessages(messages || [])
    }
  }, [data])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages])

  const loadMoreMessage = async () => {
    const INC = 15
    const test = setMessageCount((prev) => prev + INC)
    await fetchMore({
      variables: {
        first: messageCount + INC,
      },
    })
  }

  return (
    <div className="flex flex-col h-full gap-3 min-h-0">
      <div className="flex justify-between">
        <div>
          <span className="block text-xl">
            {conversation?.customer?.name} ({totalMessages})
          </span>
          <span className="block text-sm text-muted-foreground">
            {conversation?.customer?.email}
          </span>
          <span className="block text-sm text-muted-foreground">
            {conversation?.assignedAgent?.name || "unassigned"}
          </span>
        </div>
        <div></div>
      </div>
      <div
        ref={containerRef}
        className="h-[78vh] border rounded-lg w-full p-2 overflow-y-auto"
      >
        {loading ? (
          <div ref={containerRef} className="flex flex-col gap-1 ">
            <Skeleton className="w-50 h-10" />
            <Skeleton className="w-72 h-10" />
            <Skeleton className="w-45 h-10" />
            <Skeleton className="w-50 h-10 ml-auto" />
            <Skeleton className="w-36 h-10 ml-auto" />
            <Skeleton className="w-25 h-10" />
            <Skeleton className="w-72 h-10" />
            <Skeleton className="w-60 h-10" />
            <Skeleton className="w-50 h-10 ml-auto" />
            <Skeleton className="w-80 h-10 ml-auto" />
          </div>
        ) : (
          <div ref={containerRef} className="flex flex-col gap-1 ">
            {totalMessages > messageCount ? (
              <Button
                className="w-full"
                onClick={loadMoreMessage}
                variant="link"
                size="sm"
              >
                Load More
              </Button>
            ) : (
              <span className="w-full text-center text-sm text-muted-foreground">
                Start of conversation ☕
              </span>
            )}
            {[...messages].reverse().map((msg, idx, arr) => {
              const pastTimestamp = idx > 0 ? arr[idx - 1]?.sentAt : null
              const thisTimestamp = msg?.sentAt

              const showTimestamp =
                !pastTimestamp ||
                Math.abs(Number(thisTimestamp) - Number(pastTimestamp)) >=
                  5 * 60 * 1000

              return (
                <React.Fragment key={idx}>
                  <HoverCard>
                    <HoverCardTrigger className="space-y-1">
                      <div
                        className={cn(
                          "w-fit px-3 rounded-lg min-h-10 flex items-center justify-center",
                          msg.sender === "AGENT"
                            ? "bg-blue-100 ml-auto"
                            : "bg-green-100",
                        )}
                      >
                        <span className="block">{msg.text}</span>
                      </div>
                      <span
                        className={cn(
                          "w-fit block text-xs",
                          msg.sender === "AGENT" ? "text-right" : "text-left",
                        )}
                      >
                        {format(msg.sentAt, "PPp")}
                      </span>
                    </HoverCardTrigger>
                    <HoverCardContent
                      side={msg.sender === "AGENT" ? "left" : "right"}
                      className="px-1.75 bg-black/10 py-1 flex items-center w-fit shadow-none"
                    >
                      <span className="text-xs">
                        {format(msg.sentAt, "PPp")}
                      </span>
                    </HoverCardContent>
                  </HoverCard>
                </React.Fragment>
              )
            })}
          </div>
        )}
      </div>
      <div className="flex space-x-1">
        <InputGroup
          {...getRootProps({ className: "dropzone" })}
          className="w-fit min-h-5"
        >
          <Input {...getInputProps()} />
          <Button variant="ghost" size="icon-lg" title="Attach image/document">
            <Paperclip />
          </Button>
          {files.length > 0 ? (
            <InputGroupAddon align="block-start">
              {files.map((file: any, idx: number) => (
                <span key={idx}>{file.name}</span>
              ))}
            </InputGroupAddon>
          ) : null}
        </InputGroup>
        <Textarea
          className="resize-none min-h-5 max-h-24 overflow-y-auto flex-1"
          value={text}
          onChange={(e) => setText(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
        />
      </div>
    </div>
  )
}

export default Page

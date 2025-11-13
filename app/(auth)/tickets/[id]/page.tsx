"use client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/auth.store"
import { gql } from "@apollo/client"
import { useMutation, useQuery, useSubscription } from "@apollo/client/react"
import { format } from "date-fns"
import { ArrowLeft, Paperclip, SendHorizonal } from "lucide-react"
import { useEffect, useRef, useState, useTransition } from "react"
import { use } from "react"
import { differenceInMinutes } from "date-fns"
import { Spinner } from "@/components/ui/spinner"
import { useRouter } from "next/navigation"
import { ButtonGroup } from "@/components/ui/button-group"

const TICKET = gql`
  query Ticket($_id: ID!, $first: Int!) {
    ticket(_id: $_id, first: $first, viewer: SUPPORT) {
      _id
      email
      name
      assignedTo {
        _id
        name
      }
      total
      conversation {
        sender
        message
        timestamp
        agent {
          _id
          name
        }
      }
    }
  }
`

const NEW_MESSAGE_SUBSCRIPTION = gql`
  subscription NewMessage($_id: ID!) {
    newMessage(_id: $_id) {
      ticketId
      latestMessage {
        sender
        message
        timestamp
        agent {
          _id
          name
        }
      }
    }
  }
`

const SEND_MESSAGE = gql`
  mutation SendAgentMessage($id: ID!, $agentId: ID!, $message: String!) {
    sendAgentMessage(_id: $id, agentId: $agentId, message: $message) {
      ok
      message
    }
  }
`

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter()
  const { id: _id } = use(params)
  const [isPending, startTransition] = useTransition()
  const [first, setFirst] = useState(15)
  const user = useAuthStore((state) => state.user)
  const convoRef = useRef<HTMLDivElement>(null)
  const {
    data: ticketData,
    loading,
    error,
  }: any = useQuery(TICKET, {
    variables: { _id, first },
    fetchPolicy: "no-cache",
  })
  console.log(error)
  const [conversation, setConversation] = useState<any[]>([])
  useSubscription(NEW_MESSAGE_SUBSCRIPTION, {
    variables: { _id },
    onData: ({ data: subscriptionData }) => {
      const newMessage = (subscriptionData as any).data.newMessage
      if (newMessage.ticketId === ticketData?.ticket?._id)
        setConversation((prev) => [newMessage.latestMessage, ...prev])
    },
    onError: (err) => {
      console.error("Subscription error:", err)
    },
  })
  const [ticket, setTicket] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [sendMessage] = useMutation(SEND_MESSAGE)
  const [scrollPosition, setScrollPosition] = useState(0)

  const showScrollToBottom =
    convoRef.current &&
    typeof convoRef.current.scrollHeight === "number" &&
    scrollPosition < convoRef.current.scrollHeight - 800

  useEffect(() => {
    const ref = convoRef.current
    if (!ref) return
    const handleScroll = () => {
      setScrollPosition(ref.scrollTop)
      if (
        ref.scrollTop === 0 &&
        ticketData?.ticket?.total > conversation.length
      )
        setFirst((f) => f + 15)
    }
    ref.addEventListener("scroll", handleScroll)
    return () => ref.removeEventListener("scroll", handleScroll)
  }, [ticketData?.ticket?.total, conversation.length])

  useEffect(() => {
    if (!ticket) setTicket(ticketData?.ticket)
  }, [ticket, ticketData])

  const scrollTo = (type: "top" | "bottom") => {
    const container = convoRef.current
    if (container) {
      if (type === "top") container.scrollTo({ top: 0, behavior: "smooth" })
      else
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" })
    }
  }

  // Only scroll to bottom when a new message is added (not on initial load)
  useEffect(() => {
    if (convoRef.current && conversation.length <= 15) {
      convoRef.current.scrollTop = convoRef.current.scrollHeight
    }
  }, [conversation.length])

  useEffect(() => {
    if (ticketData?.ticket?.conversation) {
      scrollTo("top")
      setConversation((prev) => {
        const existing = new Set(prev.map((msg: any) => msg.timestamp))
        const newMessages = ticketData.ticket.conversation.filter(
          (msg: any) => !existing.has(msg.timestamp)
        )
        return [...prev, ...newMessages]
      })
    }
  }, [ticketData?.ticket?.conversation])

  const sendAgentMessage = () =>
    startTransition(async () => {
      if (message.trim() === "") return
      await sendMessage({
        variables: {
          id: ticketData?.ticket?._id,
          agentId: user?._id,
          message: message.trim(),
        },
      })
      setMessage("")
      scrollTo("bottom")
    })

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-white rounded-md py-1.5 flex gap-1.5 items-center px-1 border">
        <Button
          size="icon-sm"
          variant="ghost"
          className="h-16"
          onClick={() => router.back()}
        >
          <ArrowLeft />
        </Button>
        <div>
          {!ticket ? (
            <>
              <Skeleton className="w-full my-1 h-6" />
              <Skeleton className="w-full my-1 h-4" />
              <Skeleton className="w-full my-1 h-4" />
            </>
          ) : (
            <>
              <span className="text-2xl block">{ticket?.name}</span>
              <span className="block text-sm text-muted-foreground">
                {ticket?.email}
              </span>
              <span className="block text-sm text-muted-foreground">
                Assigned to: {ticket?.assignedTo?.name || "Unassigned"}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="py-2 rounded-md bg-slate-50 border flex flex-col gap-2">
        {loading && (
          <div className="w-full flex justify-center items-center">
            <Spinner className="size-5">Loading</Spinner>
          </div>
        )}
        <div
          className="w-full flex flex-col-reverse h-[70vh] px-2 overflow-y-auto"
          ref={convoRef}
        >
          {conversation.map((msg: any, index: number, array: any[]) => {
            if (!msg.sender && !msg.timestamp) return null
            const isUser = msg.sender === "USER"

            const currentAgent = msg?.agent?.name
            const pastAgent = index > 0 ? array[index - 1]?.agent?.name : null

            const currentSenderType = msg.sender
            const pastSenderType = index > 0 ? array[index - 1]?.sender : null

            const pastTimestamp = index > 0 ? array[index - 1]?.timestamp : null
            const latestTimestamp = msg?.timestamp

            const showTimestamp =
              pastTimestamp &&
              differenceInMinutes(
                new Date(Number(latestTimestamp)),
                new Date(Number(pastTimestamp))
              ) > 5

            const addSpace =
              currentSenderType !== pastSenderType || pastAgent !== currentAgent
            return (
              <div key={msg.timestamp + index}>
                {showTimestamp && (
                  <div className="w-full flex justify-center my-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(Number(msg?.timestamp)), "PPp")}
                    </span>
                  </div>
                )}
                <div
                  key={msg.timestamp}
                  className={cn(
                    "flex flex-col",
                    msg.sender === "USER" ? "items-start" : "items-end",
                    addSpace ? "mt-3" : undefined
                  )}
                >
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div
                        className={cn(
                          "flex flex-col my-px",
                          isUser ? "items-start" : "items-end"
                        )}
                      >
                        {!!(addSpace || showTimestamp) && (
                          <span
                            className={cn(
                              "text-xs text-[0.7rem]",
                              isUser ? "text-left" : "text-right"
                            )}
                          >
                            {isUser
                              ? ticketData?.ticket?.name
                              : msg?.agent?.name}
                          </span>
                        )}
                        <div
                          className={cn(
                            "rounded-md p-1 px-2 my-px shadow wrap-break-word whitespace-pre-line max-w-96",
                            isUser ? "bg-green-200" : "bg-slate-200"
                          )}
                        >
                          {msg?.message}
                        </div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent
                      className="p-0.75 w-fit"
                      align={isUser ? "start" : "end"}
                      side="bottom"
                    >
                      <div className="px-1.5">
                        <span className="block text-xs text-muted-foreground">
                          {format(new Date(Number(msg?.timestamp)), "PPp")}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          Sent by:{" "}
                          {isUser ? ticketData?.ticket?.name : msg?.agent?.name}
                        </span>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="flex gap-2 h-full items-center">
        <Textarea
          className="flex-1 ring-0 rounded-md resize bg-white min-h-8 max-h-24 overflow-y-auto"
          rows={1}
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              sendAgentMessage()
            }
          }}
        />
        <ButtonGroup className="rounded-none">
          <Input id="upload" type="file" className="sr-only hidden" />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="rounded-none"
            onClick={() =>
              (
                document.getElementById("upload") as HTMLInputElement | null
              )?.click()
            }
            aria-label="Attach file"
            title="Attach file"
          >
            <Paperclip />
          </Button>
          <Button
            loading={isPending}
            onClick={sendAgentMessage}
            size="icon"
            variant="ghost"
            className="rounded-none"
            aria-label="Send message"
            title="Send message"
          >
            <SendHorizonal />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  )
}

export default Page

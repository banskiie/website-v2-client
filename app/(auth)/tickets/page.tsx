"use client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/auth.store"
import { gql } from "@apollo/client"
import { useMutation, useQuery, useSubscription } from "@apollo/client/react"
import { format } from "date-fns"
import Image from "next/image"
import React, { useEffect, useState } from "react"
// import Test from "@/public/images/unt.png"

const TICKET = gql`
  query Ticket {
    ticket(_id: "690d6b7c37f3bcf15e395453") {
      _id
      email
      name
      assignedTo {
        _id
        name
        email
        contactNumber
        username
        role
        isActive
        createdAt
        updatedAt
      }
      conversation {
        sender
        message
        timestamp
        agent {
          _id
          name
          email
          contactNumber
          username
          role
          isActive
          createdAt
          updatedAt
        }
      }
    }
  }
`

const NEW_MESSAGE_SUBSCRIPTION = gql`
  subscription NewMessage {
    newMessage(_id: "690d6b7c37f3bcf15e395453") {
      ticketId
      latestMessage {
        sender
        agent {
          _id
          name
        }
        message
        timestamp
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

const Page = () => {
  const user = useAuthStore((state) => state.user)
  const { data: ticketData, loading }: any = useQuery(TICKET, {
    fetchPolicy: "no-cache",
  })
  const [conversation, setConversation] = useState<any[]>([])
  useSubscription(NEW_MESSAGE_SUBSCRIPTION, {
    onData: ({ data: subscriptionData }) => {
      const newMessage = (subscriptionData as any).data.newMessage
      if (newMessage.ticketId === ticketData?.ticket?._id) {
        setConversation((prev) => [...prev, newMessage.latestMessage])
      }
    },
  })

  const [message, setMessage] = useState("")
  const [sendMessage] = useMutation(SEND_MESSAGE)

  useEffect(
    () => setConversation(ticketData?.ticket?.conversation || []),
    [ticketData]
  )

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-white rounded-md px-3 py-1.5">
        {loading ? (
          <>
            <Skeleton className="w-full my-1 h-6" />
            <Skeleton className="w-full my-1 h-4" />
            <Skeleton className="w-full my-1 h-4" />
          </>
        ) : (
          <>
            <span className="text-2xl block">{ticketData?.ticket?.name}</span>
            <span className="block text-sm text-muted-foreground">
              {ticketData?.ticket?.email}
            </span>
            <span className="block text-sm text-muted-foreground">
              Assigned to:{" "}
              {ticketData?.ticket?.assignedTo?.name || "Unassigned"}
            </span>
          </>
        )}
      </div>

      <div className="py-2 rounded-md bg-slate-50">
        <ScrollArea>
          <div
            className="w-full flex flex-col h-[70vh] px-2"
            ref={(e) => {
              if (e) e.scrollTop = e.scrollHeight
            }}
          >
            {conversation.map((msg: any) => {
              const isUser = msg.sender === "USER"
              return (
                <div
                  key={msg.timestamp}
                  className={cn(
                    "flex flex-col",
                    msg.sender === "USER" ? "items-start" : "items-end"
                  )}
                >
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div
                        className={cn(
                          "flex flex-col my-0.5",
                          isUser ? "items-start" : "items-end"
                        )}
                      >
                        <span
                          className={cn(
                            "text-xs",
                            isUser ? "text-left" : "text-right"
                          )}
                        >
                          {isUser ? ticketData?.ticket?.name : msg?.agent?.name}
                        </span>
                        <div
                          className={cn(
                            "rounded-md p-1.5 px-2.5 my-0.5 w-fit shadow",
                            isUser ? "bg-green-200" : "bg-slate-200"
                          )}
                        >
                          <span>{msg?.message}</span>
                        </div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent
                      className="p-0.75 w-fit"
                      align="end"
                      side={isUser ? "right" : "left"}
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
              )
            })}
          </div>
        </ScrollArea>
      </div>

      <div className="flex gap-2 h-full items-center">
        <Textarea
          className="flex-1 rounded-md resize-y w-24 bg-white"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              sendMessage({
                variables: {
                  id: ticketData?.ticket?._id,
                  agentId: user?._id,
                  message: message.trim(),
                },
              }).then(() => setMessage(""))
            }
          }}
        />
        <Button
          onClick={() =>
            sendMessage({
              variables: {
                id: ticketData?.ticket?._id,
                agentId: user?._id,
                message: message.trim(),
              },
            }).then(() => setMessage(""))
          }
        >
          Send
        </Button>
      </div>
    </div>
  )
}

export default Page

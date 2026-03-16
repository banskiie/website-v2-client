"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/auth.store"
import { gql } from "@apollo/client"
import { useMutation, useQuery, useSubscription } from "@apollo/client/react"
import { format } from "date-fns"
import {
  ArrowLeft,
  FileText,
  Paperclip,
  SendHorizonal,
  Video,
  XIcon,
} from "lucide-react"
import { useEffect, useRef, useState, useTransition } from "react"
import { use } from "react"
import { useRouter } from "next/navigation"
import { ButtonGroup } from "@/components/ui/button-group"
import { useDropzone } from "react-dropzone"
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group"
import { toast } from "sonner"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import Image from "next/image"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

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
        attachment {
          type
          url
          name
          size
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
        attachment {
          type
          url
          name
          size
        }
        agent {
          _id
          name
        }
      }
    }
  }
`

const SEND_MESSAGE = gql`
  mutation SendAgentMessage(
    $id: ID!
    $agentId: ID!
    $message: String!
    $attachment: AttachmentInput
  ) {
    sendAgentMessage(
      _id: $id
      agentId: $agentId
      message: $message
      attachment: $attachment
    ) {
      ok
      message
    }
  }
`

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter()
  const { id: _id } = use(params)
  const [isPending, startTransition] = useTransition()
  const [first, setFirst] = useState(20)
  const user = useAuthStore((state) => state.user)
  const convoRef = useRef<HTMLDivElement>(null)
  const { data: ticketData, loading }: any = useQuery(TICKET, {
    variables: { _id, first },
    fetchPolicy: "no-cache",
  })
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
  // Handle Image
  const [files, setFiles] = useState<any[]>([])
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": [],
      "image/jpg": [],
      "application/pdf": [],
      "application/msword": [],
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

  const loadMore = () => {
    if (ticketData?.ticket?.total > conversation.length) {
      setFirst((f) => f + 20)
      scrollTo("top")
    }
  }

  useEffect(() => {
    if (!ticket) setTicket(ticketData?.ticket)
  }, [ticket, ticketData])

  // Only scroll to bottom when a new message is added (not on initial load)
  useEffect(() => {
    if (convoRef.current && conversation.length <= 20)
      convoRef.current.scrollTop = convoRef.current.scrollHeight
  }, [conversation.length])

  useEffect(() => {
    if (ticketData?.ticket?.conversation) {
      scrollTo("top")
      setConversation((prev) => {
        const existing = new Set(prev.map((msg: any) => msg.timestamp))
        const newMessages = ticketData.ticket.conversation.filter(
          (msg: any) => !existing.has(msg.timestamp),
        )
        return [...prev, ...newMessages]
      })
    }
  }, [ticketData?.ticket?.conversation])

  const scrollTo = (type: "top" | "bottom") => {
    const container = convoRef.current
    if (container) {
      if (type === "top") container.scrollTo({ top: 0, behavior: "smooth" })
      else
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" })
    }
  }

  const send = () =>
    startTransition(async () => {
      try {
        let attachment: {
          type: string
          url: string
          name: string
          size: number
          ext: string
        } | null = null
        if (files.length > 0) {
          const formData = new FormData()
          const file = files[0]

          formData.append(
            "file",
            file,
            `${ticketData?.ticket?._id}-${Date.now()}`,
          )

          await fetch("/api/upload/attachment", {
            method: "POST",
            body: formData,
          }).then(async (res) => {
            const data = await res.json()
            if (!res.ok) throw new Error("Upload failed")
            attachment = {
              type: data.type,
              url: data.url,
              name: data.name,
              size: data.size,
              ext: data.ext,
            }
          })
        }
        await sendMessage({
          variables: {
            id: ticketData?.ticket?._id,
            agentId: user?._id,
            message: message || "",
            attachment,
          },
        })
        scrollTo("bottom")
      } catch (error) {
        console.error("Error sending message:", error)
      } finally {
        setFiles([])
        setMessage("")
      }
    })

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="bg-white rounded-md py-1.5 flex gap-1.5 items-center px-1 border h-24">
        {/* <img
          src="https://res.cloudinary.com/dqjcswchm/image/upload/v1773640683/attachments/xofrvdtgychtzroyhkhf.jpg"
          alt="uploaded"
        /> */}
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

      <div
        className={cn(
          files.length > 0 ? "h-[calc(100vh-21rem)]" : "h-[calc(100vh-14rem)]",
          "flex flex-col-reverse overflow-y-auto p-2 rounded-md bg-slate-50 border relative",
        )}
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
            !pastTimestamp ||
            Math.abs(Number(latestTimestamp) - Number(pastTimestamp)) >=
              5 * 60 * 1000

          const addSpace =
            currentSenderType !== pastSenderType ||
            pastAgent !== currentAgent ||
            showTimestamp

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
                  addSpace ? "mt-3" : undefined,
                )}
              >
                <div
                  className={cn(
                    "flex flex-col my-0.75 gap-1 max-w-full",
                    isUser ? "items-start" : "items-end",
                  )}
                >
                  {!!(addSpace || showTimestamp) && (
                    <span
                      className={cn(
                        "text-xs text-[0.7rem]",
                        isUser ? "text-left" : "text-right",
                      )}
                    >
                      {isUser ? ticketData?.ticket?.name : msg?.agent?.name}
                    </span>
                  )}
                  {msg?.attachment?.url &&
                    (() => {
                      switch (msg.attachment.type) {
                        case "image/png":
                        case "image/jpg":
                        case "image/jpeg":
                          return (
                            <Sheet>
                              <SheetTrigger className="cursor-pointer">
                                {msg?.attachment?.url ? (
                                  <div>
                                    <Image
                                      src={msg?.attachment?.url}
                                      alt="Uploaded Image"
                                      width={500}
                                      height={500}
                                      className="rounded-md h-fit w-96"
                                      title={`Sent by ${
                                        isUser
                                          ? ticketData?.ticket?.name
                                          : msg?.agent?.name
                                      } on ${format(
                                        new Date(Number(msg?.timestamp)),
                                        "PPp",
                                      )}`}
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center">
                                    <Paperclip className="w-6 h-6 text-muted-foreground absolute z-10" />
                                    <Skeleton className="w-32 h-32 rounded-md bg-slate-200" />
                                  </div>
                                )}
                              </SheetTrigger>
                              <SheetContent
                                className="h-screen p-[2%]"
                                side="bottom"
                              >
                                <SheetHeader hidden>
                                  <SheetTitle>Preview</SheetTitle>
                                  <SheetDescription>
                                    Description
                                  </SheetDescription>
                                </SheetHeader>
                                <Image
                                  src={msg?.attachment?.url || ""}
                                  alt="Uploaded Image"
                                  width={500}
                                  height={500}
                                  className="object-contain h-full w-full"
                                />
                              </SheetContent>
                            </Sheet>
                          )

                        case "application/pdf":
                          return (
                            <Link
                              href={msg?.attachment?.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-slate-200 rounded-md p-2 h-32 w-32 flex flex-col items-center justify-center"
                              title={`
                              Sent by ${
                                isUser
                                  ? ticketData?.ticket?.name
                                  : msg?.agent?.name
                              } on ${format(
                                new Date(Number(msg?.timestamp)),
                                "PPp",
                              )}`}
                            >
                              <FileText className="size-12 text-muted-foreground" />
                              <span className="text-xs text-center text-muted-foreground w-20 truncate block">
                                PDF File
                              </span>
                              <span className="text-xs text-center text-muted-foreground w-20 truncate block">
                                {msg?.attachment?.size >= 1024 * 1024
                                  ? `${(
                                      msg?.attachment?.size /
                                      (1024 * 1024)
                                    ).toFixed(2)} MB`
                                  : `${(msg?.attachment?.size / 1024).toFixed(
                                      2,
                                    )} KB`}
                              </span>
                            </Link>
                          )
                        case "application/msword":
                        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                          return (
                            <Link
                              href={msg?.attachment?.url}
                              // target="_blank"
                              rel="noopener noreferrer"
                              className="bg-slate-200 rounded-md p-2 h-32 w-32 flex flex-col items-center justify-center"
                              title={`
                              Sent by ${
                                isUser
                                  ? ticketData?.ticket?.name
                                  : msg?.agent?.name
                              } on ${format(
                                new Date(Number(msg?.timestamp)),
                                "PPp",
                              )}`}
                              download
                            >
                              <FileText className="size-12 text-muted-foreground" />
                              <span className="text-xs text-center text-muted-foreground w-20 truncate block">
                                Document
                              </span>
                              <span className="text-xs text-center text-muted-foreground w-20 truncate block">
                                {msg?.attachment?.size >= 1024 * 1024
                                  ? `${(
                                      msg?.attachment?.size /
                                      (1024 * 1024)
                                    ).toFixed(2)} MB`
                                  : `${(msg?.attachment?.size / 1024).toFixed(
                                      2,
                                    )} KB`}
                              </span>
                            </Link>
                          )
                        case "video/quicktime":
                        case "video/mp4":
                          return (
                            <Link
                              href={msg?.attachment?.url.replace(
                                "/preview",
                                "/view",
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-slate-200 rounded-md p-2 h-32 w-32 flex flex-col items-center justify-center hover:bg-slate-300"
                              title={`
                              Sent by ${
                                isUser
                                  ? ticketData?.ticket?.name
                                  : msg?.agent?.name
                              } on ${format(
                                new Date(Number(msg?.timestamp)),
                                "PPp",
                              )}`}
                            >
                              <Video className="size-12 text-muted-foreground" />
                              <span className="text-xs text-center text-muted-foreground w-20 truncate block">
                                Video
                              </span>
                              <span className="text-xs text-center text-muted-foreground w-20 truncate block">
                                {msg?.attachment?.size >= 1024 * 1024
                                  ? `${(
                                      msg?.attachment?.size /
                                      (1024 * 1024)
                                    ).toFixed(2)} MB`
                                  : `${(msg?.attachment?.size / 1024).toFixed(
                                      2,
                                    )} KB`}
                              </span>
                            </Link>
                          )
                      }
                    })()}
                  {msg?.message && (
                    <div
                      className={cn(
                        "rounded-md p-1 px-2 my-px wrap-break-word whitespace-pre-line max-w-96",
                        isUser ? "bg-green-200" : "bg-slate-200",
                      )}
                      title={`
                            Sent by ${
                              isUser
                                ? ticketData?.ticket?.name
                                : msg?.agent?.name
                            } on ${format(
                              new Date(Number(msg?.timestamp)),
                              "PPp",
                            )}`}
                    >
                      {msg?.message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {ticketData?.ticket?.total <= conversation.length ? (
          <div className=" flex flex-col items-center justify-center w-full">
            <div className="flex w-full items-center justify-center">
              <Separator className="absolute" />
              <span className="text-center text-xs text-muted-foreground px-1 bg-slate-50  z-10">
                Start of Conversation ☕
              </span>
            </div>
            <span className="text-center text-xs text-muted-foreground">
              {format(+conversation[conversation.length - 1]?.timestamp, "PPp")}
            </span>
          </div>
        ) : (
          <Button loading={loading} variant="link" onClick={loadMore}>
            Load more
          </Button>
        )}
      </div>
      <div
        className={cn(
          "flex gap-2 items-end justify-center",
          files.length > 0 ? "h-40" : "h-12",
        )}
      >
        <div {...getRootProps({ className: "dropzone" })}>
          <Input {...getInputProps()} />
          <Button variant="ghost" size="icon" title="Attach image/document">
            <Paperclip />
          </Button>
        </div>
        <InputGroup>
          {files.length > 0 ? (
            <InputGroupAddon align="block-start">
              {files.map((file: any, idx: number) => (
                <div key={file.name} className="flex items-start justify-end">
                  <Sheet>
                    <SheetTrigger>
                      {(() => {
                        const ext = file.name.split(".").pop()
                        switch (ext) {
                          case "png":
                          case "jpg":
                          case "jpeg":
                            return (
                              <Image
                                height={96}
                                width={96}
                                className="object-contain w-24 h-24 bg-gray-200 cursor-pointer rounded"
                                src={file.preview}
                                title={`${file.name}: ${(
                                  file.size / 1024
                                ).toFixed(2)} KB`}
                                alt="Preview"
                              />
                            )
                          case "mp4":
                            return (
                              <div className="w-24 h-24 bg-gray-200 flex flex-col items-center justify-center cursor-pointer rounded">
                                <Video />
                                <span className="truncate w-16 text-xs">
                                  {file.name}
                                </span>
                              </div>
                            )
                          case "pdf":
                          case "doc":
                          case "docx":
                            return (
                              <div className="w-24 h-24 bg-gray-200 flex flex-col items-center justify-center cursor-pointer rounded">
                                <Paperclip />
                                <div className="truncate w-16 text-xs">
                                  {file.name}
                                </div>
                              </div>
                            )
                          default:
                            return (
                              <div className="w-24 h-24 bg-gray-200 flex flex-col items-center justify-center cursor-pointer rounded">
                                <Paperclip />
                                <div className="truncate w-16 text-xs">
                                  {file.name}
                                </div>
                              </div>
                            )
                        }
                      })()}
                    </SheetTrigger>
                    <SheetContent className="h-screen p-[2%]" side="bottom">
                      <SheetHeader hidden>
                        <SheetTitle>Preview</SheetTitle>
                        <SheetDescription>Description</SheetDescription>
                      </SheetHeader>
                      <img
                        className="object-contain h-full"
                        src={file.preview}
                        title={`${file.name}: ${(file.size / 1024).toFixed(
                          2,
                        )} KB`}
                      />
                    </SheetContent>
                  </Sheet>
                  <Button
                    onClick={() => {
                      setFiles((prev) => prev.filter((_, i) => i !== idx))
                    }}
                    disabled={isPending}
                    className="absolute -mr-3.5 -mt-3.5 scale-60 rounded-full opacity-70 cursor-pointer"
                    size="icon-sm"
                    variant="destructive"
                    title="Remove image"
                  >
                    <XIcon />
                  </Button>
                </div>
              ))}
            </InputGroupAddon>
          ) : null}
          <Textarea
            className={cn(
              "flex-1 ring-0 rounded-md bg-white min-h-9 max-h-9 overflow-y-hidden resize-none border-none focus-visible:border-none focus-visible:ring-0 ",
            )}
            rows={3}
            placeholder="Type your message..."
            value={message}
            disabled={isPending}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
          />
        </InputGroup>
        <ButtonGroup className="rounded-none">
          <Button
            loading={isPending}
            onClick={send}
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

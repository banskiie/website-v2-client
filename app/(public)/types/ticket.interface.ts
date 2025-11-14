interface Agent {
  _id: string
  name: string
}

interface LatestMessage {
  sender: string
  message: string
  timestamp: string
  agent?: Agent
}

interface NewMessagePayload {
  newMessage: {
    ticketId: string
    latestMessage: {
      sender: "SUPPORT" | "USER"
      senderName?: string
      message: string
      timestamp: string
      agent?: Agent
      readBy: string[]
    }
  }
}

interface TicketConversation {
  sender: "SUPPORT" | "USER"
  message: string
  timestamp: string
  agent: Agent | null
  readBy: string[]
}

interface TicketData {
  _id: string
  email: string
  name: string
  total: number
  conversation: TicketConversation[]
}

interface TicketResponse {
  ticket: TicketData
}

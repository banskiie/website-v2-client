import type { IUser } from "./user.interface.js"

export enum TicketSender {
  SUPPORT = "SUPPORT",
  USER = "USER",
}

export interface ITicketConversation {
  sender: TicketSender
  agent?: IUser | string
  message: string
  timestamp: Date
}

export interface OTP {
  code: string
  expiresAt: Date
  isVerified: boolean
}

export interface ITicket extends Document {
  _id: string
  email: string
  name?: string
  otps: OTP[]
  assignedTo?: IUser
  conversation: ITicketConversation[]
  hasNewMessage?: boolean
  lastSentAt?: Date
}

export interface ITicketInput extends Request {
  _id?: string
  email: string
  name?: string
  otps: OTP[]
  assignedTo?: string
  conversation: ITicketConversation[]
}

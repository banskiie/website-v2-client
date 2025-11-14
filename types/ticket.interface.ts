import type { IUser } from "./user.interface.js"

export enum TicketSender {
  SUPPORT = "SUPPORT",
  USER = "USER",
}

export enum AttachmentType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  FILE = "FILE",
}

export interface IAttachment {
  type?: AttachmentType
  url?: string
}

export interface ITicketConversation {
  sender: TicketSender
  agent?: IUser | string
  message: string
  attachment?: IAttachment
  timestamp: Date
  readBy: TicketSender[]
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
  lastSentAt?: Date
  hasNewMessages?: boolean
  lastMessageSent?: string
}

export interface ITicketInput extends Request {
  _id?: string
  email: string
  name?: string
  otps: OTP[]
  assignedTo?: string
  conversation: ITicketConversation[]
}

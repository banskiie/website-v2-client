// Prince Entry interface

import { IUser } from "./user.interface"
export interface IEvent {
  _id: string
  name: string
  gender: string
  type: string
  maxEntries: number
  pricePerPlayer: number
  earlyBirdPricePerPlayer?: number
  currency: string
  location?: string
  maxAge?: number
  minAge?: number
  isDissolved: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IEntryRemark {
  remark: string
  date: Date
  by: IUser
}

export interface IEntryStatus {
  status: string
  date: Date
  reason?: string
  by: IUser
}

export interface IEntry {
  _id: string
  entryNumber: string
  entryKey: string
  club?: string
  isInSoftware: boolean
  isEarlyBird: boolean
  event: IEvent
  remarks: IEntryRemark[]
  statuses: IEntryStatus[]
}

export interface CheckEntryData {
  checkEntry: IEntry
}

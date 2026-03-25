// Prince Entry interface

import { IUser } from "@/types/user.interface"

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
  isClosed: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IEntryRemark {
  remark: string
  date: Date
}

export interface IEntryStatus {
  status: string
  date: Date
  reason?: string
}

export interface EntryStatusHistoryData {
  entryStatusHistory: IEntryStatus[]
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

export interface RegisterEntryResponse {
  registerEntry: {
    ok: boolean
    message: string
  }
}

export interface RegisterEntryVariables {
  input: {
    event: string
    club?: string
    player1Entry: {
      firstName: string
      middleName?: string
      lastName: string
      suffix?: string
      gender: string
      birthDate: string
      email: string
      phoneNumber: string
      jerseySize?: string
    }
    player2Entry?: {
      firstName: string
      middleName?: string
      lastName: string
      suffix?: string
      gender: string
      birthDate: string
      email: string
      phoneNumber: string
      jerseySize?: string
    }
  }
}

export interface IEntryAmountDetails {
  amount: number
  deadline: string
  isEarlyBird: boolean
  entry: {
    _id: string
    entryNumber: string
    entryKey: string
    isEarlyBird: boolean
    statuses: IEntryStatus[]
    event: {
      type: string
    }
  }
}

export interface EntryAmountDetailsData {
  entryEventAmountDetails: IEntryAmountDetails
}
import type { IEntry } from "./entry.interface.js"
import type { IRemark, IRemarkInput } from "./shared.interface.js"
import type { IUser } from "./user.interface.js"

export enum PaymentMethod {
  GCASH = "GCASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  OVER_THE_COUNTER = "OVER_THE_COUNTER",
}

export enum PaymentStatus {
  SENT = "SENT",
  VERIFIED = "VERIFIED",
  DUPLICATE = "DUPLICATE",
  REJECTED = "REJECTED",
}

export interface IPaymentStatusLog {
  status: PaymentStatus
  date: Date
  by?: IUser
}

export interface IEntryList {
  entry: IEntry
  isFullyPaid: boolean
}

export interface IPayment {
  _id: string
  payerName: string
  referenceNumber?: string
  amount: number
  method: PaymentMethod
  statuses: IPaymentStatusLog[]
  proofOfPaymentURL: string
  paymentDate: Date
  remarks: IRemark[]
  entryList: IEntryList[]
}

export interface IPaymentStatusLogInput {
  status: PaymentStatus
  date: Date
  by?: string
}

export interface IEntryListInput {
  entry: string[]
  isFullyPaid: boolean
}

export interface IPaymentInput {
  _id: string
  payerName: string
  referenceNumber?: string
  amount: number
  method: PaymentMethod
  statuses: IPaymentStatusLogInput[]
  proofOfPaymentURL: string
  paymentDate: Date
  remarks: IRemarkInput[]
  entryList: IEntryListInput[]
}

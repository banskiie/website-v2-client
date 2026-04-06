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
  REFUNDED = "REFUNDED",
  CANCELLED = "CANCELLED",
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

export enum TransferEntryStatus {
  PAYMENT_PENDING = "PAYMENT_PENDING",
  PAYMENT_PARTIALLY_PAID = "PAYMENT_PARTIALLY_PAID",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
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

export interface IPaymentNode {
  _id: string
  payerName: string
  referenceNumber: string
  amount: number
  method: PaymentMethod
  paymentDate: Date
  currentStatus: PaymentStatus
  entries: String
    entryList?: Array<{
    isFullyPaid: boolean
    entry: {
      _id: string
      entryNumber: string
      entryKey: string
      currentStatus: string
      transactions?: Array<{
        pendingAmount: number
        amountChanged: number
        transactionType: string
      }>
    }
  }>
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

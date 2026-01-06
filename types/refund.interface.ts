import type { IEntry } from "./entry.interface.js"
import type { IUser } from "./user.interface.js"
import type { IRemark, IRemarkInput } from "./shared.interface.js"
import type { PaymentMethod } from "./payment.interface.js"

export interface IRefund extends Document {
  _id: string
  payerName: string
  referenceNumber: string
  amount: number
  entryList: IEntry[]
  method: PaymentMethod
  proofOfRefundURL: string
  refundDate: Date
  remarks: IRemark[]
  uploadedBy: IUser
}

export interface IRefundInput extends Request {
  _id: string
  payerName: string
  referenceNumber: string
  amount: number
  entryList: string[]
  method: PaymentMethod
  proofOfRefundURL: string
  refundDate: Date
  remarks: IRemarkInput[]
  uploadedBy: string
}

export interface IRefundNode {
  _id: string
  payerName: string
  referenceNumber: string
  amount: number
  method: PaymentMethod
  refundDate: Date
  entries: String
}

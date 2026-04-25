import type { IEvent } from "./event.interface"
import type { Gender, IRemark, IRemarkInput } from "./shared.interface"
import type { JerseySize } from "./jersey.interface"
import type { IUser } from "./user.interface"
import type { IPlayer, IValidDocument } from "./player.interface"

export enum EntryStatus {
  PENDING = "PENDING",
  ASSIGNED = "ASSIGNED",
  LEVEL_PENDING = "LEVEL_PENDING",
  LEVEL_APPROVED = "LEVEL_APPROVED",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  PAYMENT_PARTIALLY_PAID = "PAYMENT_PARTIALLY_PAID",
  PAYMENT_REJECTED = "PAYMENT_REJECTED",
  PAYMENT_PAID = "PAYMENT_PAID",
  PAYMENT_VERIFIED = "PAYMENT_VERIFIED",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  PAYMENT_REFUNDED = "PAYMENT_REFUNDED",
  FULLY_REFUNDED = "FULLY_REFUNDED",
}

export enum TransactionType {
  INITIAL_FEE = "INITIAL_FEE",
  BALANCE_PAYMENT = "BALANCE_PAYMENT",
  REVERT_TRANSACTION = "REVERT_TRANSACTION",
  REFUND_PAYMENT = "REFUND_PAYMENT",
}

export interface IPlayerEntry {
  firstName: string
  middleName?: string
  lastName: string
  suffix?: string
  gender: Gender
  birthDate: Date
  email: string
  phoneNumber: string
  jerseySize?: JerseySize
  validDocuments?: IValidDocument[]
  address?: IAddress
}

export interface IEntryStatusLog {
  status: EntryStatus
  date: Date
  reason?: string
  by?: IUser
}

export interface ITransactions {
  transactionId: string
  transactionType: TransactionType
  pendingAmount: number
  amountChanged: number
  transactionDate: Date
}

export interface IAddress {
  country?: {
    code: string;
    name: string;
    alpha2Code?: string;
    alpha3Code?: string;
    flag?: string;
    region?: string;
    capital?: string;
    population?: number;
    area?: number;
  };
  region?: {
    code: string;
    name: string;
    regionName: string;
    psgcCode: string;
  };
  province?: {
    code: string;
    name: string;
    regionCode: string;
    psgcCode: string;
  };
  city?: {
    code: string;
    name: string;
    provinceCode: string;
    regionCode: string;
    psgcCode: string;
    classification: string;
  };
  barangay?: {
    code: string;
    name: string;
    cityCode: string;
    provinceCode: string;
    regionCode: string;
    psgcCode: string;
  };
  street?: string;
  zipCode?: string;
  fullAddress?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface IEntry {
  _id: string
  entryNumber: string
  entryKey: string
  event: IEvent
  club?: string
  player1Entry: IPlayerEntry
  player2Entry?: IPlayerEntry
  connectedPlayer1?: IPlayer
  connectedPlayer2?: IPlayer
  isInSoftware: boolean
  isEarlyBird: boolean
  statuses: IEntryStatusLog[]
  transactions: ITransactions[]
  remarks?: IRemark[]
  validDocuments?: IValidDocument[]
}

export interface IEntryNode {
  _id: string
  dateUpdated: Date
  entryNumber: string
  entryKey: string
  club: string
  tournamentName: string
  playerList: {
    player1Name: string
    player2Name?: string
  }
  isInSoftware: boolean
  isEarlyBird: boolean
  currentStatus: EntryStatus
}

export interface IEntryStatusLogInput {
  status: EntryStatus
  date: Date
  reason?: string
  by?: string
}

export interface IEntryInput {
  _id: string
  entryNumber: string
  entryKey: string
  event: IEvent
  club: string
  player1Entry: IPlayerEntry
  player2Entry?: IPlayerEntry
  isInSoftware: boolean
  isEarlyBird: boolean
  statuses: IEntryStatusLogInput[]
  remarks?: IRemarkInput[]
  connectedPlayer1?: string
  connectedPlayer2?: string
  isPlayer1New?: boolean
  isPlayer2New?: boolean
  migratePlayer1Data?: Partial<IMigratePlayerData>
  migratePlayer2Data?: Partial<IMigratePlayerData>
}

export interface IMigratePlayerData {
  firstName?: boolean
  middleName?: boolean
  lastName?: boolean
  suffix?: boolean
  gender?: boolean
  birthDate?: boolean
  email?: boolean
  phoneNumber?: boolean
}

export interface IAssignPlayersInput extends Request {
  entry: string
  isPlayer1New: boolean
  isPlayer2New?: boolean
  connectedPlayer1?: string
  connectedPlayer2?: string
  migratePlayer1Data?: Partial<IMigratePlayerData>
  migratePlayer2Data?: Partial<IMigratePlayerData>
}

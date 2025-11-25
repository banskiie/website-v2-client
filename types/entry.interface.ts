import type { IEvent } from "./event.interface.js"
import type { Gender, IRemark, IRemarkInput } from "./shared.interface.js"
import type { JerseySize } from "./jersey.interface.js"
import type { IUser } from "./user.interface.js"
import type { IPlayer } from "./player.interface.js"
import type { ITournament } from "./tournament.interface.js"

export enum EntryStatus {
  PENDING = "PENDING",
  ASSIGNED = "ASSIGNED",
  LEVEL_PENDING = "LEVEL_PENDING",
  LEVEL_APPROVED = "LEVEL_APPROVED",
  LEVEL_VERIFIED = "LEVEL_VERIFIED",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  PAYMENT_PARTIALLY_PAID = "PAYMENT_PARTIALLY_PAID",
  PAYMENT_PAID = "PAYMENT_PAID",
  PAYMENT_VERIFIED = "PAYMENT_VERIFIED",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
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
}

export interface IEntryStatusLog {
  status: EntryStatus
  date: Date
  reason?: string
  by?: IUser
}

export interface IEntry extends Document {
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
  remarks?: IRemark[]
  tournament: ITournament
}

export interface IEntryStatusLogInput {
  status: EntryStatus
  date: Date
  reason?: string
  by?: string
}

export interface IEntryInput extends Request {
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

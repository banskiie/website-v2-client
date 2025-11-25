import type { IPlayer } from "./player.interface.js"
import type { ITournament } from "./tournament.interface.js"

export enum JerseyStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  CLAIMED = "CLAIMED",
  CANCELLED = "CANCELLED",
}

export enum JerseySize {
  XXS = "XXS",
  XS = "XS",
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
  XXL = "XXL",
  XXXL = "XXXL",
  XXXXL = "XXXXL",
  XXXXXL = "XXXXXL",
}

export interface IJerseyStatusLog {
  status: JerseyStatus
  dateUpdated: Date
}

export interface IJersey extends Document {
  _id: string
  size: JerseySize
  statuses: IJerseyStatusLog[]
  player: IPlayer
  tournament: ITournament
}

export interface IJerseyInput extends Request {
  _id?: string
  size: JerseySize
  statuses: IJerseyStatusLog[]
  player: string
  tournament: string
}

import type { ITournament } from "./tournament.interface.js"

export enum EventGender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  MIXED = "MIXED",
}

export enum EventType {
  SINGLES = "SINGLES",
  DOUBLES = "DOUBLES",
}

export enum EventLocation {
  LOCAL = "LOCAL",
  NATIONAL = "NATIONAL",
  MINDANAO = "MINDANAO",
  INTERNATIONAL = "INTERNATIONAL",
}

export enum EventCurrency {
  PHP = "PHP",
  USD = "USD",
}

export interface IEvent {
  _id: string
  name: string
  gender: EventGender
  type: EventType
  maxEntries: number
  pricePerPlayer: number
  earlyBirdPricePerPlayer?: number
  currency: EventCurrency
  location: EventLocation
  maxAge?: number
  minAge?: number
  tournament: ITournament
  isDissolved: boolean
  isActive: boolean
}

export interface IEventInput {
  _id: string
  name: string
  gender: EventGender
  type: EventType
  pricePerPlayer: number
  earlyBirdPricePerPlayer?: number
  currency: EventCurrency
  location: EventLocation
  maxAge?: number
  minAge?: number
  tournament: string
  isDissolved: boolean
  maxEntries: number
  isActive: boolean
}

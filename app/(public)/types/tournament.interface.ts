export interface ITournamentSettings {
  hasEarlyBird: boolean
  hasFreeJersey: boolean
  ticket: string
  maxEntriesPerPlayer: number
}

export interface ITournamentDates {
  registrationStart: Date
  registrationEnd: Date
  earlyBirdRegistrationEnd?: Date
  earlyBirdPaymentEnd?: Date
  registrationPaymentEnd: Date
  tournamentStart: Date
  tournamentEnd: Date
}

export interface ITournamentBanks {
  name: string
  accountNumber: string
  imageURL?: string
}

export interface ITournamentEvent {
  _id: string
  name: string
  type: string
  level?: string
  gender?: string
  pricePerPlayer?: number
  earlyBirdPricePerPlayer?: number
  maxEntries?: number
  currency?: string
  isActive: boolean
  minAge?: number
  maxAge?: number
}

export interface ITournament {
  _id: string
  name: string
  settings: ITournamentSettings
  dates: ITournamentDates
  banks: ITournamentBanks[]
  isActive: boolean
  events?: ITournamentEvent[]
}

export interface ITournamentNode {
  _id: string
  name: string
  isActive: boolean
  hasEarlyBird: boolean
  hasFreeJersey: boolean
  tournamentStart: Date
  tournamentEnd: Date
  eventCount: number
}

export interface ITournamentInput {
  _id?: string
  name: string
  settings: ITournamentSettings
  dates: ITournamentDates
  banks: ITournamentBanks[]
  isActive: boolean
}

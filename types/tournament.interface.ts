export interface ITournamentSettings {
  hasEarlyBird: boolean
  hasFreeJersey: boolean
  ticket: string // Example: "V8"
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

export interface ITournament {
  _id: string
  name: string
  settings: ITournamentSettings
  dates: ITournamentDates
  banks: ITournamentBanks[]
  isActive: boolean
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

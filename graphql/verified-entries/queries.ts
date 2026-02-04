import { gql } from "@apollo/client"

export const VERIFIED_ENTRIES_BY_TOURNAMENT = gql`
  query VerifiedEntriesByTournament($tournamentId: ID!) {
    verifiedEntriesByTournament(tournamentId: $tournamentId) {
      eventId
      eventName
      totalEntries
      entryNumbers
    }
  }
`
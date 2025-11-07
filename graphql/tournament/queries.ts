import gql from "graphql-tag";

export const TOURNAMENT_OPTIONS = gql`
query TournamentOptions {
    tournamentOptions {
        label
        value
        hasEarlyBird
        hasFreeJersey
        tournamentStart
        tournamentEnd
        isActive
    }
}
`
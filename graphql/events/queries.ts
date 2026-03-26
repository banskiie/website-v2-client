import { gql } from "@apollo/client";

export const PUBLIC_TOURNAMENTS = gql`
  query PublicTournaments {
    publicTournaments {
      _id
      name
      isActive
      createdAt
      updatedAt
      settings {
        hasEarlyBird
        hasFreeJersey
        ticket
        maxEntriesPerPlayer
      }
      events {
        _id
        name
        gender
        type
        maxEntries
        pricePerPlayer
        earlyBirdPricePerPlayer
        currency
        location
        maxAge
        minAge
        isClosed
        createdAt
        updatedAt
      }
      dates {
        registrationStart
        registrationEnd
        earlyBirdRegistrationEnd
        earlyBirdPaymentEnd
        registrationPaymentEnd
        tournamentStart
        tournamentEnd
      }
    }
  }
`

export const FETCH_EVENT_WITH_TOURNAMENT = gql`
  query FetchEventWithTournament($id: ID!) {
    event(_id: $id) {
      _id
      name
      gender
      type
      maxEntries
      pricePerPlayer
      earlyBirdPricePerPlayer
      currency
      location
      maxAge
      minAge
      isClosed
      isActive
      createdAt
      updatedAt
      tournament {
        _id
        name
        isActive
        dates {
          registrationStart
          registrationEnd
          earlyBirdRegistrationEnd
          earlyBirdPaymentEnd
          registrationPaymentEnd
          tournamentStart
          tournamentEnd
        }
        settings {
          hasEarlyBird
          hasFreeJersey
          ticket
        }
      }
    }
  }
`


export const ENTRY_EVENT_AMOUNT_DETAILS = gql`
  query EntryEventAmountDetails($referenceNumber: String!) {
    entryEventAmountDetails(referenceNumber: $referenceNumber) {
      amount
      deadline
      isEarlyBird
      entry {
        _id
        entryNumber
        entryKey
        isEarlyBird
        statuses {
          status
          date
          reason
        }
        event {
          type
        }
      }
    }
  }
`

export const EVENT_CHANGED_SUBSCRIPTION = gql`
  subscription EventChanged {
    eventChanged {
      type
      event {
        _id
        name
        gender
        type
        isClosed
      }
    }
  }
`
import gql from "graphql-tag";

export const CHECK_ENTRY = gql`
  query CheckEntry($entryNumber: String!, $entryKey: String!) {
    checkEntry(entryNumber: $entryNumber, entryKey: $entryKey) {
      _id
      entryNumber
      entryKey
      club
      isInSoftware
      isEarlyBird
      event {
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
        isDissolved
        isActive
        createdAt
        updatedAt
      }
      remarks {
        remark
        date
        by {
          _id
          name
          email
          contactNumber
          username
          role
          isActive
          createdAt
          updatedAt
        }
      }
      statuses {
        status
        date
        reason
        by {
          _id
          name
          email
          contactNumber
          username
          role
          isActive
          createdAt
          updatedAt
        }
      }
    }
  }
`
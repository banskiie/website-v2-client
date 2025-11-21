import gql from "graphql-tag";

export const ENTRY_STATUS_HISTORY = gql`
  query EntryStatusHistory($referenceNumber: String!) {
    entryStatusHistory(referenceNumber: $referenceNumber) {
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
`

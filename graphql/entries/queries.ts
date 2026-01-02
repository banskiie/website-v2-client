import gql from "graphql-tag";

export const ENTRY_STATUS_HISTORY = gql`
  query EntryStatusHistory($referenceNumber: String!) {
    entryStatusHistory(referenceNumber: $referenceNumber) {
      status
      date
      reason
    }
  }
`

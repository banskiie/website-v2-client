import { gql } from "graphql-tag"

export const CHECK_DUPLICATE_REFERENCE = gql`
  query CheckDuplicateReference($referenceNumber: String!) {
    checkDuplicateReference(referenceNumber: $referenceNumber) {
      _id
      payerName
      referenceNumber
      amount
      method
      paymentDate
      proofOfPaymentURL
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
      entryList {
        isFullyPaid
        entry {
          _id
          entryNumber
          entryKey
        }
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
    }
  }
`

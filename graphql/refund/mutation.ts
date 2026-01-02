// graphql/refund.graphql
import { gql } from '@apollo/client'

export const CREATE_REFUND = gql`
  mutation CreateRefund($input: CreateRefundInput!) {
    createRefund(input: $input) {
      ok
      message
    }
  }
`

export const UPDATE_REFUND = gql`
  mutation UpdateRefund($input: UpdateRefundInput!) {
    updateRefund(input: $input) {
      ok
      message
    }
  }
`

export const DELETE_REFUND = gql`
  mutation DeleteRefund($id: ID!) {
    deleteRefund(_id: $id) {
      ok
      message
    }
  }
`

export const GET_REFUND = gql`
  query GetRefund($id: ID!) {
    refund(_id: $id) {
      _id
      payerName
      referenceNumber
      amount
      entry {
        _id
        entryNumber
        entryKey
        player1Entry {
          firstName
          lastName
          email
        }
        player2Entry {
          firstName
          lastName
          email
        }
        event {
          name
          tournament {
            name
          }
        }
        statuses {
          status
          date
          reason
        }
      }
      method
      proofOfPaymentURL
      paymentDate
      remarks {
        remark
        date
        by {
          firstName
          lastName
        }
      }
      uploadedBy {
        _id
        firstName
        lastName
        email
      }
      createdAt
      updatedAt
    }
  }
`

export const GET_REFUNDS = gql`
  query GetRefunds(
    $first: Int
    $after: String
    $search: String
    $filter: [Filter!]
    $sort: Sort
  ) {
    refunds(
      first: $first
      after: $after
      search: $search
      filter: $filter
      sort: $sort
    ) {
      total
      pages
      edges {
        cursor
        node {
          _id
          payerName
          referenceNumber
          amount
          entry {
            _id
            entryNumber
            entryKey
          }
          method
          paymentDate
          createdAt
          uploadedBy {
            _id
            firstName
            lastName
            email
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

export const ON_REFUND_CHANGED = gql`
  subscription OnRefundChanged {
    refundChanged {
      type
      refund {
        _id
        payerName
        referenceNumber
        amount
        entry {
          _id
          entryNumber
          entryKey
        }
        method
        paymentDate
        uploadedBy {
          _id
          firstName
          lastName
          email
        }
      }
    }
  }
`

export const GET_ENTRY_DETAILS = gql`
  query GetEntryDetails($search: String, $first: Int = 10) {
    entries(
      first: $first
      search: $search
      filter: [
        {
          key: "currentStatus"
          value: "VERIFIED,PAYMENT_VERIFIED,PAYMENT_PAID"
          type: "TEXT"
        }
      ]
    ) {
      edges {
        node {
          _id
          entryNumber
          entryKey
          player1Entry {
            firstName
            lastName
            email
          }
          player2Entry {
            firstName
            lastName
            email
          }
          event {
            name
            tournament {
              name
            }
          }
          currentStatus
        }
      }
    }
  }
`
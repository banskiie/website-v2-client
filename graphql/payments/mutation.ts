import { gql } from "graphql-tag";

export const CREATE_PAYMENT = gql`
  mutation CreatePayment(
    $referenceNumber: String
    $amount: Float!
    $paymentDate: DateTime!
    $proofOfPaymentURL: String!
    $payerName: String!
    $entryList: [EntryListInput!]!
  ) {
    createPayment(
      input: {
        referenceNumber: $referenceNumber
        amount: $amount
        paymentDate: $paymentDate
        proofOfPaymentURL: $proofOfPaymentURL
        payerName: $payerName
        entryList: $entryList
      }
    ) {
      ok
      message
    }
  }
`;

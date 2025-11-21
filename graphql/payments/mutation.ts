import { gql } from "graphql-tag";

export const CREATE_PAYMENT = gql`
  mutation CreatePayment($input: CreatePaymentInput!) {
    createPayment(input: $input) {
      ok
      message
    }
  }
`

import { gql } from "@apollo/client";

export const SEND_OTP = gql`
  mutation SendOTP($email: String!) {
    sendOTP(email: $email) {
      ok
      message
    }
  }
`

export const VERIFY_OTP = gql`
  mutation VerifyOTP($email: String!, $code: String!) {
    verifyOTP(email: $email, code: $code) {
      ok
      message
    }
  }
`

export const SEND_USER_MESSAGE = gql`
   mutation SendUserMessage($email: String!, $message: String!) {
    sendUserMessage(email: $email, message: $message) {
      ok
      message
    }
  }
`
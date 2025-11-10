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
      ticket {
        _id
        name
        email
      }
    }
  }
`
export const ADD_TICKET_NAME = gql`
  mutation AddTicketUserName($email: String!, $name: String!) {
    addTicketUserName(email: $email, name: $name) {
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
export const GET_TICKET_MESSAGES = gql`
  query Ticket($id: ID!, $first: Int!) {
    ticket(_id: $id, first: $first) {
      _id
      email
      name
      total
      conversation {
        sender
        message
        timestamp
        agent {
          name
          _id
        }
      }
    }
  }
`

export const NEW_MESSAGE_SUBSCRIPTION = gql`
  subscription NewMessage($id: ID!) {
    newMessage(_id: $id) {
      ticketId
      latestMessage {
        sender
        message
        timestamp
        agent {
          name
        }
      }
    }
  }
`



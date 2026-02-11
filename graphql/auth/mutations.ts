import { gql } from "@apollo/client"

export const SIGN_IN = gql`
  mutation SignIn(
    $username: String!
    $password: String!
    $rememberMe: Boolean!
  ) {
    signIn(username: $username, password: $password, rememberMe: $rememberMe) {
      ok
      message
      data {
        accessToken
        refreshToken
        user {
          _id
          name
          email
          contactNumber
          username
          role
          devices {
            ip
            browser
            os
            device
            lastLogin
            lastLogout
          }
        }
      }
    }
  }
`

export const SIGN_OUT = gql`
  mutation SignOut {
    signOut {
      ok
      message
    }
  }
`

export const REFRESH_ACCESS_TOKEN = gql`
  mutation RefreshToken($accessToken: String!) {
    refreshToken(token: $accessToken) {
      ok
      message
      data {
        accessToken
      }
    }
  }
`

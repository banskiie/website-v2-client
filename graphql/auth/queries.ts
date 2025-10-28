import { gql } from "@apollo/client"

export const ME = gql`
  query Me {
    me {
      _id
      name
      email
      contactNumber
      username
      role
      isActive
      createdAt
      updatedAt
      devices {
        ip
        userAgent
        browser
        os
        device
        lastLogin
        lastLogout
      }
    }
  }
`

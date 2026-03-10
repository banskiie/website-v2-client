import { config } from "dotenv"

config({ path: ".env" })

export const {
  NEXT_PUBLIC_GRAPHQL_HTTPS_URI,
  NEXT_PUBLIC_GRAPHQL_SUBSCRIPTION_WSS_URI,
  NEXT_PUBLIC_JWT_ACCESS_SECRET,
  NEXT_PUBLIC_GRAPHQL_URI,
  NEXT_PUBLIC_GRAPHQL_WS_URI,
} = process.env

// console.log("Environment variables loaded for client...")

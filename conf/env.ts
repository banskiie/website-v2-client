import { config } from "dotenv"

config({ path: ".env" })

export const {
  NEXT_PUBLIC_GRAPHQL_HTTP_URI,
  NEXT_PUBLIC_GRAPHQL_SUBSCRIPTION_URI,
  NEXT_PUBLIC_JWT_ACCESS_SECRET,
} = process.env

console.log("Environment variables loaded for client...")

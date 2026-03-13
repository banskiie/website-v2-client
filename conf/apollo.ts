import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  Observable,
  split,
} from "@apollo/client"
import { SetContextLink } from "@apollo/client/link/context"
import { useAuthStore } from "@/store/auth.store"
import { ErrorLink } from "@apollo/client/link/error"
import { GraphQLWsLink } from "@apollo/client/link/subscriptions"
import { createClient } from "graphql-ws"
import { OperationTypeNode } from "graphql"

console.log(process.env.NEXT_PUBLIC_GRAPHQL_URI)

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URI!,
  credentials: "include",
})

const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.NEXT_PUBLIC_GRAPHQL_WS_URI!,
  }),
)

const authLink = new SetContextLink(({ headers }) => {
  // Fetch the token from your zustand auth store
  const token = useAuthStore.getState().accessToken
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  }
})

const errorLink = new ErrorLink(({ error, operation, forward }: any) => {
  if (error.name === "ServerError") {
    const errorResponse = JSON.parse(error.bodyText)
    switch (errorResponse?.code) {
      case "ACCESS_TOKEN_EXPIRED":
        console.warn("Access token expired, refreshing access token...")
        // Call refreshToken (assumed to be async)
        return new Observable((observer) => {
          useAuthStore
            .getState()
            .refreshToken()
            .then(() => {
              // Update the operation context with the new token
              operation.setContext(({ headers = {} }) => ({
                headers: {
                  ...headers,
                  authorization: useAuthStore.getState().accessToken
                    ? `Bearer ${useAuthStore.getState().accessToken}`
                    : "",
                },
              }))

              // Retry the original operation
              const sub = forward(operation).subscribe({
                next: (value: any) => observer.next(value),
                error: (err: any) => observer.error(err),
                complete: () => observer.complete(),
              })
              return () => sub.unsubscribe()
            })
            .catch(() => {
              observer.error(error)
            })
        })
      case "INVALID_ACCESS_TOKEN":
        console.warn("Invalid access token, logging out...")
        useAuthStore.getState().clearAuth()
        break
      case "INVALID_REFRESH_TOKEN":
        console.warn("Invalid refresh token, logging out...")
        useAuthStore.getState().clearAuth()
        break
      case "REFRESH_TOKEN_EXPIRED":
        console.warn("Invalid refresh token, logging out...")
        useAuthStore.getState().clearAuth()
        break
      case "DEVICE_NOT_RECOGNIZED":
        console.warn("Device not recognized, logging out...")
        useAuthStore.getState().clearAuth()
        break
    }
  }
  if (error.message === "jwt expired") {
    console.warn("test")
    useAuthStore.getState().clearAuth()
  }

  return forward(operation)
})

const splitLink = split(
  ({ operationType }) => {
    return operationType === OperationTypeNode.SUBSCRIPTION
  },
  wsLink,
  errorLink.concat(authLink).concat(httpLink),
)

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
})

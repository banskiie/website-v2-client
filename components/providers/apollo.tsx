"use client"
import { client } from "@/conf/apollo"
import { ApolloProvider } from "@apollo/client/react"

const ApolloLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => <ApolloProvider client={client}>{children}</ApolloProvider>

export default ApolloLayout

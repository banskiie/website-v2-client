import { create } from "zustand"
import { persist } from "zustand/middleware"
import { client } from "@/conf/apollo"
import { gql } from "@apollo/client"
import {
  REFRESH_ACCESS_TOKEN,
  SIGN_OUT,
  SIGN_IN,
} from "@/graphql/auth/mutations"
import { ME } from "@/graphql/auth/queries"

interface AuthState {
  accessToken: string | null
  user: any | null
  isAuthenticated: boolean
  signIn: ({
    username,
    password,
    rememberMe,
  }: {
    username: string
    password: string
    rememberMe: boolean
  }) => Promise<void>
  signOut: () => Promise<void>
  clearAuth: () => void
  refreshAuthUser: () => Promise<void>
  refreshToken: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      signIn: async ({ username, password, rememberMe }) => {
        const response: any = await client.mutate({
          mutation: SIGN_IN,
          variables: { username, password, rememberMe },
        })
        if (response.data?.signIn.ok && response.data.signIn.data) {
          set({
            accessToken: response.data.signIn.data.accessToken,
            user: response.data.signIn.data.user,
            isAuthenticated: true,
          })
          // Redirect to dashboard after successful sign in
          window.location.href = "/dashboard"
        }

        return response
      },
      signOut: async () => {
        const response: any = await client.mutate({
          mutation: SIGN_OUT,
        })
        if (response.data?.signOut.ok) {
          get().clearAuth()
        }
      },
      refreshAuthUser: async () => {
        try {
          const response: any = await client.query({
            query: ME,
            fetchPolicy: "cache-first",
          })
          if (response.data?.me) set({ user: response.data.me })
        } catch (error) {
          console.error("Failed to refresh auth user:", error)
        }
      },
      clearAuth: async () => {
        set({ accessToken: null, user: null, isAuthenticated: false })
        console.log("Auth cleared, redirecting to login...")
        window.location.href = "/dashboard"
      },
      refreshToken: async () => {
        const response: any = await client.mutate({
          mutation: REFRESH_ACCESS_TOKEN,
          variables: { accessToken: get().accessToken },
        })
        if (response.data?.refreshToken.ok && response.data.refreshToken.data) {
          set({
            accessToken: response.data.refreshToken.data.accessToken,
          })
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
)

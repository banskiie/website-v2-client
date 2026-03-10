import { create } from "zustand"
import { persist } from "zustand/middleware"
import { client } from "@/conf/apollo"
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

        // console.log("logging in")
        const response: any = await fetch("/api/auth", {
          method: "POST",
          credentials: "include", // 🔑 sends cookies automatically
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, rememberMe }),
        }).then((res) => {
          return res.json()
        })

        if (response.user && response.accessToken) {
          set({
            accessToken: response.accessToken,
            user: response.user,
            isAuthenticated: true,
          })
          window.location.href = "/dashboard"
        }

        return response
      },
      signOut: async () => {
        const response: any = await client.mutate({
          mutation: SIGN_OUT,
          variables: {
            token: get().accessToken,
          },
        })
        if (response.data?.signOut.ok) get().clearAuth()
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
        await fetch("/api/logout", {
          method: "POST",
          credentials: "include",
        })
        set({ accessToken: null, user: null, isAuthenticated: false })
        // console.log("Auth cleared, redirecting to login...")
        window.location.href = "/"
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
    },
  ),
)

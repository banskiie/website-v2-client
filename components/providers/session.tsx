"use client"
import { useAuthStore } from "@/store/auth.store"
import { useEffect } from "react"

const SessionLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const refreshAuthUser = useAuthStore((state) => state.refreshAuthUser)

  useEffect(() => {
    if (isAuthenticated) {
      refreshAuthUser()
    }
  }, [isAuthenticated, refreshAuthUser])

  return <div>{children}</div>
}

export default SessionLayout

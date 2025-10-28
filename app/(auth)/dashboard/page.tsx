"use client"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/store/auth.store"

const Page = () => {
  const user = useAuthStore((state) => state.user)
  return (
    <div>
      <Label className="text-3xl font-semibold">Hi, {user?.name}!</Label>
    </div>
  )
}

export default Page

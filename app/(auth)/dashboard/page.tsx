"use client"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/store/auth.store"
import Image from "next/image"

const Page = () => {
  const user = useAuthStore((state) => state.user)
  return (
    <div>
      <Label className="text-3xl font-semibold">Hi, {user?.name}!</Label>
      <Image
        src={
          "https://drive.google.com/uc?export=view&id=1YYRnRhe_c_zWFwABiK_QipuDzrI2Qz53"
        }
        alt="Image"
        width={600}
        height={400}
        className="mt-4 rounded-lg"
        loading="lazy"
      />
    </div>
  )
}

export default Page

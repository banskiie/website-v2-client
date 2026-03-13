import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  const cookieStore = await cookies()

  cookieStore.set("accessToken", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    domain: ".c-one.ph",
    path: "/",
    expires: new Date(0), // expire immediately
  })

  cookieStore.set("refreshToken", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    domain: ".c-one.ph",
    path: "/",
    expires: new Date(0),
  })

  return NextResponse.json({ ok: true })
}
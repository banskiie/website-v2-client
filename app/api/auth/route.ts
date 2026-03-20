// app/api/auth/route.ts
import { NextResponse } from "next/server"
import { client } from "@/conf/apollo"
import { SIGN_IN } from "@/graphql/auth/mutations"
import { cookies } from "next/headers"

const isProduction = process.env.NODE_ENV === "production"

export async function POST(req: Request) {
  const { username, password, rememberMe } = await req.json()
  const response: any = await client.mutate({
    mutation: SIGN_IN,
    variables: { username, password, rememberMe },
  })

  if (response.data?.signIn.ok && response.data.signIn.data) {
    // Set HttpOnly cookies
    const cookieStore = await cookies()

    cookieStore.set("accessToken", response.data.signIn.data.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
      ...(isProduction && { domain: ".c-one.ph" }),
    })

    cookieStore.set("refreshToken", response.data.signIn.data.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60,
      ...(isProduction && { domain: ".c-one.ph" }),
    })
  }

  return NextResponse.json({
    user: response.data?.signIn.data.user,
    accessToken: response.data?.signIn.data.accessToken,
  })
}

// app/api/auth/route.ts
import { NextResponse } from "next/server"
import { client } from "@/conf/apollo"
import { SIGN_IN } from "@/graphql/auth/mutations"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  const { username, password, rememberMe } = await req.json()
  const response: any = await client.mutate({
    mutation: SIGN_IN,
    variables: { username, password, rememberMe },
  })

  if (response.data?.signIn.ok && response.data.signIn.data) {
    // Set HttpOnly cookies
    const cookieStore = await cookies()

    // cookieStore.set("accessToken", response.data.signIn.data.accessToken, {
    //   httpOnly: true, // inaccessible by JS
    //   secure: true, // always secure when sameSite is "none"
    //   sameSite: "none", // cross-site allowed (ngrok / Vercel)
    //   path: "/", // available on all routes
    //   maxAge: 15 * 60, // 15 minutes
    // })
    // cookieStore.set("refreshToken", response.data.signIn.data.refreshToken, {
    //   httpOnly: true, // inaccessible by JS
    //   secure: true, // always secure when sameSite is "none"
    //   sameSite: "none", // cross-site allowed (ngrok / Vercel)
    //   path: "/", // available on all routes
    //   maxAge: 24 * 60 * 60 * 1000, // 1 day
    // })

    cookieStore.set("accessToken", response.data.signIn.data.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      domain: ".c-one.ph",
      path: "/",
      maxAge: 15 * 60,
    })

    cookieStore.set("refreshToken", response.data.signIn.data.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      domain: ".c-one.ph",
      path: "/",
      maxAge: 24 * 60 * 60,
    })
  }

  return NextResponse.json({
    user: response.data?.signIn.data.user,
    accessToken: response.data?.signIn.data.accessToken,
  })
}

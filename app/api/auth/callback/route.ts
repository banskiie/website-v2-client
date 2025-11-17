import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 })
  }

  const tokenUrl = "https://oauth2.googleapis.com/token"

  const data = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    grant_type: "authorization_code",
  }

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(data),
  })

  const tokens = await response.json()

  return NextResponse.json(tokens) // includes access_token + refresh_token
}

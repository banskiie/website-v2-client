import { Readable } from "stream"
import { NextResponse } from "next/server"
import { google } from "googleapis"
import https from "https"

// 🔥 FORCE IPv4 agent
const agent = new https.Agent({
  family: 4,
})

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
)

// 🔥 Attach agent directly (THIS is the real fix)
oauth2Client.transporter = new google.auth.OAuth2().transporter
oauth2Client.transporter.defaults = {
  ...oauth2Client.transporter.defaults,
  agent,
}

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const stream = Readable.from(buffer)

    console.log({
      CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      REFRESH: !!process.env.GOOGLE_REFRESH_TOKEN,
    })

    // // ✅ NEVER use NEXT_PUBLIC for secrets
    // const oauth2Client = new google.auth.OAuth2(
    //   process.env.GOOGLE_CLIENT_ID!,
    //   process.env.GOOGLE_CLIENT_SECRET!,
    //   process.env.GOOGLE_REDIRECT_URI!,
    // )

    // oauth2Client.setCredentials({
    //   refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
    // })

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    })

    const response = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: file.name,
          description: "Uploaded via API",
        },
        status: {
          privacyStatus: "unlisted",
        },
      },
      media: {
        mimeType: file.type, // ✅ important
        body: stream,
      },
    })

    return NextResponse.json({
      videoId: response.data.id,
      url: `https://youtu.be/${response.data.id}`,
    })
  } catch (error: any) {
    console.error("FULL ERROR:", error)
    console.error("RESPONSE DATA:", error?.response?.data)
    console.error("ERROR MESSAGE:", error?.message)

    return NextResponse.json(
      {
        error:
          error?.response?.data?.error?.message ||
          error?.message ||
          "Upload failed",
      },
      { status: 500 },
    )
  }
}

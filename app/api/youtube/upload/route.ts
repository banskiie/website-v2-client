import { google } from "googleapis"
import { Readable } from "stream"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const buffer = Buffer.from(await file.arrayBuffer())
    const stream = Readable.from(buffer)

    const oauth2Client = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!,
      process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!,
    )

    // const oauth2Client = new google.auth.OAuth2(
    //   process.env.GOOGLE_CLIENT_ID,
    //   process.env.GOOGLE_CLIENT_SECRET,
    //   process.env.GOOGLE_REDIRECT_URI,
    // )

    oauth2Client.setCredentials({
      refresh_token: process.env.NEXT_PUBLIC_GOOGLE_REFRESH_TOKEN!,
    })

    const youtube = google.youtube({ version: "v3", auth: oauth2Client })
    const response = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: { title: file.name, description: "Uploaded via API" },
        status: { privacyStatus: "unlisted" },
      },
      media: { body: stream },
    })

    return NextResponse.json({
      videoId: response.data.id,
      url: `https://youtu.be/${response.data.id}`,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: (error as Error).message || "Upload failed" },
      { status: 500 },
    )
  }
}

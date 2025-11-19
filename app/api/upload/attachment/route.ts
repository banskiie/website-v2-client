import { NextResponse } from "next/server"
import { Readable } from "stream"
import { google } from "googleapis"
import sharp from "sharp"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    console.log(file)

    if (!file)
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    // If image, compress it before uploading
    const stream = Readable.from(
      file?.type.startsWith("image/") //
        ? await sharp(buffer) // Compress images
            .resize({ width: 1080 })
            .jpeg({ quality: 70 })
            .toBuffer()
        : buffer
    )

    // Google Drive auth
    const auth = new google.auth.JWT({
      email: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_EMAIL,
      key: process.env.NEXT_PUBLIC_GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/drive"],
    })

    const drive = google.drive({ version: "v3", auth })

    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [process.env.NEXT_PUBLIC_GOOGLE_DRIVE_ATTACHMENT_FOLDER!],
      },
      media: {
        mimeType: file?.type,
        body: stream,
      },
      fields: "id",
      supportsAllDrives: true,
    })

    // Generate Google Drive view link for images/documents, and preview link for videos
    const fileId = response.data.id
    return NextResponse.json(
      {
        name: file.name,
        size: file.size,
        type: file.type,
        url: file?.type.startsWith("video/")
          ? `https://drive.google.com/file/d/${fileId}/preview`
          : `https://drive.google.com/uc?id=${fileId}`,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("❌ Error uploading file:", error)
    return NextResponse.json(
      { message: "Error uploading file", error: error.message },
      { status: 500 }
    )
  }
}
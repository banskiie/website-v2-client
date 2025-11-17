import { NextResponse } from "next/server"
import { Readable } from "stream"
import { google } from "googleapis"
import sharp from "sharp"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Read input file as buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // ⭐ COMPRESS IMAGE USING SHARP ⭐
    const compressedBuffer = await sharp(buffer)
      .resize({ width: 1080 }) // optional resize
      .jpeg({ quality: 70 }) // compress to ~70% quality
      .png({ quality: 70 })
      .toBuffer()

    // Convert compressed buffer to stream
    const stream = Readable.from(compressedBuffer)

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
        parents: [process.env.NEXT_PUBLIC_GOOGLE_DRIVE_IMAGE_FOLDER!],
      },
      media: {
        mimeType: "image/jpeg",
        body: stream,
      },
      fields: "id",
      supportsAllDrives: true,
    })

    return NextResponse.json(
      {
        message: "Image uploaded & compressed successfully!",
        url: `https://drive.google.com/uc?export=view&id=${response.data.id}`,
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
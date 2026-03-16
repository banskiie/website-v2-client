import { NextResponse } from "next/server"
import sharp from "sharp"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const processedBuffer = file.type.startsWith("image/")
      ? await sharp(buffer)
          .resize({ width: 1080 })
          .jpeg({ quality: 70 })
          .toBuffer()
      : buffer

    const result: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "attachments",
          resource_type: "auto",
          format: (() => {
            switch (file.type) {
              case "application/pdf":
                return "pdf"
              case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
              case "application/msword":
                return "docx"
              case "image/png":
                return "png"
              case "image/jpg":
                return "jpg"
              case "video/mp4":
                return "mp4"
              case "video/quicktime":
                return "mov"
            }
          })(),
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        },
      )

      stream.end(processedBuffer)
    })

    return NextResponse.json({
      name: file.name,
      type: file.type, // MIME type
      size: file.size, // original file size
      resourceType: result.resource_type, // cloudinary type
      url: result.secure_url,
      publicId: result.public_id,
    })
  } catch (error: any) {
    console.error(JSON.stringify(error))
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

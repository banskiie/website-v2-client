// app/api/transfer/replace/route.ts
import { NextResponse } from "next/server"
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function POST(request: Request) {
  console.log("🔄 /api/transfer/replace called - CLOUDINARY VERSION")

  try {
    const { oldFileId, newFileId, documentType, playerType } = await request.json()

    console.log("📁 Request data:", { oldFileId, newFileId, documentType, playerType })

    if (!oldFileId || !newFileId) {
      return NextResponse.json(
        { success: false, error: "Both oldFileId and newFileId are required" },
        { status: 400 }
      )
    }

    const extractPublicId = (url: string): string | null => {
      if (!url) return null
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/)
      if (match && match[1]) {
        return match[1].replace(/\.[^.]+$/, '')
      }
      return url
    }

    const oldPublicId = extractPublicId(oldFileId)
    const newPublicId = extractPublicId(newFileId)

    if (!oldPublicId || !newPublicId) {
      return NextResponse.json(
        { success: false, error: "Could not extract public IDs" },
        { status: 400 }
      )
    }

    console.log(`📁 Extracted public IDs: old=${oldPublicId}, new=${newPublicId}`)

    try {
      // Get the new file info
      const newFile = await cloudinary.api.resource(newPublicId, {
        colors: false,
        exif: false,
      })

      console.log(`✅ Found new file: ${newFile.public_id}`)

      // Download the new file
      const newFileUrl = cloudinary.url(newPublicId, {
        secure: true,
        resource_type: newFile.resource_type
      })

      const response = await fetch(newFileUrl)
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`)
      }

      const buffer = Buffer.from(await response.arrayBuffer())

      // Upload to old public ID location using stream (exactly like your reference code)
      console.log(`📤 Uploading to old location: ${oldPublicId}`)

      const result: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            public_id: oldPublicId,
            overwrite: true,
            invalidate: true,
            resource_type: newFile.resource_type,
            format: newFile.format,
            tags: [...(newFile.tags || []), 'requirement', 'replaced'],
            context: {
              ...(newFile.context || {}),
              replaced_from: newPublicId,
              replaced_at: new Date().toISOString(),
              original_new_file: newPublicId
            }
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        stream.end(buffer)
      })

      console.log(`✅ Successfully updated content of old file: ${oldPublicId}`)

      // Delete the new file since it's now copied to the old location
      try {
        await cloudinary.uploader.destroy(newPublicId, {
          invalidate: true,
          resource_type: newFile.resource_type
        })
        console.log(`✅ Deleted new file: ${newPublicId}`)
      } catch (deleteError: any) {
        console.warn(`⚠️ Could not delete new file: ${deleteError.message}`)
      }

      return NextResponse.json(
        {
          success: true,
          message: "File replaced successfully",
          oldFileId: oldPublicId,
          newFileId: newPublicId,
          finalFileId: oldPublicId,
          newUrl: cloudinary.url(oldPublicId, {
            secure: true,
            resource_type: newFile.resource_type
          })
        },
        { status: 200 }
      )

    } catch (error: any) {
      console.error(`❌ Error processing files:`, error)
      return NextResponse.json(
        {
          success: false,
          message: `Failed to replace file: ${error.message}`
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("❌ Error in replace operation:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error replacing file",
        error: error.message
      },
      { status: 500 }
    )
  }
}
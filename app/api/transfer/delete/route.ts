import { NextResponse } from "next/server"
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function POST(request: Request) {
    console.log("🗑️ /api/transfer/delete called - CLOUDINARY VERSION")

    try {
        const { fileId, documentType, playerType, reason } = await request.json()

        console.log("📁 Request data:", { fileId, documentType, playerType, reason })

        if (!fileId) {
            return NextResponse.json(
                { success: false, error: "File ID is required" },
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

        const publicId = extractPublicId(fileId)

        if (!publicId) {
            return NextResponse.json(
                { success: false, error: "Could not extract public ID" },
                { status: 400 }
            )
        }

        console.log(`🗑️ Attempting to delete: ${publicId}`)

        try {
            // First, get the file info to know its resource type
            const resource = await cloudinary.api.resource(publicId, {
                colors: false,
                exif: false,
            }).catch(() => null)

            // Delete the file
            const result = await cloudinary.uploader.destroy(publicId, {
                invalidate: true,
                resource_type: resource?.resource_type || 'image'
            })

            console.log(`✅ Delete result:`, result)

            if (result.result === 'ok') {
                return NextResponse.json(
                    {
                        success: true,
                        message: `File deleted successfully`,
                        fileId: publicId,
                        result: result.result
                    },
                    { status: 200 }
                )
            } else {
                return NextResponse.json(
                    {
                        success: false,
                        error: `Failed to delete file: ${result.result}`,
                        fileId: publicId
                    },
                    { status: 500 }
                )
            }
        } catch (error: any) {
            console.error(`❌ Error deleting file:`, error)

            // If file doesn't exist, consider it as success (already deleted)
            if (error.http_code === 404) {
                return NextResponse.json(
                    {
                        success: true,
                        message: "File already deleted or not found",
                        fileId: publicId,
                        notFound: true
                    },
                    { status: 200 }
                )
            }

            return NextResponse.json(
                {
                    success: false,
                    error: error.message,
                    fileId: publicId
                },
                { status: error.http_code || 500 }
            )
        }
    } catch (error: any) {
        console.error("❌ Error in delete operation:", error)
        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            { status: 500 }
        )
    }
}
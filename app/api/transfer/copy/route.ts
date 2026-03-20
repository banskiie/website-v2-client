// // app/api/transfer/copy/route.ts
// import { NextResponse } from "next/server"
// import { google } from "googleapis"

// export async function POST(request: Request) {
//     try {
//         const { fileId } = await request.json()

//         if (!fileId) {
//             return NextResponse.json(
//                 { error: "File ID is required" },
//                 { status: 400 }
//             )
//         }

//         // Google Drive auth
//         const auth = new google.auth.JWT({
//             email: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_EMAIL,
//             key: process.env.NEXT_PUBLIC_GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
//             scopes: ["https://www.googleapis.com/auth/drive"],
//         })

//         const drive = google.drive({ version: "v3", auth })

//         // Get the original file metadata
//         const fileMetadata = await drive.files.get({
//             fileId: fileId,
//             fields: 'id, name',
//             supportsAllDrives: true,
//         })

//         const fileName = fileMetadata.data.name || `Copy of ${fileId}`
//         const requirementsFolder = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_REQUIREMENT_FOLDER

//         if (!requirementsFolder) {
//             return NextResponse.json(
//                 { error: "Requirements folder ID not configured" },
//                 { status: 500 }
//             )
//         }

//         // Create a copy in the requirements folder
//         const copiedFile = await drive.files.copy({
//             fileId: fileId,
//             requestBody: {
//                 name: fileName,
//                 parents: [requirementsFolder]
//             },
//             supportsAllDrives: true,
//         })

//         return NextResponse.json(
//             {
//                 success: true,
//                 message: `File copied successfully to requirements folder`,
//                 originalFileId: fileId,
//                 copiedFileId: copiedFile.data.id,
//                 newUrl: `https://drive.google.com/uc?id=${copiedFile.data.id}`
//             },
//             { status: 200 }
//         )
//     } catch (error: any) {
//         console.error("❌ Error copying file:", error)
//         return NextResponse.json(
//             {
//                 message: "Error copying file",
//                 error: error.message,
//                 code: error.code
//             },
//             { status: 500 }
//         )
//     }
// }

// app/api/transfer/copy/route.ts
import { NextResponse } from "next/server"
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
    console.log("🔄 /api/transfer/copy called - CLOUDINARY VERSION")

    try {
        const { fileId } = await request.json()
        console.log("📁 Received fileId:", fileId)

        if (!fileId) {
            console.error("❌ No fileId provided")
            return NextResponse.json(
                {
                    success: false,
                    error: "File ID is required"
                },
                { status: 400 }
            )
        }

        // Check if environment variables are set
        if (!process.env.CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET) {
            console.error("❌ Missing Cloudinary credentials")
            return NextResponse.json(
                {
                    success: false,
                    error: "Cloudinary credentials not configured",
                },
                { status: 500 },
            )
        }

        // Extract public ID from URL or use as-is
        const extractPublicId = (url: string): string | null => {
            if (!url) return null

            // Cloudinary URL pattern: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/public_id.jpg
            const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/)
            if (match && match[1]) {
                // Remove any file extension from the end
                return match[1].replace(/\.[^.]+$/, '')
            }

            // Also handle direct public ID from the request (if passed)
            return url
        }

        const publicId = extractPublicId(fileId)

        if (!publicId) {
            console.error("❌ Could not extract public ID from:", fileId)
            return NextResponse.json(
                {
                    success: false,
                    error: "Could not extract public ID from the provided file identifier",
                },
                { status: 400 },
            )
        }

        console.log(`📁 Extracted public ID: ${publicId}`)

        // Define the destination folder (equivalent to Google Drive requirements folder)
        const requirementsFolder = 'requirements'

        try {
            // Get the original file metadata from Cloudinary
            console.log(`🔍 Getting original file metadata for: ${publicId}`)

            const resource = await cloudinary.api.resource(publicId, {
                colors: false,
                exif: false,
                faces: false,
                pages: false,
                phash: false,
                image_metadata: false,
            })

            console.log("✅ Original file found:", {
                public_id: resource.public_id,
                format: resource.format,
                resource_type: resource.resource_type,
                created_at: resource.created_at,
                bytes: resource.bytes,
            })

            // Generate a name for the copied file
            const fileName = resource.public_id.split('/').pop() || `copy_${Date.now()}`
            const timestamp = Date.now()
            const newPublicId = `${requirementsFolder}/${fileName}_copy_${timestamp}`

            console.log(`📋 Creating copy: ${publicId} -> ${newPublicId}`)

            // Download the original file
            console.log(`📥 Downloading original file...`)
            const imageUrl = cloudinary.url(publicId, {
                secure: true,
                resource_type: resource.resource_type
            })

            const response = await fetch(imageUrl)

            if (!response.ok) {
                throw new Error(`Failed to download file: ${response.statusText}`)
            }

            const buffer = await response.arrayBuffer()
            const base64Data = Buffer.from(buffer).toString('base64')

            // Upload the copy to the requirements folder
            console.log(`📤 Uploading copy to ${requirementsFolder} folder...`)

            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload(
                    `data:${resource.format};base64,${base64Data}`,
                    {
                        public_id: newPublicId,
                        resource_type: resource.resource_type,
                        tags: [...(resource.tags || []), 'copy', 'requirement', `copied_from_${publicId.replace(/\//g, '_')}`],
                        context: {
                            ...(resource.context || {}),
                            copied_from: publicId,
                            copied_at: new Date().toISOString(),
                            original_public_id: publicId,
                            original_format: resource.format,
                            original_bytes: resource.bytes.toString(),
                            copy_reason: 'requirements_folder'
                        },
                        overwrite: false, // Don't overwrite if exists
                        invalidate: true,
                    },
                    (error, result) => {
                        if (error) reject(error)
                        else resolve(result)
                    }
                )
            })

            console.log(`✅ File copied successfully to: ${newPublicId}`)

            // Add requirement tag explicitly
            try {
                await cloudinary.uploader.add_tag('requirement', [newPublicId])
                console.log(`✅ Added 'requirement' tag to copied file`)
            } catch (tagError: any) {
                console.warn(`⚠️ Could not add tag: ${tagError.message}`)
                // Continue anyway - the copy exists
            }

            return NextResponse.json(
                {
                    success: true,
                    message: `File copied successfully to ${requirementsFolder} folder`,
                    originalFileId: publicId,
                    copiedFileId: newPublicId,
                    copiedFile: {
                        public_id: newPublicId,
                        name: fileName,
                        url: cloudinary.url(newPublicId, { secure: true }),
                        format: resource.format,
                        resource_type: resource.resource_type,
                        bytes: resource.bytes,
                    },
                    newUrl: cloudinary.url(newPublicId, { secure: true }),
                    folder: requirementsFolder
                },
                { status: 200 }
            )

        } catch (error: any) {
            console.error("❌ Error copying file in Cloudinary:", error)

            // Handle specific Cloudinary errors
            if (error.http_code === 404 || error.message?.includes('not found')) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Original file not found",
                        error: error.message,
                        code: 404
                    },
                    { status: 404 }
                )
            } else if (error.http_code === 403 || error.http_code === 401) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Access denied to original file",
                        error: error.message,
                        code: 403
                    },
                    { status: 403 }
                )
            }

            return NextResponse.json(
                {
                    success: false,
                    message: "Error copying file",
                    error: error.message,
                    code: error.http_code || 500
                },
                { status: error.http_code || 500 }
            )
        }

    } catch (error: any) {
        console.error("❌ Error in copy operation:", error)
        return NextResponse.json(
            {
                success: false,
                message: "Error copying file",
                error: error.message,
                code: error.code || 500,
            },
            { status: 500 }
        )
    }
}

// Add GET method for flexibility
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const fileId = searchParams.get('fileId')

        if (!fileId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "File ID is required"
                },
                { status: 400 }
            )
        }

        // Reuse the POST handler
        const modifiedRequest = new Request(request.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileId })
        })

        return POST(modifiedRequest)
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "Error in GET request",
                error: error.message,
            },
            { status: 500 }
        )
    }
}
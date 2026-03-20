// import { NextResponse } from "next/server"
// import { google } from "googleapis"

// export async function POST(request: Request) {
//     // console.log("/api/transfer/requirement called")

//     try {
//         const { fileId } = await request.json()
//         // console.log(" Received fileId:", fileId)

//         if (!fileId) {
//             // console.error("No fileId provided")
//             return NextResponse.json(
//                 { error: "File ID is required" },
//                 { status: 400 }
//             )
//         }

//         // Check if environment variables are set
//         const clientEmail = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_EMAIL
//         const privateKey = process.env.NEXT_PUBLIC_GOOGLE_PRIVATE_KEY
//         const requirementsFolder = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_REQUIREMENT_FOLDER

//         // console.log("🔑 Client email exists:", !!clientEmail)
//         // console.log("🔑 Private key exists:", !!privateKey?.substring(0, 20) + "...")
//         // console.log("📁 Requirements folder:", requirementsFolder)

//         if (!clientEmail || !privateKey) {
//             console.error("❌ Missing Google Drive credentials")
//             return NextResponse.json(
//                 { error: "Google Drive credentials not configured" },
//                 { status: 500 }
//             )
//         }

//         if (!requirementsFolder) {
//             console.error("❌ Missing requirements folder ID")
//             return NextResponse.json(
//                 { error: "Requirements folder ID not configured" },
//                 { status: 500 }
//             )
//         }

//         try {
//             // console.log("🔐 Attempting Google Drive authentication...")
//             const auth = new google.auth.JWT({
//                 email: clientEmail,
//                 key: privateKey.replace(/\\n/g, "\n"),
//                 scopes: ["https://www.googleapis.com/auth/drive"],
//             })

//             const drive = google.drive({ version: "v3", auth })

//             // console.log("🔍 Testing authentication...")
//             const about = await drive.about.get({
//                 fields: 'user'
//             })
//             // console.log("✅ Authenticated as:", about.data.user?.emailAddress)

//             try {
//                 // console.log(`🔍 Checking if file ${fileId} exists...`)
//                 const file = await drive.files.get({
//                     fileId: fileId,
//                     fields: 'id, name, mimeType, parents',
//                     supportsAllDrives: true,
//                 })

//                 // console.log("✅ File found:", {
//                 //     id: file.data.id,
//                 //     name: file.data.name,
//                 //     mimeType: file.data.mimeType,
//                 //     parents: file.data.parents
//                 // })

//                 // console.log(`🔍 Checking if file is in requirements folder ${requirementsFolder}...`)

//                 const query = `'${requirementsFolder}' in parents and trashed = false`

//                 // console.log("🔍 Search query:", query)

//                 const searchResponse = await drive.files.list({
//                     q: query,
//                     fields: 'files(id, name)',
//                     supportsAllDrives: true,
//                     includeItemsFromAllDrives: true,
//                     pageSize: 100,
//                 })

//                 const files = searchResponse.data.files || []
//                 // console.log(`📊 Found ${files.length} files in requirements folder`)

//                 const fileExists = files.some(f => f.id === fileId)

//                 // console.log("📊 Search result:", {
//                 //     exists: fileExists,
//                 //     filesFound: files.length,
//                 //     fileInResults: files.find(f => f.id === fileId)
//                 // })

//                 return NextResponse.json(
//                     {
//                         exists: fileExists,
//                         file: fileExists ? file.data : null,
//                         fileInfo: {
//                             id: file.data.id,
//                             name: file.data.name,
//                             parents: file.data.parents
//                         }
//                     },
//                     { status: 200 }
//                 )

//             } catch (driveError: any) {
//                 console.error("Google Drive API error:", {
//                     message: driveError.message,
//                     code: driveError.code,
//                     errors: driveError.errors,
//                     stack: driveError.stack
//                 })

//                 if (driveError.code === 404) {
//                     return NextResponse.json(
//                         {
//                             message: "File not found",
//                             error: "File not found or inaccessible",
//                             code: 404,
//                             details: driveError.errors
//                         },
//                         { status: 404 }
//                     )
//                 } else if (driveError.code === 403) {
//                     return NextResponse.json(
//                         {
//                             message: "Access denied",
//                             error: "Insufficient permissions to access this file",
//                             code: 403,
//                             details: driveError.errors
//                         },
//                         { status: 403 }
//                     )
//                 } else if (driveError.code === 400) {
//                     return NextResponse.json(
//                         {
//                             message: "Bad request to Google Drive API",
//                             error: driveError.message || "Invalid Value",
//                             code: 400,
//                             details: driveError.errors
//                         },
//                         { status: 400 }
//                     )
//                 }

//                 return NextResponse.json(
//                     {
//                         message: "Google Drive API error",
//                         error: driveError.message,
//                         code: driveError.code,
//                         details: driveError.errors
//                     },
//                     { status: 500 }
//                 )
//             }

//         } catch (authError: any) {
//             console.error("❌ Authentication error:", authError)
//             return NextResponse.json(
//                 {
//                     message: "Authentication failed",
//                     error: authError.message,
//                     details: "Check your Google Drive service account credentials"
//                 },
//                 { status: 500 }
//             )
//         }

//     } catch (error: any) {
//         console.error("❌ Error checking file:", error)
//         return NextResponse.json(
//             {
//                 message: "Error checking file",
//                 error: error.message || "Invalid Value",
//                 stack: error.stack
//             },
//             { status: 500 }
//         )
//     }
// }

import { NextResponse } from "next/server"
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
    console.log("🔄 /api/transfer/requirement called - CLOUDINARY VERSION")

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

        try {
            // Try to authenticate and test connection
            console.log("🔐 Testing Cloudinary connection...")

            // Simple ping to test authentication (get account info)
            const accountInfo = await cloudinary.api.ping()
            console.log("✅ Cloudinary connection successful")

            try {
                // Check if the file exists in Cloudinary
                console.log(`🔍 Checking if file ${publicId} exists...`)

                const resource = await cloudinary.api.resource(publicId, {
                    colors: false,
                    exif: false,
                    faces: false,
                    pages: false,
                    phash: false,
                    image_metadata: false,
                })

                console.log("✅ File found in Cloudinary:", {
                    public_id: resource.public_id,
                    format: resource.format,
                    resource_type: resource.resource_type,
                    created_at: resource.created_at,
                    bytes: resource.bytes,
                    tags: resource.tags,
                })

                // Check if the file has the 'requirement' tag or is in requirements folder
                const requirementsFolder = 'requirements'
                const hasRequirementTag = resource.tags?.includes('requirement') || false
                const isInRequirementsFolder = resource.public_id.startsWith(requirementsFolder + '/')

                console.log("📊 Tag/Folder check:", {
                    hasRequirementTag,
                    isInRequirementsFolder,
                    tags: resource.tags || [],
                    public_id: resource.public_id
                })

                return NextResponse.json(
                    {
                        success: true,
                        exists: true,
                        file: {
                            id: resource.public_id,
                            public_id: resource.public_id,
                            name: resource.public_id.split('/').pop() || resource.public_id,
                            format: resource.format,
                            resource_type: resource.resource_type,
                            bytes: resource.bytes,
                            created_at: resource.created_at,
                            tags: resource.tags || [],
                            context: resource.context || {},
                            url: cloudinary.url(resource.public_id, { secure: true }),
                        },
                        fileInfo: {
                            id: resource.public_id,
                            public_id: resource.public_id,
                            name: resource.public_id.split('/').pop() || resource.public_id,
                            folder: resource.public_id.includes('/') ? resource.public_id.split('/')[0] : 'root',
                            tags: resource.tags || [],
                        },
                        isRequirement: hasRequirementTag || isInRequirementsFolder
                    },
                    { status: 200 }
                )

            } catch (cloudinaryError: any) {
                console.error("❌ Cloudinary API error:", {
                    message: cloudinaryError.message,
                    code: cloudinaryError.http_code,
                    name: cloudinaryError.name,
                })

                // Handle different Cloudinary error types
                if (cloudinaryError.http_code === 404 ||
                    cloudinaryError.message?.includes('not found') ||
                    cloudinaryError.name === 'NotFound') {
                    return NextResponse.json(
                        {
                            success: false,
                            message: "File not found",
                            error: "File not found in Cloudinary",
                            exists: false,
                            code: 404,
                        },
                        { status: 404 }
                    )
                } else if (cloudinaryError.http_code === 403 ||
                    cloudinaryError.http_code === 401 ||
                    cloudinaryError.message?.includes('unauthorized')) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: "Access denied",
                            error: "Insufficient permissions to access this file",
                            code: 403,
                        },
                        { status: 403 }
                    )
                } else if (cloudinaryError.http_code === 400) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: "Bad request to Cloudinary API",
                            error: cloudinaryError.message || "Invalid request",
                            code: 400,
                        },
                        { status: 400 }
                    )
                }

                return NextResponse.json(
                    {
                        success: false,
                        message: "Cloudinary API error",
                        error: cloudinaryError.message,
                        code: cloudinaryError.http_code || 500,
                    },
                    { status: cloudinaryError.http_code || 500 }
                )
            }

        } catch (authError: any) {
            console.error("❌ Cloudinary connection error:", authError)
            return NextResponse.json(
                {
                    success: false,
                    message: "Cloudinary connection failed",
                    error: authError.message,
                    details: "Check your Cloudinary credentials",
                },
                { status: 500 }
            )
        }

    } catch (error: any) {
        console.error("❌ Error checking file:", error)
        return NextResponse.json(
            {
                success: false,
                message: "Error checking file",
                error: error.message || "Unknown error",
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
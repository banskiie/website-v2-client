import { NextResponse } from "next/server"
import { v2 as cloudinary } from 'cloudinary'

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
            console.log("🔐 Testing Cloudinary connection...")
            const accountInfo = await cloudinary.api.ping()
            console.log("✅ Cloudinary connection successful")

            try {
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

                // Check if the file has the 'requirement' tag or is in requirement folder (singular)
                const requirementFolder = 'requirement' // singular
                const hasRequirementTag = resource.tags?.includes('requirement') || false
                const isInRequirementFolder = resource.public_id.startsWith(requirementFolder + '/')

                console.log("📊 Tag/Folder check:", {
                    hasRequirementTag,
                    isInRequirementFolder,
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
                        isRequirement: hasRequirementTag || isInRequirementFolder
                    },
                    { status: 200 }
                )

            } catch (cloudinaryError: any) {
                console.error("❌ Cloudinary API error:", {
                    message: cloudinaryError.message,
                    code: cloudinaryError.http_code,
                    name: cloudinaryError.name,
                })

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
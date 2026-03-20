// app/api/transfer/entry_requirement/route.ts
import { NextResponse } from "next/server"
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function POST(request: Request) {
    console.log("🔄 /api/transfer/entry_requirement called - CLOUDINARY VERSION")

    try {
        // Parse JSON body
        const body = await request.json()
        const { fileId } = body

        console.log("📁 Request data:", { fileId })

        if (!fileId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "File ID is required"
                },
                { status: 400 }
            )
        }

        // The fileId is the public_id from Cloudinary (e.g., "entry_requirements/filename")
        const publicId = fileId

        console.log(`📁 Using public ID: ${publicId}`)

        // Use the actual folder names
        const entryRequirementsFolder = 'entry_requirements'
        const requirementsFolder = 'requirements'

        try {
            // Verify the file exists in Cloudinary
            const resource = await cloudinary.api.resource(publicId, {
                colors: false,
                exif: false,
            })

            console.log(`✅ File found in Cloudinary:`, {
                public_id: resource.public_id,
                format: resource.format,
                resource_type: resource.resource_type,
                tags: resource.tags
            })

            // Check if the file is in entry_requirements folder
            const isInEntryRequirements = publicId.startsWith(entryRequirementsFolder + '/')

            if (!isInEntryRequirements) {
                console.log(`⚠️ File is not in entry_requirements folder. Current path: ${publicId}`)
                return NextResponse.json(
                    {
                        success: false,
                        error: "File is not in entry_requirements folder",
                        currentLocation: publicId,
                        expectedFolder: entryRequirementsFolder
                    },
                    { status: 400 }
                )
            }

            // Extract the filename without the folder prefix
            const filename = publicId.replace(entryRequirementsFolder + '/', '')
            const newPublicId = `${requirementsFolder}/${filename}`

            console.log(`🔄 Moving file from ${publicId} to ${newPublicId}`)

            // Get the original file URL
            const fileUrl = cloudinary.url(publicId, {
                secure: true,
                resource_type: resource.resource_type
            })

            console.log(`📥 Downloading from: ${fileUrl}`)

            // Download the file
            const response = await fetch(fileUrl)
            if (!response.ok) {
                throw new Error(`Failed to download file: ${response.statusText}`)
            }

            const buffer = Buffer.from(await response.arrayBuffer())

            // Upload to new location using stream
            console.log(`📤 Uploading to: ${newPublicId}`)

            const result: any = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        public_id: newPublicId,
                        resource_type: resource.resource_type,
                        format: resource.format,
                        tags: [...(resource.tags || []), 'requirement', 'moved_from_entry'],
                        context: {
                            ...(resource.context || {}),
                            moved_from: publicId,
                            moved_at: new Date().toISOString(),
                            original_public_id: publicId,
                            original_folder: entryRequirementsFolder,
                            destination_folder: requirementsFolder
                        }
                    },
                    (error, result) => {
                        if (error) reject(error)
                        else resolve(result)
                    }
                )
                stream.end(buffer)
            })

            console.log(`✅ File uploaded successfully to new location: ${newPublicId}`)

            // After successful upload, delete the original file
            try {
                await cloudinary.uploader.destroy(publicId, {
                    invalidate: true,
                    resource_type: resource.resource_type
                })
                console.log(`✅ Original file deleted: ${publicId}`)
            } catch (deleteError: any) {
                console.warn(`⚠️ Could not delete original file: ${deleteError.message}`)
            }

            return NextResponse.json(
                {
                    success: true,
                    message: `File moved successfully from ${entryRequirementsFolder} to ${requirementsFolder} folder`,
                    oldFileId: publicId,
                    newFileId: newPublicId,
                    newUrl: cloudinary.url(newPublicId, {
                        secure: true,
                        resource_type: resource.resource_type
                    }),
                },
                { status: 200 }
            )

        } catch (error: any) {
            console.error(`❌ Error processing file:`, error)

            return NextResponse.json(
                {
                    success: false,
                    message: "Error moving file in Cloudinary",
                    error: error.message,
                    code: error.http_code || 500,
                },
                { status: error.http_code || 500 }
            )
        }

    } catch (error: any) {
        console.error("❌ Error in move operation:", error)
        return NextResponse.json(
            {
                success: false,
                message: "Error moving file",
                error: error.message,
                code: error.code || 500,
            },
            { status: 500 }
        )
    }
}
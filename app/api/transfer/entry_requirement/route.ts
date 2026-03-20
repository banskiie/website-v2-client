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

        const publicId = fileId
        console.log(`📁 Using public ID: ${publicId}`)

        // Match your Cloudinary folder names
        const sourceFolder = 'entry_requirements' // plural
        const destinationFolder = 'requirement' // singular

        try {
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
            const isInSourceFolder = publicId.startsWith(sourceFolder + '/')

            if (!isInSourceFolder) {
                console.log(`⚠️ File is not in ${sourceFolder} folder. Current path: ${publicId}`)
                return NextResponse.json(
                    {
                        success: false,
                        error: `File is not in ${sourceFolder} folder`,
                        currentLocation: publicId,
                        expectedFolder: sourceFolder
                    },
                    { status: 400 }
                )
            }

            // Extract the filename without the folder prefix
            const filename = publicId.replace(sourceFolder + '/', '')

            // IMPORTANT: Ensure the destination folder path is correct
            // Cloudinary uses folder/path format
            const newPublicId = `${destinationFolder}/${filename}`

            console.log(`🔄 Moving file from ${publicId} to ${newPublicId}`)

            // First, try to create the destination folder by uploading a placeholder
            // This ensures the folder exists
            try {
                // Check if destination folder exists by trying to list resources in it
                await cloudinary.api.resources({
                    type: 'upload',
                    prefix: `${destinationFolder}/`,
                    max_results: 1
                })
                console.log(`✅ Destination folder ${destinationFolder} exists or is accessible`)
            } catch (folderError: any) {
                console.log(`⚠️ Could not verify destination folder, will attempt upload anyway`)
            }

            // Get the original file URL
            const fileUrl = cloudinary.url(publicId, {
                secure: true,
                resource_type: resource.resource_type
            })

            console.log(`📥 Downloading from: ${fileUrl}`)

            const response = await fetch(fileUrl)
            if (!response.ok) {
                throw new Error(`Failed to download file: ${response.statusText}`)
            }

            const buffer = Buffer.from(await response.arrayBuffer())

            console.log(`📤 Uploading to: ${newPublicId}`)

            const result: any = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        public_id: newPublicId,
                        resource_type: resource.resource_type,
                        format: resource.format,
                        folder: destinationFolder, // Explicitly set folder
                        tags: [...(resource.tags || []), 'requirement', 'moved_from_entry'],
                        context: {
                            ...(resource.context || {}),
                            moved_from: publicId,
                            moved_at: new Date().toISOString(),
                            original_public_id: publicId,
                            original_folder: sourceFolder,
                            destination_folder: destinationFolder
                        }
                    },
                    (error, result) => {
                        if (error) reject(error)
                        else resolve(result)
                    }
                )
                stream.end(buffer)
            })

            console.log(`✅ File uploaded successfully to new location: ${result.public_id}`)

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
                    message: `File moved successfully from ${sourceFolder} to ${destinationFolder} folder`,
                    oldFileId: publicId,
                    newFileId: result.public_id,
                    newUrl: cloudinary.url(result.public_id, {
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
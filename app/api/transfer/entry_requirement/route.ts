import { NextResponse } from "next/server"
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function POST(request: Request) {

    try {
        const body = await request.json()
        const { fileId } = body

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

        const sourceFolder = 'entry_requirements'
        const destinationFolder = 'requirement'

        try {
            const resource = await cloudinary.api.resource(publicId, {
                colors: false,
                exif: false,
            })

            const isInSourceFolder = publicId.startsWith(sourceFolder + '/')

            if (!isInSourceFolder) {
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

            const filename = publicId.replace(sourceFolder + '/', '')

            const newPublicId = `${destinationFolder}/${filename}`

            try {
                await cloudinary.api.resources({
                    type: 'upload',
                    prefix: `${destinationFolder}/`,
                    max_results: 1
                })
            } catch (folderError: any) {
                console.warn(`⚠️ Could not verify destination folder existence: ${folderError.message}`)
            }

            const fileUrl = cloudinary.url(publicId, {
                secure: true,
                resource_type: resource.resource_type
            })

            const response = await fetch(fileUrl)
            if (!response.ok) {
                throw new Error(`Failed to download file: ${response.statusText}`)
            }

            const buffer = Buffer.from(await response.arrayBuffer())

            const result: any = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        public_id: newPublicId,
                        resource_type: resource.resource_type,
                        format: resource.format,
                        folder: destinationFolder,
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

            try {
                await cloudinary.uploader.destroy(publicId, {
                    invalidate: true,
                    resource_type: resource.resource_type
                })
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
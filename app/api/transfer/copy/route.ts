// app/api/transfer/copy/route.ts
import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function POST(request: Request) {
    try {
        const { fileId } = await request.json()

        if (!fileId) {
            return NextResponse.json(
                { error: "File ID is required" },
                { status: 400 }
            )
        }

        // Google Drive auth
        const auth = new google.auth.JWT({
            email: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_EMAIL,
            key: process.env.NEXT_PUBLIC_GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            scopes: ["https://www.googleapis.com/auth/drive"],
        })

        const drive = google.drive({ version: "v3", auth })

        // Get the original file metadata
        const fileMetadata = await drive.files.get({
            fileId: fileId,
            fields: 'id, name',
            supportsAllDrives: true,
        })

        const fileName = fileMetadata.data.name || `Copy of ${fileId}`
        const requirementsFolder = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_REQUIREMENT_FOLDER

        if (!requirementsFolder) {
            return NextResponse.json(
                { error: "Requirements folder ID not configured" },
                { status: 500 }
            )
        }

        // Create a copy in the requirements folder
        const copiedFile = await drive.files.copy({
            fileId: fileId,
            requestBody: {
                name: fileName,
                parents: [requirementsFolder]
            },
            supportsAllDrives: true,
        })

        return NextResponse.json(
            {
                success: true,
                message: `File copied successfully to requirements folder`,
                originalFileId: fileId,
                copiedFileId: copiedFile.data.id,
                newUrl: `https://drive.google.com/uc?id=${copiedFile.data.id}`
            },
            { status: 200 }
        )
    } catch (error: any) {
        console.error("❌ Error copying file:", error)
        return NextResponse.json(
            {
                message: "Error copying file",
                error: error.message,
                code: error.code
            },
            { status: 500 }
        )
    }
}
// app/api/transfer/move/route.ts
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

        // First, get the file metadata to check current parents
        const fileMetadata = await drive.files.get({
            fileId: fileId,
            fields: 'id, name, parents',
            supportsAllDrives: true,
        })

        const currentParents = fileMetadata.data.parents || []
        const entryRequirementsFolder = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_ENTRY_REQUIREMENT_FOLDER
        const requirementsFolder = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_REQUIREMENT_FOLDER

        if (!entryRequirementsFolder || !requirementsFolder) {
            return NextResponse.json(
                { error: "Folder IDs not configured" },
                { status: 500 }
            )
        }

        // Check if file is in entry_requirements folder
        const isInEntryRequirements = currentParents.includes(entryRequirementsFolder)

        if (!isInEntryRequirements) {
            return NextResponse.json(
                {
                    error: "File is not in entry_requirements folder",
                    currentParents
                },
                { status: 400 }
            )
        }

        // Move the file by updating its parents
        await drive.files.update({
            fileId: fileId,
            addParents: requirementsFolder,
            removeParents: entryRequirementsFolder,
            supportsAllDrives: true,
        })

        return NextResponse.json(
            {
                success: true,
                message: `File ${fileId} moved successfully from entry_requirements to requirements folder`,
                fileId,
                newUrl: `https://drive.google.com/uc?id=${fileId}`
            },
            { status: 200 }
        )
    } catch (error: any) {
        console.error("❌ Error moving file:", error)
        return NextResponse.json(
            {
                message: "Error moving file",
                error: error.message,
                code: error.code
            },
            { status: 500 }
        )
    }
}
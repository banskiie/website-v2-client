import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function POST(request: Request) {
    console.log("📦 /api/transfer/requirement called")

    try {
        const { fileId } = await request.json()
        console.log("📁 Received fileId:", fileId)

        if (!fileId) {
            console.error("❌ No fileId provided")
            return NextResponse.json(
                { error: "File ID is required" },
                { status: 400 }
            )
        }

        // Check if environment variables are set
        const clientEmail = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_EMAIL
        const privateKey = process.env.NEXT_PUBLIC_GOOGLE_PRIVATE_KEY
        const requirementsFolder = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_REQUIREMENT_FOLDER

        console.log("🔑 Client email exists:", !!clientEmail)
        console.log("🔑 Private key exists:", !!privateKey?.substring(0, 20) + "...")
        console.log("📁 Requirements folder:", requirementsFolder)

        if (!clientEmail || !privateKey) {
            console.error("❌ Missing Google Drive credentials")
            return NextResponse.json(
                { error: "Google Drive credentials not configured" },
                { status: 500 }
            )
        }

        if (!requirementsFolder) {
            console.error("❌ Missing requirements folder ID")
            return NextResponse.json(
                { error: "Requirements folder ID not configured" },
                { status: 500 }
            )
        }

        try {
            console.log("🔐 Attempting Google Drive authentication...")
            const auth = new google.auth.JWT({
                email: clientEmail,
                key: privateKey.replace(/\\n/g, "\n"),
                scopes: ["https://www.googleapis.com/auth/drive"],
            })

            const drive = google.drive({ version: "v3", auth })

            console.log("🔍 Testing authentication...")
            const about = await drive.about.get({
                fields: 'user'
            })
            console.log("✅ Authenticated as:", about.data.user?.emailAddress)

            try {
                console.log(`🔍 Checking if file ${fileId} exists...`)
                const file = await drive.files.get({
                    fileId: fileId,
                    fields: 'id, name, mimeType, parents',
                    supportsAllDrives: true,
                })

                console.log("✅ File found:", {
                    id: file.data.id,
                    name: file.data.name,
                    mimeType: file.data.mimeType,
                    parents: file.data.parents
                })

                console.log(`🔍 Checking if file is in requirements folder ${requirementsFolder}...`)

                const query = `'${requirementsFolder}' in parents and trashed = false`

                console.log("🔍 Search query:", query)

                const searchResponse = await drive.files.list({
                    q: query,
                    fields: 'files(id, name)',
                    supportsAllDrives: true,
                    includeItemsFromAllDrives: true,
                    pageSize: 100,
                })

                const files = searchResponse.data.files || []
                console.log(`📊 Found ${files.length} files in requirements folder`)

                const fileExists = files.some(f => f.id === fileId)

                console.log("📊 Search result:", {
                    exists: fileExists,
                    filesFound: files.length,
                    fileInResults: files.find(f => f.id === fileId)
                })

                return NextResponse.json(
                    {
                        exists: fileExists,
                        file: fileExists ? file.data : null,
                        fileInfo: {
                            id: file.data.id,
                            name: file.data.name,
                            parents: file.data.parents
                        }
                    },
                    { status: 200 }
                )

            } catch (driveError: any) {
                console.error("❌ Google Drive API error:", {
                    message: driveError.message,
                    code: driveError.code,
                    errors: driveError.errors,
                    stack: driveError.stack
                })

                if (driveError.code === 404) {
                    return NextResponse.json(
                        {
                            message: "File not found",
                            error: "File not found or inaccessible",
                            code: 404,
                            details: driveError.errors
                        },
                        { status: 404 }
                    )
                } else if (driveError.code === 403) {
                    return NextResponse.json(
                        {
                            message: "Access denied",
                            error: "Insufficient permissions to access this file",
                            code: 403,
                            details: driveError.errors
                        },
                        { status: 403 }
                    )
                } else if (driveError.code === 400) {
                    return NextResponse.json(
                        {
                            message: "Bad request to Google Drive API",
                            error: driveError.message || "Invalid Value",
                            code: 400,
                            details: driveError.errors
                        },
                        { status: 400 }
                    )
                }

                return NextResponse.json(
                    {
                        message: "Google Drive API error",
                        error: driveError.message,
                        code: driveError.code,
                        details: driveError.errors
                    },
                    { status: 500 }
                )
            }

        } catch (authError: any) {
            console.error("❌ Authentication error:", authError)
            return NextResponse.json(
                {
                    message: "Authentication failed",
                    error: authError.message,
                    details: "Check your Google Drive service account credentials"
                },
                { status: 500 }
            )
        }

    } catch (error: any) {
        console.error("❌ Error checking file:", error)
        return NextResponse.json(
            {
                message: "Error checking file",
                error: error.message || "Invalid Value",
                stack: error.stack
            },
            { status: 500 }
        )
    }
}
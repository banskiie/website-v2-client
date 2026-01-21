// // app/api/transfer/replace/route.ts
// import { NextResponse } from "next/server"
// import { google } from "googleapis"

// export async function POST(request: Request) {
//     console.log("🔄 /api/transfer/replace called")

//     try {
//         const {
//             oldFileId,
//             newFileId,
//             playerId,
//             documentType
//         } = await request.json()

//         console.log("📁 Request data:", {
//             oldFileId,
//             newFileId,
//             playerId,
//             documentType
//         })

//         if (!oldFileId || !newFileId) {
//             return NextResponse.json(
//                 { error: "Both oldFileId and newFileId are required" },
//                 { status: 400 }
//             )
//         }

//         // Check if environment variables are set
//         const clientEmail = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_EMAIL
//         const privateKey = process.env.NEXT_PUBLIC_GOOGLE_PRIVATE_KEY
//         const requirementsFolder = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_REQUIREMENT_FOLDER
//         const entryRequirementsFolder = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_ENTRY_REQUIREMENT_FOLDER

//         if (!clientEmail || !privateKey) {
//             return NextResponse.json(
//                 { error: "Google Drive credentials not configured" },
//                 { status: 500 }
//             )
//         }

//         if (!requirementsFolder || !entryRequirementsFolder) {
//             return NextResponse.json(
//                 { error: "Folder IDs not configured" },
//                 { status: 500 }
//             )
//         }

//         // Google Drive auth
//         const auth = new google.auth.JWT({
//             email: clientEmail,
//             key: privateKey.replace(/\\n/g, "\n"),
//             scopes: ["https://www.googleapis.com/auth/drive"],
//         })

//         const drive = google.drive({ version: "v3", auth })

//         // Step 1: Check if old file exists in requirements folder
//         console.log(`🔍 Checking if old file ${oldFileId} exists in requirements folder...`)

//         const oldFileQuery = `'${requirementsFolder}' in parents and trashed = false and id = '${oldFileId}'`
//         const oldFileSearch = await drive.files.list({
//             q: oldFileQuery,
//             fields: 'files(id, name)',
//             supportsAllDrives: true,
//             includeItemsFromAllDrives: true,
//         })

//         const oldFileExists = oldFileSearch.data.files?.some(f => f.id === oldFileId) || false

//         if (!oldFileExists) {
//             console.log(`⚠️ Old file ${oldFileId} not found in requirements folder`)
//             // If old file doesn't exist, just move the new file
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Old file not found in requirements folder",
//                     action: "move_only"
//                 },
//                 { status: 404 }
//             )
//         }

//         console.log(`✅ Old file ${oldFileId} found, proceeding with replacement...`)

//         // Step 2: Check if new file exists in entry_requirements folder
//         console.log(`🔍 Checking if new file ${newFileId} exists in entry_requirements folder...`)

//         const newFileQuery = `'${entryRequirementsFolder}' in parents and trashed = false and id = '${newFileId}'`
//         const newFileSearch = await drive.files.list({
//             q: newFileQuery,
//             fields: 'files(id, name)',
//             supportsAllDrives: true,
//             includeItemsFromAllDrives: true,
//         })

//         const newFileExists = newFileSearch.data.files?.some(f => f.id === newFileId) || false

//         if (!newFileExists) {
//             console.log(`❌ New file ${newFileId} not found in entry_requirements folder`)
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "New file not found in entry_requirements folder"
//                 },
//                 { status: 404 }
//             )
//         }

//         console.log(`✅ New file ${newFileId} found, starting replacement process...`)

//         // Step 3: Delete the old file (or move to trash)
//         try {
//             console.log(`🗑️ Deleting old file ${oldFileId}...`)
//             await drive.files.delete({
//                 fileId: oldFileId,
//                 supportsAllDrives: true,
//             })
//             console.log(`✅ Old file ${oldFileId} deleted`)
//         } catch (deleteError: any) {
//             console.error(`❌ Error deleting old file ${oldFileId}:`, deleteError.message)
//             // If we can't delete, we can try to move it out of the folder
//             try {
//                 console.log(`🔄 Attempting to move old file instead of deleting...`)
//                 await drive.files.update({
//                     fileId: oldFileId,
//                     removeParents: requirementsFolder,
//                     addParents: 'root', // Move to root instead of deleting
//                     supportsAllDrives: true,
//                 })
//                 console.log(`✅ Old file ${oldFileId} moved to root`)
//             } catch (moveError: any) {
//                 console.error(`❌ Failed to move old file:`, moveError.message)
//                 // Continue anyway - we'll try to move the new file
//             }
//         }

//         // Step 4: Move the new file to requirements folder
//         try {
//             console.log(`🔄 Moving new file ${newFileId} to requirements folder...`)
//             await drive.files.update({
//                 fileId: newFileId,
//                 removeParents: entryRequirementsFolder,
//                 addParents: requirementsFolder,
//                 supportsAllDrives: true,
//             })
//             console.log(`✅ New file ${newFileId} moved to requirements folder`)
//         } catch (moveError: any) {
//             console.error(`❌ Error moving new file:`, moveError.message)

//             // If move fails, try to copy instead
//             try {
//                 console.log(`🔄 Attempting to copy new file instead...`)
//                 const copiedFile = await drive.files.copy({
//                     fileId: newFileId,
//                     requestBody: {
//                         name: `Replacement_${newFileId}`,
//                         parents: [requirementsFolder]
//                     },
//                     supportsAllDrives: true,
//                 })

//                 console.log(`✅ New file copied to requirements folder: ${copiedFile.data.id}`)

//                 return NextResponse.json(
//                     {
//                         success: true,
//                         message: "File replaced successfully (copied instead of moved)",
//                         oldFileId,
//                         newFileId: copiedFile.data.id,
//                         action: "copied",
//                         newUrl: `https://drive.google.com/uc?id=${copiedFile.data.id}`
//                     },
//                     { status: 200 }
//                 )
//             } catch (copyError: any) {
//                 console.error(`❌ Failed to copy new file:`, copyError.message)
//                 throw new Error(`Failed to move or copy new file: ${copyError.message}`)
//             }
//         }

//         return NextResponse.json(
//             {
//                 success: true,
//                 message: "File replaced successfully",
//                 oldFileId,
//                 newFileId,
//                 action: "replaced",
//                 newUrl: `https://drive.google.com/uc?id=${newFileId}`
//             },
//             { status: 200 }
//         )

//     } catch (error: any) {
//         console.error("❌ Error in replace operation:", error)
//         return NextResponse.json(
//             {
//                 success: false,
//                 message: "Error replacing file",
//                 error: error.message,
//                 code: error.code
//             },
//             { status: 500 }
//         )
//     }
// }

// 2nd
// app/api/transfer/replace/route.ts
// import { NextResponse } from "next/server"
// import { google } from "googleapis"

// export async function POST(request: Request) {
//     console.log("🔄 /api/transfer/replace called")

//     try {
//         const {
//             oldFileId,
//             newFileId,
//             documentType,
//             playerType
//         } = await request.json()

//         console.log("📁 Request data:", {
//             oldFileId,
//             newFileId,
//             documentType,
//             playerType
//         })

//         if (!oldFileId || !newFileId) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     error: "Both oldFileId and newFileId are required"
//                 },
//                 { status: 400 }
//             )
//         }

//         // Check if environment variables are set
//         const clientEmail = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_EMAIL
//         const privateKey = process.env.NEXT_PUBLIC_GOOGLE_PRIVATE_KEY
//         const requirementsFolder = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_REQUIREMENT_FOLDER
//         const entryRequirementsFolder = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_ENTRY_REQUIREMENT_FOLDER

//         if (!clientEmail || !privateKey) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     error: "Google Drive credentials not configured"
//                 },
//                 { status: 500 }
//             )
//         }

//         if (!requirementsFolder || !entryRequirementsFolder) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     error: "Folder IDs not configured"
//                 },
//                 { status: 500 }
//             )
//         }

//         // Google Drive auth
//         const auth = new google.auth.JWT({
//             email: clientEmail,
//             key: privateKey.replace(/\\n/g, "\n"),
//             scopes: ["https://www.googleapis.com/auth/drive"],
//         })

//         const drive = google.drive({ version: "v3", auth })

//         // Step 1: Check if old file exists in requirements folder
//         console.log(`🔍 Checking if old file ${oldFileId} exists in requirements folder...`)

//         try {
//             const oldFile = await drive.files.get({
//                 fileId: oldFileId,
//                 fields: 'id, name, parents',
//                 supportsAllDrives: true,
//             })

//             const oldFileInRequirements = oldFile.data.parents?.includes(requirementsFolder) || false

//             if (!oldFileInRequirements) {
//                 console.log(`⚠️ Old file ${oldFileId} not in requirements folder, it's in:`, oldFile.data.parents)
//                 return NextResponse.json(
//                     {
//                         success: false,
//                         message: "Old file not found in requirements folder",
//                         action: "move_only"
//                     },
//                     { status: 404 }
//                 )
//             }

//             console.log(`✅ Old file ${oldFileId} found in requirements folder: ${oldFile.data.name}`)
//         } catch (error: any) {
//             console.log(`⚠️ Old file ${oldFileId} not found or inaccessible:`, error.message)
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Old file not found or inaccessible",
//                     action: "move_only"
//                 },
//                 { status: 404 }
//             )
//         }

//         // Step 2: Check if new file exists in entry_requirements folder
//         console.log(`🔍 Checking if new file ${newFileId} exists in entry_requirements folder...`)

//         try {
//             const newFile = await drive.files.get({
//                 fileId: newFileId,
//                 fields: 'id, name, parents',
//                 supportsAllDrives: true,
//             })

//             const newFileInEntryRequirements = newFile.data.parents?.includes(entryRequirementsFolder) || false

//             if (!newFileInEntryRequirements) {
//                 console.log(`❌ New file ${newFileId} not in entry_requirements folder, it's in:`, newFile.data.parents)
//                 return NextResponse.json(
//                     {
//                         success: false,
//                         message: "New file not found in entry_requirements folder"
//                     },
//                     { status: 404 }
//                 )
//             }

//             console.log(`✅ New file ${newFileId} found in entry_requirements folder: ${newFile.data.name}`)
//         } catch (error: any) {
//             console.log(`❌ New file ${newFileId} not found or inaccessible:`, error.message)
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "New file not found in entry_requirements folder"
//                 },
//                 { status: 404 }
//             )
//         }

//         console.log(`✅ Both files found, starting replacement process...`)

//         // Step 3: Try to delete the old file (or move to trash)
//         let oldFileDeleted = false
//         try {
//             console.log(`🗑️ Attempting to delete old file ${oldFileId}...`)
//             await drive.files.delete({
//                 fileId: oldFileId,
//                 supportsAllDrives: true,
//             })
//             oldFileDeleted = true
//             console.log(`✅ Old file ${oldFileId} deleted successfully`)
//         } catch (deleteError: any) {
//             console.error(`❌ Error deleting old file ${oldFileId}:`, deleteError.message)

//             // If we can't delete, try to move it out of the requirements folder
//             try {
//                 console.log(`🔄 Attempting to move old file out of requirements folder instead...`)
//                 await drive.files.update({
//                     fileId: oldFileId,
//                     removeParents: requirementsFolder,
//                     addParents: 'root', // Move to root instead of deleting
//                     supportsAllDrives: true,
//                 })
//                 console.log(`✅ Old file ${oldFileId} moved to root`)
//                 oldFileDeleted = true
//             } catch (moveError: any) {
//                 console.error(`❌ Failed to move old file:`, moveError.message)
//                 // Continue anyway - we'll try to move the new file
//             }
//         }

//         // Step 4: Move the new file to requirements folder
//         try {
//             console.log(`🔄 Moving new file ${newFileId} to requirements folder...`)
//             await drive.files.update({
//                 fileId: newFileId,
//                 removeParents: entryRequirementsFolder,
//                 addParents: requirementsFolder,
//                 supportsAllDrives: true,
//             })
//             console.log(`✅ New file ${newFileId} moved to requirements folder`)

//             return NextResponse.json(
//                 {
//                     success: true,
//                     message: oldFileDeleted ? "File replaced successfully" : "New file moved successfully (old file could not be removed)",
//                     oldFileId,
//                     newFileId,
//                     action: oldFileDeleted ? "replaced" : "moved_new_only",
//                     oldFileRemoved: oldFileDeleted,
//                     newUrl: `https://drive.google.com/uc?id=${newFileId}`
//                 },
//                 { status: 200 }
//             )
//         } catch (moveError: any) {
//             console.error(`❌ Error moving new file:`, moveError.message)

//             // If move fails, try to copy instead
//             try {
//                 console.log(`📋 Attempting to copy new file instead...`)
//                 const copiedFile = await drive.files.copy({
//                     fileId: newFileId,
//                     requestBody: {
//                         name: `Replacement_${documentType || 'Document'}_${Date.now()}`,
//                         parents: [requirementsFolder]
//                     },
//                     supportsAllDrives: true,
//                 })

//                 console.log(`✅ New file copied to requirements folder: ${copiedFile.data.id}`)

//                 return NextResponse.json(
//                     {
//                         success: true,
//                         message: "File replaced successfully (copied instead of moved)",
//                         oldFileId,
//                         newFileId: copiedFile.data.id,
//                         action: "copied",
//                         oldFileRemoved: oldFileDeleted,
//                         newUrl: `https://drive.google.com/uc?id=${copiedFile.data.id}`
//                     },
//                     { status: 200 }
//                 )
//             } catch (copyError: any) {
//                 console.error(`❌ Failed to copy new file:`, copyError.message)

//                 return NextResponse.json(
//                     {
//                         success: false,
//                         message: `Failed to move or copy new file: ${copyError.message}`,
//                         error: copyError.message
//                     },
//                     { status: 500 }
//                 )
//             }
//         }

//     } catch (error: any) {
//         console.error("❌ Error in replace operation:", error)
//         return NextResponse.json(
//             {
//                 success: false,
//                 message: "Error replacing file",
//                 error: error.message,
//                 code: error.code
//             },
//             { status: 500 }
//         )
//     }
// }

// app/api/transfer/replace/route.ts
// app/api/transfer/replace/route.ts
import { NextResponse } from "next/server"
import { google, drive_v3 } from "googleapis"

// Type definitions for Google Drive responses
type DriveFile = {
    id: string;
    name?: string;
    parents?: string[];
    mimeType?: string;
};

export async function POST(request: Request) {
    console.log("🔄 /api/transfer/replace called - UPDATE CONTENT STRATEGY")

    try {
        const {
            oldFileId,
            newFileId,
            documentType,
            playerType
        } = await request.json()

        console.log("📁 Request data:", {
            oldFileId,
            newFileId,
            documentType,
            playerType
        })

        if (!oldFileId || !newFileId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Both oldFileId and newFileId are required"
                },
                { status: 400 }
            )
        }

        // Check if environment variables are set
        const clientEmail = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_EMAIL
        const privateKey = process.env.NEXT_PUBLIC_GOOGLE_PRIVATE_KEY
        const requirementsFolder = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_REQUIREMENT_FOLDER
        const entryRequirementsFolder = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_ENTRY_REQUIREMENT_FOLDER

        if (!clientEmail || !privateKey) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Google Drive credentials not configured"
                },
                { status: 500 }
            )
        }

        if (!requirementsFolder || !entryRequirementsFolder) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Folder IDs not configured"
                },
                { status: 500 }
            )
        }

        // Google Drive auth
        const auth = new google.auth.JWT({
            email: clientEmail,
            key: privateKey.replace(/\\n/g, "\n"),
            scopes: ["https://www.googleapis.com/auth/drive"],
        })

        const drive = google.drive({ version: "v3", auth })

        // Step 1: Check if old file exists in requirements folder
        console.log(`🔍 Checking if old file ${oldFileId} exists in requirements folder...`)
        let oldFileMetadata: DriveFile | null = null

        try {
            const oldFileResponse = await drive.files.get({
                fileId: oldFileId,
                fields: 'id, name, parents, mimeType',
                supportsAllDrives: true,
            })

            oldFileMetadata = oldFileResponse.data as DriveFile;
            const oldFileInRequirements = oldFileMetadata.parents?.includes(requirementsFolder) || false

            if (!oldFileInRequirements) {
                console.log(`⚠️ Old file ${oldFileId} not in requirements folder, it's in:`, oldFileMetadata.parents)
                return NextResponse.json(
                    {
                        success: false,
                        message: "Old file not found in requirements folder",
                        action: "move_only"
                    },
                    { status: 404 }
                )
            }

            console.log(`✅ Old file ${oldFileId} found in requirements folder: ${oldFileMetadata.name}`)
        } catch (error: any) {
            console.log(`⚠️ Old file ${oldFileId} not found or inaccessible:`, error.message)
            return NextResponse.json(
                {
                    success: false,
                    message: "Old file not found or inaccessible",
                    action: "move_only"
                },
                { status: 404 }
            )
        }

        // Step 2: Check if new file exists in entry_requirements folder
        console.log(`🔍 Checking if new file ${newFileId} exists in entry_requirements folder...`)
        let newFileMetadata: DriveFile | null = null

        try {
            const newFileResponse = await drive.files.get({
                fileId: newFileId,
                fields: 'id, name, parents, mimeType',
                supportsAllDrives: true,
            })

            newFileMetadata = newFileResponse.data as DriveFile;
            const newFileInEntryRequirements = newFileMetadata.parents?.includes(entryRequirementsFolder) || false

            if (!newFileInEntryRequirements) {
                console.log(`❌ New file ${newFileId} not in entry_requirements folder, it's in:`, newFileMetadata.parents)
                return NextResponse.json(
                    {
                        success: false,
                        message: "New file not found in entry_requirements folder"
                    },
                    { status: 404 }
                )
            }

            console.log(`✅ New file ${newFileId} found in entry_requirements folder: ${newFileMetadata.name}`)
        } catch (error: any) {
            console.log(`❌ New file ${newFileId} not found or inaccessible:`, error.message)
            return NextResponse.json(
                {
                    success: false,
                    message: "New file not found in entry_requirements folder"
                },
                { status: 404 }
            )
        }

        console.log(`✅ Both files found, starting CONTENT UPDATE replacement process...`)

        // Step 3: UPDATE CONTENT STRATEGY - Update the old file with new content
        let contentUpdated = false
        let updateMethod = ''
        let updateError = ''

        // Method 1: Try to update the file content directly
        try {
            console.log(`🔄 METHOD 1: Attempting to UPDATE old file content with new file data...`)

            // First, get the new file content as a stream
            console.log(`📥 Downloading new file content from ${newFileId}...`)
            const newFileResponse = await drive.files.get(
                {
                    fileId: newFileId,
                    alt: 'media'
                },
                {
                    responseType: 'stream'
                }
            )

            console.log(`📤 Uploading new content to old file ${oldFileId}...`)
            // Update the old file with new content
            await drive.files.update({
                fileId: oldFileId,
                media: {
                    mimeType: newFileMetadata?.mimeType || 'application/octet-stream',
                    body: newFileResponse.data
                },
                supportsAllDrives: true,
            })

            contentUpdated = true
            updateMethod = 'content_updated'
            console.log(`✅ Old file ${oldFileId} CONTENT UPDATED with new file data (kept same ID)`)

        } catch (contentError: any) {
            console.error(`❌ Content update failed:`, contentError.message)
            updateError = contentError.message

            // Method 2: If content update fails, try to update file name and metadata
            try {
                console.log(`📝 METHOD 2: Attempting to update file metadata and move new file...`)

                // Optionally update the old file name with new file name
                if (newFileMetadata?.name && oldFileMetadata?.name !== newFileMetadata.name) {
                    console.log(`📝 Updating file name: "${oldFileMetadata?.name}" -> "${newFileMetadata.name}"`)
                    await drive.files.update({
                        fileId: oldFileId,
                        requestBody: {
                            name: newFileMetadata.name
                        },
                        supportsAllDrives: true,
                    })
                }

                // Move the new file to requirements folder (keeping the old file too)
                console.log(`🔄 Moving new file ${newFileId} to requirements folder...`)
                await drive.files.update({
                    fileId: newFileId,
                    removeParents: entryRequirementsFolder,
                    addParents: requirementsFolder,
                    supportsAllDrives: true,
                })

                contentUpdated = true
                updateMethod = 'new_file_moved_alongside_old'
                console.log(`✅ New file ${newFileId} moved to requirements folder (kept old file ${oldFileId})`)

            } catch (moveError: any) {
                console.error(`❌ Move failed:`, moveError.message)
                updateError = moveError.message

                // Method 3: Copy new file instead
                try {
                    console.log(`📋 METHOD 3: Copying new file to requirements folder...`)

                    const copyResponse = await drive.files.copy({
                        fileId: newFileId,
                        requestBody: {
                            name: `${newFileMetadata?.name || 'Document'}_${documentType || ''}_${Date.now()}`,
                            parents: [requirementsFolder]
                        },
                        supportsAllDrives: true,
                    })

                    const copiedFile = copyResponse.data as DriveFile;
                    contentUpdated = true
                    updateMethod = 'new_file_copied_alongside_old'
                    console.log(`✅ New file copied to requirements folder: ${copiedFile.id} (kept old file ${oldFileId})`)

                } catch (copyError: any) {
                    console.error(`❌ All update methods failed:`, copyError.message)
                    updateError = copyError.message
                    contentUpdated = false
                    updateMethod = 'failed_all_methods'
                }
            }
        }

        // Return success response based on which method worked
        return NextResponse.json(
            {
                success: contentUpdated,
                message: contentUpdated
                    ? `File ${updateMethod === 'content_updated' ? 'content updated' : 'replaced'} successfully (${updateMethod})`
                    : `Failed to update/replace file: ${updateError}`,
                oldFileId: oldFileId,
                newFileId: newFileId,
                action: updateMethod,
                contentUpdated: contentUpdated,
                updateMethod: updateMethod,
                oldFilePreserved: updateMethod === 'content_updated' || updateMethod === 'new_file_moved_alongside_old' || updateMethod === 'new_file_copied_alongside_old',
                newUrl: `https://drive.google.com/uc?id=${oldFileId}` // Always return the OLD file URL (if content was updated)
            },
            { status: contentUpdated ? 200 : 500 }
        )

    } catch (error: any) {
        console.error("❌ Error in replace operation:", error)
        return NextResponse.json(
            {
                success: false,
                message: "Error replacing file",
                error: error.message,
                code: error.code
            },
            { status: 500 }
        )
    }
}
import { google } from "googleapis";
import { drive_v3 } from "googleapis";

interface DocumentInfo {
    url: string;
    type: string;
    player: string;
}

interface MovedDocument {
    originalUrl: string;
    player: string;
    type: string;
    fileId?: string;
}

export async function checkAndMoveDocuments(existingEntry: any): Promise<MovedDocument[]> {
    try {
        const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
        const entryRequirementsFolder = process.env.GOOGLE_DRIVE_ENTRY_REQUIREMENT_FOLDER;
        const requirementsFolder = process.env.GOOGLE_DRIVE_REQUIREMENT_FOLDER;

        // console.log('Backend environment variables check:', {
        //     hasClientEmail: !!clientEmail,
        //     hasPrivateKey: !!privateKey,
        //     hasEntryFolder: !!entryRequirementsFolder,
        //     hasRequirementsFolder: !!requirementsFolder,
        //     entryRequirementsFolder,
        //     requirementsFolder
        // });

        if (!clientEmail || !privateKey || !entryRequirementsFolder || !requirementsFolder) {
            // console.error("Google Drive configuration is incomplete.");
            return [];
        }

        const auth = new google.auth.JWT({
            email: clientEmail,
            key: privateKey,
            scopes: ["https://www.googleapis.com/auth/drive"],
        });

        const drive = google.drive({ version: "v3", auth });

        const documents: DocumentInfo[] = [];

        if (existingEntry.player1Entry?.validDocuments) {
            existingEntry.player1Entry.validDocuments.forEach((doc: any) => {
                documents.push({
                    url: doc.documentURL,
                    type: doc.documentType,
                    player: 'player1'
                });
            });
        }

        if (existingEntry.player2Entry?.validDocuments) {
            existingEntry.player2Entry.validDocuments.forEach((doc: any) => {
                documents.push({
                    url: doc.documentURL,
                    type: doc.documentType,
                    player: 'player2'
                });
            });
        }

        console.log(`Found ${documents.length} documents to check`);

        const movedDocuments: MovedDocument[] = [];

        for (const doc of documents) {
            let fileId: string | undefined;
            const url = doc.url;

            console.log(`Processing document URL: ${url}`);

            if (url.includes('drive.google.com')) {
                if (url.includes('/uc?id=')) {
                    fileId = url.split('/uc?id=')[1]?.split('&')[0];
                } else if (url.includes('/file/d/')) {
                    const parts = url.split('/file/d/')[1]?.split('/');
                    fileId = parts ? parts[0] : undefined;
                } else if (url.includes('id=')) {
                    fileId = url.split('id=')[1]?.split('&')[0];
                }

                if (fileId) {
                    fileId = fileId.trim();
                    // Remove any trailing slashes or query params
                    // fileId = fileId.split('&')[0].split('/')[0];
                }
            }

            if (!fileId) {
                console.warn(`Could not extract file ID from URL: ${url}`);
                continue;
            }

            console.log(`Extracted file ID: "${fileId}"`);

            try {
                let fileExistsInRequirements = false;
                try {
                    const searchResponse = await drive.files.list({
                        q: `'${requirementsFolder}' in parents and trashed = false`,
                        fields: 'files(id, name)',
                        supportsAllDrives: true,
                        includeItemsFromAllDrives: true,
                        pageSize: 1000
                    });

                    const files = searchResponse.data.files || [];
                    fileExistsInRequirements = files.some((file: any) => file.id === fileId);

                    console.log(`Files in requirements folder: ${files.length}`);
                    console.log(`File ${fileId} exists in requirements folder: ${fileExistsInRequirements}`);
                } catch (searchError: any) {
                    console.warn(`Error searching in requirements folder: ${searchError.message}`);
                }

                if (!fileExistsInRequirements) {
                    console.log(`Attempting to move file ${fileId}...`);

                    try {
                        const fileMetadata = await drive.files.get({
                            fileId: fileId,
                            fields: 'id, name, parents',
                            supportsAllDrives: true,
                        });

                        const fileName = fileMetadata.data.name || '';
                        const currentParents = fileMetadata.data.parents || [];

                        console.log(`File metadata for ${fileId}:`, {
                            name: fileName,
                            parents: currentParents
                        });

                        const isInEntryRequirements = currentParents.includes(entryRequirementsFolder);

                        if (isInEntryRequirements) {
                            console.log(`File ${fileId} is in entry_requirements folder, moving to requirements folder...`);

                            await drive.files.update({
                                fileId: fileId,
                                addParents: requirementsFolder,
                                removeParents: entryRequirementsFolder,
                                supportsAllDrives: true,
                            });

                            movedDocuments.push({
                                originalUrl: url,
                                player: doc.player,
                                type: doc.type,
                                fileId
                            });

                            console.log(`Successfully moved document for ${doc.player} to requirements folder: ${fileId}`);
                        } else {
                            console.log(`File ${fileId} is not in entry_requirements folder. Current parents:`, currentParents);

                            if (currentParents.length > 0) {
                                console.log(`Copying file ${fileId} to requirements folder...`);

                                const copiedFile = await drive.files.copy({
                                    fileId: fileId,
                                    requestBody: {
                                        name: fileName || `Copy of ${fileId}`,
                                        parents: [requirementsFolder]
                                    } as drive_v3.Schema$File,
                                    supportsAllDrives: true,
                                });

                                const copiedFileId = copiedFile.data.id;
                                console.log(`Created copy in requirements folder: ${copiedFileId}`);

                                if (copiedFileId) {
                                    movedDocuments.push({
                                        originalUrl: url,
                                        player: doc.player,
                                        type: doc.type,
                                        fileId: copiedFileId
                                    });
                                } else {
                                    console.warn(`Copied file has no ID: ${fileId}`);
                                }
                            }
                        }
                    } catch (moveError: any) {
                        console.error(`Error processing file ${fileId}:`, {
                            message: moveError.message,
                            code: moveError.code,
                            errors: moveError.errors
                        });

                        if (moveError.code === 404) {
                            console.log(`File ${fileId} not found or no access permission`);
                        }
                    }
                } else {
                    console.log(`Document ${fileId} already exists in requirements folder, skipping.`);
                }
            } catch (error: any) {
                console.error(`Unexpected error with file ${fileId}:`, error.message);
            }
        }

        console.log(`Total moved/copied documents: ${movedDocuments.length}`);
        return movedDocuments;

    } catch (error: any) {
        console.error('Error in checkAndMoveDocuments:', error);
        return [];
    }
}
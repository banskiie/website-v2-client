"use client"

import { gql } from "@apollo/client"
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { IEntry } from "@/types/entry.interface"
import { useForm } from "@tanstack/react-form"
import { AssignPlayersSchema } from "@/validators/entry.validator"
import { useTransition } from "react"
import {
    Field,
    FieldError,
    FieldLabel,
    FieldSet,
} from "@/components/ui/field"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { CheckIcon, ChevronsUpDownIcon, FileText, Eye, Check, X, Maximize, Sparkles, AlertCircle, Loader2, Save, ExternalLink, ChevronLeft, File, Download, Maximize2 } from "lucide-react"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Image from "next/image"

const ASSIGN_PLAYERS = gql`
  mutation AssignPlayers($input: assignPlayersInput!) {
    assignPlayers(input: $input) {
      ok
      message
    }
  }
`

const ENTRY = gql`
  query Entry($_id: ID!) {
    entry(_id: $_id) {
      _id
      entryNumber
      player1Entry {
        firstName
        middleName
        lastName
        suffix
        gender
        birthDate
        email
        phoneNumber
        validDocuments {
          documentURL
          documentType
          dateUploaded
        }
      }
      connectedPlayer1 {
        _id
        firstName
        middleName
        lastName
        suffix
        gender
        birthDate
        email
        phoneNumber
        validDocuments {
          documentURL
          documentType
          dateUploaded
        }
      }
      player2Entry {
        firstName
        middleName
        lastName
        suffix
        gender
        birthDate
        email
        phoneNumber
        validDocuments {
          documentURL
          documentType
          dateUploaded
        }
      }
      connectedPlayer2 {
        _id
        firstName
        middleName
        lastName
        suffix
        gender
        birthDate
        email
        phoneNumber
        validDocuments {
          documentURL
          documentType
          dateUploaded
        }
      }
    }
  }
`

const OPTIONS = gql`
  query Options {
    playerOptions {
      label
      value
    }
  }
`

const PLAYER_1 = gql`
  query Player1($_id: ID!) {
    player(_id: $_id) {
      _id
      firstName
      middleName
      lastName
      suffix
      gender
      birthDate
      email
      phoneNumber
      validDocuments {
        documentURL
        documentType
        dateUploaded
      }
    }
  }
`

const PLAYER_2 = gql`
  query Player2($_id: ID!) {
    player(_id: $_id) {
      _id
      firstName
      middleName
      lastName
      suffix
      gender
      birthDate
        email
        phoneNumber
        validDocuments {
          documentURL
          documentType
          dateUploaded
        }
      }
    }
`

type Props = {
    _id?: string
    onClose?: () => void
    title?: string
}

type DocumentInfo = {
    documentType: string;
    documentURL: string;
    dateUploaded?: Date;
    player: string;
    source: 'existing' | 'new';
};

type DocumentSelection = {
    [documentType: string]: {
        selectedSource: 'existing' | 'new';
        existingDoc?: DocumentInfo;
        newDoc?: DocumentInfo;
    };
};

const extractFileIdFromUrl = (url: string): string | null => {
    if (!url) return null;

    const patterns = [
        /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
        /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
        /drive\.google\.com\/.*[?&]id=([a-zA-Z0-9_-]+)/,
        /drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/,
        /drive\.google\.com\/.*\/d\/([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

const replaceDocumentsInDrive = async (
    existingDocuments: any[],
    newDocuments: any[],
    playerType: 'player1' | 'player2',
    documentSelection?: DocumentSelection
) => {
    try {
        console.log(`🔄 Starting Google Drive document replacement for ${playerType}`)

        const replacedDocuments: any[] = [];
        const failedReplacements: any[] = [];

        if (documentSelection) {
            for (const [documentType, selection] of Object.entries(documentSelection)) {
                const { selectedSource, existingDoc, newDoc } = selection;

                if (selectedSource === 'existing' && existingDoc) {
                    console.log(`✅ Keeping existing document: ${documentType}`);
                    continue;
                }

                if (selectedSource === 'new' && newDoc) {
                    const newFileId = extractFileIdFromUrl(newDoc.documentURL);

                    if (!newFileId) {
                        console.warn(`Could not extract file ID from new document: ${newDoc.documentURL}`);
                        failedReplacements.push({
                            documentType,
                            error: 'Invalid file URL'
                        });
                        continue;
                    }

                    if (existingDoc) {
                        const oldFileId = extractFileIdFromUrl(existingDoc.documentURL);

                        if (oldFileId) {
                            console.log(`🔄 Replacing ${documentType}: ${oldFileId} -> ${newFileId}`);

                            try {
                                const replaceResponse = await fetch('/api/transfer/replace', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        oldFileId,
                                        newFileId,
                                        documentType,
                                        playerType
                                    }),
                                });

                                const replaceResult = await replaceResponse.json();

                                if (replaceResponse.ok && replaceResult.success) {
                                    replacedDocuments.push({
                                        documentType,
                                        oldFileId,
                                        newFileId: replaceResult.newFileId || newFileId,
                                        status: 'replaced',
                                        action: replaceResult.action,
                                        message: replaceResult.message
                                    });
                                    console.log(`✅ Successfully replaced in Google Drive: ${documentType}`);
                                } else {
                                    console.error(`❌ Failed to replace ${documentType}:`, replaceResult.message);
                                    failedReplacements.push({
                                        documentType,
                                        error: replaceResult.message,
                                        fallback: true
                                    });

                                    try {
                                        const moveResponse = await fetch('/api/transfer/entry_requirement', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ fileId: newFileId }),
                                        });

                                        if (moveResponse.ok) {
                                            replacedDocuments.push({
                                                documentType,
                                                oldFileId,
                                                newFileId,
                                                status: 'moved_new_only',
                                                action: 'moved',
                                                message: 'Replacement failed, moved new document instead'
                                            });
                                            console.log(`✅ Moved new document instead: ${documentType}`);
                                        }
                                    } catch (moveError) {
                                        console.error(`❌ Failed to move new document:`, moveError);
                                    }
                                }
                            } catch (replaceError: any) {
                                console.error(`❌ Error replacing ${documentType}:`, replaceError);
                                failedReplacements.push({
                                    documentType,
                                    error: replaceError?.message || 'Unknown error'
                                });
                            }
                        } else {
                            console.log(`⚠️ Could not extract old file ID, moving new document...`);

                            try {
                                const moveResponse = await fetch('/api/transfer/entry_requirement', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ fileId: newFileId }),
                                });

                                if (moveResponse.ok) {
                                    replacedDocuments.push({
                                        documentType,
                                        newFileId,
                                        status: 'added_new_no_old',
                                        action: 'added',
                                        message: 'No existing file found, added new document'
                                    });
                                    console.log(`✅ Added new document: ${documentType}`);
                                }
                            } catch (moveError) {
                                console.error(`❌ Error adding new document:`, moveError);
                            }
                        }
                    } else {
                        try {
                            const moveResponse = await fetch('/api/transfer/entry_requirement', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ fileId: newFileId }),
                            })

                            if (moveResponse.ok) {
                                replacedDocuments.push({
                                    documentType,
                                    newFileId,
                                    status: 'added_new_type',
                                    action: 'added',
                                    message: 'Added new document type'
                                });
                                console.log(`✅ Added new document type: ${documentType}`);
                            }
                        } catch (moveError) {
                            console.error(`❌ Error moving new document ${documentType}:`, moveError);
                        }
                    }
                }
            }
        } else {
            for (const newDoc of newDocuments) {
                const newFileId = extractFileIdFromUrl(newDoc.documentURL);

                if (!newFileId) {
                    console.warn(`Could not extract file ID from new document: ${newDoc.documentURL}`)
                    failedReplacements.push({
                        documentType: newDoc.documentType,
                        error: 'Invalid file URL'
                    });
                    continue;
                }

                const existingDoc = existingDocuments.find(
                    doc => doc.documentType === newDoc.documentType
                );

                if (existingDoc) {
                    const oldFileId = extractFileIdFromUrl(existingDoc.documentURL);

                    if (oldFileId) {
                        console.log(`🔄 Replacing ${existingDoc.documentType}: ${oldFileId} -> ${newFileId}`);

                        try {
                            const replaceResponse = await fetch('/api/transfer/replace', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    oldFileId,
                                    newFileId,
                                    documentType: newDoc.documentType,
                                    playerType
                                }),
                            });

                            const replaceResult = await replaceResponse.json();

                            if (replaceResponse.ok && replaceResult.success) {
                                replacedDocuments.push({
                                    documentType: newDoc.documentType,
                                    oldFileId,
                                    newFileId: replaceResult.newFileId || newFileId,
                                    status: 'replaced',
                                    action: replaceResult.action,
                                    message: replaceResult.message
                                });
                                console.log(`✅ Successfully replaced in Google Drive: ${newDoc.documentType}`);
                            } else {
                                console.error(`❌ Failed to replace ${newDoc.documentType}:`, replaceResult.message);
                                failedReplacements.push({
                                    documentType: newDoc.documentType,
                                    error: replaceResult.message,
                                    fallback: true
                                });

                                try {
                                    const moveResponse = await fetch('/api/transfer/entry_requirement', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ fileId: newFileId }),
                                    });

                                    if (moveResponse.ok) {
                                        replacedDocuments.push({
                                            documentType: newDoc.documentType,
                                            oldFileId,
                                            newFileId,
                                            status: 'moved_new_only',
                                            action: 'moved',
                                            message: 'Replacement failed, moved new document instead'
                                        });
                                        console.log(`✅ Moved new document instead: ${newDoc.documentType}`);
                                    }
                                } catch (moveError) {
                                    console.error(`❌ Failed to move new document:`, moveError);
                                }
                            }
                        } catch (replaceError: any) {
                            console.error(`❌ Error replacing ${newDoc.documentType}:`, replaceError);
                            failedReplacements.push({
                                documentType: newDoc.documentType,
                                error: replaceError?.message || 'Unknown error'
                            });
                        }
                    } else {
                        console.log(`⚠️ Could not extract old file ID, moving new document...`);

                        try {
                            const moveResponse = await fetch('/api/transfer/entry_requirement', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ fileId: newFileId }),
                            });

                            if (moveResponse.ok) {
                                replacedDocuments.push({
                                    documentType: newDoc.documentType,
                                    newFileId,
                                    status: 'added_new_no_old',
                                    action: 'added',
                                    message: 'No existing file found, added new document'
                                });
                                console.log(`✅ Added new document: ${newDoc.documentType}`);
                            }
                        } catch (moveError) {
                            console.error(`❌ Error adding new document:`, moveError);
                        }
                    }
                } else {
                    try {
                        const moveResponse = await fetch('/api/transfer/entry_requirement', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ fileId: newFileId }),
                        });

                        if (moveResponse.ok) {
                            replacedDocuments.push({
                                documentType: newDoc.documentType,
                                newFileId,
                                status: 'added_new_type',
                                action: 'added',
                                message: 'Added new document type'
                            });
                            console.log(`✅ Added new document type: ${newDoc.documentType}`);
                        }
                    } catch (moveError) {
                        console.error(`❌ Error moving new document ${newDoc.documentType}:`, moveError);
                    }
                }
            }
        }

        console.log(`✅ Google Drive replacement completed for ${playerType}: ${replacedDocuments.length} documents processed`);

        return {
            replacedDocuments,
            failedReplacements,
            success: replacedDocuments.length > 0 || failedReplacements.length === 0
        };

    } catch (error) {
        console.error(`❌ Error in replaceDocumentsInDrive for ${playerType}:`, error);
        return {
            replacedDocuments: [],
            failedReplacements: [],
            success: false
        };
    }
}

const checkAndMoveDocuments = async (
    entry: IEntry,
    connectedPlayer1?: any,
    connectedPlayer2?: any,
    documentSelections: {
        player1?: DocumentSelection;
        player2?: DocumentSelection;
    } = {}
) => {
    try {
        const movedDocuments: any[] = []
        const replacedDocuments: any[] = []

        if (entry.player1Entry?.validDocuments && entry.player1Entry.validDocuments.length > 0) {
            const player1Docs = entry.player1Entry.validDocuments

            if (connectedPlayer1?.validDocuments?.length > 0) {
                const player1Result = await replaceDocumentsInDrive(
                    connectedPlayer1.validDocuments,
                    player1Docs,
                    'player1',
                    documentSelections.player1
                )
                replacedDocuments.push(...player1Result.replacedDocuments)

                if (player1Result.failedReplacements.length > 0) {
                    console.warn(`⚠️ Some Player 1 documents failed to replace:`, player1Result.failedReplacements)
                }
            } else {
                for (const doc of player1Docs) {
                    const fileId = extractFileIdFromUrl(doc.documentURL);
                    if (fileId) {
                        try {
                            const moveResponse = await fetch('/api/transfer/entry_requirement', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ fileId }),
                            });

                            if (moveResponse.ok) {
                                movedDocuments.push({
                                    documentType: doc.documentType,
                                    fileId,
                                    status: 'moved',
                                    player: 'player1',
                                    message: 'Successfully moved to requirements folder'
                                });
                            }
                        } catch (error) {
                            console.error(`❌ Error moving document ${doc.documentType}:`, error);
                        }
                    }
                }
            }
        }

        if (entry.player2Entry?.validDocuments && entry.player2Entry.validDocuments.length > 0) {
            const player2Docs = entry.player2Entry.validDocuments

            if (connectedPlayer2?.validDocuments?.length > 0) {
                const player2Result = await replaceDocumentsInDrive(
                    connectedPlayer2.validDocuments,
                    player2Docs,
                    'player2',
                    documentSelections.player2
                )
                replacedDocuments.push(...player2Result.replacedDocuments)

                if (player2Result.failedReplacements.length > 0) {
                    console.warn(`⚠️ Some Player 2 documents failed to replace:`, player2Result.failedReplacements)
                }
            } else {
                for (const doc of player2Docs) {
                    const fileId = extractFileIdFromUrl(doc.documentURL);
                    if (fileId) {
                        try {
                            const moveResponse = await fetch('/api/transfer/entry_requirement', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ fileId }),
                            });

                            if (moveResponse.ok) {
                                movedDocuments.push({
                                    documentType: doc.documentType,
                                    fileId,
                                    status: 'moved',
                                    player: 'player2',
                                    message: 'Successfully moved to requirements folder'
                                });
                            }
                        } catch (error) {
                            console.error(`❌ Error moving document ${doc.documentType}:`, error);
                        }
                    }
                }
            }
        }

        console.log(`📊 Document processing completed:`)
        console.log(`   - Moved/Added: ${movedDocuments.length} documents`)
        console.log(`   - Replaced: ${replacedDocuments.length} documents`)
        console.log(`   - Total: ${movedDocuments.length + replacedDocuments.length} documents processed`)

        return {
            moved: movedDocuments,
            replaced: replacedDocuments,
            total: movedDocuments.length + replacedDocuments.length
        }

    } catch (error) {
        console.error('❌ Error in checkAndMoveDocuments:', error)
        return {
            moved: [],
            replaced: [],
            total: 0
        }
    }
}

const DocumentSelectionDialog = ({
    open,
    onOpenChange,
    onSave,
    existingDocuments,
    newDocuments,
    playerName,
    isLoading,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (selections: DocumentSelection) => void;
    existingDocuments: DocumentInfo[];
    newDocuments: DocumentInfo[];
    playerName: string;
    isLoading: boolean;
}) => {
    const [selections, setSelections] = useState<DocumentSelection>({});
    const [expandedPreview, setExpandedPreview] = useState<{
        url: string;
        type: string;
        source: 'existing' | 'new';
    } | null>(null);

    useEffect(() => {
        if (open) {
            const initialSelections: DocumentSelection = {};

            const allDocumentTypes = new Set([
                ...existingDocuments.map(doc => doc.documentType),
                ...newDocuments.map(doc => doc.documentType)
            ]);

            allDocumentTypes.forEach(documentType => {
                const existingDoc = existingDocuments.find(doc => doc.documentType === documentType);
                const newDoc = newDocuments.find(doc => doc.documentType === documentType);

                initialSelections[documentType] = {
                    selectedSource: existingDoc ? 'existing' : 'new',
                    existingDoc,
                    newDoc
                };
            });

            setSelections(initialSelections);
        }
    }, [open, existingDocuments, newDocuments]);

    const handleSave = () => {
        onSave(selections);
        onOpenChange(false);
    };

    const getDocumentTypeIcon = (docType: string) => {
        if (docType.toLowerCase().includes('image') || docType.toLowerCase().includes('photo')) {
            return <FileText className="h-4 w-4 mr-2" />;
        }
        return <FileText className="h-4 w-4 mr-2" />;
    };

    const getFileType = (url: string): string => {
        if (!url) return 'unknown';

        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            const searchParams = urlObj.searchParams;

            if (url.includes('drive.google.com')) {
                return 'googleDrive';
            }

            const pathParts = pathname.split('.');
            if (pathParts.length > 1) {
                const extension = pathParts.pop()?.toLowerCase() || '';

                if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension)) {
                    return 'image';
                } else if (['pdf'].includes(extension)) {
                    return 'pdf';
                } else if (['doc', 'docx'].includes(extension)) {
                    return 'doc';
                } else if (['txt'].includes(extension)) {
                    return 'text';
                }
            }

            if (searchParams.has('format') || searchParams.has('ext')) {
                const format = searchParams.get('format') || searchParams.get('ext') || '';
                const formatLower = format.toLowerCase();

                if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(formatLower)) {
                    return 'image';
                } else if (formatLower === 'pdf') {
                    return 'pdf';
                }
            }

            return 'image';
        } catch (e) {
            console.error('Error parsing URL:', e);
            return 'unknown';
        }
    };

    const getGoogleDrivePreviewUrl = (url: string): string => {
        if (!url) return '';

        try {
            const urlObj = new URL(url);
            const fileId = urlObj.searchParams.get('id');

            if (fileId) {
                return `https://drive.google.com/file/d/${fileId}/preview`;
            }

            const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
            if (match && match[1]) {
                return `https://drive.google.com/file/d/${match[1]}/preview`;
            }
        } catch (e) {
            console.error('Error parsing URL:', e);
        }

        return url;
    };

    const getGoogleDriveDownloadUrl = (url: string): string => {
        if (!url) return '';

        try {
            const urlObj = new URL(url);
            const fileId = urlObj.searchParams.get('id');

            if (fileId) {
                return `https://drive.google.com/uc?export=download&id=${fileId}`;
            }

            const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
            if (match && match[1]) {
                return `https://drive.google.com/uc?export=download&id=${match[1]}`;
            }
        } catch (e) {
            console.error('Error parsing URL:', e);
        }

        return url;
    };

    const renderDocumentPreview = (doc: DocumentInfo, source: 'existing' | 'new', compact: boolean = false) => {
        const fileType = getFileType(doc.documentURL);
        const isGoogleDrive = fileType === 'googleDrive';
        const previewUrl = isGoogleDrive ? getGoogleDrivePreviewUrl(doc.documentURL) : doc.documentURL;
        const downloadUrl = isGoogleDrive ? getGoogleDriveDownloadUrl(doc.documentURL) : doc.documentURL;

        return (
            <div className={cn(compact ? "h-full" : "h-full w-full")}>
                {compact ? (
                    <div className="relative w-full h-full border rounded-md overflow-hidden bg-white">
                        {fileType === 'image' ? (
                            <div className="relative w-full h-full">
                                <img
                                    src={doc.documentURL}
                                    alt={doc.documentType}
                                    className="object-contain w-full h-full"
                                />
                            </div>
                        ) : isGoogleDrive ? (
                            <iframe
                                src={previewUrl}
                                className="w-full h-full border-0"
                                title={`Document Preview: ${doc.documentType}`}
                                sandbox="allow-same-origin allow-scripts"
                                loading="lazy"
                            />
                        ) : fileType === 'pdf' ? (
                            <iframe
                                src={`https://docs.google.com/gview?url=${encodeURIComponent(doc.documentURL)}&embedded=true`}
                                className="w-full h-full border-0"
                                title={`PDF Preview: ${doc.documentType}`}
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                <File className="h-8 w-8 text-blue-500 mb-2" />
                                <span className="text-sm text-gray-700 text-center">
                                    Document Preview
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-full">
                        <div className="relative w-full h-full">
                            {fileType === 'image' ? (
                                <div className="relative w-full h-full">
                                    <div
                                        className="relative w-full h-full cursor-pointer"
                                        onClick={() => setExpandedPreview({
                                            url: doc.documentURL,
                                            type: doc.documentType,
                                            source: source
                                        })}
                                    >
                                        <img
                                            src={doc.documentURL}
                                            alt={doc.documentType}
                                            className="object-contain w-full h-full"
                                        />
                                    </div>
                                </div>
                            ) : isGoogleDrive ? (
                                <iframe
                                    src={previewUrl}
                                    className="w-full h-full border-0"
                                    title={`Document Preview: ${doc.documentType}`}
                                    sandbox="allow-same-origin allow-scripts"
                                    loading="lazy"
                                />
                            ) : fileType === 'pdf' ? (
                                <iframe
                                    src={`https://docs.google.com/gview?url=${encodeURIComponent(doc.documentURL)}&embedded=true`}
                                    className="w-full h-full border-0"
                                    title={`PDF Preview: ${doc.documentType}`}
                                    loading="lazy"
                                />
                            ) : fileType === 'doc' || fileType === 'text' ? (
                                <div className="w-full h-full flex flex-col items-center justify-center p-8">
                                    <File className="h-32 w-32 text-blue-500 mb-6" />
                                    <span className="text-2xl font-semibold text-gray-700 text-center mb-2">
                                        {fileType === 'doc' ? 'Microsoft Word Document' : 'Text Document'}
                                    </span>
                                    <span className="text-sm text-muted-foreground text-center mb-6 max-w-md">
                                        This document cannot be previewed inline. Please download to view the contents.
                                    </span>
                                    <Button asChild className="mt-2">
                                        <a
                                            href={downloadUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            Download Document
                                        </a>
                                    </Button>
                                </div>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-8">
                                    <File className="h-32 w-32 text-gray-500 mb-6" />
                                    <span className="text-2xl font-semibold text-gray-700 text-center mb-2">
                                        Document File
                                    </span>
                                    <span className="text-sm text-muted-foreground text-center mb-6 max-w-md">
                                        This file type cannot be previewed inline. Please download to view the contents.
                                    </span>
                                    <Button asChild className="mt-2">
                                        <a
                                            href={downloadUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            Download File
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl! max-h-[95vh]">
                <DialogHeader>
                    <DialogTitle className="text-lg">Select Documents for {playerName}</DialogTitle>
                    <DialogDescription className="text-sm">
                        Choose which documents to keep - existing ones or new ones from the entry
                    </DialogDescription>
                </DialogHeader>

                {expandedPreview ? (
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b">
                            <div className="flex items-center">
                                <button
                                    onClick={() => setExpandedPreview(null)}
                                    className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <div>
                                    <h3 className="font-semibold text-lg">{expandedPreview.type}</h3>
                                    <p className="text-sm text-gray-600">
                                        {expandedPreview.source === 'existing' ? 'Existing Document' : 'New Document'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setExpandedPreview(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden bg-gray-900 rounded-lg">
                            <div className="relative w-full h-full">
                                <div className="absolute inset-0 flex items-center justify-center p-8">
                                    <Image
                                        src={expandedPreview.url}
                                        alt={expandedPreview.type}
                                        className="max-w-full max-h-full object-contain"
                                        width={0}
                                        height={0}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Click the back button or close icon to return to document selection
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setExpandedPreview(null)}
                                    className="px-6 py-2.5"
                                >
                                    Back to Selection
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="space-y-8 h-[70vh] overflow-y-auto pr-2">
                            {Object.entries(selections).map(([documentType, selection]) => {
                                // Determine which document to show based on selection
                                const showDocument = selection.selectedSource === 'existing'
                                    ? selection.existingDoc
                                    : selection.newDoc;
                                const showSource = selection.selectedSource;

                                return (
                                    <div key={documentType} className="border-2 rounded-xl p-5 bg-white shadow-sm">
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex items-center">
                                                {getDocumentTypeIcon(documentType)}
                                                <h3 className="font-semibold text-lg">{documentType.replaceAll("_", " ")}</h3>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "px-3 py-1.5 text-sm",
                                                        selection.selectedSource === 'existing'
                                                            ? "bg-green-50 text-green-800 border-green-300"
                                                            : "bg-blue-50 text-blue-800 border-blue-300"
                                                    )}
                                                >
                                                    {selection.selectedSource === 'existing' ? 'Keeping Existing' : 'Using New'}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-6">
                                            {/* Left side - Radio buttons stacked vertically */}
                                            <div className="col-span-1">
                                                <div className="space-y-4 p-4 border rounded-lg bg-gray-50 h-full">
                                                    <div className="space-y-4">
                                                        <div className="space-y-3">
                                                            <RadioGroup
                                                                value={selection.selectedSource}
                                                                onValueChange={(value: 'existing' | 'new') => {
                                                                    setSelections(prev => ({
                                                                        ...prev,
                                                                        [documentType]: {
                                                                            ...prev[documentType],
                                                                            selectedSource: value
                                                                        }
                                                                    }));
                                                                }}
                                                                className="space-y-4"
                                                            >
                                                                {/* Existing Document Option */}
                                                                <div className={cn(
                                                                    "border-2 rounded-lg p-4 cursor-pointer transition-all",
                                                                    selection.selectedSource === 'existing'
                                                                        ? "border-green-500 bg-green-50 shadow-sm"
                                                                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                                                                )}>
                                                                    <div className="flex items-center space-x-3">
                                                                        <RadioGroupItem
                                                                            value="existing"
                                                                            id={`${documentType}-existing`}
                                                                            className="h-5 w-5"
                                                                        />
                                                                        <div className="flex-1">
                                                                            <Label htmlFor={`${documentType}-existing`} className="cursor-pointer">
                                                                                <div className="flex items-center justify-between">
                                                                                    <span className="font-bold text-base">Existing Document</span>
                                                                                    {selection.existingDoc ? (
                                                                                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                                                                            <Check className="h-3 w-3 mr-1" />
                                                                                            Available
                                                                                        </Badge>
                                                                                    ) : (
                                                                                        <Badge variant="outline" className="bg-gray-100 text-gray-600">
                                                                                            <X className="h-3 w-3 mr-1" />
                                                                                            Not Available
                                                                                        </Badge>
                                                                                    )}
                                                                                </div>
                                                                            </Label>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* New Document Option */}
                                                                <div className={cn(
                                                                    "border-2 rounded-lg p-4 cursor-pointer transition-all",
                                                                    selection.selectedSource === 'new'
                                                                        ? "border-blue-500 bg-blue-50 shadow-sm"
                                                                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                                                                )}>
                                                                    <div className="flex items-center space-x-3">
                                                                        <RadioGroupItem
                                                                            value="new"
                                                                            id={`${documentType}-new`}
                                                                            className="h-5 w-5"
                                                                        />
                                                                        <div className="flex-1">
                                                                            <Label htmlFor={`${documentType}-new`} className="cursor-pointer">
                                                                                <div className="flex items-center justify-between">
                                                                                    <span className="font-bold text-base">New Document</span>
                                                                                    {selection.newDoc ? (
                                                                                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                                                                                            <Sparkles className="h-3 w-3 mr-1" />
                                                                                            Available
                                                                                        </Badge>
                                                                                    ) : (
                                                                                        <Badge variant="outline" className="bg-gray-100 text-gray-600">
                                                                                            <X className="h-3 w-3 mr-1" />
                                                                                            Not Available
                                                                                        </Badge>
                                                                                    )}
                                                                                </div>
                                                                            </Label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </RadioGroup>
                                                        </div>

                                                        <Separator />

                                                        {/* Action Summary */}
                                                        <div className="space-y-3 text-sm">
                                                            <div>
                                                                <p className="font-semibold mb-1">Selected:</p>
                                                                {selection.selectedSource === 'existing' ? (
                                                                    <div className="flex items-center space-x-2 text-green-700">
                                                                        <Check className="h-4 w-4" />
                                                                        <span>Existing Document</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center space-x-2 text-blue-700">
                                                                        <Sparkles className="h-4 w-4" />
                                                                        <span>New Document</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {selection.existingDoc && selection.newDoc && (
                                                                <div className={cn(
                                                                    "p-3 rounded-lg",
                                                                    selection.selectedSource === 'existing'
                                                                        ? "bg-green-50 border border-green-200"
                                                                        : "bg-amber-50 border border-amber-200"
                                                                )}>
                                                                    <p className="font-semibold mb-1">Action:</p>
                                                                    {selection.selectedSource === 'existing' ? (
                                                                        <p className="text-green-800 text-sm">
                                                                            Existing document will be kept. New document will be discarded.
                                                                        </p>
                                                                    ) : (
                                                                        <div className="space-y-1">
                                                                            <p className="text-amber-800 text-sm font-semibold flex items-center">
                                                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                                                Replacement Required
                                                                            </p>
                                                                            <p className="text-amber-700 text-xs">
                                                                                New document will replace the existing one. The old document will be permanently removed.
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-span-2">
                                                <div className="h-full flex flex-col">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div>
                                                            <h4 className="font-medium text-lg">
                                                                {showDocument
                                                                    ? `${showSource === 'existing' ? 'Existing' : 'New'} Document Preview`
                                                                    : 'No Document Available'}
                                                            </h4>
                                                            {/* <p className="text-sm text-muted-foreground">
                                {showDocument
                                  ? `Preview of the ${selection.selectedSource} document`
                                  : 'Select a document type that has an available document'}
                              </p> */}
                                                        </div>
                                                        {showDocument && (
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    asChild
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <a
                                                                        href={showDocument.documentURL}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        title="Open in new tab"
                                                                    >
                                                                        <Maximize2 className="h-3.5 w-3.5" />
                                                                    </a>
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Updated container with increased height */}
                                                    <div className="flex-1 min-h-[500px] border-2 rounded-lg overflow-hidden bg-gray-50">
                                                        {showDocument ? (
                                                            <div className="w-full h-full">
                                                                {renderDocumentPreview(showDocument, showSource, false)}
                                                            </div>
                                                        ) : (
                                                            <div className="w-full h-full flex flex-col items-center justify-center">
                                                                <FileText className="h-24 w-24 text-gray-400 mb-4" />
                                                                <p className="text-lg text-gray-600 font-medium">No document available</p>
                                                                <p className="text-sm text-gray-500 mt-2 max-w-md text-center">
                                                                    {selection.selectedSource === 'existing'
                                                                        ? 'No existing document of this type was found'
                                                                        : 'No new document of this type was uploaded'}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="mt-4 text-center">
                                                        <p className="text-xs text-muted-foreground">
                                                            {showDocument
                                                                ? 'The selected document will be used. Click the maximize icon to open in a new tab.'
                                                                : 'Please select an option that has an available document'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Summary at bottom */}
                                        <div className="mt-6 pt-5 border-t">
                                            {selection.selectedSource === 'existing' && selection.existingDoc ? (
                                                <p className="text-green-800 bg-green-50 p-3 rounded-lg border border-green-200 flex items-center">
                                                    <Check className="h-5 w-5 mr-2 text-green-600" />
                                                    <span className="font-medium">The existing document will be kept.</span> The new document will be removed.
                                                </p>
                                            ) : selection.selectedSource === 'new' && selection.newDoc ? (
                                                <p className={cn(
                                                    "p-3 rounded-lg border flex items-start",
                                                    selection.existingDoc
                                                        ? "text-amber-800 bg-amber-50 border-amber-200"
                                                        : "text-blue-800 bg-blue-50 border-blue-200"
                                                )}>
                                                    {selection.existingDoc ? (
                                                        <>
                                                            <AlertCircle className="h-5 w-5 mr-2 text-amber-600 flex-shrink-0 mt-0.5" />
                                                            <div>
                                                                <span className="font-bold">⚠️ Replacement Required:</span> The new document will replace the existing one. The old document will be permanently removed from Google Drive and the database.
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Check className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                                                            <div>
                                                                <span className="font-medium">The new document will be added.</span> No existing document to replace.
                                                            </div>
                                                        </>
                                                    )}
                                                </p>
                                            ) : (
                                                <p className="text-gray-500 italic p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    No document available for this type.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {Object.keys(selections).length === 0 && (
                                <div className="text-center py-12">
                                    <FileText className="h-20 w-20 mx-auto text-gray-300 mb-5" />
                                    <p className="text-xl text-gray-600 font-medium">No documents to select</p>
                                    <p className="text-base text-gray-500 mt-2 max-w-md mx-auto">
                                        There are no documents that need selection for this player.
                                    </p>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="pt-6 border-t">
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                                className="px-6 py-2.5 text-base"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="px-8 py-2.5 text-base"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5 mr-2" />
                                        Save Selections
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

const AssignDialog = (props: Props) => {
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)
    const [showDocumentSelection1, setShowDocumentSelection1] = useState(false)
    const [showDocumentSelection2, setShowDocumentSelection2] = useState(false)
    const [documentSelections, setDocumentSelections] = useState<{
        player1?: DocumentSelection;
        player2?: DocumentSelection;
    }>({})
    const [assignPlayers, { loading: assignLoading }] =
        useMutation(ASSIGN_PLAYERS)
    const { data, loading: entryLoading }: any = useQuery(ENTRY, {
        variables: { _id: props._id },
        skip: !open || !Boolean(props._id),
        fetchPolicy: "network-only",
    })
    const entry = data?.entry as IEntry
    const { data: optionsData, loading: optionsLoading }: any = useQuery(
        OPTIONS,
        {
            skip: !open,
            fetchPolicy: "no-cache",
        }
    )
    const [openPlayers1, setOpenPlayers1] = useState(false)
    const [openPlayers2, setOpenPlayers2] = useState(false)
    const players = optionsData?.playerOptions || []
    const [fetchPlayer1, { data: player1Data, loading: player1Loading }]: any =
        useLazyQuery(PLAYER_1, {
            fetchPolicy: "no-cache",
        })
    const [fetchPlayer2, { data: player2Data, loading: player2Loading }]: any =
        useLazyQuery(PLAYER_2, {
            fetchPolicy: "no-cache",
        })
    const player1 = player1Data?.player
    const player2 = player2Data?.player
    const isLoading =
        assignLoading ||
        entryLoading ||
        optionsLoading ||
        player1Loading ||
        player2Loading

    const form = useForm({
        defaultValues: {
            entry: props._id || "",
            isPlayer1New: false,
            isPlayer2New: false,
            connectedPlayer1: entry?.connectedPlayer1?._id || null,
            connectedPlayer2: entry?.connectedPlayer2?._id || null,
            migratePlayer1Data: {
                firstName: false,
                middleName: false,
                lastName: false,
                suffix: false,
                birthDate: false,
                phoneNumber: false,
                email: false,
                validDocuments: false,
            },
            migratePlayer2Data: {
                firstName: false,
                middleName: false,
                lastName: false,
                suffix: false,
                birthDate: false,
                phoneNumber: false,
                email: false,
                validDocuments: false,
            },
        },
        listeners: {
            onChange: ({ formApi, fieldApi }) => {
                if (fieldApi.name === "isPlayer1New" && fieldApi.state.value) {
                    formApi.setFieldValue("connectedPlayer1", null)
                    formApi.setFieldValue("migratePlayer1Data", {
                        firstName: false,
                        middleName: false,
                        lastName: false,
                        suffix: false,
                        birthDate: false,
                        phoneNumber: false,
                        email: false,
                        validDocuments: false,
                    })
                    setDocumentSelections(prev => ({ ...prev, player1: undefined }))
                }

                if (fieldApi.name === "connectedPlayer1" && fieldApi.state.value) {
                    fetchPlayer1({ variables: { _id: fieldApi.state.value } })
                }

                if (fieldApi.name === "isPlayer2New" && fieldApi.state.value) {
                    formApi.setFieldValue("connectedPlayer2", null)
                    formApi.setFieldValue("migratePlayer2Data", {
                        firstName: false,
                        middleName: false,
                        lastName: false,
                        suffix: false,
                        birthDate: false,
                        phoneNumber: false,
                        email: false,
                        validDocuments: false,
                    })
                    setDocumentSelections(prev => ({ ...prev, player2: undefined }))
                }
                if (fieldApi.name === "connectedPlayer2" && fieldApi.state.value) {
                    fetchPlayer2({ variables: { _id: fieldApi.state.value } })
                }
            },
        },
        validators: {
            onSubmit: ({ formApi, value }) => {
                try {
                    AssignPlayersSchema.parse(value)
                } catch (error: any) {
                    const formErrors = JSON.parse(error)
                    formErrors.map(
                        ({ path, message }: { path: string; message: string }) =>
                            formApi.fieldInfo[
                                path as keyof typeof formApi.fieldInfo
                            ].instance?.setErrorMap({
                                onSubmit: { message },
                            })
                    )
                }
            },
        },
        onSubmit: ({ value: payload, formApi }) =>
            startTransition(async () => {
                try {
                    console.log("🚀 Starting player assignment process...")
                    console.log("📋 Form payload:", payload)

                    const finalPayload = {
                        ...payload,
                    };

                    if (entry) {
                        try {
                            const documentResult = await checkAndMoveDocuments(
                                entry,
                                player1,
                                player2,
                                documentSelections
                            )

                            if (documentResult.total > 0) {
                                const messages: string[] = []

                                if (documentResult.replaced.length > 0) {
                                    messages.push(`Replaced ${documentResult.replaced.length} document(s)`)
                                }

                                if (documentResult.moved.length > 0) {
                                    const movedCount = documentResult.moved.filter(d => d.status !== 'already_exists').length
                                    const alreadyExistsCount = documentResult.moved.filter(d => d.status === 'already_exists').length

                                    if (movedCount > 0) {
                                        messages.push(`Added ${movedCount} new document(s)`)
                                    }

                                    if (alreadyExistsCount > 0) {
                                        messages.push(`${alreadyExistsCount} document(s) already in folder`)
                                    }
                                }

                                if (messages.length > 0) {
                                    toast.success(`Documents processed: ${messages.join(', ')}`, {
                                        duration: 5000,
                                    })
                                }
                            } else {
                                console.log("📭 No documents to process")
                            }
                        } catch (documentError: any) {
                            toast.warning('Some documents could not be processed, but players will still be assigned', {
                                duration: 4000,
                            })
                        }
                    } else {
                        console.log("📭 No entry data found for document processing")
                    }

                    const response: any = await assignPlayers({
                        variables: {
                            input: finalPayload,
                        },
                    })

                    if (response?.data?.assignPlayers?.ok) {
                        onClose()

                        toast.success(response.data.assignPlayers.message || "Players assigned successfully", {
                            duration: 3000,
                        })
                    } else {
                        toast.error(response?.data?.assignPlayers?.message || "Failed to assign players", {
                            duration: 3000,
                        })
                    }
                } catch (error: any) {
                    toast.error(error.message || "Failed to assign players", {
                        duration: 3000,
                    })

                    if (error.name == "CombinedGraphQLErrors") {
                        const fieldErrors = error.errors[0]?.extensions?.fields
                        if (fieldErrors) {
                            fieldErrors.map(
                                ({ path, message }: { path: string; message: string }) =>
                                    formApi.fieldInfo[
                                        path as keyof typeof formApi.fieldInfo
                                    ].instance?.setErrorMap({
                                        onSubmit: { message },
                                    })
                            )
                        }
                    }
                }
            }),
    })

    useEffect(() => {
        if (open && entry?.connectedPlayer1) {
            fetchPlayer1({
                variables: {
                    _id: entry.connectedPlayer1._id,
                },
            })
        }
    }, [open, entry, fetchPlayer1])

    useEffect(() => {
        if (open && entry?.connectedPlayer2) {
            fetchPlayer2({
                variables: {
                    _id: entry.connectedPlayer2._id,
                },
            })
        }
    }, [open, entry, fetchPlayer2])

    const onClose = () => {
        form.reset()
        setDocumentSelections({})
        setOpen(false)
        props.onClose?.()
    }

    const handleDocumentSelection1 = () => {
        setShowDocumentSelection1(true);
    };

    const handleDocumentSelection2 = () => {
        setShowDocumentSelection2(true);
    };

    const handleSaveDocumentSelections1 = (selections: DocumentSelection) => {
        setDocumentSelections(prev => ({ ...prev, player1: selections }));
        form.setFieldValue("migratePlayer1Data.validDocuments", true);
        toast.success('Document selections saved for Player 1', {
            duration: 3000,
        });
    };

    const handleSaveDocumentSelections2 = (selections: DocumentSelection) => {
        setDocumentSelections(prev => ({ ...prev, player2: selections }));
        form.setFieldValue("migratePlayer2Data.validDocuments", true);
        toast.success('Document selections saved for Player 2', {
            duration: 3000,
        });
    };

    const getPlayer1ExistingDocuments = (): DocumentInfo[] => {
        if (!player1?.validDocuments) return [];
        return player1.validDocuments.map(doc => ({
            documentType: doc.documentType,
            documentURL: doc.documentURL,
            dateUploaded: doc.dateUploaded,
            player: 'Player 1',
            source: 'existing'
        }));
    };

    const getPlayer1NewDocuments = (): DocumentInfo[] => {
        if (!entry?.player1Entry?.validDocuments) return [];
        return entry.player1Entry.validDocuments.map(doc => ({
            documentType: doc.documentType,
            documentURL: doc.documentURL,
            dateUploaded: doc.dateUploaded,
            player: 'Player 1',
            source: 'new'
        }));
    };

    const getPlayer2ExistingDocuments = (): DocumentInfo[] => {
        if (!player2?.validDocuments) return [];
        return player2.validDocuments.map(doc => ({
            documentType: doc.documentType,
            documentURL: doc.documentURL,
            dateUploaded: doc.dateUploaded,
            player: 'Player 2',
            source: 'existing'
        }));
    };

    const getPlayer2NewDocuments = (): DocumentInfo[] => {
        if (!entry?.player2Entry?.validDocuments) return [];
        return entry.player2Entry.validDocuments.map(doc => ({
            documentType: doc.documentType,
            documentURL: doc.documentURL,
            dateUploaded: doc.dateUploaded,
            player: 'Player 2',
            source: 'new'
        }));
    };

    const hasPlayer1DocumentsToSelect = () => {
        const hasExisting = getPlayer1ExistingDocuments().length > 0;
        const hasNew = getPlayer1NewDocuments().length > 0;
        return hasExisting && hasNew;
    };

    const hasPlayer2DocumentsToSelect = () => {
        const hasExisting = getPlayer2ExistingDocuments().length > 0;
        const hasNew = getPlayer2NewDocuments().length > 0;
        return hasExisting && hasNew;
    };

    const handleFormSubmit = async () => {
        const needsPlayer1Selection = !form.getFieldValue("isPlayer1New") &&
            form.getFieldValue("connectedPlayer1") &&
            hasPlayer1DocumentsToSelect() &&
            !documentSelections.player1;

        const needsPlayer2Selection = !form.getFieldValue("isPlayer2New") &&
            form.getFieldValue("connectedPlayer2") &&
            hasPlayer2DocumentsToSelect() &&
            !documentSelections.player2;

        if (needsPlayer1Selection) {
            setShowDocumentSelection1(true);
            return;
        } else if (needsPlayer2Selection) {
            setShowDocumentSelection2(true);
            return;
        } else {
            form.handleSubmit();
        }
    };

    const getDocumentSelectionSummary = (selections?: DocumentSelection) => {
        if (!selections) return null;

        const total = Object.keys(selections).length;
        const selectedNew = Object.values(selections).filter(s => s.selectedSource === 'new').length;
        const selectedExisting = Object.values(selections).filter(s => s.selectedSource === 'existing').length;

        return `${selectedNew} new, ${selectedExisting} existing`;
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <form>
                    <DialogTrigger asChild>
                        <DropdownMenuItem
                            className="text-info focus:bg-info/10 focus:text-info"
                            onSelect={(e) => e.preventDefault()}
                        >
                            {props.title}
                        </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        onInteractOutside={(e) => e.preventDefault()}
                        showCloseButton={false}
                    >
                        <DialogHeader>
                            <DialogTitle>Player Assignment: {entry?.entryNumber}</DialogTitle>
                            <DialogDescription>
                                Assign players to this entry for streamlined data management.
                            </DialogDescription>
                        </DialogHeader>
                        <form
                            className="-mt-2 mb-2"
                            id="assign-players-form"
                            onSubmit={(e) => {
                                e.preventDefault()
                                handleFormSubmit()
                            }}
                        >
                            <form.Subscribe
                                selector={(state) => state.values}
                                children={(state) => (
                                    <Tabs defaultValue="player1">
                                        <TabsList
                                            className={cn(
                                                entry?.player2Entry ? "flex" : "hidden",
                                                "w-full"
                                            )}
                                        >
                                            <TabsTrigger value="player1">Player 1</TabsTrigger>
                                            {!!(entry?.player2Entry || entry?.connectedPlayer2) && (
                                                <TabsTrigger value="player2">Player 2</TabsTrigger>
                                            )}
                                        </TabsList>
                                        <TabsContent value="player1">
                                            <FieldSet className="flex flex-col gap-2.5 h-[52vh] overflow-y-auto">
                                                <form.Field
                                                    name="isPlayer1New"
                                                    children={(field) => {
                                                        const isInvalid =
                                                            field.state.meta.isTouched &&
                                                            !field.state.meta.isValid
                                                        return (
                                                            <Field data-invalid={isInvalid}>
                                                                <div className="flex items-center py-1">
                                                                    <Checkbox
                                                                        id={field.name}
                                                                        name={field.name}
                                                                        checked={field.state.value}
                                                                        onBlur={field.handleBlur}
                                                                        onCheckedChange={(checked) =>
                                                                            field.handleChange(checked === true)
                                                                        }
                                                                        className="mr-2"
                                                                        aria-invalid={isInvalid}
                                                                        disabled={isLoading}
                                                                    />
                                                                    <div className="grid">
                                                                        <FieldLabel htmlFor={field.name}>
                                                                            Is New Player? (Player 1)
                                                                        </FieldLabel>
                                                                        <span className="text-muted-foreground text-xs">
                                                                            Checking this will create a new player
                                                                            profile.
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {isInvalid && (
                                                                    <FieldError errors={field.state.meta.errors} />
                                                                )}
                                                            </Field>
                                                        )
                                                    }}
                                                />

                                                {!state.isPlayer1New && state.connectedPlayer1 && hasPlayer1DocumentsToSelect() && (
                                                    <div className="mb-4">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <Label className="text-sm font-medium">Document Selection</Label>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Choose which documents to keep for Player 1
                                                                </p>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={handleDocumentSelection1}
                                                                disabled={isLoading}
                                                            >
                                                                {documentSelections.player1 ? "Edit Selection" : "Select Documents"}
                                                            </Button>
                                                        </div>
                                                        {documentSelections.player1 ? (
                                                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center">
                                                                        <Check className="h-4 w-4 mr-2 text-green-600" />
                                                                        <div>
                                                                            <p className="text-sm font-medium text-blue-800">Document selections saved</p>
                                                                            <p className="text-xs text-blue-600">
                                                                                {getDocumentSelectionSummary(documentSelections.player1)} documents selected
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={handleDocumentSelection1}
                                                                        className="text-xs"
                                                                    >
                                                                        Edit
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                                                                <div className="flex items-center">
                                                                    <FileText className="h-4 w-4 mr-2 text-amber-600" />
                                                                    <div>
                                                                        <p className="text-sm font-medium text-amber-800">Document Selection Required</p>
                                                                        <p className="text-xs text-amber-600">
                                                                            Click "Select Documents" to choose which documents to keep
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {!state.isPlayer1New && (
                                                    <>
                                                        <form.Field
                                                            name="connectedPlayer1"
                                                            children={(field) => {
                                                                const isInvalid =
                                                                    field.state.meta.isTouched &&
                                                                    !field.state.meta.isValid
                                                                return (
                                                                    <Field data-invalid={isInvalid}>
                                                                        <FieldLabel htmlFor={field.name}>
                                                                            Connected Player 1
                                                                        </FieldLabel>
                                                                        <Popover
                                                                            open={openPlayers1}
                                                                            onOpenChange={setOpenPlayers1}
                                                                        >
                                                                            <PopoverTrigger asChild>
                                                                                <Button
                                                                                    id={field.name}
                                                                                    name={field.name}
                                                                                    disabled={optionsLoading}
                                                                                    aria-expanded={openPlayers1}
                                                                                    onBlur={field.handleBlur}
                                                                                    variant="outline"
                                                                                    role="combobox"
                                                                                    aria-invalid={isInvalid}
                                                                                    className={cn(
                                                                                        "w-full justify-between font-normal capitalize -mt-2",
                                                                                        !field.state.value &&
                                                                                        "text-muted-foreground"
                                                                                    )}
                                                                                    type="button"
                                                                                >
                                                                                    {field.state.value
                                                                                        ? players.find(
                                                                                            (o: {
                                                                                                value: string
                                                                                                label: string
                                                                                            }) =>
                                                                                                o.value === field.state.value
                                                                                        )?.label
                                                                                        : "Select Player 1"}
                                                                                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                                </Button>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className="w-full p-0">
                                                                                <Command
                                                                                    filter={(value, search) =>
                                                                                        players
                                                                                            .find(
                                                                                                (t: {
                                                                                                    value: string
                                                                                                    label: string
                                                                                                }) => t.value === value
                                                                                            )
                                                                                            ?.label.toLowerCase()
                                                                                            .includes(search.toLowerCase())
                                                                                            ? 1
                                                                                            : 0
                                                                                    }
                                                                                >
                                                                                    <CommandInput placeholder="Select Player 1" />
                                                                                    <CommandList className="max-h-72 overflow-y-auto">
                                                                                        <CommandGroup>
                                                                                            <Label className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
                                                                                                Players
                                                                                            </Label>
                                                                                            {players?.map(
                                                                                                (o: {
                                                                                                    value: string
                                                                                                    label: string
                                                                                                    hasEarlyBird: boolean
                                                                                                }) => (
                                                                                                    <CommandItem
                                                                                                        key={o.value}
                                                                                                        value={o.value}
                                                                                                        onSelect={(v) => {
                                                                                                            field.handleChange(
                                                                                                                v.toString()
                                                                                                            )
                                                                                                            setOpenPlayers1(false)
                                                                                                        }}
                                                                                                        className="capitalize"
                                                                                                    >
                                                                                                        <CheckIcon
                                                                                                            className={cn(
                                                                                                                "h-4 w-4",
                                                                                                                field.state.value ===
                                                                                                                    o.value
                                                                                                                    ? "opacity-100"
                                                                                                                    : "opacity-0"
                                                                                                            )}
                                                                                                        />
                                                                                                        {o.label}
                                                                                                    </CommandItem>
                                                                                                )
                                                                                            )}
                                                                                        </CommandGroup>
                                                                                        <CommandEmpty>
                                                                                            No players found.
                                                                                        </CommandEmpty>
                                                                                    </CommandList>
                                                                                </Command>
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                        {isInvalid && (
                                                                            <FieldError
                                                                                errors={field.state.meta.errors}
                                                                            />
                                                                        )}
                                                                    </Field>
                                                                )
                                                            }}
                                                        />
                                                        <Separator />
                                                        <div className="flex flex-col">
                                                            <div className="col-span-2">
                                                                <Label>Migrate Data</Label>
                                                                <span className="text-xs text-muted-foreground">
                                                                    Checked fields will update the player database
                                                                    with entry data.
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center w-full gap-2">
                                                                <div className="h-full flex items-center justify-center">
                                                                    <Checkbox
                                                                        disabled={
                                                                            isLoading || !state.connectedPlayer1
                                                                        }
                                                                        onCheckedChange={(checked) => {
                                                                            form.setFieldValue("migratePlayer1Data", {
                                                                                firstName: checked === true,
                                                                                middleName: checked === true,
                                                                                lastName: checked === true,
                                                                                suffix: checked === true,
                                                                                birthDate: checked === true,
                                                                                phoneNumber: checked === true,
                                                                                email: checked === true,
                                                                                validDocuments: checked === true,
                                                                            })
                                                                            if (checked) {
                                                                                setTimeout(() => {
                                                                                    handleDocumentSelection1();
                                                                                }, 100);
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="text-xs grid grid-cols-5 col-span-2 h-full w-full">
                                                                    <div className="px-2 h-full border w-full flex items-center justify-center min-h-8"></div>
                                                                    <span
                                                                        className={cn(
                                                                            "px-2 h-full border w-full flex items-center justify-center",
                                                                            state.connectedPlayer1
                                                                                ? "col-span-2"
                                                                                : "hidden"
                                                                        )}
                                                                    >
                                                                        From Database (Current)
                                                                    </span>{" "}
                                                                    <span
                                                                        className={cn(
                                                                            "px-2 h-full border w-full flex items-center justify-center",
                                                                            state.connectedPlayer1
                                                                                ? "col-span-2"
                                                                                : "col-span-4"
                                                                        )}
                                                                    >
                                                                        From Entry (New)
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <form.Field
                                                                    name="migratePlayer1Data.firstName"
                                                                    children={(field) => {
                                                                        const isInvalid =
                                                                            field.state.meta.isTouched &&
                                                                            !field.state.meta.isValid
                                                                        return (
                                                                            <Field>
                                                                                <div className="flex items-center w-full gap-2">
                                                                                    <div className="h-full flex items-center justify-center">
                                                                                        <Checkbox
                                                                                            id={field.name}
                                                                                            name={field.name}
                                                                                            checked={field.state.value}
                                                                                            onBlur={field.handleBlur}
                                                                                            onCheckedChange={(checked) =>
                                                                                                field.handleChange(
                                                                                                    checked === true
                                                                                                )
                                                                                            }
                                                                                            aria-invalid={isInvalid}
                                                                                            disabled={
                                                                                                isLoading ||
                                                                                                !state.connectedPlayer1
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                    <div className="text-xs grid grid-cols-5 col-span-2 min-h-8 w-full">
                                                                                        <span className="px-2 h-full border w-full flex items-center justify-center py-1 text-center">
                                                                                            First Name
                                                                                        </span>
                                                                                        {state.connectedPlayer1 ? (
                                                                                            <>
                                                                                                <span
                                                                                                    className={cn(
                                                                                                        !field.state.value &&
                                                                                                        "text-success bg-success/5",
                                                                                                        "col-span-2 px-2 h-full border w-full flex items-center justify-start py-1"
                                                                                                    )}
                                                                                                >
                                                                                                    {player1?.firstName}
                                                                                                </span>{" "}
                                                                                                <span
                                                                                                    className={cn(
                                                                                                        field.state.value &&
                                                                                                        "text-warning bg-warning/5",
                                                                                                        "col-span-2 px-2 h-full border w-full flex items-center justify-start py-1"
                                                                                                    )}
                                                                                                >
                                                                                                    {entry?.player1Entry.firstName}
                                                                                                </span>
                                                                                            </>
                                                                                        ) : (
                                                                                            <span
                                                                                                className={cn(
                                                                                                    field.state.value &&
                                                                                                    "text-warning",
                                                                                                    "col-span-4 px-2 h-full border w-full flex items-center justify-start"
                                                                                                )}
                                                                                            >
                                                                                                {entry?.player1Entry.firstName}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </Field>
                                                                        )
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <form.Field
                                                                    name="migratePlayer1Data.middleName"
                                                                    children={(field) => {
                                                                        const isInvalid =
                                                                            field.state.meta.isTouched &&
                                                                            !field.state.meta.isValid
                                                                        return (
                                                                            <Field>
                                                                                <div className="flex items-center w-full gap-2">
                                                                                    <div className="h-full flex items-center justify-center text-center">
                                                                                        <Checkbox
                                                                                            id={field.name}
                                                                                            name={field.name}
                                                                                            checked={field.state.value}
                                                                                            onBlur={field.handleBlur}
                                                                                            onCheckedChange={(checked) =>
                                                                                                field.handleChange(
                                                                                                    checked === true
                                                                                                )
                                                                                            }
                                                                                            aria-invalid={isInvalid}
                                                                                            disabled={
                                                                                                isLoading ||
                                                                                                !state.connectedPlayer1
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                    <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                                                                        <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                                                                            Middle Name
                                                                                        </span>
                                                                                        {state.connectedPlayer1 ? (
                                                                                            <>
                                                                                                <span
                                                                                                    className={cn(
                                                                                                        !field.state.value &&
                                                                                                        "text-success bg-success/5",
                                                                                                        "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                                                                                        !player1?.middleName &&
                                                                                                        "italic"
                                                                                                    )}
                                                                                                >
                                                                                                    {player1?.middleName || "N/A"}
                                                                                                </span>{" "}
                                                                                                <span
                                                                                                    className={cn(
                                                                                                        field.state.value &&
                                                                                                        "text-warning bg-warning/5",
                                                                                                        "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                                                                                        !player1?.middleName &&
                                                                                                        "italic"
                                                                                                    )}
                                                                                                >
                                                                                                    {entry?.player1Entry
                                                                                                        .middleName || "N/A"}
                                                                                                </span>
                                                                                            </>
                                                                                        ) : (
                                                                                            <span
                                                                                                className={cn(
                                                                                                    field.state.value &&
                                                                                                    "text-warning",
                                                                                                    "col-span-4 px-2 border w-full flex items-center justify-start py-1",
                                                                                                    !player1?.middleName && "italic"
                                                                                                )}
                                                                                            >
                                                                                                {entry?.player1Entry.middleName ||
                                                                                                    "N/A"}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </Field>
                                                                        )
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <form.Field
                                                                    name="migratePlayer1Data.lastName"
                                                                    children={(field) => {
                                                                        const isInvalid =
                                                                            field.state.meta.isTouched &&
                                                                            !field.state.meta.isValid
                                                                        return (
                                                                            <Field>
                                                                                <div className="flex items-center w-full gap-2">
                                                                                    <div className="flex items-center justify-center">
                                                                                        <Checkbox
                                                                                            id={field.name}
                                                                                            name={field.name}
                                                                                            checked={field.state.value}
                                                                                            onBlur={field.handleBlur}
                                                                                            onCheckedChange={(checked) =>
                                                                                                field.handleChange(
                                                                                                    checked === true
                                                                                                )
                                                                                            }
                                                                                            aria-invalid={isInvalid}
                                                                                            disabled={
                                                                                                isLoading ||
                                                                                                !state.connectedPlayer1
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                    <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                                                                        <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                                                                            Last Name
                                                                                        </span>
                                                                                        {state.connectedPlayer1 ? (
                                                                                            <>
                                                                                                <span
                                                                                                    className={cn(
                                                                                                        !field.state.value &&
                                                                                                        "text-success bg-success/5",
                                                                                                        "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                                                                                        !player1?.lastName && "italic"
                                                                                                    )}
                                                                                                >
                                                                                                    {player1?.lastName || "N/A"}
                                                                                                </span>{" "}
                                                                                                <span
                                                                                                    className={cn(
                                                                                                        field.state.value &&
                                                                                                        "text-warning bg-warning/5",
                                                                                                        "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                                                                                        !player1?.lastName && "italic"
                                                                                                    )}
                                                                                                >
                                                                                                    {entry?.player1Entry.lastName ||
                                                                                                        "N/A"}
                                                                                                </span>
                                                                                            </>
                                                                                        ) : (
                                                                                            <span
                                                                                                className={cn(
                                                                                                    field.state.value &&
                                                                                                    "text-warning",
                                                                                                    "col-span-4 px-2 border w-full flex items-center justify-start py-1",
                                                                                                    !player1?.lastName && "italic"
                                                                                                )}
                                                                                            >
                                                                                                {entry?.player1Entry.lastName ||
                                                                                                    "N/A"}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </Field>
                                                                        )
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <form.Field
                                                                    name="migratePlayer1Data.suffix"
                                                                    children={(field) => {
                                                                        const isInvalid =
                                                                            field.state.meta.isTouched &&
                                                                            !field.state.meta.isValid
                                                                        return (
                                                                            <Field>
                                                                                <div className="flex items-center w-full gap-2">
                                                                                    <div className="flex items-center justify-center">
                                                                                        <Checkbox
                                                                                            id={field.name}
                                                                                            name={field.name}
                                                                                            checked={field.state.value}
                                                                                            onBlur={field.handleBlur}
                                                                                            onCheckedChange={(checked) =>
                                                                                                field.handleChange(
                                                                                                    checked === true
                                                                                                )
                                                                                            }
                                                                                            aria-invalid={isInvalid}
                                                                                            disabled={
                                                                                                isLoading ||
                                                                                                !state.connectedPlayer1
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                    <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                                                                        <span className="px-2 border w-full flex items-center py-1 justify-center text-center">
                                                                                            Ext.
                                                                                        </span>
                                                                                        {state.connectedPlayer1 ? (
                                                                                            <>
                                                                                                <span
                                                                                                    className={cn(
                                                                                                        !field.state.value &&
                                                                                                        "text-success bg-success/5",
                                                                                                        "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                                                                        !player1?.suffix && "italic"
                                                                                                    )}
                                                                                                >
                                                                                                    {player1?.suffix || "N/A"}
                                                                                                </span>{" "}
                                                                                                <span
                                                                                                    className={cn(
                                                                                                        field.state.value &&
                                                                                                        "text-warning bg-warning/5",
                                                                                                        "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                                                                        !player1?.suffix && "italic"
                                                                                                    )}
                                                                                                >
                                                                                                    {entry?.player1Entry.suffix ||
                                                                                                        "N/A"}
                                                                                                </span>
                                                                                            </>
                                                                                        ) : (
                                                                                            <span
                                                                                                className={cn(
                                                                                                    field.state.value &&
                                                                                                    "text-warning",
                                                                                                    "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                                                                                    !player1?.suffix && "italic"
                                                                                                )}
                                                                                            >
                                                                                                {entry?.player1Entry.suffix ||
                                                                                                    "N/A"}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </Field>
                                                                        )
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <form.Field
                                                                    name="migratePlayer1Data.email"
                                                                    children={(field) => {
                                                                        const isInvalid =
                                                                            field.state.meta.isTouched &&
                                                                            !field.state.meta.isValid
                                                                        return (
                                                                            <Field>
                                                                                <div className="flex items-center w-full gap-2">
                                                                                    <div className="flex items-center justify-center">
                                                                                        <Checkbox
                                                                                            id={field.name}
                                                                                            name={field.name}
                                                                                            checked={field.state.value}
                                                                                            onBlur={field.handleBlur}
                                                                                            onCheckedChange={(checked) =>
                                                                                                field.handleChange(
                                                                                                    checked === true
                                                                                                )
                                                                                            }
                                                                                            aria-invalid={isInvalid}
                                                                                            disabled={
                                                                                                isLoading ||
                                                                                                !state.connectedPlayer1
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                    <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                                                                        <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                                                                            Email
                                                                                        </span>
                                                                                        {state.connectedPlayer1 ? (
                                                                                            <>
                                                                                                <span
                                                                                                    className={cn(
                                                                                                        !field.state.value &&
                                                                                                        "text-success bg-success/5",
                                                                                                        "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                                                                        !player1?.email && "italic"
                                                                                                    )}
                                                                                                >
                                                                                                    {player1?.email || "N/A"}
                                                                                                </span>{" "}
                                                                                                <span
                                                                                                    className={cn(
                                                                                                        field.state.value &&
                                                                                                        "text-warning bg-warning/5",
                                                                                                        "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                                                                        !player1?.email && "italic"
                                                                                                    )}
                                                                                                >
                                                                                                    {entry?.player1Entry.email ||
                                                                                                        "N/A"}
                                                                                                </span>
                                                                                            </>
                                                                                        ) : (
                                                                                            <span
                                                                                                className={cn(
                                                                                                    field.state.value &&
                                                                                                    "text-warning",
                                                                                                    "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                                                                                    !player1?.email && "italic"
                                                                                                )}
                                                                                            >
                                                                                                {entry?.player1Entry.email ||
                                                                                                    "N/A"}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </Field>
                                                                        )
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <form.Field
                                                                    name="migratePlayer1Data.phoneNumber"
                                                                    children={(field) => {
                                                                        const isInvalid =
                                                                            field.state.meta.isTouched &&
                                                                            !field.state.meta.isValid
                                                                        return (
                                                                            <Field>
                                                                                <div className="flex items-center w-full gap-2">
                                                                                    <div className="flex items-center justify-center">
                                                                                        <Checkbox
                                                                                            id={field.name}
                                                                                            name={field.name}
                                                                                            checked={field.state.value}
                                                                                            onBlur={field.handleBlur}
                                                                                            onCheckedChange={(checked) =>
                                                                                                field.handleChange(
                                                                                                    checked === true
                                                                                                )
                                                                                            }
                                                                                            aria-invalid={isInvalid}
                                                                                            disabled={
                                                                                                isLoading ||
                                                                                                !state.connectedPlayer1
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                    <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                                                                        <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                                                                            Phone No.
                                                                                        </span>
                                                                                        {state.connectedPlayer1 ? (
                                                                                            <>
                                                                                                <span
                                                                                                    className={cn(
                                                                                                        !field.state.value &&
                                                                                                        "text-success bg-success/5",
                                                                                                        "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                                                                        !player1?.phoneNumber &&
                                                                                                        "italic"
                                                                                                    )}
                                                                                                >
                                                                                                    {player1?.phoneNumber || "N/A"}
                                                                                                </span>{" "}
                                                                                                <span
                                                                                                    className={cn(
                                                                                                        field.state.value &&
                                                                                                        "text-warning bg-warning/5",
                                                                                                        "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                                                                        !player1?.phoneNumber &&
                                                                                                        "italic"
                                                                                                    )}
                                                                                                >
                                                                                                    {entry?.player1Entry
                                                                                                        .phoneNumber || "N/A"}
                                                                                                </span>
                                                                                            </>
                                                                                        ) : (
                                                                                            <span
                                                                                                className={cn(
                                                                                                    field.state.value &&
                                                                                                    "text-warning",
                                                                                                    "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                                                                                    !player1?.phoneNumber &&
                                                                                                    "italic"
                                                                                                )}
                                                                                            >
                                                                                                {entry?.player1Entry
                                                                                                    .phoneNumber || "N/A"}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </Field>
                                                                        )
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <form.Field
                                                                    name="migratePlayer1Data.birthDate"
                                                                    children={(field) => {
                                                                        const isInvalid =
                                                                            field.state.meta.isTouched &&
                                                                            !field.state.meta.isValid
                                                                        return (
                                                                            <Field>
                                                                                <div className="flex items-center w-full gap-2">
                                                                                    <div className="flex items-center justify-center">
                                                                                        <Checkbox
                                                                                            id={field.name}
                                                                                            name={field.name}
                                                                                            checked={field.state.value}
                                                                                            onBlur={field.handleBlur}
                                                                                            onCheckedChange={(checked) =>
                                                                                                field.handleChange(
                                                                                                    checked === true
                                                                                                )
                                                                                            }
                                                                                            aria-invalid={isInvalid}
                                                                                            disabled={
                                                                                                isLoading ||
                                                                                                !state.connectedPlayer1
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                    <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                                                                        <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                                                                            Birthday
                                                                                        </span>
                                                                                        {state.connectedPlayer1 ? (
                                                                                            <>
                                                                                                <span
                                                                                                    className={cn(
                                                                                                        !field.state.value &&
                                                                                                        "text-success bg-success/5",
                                                                                                        "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                                                                        !player1?.birthDate &&
                                                                                                        "italic"
                                                                                                    )}
                                                                                                >
                                                                                                    {player1?.birthDate
                                                                                                        ? format(
                                                                                                            new Date(
                                                                                                                player1.birthDate
                                                                                                            ),
                                                                                                            "PP"
                                                                                                        )
                                                                                                        : "N/A"}
                                                                                                </span>{" "}
                                                                                                <span
                                                                                                    className={cn(
                                                                                                        field.state.value &&
                                                                                                        "text-warning bg-warning/5",
                                                                                                        "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                                                                        !player1?.birthDate &&
                                                                                                        "italic"
                                                                                                    )}
                                                                                                >
                                                                                                    {entry?.player1Entry.birthDate
                                                                                                        ? format(
                                                                                                            new Date(
                                                                                                                entry.player1Entry.birthDate
                                                                                                            ),
                                                                                                            "PP"
                                                                                                        )
                                                                                                        : "N/A"}
                                                                                                </span>
                                                                                            </>
                                                                                        ) : (
                                                                                            <span
                                                                                                className={cn(
                                                                                                    field.state.value &&
                                                                                                    "text-warning",
                                                                                                    "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                                                                                    !player1?.birthDate && "italic"
                                                                                                )}
                                                                                            >
                                                                                                {entry?.player1Entry.birthDate
                                                                                                    ? format(
                                                                                                        new Date(
                                                                                                            entry.player1Entry.birthDate
                                                                                                        ),
                                                                                                        "PP"
                                                                                                    )
                                                                                                    : "N/A"}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </Field>
                                                                        )
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </FieldSet>
                                        </TabsContent>
                                        <TabsContent value="player2">
                                            <FieldSet className="flex flex-col gap-2.5 h-[52vh] overflow-y-auto">
                                                <form.Field
                                                    name="isPlayer2New"
                                                    children={(field) => {
                                                        const isInvalid =
                                                            field.state.meta.isTouched &&
                                                            !field.state.meta.isValid
                                                        return (
                                                            <Field data-invalid={isInvalid}>
                                                                <div className="flex items-center py-1">
                                                                    <Checkbox
                                                                        id={field.name}
                                                                        name={field.name}
                                                                        checked={field.state.value}
                                                                        onBlur={field.handleBlur}
                                                                        onCheckedChange={(checked) =>
                                                                            field.handleChange(checked === true)
                                                                        }
                                                                        className="mr-2"
                                                                        aria-invalid={isInvalid}
                                                                        disabled={isLoading}
                                                                    />
                                                                    <div className="grid">
                                                                        <FieldLabel htmlFor={field.name}>
                                                                            Is New Player? (Player 2)
                                                                        </FieldLabel>
                                                                        <span className="text-muted-foreground text-xs">
                                                                            Checking this will create a new player
                                                                            profile.
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                {isInvalid && (
                                                                    <FieldError errors={field.state.meta.errors} />
                                                                )}
                                                            </Field>
                                                        )
                                                    }}
                                                />

                                                {!state.isPlayer2New && state.connectedPlayer2 && hasPlayer2DocumentsToSelect() && (
                                                    <div className="mb-4">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <Label className="text-sm font-medium">Document Selection</Label>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Choose which documents to keep for Player 2
                                                                </p>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={handleDocumentSelection2}
                                                                disabled={isLoading}
                                                            >
                                                                {documentSelections.player2 ? "Edit Selection" : "Select Documents"}
                                                            </Button>
                                                        </div>
                                                        {documentSelections.player2 ? (
                                                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center">
                                                                        <Check className="h-4 w-4 mr-2 text-green-600" />
                                                                        <div>
                                                                            <p className="text-sm font-medium text-blue-800">Document selections saved</p>
                                                                            <p className="text-xs text-blue-600">
                                                                                {getDocumentSelectionSummary(documentSelections.player2)} documents selected
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={handleDocumentSelection2}
                                                                        className="text-xs"
                                                                    >
                                                                        Edit
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                                                                <div className="flex items-center">
                                                                    <FileText className="h-4 w-4 mr-2 text-amber-600" />
                                                                    <div>
                                                                        <p className="text-sm font-medium text-amber-800">Document Selection Required</p>
                                                                        <p className="text-xs text-amber-600">
                                                                            Click "Select Documents" to choose which documents to keep
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {!state.isPlayer2New && state.connectedPlayer2 && (
                                                    <div className="mb-4">
                                                        <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                                            <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                                                Valid Documents
                                                            </span>
                                                            <span className="col-span-2 px-2 border w-full flex items-center py-1 justify-start">
                                                                {getPlayer2ExistingDocuments().length} existing documents
                                                            </span>
                                                            <span className="col-span-2 px-2 border w-full flex items-center py-1 justify-start">
                                                                {getPlayer2NewDocuments().length} new documents
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {documentSelections.player2
                                                                ? "Documents will be replaced based on your selection"
                                                                : "Click 'Select Documents' to choose which ones to keep"}
                                                        </p>
                                                    </div>
                                                )}

                                                {!state.isPlayer2New && (
                                                    <>
                                                        <form.Field
                                                            name="connectedPlayer2"
                                                            children={(field) => {
                                                                const isInvalid =
                                                                    field.state.meta.isTouched &&
                                                                    !field.state.meta.isValid
                                                                return (
                                                                    <Field data-invalid={isInvalid}>
                                                                        <FieldLabel htmlFor={field.name}>
                                                                            Connected Player 2
                                                                        </FieldLabel>
                                                                        <Popover
                                                                            open={openPlayers2}
                                                                            onOpenChange={setOpenPlayers2}
                                                                        >
                                                                            <PopoverTrigger asChild>
                                                                                <Button
                                                                                    id={field.name}
                                                                                    name={field.name}
                                                                                    disabled={optionsLoading}
                                                                                    aria-expanded={openPlayers2}
                                                                                    onBlur={field.handleBlur}
                                                                                    variant="outline"
                                                                                    role="combobox"
                                                                                    aria-invalid={isInvalid}
                                                                                    className={cn(
                                                                                        "w-full justify-between font-normal capitalize -mt-2",
                                                                                        !field.state.value &&
                                                                                        "text-muted-foreground"
                                                                                    )}
                                                                                    type="button"
                                                                                >
                                                                                    {field.state.value
                                                                                        ? players.find(
                                                                                            (o: {
                                                                                                value: string
                                                                                                label: string
                                                                                            }) =>
                                                                                                o.value === field.state.value
                                                                                        )?.label
                                                                                        : "Select Player 2"}
                                                                                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                                </Button>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className="w-full p-0">
                                                                                <Command
                                                                                    filter={(value, search) =>
                                                                                        players
                                                                                            .find(
                                                                                                (t: {
                                                                                                    value: string
                                                                                                    label: string
                                                                                                }) => t.value === value
                                                                                            )
                                                                                            ?.label.toLowerCase()
                                                                                            .includes(search.toLowerCase())
                                                                                            ? 1
                                                                                            : 0
                                                                                    }
                                                                                >
                                                                                    <CommandInput placeholder="Select Player 2" />
                                                                                    <CommandList className="max-h-72 overflow-y-auto">
                                                                                        <CommandEmpty>
                                                                                            No player found.
                                                                                        </CommandEmpty>
                                                                                        <CommandGroup>
                                                                                            <Label className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
                                                                                                Players
                                                                                            </Label>
                                                                                            {players?.map(
                                                                                                (o: {
                                                                                                    value: string
                                                                                                    label: string
                                                                                                    hasEarlyBird: boolean
                                                                                                }) => (
                                                                                                    <CommandItem
                                                                                                        key={o.value}
                                                                                                        value={o.value}
                                                                                                        onSelect={(v) => {
                                                                                                            field.handleChange(
                                                                                                                v.toString()
                                                                                                            )
                                                                                                            setOpenPlayers2(false)
                                                                                                        }}
                                                                                                        className="capitalize"
                                                                                                    >
                                                                                                        <CheckIcon
                                                                                                            className={cn(
                                                                                                                "h-4 w-4",
                                                                                                                field.state.value ===
                                                                                                                    o.value
                                                                                                                    ? "opacity-100"
                                                                                                                    : "opacity-0"
                                                                                                            )}
                                                                                                        />
                                                                                                        {o.label}
                                                                                                    </CommandItem>
                                                                                                )
                                                                                            )}
                                                                                        </CommandGroup>
                                                                                    </CommandList>
                                                                                </Command>
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                        {isInvalid && (
                                                                            <FieldError
                                                                                errors={field.state.meta.errors}
                                                                            />
                                                                        )}
                                                                    </Field>
                                                                )
                                                            }}
                                                        />
                                                        <Separator />
                                                        <div className="flex flex-col">
                                                            <div className="col-span-2">
                                                                <Label>Migrate Data</Label>
                                                                <span className="text-xs text-muted-foreground">
                                                                    Checked fields will update the player database
                                                                    with entry data.
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center w-full gap-2">
                                                                <div className="h-full flex items-center justify-center">
                                                                    <Checkbox
                                                                        disabled={
                                                                            isLoading || !state.connectedPlayer2
                                                                        }
                                                                        onCheckedChange={(checked) => {
                                                                            form.setFieldValue("migratePlayer2Data", {
                                                                                firstName: checked === true,
                                                                                middleName: checked === true,
                                                                                lastName: checked === true,
                                                                                suffix: checked === true,
                                                                                birthDate: checked === true,
                                                                                phoneNumber: checked === true,
                                                                                email: checked === true,
                                                                                validDocuments: checked === true,
                                                                            })
                                                                            if (checked) {
                                                                                setTimeout(() => {
                                                                                    handleDocumentSelection2();
                                                                                }, 100);
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="text-xs grid grid-cols-5 col-span-2 h-full w-full">
                                                                    <div className="px-2 h-full border w-full flex items-center justify-center min-h-8"></div>
                                                                    <span
                                                                        className={cn(
                                                                            "px-2 h-full border w-full flex items-center justify-center",
                                                                            state.connectedPlayer2
                                                                                ? "col-span-2"
                                                                                : "hidden"
                                                                        )}
                                                                    >
                                                                        From Database (Current)
                                                                    </span>{" "}
                                                                    <span
                                                                        className={cn(
                                                                            "px-2 h-full border w-full flex items-center justify-center",
                                                                            state.connectedPlayer2
                                                                                ? "col-span-2"
                                                                                : "col-span-4"
                                                                        )}
                                                                    >
                                                                        From Entry (New)
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <form.Field
                                                                    name="migratePlayer2Data.firstName"
                                                                    children={(field) => {
                                                                        const isInvalid =
                                                                            field.state.meta.isTouched &&
                                                                            !field.state.meta.isValid
                                                                        return (
                                                                            <Field>
                                                                                <div className="flex items-center w-full gap-2">
                                                                                    <div className="h-full flex items-center justify-center">
                                                                                        <Checkbox
                                                                                            id={field.name}
                                                                                            name={field.name}
                                                                                            checked={field.state.value}
                                                                                            onBlur={field.handleBlur}
                                                                                            onCheckedChange={(checked) =>
                                                                                                field.handleChange(
                                                                                                    checked === true
                                                                                                )
                                                                                            }
                                                                                            aria-invalid={isInvalid}
                                                                                            disabled={
                                                                                                isLoading ||
                                                                                                !state.connectedPlayer2
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                    <div className="text-xs grid grid-cols-5 col-span-2 min-h-8 w-full">
                                                                                        <span className="px-2 h-full border w-full flex items-center justify-center py-1 text-center">
                                                                                            First Name
                                                                                        </span>
                                                                                        {state.connectedPlayer2 ? (
                                                                                            <>
                                                                                                <span
                                                                                                    className={cn(
                                                                                                        !field.state.value &&
                                                                                                        "text-success bg-success/5",
                                                                                                        "col-span-2 px-2 h-full border w-full flex items-center justify-start py-1"
                                                                                                    )}
                                                                                                >
                                                                                                    {player2?.firstName}
                                                                                                </span>{" "}
                                                                                                <span
                                                                                                    className={cn(
                                                                                                        field.state.value &&
                                                                                                        "text-warning bg-warning/5",
                                                                                                        "col-span-2 px-2 h-full border w-full flex items-center justify-start py-1"
                                                                                                    )}
                                                                                                >
                                                                                                    {entry?.player2Entry &&
                                                                                                        entry?.player2Entry.firstName}
                                                                                                </span>
                                                                                            </>
                                                                                        ) : (
                                                                                            <span
                                                                                                className={cn(
                                                                                                    field.state.value &&
                                                                                                    "text-warning",
                                                                                                    "col-span-4 px-2 h-full border w-full flex items-center justify-start"
                                                                                                )}
                                                                                            >
                                                                                                {entry?.player2Entry &&
                                                                                                    entry?.player2Entry.firstName}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </Field>
                                                                        )
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <form.Field
                                                                    name="migratePlayer2Data.middleName"
                                                                    children={(field) => {
                                                                        const isInvalid =
                                                                            field.state.meta.isTouched &&
                                                                            !field.state.meta.isValid
                                                                        return (
                                                                            <Field>
                                                                                <div className="flex items-center w-full gap-2">
                                                                                    <div className="h-full flex items-center justify-center text-center">
                                                                                        <Checkbox
                                                                                            id={field.name}
                                                                                            name={field.name}
                                                                                            checked={field.state.value}
                                                                                            onBlur={field.handleBlur}
                                                                                            onCheckedChange={(checked) =>
                                                                                                field.handleChange(
                                                                                                    checked === true
                                                                                                )
                                                                                            }
                                                                                            aria-invalid={isInvalid}
                                                                                            disabled={
                                                                                                isLoading ||
                                                                                                !state.connectedPlayer2
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                    <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                                                                        <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                                                                            Middle Name
                                                                                        </span>
                                                                                        {state.connectedPlayer2 ? (
                                                                                            <>
                                                                                                <span
                                                                                                    className={cn(
                                                                                                        !field.state.value &&
                                                                                                        "text-success bg-success/5",
                                                                                                        "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                                                                                        !player2?.middleName &&
                                                                                                        "italic"
                                                                                                    )}
                                                                                                >
                                                                                                    {player2?.middleName || "N/A"}
                                                                                                </span>{" "}
                                                                                                <span
                                                                                                    className={cn(
                                                                                                        field.state.value &&
                                                                                                        "text-warning bg-warning/5",
                                                                                                        "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                                                                                        !player2?.middleName &&
                                                                                                        "italic"
                                                                                                    )}
                                                                                                >
                                                                                                    {entry?.player2Entry
                                                                                                        ? entry?.player2Entry
                                                                                                            .middleName
                                                                                                        : "N/A"}
                                                                                                </span>
                                                                                            </>
                                                                                        ) : (
                                                                                            <span
                                                                                                className={cn(
                                                                                                    field.state.value &&
                                                                                                    "text-warning",
                                                                                                    "col-span-4 px-2 border w-full flex items-center justify-start py-1",
                                                                                                    !player2?.middleName && "italic"
                                                                                                )}
                                                                                            >
                                                                                                {entry?.player2Entry
                                                                                                    ? entry?.player2Entry.middleName
                                                                                                    : "N/A"}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </Field>
                                                                        )
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <form.Field
                                                                    name="migratePlayer2Data.lastName"
                                                                    children={(field) => {
                                                                        const isInvalid =
                                                                            field.state.meta.isTouched &&
                                                                            !field.state.meta.isValid
                                                                        return (
                                                                            <Field>
                                                                                <div className="flex items-center w-full gap-2">
                                                                                    <div className="flex items-center justify-center">
                                                                                        <Checkbox
                                                                                            id={field.name}
                                                                                            name={field.name}
                                                                                            checked={field.state.value}
                                                                                            onBlur={field.handleBlur}
                                                                                            onCheckedChange={(checked) =>
                                                                                                field.handleChange(
                                                                                                    checked === true
                                                                                                )
                                                                                            }
                                                                                            aria-invalid={isInvalid}
                                                                                            disabled={
                                                                                                isLoading ||
                                                                                                !state.connectedPlayer2
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                    <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                                                                        <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                                                                            Last Name
                                                                                        </span>
                                                                                        {state.connectedPlayer2 ? (
                                                                                            <>
                                                                                                <span
                                                                                                    className={cn(
                                                                                                        !field.state.value &&
                                                                                                        "text-success bg-success/5",
                                                                                                        "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                                                                                        !player2?.lastName && "italic"
                                                                                                    )}
                                                                                                >
                                                                                                    {player2?.lastName || "N/A"}
                                                                                                </span>{" "}
                                                                                                <span
                                                                                                    className={cn(
                                                                                                        field.state.value &&
                                                                                                        "text-warning bg-warning/5",
                                                                                                        "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                                                                                        !player2?.lastName && "italic"
                                                                                                    )}
                                                                                                >
                                                                                                    {entry?.player2Entry
                                                                                                        ? entry?.player2Entry.lastName
                                                                                                        : "N/A"}
                                                                                                </span>
                                                                                            </>
                                                                                        ) : (
                                                                                            <span
                                                                                                className={cn(
                                                                                                    field.state.value &&
                                                                                                    "text-warning",
                                                                                                    "col-span-4 px-2 border w-full flex items-center justify-start py-1",
                                                                                                    !player2?.lastName && "italic"
                                                                                                )}
                                                                                            >
                                                                                                {entry?.player2Entry
                                                                                                    ? entry?.player2Entry.lastName
                                                                                                    : "N/A"}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </Field>
                                                                        )
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <form.Field
                                                                    name="migratePlayer2Data.suffix"
                                                                    children={(field) => {
                                                                        const isInvalid =
                                                                            field.state.meta.isTouched &&
                                                                            !field.state.meta.isValid
                                                                        return (
                                                                            <Field>
                                                                                <div className="flex items-center w-full gap-2">
                                                                                    <div className="flex items-center justify-center">
                                                                                        <Checkbox
                                                                                            id={field.name}
                                                                                            name={field.name}
                                                                                            checked={field.state.value}
                                                                                            onBlur={field.handleBlur}
                                                                                            onCheckedChange={(checked) =>
                                                                                                field.handleChange(
                                                                                                    checked === true
                                                                                                )
                                                                                            }
                                                                                            aria-invalid={isInvalid}
                                                                                            disabled={
                                                                                                isLoading ||
                                                                                                !state.connectedPlayer2
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                    <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                                                                        <span className="px-2 border w-full flex items-center py-1 justify-center text-center">
                                                                                            Ext.
                                                                                        </span>
                                                                                        {state.connectedPlayer2 ? (
                                                                                            <>
                                                                                                <span
                                                                                                    className={cn(
                                                                                                        !field.state.value &&
                                                                                                        "text-success bg-success/5",
                                                                                                        "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                                                                        !player2?.suffix && "italic"
                                                                                                    )}
                                                                                                >
                                                                                                    {player2?.suffix || "N/A"}
                                                                                                </span>{" "}
                                                                                                <span
                                                                                                    className={cn(
                                                                                                        field.state.value &&
                                                                                                        "text-warning bg-warning/5",
                                                                                                        "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                                                                        !player2?.suffix && "italic"
                                                                                                    )}
                                                                                                >
                                                                                                    {entry?.player2Entry
                                                                                                        ? entry?.player2Entry.suffix
                                                                                                        : "N/A"}
                                                                                                </span>
                                                                                            </>
                                                                                        ) : (
                                                                                            <span
                                                                                                className={cn(
                                                                                                    field.state.value &&
                                                                                                    "text-warning",
                                                                                                    "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                                                                                    !player2?.suffix && "italic"
                                                                                                )}
                                                                                            >
                                                                                                {entry?.player2Entry
                                                                                                    ? entry?.player2Entry.suffix
                                                                                                    : "N/A"}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </Field>
                                                                        )
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <form.Field
                                                                    name="migratePlayer2Data.email"
                                                                    children={(field) => {
                                                                        const isInvalid =
                                                                            field.state.meta.isTouched &&
                                                                            !field.state.meta.isValid
                                                                        return (
                                                                            <Field>
                                                                                <div className="flex items-center w-full gap-2">
                                                                                    <div className="flex items-center justify-center">
                                                                                        <Checkbox
                                                                                            id={field.name}
                                                                                            name={field.name}
                                                                                            checked={field.state.value}
                                                                                            onBlur={field.handleBlur}
                                                                                            onCheckedChange={(checked) =>
                                                                                                field.handleChange(
                                                                                                    checked === true
                                                                                                )
                                                                                            }
                                                                                            aria-invalid={isInvalid}
                                                                                            disabled={
                                                                                                isLoading ||
                                                                                                !state.connectedPlayer2
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                    <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                                                                        <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                                                                            Email
                                                                                        </span>
                                                                                        {state.connectedPlayer2 ? (
                                                                                            <>
                                                                                                <span
                                                                                                    className={cn(
                                                                                                        !field.state.value &&
                                                                                                        "text-success bg-success/5",
                                                                                                        "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                                                                        !player2?.email && "italic"
                                                                                                    )}
                                                                                                >
                                                                                                    {player2?.email || "N/A"}
                                                                                                </span>{" "}
                                                                                                <span
                                                                                                    className={cn(
                                                                                                        field.state.value &&
                                                                                                        "text-warning bg-warning/5",
                                                                                                        "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                                                                        !player2?.email && "italic"
                                                                                                    )}
                                                                                                >
                                                                                                    {entry?.player2Entry
                                                                                                        ? entry?.player2Entry.email
                                                                                                        : "N/A"}
                                                                                                </span>
                                                                                            </>
                                                                                        ) : (
                                                                                            <span
                                                                                                className={cn(
                                                                                                    field.state.value &&
                                                                                                    "text-warning",
                                                                                                    "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                                                                                    !player2?.email && "italic"
                                                                                                )}
                                                                                            >
                                                                                                {entry?.player2Entry
                                                                                                    ? entry?.player2Entry.email
                                                                                                    : "N/A"}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </Field>
                                                                        )
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <form.Field
                                                                    name="migratePlayer2Data.phoneNumber"
                                                                    children={(field) => {
                                                                        const isInvalid =
                                                                            field.state.meta.isTouched &&
                                                                            !field.state.meta.isValid
                                                                        return (
                                                                            <Field>
                                                                                <div className="flex items-center w-full gap-2">
                                                                                    <div className="flex items-center justify-center">
                                                                                        <Checkbox
                                                                                            id={field.name}
                                                                                            name={field.name}
                                                                                            checked={field.state.value}
                                                                                            onBlur={field.handleBlur}
                                                                                            onCheckedChange={(checked) =>
                                                                                                field.handleChange(
                                                                                                    checked === true
                                                                                                )
                                                                                            }
                                                                                            aria-invalid={isInvalid}
                                                                                            disabled={
                                                                                                isLoading ||
                                                                                                !state.connectedPlayer2
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                    <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                                                                        <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                                                                            Phone No.
                                                                                        </span>
                                                                                        {state.connectedPlayer2 ? (
                                                                                            <>
                                                                                                <span
                                                                                                    className={cn(
                                                                                                        !field.state.value &&
                                                                                                        "text-success bg-success/5",
                                                                                                        "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                                                                        !player2?.phoneNumber &&
                                                                                                        "italic"
                                                                                                    )}
                                                                                                >
                                                                                                    {player2?.phoneNumber || "N/A"}
                                                                                                </span>{" "}
                                                                                                <span
                                                                                                    className={cn(
                                                                                                        field.state.value &&
                                                                                                        "text-warning bg-warning/5",
                                                                                                        "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                                                                        !player2?.phoneNumber &&
                                                                                                        "italic"
                                                                                                    )}
                                                                                                >
                                                                                                    {entry?.player2Entry
                                                                                                        ? entry?.player2Entry
                                                                                                            .phoneNumber
                                                                                                        : "N/A"}
                                                                                                </span>
                                                                                            </>
                                                                                        ) : (
                                                                                            <span
                                                                                                className={cn(
                                                                                                    field.state.value &&
                                                                                                    "text-warning",
                                                                                                    "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                                                                                    !player2?.phoneNumber &&
                                                                                                    "italic"
                                                                                                )}
                                                                                            >
                                                                                                {entry?.player2Entry
                                                                                                    ? entry?.player2Entry
                                                                                                        .phoneNumber
                                                                                                    : "N/A"}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </Field>
                                                                        )
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <form.Field
                                                                    name="migratePlayer2Data.birthDate"
                                                                    children={(field) => {
                                                                        const isInvalid =
                                                                            field.state.meta.isTouched &&
                                                                            !field.state.meta.isValid
                                                                        return (
                                                                            <Field>
                                                                                <div className="flex items-center w-full gap-2">
                                                                                    <div className="flex items-center justify-center">
                                                                                        <Checkbox
                                                                                            id={field.name}
                                                                                            name={field.name}
                                                                                            checked={field.state.value}
                                                                                            onBlur={field.handleBlur}
                                                                                            onCheckedChange={(checked) =>
                                                                                                field.handleChange(
                                                                                                    checked === true
                                                                                                )
                                                                                            }
                                                                                            aria-invalid={isInvalid}
                                                                                            disabled={
                                                                                                isLoading ||
                                                                                                !state.connectedPlayer2
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                    <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                                                                        <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                                                                            Birthday
                                                                                        </span>
                                                                                        {state.connectedPlayer2 ? (
                                                                                            <>
                                                                                                <span
                                                                                                    className={cn(
                                                                                                        !field.state.value &&
                                                                                                        "text-success bg-success/5",
                                                                                                        "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                                                                        !player2?.birthDate &&
                                                                                                        "italic"
                                                                                                    )}
                                                                                                >
                                                                                                    {player2?.birthDate
                                                                                                        ? format(
                                                                                                            new Date(
                                                                                                                player2.birthDate
                                                                                                            ),
                                                                                                            "PP"
                                                                                                        )
                                                                                                        : "N/A"}
                                                                                                </span>{" "}
                                                                                                <span
                                                                                                    className={cn(
                                                                                                        field.state.value &&
                                                                                                        "text-warning bg-warning/5",
                                                                                                        "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                                                                                        !player2?.birthDate &&
                                                                                                        "italic"
                                                                                                    )}
                                                                                                >
                                                                                                    {entry?.player2Entry &&
                                                                                                        entry?.player2Entry.birthDate
                                                                                                        ? format(
                                                                                                            new Date(
                                                                                                                entry.player2Entry.birthDate
                                                                                                            ),
                                                                                                            "PP"
                                                                                                        )
                                                                                                        : "N/A"}
                                                                                                </span>
                                                                                            </>
                                                                                        ) : (
                                                                                            <span
                                                                                                className={cn(
                                                                                                    field.state.value &&
                                                                                                    "text-warning",
                                                                                                    "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                                                                                    !player2?.birthDate && "italic"
                                                                                                )}
                                                                                            >
                                                                                                {entry?.player2Entry &&
                                                                                                    entry?.player2Entry.birthDate
                                                                                                    ? format(
                                                                                                        new Date(
                                                                                                            entry.player2Entry.birthDate
                                                                                                        ),
                                                                                                        "PP"
                                                                                                    )
                                                                                                    : "N/A"}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </Field>
                                                                        )
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </FieldSet>
                                        </TabsContent>
                                    </Tabs>
                                )}
                            />
                        </form>
                        <DialogFooter>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    className="w-20"
                                    loading={isLoading || isPending}
                                    onClick={handleFormSubmit}
                                    type="button"
                                >
                                    Assign
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </form>
            </Dialog>

            <DocumentSelectionDialog
                open={showDocumentSelection1}
                onOpenChange={setShowDocumentSelection1}
                onSave={handleSaveDocumentSelections1}
                existingDocuments={getPlayer1ExistingDocuments()}
                newDocuments={getPlayer1NewDocuments()}
                playerName="Player 1"
                isLoading={isLoading}
            />

            <DocumentSelectionDialog
                open={showDocumentSelection2}
                onOpenChange={setShowDocumentSelection2}
                onSave={handleSaveDocumentSelections2}
                existingDocuments={getPlayer2ExistingDocuments()}
                newDocuments={getPlayer2NewDocuments()}
                playerName="Player 2"
                isLoading={isLoading}
            />
        </>
    )
}

export default AssignDialog
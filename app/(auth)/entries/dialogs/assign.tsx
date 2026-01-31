// karaan
// "use client"

// import { gql } from "@apollo/client"
// import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react"
// import { useEffect, useState } from "react"
// import { Button } from "@/components/ui/button"
// import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { toast } from "sonner"
// import { cn } from "@/lib/utils"
// import { IEntry } from "@/types/entry.interface"
// import { useForm } from "@tanstack/react-form"
// import { AssignPlayersSchema } from "@/validators/entry.validator"
// import { useTransition } from "react"
// import {
//   Field,
//   FieldError,
//   FieldLabel,
//   FieldSet,
// } from "@/components/ui/field"
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover"
// import { CheckIcon, ChevronsUpDownIcon, FileText, Eye, Check, X, Maximize, Sparkles, AlertCircle, Loader2, Save, ExternalLink, ChevronLeft, File, Download, Maximize2 } from "lucide-react"
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command"
// import { Label } from "@/components/ui/label"
// import { Checkbox } from "@/components/ui/checkbox"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Separator } from "@/components/ui/separator"
// import { format } from "date-fns"
// import { Badge } from "@/components/ui/badge"
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// import Image from "next/image"

// const ASSIGN_PLAYERS = gql`
//   mutation AssignPlayers($input: assignPlayersInput!) {
//     assignPlayers(input: $input) {
//       ok
//       message
//     }
//   }
// `

// const ENTRY = gql`
//   query Entry($_id: ID!) {
//     entry(_id: $_id) {
//       _id
//       entryNumber
//       player1Entry {
//         firstName
//         middleName
//         lastName
//         suffix
//         gender
//         birthDate
//         email
//         phoneNumber
//         validDocuments {
//           documentURL
//           documentType
//           dateUploaded
//         }
//       }
//       connectedPlayer1 {
//         _id
//         firstName
//         middleName
//         lastName
//         suffix
//         gender
//         birthDate
//         email
//         phoneNumber
//         validDocuments {
//           documentURL
//           documentType
//           dateUploaded
//         }
//       }
//       player2Entry {
//         firstName
//         middleName
//         lastName
//         suffix
//         gender
//         birthDate
//         email
//         phoneNumber
//         validDocuments {
//           documentURL
//           documentType
//           dateUploaded
//         }
//       }
//       connectedPlayer2 {
//         _id
//         firstName
//         middleName
//         lastName
//         suffix
//         gender
//         birthDate
//         email
//         phoneNumber
//         validDocuments {
//           documentURL
//           documentType
//           dateUploaded
//         }
//       }
//     }
//   }
// `

// const OPTIONS = gql`
//   query Options {
//     playerOptions {
//       label
//       value
//     }
//   }
// `

// const PLAYER_1 = gql`
//   query Player1($_id: ID!) {
//     player(_id: $_id) {
//       _id
//       firstName
//       middleName
//       lastName
//       suffix
//       gender
//       birthDate
//       email
//       phoneNumber
//       validDocuments {
//         documentURL
//         documentType
//         dateUploaded
//       }
//     }
//   }
// `

// const PLAYER_2 = gql`
//   query Player2($_id: ID!) {
//     player(_id: $_id) {
//       _id
//       firstName
//       middleName
//       lastName
//       suffix
//       gender
//       birthDate
//         email
//         phoneNumber
//         validDocuments {
//           documentURL
//           documentType
//           dateUploaded
//         }
//       }
//     }
// `

// const SUGGEST_PLAYERS = gql`
//   query SuggestPlayers($input: SuggestPlayersInput!) {
//     suggestPlayers(input: $input) {
//       _id
//       fullName
//       firstName
//       middleName
//       lastName
//       suffix
//       birthDate
//       email
//       phoneNumber
//       similarityScore
//       matchReasons
//     }
//   }
// `

// type SuggestPlayer = {
//   _id: string;
//   fullName: string;
//   firstName: string;
//   middleName?: string;
//   lastName: string;
//   suffix?: string;
//   birthDate: string;
//   email?: string;
//   phoneNumber?: string;
//   similarityScore: number;
//   matchReasons: string[];
// };

// type SuggestPlayersResponse = {
//   suggestPlayers: SuggestPlayer[];
// }

// type Props = {
//   _id?: string
//   onClose?: () => void
//   title?: string
// }

// type DocumentInfo = {
//   documentType: string;
//   documentURL: string;
//   dateUploaded?: Date;
//   player: string;
//   source: 'existing' | 'new';
// };

// type DocumentSelection = {
//   [documentType: string]: {
//     selectedSource: 'existing' | 'new';
//     existingDoc?: DocumentInfo;
//     newDoc?: DocumentInfo;
//   };
// };

// const extractFileIdFromUrl = (url: string): string | null => {
//   if (!url) return null;

//   // Various Google Drive URL patterns
//   const patterns = [
//     // Standard file URL: https://drive.google.com/file/d/FILE_ID/view
//     /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,

//     // Open URL: https://drive.google.com/open?id=FILE_ID
//     /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,

//     // URL with /u/0/: https://drive.google.com/u/0/uc?id=FILE_ID&export=download
//     /drive\.google\.com\/.*[?&]id=([a-zA-Z0-9_-]+)/,

//     // Direct download link
//     /drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/,

//     // Share link: https://drive.google.com/file/d/FILE_ID/edit?usp=sharing
//     /drive\.google\.com\/.*\/d\/([a-zA-Z0-9_-]+)/,
//   ];

//   for (const pattern of patterns) {
//     const match = url.match(pattern);
//     if (match && match[1]) {
//       return match[1];
//     }
//   }

//   return null;
// }

// const replaceDocumentsInDrive = async (
//   existingDocuments: any[],
//   newDocuments: any[],
//   playerType: 'player1' | 'player2',
//   documentSelection?: DocumentSelection
// ) => {
//   try {
//     console.log(`🔄 Starting Google Drive document replacement for ${playerType}`)

//     const replacedDocuments: any[] = [];
//     const failedReplacements: any[] = [];

//     if (documentSelection) {
//       // Process based on document selection
//       for (const [documentType, selection] of Object.entries(documentSelection)) {
//         const { selectedSource, existingDoc, newDoc } = selection;

//         if (selectedSource === 'existing' && existingDoc) {
//           // Keep existing document - no action needed for Google Drive
//           console.log(`✅ Keeping existing document: ${documentType}`);
//           continue;
//         }

//         if (selectedSource === 'new' && newDoc) {
//           const newFileId = extractFileIdFromUrl(newDoc.documentURL);

//           if (!newFileId) {
//             console.warn(`Could not extract file ID from new document: ${newDoc.documentURL}`);
//             failedReplacements.push({
//               documentType,
//               error: 'Invalid file URL'
//             });
//             continue;
//           }

//           if (existingDoc) {
//             // Replace existing document with new one
//             const oldFileId = extractFileIdFromUrl(existingDoc.documentURL);

//             if (oldFileId) {
//               console.log(`🔄 Replacing ${documentType}: ${oldFileId} -> ${newFileId}`);

//               try {
//                 const replaceResponse = await fetch('/api/transfer/replace', {
//                   method: 'POST',
//                   headers: { 'Content-Type': 'application/json' },
//                   body: JSON.stringify({
//                     oldFileId,
//                     newFileId,
//                     documentType,
//                     playerType
//                   }),
//                 });

//                 const replaceResult = await replaceResponse.json();

//                 if (replaceResponse.ok && replaceResult.success) {
//                   replacedDocuments.push({
//                     documentType,
//                     oldFileId,
//                     newFileId: replaceResult.newFileId || newFileId,
//                     status: 'replaced',
//                     action: replaceResult.action,
//                     message: replaceResult.message
//                   });
//                   console.log(`✅ Successfully replaced in Google Drive: ${documentType}`);
//                 } else {
//                   console.error(`❌ Failed to replace ${documentType}:`, replaceResult.message);
//                   failedReplacements.push({
//                     documentType,
//                     error: replaceResult.message,
//                     fallback: true
//                   });

//                   // Fallback: Try to move new document
//                   try {
//                     const moveResponse = await fetch('/api/transfer/entry_requirement', {
//                       method: 'POST',
//                       headers: { 'Content-Type': 'application/json' },
//                       body: JSON.stringify({ fileId: newFileId }),
//                     });

//                     if (moveResponse.ok) {
//                       replacedDocuments.push({
//                         documentType,
//                         oldFileId,
//                         newFileId,
//                         status: 'moved_new_only',
//                         action: 'moved',
//                         message: 'Replacement failed, moved new document instead'
//                       });
//                       console.log(`✅ Moved new document instead: ${documentType}`);
//                     }
//                   } catch (moveError) {
//                     console.error(`❌ Failed to move new document:`, moveError);
//                   }
//                 }
//               } catch (replaceError: any) {
//                 console.error(`❌ Error replacing ${documentType}:`, replaceError);
//                 failedReplacements.push({
//                   documentType,
//                   error: replaceError?.message || 'Unknown error'
//                 });
//               }
//             } else {
//               console.log(`⚠️ Could not extract old file ID, moving new document...`);

//               try {
//                 const moveResponse = await fetch('/api/transfer/entry_requirement', {
//                   method: 'POST',
//                   headers: { 'Content-Type': 'application/json' },
//                   body: JSON.stringify({ fileId: newFileId }),
//                 });

//                 if (moveResponse.ok) {
//                   replacedDocuments.push({
//                     documentType,
//                     newFileId,
//                     status: 'added_new_no_old',
//                     action: 'added',
//                     message: 'No existing file found, added new document'
//                   });
//                   console.log(`✅ Added new document: ${documentType}`);
//                 }
//               } catch (moveError) {
//                 console.error(`❌ Error adding new document:`, moveError);
//               }
//             }
//           } else {
//             // No existing document, just move the new one
//             try {
//               const moveResponse = await fetch('/api/transfer/entry_requirement', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ fileId: newFileId }),
//               })

//               if (moveResponse.ok) {
//                 replacedDocuments.push({
//                   documentType,
//                   newFileId,
//                   status: 'added_new_type',
//                   action: 'added',
//                   message: 'Added new document type'
//                 });
//                 console.log(`✅ Added new document type: ${documentType}`);
//               }
//             } catch (moveError) {
//               console.error(`❌ Error moving new document ${documentType}:`, moveError);
//             }
//           }
//         }
//       }
//     } else {
//       // Fallback: Old behavior - replace all documents
//       for (const newDoc of newDocuments) {
//         const newFileId = extractFileIdFromUrl(newDoc.documentURL);

//         if (!newFileId) {
//           console.warn(`Could not extract file ID from new document: ${newDoc.documentURL}`)
//           failedReplacements.push({
//             documentType: newDoc.documentType,
//             error: 'Invalid file URL'
//           });
//           continue;
//         }

//         const existingDoc = existingDocuments.find(
//           doc => doc.documentType === newDoc.documentType
//         );

//         if (existingDoc) {
//           const oldFileId = extractFileIdFromUrl(existingDoc.documentURL);

//           if (oldFileId) {
//             console.log(`🔄 Replacing ${existingDoc.documentType}: ${oldFileId} -> ${newFileId}`);

//             try {
//               const replaceResponse = await fetch('/api/transfer/replace', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                   oldFileId,
//                   newFileId,
//                   documentType: newDoc.documentType,
//                   playerType
//                 }),
//               });

//               const replaceResult = await replaceResponse.json();

//               if (replaceResponse.ok && replaceResult.success) {
//                 replacedDocuments.push({
//                   documentType: newDoc.documentType,
//                   oldFileId,
//                   newFileId: replaceResult.newFileId || newFileId,
//                   status: 'replaced',
//                   action: replaceResult.action,
//                   message: replaceResult.message
//                 });
//                 console.log(`✅ Successfully replaced in Google Drive: ${newDoc.documentType}`);
//               } else {
//                 console.error(`❌ Failed to replace ${newDoc.documentType}:`, replaceResult.message);
//                 failedReplacements.push({
//                   documentType: newDoc.documentType,
//                   error: replaceResult.message,
//                   fallback: true
//                 });

//                 try {
//                   const moveResponse = await fetch('/api/transfer/entry_requirement', {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({ fileId: newFileId }),
//                   });

//                   if (moveResponse.ok) {
//                     replacedDocuments.push({
//                       documentType: newDoc.documentType,
//                       oldFileId,
//                       newFileId,
//                       status: 'moved_new_only',
//                       action: 'moved',
//                       message: 'Replacement failed, moved new document instead'
//                     });
//                     console.log(`✅ Moved new document instead: ${newDoc.documentType}`);
//                   }
//                 } catch (moveError) {
//                   console.error(`❌ Failed to move new document:`, moveError);
//                 }
//               }
//             } catch (replaceError: any) {
//               console.error(`❌ Error replacing ${newDoc.documentType}:`, replaceError);
//               failedReplacements.push({
//                 documentType: newDoc.documentType,
//                 error: replaceError?.message || 'Unknown error'
//               });
//             }
//           } else {
//             console.log(`⚠️ Could not extract old file ID, moving new document...`);

//             try {
//               const moveResponse = await fetch('/api/transfer/entry_requirement', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ fileId: newFileId }),
//               });

//               if (moveResponse.ok) {
//                 replacedDocuments.push({
//                   documentType: newDoc.documentType,
//                   newFileId,
//                   status: 'added_new_no_old',
//                   action: 'added',
//                   message: 'No existing file found, added new document'
//                 });
//                 console.log(`✅ Added new document: ${newDoc.documentType}`);
//               }
//             } catch (moveError) {
//               console.error(`❌ Error adding new document:`, moveError);
//             }
//           }
//         } else {
//           // No existing document of this type, just move the new one
//           try {
//             const moveResponse = await fetch('/api/transfer/entry_requirement', {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({ fileId: newFileId }),
//             });

//             if (moveResponse.ok) {
//               replacedDocuments.push({
//                 documentType: newDoc.documentType,
//                 newFileId,
//                 status: 'added_new_type',
//                 action: 'added',
//                 message: 'Added new document type'
//               });
//               console.log(`✅ Added new document type: ${newDoc.documentType}`);
//             }
//           } catch (moveError) {
//             console.error(`❌ Error moving new document ${newDoc.documentType}:`, moveError);
//           }
//         }
//       }
//     }

//     console.log(`✅ Google Drive replacement completed for ${playerType}: ${replacedDocuments.length} documents processed`);

//     return {
//       replacedDocuments,
//       failedReplacements,
//       success: replacedDocuments.length > 0 || failedReplacements.length === 0
//     };

//   } catch (error) {
//     console.error(`❌ Error in replaceDocumentsInDrive for ${playerType}:`, error);
//     return {
//       replacedDocuments: [],
//       failedReplacements: [],
//       success: false
//     };
//   }
// }

// const checkAndMoveDocuments = async (
//   entry: IEntry,
//   connectedPlayer1?: any,
//   connectedPlayer2?: any,
//   documentSelections: {
//     player1?: DocumentSelection;
//     player2?: DocumentSelection;
//   } = {}
// ) => {
//   try {
//     const movedDocuments: any[] = []
//     const replacedDocuments: any[] = []

//     // Process Player 1 documents
//     if (entry.player1Entry?.validDocuments && entry.player1Entry.validDocuments.length > 0) {
//       const player1Docs = entry.player1Entry.validDocuments

//       if (connectedPlayer1?.validDocuments?.length > 0) {
//         const player1Result = await replaceDocumentsInDrive(
//           connectedPlayer1.validDocuments,
//           player1Docs,
//           'player1',
//           documentSelections.player1
//         )
//         replacedDocuments.push(...player1Result.replacedDocuments)

//         if (player1Result.failedReplacements.length > 0) {
//           console.warn(`⚠️ Some Player 1 documents failed to replace:`, player1Result.failedReplacements)
//         }
//       } else {
//         // For new player, just move documents
//         for (const doc of player1Docs) {
//           const fileId = extractFileIdFromUrl(doc.documentURL);
//           if (fileId) {
//             try {
//               const moveResponse = await fetch('/api/transfer/entry_requirement', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ fileId }),
//               });

//               if (moveResponse.ok) {
//                 movedDocuments.push({
//                   documentType: doc.documentType,
//                   fileId,
//                   status: 'moved',
//                   player: 'player1',
//                   message: 'Successfully moved to requirements folder'
//                 });
//               }
//             } catch (error) {
//               console.error(`❌ Error moving document ${doc.documentType}:`, error);
//             }
//           }
//         }
//       }
//     }

//     // Process Player 2 documents
//     if (entry.player2Entry?.validDocuments && entry.player2Entry.validDocuments.length > 0) {
//       const player2Docs = entry.player2Entry.validDocuments

//       if (connectedPlayer2?.validDocuments?.length > 0) {
//         const player2Result = await replaceDocumentsInDrive(
//           connectedPlayer2.validDocuments,
//           player2Docs,
//           'player2',
//           documentSelections.player2
//         )
//         replacedDocuments.push(...player2Result.replacedDocuments)

//         if (player2Result.failedReplacements.length > 0) {
//           console.warn(`⚠️ Some Player 2 documents failed to replace:`, player2Result.failedReplacements)
//         }
//       } else {
//         // For new player, just move documents
//         for (const doc of player2Docs) {
//           const fileId = extractFileIdFromUrl(doc.documentURL);
//           if (fileId) {
//             try {
//               const moveResponse = await fetch('/api/transfer/entry_requirement', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ fileId }),
//               });

//               if (moveResponse.ok) {
//                 movedDocuments.push({
//                   documentType: doc.documentType,
//                   fileId,
//                   status: 'moved',
//                   player: 'player2',
//                   message: 'Successfully moved to requirements folder'
//                 });
//               }
//             } catch (error) {
//               console.error(`❌ Error moving document ${doc.documentType}:`, error);
//             }
//           }
//         }
//       }
//     }

//     console.log(`📊 Document processing completed:`)
//     console.log(`   - Moved/Added: ${movedDocuments.length} documents`)
//     console.log(`   - Replaced: ${replacedDocuments.length} documents`)
//     console.log(`   - Total: ${movedDocuments.length + replacedDocuments.length} documents processed`)

//     return {
//       moved: movedDocuments,
//       replaced: replacedDocuments,
//       total: movedDocuments.length + replacedDocuments.length
//     }

//   } catch (error) {
//     console.error('❌ Error in checkAndMoveDocuments:', error)
//     return {
//       moved: [],
//       replaced: [],
//       total: 0
//     }
//   }
// }

// const DocumentSelectionDialog = ({
//   open,
//   onOpenChange,
//   onSave,
//   existingDocuments,
//   newDocuments,
//   playerName,
//   isLoading,
// }: {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onSave: (selections: DocumentSelection) => void;
//   existingDocuments: DocumentInfo[];
//   newDocuments: DocumentInfo[];
//   playerName: string;
//   isLoading: boolean;
// }) => {
//   const [selections, setSelections] = useState<DocumentSelection>({});
//   const [expandedPreview, setExpandedPreview] = useState<{
//     url: string;
//     type: string;
//     source: 'existing' | 'new';
//   } | null>(null);

//   useEffect(() => {
//     if (open) {
//       const initialSelections: DocumentSelection = {};

//       const allDocumentTypes = new Set([
//         ...existingDocuments.map(doc => doc.documentType),
//         ...newDocuments.map(doc => doc.documentType)
//       ]);

//       allDocumentTypes.forEach(documentType => {
//         const existingDoc = existingDocuments.find(doc => doc.documentType === documentType);
//         const newDoc = newDocuments.find(doc => doc.documentType === documentType);

//         initialSelections[documentType] = {
//           selectedSource: existingDoc ? 'existing' : 'new',
//           existingDoc,
//           newDoc
//         };
//       });

//       setSelections(initialSelections);
//     }
//   }, [open, existingDocuments, newDocuments]);

//   const handleSave = () => {
//     onSave(selections);
//     onOpenChange(false);
//   };

//   const getDocumentTypeIcon = (docType: string) => {
//     if (docType.toLowerCase().includes('image') || docType.toLowerCase().includes('photo')) {
//       return <FileText className="h-4 w-4 mr-2" />;
//     }
//     return <FileText className="h-4 w-4 mr-2" />;
//   };

//   const getFileType = (url: string): string => {
//     if (!url) return 'unknown';

//     const urlObj = new URL(url);
//     const pathname = urlObj.pathname;
//     const searchParams = urlObj.searchParams;

//     if (url.includes('drive.google.com')) {
//       return 'googleDrive';
//     }

//     const pathParts = pathname.split('.');
//     if (pathParts.length > 1) {
//       const extension = pathParts.pop()?.toLowerCase() || '';

//       if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension)) {
//         return 'image';
//       } else if (['pdf'].includes(extension)) {
//         return 'pdf';
//       } else if (['doc', 'docx'].includes(extension)) {
//         return 'doc';
//       } else if (['txt'].includes(extension)) {
//         return 'text';
//       }
//     }

//     if (searchParams.has('format') || searchParams.has('ext')) {
//       const format = searchParams.get('format') || searchParams.get('ext') || '';
//       const formatLower = format.toLowerCase();

//       if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(formatLower)) {
//         return 'image';
//       } else if (formatLower === 'pdf') {
//         return 'pdf';
//       }
//     }

//     return 'image';
//   };

//   const getGoogleDrivePreviewUrl = (url: string): string => {
//     if (!url) return '';

//     try {
//       const urlObj = new URL(url);
//       const fileId = urlObj.searchParams.get('id');

//       if (fileId) {
//         return `https://drive.google.com/file/d/${fileId}/preview`;
//       }

//       const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
//       if (match && match[1]) {
//         return `https://drive.google.com/file/d/${match[1]}/preview`;
//       }
//     } catch (e) {
//       console.error('Error parsing URL:', e);
//     }

//     return url;
//   };

//   const getGoogleDriveDownloadUrl = (url: string): string => {
//     if (!url) return '';

//     try {
//       const urlObj = new URL(url);
//       const fileId = urlObj.searchParams.get('id');

//       if (fileId) {
//         return `https://drive.google.com/uc?export=download&id=${fileId}`;
//       }

//       // Try to extract from standard Google Drive URL pattern
//       const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
//       if (match && match[1]) {
//         return `https://drive.google.com/uc?export=download&id=${match[1]}`;
//       }
//     } catch (e) {
//       console.error('Error parsing URL:', e);
//     }

//     return url;
//   };

//   const renderDocumentPreview = (doc: DocumentInfo, source: 'existing' | 'new') => {
//     const fileType = getFileType(doc.documentURL);
//     const isGoogleDrive = fileType === 'googleDrive';
//     const previewUrl = isGoogleDrive ? getGoogleDrivePreviewUrl(doc.documentURL) : doc.documentURL;
//     const downloadUrl = isGoogleDrive ? getGoogleDriveDownloadUrl(doc.documentURL) : doc.documentURL;

//     return (
//       <div className="mt-2">
//         <div className="">
//           <div className="flex flex-col">
//             <div className="flex justify-between items-center mb-3">
//               <div>
//                 <h3 className="text-sm font-medium underline underline-offset-3">
//                   {doc.documentType.replaceAll("_", " ")}
//                 </h3>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Button
//                   size="sm"
//                   variant="ghost"
//                   asChild
//                   className="h-8 w-8 p-0"
//                 >
//                   <a
//                     href={previewUrl}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     title="Open in new tab"
//                   >
//                     <Maximize2 className="h-3.5 w-3.5" />
//                   </a>
//                 </Button>
//               </div>
//             </div>

//             <div className="relative w-full h-[500px] border rounded-lg overflow-hidden bg-gray-50">
//               {fileType === 'image' ? (
//                 <div className="relative w-full h-full">
//                   <div
//                     className="relative w-full h-full cursor-pointer"
//                     onClick={() => setExpandedPreview({
//                       url: doc.documentURL,
//                       type: doc.documentType,
//                       source: source
//                     })}
//                   >
//                     <img
//                       src={doc.documentURL}
//                       alt={doc.documentType}
//                       className="object-contain w-full h-full"
//                     />
//                   </div>
//                 </div>
//               ) : isGoogleDrive ? (
//                 <iframe
//                   src={previewUrl}
//                   className="w-full h-full border-0"
//                   title={`Document Preview: ${doc.documentType}`}
//                   sandbox="allow-same-origin allow-scripts"
//                   loading="lazy"
//                 />
//               ) : fileType === 'pdf' ? (
//                 <iframe
//                   src={`https://docs.google.com/gview?url=${encodeURIComponent(doc.documentURL)}&embedded=true`}
//                   className="w-full h-full border-0"
//                   title={`PDF Preview: ${doc.documentType}`}
//                   loading="lazy"
//                 />
//               ) : fileType === 'doc' || fileType === 'text' ? (
//                 <div className="w-full h-full flex flex-col items-center justify-center p-8">
//                   <File className="h-32 w-32 text-blue-500 mb-6" />
//                   <span className="text-2xl font-semibold text-gray-700 text-center mb-2">
//                     {fileType === 'doc' ? 'Microsoft Word Document' : 'Text Document'}
//                   </span>
//                   <span className="text-sm text-muted-foreground text-center mb-6 max-w-md">
//                     This document cannot be previewed inline. Please download to view the contents.
//                   </span>
//                 </div>
//               ) : (
//                 <div className="w-full h-full flex flex-col items-center justify-center p-8">
//                   <File className="h-32 w-32 text-gray-500 mb-6" />
//                   <span className="text-2xl font-semibold text-gray-700 text-center mb-2">
//                     Document File
//                   </span>
//                   <span className="text-sm text-muted-foreground text-center mb-6 max-w-md">
//                     This file type cannot be previewed inline. Please download to view the contents.
//                   </span>
//                 </div>
//               )}
//             </div>

//             <div className="mt-2 text-center">
//               <p className="text-xs text-muted-foreground">
//                 {fileType === 'image' ? 'Click on image to view enlarged version' :
//                   isGoogleDrive ? 'Google Drive preview' :
//                     fileType === 'pdf' ? 'PDF preview via Google Docs Viewer' :
//                       'Document preview'}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-5xl! max-h-[95vh]">
//         <DialogHeader>
//           <DialogTitle className="text-lg">Select Documents for {playerName}</DialogTitle>
//           <DialogDescription className="text-sm">
//             Choose which documents to keep - existing ones or new ones from the entry
//           </DialogDescription>
//         </DialogHeader>

//         {expandedPreview ? (
//           <div className="flex flex-col h-full">
//             <div className="flex items-center justify-between mb-4 pb-4 border-b">
//               <div className="flex items-center">
//                 <button
//                   onClick={() => setExpandedPreview(null)}
//                   className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
//                 >
//                   <ChevronLeft className="h-5 w-5" />
//                 </button>
//                 <div>
//                   <h3 className="font-semibold text-md  underline underline-offset-3">{expandedPreview.type}</h3>
//                 </div>
//               </div>
//               <button
//                 onClick={() => setExpandedPreview(null)}
//                 className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             <div className="flex-1 overflow-hidden bg-gray-900 rounded-lg">
//               <div className="relative w-full h-full">
//                 <div className="absolute inset-0 flex items-center justify-center p-8">
//                   <Image
//                     src={expandedPreview.url}
//                     alt={expandedPreview.type}
//                     className="max-w-full max-h-full object-contain"
//                     width={0}
//                     height={0}
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="mt-4 pt-4 border-t">
//               <div className="flex items-center justify-between">
//                 <div className="text-sm text-gray-600">
//                   Click the back button or close icon to return to document selection
//                 </div>
//                 <Button
//                   variant="outline"
//                   onClick={() => setExpandedPreview(null)}
//                   className="px-6 py-2.5"
//                 >
//                   Back to Selection
//                 </Button>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <>
//             <div className="space-y-8 h-[70vh] overflow-y-auto pr-2">
//               {Object.entries(selections).map(([documentType, selection]) => (
//                 <div key={documentType} className="border-2 rounded-xl p-5 bg-white shadow-sm">
//                   <div className="flex items-center justify-between mb-5">
//                     <div className="flex items-center">
//                       {getDocumentTypeIcon(documentType)}
//                       <h3 className="font-semibold text-lg ">{documentType}</h3>
//                     </div>
//                     <div className="flex items-center space-x-4">
//                       <Badge
//                         variant="outline"
//                         className={cn(
//                           "px-3 py-1.5 text-sm",
//                           selection.selectedSource === 'existing'
//                             ? "bg-green-50 text-green-800 border-green-300"
//                             : "bg-blue-50 text-blue-800 border-blue-300"
//                         )}
//                       >
//                         {selection.selectedSource === 'existing' ? 'Keeping Existing' : 'Using New'}
//                       </Badge>
//                     </div>
//                   </div>

//                   <RadioGroup
//                     value={selection.selectedSource}
//                     onValueChange={(value: 'existing' | 'new') => {
//                       setSelections(prev => ({
//                         ...prev,
//                         [documentType]: {
//                           ...prev[documentType],
//                           selectedSource: value
//                         }
//                       }));
//                     }}
//                     className="grid grid-cols-2 gap-2"
//                   >
//                     <div className={cn(
//                       "border-2 rounded-xl p-5 cursor-pointer transition-all",
//                       selection.selectedSource === 'existing'
//                         ? "border-green-500 bg-green-50/50 shadow-sm"
//                         : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
//                     )}>
//                       <div className="space-y-4">
//                         <div className="flex items-start space-x-4">
//                           <RadioGroupItem value="existing" id={`${documentType}-existing`} className="h-5 w-5" />
//                           <div className="flex-1">
//                             <Label htmlFor={`${documentType}-existing`} className="cursor-pointer">
//                               <div className="flex items-center justify-between">
//                                 <span className="font-bold text-base">Existing Document</span>
//                               </div>
//                             </Label>
//                           </div>
//                         </div>

//                         {selection.existingDoc ? (
//                           <>
//                             {renderDocumentPreview(selection.existingDoc, 'existing')}
//                             <div className="text-sm text-gray-700 space-y-2 pt-3">
//                               <div className="flex items-center justify-between">
//                                 <span className="font-semibold">Status:</span>
//                                 <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
//                                   <Check className="h-3 w-3 mr-1" />
//                                   Existing
//                                 </Badge>
//                               </div>
//                             </div>
//                           </>
//                         ) : (
//                           <div className="mt-4 p-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center h-[500px]">
//                             <FileText className="h-20 w-20 text-gray-400 mb-4" />
//                             <p className="text-lg text-gray-600 font-medium">No existing document</p>
//                             <p className="text-sm text-gray-500 mt-2 italic">No document of this type currently exists</p>
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     <div className={cn(
//                       "border-2 rounded-xl p-5 cursor-pointer transition-all",
//                       selection.selectedSource === 'new'
//                         ? "border-blue-500 bg-blue-50/50 shadow-sm"
//                         : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
//                     )}>
//                       <div className="space-y-4">
//                         <div className="flex items-start space-x-4">
//                           <RadioGroupItem value="new" id={`${documentType}-new`} className="h-5 w-5" />
//                           <div className="flex-1">
//                             <Label htmlFor={`${documentType}-new`} className="cursor-pointer">
//                               <div className="flex items-center justify-between">
//                                 <span className="font-bold text-base">New Document</span>
//                               </div>
//                             </Label>
//                           </div>
//                         </div>

//                         {selection.newDoc ? (
//                           <>
//                             {renderDocumentPreview(selection.newDoc, 'new')}
//                             <div className="text-sm text-gray-700 space-y-2 pt-3">
//                               <div className="flex items-center justify-between">
//                                 <span className="font-semibold">Status:</span>
//                                 <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
//                                   <Sparkles className="h-3 w-3 mr-1" />
//                                   New
//                                 </Badge>
//                               </div>
//                             </div>
//                           </>
//                         ) : (
//                           <div className="mt-4 p-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center h-[500px]">
//                             <FileText className="h-20 w-20 text-gray-400 mb-4" />
//                             <p className="text-lg text-gray-600 font-medium">No new document</p>
//                             <p className="text-sm text-gray-500 mt-2 italic">No new document of this type was uploaded</p>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </RadioGroup>

//                   <div className="mt-6 pt-5 border-t text-sm text-gray-700">
//                     {selection.selectedSource === 'existing' && selection.existingDoc ? (
//                       <p className="text-green-800 bg-green-50 p-3 rounded-lg border border-green-200">
//                         <Check className="h-4 w-4 inline mr-2" />
//                         <span className="font-medium">The existing document will be kept.</span> The new document will be removed.
//                       </p>
//                     ) : selection.selectedSource === 'new' && selection.newDoc ? (
//                       <p className={cn(
//                         "p-3 rounded-lg border",
//                         selection.existingDoc
//                           ? "text-amber-800 bg-amber-50 border-amber-200"
//                           : "text-blue-800 bg-blue-50 border-blue-200"
//                       )}>
//                         {selection.existingDoc ? (
//                           <>
//                             <AlertCircle className="h-4 w-4 inline mr-2" />
//                             <span className="font-bold">⚠️ Replacement:</span> The new document will replace the existing one. The old document will be permanently removed.
//                           </>
//                         ) : (
//                           <>
//                             <Check className="h-4 w-4 inline mr-2" />
//                             <span className="font-medium">The new document will be added.</span> No existing document to replace.
//                           </>
//                         )}
//                       </p>
//                     ) : (
//                       <p className="text-gray-500 italic p-3 bg-gray-50 rounded-lg border border-gray-200">
//                         No document available for this type.
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               ))}

//               {Object.keys(selections).length === 0 && (
//                 <div className="text-center py-12">
//                   <FileText className="h-20 w-20 mx-auto text-gray-300 mb-5" />
//                   <p className="text-xl text-gray-600 font-medium">No documents to select</p>
//                   <p className="text-base text-gray-500 mt-2 max-w-md mx-auto">
//                     There are no documents that need selection for this player.
//                   </p>
//                 </div>
//               )}
//             </div>

//             <DialogFooter className="pt-6 border-t">
//               <Button
//                 variant="outline"
//                 onClick={() => onOpenChange(false)}
//                 disabled={isLoading}
//                 className="px-6 py-2.5 text-base"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={handleSave}
//                 disabled={isLoading}
//                 className="px-8 py-2.5 text-base"
//               >
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="h-5 w-5 mr-2 animate-spin" />
//                     Saving...
//                   </>
//                 ) : (
//                   <>
//                     <Save className="h-5 w-5 mr-2" />
//                     Save Selections
//                   </>
//                 )}
//               </Button>
//             </DialogFooter>
//           </>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// };

// const AssignDialog = (props: Props) => {
//   const [isPending, startTransition] = useTransition()
//   const [open, setOpen] = useState(false)
//   const [showDocumentSelection1, setShowDocumentSelection1] = useState(false)
//   const [showDocumentSelection2, setShowDocumentSelection2] = useState(false)
//   const [documentSelections, setDocumentSelections] = useState<{
//     player1?: DocumentSelection;
//     player2?: DocumentSelection;
//   }>({})
//   const [suggestedPlayers1, setSuggestedPlayers1] = useState<SuggestPlayer[]>([])
//   const [suggestedPlayers2, setSuggestedPlayers2] = useState<SuggestPlayer[]>([])
//   const [isLoadingSuggestions1, setIsLoadingSuggestions1] = useState(false)
//   const [isLoadingSuggestions2, setIsLoadingSuggestions2] = useState(false)

//   const [assignPlayers, { loading: assignLoading }] =
//     useMutation(ASSIGN_PLAYERS)
//   const { data, loading: entryLoading }: any = useQuery(ENTRY, {
//     variables: { _id: props._id },
//     skip: !open || !Boolean(props._id),
//     fetchPolicy: "network-only",
//   })
//   const entry = data?.entry as IEntry
//   const { data: optionsData, loading: optionsLoading }: any = useQuery(
//     OPTIONS,
//     {
//       skip: !open,
//       fetchPolicy: "no-cache",
//     }
//   )
//   const [fetchSuggestions1, { loading: suggestions1Loading }] = useLazyQuery<SuggestPlayersResponse>(
//     SUGGEST_PLAYERS
//   )

//   const [fetchSuggestions2, { loading: suggestions2Loading }] = useLazyQuery<SuggestPlayersResponse>(
//     SUGGEST_PLAYERS
//   )
//   const [openPlayers1, setOpenPlayers1] = useState(false)
//   const [openPlayers2, setOpenPlayers2] = useState(false)
//   const players = optionsData?.playerOptions || []
//   const [fetchPlayer1, { data: player1Data, loading: player1Loading }]: any =
//     useLazyQuery(PLAYER_1, {
//       fetchPolicy: "no-cache",
//     })
//   const [fetchPlayer2, { data: player2Data, loading: player2Loading }]: any =
//     useLazyQuery(PLAYER_2, {
//       fetchPolicy: "no-cache",
//     })
//   const player1 = player1Data?.player
//   const player2 = player2Data?.player
//   const isLoading =
//     assignLoading ||
//     entryLoading ||
//     optionsLoading ||
//     player1Loading ||
//     player2Loading

//   const form = useForm({
//     defaultValues: {
//       entry: props._id || "",
//       isPlayer1New: false,
//       isPlayer2New: false,
//       connectedPlayer1: entry?.connectedPlayer1?._id || null,
//       connectedPlayer2: entry?.connectedPlayer2?._id || null,
//       migratePlayer1Data: {
//         firstName: false,
//         middleName: false,
//         lastName: false,
//         suffix: false,
//         birthDate: false,
//         phoneNumber: false,
//         email: false,
//         validDocuments: false, // Add this back for server-side handling
//       },
//       migratePlayer2Data: {
//         firstName: false,
//         middleName: false,
//         lastName: false,
//         suffix: false,
//         birthDate: false,
//         phoneNumber: false,
//         email: false,
//         validDocuments: false, // Add this back for server-side handling
//       },
//     },
//     listeners: {
//       onChange: ({ formApi, fieldApi }) => {
//         if (fieldApi.name === "isPlayer1New" && fieldApi.state.value) {
//           formApi.setFieldValue("connectedPlayer1", null)
//           formApi.setFieldValue("migratePlayer1Data", {
//             firstName: false,
//             middleName: false,
//             lastName: false,
//             suffix: false,
//             birthDate: false,
//             phoneNumber: false,
//             email: false,
//             validDocuments: false,
//           })
//           // Clear document selections for player 1
//           setDocumentSelections(prev => ({ ...prev, player1: undefined }))
//         }

//         if (fieldApi.name === "connectedPlayer1" && fieldApi.state.value) {
//           fetchPlayer1({ variables: { _id: fieldApi.state.value } })
//         }

//         if (fieldApi.name === "isPlayer2New" && fieldApi.state.value) {
//           formApi.setFieldValue("connectedPlayer2", null)
//           formApi.setFieldValue("migratePlayer2Data", {
//             firstName: false,
//             middleName: false,
//             lastName: false,
//             suffix: false,
//             birthDate: false,
//             phoneNumber: false,
//             email: false,
//             validDocuments: false,
//           })
//           // Clear document selections for player 2
//           setDocumentSelections(prev => ({ ...prev, player2: undefined }))
//         }
//         if (fieldApi.name === "connectedPlayer2" && fieldApi.state.value) {
//           fetchPlayer2({ variables: { _id: fieldApi.state.value } })
//         }
//       },
//     },
//     validators: {
//       onSubmit: ({ formApi, value }) => {
//         try {
//           AssignPlayersSchema.parse(value)
//         } catch (error: any) {
//           const formErrors = JSON.parse(error)
//           formErrors.map(
//             ({ path, message }: { path: string; message: string }) =>
//               formApi.fieldInfo[
//                 path as keyof typeof formApi.fieldInfo
//               ].instance?.setErrorMap({
//                 onSubmit: { message },
//               })
//           )
//         }
//       },
//     },
//     onSubmit: ({ value: payload, formApi }) =>
//       startTransition(async () => {
//         try {
//           console.log("🚀 Starting player assignment process...")
//           console.log("📋 Form payload:", payload)

//           // Prepare the payload with document selections
//           const finalPayload = {
//             ...payload,
//           };

//           if (entry) {
//             try {
//               const documentResult = await checkAndMoveDocuments(
//                 entry,
//                 player1,
//                 player2,
//                 documentSelections
//               )

//               if (documentResult.total > 0) {
//                 const messages: string[] = []

//                 if (documentResult.replaced.length > 0) {
//                   messages.push(`Replaced ${documentResult.replaced.length} document(s)`)
//                 }

//                 if (documentResult.moved.length > 0) {
//                   const movedCount = documentResult.moved.filter(d => d.status !== 'already_exists').length
//                   const alreadyExistsCount = documentResult.moved.filter(d => d.status === 'already_exists').length

//                   if (movedCount > 0) {
//                     messages.push(`Added ${movedCount} new document(s)`)
//                   }

//                   if (alreadyExistsCount > 0) {
//                     messages.push(`${alreadyExistsCount} document(s) already in folder`)
//                   }
//                 }

//                 if (messages.length > 0) {
//                   toast.success(`Documents processed: ${messages.join(', ')}`, {
//                     duration: 5000,
//                   })
//                 }
//               } else {
//                 console.log("📭 No documents to process")
//               }
//             } catch (documentError: any) {
//               toast.warning('Some documents could not be processed, but players will still be assigned', {
//                 duration: 4000,
//               })
//             }
//           } else {
//             console.log("📭 No entry data found for document processing")
//           }

//           const response: any = await assignPlayers({
//             variables: {
//               input: finalPayload,
//             },
//           })

//           if (response?.data?.assignPlayers?.ok) {
//             onClose()

//             toast.success(response.data.assignPlayers.message || "Players assigned successfully", {
//               duration: 3000,
//             })
//           } else {
//             toast.error(response?.data?.assignPlayers?.message || "Failed to assign players", {
//               duration: 3000,
//             })
//           }
//         } catch (error: any) {
//           toast.error(error.message || "Failed to assign players", {
//             duration: 3000,
//           })

//           if (error.name == "CombinedGraphQLErrors") {
//             const fieldErrors = error.errors[0]?.extensions?.fields
//             if (fieldErrors) {
//               fieldErrors.map(
//                 ({ path, message }: { path: string; message: string }) =>
//                   formApi.fieldInfo[
//                     path as keyof typeof formApi.fieldInfo
//                   ].instance?.setErrorMap({
//                     onSubmit: { message },
//                   })
//               )
//             }
//           }
//         }
//       }),
//   })

//   const fetchPlayer1Suggestions = async () => {
//     if (!entry?.player1Entry) {
//       console.log("No player1Entry found");
//       return;
//     }

//     const { firstName, lastName, birthDate } = entry.player1Entry;
//     console.log("Player 1 Entry Data:", { firstName, lastName, birthDate });

//     if (!firstName || !lastName || !birthDate) {
//       console.log("Missing required fields for Player 1");
//       return;
//     }

//     setIsLoadingSuggestions1(true);
//     try {
//       console.log("Fetching suggestions for Player 1...");
//       const { data, error } = await fetchSuggestions1({
//         variables: {
//           input: {
//             firstName,
//             lastName,
//             birthDate: birthDate instanceof Date ? birthDate.toISOString() : birthDate
//           }
//         }
//       })

//       console.log("Player 1 Suggestions Response:", { data, error });
//       console.log("Suggestions data:", data?.suggestPlayers);
//       setSuggestedPlayers1(data?.suggestPlayers || []);
//     } catch (error) {
//       console.error("Error fetching suggestions for Player 1:", error);
//     } finally {
//       setIsLoadingSuggestions1(false);
//     }
//   }

//   const fetchPlayer2Suggestions = async () => {
//     if (!entry?.player2Entry) return;

//     const { firstName, lastName, birthDate } = entry.player2Entry;
//     if (!firstName || !lastName || !birthDate) return;

//     setIsLoadingSuggestions2(true);
//     try {
//       const { data } = await fetchSuggestions2({
//         variables: {
//           input: {
//             firstName,
//             lastName,
//             birthDate
//           }
//         }
//       });
//       setSuggestedPlayers2(data?.suggestPlayers || []);
//     } catch (error) {
//       console.error("Error fetching suggestions for Player 2:", error);
//     } finally {
//       setIsLoadingSuggestions2(false);
//     }
//   }

//   useEffect(() => {
//     if (open) {
//       if (entry?.player1Entry) {
//         fetchPlayer1Suggestions();
//       }
//       if (entry?.player2Entry) {
//         fetchPlayer2Suggestions();
//       }
//     }
//   }, [open, entry?.player1Entry, entry?.player2Entry]);

//   const onClose = () => {
//     form.reset()
//     setDocumentSelections({})
//     setSuggestedPlayers1([])
//     setSuggestedPlayers2([])
//     setOpen(false)
//     props.onClose?.()
//   }

//   const handleDocumentSelection1 = () => {
//     setShowDocumentSelection1(true);
//   };

//   const handleDocumentSelection2 = () => {
//     setShowDocumentSelection2(true);
//   };

//   const handleSaveDocumentSelections1 = (selections: DocumentSelection) => {
//     setDocumentSelections(prev => ({ ...prev, player1: selections }));
//     // Update the form value to indicate documents will be migrated
//     form.setFieldValue("migratePlayer1Data.validDocuments", true);
//     toast.success('Document selections saved for Player 1', {
//       duration: 3000,
//     });
//   };

//   const handleSaveDocumentSelections2 = (selections: DocumentSelection) => {
//     setDocumentSelections(prev => ({ ...prev, player2: selections }));
//     // Update the form value to indicate documents will be migrated
//     form.setFieldValue("migratePlayer2Data.validDocuments", true);
//     toast.success('Document selections saved for Player 2', {
//       duration: 3000,
//     });
//   };

//   const getPlayer1ExistingDocuments = (): DocumentInfo[] => {
//     if (!player1?.validDocuments) return [];
//     return player1.validDocuments.map(doc => ({
//       documentType: doc.documentType,
//       documentURL: doc.documentURL,
//       dateUploaded: doc.dateUploaded,
//       player: 'Player 1',
//       source: 'existing'
//     }));
//   };

//   const getPlayer1NewDocuments = (): DocumentInfo[] => {
//     if (!entry?.player1Entry?.validDocuments) return [];
//     return entry.player1Entry.validDocuments.map(doc => ({
//       documentType: doc.documentType,
//       documentURL: doc.documentURL,
//       dateUploaded: doc.dateUploaded,
//       player: 'Player 1',
//       source: 'new'
//     }));
//   };

//   const getPlayer2ExistingDocuments = (): DocumentInfo[] => {
//     if (!player2?.validDocuments) return [];
//     return player2.validDocuments.map(doc => ({
//       documentType: doc.documentType,
//       documentURL: doc.documentURL,
//       dateUploaded: doc.dateUploaded,
//       player: 'Player 2',
//       source: 'existing'
//     }));
//   };

//   const getPlayer2NewDocuments = (): DocumentInfo[] => {
//     if (!entry?.player2Entry?.validDocuments) return [];
//     return entry.player2Entry.validDocuments.map(doc => ({
//       documentType: doc.documentType,
//       documentURL: doc.documentURL,
//       dateUploaded: doc.dateUploaded,
//       player: 'Player 2',
//       source: 'new'
//     }));
//   };

//   const hasPlayer1DocumentsToSelect = () => {
//     const hasExisting = getPlayer1ExistingDocuments().length > 0;
//     const hasNew = getPlayer1NewDocuments().length > 0;
//     return hasExisting && hasNew;
//   };

//   const hasPlayer2DocumentsToSelect = () => {
//     const hasExisting = getPlayer2ExistingDocuments().length > 0;
//     const hasNew = getPlayer2NewDocuments().length > 0;
//     return hasExisting && hasNew;
//   };

//   const handleFormSubmit = async () => {
//     // First, check if we need to show document selection dialogs
//     const needsPlayer1Selection = !form.getFieldValue("isPlayer1New") &&
//       form.getFieldValue("connectedPlayer1") &&
//       hasPlayer1DocumentsToSelect() &&
//       !documentSelections.player1;

//     const needsPlayer2Selection = !form.getFieldValue("isPlayer2New") &&
//       form.getFieldValue("connectedPlayer2") &&
//       hasPlayer2DocumentsToSelect() &&
//       !documentSelections.player2;

//     // If either player needs document selection, show those dialogs
//     if (needsPlayer1Selection) {
//       setShowDocumentSelection1(true);
//       return; // Wait for user to make selections
//     } else if (needsPlayer2Selection) {
//       setShowDocumentSelection2(true);
//       return; // Wait for user to make selections
//     } else {
//       // No document selections needed, proceed directly to form submission
//       form.handleSubmit();
//     }
//   };

//   const getDocumentSelectionSummary = (selections?: DocumentSelection) => {
//     if (!selections) return null;

//     const total = Object.keys(selections).length;
//     const selectedNew = Object.values(selections).filter(s => s.selectedSource === 'new').length;
//     const selectedExisting = Object.values(selections).filter(s => s.selectedSource === 'existing').length;

//     return `${selectedNew} new, ${selectedExisting} existing`;
//   };

//   const SuggestedPlayersSection = ({
//     suggestions,
//     isLoading,
//     onSelectPlayer,
//     playerType
//   }: {
//     suggestions: any[];
//     isLoading: boolean;
//     onSelectPlayer: (playerId: string) => void;
//     playerType: 'player1' | 'player2';
//   }) => {
//     console.log(`Rendering SuggestedPlayersSection for ${playerType}:`, {
//       isLoading,
//       suggestionsCount: suggestions.length,
//       suggestions
//     });

//     if (isLoading) {
//       return (
//         <div className="mb-4 p-3 border rounded-md bg-gray-50">
//           <div className="flex items-center gap-2">
//             <Loader2 className="h-4 w-4 animate-spin" />
//             <span className="text-sm text-gray-600">Finding suggested players...</span>
//           </div>
//         </div>
//       );
//     }

//     if (suggestions.length === 0) {
//       console.log(`No suggestions for ${playerType}, returning null`);
//       return null;
//     }

//     return (
//       <div className="mb-4">
//         <div className="flex items-center justify-between mb-2">
//           <h4 className="text-sm font-medium">Suggested Players</h4>
//           <span className="text-xs text-gray-500">
//             Based on name and birthday match
//           </span>
//         </div>
//         <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
//           {suggestions.map((player) => (
//             <div
//               key={player._id}
//               className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
//               onClick={() => onSelectPlayer(player._id)}
//             >
//               <div className="flex justify-between items-start">
//                 <div>
//                   <div className="flex items-center gap-2">
//                     <span className="font-medium text-sm">
//                       {player.fullName}
//                     </span>
//                     <Badge
//                       variant="outline"
//                       className={cn(
//                         "text-xs",
//                         player.similarityScore >= 60
//                           ? "bg-green-50 text-green-700 border-green-200"
//                           : player.similarityScore >= 40
//                             ? "bg-amber-50 text-amber-700 border-amber-200"
//                             : "bg-blue-50 text-blue-700 border-blue-200"
//                       )}
//                     >
//                       {player.similarityScore}% match
//                     </Badge>
//                   </div>
//                   <div className="mt-1 space-y-1">
//                     <div className="flex flex-wrap gap-1">
//                       {player.matchReasons.map((reason: string, index: number) => (
//                         <Badge
//                           key={index}
//                           variant="secondary"
//                           className="text-xs py-0.5"
//                         >
//                           {reason}
//                         </Badge>
//                       ))}
//                     </div>
//                     <div className="text-xs text-gray-500 space-y-0.5">
//                       <div>Birthday: {format(new Date(player.birthDate), "PP")}</div>
//                       {player.email && <div>Email: {player.email}</div>}
//                       {player.phoneNumber && <div>Phone: {player.phoneNumber}</div>}
//                     </div>
//                   </div>
//                 </div>
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onSelectPlayer(player._id);
//                   }}
//                 >
//                   Select
//                 </Button>
//               </div>
//             </div>
//           ))}
//         </div>
//         <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
//           <AlertCircle className="h-3 w-3" />
//           <span>Click on a suggestion to auto-fill the player selection below</span>
//         </div>
//       </div>
//     );
//   }

//   const hasSuggestionsForCurrentTab = (tab: string) => {
//     if (tab === 'player1') {
//       const isNewPlayer = form.getFieldValue('isPlayer1New')
//       return !isNewPlayer && suggestedPlayers1.length > 0
//     } else if (tab === 'player2') {
//       const isNewPlayer = form.getFieldValue('isPlayer2New')
//       return !isNewPlayer && suggestedPlayers2.length > 0
//     }
//     return false
//   }

//   const renderTabContent = (tab: 'player1' | 'player2') => {
//     const suggestions = tab === 'player1' ? suggestedPlayers1 : suggestedPlayers2;
//     const isLoadingSuggestions = tab === 'player1' ? isLoadingSuggestions1 : isLoadingSuggestions2;
//     const hasSuggestions = suggestions.length > 0;
//     const isNewPlayer = form.getFieldValue(`is${tab === 'player1' ? 'Player1' : 'Player2'}New`);

//     const shouldShowTwoColumnLayout = hasSuggestions && !isNewPlayer;

//     if (shouldShowTwoColumnLayout) {
//       return (
//         <div className="flex gap-6">
//           <div className="w-3/4!">
//             <FieldSet className="flex flex-col gap-2.5 h-[75vh] overflow-y-auto pr-2">
//               <form.Field
//                 name={`is${tab === 'player1' ? 'Player1' : 'Player2'}New`}
//                 children={(field) => {
//                   const isInvalid =
//                     field.state.meta.isTouched &&
//                     !field.state.meta.isValid
//                   return (
//                     <Field data-invalid={isInvalid}>
//                       <div className="flex items-center py-1">
//                         <Checkbox
//                           id={field.name}
//                           name={field.name}
//                           checked={field.state.value}
//                           onBlur={field.handleBlur}
//                           onCheckedChange={(checked) =>
//                             field.handleChange(checked === true)
//                           }
//                           className="mr-2"
//                           aria-invalid={isInvalid}
//                           disabled={isLoading}
//                         />
//                         <div className="grid">
//                           <FieldLabel htmlFor={field.name}>
//                             Is New Player? ({tab === 'player1' ? 'Player 1' : 'Player 2'})
//                           </FieldLabel>
//                           <span className="text-muted-foreground text-xs">
//                             Checking this will create a new player profile.
//                           </span>
//                         </div>
//                       </div>

//                       {isInvalid && (
//                         <FieldError errors={field.state.meta.errors} />
//                       )}
//                     </Field>
//                   )
//                 }}
//               />

//               {!form.getFieldValue(`is${tab === 'player1' ? 'Player1' : 'Player2'}New`) &&
//                 form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) &&
//                 (tab === 'player1' ? hasPlayer1DocumentsToSelect() : hasPlayer2DocumentsToSelect()) && (
//                   <div className="mb-4">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <Label className="text-sm font-medium">Document Selection</Label>
//                         <p className="text-xs text-muted-foreground">
//                           Choose which documents to keep for {tab === 'player1' ? 'Player 1' : 'Player 2'}
//                         </p>
//                       </div>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={tab === 'player1' ? handleDocumentSelection1 : handleDocumentSelection2}
//                         disabled={isLoading}
//                       >
//                         {(tab === 'player1'
//                           ? documentSelections.player1
//                           : documentSelections.player2)
//                           ? "Edit Selection"
//                           : "Select Documents"}

//                       </Button>
//                     </div>
//                     {(tab === 'player1' ? documentSelections.player1 : documentSelections.player2) ? (
//                       <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center">
//                             <Check className="h-4 w-4 mr-2 text-green-600" />
//                             <div>
//                               <p className="text-sm font-medium text-blue-800">Document selections saved</p>
//                               <p className="text-xs text-blue-600">
//                                 {getDocumentSelectionSummary(
//                                   tab === 'player1' ? documentSelections.player1 : documentSelections.player2
//                                 )} documents selected
//                               </p>
//                             </div>
//                           </div>
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={tab === 'player1' ? handleDocumentSelection1 : handleDocumentSelection2}
//                             className="text-xs"
//                           >
//                             Edit
//                           </Button>
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
//                         <div className="flex items-center">
//                           <FileText className="h-4 w-4 mr-2 text-amber-600" />
//                           <div>
//                             <p className="text-sm font-medium text-amber-800">Document Selection Required</p>
//                             <p className="text-xs text-amber-600">
//                               Click "Select Documents" to choose which documents to keep
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}

//               {!form.getFieldValue(`is${tab === 'player1' ? 'Player1' : 'Player2'}New`) && (
//                 <>
//                   <form.Field
//                     name={`connected${tab === 'player1' ? 'Player1' : 'Player2'}`}
//                     children={(field) => {
//                       const isInvalid =
//                         field.state.meta.isTouched &&
//                         !field.state.meta.isValid
//                       return (
//                         <Field data-invalid={isInvalid}>
//                           <FieldLabel htmlFor={field.name}>
//                             Connected {tab === 'player1' ? 'Player 1' : 'Player 2'}
//                           </FieldLabel>
//                           <Popover
//                             open={tab === 'player1' ? openPlayers1 : openPlayers2}
//                             onOpenChange={tab === 'player1' ? setOpenPlayers1 : setOpenPlayers2}
//                           >
//                             <PopoverTrigger asChild>
//                               <Button
//                                 id={field.name}
//                                 name={field.name}
//                                 disabled={optionsLoading}
//                                 aria-expanded={tab === 'player1' ? openPlayers1 : openPlayers2}
//                                 onBlur={field.handleBlur}
//                                 variant="outline"
//                                 role="combobox"
//                                 aria-invalid={isInvalid}
//                                 className={cn(
//                                   "w-full justify-between font-normal capitalize -mt-2",
//                                   !field.state.value &&
//                                   "text-muted-foreground"
//                                 )}
//                                 type="button"
//                               >
//                                 {field.state.value
//                                   ? players.find(
//                                     (o: {
//                                       value: string
//                                       label: string
//                                     }) =>
//                                       o.value === field.state.value
//                                   )?.label
//                                   : `Select ${tab === 'player1' ? 'Player 1' : 'Player 2'}`}
//                                 <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                               </Button>
//                             </PopoverTrigger>
//                             <PopoverContent className="w-full p-0">
//                               <Command
//                                 filter={(value, search) =>
//                                   players
//                                     .find(
//                                       (t: {
//                                         value: string
//                                         label: string
//                                       }) => t.value === value
//                                     )
//                                     ?.label.toLowerCase()
//                                     .includes(search.toLowerCase())
//                                     ? 1
//                                     : 0
//                                 }
//                               >
//                                 <CommandInput placeholder={`Select ${tab === 'player1' ? 'Player 1' : 'Player 2'}`} />
//                                 <CommandList className="max-h-72 overflow-y-auto">
//                                   <CommandGroup>
//                                     <Label className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
//                                       Players
//                                     </Label>
//                                     {players?.map(
//                                       (o: {
//                                         value: string
//                                         label: string
//                                         hasEarlyBird: boolean
//                                       }) => (
//                                         <CommandItem
//                                           key={o.value}
//                                           value={o.value}
//                                           onSelect={(v) => {
//                                             field.handleChange(
//                                               v.toString()
//                                             )
//                                             tab === 'player1' ? setOpenPlayers1(false) : setOpenPlayers2(false)
//                                           }}
//                                           className="capitalize"
//                                         >
//                                           <CheckIcon
//                                             className={cn(
//                                               "h-4 w-4",
//                                               field.state.value ===
//                                                 o.value
//                                                 ? "opacity-100"
//                                                 : "opacity-0"
//                                             )}
//                                           />
//                                           {o.label}
//                                         </CommandItem>
//                                       )
//                                     )}
//                                   </CommandGroup>
//                                   <CommandEmpty>
//                                     No players found.
//                                   </CommandEmpty>
//                                 </CommandList>
//                               </Command>
//                             </PopoverContent>
//                           </Popover>
//                           {isInvalid && (
//                             <FieldError
//                               errors={field.state.meta.errors}
//                             />
//                           )}
//                         </Field>
//                       )
//                     }}
//                   />
//                   <Separator />
//                   <div className="flex flex-col">
//                     <div className="col-span-2">
//                       <Label>Migrate Data</Label>
//                       <span className="text-xs text-muted-foreground">
//                         Checked fields will update the player database with entry data.
//                       </span>
//                     </div>
//                     <div className="flex items-center w-full gap-2">
//                       <div className="h-full flex items-center justify-center">
//                         <Checkbox
//                           disabled={
//                             isLoading || !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
//                           }
//                           onCheckedChange={(checked) => {
//                             form.setFieldValue(`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data`, {
//                               firstName: checked === true,
//                               middleName: checked === true,
//                               lastName: checked === true,
//                               suffix: checked === true,
//                               birthDate: checked === true,
//                               phoneNumber: checked === true,
//                               email: checked === true,
//                               validDocuments: checked === true,
//                             })
//                             if (checked) {
//                               setTimeout(() => {
//                                 tab === 'player1' ? handleDocumentSelection1() : handleDocumentSelection2();
//                               }, 100);
//                             }
//                           }}
//                         />
//                       </div>
//                       <div className="text-xs grid grid-cols-5 col-span-2 h-full w-full">
//                         <div className="px-2 h-full border w-full flex items-center justify-center min-h-8"></div>
//                         <span
//                           className={cn(
//                             "px-2 h-full border w-full flex items-center justify-center",
//                             form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
//                               ? "col-span-2"
//                               : "hidden"
//                           )}
//                         >
//                           From Database (Current)
//                         </span>{" "}
//                         <span
//                           className={cn(
//                             "px-2 h-full border w-full flex items-center justify-center",
//                             form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
//                               ? "col-span-2"
//                               : "col-span-4"
//                           )}
//                         >
//                           From Entry (New)
//                         </span>
//                       </div>
//                     </div>
//                     <div>
//                       <form.Field
//                         name={`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data.firstName`}
//                         children={(field) => {
//                           const isInvalid =
//                             field.state.meta.isTouched &&
//                             !field.state.meta.isValid
//                           return (
//                             <Field>
//                               <div className="flex items-center w-full gap-2">
//                                 <div className="h-full flex items-center justify-center">
//                                   <Checkbox
//                                     id={field.name}
//                                     name={field.name}
//                                     checked={field.state.value}
//                                     onBlur={field.handleBlur}
//                                     onCheckedChange={(checked) =>
//                                       field.handleChange(
//                                         checked === true
//                                       )
//                                     }
//                                     aria-invalid={isInvalid}
//                                     disabled={
//                                       isLoading ||
//                                       !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
//                                     }
//                                   />
//                                 </div>
//                                 <div className="text-xs grid grid-cols-5 col-span-2 min-h-8 w-full">
//                                   <span className="px-2 h-full border w-full flex items-center justify-center py-1 text-center">
//                                     First Name
//                                   </span>
//                                   {form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) ? (
//                                     <>
//                                       <span
//                                         className={cn(
//                                           !field.state.value &&
//                                           "text-success bg-success/5",
//                                           "col-span-2 px-2 h-full border w-full flex items-center justify-start py-1"
//                                         )}
//                                       >
//                                         {tab === 'player1' ? player1?.firstName : player2?.firstName}
//                                       </span>{" "}
//                                       <span
//                                         className={cn(
//                                           field.state.value &&
//                                           "text-warning bg-warning/5",
//                                           "col-span-2 px-2 h-full border w-full flex items-center justify-start py-1"
//                                         )}
//                                       >
//                                         {tab === 'player1' ? entry?.player1Entry.firstName : entry?.player2Entry?.firstName}
//                                       </span>
//                                     </>
//                                   ) : (
//                                     <span
//                                       className={cn(
//                                         field.state.value &&
//                                         "text-warning",
//                                         "col-span-4 px-2 h-full border w-full flex items-center justify-start"
//                                       )}
//                                     >
//                                       {tab === 'player1' ? entry?.player1Entry.firstName : entry?.player2Entry?.firstName}
//                                     </span>
//                                   )}
//                                 </div>
//                               </div>
//                             </Field>
//                           )
//                         }}
//                       />
//                     </div>
//                     <div>
//                       <form.Field
//                         name={`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data.middleName`}
//                         children={(field) => {
//                           const isInvalid =
//                             field.state.meta.isTouched &&
//                             !field.state.meta.isValid
//                           return (
//                             <Field>
//                               <div className="flex items-center w-full gap-2">
//                                 <div className="h-full flex items-center justify-center text-center">
//                                   <Checkbox
//                                     id={field.name}
//                                     name={field.name}
//                                     checked={field.state.value}
//                                     onBlur={field.handleBlur}
//                                     onCheckedChange={(checked) =>
//                                       field.handleChange(
//                                         checked === true
//                                       )
//                                     }
//                                     aria-invalid={isInvalid}
//                                     disabled={
//                                       isLoading ||
//                                       !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
//                                     }
//                                   />
//                                 </div>
//                                 <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
//                                   <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
//                                     Middle Name
//                                   </span>
//                                   {form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) ? (
//                                     <>
//                                       <span
//                                         className={cn(
//                                           !field.state.value &&
//                                           "text-success bg-success/5",
//                                           "col-span-2 px-2 border w-full flex items-center justify-start py-1",
//                                           !(tab === 'player1' ? player1?.middleName : player2?.middleName) &&
//                                           "italic"
//                                         )}
//                                       >
//                                         {tab === 'player1' ? player1?.middleName || "N/A" : player2?.middleName || "N/A"}
//                                       </span>{" "}
//                                       <span
//                                         className={cn(
//                                           field.state.value &&
//                                           "text-warning bg-warning/5",
//                                           "col-span-2 px-2 border w-full flex items-center justify-start py-1",
//                                           !(tab === 'player1' ? player1?.middleName : player2?.middleName) &&
//                                           "italic"
//                                         )}
//                                       >
//                                         {tab === 'player1' ? entry?.player1Entry.middleName || "N/A" : entry?.player2Entry?.middleName || "N/A"}
//                                       </span>
//                                     </>
//                                   ) : (
//                                     <span
//                                       className={cn(
//                                         field.state.value &&
//                                         "text-warning",
//                                         "col-span-4 px-2 border w-full flex items-center justify-start py-1",
//                                         !(tab === 'player1' ? player1?.middleName : player2?.middleName) && "italic"
//                                       )}
//                                     >
//                                       {tab === 'player1' ? entry?.player1Entry.middleName || "N/A" : entry?.player2Entry?.middleName || "N/A"}
//                                     </span>
//                                   )}
//                                 </div>
//                               </div>
//                             </Field>
//                           )
//                         }}
//                       />
//                     </div>
//                     <div>
//                       <form.Field
//                         name={`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data.lastName`}
//                         children={(field) => {
//                           const isInvalid =
//                             field.state.meta.isTouched &&
//                             !field.state.meta.isValid
//                           return (
//                             <Field>
//                               <div className="flex items-center w-full gap-2">
//                                 <div className="flex items-center justify-center">
//                                   <Checkbox
//                                     id={field.name}
//                                     name={field.name}
//                                     checked={field.state.value}
//                                     onBlur={field.handleBlur}
//                                     onCheckedChange={(checked) =>
//                                       field.handleChange(
//                                         checked === true
//                                       )
//                                     }
//                                     aria-invalid={isInvalid}
//                                     disabled={
//                                       isLoading ||
//                                       !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
//                                     }
//                                   />
//                                 </div>
//                                 <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
//                                   <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
//                                     Last Name
//                                   </span>
//                                   {form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) ? (
//                                     <>
//                                       <span
//                                         className={cn(
//                                           !field.state.value &&
//                                           "text-success bg-success/5",
//                                           "col-span-2 px-2 border w-full flex items-center justify-start py-1",
//                                           !(tab === 'player1' ? player1?.lastName : player2?.lastName) && "italic"
//                                         )}
//                                       >
//                                         {tab === 'player1' ? player1?.lastName || "N/A" : player2?.lastName || "N/A"}
//                                       </span>{" "}
//                                       <span
//                                         className={cn(
//                                           field.state.value &&
//                                           "text-warning bg-warning/5",
//                                           "col-span-2 px-2 border w-full flex items-center justify-start py-1",
//                                           !(tab === 'player1' ? player1?.lastName : player2?.lastName) && "italic"
//                                         )}
//                                       >
//                                         {tab === 'player1' ? entry?.player1Entry.lastName || "N/A" : entry?.player2Entry?.lastName || "N/A"}
//                                       </span>
//                                     </>
//                                   ) : (
//                                     <span
//                                       className={cn(
//                                         field.state.value &&
//                                         "text-warning",
//                                         "col-span-4 px-2 border w-full flex items-center justify-start py-1",
//                                         !(tab === 'player1' ? player1?.lastName : player2?.lastName) && "italic"
//                                       )}
//                                     >
//                                       {tab === 'player1' ? entry?.player1Entry.lastName || "N/A" : entry?.player2Entry?.lastName || "N/A"}
//                                     </span>
//                                   )}
//                                 </div>
//                               </div>
//                             </Field>
//                           )
//                         }}
//                       />
//                     </div>
//                     <div>
//                       <form.Field
//                         name={`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data.suffix`}
//                         children={(field) => {
//                           const isInvalid =
//                             field.state.meta.isTouched &&
//                             !field.state.meta.isValid
//                           return (
//                             <Field>
//                               <div className="flex items-center w-full gap-2">
//                                 <div className="flex items-center justify-center">
//                                   <Checkbox
//                                     id={field.name}
//                                     name={field.name}
//                                     checked={field.state.value}
//                                     onBlur={field.handleBlur}
//                                     onCheckedChange={(checked) =>
//                                       field.handleChange(
//                                         checked === true
//                                       )
//                                     }
//                                     aria-invalid={isInvalid}
//                                     disabled={
//                                       isLoading ||
//                                       !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
//                                     }
//                                   />
//                                 </div>
//                                 <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
//                                   <span className="px-2 border w-full flex items-center py-1 justify-center text-center">
//                                     Ext.
//                                   </span>
//                                   {form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) ? (
//                                     <>
//                                       <span
//                                         className={cn(
//                                           !field.state.value &&
//                                           "text-success bg-success/5",
//                                           "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
//                                           !(tab === 'player1' ? player1?.suffix : player2?.suffix) && "italic"
//                                         )}
//                                       >
//                                         {tab === 'player1' ? player1?.suffix || "N/A" : player2?.suffix || "N/A"}
//                                       </span>{" "}
//                                       <span
//                                         className={cn(
//                                           field.state.value &&
//                                           "text-warning bg-warning/5",
//                                           "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
//                                           !(tab === 'player1' ? player1?.suffix : player2?.suffix) && "italic"
//                                         )}
//                                       >
//                                         {tab === 'player1' ? entry?.player1Entry.suffix || "N/A" : entry?.player2Entry?.suffix || "N/A"}
//                                       </span>
//                                     </>
//                                   ) : (
//                                     <span
//                                       className={cn(
//                                         field.state.value &&
//                                         "text-warning",
//                                         "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
//                                         !(tab === 'player1' ? player1?.suffix : player2?.suffix) && "italic"
//                                       )}
//                                     >
//                                       {tab === 'player1' ? entry?.player1Entry.suffix || "N/A" : entry?.player2Entry?.suffix || "N/A"}
//                                     </span>
//                                   )}
//                                 </div>
//                               </div>
//                             </Field>
//                           )
//                         }}
//                       />
//                     </div>
//                     <div>
//                       <form.Field
//                         name={`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data.email`}
//                         children={(field) => {
//                           const isInvalid =
//                             field.state.meta.isTouched &&
//                             !field.state.meta.isValid
//                           return (
//                             <Field>
//                               <div className="flex items-center w-full gap-2">
//                                 <div className="flex items-center justify-center">
//                                   <Checkbox
//                                     id={field.name}
//                                     name={field.name}
//                                     checked={field.state.value}
//                                     onBlur={field.handleBlur}
//                                     onCheckedChange={(checked) =>
//                                       field.handleChange(
//                                         checked === true
//                                       )
//                                     }
//                                     aria-invalid={isInvalid}
//                                     disabled={
//                                       isLoading ||
//                                       !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
//                                     }
//                                   />
//                                 </div>
//                                 <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
//                                   <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
//                                     Email
//                                   </span>
//                                   {form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) ? (
//                                     <>
//                                       <span
//                                         className={cn(
//                                           !field.state.value &&
//                                           "text-success bg-success/5",
//                                           "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
//                                           !(tab === 'player1' ? player1?.email : player2?.email) && "italic"
//                                         )}
//                                       >
//                                         {tab === 'player1' ? player1?.email || "N/A" : player2?.email || "N/A"}
//                                       </span>{" "}
//                                       <span
//                                         className={cn(
//                                           field.state.value &&
//                                           "text-warning bg-warning/5",
//                                           "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
//                                           !(tab === 'player1' ? player1?.email : player2?.email) && "italic"
//                                         )}
//                                       >
//                                         {tab === 'player1' ? entry?.player1Entry.email || "N/A" : entry?.player2Entry?.email || "N/A"}
//                                       </span>
//                                     </>
//                                   ) : (
//                                     <span
//                                       className={cn(
//                                         field.state.value &&
//                                         "text-warning",
//                                         "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
//                                         !(tab === 'player1' ? player1?.email : player2?.email) && "italic"
//                                       )}
//                                     >
//                                       {tab === 'player1' ? entry?.player1Entry.email || "N/A" : entry?.player2Entry?.email || "N/A"}
//                                     </span>
//                                   )}
//                                 </div>
//                               </div>
//                             </Field>
//                           )
//                         }}
//                       />
//                     </div>
//                     <div>
//                       <form.Field
//                         name={`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data.phoneNumber`}
//                         children={(field) => {
//                           const isInvalid =
//                             field.state.meta.isTouched &&
//                             !field.state.meta.isValid
//                           return (
//                             <Field>
//                               <div className="flex items-center w-full gap-2">
//                                 <div className="flex items-center justify-center">
//                                   <Checkbox
//                                     id={field.name}
//                                     name={field.name}
//                                     checked={field.state.value}
//                                     onBlur={field.handleBlur}
//                                     onCheckedChange={(checked) =>
//                                       field.handleChange(
//                                         checked === true
//                                       )
//                                     }
//                                     aria-invalid={isInvalid}
//                                     disabled={
//                                       isLoading ||
//                                       !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
//                                     }
//                                   />
//                                 </div>
//                                 <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
//                                   <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
//                                     Phone No.
//                                   </span>
//                                   {form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) ? (
//                                     <>
//                                       <span
//                                         className={cn(
//                                           !field.state.value &&
//                                           "text-success bg-success/5",
//                                           "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
//                                           !(tab === 'player1' ? player1?.phoneNumber : player2?.phoneNumber) &&
//                                           "italic"
//                                         )}
//                                       >
//                                         {tab === 'player1' ? player1?.phoneNumber || "N/A" : player2?.phoneNumber || "N/A"}
//                                       </span>{" "}
//                                       <span
//                                         className={cn(
//                                           field.state.value &&
//                                           "text-warning bg-warning/5",
//                                           "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
//                                           !(tab === 'player1' ? player1?.phoneNumber : player2?.phoneNumber) &&
//                                           "italic"
//                                         )}
//                                       >
//                                         {tab === 'player1' ? entry?.player1Entry.phoneNumber || "N/A" : entry?.player2Entry?.phoneNumber || "N/A"}
//                                       </span>
//                                     </>
//                                   ) : (
//                                     <span
//                                       className={cn(
//                                         field.state.value &&
//                                         "text-warning",
//                                         "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
//                                         !(tab === 'player1' ? player1?.phoneNumber : player2?.phoneNumber) &&
//                                         "italic"
//                                       )}
//                                     >
//                                       {tab === 'player1' ? entry?.player1Entry.phoneNumber || "N/A" : entry?.player2Entry?.phoneNumber || "N/A"}
//                                     </span>
//                                   )}
//                                 </div>
//                               </div>
//                             </Field>
//                           )
//                         }}
//                       />
//                     </div>
//                     <div>
//                       <form.Field
//                         name={`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data.birthDate`}
//                         children={(field) => {
//                           const isInvalid =
//                             field.state.meta.isTouched &&
//                             !field.state.meta.isValid
//                           return (
//                             <Field>
//                               <div className="flex items-center w-full gap-2">
//                                 <div className="flex items-center justify-center">
//                                   <Checkbox
//                                     id={field.name}
//                                     name={field.name}
//                                     checked={field.state.value}
//                                     onBlur={field.handleBlur}
//                                     onCheckedChange={(checked) =>
//                                       field.handleChange(
//                                         checked === true
//                                       )
//                                     }
//                                     aria-invalid={isInvalid}
//                                     disabled={
//                                       isLoading ||
//                                       !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
//                                     }
//                                   />
//                                 </div>
//                                 <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
//                                   <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
//                                     Birthday
//                                   </span>
//                                   {form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) ? (
//                                     <>
//                                       <span
//                                         className={cn(
//                                           !field.state.value &&
//                                           "text-success bg-success/5",
//                                           "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
//                                           !(tab === 'player1' ? player1?.birthDate : player2?.birthDate) &&
//                                           "italic"
//                                         )}
//                                       >
//                                         {tab === 'player1' ? player1?.birthDate
//                                           ? format(
//                                             new Date(
//                                               player1.birthDate
//                                             ),
//                                             "PP"
//                                           )
//                                           : "N/A" : player2?.birthDate
//                                           ? format(
//                                             new Date(
//                                               player2.birthDate
//                                             ),
//                                             "PP"
//                                           )
//                                           : "N/A"}
//                                       </span>{" "}
//                                       <span
//                                         className={cn(
//                                           field.state.value &&
//                                           "text-warning bg-warning/5",
//                                           "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
//                                           !(tab === 'player1' ? player1?.birthDate : player2?.birthDate) &&
//                                           "italic"
//                                         )}
//                                       >
//                                         {tab === 'player1' ? entry?.player1Entry.birthDate
//                                           ? format(
//                                             new Date(
//                                               entry.player1Entry.birthDate
//                                             ),
//                                             "PP"
//                                           )
//                                           : "N/A" : entry?.player2Entry?.birthDate
//                                           ? format(
//                                             new Date(
//                                               entry.player2Entry.birthDate
//                                             ),
//                                             "PP"
//                                           )
//                                           : "N/A"}
//                                       </span>
//                                     </>
//                                   ) : (
//                                     <span
//                                       className={cn(
//                                         field.state.value &&
//                                         "text-warning",
//                                         "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
//                                         !(tab === 'player1' ? player1?.birthDate : player2?.birthDate) && "italic"
//                                       )}
//                                     >
//                                       {tab === 'player1' ? entry?.player1Entry.birthDate
//                                         ? format(
//                                           new Date(
//                                             entry.player1Entry.birthDate
//                                           ),
//                                           "PP"
//                                         )
//                                         : "N/A" : entry?.player2Entry?.birthDate
//                                         ? format(
//                                           new Date(
//                                             entry.player2Entry.birthDate
//                                           ),
//                                           "PP"
//                                         )
//                                         : "N/A"}
//                                     </span>
//                                   )}
//                                 </div>
//                               </div>
//                             </Field>
//                           )
//                         }}
//                       />
//                     </div>
//                   </div>
//                 </>
//               )}
//             </FieldSet>
//           </div>

//           <div className="w-1/3 border-l pl-6">
//             <div className="mb-6">
//               <h3 className="text-lg font-semibold mb-2">Suggested Players</h3>
//               <p className="text-sm text-muted-foreground">
//                 Based on name and birthday match from your database
//               </p>
//             </div>

//             <div className="space-y-3 max-h-[52vh] overflow-y-auto pr-2">
//               {suggestions.map((player) => (
//                 <div
//                   key={player._id}
//                   className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors bg-white shadow-sm"
//                   onClick={() => {
//                     form.setFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`, player._id);
//                     tab === 'player1' ? fetchPlayer1({ variables: { _id: player._id } }) : fetchPlayer2({ variables: { _id: player._id } });
//                   }}
//                 >
//                   <div className="flex justify-between items-start mb-3">
//                     <div>
//                       <h4 className="font-medium">{player.fullName}</h4>
//                       <div className="flex items-center gap-2 mt-1">
//                         <Badge
//                           variant="outline"
//                           className={cn(
//                             "text-xs",
//                             player.similarityScore >= 60
//                               ? "bg-green-50 text-green-700 border-green-200"
//                               : player.similarityScore >= 40
//                                 ? "bg-amber-50 text-amber-700 border-amber-200"
//                                 : "bg-blue-50 text-blue-700 border-blue-200"
//                           )}
//                         >
//                           {player.similarityScore}% match
//                         </Badge>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <div className="flex flex-wrap gap-1">
//                       {player.matchReasons.map((reason: string, index: number) => (
//                         <Badge
//                           key={index}
//                           variant="secondary"
//                           className="text-xs py-0.5"
//                         >
//                           {reason}
//                         </Badge>
//                       ))}
//                     </div>

//                     <div className="text-xs text-gray-600 space-y-1">
//                       <div className="flex items-center gap-2">
//                         <span className="font-medium">Birthday:</span>
//                         <span>{format(new Date(player.birthDate), "PP")}</span>
//                       </div>
//                       {player.email && (
//                         <div className="flex items-center gap-2">
//                           <span className="font-medium">Email:</span>
//                           <span>{player.email}</span>
//                         </div>
//                       )}
//                       {player.phoneNumber && (
//                         <div className="flex items-center gap-2">
//                           <span className="font-medium">Phone:</span>
//                           <span>{player.phoneNumber}</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
//               <div className="flex items-start gap-2">
//                 <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
//                 <div className="text-sm text-blue-800">
//                   <p className="font-medium">How it works:</p>
//                   <p className="text-xs">Click on a suggested player to auto-fill the selection. The system matches players based on name and birthday similarity.</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     return (
//       <FieldSet className="flex flex-col gap-2.5 h-[52vh] overflow-y-auto">
//         <form.Field
//           name={`is${tab === 'player1' ? 'Player1' : 'Player2'}New`}
//           children={(field) => {
//             const isInvalid =
//               field.state.meta.isTouched &&
//               !field.state.meta.isValid
//             return (
//               <Field data-invalid={isInvalid}>
//                 <div className="flex items-center py-1">
//                   <Checkbox
//                     id={field.name}
//                     name={field.name}
//                     checked={field.state.value}
//                     onBlur={field.handleBlur}
//                     onCheckedChange={(checked) =>
//                       field.handleChange(checked === true)
//                     }
//                     className="mr-2"
//                     aria-invalid={isInvalid}
//                     disabled={isLoading}
//                   />
//                   <div className="grid">
//                     <FieldLabel htmlFor={field.name}>
//                       Is New Player? ({tab === 'player1' ? 'Player 1' : 'Player 2'})
//                     </FieldLabel>
//                     <span className="text-muted-foreground text-xs">
//                       Checking this will create a new player profile.
//                     </span>
//                   </div>
//                 </div>

//                 {isInvalid && (
//                   <FieldError errors={field.state.meta.errors} />
//                 )}
//               </Field>
//             )
//           }}
//         />

//         {/* Document Selection for normal layout */}
//         {!form.getFieldValue(`is${tab === 'player1' ? 'Player1' : 'Player2'}New`) &&
//           form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) &&
//           (tab === 'player1' ? hasPlayer1DocumentsToSelect() : hasPlayer2DocumentsToSelect()) && (
//             <div className="mb-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <Label className="text-sm font-medium">Document Selection</Label>
//                   <p className="text-xs text-muted-foreground">
//                     Choose which documents to keep for {tab === 'player1' ? 'Player 1' : 'Player 2'}
//                   </p>
//                 </div>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={tab === 'player1' ? handleDocumentSelection1 : handleDocumentSelection2}
//                   disabled={isLoading}
//                 >
//                   {(tab === 'player1'
//                     ? documentSelections.player1
//                     : documentSelections.player2)
//                     ? "Edit Selection"
//                     : "Select Documents"}
//                 </Button>
//               </div>
//               {(tab === 'player1'
//                 ? documentSelections.player1
//                 : documentSelections.player2) ? (
//                 <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center">
//                       <Check className="h-4 w-4 mr-2 text-green-600" />
//                       <div>
//                         <p className="text-sm font-medium text-blue-800">
//                           Document selections saved
//                         </p>
//                         <p className="text-xs text-blue-600">
//                           {getDocumentSelectionSummary(
//                             tab === 'player1'
//                               ? documentSelections.player1
//                               : documentSelections.player2
//                           )} documents selected
//                         </p>
//                       </div>
//                     </div>

//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={tab === 'player1'
//                         ? handleDocumentSelection1
//                         : handleDocumentSelection2}
//                       className="text-xs"
//                     >
//                       Edit
//                     </Button>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
//                   <div className="flex items-center">
//                     <FileText className="h-4 w-4 mr-2 text-amber-600" />
//                     <div>
//                       <p className="text-sm font-medium text-amber-800">Document Selection Required</p>
//                       <p className="text-xs text-amber-600">
//                         Click "Select Documents" to choose which documents to keep
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//         {/* Loading indicator for suggestions - only show when not a new player */}
//         {!form.getFieldValue(`is${tab === 'player1' ? 'Player1' : 'Player2'}New`) && isLoadingSuggestions && (
//           <div className="mb-4 p-3 border rounded-md bg-gray-50">
//             <div className="flex items-center gap-2">
//               <Loader2 className="h-4 w-4 animate-spin" />
//               <span className="text-sm text-gray-600">Finding suggested players...</span>
//             </div>
//           </div>
//         )}

//         {/* Suggestions - only show when not a new player AND we have suggestions */}
//         {!form.getFieldValue(`is${tab === 'player1' ? 'Player1' : 'Player2'}New`) && hasSuggestions && (
//           <div className="mb-4">
//             <div className="flex items-center justify-between mb-2">
//               <h4 className="text-sm font-medium">Suggested Players</h4>
//               <span className="text-xs text-gray-500">
//                 Based on name and birthday match
//               </span>
//             </div>
//             <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
//               {suggestions.map((player) => (
//                 <div
//                   key={player._id}
//                   className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
//                   onClick={() => {
//                     form.setFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`, player._id);
//                     tab === 'player1' ? fetchPlayer1({ variables: { _id: player._id } }) : fetchPlayer2({ variables: { _id: player._id } });
//                   }}
//                 >
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <div className="flex items-center gap-2">
//                         <span className="font-medium text-sm">
//                           {player.fullName}
//                         </span>
//                         <Badge
//                           variant="outline"
//                           className={cn(
//                             "text-xs",
//                             player.similarityScore >= 60
//                               ? "bg-green-50 text-green-700 border-green-200"
//                               : player.similarityScore >= 40
//                                 ? "bg-amber-50 text-amber-700 border-amber-200"
//                                 : "bg-blue-50 text-blue-700 border-blue-200"
//                           )}
//                         >
//                           {player.similarityScore}% match
//                         </Badge>
//                       </div>
//                       <div className="mt-1 space-y-1">
//                         <div className="flex flex-wrap gap-1">
//                           {player.matchReasons.map((reason: string, index: number) => (
//                             <Badge
//                               key={index}
//                               variant="secondary"
//                               className="text-xs py-0.5"
//                             >
//                               {reason}
//                             </Badge>
//                           ))}
//                         </div>
//                         <div className="text-xs text-gray-500 space-y-0.5">
//                           <div>Birthday: {format(new Date(player.birthDate), "PP")}</div>
//                           {player.email && <div>Email: {player.email}</div>}
//                           {player.phoneNumber && <div>Phone: {player.phoneNumber}</div>}
//                         </div>
//                       </div>
//                     </div>
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         form.setFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`, player._id);
//                         tab === 'player1' ? fetchPlayer1({ variables: { _id: player._id } }) : fetchPlayer2({ variables: { _id: player._id } });
//                       }}
//                     >
//                       Select
//                     </Button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
//               <AlertCircle className="h-3 w-3" />
//               <span>Click on a suggestion to auto-fill the player selection below</span>
//             </div>
//           </div>
//         )}

//         {!form.getFieldValue(`is${tab === 'player1' ? 'Player1' : 'Player2'}New`) && (
//           <>
//             <form.Field
//               name={`connected${tab === 'player1' ? 'Player1' : 'Player2'}`}
//               children={(field) => {
//                 const isInvalid =
//                   field.state.meta.isTouched &&
//                   !field.state.meta.isValid
//                 return (
//                   <Field data-invalid={isInvalid}>
//                     <FieldLabel htmlFor={field.name}>
//                       Connected {tab === 'player1' ? 'Player 1' : 'Player 2'}
//                     </FieldLabel>
//                     <Popover
//                       open={tab === 'player1' ? openPlayers1 : openPlayers2}
//                       onOpenChange={tab === 'player1' ? setOpenPlayers1 : setOpenPlayers2}
//                     >
//                       <PopoverTrigger asChild>
//                         <Button
//                           id={field.name}
//                           name={field.name}
//                           disabled={optionsLoading}
//                           aria-expanded={tab === 'player1' ? openPlayers1 : openPlayers2}
//                           onBlur={field.handleBlur}
//                           variant="outline"
//                           role="combobox"
//                           aria-invalid={isInvalid}
//                           className={cn(
//                             "w-full justify-between font-normal capitalize -mt-2",
//                             !field.state.value &&
//                             "text-muted-foreground"
//                           )}
//                           type="button"
//                         >
//                           {field.state.value
//                             ? players.find(
//                               (o: {
//                                 value: string
//                                 label: string
//                               }) =>
//                                 o.value === field.state.value
//                             )?.label
//                             : `Select ${tab === 'player1' ? 'Player 1' : 'Player 2'}`}
//                           <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                         </Button>
//                       </PopoverTrigger>
//                       <PopoverContent className="w-full p-0">
//                         <Command
//                           filter={(value, search) =>
//                             players
//                               .find(
//                                 (t: {
//                                   value: string
//                                   label: string
//                                 }) => t.value === value
//                               )
//                               ?.label.toLowerCase()
//                               .includes(search.toLowerCase())
//                               ? 1
//                               : 0
//                           }
//                         >
//                           <CommandInput placeholder={`Select ${tab === 'player1' ? 'Player 1' : 'Player 2'}`} />
//                           <CommandList className="max-h-72 overflow-y-auto">
//                             <CommandGroup>
//                               <Label className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
//                                 Players
//                               </Label>
//                               {players?.map(
//                                 (o: {
//                                   value: string
//                                   label: string
//                                   hasEarlyBird: boolean
//                                 }) => (
//                                   <CommandItem
//                                     key={o.value}
//                                     value={o.value}
//                                     onSelect={(v) => {
//                                       field.handleChange(
//                                         v.toString()
//                                       )
//                                       tab === 'player1' ? setOpenPlayers1(false) : setOpenPlayers2(false)
//                                     }}
//                                     className="capitalize"
//                                   >
//                                     <CheckIcon
//                                       className={cn(
//                                         "h-4 w-4",
//                                         field.state.value ===
//                                           o.value
//                                           ? "opacity-100"
//                                           : "opacity-0"
//                                       )}
//                                     />
//                                     {o.label}
//                                   </CommandItem>
//                                 )
//                               )}
//                             </CommandGroup>
//                             <CommandEmpty>
//                               No players found.
//                             </CommandEmpty>
//                           </CommandList>
//                         </Command>
//                       </PopoverContent>
//                     </Popover>
//                     {isInvalid && (
//                       <FieldError
//                         errors={field.state.meta.errors}
//                       />
//                     )}
//                   </Field>
//                 )
//               }}
//             />
//             <Separator />
//             <div className="flex flex-col">
//               <div className="col-span-2">
//                 <Label>Migrate Data</Label>
//                 <span className="text-xs text-muted-foreground">
//                   Checked fields will update the player database with entry data.
//                 </span>
//               </div>
//               <div className="flex items-center w-full gap-2">
//                 <div className="h-full flex items-center justify-center">
//                   <Checkbox
//                     disabled={
//                       isLoading || !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
//                     }
//                     onCheckedChange={(checked) => {
//                       form.setFieldValue(`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data`, {
//                         firstName: checked === true,
//                         middleName: checked === true,
//                         lastName: checked === true,
//                         suffix: checked === true,
//                         birthDate: checked === true,
//                         phoneNumber: checked === true,
//                         email: checked === true,
//                         validDocuments: checked === true,
//                       })
//                       if (checked) {
//                         // If checking all, show document selection dialog
//                         setTimeout(() => {
//                           tab === 'player1' ? handleDocumentSelection1() : handleDocumentSelection2();
//                         }, 100);
//                       }
//                     }}
//                   />
//                 </div>
//                 <div className="text-xs grid grid-cols-5 col-span-2 h-full w-full">
//                   <div className="px-2 h-full border w-full flex items-center justify-center min-h-8"></div>
//                   <span
//                     className={cn(
//                       "px-2 h-full border w-full flex items-center justify-center",
//                       form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
//                         ? "col-span-2"
//                         : "hidden"
//                     )}
//                   >
//                     From Database (Current)
//                   </span>{" "}
//                   <span
//                     className={cn(
//                       "px-2 h-full border w-full flex items-center justify-center",
//                       form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
//                         ? "col-span-2"
//                         : "col-span-4"
//                     )}
//                   >
//                     From Entry (New)
//                   </span>
//                 </div>
//               </div>

//               {/* Migration Fields */}
//               <div>
//                 <form.Field
//                   name={`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data.firstName`}
//                   children={(field) => {
//                     const isInvalid =
//                       field.state.meta.isTouched &&
//                       !field.state.meta.isValid
//                     return (
//                       <Field>
//                         <div className="flex items-center w-full gap-2">
//                           <div className="h-full flex items-center justify-center">
//                             <Checkbox
//                               id={field.name}
//                               name={field.name}
//                               checked={field.state.value}
//                               onBlur={field.handleBlur}
//                               onCheckedChange={(checked) =>
//                                 field.handleChange(
//                                   checked === true
//                                 )
//                               }
//                               aria-invalid={isInvalid}
//                               disabled={
//                                 isLoading ||
//                                 !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
//                               }
//                             />
//                           </div>
//                           <div className="text-xs grid grid-cols-5 col-span-2 min-h-8 w-full">
//                             <span className="px-2 h-full border w-full flex items-center justify-center py-1 text-center">
//                               First Name
//                             </span>
//                             {form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) ? (
//                               <>
//                                 <span
//                                   className={cn(
//                                     !field.state.value &&
//                                     "text-success bg-success/5",
//                                     "col-span-2 px-2 h-full border w-full flex items-center justify-start py-1"
//                                   )}
//                                 >
//                                   {tab === 'player1' ? player1?.firstName : player2?.firstName}
//                                 </span>{" "}
//                                 <span
//                                   className={cn(
//                                     field.state.value &&
//                                     "text-warning bg-warning/5",
//                                     "col-span-2 px-2 h-full border w-full flex items-center justify-start py-1"
//                                   )}
//                                 >
//                                   {tab === 'player1' ? entry?.player1Entry.firstName : entry?.player2Entry?.firstName}
//                                 </span>
//                               </>
//                             ) : (
//                               <span
//                                 className={cn(
//                                   field.state.value &&
//                                   "text-warning",
//                                   "col-span-4 px-2 h-full border w-full flex items-center justify-start"
//                                 )}
//                               >
//                                 {tab === 'player1' ? entry?.player1Entry.firstName : entry?.player2Entry?.firstName}
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                       </Field>
//                     )
//                   }}
//                 />
//               </div>
//               <div>
//                 <form.Field
//                   name={`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data.middleName`}
//                   children={(field) => {
//                     const isInvalid =
//                       field.state.meta.isTouched &&
//                       !field.state.meta.isValid
//                     return (
//                       <Field>
//                         <div className="flex items-center w-full gap-2">
//                           <div className="h-full flex items-center justify-center text-center">
//                             <Checkbox
//                               id={field.name}
//                               name={field.name}
//                               checked={field.state.value}
//                               onBlur={field.handleBlur}
//                               onCheckedChange={(checked) =>
//                                 field.handleChange(
//                                   checked === true
//                                 )
//                               }
//                               aria-invalid={isInvalid}
//                               disabled={
//                                 isLoading ||
//                                 !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
//                               }
//                             />
//                           </div>
//                           <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
//                             <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
//                               Middle Name
//                             </span>
//                             {form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) ? (
//                               <>
//                                 <span
//                                   className={cn(
//                                     !field.state.value &&
//                                     "text-success bg-success/5",
//                                     "col-span-2 px-2 border w-full flex items-center justify-start py-1",
//                                     !(tab === 'player1' ? player1?.middleName : player2?.middleName) &&
//                                     "italic"
//                                   )}
//                                 >
//                                   {tab === 'player1' ? player1?.middleName || "N/A" : player2?.middleName || "N/A"}
//                                 </span>{" "}
//                                 <span
//                                   className={cn(
//                                     field.state.value &&
//                                     "text-warning bg-warning/5",
//                                     "col-span-2 px-2 border w-full flex items-center justify-start py-1",
//                                     !(tab === 'player1' ? player1?.middleName : player2?.middleName) &&
//                                     "italic"
//                                   )}
//                                 >
//                                   {tab === 'player1' ? entry?.player1Entry.middleName || "N/A" : entry?.player2Entry?.middleName || "N/A"}
//                                 </span>
//                               </>
//                             ) : (
//                               <span
//                                 className={cn(
//                                   field.state.value &&
//                                   "text-warning",
//                                   "col-span-4 px-2 border w-full flex items-center justify-start py-1",
//                                   !(tab === 'player1' ? player1?.middleName : player2?.middleName) && "italic"
//                                 )}
//                               >
//                                 {tab === 'player1' ? entry?.player1Entry.middleName || "N/A" : entry?.player2Entry?.middleName || "N/A"}
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                       </Field>
//                     )
//                   }}
//                 />
//               </div>
//               <div>
//                 <form.Field
//                   name={`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data.lastName`}
//                   children={(field) => {
//                     const isInvalid =
//                       field.state.meta.isTouched &&
//                       !field.state.meta.isValid
//                     return (
//                       <Field>
//                         <div className="flex items-center w-full gap-2">
//                           <div className="flex items-center justify-center">
//                             <Checkbox
//                               id={field.name}
//                               name={field.name}
//                               checked={field.state.value}
//                               onBlur={field.handleBlur}
//                               onCheckedChange={(checked) =>
//                                 field.handleChange(
//                                   checked === true
//                                 )
//                               }
//                               aria-invalid={isInvalid}
//                               disabled={
//                                 isLoading ||
//                                 !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
//                               }
//                             />
//                           </div>
//                           <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
//                             <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
//                               Last Name
//                             </span>
//                             {form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) ? (
//                               <>
//                                 <span
//                                   className={cn(
//                                     !field.state.value &&
//                                     "text-success bg-success/5",
//                                     "col-span-2 px-2 border w-full flex items-center justify-start py-1",
//                                     !(tab === 'player1' ? player1?.lastName : player2?.lastName) && "italic"
//                                   )}
//                                 >
//                                   {tab === 'player1' ? player1?.lastName || "N/A" : player2?.lastName || "N/A"}
//                                 </span>{" "}
//                                 <span
//                                   className={cn(
//                                     field.state.value &&
//                                     "text-warning bg-warning/5",
//                                     "col-span-2 px-2 border w-full flex items-center justify-start py-1",
//                                     !(tab === 'player1' ? player1?.lastName : player2?.lastName) && "italic"
//                                   )}
//                                 >
//                                   {tab === 'player1' ? entry?.player1Entry.lastName || "N/A" : entry?.player2Entry?.lastName || "N/A"}
//                                 </span>
//                               </>
//                             ) : (
//                               <span
//                                 className={cn(
//                                   field.state.value &&
//                                   "text-warning",
//                                   "col-span-4 px-2 border w-full flex items-center justify-start py-1",
//                                   !(tab === 'player1' ? player1?.lastName : player2?.lastName) && "italic"
//                                 )}
//                               >
//                                 {tab === 'player1' ? entry?.player1Entry.lastName || "N/A" : entry?.player2Entry?.lastName || "N/A"}
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                       </Field>
//                     )
//                   }}
//                 />
//               </div>
//               <div>
//                 <form.Field
//                   name={`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data.suffix`}
//                   children={(field) => {
//                     const isInvalid =
//                       field.state.meta.isTouched &&
//                       !field.state.meta.isValid
//                     return (
//                       <Field>
//                         <div className="flex items-center w-full gap-2">
//                           <div className="flex items-center justify-center">
//                             <Checkbox
//                               id={field.name}
//                               name={field.name}
//                               checked={field.state.value}
//                               onBlur={field.handleBlur}
//                               onCheckedChange={(checked) =>
//                                 field.handleChange(
//                                   checked === true
//                                 )
//                               }
//                               aria-invalid={isInvalid}
//                               disabled={
//                                 isLoading ||
//                                 !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
//                               }
//                             />
//                           </div>
//                           <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
//                             <span className="px-2 border w-full flex items-center py-1 justify-center text-center">
//                               Ext.
//                             </span>
//                             {form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) ? (
//                               <>
//                                 <span
//                                   className={cn(
//                                     !field.state.value &&
//                                     "text-success bg-success/5",
//                                     "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
//                                     !(tab === 'player1' ? player1?.suffix : player2?.suffix) && "italic"
//                                   )}
//                                 >
//                                   {tab === 'player1' ? player1?.suffix || "N/A" : player2?.suffix || "N/A"}
//                                 </span>{" "}
//                                 <span
//                                   className={cn(
//                                     field.state.value &&
//                                     "text-warning bg-warning/5",
//                                     "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
//                                     !(tab === 'player1' ? player1?.suffix : player2?.suffix) && "italic"
//                                   )}
//                                 >
//                                   {tab === 'player1' ? entry?.player1Entry.suffix || "N/A" : entry?.player2Entry?.suffix || "N/A"}
//                                 </span>
//                               </>
//                             ) : (
//                               <span
//                                 className={cn(
//                                   field.state.value &&
//                                   "text-warning",
//                                   "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
//                                   !(tab === 'player1' ? player1?.suffix : player2?.suffix) && "italic"
//                                 )}
//                               >
//                                 {tab === 'player1' ? entry?.player1Entry.suffix || "N/A" : entry?.player2Entry?.suffix || "N/A"}
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                       </Field>
//                     )
//                   }}
//                 />
//               </div>
//               <div>
//                 <form.Field
//                   name={`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data.email`}
//                   children={(field) => {
//                     const isInvalid =
//                       field.state.meta.isTouched &&
//                       !field.state.meta.isValid
//                     return (
//                       <Field>
//                         <div className="flex items-center w-full gap-2">
//                           <div className="flex items-center justify-center">
//                             <Checkbox
//                               id={field.name}
//                               name={field.name}
//                               checked={field.state.value}
//                               onBlur={field.handleBlur}
//                               onCheckedChange={(checked) =>
//                                 field.handleChange(
//                                   checked === true
//                                 )
//                               }
//                               aria-invalid={isInvalid}
//                               disabled={
//                                 isLoading ||
//                                 !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
//                               }
//                             />
//                           </div>
//                           <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
//                             <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
//                               Email
//                             </span>
//                             {form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) ? (
//                               <>
//                                 <span
//                                   className={cn(
//                                     !field.state.value &&
//                                     "text-success bg-success/5",
//                                     "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
//                                     !(tab === 'player1' ? player1?.email : player2?.email) && "italic"
//                                   )}
//                                 >
//                                   {tab === 'player1' ? player1?.email || "N/A" : player2?.email || "N/A"}
//                                 </span>{" "}
//                                 <span
//                                   className={cn(
//                                     field.state.value &&
//                                     "text-warning bg-warning/5",
//                                     "col-span-2 px-2 border w-full flex items-center py-1 justify-start break-all whitespace-normal",
//                                     !(tab === 'player1' ? player1?.email : player2?.email) && "italic"
//                                   )}
//                                 >
//                                   {tab === 'player1' ? entry?.player1Entry.email || "N/A" : entry?.player2Entry?.email || "N/A"}
//                                 </span>
//                               </>
//                             ) : (
//                               <span
//                                 className={cn(
//                                   field.state.value &&
//                                   "text-warning",
//                                   "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
//                                   !(tab === 'player1' ? player1?.email : player2?.email) && "italic"
//                                 )}
//                               >
//                                 {tab === 'player1' ? entry?.player1Entry.email || "N/A" : entry?.player2Entry?.email || "N/A"}
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                       </Field>
//                     )
//                   }}
//                 />
//               </div>
//               <div>
//                 <form.Field
//                   name={`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data.phoneNumber`}
//                   children={(field) => {
//                     const isInvalid =
//                       field.state.meta.isTouched &&
//                       !field.state.meta.isValid
//                     return (
//                       <Field>
//                         <div className="flex items-center w-full gap-2">
//                           <div className="flex items-center justify-center">
//                             <Checkbox
//                               id={field.name}
//                               name={field.name}
//                               checked={field.state.value}
//                               onBlur={field.handleBlur}
//                               onCheckedChange={(checked) =>
//                                 field.handleChange(
//                                   checked === true
//                                 )
//                               }
//                               aria-invalid={isInvalid}
//                               disabled={
//                                 isLoading ||
//                                 !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
//                               }
//                             />
//                           </div>
//                           <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
//                             <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
//                               Phone No.
//                             </span>
//                             {form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) ? (
//                               <>
//                                 <span
//                                   className={cn(
//                                     !field.state.value &&
//                                     "text-success bg-success/5",
//                                     "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
//                                     !(tab === 'player1' ? player1?.phoneNumber : player2?.phoneNumber) &&
//                                     "italic"
//                                   )}
//                                 >
//                                   {tab === 'player1' ? player1?.phoneNumber || "N/A" : player2?.phoneNumber || "N/A"}
//                                 </span>{" "}
//                                 <span
//                                   className={cn(
//                                     field.state.value &&
//                                     "text-warning bg-warning/5",
//                                     "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
//                                     !(tab === 'player1' ? player1?.phoneNumber : player2?.phoneNumber) &&
//                                     "italic"
//                                   )}
//                                 >
//                                   {tab === 'player1' ? entry?.player1Entry.phoneNumber || "N/A" : entry?.player2Entry?.phoneNumber || "N/A"}
//                                 </span>
//                               </>
//                             ) : (
//                               <span
//                                 className={cn(
//                                   field.state.value &&
//                                   "text-warning",
//                                   "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
//                                   !(tab === 'player1' ? player1?.phoneNumber : player2?.phoneNumber) &&
//                                   "italic"
//                                 )}
//                               >
//                                 {tab === 'player1' ? entry?.player1Entry.phoneNumber || "N/A" : entry?.player2Entry?.phoneNumber || "N/A"}
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                       </Field>
//                     )
//                   }}
//                 />
//               </div>
//               <div>
//                 <form.Field
//                   name={`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data.birthDate`}
//                   children={(field) => {
//                     const isInvalid =
//                       field.state.meta.isTouched &&
//                       !field.state.meta.isValid
//                     return (
//                       <Field>
//                         <div className="flex items-center w-full gap-2">
//                           <div className="flex items-center justify-center">
//                             <Checkbox
//                               id={field.name}
//                               name={field.name}
//                               checked={field.state.value}
//                               onBlur={field.handleBlur}
//                               onCheckedChange={(checked) =>
//                                 field.handleChange(
//                                   checked === true
//                                 )
//                               }
//                               aria-invalid={isInvalid}
//                               disabled={
//                                 isLoading ||
//                                 !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
//                               }
//                             />
//                           </div>
//                           <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
//                             <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
//                               Birthday
//                             </span>
//                             {form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) ? (
//                               <>
//                                 <span
//                                   className={cn(
//                                     !field.state.value &&
//                                     "text-success bg-success/5",
//                                     "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
//                                     !(tab === 'player1' ? player1?.birthDate : player2?.birthDate) &&
//                                     "italic"
//                                   )}
//                                 >
//                                   {tab === 'player1' ? player1?.birthDate
//                                     ? format(
//                                       new Date(
//                                         player1.birthDate
//                                       ),
//                                       "PP"
//                                     )
//                                     : "N/A" : player2?.birthDate
//                                     ? format(
//                                       new Date(
//                                         player2.birthDate
//                                       ),
//                                       "PP"
//                                     )
//                                     : "N/A"}
//                                 </span>{" "}
//                                 <span
//                                   className={cn(
//                                     field.state.value &&
//                                     "text-warning bg-warning/5",
//                                     "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
//                                     !(tab === 'player1' ? player1?.birthDate : player2?.birthDate) &&
//                                     "italic"
//                                   )}
//                                 >
//                                   {tab === 'player1' ? entry?.player1Entry.birthDate
//                                     ? format(
//                                       new Date(
//                                         entry.player1Entry.birthDate
//                                       ),
//                                       "PP"
//                                     )
//                                     : "N/A" : entry?.player2Entry?.birthDate
//                                     ? format(
//                                       new Date(
//                                         entry.player2Entry.birthDate
//                                       ),
//                                       "PP"
//                                     )
//                                     : "N/A"}
//                                 </span>
//                               </>
//                             ) : (
//                               <span
//                                 className={cn(
//                                   field.state.value &&
//                                   "text-warning",
//                                   "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
//                                   !(tab === 'player1' ? player1?.birthDate : player2?.birthDate) && "italic"
//                                 )}
//                               >
//                                 {tab === 'player1' ? entry?.player1Entry.birthDate
//                                   ? format(
//                                     new Date(
//                                       entry.player1Entry.birthDate
//                                     ),
//                                     "PP"
//                                   )
//                                   : "N/A" : entry?.player2Entry?.birthDate
//                                   ? format(
//                                     new Date(
//                                       entry.player2Entry.birthDate
//                                     ),
//                                     "PP"
//                                   )
//                                   : "N/A"}
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                       </Field>
//                     )
//                   }}
//                 />
//               </div>
//             </div>
//           </>
//         )}
//       </FieldSet>
//     );
//   };

//   return (
//     <>
//       <Dialog open={open} onOpenChange={setOpen}>
//         <form>
//           <DialogTrigger asChild>
//             <DropdownMenuItem
//               className="text-info focus:bg-info/10 focus:text-info"
//               onSelect={(e) => e.preventDefault()}
//             >
//               {props.title}
//             </DropdownMenuItem>
//           </DialogTrigger>
//           <DialogContent
//             key={`dialog-${form.getFieldValue('isPlayer1New')}-${form.getFieldValue('isPlayer2New')}`}
//             onOpenAutoFocus={(e) => e.preventDefault()}
//             onInteractOutside={(e) => e.preventDefault()}
//             showCloseButton={false}
//             className={cn(
//               "max-w-xl!",
//               (!form.getFieldValue('isPlayer1New') && suggestedPlayers1.length > 0) ||
//                 (!form.getFieldValue('isPlayer2New') && suggestedPlayers2.length > 0)
//                 ? "max-w-4xl!"
//                 : "max-w-4xl!"
//             )}
//           >
//             <DialogHeader>
//               <DialogTitle>Player Assignment: {entry?.entryNumber}</DialogTitle>
//               <DialogDescription>
//                 Assign players to this entry for streamlined data management.
//               </DialogDescription>
//             </DialogHeader>
//             <form
//               className="-mt-2 mb-2"
//               id="assign-players-form"
//               onSubmit={(e) => {
//                 e.preventDefault()
//                 handleFormSubmit()
//               }}
//             >
//               <form.Subscribe
//                 selector={(state) => state.values}
//                 children={(state) => (
//                   <Tabs defaultValue="player1">
//                     <TabsList
//                       className={cn(
//                         entry?.player2Entry ? "flex" : "hidden",
//                         "w-full"
//                       )}
//                     >
//                       <TabsTrigger value="player1">Player 1</TabsTrigger>
//                       {!!(entry?.player2Entry || entry?.connectedPlayer2) && (
//                         <TabsTrigger value="player2">Player 2</TabsTrigger>
//                       )}
//                     </TabsList>
//                     <TabsContent value="player1">
//                       {renderTabContent('player1')}
//                     </TabsContent>
//                     <TabsContent value="player2">
//                       {renderTabContent('player2')}
//                     </TabsContent>
//                   </Tabs>
//                 )}
//               />
//             </form>
//             <DialogFooter>
//               <div className="flex gap-2">
//                 <Button variant="outline" onClick={onClose}>
//                   Cancel
//                 </Button>
//                 <Button
//                   className="w-20"
//                   loading={isLoading || isPending}
//                   onClick={handleFormSubmit}
//                   type="button"
//                 >
//                   Assign
//                 </Button>
//               </div>
//             </DialogFooter>
//           </DialogContent>
//         </form>
//       </Dialog>

//       <DocumentSelectionDialog
//         open={showDocumentSelection1}
//         onOpenChange={setShowDocumentSelection1}
//         onSave={handleSaveDocumentSelections1}
//         existingDocuments={getPlayer1ExistingDocuments()}
//         newDocuments={getPlayer1NewDocuments()}
//         playerName="Player 1"
//         isLoading={isLoading}
//       />

//       <DocumentSelectionDialog
//         open={showDocumentSelection2}
//         onOpenChange={setShowDocumentSelection2}
//         onSave={handleSaveDocumentSelections2}
//         existingDocuments={getPlayer2ExistingDocuments()}
//         newDocuments={getPlayer2NewDocuments()}
//         playerName="Player 2"
//         isLoading={isLoading}
//       />
//     </>
//   )
// }

// export default AssignDialog


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
import { CheckIcon, ChevronsUpDownIcon, FileText, Eye, Check, X, Maximize, Sparkles, AlertCircle, Loader2, Save, ExternalLink, ChevronLeft, File, Download, Maximize2, ReceiptEuroIcon } from "lucide-react"
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

const SUGGEST_PLAYERS = gql`
  query SuggestPlayers($input: SuggestPlayersInput!) {
    suggestPlayers(input: $input) {
      _id
      fullName
      firstName
      middleName
      lastName
      suffix
      birthDate
      email
      phoneNumber
      similarityScore
      matchReasons
    }
  }
`

type SuggestPlayer = {
  _id: string;
  fullName: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  birthDate: string;
  email?: string;
  phoneNumber?: string;
  similarityScore: number;
  matchReasons: string[];
};

type SuggestPlayersResponse = {
  suggestPlayers: SuggestPlayer[];
}

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
    selectedSource: 'existing' | 'new' | ''
    existingDoc?: DocumentInfo;
    newDoc?: DocumentInfo;
  };
};

const extractFileIdFromUrl = (url: string): string | null => {
  if (!url) return null;

  // Various Google Drive URL patterns
  const patterns = [
    // Standard file URL: https://drive.google.com/file/d/FILE_ID/view
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,

    // Open URL: https://drive.google.com/open?id=FILE_ID
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,

    // URL with /u/0/: https://drive.google.com/u/0/uc?id=FILE_ID&export=download
    /drive\.google\.com\/.*[?&]id=([a-zA-Z0-9_-]+)/,

    // Direct download link
    /drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/,

    // Share link: https://drive.google.com/file/d/FILE_ID/edit?usp=sharing
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
      // Process based on document selection
      for (const [documentType, selection] of Object.entries(documentSelection)) {
        const { selectedSource, existingDoc, newDoc } = selection;

        if (selectedSource === 'existing' && existingDoc) {
          // Keep existing document - no action needed for Google Drive
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
            // Replace existing document with new one
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

                  // Fallback: Try to move new document
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
            // No existing document, just move the new one
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
      // Fallback: Old behavior - replace all documents
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
          // No existing document of this type, just move the new one
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

    // Process Player 1 documents
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
        // For new player, just move documents
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

    // Process Player 2 documents
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
        // For new player, just move documents
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

      const allDocumentTypes = [
        ...existingDocuments.map(doc => doc.documentType),
        ...newDocuments.map(doc => doc.documentType)
      ];

      const uniqueDocumentTypes = Array.from(new Set(allDocumentTypes));

      uniqueDocumentTypes.forEach(documentType => {
        const existingDoc = existingDocuments.find(doc => doc.documentType === documentType);
        const newDoc = newDocuments.find(doc => doc.documentType === documentType);

        if (existingDoc || newDoc) {
          initialSelections[documentType] = {
            selectedSource: '',
            existingDoc,
            newDoc
          };
        }
      });

      setSelections(initialSelections);
    } else {
      setSelections({});
    }
  }, [open, existingDocuments, newDocuments]);

  const handleSave = () => {
    const allSelected = Object.values(selections).every(
      selection => selection.selectedSource !== ''
    );

    if (!allSelected) {
      toast.error('Please make a selection for all document types before saving');
      return;
    }

    onSave(selections);
    onOpenChange(false);
  };

  const getFileType = (url: string): string => {
    if (!url) return 'unknown';

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

  const renderDocumentPreview = (doc: DocumentInfo, source: 'existing' | 'new', documentType: string) => {
    const fileType = getFileType(doc.documentURL);
    const isGoogleDrive = fileType === 'googleDrive';
    const previewUrl = isGoogleDrive ? getGoogleDrivePreviewUrl(doc.documentURL) : doc.documentURL;

    return (
      <div className="relative w-110 h-95 rounded-lg overflow-hidden bg-gray-50 border">
        {fileType === 'image' ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={doc.documentURL}
              alt={documentType}
              className="max-w-full max-h-full object-contain"
              onClick={() => setExpandedPreview({
                url: doc.documentURL,
                type: documentType,
                source
              })}
            />
          </div>
        ) : isGoogleDrive ? (
          <div className="w-full h-full p-4">
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              title={`${source === 'existing' ? 'Existing' : 'New'}: ${documentType}`}
              sandbox="allow-same-origin allow-scripts"
              loading="lazy"
              allowFullScreen
            />
          </div>
        ) : fileType === 'pdf' ? (
          <div className="w-full h-full p-4">
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(doc.documentURL)}&embedded=true`}
              className="w-full h-full border-0"
              title={`PDF: ${documentType}`}
              loading="lazy"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <File className="h-16 w-16 text-blue-500 mb-2" />
            <span className="text-sm font-medium text-gray-700 text-center">
              {documentType}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl! max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-lg">Select Documents for {playerName}</DialogTitle>
          <DialogDescription className="text-sm">
            Choose which version to keep for each document type
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
                  <h3 className="font-semibold text-md">{expandedPreview.type}</h3>
                  <p className="text-sm text-gray-500">
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
              <Button
                variant="outline"
                onClick={() => setExpandedPreview(null)}
                className="w-full"
              >
                Back to Selection
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="h-[60vh] grid grid-cols-2 gap-6 overflow-y-auto pr-2">
              {Object.entries(selections).map(([documentType, selection]) => {
                const documentTypeName = documentType.replaceAll("_", " ");
                const hasExisting = !!selection.existingDoc;
                const hasNew = !!selection.newDoc;

                return (
                  <div key={documentType} className="space-y-4 p-4 border rounded-lg bg-gray-50/50">
                    <h3 className="font-semibold text-lg text-center">
                      {documentTypeName}
                    </h3>

                    <RadioGroup
                      name={documentType}
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
                      className="grid grid-cols-2 gap-6"
                    >
                      {hasExisting && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-center">
                            <RadioGroupItem
                              value="existing"
                              id={`${documentType}-existing`}
                              className="h-5 w-5"
                            />
                            <Label
                              htmlFor={`${documentType}-existing`}
                              className="ml-2 cursor-pointer font-medium"
                            >
                              Existing
                            </Label>
                          </div>
                          {renderDocumentPreview(
                            selection.existingDoc!,
                            'existing',
                            documentTypeName
                          )}
                        </div>
                      )}

                      {hasNew && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-center">
                            <RadioGroupItem
                              value="new"
                              id={`${documentType}-new`}
                              className="h-5 w-5"
                            />
                            <Label
                              htmlFor={`${documentType}-new`}
                              className="ml-2 cursor-pointer font-medium"
                            >
                              New
                            </Label>
                          </div>
                          {renderDocumentPreview(
                            selection.newDoc!,
                            'new',
                            documentTypeName
                          )}
                        </div>
                      )}
                    </RadioGroup>

                    {/* Selection Status */}
                    <div className="text-sm text-center pt-3">
                      {selection.selectedSource === 'existing' && selection.existingDoc ? (
                        <p className="text-green-800 bg-green-50 p-2 rounded">
                          <Check className="h-4 w-4 inline mr-2" />
                          <span>Existing will be kept</span>
                        </p>
                      ) : selection.selectedSource === 'new' && selection.newDoc ? (
                        <p className={cn(
                          "p-2 rounded",
                          selection.existingDoc
                            ? "text-amber-800 bg-amber-50"
                            : "text-blue-800 bg-blue-50"
                        )}>
                          {selection.existingDoc ? (
                            <>
                              <AlertCircle className="h-4 w-4 inline mr-2" />
                              <span>New will replace existing</span>
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 inline mr-2" />
                              <span>New will be added</span>
                            </>
                          )}
                        </p>
                      ) : (
                        <p className="text-gray-600 bg-gray-50 p-2 rounded">
                          <AlertCircle className="h-4 w-4 inline mr-2" />
                          <span>Please select an option</span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {Object.keys(selections).length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <FileText className="h-20 w-20 mx-auto text-gray-300 mb-5" />
                  <p className="text-xl text-gray-600 font-medium">No documents to select</p>
                  <p className="text-base text-gray-500 mt-2 max-w-md mx-auto">
                    There are no documents that need selection for this player.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="px-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
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
  const [suggestedPlayers1, setSuggestedPlayers1] = useState<SuggestPlayer[]>([])
  const [suggestedPlayers2, setSuggestedPlayers2] = useState<SuggestPlayer[]>([])
  const [isLoadingSuggestions1, setIsLoadingSuggestions1] = useState(false)
  const [isLoadingSuggestions2, setIsLoadingSuggestions2] = useState(false)

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
  const [fetchSuggestions1, { loading: suggestions1Loading }] = useLazyQuery<SuggestPlayersResponse>(
    SUGGEST_PLAYERS
  )

  const [fetchSuggestions2, { loading: suggestions2Loading }] = useLazyQuery<SuggestPlayersResponse>(
    SUGGEST_PLAYERS
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
        validDocuments: false, // Add this back for server-side handling
      },
      migratePlayer2Data: {
        firstName: false,
        middleName: false,
        lastName: false,
        suffix: false,
        birthDate: false,
        phoneNumber: false,
        email: false,
        validDocuments: false, // Add this back for server-side handling
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
          // Clear document selections for player 1
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
          // Clear document selections for player 2
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

          // Prepare the payload with document selections
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

  const fetchPlayer1Suggestions = async () => {
    if (!entry?.player1Entry) {
      console.log("No player1Entry found");
      return;
    }

    const { firstName, lastName, birthDate } = entry.player1Entry;
    console.log("Player 1 Entry Data:", { firstName, lastName, birthDate });

    if (!firstName || !lastName || !birthDate) {
      console.log("Missing required fields for Player 1");
      return;
    }

    setIsLoadingSuggestions1(true);
    try {
      console.log("Fetching suggestions for Player 1...");
      const { data, error } = await fetchSuggestions1({
        variables: {
          input: {
            firstName,
            lastName,
            birthDate: birthDate instanceof Date ? birthDate.toISOString() : birthDate
          }
        }
      })

      console.log("Player 1 Suggestions Response:", { data, error });
      console.log("Suggestions data:", data?.suggestPlayers);
      setSuggestedPlayers1(data?.suggestPlayers || []);
    } catch (error) {
      console.error("Error fetching suggestions for Player 1:", error);
    } finally {
      setIsLoadingSuggestions1(false);
    }
  }

  const fetchPlayer2Suggestions = async () => {
    if (!entry?.player2Entry) return;

    const { firstName, lastName, birthDate } = entry.player2Entry;
    if (!firstName || !lastName || !birthDate) return;

    setIsLoadingSuggestions2(true);
    try {
      const { data } = await fetchSuggestions2({
        variables: {
          input: {
            firstName,
            lastName,
            birthDate
          }
        }
      });
      setSuggestedPlayers2(data?.suggestPlayers || []);
    } catch (error) {
      console.error("Error fetching suggestions for Player 2:", error);
    } finally {
      setIsLoadingSuggestions2(false);
    }
  }

  useEffect(() => {
    if (open) {
      if (entry?.player1Entry) {
        fetchPlayer1Suggestions();
      }
      if (entry?.player2Entry) {
        fetchPlayer2Suggestions();
      }
    }
  }, [open, entry?.player1Entry, entry?.player2Entry]);

  const onClose = () => {
    form.reset()
    setDocumentSelections({})
    setSuggestedPlayers1([])
    setSuggestedPlayers2([])
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
    // Update the form value to indicate documents will be migrated
    form.setFieldValue("migratePlayer1Data.validDocuments", true);
    toast.success('Document selections saved for Player 1', {
      duration: 3000,
    });
  };

  const handleSaveDocumentSelections2 = (selections: DocumentSelection) => {
    setDocumentSelections(prev => ({ ...prev, player2: selections }));
    // Update the form value to indicate documents will be migrated
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
    const existingDocs = getPlayer1ExistingDocuments()
    const newDocs = getPlayer1NewDocuments()

    return existingDocs.length > 0 && newDocs.length > 0
  }

  const hasPlayer2DocumentsToSelect = () => {
    const existingDocs = getPlayer2ExistingDocuments()
    const newDocs = getPlayer2NewDocuments()

    return existingDocs.length > 0 && newDocs.length > 0
  }

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
      setShowDocumentSelection1(true)
      return
    } else if (needsPlayer2Selection) {
      setShowDocumentSelection2(true)
      return
    } else {
      form.handleSubmit()
    }
  }

  const getDocumentSelectionSummary = (selections?: DocumentSelection) => {
    if (!selections) return null

    const total = Object.keys(selections).length
    const selectedNew = Object.values(selections).filter(s => s.selectedSource === 'new').length
    const selectedExisting = Object.values(selections).filter(s => s.selectedSource === 'existing').length

    return `${selectedNew} new, ${selectedExisting} existing`
  }

  const SuggestedPlayersSection = ({
    suggestions,
    isLoading,
    onSelectPlayer,
    playerType
  }: {
    suggestions: any[]
    isLoading: boolean
    onSelectPlayer: (playerId: string) => void;
    playerType: 'player1' | 'player2';
  }) => {
    console.log(`Rendering SuggestedPlayersSection for ${playerType}:`, {
      isLoading,
      suggestionsCount: suggestions.length,
      suggestions
    });

    if (isLoading) {
      return (
        <div className="mb-4 p-3 border rounded-md bg-gray-50">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-gray-600">Finding suggested players...</span>
          </div>
        </div>
      );
    }

    if (suggestions.length === 0) {
      console.log(`No suggestions for ${playerType}, returning null`);
      return null;
    }

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">Suggested Players</h4>
          <span className="text-xs text-gray-500">
            Based on name and birthday match
          </span>
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
          {suggestions.map((player) => (
            <div
              key={player._id}
              className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onSelectPlayer(player._id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {player.fullName}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        player.similarityScore >= 60
                          ? "bg-green-50 text-green-700 border-green-200"
                          : player.similarityScore >= 40
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                      )}
                    >
                      {player.similarityScore}% match
                    </Badge>
                  </div>
                  <div className="mt-1 space-y-1">
                    <div className="flex flex-wrap gap-1">
                      {player.matchReasons.map((reason: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs py-0.5"
                        >
                          {reason}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 space-y-0.5">
                      <div>Birthday: {format(new Date(player.birthDate), "PP")}</div>
                      {player.email && <div>Email: {player.email}</div>}
                      {player.phoneNumber && <div>Phone: {player.phoneNumber}</div>}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPlayer(player._id);
                  }}
                >
                  Select
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          <span>Click on a suggestion to auto-fill the player selection below</span>
        </div>
      </div>
    );
  }

  const hasSuggestionsForCurrentTab = (tab: string) => {
    if (tab === 'player1') {
      const isNewPlayer = form.getFieldValue('isPlayer1New')
      return !isNewPlayer && suggestedPlayers1.length > 0
    } else if (tab === 'player2') {
      const isNewPlayer = form.getFieldValue('isPlayer2New')
      return !isNewPlayer && suggestedPlayers2.length > 0
    }
    return false
  }

  const renderTabContent = (tab: 'player1' | 'player2') => {
    const suggestions = tab === 'player1' ? suggestedPlayers1 : suggestedPlayers2;
    const isLoadingSuggestions = tab === 'player1' ? isLoadingSuggestions1 : isLoadingSuggestions2;
    const hasSuggestions = suggestions.length > 0;
    const isNewPlayer = form.getFieldValue(`is${tab === 'player1' ? 'Player1' : 'Player2'}New`);

    const shouldShowTwoColumnLayout = hasSuggestions && !isNewPlayer;

    if (shouldShowTwoColumnLayout) {
      return (
        <div className="flex gap-6">
          <div className="w-3/4!">
            <FieldSet className="flex flex-col gap-2.5 h-[75vh] overflow-y-auto pr-2">
              <form.Field
                name={`is${tab === 'player1' ? 'Player1' : 'Player2'}New`}
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
                            Is New Player? ({tab === 'player1' ? 'Player 1' : 'Player 2'})
                          </FieldLabel>
                          <span className="text-muted-foreground text-xs">
                            Checking this will create a new player profile.
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

              {!form.getFieldValue(`is${tab === 'player1' ? 'Player1' : 'Player2'}New`) &&
                form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) &&
                (tab === 'player1' ? hasPlayer1DocumentsToSelect() : hasPlayer2DocumentsToSelect()) && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Document Selection</Label>
                        <p className="text-xs text-muted-foreground">
                          Choose which documents to keep for {tab === 'player1' ? 'Player 1' : 'Player 2'}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={tab === 'player1' ? handleDocumentSelection1 : handleDocumentSelection2}
                        disabled={isLoading}
                      >
                        {(tab === 'player1'
                          ? documentSelections.player1
                          : documentSelections.player2)
                          ? "Edit Selection"
                          : "Select Documents"}

                      </Button>
                    </div>
                    {(tab === 'player1' ? documentSelections.player1 : documentSelections.player2) ? (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-green-600" />
                            <div>
                              <p className="text-sm font-medium text-blue-800">Document selections saved</p>
                              <p className="text-xs text-blue-600">
                                {getDocumentSelectionSummary(
                                  tab === 'player1' ? documentSelections.player1 : documentSelections.player2
                                )} documents selected
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={tab === 'player1' ? handleDocumentSelection1 : handleDocumentSelection2}
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

              {!form.getFieldValue(`is${tab === 'player1' ? 'Player1' : 'Player2'}New`) && (
                <>
                  <form.Field
                    name={`connected${tab === 'player1' ? 'Player1' : 'Player2'}`}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched &&
                        !field.state.meta.isValid
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            Connected {tab === 'player1' ? 'Player 1' : 'Player 2'}
                          </FieldLabel>
                          <Popover
                            open={tab === 'player1' ? openPlayers1 : openPlayers2}
                            onOpenChange={tab === 'player1' ? setOpenPlayers1 : setOpenPlayers2}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                id={field.name}
                                name={field.name}
                                disabled={optionsLoading}
                                aria-expanded={tab === 'player1' ? openPlayers1 : openPlayers2}
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
                                  : `Select ${tab === 'player1' ? 'Player 1' : 'Player 2'}`}
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
                                <CommandInput placeholder={`Select ${tab === 'player1' ? 'Player 1' : 'Player 2'}`} />
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
                                            tab === 'player1' ? setOpenPlayers1(false) : setOpenPlayers2(false)
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
                        Checked fields will update the player database with entry data.
                      </span>
                    </div>
                    <div className="flex items-center w-full gap-2">
                      <div className="h-full flex items-center justify-center">
                        <Checkbox
                          disabled={
                            isLoading || !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
                          }
                          onCheckedChange={(checked) => {
                            form.setFieldValue(`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data`, {
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
                                tab === 'player1' ? handleDocumentSelection1() : handleDocumentSelection2();
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
                            form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
                              ? "col-span-2"
                              : "hidden"
                          )}
                        >
                          From Database (Current)
                        </span>{" "}
                        <span
                          className={cn(
                            "px-2 h-full border w-full flex items-center justify-center",
                            form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
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
                        name={`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data.firstName`}
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
                                      !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
                                    }
                                  />
                                </div>
                                <div className="text-xs grid grid-cols-5 col-span-2 min-h-8 w-full">
                                  <span className="px-2 h-full border w-full flex items-center justify-center py-1 text-center">
                                    First Name
                                  </span>
                                  {form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) ? (
                                    <>
                                      <span
                                        className={cn(
                                          !field.state.value &&
                                          "text-success bg-success/5",
                                          "col-span-2 px-2 h-full border w-full flex items-center justify-start py-1"
                                        )}
                                      >
                                        {tab === 'player1' ? player1?.firstName : player2?.firstName}
                                      </span>{" "}
                                      <span
                                        className={cn(
                                          field.state.value &&
                                          "text-warning bg-warning/5",
                                          "col-span-2 px-2 h-full border w-full flex items-center justify-start py-1"
                                        )}
                                      >
                                        {tab === 'player1' ? entry?.player1Entry.firstName : entry?.player2Entry?.firstName}
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
                                      {tab === 'player1' ? entry?.player1Entry.firstName : entry?.player2Entry?.firstName}
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
                        name={`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data.middleName`}
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
                                      !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
                                    }
                                  />
                                </div>
                                <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                  <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                    Middle Name
                                  </span>
                                  {form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) ? (
                                    <>
                                      <span
                                        className={cn(
                                          !field.state.value &&
                                          "text-success bg-success/5",
                                          "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                          !(tab === 'player1' ? player1?.middleName : player2?.middleName) &&
                                          "italic"
                                        )}
                                      >
                                        {tab === 'player1' ? player1?.middleName || "N/A" : player2?.middleName || "N/A"}
                                      </span>{" "}
                                      <span
                                        className={cn(
                                          field.state.value &&
                                          "text-warning bg-warning/5",
                                          "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                          !(tab === 'player1' ? player1?.middleName : player2?.middleName) &&
                                          "italic"
                                        )}
                                      >
                                        {tab === 'player1' ? entry?.player1Entry.middleName || "N/A" : entry?.player2Entry?.middleName || "N/A"}
                                      </span>
                                    </>
                                  ) : (
                                    <span
                                      className={cn(
                                        field.state.value &&
                                        "text-warning",
                                        "col-span-4 px-2 border w-full flex items-center justify-start py-1",
                                        !(tab === 'player1' ? player1?.middleName : player2?.middleName) && "italic"
                                      )}
                                    >
                                      {tab === 'player1' ? entry?.player1Entry.middleName || "N/A" : entry?.player2Entry?.middleName || "N/A"}
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
                        name={`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data.lastName`}
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
                                      !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
                                    }
                                  />
                                </div>
                                <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                  <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                    Last Name
                                  </span>
                                  {form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) ? (
                                    <>
                                      <span
                                        className={cn(
                                          !field.state.value &&
                                          "text-success bg-success/5",
                                          "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                          !(tab === 'player1' ? player1?.lastName : player2?.lastName) && "italic"
                                        )}
                                      >
                                        {tab === 'player1' ? player1?.lastName || "N/A" : player2?.lastName || "N/A"}
                                      </span>{" "}
                                      <span
                                        className={cn(
                                          field.state.value &&
                                          "text-warning bg-warning/5",
                                          "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                          !(tab === 'player1' ? player1?.lastName : player2?.lastName) && "italic"
                                        )}
                                      >
                                        {tab === 'player1' ? entry?.player1Entry.lastName || "N/A" : entry?.player2Entry?.lastName || "N/A"}
                                      </span>
                                    </>
                                  ) : (
                                    <span
                                      className={cn(
                                        field.state.value &&
                                        "text-warning",
                                        "col-span-4 px-2 border w-full flex items-center justify-start py-1",
                                        !(tab === 'player1' ? player1?.lastName : player2?.lastName) && "italic"
                                      )}
                                    >
                                      {tab === 'player1' ? entry?.player1Entry.lastName || "N/A" : entry?.player2Entry?.lastName || "N/A"}
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
                        name={`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data.suffix`}
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
                                      !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
                                    }
                                  />
                                </div>
                                <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                  <span className="px-2 border w-full flex items-center py-1 justify-center text-center">
                                    Ext.
                                  </span>
                                  {form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) ? (
                                    <>
                                      <span
                                        className={cn(
                                          !field.state.value &&
                                          "text-success bg-success/5",
                                          "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                          !(tab === 'player1' ? player1?.suffix : player2?.suffix) && "italic"
                                        )}
                                      >
                                        {tab === 'player1' ? player1?.suffix || "N/A" : player2?.suffix || "N/A"}
                                      </span>{" "}
                                      <span
                                        className={cn(
                                          field.state.value &&
                                          "text-warning bg-warning/5",
                                          "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                          !(tab === 'player1' ? player1?.suffix : player2?.suffix) && "italic"
                                        )}
                                      >
                                        {tab === 'player1' ? entry?.player1Entry.suffix || "N/A" : entry?.player2Entry?.suffix || "N/A"}
                                      </span>
                                    </>
                                  ) : (
                                    <span
                                      className={cn(
                                        field.state.value &&
                                        "text-warning",
                                        "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                        !(tab === 'player1' ? player1?.suffix : player2?.suffix) && "italic"
                                      )}
                                    >
                                      {tab === 'player1' ? entry?.player1Entry.suffix || "N/A" : entry?.player2Entry?.suffix || "N/A"}
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
                        name={`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data.email`}
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
                                      !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
                                    }
                                  />
                                </div>
                                <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                  <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                    Email
                                  </span>
                                  {form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) ? (
                                    <>
                                      <span
                                        className={cn(
                                          !field.state.value &&
                                          "text-success bg-success/5",
                                          "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                          !(tab === 'player1' ? player1?.email : player2?.email) && "italic"
                                        )}
                                      >
                                        {tab === 'player1' ? player1?.email || "N/A" : player2?.email || "N/A"}
                                      </span>{" "}
                                      <span
                                        className={cn(
                                          field.state.value &&
                                          "text-warning bg-warning/5",
                                          "col-span-2 px-2 border w-full flex items-center py-1 justify-start break-all whitespace-normal",
                                          !(tab === 'player1' ? player1?.email : player2?.email) && "italic"
                                        )}
                                      >
                                        {tab === 'player1' ? entry?.player1Entry.email || "N/A" : entry?.player2Entry?.email || "N/A"}
                                      </span>
                                    </>
                                  ) : (
                                    <span
                                      className={cn(
                                        field.state.value &&
                                        "text-warning",
                                        "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                        !(tab === 'player1' ? player1?.email : player2?.email) && "italic"
                                      )}
                                    >
                                      {tab === 'player1' ? entry?.player1Entry.email || "N/A" : entry?.player2Entry?.email || "N/A"}
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
                        name={`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data.phoneNumber`}
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
                                      !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
                                    }
                                  />
                                </div>
                                <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                  <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                    Phone No.
                                  </span>
                                  {form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) ? (
                                    <>
                                      <span
                                        className={cn(
                                          !field.state.value &&
                                          "text-success bg-success/5",
                                          "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                          !(tab === 'player1' ? player1?.phoneNumber : player2?.phoneNumber) &&
                                          "italic"
                                        )}
                                      >
                                        {tab === 'player1' ? player1?.phoneNumber || "N/A" : player2?.phoneNumber || "N/A"}
                                      </span>{" "}
                                      <span
                                        className={cn(
                                          field.state.value &&
                                          "text-warning bg-warning/5",
                                          "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                          !(tab === 'player1' ? player1?.phoneNumber : player2?.phoneNumber) &&
                                          "italic"
                                        )}
                                      >
                                        {tab === 'player1' ? entry?.player1Entry.phoneNumber || "N/A" : entry?.player2Entry?.phoneNumber || "N/A"}
                                      </span>
                                    </>
                                  ) : (
                                    <span
                                      className={cn(
                                        field.state.value &&
                                        "text-warning",
                                        "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                        !(tab === 'player1' ? player1?.phoneNumber : player2?.phoneNumber) &&
                                        "italic"
                                      )}
                                    >
                                      {tab === 'player1' ? entry?.player1Entry.phoneNumber || "N/A" : entry?.player2Entry?.phoneNumber || "N/A"}
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
                        name={`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data.birthDate`}
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
                                      !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
                                    }
                                  />
                                </div>
                                <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                  <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                    Birthday
                                  </span>
                                  {form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) ? (
                                    <>
                                      <span
                                        className={cn(
                                          !field.state.value &&
                                          "text-success bg-success/5",
                                          "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                          !(tab === 'player1' ? player1?.birthDate : player2?.birthDate) &&
                                          "italic"
                                        )}
                                      >
                                        {tab === 'player1' ? player1?.birthDate
                                          ? format(
                                            new Date(
                                              player1.birthDate
                                            ),
                                            "PP"
                                          )
                                          : "N/A" : player2?.birthDate
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
                                          !(tab === 'player1' ? player1?.birthDate : player2?.birthDate) &&
                                          "italic"
                                        )}
                                      >
                                        {tab === 'player1' ? entry?.player1Entry.birthDate
                                          ? format(
                                            new Date(
                                              entry.player1Entry.birthDate
                                            ),
                                            "PP"
                                          )
                                          : "N/A" : entry?.player2Entry?.birthDate
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
                                        !(tab === 'player1' ? player1?.birthDate : player2?.birthDate) && "italic"
                                      )}
                                    >
                                      {tab === 'player1' ? entry?.player1Entry.birthDate
                                        ? format(
                                          new Date(
                                            entry.player1Entry.birthDate
                                          ),
                                          "PP"
                                        )
                                        : "N/A" : entry?.player2Entry?.birthDate
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
          </div>

          <div className="w-1/3 border-l pl-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Suggested Players</h3>
              <p className="text-sm text-muted-foreground">
                Based on name and birthday match from your database
              </p>
            </div>

            <div className="space-y-3 max-h-[52vh] overflow-y-auto pr-2">
              {suggestions.map((player) => (
                <div
                  key={player._id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors bg-white shadow-sm"
                  onClick={() => {
                    form.setFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`, player._id);
                    tab === 'player1' ? fetchPlayer1({ variables: { _id: player._id } }) : fetchPlayer2({ variables: { _id: player._id } });
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">{player.fullName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            player.similarityScore >= 60
                              ? "bg-green-50 text-green-700 border-green-200"
                              : player.similarityScore >= 40
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                          )}
                        >
                          {player.similarityScore}% match
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {player.matchReasons.map((reason: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs py-0.5"
                        >
                          {reason}
                        </Badge>
                      ))}
                    </div>

                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Birthday:</span>
                        <span>{format(new Date(player.birthDate), "PP")}</span>
                      </div>
                      {player.email && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Email:</span>
                          <span>{player.email}</span>
                        </div>
                      )}
                      {player.phoneNumber && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Phone:</span>
                          <span>{player.phoneNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">How it works:</p>
                  <p className="text-xs">Click on a suggested player to auto-fill the selection. The system matches players based on name and birthday similarity.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <FieldSet className="flex flex-col gap-2.5 h-[52vh] overflow-y-auto">
        <form.Field
          name={`is${tab === 'player1' ? 'Player1' : 'Player2'}New`}
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
                      Is New Player? ({tab === 'player1' ? 'Player 1' : 'Player 2'})
                    </FieldLabel>
                    <span className="text-muted-foreground text-xs">
                      Checking this will create a new player profile.
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

        {/* Document Selection for normal layout */}
        {!form.getFieldValue(`is${tab === 'player1' ? 'Player1' : 'Player2'}New`) &&
          form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) &&
          (tab === 'player1' ? hasPlayer1DocumentsToSelect() : hasPlayer2DocumentsToSelect()) && (
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Document Selection</Label>
                  <p className="text-xs text-muted-foreground">
                    Choose which documents to keep for {tab === 'player1' ? 'Player 1' : 'Player 2'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={tab === 'player1' ? handleDocumentSelection1 : handleDocumentSelection2}
                  disabled={isLoading}
                >
                  {(tab === 'player1'
                    ? documentSelections.player1
                    : documentSelections.player2)
                    ? "Edit Selection"
                    : "Select Documents"}
                </Button>
              </div>
              {(tab === 'player1'
                ? documentSelections.player1
                : documentSelections.player2) ? (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Document selections saved
                        </p>
                        <p className="text-xs text-blue-600">
                          {getDocumentSelectionSummary(
                            tab === 'player1'
                              ? documentSelections.player1
                              : documentSelections.player2
                          )} documents selected
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={tab === 'player1'
                        ? handleDocumentSelection1
                        : handleDocumentSelection2}
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

        {/* Loading indicator for suggestions - only show when not a new player */}
        {!form.getFieldValue(`is${tab === 'player1' ? 'Player1' : 'Player2'}New`) && isLoadingSuggestions && (
          <div className="mb-4 p-3 border rounded-md bg-gray-50">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-gray-600">Finding suggested players...</span>
            </div>
          </div>
        )}

        {/* Suggestions - only show when not a new player AND we have suggestions */}
        {!form.getFieldValue(`is${tab === 'player1' ? 'Player1' : 'Player2'}New`) && hasSuggestions && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Suggested Players</h4>
              <span className="text-xs text-gray-500">
                Based on name and birthday match
              </span>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {suggestions.map((player) => (
                <div
                  key={player._id}
                  className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    form.setFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`, player._id);
                    tab === 'player1' ? fetchPlayer1({ variables: { _id: player._id } }) : fetchPlayer2({ variables: { _id: player._id } });
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {player.fullName}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            player.similarityScore >= 60
                              ? "bg-green-50 text-green-700 border-green-200"
                              : player.similarityScore >= 40
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                          )}
                        >
                          {player.similarityScore}% match
                        </Badge>
                      </div>
                      <div className="mt-1 space-y-1">
                        <div className="flex flex-wrap gap-1">
                          {player.matchReasons.map((reason: string, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs py-0.5"
                            >
                              {reason}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 space-y-0.5">
                          <div>Birthday: {format(new Date(player.birthDate), "PP")}</div>
                          {player.email && <div>Email: {player.email}</div>}
                          {player.phoneNumber && <div>Phone: {player.phoneNumber}</div>}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        form.setFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`, player._id);
                        tab === 'player1' ? fetchPlayer1({ variables: { _id: player._id } }) : fetchPlayer2({ variables: { _id: player._id } });
                      }}
                    >
                      Select
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              <span>Click on a suggestion to auto-fill the player selection below</span>
            </div>
          </div>
        )}

        {!form.getFieldValue(`is${tab === 'player1' ? 'Player1' : 'Player2'}New`) && (
          <>
            <form.Field
              name={`connected${tab === 'player1' ? 'Player1' : 'Player2'}`}
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Connected {tab === 'player1' ? 'Player 1' : 'Player 2'}
                    </FieldLabel>
                    <Popover
                      open={tab === 'player1' ? openPlayers1 : openPlayers2}
                      onOpenChange={tab === 'player1' ? setOpenPlayers1 : setOpenPlayers2}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          id={field.name}
                          name={field.name}
                          disabled={optionsLoading}
                          aria-expanded={tab === 'player1' ? openPlayers1 : openPlayers2}
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
                            : `Select ${tab === 'player1' ? 'Player 1' : 'Player 2'}`}
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
                          <CommandInput placeholder={`Select ${tab === 'player1' ? 'Player 1' : 'Player 2'}`} />
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
                                      tab === 'player1' ? setOpenPlayers1(false) : setOpenPlayers2(false)
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
                  Checked fields will update the player database with entry data.
                </span>
              </div>
              <div className="flex items-center w-full gap-2">
                <div className="h-full flex items-center justify-center">
                  <Checkbox
                    disabled={
                      isLoading || !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
                    }
                    onCheckedChange={(checked) => {
                      form.setFieldValue(`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data`, {
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
                        // If checking all, show document selection dialog
                        setTimeout(() => {
                          tab === 'player1' ? handleDocumentSelection1() : handleDocumentSelection2();
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
                      form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
                        ? "col-span-2"
                        : "hidden"
                    )}
                  >
                    From Database (Current)
                  </span>{" "}
                  <span
                    className={cn(
                      "px-2 h-full border w-full flex items-center justify-center",
                      form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
                        ? "col-span-2"
                        : "col-span-4"
                    )}
                  >
                    From Entry (New)
                  </span>
                </div>
              </div>

              {/* Migration Fields */}
              <div>
                <form.Field
                  name={`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data.firstName`}
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
                                !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
                              }
                            />
                          </div>
                          <div className="text-xs grid grid-cols-5 col-span-2 min-h-8 w-full">
                            <span className="px-2 h-full border w-full flex items-center justify-center py-1 text-center">
                              First Name
                            </span>
                            {form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) ? (
                              <>
                                <span
                                  className={cn(
                                    !field.state.value &&
                                    "text-success bg-success/5",
                                    "col-span-2 px-2 h-full border w-full flex items-center justify-start py-1"
                                  )}
                                >
                                  {tab === 'player1' ? player1?.firstName : player2?.firstName}
                                </span>{" "}
                                <span
                                  className={cn(
                                    field.state.value &&
                                    "text-warning bg-warning/5",
                                    "col-span-2 px-2 h-full border w-full flex items-center justify-start py-1"
                                  )}
                                >
                                  {tab === 'player1' ? entry?.player1Entry.firstName : entry?.player2Entry?.firstName}
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
                                {tab === 'player1' ? entry?.player1Entry.firstName : entry?.player2Entry?.firstName}
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
                  name={`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data.middleName`}
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
                                !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
                              }
                            />
                          </div>
                          <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                            <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                              Middle Name
                            </span>
                            {form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) ? (
                              <>
                                <span
                                  className={cn(
                                    !field.state.value &&
                                    "text-success bg-success/5",
                                    "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                    !(tab === 'player1' ? player1?.middleName : player2?.middleName) &&
                                    "italic"
                                  )}
                                >
                                  {tab === 'player1' ? player1?.middleName || "N/A" : player2?.middleName || "N/A"}
                                </span>{" "}
                                <span
                                  className={cn(
                                    field.state.value &&
                                    "text-warning bg-warning/5",
                                    "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                    !(tab === 'player1' ? player1?.middleName : player2?.middleName) &&
                                    "italic"
                                  )}
                                >
                                  {tab === 'player1' ? entry?.player1Entry.middleName || "N/A" : entry?.player2Entry?.middleName || "N/A"}
                                </span>
                              </>
                            ) : (
                              <span
                                className={cn(
                                  field.state.value &&
                                  "text-warning",
                                  "col-span-4 px-2 border w-full flex items-center justify-start py-1",
                                  !(tab === 'player1' ? player1?.middleName : player2?.middleName) && "italic"
                                )}
                              >
                                {tab === 'player1' ? entry?.player1Entry.middleName || "N/A" : entry?.player2Entry?.middleName || "N/A"}
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
                  name={`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data.lastName`}
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
                                !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
                              }
                            />
                          </div>
                          <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                            <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                              Last Name
                            </span>
                            {form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) ? (
                              <>
                                <span
                                  className={cn(
                                    !field.state.value &&
                                    "text-success bg-success/5",
                                    "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                    !(tab === 'player1' ? player1?.lastName : player2?.lastName) && "italic"
                                  )}
                                >
                                  {tab === 'player1' ? player1?.lastName || "N/A" : player2?.lastName || "N/A"}
                                </span>{" "}
                                <span
                                  className={cn(
                                    field.state.value &&
                                    "text-warning bg-warning/5",
                                    "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                    !(tab === 'player1' ? player1?.lastName : player2?.lastName) && "italic"
                                  )}
                                >
                                  {tab === 'player1' ? entry?.player1Entry.lastName || "N/A" : entry?.player2Entry?.lastName || "N/A"}
                                </span>
                              </>
                            ) : (
                              <span
                                className={cn(
                                  field.state.value &&
                                  "text-warning",
                                  "col-span-4 px-2 border w-full flex items-center justify-start py-1",
                                  !(tab === 'player1' ? player1?.lastName : player2?.lastName) && "italic"
                                )}
                              >
                                {tab === 'player1' ? entry?.player1Entry.lastName || "N/A" : entry?.player2Entry?.lastName || "N/A"}
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
                  name={`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data.suffix`}
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
                                !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
                              }
                            />
                          </div>
                          <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                            <span className="px-2 border w-full flex items-center py-1 justify-center text-center">
                              Ext.
                            </span>
                            {form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) ? (
                              <>
                                <span
                                  className={cn(
                                    !field.state.value &&
                                    "text-success bg-success/5",
                                    "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                    !(tab === 'player1' ? player1?.suffix : player2?.suffix) && "italic"
                                  )}
                                >
                                  {tab === 'player1' ? player1?.suffix || "N/A" : player2?.suffix || "N/A"}
                                </span>{" "}
                                <span
                                  className={cn(
                                    field.state.value &&
                                    "text-warning bg-warning/5",
                                    "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                    !(tab === 'player1' ? player1?.suffix : player2?.suffix) && "italic"
                                  )}
                                >
                                  {tab === 'player1' ? entry?.player1Entry.suffix || "N/A" : entry?.player2Entry?.suffix || "N/A"}
                                </span>
                              </>
                            ) : (
                              <span
                                className={cn(
                                  field.state.value &&
                                  "text-warning",
                                  "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                  !(tab === 'player1' ? player1?.suffix : player2?.suffix) && "italic"
                                )}
                              >
                                {tab === 'player1' ? entry?.player1Entry.suffix || "N/A" : entry?.player2Entry?.suffix || "N/A"}
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
                  name={`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data.email`}
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
                                !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
                              }
                            />
                          </div>
                          <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                            <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                              Email
                            </span>
                            {form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) ? (
                              <>
                                <span
                                  className={cn(
                                    !field.state.value &&
                                    "text-success bg-success/5",
                                    "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                    !(tab === 'player1' ? player1?.email : player2?.email) && "italic"
                                  )}
                                >
                                  {tab === 'player1' ? player1?.email || "N/A" : player2?.email || "N/A"}
                                </span>{" "}
                                <span
                                  className={cn(
                                    field.state.value &&
                                    "text-warning bg-warning/5",
                                    "col-span-2 px-2 border w-full flex items-center py-1 justify-start break-all whitespace-normal",
                                    !(tab === 'player1' ? player1?.email : player2?.email) && "italic"
                                  )}
                                >
                                  {tab === 'player1' ? entry?.player1Entry.email || "N/A" : entry?.player2Entry?.email || "N/A"}
                                </span>
                              </>
                            ) : (
                              <span
                                className={cn(
                                  field.state.value &&
                                  "text-warning",
                                  "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                  !(tab === 'player1' ? player1?.email : player2?.email) && "italic"
                                )}
                              >
                                {tab === 'player1' ? entry?.player1Entry.email || "N/A" : entry?.player2Entry?.email || "N/A"}
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
                  name={`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data.phoneNumber`}
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
                                !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
                              }
                            />
                          </div>
                          <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                            <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                              Phone No.
                            </span>
                            {form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) ? (
                              <>
                                <span
                                  className={cn(
                                    !field.state.value &&
                                    "text-success bg-success/5",
                                    "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                    !(tab === 'player1' ? player1?.phoneNumber : player2?.phoneNumber) &&
                                    "italic"
                                  )}
                                >
                                  {tab === 'player1' ? player1?.phoneNumber || "N/A" : player2?.phoneNumber || "N/A"}
                                </span>{" "}
                                <span
                                  className={cn(
                                    field.state.value &&
                                    "text-warning bg-warning/5",
                                    "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                    !(tab === 'player1' ? player1?.phoneNumber : player2?.phoneNumber) &&
                                    "italic"
                                  )}
                                >
                                  {tab === 'player1' ? entry?.player1Entry.phoneNumber || "N/A" : entry?.player2Entry?.phoneNumber || "N/A"}
                                </span>
                              </>
                            ) : (
                              <span
                                className={cn(
                                  field.state.value &&
                                  "text-warning",
                                  "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                  !(tab === 'player1' ? player1?.phoneNumber : player2?.phoneNumber) &&
                                  "italic"
                                )}
                              >
                                {tab === 'player1' ? entry?.player1Entry.phoneNumber || "N/A" : entry?.player2Entry?.phoneNumber || "N/A"}
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
                  name={`migrate${tab === 'player1' ? 'Player1' : 'Player2'}Data.birthDate`}
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
                                !form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`)
                              }
                            />
                          </div>
                          <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                            <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                              Birthday
                            </span>
                            {form.getFieldValue(`connected${tab === 'player1' ? 'Player1' : 'Player2'}`) ? (
                              <>
                                <span
                                  className={cn(
                                    !field.state.value &&
                                    "text-success bg-success/5",
                                    "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                    !(tab === 'player1' ? player1?.birthDate : player2?.birthDate) &&
                                    "italic"
                                  )}
                                >
                                  {tab === 'player1' ? player1?.birthDate
                                    ? format(
                                      new Date(
                                        player1.birthDate
                                      ),
                                      "PP"
                                    )
                                    : "N/A" : player2?.birthDate
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
                                    !(tab === 'player1' ? player1?.birthDate : player2?.birthDate) &&
                                    "italic"
                                  )}
                                >
                                  {tab === 'player1' ? entry?.player1Entry.birthDate
                                    ? format(
                                      new Date(
                                        entry.player1Entry.birthDate
                                      ),
                                      "PP"
                                    )
                                    : "N/A" : entry?.player2Entry?.birthDate
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
                                  !(tab === 'player1' ? player1?.birthDate : player2?.birthDate) && "italic"
                                )}
                              >
                                {tab === 'player1' ? entry?.player1Entry.birthDate
                                  ? format(
                                    new Date(
                                      entry.player1Entry.birthDate
                                    ),
                                    "PP"
                                  )
                                  : "N/A" : entry?.player2Entry?.birthDate
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
    );
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
            key={`dialog-${form.getFieldValue('isPlayer1New')}-${form.getFieldValue('isPlayer2New')}`}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
            showCloseButton={false}
            className={cn(
              "max-w-xl!",
              (!form.getFieldValue('isPlayer1New') && suggestedPlayers1.length > 0) ||
                (!form.getFieldValue('isPlayer2New') && suggestedPlayers2.length > 0)
                ? "max-w-4xl!"
                : "max-w-4xl!"
            )}
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
                      {renderTabContent('player1')}
                    </TabsContent>
                    <TabsContent value="player2">
                      {renderTabContent('player2')}
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
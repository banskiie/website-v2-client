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
import { Field, FieldError, FieldLabel, FieldSet } from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  CheckIcon,
  ChevronsUpDownIcon,
  FileText,
  Check,
  X,
  AlertCircle,
  Loader2,
  Save,
  ChevronLeft,
  File,
} from "lucide-react"
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

const UPDATE_DOCUMENT_URLS = gql`
  mutation UpdateEntryDocumentUrls($input: UpdateDocumentUrlsInput!) {
    updateEntryDocumentUrls(input: $input) {
      ok
      message
    }
  }
`

type SuggestPlayer = {
  _id: string
  fullName: string
  firstName: string
  middleName?: string
  lastName: string
  suffix?: string
  birthDate: string
  email?: string
  phoneNumber?: string
  similarityScore: number
  matchReasons: string[]
}

type SuggestPlayersResponse = {
  suggestPlayers: SuggestPlayer[]
}

type Props = {
  _id?: string
  onClose?: () => void
  title?: string
}

type DocumentInfo = {
  documentType: string
  documentURL: string
  dateUploaded?: Date
  player: string
  source: "existing" | "new"
}

type DocumentSelection = {
  [documentType: string]: {
    selectedSource: string
    existingDocs: DocumentInfo[]
    newDocs: DocumentInfo[]
  }
}

type ProcessedDocument = {
  documentType: string
  fileId: string
  status: string
  player: string
  message: string
  newFileId?: string
  oldUrl?: string
  newUrl?: string
}
type ReplaceResult = {
  replacedDocuments: any[]
  failedReplacements: any[]
  deletedDocuments: any[]
  success: boolean
}

const extractFileIdFromUrl = (url: string): string | null => {
  if (!url) return null

  const cloudinaryPattern = /\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/
  const match = url.match(cloudinaryPattern)

  if (match && match[1]) {
    return match[1].replace(/\.[^.]+$/, '')
  }

  return url
}

const getFileLocation = async (fileId: string): Promise<'root' | 'entry_requirements' | 'requirement' | 'unknown'> => {
  try {
    console.log(`🔍 Checking location for file: ${fileId}`)

    if (fileId.startsWith('requirement/')) {
      console.log(`📁 File is in requirement folder (by path): ${fileId}`)
      return 'requirement'
    }

    if (fileId.startsWith('entry_requirements/')) {
      console.log(`📁 File is in entry_requirements folder (by path): ${fileId}`)
      return 'entry_requirements'
    }

    try {
      const checkResponse = await fetch("/api/transfer/requirement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      })

      const checkResult = await checkResponse.json()

      if (checkResult.success) {
        if (checkResult.isRequirement) {
          console.log(`📁 File is in requirement folder (by API): ${fileId}`)
          return 'requirement'
        }
      }
    } catch (apiError) {
      console.warn(`⚠️ API check failed, using path-based detection:`, apiError)
    }

    console.log(`📁 File appears to be in root folder: ${fileId}`)
    return 'root'
  } catch (error) {
    console.error('Error checking file location:', error)
    return 'unknown'
  }
}

const replaceDocumentsInDrive = async (
  existingDocuments: any[],
  newDocuments: any[],
  playerType: "player1" | "player2",
  documentSelection?: DocumentSelection,
) => {
  try {
    const replacedDocuments: any[] = []
    const failedReplacements: any[] = []
    const deletedDocuments: any[] = []

    if (documentSelection) {
      // Process based on document selection
      for (const [documentType, selection] of Object.entries(
        documentSelection,
      )) {
        const { selectedSource, existingDocs, newDocs } = selection

        if (selectedSource === "existing" && existingDocs) {
          // ✅ USER SELECTED EXISTING DOCUMENT
          // Keep existing document - we need to DELETE the new document
          console.log(`📌 Keeping existing ${documentType} for ${playerType}`)

          const newFileId = extractFileIdFromUrl(newDocs[0]?.documentURL)

          if (newFileId) {
            try {
              // Delete the new document since we're keeping the existing one
              const deleteResponse = await fetch("/api/transfer/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  fileId: newFileId,
                  documentType,
                  playerType,
                  reason: "user_selected_existing"
                }),
              })

              const deleteResult = await deleteResponse.json()

              if (deleteResponse.ok && deleteResult.success) {
                deletedDocuments.push({
                  documentType,
                  fileId: newFileId,
                  status: "deleted",
                  message: "New document deleted (keeping existing)"
                })
                console.log(`✅ Deleted new document: ${documentType}`)
              } else {
                console.warn(`⚠️ Could not delete new document: ${documentType}`, deleteResult)
                failedReplacements.push({
                  documentType,
                  error: deleteResult.error || "Failed to delete new document",
                  action: "delete_failed"
                })
              }
            } catch (deleteError: any) {
              console.error(`❌ Error deleting new document:`, deleteError)
              failedReplacements.push({
                documentType,
                error: deleteError?.message || "Unknown error deleting document",
                action: "delete_error"
              })
            }
          }

          // No replacement needed - we're keeping the existing
          continue
        }

        if (selectedSource === "new" && newDocs) {
          // ✅ USER SELECTED NEW DOCUMENT - Replace existing with new
          const newFileId = extractFileIdFromUrl(newDocs[0].documentURL)

          if (!newFileId) {
            console.warn(
              `Could not extract file ID from new document: ${newDocs[0].documentURL}`,
            )
            failedReplacements.push({
              documentType,
              error: "Invalid file URL",
            })
            continue
          }

          if (existingDocs && existingDocs.length > 0) {
            const oldFileId = extractFileIdFromUrl(existingDocs[0].documentURL)

            if (oldFileId) {
              try {
                const replaceResponse = await fetch("/api/transfer/replace", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    oldFileId,
                    newFileId,
                    documentType,
                    playerType,
                  }),
                })

                const replaceResult = await replaceResponse.json()

                if (replaceResponse.ok && replaceResult.success) {
                  replacedDocuments.push({
                    documentType,
                    oldFileId,
                    newFileId: replaceResult.newFileId || newFileId,
                    status: "replaced",
                    action: replaceResult.action,
                    message: replaceResult.message,
                  })
                  console.log(`✅ Replaced ${documentType} with new document`)
                } else {
                  console.error(
                    `❌ Failed to replace ${documentType}:`,
                    replaceResult.message,
                  )
                  failedReplacements.push({
                    documentType,
                    error: replaceResult.message,
                    fallback: true,
                  })

                  // Fallback: Try to move new document
                  try {
                    const moveResponse = await fetch(
                      "/api/transfer/entry_requirement",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ fileId: newFileId }),
                      },
                    )

                    const moveResult = await moveResponse.json()

                    if (moveResponse.ok && moveResult.success) {
                      replacedDocuments.push({
                        documentType,
                        oldFileId,
                        newFileId,
                        status: "moved_new_only",
                        action: "moved",
                        message:
                          "Replacement failed, moved new document instead",
                      })
                      console.log(`✅ Moved new document as fallback: ${documentType}`)
                    }
                  } catch (moveError) {
                    console.error(`❌ Failed to move new document:`, moveError)
                  }
                }
              } catch (replaceError: any) {
                console.error(
                  `❌ Error replacing ${documentType}:`,
                  replaceError,
                )
                failedReplacements.push({
                  documentType,
                  error: replaceError?.message || "Unknown error",
                })
              }
            } else {
              try {
                const moveResponse = await fetch(
                  "/api/transfer/entry_requirement",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ fileId: newFileId }),
                  },
                )

                const moveResult = await moveResponse.json()

                if (moveResponse.ok && moveResult.success) {
                  replacedDocuments.push({
                    documentType,
                    newFileId,
                    status: "added_new_no_old",
                    action: "added",
                    message: "No existing file found, added new document",
                  })
                  console.log(`✅ Added new document (no existing): ${documentType}`)
                }
              } catch (moveError) {
                console.error(`❌ Error adding new document:`, moveError)
                failedReplacements.push({
                  documentType,
                })
              }
            }
          } else {
            // No existing document, just move the new one
            try {
              const moveResponse = await fetch(
                "/api/transfer/entry_requirement",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ fileId: newFileId }),
                },
              )

              const moveResult = await moveResponse.json()

              if (moveResponse.ok && moveResult.success) {
                replacedDocuments.push({
                  documentType,
                  newFileId,
                  status: "added_new_type",
                  action: "added",
                  message: "Added new document type",
                })
                console.log(`✅ Added new document type: ${documentType}`)
              }
            } catch (moveError) {
              console.error(
                `❌ Error moving new document ${documentType}:`,
                moveError,
              )
              failedReplacements.push({
                documentType,
              })
            }
          }
        }
      }
    } else {
      // Fallback: Old behavior - replace all documents
      console.log(`📋 No document selection, processing all documents for ${playerType}`)

      for (const newDoc of newDocuments) {
        const newFileId = extractFileIdFromUrl(newDoc.documentURL)

        if (!newFileId) {
          console.warn(
            `Could not extract file ID from new document: ${newDoc.documentURL}`,
          )
          failedReplacements.push({
            documentType: newDoc.documentType,
            error: "Invalid file URL",
          })
          continue
        }

        const existingDoc = existingDocuments.find(
          (doc) => doc.documentType === newDoc.documentType,
        )

        if (existingDoc) {
          const oldFileId = extractFileIdFromUrl(existingDoc.documentURL)

          if (oldFileId) {
            try {
              const replaceResponse = await fetch("/api/transfer/replace", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  oldFileId,
                  newFileId,
                  documentType: newDoc.documentType,
                  playerType,
                }),
              })

              const replaceResult = await replaceResponse.json()

              if (replaceResponse.ok && replaceResult.success) {
                replacedDocuments.push({
                  documentType: newDoc.documentType,
                  oldFileId,
                  newFileId: replaceResult.newFileId || newFileId,
                  status: "replaced",
                  action: replaceResult.action,
                  message: replaceResult.message,
                })
                console.log(`✅ Replaced ${newDoc.documentType}`)
              } else {
                console.error(
                  `❌ Failed to replace ${newDoc.documentType}:`,
                  replaceResult.message,
                )
                failedReplacements.push({
                  documentType: newDoc.documentType,
                  error: replaceResult.message,
                  fallback: true,
                })

                try {
                  const moveResponse = await fetch(
                    "/api/transfer/entry_requirement",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ fileId: newFileId }),
                    },
                  )

                  const moveResult = await moveResponse.json()

                  if (moveResponse.ok && moveResult.success) {
                    replacedDocuments.push({
                      documentType: newDoc.documentType,
                      oldFileId,
                      newFileId,
                      status: "moved_new_only",
                      action: "moved",
                      message: "Replacement failed, moved new document instead",
                    })
                    console.log(`✅ Moved new document as fallback: ${newDoc.documentType}`)
                  }
                } catch (moveError) {
                  console.error(`❌ Failed to move new document:`, moveError)
                }
              }
            } catch (replaceError: any) {
              console.error(
                `❌ Error replacing ${newDoc.documentType}:`,
                replaceError,
              )
              failedReplacements.push({
                documentType: newDoc.documentType,
                error: replaceError?.message || "Unknown error",
              })
            }
          } else {
            try {
              const moveResponse = await fetch(
                "/api/transfer/entry_requirement",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ fileId: newFileId }),
                },
              )

              const moveResult = await moveResponse.json()

              if (moveResponse.ok && moveResult.success) {
                replacedDocuments.push({
                  documentType: newDoc.documentType,
                  newFileId,
                  status: "added_new_no_old",
                  action: "added",
                  message: "No existing file found, added new document",
                })
                console.log(`✅ Added new document (no existing): ${newDoc.documentType}`)
              }
            } catch (moveError) {
              console.error(`Error adding new document:`, moveError)
              failedReplacements.push({
                documentType: newDoc.documentType,
              })
            }
          }
        } else {
          // No existing document of this type, just move the new one
          try {
            const moveResponse = await fetch(
              "/api/transfer/entry_requirement",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileId: newFileId }),
              },
            )

            const moveResult = await moveResponse.json()

            if (moveResponse.ok && moveResult.success) {
              replacedDocuments.push({
                documentType: newDoc.documentType,
                newFileId,
                status: "added_new_type",
                action: "added",
                message: "Added new document type",
              })
              console.log(`✅ Added new document type: ${newDoc.documentType}`)
            }
          } catch (moveError) {
            console.error(
              `Error moving new document ${newDoc.documentType}:`,
              moveError,
            )
            failedReplacements.push({
              documentType: newDoc.documentType,
            })
          }
        }
      }
    }

    console.log(
      `✅ Document processing completed for ${playerType}:`,
      `\n   - Replaced: ${replacedDocuments.length} documents`,
      `\n   - Deleted: ${deletedDocuments.length} documents`,
      `\n   - Failed: ${failedReplacements.length} documents`,
    )

    return {
      replacedDocuments,
      failedReplacements,
      deletedDocuments,
      success: replacedDocuments.length > 0 || deletedDocuments.length > 0 || failedReplacements.length === 0,
    } as ReplaceResult
  } catch (error) {
    console.error(
      `❌ Error in replaceDocumentsInDrive for ${playerType}:`,
      error,
    )
    return {
      replacedDocuments: [],
      failedReplacements: [],
      deletedDocuments: [],
      success: false,
    } as ReplaceResult
  }
}
const moveDocumentsToRequirements = async (docs: any[], player: string): Promise<ProcessedDocument[]> => {
  const movedDocs: ProcessedDocument[] = []

  for (const doc of docs) {
    const fileId = extractFileIdFromUrl(doc.documentURL)
    if (fileId) {
      try {
        console.log(
          `📦 Processing ${doc.documentType} for ${player}...`,
          { fileId }
        )

        const location = await getFileLocation(fileId)
        console.log(`📍 File location for ${doc.documentType}:`, location)

        if (location === 'requirement') {
          console.log(`✅ File already in requirement folder: ${fileId}`)
          movedDocs.push({
            documentType: doc.documentType,
            fileId,
            status: "already_exists",
            player: player,
            message: "File already in requirement folder",
            newFileId: fileId,
            oldUrl: doc.documentURL,
            newUrl: doc.documentURL, // URL unchanged
          })
          continue
        }

        if (location === 'entry_requirements') {
          console.log(`Moving from entry_requirements to requirement: ${fileId}`)

          const moveResponse = await fetch("/api/transfer/entry_requirement", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileId }),
          })

          const moveResult = await moveResponse.json()

          if (moveResponse.ok && moveResult.success) {
            // Construct URL without cloudinary object
            const newUrl = moveResult.newUrl || `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dqjcswchm'}/image/upload/${moveResult.newFileId}`

            movedDocs.push({
              documentType: doc.documentType,
              fileId,
              status: "moved",
              player: player,
              message: "Successfully moved to requirement folder",
              newFileId: moveResult.newFileId || fileId,
              oldUrl: doc.documentURL,
              newUrl: newUrl,
            })
            console.log(`✅ Successfully moved ${doc.documentType} for ${player}`)
            console.log(`   Old URL: ${doc.documentURL}`)
            console.log(`   New URL: ${newUrl}`)
          } else {
            console.error(`Failed to move ${doc.documentType} for ${player}:`, moveResult.error)
          }
        } else if (location === 'root') {
          console.log(`📦 File in root folder, copying to requirement: ${fileId}`)

          const copyResponse = await fetch("/api/transfer/copy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileId }),
          })

          const copyResult = await copyResponse.json()

          if (copyResponse.ok && copyResult.success) {
            const newUrl = copyResult.newUrl || `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dqjcswchm'}/image/upload/${copyResult.copiedFileId}`

            movedDocs.push({
              documentType: doc.documentType,
              fileId,
              status: "copied",
              player: player,
              message: "Copied from root to requirement folder",
              newFileId: copyResult.copiedFileId,
              oldUrl: doc.documentURL,
              newUrl: newUrl,
            })
            console.log(`✅ Successfully copied ${doc.documentType} for ${player}`)

            // Optionally delete the original file from root
            try {
              const deleteResponse = await fetch("/api/transfer/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  fileId,
                  documentType: doc.documentType,
                  playerType: player,
                  reason: "original_in_root_copied_to_requirement"
                }),
              })

              if (deleteResponse.ok) {
                console.log(`✅ Deleted original file from root: ${fileId}`)
              }
            } catch (deleteError) {
              console.warn(`⚠️ Could not delete original file from root:`, deleteError)
            }
          } else {
            console.error(`Failed to copy ${doc.documentType} for ${player}:`, copyResult.error)
          }
        } else {
          console.log(`⚠️ Unknown location for ${fileId}, attempting copy as fallback`)

          const copyResponse = await fetch("/api/transfer/copy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileId }),
          })

          const copyResult = await copyResponse.json()

          if (copyResponse.ok && copyResult.success) {
            const newUrl = copyResult.newUrl || `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dqjcswchm'}/image/upload/${copyResult.copiedFileId}`

            movedDocs.push({
              documentType: doc.documentType,
              fileId,
              status: "copied_fallback",
              player: player,
              message: "Copied as fallback to requirement folder",
              newFileId: copyResult.copiedFileId,
              oldUrl: doc.documentURL,
              newUrl: newUrl,
            })
            console.log(`✅ Successfully copied ${doc.documentType} as fallback`)
          }
        }
      } catch (error) {
        console.error(`Error processing document ${doc.documentType}:`, error)
      }
    }
  }
  return movedDocs
}

const checkAndMoveDocuments = async (
  entry: IEntry,
  connectedPlayer1?: any,
  connectedPlayer2?: any,
  documentSelections: {
    player1?: DocumentSelection
    player2?: DocumentSelection
  } = {},
) => {
  try {
    const movedDocuments: ProcessedDocument[] = []
    const replacedDocuments: ProcessedDocument[] = []
    const deletedDocuments: ProcessedDocument[] = []

    // Track URL changes to update in the database
    const urlUpdates: { oldUrl: string; newUrl: string; documentType: string; player: string }[] = []

    // Process Player 1 documents
    if (
      entry.player1Entry?.validDocuments &&
      entry.player1Entry.validDocuments.length > 0
    ) {
      const player1Docs = entry.player1Entry.validDocuments

      // Check if player has existing documents in the database
      const hasExistingPlayer1Docs =
        connectedPlayer1?.validDocuments?.length > 0

      if (hasExistingPlayer1Docs) {
        console.log(
          `🔄 Player 1 has existing documents - processing documents...`,
        )

        // Step 1: Move all new documents to requirement folder
        const moved = await moveDocumentsToRequirements(player1Docs, "player1")
        movedDocuments.push(...moved)

        // Record URL changes from moved documents
        moved.forEach(doc => {
          if (doc.newUrl && doc.newUrl !== doc.oldUrl) {
            urlUpdates.push({
              oldUrl: doc.oldUrl!,
              newUrl: doc.newUrl!,
              documentType: doc.documentType,
              player: 'player1'
            })
            console.log(`📝 URL update needed for ${doc.documentType}:`, {
              old: doc.oldUrl,
              new: doc.newUrl
            })
          }
        })

        // Step 2: If we have document selections, handle replacements and deletions
        if (documentSelections.player1) {
          console.log(`🔄 Processing document selections for Player 1`)
          const player1Result = await replaceDocumentsInDrive(
            connectedPlayer1.validDocuments,
            player1Docs,
            "player1",
            documentSelections.player1,
          )

          if (player1Result.replacedDocuments) {
            replacedDocuments.push(...player1Result.replacedDocuments)
            // Record URL changes from replaced documents
            player1Result.replacedDocuments.forEach((doc: any) => {
              if (doc.newUrl && doc.oldUrl && doc.newUrl !== doc.oldUrl) {
                urlUpdates.push({
                  oldUrl: doc.oldUrl,
                  newUrl: doc.newUrl,
                  documentType: doc.documentType,
                  player: 'player1'
                })
                console.log(`📝 Replacement URL update for ${doc.documentType}:`, {
                  old: doc.oldUrl,
                  new: doc.newUrl
                })
              }
            })
          }

          if (player1Result.deletedDocuments) {
            deletedDocuments.push(...player1Result.deletedDocuments)
          }

          if (player1Result.failedReplacements?.length > 0) {
            console.warn(
              `⚠️ Some Player 1 documents failed to process:`,
              player1Result.failedReplacements,
            )
          }
        } else {
          // No document selections, process all documents with fallback behavior
          console.log(`📋 No document selections for Player 1, processing all documents`)
          const player1Result = await replaceDocumentsInDrive(
            connectedPlayer1.validDocuments,
            player1Docs,
            "player1",
          )

          if (player1Result.replacedDocuments) {
            replacedDocuments.push(...player1Result.replacedDocuments)
            // Record URL changes from replaced documents
            player1Result.replacedDocuments.forEach((doc: any) => {
              if (doc.newUrl && doc.oldUrl && doc.newUrl !== doc.oldUrl) {
                urlUpdates.push({
                  oldUrl: doc.oldUrl,
                  newUrl: doc.newUrl,
                  documentType: doc.documentType,
                  player: 'player1'
                })
                console.log(`📝 Replacement URL update for ${doc.documentType}:`, {
                  old: doc.oldUrl,
                  new: doc.newUrl
                })
              }
            })
          }

          if (player1Result.failedReplacements?.length > 0) {
            console.warn(
              `⚠️ Some Player 1 documents failed to process:`,
              player1Result.failedReplacements,
            )
          }
        }
      } else {
        console.log(
          `📦 Player 1 has NO existing documents - moving documents directly`,
        )
        const moved = await moveDocumentsToRequirements(player1Docs, "player1")
        movedDocuments.push(...moved)

        // Record URL changes for new player
        moved.forEach(doc => {
          if (doc.newUrl && doc.newUrl !== doc.oldUrl) {
            urlUpdates.push({
              oldUrl: doc.oldUrl!,
              newUrl: doc.newUrl!,
              documentType: doc.documentType,
              player: 'player1'
            })
            console.log(`📝 URL update needed for new player ${doc.documentType}:`, {
              old: doc.oldUrl,
              new: doc.newUrl
            })
          }
        })
      }
    }

    // Process Player 2 documents
    if (
      entry.player2Entry?.validDocuments &&
      entry.player2Entry.validDocuments.length > 0
    ) {
      const player2Docs = entry.player2Entry.validDocuments

      // Check if player has existing documents in the database
      const hasExistingPlayer2Docs =
        connectedPlayer2?.validDocuments?.length > 0

      if (hasExistingPlayer2Docs) {
        console.log(
          `🔄 Player 2 has existing documents - processing documents...`,
        )

        const moved = await moveDocumentsToRequirements(player2Docs, "player2")
        movedDocuments.push(...moved)

        // Record URL changes from moved documents
        moved.forEach(doc => {
          if (doc.newUrl && doc.newUrl !== doc.oldUrl) {
            urlUpdates.push({
              oldUrl: doc.oldUrl!,
              newUrl: doc.newUrl!,
              documentType: doc.documentType,
              player: 'player2'
            })
            console.log(`📝 URL update needed for ${doc.documentType}:`, {
              old: doc.oldUrl,
              new: doc.newUrl
            })
          }
        })

        if (documentSelections.player2) {
          console.log(`🔄 Processing document selections for Player 2`)
          const player2Result = await replaceDocumentsInDrive(
            connectedPlayer2.validDocuments,
            player2Docs,
            "player2",
            documentSelections.player2,
          )

          if (player2Result.replacedDocuments) {
            replacedDocuments.push(...player2Result.replacedDocuments)
            // Record URL changes from replaced documents
            player2Result.replacedDocuments.forEach((doc: any) => {
              if (doc.newUrl && doc.oldUrl && doc.newUrl !== doc.oldUrl) {
                urlUpdates.push({
                  oldUrl: doc.oldUrl,
                  newUrl: doc.newUrl,
                  documentType: doc.documentType,
                  player: 'player2'
                })
                console.log(`📝 Replacement URL update for ${doc.documentType}:`, {
                  old: doc.oldUrl,
                  new: doc.newUrl
                })
              }
            })
          }

          if (player2Result.deletedDocuments) {
            deletedDocuments.push(...player2Result.deletedDocuments)
          }

          if (player2Result.failedReplacements?.length > 0) {
            console.warn(
              `⚠️ Some Player 2 documents failed to process:`,
              player2Result.failedReplacements,
            )
          }
        } else {
          console.log(`📋 No document selections for Player 2, processing all documents`)
          const player2Result = await replaceDocumentsInDrive(
            connectedPlayer2.validDocuments,
            player2Docs,
            "player2",
          )

          if (player2Result.replacedDocuments) {
            replacedDocuments.push(...player2Result.replacedDocuments)
            // Record URL changes from replaced documents
            player2Result.replacedDocuments.forEach((doc: any) => {
              if (doc.newUrl && doc.oldUrl && doc.newUrl !== doc.oldUrl) {
                urlUpdates.push({
                  oldUrl: doc.oldUrl,
                  newUrl: doc.newUrl,
                  documentType: doc.documentType,
                  player: 'player2'
                })
                console.log(`📝 Replacement URL update for ${doc.documentType}:`, {
                  old: doc.oldUrl,
                  new: doc.newUrl
                })
              }
            })
          }

          if (player2Result.failedReplacements?.length > 0) {
            console.warn(
              `⚠️ Some Player 2 documents failed to process:`,
              player2Result.failedReplacements,
            )
          }
        }
      } else {
        console.log(
          `📦 Player 2 has NO existing documents - moving documents directly`,
        )
        const moved = await moveDocumentsToRequirements(player2Docs, "player2")
        movedDocuments.push(...moved)

        // Record URL changes for new player
        moved.forEach(doc => {
          if (doc.newUrl && doc.newUrl !== doc.oldUrl) {
            urlUpdates.push({
              oldUrl: doc.oldUrl!,
              newUrl: doc.newUrl!,
              documentType: doc.documentType,
              player: 'player2'
            })
            console.log(`📝 URL update needed for new player ${doc.documentType}:`, {
              old: doc.oldUrl,
              new: doc.newUrl
            })
          }
        })
      }
    }

    console.log(`📊 Document processing completed:`)
    console.log(`   - Moved: ${movedDocuments.length} documents`)
    console.log(`   - Replaced: ${replacedDocuments.length} documents`)
    console.log(`   - Deleted: ${deletedDocuments.length} documents`)
    console.log(`   - URL updates needed: ${urlUpdates.length} documents`)

    // Log all URL updates for debugging
    if (urlUpdates.length > 0) {
      console.log(`📝 URL updates to apply:`)
      urlUpdates.forEach(update => {
        console.log(`   - ${update.player}: ${update.documentType}`)
        console.log(`     Old: ${update.oldUrl}`)
        console.log(`     New: ${update.newUrl}`)
      })
    }

    return {
      moved: movedDocuments,
      replaced: replacedDocuments,
      deleted: deletedDocuments,
      urlUpdates, // Return URL updates to be applied
      total: movedDocuments.length + replacedDocuments.length + deletedDocuments.length,
    }
  } catch (error) {
    console.error("❌ Error in checkAndMoveDocuments:", error)
    return {
      moved: [],
      replaced: [],
      deleted: [],
      urlUpdates: [],
      total: 0,
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
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (selections: DocumentSelection) => void
  existingDocuments: DocumentInfo[]
  newDocuments: DocumentInfo[]
  playerName: string
  isLoading: boolean
}) => {
  const [selections, setSelections] = useState<DocumentSelection>({})
  const [expandedPreview, setExpandedPreview] = useState<{
    url: string
    type: string
    source: "existing" | "new"
  } | null>(null)

  useEffect(() => {
    if (open) {
      const initialSelections: DocumentSelection = {}

      const groupId = "all-documents"
      initialSelections[groupId] = {
        selectedSource: "",
        existingDocs: existingDocuments,
        newDocs: newDocuments,
      }

      setSelections(initialSelections)
    } else {
      setSelections({})
    }
  }, [open, existingDocuments, newDocuments])

  const handleSave = () => {
    const allSelected = Object.values(selections).every(
      (selection) => selection.selectedSource !== "",
    )

    if (!allSelected) {
      toast.error("Please make a selection for all documents before saving")
      return
    }

    onSave(selections)
    onOpenChange(false)
  }

  const getFileType = (url: string): string => {
    if (!url) return "unknown"

    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname

      if (url.includes("drive.google.com")) {
        return "googleDrive"
      }

      const pathParts = pathname.split(".")
      if (pathParts.length > 1) {
        const extension = pathParts.pop()?.toLowerCase() || ""

        if (
          ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(extension)
        ) {
          return "image"
        } else if (["pdf"].includes(extension)) {
          return "pdf"
        } else if (["doc", "docx"].includes(extension)) {
          return "doc"
        } else if (["txt"].includes(extension)) {
          return "text"
        }
      }
    } catch (e) {
      console.error("Error parsing URL:", e)
    }

    return "image"
  }

  const getGoogleDrivePreviewUrl = (url: string): string => {
    if (!url) return ""

    try {
      const urlObj = new URL(url)
      const fileId = urlObj.searchParams.get("id")

      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`
      }

      const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`
      }
    } catch (e) {
      console.error("Error parsing URL:", e)
    }

    return url
  }

  const renderDocumentPreview = (
    doc: DocumentInfo,
    source: "existing" | "new",
  ) => {
    const fileType = getFileType(doc.documentURL)
    const isGoogleDrive = fileType === "googleDrive"
    const previewUrl = isGoogleDrive
      ? getGoogleDrivePreviewUrl(doc.documentURL)
      : doc.documentURL
    const documentTypeName = doc.documentType.replaceAll("_", " ")

    return (
      <div className="relative w-110 h-95 rounded-lg overflow-hidden bg-gray-50 border">
        <div className="absolute top-2 left-2 right-2 z-10">
          <div className="bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-md text-center backdrop-blur-sm">
            {documentTypeName}
          </div>
        </div>

        {fileType === "image" ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={doc.documentURL}
              alt={documentTypeName}
              className="max-w-full max-h-full object-contain"
              onClick={() =>
                setExpandedPreview({
                  url: doc.documentURL,
                  type: documentTypeName,
                  source,
                })
              }
            />
          </div>
        ) : isGoogleDrive ? (
          <div className="w-full h-full p-4">
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              title={`${source === "existing" ? "Existing" : "New"}: ${documentTypeName}`}
              sandbox="allow-same-origin allow-scripts"
              loading="lazy"
              allowFullScreen
            />
          </div>
        ) : fileType === "pdf" ? (
          <div className="w-full h-full p-4">
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(doc.documentURL)}&embedded=true`}
              className="w-full h-full border-0"
              title={`PDF: ${documentTypeName}`}
              loading="lazy"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <File className="h-16 w-16 text-blue-500 mb-2" />
            <span className="text-sm font-medium text-gray-700 text-center">
              {documentTypeName}
            </span>
          </div>
        )}
      </div>
    )
  }

  const totalExisting = existingDocuments.length
  const totalNew = newDocuments.length
  const totalDocuments = totalExisting + totalNew

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl! max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Select Documents for {playerName}
          </DialogTitle>
          <DialogDescription className="text-sm">
            Choose which version to keep for each document
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
                  <h3 className="font-semibold text-md">
                    {expandedPreview.type}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {expandedPreview.source === "existing"
                      ? "Existing Document"
                      : "New Document"}
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
            <div className="h-[60vh] overflow-y-auto pr-2">
              <div className="space-y-6">
                {Object.entries(selections).map(([groupId, selection]) => {
                  const hasExisting =
                    selection.existingDocs && selection.existingDocs.length > 0
                  const hasNew =
                    selection.newDocs && selection.newDocs.length > 0

                  return (
                    <div key={groupId} className="space-y-4">
                      <div className="flex flex-col space-y-4 bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-base">
                            Select Documents
                          </h3>
                          <span className="text-sm text-gray-500">
                            {totalDocuments} documents total
                          </span>
                        </div>

                        <RadioGroup
                          value={selection.selectedSource}
                          onValueChange={(value) => {
                            setSelections((prev) => ({
                              ...prev,
                              [groupId]: {
                                ...prev[groupId],
                                selectedSource: value,
                              },
                            }))
                          }}
                          className="flex flex-row gap-76 ml-5"
                        >
                          <div className="flex flex-col space-y-3">
                            <h4 className="font-medium text-sm text-gray-700 mb-1">
                              Existing Documents ({totalExisting})
                            </h4>
                            {hasExisting &&
                              selection.existingDocs.map((doc, index) => {
                                const optionId = `existing-${index}`
                                const documentTypeName =
                                  doc.documentType.replaceAll("_", " ")
                                const label =
                                  totalExisting > 1
                                    ? `${documentTypeName} (Document ${index + 1})`
                                    : documentTypeName

                                return (
                                  <div
                                    key={optionId}
                                    className="flex items-start space-x-3"
                                  >
                                    <RadioGroupItem
                                      value={`existing-${index}`}
                                      id={optionId}
                                      className="h-4 w-4 mt-0.5"
                                    />
                                    <div className="flex flex-col">
                                      <Label
                                        htmlFor={optionId}
                                        className="cursor-pointer text-sm font-medium"
                                      >
                                        {label}
                                      </Label>
                                      <span className="text-xs text-gray-500 mt-0.5">
                                        Existing version
                                      </span>
                                    </div>
                                  </div>
                                )
                              })}
                          </div>

                          <div className="flex flex-col space-y-3">
                            <h4 className="font-medium text-sm text-gray-700 mb-1">
                              New Documents ({totalNew})
                            </h4>
                            {hasNew &&
                              selection.newDocs.map((doc, index) => {
                                const optionId = `new-${index}`
                                const documentTypeName =
                                  doc.documentType.replaceAll("_", " ")
                                const label =
                                  totalNew > 1
                                    ? `${documentTypeName} (Document ${index + 1})`
                                    : documentTypeName

                                return (
                                  <div
                                    key={optionId}
                                    className="flex items-start space-x-3"
                                  >
                                    <RadioGroupItem
                                      value={`new-${index}`}
                                      id={optionId}
                                      className="h-4 w-4 mt-0.5"
                                    />
                                    <div className="flex flex-col">
                                      <Label
                                        htmlFor={optionId}
                                        className="cursor-pointer text-sm font-medium"
                                      >
                                        {label}
                                      </Label>
                                      <span className="text-xs text-gray-500 mt-0.5">
                                        New version from entry
                                      </span>
                                    </div>
                                  </div>
                                )
                              })}
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        {hasExisting && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm text-gray-700">
                                Existing Documents ({totalExisting})
                              </h4>
                              {totalExisting > 1 && (
                                <span className="text-xs text-gray-500">
                                  Hover to see document type
                                </span>
                              )}
                            </div>
                            <div
                              className={`grid ${selection.existingDocs.length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-4`}
                            >
                              {selection.existingDocs.map((doc, index) => (
                                <div key={index} className="space-y-2 group">
                                  {renderDocumentPreview(doc, "existing")}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {hasNew && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm text-gray-700">
                                New Documents ({totalNew})
                              </h4>
                              {totalNew > 1 && (
                                <span className="text-xs text-gray-500">
                                  Hover to see document type
                                </span>
                              )}
                            </div>
                            <div
                              className={`grid ${selection.newDocs.length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-4`}
                            >
                              {selection.newDocs.map((doc, index) => (
                                <div key={index} className="space-y-2 group">
                                  {renderDocumentPreview(doc, "new")}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-sm text-center pt-4">
                        {selection.selectedSource ? (
                          (() => {
                            const [source, index] =
                              selection.selectedSource.split("-")
                            const isExisting = source === "existing"
                            const docIndex = parseInt(index)
                            const doc = isExisting
                              ? selection.existingDocs[docIndex]
                              : selection.newDocs[docIndex]

                            if (!doc) return null

                            const documentTypeName =
                              doc.documentType.replaceAll("_", " ")

                            if (isExisting) {
                              return (
                                <p className="text-green-800 bg-green-50 p-3 rounded">
                                  <Check className="h-4 w-4 inline mr-2" />
                                  <span>
                                    Existing {documentTypeName} will be kept
                                  </span>
                                </p>
                              )
                            } else {
                              const hasExistingDocs =
                                selection.existingDocs &&
                                selection.existingDocs.length > 0
                              const existingDocOfSameType =
                                selection.existingDocs.find(
                                  (existing) =>
                                    existing.documentType === doc.documentType,
                                )

                              return (
                                <p
                                  className={cn(
                                    "p-3 rounded",
                                    existingDocOfSameType
                                      ? "text-amber-800 bg-amber-50"
                                      : "text-blue-800 bg-blue-50",
                                  )}
                                >
                                  {existingDocOfSameType ? (
                                    <>
                                      <AlertCircle className="h-4 w-4 inline mr-2" />
                                      <span>
                                        New {documentTypeName} will replace
                                        existing
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Check className="h-4 w-4 inline mr-2" />
                                      <span>
                                        New {documentTypeName} will be added
                                      </span>
                                    </>
                                  )}
                                </p>
                              )
                            }
                          })()
                        ) : (
                          <p className="text-gray-600 bg-gray-50 p-3 rounded">
                            <AlertCircle className="h-4 w-4 inline mr-2" />
                            <span>Please select a document option</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}

                {Object.keys(selections).length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-20 w-20 mx-auto text-gray-300 mb-5" />
                    <p className="text-xl text-gray-600 font-medium">
                      No documents to select
                    </p>
                    <p className="text-base text-gray-500 mt-2 max-w-md mx-auto">
                      There are no documents that need selection for this
                      player.
                    </p>
                  </div>
                )}
              </div>
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
  )
}

const AssignDialog = (props: Props) => {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [showDocumentSelection1, setShowDocumentSelection1] = useState(false)
  const [showDocumentSelection2, setShowDocumentSelection2] = useState(false)
  const [documentSelections, setDocumentSelections] = useState<{
    player1?: DocumentSelection
    player2?: DocumentSelection
  }>({})
  const [suggestedPlayers1, setSuggestedPlayers1] = useState<SuggestPlayer[]>(
    [],
  )
  const [suggestedPlayers2, setSuggestedPlayers2] = useState<SuggestPlayer[]>(
    [],
  )
  const [isLoadingSuggestions1, setIsLoadingSuggestions1] = useState(false)
  const [isLoadingSuggestions2, setIsLoadingSuggestions2] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    player1?: string
    player2?: string
  }>({})
  const [activeTab, setActiveTab] = useState<string>("player1")

  const [assignPlayers, { loading: assignLoading }] =
    useMutation(ASSIGN_PLAYERS)
  const [updateDocumentUrls] = useMutation(UPDATE_DOCUMENT_URLS)
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
    },
  )
  const [fetchSuggestions1, { loading: suggestions1Loading }] =
    useLazyQuery<SuggestPlayersResponse>(SUGGEST_PLAYERS)

  const [fetchSuggestions2, { loading: suggestions2Loading }] =
    useLazyQuery<SuggestPlayersResponse>(SUGGEST_PLAYERS)
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
        if (
          fieldApi.name.includes("connectedPlayer") ||
          fieldApi.name.includes("isPlayer")
        ) {
          setValidationErrors({})
        }

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
          setDocumentSelections((prev) => ({ ...prev, player1: undefined }))
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
          setDocumentSelections((prev) => ({ ...prev, player2: undefined }))
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
              }),
          )
        }
      },
    },
    // Before sa naay updateEntryDocumentUrls in March 20, 2026
    // onSubmit: ({ value: payload, formApi }) =>
    //   startTransition(async () => {
    //     try {
    //       const finalPayload = {
    //         ...payload,
    //       }

    //       if (entry) {
    //         try {
    //           const documentResult = await checkAndMoveDocuments(
    //             entry,
    //             player1,
    //             player2,
    //             documentSelections,
    //           )

    //           if (documentResult.total > 0) {
    //             const messages: string[] = []

    //             if (documentResult.replaced.length > 0) {
    //               messages.push(
    //                 `Replaced ${documentResult.replaced.length} document(s)`,
    //               )
    //             }

    //             if (documentResult.moved.length > 0) {
    //               const movedCount = documentResult.moved.filter(
    //                 (d) => d.status !== "already_exists",
    //               ).length
    //               const alreadyExistsCount = documentResult.moved.filter(
    //                 (d) => d.status === "already_exists",
    //               ).length

    //               if (movedCount > 0) {
    //                 messages.push(`Added ${movedCount} new document(s)`)
    //               }

    //               if (alreadyExistsCount > 0) {
    //                 messages.push(
    //                   `${alreadyExistsCount} document(s) already in requirement folder`,
    //                 )
    //               }
    //             }

    //             if (messages.length > 0) {
    //               toast.success(`Documents processed: ${messages.join(", ")}`, {
    //                 duration: 5000,
    //               })
    //             }
    //           }
    //         } catch (documentError: any) {
    //           toast.warning(
    //             "Some documents could not be processed, but players will still be assigned",
    //             {
    //               duration: 4000,
    //             },
    //           )
    //         }
    //       }

    //       const response: any = await assignPlayers({
    //         variables: {
    //           input: finalPayload,
    //         },
    //       })

    //       if (response?.data?.assignPlayers?.ok) {
    //         onClose()

    //         toast.success(
    //           response.data.assignPlayers.message ||
    //           "Players assigned successfully",
    //           {
    //             duration: 3000,
    //           },
    //         )
    //       } else {
    //         toast.error(
    //           response?.data?.assignPlayers?.message ||
    //           "Failed to assign players",
    //           {
    //             duration: 3000,
    //           },
    //         )
    //       }
    //     } catch (error: any) {
    //       toast.error(error.message || "Failed to assign players", {
    //         duration: 3000,
    //       })

    //       if (error.name == "CombinedGraphQLErrors") {
    //         const fieldErrors = error.errors[0]?.extensions?.fields
    //         if (fieldErrors) {
    //           fieldErrors.map(
    //             ({ path, message }: { path: string; message: string }) =>
    //               formApi.fieldInfo[
    //                 path as keyof typeof formApi.fieldInfo
    //               ].instance?.setErrorMap({
    //                 onSubmit: { message },
    //               }),
    //           )
    //         }
    //       }
    //     }
    //   }),

    onSubmit: ({ value: payload, formApi }) =>
      startTransition(async () => {
        try {
          const finalPayload = {
            ...payload,
          }

          let urlUpdates: any[] = []

          if (entry) {
            try {
              const documentResult = await checkAndMoveDocuments(
                entry,
                player1,
                player2,
                documentSelections,
              )

              // Store URL updates from the document processing
              urlUpdates = documentResult.urlUpdates || []

              if (documentResult.total > 0) {
                const messages: string[] = []

                if (documentResult.replaced.length > 0) {
                  messages.push(
                    `Replaced ${documentResult.replaced.length} document(s)`,
                  )
                }

                if (documentResult.moved.length > 0) {
                  const movedCount = documentResult.moved.filter(
                    (d) => d.status !== "already_exists",
                  ).length
                  const alreadyExistsCount = documentResult.moved.filter(
                    (d) => d.status === "already_exists",
                  ).length

                  if (movedCount > 0) {
                    messages.push(`Added ${movedCount} new document(s)`)
                  }

                  if (alreadyExistsCount > 0) {
                    messages.push(
                      `${alreadyExistsCount} document(s) already in requirement folder`,
                    )
                  }
                }

                if (messages.length > 0) {
                  toast.success(`Documents processed: ${messages.join(", ")}`, {
                    duration: 5000,
                  })
                }
              }
            } catch (documentError: any) {
              console.error("Document processing error:", documentError)
              toast.warning(
                "Some documents could not be processed, but players will still be assigned",
                {
                  duration: 4000,
                },
              )
            }
          }

          // First assign players
          const response: any = await assignPlayers({
            variables: {
              input: finalPayload,
            },
          })

          if (response?.data?.assignPlayers?.ok) {
            // After successful assignment, update document URLs if needed
            if (urlUpdates && urlUpdates.length > 0) {
              console.log(`📝 Updating ${urlUpdates.length} document URLs in database...`)

              try {
                // Prepare the updates for the mutation
                const updatesForMutation = urlUpdates.map((update: any) => ({
                  documentType: update.documentType,
                  oldUrl: update.oldUrl,
                  newUrl: update.newUrl,
                  playerType: update.player,
                }))

                const urlUpdateResult = await updateDocumentUrls({
                  variables: {
                    input: {
                      entryId: entry?._id,
                      player1Id: player1?._id || null,
                      player2Id: player2?._id || null,
                      updates: updatesForMutation,
                    },
                  },
                })

                if ((urlUpdateResult.data as any)?.updateEntryDocumentUrls?.ok) {
                  toast.success(`Updated ${urlUpdates.length} document URL(s)`, {
                    duration: 3000,
                  })
                  console.log(`✅ Successfully updated ${urlUpdates.length} document URLs`)
                } else {
                  console.warn("Failed to update document URLs:", urlUpdateResult)
                  toast.warning("Document URLs could not be updated", {
                    duration: 4000,
                  })
                }
              } catch (urlError) {
                console.error("Error updating document URLs:", urlError)
                toast.warning("Players assigned but document URLs could not be updated", {
                  duration: 4000,
                })
              }
            }

            onClose()

            toast.success(
              response.data.assignPlayers.message ||
              "Players assigned successfully",
              {
                duration: 3000,
              },
            )
          } else {
            toast.error(
              response?.data?.assignPlayers?.message ||
              "Failed to assign players",
              {
                duration: 3000,
              },
            )
          }
        } catch (error: any) {
          console.error("Assignment error:", error)
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
                  }),
              )
            }
          }
        }
      }),
  })

  const fetchPlayer1Suggestions = async () => {
    if (!entry?.player1Entry) {
      return
    }

    const { firstName, lastName, birthDate } = entry.player1Entry

    if (!firstName || !lastName || !birthDate) {
      return
    }

    setIsLoadingSuggestions1(true)
    try {
      const { data, error } = await fetchSuggestions1({
        variables: {
          input: {
            firstName,
            lastName,
            birthDate:
              birthDate instanceof Date ? birthDate.toISOString() : birthDate,
          },
        },
      })

      setSuggestedPlayers1(data?.suggestPlayers || [])
    } catch (error) {
      console.error("Error fetching suggestions for Player 1:", error)
    } finally {
      setIsLoadingSuggestions1(false)
    }
  }

  const fetchPlayer2Suggestions = async () => {
    if (!entry?.player2Entry) return

    const { firstName, lastName, birthDate } = entry.player2Entry
    if (!firstName || !lastName || !birthDate) return

    setIsLoadingSuggestions2(true)
    try {
      const { data } = await fetchSuggestions2({
        variables: {
          input: {
            firstName,
            lastName,
            birthDate,
          },
        },
      })
      setSuggestedPlayers2(data?.suggestPlayers || [])
    } catch (error) {
      console.error("Error fetching suggestions for Player 2:", error)
    } finally {
      setIsLoadingSuggestions2(false)
    }
  }

  useEffect(() => {
    if (open) {
      if (entry?.player1Entry) {
        fetchPlayer1Suggestions()
      }
      if (entry?.player2Entry) {
        fetchPlayer2Suggestions()
      }
    }
  }, [open, entry?.player1Entry, entry?.player2Entry])

  const onClose = () => {
    form.reset()
    setDocumentSelections({})
    setSuggestedPlayers1([])
    setSuggestedPlayers2([])
    setValidationErrors({})
    setOpen(false)
    props.onClose?.()
  }

  const handleDocumentSelection1 = () => {
    setShowDocumentSelection1(true)
  }

  const handleDocumentSelection2 = () => {
    setShowDocumentSelection2(true)
  }

  const handleSaveDocumentSelections1 = (selections: DocumentSelection) => {
    setDocumentSelections((prev) => ({ ...prev, player1: selections }))
    form.setFieldValue("migratePlayer1Data.validDocuments", true)
    toast.success("Document selections saved for Player 1", {
      duration: 3000,
    })
  }

  const handleSaveDocumentSelections2 = (selections: DocumentSelection) => {
    setDocumentSelections((prev) => ({ ...prev, player2: selections }))
    form.setFieldValue("migratePlayer2Data.validDocuments", true)
    toast.success("Document selections saved for Player 2", {
      duration: 3000,
    })
  }

  const getPlayer1ExistingDocuments = (): DocumentInfo[] => {
    if (!player1?.validDocuments) return []
    return player1.validDocuments.map((doc: any) => ({
      documentType: doc.documentType,
      documentURL: doc.documentURL,
      dateUploaded: doc.dateUploaded,
      player: "Player 1",
      source: "existing",
    }))
  }

  const getPlayer1NewDocuments = (): DocumentInfo[] => {
    if (!entry?.player1Entry?.validDocuments) return []
    return entry.player1Entry.validDocuments.map((doc) => ({
      documentType: doc.documentType,
      documentURL: doc.documentURL,
      dateUploaded: doc.dateUploaded,
      player: "Player 1",
      source: "new",
    }))
  }

  const getPlayer2ExistingDocuments = (): DocumentInfo[] => {
    if (!player2?.validDocuments) return []
    return player2.validDocuments.map((doc: any) => ({
      documentType: doc.documentType,
      documentURL: doc.documentURL,
      dateUploaded: doc.dateUploaded,
      player: "Player 2",
      source: "existing",
    }))
  }

  const getPlayer2NewDocuments = (): DocumentInfo[] => {
    if (!entry?.player2Entry?.validDocuments) return []
    return entry.player2Entry.validDocuments.map((doc) => ({
      documentType: doc.documentType,
      documentURL: doc.documentURL,
      dateUploaded: doc.dateUploaded,
      player: "Player 2",
      source: "new",
    }))
  }

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
    setValidationErrors({})

    const needsPlayer1Selection =
      !form.getFieldValue("isPlayer1New") &&
      form.getFieldValue("connectedPlayer1") &&
      hasPlayer1DocumentsToSelect() &&
      !documentSelections.player1

    const needsPlayer2Selection =
      !form.getFieldValue("isPlayer2New") &&
      form.getFieldValue("connectedPlayer2") &&
      hasPlayer2DocumentsToSelect() &&
      !documentSelections.player2

    if (needsPlayer1Selection) {
      setShowDocumentSelection1(true)
      return
    } else if (needsPlayer2Selection) {
      setShowDocumentSelection2(true)
      return
    } else {
      const player1Config = {
        isNew: form.getFieldValue("isPlayer1New"),
        connected: form.getFieldValue("connectedPlayer1"),
        hasDocuments: hasPlayer1DocumentsToSelect(),
        hasSelections: !!documentSelections.player1,
      }

      const player2Config = {
        isNew: form.getFieldValue("isPlayer2New"),
        connected: form.getFieldValue("connectedPlayer2"),
        hasDocuments: hasPlayer2DocumentsToSelect(),
        hasSelections: !!documentSelections.player2,
      }

      if (!player1Config.isNew && !player1Config.connected) {
        toast.error("Please assign the Player 1 or mark as New Player", {
          duration: 3000,
        })
        setValidationErrors((prev) => ({
          ...prev,
          player1: "Player 1 is not assigned",
        }))
        return
      }

      if (
        !player1Config.isNew &&
        player1Config.connected &&
        player1Config.hasDocuments &&
        !player1Config.hasSelections
      ) {
        toast.error("Please complete document selection for Player 1", {
          duration: 3000,
        })
        return
      }

      if (entry?.player2Entry) {
        if (!player2Config.isNew && !player2Config.connected) {
          toast.error("Please assign the Player 2 or mark as New Player", {
            duration: 3000,
          })
          setValidationErrors((prev) => ({
            ...prev,
            player2: "Player 2 is not assigned",
          }))
          return
        }

        if (
          !player2Config.isNew &&
          player2Config.connected &&
          player2Config.hasDocuments &&
          !player2Config.hasSelections
        ) {
          toast.error("Please complete document selection for Player 2", {
            duration: 3000,
          })
          return
        }
      }

      form.handleSubmit()
    }
  }

  const renderTabContent = (tab: "player1" | "player2") => {
    const suggestions =
      tab === "player1" ? suggestedPlayers1 : suggestedPlayers2
    const isLoadingSuggestions =
      tab === "player1" ? isLoadingSuggestions1 : isLoadingSuggestions2
    const hasSuggestions = suggestions.length > 0
    const isNewPlayer = form.getFieldValue(
      `is${tab === "player1" ? "Player1" : "Player2"}New`,
    )

    const shouldShowTwoColumnLayout = hasSuggestions && !isNewPlayer

    if (shouldShowTwoColumnLayout) {
      return (
        <div className="flex gap-6">
          <div className="w-3/4!">
            <FieldSet className="flex flex-col gap-2.5 h-[75vh] overflow-y-auto pr-2">
              <form.Field
                name={`is${tab === "player1" ? "Player1" : "Player2"}New`}
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  const hasError =
                    validationErrors[tab === "player1" ? "player1" : "player2"]

                  return (
                    <Field data-invalid={isInvalid || hasError}>
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
                          aria-invalid={
                            Boolean(isInvalid || hasError) ? "true" : "false"
                          }
                          disabled={isLoading}
                        />
                        <div className="grid">
                          <FieldLabel
                            htmlFor={field.name}
                            className={hasError ? "text-destructive" : ""}
                          >
                            Is New Player? (
                            {tab === "player1" ? "Player 1" : "Player 2"})
                            {hasError && (
                              <span className="text-destructive ml-1">*</span>
                            )}
                          </FieldLabel>
                          <span className="text-muted-foreground text-xs">
                            Checking this will create a new player profile.
                          </span>
                        </div>
                      </div>

                      {(isInvalid || hasError) && (
                        <FieldError
                          errors={
                            hasError
                              ? [{ message: hasError }]
                              : field.state.meta.errors
                          }
                        />
                      )}
                    </Field>
                  )
                }}
              />

              {!form.getFieldValue(
                `is${tab === "player1" ? "Player1" : "Player2"}New`,
              ) &&
                form.getFieldValue(
                  `connected${tab === "player1" ? "Player1" : "Player2"}`,
                ) &&
                (tab === "player1"
                  ? hasPlayer1DocumentsToSelect()
                  : hasPlayer2DocumentsToSelect()) && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">
                          Document Selection
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Choose which documents to keep for{" "}
                          {tab === "player1" ? "Player 1" : "Player 2"}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          tab === "player1"
                            ? handleDocumentSelection1()
                            : handleDocumentSelection2()
                        }}
                        disabled={isLoading}
                        type="button"
                      >
                        {(
                          tab === "player1"
                            ? documentSelections.player1
                            : documentSelections.player2
                        )
                          ? "Edit Selection"
                          : "Select Documents"}
                      </Button>
                    </div>
                    {(
                      tab === "player1"
                        ? documentSelections.player1
                        : documentSelections.player2
                    ) ? (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-green-600" />
                            <div>
                              <p className="text-sm font-medium text-blue-800">
                                Document selections saved
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={
                              tab === "player1"
                                ? handleDocumentSelection1
                                : handleDocumentSelection2
                            }
                            className="text-xs"
                            type="button"
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
                            <p className="text-sm font-medium text-amber-800">
                              Document Selection Required
                            </p>
                            <p className="text-xs text-amber-600">
                              Click "Select Documents" to choose which documents
                              to keep
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {!form.getFieldValue(
                `is${tab === "player1" ? "Player1" : "Player2"}New`,
              ) && (
                  <>
                    <form.Field
                      name={`connected${tab === "player1" ? "Player1" : "Player2"}`}
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched && !field.state.meta.isValid
                        const hasError =
                          validationErrors[
                          tab === "player1" ? "player1" : "player2"
                          ]

                        return (
                          <Field data-invalid={isInvalid || hasError}>
                            <div className="flex items-center justify-between">
                              <FieldLabel
                                htmlFor={field.name}
                                className={hasError ? "text-destructive" : ""}
                              >
                                Connected{" "}
                                {tab === "player1" ? "Player 1" : "Player 2"}
                                {hasError && (
                                  <span className="text-destructive ml-1">*</span>
                                )}
                              </FieldLabel>
                              {hasError && (
                                <span className="text-xs text-destructive">
                                  {hasError}
                                </span>
                              )}
                            </div>
                            <Popover
                              open={
                                tab === "player1" ? openPlayers1 : openPlayers2
                              }
                              onOpenChange={
                                tab === "player1"
                                  ? setOpenPlayers1
                                  : setOpenPlayers2
                              }
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  id={field.name}
                                  name={field.name}
                                  disabled={optionsLoading}
                                  aria-expanded={
                                    tab === "player1"
                                      ? openPlayers1
                                      : openPlayers2
                                  }
                                  onBlur={field.handleBlur}
                                  variant="outline"
                                  role="combobox"
                                  aria-invalid={
                                    Boolean(isInvalid || hasError)
                                      ? "true"
                                      : "false"
                                  }
                                  className={cn(
                                    "w-full justify-between font-normal capitalize -mt-2",
                                    !field.state.value && "text-muted-foreground",
                                    hasError &&
                                    "border-destructive focus-visible:ring-destructive",
                                  )}
                                  type="button"
                                >
                                  {field.state.value
                                    ? players.find(
                                      (o: { value: string; label: string }) =>
                                        o.value === field.state.value,
                                    )?.label
                                    : `Select ${tab === "player1" ? "Player 1" : "Player 2"}`}
                                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0 max-h-80" onWheel={(e) => e.stopPropagation()}>
                                <Command
                                  filter={(value, search) =>
                                    players
                                      .find(
                                        (t: { value: string; label: string }) =>
                                          t.value === value,
                                      )
                                      ?.label.toLowerCase()
                                      .includes(search.toLowerCase())
                                      ? 1
                                      : 0
                                  }
                                >
                                  <CommandInput
                                    placeholder={`Select ${tab === "player1" ? "Player 1" : "Player 2"}`}
                                  />
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
                                              field.handleChange(v.toString())
                                              tab === "player1"
                                                ? setOpenPlayers1(false)
                                                : setOpenPlayers2(false)
                                            }}
                                            className="capitalize"
                                          >
                                            <CheckIcon
                                              className={cn(
                                                "h-4 w-4",
                                                field.state.value === o.value
                                                  ? "opacity-100"
                                                  : "opacity-0",
                                              )}
                                            />
                                            {o.label}
                                          </CommandItem>
                                        ),
                                      )}
                                    </CommandGroup>
                                    <CommandEmpty>No players found.</CommandEmpty>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            {(isInvalid || hasError) && (
                              <FieldError
                                errors={
                                  hasError
                                    ? [{ message: hasError }]
                                    : field.state.meta.errors
                                }
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
                          Checked fields will update the player database with
                          entry data.
                        </span>
                      </div>
                      <div className="flex items-center w-full gap-2">
                        <div className="h-full flex items-center justify-center">
                          <Checkbox
                            disabled={
                              isLoading ||
                              !form.getFieldValue(
                                `connected${tab === "player1" ? "Player1" : "Player2"}`,
                              )
                            }
                            onCheckedChange={(checked) => {
                              form.setFieldValue(
                                `migrate${tab === "player1" ? "Player1" : "Player2"}Data`,
                                {
                                  firstName: checked === true,
                                  middleName: checked === true,
                                  lastName: checked === true,
                                  suffix: checked === true,
                                  birthDate: checked === true,
                                  phoneNumber: checked === true,
                                  email: checked === true,
                                  validDocuments: checked === true,
                                },
                              )
                              if (checked) {
                                setTimeout(() => {
                                  tab === "player1"
                                    ? handleDocumentSelection1()
                                    : handleDocumentSelection2()
                                }, 100)
                              }
                            }}
                          />
                        </div>
                        <div className="text-xs grid grid-cols-5 col-span-2 h-full w-full">
                          <div className="px-2 h-full border w-full flex items-center justify-center min-h-8"></div>
                          <span
                            className={cn(
                              "px-2 h-full border w-full flex items-center justify-center",
                              form.getFieldValue(
                                `connected${tab === "player1" ? "Player1" : "Player2"}`,
                              )
                                ? "col-span-2"
                                : "hidden",
                            )}
                          >
                            From Database (Current)
                          </span>{" "}
                          <span
                            className={cn(
                              "px-2 h-full border w-full flex items-center justify-center",
                              form.getFieldValue(
                                `connected${tab === "player1" ? "Player1" : "Player2"}`,
                              )
                                ? "col-span-2"
                                : "col-span-4",
                            )}
                          >
                            From Entry (New)
                          </span>
                        </div>
                      </div>
                      <div>
                        <form.Field
                          name={`migrate${tab === "player1" ? "Player1" : "Player2"}Data.firstName`}
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
                                        field.handleChange(checked === true)
                                      }
                                      aria-invalid={isInvalid}
                                      disabled={
                                        isLoading ||
                                        !form.getFieldValue(
                                          `connected${tab === "player1" ? "Player1" : "Player2"}`,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="text-xs grid grid-cols-5 col-span-2 min-h-8 w-full">
                                    <span className="px-2 h-full border w-full flex items-center justify-center py-1 text-center">
                                      First Name
                                    </span>
                                    {form.getFieldValue(
                                      `connected${tab === "player1" ? "Player1" : "Player2"}`,
                                    ) ? (
                                      <>
                                        <span
                                          className={cn(
                                            !field.state.value &&
                                            "text-success bg-success/5",
                                            "col-span-2 px-2 h-full border w-full flex items-center justify-start py-1",
                                          )}
                                        >
                                          {tab === "player1"
                                            ? player1?.firstName
                                            : player2?.firstName}
                                        </span>{" "}
                                        <span
                                          className={cn(
                                            field.state.value &&
                                            "text-warning bg-warning/5",
                                            "col-span-2 px-2 h-full border w-full flex items-center justify-start py-1",
                                          )}
                                        >
                                          {tab === "player1"
                                            ? entry?.player1Entry.firstName
                                            : entry?.player2Entry?.firstName}
                                        </span>
                                      </>
                                    ) : (
                                      <span
                                        className={cn(
                                          field.state.value && "text-warning",
                                          "col-span-4 px-2 h-full border w-full flex items-center justify-start",
                                        )}
                                      >
                                        {tab === "player1"
                                          ? entry?.player1Entry.firstName
                                          : entry?.player2Entry?.firstName}
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
                          name={`migrate${tab === "player1" ? "Player1" : "Player2"}Data.middleName`}
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
                                        field.handleChange(checked === true)
                                      }
                                      aria-invalid={isInvalid}
                                      disabled={
                                        isLoading ||
                                        !form.getFieldValue(
                                          `connected${tab === "player1" ? "Player1" : "Player2"}`,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                    <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                      Middle Name
                                    </span>
                                    {form.getFieldValue(
                                      `connected${tab === "player1" ? "Player1" : "Player2"}`,
                                    ) ? (
                                      <>
                                        <span
                                          className={cn(
                                            !field.state.value &&
                                            "text-success bg-success/5",
                                            "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                            !(tab === "player1"
                                              ? player1?.middleName
                                              : player2?.middleName) && "italic",
                                          )}
                                        >
                                          {tab === "player1"
                                            ? player1?.middleName || "N/A"
                                            : player2?.middleName || "N/A"}
                                        </span>{" "}
                                        <span
                                          className={cn(
                                            field.state.value &&
                                            "text-warning bg-warning/5",
                                            "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                            !(tab === "player1"
                                              ? player1?.middleName
                                              : player2?.middleName) && "italic",
                                          )}
                                        >
                                          {tab === "player1"
                                            ? entry?.player1Entry.middleName ||
                                            "N/A"
                                            : entry?.player2Entry?.middleName ||
                                            "N/A"}
                                        </span>
                                      </>
                                    ) : (
                                      <span
                                        className={cn(
                                          field.state.value && "text-warning",
                                          "col-span-4 px-2 border w-full flex items-center justify-start py-1",
                                          !(tab === "player1"
                                            ? player1?.middleName
                                            : player2?.middleName) && "italic",
                                        )}
                                      >
                                        {tab === "player1"
                                          ? entry?.player1Entry.middleName ||
                                          "N/A"
                                          : entry?.player2Entry?.middleName ||
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
                          name={`migrate${tab === "player1" ? "Player1" : "Player2"}Data.lastName`}
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
                                        field.handleChange(checked === true)
                                      }
                                      aria-invalid={isInvalid}
                                      disabled={
                                        isLoading ||
                                        !form.getFieldValue(
                                          `connected${tab === "player1" ? "Player1" : "Player2"}`,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                    <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                      Last Name
                                    </span>
                                    {form.getFieldValue(
                                      `connected${tab === "player1" ? "Player1" : "Player2"}`,
                                    ) ? (
                                      <>
                                        <span
                                          className={cn(
                                            !field.state.value &&
                                            "text-success bg-success/5",
                                            "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                            !(tab === "player1"
                                              ? player1?.lastName
                                              : player2?.lastName) && "italic",
                                          )}
                                        >
                                          {tab === "player1"
                                            ? player1?.lastName || "N/A"
                                            : player2?.lastName || "N/A"}
                                        </span>{" "}
                                        <span
                                          className={cn(
                                            field.state.value &&
                                            "text-warning bg-warning/5",
                                            "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                            !(tab === "player1"
                                              ? player1?.lastName
                                              : player2?.lastName) && "italic",
                                          )}
                                        >
                                          {tab === "player1"
                                            ? entry?.player1Entry.lastName ||
                                            "N/A"
                                            : entry?.player2Entry?.lastName ||
                                            "N/A"}
                                        </span>
                                      </>
                                    ) : (
                                      <span
                                        className={cn(
                                          field.state.value && "text-warning",
                                          "col-span-4 px-2 border w-full flex items-center justify-start py-1",
                                          !(tab === "player1"
                                            ? player1?.lastName
                                            : player2?.lastName) && "italic",
                                        )}
                                      >
                                        {tab === "player1"
                                          ? entry?.player1Entry.lastName || "N/A"
                                          : entry?.player2Entry?.lastName ||
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
                          name={`migrate${tab === "player1" ? "Player1" : "Player2"}Data.suffix`}
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
                                        field.handleChange(checked === true)
                                      }
                                      aria-invalid={isInvalid}
                                      disabled={
                                        isLoading ||
                                        !form.getFieldValue(
                                          `connected${tab === "player1" ? "Player1" : "Player2"}`,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                    <span className="px-2 border w-full flex items-center py-1 justify-center text-center">
                                      Ext.
                                    </span>
                                    {form.getFieldValue(
                                      `connected${tab === "player1" ? "Player1" : "Player2"}`,
                                    ) ? (
                                      <>
                                        <span
                                          className={cn(
                                            !field.state.value &&
                                            "text-success bg-success/5",
                                            "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                            !(tab === "player1"
                                              ? player1?.suffix
                                              : player2?.suffix) && "italic",
                                          )}
                                        >
                                          {tab === "player1"
                                            ? player1?.suffix || "N/A"
                                            : player2?.suffix || "N/A"}
                                        </span>{" "}
                                        <span
                                          className={cn(
                                            field.state.value &&
                                            "text-warning bg-warning/5",
                                            "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                            !(tab === "player1"
                                              ? player1?.suffix
                                              : player2?.suffix) && "italic",
                                          )}
                                        >
                                          {tab === "player1"
                                            ? entry?.player1Entry.suffix || "N/A"
                                            : entry?.player2Entry?.suffix ||
                                            "N/A"}
                                        </span>
                                      </>
                                    ) : (
                                      <span
                                        className={cn(
                                          field.state.value && "text-warning",
                                          "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                          !(tab === "player1"
                                            ? player1?.suffix
                                            : player2?.suffix) && "italic",
                                        )}
                                      >
                                        {tab === "player1"
                                          ? entry?.player1Entry.suffix || "N/A"
                                          : entry?.player2Entry?.suffix || "N/A"}
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
                          name={`migrate${tab === "player1" ? "Player1" : "Player2"}Data.email`}
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
                                        field.handleChange(checked === true)
                                      }
                                      aria-invalid={isInvalid}
                                      disabled={
                                        isLoading ||
                                        !form.getFieldValue(
                                          `connected${tab === "player1" ? "Player1" : "Player2"}`,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                    <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                      Email
                                    </span>
                                    {form.getFieldValue(
                                      `connected${tab === "player1" ? "Player1" : "Player2"}`,
                                    ) ? (
                                      <>
                                        <span
                                          className={cn(
                                            !field.state.value &&
                                            "text-success bg-success/5",
                                            "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                            !(tab === "player1"
                                              ? player1?.email
                                              : player2?.email) && "italic",
                                          )}
                                        >
                                          {tab === "player1"
                                            ? player1?.email || "N/A"
                                            : player2?.email || "N/A"}
                                        </span>{" "}
                                        <span
                                          className={cn(
                                            field.state.value &&
                                            "text-warning bg-warning/5",
                                            "col-span-2 px-2 border w-full flex items-center py-1 justify-start break-all whitespace-normal",
                                            !(tab === "player1"
                                              ? player1?.email
                                              : player2?.email) && "italic",
                                          )}
                                        >
                                          {tab === "player1"
                                            ? entry?.player1Entry.email || "N/A"
                                            : entry?.player2Entry?.email || "N/A"}
                                        </span>
                                      </>
                                    ) : (
                                      <span
                                        className={cn(
                                          field.state.value && "text-warning",
                                          "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                          !(tab === "player1"
                                            ? player1?.email
                                            : player2?.email) && "italic",
                                        )}
                                      >
                                        {tab === "player1"
                                          ? entry?.player1Entry.email || "N/A"
                                          : entry?.player2Entry?.email || "N/A"}
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
                          name={`migrate${tab === "player1" ? "Player1" : "Player2"}Data.phoneNumber`}
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
                                        field.handleChange(checked === true)
                                      }
                                      aria-invalid={isInvalid}
                                      disabled={
                                        isLoading ||
                                        !form.getFieldValue(
                                          `connected${tab === "player1" ? "Player1" : "Player2"}`,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                    <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                      Phone No.
                                    </span>
                                    {form.getFieldValue(
                                      `connected${tab === "player1" ? "Player1" : "Player2"}`,
                                    ) ? (
                                      <>
                                        <span
                                          className={cn(
                                            !field.state.value &&
                                            "text-success bg-success/5",
                                            "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                            !(tab === "player1"
                                              ? player1?.phoneNumber
                                              : player2?.phoneNumber) && "italic",
                                          )}
                                        >
                                          {tab === "player1"
                                            ? player1?.phoneNumber || "N/A"
                                            : player2?.phoneNumber || "N/A"}
                                        </span>{" "}
                                        <span
                                          className={cn(
                                            field.state.value &&
                                            "text-warning bg-warning/5",
                                            "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                            !(tab === "player1"
                                              ? player1?.phoneNumber
                                              : player2?.phoneNumber) && "italic",
                                          )}
                                        >
                                          {tab === "player1"
                                            ? entry?.player1Entry.phoneNumber ||
                                            "N/A"
                                            : entry?.player2Entry?.phoneNumber ||
                                            "N/A"}
                                        </span>
                                      </>
                                    ) : (
                                      <span
                                        className={cn(
                                          field.state.value && "text-warning",
                                          "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                          !(tab === "player1"
                                            ? player1?.phoneNumber
                                            : player2?.phoneNumber) && "italic",
                                        )}
                                      >
                                        {tab === "player1"
                                          ? entry?.player1Entry.phoneNumber ||
                                          "N/A"
                                          : entry?.player2Entry?.phoneNumber ||
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
                          name={`migrate${tab === "player1" ? "Player1" : "Player2"}Data.birthDate`}
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
                                        field.handleChange(checked === true)
                                      }
                                      aria-invalid={isInvalid}
                                      disabled={
                                        isLoading ||
                                        !form.getFieldValue(
                                          `connected${tab === "player1" ? "Player1" : "Player2"}`,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                    <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                      Birthday
                                    </span>
                                    {form.getFieldValue(
                                      `connected${tab === "player1" ? "Player1" : "Player2"}`,
                                    ) ? (
                                      <>
                                        <span
                                          className={cn(
                                            !field.state.value &&
                                            "text-success bg-success/5",
                                            "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                            !(tab === "player1"
                                              ? player1?.birthDate
                                              : player2?.birthDate) && "italic",
                                          )}
                                        >
                                          {tab === "player1"
                                            ? player1?.birthDate
                                              ? format(
                                                new Date(player1.birthDate),
                                                "PP",
                                              )
                                              : "N/A"
                                            : player2?.birthDate
                                              ? format(
                                                new Date(player2.birthDate),
                                                "PP",
                                              )
                                              : "N/A"}
                                        </span>{" "}
                                        <span
                                          className={cn(
                                            field.state.value &&
                                            "text-warning bg-warning/5",
                                            "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                            !(tab === "player1"
                                              ? player1?.birthDate
                                              : player2?.birthDate) && "italic",
                                          )}
                                        >
                                          {tab === "player1"
                                            ? entry?.player1Entry.birthDate
                                              ? format(
                                                new Date(
                                                  entry.player1Entry.birthDate,
                                                ),
                                                "PP",
                                              )
                                              : "N/A"
                                            : entry?.player2Entry?.birthDate
                                              ? format(
                                                new Date(
                                                  entry.player2Entry.birthDate,
                                                ),
                                                "PP",
                                              )
                                              : "N/A"}
                                        </span>
                                      </>
                                    ) : (
                                      <span
                                        className={cn(
                                          field.state.value && "text-warning",
                                          "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                          !(tab === "player1"
                                            ? player1?.birthDate
                                            : player2?.birthDate) && "italic",
                                        )}
                                      >
                                        {tab === "player1"
                                          ? entry?.player1Entry.birthDate
                                            ? format(
                                              new Date(
                                                entry.player1Entry.birthDate,
                                              ),
                                              "PP",
                                            )
                                            : "N/A"
                                          : entry?.player2Entry?.birthDate
                                            ? format(
                                              new Date(
                                                entry.player2Entry.birthDate,
                                              ),
                                              "PP",
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
                    form.setFieldValue(
                      `connected${tab === "player1" ? "Player1" : "Player2"}`,
                      player._id,
                    )
                    tab === "player1"
                      ? fetchPlayer1({ variables: { _id: player._id } })
                      : fetchPlayer2({ variables: { _id: player._id } })
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
                                : "bg-blue-50 text-blue-700 border-blue-200",
                          )}
                        >
                          {player.similarityScore}% match
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {player.matchReasons.map(
                        (reason: string, index: number) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs py-0.5"
                          >
                            {reason}
                          </Badge>
                        ),
                      )}
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
                  <p className="text-xs">
                    Click on a suggested player to auto-fill the selection. The
                    system matches players based on name and birthday
                    similarity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <FieldSet className="flex flex-col gap-2.5 h-[52vh] overflow-y-auto">
        <form.Field
          name={`is${tab === "player1" ? "Player1" : "Player2"}New`}
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            const hasError =
              validationErrors[tab === "player1" ? "player1" : "player2"]

            return (
              <Field data-invalid={isInvalid || hasError}>
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
                    aria-invalid={
                      Boolean(isInvalid || hasError) ? "true" : "false"
                    }
                    disabled={isLoading}
                  />
                  <div className="grid">
                    <FieldLabel
                      htmlFor={field.name}
                      className={hasError ? "text-destructive" : ""}
                    >
                      Is New Player? (
                      {tab === "player1" ? "Player 1" : "Player 2"})
                      {hasError && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </FieldLabel>
                    <span className="text-muted-foreground text-xs">
                      Checking this will create a new player profile.
                    </span>
                  </div>
                </div>

                {(isInvalid || hasError) && (
                  <FieldError
                    errors={
                      hasError
                        ? [{ message: hasError }]
                        : field.state.meta.errors
                    }
                  />
                )}
              </Field>
            )
          }}
        />

        {!form.getFieldValue(
          `is${tab === "player1" ? "Player1" : "Player2"}New`,
        ) &&
          form.getFieldValue(
            `connected${tab === "player1" ? "Player1" : "Player2"}`,
          ) &&
          (tab === "player1"
            ? hasPlayer1DocumentsToSelect()
            : hasPlayer2DocumentsToSelect()) && (
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    Document Selection
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Choose which documents to keep for{" "}
                    {tab === "player1" ? "Player 1" : "Player 2"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    tab === 'player1' ? handleDocumentSelection1() : handleDocumentSelection2()
                  }}
                  disabled={isLoading}
                  type="button"
                >
                  {(
                    tab === "player1"
                      ? documentSelections.player1
                      : documentSelections.player2
                  )
                    ? "Edit Selection"
                    : "Select Documents"}
                </Button>
              </div>
              {(
                tab === "player1"
                  ? documentSelections.player1
                  : documentSelections.player2
              ) ? (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Document selections saved
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={
                        tab === "player1"
                          ? handleDocumentSelection1
                          : handleDocumentSelection2
                      }
                      className="text-xs"
                      type="button"
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
                      <p className="text-sm font-medium text-amber-800">
                        Document Selection Required
                      </p>
                      <p className="text-xs text-amber-600">
                        Click "Select Documents" to choose which documents to
                        keep
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        {!form.getFieldValue(
          `is${tab === "player1" ? "Player1" : "Player2"}New`,
        ) &&
          isLoadingSuggestions && (
            <div className="mb-4 p-3 border rounded-md bg-gray-50">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-600">
                  Finding suggested players...
                </span>
              </div>
            </div>
          )}

        {!form.getFieldValue(
          `is${tab === "player1" ? "Player1" : "Player2"}New`,
        ) &&
          hasSuggestions && (
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
                      form.setFieldValue(
                        `connected${tab === "player1" ? "Player1" : "Player2"}`,
                        player._id,
                      )
                      tab === "player1"
                        ? fetchPlayer1({ variables: { _id: player._id } })
                        : fetchPlayer2({ variables: { _id: player._id } })
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
                                  : "bg-blue-50 text-blue-700 border-blue-200",
                            )}
                          >
                            {player.similarityScore}% match
                          </Badge>
                        </div>
                        <div className="mt-1 space-y-1">
                          <div className="flex flex-wrap gap-1">
                            {player.matchReasons.map(
                              (reason: string, index: number) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs py-0.5"
                                >
                                  {reason}
                                </Badge>
                              ),
                            )}
                          </div>
                          <div className="text-xs text-gray-500 space-y-0.5">
                            <div>
                              Birthday:{" "}
                              {format(new Date(player.birthDate), "PP")}
                            </div>
                            {player.email && <div>Email: {player.email}</div>}
                            {player.phoneNumber && (
                              <div>Phone: {player.phoneNumber}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          form.setFieldValue(
                            `connected${tab === "player1" ? "Player1" : "Player2"}`,
                            player._id,
                          )
                          tab === "player1"
                            ? fetchPlayer1({ variables: { _id: player._id } })
                            : fetchPlayer2({ variables: { _id: player._id } })
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
                <span>
                  Click on a suggestion to auto-fill the player selection below
                </span>
              </div>
            </div>
          )}

        {!form.getFieldValue(
          `is${tab === "player1" ? "Player1" : "Player2"}New`,
        ) && (
            <>
              <form.Field
                name={`connected${tab === "player1" ? "Player1" : "Player2"}`}
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  const hasError =
                    validationErrors[tab === "player1" ? "player1" : "player2"]

                  return (
                    <Field data-invalid={isInvalid || hasError}>
                      <div className="flex items-center justify-between">
                        <FieldLabel
                          htmlFor={field.name}
                          className={hasError ? "text-destructive" : ""}
                        >
                          Connected {tab === "player1" ? "Player 1" : "Player 2"}
                          {hasError && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </FieldLabel>
                        {hasError && (
                          <span className="text-xs text-destructive">
                            {hasError}
                          </span>
                        )}
                      </div>
                      <Popover
                        open={tab === "player1" ? openPlayers1 : openPlayers2}
                        onOpenChange={
                          tab === "player1" ? setOpenPlayers1 : setOpenPlayers2
                        }
                      >
                        <PopoverTrigger asChild>
                          <Button
                            id={field.name}
                            name={field.name}
                            disabled={optionsLoading}
                            aria-expanded={
                              tab === "player1" ? openPlayers1 : openPlayers2
                            }
                            onBlur={field.handleBlur}
                            variant="outline"
                            role="combobox"
                            aria-invalid={
                              Boolean(isInvalid || hasError) ? "true" : "false"
                            }
                            className={cn(
                              "w-full justify-between font-normal capitalize -mt-2",
                              !field.state.value && "text-muted-foreground",
                              hasError &&
                              "border-destructive focus-visible:ring-destructive",
                            )}
                            type="button"
                          >
                            {field.state.value
                              ? players.find(
                                (o: { value: string; label: string }) =>
                                  o.value === field.state.value,
                              )?.label
                              : `Select ${tab === "player1" ? "Player 1" : "Player 2"}`}
                            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command
                            filter={(value, search) =>
                              players
                                .find(
                                  (t: { value: string; label: string }) =>
                                    t.value === value,
                                )
                                ?.label.toLowerCase()
                                .includes(search.toLowerCase())
                                ? 1
                                : 0
                            }
                          >
                            <CommandInput
                              placeholder={`Select ${tab === "player1" ? "Player 1" : "Player 2"}`}
                            />
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
                                        field.handleChange(v.toString())
                                        tab === "player1"
                                          ? setOpenPlayers1(false)
                                          : setOpenPlayers2(false)
                                      }}
                                      className="capitalize"
                                    >
                                      <CheckIcon
                                        className={cn(
                                          "h-4 w-4",
                                          field.state.value === o.value
                                            ? "opacity-100"
                                            : "opacity-0",
                                        )}
                                      />
                                      {o.label}
                                    </CommandItem>
                                  ),
                                )}
                              </CommandGroup>
                              <CommandEmpty>No players found.</CommandEmpty>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {(isInvalid || hasError) && (
                        <FieldError
                          errors={
                            hasError
                              ? [{ message: hasError }]
                              : field.state.meta.errors
                          }
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
                    Checked fields will update the player database with entry
                    data.
                  </span>
                </div>
                <div className="flex items-center w-full gap-2">
                  <div className="h-full flex items-center justify-center">
                    <Checkbox
                      disabled={
                        isLoading ||
                        !form.getFieldValue(
                          `connected${tab === "player1" ? "Player1" : "Player2"}`,
                        )
                      }
                      onCheckedChange={(checked) => {
                        form.setFieldValue(
                          `migrate${tab === "player1" ? "Player1" : "Player2"}Data`,
                          {
                            firstName: checked === true,
                            middleName: checked === true,
                            lastName: checked === true,
                            suffix: checked === true,
                            birthDate: checked === true,
                            phoneNumber: checked === true,
                            email: checked === true,
                            validDocuments: checked === true,
                          },
                        )
                        if (checked) {
                          setTimeout(() => {
                            tab === "player1"
                              ? handleDocumentSelection1()
                              : handleDocumentSelection2()
                          }, 100)
                        }
                      }}
                    />
                  </div>
                  <div className="text-xs grid grid-cols-5 col-span-2 h-full w-full">
                    <div className="px-2 h-full border w-full flex items-center justify-center min-h-8"></div>
                    <span
                      className={cn(
                        "px-2 h-full border w-full flex items-center justify-center",
                        form.getFieldValue(
                          `connected${tab === "player1" ? "Player1" : "Player2"}`,
                        )
                          ? "col-span-2"
                          : "hidden",
                      )}
                    >
                      From Database (Current)
                    </span>{" "}
                    <span
                      className={cn(
                        "px-2 h-full border w-full flex items-center justify-center",
                        form.getFieldValue(
                          `connected${tab === "player1" ? "Player1" : "Player2"}`,
                        )
                          ? "col-span-2"
                          : "col-span-4",
                      )}
                    >
                      From Entry (New)
                    </span>
                  </div>
                </div>

                <div>
                  <form.Field
                    name={`migrate${tab === "player1" ? "Player1" : "Player2"}Data.firstName`}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
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
                                  field.handleChange(checked === true)
                                }
                                aria-invalid={isInvalid}
                                disabled={
                                  isLoading ||
                                  !form.getFieldValue(
                                    `connected${tab === "player1" ? "Player1" : "Player2"}`,
                                  )
                                }
                              />
                            </div>
                            <div className="text-xs grid grid-cols-5 col-span-2 min-h-8 w-full">
                              <span className="px-2 h-full border w-full flex items-center justify-center py-1 text-center">
                                First Name
                              </span>
                              {form.getFieldValue(
                                `connected${tab === "player1" ? "Player1" : "Player2"}`,
                              ) ? (
                                <>
                                  <span
                                    className={cn(
                                      !field.state.value &&
                                      "text-success bg-success/5",
                                      "col-span-2 px-2 h-full border w-full flex items-center justify-start py-1",
                                    )}
                                  >
                                    {tab === "player1"
                                      ? player1?.firstName
                                      : player2?.firstName}
                                  </span>{" "}
                                  <span
                                    className={cn(
                                      field.state.value &&
                                      "text-warning bg-warning/5",
                                      "col-span-2 px-2 h-full border w-full flex items-center justify-start py-1",
                                    )}
                                  >
                                    {tab === "player1"
                                      ? entry?.player1Entry.firstName
                                      : entry?.player2Entry?.firstName}
                                  </span>
                                </>
                              ) : (
                                <span
                                  className={cn(
                                    field.state.value && "text-warning",
                                    "col-span-4 px-2 h-full border w-full flex items-center justify-start",
                                  )}
                                >
                                  {tab === "player1"
                                    ? entry?.player1Entry.firstName
                                    : entry?.player2Entry?.firstName}
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
                    name={`migrate${tab === "player1" ? "Player1" : "Player2"}Data.middleName`}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
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
                                  field.handleChange(checked === true)
                                }
                                aria-invalid={isInvalid}
                                disabled={
                                  isLoading ||
                                  !form.getFieldValue(
                                    `connected${tab === "player1" ? "Player1" : "Player2"}`,
                                  )
                                }
                              />
                            </div>
                            <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                              <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                Middle Name
                              </span>
                              {form.getFieldValue(
                                `connected${tab === "player1" ? "Player1" : "Player2"}`,
                              ) ? (
                                <>
                                  <span
                                    className={cn(
                                      !field.state.value &&
                                      "text-success bg-success/5",
                                      "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                      !(tab === "player1"
                                        ? player1?.middleName
                                        : player2?.middleName) && "italic",
                                    )}
                                  >
                                    {tab === "player1"
                                      ? player1?.middleName || "N/A"
                                      : player2?.middleName || "N/A"}
                                  </span>{" "}
                                  <span
                                    className={cn(
                                      field.state.value &&
                                      "text-warning bg-warning/5",
                                      "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                      !(tab === "player1"
                                        ? player1?.middleName
                                        : player2?.middleName) && "italic",
                                    )}
                                  >
                                    {tab === "player1"
                                      ? entry?.player1Entry.middleName || "N/A"
                                      : entry?.player2Entry?.middleName || "N/A"}
                                  </span>
                                </>
                              ) : (
                                <span
                                  className={cn(
                                    field.state.value && "text-warning",
                                    "col-span-4 px-2 border w-full flex items-center justify-start py-1",
                                    !(tab === "player1"
                                      ? player1?.middleName
                                      : player2?.middleName) && "italic",
                                  )}
                                >
                                  {tab === "player1"
                                    ? entry?.player1Entry.middleName || "N/A"
                                    : entry?.player2Entry?.middleName || "N/A"}
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
                    name={`migrate${tab === "player1" ? "Player1" : "Player2"}Data.lastName`}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
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
                                  field.handleChange(checked === true)
                                }
                                aria-invalid={isInvalid}
                                disabled={
                                  isLoading ||
                                  !form.getFieldValue(
                                    `connected${tab === "player1" ? "Player1" : "Player2"}`,
                                  )
                                }
                              />
                            </div>
                            <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                              <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                Last Name
                              </span>
                              {form.getFieldValue(
                                `connected${tab === "player1" ? "Player1" : "Player2"}`,
                              ) ? (
                                <>
                                  <span
                                    className={cn(
                                      !field.state.value &&
                                      "text-success bg-success/5",
                                      "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                      !(tab === "player1"
                                        ? player1?.lastName
                                        : player2?.lastName) && "italic",
                                    )}
                                  >
                                    {tab === "player1"
                                      ? player1?.lastName || "N/A"
                                      : player2?.lastName || "N/A"}
                                  </span>{" "}
                                  <span
                                    className={cn(
                                      field.state.value &&
                                      "text-warning bg-warning/5",
                                      "col-span-2 px-2 border w-full flex items-center justify-start py-1",
                                      !(tab === "player1"
                                        ? player1?.lastName
                                        : player2?.lastName) && "italic",
                                    )}
                                  >
                                    {tab === "player1"
                                      ? entry?.player1Entry.lastName || "N/A"
                                      : entry?.player2Entry?.lastName || "N/A"}
                                  </span>
                                </>
                              ) : (
                                <span
                                  className={cn(
                                    field.state.value && "text-warning",
                                    "col-span-4 px-2 border w-full flex items-center justify-start py-1",
                                    !(tab === "player1"
                                      ? player1?.lastName
                                      : player2?.lastName) && "italic",
                                  )}
                                >
                                  {tab === "player1"
                                    ? entry?.player1Entry.lastName || "N/A"
                                    : entry?.player2Entry?.lastName || "N/A"}
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
                    name={`migrate${tab === "player1" ? "Player1" : "Player2"}Data.suffix`}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
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
                                  field.handleChange(checked === true)
                                }
                                aria-invalid={isInvalid}
                                disabled={
                                  isLoading ||
                                  !form.getFieldValue(
                                    `connected${tab === "player1" ? "Player1" : "Player2"}`,
                                  )
                                }
                              />
                            </div>
                            <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                              <span className="px-2 border w-full flex items-center py-1 justify-center text-center">
                                Ext.
                              </span>
                              {form.getFieldValue(
                                `connected${tab === "player1" ? "Player1" : "Player2"}`,
                              ) ? (
                                <>
                                  <span
                                    className={cn(
                                      !field.state.value &&
                                      "text-success bg-success/5",
                                      "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                      !(tab === "player1"
                                        ? player1?.suffix
                                        : player2?.suffix) && "italic",
                                    )}
                                  >
                                    {tab === "player1"
                                      ? player1?.suffix || "N/A"
                                      : player2?.suffix || "N/A"}
                                  </span>{" "}
                                  <span
                                    className={cn(
                                      field.state.value &&
                                      "text-warning bg-warning/5",
                                      "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                      !(tab === "player1"
                                        ? player1?.suffix
                                        : player2?.suffix) && "italic",
                                    )}
                                  >
                                    {tab === "player1"
                                      ? entry?.player1Entry.suffix || "N/A"
                                      : entry?.player2Entry?.suffix || "N/A"}
                                  </span>
                                </>
                              ) : (
                                <span
                                  className={cn(
                                    field.state.value && "text-warning",
                                    "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                    !(tab === "player1"
                                      ? player1?.suffix
                                      : player2?.suffix) && "italic",
                                  )}
                                >
                                  {tab === "player1"
                                    ? entry?.player1Entry.suffix || "N/A"
                                    : entry?.player2Entry?.suffix || "N/A"}
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
                    name={`migrate${tab === "player1" ? "Player1" : "Player2"}Data.email`}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
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
                                  field.handleChange(checked === true)
                                }
                                aria-invalid={isInvalid}
                                disabled={
                                  isLoading ||
                                  !form.getFieldValue(
                                    `connected${tab === "player1" ? "Player1" : "Player2"}`,
                                  )
                                }
                              />
                            </div>
                            <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                              <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                Email
                              </span>
                              {form.getFieldValue(
                                `connected${tab === "player1" ? "Player1" : "Player2"}`,
                              ) ? (
                                <>
                                  <span
                                    className={cn(
                                      !field.state.value &&
                                      "text-success bg-success/5",
                                      "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                      !(tab === "player1"
                                        ? player1?.email
                                        : player2?.email) && "italic",
                                    )}
                                  >
                                    {tab === "player1"
                                      ? player1?.email || "N/A"
                                      : player2?.email || "N/A"}
                                  </span>{" "}
                                  <span
                                    className={cn(
                                      field.state.value &&
                                      "text-warning bg-warning/5",
                                      "col-span-2 px-2 border w-full flex items-center py-1 justify-start break-all whitespace-normal",
                                      !(tab === "player1"
                                        ? player1?.email
                                        : player2?.email) && "italic",
                                    )}
                                  >
                                    {tab === "player1"
                                      ? entry?.player1Entry.email || "N/A"
                                      : entry?.player2Entry?.email || "N/A"}
                                  </span>
                                </>
                              ) : (
                                <span
                                  className={cn(
                                    field.state.value && "text-warning",
                                    "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                    !(tab === "player1"
                                      ? player1?.email
                                      : player2?.email) && "italic",
                                  )}
                                >
                                  {tab === "player1"
                                    ? entry?.player1Entry.email || "N/A"
                                    : entry?.player2Entry?.email || "N/A"}
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
                    name={`migrate${tab === "player1" ? "Player1" : "Player2"}Data.phoneNumber`}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
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
                                  field.handleChange(checked === true)
                                }
                                aria-invalid={isInvalid}
                                disabled={
                                  isLoading ||
                                  !form.getFieldValue(
                                    `connected${tab === "player1" ? "Player1" : "Player2"}`,
                                  )
                                }
                              />
                            </div>
                            <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                              <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                Phone No.
                              </span>
                              {form.getFieldValue(
                                `connected${tab === "player1" ? "Player1" : "Player2"}`,
                              ) ? (
                                <>
                                  <span
                                    className={cn(
                                      !field.state.value &&
                                      "text-success bg-success/5",
                                      "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                      !(tab === "player1"
                                        ? player1?.phoneNumber
                                        : player2?.phoneNumber) && "italic",
                                    )}
                                  >
                                    {tab === "player1"
                                      ? player1?.phoneNumber || "N/A"
                                      : player2?.phoneNumber || "N/A"}
                                  </span>{" "}
                                  <span
                                    className={cn(
                                      field.state.value &&
                                      "text-warning bg-warning/5",
                                      "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                      !(tab === "player1"
                                        ? player1?.phoneNumber
                                        : player2?.phoneNumber) && "italic",
                                    )}
                                  >
                                    {tab === "player1"
                                      ? entry?.player1Entry.phoneNumber || "N/A"
                                      : entry?.player2Entry?.phoneNumber || "N/A"}
                                  </span>
                                </>
                              ) : (
                                <span
                                  className={cn(
                                    field.state.value && "text-warning",
                                    "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                    !(tab === "player1"
                                      ? player1?.phoneNumber
                                      : player2?.phoneNumber) && "italic",
                                  )}
                                >
                                  {tab === "player1"
                                    ? entry?.player1Entry.phoneNumber || "N/A"
                                    : entry?.player2Entry?.phoneNumber || "N/A"}
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
                    name={`migrate${tab === "player1" ? "Player1" : "Player2"}Data.birthDate`}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
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
                                  field.handleChange(checked === true)
                                }
                                aria-invalid={isInvalid}
                                disabled={
                                  isLoading ||
                                  !form.getFieldValue(
                                    `connected${tab === "player1" ? "Player1" : "Player2"}`,
                                  )
                                }
                              />
                            </div>
                            <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                              <span className="px-2 border w-full flex items-center justify-center py-1 text-center">
                                Birthday
                              </span>
                              {form.getFieldValue(
                                `connected${tab === "player1" ? "Player1" : "Player2"}`,
                              ) ? (
                                <>
                                  <span
                                    className={cn(
                                      !field.state.value &&
                                      "text-success bg-success/5",
                                      "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                      !(tab === "player1"
                                        ? player1?.birthDate
                                        : player2?.birthDate) && "italic",
                                    )}
                                  >
                                    {tab === "player1"
                                      ? player1?.birthDate
                                        ? format(
                                          new Date(player1.birthDate),
                                          "PP",
                                        )
                                        : "N/A"
                                      : player2?.birthDate
                                        ? format(
                                          new Date(player2.birthDate),
                                          "PP",
                                        )
                                        : "N/A"}
                                  </span>{" "}
                                  <span
                                    className={cn(
                                      field.state.value &&
                                      "text-warning bg-warning/5",
                                      "col-span-2 px-2 border w-full flex items-center py-1 justify-start",
                                      !(tab === "player1"
                                        ? player1?.birthDate
                                        : player2?.birthDate) && "italic",
                                    )}
                                  >
                                    {tab === "player1"
                                      ? entry?.player1Entry.birthDate
                                        ? format(
                                          new Date(
                                            entry.player1Entry.birthDate,
                                          ),
                                          "PP",
                                        )
                                        : "N/A"
                                      : entry?.player2Entry?.birthDate
                                        ? format(
                                          new Date(
                                            entry.player2Entry.birthDate,
                                          ),
                                          "PP",
                                        )
                                        : "N/A"}
                                  </span>
                                </>
                              ) : (
                                <span
                                  className={cn(
                                    field.state.value && "text-warning",
                                    "col-span-4 px-2 border w-full flex items-center py-1 justify-start",
                                    !(tab === "player1"
                                      ? player1?.birthDate
                                      : player2?.birthDate) && "italic",
                                  )}
                                >
                                  {tab === "player1"
                                    ? entry?.player1Entry.birthDate
                                      ? format(
                                        new Date(entry.player1Entry.birthDate),
                                        "PP",
                                      )
                                      : "N/A"
                                    : entry?.player2Entry?.birthDate
                                      ? format(
                                        new Date(entry.player2Entry.birthDate),
                                        "PP",
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
    )
  }

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
            key={`dialog-${form.getFieldValue("isPlayer1New")}-${form.getFieldValue("isPlayer2New")}`}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
            showCloseButton={false}
            className={cn(
              "max-w-xl!",
              (!form.getFieldValue("isPlayer1New") &&
                suggestedPlayers1.length > 0) ||
                (!form.getFieldValue("isPlayer2New") &&
                  suggestedPlayers2.length > 0)
                ? "max-w-4xl!"
                : "max-w-4xl!",
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
              <Tabs
                defaultValue="player1"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <TabsList
                  className={cn(
                    entry?.player2Entry ? "flex" : "hidden",
                    "w-full",
                  )}
                >
                  <TabsTrigger value="player1">Player 1</TabsTrigger>
                  {!!(entry?.player2Entry || entry?.connectedPlayer2) && (
                    <TabsTrigger value="player2">Player 2</TabsTrigger>
                  )}
                </TabsList>
                <TabsContent value="player1">
                  {renderTabContent("player1")}
                </TabsContent>
                <TabsContent value="player2">
                  {renderTabContent("player2")}
                </TabsContent>
              </Tabs>
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
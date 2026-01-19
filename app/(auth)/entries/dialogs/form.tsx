"use client"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreateEntrySchema } from "@/validators/entry.validator"
import { gql } from "@apollo/client"
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react"
import { useForm } from "@tanstack/react-form"
import React, { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  CalendarIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  CirclePlus,
  UploadIcon,
  XCircle,
  Paperclip,
  Loader2,
} from "lucide-react"
import { Field, FieldLabel, FieldError, FieldSet } from "@/components/ui/field"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Gender } from "@/types/shared.interface"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventGender, EventType } from "@/types/event.interface"
import { Checkbox } from "@/components/ui/checkbox"
import { JerseySize } from "@/types/jersey.interface"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { ValidDocumentType } from "@/types/player.interface"

const ENTRY = gql`
  query Entry($_id: ID!) {
    entry(_id: $_id) {
      _id
      entryNumber
      entryKey
      club
      isInSoftware
      isEarlyBird
      validDocuments {
        documentURL
        documentType
        dateUploaded
      }
      statuses {
        status
        date
        reason
        by {
          name
        }
      }
      event {
        _id
        tournament {
          _id
        }
      }
      player1Entry {
        firstName
        middleName
        lastName
        suffix
        gender
        birthDate
        email
        phoneNumber
        jerseySize
        validDocuments {
          documentURL
          documentType
          dateUploaded
        }
      }
      connectedPlayer1 {
        _id
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
        jerseySize
        validDocuments {
          documentURL
          documentType
          dateUploaded
        }
      }
      connectedPlayer2 {
        _id
      }
    }
  }
`

const CREATE = gql`
  mutation CreateEntry($input: CreateEntryInput!) {
    createEntry(input: $input) {
      ok
      message
    }
  }
`

const UPDATE = gql`
  mutation UpdateEntry($input: UpdateEntryInput!) {
    updateEntry(input: $input) {
      ok
      message
    }
  }
`

const OPTIONS = gql`
  query Options {
    tournamentOptions {
      label
      value
      hasEarlyBird
      earlyBirdRegistrationEnd
    }
    playerOptions {
      label
      value
    }
  }
`

const EVENT_OPTIONS_BY_TOURNAMENT = gql`
  query Options($tournamentId: ID!) {
    eventOptionsByTournament(tournamentId: $tournamentId) {
      label
      value
      type
      gender
    }
  }
`

const PLAYER = gql`
  query Player($_id: ID!) {
    player(_id: $_id) {
      _id
      firstName
      middleName
      lastName
      suffix
      email
      phoneNumber
      birthDate
    }
  }
`

type Props = {
  _id?: string
  onClose?: () => void
}

// Reusable DocumentUploadTab component
const DocumentUploadTab = ({
  playerNumber,
  selectedDocumentType,
  setSelectedDocumentType,
  file,
  setFile,
  preview,
  setPreview,
  isUploading,
  fieldErrors,
  initialDocumentUrl,
  initialDocumentType,
  isLoading,
  isUpdate,
  form,
  handleFileUpload,
  handleRemoveFile
}: {
  playerNumber: number,
  selectedDocumentType: ValidDocumentType,
  setSelectedDocumentType: (type: ValidDocumentType) => void,
  file: File | null,
  setFile: (file: File | null) => void,
  preview: string | null,
  setPreview: (preview: string | null) => void,
  isUploading: boolean,
  fieldErrors: Record<string, string>,
  initialDocumentUrl: string,
  initialDocumentType: ValidDocumentType,
  isLoading: boolean,
  isUpdate: boolean,
  form: any,
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>, playerNumber: number) => void,
  handleRemoveFile: (playerNumber: number) => void
}) => {
  const [openDocumentTypes, setOpenDocumentTypes] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const documentTypes = Object.values(ValidDocumentType).map((type) => ({
    label: type.toLocaleLowerCase().replaceAll("_", " "),
    value: type,
  }))

  return (
    <TabsContent value={`document${playerNumber}`}>
      <FieldSet className="flex flex-col gap-3 h-[52vh] overflow-y-auto">
        <div className="w-full">
          <Field>
            <FieldLabel htmlFor={`documentType${playerNumber}`}>
              Document Type (Player {playerNumber})
            </FieldLabel>
            <Popover
              open={openDocumentTypes}
              onOpenChange={setOpenDocumentTypes}
              modal
            >
              <PopoverTrigger asChild>
                <Button
                  id={`documentType${playerNumber}`}
                  name={`documentType${playerNumber}`}
                  disabled={isLoading}
                  aria-expanded={openDocumentTypes}
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between font-normal capitalize -mt-2"
                  type="button"
                >
                  {selectedDocumentType
                    ? documentTypes.find(
                      (o) => o.value === selectedDocumentType
                    )?.label
                    : "Select Document Type"}
                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command
                  filter={(value, search) =>
                    documentTypes
                      .find(
                        (t: { value: string; label: string }) =>
                          t.value === value
                      )
                      ?.label.toLowerCase()
                      .includes(search.toLowerCase())
                      ? 1
                      : 0
                  }
                >
                  <CommandInput placeholder="Select Document Type" />
                  <CommandList className="max-h-72 overflow-y-auto">
                    <CommandEmpty>
                      No document type found.
                    </CommandEmpty>
                    <CommandGroup>
                      <Label className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
                        Document Types
                      </Label>
                      {documentTypes?.map((o) => (
                        <CommandItem
                          key={o.value}
                          value={o.value}
                          onSelect={(v) => {
                            setSelectedDocumentType(v as ValidDocumentType)
                            setOpenDocumentTypes(false)
                          }}
                          className="capitalize"
                        >
                          <CheckIcon
                            className={cn(
                              "h-4 w-4",
                              selectedDocumentType === o.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {o.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </Field>
        </div>

        {/* Document Upload Section */}
        <div className="border-2 border-dashed border-green-300 rounded-xl p-4 bg-green-50 flex flex-col items-center">
          <div className="w-full text-left mb-3">
            <div className="text-green-800 font-bold text-sm mb-1">
              Upload Supporting Document (for Player {playerNumber})
            </div>
            <p className="text-gray-600 text-xs">
              Upload any supporting document for Player {playerNumber} (ID, proof of payment, etc.)
            </p>
          </div>

          {file && (
            <div className="w-full mb-4 p-3 bg-white border rounded-lg">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB • {file.type}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => handleRemoveFile(playerNumber)}
                  disabled={isUploading}
                  className="text-gray-500 hover:text-red-500 hover:bg-gray-200! bg-transparent transition-colors cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
              {isUploading && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-green-600 h-1 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Uploading...</p>
                </div>
              )}
            </div>
          )}

          {isUpdate && initialDocumentUrl && !file && (
            <div className="w-full mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-700">
                    Existing document is already uploaded for Player {playerNumber}
                  </p>
                  <p className="text-xs text-blue-500">
                    Type: {initialDocumentType.replaceAll("_", " ").toLowerCase()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="w-full flex justify-center mb-4">
            {preview && (file?.type.startsWith('image/') || initialDocumentUrl) ? (
              <div className="relative w-full flex justify-center">
                <div className="relative w-full max-w-[300px] h-[200px] overflow-hidden rounded-lg border shadow">
                  {imageLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
                      <div className="animate-spin h-8 w-8 rounded-full border-2 border-gray-300 border-t-green-500" />
                    </div>
                  )}

                  <div className="relative w-full h-full">
                    <Image
                      src={preview}
                      alt={`Uploaded document for Player ${playerNumber}`}
                      className={`transition-opacity duration-300 ${imageLoading ? "opacity-0" : "opacity-100"
                        }`}
                      fill
                      sizes="(max-width: 300px) 100vw, 300px"
                      style={{
                        objectFit: 'contain',
                        objectPosition: 'center'
                      }}
                      onLoad={() => setImageLoading(false)}
                      onError={(e) => {
                        console.error("Failed to load image:", e.currentTarget.src);
                        setImageLoading(false)
                        e.currentTarget.style.display = 'none';
                        const fallbackDiv = document.createElement('div');
                        fallbackDiv.className = 'absolute inset-0 flex items-center justify-center bg-gray-50';
                        fallbackDiv.innerHTML = `
                <div class="text-center">
                  <svg class="w-8 h-8 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  <p class="text-sm text-gray-500">Failed to load image</p>
                </div>
              `;
                        e.currentTarget.parentNode?.appendChild(fallbackDiv);
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : file && !file.type.startsWith('image/') ? (
              <div className="w-full max-w-[300px] h-[200px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <Paperclip className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">PDF Document</p>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-[300px] h-[200px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <UploadIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Document preview will appear here</p>
                </div>
              </div>
            )}
          </div>

          <label
            htmlFor={`documentUpload${playerNumber}`}
            className={`cursor-pointer w-full flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl bg-white hover:bg-green-100 transition ${fieldErrors[`filePlayer${playerNumber}`] ? 'border-red-300 bg-red-50 hover:bg-red-100' : 'border-green-400 hover:bg-green-50'
              }`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-6 h-6 mb-2 animate-spin text-green-600" />
                <span className="font-medium text-sm text-green-700">Uploading...</span>
                <span className="text-xs text-gray-500 mt-1">Please wait</span>
              </div>
            ) : (
              <>
                <UploadIcon className={`w-6 h-6 mb-2 ${fieldErrors[`filePlayer${playerNumber}`] ? 'text-red-500' : 'text-green-600'
                  }`} />
                <span className={`font-medium text-sm ${fieldErrors[`filePlayer${playerNumber}`] ? 'text-red-700' : 'text-green-700'
                  }`}>
                  {isUpdate ? "Upload New Document or Browse" : "Drag & Drop your document or Browse"}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  Supports images (JPEG, PNG, JPG, WEBP) and PDF files up to 10MB
                </span>
              </>
            )}
            <input
              id={`documentUpload${playerNumber}`}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => handleFileUpload(e, playerNumber)}
              disabled={isUploading}
            />
          </label>

          {fieldErrors[`filePlayer${playerNumber}`] && (
            <p className="text-xs text-red-500 mt-2">{fieldErrors[`filePlayer${playerNumber}`]}</p>
          )}
        </div>
      </FieldSet>
    </TabsContent>
  )
}

const FormDialog = (props: Props) => {
  // Dialog open state
  const [open, setOpen] = useState(false)
  // Determine if it's an update or create operation
  const isUpdate = Boolean(props._id)
  const [isPending, startTransition] = useTransition()
  // Fetch existing date if updating
  const { data, loading: fetchLoading }: any = useQuery(ENTRY, {
    variables: { _id: props._id },
    skip: !open || !isUpdate,
    fetchPolicy: "no-cache",
  })
  const entry = data?.entry

  // Image upload states for both players
  const [previewPlayer1, setPreviewPlayer1] = useState<string | null>(null)
  const [previewPlayer2, setPreviewPlayer2] = useState<string | null>(null)
  const [filePlayer1, setFilePlayer1] = useState<File | null>(null)
  const [filePlayer2, setFilePlayer2] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [selectedDocumentTypePlayer1, setSelectedDocumentTypePlayer1] = useState<ValidDocumentType>(ValidDocumentType.BIRTH_CERTIFICATE)
  const [selectedDocumentTypePlayer2, setSelectedDocumentTypePlayer2] = useState<ValidDocumentType>(ValidDocumentType.BIRTH_CERTIFICATE)

  // Document Type Options
  const [openDocumentTypes, setOpenDocumentTypes] = useState(false)
  const documentTypes = Object.values(ValidDocumentType).map((type) => ({
    label: type.toLocaleLowerCase().replaceAll("_", " "),
    value: type,
  }))

  // Tournament Options
  const [openTournaments, setOpenTournaments] = useState(false)
  const { data: optionsData, loading: optionsLoading }: any = useQuery(
    OPTIONS,
    {
      skip: !open,
      fetchPolicy: "no-cache",
    }
  )
  const tournaments = optionsData?.tournamentOptions || []
  // Player Options
  const [openPlayers, setOpenPlayers] = useState(false)
  const players = optionsData?.playerOptions || []
  // Fetch Player
  // Event Options by Tournament
  const [tournamentId, setTournamentId] = useState<string | null>(null)
  const [openEvents, setOpenEvents] = useState(false)
  const { data: eventOptionsData, loading: eventOptionsLoading }: any =
    useQuery(EVENT_OPTIONS_BY_TOURNAMENT, {
      skip: !tournamentId,
      fetchPolicy: "no-cache",
      variables: { tournamentId },
    })
  const events = eventOptionsData?.eventOptionsByTournament || []
  // Jersey Size Options
  const [openJerseySizes, setOpenJerseySizes] = useState(false)
  const jerseySizes = Object.values(JerseySize).map((size) => ({
    label: size,
    value: size,
  }))
  // Gender Options
  const [openGenders, setOpenGenders] = useState(false)
  const genders = Object.values(Gender).map((gender) => ({
    label: gender.toLocaleLowerCase().replaceAll("_", " "),
    value: gender,
  }))
  // Combined loading state
  const isLoading =
    isPending || optionsLoading || eventOptionsLoading || fetchLoading

  // Get initial validDocuments from player data
  const initialValidDocumentsPlayer1 = entry?.player1Entry?.validDocuments?.[0] || null
  const initialDocumentUrlPlayer1 = initialValidDocumentsPlayer1?.documentURL || ""
  const initialDocumentTypePlayer1 = initialValidDocumentsPlayer1?.documentType || ValidDocumentType.BIRTH_CERTIFICATE

  const initialValidDocumentsPlayer2 = entry?.player2Entry?.validDocuments?.[0] || null
  const initialDocumentUrlPlayer2 = initialValidDocumentsPlayer2?.documentURL || ""
  const initialDocumentTypePlayer2 = initialValidDocumentsPlayer2?.documentType || ValidDocumentType.BIRTH_CERTIFICATE

  const [fetchPlayer, { data: playerData, loading: playerLoading }] =
    useLazyQuery(PLAYER, {
      fetchPolicy: "no-cache",
    })

  // Mutation hook
  const [submitForm] = useMutation(isUpdate ? UPDATE : CREATE)

  const form = useForm({
    defaultValues: {
      tournament: entry?.event?.tournament?._id || "",
      event: entry?.event?._id || "",
      club: entry?.club || "",
      player1Entry: {
        firstName: entry?.player1Entry?.firstName || "",
        middleName: entry?.player1Entry?.middleName || "",
        lastName: entry?.player1Entry?.lastName || "",
        suffix: entry?.player1Entry?.suffix || "",
        email: entry?.player1Entry?.email || "",
        phoneNumber: entry?.player1Entry?.phoneNumber || "",
        birthDate: entry?.player1Entry?.birthDate
          ? new Date(entry?.player1Entry.birthDate)
          : new Date(),
        gender: entry?.player1Entry?.gender || Gender.MALE,
        jerseySize: entry?.player1Entry?.jerseySize || "M",
        validDocuments: entry?.player1Entry?.validDocuments || [],
      },
      player2Entry: {
        firstName: entry?.player2Entry?.firstName || "",
        middleName: entry?.player2Entry?.middleName || "",
        lastName: entry?.player2Entry?.lastName || "",
        suffix: entry?.player2Entry?.suffix || "",
        email: entry?.player2Entry?.email || "",
        phoneNumber: entry?.player2Entry?.phoneNumber || "",
        birthDate: entry?.player2Entry?.birthDate
          ? new Date(entry?.player2Entry.birthDate)
          : new Date(),
        gender: entry?.player2Entry?.gender || Gender.MALE,
        jerseySize: entry?.player2Entry?.jerseySize || "M",
        validDocuments: entry?.player2Entry?.validDocuments || [],
      },
      connectedPlayer1: entry?.connectedPlayer1?._id || null,
      connectedPlayer2: entry?.connectedPlayer2?._id || null,
      isInSoftware: entry?.isInSoftware || false,
      isEarlyBird: entry?.isEarlyBird || false,
      isPlayer1New: false,
      isPlayer2New: false,
    },
    validators: {
      onSubmit: ({ formApi, value: payload }) => {
        try {
          const event = events.find(
            (e: { value: string }) => e.value === payload.event
          )
          const isDoubles = event?.type === EventType.DOUBLES
          const { tournament, ...modifiedPayload } = {
            ...payload,
            player2Entry: isDoubles ? payload.player2Entry : null,
          }
          CreateEntrySchema.parse(modifiedPayload)
        } catch (error: any) {
          console.error(error)
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
    listeners: {
      onChange: async ({ formApi, fieldApi }) => {
        const fieldName = fieldApi.name
        const fieldValue = fieldApi.state.value

        switch (fieldName) {
          case "tournament":
            if (fieldValue === "") {
              setTournamentId(null)
              formApi.resetField("event")
            } else {
              setTournamentId(fieldValue as string)
              const { hasEarlyBird, earlyBirdRegistrationEnd } =
                tournaments.find(
                  (t: {
                    value: string
                    label: string
                    hasEarlyBird: boolean
                    earlyBirdRegistrationEnd: Date
                  }) => t.value === fieldValue
                )
              const isEarlyBird =
                hasEarlyBird &&
                earlyBirdRegistrationEnd &&
                new Date() <= new Date(earlyBirdRegistrationEnd)
              formApi.setFieldValue("isEarlyBird", isEarlyBird)
              formApi.resetField("event")
            }
            break
          case "connectedPlayer1":
            if (fieldValue) {
              await fetchPlayer({
                variables: { _id: fieldValue },
              }).then((r: any) => {
                const player1 = r.data.player
                formApi.setFieldValue("player1Entry", {
                  firstName: player1.firstName,
                  middleName: player1.middleName,
                  lastName: player1.lastName,
                  suffix: player1.suffix,
                  email: player1.email,
                  phoneNumber: player1.phoneNumber,
                  birthDate: new Date(player1.birthDate),
                  gender: player1.gender,
                  jerseySize: "M",
                  validDocuments: [],
                })
              })
            } else {
              formApi.setFieldValue("player1Entry", {
                firstName: "",
                middleName: "",
                lastName: "",
                suffix: "",
                email: "",
                phoneNumber: "",
                birthDate: new Date(),
                gender: Gender.MALE,
                jerseySize: "M",
                validDocuments: [],
              })
            }
            break
          case "isPlayer1New":
            if (fieldValue) {
              formApi.setFieldValue("connectedPlayer1", null)
            } else {
              formApi.resetField("connectedPlayer1")
            }
            break
          case "connectedPlayer2":
            if (fieldValue) {
              await fetchPlayer({
                variables: { _id: fieldValue },
              }).then((r: any) => {
                const player2 = r.data.player
                formApi.setFieldValue("player2Entry", {
                  firstName: player2.firstName,
                  middleName: player2.middleName,
                  lastName: player2.lastName,
                  suffix: player2.suffix,
                  email: player2.email,
                  phoneNumber: player2.phoneNumber,
                  birthDate: new Date(player2.birthDate),
                  gender: player2.gender,
                  jerseySize: "M",
                  validDocuments: [],
                })
              })
            } else {
              formApi.setFieldValue("player2Entry", {
                firstName: "",
                middleName: "",
                lastName: "",
                suffix: "",
                email: "",
                phoneNumber: "",
                birthDate: new Date(),
                gender: Gender.MALE,
                jerseySize: "M",
                validDocuments: [],
              })
            }
            break
          case "isPlayer2New":
            if (fieldValue) {
              formApi.setFieldValue("connectedPlayer2", null)
            } else {
              formApi.resetField("connectedPlayer2")
            }
            break
        }
      },
    },
    onSubmit: async ({ value: payload, formApi }) =>
      startTransition(async () => {
        try {
          // Upload documents for both players if files are selected
          let documentUrlPlayer1 = initialDocumentUrlPlayer1
          let documentUrlPlayer2 = initialDocumentUrlPlayer2

          if (filePlayer1) {
            const uploadedUrl = await uploadFile(filePlayer1, `entry-player1`)
            if (uploadedUrl) {
              documentUrlPlayer1 = uploadedUrl
            }
          }

          if (filePlayer2) {
            const uploadedUrl = await uploadFile(filePlayer2, `entry-player2`)
            if (uploadedUrl) {
              documentUrlPlayer2 = uploadedUrl
            }
          }

          const event = events.find(
            (e: { value: string }) => e.value === payload.event
          )
          const isDoubles = event?.type === EventType.DOUBLES

          // Prepare player entries with their documents
          const player1Entry = {
            ...payload.player1Entry,
            validDocuments: documentUrlPlayer1 ? [{
              documentURL: documentUrlPlayer1,
              documentType: selectedDocumentTypePlayer1,
              dateUploaded: new Date().toISOString(),
            }] : payload.player1Entry.validDocuments || []
          }

          const player2Entry = isDoubles ? {
            ...payload.player2Entry,
            validDocuments: documentUrlPlayer2 ? [{
              documentURL: documentUrlPlayer2,
              documentType: selectedDocumentTypePlayer2,
              dateUploaded: new Date().toISOString(),
            }] : payload.player2Entry?.validDocuments || []
          } : null

          const modifiedPayload = {
            ...payload,
            player1Entry,
            player2Entry: isDoubles ? player2Entry : null,
          }

          const { tournament, ...finalPayload } = modifiedPayload

          const response: any = await submitForm({
            variables: {
              input: isUpdate
                ? { _id: props._id, ...finalPayload }
                : { ...finalPayload },
            },
          })
          if (response) onClose()
        } catch (error: any) {
          if (error.name == "CombinedGraphQLErrors") {
            const fieldErrors = error.errors[0].extensions.fields
            if (fieldErrors)
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
      }),
  })

  // Set tournamentId when data is fetched
  useEffect(() => {
    if (data && !tournamentId) {
      setTournamentId(data.entry.event.tournament._id)
    }
    // Set initial preview images from player validDocuments
    if (initialDocumentUrlPlayer1) {
      setPreviewPlayer1(initialDocumentUrlPlayer1)
    }
    if (initialDocumentUrlPlayer2) {
      setPreviewPlayer2(initialDocumentUrlPlayer2)
    }
    // Set initial document types
    if (initialDocumentTypePlayer1) {
      setSelectedDocumentTypePlayer1(initialDocumentTypePlayer1)
    }
    if (initialDocumentTypePlayer2) {
      setSelectedDocumentTypePlayer2(initialDocumentTypePlayer2)
    }
  }, [data, tournamentId, initialDocumentUrlPlayer1, initialDocumentUrlPlayer2, initialDocumentTypePlayer1, initialDocumentTypePlayer2])

  const onClose = () => {
    setOpen(false)
    props.onClose?.()
    form.reset()
    setPreviewPlayer1(null)
    setPreviewPlayer2(null)
    setFilePlayer1(null)
    setFilePlayer2(null)
    setFieldErrors({})
    setSelectedDocumentTypePlayer1(ValidDocumentType.BIRTH_CERTIFICATE)
    setSelectedDocumentTypePlayer2(ValidDocumentType.BIRTH_CERTIFICATE)
  }

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    try {
      setIsUploading(true)

      const formData = new FormData()
      const fileExt = file.name.split('.').pop() || ''
      const fileName = `${folder}-${Date.now()}.${fileExt}`
      formData.append("file", file, fileName)

      const response = await fetch(`/api/upload/entry_requirement`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload Failed")
      }

      const data = await response.json()
      toast.success("Document uploaded successfully!")
      return data.url
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("Error uploading document. Please try again.")
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, playerNumber: number) => {
    const uploadedFile = event.target.files?.[0]
    if (!uploadedFile) return

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf']
    if (!validTypes.includes(uploadedFile.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, JPG, WEBP) or PDF')
      setFieldErrors(prev => ({ ...prev, [`filePlayer${playerNumber}`]: 'Please upload a valid image file or PDF' }))
      return
    }
    if (uploadedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      setFieldErrors(prev => ({ ...prev, [`filePlayer${playerNumber}`]: 'File size must be less than 10MB' }))
      return
    }

    if (playerNumber === 1) {
      setFilePlayer1(uploadedFile)
    } else {
      setFilePlayer2(uploadedFile)
    }

    setFieldErrors(prev => ({ ...prev, [`filePlayer${playerNumber}`]: '' }))

    // Create preview for images only (not PDFs)
    if (uploadedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => {
        const imageData = reader.result as string
        if (playerNumber === 1) {
          setPreviewPlayer1(imageData)
        } else {
          setPreviewPlayer2(imageData)
        }
      }
      reader.readAsDataURL(uploadedFile)
    } else {
      if (playerNumber === 1) {
        setPreviewPlayer1(null)
      } else {
        setPreviewPlayer2(null)
      }
    }
  }

  const handleRemoveFile = (playerNumber: number) => {
    if (playerNumber === 1) {
      setFilePlayer1(null)
      setPreviewPlayer1(null)
      form.setFieldValue("player1Entry.validDocuments", [])
    } else {
      setFilePlayer2(null)
      setPreviewPlayer2(null)
      form.setFieldValue("player2Entry.validDocuments", [])
    }
    setFieldErrors(prev => ({ ...prev, [`filePlayer${playerNumber}`]: '' }))
  }

  const UploadingOverlay = () => (
    <motion.div
      className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-lg border">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mb-4"></div>
        <p className="text-lg font-medium text-gray-800 mb-2">
          Uploading document...
        </p>
        <p className="text-sm text-gray-500 mt-4">Please wait</p>
      </div>
    </motion.div>
  )

  // Determine which tabs to show based on event selection
  const getVisibleTabs = (selectedEventId?: string) => {
    if (!selectedEventId) {
      return ["details"]
    }

    const event = events.find((e: { value: string }) => e.value === selectedEventId)
    const isDoubles = event?.type === EventType.DOUBLES

    if (isDoubles) {
      return ["details", "player1", "document1", "player2", "document2"]
    } else {
      return ["details", "player1", "document1"]
    }
  }

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case "details": return "Details"
      case "player1": return "Player 1"
      case "player2": return "Player 2"
      case "document1": return "P1 Doc"
      case "document2": return "P2 Doc"
      default: return tab
    }
  }

  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isUpdate ? (
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            Edit
          </DropdownMenuItem>
        ) : (
          <Button variant="outline-success">
            <CirclePlus className="size-3.5" />
            Add Entry
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
        className="max-w-[610px]!"
      >
        <DialogHeader>
          <DialogTitle>{isUpdate ? "Edit Entry" : "Create Entry"}</DialogTitle>
          <DialogDescription>
            {isUpdate
              ? "Update existing entry details."
              : "Create a new entry in the system."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="-mt-2 mb-2"
          id="entry-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <form.Subscribe
            selector={(state) => state.values}
            children={(state) => {
              const visibleTabs = getVisibleTabs(state.event)

              return (
                <Tabs defaultValue="details" className="">
                  {visibleTabs.length > 1 && (
                    <TabsList className="w-full -mt-2 mb-1 grid" style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, 1fr)` }}>
                      {visibleTabs.map((tab) => (
                        <TabsTrigger key={tab} value={tab}>
                          {getTabLabel(tab)}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  )}

                  <TabsContent value="details">
                    <FieldSet className="flex flex-col gap-3 h-[52vh] overflow-y-auto">
                      <form.Field
                        name="tournament"
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                Tournament
                              </FieldLabel>
                              <Popover
                                open={openTournaments}
                                onOpenChange={setOpenTournaments}
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    id={field.name}
                                    name={field.name}
                                    disabled={optionsLoading}
                                    aria-expanded={openTournaments}
                                    onBlur={field.handleBlur}
                                    variant="outline"
                                    role="combobox"
                                    aria-invalid={isInvalid}
                                    className="w-full justify-between font-normal capitalize -mt-2"
                                    type="button"
                                  >
                                    {field.state.value
                                      ? tournaments.find(
                                        (o: {
                                          value: string
                                          label: string
                                          hasEarlyBird: boolean
                                        }) => o.value === field.state.value
                                      )?.label
                                      : "Select Tournament"}
                                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                  <Command
                                    filter={(value, search) =>
                                      tournaments
                                        .find(
                                          (t: { value: string; label: string }) =>
                                            t.value === value
                                        )
                                        ?.label.toLowerCase()
                                        .includes(search.toLowerCase())
                                        ? 1
                                        : 0
                                    }
                                  >
                                    <CommandInput placeholder="Select Tournament" />
                                    <CommandList className="max-h-72 overflow-y-auto">
                                      <CommandEmpty>
                                        No tournament found.
                                      </CommandEmpty>
                                      <CommandGroup>
                                        <Label className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
                                          Tournaments
                                        </Label>
                                        {tournaments?.map(
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
                                                setOpenTournaments(false)
                                              }}
                                              className="capitalize"
                                            >
                                              <CheckIcon
                                                className={cn(
                                                  "h-4 w-4",
                                                  field.state.value === o.value
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
                                <FieldError errors={field.state.meta.errors} />
                              )}
                            </Field>
                          )
                        }}
                      />
                      <form.Field
                        name="event"
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>Event</FieldLabel>
                              <Popover
                                open={openEvents}
                                onOpenChange={setOpenEvents}
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    id={field.name}
                                    name={field.name}
                                    disabled={
                                      eventOptionsLoading || !state.tournament
                                    }
                                    aria-expanded={openEvents}
                                    onBlur={field.handleBlur}
                                    variant="outline"
                                    role="combobox"
                                    aria-invalid={isInvalid}
                                    className="w-full justify-between font-normal capitalize -mt-2 h-fit"
                                    type="button"
                                  >
                                    {field.state.value ? (
                                      <div>
                                        {(() => {
                                          const selectedEvent = events.find(
                                            (o: {
                                              value: string
                                              label: string
                                              gender: EventGender
                                              type: EventType
                                            }) => o.value === field.state.value
                                          )
                                          return (
                                            <div className="w-full flex flex-col items-start">
                                              <span>{selectedEvent?.label}</span>
                                              <span className="block text-xs text-muted-foreground capitalize">
                                                {selectedEvent?.gender.toLocaleLowerCase()}{" "}
                                                (
                                                {selectedEvent?.type.toLowerCase()}
                                                )
                                              </span>
                                            </div>
                                          )
                                        })()}
                                      </div>
                                    ) : (
                                      "Select Event"
                                    )}
                                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                  <Command
                                    filter={(value, search) =>
                                      events
                                        .find(
                                          (t: { value: string; label: string }) =>
                                            t.value === value
                                        )
                                        ?.label.toLowerCase()
                                        .includes(search.toLowerCase())
                                        ? 1
                                        : 0
                                    }
                                  >
                                    <CommandInput placeholder="Select Event" />
                                    <CommandList className="max-h-72 overflow-y-auto">
                                      <CommandEmpty>No event found.</CommandEmpty>
                                      <CommandGroup>
                                        <Label className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
                                          Events
                                        </Label>
                                        {events?.map(
                                          (o: {
                                            value: string
                                            label: string
                                            gender: EventGender
                                            type: EventType
                                          }) => (
                                            <CommandItem
                                              key={o.value}
                                              value={o.value}
                                              onSelect={(v) => {
                                                field.handleChange(v.toString())
                                                setOpenEvents(false)
                                              }}
                                              className="capitalize"
                                            >
                                              <CheckIcon
                                                className={cn(
                                                  "h-4 w-4",
                                                  field.state.value === o.value
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                                )}
                                              />
                                              <div>
                                                <span className="block">
                                                  {o.label}
                                                </span>
                                                <span className="block text-xs text-muted-foreground capitalize">
                                                  {o.gender.toLocaleLowerCase()} (
                                                  {o.type.toLowerCase()})
                                                </span>
                                              </div>
                                            </CommandItem>
                                          )
                                        )}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              {isInvalid && (
                                <FieldError errors={field.state.meta.errors} />
                              )}
                            </Field>
                          )
                        }}
                      />
                      <form.Field
                        name="club"
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                Club Name
                              </FieldLabel>
                              <InputGroup className="-mt-1.5">
                                <InputGroupInput
                                  placeholder="Name"
                                  disabled={isLoading}
                                  id={field.name}
                                  name={field.name}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) =>
                                    field.handleChange(e.target.value)
                                  }
                                  aria-invalid={isInvalid}
                                />
                              </InputGroup>
                              {isInvalid && (
                                <FieldError errors={field.state.meta.errors} />
                              )}
                            </Field>
                          )
                        }}
                      />
                      <form.Field
                        name="isEarlyBird"
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          return (
                            <Field
                              className="px-1 py-3 border rounded-md"
                              data-invalid={isInvalid}
                            >
                              <div className="flex items-center">
                                <Checkbox
                                  id={field.name}
                                  name={field.name}
                                  checked={field.state.value}
                                  onBlur={field.handleBlur}
                                  onCheckedChange={(checked) =>
                                    field.handleChange(checked === true)
                                  }
                                  className="mx-2"
                                  aria-invalid={isInvalid}
                                  disabled={isLoading}
                                />
                                <div className="grid">
                                  <FieldLabel htmlFor={field.name}>
                                    Early Bird
                                  </FieldLabel>
                                  <span className="text-muted-foreground text-xs">
                                    Indicates if the entry qualifies for early
                                    bird.
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
                    </FieldSet>
                  </TabsContent>

                  {visibleTabs.includes("player1") && (
                    <TabsContent value="player1">
                      <FieldSet className="grid grid-cols-2 place-content-start justify-start gap-3 h-[52vh] overflow-y-auto">
                        {!isUpdate && (
                          <div className="col-span-2 p-3 flex flex-col gap-2.5 border rounded-md">
                            <form.Field
                              name="isPlayer1New"
                              children={(field) => {
                                const isInvalid =
                                  field.state.meta.isTouched &&
                                  !field.state.meta.isValid
                                return (
                                  <Field data-invalid={isInvalid}>
                                    <div className="flex items-center">
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
                                      <FieldError
                                        errors={field.state.meta.errors}
                                      />
                                    )}
                                  </Field>
                                )
                              }}
                            />

                            {!state.isPlayer1New && (
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
                                        open={openPlayers}
                                        onOpenChange={setOpenPlayers}
                                      >
                                        <PopoverTrigger asChild>
                                          <Button
                                            id={field.name}
                                            name={field.name}
                                            disabled={
                                              optionsLoading || playerLoading
                                            }
                                            aria-expanded={openPlayers}
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
                                                  hasEarlyBird: boolean
                                                }) =>
                                                  o.value === field.state.value
                                              )?.label
                                              : "Select Player"}
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
                                            <CommandInput placeholder="Select Player" />
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
                                                        setOpenPlayers(false)
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
                            )}
                          </div>
                        )}

                        <form.Field
                          name="player1Entry.firstName"
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>
                                  First Name
                                </FieldLabel>
                                <InputGroup className="-mt-1.5">
                                  <InputGroupInput
                                    placeholder="Name"
                                    disabled={isLoading}
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                      field.handleChange(e.target.value)
                                    }
                                    aria-invalid={isInvalid}
                                  />
                                </InputGroup>
                                {isInvalid && (
                                  <FieldError errors={field.state.meta.errors} />
                                )}
                              </Field>
                            )
                          }}
                        />
                        <form.Field
                          name="player1Entry.middleName"
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>
                                  Middle Name
                                </FieldLabel>
                                <InputGroup className="-mt-1.5">
                                  <InputGroupInput
                                    placeholder="Name"
                                    disabled={isLoading}
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                      field.handleChange(e.target.value)
                                    }
                                    aria-invalid={isInvalid}
                                  />
                                </InputGroup>
                                {isInvalid && (
                                  <FieldError errors={field.state.meta.errors} />
                                )}
                              </Field>
                            )
                          }}
                        />

                        <div className="col-span-2 flex gap-3">
                          <form.Field
                            name="player1Entry.lastName"
                            children={(field) => {
                              const isInvalid =
                                field.state.meta.isTouched &&
                                !field.state.meta.isValid
                              return (
                                <Field data-invalid={isInvalid}>
                                  <FieldLabel htmlFor={field.name}>
                                    Last Name
                                  </FieldLabel>
                                  <InputGroup className="-mt-1.5">
                                    <InputGroupInput
                                      placeholder="Name"
                                      disabled={isLoading}
                                      id={field.name}
                                      name={field.name}
                                      value={field.state.value}
                                      onBlur={field.handleBlur}
                                      onChange={(e) =>
                                        field.handleChange(e.target.value)
                                      }
                                      aria-invalid={isInvalid}
                                    />
                                  </InputGroup>
                                  {isInvalid && (
                                    <FieldError errors={field.state.meta.errors} />
                                  )}
                                </Field>
                              )
                            }}
                          />
                          <form.Field
                            name="player1Entry.suffix"
                            children={(field) => {
                              const isInvalid =
                                field.state.meta.isTouched &&
                                !field.state.meta.isValid
                              return (
                                <Field data-invalid={isInvalid} className="w-24">
                                  <FieldLabel htmlFor={field.name}>Ext.</FieldLabel>
                                  <InputGroup className="-mt-1.5">
                                    <InputGroupInput
                                      placeholder="Ext."
                                      disabled={isLoading}
                                      id={field.name}
                                      name={field.name}
                                      value={field.state.value}
                                      onBlur={field.handleBlur}
                                      onChange={(e) =>
                                        field.handleChange(e.target.value)
                                      }
                                      aria-invalid={isInvalid}
                                    />
                                  </InputGroup>
                                  {isInvalid && (
                                    <FieldError errors={field.state.meta.errors} />
                                  )}
                                </Field>
                              )
                            }}
                          />
                        </div>
                        <form.Field
                          name="player1Entry.birthDate"
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel
                                  id="p1-birth-date"
                                  htmlFor="p1-birth-date"
                                >
                                  Birth Date
                                </FieldLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      id="p1-birth-date"
                                      name="p1-birth-date"
                                      variant="outline"
                                      data-empty={!field.state.value}
                                      className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal flex -my-1.5"
                                      disabled={isLoading}
                                    >
                                      <CalendarIcon className="size-3.5" />
                                      {field.state.value ? (
                                        format(field.state.value, "PP")
                                      ) : (
                                        <span>Select Birth Date</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      mode="single"
                                      captionLayout="dropdown"
                                      required
                                      selected={field.state.value}
                                      onSelect={field.handleChange}
                                    />
                                  </PopoverContent>
                                </Popover>
                                {isInvalid && (
                                  <FieldError errors={field.state.meta.errors} />
                                )}
                              </Field>
                            )
                          }}
                        />
                        <form.Field
                          name="player1Entry.gender"
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>Gender</FieldLabel>
                                <Popover
                                  open={openGenders}
                                  onOpenChange={setOpenGenders}
                                  modal
                                >
                                  <PopoverTrigger asChild>
                                    <Button
                                      id={field.name}
                                      name={field.name}
                                      disabled={isLoading}
                                      aria-expanded={openGenders}
                                      onBlur={field.handleBlur}
                                      variant="outline"
                                      role="combobox"
                                      aria-invalid={isInvalid}
                                      className="w-full justify-between font-normal capitalize -mt-2"
                                      type="button"
                                    >
                                      {field.state.value
                                        ? genders.find(
                                          (o) => o.value === field.state.value
                                        )?.label
                                        : "Select Gender"}
                                      <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-full p-0">
                                    <Command
                                      filter={(value, search) =>
                                        genders
                                          .find(
                                            (t: { value: string; label: string }) =>
                                              t.value === value
                                          )
                                          ?.label.toLowerCase()
                                          .includes(search.toLowerCase())
                                          ? 1
                                          : 0
                                      }
                                    >
                                      <CommandInput placeholder="Select Role" />
                                      <CommandList className="max-h-72 overflow-y-auto">
                                        <CommandEmpty>
                                          No gennder found.
                                        </CommandEmpty>
                                        <CommandGroup>
                                          <Label className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
                                            Gender
                                          </Label>
                                          {genders?.map((o) => (
                                            <CommandItem
                                              key={o.value}
                                              value={o.value}
                                              onSelect={(v) => {
                                                field.handleChange(v as Gender)
                                                setOpenGenders(false)
                                              }}
                                              className="capitalize"
                                            >
                                              <CheckIcon
                                                className={cn(
                                                  "h-4 w-4",
                                                  field.state.value === o.value
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                                )}
                                              />
                                              {o.label}
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                                {isInvalid && (
                                  <FieldError errors={field.state.meta.errors} />
                                )}
                              </Field>
                            )
                          }}
                        />

                        <form.Field
                          name="player1Entry.phoneNumber"
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>
                                  Phone No.
                                </FieldLabel>
                                <InputGroup className="-mt-1.5">
                                  <InputGroupInput
                                    placeholder="Phone No."
                                    disabled={isLoading}
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                      field.handleChange(e.target.value)
                                    }
                                    aria-invalid={isInvalid}
                                    maxLength={11}
                                  />
                                </InputGroup>
                                {isInvalid && (
                                  <FieldError errors={field.state.meta.errors} />
                                )}
                              </Field>
                            )
                          }}
                        />
                        <form.Field
                          name="player1Entry.jerseySize"
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>
                                  Jersey Size
                                </FieldLabel>
                                <Popover
                                  open={openJerseySizes}
                                  onOpenChange={setOpenJerseySizes}
                                  modal
                                >
                                  <PopoverTrigger asChild>
                                    <Button
                                      id={field.name}
                                      name={field.name}
                                      disabled={isLoading}
                                      aria-expanded={openJerseySizes}
                                      onBlur={field.handleBlur}
                                      variant="outline"
                                      role="combobox"
                                      aria-invalid={isInvalid}
                                      className="w-full justify-between font-normal capitalize -mt-2"
                                      type="button"
                                    >
                                      {field.state.value
                                        ? jerseySizes.find(
                                          (o) => o.value === field.state.value
                                        )?.label
                                        : "Select Jersey Size"}
                                      <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-full p-0">
                                    <Command
                                      filter={(value, search) =>
                                        jerseySizes
                                          .find(
                                            (t: { value: string; label: string }) =>
                                              t.value === value
                                          )
                                          ?.label.toLowerCase()
                                          .includes(search.toLowerCase())
                                          ? 1
                                          : 0
                                      }
                                    >
                                      <CommandInput placeholder="Select Role" />
                                      <CommandList className="max-h-72 overflow-y-auto">
                                        <CommandEmpty>
                                          No jersey size found.
                                        </CommandEmpty>
                                        <CommandGroup>
                                          <Label className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
                                            Jersey Sizes
                                          </Label>
                                          {jerseySizes?.map((o) => (
                                            <CommandItem
                                              key={o.value}
                                              value={o.value}
                                              onSelect={(v) => {
                                                field.handleChange(v as JerseySize)
                                                setOpenJerseySizes(false)
                                              }}
                                              className="capitalize"
                                            >
                                              <CheckIcon
                                                className={cn(
                                                  "h-4 w-4",
                                                  field.state.value === o.value
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                                )}
                                              />
                                              {o.label}
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                                {isInvalid && (
                                  <FieldError errors={field.state.meta.errors} />
                                )}
                              </Field>
                            )
                          }}
                        />
                        <form.Field
                          name="player1Entry.email"
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            return (
                              <Field
                                className="col-span-2"
                                data-invalid={isInvalid}
                              >
                                <FieldLabel htmlFor={field.name}>
                                  Email Address
                                </FieldLabel>
                                <InputGroup className="-mt-1.5">
                                  <InputGroupInput
                                    placeholder="Email Address"
                                    disabled={isLoading}
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                      field.handleChange(e.target.value)
                                    }
                                    aria-invalid={isInvalid}
                                    type="email"
                                  />
                                </InputGroup>
                                {isInvalid && (
                                  <FieldError errors={field.state.meta.errors} />
                                )}
                              </Field>
                            )
                          }}
                        />
                      </FieldSet>
                    </TabsContent>
                  )}

                  {visibleTabs.includes("player2") && (
                    <TabsContent value="player2">
                      <FieldSet className="grid grid-cols-2 place-content-start justify-start gap-3 h-[52vh] overflow-y-auto">
                        {!isUpdate && (
                          <div className="col-span-2 p-3 flex flex-col gap-2.5 border rounded-md">
                            <form.Field
                              name="isPlayer2New"
                              children={(field) => {
                                const isInvalid =
                                  field.state.meta.isTouched &&
                                  !field.state.meta.isValid
                                return (
                                  <Field data-invalid={isInvalid}>
                                    <div className="flex items-center">
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
                                      <FieldError
                                        errors={field.state.meta.errors}
                                      />
                                    )}
                                  </Field>
                                )
                              }}
                            />
                            {!state.isPlayer2New && (
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
                                        open={openPlayers}
                                        onOpenChange={setOpenPlayers}
                                      >
                                        <PopoverTrigger asChild>
                                          <Button
                                            id={field.name}
                                            name={field.name}
                                            disabled={
                                              optionsLoading || playerLoading
                                            }
                                            aria-expanded={openPlayers}
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
                                                  hasEarlyBird: boolean
                                                }) =>
                                                  o.value === field.state.value
                                              )?.label
                                              : "Select Player"}
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
                                            <CommandInput placeholder="Select Player" />
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
                                                        setOpenPlayers(false)
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
                            )}
                          </div>
                        )}

                        <form.Field
                          name="player2Entry.firstName"
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>
                                  First Name
                                </FieldLabel>
                                <InputGroup className="-mt-1.5">
                                  <InputGroupInput
                                    placeholder="Name"
                                    disabled={isLoading}
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                      field.handleChange(e.target.value)
                                    }
                                    aria-invalid={isInvalid}
                                  />
                                </InputGroup>
                                {isInvalid && (
                                  <FieldError errors={field.state.meta.errors} />
                                )}
                              </Field>
                            )
                          }}
                        />
                        <form.Field
                          name="player2Entry.middleName"
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>
                                  Middle Name
                                </FieldLabel>
                                <InputGroup className="-mt-1.5">
                                  <InputGroupInput
                                    placeholder="Name"
                                    disabled={isLoading}
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                      field.handleChange(e.target.value)
                                    }
                                    aria-invalid={isInvalid}
                                  />
                                </InputGroup>
                                {isInvalid && (
                                  <FieldError errors={field.state.meta.errors} />
                                )}
                              </Field>
                            )
                          }}
                        />

                        <div className="col-span-2 flex gap-3">
                          <form.Field
                            name="player2Entry.lastName"
                            children={(field) => {
                              const isInvalid =
                                field.state.meta.isTouched &&
                                !field.state.meta.isValid
                              return (
                                <Field data-invalid={isInvalid}>
                                  <FieldLabel htmlFor={field.name}>
                                    Last Name
                                  </FieldLabel>
                                  <InputGroup className="-mt-1.5">
                                    <InputGroupInput
                                      placeholder="Name"
                                      disabled={isLoading}
                                      id={field.name}
                                      name={field.name}
                                      value={field.state.value}
                                      onBlur={field.handleBlur}
                                      onChange={(e) =>
                                        field.handleChange(e.target.value)
                                      }
                                      aria-invalid={isInvalid}
                                    />
                                  </InputGroup>
                                  {isInvalid && (
                                    <FieldError errors={field.state.meta.errors} />
                                  )}
                                </Field>
                              )
                            }}
                          />
                          <form.Field
                            name="player2Entry.suffix"
                            children={(field) => {
                              const isInvalid =
                                field.state.meta.isTouched &&
                                !field.state.meta.isValid
                              return (
                                <Field data-invalid={isInvalid} className="w-24">
                                  <FieldLabel htmlFor={field.name}>Ext.</FieldLabel>
                                  <InputGroup className="-mt-1.5">
                                    <InputGroupInput
                                      placeholder="Ext."
                                      disabled={isLoading}
                                      id={field.name}
                                      name={field.name}
                                      value={field.state.value}
                                      onBlur={field.handleBlur}
                                      onChange={(e) =>
                                        field.handleChange(e.target.value)
                                      }
                                      aria-invalid={isInvalid}
                                    />
                                  </InputGroup>
                                  {isInvalid && (
                                    <FieldError errors={field.state.meta.errors} />
                                  )}
                                </Field>
                              )
                            }}
                          />
                        </div>
                        <form.Field
                          name="player2Entry.birthDate"
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel
                                  id="p2-birth-date"
                                  htmlFor="p2-birth-date"
                                >
                                  Birth Date
                                </FieldLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      id="p2-birth-date"
                                      name="p2-birth-date"
                                      variant="outline"
                                      data-empty={!field.state.value}
                                      className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal flex -my-1.5"
                                      disabled={isLoading}
                                    >
                                      <CalendarIcon className="size-3.5" />
                                      {field.state.value ? (
                                        format(field.state.value, "PP")
                                      ) : (
                                        <span>Select Birth Date</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      mode="single"
                                      captionLayout="dropdown"
                                      required
                                      selected={field.state.value}
                                      onSelect={field.handleChange}
                                    />
                                  </PopoverContent>
                                </Popover>
                                {isInvalid && (
                                  <FieldError errors={field.state.meta.errors} />
                                )}
                              </Field>
                            )
                          }}
                        />
                        <form.Field
                          name="player2Entry.gender"
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>Gender</FieldLabel>
                                <Popover
                                  open={openGenders}
                                  onOpenChange={setOpenGenders}
                                  modal
                                >
                                  <PopoverTrigger asChild>
                                    <Button
                                      id={field.name}
                                      name={field.name}
                                      disabled={isLoading}
                                      aria-expanded={openGenders}
                                      onBlur={field.handleBlur}
                                      variant="outline"
                                      role="combobox"
                                      aria-invalid={isInvalid}
                                      className="w-full justify-between font-normal capitalize -mt-2"
                                      type="button"
                                    >
                                      {field.state.value
                                        ? genders.find(
                                          (o) => o.value === field.state.value
                                        )?.label
                                        : "Select Gender"}
                                      <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-full p-0">
                                    <Command
                                      filter={(value, search) =>
                                        genders
                                          .find(
                                            (t: { value: string; label: string }) =>
                                              t.value === value
                                          )
                                          ?.label.toLowerCase()
                                          .includes(search.toLowerCase())
                                          ? 1
                                          : 0
                                      }
                                    >
                                      <CommandInput placeholder="Select Role" />
                                      <CommandList className="max-h-72 overflow-y-auto">
                                        <CommandEmpty>
                                          No gender found.
                                        </CommandEmpty>
                                        <CommandGroup>
                                          <Label className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
                                            Gender
                                          </Label>
                                          {genders?.map((o) => (
                                            <CommandItem
                                              key={o.value}
                                              value={o.value}
                                              onSelect={(v) => {
                                                field.handleChange(v as Gender)
                                                setOpenGenders(false)
                                              }}
                                              className="capitalize"
                                            >
                                              <CheckIcon
                                                className={cn(
                                                  "h-4 w-4",
                                                  field.state.value === o.value
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                                )}
                                              />
                                              {o.label}
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                                {isInvalid && (
                                  <FieldError errors={field.state.meta.errors} />
                                )}
                              </Field>
                            )
                          }}
                        />

                        <form.Field
                          name="player2Entry.phoneNumber"
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>
                                  Phone No.
                                </FieldLabel>
                                <InputGroup className="-mt-1.5">
                                  <InputGroupInput
                                    placeholder="Phone No."
                                    disabled={isLoading}
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                      field.handleChange(e.target.value)
                                    }
                                    aria-invalid={isInvalid}
                                    maxLength={11}
                                  />
                                </InputGroup>
                                {isInvalid && (
                                  <FieldError errors={field.state.meta.errors} />
                                )}
                              </Field>
                            )
                          }}
                        />
                        <form.Field
                          name="player2Entry.jerseySize"
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>
                                  Jersey Size
                                </FieldLabel>
                                <Popover
                                  open={openJerseySizes}
                                  onOpenChange={setOpenJerseySizes}
                                  modal
                                >
                                  <PopoverTrigger asChild>
                                    <Button
                                      id={field.name}
                                      name={field.name}
                                      disabled={isLoading}
                                      aria-expanded={openJerseySizes}
                                      onBlur={field.handleBlur}
                                      variant="outline"
                                      role="combobox"
                                      aria-invalid={isInvalid}
                                      className="w-full justify-between font-normal capitalize -mt-2"
                                      type="button"
                                    >
                                      {field.state.value
                                        ? jerseySizes.find(
                                          (o) => o.value === field.state.value
                                        )?.label
                                        : "Select Jersey Size"}
                                      <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-full p-0">
                                    <Command
                                      filter={(value, search) =>
                                        jerseySizes
                                          .find(
                                            (t: { value: string; label: string }) =>
                                              t.value === value
                                          )
                                          ?.label.toLowerCase()
                                          .includes(search.toLowerCase())
                                          ? 1
                                          : 0
                                      }
                                    >
                                      <CommandInput placeholder="Select Role" />
                                      <CommandList className="max-h-72 overflow-y-auto">
                                        <CommandEmpty>
                                          No jersey size found.
                                        </CommandEmpty>
                                        <CommandGroup>
                                          <Label className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
                                            Jersey Sizes
                                          </Label>
                                          {jerseySizes?.map((o) => (
                                            <CommandItem
                                              key={o.value}
                                              value={o.value}
                                              onSelect={(v) => {
                                                field.handleChange(v as JerseySize)
                                                setOpenJerseySizes(false)
                                              }}
                                              className="capitalize"
                                            >
                                              <CheckIcon
                                                className={cn(
                                                  "h-4 w-4",
                                                  field.state.value === o.value
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                                )}
                                              />
                                              {o.label}
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                                {isInvalid && (
                                  <FieldError errors={field.state.meta.errors} />
                                )}
                              </Field>
                            )
                          }}
                        />
                        <form.Field
                          name="player2Entry.email"
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            return (
                              <Field
                                className="col-span-2"
                                data-invalid={isInvalid}
                              >
                                <FieldLabel htmlFor={field.name}>
                                  Email Address
                                </FieldLabel>
                                <InputGroup className="-mt-1.5">
                                  <InputGroupInput
                                    placeholder="Email Address"
                                    disabled={isLoading}
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                      field.handleChange(e.target.value)
                                    }
                                    aria-invalid={isInvalid}
                                    type="email"
                                  />
                                </InputGroup>
                                {isInvalid && (
                                  <FieldError errors={field.state.meta.errors} />
                                )}
                              </Field>
                            )
                          }}
                        />
                      </FieldSet>
                    </TabsContent>
                  )}

                  {/* Document Tabs */}
                  {visibleTabs.includes("document1") && (
                    <DocumentUploadTab
                      playerNumber={1}
                      selectedDocumentType={selectedDocumentTypePlayer1}
                      setSelectedDocumentType={setSelectedDocumentTypePlayer1}
                      file={filePlayer1}
                      setFile={setFilePlayer1}
                      preview={previewPlayer1}
                      setPreview={setPreviewPlayer1}
                      isUploading={isUploading}
                      fieldErrors={fieldErrors}
                      initialDocumentUrl={initialDocumentUrlPlayer1}
                      initialDocumentType={initialDocumentTypePlayer1}
                      isLoading={isLoading}
                      isUpdate={isUpdate}
                      form={form}
                      handleFileUpload={handleFileUpload}
                      handleRemoveFile={handleRemoveFile}
                    />
                  )}

                  {visibleTabs.includes("document2") && (
                    <DocumentUploadTab
                      playerNumber={2}
                      selectedDocumentType={selectedDocumentTypePlayer2}
                      setSelectedDocumentType={setSelectedDocumentTypePlayer2}
                      file={filePlayer2}
                      setFile={setFilePlayer2}
                      preview={previewPlayer2}
                      setPreview={setPreviewPlayer2}
                      isUploading={isUploading}
                      fieldErrors={fieldErrors}
                      initialDocumentUrl={initialDocumentUrlPlayer2}
                      initialDocumentType={initialDocumentTypePlayer2}
                      isLoading={isLoading}
                      isUpdate={isUpdate}
                      form={form}
                      handleFileUpload={handleFileUpload}
                      handleRemoveFile={handleRemoveFile}
                    />
                  )}
                </Tabs>
              )
            }}
          />
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button className="w-20" onClick={onClose} variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            className="w-20"
            loading={isLoading || isUploading}
            type="submit"
            form="entry-form"
          >
            Submit
          </Button>
        </DialogFooter>

        <AnimatePresence>
          {isUploading && <UploadingOverlay />}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

export default FormDialog
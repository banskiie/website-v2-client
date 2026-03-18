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
import { CreateEntrySchema, fieldValidators, validateEntryGenders } from "@/validators/entry.validator"
import { gql } from "@apollo/client"
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react"
import { useForm } from "@tanstack/react-form"
import React, { useEffect, useState, useTransition, useRef, useCallback } from "react"
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
  AlertCircle,
  Sparkles,
  Check,
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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import z from "zod"

const ENTRY = gql`
  query Entry($_id: ID!) {
    entry(_id: $_id) {
      _id
      entryNumber
      entryKey
      club
      isInSoftware
      isEarlyBird
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

// UPDATED: Added pricePerPlayer and earlyBirdPricePerPlayer to the query
const EVENT_OPTIONS_BY_TOURNAMENT = gql`
  query Options($tournamentId: ID!) {
    eventOptionsByTournament(tournamentId: $tournamentId) {
      label
      value
      type
      gender
      pricePerPlayer
      earlyBirdPricePerPlayer
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
      gender
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

type ExtendedEventOption = {
  label: string;
  value: string;
  type: EventType;
  gender: EventGender;
  pricePerPlayer: number;
  earlyBirdPricePerPlayer?: number;
}

type Props = {
  _id?: string
  onClose?: () => void
}

const truncateFileNameWithEllipsis = (fileName: string, prefixLength: number = 15): string => {
  if (fileName.length <= prefixLength + 10) return fileName;

  const extension = fileName.split('.').pop() || '';
  const nameWithoutExtension = fileName.slice(0, fileName.lastIndexOf('.'));

  if (nameWithoutExtension.length <= prefixLength) return fileName;

  const prefix = nameWithoutExtension.slice(0, prefixLength);
  return `${prefix} ... .${extension}`;
};

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
      <FieldSet className="flex flex-col gap-3 h-[60vh] overflow-y-auto">
        <div className="w-full">
          <Field>
            <FieldLabel htmlFor={`documentType${playerNumber}`}>
              Document Type (Player {playerNumber})<span className="text-red-500">*</span>
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
                  <p className="text-sm font-medium truncate" title={file.name}>
                    {truncateFileNameWithEllipsis(file.name, 15)}
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
                  <p className="text-sm font-medium text-gray-700">{truncateFileNameWithEllipsis(file.name, 15)}</p>
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
                  {isUpdate ? "Upload New Document or Browse" : "Upload your document or Browse"}
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
  const [open, setOpen] = useState(false)
  const isUpdate = Boolean(props._id)
  const [isPending, startTransition] = useTransition()

  const [isInitializing, setIsInitializing] = useState(false)

  const { data, loading: fetchLoading, refetch }: any = useQuery(ENTRY, {
    variables: { _id: props._id },
    skip: !open || !isUpdate,
    fetchPolicy: "network-only",
  })
  const entry = data?.entry

  const [previewPlayer1, setPreviewPlayer1] = useState<string | null>(null)
  const [previewPlayer2, setPreviewPlayer2] = useState<string | null>(null)
  const [filePlayer1, setFilePlayer1] = useState<File | null>(null)
  const [filePlayer2, setFilePlayer2] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [selectedDocumentTypePlayer1, setSelectedDocumentTypePlayer1] = useState<ValidDocumentType>(ValidDocumentType.BIRTH_CERTIFICATE)
  const [selectedDocumentTypePlayer2, setSelectedDocumentTypePlayer2] = useState<ValidDocumentType>(ValidDocumentType.BIRTH_CERTIFICATE)

  const [openDocumentTypes, setOpenDocumentTypes] = useState(false)
  const documentTypes = Object.values(ValidDocumentType).map((type) => ({
    label: type.toLocaleLowerCase().replaceAll("_", " "),
    value: type,
  }))

  const [openTournaments, setOpenTournaments] = useState(false)
  const { data: optionsData, loading: optionsLoading }: any = useQuery(
    OPTIONS,
    {
      skip: !open,
      fetchPolicy: "network-only",
    }
  )
  const tournaments = optionsData?.tournamentOptions || []

  const [openPlayers, setOpenPlayers] = useState(false)
  const players = optionsData?.playerOptions || []

  const [tournamentId, setTournamentId] = useState<string | null>(null)
  const [openEvents, setOpenEvents] = useState(false)
  const { data: eventOptionsData, loading: eventOptionsLoading }: any =
    useQuery(EVENT_OPTIONS_BY_TOURNAMENT, {
      skip: !tournamentId,
      fetchPolicy: "network-only",
      variables: { tournamentId },
    })
  const events: ExtendedEventOption[] = eventOptionsData?.eventOptionsByTournament || []

  const [selectedEvent, setSelectedEvent] = useState<ExtendedEventOption | null>(null)

  const [openJerseySizes, setOpenJerseySizes] = useState(false)
  const jerseySizes = [
    { value: JerseySize.XXS, label: "Double Extra Small" },
    { value: JerseySize.XS, label: "Extra Small" },
    { value: JerseySize.S, label: "Small" },
    { value: JerseySize.M, label: "Medium" },
    { value: JerseySize.L, label: "Large" },
    { value: JerseySize.XL, label: "Extra Large" },
    { value: JerseySize.XXL, label: "Double Extra Large" },
    { value: JerseySize.XXXL, label: "Triple Extra Large" },
  ]

  const autoSetGendersBasedOnEvent = useCallback((eventId: string, form: any) => {
    const event = events.find(e => e.value === eventId);
    if (!event) return;

    const isDoubles = event.type === EventType.DOUBLES;

    if (isDoubles) {
      switch (event.gender) {
        case EventGender.MALE:
          form.setFieldValue("player1Entry.gender", Gender.MALE);
          form.setFieldValue("player2Entry.gender", Gender.MALE);
          toast.info("Gender auto-set to Male for both players (Men's Doubles)");
          break;

        case EventGender.FEMALE:
          form.setFieldValue("player1Entry.gender", Gender.FEMALE);
          form.setFieldValue("player2Entry.gender", Gender.FEMALE);
          toast.info("Gender auto-set to Female for both players (Women's Doubles)");
          break;

        case EventGender.MIXED:
          form.setFieldValue("player1Entry.gender", Gender.MALE);
          form.setFieldValue("player2Entry.gender", Gender.FEMALE);
          toast.info("Gender auto-set to Mixed (Male & Female)");
          break;
      }
    }
  }, [events]);



  const [openGenders, setOpenGenders] = useState(false)
  const genders = Object.values(Gender).map((gender) => ({
    label: gender.toLocaleLowerCase().replaceAll("_", " "),
    value: gender,
  }))

  const isLoading =
    isPending || optionsLoading || eventOptionsLoading || fetchLoading || isInitializing

  const initialValidDocumentsPlayer1 = entry?.player1Entry?.validDocuments?.[0] || null
  const initialDocumentUrlPlayer1 = initialValidDocumentsPlayer1?.documentURL || ""
  const initialDocumentTypePlayer1 = initialValidDocumentsPlayer1?.documentType || ValidDocumentType.BIRTH_CERTIFICATE

  const initialValidDocumentsPlayer2 = entry?.player2Entry?.validDocuments?.[0] || null
  const initialDocumentUrlPlayer2 = initialValidDocumentsPlayer2?.documentURL || ""
  const initialDocumentTypePlayer2 = initialValidDocumentsPlayer2?.documentType || ValidDocumentType.BIRTH_CERTIFICATE

  const [fetchPlayer, { data: playerData, loading: playerLoading }] =
    useLazyQuery(PLAYER, {
      fetchPolicy: "network-only",
    })

  const [fetchSuggestions, { loading: suggestionsLoading }] = useLazyQuery<SuggestPlayersResponse>(
    SUGGEST_PLAYERS
  )
  const [suggestedPlayers1, setSuggestedPlayers1] = useState<SuggestPlayer[]>([])
  const [suggestedPlayers2, setSuggestedPlayers2] = useState<SuggestPlayer[]>([])
  const [isLoadingSuggestions1, setIsLoadingSuggestions1] = useState(false)
  const [isLoadingSuggestions2, setIsLoadingSuggestions2] = useState(false)

  // Track selected suggestions
  const [selectedSuggestionId1, setSelectedSuggestionId1] = useState<string | null>(null)
  const [selectedSuggestionId2, setSelectedSuggestionId2] = useState<string | null>(null)

  // Debounce timers
  const debounceTimer1 = useRef<NodeJS.Timeout | null>(null)
  const debounceTimer2 = useRef<NodeJS.Timeout | null>(null)

  // Mutation hook
  const [submitForm] = useMutation(isUpdate ? UPDATE : CREATE)

  // Add a ref to track if submission is in progress
  const isSubmittingRef = useRef(false)



  const form = useForm({
    defaultValues: {
      tournament: "",
      event: "",
      club: "",
      player1Entry: {
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
      },
      player2Entry: {
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
      },
      connectedPlayer1: null as string | null,
      connectedPlayer2: null as string | null,
      isInSoftware: false,
      isEarlyBird: false,
      isPlayer1New: false,
      isPlayer2New: false,
    },
    validators: {
      onSubmit: ({ formApi, value: payload }) => {
        try {
          const event = events.find(
            (e: { value: string }) => e.value === payload.event
          );
          const isDoubles = event?.type === EventType.DOUBLES;
          const eventGender = event?.gender;

          const { tournament, ...modifiedPayload } = {
            ...payload,
            player2Entry: isDoubles ? payload.player2Entry : null,
          };
          CreateEntrySchema.parse(modifiedPayload);

          if (isDoubles && eventGender && payload.player2Entry) {
            const validation = validateEntryGenders(
              eventGender,
              isDoubles,
              payload.player1Entry.gender,
              payload.player2Entry.gender
            );

            if (!validation.valid) {
              if (validation.errors.player1) {
                formApi.fieldInfo["player1Entry.gender"]?.instance?.setErrorMap({
                  onSubmit: { message: validation.errors.player1 },
                });
              }
              if (validation.errors.player2) {
                formApi.fieldInfo["player2Entry.gender"]?.instance?.setErrorMap({
                  onSubmit: { message: validation.errors.player2 },
                });
              }

              throw new Error("Gender validation failed");
            }
          }
        } catch (error: any) {
          console.error(error);
          if (error.name === "ZodError") {
            error.errors.forEach((err: any) => {
              const path = err.path.join(".");
              formApi.fieldInfo[path as keyof typeof formApi.fieldInfo]?.instance?.setErrorMap({
                onSubmit: { message: err.message },
              });
            });
          }
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
              setSelectedEvent(null)
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

              if (!isUpdate) {
                const isEarlyBirdBasedOnDate =
                  hasEarlyBird &&
                  earlyBirdRegistrationEnd &&
                  new Date() <= new Date(earlyBirdRegistrationEnd)

                const currentIsEarlyBird = formApi.getFieldValue("isEarlyBird")
                if (currentIsEarlyBird === false || currentIsEarlyBird === undefined) {
                  formApi.setFieldValue("isEarlyBird", isEarlyBirdBasedOnDate)
                }
              }

              formApi.resetField("event")
              setSelectedEvent(null)
            }
            break
          case "event":
            if (fieldValue) {
              const event = events.find(e => e.value === fieldValue);
              setSelectedEvent(event || null);

              autoSetGendersBasedOnEvent(fieldValue as string, formApi);
            } else {
              setSelectedEvent(null);
            }
            break
          case "connectedPlayer1":
            if (fieldValue) {
              try {
                const result = await fetchPlayer({
                  variables: { _id: fieldValue },
                })
                if (result.data) {
                  const playerData = result.data as { player: any }
                  const player1 = playerData.player
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
                  // Clear selected suggestion when player is connected via dropdown
                  setSelectedSuggestionId1(null)
                }
              } catch (error: any) {
                if (error.name !== 'AbortError') {
                  console.error("Error fetching player 1:", error)
                }
              }
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
              const currentGender = formApi.getFieldValue("player1Entry.gender");

              formApi.setFieldValue("connectedPlayer1", null);
              setSelectedSuggestionId1(null);

              if (currentGender) {
                formApi.setFieldValue("player1Entry.gender", currentGender);
              }
            } else {
              formApi.resetField("connectedPlayer1");
            }
            break;

          case "connectedPlayer2":
            if (fieldValue) {
              try {
                const result = await fetchPlayer({
                  variables: { _id: fieldValue },
                })
                if (result.data) {
                  const playerData = result.data as { player: any }
                  const player2 = playerData.player
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
                  // Clear selected suggestion when player is connected via dropdown
                  setSelectedSuggestionId2(null)
                }
              } catch (error: any) {
                if (error.name !== 'AbortError') {
                  console.error("Error fetching player 2:", error)
                }
              }
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
              const currentGender = formApi.getFieldValue("player2Entry.gender");

              formApi.setFieldValue("connectedPlayer2", null);
              setSelectedSuggestionId2(null);
              if (currentGender) {
                formApi.setFieldValue("player2Entry.gender", currentGender);
              }
            } else {
              formApi.resetField("connectedPlayer2");
            }
            break;
        }

        // Handle player field changes for suggestions
        if (fieldName === "player1Entry.firstName" ||
          fieldName === "player1Entry.lastName" ||
          fieldName === "player1Entry.birthDate") {
          // Debounce player 1 suggestions
          if (debounceTimer1.current) clearTimeout(debounceTimer1.current)
          debounceTimer1.current = setTimeout(() => {
            fetchPlayer1Suggestions()
          }, 500)
        }

        if (fieldName === "player2Entry.firstName" ||
          fieldName === "player2Entry.lastName" ||
          fieldName === "player2Entry.birthDate") {
          // Debounce player 2 suggestions
          if (debounceTimer2.current) clearTimeout(debounceTimer2.current)
          debounceTimer2.current = setTimeout(() => {
            fetchPlayer2Suggestions()
          }, 500)
        }

        // Also handle when player is marked as new or connected player is cleared
        if (fieldName === "connectedPlayer1" && !fieldValue) {
          // When connected player is cleared, fetch suggestions if there's data
          if (debounceTimer1.current) clearTimeout(debounceTimer1.current)
          debounceTimer1.current = setTimeout(() => {
            fetchPlayer1Suggestions()
          }, 500)
        }

        if (fieldName === "connectedPlayer2" && !fieldValue) {
          // When connected player is cleared, fetch suggestions if there's data
          if (debounceTimer2.current) clearTimeout(debounceTimer2.current)
          debounceTimer2.current = setTimeout(() => {
            fetchPlayer2Suggestions()
          }, 500)
        }
      },
    },
    onSubmit: async ({ value: payload, formApi }) => {
      // console.log('SUBMITTING WITH PAYLOAD:', payload);
      // console.log('isEarlyBird value:', payload.isEarlyBird);
      if (isSubmittingRef.current) {
        // console.log('Submission already in progress, skipping...')
        return
      }

      isSubmittingRef.current = true
      // console.log('Form submission started at:', new Date().toISOString())

      try {
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

        // console.log('Submitting form with payload:', finalPayload)

        const response: any = await submitForm({
          variables: {
            input: isUpdate
              ? { _id: props._id, ...finalPayload }
              : { ...finalPayload },
          },
        })

        // console.log('Form submission response:', response)

        if (response) {
          onClose()
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Form submission error:', error)
        }
        if (error.name == "CombinedGraphQLErrors") {
          const fieldErrors = error.issues[0].extensions.fields
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
      } finally {
        isSubmittingRef.current = false
        // console.log('Submission flag reset at:', new Date().toISOString())
      }
    },
  })

  const validateDocuments = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {};
    const eventId = form.getFieldValue("event");

    if (!eventId) return errors;

    const event = events.find(e => e.value === eventId);
    if (!event) return errors;

    const isDoubles = event.type === EventType.DOUBLES;

    const hasPlayer1Doc = filePlayer1 || initialDocumentUrlPlayer1;
    if (!hasPlayer1Doc) {
      errors.filePlayer1 = "Document for Player 1 is required";
    }

    if (isDoubles) {
      const hasPlayer2Doc = filePlayer2 || initialDocumentUrlPlayer2;
      if (!hasPlayer2Doc) {
        errors.filePlayer2 = "Document for Player 2 is required";
      }
    }

    return errors;
  }, [form, events, filePlayer1, filePlayer2, initialDocumentUrlPlayer1, initialDocumentUrlPlayer2]);

  const calculateEntryAmount = useCallback(() => {
    if (!selectedEvent) return null;

    const pricePerPlayer = form.getFieldValue("isEarlyBird") && selectedEvent.earlyBirdPricePerPlayer
      ? selectedEvent.earlyBirdPricePerPlayer
      : selectedEvent.pricePerPlayer;

    if (selectedEvent.type === EventType.DOUBLES) {
      return {
        perPlayer: pricePerPlayer,
        total: pricePerPlayer * 2
      };
    } else {
      return {
        perPlayer: pricePerPlayer,
        total: pricePerPlayer
      };
    }
  }, [selectedEvent, form]);

  useEffect(() => {
    if (entry && isUpdate && form) {
      setIsInitializing(true);

      if (entry?.event?.tournament?._id) {
        setTournamentId(entry.event.tournament._id);
      }

      const initializeForm = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 100));

          form.reset();

          if (entry?.event?.tournament?._id) {
            form.setFieldValue("tournament", entry.event.tournament._id);
          }

          if (entry?.event?._id) {
            form.setFieldValue("event", entry.event._id);
          }

          if (entry?.club) {
            form.setFieldValue("club", entry.club);
          }

          if (entry?.player1Entry) {
            form.setFieldValue("player1Entry", {
              firstName: entry.player1Entry.firstName || "",
              middleName: entry.player1Entry.middleName || "",
              lastName: entry.player1Entry.lastName || "",
              suffix: entry.player1Entry.suffix || "",
              email: entry.player1Entry.email || "",
              phoneNumber: entry.player1Entry.phoneNumber || "",
              birthDate: entry.player1Entry.birthDate
                ? new Date(entry.player1Entry.birthDate)
                : new Date(),
              gender: entry.player1Entry.gender || Gender.MALE,
              jerseySize: entry.player1Entry.jerseySize || "M",
              validDocuments: entry.player1Entry.validDocuments || [],
            });
          }

          if (entry?.player2Entry) {
            form.setFieldValue("player2Entry", {
              firstName: entry.player2Entry.firstName || "",
              middleName: entry.player2Entry.middleName || "",
              lastName: entry.player2Entry.lastName || "",
              suffix: entry.player2Entry.suffix || "",
              email: entry.player2Entry.email || "",
              phoneNumber: entry.player2Entry.phoneNumber || "",
              birthDate: entry.player2Entry.birthDate
                ? new Date(entry.player2Entry.birthDate)
                : new Date(),
              gender: entry.player2Entry.gender || Gender.MALE,
              jerseySize: entry.player2Entry.jerseySize || "M",
              validDocuments: entry.player2Entry.validDocuments || [],
            });
          } else {
            form.setFieldValue("player2Entry", {
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
            });
          }

          if (entry?.connectedPlayer1?._id) {
            form.setFieldValue("connectedPlayer1", entry.connectedPlayer1._id);
          }

          if (entry?.connectedPlayer2?._id) {
            form.setFieldValue("connectedPlayer2", entry.connectedPlayer2._id);
          }

          if (entry?.isInSoftware !== undefined) {
            form.setFieldValue("isInSoftware", entry.isInSoftware);
          }

          if (entry?.isEarlyBird !== undefined) {
            form.setFieldValue("isEarlyBird", entry.isEarlyBird);
          }

          // Set isPlayer1New based on whether there's a connected player
          form.setFieldValue("isPlayer1New", !entry?.connectedPlayer1?._id);

          // Set isPlayer2New based on whether there's a connected player
          form.setFieldValue("isPlayer2New", !entry?.connectedPlayer2?._id);

          // Update preview images
          if (initialDocumentUrlPlayer1) {
            setPreviewPlayer1(initialDocumentUrlPlayer1);
          }
          if (initialDocumentUrlPlayer2) {
            setPreviewPlayer2(initialDocumentUrlPlayer2);
          }

          // Update document types
          if (initialDocumentTypePlayer1) {
            setSelectedDocumentTypePlayer1(initialDocumentTypePlayer1);
          }
          if (initialDocumentTypePlayer2) {
            setSelectedDocumentTypePlayer2(initialDocumentTypePlayer2);
          }

        } catch (error) {
          console.error("Error initializing form:", error);
        } finally {
          setIsInitializing(false);
        }
      };

      initializeForm();
    }
  }, [entry, isUpdate, form, initialDocumentUrlPlayer1, initialDocumentUrlPlayer2, initialDocumentTypePlayer1, initialDocumentTypePlayer2]);

  useEffect(() => {
    const errors = validateDocuments();
    setFieldErrors(prev => ({ ...prev, ...errors }));
  }, [filePlayer1, filePlayer2, initialDocumentUrlPlayer1, initialDocumentUrlPlayer2, selectedEvent]);

  useEffect(() => {
    if (data && !tournamentId) {
      setTournamentId(data.entry.event.tournament._id)
    }
  }, [data, tournamentId])

  const isFormValid = useCallback(() => {
    const values = form.state.values;
    const eventId = values.event;

    if (!eventId) return false;

    const event = events.find(e => e.value === eventId);
    if (!event) return false;

    const isDoubles = event.type === EventType.DOUBLES;

    if (!values.tournament) return false;
    if (!values.club) return false;

    if (!values.player1Entry.firstName) return false;
    if (!values.player1Entry.lastName) return false;
    if (!values.player1Entry.birthDate) return false;
    if (!values.player1Entry.gender) return false;
    if (!values.player1Entry.phoneNumber) return false;
    if (!values.player1Entry.email) return false;

    const hasPlayer1Doc = filePlayer1 || initialDocumentUrlPlayer1;
    if (!hasPlayer1Doc) return false;

    if (isDoubles) {
      if (!values.player2Entry?.firstName) return false;
      if (!values.player2Entry?.lastName) return false;
      if (!values.player2Entry?.birthDate) return false;
      if (!values.player2Entry?.gender) return false;
      if (!values.player2Entry?.phoneNumber) return false;
      if (!values.player2Entry?.email) return false;

      const hasPlayer2Doc = filePlayer2 || initialDocumentUrlPlayer2;
      if (!hasPlayer2Doc) return false;

      if (event.gender === EventGender.MIXED) {
        const player1Gender = values.player1Entry.gender;
        const player2Gender = values.player2Entry.gender;

        const isValid =
          (player1Gender === Gender.MALE && player2Gender === Gender.FEMALE) ||
          (player1Gender === Gender.FEMALE && player2Gender === Gender.MALE);

        if (!isValid) return false;
      } else {
        if (event.gender === EventGender.MALE) {
          if (
            values.player1Entry.gender !== Gender.MALE ||
            values.player2Entry?.gender !== Gender.MALE
          ) return false;
        }
        if (event.gender === EventGender.FEMALE) {
          if (
            values.player1Entry.gender !== Gender.FEMALE ||
            values.player2Entry?.gender !== Gender.FEMALE
          ) return false;
        }
      }
    }

    if (!selectedDocumentTypePlayer1) return false;
    if (isDoubles && !selectedDocumentTypePlayer2) return false;

    return true;
  }, [
    form,
    events,
    filePlayer1,
    filePlayer2,
    initialDocumentUrlPlayer1,
    initialDocumentUrlPlayer2,
    selectedDocumentTypePlayer1,
    selectedDocumentTypePlayer2
  ]);

  useEffect(() => {
    const eventId = form.getFieldValue("event");
    if (eventId) {
      const event = events.find(e => e.value === eventId);
      const isDoubles = event?.type === EventType.DOUBLES;
      const eventGender = event?.gender;

      if (isDoubles && eventGender) {
        const player1Gender = form.getFieldValue("player1Entry.gender");
        const player2Gender = form.getFieldValue("player2Entry.gender");

        if (player1Gender) {
          const validation = validateEntryGenders(
            eventGender,
            isDoubles,
            player1Gender,
            player2Gender
          );

          if (validation.errors.player1) {
            form.setFieldMeta("player1Entry.gender", (prev: any) => ({
              ...prev,
              errors: [validation.errors.player1],
              isTouched: true,
            }));
          } else {
            form.setFieldMeta("player1Entry.gender", (prev: any) => ({
              ...prev,
              errors: [],
            }));
          }

          if (validation.errors.player2) {
            form.setFieldMeta("player2Entry.gender", (prev: any) => ({
              ...prev,
              errors: [validation.errors.player2],
              isTouched: true,
            }));
          } else {
            form.setFieldMeta("player2Entry.gender", (prev: any) => ({
              ...prev,
              errors: [],
            }));
          }
        }
      }
    }
  }, [
    form.getFieldValue("event"),
    form.getFieldValue("player1Entry.gender"),
    form.getFieldValue("player2Entry.gender"),
    events
  ]);

  const GenderRequirementBadge = () => {
    const eventId = form.getFieldValue("event");
    if (!eventId) return null;

    const event = events.find(e => e.value === eventId);
    if (!event || event.type !== EventType.DOUBLES) return null;

    let requirementText = "";
    let bgColor = "";
    let autoSetText = "";

    switch (event.gender) {
      case EventGender.MALE:
        requirementText = "Men's Doubles - Both players must be Male";
        autoSetText = "✓ Genders will be auto-set to Male";
        bgColor = "bg-blue-50 text-blue-700 border-blue-200";
        break;
      case EventGender.FEMALE:
        requirementText = "Women's Doubles - Both players must be Female";
        autoSetText = "✓ Genders will be auto-set to Female";
        bgColor = "bg-pink-50 text-pink-700 border-pink-200";
        break;
      case EventGender.MIXED:
        requirementText = "Mixed Doubles - One Male and one Female required";
        autoSetText = "Please select genders manually";
        bgColor = "bg-green-50 text-green-700 border-green-200";
        break;
      default:
        return null;
    }

    return (
      <div className={`p-3 rounded-lg border ${bgColor} mb-3`}>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <div>
            <span className="text-sm font-medium block">{requirementText}</span>
            <span className="text-xs opacity-75 block mt-1">{autoSetText}</span>
          </div>
        </div>
      </div>
    );
  };

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
    // Reset suggested players
    setSuggestedPlayers1([])
    setSuggestedPlayers2([])
    // Reset selected suggestions
    setSelectedSuggestionId1(null)
    setSelectedSuggestionId2(null)
    // Clear debounce timers
    if (debounceTimer1.current) clearTimeout(debounceTimer1.current)
    if (debounceTimer2.current) clearTimeout(debounceTimer2.current)
    // Reset submission flag when dialog closes
    isSubmittingRef.current = false
    // Reset initialization state
    setIsInitializing(false)
    // Reset selected event
    setSelectedEvent(null)
  }

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    try {
      setIsUploading(true)

      const formData = new FormData()
      const fileExt = file.name.split('.').pop() || ''

      // Truncate the original file name for the server
      const originalName = file.name.slice(0, file.name.lastIndexOf('.'))
      const truncatedOriginalName = originalName.length > 30
        ? originalName.slice(0, 30) + '...'
        : originalName

      const fileName = `${folder}-${truncatedOriginalName}-${Date.now()}.${fileExt}`
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
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Error uploading file:", error)
      }
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
      form.setFieldValue("player1Entry.validDocuments" as any, [])
    } else {
      setFilePlayer2(null)
      setPreviewPlayer2(null)
      form.setFieldValue("player2Entry.validDocuments" as any, [])
    }
    setFieldErrors(prev => ({ ...prev, [`filePlayer${playerNumber}`]: '' }))
  }

  const fetchPlayer1Suggestions = useCallback(async () => {
    const firstName = form.getFieldValue("player1Entry.firstName")
    const lastName = form.getFieldValue("player1Entry.lastName")
    const birthDate = form.getFieldValue("player1Entry.birthDate")

    if (!firstName || !lastName || !birthDate) {
      setSuggestedPlayers1([])
      return
    }

    const connectedPlayer1 = form.getFieldValue("connectedPlayer1")
    const isPlayer1New = form.getFieldValue("isPlayer1New")

    if (connectedPlayer1 || isPlayer1New) {
      setSuggestedPlayers1([])
      return
    }

    setIsLoadingSuggestions1(true)

    try {
      const { data } = await fetchSuggestions({
        variables: {
          input: {
            firstName,
            lastName,
            birthDate: birthDate instanceof Date ? birthDate.toISOString() : birthDate
          }
        }
      })

      setSuggestedPlayers1(data?.suggestPlayers || [])
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Error fetching suggestions for Player 1:", error)
      }
      setSuggestedPlayers1([])
    } finally {
      setIsLoadingSuggestions1(false)
    }
  }, [form, fetchSuggestions])

  const fetchPlayer2Suggestions = useCallback(async () => {
    const firstName = form.getFieldValue("player2Entry.firstName")
    const lastName = form.getFieldValue("player2Entry.lastName")
    const birthDate = form.getFieldValue("player2Entry.birthDate")

    if (!firstName || !lastName || !birthDate) {
      setSuggestedPlayers2([])
      return
    }

    const connectedPlayer2 = form.getFieldValue("connectedPlayer2")
    const isPlayer2New = form.getFieldValue("isPlayer2New")

    if (connectedPlayer2 || isPlayer2New) {
      setSuggestedPlayers2([])
      return
    }

    setIsLoadingSuggestions2(true)

    try {
      const { data } = await fetchSuggestions({
        variables: {
          input: {
            firstName,
            lastName,
            birthDate: birthDate instanceof Date ? birthDate.toISOString() : birthDate
          }
        }
      })

      setSuggestedPlayers2(data?.suggestPlayers || [])
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Error fetching suggestions for Player 2:", error)
      }
      setSuggestedPlayers2([])
    } finally {
      setIsLoadingSuggestions2(false)
    }
  }, [form, fetchSuggestions])

  const handleSelectSuggestedPlayer = async (playerId: string, playerNumber: number) => {
    try {
      if (playerNumber === 1) {
        form.setFieldValue("connectedPlayer1", playerId);
        setSelectedSuggestionId1(playerId);

        const result = await fetchPlayer({
          variables: { _id: playerId },
        });

        if (result.data) {
          const playerData = result.data as { player: any }
          if (playerData.player) {
            const player = playerData.player;
            form.setFieldValue("player1Entry", {
              firstName: player.firstName || "",
              middleName: player.middleName || "",
              lastName: player.lastName || "",
              suffix: player.suffix || "",
              email: player.email || "",
              phoneNumber: player.phoneNumber || "",
              birthDate: player.birthDate ? new Date(player.birthDate) : new Date(),
              gender: player.gender || Gender.MALE,
              jerseySize: "M",
              validDocuments: [],
            });
          }
        }
      } else {
        form.setFieldValue("connectedPlayer2", playerId);
        setSelectedSuggestionId2(playerId);

        const result = await fetchPlayer({
          variables: { _id: playerId },
        });

        if (result.data) {
          const playerData = result.data as { player: any }
          if (playerData.player) {
            const player = playerData.player;
            form.setFieldValue("player2Entry", {
              firstName: player.firstName || "",
              middleName: player.middleName || "",
              lastName: player.lastName || "",
              suffix: player.suffix || "",
              email: player.email || "",
              phoneNumber: player.phoneNumber || "",
              birthDate: player.birthDate ? new Date(player.birthDate) : new Date(),
              gender: player.gender || Gender.MALE,
              jerseySize: "M",
              validDocuments: [],
            });
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error(`Error selecting suggested player for Player ${playerNumber}:`, error);
      }
    }
  }

  const SuggestedPlayersSection = ({
    suggestions,
    isLoading,
    onSelectPlayer,
    playerType,
    onFindMatches,
    showFindMatchesButton,
    selectedSuggestionId
  }: {
    suggestions: SuggestPlayer[];
    isLoading: boolean;
    onSelectPlayer: (playerId: string) => void;
    playerType: 'player1' | 'player2';
    onFindMatches: () => void;
    showFindMatchesButton: boolean;
    selectedSuggestionId: string | null;
  }) => {
    const playerNumber = playerType === 'player1' ? 1 : 2;

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

    const hasSuggestions = suggestions.length > 0;

    return (
      <div className="mb-2">

        {showFindMatchesButton && !hasSuggestions && (
          <div className="mb-4 p-4 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50">
            <div className="flex flex-col items-center text-center">
              <Sparkles className="h-8 w-8 text-blue-400 mb-2" />
              <p className="text-sm font-medium text-blue-800 mb-1">
                Find Matching Players
              </p>
              <p className="text-xs text-blue-600 mb-3">
                Enter first name, last name, and birth date to find similar players
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={onFindMatches}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Sparkles className="h-3 w-3 mr-2" />
                Find Matches
              </Button>
            </div>
          </div>
        )}

        {hasSuggestions && (
          <>
            <div className="space-y-2 max-h-96! overflow-y-auto pr-2">
              {suggestions.map((player) => (
                <div
                  key={player._id}
                  className={cn(
                    "p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors",
                    selectedSuggestionId === player._id && "bg-green-50 border-green-300"
                  )}
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
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              <span>Click on a suggestion to auto-fill the player selection below</span>
            </div>
          </>
        )}
      </div>
    );
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

  // Handle form submission
  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // console.log('Submit button clicked at:', new Date().toISOString())

    // Check if already submitting
    if (isSubmittingRef.current) {
      // console.log('Already submitting, ignoring click')
      toast.warning('Submission already in progress. Please wait.')
      return
    }

    try {
      startTransition(async () => {
        await form.handleSubmit()
      })
    } catch (error) {
      console.error('Form submission error in handleSubmit:', error)
      isSubmittingRef.current = false
    }
  }

  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isUpdate ? (
          <DropdownMenuItem onSelect={(e) => {
            e.preventDefault()
            setOpen(true)
          }}>
            Edit
          </DropdownMenuItem>
        ) : (
          <Button variant="outline-success" onClick={() => setOpen(true)}>
            <CirclePlus className="size-3.5" />
            Add Entry
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
        className="max-w-[810px]!"
      >
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? "Edit Entry" : "Create Entry"}
            {isInitializing && " (Loading...)"}
          </DialogTitle>
          <DialogDescription>
            {isUpdate
              ? "Update existing entry details."
              : "Create a new entry in the system."}
          </DialogDescription>
        </DialogHeader>

        {isInitializing ? (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading entry data...</p>
            </div>
          </div>
        ) : (
          <div className="-mt-2 mb-2">
            <form.Subscribe
              selector={(state) => state.values}
              children={(state) => {
                const visibleTabs = getVisibleTabs(state.event)
                const isPlayer1New = state.isPlayer1New
                const isPlayer2New = state.isPlayer2New
                const hasPlayer1Data = state.player1Entry.firstName && state.player1Entry.lastName && state.player1Entry.birthDate
                const hasPlayer2Data = state.player2Entry.firstName && state.player2Entry.lastName && state.player2Entry.birthDate

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
                      <FieldSet className="flex flex-col gap-3 h-[60vh] overflow-y-auto">
                        <form.Field
                          name="tournament"
                          validators={{
                            onChange: ({ value }) => {
                              if (!value) return "Tournament is required"
                              return undefined
                            },
                          }}
                          children={(field) => {
                            const isInvalid = field.state.meta.errors.length > 0
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
                                      className={cn(
                                        "w-full justify-between font-normal capitalize -mt-2",
                                        isInvalid && "border-red-500 text-red-700"
                                      )}
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
                                  <FieldError errors={field.state.meta.errors.map((err) =>
                                    typeof err === "string" ? { message: err } : err

                                  )} />
                                )}
                              </Field>
                            )
                          }}
                        />
                        <form.Field
                          name="event"
                          validators={{
                            onChange: ({ value }) => {
                              if (!value) return "Event is required"
                              return undefined
                            },
                          }}
                          children={(field) => {
                            const isInvalid = field.state.meta.errors.length > 0
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
                                      className={cn(
                                        "w-full justify-between font-normal capitalize -mt-2 h-fit",
                                        isInvalid && "border-red-500 text-red-700"
                                      )}
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
                                                pricePerPlayer: number
                                                earlyBirdPricePerPlayer?: number
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
                                  <PopoverContent className="w-full p-0" onWheel={(e) => e.stopPropagation()}>
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
                                              pricePerPlayer: number
                                              earlyBirdPricePerPlayer?: number
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
                                                  <span className="block text-xs text-green-600">
                                                    ₱{o.pricePerPlayer.toLocaleString()} per player
                                                    {o.earlyBirdPricePerPlayer && (
                                                      <span className="ml-2 text-orange-600">
                                                        (Early Bird: ₱{o.earlyBirdPricePerPlayer.toLocaleString()})
                                                      </span>
                                                    )}
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
                                  <FieldError errors={field.state.meta.errors.map((err) =>
                                    typeof err === "string" ? { message: err } : err

                                  )} />
                                )}
                              </Field>
                            )
                          }}
                        />
                        <form.Field
                          name="club"
                          children={(field) => {
                            const isInvalid = field.state.meta.errors.length > 0
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
                                  <FieldError errors={field.state.meta.errors.map((err) =>
                                    typeof err === "string" ? { message: err } : err

                                  )} />
                                )}
                              </Field>
                            )
                          }}
                        />

                        <form.Field
                          name="isEarlyBird"
                          children={(field) => {
                            const isInvalid = field.state.meta.errors.length > 0
                            const amount = calculateEntryAmount();
                            // Log the current field value whenever it changes
                            // console.log('isEarlyBird field value:', field.state.value);
                            return (
                              <div className="space-y-3">
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
                                      onCheckedChange={(checked) => {
                                        // console.log('Checkbox clicked, new value:', checked);
                                        field.handleChange(checked === true);
                                        // setTimeout(() => {
                                        //   console.log('After handleChange, field value:', field.state.value);
                                        // }, 100);
                                      }}
                                      className="mx-2"
                                      aria-invalid={isInvalid}
                                    />
                                    <div className="grid">
                                      <FieldLabel htmlFor={field.name}>
                                        Early Bird
                                      </FieldLabel>
                                      <span className="text-muted-foreground text-xs">
                                        {!isUpdate
                                          ? "Manually override early bird status"
                                          : "Indicates if the entry qualifies for early bird."}
                                      </span>
                                    </div>
                                  </div>
                                  {isInvalid && (
                                    <FieldError errors={field.state.meta.errors.map((err) =>
                                      typeof err === "string" ? { message: err } : err
                                    )} />
                                  )}
                                </Field>

                                {/* Show the price based on checkbox state */}
                                {selectedEvent && amount && (
                                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h4 className="font-medium text-blue-800">Entry Fee</h4>
                                        <p className="text-sm text-blue-600">
                                          {field.state.value
                                            ? "Early Bird Rate Applied"
                                            : "Regular Rate"}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-2xl font-bold text-blue-800">
                                          ₱{amount.total.toLocaleString()}
                                        </div>
                                        {field.state.value && selectedEvent.earlyBirdPricePerPlayer && (
                                          <div className="text-xs text-blue-600 line-through">
                                            ₱{(selectedEvent.type === EventType.DOUBLES
                                              ? selectedEvent.pricePerPlayer * 2
                                              : selectedEvent.pricePerPlayer).toLocaleString()}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          }}
                        />
                      </FieldSet>
                    </TabsContent>

                    {visibleTabs.includes("player1") && (
                      <TabsContent value="player1">
                        <div className="flex gap-6">
                          <div className="w-3/4!">
                            <FieldSet className="flex flex-col gap-2.5 h-[60vh] overflow-y-auto pr-2">
                              <GenderRequirementBadge />
                              {!isUpdate && (
                                <div className="p-3 flex flex-col gap-2.5 border rounded-md">
                                  <form.Field
                                    name="isPlayer1New"
                                    children={(field) => {
                                      const isInvalid = field.state.meta.errors.length > 0
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

                                  {!isPlayer1New && (
                                    <form.Field
                                      name={"connectedPlayer1" as any}
                                      children={(field) => {
                                        const isInvalid = field.state.meta.errors.length > 0
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
                                                    "text-muted-foreground",
                                                    isInvalid && "border-red-500 text-red-700"
                                                  )}
                                                  type="button"
                                                >
                                                  {field.state.value
                                                    ? (() => {
                                                      const player = players.find((p: any) => p.value === field.state.value);
                                                      return player?.label || entry?.player1Entry?.firstName + " " + entry?.player1Entry?.lastName || "Selected Player";
                                                    })()
                                                    : "Select Player"}
                                                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                              </PopoverTrigger>
                                              <PopoverContent className="w-full p-0 max-h-80 overflow-hidden" onWheel={(e) => e.stopPropagation()}>
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

                              <div className="grid grid-cols-2 gap-3">
                                <form.Field
                                  name="player1Entry.firstName"
                                  validators={{
                                    onChange: ({ value }) => {
                                      try {
                                        fieldValidators.firstName.parse(value)
                                        return undefined
                                      } catch (error: any) {
                                        if (error instanceof z.ZodError) {
                                          return error.issues[0].message
                                        }
                                        return "Invalid first name"
                                      }
                                    },
                                  }}
                                  children={(field) => {
                                    const isInvalid = field.state.meta.errors.length > 0
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
                                          <FieldError errors={field.state.meta.errors.map((err) =>
                                            typeof err === "string" ? { message: err } : err

                                          )} />
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
                                    validators={{
                                      onChange: ({ value }) => {
                                        try {
                                          fieldValidators.lastName.parse(value)
                                          return undefined
                                        } catch (error: any) {
                                          if (error instanceof z.ZodError) {
                                            return error.issues[0].message
                                          }
                                          return "Invalid last name"
                                        }
                                      },
                                    }}
                                    children={(field) => {
                                      const isInvalid = field.state.meta.errors.length > 0
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
                                            <FieldError errors={field.state.meta.errors.map((err) =>
                                              typeof err === "string" ? { message: err } : err

                                            )} />
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
                                  validators={{
                                    onChange: ({ value }) => {
                                      try {
                                        fieldValidators.birthDate.parse(value)
                                        return undefined
                                      } catch (error: any) {
                                        if (error instanceof z.ZodError) {
                                          return error.issues[0].message
                                        }
                                        return "Invalid birth date"
                                      }
                                    },
                                  }}
                                  children={(field) => {
                                    const isInvalid = field.state.meta.errors.length > 0
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
                                              className={cn(
                                                "data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal flex -my-1.5",
                                                isInvalid && "border-red-500 text-red-700"
                                              )}
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
                                          <FieldError errors={field.state.meta.errors.map((err) =>
                                            typeof err === "string" ? { message: err } : err

                                          )} />
                                        )}
                                      </Field>
                                    )
                                  }}
                                />
                                <form.Field
                                  name="player1Entry.gender"
                                  validators={{
                                    onChange: ({ value }) => {
                                      try {
                                        fieldValidators.gender.parse(value)
                                        return undefined
                                      } catch (error: any) {
                                        if (error instanceof z.ZodError) {
                                          return error.issues[0].message
                                        }
                                        return "Gender is required"
                                      }
                                    },
                                  }}
                                  children={(field) => {
                                    const isInvalid = field.state.meta.errors.length > 0
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
                                              className={cn(
                                                "w-full justify-between font-normal capitalize -mt-2",
                                                isInvalid && "border-red-500 text-red-700"
                                              )}
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
                                          <FieldError errors={field.state.meta.errors.map((err) =>
                                            typeof err === "string" ? { message: err } : err

                                          )} />
                                        )}
                                      </Field>
                                    )
                                  }}
                                />

                                <form.Field
                                  name="player1Entry.phoneNumber"
                                  validators={{
                                    onChange: ({ value }) => {
                                      try {
                                        fieldValidators.phoneNumber.parse(value)
                                        return undefined
                                      } catch (error: any) {
                                        if (error instanceof z.ZodError) {
                                          return error.issues[0].message
                                        }
                                        return "Invalid phone number"
                                      }
                                    },
                                    onChangeAsyncDebounceMs: 500,
                                  }}
                                  children={(field) => {
                                    const isInvalid = field.state.meta.errors.length > 0
                                    return (
                                      <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>
                                          Phone No.
                                        </FieldLabel>
                                        <InputGroup className="-mt-1.5">
                                          <div className="flex items-center px-3 py-1.5 bg-gray-100 border border-input rounded-l-md text-sm text-gray-500">
                                            +63
                                          </div>
                                          <InputGroupInput
                                            placeholder="9123456789"
                                            disabled={isLoading}
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value?.replace(/^0/, "")}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => {
                                              let value = e.target.value;
                                              value = value.replace(/\D/g, '');
                                              value = value.replace(/^(\+?0)?/, '');
                                              value = value.slice(0, 10);
                                              field.handleChange(value);
                                            }}
                                            aria-invalid={isInvalid}
                                            maxLength={10}
                                          />
                                        </InputGroup>
                                        {isInvalid && (
                                          <FieldError
                                            errors={field.state.meta.errors.map((err) =>
                                              typeof err === "string" ? { message: err } : err
                                            )}
                                          />
                                        )}
                                      </Field>
                                    )
                                  }}
                                />

                                <form.Field
                                  name="player1Entry.jerseySize"
                                  validators={{
                                    onChange: ({ value }) => {
                                      try {
                                        fieldValidators.jerseySize.parse(value)
                                        return undefined
                                      } catch (error: any) {
                                        if (error instanceof z.ZodError) {
                                          return error.issues[0].message
                                        }
                                        return "Invalid jersey size"
                                      }
                                    },
                                  }}
                                  children={(field) => {
                                    const isInvalid = field.state.meta.errors.length > 0
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
                                              className={cn(
                                                "w-full justify-between font-normal capitalize -mt-2",
                                                isInvalid && "border-red-500 text-red-700"
                                              )}
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
                                          <FieldError errors={field.state.meta.errors.map((err) =>
                                            typeof err === "string" ? { message: err } : err

                                          )} />
                                        )}
                                      </Field>
                                    )
                                  }}
                                />
                                <form.Field
                                  name="player1Entry.email"
                                  validators={{
                                    onChange: ({ value }) => {
                                      try {
                                        fieldValidators.email.parse(value)
                                        return undefined
                                      } catch (error: any) {
                                        if (error instanceof z.ZodError) {
                                          return error.issues[0].message
                                        }
                                        return "Invalid email"
                                      }
                                    },
                                    onChangeAsyncDebounceMs: 500,
                                  }}
                                  children={(field) => {
                                    const isInvalid = field.state.meta.errors.length > 0
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
                                          <FieldError errors={field.state.meta.errors.map((err) =>
                                            typeof err === "string" ? { message: err } : err

                                          )} />
                                        )}
                                      </Field>
                                    )
                                  }}
                                />
                              </div>
                            </FieldSet>
                          </div>

                          {(!isPlayer1New || isUpdate) && (
                            <div className="w-2/5 border-l pl-6">
                              <div className="mb-4 mt-2">
                                <h3 className="text-md font-semibold mb-2">Suggested Players</h3>
                                <p className="text-xs text-muted-foreground">
                                  Based on name and birthday match from your database
                                </p>
                              </div>

                              <SuggestedPlayersSection
                                suggestions={suggestedPlayers1}
                                isLoading={isLoadingSuggestions1}
                                onSelectPlayer={(playerId) => handleSelectSuggestedPlayer(playerId, 1)}
                                playerType="player1"
                                onFindMatches={() => fetchPlayer1Suggestions()}
                                showFindMatchesButton={false}
                                selectedSuggestionId={selectedSuggestionId1}
                              />

                            </div>
                          )}
                        </div>
                      </TabsContent>
                    )}

                    {visibleTabs.includes("player2") && (
                      <TabsContent value="player2">
                        <div className="flex gap-6">
                          <div className="w-3/4!">
                            <FieldSet className="flex flex-col gap-2.5 h-[60vh] overflow-y-auto pr-2">
                              <GenderRequirementBadge />
                              {!isUpdate && (
                                <div className="p-3 flex flex-col gap-2.5 border rounded-md">
                                  <form.Field
                                    name="isPlayer2New"
                                    children={(field) => {
                                      const isInvalid = field.state.meta.errors.length > 0
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
                                  {!isPlayer2New && (
                                    <form.Field
                                      name={"connectedPlayer2" as any}
                                      children={(field) => {
                                        const isInvalid = field.state.meta.errors.length > 0
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
                                                    "text-muted-foreground",
                                                    isInvalid && "border-red-500 text-red-700"
                                                  )}
                                                  type="button"
                                                >
                                                  {field.state.value
                                                    ? (() => {
                                                      const player = players.find((p: any) => p.value === field.state.value);
                                                      return player?.label || entry?.player2Entry?.firstName + " " + entry?.player2Entry?.lastName || "Selected Player";
                                                    })()
                                                    : "Select Player"}
                                                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                              </PopoverTrigger>
                                              <PopoverContent className="w-full p-0" onWheel={(e) => e.stopPropagation()}>
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
                                                  <CommandList className="h-72 overflow-y-auto">
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

                              <div className="grid grid-cols-2 gap-3">
                                <form.Field
                                  name="player2Entry.firstName"
                                  validators={{
                                    onChange: ({ value }) => {
                                      try {
                                        fieldValidators.firstName.parse(value)
                                        return undefined
                                      } catch (error: any) {
                                        if (error instanceof z.ZodError) {
                                          return error.issues[0].message
                                        }
                                        return "Invalid first name"
                                      }
                                    },
                                  }}
                                  children={(field) => {
                                    const isInvalid = field.state.meta.errors.length > 0
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
                                          <FieldError errors={field.state.meta.errors.map((err) =>
                                            typeof err === "string" ? { message: err } : err

                                          )} />
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
                                    validators={{
                                      onChange: ({ value }) => {
                                        try {
                                          fieldValidators.lastName.parse(value)
                                          return undefined
                                        } catch (error: any) {
                                          if (error instanceof z.ZodError) {
                                            return error.issues[0].message
                                          }
                                          return "Invalid last name"
                                        }
                                      },
                                    }}
                                  >
                                    {(field) => {
                                      const isInvalid = field.state.meta.errors.length > 0
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
                                            <FieldError errors={field.state.meta.errors.map((err) =>
                                              typeof err === "string" ? { message: err } : err

                                            )} />
                                          )}
                                        </Field>
                                      )
                                    }}
                                  </form.Field>
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
                                  validators={{
                                    onChange: ({ value }) => {
                                      try {
                                        fieldValidators.birthDate.parse(value)
                                        return undefined
                                      } catch (error: any) {
                                        if (error instanceof z.ZodError) {
                                          return error.issues[0].message
                                        }
                                        return "Invalid birth date"
                                      }
                                    },
                                  }}
                                  children={(field) => {
                                    const isInvalid = field.state.meta.errors.length > 0
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
                                              className={cn(
                                                "data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal flex -my-1.5",
                                                isInvalid && "border-red-500 text-red-700"
                                              )}
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
                                          <FieldError errors={field.state.meta.errors.map((err) =>
                                            typeof err === "string" ? { message: err } : err

                                          )} />
                                        )}
                                      </Field>
                                    )
                                  }}
                                />
                                <form.Field
                                  name="player2Entry.gender"
                                  validators={{
                                    onChange: ({ value }) => {
                                      try {
                                        fieldValidators.gender.parse(value)
                                        return undefined
                                      } catch (error: any) {
                                        if (error instanceof z.ZodError) {
                                          return error.issues[0].message
                                        }
                                        return "Gender is required"
                                      }
                                    },
                                  }}
                                  children={(field) => {
                                    const isInvalid = field.state.meta.errors.length > 0
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
                                              className={cn(
                                                "w-full justify-between font-normal capitalize -mt-2",
                                                isInvalid && "border-red-500 text-red-700"
                                              )}
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
                                          <FieldError errors={field.state.meta.errors.map((err) =>
                                            typeof err === "string" ? { message: err } : err

                                          )} />
                                        )}
                                      </Field>
                                    )
                                  }}
                                />

                                <form.Field
                                  name="player2Entry.phoneNumber"
                                  validators={{
                                    onChange: ({ value }) => {
                                      try {
                                        fieldValidators.phoneNumber.parse(value)
                                        return undefined
                                      } catch (error: any) {
                                        if (error instanceof z.ZodError) {
                                          return error.issues[0].message
                                        }
                                        return "Invalid phone number"
                                      }
                                    },
                                    onChangeAsyncDebounceMs: 500,
                                  }}
                                  children={(field) => {
                                    const isInvalid = field.state.meta.errors.length > 0
                                    return (
                                      <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>
                                          Phone No.
                                        </FieldLabel>
                                        <InputGroup className="-mt-1.5">
                                          <div className="flex items-center px-3 py-1.5 bg-gray-100 border border-input rounded-l-md text-sm text-gray-500">
                                            +63
                                          </div>
                                          <InputGroupInput
                                            placeholder="9123456789"
                                            disabled={isLoading}
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value?.replace(/^0/, "")}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => {
                                              let value = e.target.value;
                                              value = value.replace(/\D/g, '');
                                              value = value.replace(/^(\+?0)?/, '');
                                              value = value.slice(0, 10);
                                              field.handleChange(value);
                                            }}
                                            aria-invalid={isInvalid}
                                            maxLength={10}
                                          />
                                        </InputGroup>
                                        {isInvalid && (
                                          <FieldError
                                            errors={field.state.meta.errors.map((err) =>
                                              typeof err === "string" ? { message: err } : err
                                            )}
                                          />
                                        )}
                                      </Field>
                                    )
                                  }}
                                />

                                <form.Field
                                  name="player2Entry.jerseySize"
                                  validators={{
                                    onChange: ({ value }) => {
                                      try {
                                        fieldValidators.jerseySize.parse(value)
                                        return undefined
                                      } catch (error: any) {
                                        if (error instanceof z.ZodError) {
                                          return error.issues[0].message
                                        }
                                        return "Invalid jersey size"
                                      }
                                    },
                                  }}
                                  children={(field) => {
                                    const isInvalid = field.state.meta.errors.length > 0
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
                                              className={cn(
                                                "w-full justify-between font-normal capitalize -mt-2",
                                                isInvalid && "border-red-500 text-red-700"
                                              )}
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
                                          <FieldError errors={field.state.meta.errors.map((err) =>
                                            typeof err === "string" ? { message: err } : err

                                          )} />
                                        )}
                                      </Field>
                                    )
                                  }}
                                />
                                <form.Field
                                  name="player2Entry.email"
                                  validators={{
                                    onChange: ({ value }) => {
                                      try {
                                        fieldValidators.email.parse(value)
                                        return undefined
                                      } catch (error: any) {
                                        if (error instanceof z.ZodError) {
                                          return error.issues[0].message
                                        }
                                        return "Invalid email"
                                      }
                                    },
                                    onChangeAsyncDebounceMs: 500,
                                  }}
                                  children={(field) => {
                                    const isInvalid = field.state.meta.errors.length > 0
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
                                          <FieldError errors={field.state.meta.errors.map((err) =>
                                            typeof err === "string" ? { message: err } : err

                                          )} />
                                        )}
                                      </Field>
                                    )
                                  }}
                                />
                              </div>
                            </FieldSet>
                          </div>

                          {(!isPlayer2New || isUpdate) && (
                            <div className="w-1/3 border-l pl-6">
                              <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">Suggested Players</h3>
                                <p className="text-sm text-muted-foreground">
                                  Based on name and birthday match from your database
                                </p>
                              </div>

                              <SuggestedPlayersSection
                                suggestions={suggestedPlayers2}
                                isLoading={isLoadingSuggestions2}
                                onSelectPlayer={(playerId) => handleSelectSuggestedPlayer(playerId, 2)}
                                playerType="player2"
                                onFindMatches={() => fetchPlayer2Suggestions()}
                                showFindMatchesButton={false}
                                selectedSuggestionId={selectedSuggestionId2}
                              />

                              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <div className="flex items-start gap-2">
                                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                                  <div className="text-sm text-blue-800">
                                    <p className="font-medium">How it works:</p>
                                    <p className="text-xs">Suggestions automatically appear as you type. Click on a suggestion to auto-fill the player selection.</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    )}

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
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button className="w-20" onClick={onClose} variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            className="w-20"
            loading={isLoading || isUploading || isSubmittingRef.current}
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid() || isSubmittingRef.current}
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
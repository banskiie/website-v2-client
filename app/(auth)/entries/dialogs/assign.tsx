"use client";

import { gql } from "@apollo/client";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { IEntry } from "@/types/entry.interface";
import { useForm } from "@tanstack/react-form";
import { AssignPlayersSchema } from "@/validators/entry.validator";
import { useTransition } from "react";
import { Field, FieldError, FieldLabel, FieldSet } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";

const ASSIGN_PLAYERS = gql`
  mutation AssignPlayers($input: assignPlayersInput!) {
    assignPlayers(input: $input) {
      ok
      message
    }
  }
`;

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
        address {
          region {
            code
            name
            regionName
            psgcCode
          }
          province {
            code
            name
            regionCode
            psgcCode
          }
          city {
            code
            name
            provinceCode
            regionCode
            psgcCode
            classification
          }
          barangay {
            code
            name
            cityCode
            provinceCode
            regionCode
            psgcCode
          }
          street
          zipCode
          fullAddress
          coordinates {
            lat
            lng
          }
        }
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
        address {
          region {
            code
            name
            regionName
            psgcCode
          }
          province {
            code
            name
            regionCode
            psgcCode
          }
          city {
            code
            name
            provinceCode
            regionCode
            psgcCode
            classification
          }
          barangay {
            code
            name
            cityCode
            provinceCode
            regionCode
            psgcCode
          }
          street
          zipCode
          fullAddress
          coordinates {
            lat
            lng
          }
        }
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
        address {
          region {
            code
            name
            regionName
            psgcCode
          }
          province {
            code
            name
            regionCode
            psgcCode
          }
          city {
            code
            name
            provinceCode
            regionCode
            psgcCode
            classification
          }
          barangay {
            code
            name
            cityCode
            provinceCode
            regionCode
            psgcCode
          }
          street
          zipCode
          fullAddress
          coordinates {
            lat
            lng
          }
        }
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
        address {
          region {
            code
            name
            regionName
            psgcCode
          }
          province {
            code
            name
            regionCode
            psgcCode
          }
          city {
            code
            name
            provinceCode
            regionCode
            psgcCode
            classification
          }
          barangay {
            code
            name
            cityCode
            provinceCode
            regionCode
            psgcCode
          }
          street
          zipCode
          fullAddress
          coordinates {
            lat
            lng
          }
        }
        validDocuments {
          documentURL
          documentType
          dateUploaded
        }
      }
    }
  }
`;

const OPTIONS = gql`
  query Options {
    playerOptions {
      label
      value
    }
  }
`;

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
      address {
        region {
          code
          name
          regionName
          psgcCode
        }
        province {
          code
          name
          regionCode
          psgcCode
        }
        city {
          code
          name
          provinceCode
          regionCode
          psgcCode
          classification
        }
        barangay {
          code
          name
          cityCode
          provinceCode
          regionCode
          psgcCode
        }
        street
        zipCode
        fullAddress
        coordinates {
          lat
          lng
        }
      }
      validDocuments {
        documentURL
        documentType
        dateUploaded
      }
    }
  }
`;

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
      address {
        region {
          code
          name
          regionName
          psgcCode
        }
        province {
          code
          name
          regionCode
          psgcCode
        }
        city {
          code
          name
          provinceCode
          regionCode
          psgcCode
          classification
        }
        barangay {
          code
          name
          cityCode
          provinceCode
          regionCode
          psgcCode
        }
        street
        zipCode
        fullAddress
        coordinates {
          lat
          lng
        }
      }
      validDocuments {
        documentURL
        documentType
        dateUploaded
      }
    }
  }
`;

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
      address {
        fullAddress
        street
        zipCode
        region {
          name
        }
        province {
          name
        }
        city {
          name
        }
        barangay {
          name
        }
      }
      similarityScore
      matchReasons
    }
  }
`;

const UPDATE_DOCUMENT_URLS = gql`
  mutation UpdateEntryDocumentUrls($input: UpdateDocumentUrlsInput!) {
    updateEntryDocumentUrls(input: $input) {
      ok
      message
    }
  }
`;

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
  address?: {
    fullAddress?: string;
    street?: string;
    zipCode?: string;
    region?: { name: string };
    province?: { name: string };
    city?: { name: string };
    barangay?: { name: string };
  };
  similarityScore: number;
  matchReasons: string[];
};

type SuggestPlayersResponse = {
  suggestPlayers: SuggestPlayer[];
};

type Props = {
  _id?: string;
  onClose?: () => void;
  title?: string;
};

type DocumentInfo = {
  documentType: string;
  documentURL: string;
  dateUploaded?: Date;
  player: string;
  source: "existing" | "new";
};

type DocumentSelection = {
  [documentType: string]: {
    selectedSource: string;
    existingDocs: DocumentInfo[];
    newDocs: DocumentInfo[];
  };
};

type ProcessedDocument = {
  documentType: string;
  fileId: string;
  status: string;
  player: string;
  message: string;
  newFileId?: string;
  oldUrl?: string;
  newUrl?: string;
};

type ReplaceResult = {
  replacedDocuments: any[];
  failedReplacements: any[];
  deletedDocuments: any[];
  success: boolean;
  urlUpdates?: Array<{
    oldUrl: string;
    newUrl: string;
    documentType: string;
    player: string;
  }>;
};

const extractFileIdFromUrl = (url: string): string | null => {
  if (!url) return null;

  const cloudinaryPattern = /\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/;
  const match = url.match(cloudinaryPattern);

  if (match && match[1]) {
    return match[1].replace(/\.[^.]+$/, "");
  }

  return url;
};

const replaceDocumentsInDrive = async (
  existingDocuments: any[],
  newDocuments: any[],
  playerType: "player1" | "player2",
  documentSelection?: DocumentSelection,
): Promise<ReplaceResult> => {
  try {
    const replacedDocuments: any[] = [];
    const failedReplacements: any[] = [];
    const deletedDocuments: any[] = [];
    const urlUpdates: Array<{
      oldUrl: string;
      newUrl: string;
      documentType: string;
      player: string;
    }> = [];

    if (documentSelection) {
      for (const [documentType, selection] of Object.entries(documentSelection)) {
        const { selectedSource, existingDocs, newDocs } = selection;

        const parts = selectedSource.split("-");
        const source = parts[1];

        if (source === "existing" && existingDocs?.length) {
          const selectedDoc = existingDocs[0];

          const newDocToDelete = newDocs.find(doc => doc.documentType === documentType);
          if (newDocToDelete?.documentURL) {
            const fileIdToDelete = extractFileIdFromUrl(newDocToDelete.documentURL);
            if (fileIdToDelete) {
              try {
                const deleteResponse = await fetch("/api/transfer/delete", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    fileId: fileIdToDelete,
                    documentType,
                    playerType,
                    reason: "not_selected_user_chose_existing",
                  }),
                });

                if (deleteResponse.ok) {
                  deletedDocuments.push({
                    documentType,
                    fileId: fileIdToDelete,
                    status: "deleted",
                    player: playerType,
                    message: "New document deleted (user chose to keep existing)",
                  });
                }
              } catch (err) {
                console.warn(`Failed to delete new document for ${documentType}:`, err);
              }
            }
          }

          // Track that we're keeping the existing document
          replacedDocuments.push({
            documentType: selectedDoc.documentType,
            fileId: extractFileIdFromUrl(selectedDoc.documentURL) || "",
            status: "keep_existing",
            player: playerType,
            message: `Keeping existing document, deleted new document`,
            newUrl: selectedDoc.documentURL,
          });

          // Add URL update (oldUrl empty means we're just keeping existing)
          urlUpdates.push({
            oldUrl: newDocToDelete?.documentURL || "",
            newUrl: selectedDoc.documentURL,
            documentType: selectedDoc.documentType,
            player: playerType,
          });

        } else if (source === "new" && newDocs?.length) {
          const selectedDoc = newDocs[0];

          const existingDocToDelete = existingDocs.find(doc => doc.documentType === documentType);
          if (existingDocToDelete?.documentURL) {
            const fileIdToDelete = extractFileIdFromUrl(existingDocToDelete.documentURL);
            if (fileIdToDelete) {
              try {
                const deleteResponse = await fetch("/api/transfer/delete", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    fileId: fileIdToDelete,
                    documentType,
                    playerType,
                    reason: "not_selected_user_chose_new",
                  }),
                });

                if (deleteResponse.ok) {
                  deletedDocuments.push({
                    documentType,
                    fileId: fileIdToDelete,
                    status: "deleted",
                    player: playerType,
                    message: "Existing document deleted (user chose to use new document)",
                  });
                }
              } catch (err) {
                console.warn(`Failed to delete existing document for ${documentType}:`, err);
              }
            }
          }

          // Track that we're keeping the new document
          replacedDocuments.push({
            documentType: selectedDoc.documentType,
            fileId: extractFileIdFromUrl(selectedDoc.documentURL) || "",
            status: "keep_new",
            player: playerType,
            message: `Keeping new document, deleted existing document`,
            newUrl: selectedDoc.documentURL,
          });

          // Add URL update
          urlUpdates.push({
            oldUrl: existingDocToDelete?.documentURL || "",
            newUrl: selectedDoc.documentURL,
            documentType: selectedDoc.documentType,
            player: playerType,
          });
        }
      }
    }

    return {
      replacedDocuments,
      failedReplacements,
      deletedDocuments,
      urlUpdates,
      success: true,
    } as ReplaceResult;
  } catch (error) {
    console.error(`❌ Error:`, error);
    return {
      replacedDocuments: [],
      failedReplacements: [],
      deletedDocuments: [],
      urlUpdates: [],
      success: false,
    } as ReplaceResult;
  }
};
const checkAndMoveDocuments = async (
  entry: IEntry,
  connectedPlayer1?: any,
  connectedPlayer2?: any,
  documentSelections: {
    player1?: DocumentSelection;
    player2?: DocumentSelection;
  } = {},
) => {
  try {
    const movedDocuments: ProcessedDocument[] = [];
    const replacedDocuments: ProcessedDocument[] = [];
    const deletedDocuments: ProcessedDocument[] = [];
    const allUrlUpdates: Array<{
      oldUrl: string;
      newUrl: string;
      documentType: string;
      player: string;
    }> = [];

    if (entry.player1Entry?.validDocuments && entry.player1Entry.validDocuments.length > 0) {
      const player1NewDocs = entry.player1Entry.validDocuments;
      const player1ExistingDocs = connectedPlayer1?.validDocuments || [];
      const hasExistingPlayer1Docs = player1ExistingDocs.length > 0;

      if (hasExistingPlayer1Docs && documentSelections.player1) {
        const player1Result = await replaceDocumentsInDrive(
          player1ExistingDocs,
          player1NewDocs,
          "player1",
          documentSelections.player1,
        );

        if (player1Result.urlUpdates) {
          allUrlUpdates.push(...player1Result.urlUpdates);
        }
        if (player1Result.replacedDocuments) {
          replacedDocuments.push(...player1Result.replacedDocuments);
        }
        if (player1Result.deletedDocuments) {
          deletedDocuments.push(...player1Result.deletedDocuments);
        }

      } else if (!hasExistingPlayer1Docs) {
        for (const doc of player1NewDocs) {
          allUrlUpdates.push({
            oldUrl: "",
            newUrl: doc.documentURL,
            documentType: doc.documentType,
            player: "player1",
          });
          replacedDocuments.push({
            documentType: doc.documentType,
            fileId: extractFileIdFromUrl(doc.documentURL) || "",
            status: "new_document",
            player: "player1",
            message: "Adding new document",
            newUrl: doc.documentURL,
          });
        }
      } else {
        for (const existingDoc of player1ExistingDocs) {
          allUrlUpdates.push({
            oldUrl: player1NewDocs.find((d) => d.documentType === existingDoc.documentType)?.documentURL || "",
            newUrl: existingDoc.documentURL,
            documentType: existingDoc.documentType,
            player: "player1",
          });
          replacedDocuments.push({
            documentType: existingDoc.documentType,
            fileId: extractFileIdFromUrl(existingDoc.documentURL) || "",
            status: "keep_existing",
            player: "player1",
            message: "Keeping existing document",
            newUrl: existingDoc.documentURL,
          });
        }
      }
    }

    if (entry.player2Entry?.validDocuments && entry.player2Entry.validDocuments.length > 0) {
      const player2NewDocs = entry.player2Entry.validDocuments;
      const player2ExistingDocs = connectedPlayer2?.validDocuments || [];
      const hasExistingPlayer2Docs = player2ExistingDocs.length > 0;

      if (hasExistingPlayer2Docs && documentSelections.player2) {
        const player2Result = await replaceDocumentsInDrive(
          player2ExistingDocs,
          player2NewDocs,
          "player2",
          documentSelections.player2,
        );

        if (player2Result.urlUpdates) {
          allUrlUpdates.push(...player2Result.urlUpdates);
        }
        if (player2Result.replacedDocuments) {
          replacedDocuments.push(...player2Result.replacedDocuments);
        }
        if (player2Result.deletedDocuments) {
          deletedDocuments.push(...player2Result.deletedDocuments);
        }

      } else if (!hasExistingPlayer2Docs) {
        for (const doc of player2NewDocs) {
          allUrlUpdates.push({
            oldUrl: "",
            newUrl: doc.documentURL,
            documentType: doc.documentType,
            player: "player2",
          });
          replacedDocuments.push({
            documentType: doc.documentType,
            fileId: extractFileIdFromUrl(doc.documentURL) || "",
            status: "new_document",
            player: "player2",
            message: "Adding new document",
            newUrl: doc.documentURL,
          });
        }
      } else {
        for (const existingDoc of player2ExistingDocs) {
          allUrlUpdates.push({
            oldUrl: player2NewDocs.find((d) => d.documentType === existingDoc.documentType)?.documentURL || "",
            newUrl: existingDoc.documentURL,
            documentType: existingDoc.documentType,
            player: "player2",
          });
          replacedDocuments.push({
            documentType: existingDoc.documentType,
            fileId: extractFileIdFromUrl(existingDoc.documentURL) || "",
            status: "keep_existing",
            player: "player2",
            message: "Keeping existing document",
            newUrl: existingDoc.documentURL,
          });
        }
      }
    }

    return {
      moved: movedDocuments,
      replaced: replacedDocuments,
      deleted: deletedDocuments,
      urlUpdates: allUrlUpdates,
      total: movedDocuments.length + replacedDocuments.length + deletedDocuments.length,
    };
  } catch (error) {
    console.error("❌ Error in checkAndMoveDocuments:", error);
    return {
      moved: [],
      replaced: [],
      deleted: [],
      urlUpdates: [],
      total: 0,
    };
  }
};

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
  const [globalSelection, setGlobalSelection] = useState<string>("");
  const [expandedPreview, setExpandedPreview] = useState<{
    url: string;
    type: string;
    source: "existing" | "new";
  } | null>(null);

  const allDocuments = [
    ...existingDocuments.map(doc => ({ ...doc, source: 'existing' as const })),
    ...newDocuments.map(doc => ({ ...doc, source: 'new' as const }))
  ];

  const documentTypes = [...new Set(allDocuments.map(doc => doc.documentType))];

  useEffect(() => {
    if (open) {
      setGlobalSelection("");
    }
  }, [open]);

  const handleSave = () => {
    if (!globalSelection) {
      toast.error("Please select a document option");
      return;
    }

    const selections: DocumentSelection = {};

    if (globalSelection === "global-existing") {
      existingDocuments.forEach(existingDoc => {
        const docType = existingDoc.documentType;
        selections[docType] = {
          selectedSource: `${docType}-existing-0`,
          existingDocs: [existingDoc],
          newDocs: newDocuments.filter(doc => doc.documentType === docType), // Include matching new docs for deletion
        };
      });

      newDocuments.forEach(newDoc => {
        const docType = newDoc.documentType;
        if (!selections[docType]) {
          selections[docType] = {
            selectedSource: "",
            existingDocs: [],
            newDocs: [newDoc],
          };
        }
      });
    } else {
      newDocuments.forEach(newDoc => {
        const docType = newDoc.documentType;
        selections[docType] = {
          selectedSource: `${docType}-new-0`,
          existingDocs: existingDocuments.filter(doc => doc.documentType === docType),
          newDocs: [newDoc],
        };
      });

      existingDocuments.forEach(existingDoc => {
        const docType = existingDoc.documentType;
        if (!selections[docType]) {
          selections[docType] = {
            selectedSource: "",
            existingDocs: [existingDoc],
            newDocs: [],
          };
        }
      });
    }

    onSave(selections);
    onOpenChange(false);
  };
  const getFileType = (url: string): string => {
    if (!url) return "unknown";

    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      if (url.includes("drive.google.com")) {
        return "googleDrive";
      }

      const pathParts = pathname.split(".");
      if (pathParts.length > 1) {
        const extension = pathParts.pop()?.toLowerCase() || "";

        if (
          ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(
            extension,
          )
        ) {
          return "image";
        } else if (["pdf"].includes(extension)) {
          return "pdf";
        } else if (["doc", "docx"].includes(extension)) {
          return "doc";
        } else if (["txt"].includes(extension)) {
          return "text";
        }
      }
    } catch (e) {
      console.error("Error parsing URL:", e);
    }

    return "image";
  };

  const getGoogleDrivePreviewUrl = (url: string): string => {
    if (!url) return "";

    try {
      const urlObj = new URL(url);
      const fileId = urlObj.searchParams.get("id");

      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }

      const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    } catch (e) {
      console.error("Error parsing URL:", e);
    }

    return url;
  };

  const renderDocumentPreview = (
    doc: DocumentInfo,
    source: "existing" | "new",
  ) => {
    const fileType = getFileType(doc.documentURL);
    const isGoogleDrive = fileType === "googleDrive";
    const previewUrl = isGoogleDrive
      ? getGoogleDrivePreviewUrl(doc.documentURL)
      : doc.documentURL;
    const documentTypeName = doc.documentType.replaceAll("_", " ");

    return (
      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-50 border">
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
              className="w-full h-full object-contain"
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
    );
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl! max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Select Documents for {playerName}
          </DialogTitle>
          <DialogDescription className="text-sm">
            Choose which version to keep for all document types
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
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Choose Document Source</h3>

                  <div className="flex flex-col space-y-4 bg-gray-50 p-4 rounded-lg">
                    <RadioGroup
                      value={globalSelection}
                      onValueChange={setGlobalSelection}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      {existingDocuments.length > 0 && (
                        <div className="space-y-3 p-4 border rounded-lg bg-white">
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem
                              value="global-existing"
                              id="global-existing"
                              className="h-4 w-4 cursor-pointer"
                            />
                            <Label htmlFor="global-existing" className="text-sm cursor-pointer font-medium underline underline-offset-2 hover:scale-105 transition-transform duration-200 ease-in">
                              Use Existing Documents
                            </Label>
                          </div>
                          <div className="pl-7 space-y-2">
                            <div className="text-xs text-gray-500">
                              Keep all existing documents from database
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                              {existingDocuments.map(existingDoc => (
                                <Badge key={existingDoc.documentType} variant="outline" className="text-xs bg-blue-50">
                                  {existingDoc.documentType.replaceAll("_", " ")}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {newDocuments.length > 0 && (
                        <div className="space-y-3 p-4 border rounded-lg bg-white">
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem
                              value="global-new"
                              id="global-new"
                              className="h-4 w-4 cursor-pointer"
                            />
                            <Label
                              htmlFor="global-new"
                              className="text-sm font-medium cursor-pointer underline underline-offset-2 hover:scale-105 transition-transform duration-200 ease-in"
                            >
                              Use New Documents
                            </Label>
                          </div>
                          <div className="pl-7 space-y-2">
                            <div className="text-xs text-gray-500">
                              Use all new documents from entry
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                              {newDocuments.map(newDoc => (
                                <Badge key={newDoc.documentType} variant="outline" className="text-xs bg-green-50">
                                  {newDoc.documentType.replaceAll("_", " ")}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </RadioGroup>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-gray-700">
                      Document Previews ({allDocuments.length} total)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {allDocuments.map((doc, idx) => (
                        <div key={`${doc.documentType}-${doc.source}-${idx}`} className="relative">
                          <div className="absolute top-2 left-2 z-20">
                            <Badge className={`text-xs ${doc.source === 'existing' ? 'bg-blue-500' : 'bg-green-500'} text-white`}>
                              {doc.source === 'existing' ? 'Existing' : 'New'}
                            </Badge>
                          </div>
                          {renderDocumentPreview(doc, doc.source)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {globalSelection && (
                    <div className="text-sm text-center pt-4">
                      {globalSelection === "global-existing" ? (
                        <p className="text-green-800 bg-green-50 p-3 rounded">
                          <Check className="h-4 w-4 inline mr-2" />
                          <span>All existing documents will be kept</span>
                        </p>
                      ) : (
                        <p className="text-amber-800 bg-amber-50 p-3 rounded">
                          <AlertCircle className="h-4 w-4 inline mr-2" />
                          <span>All new documents will replace existing ones</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {allDocuments.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-20 w-20 mx-auto text-gray-300 mb-5" />
                    <p className="text-xl text-gray-600 font-medium">
                      No documents to select
                    </p>
                    <p className="text-base text-gray-500 mt-2 max-w-md mx-auto">
                      There are no documents that need selection for this player.
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
                disabled={isLoading || !globalSelection}
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
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [showDocumentSelection1, setShowDocumentSelection1] = useState(false);
  const [showDocumentSelection2, setShowDocumentSelection2] = useState(false);
  const [documentSelections, setDocumentSelections] = useState<{
    player1?: DocumentSelection;
    player2?: DocumentSelection;
  }>({});
  const [suggestedPlayers1, setSuggestedPlayers1] = useState<SuggestPlayer[]>(
    [],
  );
  const [suggestedPlayers2, setSuggestedPlayers2] = useState<SuggestPlayer[]>(
    [],
  );
  const [isLoadingSuggestions1, setIsLoadingSuggestions1] = useState(false);
  const [isLoadingSuggestions2, setIsLoadingSuggestions2] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    player1?: string;
    player2?: string;
  }>({});
  const [activeTab, setActiveTab] = useState<string>("player1");

  const [assignPlayers, { loading: assignLoading }] =
    useMutation(ASSIGN_PLAYERS);
  const [updateDocumentUrls] = useMutation(UPDATE_DOCUMENT_URLS);
  const {
    data,
    loading: entryLoading,
    refetch,
  } = useQuery<{ entry: IEntry }>(ENTRY, {
    variables: { _id: props._id },
    skip: !open || !Boolean(props._id),
    fetchPolicy: "network-only",
  });
  const entry = data?.entry;
  const { data: optionsData, loading: optionsLoading }: any = useQuery(
    OPTIONS,
    {
      skip: !open,
      fetchPolicy: "network-only",
    },
  );
  const [fetchSuggestions1, { loading: suggestions1Loading }] =
    useLazyQuery<SuggestPlayersResponse>(SUGGEST_PLAYERS, {
      fetchPolicy: "network-only",
    });

  const [fetchSuggestions2, { loading: suggestions2Loading }] =
    useLazyQuery<SuggestPlayersResponse>(SUGGEST_PLAYERS, {
      fetchPolicy: "network-only",
    });
  const [openPlayers1, setOpenPlayers1] = useState(false);
  const [openPlayers2, setOpenPlayers2] = useState(false);
  const players = optionsData?.playerOptions || [];
  const [fetchPlayer1, { data: player1Data, loading: player1Loading }]: any =
    useLazyQuery(PLAYER_1, {
      fetchPolicy: "network-only",
    });
  const [fetchPlayer2, { data: player2Data, loading: player2Loading }]: any =
    useLazyQuery(PLAYER_2, {
      fetchPolicy: "network-only",
    });
  const player1 = player1Data?.player;
  const player2 = player2Data?.player;
  const isLoading =
    assignLoading ||
    entryLoading ||
    optionsLoading ||
    player1Loading ||
    player2Loading;

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
        address: false,
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
        address: false,
        validDocuments: false,
      },
    },
    listeners: {
      onChange: ({ formApi, fieldApi }) => {
        if (
          fieldApi.name.includes("connectedPlayer") ||
          fieldApi.name.includes("isPlayer")
        ) {
          setValidationErrors({});
        }

        if (fieldApi.name === "isPlayer1New" && fieldApi.state.value) {
          formApi.setFieldValue("connectedPlayer1", null);
          formApi.setFieldValue("migratePlayer1Data", {
            firstName: false,
            middleName: false,
            lastName: false,
            suffix: false,
            birthDate: false,
            phoneNumber: false,
            email: false,
            address: false,
            validDocuments: false,
          });
          setDocumentSelections((prev) => ({ ...prev, player1: undefined }));
        }

        if (fieldApi.name === "connectedPlayer1" && fieldApi.state.value) {
          fetchPlayer1({ variables: { _id: fieldApi.state.value } });
        }

        if (fieldApi.name === "isPlayer2New" && fieldApi.state.value) {
          formApi.setFieldValue("connectedPlayer2", null);
          formApi.setFieldValue("migratePlayer2Data", {
            firstName: false,
            middleName: false,
            lastName: false,
            suffix: false,
            birthDate: false,
            phoneNumber: false,
            email: false,
            address: false,
            validDocuments: false,
          });
          setDocumentSelections((prev) => ({ ...prev, player2: undefined }));
        }
        if (fieldApi.name === "connectedPlayer2" && fieldApi.state.value) {
          fetchPlayer2({ variables: { _id: fieldApi.state.value } });
        }
      },
    },
    validators: {
      onSubmit: ({ formApi, value }) => {
        try {
          AssignPlayersSchema.parse(value);
        } catch (error: any) {
          const formErrors = JSON.parse(error);
          formErrors.map(
            ({ path, message }: { path: string; message: string }) =>
              formApi.fieldInfo[
                path as keyof typeof formApi.fieldInfo
              ]?.instance?.setErrorMap({
                onSubmit: { message },
              }),
          );
        }
      },
    },
    onSubmit: ({ value: payload, formApi }) =>
      startTransition(async () => {
        try {
          const finalPayload = {
            ...payload,
          };

          let urlUpdates: any[] = [];

          if (entry) {
            try {
              const documentResult = await checkAndMoveDocuments(
                entry,
                player1,
                player2,
                documentSelections,
              );

              urlUpdates = documentResult.urlUpdates || [];

              // console.log(`📦 Document processing result:`);
              // console.log(
              //   `   - Total documents processed: ${documentResult.total}`,
              // );
              // console.log(`   - URL updates found: ${urlUpdates.length}`);

              if (urlUpdates.length > 0) {
                // console.log(`🔄 URL updates to be sent to backend:`);
                urlUpdates.forEach((update, index) => {
                  // console.log(
                  //   `   ${index + 1}. ${update.player} - ${update.documentType}`,
                  // );
                  // console.log(`      Old: ${update.oldUrl}`);
                  // console.log(`      New: ${update.newUrl}`);
                });
              } else {
                // console.log(`⚠️ No URL updates to send to backend`);
              }

              if (documentResult.total > 0) {
                const messages: string[] = [];

                if (documentResult.replaced.length > 0) {
                  messages.push(
                    `Replaced ${documentResult.replaced.length} document(s)`,
                  );
                }

                if (messages.length > 0) {
                  toast.success(`Documents processed: ${messages.join(", ")}`, {
                    duration: 5000,
                  });
                }
              }
            } catch (documentError: any) {
              console.error("Document processing error:", documentError);
              toast.warning(
                "Some documents could not be processed, but players will still be assigned",
                {
                  duration: 4000,
                },
              );
            }
          }

          const response: any = await assignPlayers({
            variables: {
              input: finalPayload,
            },
          });

          if (response?.data?.assignPlayers?.ok) {
            if (urlUpdates && urlUpdates.length > 0) {
              // console.log(
              //   `📝 Updating ${urlUpdates.length} document URLs in database...`,
              // );

              try {
                const updatesForMutation = urlUpdates.map((update: any) => ({
                  documentType: update.documentType,
                  oldUrl: update.oldUrl,
                  newUrl: update.newUrl,
                  playerType: update.player,
                }));

                const urlUpdateResult = await updateDocumentUrls({
                  variables: {
                    input: {
                      entryId: entry?._id,
                      player1Id: player1?._id || null,
                      player2Id: player2?._id || null,
                      updates: updatesForMutation,
                    },
                  },
                });

                if (
                  (urlUpdateResult.data as any)?.updateEntryDocumentUrls?.ok
                ) {
                  toast.success(
                    `Updated ${urlUpdates.length} document URL(s)`,
                    {
                      duration: 3000,
                    },
                  );
                  // console.log(
                  //   `✅ Successfully updated ${urlUpdates.length} document URLs`,
                  // );

                  await refetch();
                } else {
                  console.warn(
                    "Failed to update document URLs:",
                    urlUpdateResult,
                  );
                  toast.warning("Document URLs could not be updated", {
                    duration: 4000,
                  });
                }
              } catch (urlError) {
                console.error("Error updating document URLs:", urlError);
                toast.warning(
                  "Players assigned but document URLs could not be updated",
                  {
                    duration: 4000,
                  },
                );
              }
            }

            onClose();

            toast.success(
              response.data.assignPlayers.message ||
              "Players assigned successfully",
              {
                duration: 3000,
              },
            );
          } else {
            toast.error(
              response?.data?.assignPlayers?.message ||
              "Failed to assign players",
              {
                duration: 3000,
              },
            );
          }
        } catch (error: any) {
          console.error("Assignment error:", error);
          toast.error(error.message || "Failed to assign players", {
            duration: 3000,
          });

          if (error.name == "CombinedGraphQLErrors") {
            const fieldErrors = error.errors[0]?.extensions?.fields;
            if (fieldErrors) {
              fieldErrors.map(
                ({ path, message }: { path: string; message: string }) =>
                  formApi.fieldInfo[
                    path as keyof typeof formApi.fieldInfo
                  ]?.instance?.setErrorMap({
                    onSubmit: { message },
                  }),
              );
            }
          }
        }
      }),
  });

  const fetchPlayer1Suggestions = useCallback(async () => {
    const currentEntry = entry;

    if (!currentEntry?.player1Entry) {
      return;
    }

    const { firstName, lastName, birthDate } = currentEntry.player1Entry;

    if (!firstName || !lastName || !birthDate) {
      setSuggestedPlayers1([]);
      return;
    }

    setIsLoadingSuggestions1(true);
    try {
      const { data, error } = await fetchSuggestions1({
        variables: {
          input: {
            firstName,
            lastName,
            birthDate: birthDate instanceof Date ? birthDate.toISOString() : birthDate,
          },
        },
      });

      if (error) {
        console.error("GraphQL error fetching suggestions:", error);
      }

      const suggestions = data?.suggestPlayers || [];
      setSuggestedPlayers1(suggestions);
    } catch (error) {
      console.error("Error fetching suggestions for Player 1:", error);
      setSuggestedPlayers1([]);
    } finally {
      setIsLoadingSuggestions1(false);
    }
  }, [entry, fetchSuggestions1]);

  const fetchPlayer2Suggestions = useCallback(async () => {
    const currentEntry = entry;

    if (!currentEntry?.player2Entry) {
      return;
    }

    const { firstName, lastName, birthDate } = currentEntry.player2Entry;

    if (!firstName || !lastName || !birthDate) {
      setSuggestedPlayers2([]);
      return;
    }

    setIsLoadingSuggestions2(true);
    try {
      const { data, error } = await fetchSuggestions2({
        variables: {
          input: {
            firstName,
            lastName,
            birthDate: birthDate instanceof Date ? birthDate.toISOString() : birthDate,
          },
        },
      });

      if (error) {
        console.error("GraphQL error fetching suggestions:", error);
      }

      const suggestions = data?.suggestPlayers || [];
      setSuggestedPlayers2(suggestions);
    } catch (error) {
      console.error("Error fetching suggestions for Player 2:", error);
      setSuggestedPlayers2([]);
    } finally {
      setIsLoadingSuggestions2(false);
    }
  }, [entry, fetchSuggestions2]);

  useEffect(() => {
    if (open && entry) {
      const timer = setTimeout(() => {
        if (entry?.player1Entry) {
          fetchPlayer1Suggestions();
        }
        if (entry?.player2Entry) {
          fetchPlayer2Suggestions();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [open, entry?.player1Entry, entry?.player2Entry]);

  const onClose = () => {
    form.reset();
    setDocumentSelections({});
    setSuggestedPlayers1([]);
    setSuggestedPlayers2([]);
    setValidationErrors({});
    setOpen(false);
    props.onClose?.();
  };

  const handleDocumentSelection1 = () => {
    setShowDocumentSelection1(true);
  };

  const handleDocumentSelection2 = () => {
    setShowDocumentSelection2(true);
  };

  const handleSaveDocumentSelections1 = (selections: DocumentSelection) => {
    setDocumentSelections((prev) => ({ ...prev, player1: selections }));
    form.setFieldValue("migratePlayer1Data.validDocuments", true);
    toast.success("Document selections saved for Player 1", {
      duration: 3000,
    });
  };

  const handleSaveDocumentSelections2 = (selections: DocumentSelection) => {
    setDocumentSelections((prev) => ({ ...prev, player2: selections }));
    form.setFieldValue("migratePlayer2Data.validDocuments", true);
    toast.success("Document selections saved for Player 2", {
      duration: 3000,
    });
  };

  const getPlayer1ExistingDocuments = (): DocumentInfo[] => {
    if (!player1?.validDocuments) return [];
    return player1.validDocuments.map((doc: any) => ({
      documentType: doc.documentType,
      documentURL: doc.documentURL,
      dateUploaded: doc.dateUploaded,
      player: "Player 1",
      source: "existing",
    }));
  };

  const getPlayer1NewDocuments = (): DocumentInfo[] => {
    if (!entry?.player1Entry?.validDocuments) return [];
    return entry.player1Entry.validDocuments.map((doc) => ({
      documentType: doc.documentType,
      documentURL: doc.documentURL,
      dateUploaded: doc.dateUploaded,
      player: "Player 1",
      source: "new",
    }));
  };

  const getPlayer2ExistingDocuments = (): DocumentInfo[] => {
    if (!player2?.validDocuments) return [];
    return player2.validDocuments.map((doc: any) => ({
      documentType: doc.documentType,
      documentURL: doc.documentURL,
      dateUploaded: doc.dateUploaded,
      player: "Player 2",
      source: "existing",
    }));
  };

  const getPlayer2NewDocuments = (): DocumentInfo[] => {
    if (!entry?.player2Entry?.validDocuments) return [];
    return entry.player2Entry.validDocuments.map((doc) => ({
      documentType: doc.documentType,
      documentURL: doc.documentURL,
      dateUploaded: doc.dateUploaded,
      player: "Player 2",
      source: "new",
    }));
  };

  const hasPlayer1DocumentsToSelect = () => {
    const existingDocs = getPlayer1ExistingDocuments();
    const newDocs = getPlayer1NewDocuments();

    return existingDocs.length > 0 && newDocs.length > 0;
  };

  const hasPlayer2DocumentsToSelect = () => {
    const existingDocs = getPlayer2ExistingDocuments();
    const newDocs = getPlayer2NewDocuments();

    return existingDocs.length > 0 && newDocs.length > 0;
  };

  const handleFormSubmit = async () => {
    setValidationErrors({});

    const needsPlayer1Selection =
      !form.getFieldValue("isPlayer1New") &&
      form.getFieldValue("connectedPlayer1") &&
      hasPlayer1DocumentsToSelect() &&
      !documentSelections.player1;

    const needsPlayer2Selection =
      !form.getFieldValue("isPlayer2New") &&
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
      const player1Config = {
        isNew: form.getFieldValue("isPlayer1New"),
        connected: form.getFieldValue("connectedPlayer1"),
        hasDocuments: hasPlayer1DocumentsToSelect(),
        hasSelections: !!documentSelections.player1,
      };

      const player2Config = {
        isNew: form.getFieldValue("isPlayer2New"),
        connected: form.getFieldValue("connectedPlayer2"),
        hasDocuments: hasPlayer2DocumentsToSelect(),
        hasSelections: !!documentSelections.player2,
      };

      if (!player1Config.isNew && !player1Config.connected) {
        toast.error("Please assign the Player 1 or mark as New Player", {
          duration: 3000,
        });
        setValidationErrors((prev) => ({
          ...prev,
          player1: "Player 1 is not assigned",
        }));
        return;
      }

      if (
        !player1Config.isNew &&
        player1Config.connected &&
        player1Config.hasDocuments &&
        !player1Config.hasSelections
      ) {
        toast.error("Please complete document selection for Player 1", {
          duration: 3000,
        });
        return;
      }

      if (entry?.player2Entry) {
        if (!player2Config.isNew && !player2Config.connected) {
          toast.error("Please assign the Player 2 or mark as New Player", {
            duration: 3000,
          });
          setValidationErrors((prev) => ({
            ...prev,
            player2: "Player 2 is not assigned",
          }));
          return;
        }

        if (
          !player2Config.isNew &&
          player2Config.connected &&
          player2Config.hasDocuments &&
          !player2Config.hasSelections
        ) {
          toast.error("Please complete document selection for Player 2", {
            duration: 3000,
          });
          return;
        }
      }

      form.handleSubmit();
    }
  };

  const renderTabContent = (tab: "player1" | "player2") => {
    const suggestions =
      tab === "player1" ? suggestedPlayers1 : suggestedPlayers2;
    const isLoadingSuggestions =
      tab === "player1" ? isLoadingSuggestions1 : isLoadingSuggestions2;
    const hasSuggestions = suggestions.length > 0;
    const isNewPlayer = form.getFieldValue(
      `is${tab === "player1" ? "Player1" : "Player2"}New`,
    );

    const shouldShowTwoColumnLayout = hasSuggestions && !isNewPlayer;

    if (shouldShowTwoColumnLayout) {
      return (
        <div className="flex gap-6">
          <div className="w-3/4!">
            <FieldSet className="flex flex-col gap-2.5 h-[67vh] overflow-y-auto pr-2">
              <form.Field
                name={`is${tab === "player1" ? "Player1" : "Player2"}New`}
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  const hasError =
                    validationErrors[tab === "player1" ? "player1" : "player2"];

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
                  );
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
                          e.preventDefault();
                          e.stopPropagation();
                          tab === "player1"
                            ? handleDocumentSelection1()
                            : handleDocumentSelection2();
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
                          field.state.meta.isTouched && !field.state.meta.isValid;
                        const hasError =
                          validationErrors[
                          tab === "player1" ? "player1" : "player2"
                          ];

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
                              <PopoverContent
                                className="w-full p-0 max-h-80"
                                onWheel={(e) => e.stopPropagation()}
                              >
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
                                          value: string;
                                          label: string;
                                          hasEarlyBird: boolean;
                                        }) => (
                                          <CommandItem
                                            key={o.value}
                                            value={o.value}
                                            onSelect={(v) => {
                                              field.handleChange(v.toString());
                                              tab === "player1"
                                                ? setOpenPlayers1(false)
                                                : setOpenPlayers2(false);
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
                        );
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
                                  address: checked === true,
                                  email: checked === true,
                                  validDocuments: checked === true,
                                },
                              );
                              if (checked) {
                                setTimeout(() => {
                                  tab === "player1"
                                    ? handleDocumentSelection1()
                                    : handleDocumentSelection2();
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
                              !field.state.meta.isValid;
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
                            );
                          }}
                        />
                      </div>
                      <div>
                        <form.Field
                          name={`migrate${tab === "player1" ? "Player1" : "Player2"}Data.middleName`}
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid;
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
                            );
                          }}
                        />
                      </div>
                      <div>
                        <form.Field
                          name={`migrate${tab === "player1" ? "Player1" : "Player2"}Data.lastName`}
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid;
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
                            );
                          }}
                        />
                      </div>
                      <div>
                        <form.Field
                          name={`migrate${tab === "player1" ? "Player1" : "Player2"}Data.suffix`}
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid;
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
                            );
                          }}
                        />
                      </div>
                      <div>
                        <form.Field
                          name={`migrate${tab === "player1" ? "Player1" : "Player2"}Data.email`}
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid;
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
                            );
                          }}
                        />
                      </div>
                      <div>
                        <form.Field
                          name={`migrate${tab === "player1" ? "Player1" : "Player2"}Data.phoneNumber`}
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid;
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
                            );
                          }}
                        />
                      </div>
                      <div>
                        <form.Field
                          name={`migrate${tab === "player1" ? "Player1" : "Player2"}Data.birthDate`}
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid;
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
                            );
                          }}
                        />
                      </div>
                      <div>
                        <form.Field
                          name={`migrate${tab === "player1" ? "Player1" : "Player2"}Data.address`}
                          children={(field) => (
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
                                    disabled={
                                      isLoading ||
                                      !form.getFieldValue(
                                        `connected${tab === "player1" ? "Player1" : "Player2"}`,
                                      )
                                    }
                                  />
                                </div>
                                <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                                  <span className="px-2 border w-full flex items-center justify-center py-1 text-center font-medium">
                                    Address
                                  </span>
                                  {form.getFieldValue(
                                    `connected${tab === "player1" ? "Player1" : "Player2"}`,
                                  ) ? (
                                    <>
                                      <span
                                        className={cn(
                                          !field.state.value && "text-success bg-success/5",
                                          "col-span-2 px-2 border w-full flex items-center justify-start py-1 text-clip",
                                          !(tab === "player1"
                                            ? player1?.address?.fullAddress
                                            : player2?.address?.fullAddress) && "italic"
                                        )}
                                        title={tab === "player1"
                                          ? player1?.address?.fullAddress || "N/A"
                                          : player2?.address?.fullAddress || "N/A"}
                                      >
                                        {tab === "player1"
                                          ? player1?.address?.fullAddress?.substring(0, 50) || "N/A"
                                          : player2?.address?.fullAddress?.substring(0, 50) || "N/A"}
                                      </span>
                                      <span
                                        className={cn(
                                          field.state.value && "text-warning bg-warning/5",
                                          "col-span-2 px-2 border w-full flex items-center justify-start py-1 text-clip",
                                          !(tab === "player1"
                                            ? entry?.player1Entry?.address?.fullAddress
                                            : entry?.player2Entry?.address?.fullAddress) && "italic"
                                        )}
                                        title={tab === "player1"
                                          ? entry?.player1Entry?.address?.fullAddress || "N/A"
                                          : entry?.player2Entry?.address?.fullAddress || "N/A"}
                                      >
                                        {tab === "player1"
                                          ? entry?.player1Entry?.address?.fullAddress?.substring(0, 50) || "N/A"
                                          : entry?.player2Entry?.address?.fullAddress?.substring(0, 50) || "N/A"}
                                      </span>
                                    </>
                                  ) : (
                                    <span
                                      className={cn(
                                        field.state.value && "text-warning",
                                        "col-span-4 px-2 border w-full flex items-center justify-start py-1 truncate",
                                        !(tab === "player1"
                                          ? entry?.player1Entry?.address?.fullAddress
                                          : entry?.player2Entry?.address?.fullAddress) && "italic"
                                      )}
                                    >
                                      {tab === "player1"
                                        ? entry?.player1Entry?.address?.fullAddress?.substring(0, 50) || "N/A"
                                        : entry?.player2Entry?.address?.fullAddress?.substring(0, 50) || "N/A"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </Field>
                          )}
                        />
                      </div>
                    </div>
                  </>
                )}
            </FieldSet>
          </div>

          <div className="w-1/3 border-l pl-6">
            <div className="mb-3">
              <h3 className="text-lg font-semibold mb-2">Suggested Players</h3>
              <p className="text-xs text-muted-foreground">
                Based on name and birthday match from your database
              </p>
            </div>

            <div className="space-y-2 max-h-[52vh] overflow-y-auto pr-2">
              {suggestions.map((player) => (
                <div
                  key={player._id}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors bg-white shadow-sm"
                  onClick={() => {
                    form.setFieldValue(
                      `connected${tab === "player1" ? "Player1" : "Player2"}`,
                      player._id,
                    );
                    tab === "player1"
                      ? fetchPlayer1({ variables: { _id: player._id } })
                      : fetchPlayer2({ variables: { _id: player._id } });
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
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
                      {player.address?.fullAddress && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Address:</span>
                          <span className="truncate">{player.address.fullAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
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
            </div> */}
          </div>
        </div>
      );
    }

    return (
      <FieldSet className="flex flex-col gap-2.5 h-[67vh] overflow-y-auto">
        <form.Field
          name={`is${tab === "player1" ? "Player1" : "Player2"}New`}
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            const hasError =
              validationErrors[tab === "player1" ? "player1" : "player2"];

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
            );
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
                    e.preventDefault();
                    e.stopPropagation();
                    tab === "player1"
                      ? handleDocumentSelection1()
                      : handleDocumentSelection2();
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
                      );
                      tab === "player1"
                        ? fetchPlayer1({ variables: { _id: player._id } })
                        : fetchPlayer2({ variables: { _id: player._id } });
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
                            {player.address?.fullAddress && (
                              <div>Address: {player.address.fullAddress}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          form.setFieldValue(
                            `connected${tab === "player1" ? "Player1" : "Player2"}`,
                            player._id,
                          );
                          tab === "player1"
                            ? fetchPlayer1({ variables: { _id: player._id } })
                            : fetchPlayer2({ variables: { _id: player._id } });
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
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  const hasError =
                    validationErrors[tab === "player1" ? "player1" : "player2"];

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
                                    value: string;
                                    label: string;
                                    hasEarlyBird: boolean;
                                  }) => (
                                    <CommandItem
                                      key={o.value}
                                      value={o.value}
                                      onSelect={(v) => {
                                        field.handleChange(v.toString());
                                        tab === "player1"
                                          ? setOpenPlayers1(false)
                                          : setOpenPlayers2(false);
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
                  );
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
                            address: checked === true,
                            validDocuments: checked === true,
                          },
                        );
                        if (checked) {
                          setTimeout(() => {
                            tab === "player1"
                              ? handleDocumentSelection1()
                              : handleDocumentSelection2();
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
                        field.state.meta.isTouched && !field.state.meta.isValid;
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
                      );
                    }}
                  />
                </div>
                <div>
                  <form.Field
                    name={`migrate${tab === "player1" ? "Player1" : "Player2"}Data.middleName`}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
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
                      );
                    }}
                  />
                </div>
                <div>
                  <form.Field
                    name={`migrate${tab === "player1" ? "Player1" : "Player2"}Data.lastName`}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
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
                      );
                    }}
                  />
                </div>
                <div>
                  <form.Field
                    name={`migrate${tab === "player1" ? "Player1" : "Player2"}Data.suffix`}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
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
                      );
                    }}
                  />
                </div>
                <div>
                  <form.Field
                    name={`migrate${tab === "player1" ? "Player1" : "Player2"}Data.email`}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
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
                      );
                    }}
                  />
                </div>
                <div>
                  <form.Field
                    name={`migrate${tab === "player1" ? "Player1" : "Player2"}Data.phoneNumber`}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
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
                      );
                    }}
                  />
                </div>
                <div>
                  <form.Field
                    name={`migrate${tab === "player1" ? "Player1" : "Player2"}Data.birthDate`}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
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
                      );
                    }}
                  />

                </div>
                <div>
                  <form.Field
                    name={`migrate${tab === "player1" ? "Player1" : "Player2"}Data.address`}
                    children={(field) => (
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
                              disabled={
                                isLoading ||
                                !form.getFieldValue(
                                  `connected${tab === "player1" ? "Player1" : "Player2"}`,
                                )
                              }
                            />
                          </div>
                          <div className="text-xs grid grid-cols-5 col-span-2 w-full min-h-8">
                            <span className="px-2 border w-full flex items-center justify-center py-1 text-center font-medium">
                              Address
                            </span>
                            {form.getFieldValue(
                              `connected${tab === "player1" ? "Player1" : "Player2"}`,
                            ) ? (
                              <>
                                <span
                                  className={cn(
                                    !field.state.value && "text-success bg-success/5",
                                    "col-span-2 px-2 border w-full flex items-center justify-start py-1 text-clip",
                                    !(tab === "player1"
                                      ? player1?.address?.fullAddress
                                      : player2?.address?.fullAddress) && "italic"
                                  )}
                                  title={tab === "player1"
                                    ? player1?.address?.fullAddress || "N/A"
                                    : player2?.address?.fullAddress || "N/A"}
                                >
                                  {tab === "player1"
                                    ? player1?.address?.fullAddress?.substring(0, 50) || "N/A"
                                    : player2?.address?.fullAddress?.substring(0, 50) || "N/A"}
                                </span>
                                <span
                                  className={cn(
                                    field.state.value && "text-warning bg-warning/5",
                                    "col-span-2 px-2 border w-full flex items-center justify-start py-1 text-clip",
                                    !(tab === "player1"
                                      ? entry?.player1Entry?.address?.fullAddress
                                      : entry?.player2Entry?.address?.fullAddress) && "italic"
                                  )}
                                  title={tab === "player1"
                                    ? entry?.player1Entry?.address?.fullAddress || "N/A"
                                    : entry?.player2Entry?.address?.fullAddress || "N/A"}
                                >
                                  {tab === "player1"
                                    ? entry?.player1Entry?.address?.fullAddress?.substring(0, 50) || "N/A"
                                    : entry?.player2Entry?.address?.fullAddress?.substring(0, 50) || "N/A"}
                                </span>
                              </>
                            ) : (
                              <span
                                className={cn(
                                  field.state.value && "text-warning",
                                  "col-span-4 px-2 border w-full flex items-center justify-start py-1 truncate",
                                  !(tab === "player1"
                                    ? entry?.player1Entry?.address?.fullAddress
                                    : entry?.player2Entry?.address?.fullAddress) && "italic"
                                )}
                              >
                                {tab === "player1"
                                  ? entry?.player1Entry?.address?.fullAddress?.substring(0, 50) || "N/A"
                                  : entry?.player2Entry?.address?.fullAddress?.substring(0, 50) || "N/A"}
                              </span>
                            )}
                          </div>
                        </div>
                      </Field>
                    )}
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
              <DialogDescription className="text-xs">
                Assign players to this entry for streamlined data management.
              </DialogDescription>
            </DialogHeader>
            <form
              className="-mt-2 mb-2"
              id="assign-players-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleFormSubmit();
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
  );
};

export default AssignDialog;
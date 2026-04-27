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
import { gql } from "@apollo/client"
import { useQuery } from "@apollo/client/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { IPlayer } from "@/types/player.interface"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Calendar, CheckCircle, AlertCircle, Video, FileCheck, FileText, File, Download, Maximize2, MapPin, Trophy } from "lucide-react"

const PLAYER = gql`
  query Player($_id: ID!) {
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
      achievements
      levels {
        level
        dateLevelled
      }
      validDocuments {
        documentURL
        documentType
        dateUploaded
      }
      videos {
        _id
        title
        dateUploaded
        youtubeId
      }
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
      }
      isActive
    }
  }
`

const getFileType = (url: string): string => {
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
}

const getGoogleDrivePreviewUrl = (url: string): string => {
  const urlObj = new URL(url);
  const fileId = urlObj.searchParams.get('id');

  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  return url;
}

const getGoogleDriveDownloadUrl = (url: string): string => {
  const urlObj = new URL(url);
  const fileId = urlObj.searchParams.get('id');

  if (fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  return url;
}

type Props = {
  _id?: string
  row?: boolean
  openFromParent?: boolean
  setOpenFromParent?: (open: boolean) => void
  externalUse?: boolean
  title?: string
  titleClassName?: string
  rowSettings?: {
    clearId: () => void
    open: boolean
    onOpenChange: (open: boolean) => void
  }
}

const ViewDialog = (props: Props) => {
  const [open, setOpen] = useState(false)
  const isOpen = props.row ? props.rowSettings?.open || false : open
  const setIsOpen = (value: boolean) => {
    if (props.row) {
      props.rowSettings?.onOpenChange(value)
    } else {
      setOpen(value)
    }
  }

  const { data, loading }: any = useQuery(PLAYER, {
    variables: { _id: props._id },
    skip: !isOpen || !Boolean(props._id),
    fetchPolicy: "network-only",
  })

  const player = data?.player as IPlayer

  const onClose = () => {
    if (props.row) {
      props.rowSettings?.clearId()
      props.rowSettings?.onOpenChange(false)
    } else {
      setOpen(false)
    }
  }

  return (
    <Dialog modal open={isOpen} onOpenChange={setIsOpen}>
      <form>
        <DialogTrigger asChild>
          {props.row ? null : props.externalUse ? (
            <span
              className={cn(
                "hover:underline hover:cursor-pointer",
                props.titleClassName
              )}
            >
              {props.title || "View"}
            </span>
          ) : (
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              View
            </DropdownMenuItem>
          )}
        </DialogTrigger>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          showCloseButton={false}
          className="max-w-2xl!"
        >
          <DialogHeader>
            <DialogTitle>View Player</DialogTitle>
            <DialogDescription>
              View the details of this player below.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" className="">
            <TabsList className="w-full grid grid-cols-5 -mt-2 mb-1">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="levels">Levels</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <div className="h-[60vh] overflow-y-auto">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="h-4 w-1 bg-blue-600" />
                  <Label className="text-xs text-muted-foreground">
                    Personal Information
                  </Label>
                </div>

                <div className="border border-b-0 rounded-t-lg p-4 hover:bg-muted/80 transition-colors">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Full Name</Label>
                    {loading ? (
                      <Skeleton className="w-full my-1 h-3" />
                    ) : (
                      <span className="block text-[13px] tracking-wide font-medium uppercase">
                        {player?.firstName} {player?.middleName}{" "}
                        {player?.lastName} {player?.suffix}
                      </span>
                    )}
                  </div>
                </div>

                <div className="border p-4 hover:bg-muted/80 transition-colors">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Gender</Label>
                      {loading ? (
                        <Skeleton className="w-full my-1 h-3" />
                      ) : (
                        <span className="block text-[13px] font-medium tracking-wide capitalize">
                          {player?.gender?.toLocaleLowerCase()}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Birth Date</Label>
                      {loading ? (
                        <Skeleton className="w-full my-1 h-3" />
                      ) : (
                        <span className="block text-[13px] tracking-wide font-medium">
                          {player?.birthDate
                            ? format(new Date(player?.birthDate), "PP")
                            : "N/A"}{" "}
                          {player?.birthDate && (
                            <span className="text-muted-foreground lowercase">
                              (
                              {Math.floor(
                                (Date.now() - new Date(player?.birthDate).getTime()) /
                                (1000 * 60 * 60 * 24 * 365.25)
                              )}{" "}
                              y.o.)
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border border-t-0 rounded-b-lg p-4 mb-4 hover:bg-muted/80 transition-colors">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Email Address</Label>
                      {loading ? (
                        <Skeleton className="w-full my-1 h-3" />
                      ) : (
                        <span className="block text-[13px] font-medium tracking-wide">
                          {player?.email || "N/A"}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Phone Number</Label>
                      {loading ? (
                        <Skeleton className="my-1 w-20 h-4.25" />
                      ) : (
                        <span className="block text-[13px] tracking-wide font-medium">
                          {player?.phoneNumber || "N/A"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mb-2">
                  <span className="h-4 w-1 bg-blue-600" />
                  <Label className="text-xs text-muted-foreground">
                    Account Status
                  </Label>
                </div>

                <div className="bg-white border rounded-lg p-4 mb-4">
                  {loading ? (
                    <Skeleton className="my-1 w-20 h-4.25" />
                  ) : (
                    <div className="flex items-center gap-2">
                      {player?.isActive ? (
                        <>
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="text-xs font-medium text-green-600">
                            Active User
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-destructive" />
                          <span className="text-xs font-medium text-destructive">
                            Inactive User
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mb-2">
                  <span className="h-4 w-1 bg-blue-600" />
                  <Label className="text-xs text-muted-foreground flex items-center gap-2">
                    <Trophy className="h-3 w-3" />
                    Achievements
                  </Label>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="w-full h-10" />
                      <Skeleton className="w-full h-10" />
                    </div>
                  ) : (
                    <>
                      {player?.achievements && player.achievements.length > 0 ? (
                        <div className="space-y-2">
                          {player.achievements.map((achievement: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-3 rounded-lg bg-green-50/50 border border-green-200 hover:bg-green-100 transition-colors"
                            >
                              <Trophy className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-[13px] font-medium tracking-wide flex-1">
                                {achievement}
                              </span>
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                #{index + 1}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Trophy className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No achievements recorded.</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            This player hasn't added any achievements yet.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Address Tab */}
            <TabsContent value="address">
              <div className="h-[60vh] overflow-y-auto">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="h-4 w-1 bg-blue-600" />
                  <Label className="text-xs text-muted-foreground">
                    Address Information
                  </Label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="border rounded-lg p-4 hover:bg-muted/80 transition-colors">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Region</Label>
                      {loading ? (
                        <Skeleton className="w-full my-1 h-3" />
                      ) : (
                        <span className="block text-[13px] font-medium tracking-wide">
                          {player?.address?.region?.name || "N/A"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 hover:bg-muted/80 transition-colors">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Province</Label>
                      {loading ? (
                        <Skeleton className="w-full my-1 h-3" />
                      ) : (
                        <span className="block text-[13px] font-medium tracking-wide">
                          {player?.address?.province?.name || "N/A"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 hover:bg-muted/80 transition-colors">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">City/Municipality</Label>
                      {loading ? (
                        <Skeleton className="w-full my-1 h-3" />
                      ) : (
                        <div>
                          <span className="block text-[13px] font-medium tracking-wide">
                            {player?.address?.city?.name || "N/A"}
                          </span>
                          {player?.address?.city?.classification && (
                            <span className="text-[11px] text-muted-foreground capitalize">
                              ({player?.address?.city?.classification})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 hover:bg-muted/80 transition-colors">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Barangay</Label>
                      {loading ? (
                        <Skeleton className="w-full my-1 h-3" />
                      ) : (
                        <span className="block text-[13px] font-medium tracking-wide">
                          {player?.address?.barangay?.name || "N/A"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 hover:bg-muted/80 transition-colors">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Street Address</Label>
                      {loading ? (
                        <Skeleton className="w-full my-1 h-3" />
                      ) : (
                        <span className="block text-[13px] font-medium tracking-wide">
                          {player?.address?.street || "N/A"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 hover:bg-muted/80 transition-colors">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">ZIP Code</Label>
                      {loading ? (
                        <Skeleton className="w-full my-1 h-3" />
                      ) : (
                        <span className="block text-[13px] font-medium tracking-wide">
                          {player?.address?.zipCode || "N/A"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 mt-3 hover:bg-muted/80 transition-colors bg-blue-50/30">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Full Address
                    </Label>
                    {loading ? (
                      <Skeleton className="w-full my-1 h-3" />
                    ) : (
                      <div className="space-y-1">
                        <span className="block text-[13px] font-medium tracking-wide">
                          {player?.address?.fullAddress || "No address provided"}
                        </span>
                        {!player?.address?.fullAddress && (
                          <p className="text-xs text-muted-foreground italic">
                            No address information has been added for this player.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="levels">
              <div className="h-[60vh] overflow-y-auto">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="h-4 w-1 bg-blue-600" />
                  <Label className="text-xs text-muted-foreground">
                    Level History
                  </Label>
                </div>

                {player?.levels && player.levels?.length > 0 ? (
                  <div className="space-y-3">
                    {player.levels.map((level, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:bg-muted/80 transition-colors">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Level</Label>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[13px] font-medium">
                                {level.level}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Date Levelled</Label>
                            <span className="block text-[13px] tracking-wide font-medium">
                              {format(new Date(level.dateLevelled), "PP")}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center h-full flex flex-col items-center justify-center">
                    <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No level history available.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="requirements">
              <div className="h-[60vh] overflow-y-auto">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="h-4 w-1 bg-blue-600" />
                  <Label className="text-xs text-muted-foreground">
                    Submitted Documents
                  </Label>
                </div>

                {player?.validDocuments && player.validDocuments.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {player.validDocuments.map((doc: any, index: number) => {
                      const fileType = getFileType(doc.documentURL);
                      const isGoogleDrive = fileType === 'googleDrive';
                      const previewUrl = isGoogleDrive ? getGoogleDrivePreviewUrl(doc.documentURL) : doc.documentURL;
                      const downloadUrl = isGoogleDrive ? getGoogleDriveDownloadUrl(doc.documentURL) : doc.documentURL;

                      return (
                        <div key={index} className="border rounded-lg hover:bg-muted/50 transition">
                          <div className="flex flex-col p-4">
                            <div className="flex justify-between items-center mb-3">
                              <div>
                                <h3 className="text-sm font-medium">
                                  {doc.documentType.replaceAll("_", " ")}
                                </h3>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  asChild
                                  className="flex items-center gap-2 h-8"
                                >
                                  <a
                                    href={downloadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    Download
                                  </a>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  asChild
                                  className="h-8 w-8 p-0"
                                >
                                  <a
                                    href={previewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Open in new tab"
                                  >
                                    <Maximize2 className="h-3.5 w-3.5" />
                                  </a>
                                </Button>
                              </div>
                            </div>

                            <div className="relative w-full h-[500px] border rounded-lg overflow-hidden bg-gray-50">
                              {fileType === 'image' ? (
                                <div className="relative w-full h-full">
                                  <Image
                                    src={doc.documentURL}
                                    alt={doc.documentType}
                                    fill
                                    className="object-contain"
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

                            <div className="mt-2 text-center">
                              <p className="text-xs text-muted-foreground">
                                {fileType === 'image' ? 'Image preview' :
                                  isGoogleDrive ? 'Google Drive preview' :
                                    fileType === 'pdf' ? 'PDF preview via Google Docs Viewer' :
                                      'Document preview'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center h-full flex flex-col items-center justify-center">
                    <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">No documents submitted.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="videos">
              <div className="h-[60vh] overflow-y-auto">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="h-4 w-1 bg-blue-600" />
                  <Label className="text-xs text-muted-foreground">
                    Video Submissions
                  </Label>
                </div>

                {player?.videos && player.videos?.length > 0 ? (
                  <div className="space-y-3">
                    {player.videos.map((video, index) => (
                      <div key={video._id} className="border rounded-lg p-4 hover:bg-muted/80 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium">
                                {index + 1}. {video.title}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            asChild
                          >
                            <Link
                              href={`/videos/${video._id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center h-full flex flex-col items-center justify-center">
                    <Video className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No videos submitted.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <DialogClose asChild>
              <Button className="w-20" onClick={onClose} variant="outline">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}

export default ViewDialog
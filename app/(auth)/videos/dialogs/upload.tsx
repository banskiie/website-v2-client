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
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  CheckIcon,
  ChevronsUpDownIcon,
  UploadCloud,
  VideoIcon,
} from "lucide-react"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { gql } from "@apollo/client"
import { useForm } from "@tanstack/react-form"
import { UploadVideoSchema } from "@/validators/video.validator"
import { useMutation, useQuery } from "@apollo/client/react"
import {
  FieldSet,
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import { cn } from "@/lib/utils"
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

const UPLOAD_VIDEO = gql`
  mutation UploadVideo($input: UploadVideoInput!) {
    uploadVideo(input: $input) {
      ok
      message
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

const UploadDialog = () => {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  // Options
  const { data } = useQuery(OPTIONS)
  const players = (data as any)?.playerOptions || []
  const [openPlayers, setOpenPlayers] = useState(false)
  // File state
  const [file, setFile] = useState<any>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "video/mp4": [],
      "video/quicktime": [],
    },
    multiple: false,
    maxSize: 100 * 1024 * 1024, // 100MB
    onDrop: (acceptedFiles: any, fileRejections: any) => {
      if (fileRejections.length > 0) {
        toast.error("File too large or unsupported type. (Max size: 100MB)")
        return
      }
      if (acceptedFiles.length > 0) {
        const selectedFile = Object.assign(acceptedFiles[0], {
          preview: URL.createObjectURL(acceptedFiles[0]),
        })
        setFile(selectedFile)
        setFileError(null)
      }
    },
  })
  // Handle Mutation
  const [upload] = useMutation(UPLOAD_VIDEO)
  // Form
  const form = useForm({
    defaultValues: {
      title: "",
      players: [] as string[],
    },
    validators: {
      onSubmit: ({ formApi, value }) => {
        try {
          UploadVideoSchema.parse(value)
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
    onSubmit: ({ value, formApi }) =>
      startTransition(async () => {
        try {
          if (!file) {
            setFileError("Please select a video file to upload.")
            return
          } else {
            setFileError(null)
          }
          const formData = new FormData()
          formData.append("file", file, value.title)

          const response = await fetch("/api/youtube/upload", {
            method: "POST",
            body: formData,
          }).then(async (res) => {
            const data = await res.json()
            if (!res.ok) throw new Error("Upload failed")
            const uploadResponse = await upload({
              variables: {
                input: {
                  title: value.title,
                  players: value.players,
                  youtubeUrl: data.url,
                  youtubeId: data.videoId,
                },
              },
            })
            return uploadResponse
          })
          if (response) {
            toast.success("Video uploaded successfully!")
            onClose()
          }
        } catch (error: any) {
          console.error(error.errors)
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

  const onClose = () => {
    setOpen(false)
    resetForm()
  }

  const resetForm = () => {
    form.reset()
    setFile(null)
  }

  const getSize = (size: number) => {
    if (size < 1024) return size + " bytes"
    else if (size >= 1024 && size < 1048576)
      return (size / 1024).toFixed(1) + " KB"
    else if (size >= 1048576) return (size / 1048576).toFixed(1) + " MB"
  }

  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline-warning">
            <UploadCloud />
            Upload Video
          </Button>
        </DialogTrigger>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle>Upload Video</DialogTitle>
            <DialogDescription>
              Select a video file to upload to the platform.
            </DialogDescription>
            <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
              <form
                id="upload-video-form"
                onSubmit={(e) => {
                  e.preventDefault()
                  form.handleSubmit()
                }}
              >
                <FieldSet>
                  <form.Field
                    name="title"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel className="-mb-2" htmlFor={field.name}>
                            Title
                          </FieldLabel>
                          <FieldContent>
                            <InputGroup>
                              <InputGroupInput
                                disabled={isPending}
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                                aria-invalid={isInvalid}
                                placeholder="Enter video title"
                                className={cn(
                                  isInvalid
                                    ? "placeholder:text-destructive border-destructive focus:border-destructive focus:ring-destructive"
                                    : ""
                                )}
                              />
                            </InputGroup>
                            {isInvalid && (
                              <FieldError
                                className="text-xs"
                                errors={field.state.meta.errors}
                              />
                            )}
                          </FieldContent>
                        </Field>
                      )
                    }}
                  />
                  <form.Field
                    name="players"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel className="-mb-2" htmlFor={field.name}>
                            Players
                          </FieldLabel>
                          <FieldContent>
                            <Popover
                              open={openPlayers}
                              onOpenChange={setOpenPlayers}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  id={field.name}
                                  name={field.name}
                                  disabled={isPending}
                                  aria-expanded={openPlayers}
                                  onBlur={field.handleBlur}
                                  variant="outline"
                                  role="combobox"
                                  aria-invalid={isInvalid}
                                  className={cn(
                                    "w-full justify-between font-normal",
                                    field.state.value.length > 0
                                      ? ""
                                      : "text-muted-foreground"
                                  )}
                                  type="button"
                                >
                                  {field.state.value.length > 0
                                    ? players
                                        .filter((p: any) =>
                                          field.state.value.includes(p.value)
                                        )
                                        .map((p: any) => p.label)
                                        .join(", ")
                                    : "Select Player/s"}
                                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command
                                  filter={(value, search) =>
                                    players
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
                                  <CommandInput placeholder="Select Player/s" />
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
                                            onSelect={(v: string) => {
                                              field.handleChange(
                                                (prev: string[]) => {
                                                  if (prev.includes(v)) {
                                                    return prev.filter(
                                                      (val) => val !== v
                                                    )
                                                  } else {
                                                    return [...prev, v]
                                                  }
                                                }
                                              )
                                              setOpenPlayers(false)
                                            }}
                                            className="capitalize"
                                          >
                                            <CheckIcon
                                              className={cn(
                                                "h-4 w-4",
                                                field.state.value.includes(
                                                  o.value
                                                )
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
                                className="text-xs"
                                errors={field.state.meta.errors}
                              />
                            )}
                          </FieldContent>
                        </Field>
                      )
                    }}
                  />
                </FieldSet>
              </form>
              <div
                {...getRootProps({
                  className: cn(
                    "dropzone",
                    isPending
                      ? "opacity-50 cursor-wait pointer-events-none"
                      : ""
                  ),
                })}
                className={cn(
                  "flex flex-col  items-center justify-center rounded-md border-2 h-48 border-dashed border-gray-300 p-6 cursor-pointer hover:border-gray-500",
                  fileError
                    ? "border-destructive/30 hover:border-destructive/60 bg-destructive/10"
                    : ""
                )}
              >
                <Input {...getInputProps()} />
                {file ? (
                  <>
                    <VideoIcon className="size-12 text-muted-foreground" />
                    <span className="max-w-64 truncate">{file?.name}</span>
                    <span className="text-xs">{getSize(file?.size)}</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="size-12 text-muted-foreground" />
                    <span className="font-medium">
                      Click to select a video file
                    </span>
                    <span className="text-xs text-muted-foreground">
                      (MP4 or MOV, max size: 100MB)
                    </span>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button className="w-20" onClick={onClose} variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              loading={isPending}
              className="w-20"
              form="upload-video-form"
            >
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}

export default UploadDialog

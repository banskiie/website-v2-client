"use client"
import { useState, useTransition } from "react"
import LiteYouTubeEmbed from "react-lite-youtube-embed"
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Paperclip, Video } from "lucide-react"

const Page = () => {
  const [isPending, startTransition] = useTransition()
  const [files, setFiles] = useState<any>([])
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "video/mp4": [],
      "video/quicktime": [],
    },
    multiple: false,
    maxSize: 30 * 1024 * 1024, // 30MB
    onDrop: (acceptedFiles: any, fileRejections: any) => {
      if (fileRejections.length > 0) {
        toast.error("File too large or unsupported type. (Max size: 30MB)")
        return
      }
      setFiles(
        acceptedFiles.map((file: any) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      )
    },
  })

  const send = () =>
    startTransition(async () => {
      try {
        if (files.length > 0) {
          const formData = new FormData()
          const file = files[0]

          formData.append("file", file, "test")

          const response = await fetch("/api/youtube/upload", {
            method: "POST",
            body: formData,
          })
          const data = await response.json()
          if (response.ok) {
            console.log(data)
            toast.success("Video uploaded successfully!")
            console.log("Uploaded video URL:", data.url)
          } else {
            toast.error(`Upload failed: ${data.error}`)
          }
        }
      } catch (error) {
        console.error("Error sending message:", error)
      } finally {
        setFiles([])
      }
    })

  return (
    <div className="flex flex-col">
      <div {...getRootProps({ className: "dropzone" })}>
        <Input {...getInputProps()} />
        <Button variant="ghost" size="icon" title="Attach image/document">
          <Paperclip />
        </Button>
      </div>
      {files.length > 0 ? (
        <div>
          {files.map((file: any, idx: number) => (
            <div
              key={idx}
              className="w-24 h-24 bg-gray-200 flex flex-col items-center justify-center cursor-pointer rounded"
            >
              <Video />
              <span className="truncate w-16 text-xs">{file.name}</span>
            </div>
          ))}
        </div>
      ) : null}
      <Button onClick={send} loading={isPending}>
        Upload
      </Button>
      <LiteYouTubeEmbed
        id="PQwBJWpckwE"
        title="Video Title"
        enableJsApi
        params="rel=0"
        lazyLoad
        aspectWidth={16}
        aspectHeight={9}
        style={{
          height: 360,
          width: 640,
        }}
      />
    </div>
  )
}

export default Page

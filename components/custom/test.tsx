"use client"

import { useState } from "react"
import Tesseract from "tesseract.js"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, Upload, ImageIcon } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function GCashScanner() {
  const [loading, setLoading] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [total, setTotal] = useState<string | null>(null)
  const [reference, setReference] = useState<string | null>(null)

  const preprocessImage = (imageData: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.src = imageData
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")!
        canvas.width = img.width * 2
        canvas.height = img.height * 2

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        for (let i = 0; i < imgData.data.length; i += 4) {
          const avg = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3
          imgData.data[i] = avg
          imgData.data[i + 1] = avg
          imgData.data[i + 2] = avg
        }
        ctx.putImageData(imgData, 0, 0)

        resolve(canvas.toDataURL("image/png"))
      }
    })
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async () => {
      const imageData = reader.result as string
      setImageSrc(imageData)
      setLoading(true)
      setTotal(null)
      setReference(null)

      try {
        const preprocessedData = await preprocessImage(imageData)
        // setImageSrc(preprocessedData)
        setImageSrc(imageData)

        const result = await Tesseract.recognize(preprocessedData, "eng", {
          logger: (m) => console.log(m),
        })

        const text = result.data.text
        console.log("Extracted text:", text)

        const totalMatch =
          text.match(/total[:\s]*₱?\s?([\d,]+\.\d{2})/i) ||
          text.match(/amount[:\s]*₱?\s?([\d,]+\.\d{2})/i)

        setTotal(totalMatch ? totalMatch[1] : "Not found")

        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

        let refNumber = "Not found"

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].toLowerCase()

          if (line.includes("reference no.") || line.includes("reference no.") || line.includes("ref no.")) {
            const inlineMatch = lines[i].match(/(?:ref(?:erence)?(?: no\.?)?[:\s]*)\s*([A-Z0-9-]{4,})/i)
            if (inlineMatch) {
              refNumber = inlineMatch[1]
              break
            }

            for (let j = i + 1; j < lines.length; j++) {
              const candidate = lines[j].trim()
              if (!candidate) continue
              if (/^[A-Z0-9-]{4,}$/i.test(candidate)) {
                refNumber = candidate
                break
              }
            }

            break
          }
        }
        setReference(refNumber)
      } catch (err) {
        console.error("OCR failed", err)
      } finally {
        setLoading(false)
      }
    }

    reader.readAsDataURL(file)
  }

  return (
    <ScrollArea className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <Card className="w-full max-w-lg shadow-md rounded-2xl border border-gray-200 bg-white">
        <CardHeader className="flex flex-col items-center text-center">
          <CardTitle className="text-xl font-semibold text-gray-800">
            GCash Receipt Scanner
          </CardTitle>
          <Separator className="my-3 w-16" />
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4 mt-4 w-full">
          <label
            htmlFor="file-upload"
            className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-green-400 transition"
          >
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="Uploaded receipt"
                className="rounded-lg object-contain w-full max-w-[341px] h-auto"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <ImageIcon className="w-10 h-10 mb-2" />
                <span className="text-sm">Click or drag to upload receipt</span>
              </div>
            )}
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {loading && (
            <Button disabled className="w-full md:w-auto gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Scanning...
            </Button>
          )}

          {imageSrc && !loading && (
            <Button
              onClick={() => {
                setImageSrc(null)
                setTotal(null)
                setReference(null)
              }}
              className="w-full md:w-auto gap-2 bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              <Upload className="w-4 h-4" /> Upload Another
            </Button>
          )}

          <div className="w-full mt-4 space-y-3 text-left">
            <div className="p-3 bg-gray-100 rounded-xl">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-lg font-bold text-green-700">{total || "—"}</p>
            </div>

            <div className="p-3 bg-gray-100 rounded-xl">
              <p className="text-sm text-gray-500">Reference No.</p>
              <p className="text-lg font-bold text-blue-700">
                {reference || "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </ScrollArea>
  )
}

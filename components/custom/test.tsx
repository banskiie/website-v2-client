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
  const [scannedText, setScannedText] = useState<string>("")
  const [showConfirmationInput, setShowConfirmationInput] = useState(false)
  const [confirmationNumber, setConfirmationNumber] = useState<string>("")
  const [amountLabel, setAmountLabel] = useState("Total")
  const [referenceLabel, setReferenceLabel] = useState("Reference No.")

  // const preprocessImage = (imageData: string): Promise<string> => {
  //   return new Promise((resolve) => {
  //     const img = new Image()
  //     img.src = imageData
  //     img.onload = () => {
  //       const canvas = document.createElement("canvas")
  //       const ctx = canvas.getContext("2d")!
  //       canvas.width = img.width * 2
  //       canvas.height = img.height * 2

  //       ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  //       const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  //       for (let i = 0; i < imgData.data.length; i += 4) {
  //         const avg = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3
  //         imgData.data[i] = avg
  //         imgData.data[i + 1] = avg
  //         imgData.data[i + 2] = avg
  //       }
  //       ctx.putImageData(imgData, 0, 0)

  //       resolve(canvas.toDataURL("image/png"))
  //     }
  //   })
  // }

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

        ctx.fillStyle = "white"
        ctx.fillRect(canvas.width * 0.8, canvas.height * 0.7, 50, 50)

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

  // const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0]
  //   if (!file) return

  //   const reader = new FileReader()
  //   reader.onload = async () => {
  //     const imageData = reader.result as string
  //     setImageSrc(imageData)
  //     setLoading(true)
  //     setTotal(null)
  //     setReference(null)
  //     setConfirmationNumber("")
  //     setScannedText("")

  //     try {
  //       const preprocessedData = await preprocessImage(imageData)
  //       setImageSrc(imageData)

  //       const result = await Tesseract.recognize(preprocessedData, "eng", {
  //         logger: (m) => console.log(m),
  //       })

  //       const text = result.data.text
  //       console.log("🧾 Extracted text:", text)
  //       setScannedText(text)

  //       const confirmationMatch = text.match(/confirmation[\s#:=-]*no\.?\s*([A-Z0-9-]{5,})/i)
  //       if (confirmationMatch) {
  //         setShowConfirmationInput(true)
  //         setConfirmationNumber(confirmationMatch[1])
  //       } else {
  //         setShowConfirmationInput(false)
  //         setConfirmationNumber("")
  //       }

  //       // Dari ang pang scan para ma identify ang total og ang Total Amount Sent and amount
  //       // const currencyPattern = "(?:₱|PHP|F|P|£)"

  //       // const transferMatch = text.match(
  //       //   new RegExp(`transfer\\s*amount[\\s\\S]*?${currencyPattern}\\s?([\\d,]+\\.\\d{2})`, "i")
  //       // )
  //       // const totalMatch =
  //       //   text.match(new RegExp(`total[\\s#:=-]*${currencyPattern}?\\s?([\\d,]+\\.\\d{2})`, "i")) ||
  //       //   text.match(new RegExp(`amount[\\s#:=-]*${currencyPattern}?\\s?([\\d,]+\\.\\d{2})`, "i")) ||
  //       //   text.match(new RegExp(`total\\s*amount\\s*sent[\\s#:=-]*${currencyPattern}?\\s?([\\d,]+\\.\\d{2})`, "i"))

  //       // Old
  //       // setTotal(totalMatch ? totalMatch[1] : "Not found")
  //       // if (transferMatch) {
  //       //   setAmountLabel("Transfer Amount")
  //       //   setTotal(transferMatch[1])
  //       // } else if (totalMatch) {
  //       //   setAmountLabel("Total")
  //       //   setTotal(totalMatch[1])
  //       // } else {
  //       //   setAmountLabel("Total")
  //       //   setTotal("Not found")
  //       // }
  //       // New
  //       // if (transferMatch) {
  //       //   setAmountLabel("Transfer Amount")
  //       //   setTotal(`₱${transferMatch[1]}`)
  //       // } else if (totalMatch) {
  //       //   setAmountLabel("Total")
  //       //   setTotal(`₱${totalMatch[1]}`)
  //       // } else {
  //       //   setAmountLabel("Total")
  //       //   setTotal("Not found")
  //       // }
  //       const currencyPattern = "(?:₱|PHP|F|P|£)"

  //       const paidMatch = text.match(
  //         new RegExp(`paid\\s*${currencyPattern}?\\s?([\\d,]+\\.\\d{2})`, "i")
  //       )
  //       const transferMatch = text.match(
  //         new RegExp(`transfer\\s*amount[\\s\\S]*?${currencyPattern}\\s?([\\d,]+\\.\\d{2})`, "i")
  //       )
  //       const totalMatch =
  //         text.match(new RegExp(`total[\\s#:=-]*${currencyPattern}?\\s?([\\d,]+\\.\\d{2})`, "i")) ||
  //         text.match(new RegExp(`amount[\\s#:=-]*${currencyPattern}?\\s?([\\d,]+\\.\\d{2})`, "i")) ||
  //         text.match(new RegExp(`total\\s*amount\\s*sent[\\s#:=-]*${currencyPattern}?\\s?([\\d,]+\\.\\d{2})`, "i"))

  //       if (paidMatch) {
  //         setAmountLabel("Paid Amount")
  //         setTotal(`₱${paidMatch[1]}`)
  //       } else if (transferMatch) {
  //         setAmountLabel("Transfer Amount")
  //         setTotal(`₱${transferMatch[1]}`)
  //       } else if (totalMatch) {
  //         setAmountLabel("Total")
  //         setTotal(`₱${totalMatch[1]}`)
  //       } else {
  //         setAmountLabel("Total")
  //         setTotal("Not found")
  //       }

  //       //Dari ang pang scan para ma identify ang reference number
  //       const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

  //       let refNumber = "Not found"
  //       let refLabel = "Reference No."
  //       let foundTransactionRef = false

  //       for (let i = 0; i < lines.length; i++) {
  //         const line = lines[i].toLowerCase()

  //         if (line.includes("transaction reference no") || line.includes("transaction ref")) {
  //           refLabel = "Transaction Reference No."
  //           foundTransactionRef = true
  //         }

  //         if (
  //           line.includes("reference no") ||
  //           line.includes("ref no") ||
  //           line.includes("ref. no.") ||
  //           line.includes("transaction reference no") ||
  //           line.includes("transaction ref no")
  //         ) {
  //           const inlineMatch = lines[i].match(
  //             /(?:ref(?:\.|erence)?(?: no\.?)?[:\s]*)\s*(\d[\d\s-]{3,})(?=\s|$|[A-Za-z]|\.)/i
  //           )

  //           if (inlineMatch) {
  //             refNumber = inlineMatch[1]
  //               .replace(/\s+/g, ' ')
  //               .trim()
  //             break
  //           }

  //           for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
  //             const candidate = lines[j].trim()
  //             if (/^[\d\s-]{4,}$/.test(candidate) && candidate.replace(/[\s-]/g, '').length >= 4) {
  //               refNumber = candidate
  //                 .replace(/\s+/g, ' ')
  //                 .trim()
  //               break
  //             }
  //           }

  //           if (refNumber !== "Not found") break
  //         }
  //       }

  //       if (refNumber === "Not found") {
  //         const refPatterns = [
  //           /Ref No\.\s*(\d[\d\s-]{3,})(?=\s|$|[A-Za-z]|\.)/i,
  //           /Reference No\.\s*(\d[\d\s-]{3,})(?=\s|$|[A-Za-z]|\.)/i,
  //           /Ref No[\s:]*(\d[\d\s-]{3,})(?=\s|$|[A-Za-z]|\.)/i,
  //           /Transaction Ref\. No\.\s*(\d[\d\s-]{3,})(?=\s|$|[A-Za-z]|\.)/i,
  //           /Transaction Reference No\.\s*(\d[\d\s-]{3,})(?=\s|$|[A-Za-z]|\.)/i,
  //           /Ref\. No\.\s*(\d[\d\s-]{3,})(?=\s|$|[A-Za-z]|\.)/i
  //         ]

  //         for (const pattern of refPatterns) {
  //           const match = text.match(pattern)
  //           if (match) {
  //             refNumber = match[1]
  //               .replace(/\s+/g, ' ')
  //               .trim()
  //             break
  //           }
  //         }
  //       }

  //       if (refNumber !== "Not found") {
  //         refNumber = refNumber.replace(/\s.$/, '')

  //         refNumber = refNumber.replace(/(\s.)+$/, '')

  //         refNumber = refNumber.trim()

  //         refNumber = refNumber.replace(/[^\d\s-]/g, '')

  //         refNumber = refNumber.replace(/\s+/g, ' ').trim()

  //         if (refNumber.replace(/[\s-]/g, '').length < 4) {
  //           refNumber = "Not found"
  //         }
  //       }

  //       if (foundTransactionRef) {
  //         refLabel = "Transaction Reference No."
  //       }

  //       setReference(refNumber)
  //       setReferenceLabel(refLabel)

  //     } catch (err) {
  //       console.error("OCR failed:", err)
  //       setScannedText("Error: Could not read text.")
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   reader.readAsDataURL(file)
  // }

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
      setConfirmationNumber("")
      setScannedText("")

      try {
        const preprocessedData = await preprocessImage(imageData)
        setImageSrc(imageData)

        const result = await Tesseract.recognize(preprocessedData, "eng", {
          logger: (m) => console.log(m),
        })

        const text = result.data.text
        // console.log("🧾 Extracted text:", text)
        setScannedText(text)

        const confirmationMatch = text.match(/confirmation[\s#:=-]*no\.?\s*([A-Z0-9-]{5,})/i)
        if (confirmationMatch) {
          setShowConfirmationInput(true)
          setConfirmationNumber(confirmationMatch[1])
        } else {
          setShowConfirmationInput(false)
          setConfirmationNumber("")
        }

        const traceMatch = text.match(/Trace no\.\s*([A-Z0-9-]+)/i)
        if (traceMatch) {
          setShowConfirmationInput(true)
          setConfirmationNumber(traceMatch[1])
        }

        const landBankTransactionRefMatch = text.match(/Transaction Reference Number\s*([A-Z0-9\/]+)/i)
        if (landBankTransactionRefMatch) {
          setShowConfirmationInput(true)
          setConfirmationNumber(landBankTransactionRefMatch[1])
        }

        const currencyPattern = "(?:₱|PHP|F|P|£)"

        const bdoAmountMatch = text.match(/PHP\s*([\d,]+\.[\d]{2})/i)

        const paidMatch = text.match(
          new RegExp(`paid\\s*${currencyPattern}?\\s?([\\d,]+\\.\\d{2})`, "i")
        )
        const transferMatch = text.match(
          new RegExp(`transfer\\s*amount[\\s\\S]*?${currencyPattern}\\s?([\\d,]+\\.\\d{2})`, "i")
        )

        const totalMatch =
          text.match(new RegExp(`total[\\s#:=-]*${currencyPattern}?\\s?([\\d,]+\\.\\d{2})`, "i")) ||
          text.match(new RegExp(`amount[\\s#:=-]*${currencyPattern}?\\s?([\\d,]+\\.\\d{2})`, "i")) ||
          text.match(new RegExp(`total\\s*amount\\s*sent[\\s#:=-]*${currencyPattern}?\\s?([\\d,]+\\.\\d{2})`, "i"))

        if (bdoAmountMatch) {
          setAmountLabel("Paid Amount")
          setTotal(`₱${bdoAmountMatch[1]}`)
        } else if (paidMatch) {
          setAmountLabel("Paid Amount")
          setTotal(`₱${paidMatch[1]}`)
        } else if (transferMatch) {
          setAmountLabel("Transfer Amount")
          setTotal(`₱${transferMatch[1]}`)
        } else if (totalMatch) {
          setAmountLabel("Total")
          setTotal(`₱${totalMatch[1]}`)
        } else {
          setAmountLabel("Total")
          setTotal("Not found")
        }

        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

        let refNumber = "Not found"
        let refLabel = "Reference No."
        let foundTransactionRef = false

        const bdoRefMatch = text.match(/Reference no\.\s*([A-Z0-9-]+)/i)
        if (bdoRefMatch) {
          refNumber = bdoRefMatch[1]
        }

        if (refNumber === "Not found") {
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].toLowerCase()

            if (line.includes("transaction reference no") || line.includes("transaction ref")) {
              refLabel = "Transaction Reference No."
              foundTransactionRef = true
            }

            if (
              line.includes("reference no") ||
              line.includes("ref no") ||
              line.includes("ref. no.") ||
              line.includes("transaction reference no") ||
              line.includes("transaction ref no")
            ) {
              const inlineMatch = lines[i].match(
                /(?:ref(?:\.|erence)?(?: no\.?)?[:\s]*)\s*([A-Z0-9\s-]{4,})(?=\s|$|[A-Za-z]|\.)/i
              )

              if (inlineMatch) {
                refNumber = inlineMatch[1]
                  .replace(/\s+/g, ' ')
                  .trim()
                break
              }

              for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
                const candidate = lines[j].trim()
                if (/^[A-Z0-9\s-]{8,}$/i.test(candidate)) {
                  refNumber = candidate
                    .replace(/\s+/g, ' ')
                    .trim()
                  break
                }
              }

              if (refNumber !== "Not found") break
            }
          }
        }

        if (refNumber === "Not found") {
          const refPatterns = [
            /Reference no\.\s*([A-Z0-9-]+)/i,
            /Ref No\.\s*([A-Z0-9\s-]{4,})(?=\s|$|[A-Za-z]|\.)/i,
            /Reference No\.\s*([A-Z0-9\s-]{4,})(?=\s|$|[A-Za-z]|\.)/i,
            /Ref No[\s:]*([A-Z0-9\s-]{4,})(?=\s|$|[A-Za-z]|\.)/i,
            /Transaction Ref\. No\.\s*([A-Z0-9\s-]{4,})(?=\s|$|[A-Za-z]|\.)/i,
            /Transaction Reference No\.\s*([A-Z0-9\s-]{4,})(?=\s|$|[A-Za-z]|\.)/i,
            /Ref\. No\.\s*([A-Z0-9\s-]{4,})(?=\s|$|[A-Za-z]|\.)/i
          ]

          for (const pattern of refPatterns) {
            const match = text.match(pattern)
            if (match) {
              refNumber = match[1]
                .replace(/\s+/g, ' ')
                .trim()
              break
            }
          }
        }

        if (refNumber !== "Not found") {
          refNumber = refNumber.replace(/\s.$/, '')
          refNumber = refNumber.replace(/(\s.)+$/, '')
          refNumber = refNumber.trim()

          if (!refNumber.includes('-')) {
            refNumber = refNumber.replace(/[^\d\s-]/g, '')
          }

          refNumber = refNumber.replace(/\s+/g, ' ').trim()

          if (refNumber.replace(/[\s-]/g, '').length < 4) {
            refNumber = "Not found"
          }
        }

        if (foundTransactionRef) {
          refLabel = "Transaction Reference No."
        }

        setReference(refNumber)
        setReferenceLabel(refLabel)

      } catch (err) {
        console.error("OCR failed:", err)
        setScannedText("Error: Could not read text.")
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
                <span className="text-sm">Click to upload receipt</span>
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
                setScannedText("")
              }}
              className="w-full md:w-auto gap-2 bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              <Upload className="w-4 h-4" /> Upload Another
            </Button>
          )}

          <div className="w-full mt-4 space-y-3 text-left">
            <div className="p-3 bg-gray-100 rounded-xl">
              <p className="text-sm text-gray-500">{amountLabel}</p>
              <p className="text-lg font-bold text-green-700">{total || "—"}</p>
            </div>

            <div className="p-3 bg-gray-100 rounded-xl">
              <p className="text-sm text-gray-500">{referenceLabel}</p>
              <p className="text-lg font-bold text-blue-700">{reference || "—"}</p>
            </div>

            {showConfirmationInput && (
              <div className="p-3 bg-gray-100 rounded-xl">
                <p className="text-sm text-gray-500">
                  {confirmationNumber && (confirmationNumber.includes("MB") || confirmationNumber.includes("/")) ? "Transaction Reference No." :
                    confirmationNumber && confirmationNumber.length <= 10 ? "Trace No." : "Confirmation No."
                  }
                </p>
                <p className="text-lg font-bold text-red-700">{confirmationNumber || "—"}</p>
              </div>
            )}

            {scannedText && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl mt-4 max-h-64 overflow-y-auto">
                <p className="text-sm text-gray-500 mb-1">Scanned Text:</p>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">{scannedText}</pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </ScrollArea>
  )
}

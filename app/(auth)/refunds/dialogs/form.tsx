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
import { IUser, Role } from "@/types/user.interface"
import { UserSchema } from "@/validators/user.validator"
import { gql } from "@apollo/client"
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react"
import { useForm } from "@tanstack/react-form"
import React, { useEffect, useState, useTransition, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  CalendarIcon,
  Check,
  CheckIcon,
  ChevronsUpDown,
  ChevronsUpDownIcon,
  CirclePlus,
  Eraser,
  Paperclip,
  Video,
  XIcon,
  AlertCircle,
  UploadIcon,
  Loader2,
  XCircle,
} from "lucide-react"
import {
  Field,
  FieldLabel,
  FieldError,
  FieldSet,
  FieldDescription,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
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
import { cn } from "@/lib/utils"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { IRefund } from "@/types/refund.interface"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { PaymentMethod } from "@/types/payment.interface"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useDropzone } from "react-dropzone"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { RefundSchema } from "@/validators/refund.validator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AnimatePresence, motion } from "framer-motion"
import * as Tesseract from 'tesseract.js'

const USER = gql`
  query Refund($_id: ID!) {
    refund(_id: $_id) {
      _id
      payerName
      referenceNumber
      amount
      method
      proofOfRefundURL
      refundDate
      entryList {
        _id
        entryNumber
      }
    }
  }
`

const CREATE = gql`
  mutation CreateRefund($input: CreateRefundInput!) {
    createRefund(input: $input) {
      ok
      message
    }
  }
`

const UPDATE = gql`
  mutation UpdateRefund($input: UpdateRefundInput!) {
    updateRefund(input: $input) {
      ok
      message
    }
  }
`

const ALL_ACTIVE_ENTRIES = gql`
  query RefundActiveEntryOptions {
    activeRefundEntryOptions {
      event
      players {
        firstName
        lastName
      }
      entryNumber
    }
  }
`

interface ExistingRefund {
  referenceNumber: string
  payerName: string
}

type Props = {
  _id?: string
  onClose?: () => void
  existingRefunds?: ExistingRefund[]
}

// UploadingOverlay component - EXACTLY from payment form
const UploadingOverlay = ({ message, progress }: { message?: string; progress?: number }) => (
  <motion.div
    className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-[100]"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-lg border">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mb-4"></div>
      <p className="text-lg font-medium text-gray-800 mb-2">
        {message || "Processing..."}
      </p>
      {progress !== undefined && (
        <div className="w-64 mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Uploading</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-green-600 h-2 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}
      <p className="text-sm text-gray-500 mt-4">Please don't close this window</p>
    </div>
  </motion.div>
)

const FormDialog = (props: Props) => {
  const [open, setOpen] = useState(false)
  const isUpdate = Boolean(props._id)
  const [isPending, startTransition] = useTransition()
  const [duplicateError, setDuplicateError] = useState<string | null>(null)

  const { data, loading: fetchLoading }: any = useQuery(USER, {
    variables: { _id: props._id },
    skip: !open || !isUpdate,
    fetchPolicy: "no-cache",
  })
  const refund = data?.refund as IRefund
  const [submitForm] = useMutation(isUpdate ? UPDATE : CREATE)

  // Loading states - EXACTLY like payment form
  const [isUploading, setIsUploading] = useState(false)
  const [loading, setLoading] = useState(false) // For scanning
  const [referenceLoading, setReferenceLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [uploadProgress, setUploadProgress] = useState(0)

  // const isLoading = isPending || (isUpdate && fetchLoading)
  const isLoading = isPending || isUploading || (isUpdate && fetchLoading)

  const formLoading = isPending || isUploading

  const { data: entryOptionsData, loading: optionsLoading } = useQuery(
    ALL_ACTIVE_ENTRIES,
    {
      fetchPolicy: "no-cache",
    }
  )
  const [openFilteredEntries, setOpenFilteredEntries] = useState(false)
  const entryOptions = (entryOptionsData as any)?.activeRefundEntryOptions || []
  const [openMethods, setOpenMethods] = useState(false)
  const Methods = Object.values(PaymentMethod).map((method) => ({
    label: method.toLocaleLowerCase().replaceAll("_", " "),
    value: method,
  }))

  const [activeTab, setActiveTab] = useState("refund-details")

  const [files, setFiles] = useState<any[]>([])
  const [preview, setPreview] = useState<string | null>(null)
  const [scannedAmount, setScannedAmount] = useState<string | null>(null)
  const [scannedReference, setScannedReference] = useState<string | null>(null)
  const [amountLabel, setAmountLabel] = useState("Total")
  const [referenceLabel, setReferenceLabel] = useState("Reference No.")
  const [scannedText, setScannedText] = useState<string>("")

  const checkForDuplicateReference = (referenceNumber: string): boolean => {
    if (!referenceNumber || isUpdate) return false

    const normalizedRef = referenceNumber.trim().toUpperCase()

    const isDuplicate = props.existingRefunds?.some(refund =>
      refund.referenceNumber.trim().toUpperCase() === normalizedRef
    )

    return isDuplicate || false
  }

  const getDuplicateRefundInfo = (referenceNumber: string) => {
    const normalizedRef = referenceNumber.trim().toUpperCase()
    return props.existingRefunds?.find(refund =>
      refund.referenceNumber.trim().toUpperCase() === normalizedRef
    )
  }

  // File upload function - EXACTLY like payment form
  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      const fileExt = file.name.split('.').pop() || '';
      const fileName = `refund-${Date.now()}.${fileExt}`;
      formData.append("file", file, fileName);

      // Simulate progress updates - same as payment form
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch("/api/upload/refund", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error("Upload Failed");
      }

      const data = await response.json();
      toast.success("File uploaded successfully!");
      return data.url;
    } catch (error) {
      console.error("Error Uploading file to refund folder:", error);
      toast.error("Error uploading file. Please try again.");
      return null;
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  }

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": [],
      "image/jpg": [],
      "image/jpeg": [],
    },
    multiple: false,
    maxSize: 3 * 1024 * 1024,
    onDrop: (acceptedFiles: any, fileRejections: any) => {
      if (fileRejections.length > 0) {
        toast.error("File too large or unsupported type. (Max size: 3MB)")
        return
      }
      const file = acceptedFiles[0]
      setFiles([file])
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)

      scanReceipt(file)
    },
  })

  const scanReceipt = async (file: File) => {
    setReferenceLoading(true)
    setLoading(true)
    setScannedAmount(null)
    setScannedReference(null)
    setDuplicateError(null)

    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const imageData = reader.result as string

        // Preprocess image - SAME as payment form
        const preprocessedData = await preprocessImage(imageData)

        // Perform OCR
        const result = await Tesseract.recognize(preprocessedData, "eng", {
          logger: (m) => console.log(m),
        })

        const text = result.data.text
        setScannedText(text)

        // Scan for amount
        const currencyPattern = "(?:₱|PHP|F|P|£)"
        const totalMatch = text.match(
          new RegExp(`total[\\s#:=-]*${currencyPattern}?\\s?([\\d,]+\\.[\\d]{2})`, "i")
        ) || text.match(
          new RegExp(`amount[\\s#:=-]*${currencyPattern}?\\s?([\\d,]+\\.[\\d]{2})`, "i")
        )

        if (totalMatch) {
          setAmountLabel("Total")
          setScannedAmount(`₱${totalMatch[1]}`)
          form.setFieldValue("amount", parseFloat(totalMatch[1].replace(/,/g, '')))
        } else {
          setScannedAmount("Not found")
        }

        // Scan for reference number
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
        let refNumber = "Not found"

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].toLowerCase()
          if (
            line.includes("reference no") ||
            line.includes("ref no") ||
            line.includes("ref. no.") ||
            line.includes("transaction reference no")
          ) {
            const inlineMatch = lines[i].match(
              /(?:ref(?:\.|erence)?(?: no\.?)?[:\s]*)\s*([A-Z0-9\s-]{4,})(?=\s|$|[A-Za-z]|\.)/i
            )

            if (inlineMatch) {
              refNumber = inlineMatch[1].replace(/\s+/g, ' ').trim()
              break
            }

            // Check next lines for reference number
            for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
              const candidate = lines[j].trim()
              if (/^[A-Z0-9\s-]{8,}$/i.test(candidate)) {
                refNumber = candidate.replace(/\s+/g, ' ').trim()
                break
              }
            }

            if (refNumber !== "Not found") break
          }
        }

        if (refNumber !== "Not found") {
          refNumber = refNumber.replace(/\s.$/, '').trim()
          if (!refNumber.includes('-')) {
            refNumber = refNumber.replace(/[^\d\s-]/g, '')
          }
          refNumber = refNumber.replace(/\s+/g, ' ').trim()

          if (refNumber.replace(/[\s-]/g, '').length < 4) {
            refNumber = "Not found"
          }
        }

        setScannedReference(refNumber)
        if (refNumber !== "Not found") {
          form.setFieldValue("referenceNumber", refNumber)

          // Check for duplicate after setting the value
          if (checkForDuplicateReference(refNumber)) {
            const duplicateRefund = getDuplicateRefundInfo(refNumber)
            setDuplicateError(
              `Reference number "${refNumber}" already exists for refund by "${duplicateRefund?.payerName}".`
            )
          }
        }

        setReferenceLoading(false)
        setLoading(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error("Error scanning receipt:", err)
      setReferenceLoading(false)
      setLoading(false)
      setScannedAmount("Error")
      setScannedReference("Error")
    }
  }

  // EXACTLY the same preprocessImage as payment form
  const preprocessImage = (imageData: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image()
      img.src = imageData
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")!
        canvas.width = img.width * 2
        canvas.height = img.height * 2

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // SAME as payment form
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

  const form = useForm({
    defaultValues: {
      payerName: refund?.payerName || "",
      referenceNumber: refund?.referenceNumber || "",
      amount: refund?.amount || 0,
      method: refund?.method || "BANK_TRANSFER",
      proofOfRefundURL: refund?.proofOfRefundURL || "",
      refundDate: refund?.refundDate || new Date(),
      entryList: refund?.entryList.map((e) => e.entryNumber) || [],
    },
    validators: {
      onSubmit: ({ formApi, value }) => {
        try {
          if (!isUpdate && checkForDuplicateReference(value.referenceNumber)) {
            const duplicateRefund = getDuplicateRefundInfo(value.referenceNumber)
            throw new Error(`Reference number "${value.referenceNumber}" already exists for refund by "${duplicateRefund?.payerName}".`)
          }

          RefundSchema.parse(value)
        } catch (error: any) {
          console.error(error)
          if (error.message && error.message.includes("already exists")) {
            formApi.fieldInfo["referenceNumber"].instance?.setErrorMap({
              onSubmit: { message: error.message },
            })
          } else {
            JSON.parse(error).map(({ path, message }) => {
              const pathName = path.join(".")
              formApi.fieldInfo[pathName].instance?.setErrorMap({
                onSubmit: { message },
              })
            })
          }
        }
      },
    },
    listeners: {
      onChange: ({ formApi, fieldApi }) => {
        if (fieldApi.name === "referenceNumber" && !isUpdate) {
          const refNumber = fieldApi.state.value
          if (refNumber && refNumber.trim().length > 0) {
            if (checkForDuplicateReference(refNumber)) {
              const duplicateRefund = getDuplicateRefundInfo(refNumber)
              setDuplicateError(
                `Reference number "${refNumber}" already exists for refund by "${duplicateRefund?.payerName}".`
              )
            } else {
              setDuplicateError(null)
            }
          } else {
            setDuplicateError(null)
          }
        }
      },
    },
    onSubmit: ({ value, formApi }) =>
      startTransition(async () => {
        try {
          if (!isUpdate && checkForDuplicateReference(value.referenceNumber)) {
            const duplicateRefund = getDuplicateRefundInfo(value.referenceNumber)
            setDuplicateError(
              `Cannot create refund: Reference number "${value.referenceNumber}" already exists for refund by "${duplicateRefund?.payerName}".`
            )
            return
          }

          const payload = value
          let proofOfRefundURL = value.proofOfRefundURL

          // EXACTLY same upload logic as payment form
          if (files.length > 0) {
            console.log("Uploading file...")
            const uploadedUrl = await uploadFile(files[0])
            if (!uploadedUrl) {
              toast.error("Failed to upload receipt image. Please try again.")
              return
            }
            proofOfRefundURL = uploadedUrl
            console.log("File uploaded, URL:", proofOfRefundURL)
          }

          if (!proofOfRefundURL && isUpdate && refund?.proofOfRefundURL) {
            proofOfRefundURL = refund.proofOfRefundURL
            console.log("Using existing URL:", proofOfRefundURL)
          }

          if (!isUpdate && !proofOfRefundURL) {
            toast.error("Please upload proof of refund")
            setActiveTab("refund-reference")
            return
          }

          payload.proofOfRefundURL = proofOfRefundURL || ''

          const response = await submitForm({
            variables: {
              input: isUpdate ? { _id: props._id, ...payload } : payload,
            },
          })

          if (response) {
            toast.success(isUpdate ? "Refund updated successfully!" : "Refund created successfully!")
            setTimeout(() => {
              onClose()
            }, 1000)
          }
        } catch (error: any) {
          console.error(error.errors)
          if (error.name == "CombinedGraphQLErrors") {
            const fieldErrors = error.errors[0].extensions.fields
            if (fieldErrors)
              fieldErrors.map(
                ({ path, message }: { path: string; message: string }) =>
                  (formApi as any).fieldInfo[path as any].instance?.setErrorMap(
                    {
                      onSubmit: { message },
                    }
                  )
              )
          }
        }
      }),
  })

  const onClose = () => {
    setOpen(false)
    props.onClose?.()
    form.reset()
    setFiles([])
    setPreview(null)
    setActiveTab("refund-details")
    setScannedAmount(null)
    setScannedReference(null)
    setDuplicateError(null)
    setIsUploading(false)
    setLoading(false)
    setReferenceLoading(false)
    setUploadProgress(0)
  }

  const getSelectedEntriesText = () => {
    const entryList = form.getFieldValue("entryList") || []
    if (entryList.length === 0) {
      return "Select entries..."
    }
    if (entryList.length === 1) {
      const entry = entryOptions.find((e: any) => e.entryNumber === entryList[0])
      return entry ? `${entry.entryNumber} (${entry.players[0].firstName} ${entry.players[0].lastName})` : "1 entry selected"
    }
    return `${entryList.length} entries selected`
  }

  const handleRemoveEntry = (entryNumber: string) => {
    const currentEntries = form.getFieldValue("entryList") || []
    form.setFieldValue("entryList", currentEntries.filter((e: string) => e !== entryNumber))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAYMENT_PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "PAYMENT_PARTIALLY_PAID":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "LEVEL_APPROVED":
      case "VERIFIED":
        return "bg-green-100 text-green-800 border-green-200"
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const RequiredLabel = ({ htmlFor, children }: { htmlFor: string; children: string }) => (
    <div className="flex items-center gap-1">
      <FieldLabel htmlFor={htmlFor}>{children}</FieldLabel>
      <span className="text-red-500">*</span>
    </div>
  )

  // File remove handler - same as payment form
  const handleRemoveFile = () => {
    setFiles([])
    setPreview(null)
    setReferenceLoading(false)
    setScannedAmount(null)
    setScannedReference(null)
    setLoading(false)
    form.setFieldValue("proofOfRefundURL", "")
  }

  // Check if submit should be disabled
  const isSubmitDisabled = () => {
    const payerName = form.getFieldValue("payerName")?.toString().trim()
    const amount = form.getFieldValue("amount")
    const method = form.getFieldValue("method")?.toString().trim()
    const entryList = form.getFieldValue("entryList") || []

    // Basic validation
    if (entryList.length === 0) return true
    if (!payerName) return true
    if (!amount || amount <= 0) return true
    if (!method) return true

    return false
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
            <CirclePlus className="size-3.5 -mx-0.5" />
            Add Refund
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
        className="max-w-4xl"
      >
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? "Edit Refund" : "Create Refund"}
          </DialogTitle>
          <DialogDescription className="space-y-2">
            {isUpdate
              ? "Update existing refund details."
              : "Create a new refund in the system."}
          </DialogDescription>
          {duplicateError && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{duplicateError}</span>
            </div>
          )}
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="refund-details">Refund Details</TabsTrigger>
            <TabsTrigger value="refund-reference">Upload Receipt</TabsTrigger>
          </TabsList>

          <form
            className="-mt-2 mb-2"
            id="refund-form"
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <div className="min-h-[580px] max-h-[60vh] overflow-y-auto pr-2">
              <TabsContent value="refund-details" className="space-y-4 mt-4">
                <FieldSet className="grid grid-cols-2 gap-4">
                  <form.Field
                    name="payerName"
                    children={(field: any) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field data-invalid={isInvalid} className="col-span-2">
                          <RequiredLabel htmlFor={field.name}>Payer Name</RequiredLabel>
                          <InputGroup className="-my-1">
                            <InputGroupInput
                              required
                              placeholder="Payer Name"
                              disabled={isLoading}
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
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
                    name="method"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field data-invalid={isInvalid}>
                          <RequiredLabel htmlFor={field.name}>Payment Method</RequiredLabel>
                          <Select
                            value={field.state.value}
                            onValueChange={(value: PaymentMethod) => field.handleChange(value)}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="w-full uppercase">
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent className="uppercase">
                              {Methods.map((method) => (
                                <SelectItem key={method.value} value={method.value}>
                                  {method.label.toUpperCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      )
                    }}
                  />

                  <form.Field
                    name="refundDate"
                    children={(field: any) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field data-invalid={isInvalid}>
                          <RequiredLabel htmlFor="refund-date">Refund Date</RequiredLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="refund-date"
                                name="refund-date"
                                variant="outline"
                                data-empty={!field.state.value}
                                className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal flex"
                                disabled={isLoading}
                              >
                                <CalendarIcon className="size-3.5 mr-2" />
                                {field.state.value ? (
                                  format(field.state.value, "PPP")
                                ) : (
                                  <span>Select Refund Date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                required={true}
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
                    name="entryList"
                    children={(field: any) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                      const entryList = field.state.value || []
                      return (
                        <Field data-invalid={isInvalid} className="col-span-2">
                          <div className="flex items-center gap-1">
                            <Label className="text-sm font-medium">Select Entries</Label>
                            <span className="text-red-500">*</span>
                          </div>

                          <div className="space-y-3">
                            <Popover
                              open={openFilteredEntries}
                              onOpenChange={setOpenFilteredEntries}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  id={field.name}
                                  name={field.name}
                                  aria-expanded={openFilteredEntries}
                                  onBlur={field.handleBlur}
                                  variant="outline"
                                  role="combobox"
                                  aria-invalid={isInvalid}
                                  className={cn(
                                    "w-full justify-between font-normal capitalize h-fit",
                                    !entryList.length && "text-muted-foreground"
                                  )}
                                  type="button"
                                  disabled={isLoading}
                                >
                                  <span className="truncate text-left">
                                    {getSelectedEntriesText()}
                                  </span>
                                  <ChevronsUpDown className="opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                                <Command>
                                  <CommandInput
                                    placeholder="Search entry..."
                                    className="h-9"
                                  />
                                  <CommandList>
                                    <CommandEmpty>No entry found.</CommandEmpty>
                                    <CommandGroup>
                                      {entryOptions.map((entry: any) => {
                                        const isSelected = entryList.includes(entry.entryNumber)
                                        return (
                                          <CommandItem
                                            key={entry.entryNumber}
                                            value={entry.entryNumber}
                                            onSelect={(currentValue: any) => {
                                              field.handleChange((prev: string[]) => {
                                                if (prev.includes(currentValue))
                                                  return prev.filter(
                                                    (e: string) => e != currentValue
                                                  )
                                                else return [...prev, currentValue]
                                              })
                                              setOpenFilteredEntries(false)
                                            }}
                                          >
                                            <div
                                              className={cn(
                                                "flex justify-between w-full items-center"
                                              )}
                                            >
                                              <div className="flex flex-col">
                                                <span className="block">
                                                  {entry.entryNumber}
                                                </span>
                                                <span className="block text-xs">
                                                  {entry.event}
                                                </span>
                                                <span className="block text-xs">
                                                  {entry.players
                                                    .map(
                                                      (p: any) =>
                                                        `${p.firstName} ${p.lastName}`
                                                    )
                                                    .join(", ")}
                                                </span>
                                              </div>
                                              <Check
                                                className={cn(
                                                  "ml-auto",
                                                  isSelected
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                                )}
                                              />
                                            </div>
                                          </CommandItem>
                                        )
                                      })}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>

                            {entryList.length > 0 && (
                              <div className="space-y-2">
                                <Separator />
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm font-medium">
                                    Selected Entries ({entryList.length})
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => field.handleChange([])}
                                    disabled={isLoading}
                                  >
                                    Clear All
                                  </Button>
                                </div>

                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                  {entryList.map((entryNumber: string, index: number) => {
                                    const selectedEntry = entryOptions.find(
                                      (entry: any) => entry.entryNumber == entryNumber
                                    )
                                    if (!selectedEntry) return null

                                    return (
                                      <div
                                        key={entryNumber}
                                        className="p-3 border rounded-lg space-y-2"
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium text-sm">
                                                {selectedEntry.entryNumber}
                                              </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                              <div>
                                                <strong>Players:</strong>{" "}
                                                {selectedEntry.players
                                                  .map((p: any) => `${p.firstName} ${p.lastName}`)
                                                  .join(", ")}
                                              </div>
                                              <div>
                                                <strong>Event:</strong> {selectedEntry.event}
                                              </div>
                                            </div>
                                          </div>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveEntry(entryNumber)}
                                            className="h-8 w-8 p-0"
                                            disabled={isLoading}
                                          >
                                            <XIcon className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
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

              <TabsContent value="refund-reference" className="space-y-4 mt-4">
                <FieldSet className="grid grid-cols-2 gap-4">
                  <form.Field
                    name="amount"
                    children={(field: any) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field data-invalid={isInvalid}>
                          <RequiredLabel htmlFor={field.name}>Amount</RequiredLabel>
                          <div className="space-y-2">
                            <InputGroup>
                              <InputGroupAddon>
                                <span className="font-thin">₱</span>
                              </InputGroupAddon>
                              <InputGroupInput
                                placeholder="Amount"
                                disabled={isLoading}
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                  field.handleChange(parseFloat(e.target.value) || 0)
                                }
                                aria-invalid={isInvalid}
                                type="number"
                                step={0.01}
                                min={0}
                              />
                            </InputGroup>
                            {scannedAmount && (
                              <p className="text-xs text-green-600">
                                {scannedAmount === "Not found"
                                  ? "No amount detected in receipt"
                                  : `Scanned amount: ${scannedAmount}`}
                              </p>
                            )}
                          </div>
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      )
                    }}
                  />

                  <form.Field
                    name="referenceNumber"
                    children={(field: any) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                      const currentRef = field.state.value
                      const isDuplicate = currentRef ? checkForDuplicateReference(currentRef) : false

                      return (
                        <Field data-invalid={isInvalid || isDuplicate}>
                          <div className="flex items-center gap-1">
                            <Label className="text-sm font-medium">Reference No.</Label>
                            <span className="text-red-500">*</span>
                            {referenceLoading && (
                              <span className="text-xs font-normal text-blue-500 animate-pulse ml-2">
                                Scanning...
                              </span>
                            )}
                          </div>
                          <div className="space-y-2">
                            {referenceLoading ? (
                              <div className="flex items-center gap-3 p-2 border border-gray-200 rounded bg-gray-50">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                                <span className="text-gray-600">Scanning...</span>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <InputGroup>
                                  <InputGroupInput
                                    placeholder="Reference No."
                                    disabled={isLoading}
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => {
                                      const value = e.target.value
                                      field.handleChange(value)

                                      if (value && value.trim().length > 0) {
                                        if (checkForDuplicateReference(value)) {
                                          const duplicateRefund = getDuplicateRefundInfo(value)
                                          setDuplicateError(
                                            `Reference number "${value}" already exists for refund by "${duplicateRefund?.payerName}".`
                                          )
                                        } else {
                                          setDuplicateError(null)
                                        }
                                      } else {
                                        setDuplicateError(null)
                                      }
                                    }}
                                    aria-invalid={isInvalid || isDuplicate}
                                    className={cn(
                                      "border-red-500 focus:border-red-500 focus:ring-red-500",
                                      isDuplicate && "border-red-500 focus:border-red-500 focus:ring-red-500"
                                    )}
                                  />
                                </InputGroup>

                                {scannedReference && scannedReference !== "Not found" && !isDuplicate && (
                                  <p className="text-xs text-green-600">
                                    ✓ Scanned reference auto-filled
                                  </p>
                                )}

                                {(!scannedReference || scannedReference === "Not found") && files.length > 0 && (
                                  <p className="text-xs text-gray-500">
                                    No reference detected in receipt
                                  </p>
                                )}

                                {isDuplicate && (
                                  <p className="text-xs text-red-500 flex items-center">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    This reference number already exists
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          {isInvalid && !isDuplicate && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      )
                    }}
                  />
                </FieldSet>

                <div className="border-2 border-dashed border-green-300 rounded-xl p-4 bg-green-50 flex flex-col items-center">
                  <div className="w-full text-left mb-3">
                    <div className="text-green-800 font-bold text-sm mb-1">
                      Upload Proof of Refund <span className="text-red-500">*</span>
                    </div>
                    <p className="text-gray-600 text-xs">
                      Upload your refund receipt to automatically scan the amount and reference number.
                    </p>
                  </div>

                  {files.length > 0 && (
                    <div className="w-full mb-4 p-3 bg-white border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-gray-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium truncate">
                            {files[0].name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(files[0].size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={handleRemoveFile}
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

                  {isUpdate && refund?.proofOfRefundURL && !files.length && (
                    <div className="w-full mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-blue-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-700">
                            Existing proof of refund is already uploaded
                          </p>
                          <p className="text-xs text-blue-500">
                            Upload a new file to replace the existing one
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="w-full flex justify-center mb-4">
                    {preview || refund?.proofOfRefundURL ? (
                      <div className="w-full max-w-[300px] relative">

                        {imageLoading && (
                          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border bg-gray-100">
                            <div className="animate-spin h-8 w-8 rounded-full border-2 border-gray-300 border-t-green-500" />
                          </div>
                        )}

                        <Image
                          src={preview || refund?.proofOfRefundURL || ''}
                          alt={preview ? "Uploaded receipt" : "Existing proof of refund"}
                          className={`w-full rounded-lg border shadow transition-opacity duration-300 ${imageLoading ? "opacity-0" : "opacity-100"
                            }`}
                          width={300}
                          height={300}
                          onLoad={() => setImageLoading(false)}
                          onError={(e) => {
                            console.error("Failed to load image:", e.currentTarget.src);
                            setImageLoading(false)
                            e.currentTarget.style.display = 'none';
                            const fallbackDiv = document.createElement('div');
                            fallbackDiv.className = 'w-full max-w-[300px] h-[200px] rounded-lg border bg-gray-50 flex items-center justify-center';
                            fallbackDiv.innerHTML = `
            <div class="text-center">
              <svg class="w-8 h-8 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"></svg>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <p class="text-sm text-gray-500">Failed to load image</p>
            </div>
          `;
                            e.currentTarget.parentNode?.appendChild(fallbackDiv);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full max-w-[300px] h-[200px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                          <UploadIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Receipt preview will appear here</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    {...getRootProps()}
                    className={`cursor-pointer w-full flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl bg-white hover:bg-green-100 transition ${files.length > 0 ? 'border-green-400 hover:bg-green-50' : 'border-green-400 hover:bg-green-50'
                      }`}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-6 h-6 mb-2 animate-spin text-green-600" />
                        <span className="font-medium text-sm text-green-700">Uploading...</span>
                        <span className="text-xs text-gray-500 mt-1">Please wait</span>
                      </div>
                    ) : loading ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-6 h-6 mb-2 animate-spin text-green-600" />
                        <span className="font-medium text-sm text-green-700">Scanning receipt...</span>
                      </div>
                    ) : (
                      <>
                        <UploadIcon className="w-6 h-6 mb-2 text-green-600" />
                        <span className="font-medium text-sm text-green-700">
                          {files.length > 0 ? "Drag & drop new file or click to replace" : "Drag & drop your receipt or click to browse"}
                        </span>
                        <input {...getInputProps()} />
                      </>
                    )}
                  </div>

                  {isUploading && (
                    <div className="w-full mt-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent"></div>
                        <span className="text-sm text-gray-600">Uploading file to server...</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div className="bg-green-600 h-1.5 rounded-full animate-pulse w-3/4"></div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </form>
        </Tabs>

        <DialogFooter>
          <DialogClose asChild>
            <Button className="w-20" onClick={onClose} variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            className="w-20"
            loading={formLoading}
            type="submit"
            form="refund-form"
            disabled={isSubmitDisabled() || (!isUpdate && duplicateError !== null) || formLoading}
          >
            Submit
          </Button>
        </DialogFooter>

        <AnimatePresence>
          {(isUploading || loading) && (
            <UploadingOverlay
              message={loading ? "Scanning receipt..." : "Uploading..."}
              progress={isUploading ? uploadProgress : undefined}
            />
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

export default FormDialog
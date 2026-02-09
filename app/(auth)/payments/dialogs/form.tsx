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
import { useMutation, useQuery } from "@apollo/client/react"
import { useForm } from "@tanstack/react-form"
import React, { useState, useTransition, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CirclePlus, X, ChevronDown, Check, Loader2, Paperclip, XCircle, UploadIcon, CheckCircle, Edit, AlertCircle, Eye, Copy } from "lucide-react"
import { Field, FieldLabel, FieldError, FieldSet } from "@/components/ui/field"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatePresence, motion } from "framer-motion"
import * as Tesseract from 'tesseract.js'
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { PaymentMethod } from "@/types/payment.interface"

const CREATE_PAYMENT = gql`
  mutation CreatePaymentByAdmin($input: CreatePaymentInput!) {
    createPaymentByAdmin(input: $input) {
      ok
      message
    }
  }
`

const UPDATE_PAYMENT = gql`
  mutation UpdatePayment($input: UpdatePaymentInput!) {
    updatePayment(input: $input) {
      ok
      message
    }
  }
`

const GET_PAYMENT = gql`
  query GetPayment($_id: ID!) {
    payment(_id: $_id) {
      _id
      payerName
      referenceNumber
      amount
      method
      paymentDate
      proofOfPaymentURL
      statuses {
        status
        date
        reason
        by {
          _id
          name
          email
          contactNumber
          username
          role
          isActive
          createdAt
          updatedAt
        }
      }
      entryList {
        isFullyPaid
        entry {
          _id
          entryNumber
          entryKey
        }
      }
      remarks {
        remark
        date
        by {
          _id
          name
          email
          contactNumber
          username
          role
          isActive
          createdAt
          updatedAt
        }
      }
    }
  }
`

const CHECK_DUPLICATE_REFERENCE = gql`
  query CheckDuplicateReference($referenceNumber: String!) {
    checkDuplicateReference(referenceNumber: $referenceNumber) {
      _id
      payerName
      referenceNumber
      amount
      method
      paymentDate
      proofOfPaymentURL
      statuses {
        status
        date
        reason
        by {
          _id
          name
          email
          contactNumber
          username
          role
          isActive
          createdAt
          updatedAt
        }
      }
      entryList {
        isFullyPaid
        entry {
          _id
          entryNumber
          entryKey
        }
      }
      remarks {
        remark
        date
        by {
          _id
          name
          email
          contactNumber
          username
          role
          isActive
          createdAt
          updatedAt
        }
      }
    }
  }
`

const ACTIVE_PAYMENT_ENTRY_OPTIONS = gql`
  query ActivePaymentEntryOptions {
    activePaymentEntryOptions {
      entryNumber
      eventName
      currentStatus
      players {
        firstName
        lastName
      }
      remainingFee
    }
  }
`

interface Player {
  firstName: string
  lastName: string
}

interface ActivePaymentEntryOption {
  entryNumber: string
  eventName: string
  currentStatus: string
  players: Player[]
  remainingFee: number
}

interface ActivePaymentEntryOptionsResponse {
  activePaymentEntryOptions: ActivePaymentEntryOption[]
}

interface User {
  _id: string
  name: string
  email: string
  contactNumber: string
  username: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Status {
  status: string
  date: string
  reason?: string
  by: User
}

interface Remark {
  remark: string
  date: string
  by: User
}

interface EntryItem {
  _id: string
  entryNumber: string
  entryKey: string
}

interface EntryListItem {
  isFullyPaid: boolean
  entry: EntryItem
}

interface PaymentData {
  _id: string
  payerName: string
  referenceNumber: string
  amount: number
  method: PaymentMethod
  paymentDate: string
  proofOfPaymentURL: string
  statuses: Status[]
  entryList: EntryListItem[]
  remarks: Remark[]
}

interface PaymentResponse {
  payment: PaymentData
}

interface CheckDuplicateReferenceResponse {
  checkDuplicateReference: PaymentData[]
}

interface EntryInput {
  entryNumber: string
  entryKey: string
  player1Name: string
  player2Name?: string | null
  eventName: string
  tournamentName: string
  club: string
  currentStatus: string
  isFullyPaid: boolean
  amount?: number
  isEarlyBird: boolean
}

interface CreatePaymentResponse {
  createPaymentByAdmin: {
    ok: boolean
    message: string
  }
}

interface UpdatePaymentResponse {
  updatePayment: {
    ok: boolean
    message: string
  }
}

interface CreatePaymentVariables {
  input: {
    payerName: string
    referenceNumber: string
    amount: number
    method: PaymentMethod
    proofOfPaymentURL: string
    paymentDate: Date
    entryList: Array<{
      entry: string[]
    }>
  }
}

interface UpdatePaymentVariables {
  input: {
    _id: string
    payerName: string
    referenceNumber: string
    amount: number
    method: PaymentMethod
    proofOfPaymentURL: string
    paymentDate: Date
    entryList: Array<{
      entry: string[]
    }>
  }
}

interface ExistingPayment {
  referenceNumber: string
  payerName: string
  entries: string
}

interface Props {
  _id?: string
  onClose?: () => void
  refetchPayments?: () => void
  existingPayments?: ExistingPayment[]
}

// New component: Duplicate Reference Dialog
interface DuplicateReferenceDialogProps {
  isOpen: boolean
  onClose: () => void
  onContinueAnyway: () => void
  referenceNumber: string
  existingPaymentData: PaymentData | null
}

const DuplicateReferenceDialog = ({
  isOpen,
  onClose,
  onContinueAnyway,
  referenceNumber,
  existingPaymentData,
}: DuplicateReferenceDialogProps) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md!">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Duplicate Reference Number Found
          </DialogTitle>
          <DialogDescription>
            A payment with the reference number "{referenceNumber}" already exists in the system.
            Are you sure you want to proceed with this duplicate reference?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {existingPaymentData ? (
            <>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-500">Payer Name</Label>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-medium">{existingPaymentData.payerName}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(existingPaymentData.payerName)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-500">Payment Amount</Label>
                    <p className="text-base font-bold text-green-600">
                      ₱{existingPaymentData.amount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-500">Payment Method</Label>
                    <Badge variant="outline" className="capitalize">
                      {existingPaymentData.method.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-500">Payment Date</Label>
                    <p className="text-base">{formatDate(existingPaymentData.paymentDate)}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Associated Entries</Label>
                  <ScrollArea className="h-40">
                    <div className="space-y-2 pr-2">
                      {existingPaymentData.entryList.map((entryItem, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{entryItem.entry.entryNumber}</span>
                                {entryItem.isFullyPaid ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                    Fully Paid
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                    Partial
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">Entry Key: {entryItem.entry.entryKey}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Current Status</Label>
                  <div className="flex flex-wrap gap-2">
                    {existingPaymentData.statuses.slice(-1).map((status, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className={cn(
                          "capitalize",
                          status.status === "VERIFIED" && "bg-green-50 text-green-700 border-green-200",
                          status.status === "REJECTED" && "bg-red-50 text-red-700 border-red-200",
                          status.status === "PAYMENT_PENDING" && "bg-yellow-50 text-yellow-700 border-yellow-200",
                          status.status === "SENT" && "bg-blue-50 text-blue-700 border-blue-200",
                          status.status === "DUPLICATE" && "bg-red-50 text-red-700 border-red-200"
                        )}
                      >
                        {status.status.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-gray-600">Loading payment details...</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="cursor-pointer">Cancel</Button>
          </DialogClose>
          {/* <Button
            variant="outline"
            onClick={() => {
              onViewDetails?.()
              onClose()
            }}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button> */}
          <Button
            variant="default"
            onClick={() => {
              onContinueAnyway()
              onClose()
            }}
            className="bg-red-600 hover:bg-red-700 gap-2 cursor-pointer"
          >
            <AlertCircle className="h-4 w-4" />
            Continue Anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const FormDialog = (props: Props) => {
  const { _id } = props
  const isEditMode = !!_id

  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [selectedEntries, setSelectedEntries] = useState<EntryInput[]>([])
  const [entrySearch, setEntrySearch] = useState("")
  const [entriesPopoverOpen, setEntriesPopoverOpen] = useState(false)
  const popoverTriggerRef = useRef<HTMLButtonElement>(null)
  const [popoverWidth, setPopoverWidth] = useState<number | undefined>(undefined)
  const [activeTab, setActiveTab] = useState("payment-details")

  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [scannedTotal, setScannedTotal] = useState<string | null>(null)
  const [reference, setReference] = useState<string | null>(null)
  const [scannedText, setScannedText] = useState<string>("")
  const [confirmationNumber, setConfirmationNumber] = useState<string>("")
  const [amountLabel, setAmountLabel] = useState("Total")
  const [referenceLabel, setReferenceLabel] = useState("Reference No.")
  const [referenceLoading, setReferenceLoading] = useState(false)
  const [amountLoading, setAmountLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({
    payerName: '',
    amount: '',
    file: '',
    paymentMethod: '',
  })

  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)
  const [success, setSuccess] = useState(false)
  const [totalRequired, setTotalRequired] = useState(0)
  const [priceReminder, setPriceReminder] = useState<string | null>(null)
  const [existingPaymentData, setExistingPaymentData] = useState<PaymentData | null>(null)

  // New states for duplicate handling
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [duplicateReferenceNumber, setDuplicateReferenceNumber] = useState<string>("")
  const [duplicatePaymentData, setDuplicatePaymentData] = useState<PaymentData | null>(null)
  const [userConfirmedDuplicate, setUserConfirmedDuplicate] = useState(false)
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false)

  const { data: entriesData, loading: entriesLoading } = useQuery<ActivePaymentEntryOptionsResponse>(ACTIVE_PAYMENT_ENTRY_OPTIONS, {
    skip: !open,
    fetchPolicy: "network-only",
  })

  const { data: paymentData, loading: paymentLoading } = useQuery<PaymentResponse>(GET_PAYMENT, {
    variables: { _id: _id as string },
    skip: !_id || !open,
    fetchPolicy: "network-only",
  })

  const { data: duplicatePaymentQueryData, loading: duplicatePaymentLoading } = useQuery<CheckDuplicateReferenceResponse>(
    CHECK_DUPLICATE_REFERENCE,
    {
      variables: { referenceNumber: duplicateReferenceNumber },
      skip: !duplicateReferenceNumber || !showDuplicateDialog,
      fetchPolicy: "network-only",
    }
  )

  const [createPayment, { loading: createLoading }] = useMutation<CreatePaymentResponse, CreatePaymentVariables>(CREATE_PAYMENT)
  const [updatePayment, { loading: updateLoading }] = useMutation<UpdatePaymentResponse, UpdatePaymentVariables>(UPDATE_PAYMENT)

  const isLoading = isPending || entriesLoading || paymentLoading || createLoading || updateLoading

  useEffect(() => {
    if (entriesPopoverOpen && popoverTriggerRef.current) {
      const width = popoverTriggerRef.current.offsetWidth
      setPopoverWidth(width)
    }
  }, [entriesPopoverOpen])

  useEffect(() => {
    if (paymentData?.payment && open && isEditMode) {
      const payment = paymentData.payment
      setExistingPaymentData(payment)

      form.setFieldValue("payerName", payment.payerName)
      form.setFieldValue("referenceNumber", payment.referenceNumber)
      form.setFieldValue("amount", payment.amount)
      form.setFieldValue("method", payment.method as PaymentMethod)
      form.setFieldValue("paymentDate", new Date(payment.paymentDate))

      if (payment.proofOfPaymentURL) {
        form.setFieldValue("proofOfPaymentURL", payment.proofOfPaymentURL)
        setPreview(payment.proofOfPaymentURL)
      }

      if (payment.entryList && payment.entryList.length > 0) {
        const existingEntries: EntryInput[] = []

        payment.entryList.forEach(entryItem => {
          const entry = entryItem.entry
          if (entry && entriesData?.activePaymentEntryOptions) {
            const entryDetail = entriesData.activePaymentEntryOptions.find(
              e => e.entryNumber === entry.entryNumber
            )

            if (entryDetail) {
              existingEntries.push({
                entryNumber: entry.entryNumber,
                entryKey: entry.entryKey || '',
                player1Name: entryDetail.players[0]
                  ? `${entryDetail.players[0].firstName} ${entryDetail.players[0].lastName}`
                  : 'Unknown Player',
                player2Name: entryDetail.players[1]
                  ? `${entryDetail.players[1].firstName} ${entryDetail.players[1].lastName}`
                  : null,
                eventName: entryDetail.eventName || '',
                tournamentName: entryDetail.eventName?.split(' - ')[0] || entryDetail.eventName || '',
                club: '',
                currentStatus: entryDetail.currentStatus || '',
                isEarlyBird: false,
                isFullyPaid: entryItem.isFullyPaid || false,
                amount: entryDetail.remainingFee || 0
              })
            } else {
              existingEntries.push({
                entryNumber: entry.entryNumber,
                entryKey: entry.entryKey || '',
                player1Name: 'Unknown Player',
                player2Name: null,
                eventName: '',
                tournamentName: '',
                club: '',
                currentStatus: '',
                isEarlyBird: false,
                isFullyPaid: entryItem.isFullyPaid || false,
                amount: 0
              })
            }
          }
        })

        setSelectedEntries(existingEntries)
      }
    }
  }, [paymentData, open, entriesData, isEditMode])

  useEffect(() => {
    if (duplicatePaymentQueryData?.checkDuplicateReference && duplicatePaymentQueryData.checkDuplicateReference.length > 0) {
      // Get the first payment from the array (most recent one)
      setDuplicatePaymentData(duplicatePaymentQueryData.checkDuplicateReference[0])
    }
  }, [duplicatePaymentQueryData])

  const form = useForm({
    defaultValues: {
      payerName: "",
      referenceNumber: "",
      amount: 0,
      method: PaymentMethod.BANK_TRANSFER as PaymentMethod,
      proofOfPaymentURL: "",
      paymentDate: new Date(),
    },
  })

  const checkForDuplicateReference = (referenceNumber: string): boolean => {
    if (!referenceNumber || isEditMode) return false

    const normalizedRef = referenceNumber.trim().toUpperCase()

    const isDuplicate = props.existingPayments?.some(payment =>
      payment.referenceNumber.trim().toUpperCase() === normalizedRef
    )

    return isDuplicate || false
  }

  const getDuplicatePaymentInfo = (referenceNumber: string) => {
    const normalizedRef = referenceNumber.trim().toUpperCase()
    return props.existingPayments?.find(payment =>
      payment.referenceNumber.trim().toUpperCase() === normalizedRef
    )
  }

  const onClose = () => {
    setOpen(false)
    setSelectedEntries([])
    setEntrySearch("")
    setEntriesPopoverOpen(false)
    setActiveTab("payment-details")
    setPreview(null)
    setFile(null)
    setIsUploading(false)
    setLoading(false)
    setScannedTotal(null)
    setReference(null)
    setScannedText("")
    setConfirmationNumber("")
    setSuccess(false)
    setFieldErrors({
      payerName: '',
      amount: '',
      file: '',
      paymentMethod: '',
    })
    setExistingPaymentData(null)
    setShowConfirmationDialog(false)
    setShowDuplicateDialog(false)
    setDuplicateReferenceNumber("")
    setDuplicatePaymentData(null)
    setUserConfirmedDuplicate(false)
    setIsCheckingDuplicate(false)
    props.onClose?.()
    form.reset()
  }

  const handleOpenDuplicateDialog = async (referenceNumber: string) => {
    setDuplicateReferenceNumber(referenceNumber)
    setIsCheckingDuplicate(true)

    try {
      // Wait for the duplicate check to complete
      await new Promise(resolve => setTimeout(resolve, 100))
      setShowDuplicateDialog(true)
    } finally {
      setIsCheckingDuplicate(false)
    }
  }

  const handleContinueAnyway = () => {
    setUserConfirmedDuplicate(true)
    // Show confirmation dialog after user confirms they want to continue with duplicate
    setShowConfirmationDialog(true)
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      const fileExt = file.name.split('.').pop() || '';
      const fileName = `payment-${Date.now()}.${fileExt}`;
      formData.append("file", file, fileName);

      const response = await fetch("/api/upload/payment", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload Failed");
      }

      const data = await response.json();
      toast.success("File uploaded successfully!");
      return data.url;
    } catch (error) {
      console.error("Error Uploading file to payments folder:", error);
      toast.error("Error uploading file. Please try again.");
      return null;
    } finally {
      setIsUploading(false);
    }
  }

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

  const SuccessModal = () => (
    <motion.div
      className="fixed inset-0 bg-white/95 flex flex-col items-center justify-center z-[100]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
      <p className="text-green-600 font-bold text-lg mb-2">
        {isEditMode ? "Payment Updated!" : "Payment Submitted!"}
      </p>
      <p className="text-gray-600 text-sm mb-4 text-center">
        {isEditMode
          ? "Your payment has been updated successfully."
          : "Your payment has been recorded successfully."}
      </p>
    </motion.div>
  )

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (!uploadedFile) return

    setFile(uploadedFile)
    const fileError = validateFile(uploadedFile)
    setFieldErrors(prev => ({ ...prev, file: fileError }))

    const reader = new FileReader()
    reader.onload = async () => {
      const imageData = reader.result as string
      setPreview(imageData)
      setLoading(true)
      setReferenceLoading(true)
      setScannedTotal(null)
      setReference(null)
      setConfirmationNumber("")
      setScannedText("")

      try {
        const preprocessedData = await preprocessImage(imageData)

        const result = await Tesseract.recognize(preprocessedData, "eng", {
          logger: (m) => console.log(m),
        })

        const text = result.data.text
        setScannedText(text)

        const confirmationMatch = text.match(/confirmation[\s#:=-]*no\.?\s*([A-Z0-9-]{5,})/i)
        if (confirmationMatch) {
          setConfirmationNumber(confirmationMatch[1])
        } else {
          setConfirmationNumber("")
        }

        const traceMatch = text.match(/Trace no\.\s*([A-Z0-9-]+)/i)
        if (traceMatch) {
          setConfirmationNumber(traceMatch[1])
        }

        const landBankTransactionRefMatch = text.match(/Transaction Reference Number\s*([A-Z0-9\/]+)/i)
        if (landBankTransactionRefMatch) {
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

        let detectedAmount = ""
        if (bdoAmountMatch) {
          setAmountLabel("Paid Amount")
          detectedAmount = bdoAmountMatch[1]
        } else if (paidMatch) {
          setAmountLabel("Paid Amount")
          detectedAmount = paidMatch[1]
        } else if (transferMatch) {
          setAmountLabel("Transfer Amount")
          detectedAmount = transferMatch[1]
        } else if (totalMatch) {
          setAmountLabel("Total")
          detectedAmount = totalMatch[1]
        } else {
          setAmountLabel("Total")
          detectedAmount = ""
        }

        if (detectedAmount) {
          setScannedTotal(`₱${detectedAmount}`)
          form.setFieldValue("amount", parseFloat(detectedAmount.replace(/,/g, '')))
          setFieldErrors(prev => ({ ...prev, amount: '' }))
        } else {
          setScannedTotal("Not found")
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

        if (refNumber !== "Not found") {
          form.setFieldValue("referenceNumber", refNumber)
        }

      } catch (err) {
        setScannedText("Error: Could not read text.")
      } finally {
        setLoading(false)
        setReferenceLoading(false)
      }
    }

    reader.readAsDataURL(uploadedFile)
  }

  const handleRemoveFile = () => {
    setFile(null)
    setPreview(null)
    setReferenceLoading(false)
    setScannedTotal(null)
    setReference(null)
    setFieldErrors(prev => ({ ...prev, file: isEditMode && existingPaymentData?.proofOfPaymentURL ? '' : 'Proof of payment is required' }))
    form.setFieldValue("proofOfPaymentURL", "")
  }

  const validateFile = (file: File): string => {
    if (!file) {
      if (isEditMode && existingPaymentData?.proofOfPaymentURL) {
        return ''
      }
      return 'Proof of payment is required'
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, JPG) or PDF'
    }
    if (file.size > 10 * 1024 * 1024) {
      return 'File size must be less than 10MB'
    }
    return ''
  }

  const validatePayerName = (name: string): string => {
    if (!name.trim()) return 'Payer name is required'
    if (name.trim().length < 2) return 'Payer name must be at least 2 characters'
    return ''
  }

  const validateAmount = (amount: string): string => {
    if (!amount) return 'Amount is required'
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) return 'Amount must be greater than 0'
    return ''
  }

  const validatePaymentMethod = (method: string): string => {
    if (!method) return 'Payment method is required'
    return ''
  }

  const handleEntrySelect = (entry: ActivePaymentEntryOption) => {
    console.log("Selecting entry:", entry.entryNumber)

    if (!selectedEntries.find(e => e.entryNumber === entry.entryNumber)) {
      const entryKey = entry.entryNumber.includes('_')
        ? entry.entryNumber.split('_')[1]
        : '';

      const newEntry: EntryInput = {
        entryNumber: entry.entryNumber,
        entryKey: entryKey,
        player1Name: entry.players[0] ? `${entry.players[0].firstName} ${entry.players[0].lastName}` : 'Unknown Player',
        player2Name: entry.players[1] ? `${entry.players[1].firstName} ${entry.players[1].lastName}` : null,
        eventName: entry.eventName,
        tournamentName: entry.eventName.split(' - ')[0] || entry.eventName,
        club: '',
        currentStatus: entry.currentStatus,
        isEarlyBird: false,
        isFullyPaid: false,
        amount: entry.remainingFee
      };

      console.log("New entry object:", newEntry)

      setSelectedEntries([...selectedEntries, newEntry]);
    }
    setEntrySearch("");
    setEntriesPopoverOpen(false);
  }

  useEffect(() => {
    const calculateTotal = () => {
      let total = 0
      selectedEntries.forEach(entry => {
        if (entry.amount) {
          total += entry.amount
        }
      })
      setTotalRequired(total)

      const currentAmount = form.getFieldValue("amount") || 0

      if (currentAmount === 0 || total === 0) {
        setPriceReminder(null)
      } else if (currentAmount >= total) {
        setPriceReminder(`✅ Payment amount is enough for selected entries.`)
      } else {
        const diff = total - currentAmount
        setPriceReminder(`⚠️ Payment amount may not be enough for all selected entries.`)
      }
    }

    calculateTotal()
  }, [selectedEntries, form.getFieldValue("amount")])

  const handleSubmitPayment = async () => {
    console.log("Starting payment submission...")

    const payerName = form.getFieldValue("payerName")
    const amount = form.getFieldValue("amount")
    const method = form.getFieldValue("method")
    const paymentDate = form.getFieldValue("paymentDate")
    const referenceNumber = form.getFieldValue("referenceNumber")
    let proofOfPaymentURL = form.getFieldValue("proofOfPaymentURL")

    console.log("Form values:", { payerName, amount, method, paymentDate, referenceNumber, proofOfPaymentURL })
    console.log("Selected entries:", selectedEntries)
    console.log("File:", file)
    console.log("Is edit mode:", isEditMode)

    if (!payerName?.trim()) {
      toast.error("Payer name is required")
      setActiveTab("payment-details")
      return
    }

    if (!amount || amount <= 0) {
      toast.error("Amount must be greater than 0")
      setActiveTab("payment-reference")
      return
    }

    if (!method) {
      toast.error("Payment method is required")
      setActiveTab("payment-details")
      return
    }

    if (!paymentDate) {
      toast.error("Payment date is required")
      setActiveTab("payment-details")
      return
    }

    if (selectedEntries.length === 0) {
      toast.error("At least one entry must be selected")
      setActiveTab("payment-details")
      return
    }

    try {
      setIsUploading(true)

      if (!proofOfPaymentURL && file) {
        console.log("Uploading file...")
        const uploadedUrl = await uploadFile(file)
        if (!uploadedUrl) {
          toast.error("Failed to upload receipt image. Please try again.")
          setIsUploading(false)
          return
        }
        proofOfPaymentURL = uploadedUrl
        console.log("File uploaded, URL:", proofOfPaymentURL)
      }

      if (!proofOfPaymentURL && isEditMode && existingPaymentData?.proofOfPaymentURL) {
        proofOfPaymentURL = existingPaymentData.proofOfPaymentURL
        console.log("Using existing URL:", proofOfPaymentURL)
      }

      if (!isEditMode && !proofOfPaymentURL) {
        toast.error("Please upload proof of payment")
        setActiveTab("payment-reference")
        setIsUploading(false)
        return
      }

      const entryList = selectedEntries.map(entry => ({
        entry: [entry.entryNumber],
        isFullyPaid: false
      }))

      console.log("Entry list to send (backend will calculate distribution):", entryList)
      const finalReferenceNumber = reference && reference !== "Not found"
        ? reference
        : confirmationNumber || referenceNumber || `ref_${Date.now()}`

      console.log("Submitting payment with data:", {
        payerName,
        referenceNumber: finalReferenceNumber,
        amount,
        method,
        proofOfPaymentURL: proofOfPaymentURL || '',
        paymentDate,
        entryList
      })

      startTransition(async () => {
        try {
          if (isEditMode && _id) {
            const response = await updatePayment({
              variables: {
                input: {
                  _id,
                  payerName,
                  referenceNumber: finalReferenceNumber,
                  amount,
                  method,
                  proofOfPaymentURL: proofOfPaymentURL || '',
                  paymentDate,
                  entryList,
                },
              },
            })

            console.log("Update response:", response)

            if (response.data?.updatePayment?.ok) {
              setSuccess(true)
              toast.success("Payment updated successfully!")
              setTimeout(() => {
                onClose()
                props.refetchPayments?.()
              }, 2000)
            } else {
              throw new Error(response.data?.updatePayment?.message || "Update failed")
            }
          } else {
            const response = await createPayment({
              variables: {
                input: {
                  payerName,
                  referenceNumber: finalReferenceNumber,
                  amount,
                  method,
                  proofOfPaymentURL: proofOfPaymentURL || '',
                  paymentDate,
                  entryList,
                },
              },
            })

            console.log("Create response:", response)

            if (response.data?.createPaymentByAdmin?.ok) {
              setSuccess(true)
              toast.success("Payment created successfully!")
              setTimeout(() => {
                onClose()
                props.refetchPayments?.()
              }, 2000)
            } else {
              throw new Error(response.data?.createPaymentByAdmin?.message || "Creation failed")
            }
          }
        } catch (error: any) {
          console.error("Payment submission error:", error)
          toast.error(error.message || "An error occurred while processing the payment")
        }
      })
    } catch (err: any) {
      console.error('Error in handleSubmitPayment:', err)
      toast.error(`Error: ${err.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted - handleFormSubmit called")
    console.log("Selected entries count:", selectedEntries.length)
    console.log("Selected entries:", selectedEntries)

    // Basic validation
    const payerName = form.getFieldValue("payerName")?.toString().trim()
    const amount = form.getFieldValue("amount")
    const method = form.getFieldValue("method")?.toString().trim()
    const paymentDate = form.getFieldValue("paymentDate")

    if (!payerName) {
      toast.error("Payer name is required")
      setActiveTab("payment-details")
      return
    }

    if (!amount || amount <= 0) {
      toast.error("Amount must be greater than 0")
      setActiveTab("payment-reference")
      return
    }

    if (!method) {
      toast.error("Payment method is required")
      setActiveTab("payment-details")
      return
    }

    if (!paymentDate) {
      toast.error("Payment date is required")
      setActiveTab("payment-details")
      return
    }

    if (selectedEntries.length === 0) {
      toast.error("At least one entry must be selected")
      setActiveTab("payment-details")
      return
    }

    // Check for duplicates before showing confirmation dialog
    const currentRef = form.getFieldValue("referenceNumber")?.toString().trim()
    console.log("Current reference:", currentRef)

    if (!isEditMode && currentRef) {
      // Check for duplicates first
      if (checkForDuplicateReference(currentRef)) {
        // Show duplicate dialog first
        await handleOpenDuplicateDialog(currentRef)
      } else {
        // No duplicate, proceed directly to confirmation
        console.log("No duplicate found, showing confirmation dialog")
        setShowConfirmationDialog(true)
      }
    } else {
      // No reference number or edit mode, proceed directly to confirmation
      console.log("Form submitted, showing confirmation dialog")
      setShowConfirmationDialog(true)
    }
  }

  const handleConfirmPayment = async () => {
    console.log("Confirming payment...")
    console.log("Selected entries before confirm:", selectedEntries)

    setShowConfirmationDialog(false)
    await handleSubmitPayment()
  }

  // const SuccessModal = () => (
  //   <motion.div
  //     className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center rounded-xl z-50"
  //     initial={{ opacity: 0 }}
  //     animate={{ opacity: 1 }}
  //     exit={{ opacity: 0 }}
  //   >
  //     <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
  //     <p className="text-green-600 font-bold text-lg mb-2">
  //       {isEditMode ? "Payment Updated!" : "Payment Submitted!"}
  //     </p>
  //     <p className="text-gray-600 text-sm mb-4 text-center">
  //       {isEditMode
  //         ? "Your payment has been updated successfully."
  //         : "Your payment has been recorded successfully."}
  //     </p>
  //   </motion.div>
  // )

  const ConfirmationDialog = () => {
    const totalAmount = form.getFieldValue("amount") || 0

    return (
      <motion.div
        className="fixed inset-0 bg-black/20 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-xl shadow-xl max-w-xl! mx-4 p-6"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {isEditMode ? "Confirm Payment Update" : "Confirm Payment Submission"}
            </h3>
            <p className="text-gray-600 text-sm">
              {isEditMode
                ? "Please review your updated payment details before submitting:"
                : "Please review your payment details before submitting:"}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">Payment Method:</div>
                <div className="text-base font-bold text-purple-600">
                  {form.getFieldValue("method").replace("_", " ")}
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">Entries:</div>
                <div className="text-base font-bold text-blue-600">
                  {selectedEntries.length} entries
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">Payer Name</div>
              <div className="text-base font-medium text-gray-800">
                {form.getFieldValue("payerName").trim()}
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700 block mb-2">
                Selected Entries:
              </span>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedEntries.map((entry, index) => (
                  <div key={index} className="flex justify-between items-center text-xs p-2 bg-white rounded border">
                    <div>
                      <span className="font-medium">Entry {index + 1}:</span>
                      <span className="text-gray-600 ml-2">
                        {entry.entryNumber}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">
                        ₱{(entry.amount || 0).toFixed(2)}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {entry.player1Name}
                        {entry.player2Name ? `, ${entry.player2Name}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-700">
                <div className="font-medium mb-1">Note:</div>
                <div className="text-xs">
                  Payment will be distributed across entries based on their current pending amounts.
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-sm font-bold text-green-700">Payment Amount </span>
              <span className="text-lg font-bold text-green-700">
                ₱{totalAmount.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowConfirmationDialog(false)}
              className="flex-1 bg-gray-300 text-gray-700 hover:bg-gray-400"
              disabled={isUploading || isPending || isCheckingDuplicate}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPayment}
              className="flex-1 bg-green-600 text-white hover:bg-green-700"
              disabled={isUploading || isPending || isCheckingDuplicate}
            >
              {isUploading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </div>
              ) : isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isEditMode ? "Updating..." : "Submitting..."}</span>
                </div>
              ) : (
                isEditMode ? "Update Payment" : "Confirm Payment"
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    )
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
      case "SENT":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "DUPLICATE":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSelectedEntriesText = () => {
    if (selectedEntries.length === 0) {
      return "Select entries..."
    }
    if (selectedEntries.length === 1) {
      return `${selectedEntries[0].entryNumber} (${selectedEntries[0].player1Name})`
    }
    return `${selectedEntries.length} entries selected`
  }

  const handleRemoveEntry = (entryNumber: string) => {
    setSelectedEntries(selectedEntries.filter(e => e.entryNumber !== entryNumber))
  }

  const filteredEntries = entriesData?.activePaymentEntryOptions?.filter(entry => {
    if (!entrySearch) return true;

    const searchLower = entrySearch.toLowerCase();
    return (
      entry.entryNumber.toLowerCase().includes(searchLower) ||
      entry.eventName.toLowerCase().includes(searchLower) ||
      entry.players.some(player =>
        player.firstName.toLowerCase().includes(searchLower) ||
        player.lastName.toLowerCase().includes(searchLower) ||
        `${player.firstName} ${player.lastName}`.toLowerCase().includes(searchLower)
      )
    );
  }) || [];

  const RequiredLabel = ({ htmlFor, children }: { htmlFor: string; children: string }) => (
    <div className="flex items-center gap-1">
      <FieldLabel htmlFor={htmlFor}>{children}</FieldLabel>
      <span className="text-red-500">*</span>
    </div>
  )

  const isSubmitDisabled = () => {
    const payerName = form.getFieldValue("payerName")?.toString().trim()
    const amount = form.getFieldValue("amount")
    const method = form.getFieldValue("method")?.toString().trim()

    // Basic validation
    if (selectedEntries.length === 0) return true
    if (!payerName) return true
    if (!amount || amount <= 0) return true
    if (!method) return true

    return false
  }

  return (
    <>
      <Dialog modal open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {isEditMode ? (
            <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs w-full justify-start gap-2">
              <Edit className="size-3" />
              Edit
            </Button>
          ) : (
            <Button variant="outline-success">
              <CirclePlus className="size-3.5" />
              Add Payment
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
              {isEditMode ? "Edit Payment" : "Create Payment"}
            </DialogTitle>
            <DialogDescription className="space-y-2">
              {isEditMode
                ? "Update payment details for tournament entries"
                : "Record a new payment for tournament entries"}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="payment-details">Payment Details</TabsTrigger>
              <TabsTrigger value="payment-reference">Upload Receipt</TabsTrigger>
            </TabsList>

            <form
              className="space-y-4 mb-4"
              id="payment-form"
              onSubmit={handleFormSubmit}
            >
              <div className="min-h-[580px] max-h-[60vh] overflow-y-auto pr-2">
                <TabsContent value="payment-details" className="space-y-4 mt-4">
                  <FieldSet>
                    <form.Field
                      name="payerName"
                      children={(field) => {
                        const isInvalid = fieldErrors.payerName
                        return (
                          <Field data-invalid={!!isInvalid}>
                            <RequiredLabel htmlFor={field.name}>Payer Name</RequiredLabel>
                            <Input
                              placeholder="Enter payer's full name"
                              disabled={isLoading}
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => {
                                field.handleChange(e.target.value)
                                const error = validatePayerName(e.target.value)
                                setFieldErrors(prev => ({ ...prev, payerName: error }))
                              }}
                              aria-invalid={!!isInvalid}
                            />
                          </Field>
                        )
                      }}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <form.Field
                        name="method"
                        children={(field) => {
                          const isInvalid = fieldErrors.paymentMethod
                          return (
                            <Field data-invalid={isInvalid}>
                              <RequiredLabel htmlFor={field.name}>Payment Method</RequiredLabel>
                              <Select
                                value={field.state.value}
                                onValueChange={(value: PaymentMethod) => {
                                  field.handleChange(value)
                                  const error = validatePaymentMethod(value)
                                  setFieldErrors(prev => ({ ...prev, paymentMethod: error }))
                                }}
                                disabled={isLoading}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.values(PaymentMethod).map((method) => (
                                    <SelectItem key={method} value={method}>
                                      {method.replace("_", " ")}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </Field>
                          )
                        }}
                      />

                      <form.Field
                        name="paymentDate"
                        children={(field) => {
                          const isInvalid = !field.state.value
                          return (
                            <Field data-invalid={isInvalid}>
                              <RequiredLabel htmlFor={field.name}>Payment Date</RequiredLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !field.state.value && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.state.value ? (
                                      format(field.state.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={field.state.value}
                                    onSelect={(date) => date && field.handleChange(date)}
                                    initialFocus
                                    captionLayout="dropdown"
                                  />
                                </PopoverContent>
                              </Popover>
                            </Field>
                          )
                        }}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-1">
                        <Label className="text-sm font-medium">Select Entries</Label>
                        <span className="text-red-500">*</span>
                      </div>

                      <div className="space-y-3">
                        <Popover open={entriesPopoverOpen} onOpenChange={setEntriesPopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              ref={popoverTriggerRef}
                              variant="outline"
                              role="combobox"
                              aria-expanded={entriesPopoverOpen}
                              className="w-full justify-between font-normal"
                              type="button"
                              disabled={isLoading}
                            >
                              <span className="truncate text-left">
                                {getSelectedEntriesText()}
                              </span>
                              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="p-0"
                            align="start"
                            style={{ width: popoverWidth ? `${popoverWidth}px` : '100%' }}
                          >
                            <div className="p-2 border-b">
                              <Input
                                type="text"
                                placeholder="Search entries..."
                                value={entrySearch}
                                onChange={(e) => setEntrySearch(e.target.value)}
                                className="w-full text-sm"
                                autoFocus
                              />
                            </div>
                            <ScrollArea className="h-60">
                              <div className="p-1">
                                {entriesLoading ? (
                                  <div className="py-8 text-center text-sm text-muted-foreground">
                                    Loading entries...
                                  </div>
                                ) : filteredEntries.length === 0 ? (
                                  <div className="py-8 text-center text-sm text-muted-foreground">
                                    {entrySearch ? "No entries found" : "No entries available"}
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    {filteredEntries.map((entry) => {
                                      const isSelected = selectedEntries.some(e => e.entryNumber === entry.entryNumber)
                                      return (
                                        <button
                                          key={entry.entryNumber}
                                          type="button"
                                          onClick={() => handleEntrySelect(entry)}
                                          className={cn(
                                            "w-full text-left p-2 rounded hover:bg-gray-50 transition-colors flex items-start gap-2",
                                            isSelected && "bg-green-50",
                                          )}
                                        >
                                          {isSelected ? (
                                            <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                          ) : (
                                            <div className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                              <span className="font-medium text-sm truncate">
                                                {entry.entryNumber}
                                              </span>
                                              <Badge
                                                variant="outline"
                                                className={cn("text-xs flex-shrink-0", getStatusColor(entry.currentStatus))}
                                              >
                                                {entry.currentStatus.replace("_", " ")}
                                              </Badge>
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                              <div className="truncate">
                                                <span className="font-medium">Players: </span>
                                                <span>
                                                  {entry.players.map(player =>
                                                    `${player.firstName} ${player.lastName}`).join(', ')}
                                                </span>
                                              </div>
                                              <div className="truncate">
                                                <span className="font-medium">Event: </span>
                                                <span>{entry.eventName}</span>
                                              </div>
                                              <div className="truncate">
                                                <span className="font-medium">Remaining Fee: </span>
                                                <span className="font-bold text-green-600">
                                                  ₱{entry.remainingFee.toFixed(2)}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        </button>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                            {filteredEntries.length > 0 && entriesData?.activePaymentEntryOptions && (
                              <div className="p-2 border-t text-xs text-muted-foreground">
                                Showing {filteredEntries.length} of {entriesData.activePaymentEntryOptions.length} entries
                              </div>
                            )}
                          </PopoverContent>
                        </Popover>

                        {selectedEntries.length > 0 && (
                          <div className="space-y-2">
                            <Separator />
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">
                                Selected Entries ({selectedEntries.length})
                              </Label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedEntries([])}
                                disabled={isLoading}
                              >
                                Clear All
                              </Button>
                            </div>

                            <ScrollArea className="h-40">
                              <div className="space-y-2 pr-2">
                                {selectedEntries.map((entry, index) => (
                                  <div
                                    key={entry.entryNumber}
                                    className="p-3 border rounded-lg space-y-2"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-sm">
                                            {entry.entryNumber}
                                          </span>
                                          <Badge
                                            variant="outline"
                                            className={cn("text-xs", getStatusColor(entry.currentStatus))}
                                          >
                                            {entry.currentStatus.replace("_", " ")}
                                          </Badge>
                                          {entry.amount && entry.amount > 0 && (
                                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                              ₱{entry.amount.toFixed(2)}
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                          <div><strong>Players:</strong> {entry.player1Name}{entry.player2Name ? `, ${entry.player2Name}` : ''}</div>
                                          <div><strong>Event:</strong> {entry.eventName}</div>
                                          <div><strong>Tournament:</strong> {entry.tournamentName}</div>
                                          {entry.club && <div><strong>Club:</strong> {entry.club}</div>}
                                          {entry.isEarlyBird && <div><strong>Early Bird:</strong> {entry.isEarlyBird ? 'Yes' : 'No'}</div>}
                                        </div>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveEntry(entry.entryNumber)}
                                        className="h-8 w-8 p-0"
                                        disabled={isLoading}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        )}
                      </div>
                    </div>
                  </FieldSet>
                </TabsContent>

                <TabsContent value="payment-reference" className="space-y-4 mt-4">
                  <FieldSet>
                    <div className="grid grid-cols-2 gap-4">
                      <form.Field
                        name="amount"
                        children={(field) => {
                          const isInvalid = fieldErrors.amount
                          return (
                            <Field data-invalid={isInvalid}>
                              <RequiredLabel htmlFor={field.name}>Amount</RequiredLabel>
                              <div className="space-y-2">
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">₱</span>
                                  </div>
                                  <Input
                                    type="number"
                                    placeholder="0.00"
                                    disabled={isLoading}
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => {
                                      field.handleChange(Number(e.target.value))
                                      const error = validateAmount(e.target.value)
                                      setFieldErrors(prev => ({ ...prev, amount: error }))
                                    }}
                                    aria-invalid={!!isInvalid}
                                    className="pl-7"
                                  />
                                </div>
                                {scannedTotal && (
                                  <p className="text-xs text-green-600">
                                    {scannedTotal === "Not found"
                                      ? "No amount detected in receipt"
                                      : `Scanned amount: ${scannedTotal}`}
                                  </p>
                                )}
                              </div>
                            </Field>
                          )
                        }}
                      />

                      <form.Field
                        name="referenceNumber"
                        children={(field) => {
                          const inputValue =
                            (reference && reference !== "Not found") ? reference :
                              confirmationNumber || field.state.value;

                          const currentRef = inputValue

                          return (
                            <Field>
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
                                    <Input
                                      placeholder="e.g., Bank reference, GCash reference"
                                      disabled={isLoading}
                                      id={field.name}
                                      name={field.name}
                                      value={inputValue}
                                      onBlur={field.handleBlur}
                                      onChange={(e) => {
                                        const value = e.target.value
                                        field.handleChange(value);
                                        if (e.target.value !== reference && e.target.value !== confirmationNumber) {
                                          setReference(null);
                                          setConfirmationNumber("");
                                        }
                                      }}
                                    />

                                    {(reference && reference !== "Not found") && (
                                      <p className="text-xs text-green-600">
                                        ✓ Scanned reference auto-filled
                                      </p>
                                    )}
                                    {confirmationNumber && !reference && (
                                      <p className="text-xs text-yellow-600">
                                        ⚠️ Using confirmation/trace number
                                      </p>
                                    )}
                                    {(!reference || reference === "Not found") && !confirmationNumber && file && (
                                      <p className="text-xs text-gray-500">
                                        No reference detected in receipt
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </Field>
                          )
                        }}
                      />
                    </div>

                    <div className="border-2 border-dashed border-green-300 rounded-xl p-4 bg-green-50 flex flex-col items-center">
                      <div className="w-full text-left mb-3">
                        <div className="text-green-800 font-bold text-sm mb-1">
                          Upload Proof of Payment <span className="text-red-500">*</span>
                        </div>
                        <p className="text-gray-600 text-xs">
                          Upload your GCash, Maya, or bank receipt to automatically scan the amount and reference number.
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
                                {(file.size / 1024).toFixed(2)} KB
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

                      {isEditMode && existingPaymentData?.proofOfPaymentURL && !file && (
                        <div className="w-full mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Paperclip className="w-4 h-4 text-blue-500" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-blue-700">
                                Existing proof of payment is already uploaded
                              </p>
                              <p className="text-xs text-blue-500">
                                Upload a new file to replace the existing one
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="w-full flex justify-center mb-4">
                        {preview || existingPaymentData?.proofOfPaymentURL ? (
                          <div className="w-full max-w-[300px] relative">

                            {imageLoading && (
                              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border bg-gray-100">
                                <div className="animate-spin h-8 w-8 rounded-full border-2 border-gray-300 border-t-green-500" />
                              </div>
                            )}

                            <Image
                              src={preview || existingPaymentData?.proofOfPaymentURL || ''}
                              alt={preview ? "Uploaded receipt" : "Existing proof of payment"}
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

                      <label
                        htmlFor="proofUpload"
                        className={`cursor-pointer w-full flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl bg-white hover:bg-green-100 transition ${fieldErrors.file ? 'border-red-300 bg-red-50 hover:bg-red-100' : 'border-green-400 hover:bg-green-50'
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
                            <UploadIcon className={`w-6 h-6 mb-2 ${fieldErrors.file ? 'text-red-500' : 'text-green-600'}`} />
                            <span className={`font-medium text-sm ${fieldErrors.file ? 'text-red-700' : 'text-green-700'}`}>
                              {isEditMode ? "Upload New Receipt or Browse" : "Drag & Drop your receipt or Browse"}
                            </span>
                          </>
                        )}
                        <input
                          id="proofUpload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                          disabled={isUploading || loading}
                        />
                      </label>

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
                  </FieldSet>
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
              loading={isLoading || isUploading || isCheckingDuplicate}
              type="submit"
              form="payment-form"
              disabled={isSubmitDisabled() || isCheckingDuplicate}
            >
              {isEditMode ? "Update" : "Submit"}
            </Button>
          </DialogFooter>

          <AnimatePresence>
            {success && <SuccessModal />}
            {showConfirmationDialog && <ConfirmationDialog />}
            {(isUploading || loading) && <UploadingOverlay message={loading ? "Scanning receipt..." : "Uploading file..."} />}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      <DuplicateReferenceDialog
        isOpen={showDuplicateDialog}
        onClose={() => setShowDuplicateDialog(false)}
        onContinueAnyway={handleContinueAnyway}
        referenceNumber={duplicateReferenceNumber}
        existingPaymentData={duplicatePaymentData}
      />
    </>
  )
}

export default FormDialog
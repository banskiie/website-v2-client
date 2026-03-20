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
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react"
import { useForm } from "@tanstack/react-form"
import React, { useEffect, useState, useTransition, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  CirclePlus,
  Paperclip,
  XIcon,
  AlertCircle,
  UploadIcon,
  Loader2,
  XCircle,
  Copy,
} from "lucide-react"
import {
  Field,
  FieldLabel,
  FieldError,
  FieldSet,
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
import Image from "next/image"
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
import { ScrollArea } from "@/components/ui/scroll-area"

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
        entryNumber
        eventName
        currentStatus
        remainingFee
        players {
            firstName
            lastName
        }
        paymentInfo {
            totalPaid
            currentPendingAmount
            refundableAmount
            latestPayment {
                amount
                referenceNumber
                method
                date
            }
            payments {
                amount
                referenceNumber
                method
                date
            }
        }
    }
}`

const CHECK_DUPLICATE_REFERENCE = gql`
  query CheckDuplicateReferenceRefund($referenceNumber: String!) {
    checkDuplicateReferenceRefund(referenceNumber: $referenceNumber) {
      _id
      payerName
      referenceNumber
      amount
      method
      refundDate
      proofOfRefundURL
      entryList {
        _id
        entryNumber
      }
    }
  }
`

interface ExistingRefund {
  referenceNumber: string
  payerName: string
}

interface RefundData {
  _id: string
  payerName: string
  referenceNumber: string
  amount: number
  method: PaymentMethod
  refundDate: string
  proofOfRefundURL: string
  entryList: Array<{
    _id: string
    entryNumber: string
  }>
}

interface CheckDuplicateReferenceResponse {
  checkDuplicateReferenceRefund: RefundData[]
}

interface EntryWithPaymentInfo {
  entryNumber: string
  eventName: string
  currentStatus: string
  remainingFee: number
  players: Array<{ firstName: string; lastName: string }>
  paymentInfo: {
    totalPaid: number
    currentPendingAmount: number
    refundableAmount: number
    latestPayment?: {
      amount: number
      referenceNumber: string
      method: string
      date: string
    }
    payments?: Array<{
      amount: number
      referenceNumber: string
      method: string
      date: string
    }>
  }
}

type Props = {
  _id?: string
  onClose?: () => void
  existingRefunds?: ExistingRefund[]
}

// Duplicate Reference Dialog Component
interface DuplicateReferenceDialogProps {
  isOpen: boolean
  onClose: () => void
  onContinueAnyway: () => void
  referenceNumber: string
  existingRefundData: RefundData | null
}

const DuplicateReferenceDialog = ({
  isOpen,
  onClose,
  onContinueAnyway,
  referenceNumber,
  existingRefundData,
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
            A refund with the reference number "{referenceNumber}" already exists in the system.
            Are you sure you want to proceed with this duplicate reference?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {existingRefundData ? (
            <>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-500">Payer Name</Label>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-medium">{existingRefundData.payerName}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(existingRefundData.payerName)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-500">Refund Amount</Label>
                    <p className="text-base font-bold text-green-600">
                      ₱{existingRefundData.amount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-500">Payment Method</Label>
                    <Badge variant="outline" className="capitalize">
                      {existingRefundData.method.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-500">Refund Date</Label>
                    <p className="text-base">{formatDate(existingRefundData.refundDate)}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Associated Entries</Label>
                  <ScrollArea className="h-40">
                    <div className="space-y-2 pr-2">
                      {existingRefundData.entryList.map((entryItem, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{entryItem.entryNumber}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-gray-600">Loading refund details...</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="cursor-pointer">Cancel</Button>
          </DialogClose>
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

// NEW: Over Refund Error Dialog Component
interface OverRefundDialogProps {
  isOpen: boolean
  onClose: () => void
  totalRefundableAmount: number
  attemptedAmount: number
  excessByEntry?: Array<{
    entryNumber: string
    refundableAmount: number
    attemptedAmount?: number
  }>
}

const OverRefundDialog = ({
  isOpen,
  onClose,
  totalRefundableAmount,
  attemptedAmount,
  excessByEntry,
}: OverRefundDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md!">
        <DialogHeader>
          <DialogTitle className="flex items-center text-md gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Refund Amount Exceeds Available Amount
          </DialogTitle>
          <DialogDescription className="text-xs">
            The refund amount you're trying to process exceeds the total refundable amount for the selected entries.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Attempted Refund:</span>
              <span className="text-md font-bold text-red-600">
                ₱{attemptedAmount.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Maximum Refundable:</span>
              <span className="text-md font-bold text-green-600">
                ₱{totalRefundableAmount.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-red-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Excess Amount:</span>
                <span className="text-md font-bold text-orange-600">
                  ₱{totalRefundableAmount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
            </div>
          </div>

          {excessByEntry && excessByEntry.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Per Entry Breakdown:</Label>
                <ScrollArea className="max-h-40">
                  <div className="space-y-2">
                    {excessByEntry.map((entry, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded border text-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{entry.entryNumber}</span>
                          <span className="text-green-600 font-medium">
                            ₱{entry.refundableAmount.toLocaleString()}
                          </span>
                        </div>
                        {entry.attemptedAmount && entry.attemptedAmount > entry.refundableAmount && (
                          <div className="text-xs text-red-500 mt-1">
                            Attempted Paid: <span className="underline font-medium">₱{entry.attemptedAmount.toLocaleString()}</span> {" "}
                            (Exceeds by <span className="underline font-medium">₱{(entry.refundableAmount).toLocaleString()})</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Suggestion:</p>
            <p>Please Adjust the Refund Amount to not Exceed ₱{totalRefundableAmount.toLocaleString()} or Re-Check if the Entries Selected is Right.</p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="default" className="w-full cursor-pointer">
              Got it
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// UploadingOverlay component
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

  const { data, loading: fetchLoading }: any = useQuery(USER, {
    variables: { _id: props._id },
    skip: !open || !isUpdate,
    fetchPolicy: "no-cache",
  })
  const refund = data?.refund as IRefund
  const [submitForm] = useMutation(isUpdate ? UPDATE : CREATE)

  // Loading states
  const [isUploading, setIsUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [referenceLoading, setReferenceLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [uploadProgress, setUploadProgress] = useState(0)

  // States for duplicate handling
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [duplicateReferenceNumber, setDuplicateReferenceNumber] = useState<string>("")
  const [duplicateRefundData, setDuplicateRefundData] = useState<RefundData | null>(null)
  const [userConfirmedDuplicate, setUserConfirmedDuplicate] = useState(false)
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false)
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)
  const [success, setSuccess] = useState(false)

  // NEW: States for over refund validation
  const [showOverRefundDialog, setShowOverRefundDialog] = useState(false)
  const [overRefundData, setOverRefundData] = useState<{
    totalRefundableAmount: number
    attemptedAmount: number
    excessByEntry?: Array<{
      entryNumber: string
      refundableAmount: number
      attemptedAmount?: number
    }>
  } | null>(null)

  const isLoading = isPending || isUploading || (isUpdate && fetchLoading)
  const formLoading = isPending || isUploading

  const { data: entryOptionsData, loading: optionsLoading } = useQuery(
    ALL_ACTIVE_ENTRIES,
    {
      fetchPolicy: "no-cache",
    }
  )
  const [openFilteredEntries, setOpenFilteredEntries] = useState(false)
  const entryOptions = ((entryOptionsData as any)?.activeRefundEntryOptions || [])
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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
  const [scannedText, setScannedText] = useState<string>("")
  const [forceUpdate, setForceUpdate] = useState(0)
  const { data: duplicateRefundQueryData, loading: duplicateRefundLoading } = useQuery<CheckDuplicateReferenceResponse>(
    CHECK_DUPLICATE_REFERENCE,
    {
      variables: { referenceNumber: duplicateReferenceNumber },
      skip: !duplicateReferenceNumber || !showDuplicateDialog,
      fetchPolicy: "network-only",
    }
  )

  useEffect(() => {
    if (duplicateRefundQueryData?.checkDuplicateReferenceRefund &&
      duplicateRefundQueryData.checkDuplicateReferenceRefund.length > 0) {
      setDuplicateRefundData(duplicateRefundQueryData.checkDuplicateReferenceRefund[0])
    }
  }, [duplicateRefundQueryData])

  // Centralized duplicate check function
  const checkDuplicateReference = (referenceNumber: string): { isDuplicate: boolean; payerName?: string } => {
    if (!referenceNumber || isUpdate) return { isDuplicate: false };

    const normalizedRef = referenceNumber.trim().toUpperCase();
    const duplicate = props.existingRefunds?.find(refund =>
      refund.referenceNumber.trim().toUpperCase() === normalizedRef
    );

    return {
      isDuplicate: !!duplicate,
      payerName: duplicate?.payerName
    };
  }

  // Replace the validateRefundAmount function with this updated version:

  const validateRefundAmount = (
    refundAmount: number,
    selectedEntryNumbers: string[]
  ): { isValid: boolean; totalRefundable: number; excessByEntry?: Array<{ entryNumber: string; refundableAmount: number; attemptedAmount?: number }> } => {
    if (!entryOptions || selectedEntryNumbers.length === 0) {
      return { isValid: true, totalRefundable: 0 };
    }

    // Filter the selected entries with their payment info
    const selectedEntries = entryOptions.filter((entry: EntryWithPaymentInfo) =>
      selectedEntryNumbers.includes(entry.entryNumber)
    );

    // Calculate total refundable amount from all selected entries
    // Based on your entry data, we should calculate refundable amount differently
    let totalRefundable = 0;
    const excessByEntry: Array<{ entryNumber: string; refundableAmount: number; attemptedAmount?: number }> = [];

    selectedEntries.forEach((entry: EntryWithPaymentInfo) => {
      // IMPORTANT FIX: For entries that have already been partially refunded,
      // we need to calculate the remaining refundable amount differently

      // From your entry data:
      // - Total paid: ₱3200 (2500 + 700)
      // - Current pending amount after refund: ₱100 (positive means balance due, not refundable)
      // - Event price: ₱3000 (from INITIAL_FEE transaction)

      // The refundable amount should be: totalPaid - (eventPrice + currentExcess)
      // But in your case, since pendingAmount is positive (₱100), there's actually NO refundable amount
      // because the entry still owes money (₱100 balance due)

      let refundableAmount = 0;

      // If pendingAmount is positive (balance due), refundableAmount should be 0
      // If pendingAmount is negative (overpayment), refundableAmount is the absolute value
      if (entry.paymentInfo?.currentPendingAmount < 0) {
        // Overpayment case - can refund the overpaid amount
        refundableAmount = Math.abs(entry.paymentInfo.currentPendingAmount);
      } else if (entry.paymentInfo?.currentPendingAmount === 0) {
        refundableAmount = 0;
      } else {
        refundableAmount = 0;
      }

      const queryRefundableAmount = entry.paymentInfo?.refundableAmount || 0;

      // Log for debugging
      // console.log('Entry validation:', {
      //   entryNumber: entry.entryNumber,
      //   queryRefundableAmount,
      //   calculatedRefundableAmount: refundableAmount,
      //   currentPendingAmount: entry.paymentInfo?.currentPendingAmount,
      //   totalPaid: entry.paymentInfo?.totalPaid
      // });

      totalRefundable += refundableAmount;
      excessByEntry.push({
        entryNumber: entry.entryNumber,
        refundableAmount,
      });
    });

    // Check if refund amount exceeds total refundable
    const isValid = refundAmount <= totalRefundable;

    // For debugging/showing per-entry breakdown
    if (!isValid) {
      excessByEntry.forEach(entry => {
        entry.attemptedAmount = refundAmount;
      });
    }

    return {
      isValid,
      totalRefundable,
      excessByEntry: !isValid ? excessByEntry : undefined
    };
  }

  const handleOpenDuplicateDialog = async (referenceNumber: string) => {
    setDuplicateReferenceNumber(referenceNumber)
    setIsCheckingDuplicate(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 100))
      setShowDuplicateDialog(true)
    } finally {
      setIsCheckingDuplicate(false)
    }
  }

  const handleContinueAnyway = () => {
    setUserConfirmedDuplicate(true)
    setShowConfirmationDialog(true)
  }

  // File upload function
  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      const fileExt = file.name.split('.').pop() || '';
      const fileName = `refund-${Date.now()}.${fileExt}`;
      formData.append("file", file, fileName);

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

    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const imageData = reader.result as string

        const preprocessedData = await preprocessImage(imageData)

        const result = await Tesseract.recognize(preprocessedData, "eng", {
          logger: (m) => console.log(m),
        })

        const text = result.data.text
        setScannedText(text)

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
      onSubmit: ({ value }) => {
        try {
          if (!isUpdate && !userConfirmedDuplicate) {
            const { isDuplicate, payerName } = checkDuplicateReference(value.referenceNumber);
            if (isDuplicate) {
              throw new Error(`Reference number "${value.referenceNumber}" already exists for refund by "${payerName}".`);
            }
          }

          RefundSchema.parse(value);
        } catch (error: any) {
          console.error(error)
          if (error.message && error.message.includes("already exists")) {
            return {
              fields: {
                referenceNumber: error.message
              }
            };
          }
          else if (error.name === "ZodError") {
            const fieldErrors: Record<string, string> = {};
            error.errors.forEach((err: any) => {
              const path = err.path.join(".");
              fieldErrors[path] = err.message;
            });
            return { fields: fieldErrors };
          }
          throw error;
        }
      },
    },
    onSubmit: ({ value }) =>
      startTransition(async () => {
        try {
          const payload = value
          let proofOfRefundURL = value.proofOfRefundURL

          if (files.length > 0) {
            // console.log("Uploading file...")
            const uploadedUrl = await uploadFile(files[0])
            if (!uploadedUrl) {
              toast.error("Failed to upload receipt image. Please try again.")
              return
            }
            proofOfRefundURL = uploadedUrl
            // console.log("File uploaded, URL:", proofOfRefundURL)
          }

          if (!proofOfRefundURL && isUpdate && refund?.proofOfRefundURL) {
            proofOfRefundURL = refund.proofOfRefundURL
            // console.log("Using existing URL:", proofOfRefundURL)
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
            setSuccess(true)
            toast.success(isUpdate ? "Refund updated successfully!" : "Refund created successfully!")
            setTimeout(() => {
              onClose()
            }, 2000)
          }
        } catch (error: any) {
          console.error(error.errors)
          if (error.name == "CombinedGraphQLErrors") {
            const fieldErrors = error.errors[0].extensions.fields
            if (fieldErrors)
              fieldErrors.map(
                ({ path, message }: { path: string; message: string }) =>
                  (form as any).fieldInfo[path as any].instance?.setErrorMap(
                    {
                      onSubmit: { message },
                    }
                  )
              )
          }
        }
      }),
  })

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payerName = form.getFieldValue("payerName")?.toString().trim()
    const amount = form.getFieldValue("amount")
    const method = form.getFieldValue("method")?.toString().trim()
    const refundDate = form.getFieldValue("refundDate")
    const entryList = form.getFieldValue("entryList") || []
    const currentRef = form.getFieldValue("referenceNumber")?.toString().trim()

    if (!payerName) {
      toast.error("Payer name is required")
      setActiveTab("refund-details")
      return
    }

    if (!amount || amount <= 0) {
      toast.error("Amount must be greater than 0")
      setActiveTab("refund-reference")
      return
    }

    if (!method) {
      toast.error("Payment method is required")
      setActiveTab("refund-details")
      return
    }

    if (!refundDate) {
      toast.error("Refund date is required")
      setActiveTab("refund-details")
      return
    }

    if (entryList.length === 0) {
      toast.error("At least one entry must be selected")
      setActiveTab("refund-details")
      return
    }

    if (!currentRef) {
      toast.error("Reference number is required")
      setActiveTab("refund-reference")
      return
    }

    // NEW: Validate refund amount against total refundable
    const refundValidation = validateRefundAmount(amount, entryList);

    if (!refundValidation.isValid) {
      setOverRefundData({
        totalRefundableAmount: refundValidation.totalRefundable,
        attemptedAmount: amount,
        excessByEntry: refundValidation.excessByEntry
      });
      setShowOverRefundDialog(true);
      return; // Stop form submission
    }

    if (!isUpdate && currentRef) {
      const { isDuplicate } = checkDuplicateReference(currentRef)
      if (isDuplicate && !userConfirmedDuplicate) {
        await handleOpenDuplicateDialog(currentRef)
        return
      }
    }

    setShowConfirmationDialog(true)
  }

  const handleConfirmRefund = async () => {
    setShowConfirmationDialog(false)
    form.handleSubmit()
  }

  const onClose = () => {
    setOpen(false)
    props.onClose?.()
    form.reset()
    setFiles([])
    setPreview(null)
    setActiveTab("refund-details")
    setScannedAmount(null)
    setScannedReference(null)
    setIsUploading(false)
    setLoading(false)
    setReferenceLoading(false)
    setUploadProgress(0)
    setShowDuplicateDialog(false)
    setDuplicateReferenceNumber("")
    setDuplicateRefundData(null)
    setUserConfirmedDuplicate(false)
    setShowConfirmationDialog(false)
    setSuccess(false)
    // NEW: Reset over refund dialog state
    setShowOverRefundDialog(false)
    setOverRefundData(null)
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

  const RequiredLabel = ({ htmlFor, children }: { htmlFor: string; children: string }) => (
    <div className="flex items-center gap-1">
      <FieldLabel htmlFor={htmlFor}>{children}</FieldLabel>
      <span className="text-red-500">*</span>
    </div>
  )

  const handleRemoveFile = () => {
    setFiles([])
    setPreview(null)
    setReferenceLoading(false)
    setScannedAmount(null)
    setScannedReference(null)
    setLoading(false)
    form.setFieldValue("proofOfRefundURL", "")
  }

  // const isSubmitDisabled = () => {
  //   const payerName = form.getFieldValue("payerName")?.toString().trim()
  //   const amount = form.getFieldValue("amount")
  //   const method = form.getFieldValue("method")?.toString().trim()
  //   const entryList = form.getFieldValue("entryList") || []
  //   const referenceNumber = form.getFieldValue("referenceNumber")?.toString().trim()

  //   if (entryList.length === 0) return true
  //   if (!payerName) return true
  //   if (!amount || amount <= 0) return true
  //   if (!method) return true
  //   if (!referenceNumber) return true

  //   return false
  // }

  const [formValues, setFormValues] = useState({
    payerName: "",
    referenceNumber: "",
    amount: 0,
    method: "",
    entryList: [] as string[]
  })

  useEffect(() => {
    const initialValues = {
      payerName: form.getFieldValue("payerName") || "",
      referenceNumber: form.getFieldValue("referenceNumber") || "",
      amount: form.getFieldValue("amount") || 0,
      method: form.getFieldValue("method") || "",
      entryList: form.getFieldValue("entryList") || []
    }
    setFormValues(initialValues)

    const unsubscribe = form.store.subscribe(() => {
      const newValues = {
        payerName: form.getFieldValue("payerName") || "",
        referenceNumber: form.getFieldValue("referenceNumber") || "",
        amount: form.getFieldValue("amount") || 0,
        method: form.getFieldValue("method") || "",
        entryList: form.getFieldValue("entryList") || []
      }

      setFormValues(prev => {
        if (
          prev.payerName === newValues.payerName &&
          prev.referenceNumber === newValues.referenceNumber &&
          prev.amount === newValues.amount &&
          prev.method === newValues.method &&
          JSON.stringify(prev.entryList) === JSON.stringify(newValues.entryList)
        ) {
          return prev
        }
        return newValues
      })
    })

    return () => {
    if (typeof unsubscribe === "function") {
      unsubscribe()
    }
  }
  }, [form])

  const isSubmitDisabled = () => {
    const payerName = formValues.payerName?.toString().trim()
    const amount = formValues.amount
    const method = formValues.method?.toString().trim()
    const entryList = formValues.entryList || []
    const referenceNumber = formValues.referenceNumber?.toString().trim()

    // console.log('Form validation check:', {
    //   payerName,
    //   amount,
    //   method,
    //   entryList,
    //   referenceNumber,
    //   hasEntries: entryList.length > 0,
    //   hasPayerName: !!payerName,
    //   hasAmount: amount > 0,
    //   hasMethod: !!method,
    //   hasReference: !!referenceNumber
    // })

    if (entryList.length === 0) return true
    if (!payerName) return true
    if (!amount || amount <= 0) return true
    if (!method) return true
    if (!referenceNumber) return true

    return false
  }



  const ConfirmationDialog = () => {
    const totalAmount = form.getFieldValue("amount") || 0
    const entryList = form.getFieldValue("entryList") || []

    const totalRefundable = entryOptions
      .filter((e: EntryWithPaymentInfo) => entryList.includes(e.entryNumber))
      .reduce((sum: number, e: EntryWithPaymentInfo) => sum + (e.paymentInfo?.refundableAmount || 0), 0)

    return (
      <motion.div
        className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
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
              {isUpdate ? "Confirm Refund Update" : "Confirm Refund Submission"}
            </h3>
            <p className="text-gray-600 text-sm">
              {isUpdate
                ? "Please review your updated refund details before submitting:"
                : "Please review your refund details before submitting:"}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">Payment Method:</div>
                <div className="text-base font-bold text-purple-600 capitalize">
                  {form.getFieldValue("method").replace("_", " ")}
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">Entries:</div>
                <div className="text-base font-bold text-blue-600">
                  {entryList.length} entries
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
              <div className="text-sm font-medium text-gray-700 mb-1">Reference Number</div>
              <div className="text-base font-medium text-gray-800">
                {form.getFieldValue("referenceNumber").trim()}
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700 block mb-2">
                Selected Entries:
              </span>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {entryList.map((entryNumber: string) => {
                  const entry = entryOptions.find((e: any) => e.entryNumber === entryNumber)
                  return (
                    <div key={entryNumber} className="flex justify-between items-center text-xs p-2 bg-white rounded border">
                      <div>
                        <span className="font-medium">Entry:</span>
                        <span className="text-gray-600 ml-2">
                          {entryNumber}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-500 text-xs">
                          {entry?.players.map((p: any) => `${p.firstName} ${p.lastName}`).join(', ')}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-sm font-bold text-green-700">Refund Amount </span>
              <span className="text-lg font-bold text-green-700">
                ₱{totalAmount.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>

            {/* <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm font-bold text-blue-700">Total Refundable Amount </span>
              <span className="text-lg font-bold text-blue-700">
                ₱{totalRefundable.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div> */}
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
              onClick={handleConfirmRefund}
              className="flex-1 bg-green-600 cursor-pointer text-white hover:bg-green-700"
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
                  <span>{isUpdate ? "Updating..." : "Submitting..."}</span>
                </div>
              ) : (
                isUpdate ? "Update Refund" : "Confirm Refund"
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  const SuccessModal = () => (
    <motion.div
      className="fixed inset-0 bg-white/95 flex flex-col items-center justify-center z-[100]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Check className="w-16 h-16 text-green-600 mb-4" />
      <p className="text-green-600 font-bold text-lg mb-2">
        {isUpdate ? "Refund Updated!" : "Refund Submitted!"}
      </p>
      <p className="text-gray-600 text-sm mb-4 text-center">
        {isUpdate
          ? "Your refund has been updated successfully."
          : "Your refund has been recorded successfully."}
      </p>
    </motion.div>
  )

  return (
    <>
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
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="refund-details">Refund Details</TabsTrigger>
              <TabsTrigger value="refund-reference">Upload Receipt</TabsTrigger>
            </TabsList>

            <form
              className="-mt-2 mb-2"
              id="refund-form"
              onSubmit={handleFormSubmit}
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
                              <FieldError errors={field.state.meta.errors.map((err) =>
                                typeof err === "string" ? { message: err } : err
                              )} />
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

                        // NEW: Calculate total refundable amount for selected entries
                        const totalRefundableSelected = entryList.length > 0
                          ? entryOptions
                            .filter((e: EntryWithPaymentInfo) => entryList.includes(e.entryNumber))
                            .reduce((sum: number, e: EntryWithPaymentInfo) => sum + (e.paymentInfo?.refundableAmount || 0), 0)
                          : 0

                        return (
                          <Field data-invalid={isInvalid} className="col-span-2">
                            <div className="flex items-center gap-1">
                              <Label className="text-sm font-medium">Select Entries</Label>
                              <span className="text-red-500">*</span>
                            </div>

                            {entryList.length > 0 && (
                              <div className="mb-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="font-medium text-blue-700">Total Refundable Amount:</span>
                                  <span className="font-bold text-blue-700">
                                    ₱{totalRefundableSelected.toLocaleString('en-US', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    })}
                                  </span>
                                </div>
                              </div>
                            )}

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
                                <PopoverContent className="w-(--radix-popover-trigger-width) p-0 max-h-80" onWheel={(e) => e.stopPropagation()}>
                                  <Command>
                                    <CommandInput
                                      placeholder="Search entry..."
                                      className="h-9"
                                    />
                                    <CommandList>
                                      <CommandEmpty>No entry found.</CommandEmpty>
                                      <CommandGroup className="p-1">
                                        {entryOptions.map((entry: any) => {
                                          const isSelected = entryList.includes(entry.entryNumber)
                                          const paymentInfo = entry.paymentInfo
                                          const hasPositiveRefundable = paymentInfo?.refundableAmount > 0

                                          return (
                                            <CommandItem
                                              key={entry.entryNumber}
                                              value={entry.entryNumber}
                                              onSelect={(currentValue: any) => {
                                                field.handleChange((prev: string[]) => {
                                                  if (prev.includes(currentValue))
                                                    return prev.filter((e: string) => e != currentValue)
                                                  else return [...prev, currentValue]
                                                })
                                                setOpenFilteredEntries(false)
                                              }}
                                              className="py-1.5 px-2 cursor-pointer"
                                            >
                                              <div className="flex items-center justify-between w-full gap-2">
                                                <div className="flex flex-col min-w-0 flex-1">
                                                  <div className="flex items-center text-xs">
                                                    <span className="font-medium">{entry.entryNumber}</span>
                                                  </div>

                                                  <div className="text-[11px] text-muted-foreground truncate">
                                                    {entry.players.map((p: any) => `${p.firstName} ${p.lastName}`).join(', ')}
                                                  </div>

                                                  <div className="text-[11px] text-muted-foreground">
                                                    {entry.eventName}
                                                    {paymentInfo && (
                                                      <span className="ml-1">
                                                        <span className="text-green-600">(Paid: ₱{(paymentInfo.totalPaid || 0).toLocaleString()}</span>
                                                        <span className="text-orange-600"> • Exceeded Paid: ₱{(paymentInfo.currentPendingAmount || 0).toLocaleString()})</span>
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>

                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                  {hasPositiveRefundable ? (
                                                    <Badge variant="success" className="text-[11px] px-1.5 py-0 h-4 font-medium whitespace-nowrap">
                                                      Refundable: ₱{(paymentInfo?.refundableAmount || 0).toLocaleString()}
                                                    </Badge>
                                                  ) : (
                                                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 whitespace-nowrap">
                                                      Not Yet Paid Amount
                                                    </Badge>
                                                  )}
                                                  {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                                                </div>
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

                                      const paymentInfo = selectedEntry.paymentInfo
                                      const hasPositiveRefundable = paymentInfo?.refundableAmount > 0

                                      return (
                                        <div
                                          key={entryNumber}
                                          className="p-3 border rounded-lg space-y-2 hover:bg-gray-50 transition-colors"
                                        >
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium text-sm">
                                                  {selectedEntry.entryNumber}
                                                </span>
                                                {hasPositiveRefundable ? (
                                                  <Badge variant="success" className="text-[11px] px-1.5 py-0 h-4 font-medium whitespace-nowrap">
                                                    Refundable: ₱{(paymentInfo?.refundableAmount || 0).toLocaleString()}
                                                  </Badge>
                                                ) : (
                                                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 whitespace-nowrap">
                                                    Not Yet Paid Amount
                                                  </Badge>
                                                )}
                                              </div>

                                              <div className="text-[11px] text-muted-foreground truncate mt-1">
                                                {selectedEntry.players
                                                  .map((p: any) => `${p.firstName} ${p.lastName}`)
                                                  .join(', ')}
                                              </div>

                                              <div className="text-[11px] text-muted-foreground mt-0.5">
                                                {selectedEntry.eventName}
                                                {paymentInfo && (
                                                  <span className="ml-1">
                                                    <span className="text-green-600">(Paid: ₱{(paymentInfo.totalPaid || 0).toLocaleString()}</span>
                                                    <span className="text-orange-600"> • Exceeded Pay: ₱{(paymentInfo.currentPendingAmount || 0).toLocaleString()})</span>
                                                  </span>
                                                )}
                                              </div>

                                              {paymentInfo?.latestPayment && (
                                                <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                  <span>Latest:</span>
                                                  <span className="text-green-600">
                                                    ₱{(paymentInfo.latestPayment.amount || 0).toLocaleString()}
                                                  </span>
                                                  <span>•</span>
                                                  <span className="truncate max-w-[100px]" title={paymentInfo.latestPayment.referenceNumber}>
                                                    {paymentInfo.latestPayment.referenceNumber || 'N/A'}
                                                  </span>
                                                </div>
                                              )}
                                            </div>

                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleRemoveEntry(entryNumber)}
                                              className="h-8 w-8 p-0 ml-2 flex-shrink-0"
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
                        const fieldError = field.state.meta.errors?.[0];

                        return (
                          <Field data-invalid={isInvalid}>
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
                                      }}
                                      aria-invalid={isInvalid}
                                    />
                                  </InputGroup>

                                  {scannedReference && scannedReference !== "Not found" && (
                                    <p className="text-xs text-green-600">
                                      ✓ Scanned reference auto-filled
                                    </p>
                                  )}

                                  {(!scannedReference || scannedReference === "Not found") && files.length > 0 && (
                                    <p className="text-xs text-gray-500">
                                      No reference detected in receipt
                                    </p>
                                  )}

                                  {isInvalid && fieldError && (
                                    <p className="text-xs text-red-500 flex items-center">
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      {fieldError}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
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
                        <div className="flex items-center gap-2 min-w-0">
                          <Paperclip className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <div className="flex-1 max-w-xs">
                            <p className="text-sm font-medium truncate w-full">
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
                            className="text-gray-500 hover:text-red-500 hover:bg-gray-200! bg-transparent transition-colors cursor-pointer flex-shrink-0"
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
                            {files.length > 0 ? "Upload new file or click to replace" : "Upload your receipt or click to browse"}
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
              loading={formLoading || isCheckingDuplicate}
              type="submit"
              form="refund-form"
              disabled={isSubmitDisabled() || formLoading || isCheckingDuplicate}
            >
              Submit
            </Button>
          </DialogFooter>

          <AnimatePresence>
            {success && <SuccessModal />}
            {showConfirmationDialog && <ConfirmationDialog />}
            {(isUploading || loading) && (
              <UploadingOverlay
                message={loading ? "Scanning receipt..." : "Uploading..."}
                progress={isUploading ? uploadProgress : undefined}
              />
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      <DuplicateReferenceDialog
        isOpen={showDuplicateDialog}
        onClose={() => setShowDuplicateDialog(false)}
        onContinueAnyway={handleContinueAnyway}
        referenceNumber={duplicateReferenceNumber}
        existingRefundData={duplicateRefundData}
      />

      {overRefundData && (
        <OverRefundDialog
          isOpen={showOverRefundDialog}
          onClose={() => setShowOverRefundDialog(false)}
          totalRefundableAmount={overRefundData.totalRefundableAmount}
          attemptedAmount={overRefundData.attemptedAmount}
          excessByEntry={overRefundData.excessByEntry}
        />
      )}
    </>
  )
}

export default FormDialog
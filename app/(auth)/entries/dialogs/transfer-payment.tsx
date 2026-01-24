"use client"

import { useState, useEffect } from "react"
import { gql } from "@apollo/client"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, Minus, AlertCircle, X, Check, ChevronDown } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useMutation, useQuery } from "@apollo/client/react"
import { TransferEntryStatus } from "@/types/payment.interface"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const TRANSFER_PAYMENT = gql`
  mutation TransferPaymentToOtherEntry($input: TransferPaymentInput!) {
    transferPaymentToOtherEntry(input: $input) {
      ok
      message
    }
  }
`

const GET_PAYMENTS_FOR_ENTRY = gql`
  query GetPaymentsForEntry($entryId: ID!) {
    paymentsByEntryId(entryId: $entryId) {
      _id
      payerName
      referenceNumber
      amount
      method
      paymentDate
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

interface TransferPaymentResponse {
    transferPaymentToOtherEntry: {
        ok: boolean
        message: string
    }
}

interface Payment {
    _id: string
    payerName: string
    referenceNumber: string
    amount: number
    method: string
    paymentDate: string
}

interface GetPaymentsForEntryResponse {
    paymentsByEntryId: Payment[]
}

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

interface TransferPaymentInput {
    _id: string
    entryList: Array<{
        entry: string[]
        isFullyPaid: boolean
    }>
    oldEntriesStatus?: TransferEntryStatus
    remarks?: Array<{
        remark: string
        date: Date
    }> | null
}

interface TransferDialogProps {
    entryId?: string
    onClose?: () => void
}

const TransferDialog = ({ entryId, onClose }: TransferDialogProps) => {
    const [open, setOpen] = useState(false)
    const [selectedPaymentId, setSelectedPaymentId] = useState<string>("")
    const [selectedEntries, setSelectedEntries] = useState<ActivePaymentEntryOption[]>([])
    const [entrySearch, setEntrySearch] = useState("")
    const [entriesPopoverOpen, setEntriesPopoverOpen] = useState(false)
    const [oldEntriesStatus, setOldEntriesStatus] = useState<TransferEntryStatus | undefined>(undefined)
    const [remarks, setRemarks] = useState<string>("")
    const [isFullyPaid, setIsFullyPaid] = useState<boolean>(false)

    // Fetch payments for this entry
    const { data: paymentsData, loading: paymentsLoading, error: paymentsError } = useQuery<GetPaymentsForEntryResponse>(
        GET_PAYMENTS_FOR_ENTRY,
        {
            variables: { entryId },
            skip: !entryId || !open,
            fetchPolicy: 'network-only',
        }
    )

    // Fetch all available entries for selection
    const { data: entriesData, loading: entriesLoading } = useQuery<ActivePaymentEntryOptionsResponse>(
        ACTIVE_PAYMENT_ENTRY_OPTIONS,
        {
            skip: !open || !selectedPaymentId,
            fetchPolicy: "network-only",
        }
    )

    const [transferPayment, { loading: transferring }] = useMutation<TransferPaymentResponse>(
        TRANSFER_PAYMENT,
        {
            onCompleted: (data) => {
                if (data.transferPaymentToOtherEntry.ok) {
                    toast.success("Payment transferred successfully")
                    setOpen(false)
                    onClose?.()
                    resetForm()
                }
            },
            onError: (error) => {
                toast.error(error.message)
            },
        }
    )

    const payments = paymentsData?.paymentsByEntryId || []
    const selectedPayment = payments.find(p => p._id === selectedPaymentId)

    // Auto-select the first payment if there's only one
    useEffect(() => {
        if (payments.length === 1 && !selectedPaymentId && !paymentsLoading) {
            setSelectedPaymentId(payments[0]._id)
        }
    }, [payments, selectedPaymentId, paymentsLoading])

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            resetForm()
        }
    }, [open])

    const resetForm = () => {
        setSelectedPaymentId("")
        setSelectedEntries([])
        setEntrySearch("")
        setOldEntriesStatus(undefined)
        setRemarks("")
        setIsFullyPaid(false)
        setEntriesPopoverOpen(false)
    }

    const handleEntrySelect = (entry: ActivePaymentEntryOption) => {
        if (!selectedEntries.find(e => e.entryNumber === entry.entryNumber)) {
            setSelectedEntries([...selectedEntries, entry])
        }
        setEntrySearch("")
        setEntriesPopoverOpen(false)
    }

    const handleRemoveEntry = (entryNumber: string) => {
        setSelectedEntries(selectedEntries.filter(e => e.entryNumber !== entryNumber))
    }

    const getSelectedEntriesText = () => {
        if (selectedEntries.length === 0) {
            return "Select entries..."
        }
        if (selectedEntries.length === 1) {
            return `${selectedEntries[0].entryNumber}`
        }
        return `${selectedEntries.length} entries selected`
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

    const handleSubmit = async () => {
        if (!selectedPaymentId) {
            toast.error("Please select a payment")
            return
        }

        if (selectedEntries.length === 0) {
            toast.error("Please select at least one entry")
            return
        }

        // Check for duplicate entries
        const entryNumbers = selectedEntries.map(e => e.entryNumber)
        const entrySet = new Set(entryNumbers)
        if (entrySet.size !== entryNumbers.length) {
            toast.error("Duplicate entry numbers found")
            return
        }

        const input: TransferPaymentInput = {
            _id: selectedPaymentId,
            entryList: [{
                entry: entryNumbers,
                isFullyPaid
            }],
            oldEntriesStatus: oldEntriesStatus || undefined,
            remarks: remarks ? [{ remark: remarks, date: new Date() }] : null
        }

        try {
            await transferPayment({
                variables: { input }
            })
        } catch (error: any) {
            toast.error(error.message || "Failed to transfer payment")
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                    Transfer Payment
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Transfer Payment</DialogTitle>
                    <DialogDescription>
                        Transfer payment to other entries
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Payment Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="payment-select">Select Payment to Transfer</Label>
                        {paymentsLoading ? (
                            <div className="text-sm text-muted-foreground">Loading payments...</div>
                        ) : paymentsError ? (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>Error loading payments</AlertDescription>
                            </Alert>
                        ) : payments.length === 0 ? (
                            <div className="text-sm text-muted-foreground">No payments found for this entry</div>
                        ) : (
                            <Select
                                value={selectedPaymentId}
                                onValueChange={setSelectedPaymentId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a payment" />
                                </SelectTrigger>
                                <SelectContent>
                                    {payments.map((payment) => (
                                        <SelectItem key={payment._id} value={payment._id}>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{payment.payerName}</span>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>₱{payment.amount?.toLocaleString()}</span>
                                                    <span>•</span>
                                                    <span>{payment.method}</span>
                                                    <span>•</span>
                                                    <span>{formatDate(payment.paymentDate)}</span>
                                                </div>
                                                {payment.referenceNumber && (
                                                    <span className="text-xs text-muted-foreground">Ref: {payment.referenceNumber}</span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Selected Payment Details */}
                    {selectedPayment && (
                        <>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Payer Name</Label>
                                            <p className="font-medium">{selectedPayment.payerName}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Reference Number</Label>
                                            <p className="font-medium">{selectedPayment.referenceNumber || "N/A"}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Amount</Label>
                                            <p className="font-medium">₱{selectedPayment.amount?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Method</Label>
                                            <p className="font-medium">{selectedPayment.method}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Payment Date</Label>
                                            <p className="font-medium">{formatDate(selectedPayment.paymentDate)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Separator />
                        </>
                    )}

                    {/* Only show the rest of the form if a payment is selected */}
                    {selectedPaymentId && (
                        <>
                            {/* New Entries Selection */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base">Select New Entries</Label>
                                    {selectedEntries.length > 0 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedEntries([])}
                                            disabled={entriesLoading}
                                        >
                                            Clear All
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Popover open={entriesPopoverOpen} onOpenChange={setEntriesPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={entriesPopoverOpen}
                                                className="w-full justify-between font-normal"
                                                type="button"
                                                disabled={entriesLoading}
                                            >
                                                <span className="truncate text-left">
                                                    {getSelectedEntriesText()}
                                                </span>
                                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-0" align="start" style={{ width: '100%' }}>
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
                                                                        className={`w-full text-left p-2 rounded transition-colors flex items-start gap-2 ${isSelected
                                                                            ? "bg-green-100 hover:bg-green-100"
                                                                            : "hover:bg-gray-50"
                                                                            }`}
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
                                                                                    className={`text-xs flex-shrink-0 ${getStatusColor(entry.currentStatus)}`}
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
                                            <Label className="text-sm font-medium">
                                                Selected Entries ({selectedEntries.length})
                                            </Label>
                                            <ScrollArea className="h-40">
                                                <div className="space-y-2 pr-2">
                                                    {selectedEntries.map((entry) => (
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
                                                                            className={`text-xs ${getStatusColor(entry.currentStatus)}`}
                                                                        >

                                                                            {entry.currentStatus.replace("_", " ")}
                                                                        </Badge>
                                                                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                                                            ₱{entry.remainingFee.toFixed(2)}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                                                        <div><strong>Players:</strong> {entry.players.map(p => `${p.firstName} ${p.lastName}`).join(', ')}</div>
                                                                        <div><strong>Event:</strong> {entry.eventName}</div>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRemoveEntry(entry.entryNumber)}
                                                                    className="h-8 w-8 p-0"
                                                                    disabled={entriesLoading}
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

                                {/* Is Fully Paid */}
                                <div className="flex items-center space-x-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="isFullyPaid"
                                        checked={isFullyPaid}
                                        onChange={(e) => setIsFullyPaid(e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                    <Label htmlFor="isFullyPaid" className="text-sm">
                                        Mark entries as fully paid
                                    </Label>
                                </div>
                            </div>

                            <Separator />

                            {/* Old Entries Status */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="old-entries-status">Status for Original Entries</Label>
                                    <span className="text-xs text-muted-foreground">(Optional)</span>
                                </div>
                                <Select
                                    value={oldEntriesStatus || ""}
                                    onValueChange={(value: string) => {
                                        if (value === "") {
                                            setOldEntriesStatus(undefined)
                                        } else {
                                            setOldEntriesStatus(value as TransferEntryStatus)
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NONE">None (default: PAYMENT_PENDING)</SelectItem>
                                        <SelectItem value={TransferEntryStatus.PAYMENT_PENDING}>
                                            Payment Pending
                                        </SelectItem>
                                        <SelectItem value={TransferEntryStatus.PAYMENT_PARTIALLY_PAID}>
                                            Payment Partially Paid
                                        </SelectItem>
                                        <SelectItem value={TransferEntryStatus.VERIFIED}>
                                            Verified
                                        </SelectItem>
                                        <SelectItem value={TransferEntryStatus.REJECTED}>
                                            Rejected
                                        </SelectItem>
                                        <SelectItem value={TransferEntryStatus.CANCELLED}>
                                            Cancelled
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Remarks - Show only if Cancelled or Rejected selected */}
                            {(oldEntriesStatus === TransferEntryStatus.CANCELLED || oldEntriesStatus === TransferEntryStatus.REJECTED) && (
                                <div className="space-y-2">
                                    <Label htmlFor="remarks">Remarks *</Label>
                                    <Textarea
                                        id="remarks"
                                        placeholder="Please provide remarks for cancellation or rejection..."
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        rows={3}
                                        required
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Remarks are required when status is set to Cancelled or Rejected
                                    </p>
                                </div>
                            )}

                            {oldEntriesStatus &&
                                oldEntriesStatus !== TransferEntryStatus.CANCELLED &&
                                oldEntriesStatus !== TransferEntryStatus.REJECTED && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="remarks">Remarks</Label>
                                            <span className="text-xs text-muted-foreground">(Optional)</span>
                                        </div>
                                        <Textarea
                                            id="remarks"
                                            placeholder="Add any remarks about this transfer..."
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                )}

                            {selectedPayment && (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        <div className="font-semibold mb-1">Transfer Summary:</div>
                                        <div>• Moving <strong>₱{selectedPayment.amount?.toLocaleString()}</strong> from {selectedPayment.payerName}</div>
                                        <div>• To {selectedEntries.length} new {selectedEntries.length === 1 ? 'entry' : 'entries'}</div>
                                        {oldEntriesStatus && (
                                            <div>• Original entries status: <strong>{oldEntriesStatus.replaceAll('_', ' ')}</strong></div>
                                        )}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setOpen(false)
                                resetForm()
                            }}
                            disabled={transferring}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={
                                !selectedPaymentId ||
                                selectedEntries.length === 0 ||
                                transferring ||
                                paymentsLoading ||
                                entriesLoading ||
                                ((oldEntriesStatus === TransferEntryStatus.CANCELLED ||
                                    oldEntriesStatus === TransferEntryStatus.REJECTED) &&
                                    !remarks.trim())
                            }
                            loading={transferring}
                        >
                            {transferring ? "Transferring..." : "Transfer Payment"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default TransferDialog
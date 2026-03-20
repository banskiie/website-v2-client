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
import { AlertCircle, X, Check, ChevronDown, CreditCard, Calendar, Hash, User, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useMutation, useQuery } from "@apollo/client/react"
import { TransferEntryStatus } from "@/types/payment.interface"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

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
      statuses {
        status
        date
        reason
      }
      entryList {
        entry {
          _id
          entryNumber
          entryKey
        }
        isFullyPaid
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

const PAYMENT_CHANGED = gql`
  subscription PaymentChanged {
    paymentChanged {
      type
      payment {
        _id
        payerName
        referenceNumber
        amount
        method
        paymentDate
        currentStatus
        entries
        # Add these missing fields
        appliedAmount
        hasExcess
        excessAmount
        refundAmountForThisPayment
        hasRefundsForThisPayment
        netAmountForThisPayment
        entryList {
          isFullyPaid
          entry {
            _id
            entryNumber
            entryKey
            transactions {
              pendingAmount
              amountChanged
              transactionType
            }
            currentStatus
          }
        }
      }
    }
  }
`

interface TransferPaymentResponse {
    transferPaymentToOtherEntry: {
        ok: boolean
        message: string
    }
}

interface PaymentStatus {
    status: string
    date: string
    reason?: string
}

interface Payment {
    _id: string
    payerName: string
    referenceNumber: string
    amount: number
    method: string
    paymentDate: string
    statuses?: PaymentStatus[]
    entryList?: Array<{
        entry: {
            _id: string
            entryNumber: string
            entryKey: string
        }
        isFullyPaid: boolean
    }>
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
        by: string
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
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

    // Fetch payments for this entry
    const { data: paymentsData, loading: paymentsLoading, error: paymentsError, subscribeToMore, refetch } = useQuery<GetPaymentsForEntryResponse>(
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

                    refetch()
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

    useEffect(() => {
        if (!subscribeToMore || !open) return;

        const unsubscribe = subscribeToMore({
            document: PAYMENT_CHANGED,
            updateQuery: (prev, { subscriptionData }) => {
                if (!subscriptionData.data) return prev as any;

                const { type, payment } = (subscriptionData.data as any).paymentChanged;

                // Add null check for payment
                if (!payment || !payment._id) return prev as any;

                if (!(prev as any).paymentsByEntryId) return prev as any;

                const prevCopy = { ...(prev as any) };

                const updatedPayment = payment;
                const currentPaymentIds = prevCopy.paymentsByEntryId.map((p: any) => p?._id).filter(Boolean);

                if (!currentPaymentIds.includes(updatedPayment._id)) {
                    return prev as any;
                }

                setLastUpdated(new Date());

                switch (type) {
                    case "UPDATE":
                        prevCopy.paymentsByEntryId = prevCopy.paymentsByEntryId.map((p: any) =>
                            p?._id === updatedPayment._id
                                ? {
                                    ...p,
                                    ...updatedPayment,
                                    // Preserve existing statuses array since subscription doesn't have it
                                    statuses: p?.statuses || []
                                }
                                : p
                        );

                        // Use currentStatus from the subscription
                        if (updatedPayment.currentStatus === 'REJECTED' || updatedPayment.currentStatus === 'REFUNDED') {
                            toast.info(`Payment ${updatedPayment.referenceNumber || 'Unknown'} was ${updatedPayment.currentStatus.toLowerCase()}`, {
                                duration: 5000,
                            });

                            if (selectedPaymentId === updatedPayment._id) {
                                setSelectedPaymentId("");
                            }
                        }

                        return prevCopy;

                    default:
                        return prev as any;
                }
            }
        });

        return () => {
    if (typeof unsubscribe === "function") {
      unsubscribe()
    }
  };
    }, [subscribeToMore, open, selectedPaymentId]);

    const payments = paymentsData?.paymentsByEntryId || []

    const isValidPayment = (payment: Payment): boolean => {
        if (!payment.statuses || payment.statuses.length === 0) return true;

        const latestStatus = payment.statuses[payment.statuses.length - 1];

        return latestStatus.status !== 'REJECTED' && latestStatus.status !== 'REFUNDED';
    }

    const validPayments = payments.filter(isValidPayment);
    const selectedPayment = validPayments.find(p => p._id === selectedPaymentId)

    useEffect(() => {
        if (validPayments.length === 1 && !selectedPaymentId && !paymentsLoading) {
            setSelectedPaymentId(validPayments[0]._id)
        }
    }, [validPayments, selectedPaymentId, paymentsLoading])

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

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case "VERIFIED":
                return "bg-green-50 text-green-700 border-green-200"
            case "SENT":
                return "bg-blue-50 text-blue-700 border-blue-200"
            case "REJECTED":
                return "bg-red-50 text-red-700 border-red-200"
            case "REFUNDED":
                return "bg-purple-50 text-purple-700 border-purple-200"
            default:
                return "bg-gray-50 text-gray-700 border-gray-200"
        }
    }

    // Filter entries by status (exclude rejected/cancelled/refunded)
    const filteredEntries = entriesData?.activePaymentEntryOptions?.filter(entry => {
        const excludedStatuses = ["REJECTED", "CANCELLED", "REFUNDED"];
        return !excludedStatuses.includes(entry.currentStatus);
    }) || []

    const searchedEntries = filteredEntries.filter(entry => {
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
    }) || []

    const handleSubmit = async () => {
        if (!selectedPaymentId) {
            toast.error("Please select a payment")
            return
        }

        // Double-check that the selected payment is still valid
        const selectedPayment = validPayments.find(p => p._id === selectedPaymentId);
        if (!selectedPayment) {
            toast.error("Selected payment is no longer valid (rejected or refunded)")
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
            remarks: remarks ? [{ remark: remarks, date: new Date(), by: "" }] : null
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

    const handleManualRefresh = () => {
        refetch();
        toast.success("Payments refreshed");
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <span className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    Transfer Payment
                </span>
            </DialogTrigger>
            <DialogContent className="max-w-xl! max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Transfer Payment</DialogTitle>
                    <DialogDescription>
                        Transfer payment to other entries
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Payment Details</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleManualRefresh}
                                disabled={paymentsLoading}
                                className="h-8 px-2"
                            >
                                <RefreshCw className={`h-3 w-3 mr-1 ${paymentsLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                        {paymentsLoading ? (
                            <div className="text-sm text-muted-foreground">Loading payments...</div>
                        ) : paymentsError ? (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>Error loading payments</AlertDescription>
                            </Alert>
                        ) : validPayments.length === 0 ? (
                            <div className="text-sm text-muted-foreground">No valid payments found for this entry</div>
                        ) : (
                            <div className="space-y-2">
                                {validPayments.map((payment) => {
                                    const latestStatus = payment.statuses?.[payment.statuses.length - 1]?.status;
                                    const entryInfo = payment.entryList?.[0]?.entry

                                    return (
                                        <Card
                                            key={payment._id}
                                            className={`cursor-pointer transition-all hover:bg-gray-50 ${selectedPaymentId === payment._id ? 'ring-2 ring-primary' : ''
                                                }`}
                                            onClick={() => setSelectedPaymentId(payment._id)}
                                        >
                                            <CardContent className="p-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-1 w-full">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`p-1 rounded ${selectedPaymentId === payment._id ? 'bg-primary/10' : 'bg-gray-100'}`}>
                                                                <CreditCard className="h-3 w-3" />
                                                            </div>
                                                            <span className="font-medium text-sm">{payment.payerName}</span>
                                                            {latestStatus && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className={cn(
                                                                        "text-xs",
                                                                        getPaymentStatusColor(latestStatus)
                                                                    )}
                                                                >
                                                                    {latestStatus}
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 pl-6">
                                                            <div className="flex items-center gap-1">
                                                                <Hash className="h-3 w-3 text-muted-foreground" />
                                                                <span className="text-xs text-muted-foreground">Ref:</span>
                                                                <span className="text-xs font-medium">{payment.referenceNumber || "N/A"}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <CreditCard className="h-3 w-3 text-muted-foreground" />
                                                                <span className="text-xs text-muted-foreground">Method:</span>
                                                                <span className="text-xs font-medium">{payment.method}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <User className="h-3 w-3 text-muted-foreground" />
                                                                <span className="text-xs text-muted-foreground">Amount:</span>
                                                                <span className="text-xs font-medium text-green-600">₱{payment.amount?.toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                                <span className="text-xs text-muted-foreground">Date:</span>
                                                                <span className="text-xs font-medium">{formatDate(payment.paymentDate)}</span>
                                                            </div>

                                                            {entryInfo && (
                                                                <div className="flex items-center gap-1 col-span-2 mt-1 pt-1 border-t border-gray-100">
                                                                    <Hash className="h-3 w-3 text-muted-foreground" />
                                                                    <span className="text-xs text-muted-foreground">Entry:</span>
                                                                    <span className="text-xs font-medium">
                                                                        {entryInfo.entryNumber}
                                                                        {entryInfo.entryKey && `_${entryInfo.entryKey}`}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {selectedPaymentId === payment._id && (
                                                        <div className="flex-shrink-0 ml-2">
                                                            <div className="rounded-full bg-primary p-1">
                                                                <Check className="h-3 w-3 text-primary-foreground" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {selectedPaymentId && selectedPayment && (
                        <>
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
                                        <PopoverContent className="p-0" align="start" onWheel={(e) => e.stopPropagation()} style={{ width: '100%' }}>
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
                                                    ) : searchedEntries.length === 0 ? (
                                                        <div className="py-8 text-center text-sm text-muted-foreground">
                                                            {entrySearch ? "No entries found" : "No eligible entries available"}
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-1">
                                                            {searchedEntries.map((entry) => {
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
                                            {searchedEntries.length > 0 && filteredEntries.length > 0 && (
                                                <div className="p-2 border-t text-xs text-muted-foreground">
                                                    Showing {searchedEntries.length} of {filteredEntries.length} eligible entries
                                                </div>
                                            )}
                                        </PopoverContent>
                                    </Popover>

                                    {selectedEntries.length > 0 && (
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">
                                                Selected Entries ({selectedEntries.length})
                                            </Label>
                                            <ScrollArea className={selectedEntries.length > 1 ? "h-40" : ""}>
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
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="old-entries-status" className="text-sm font-medium">
                                    Status for Original Entries
                                </Label>
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
                                <p className="text-xs text-muted-foreground">
                                    Select a status for the original entries after transferring this payment
                                </p>
                            </div>

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
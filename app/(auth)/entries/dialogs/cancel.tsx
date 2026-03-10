import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { gql } from "@apollo/client"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { toast } from "sonner"
import { useMutation } from "@apollo/client/react"

interface CancelEntryResponse {
    cancelEntry: {
        ok: boolean
        message: string
    }
}

interface CancelEntryVariables {
    input: {
        _id: string
        reason: string
    }
}

const CANCEL_ENTRY = gql`
  mutation CancelEntry($input: CancelEntryInput!) {
    cancelEntry(input: $input) {
      ok
      message
    }
  }
`

interface CancelDialogProps {
    _id?: string
    entryNumber?: string
    onClose?: () => void
}

const CancelDialog = ({ _id, entryNumber, onClose }: CancelDialogProps) => {
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState("")
    const [cancelEntry, { loading }] = useMutation<CancelEntryResponse, CancelEntryVariables>(CANCEL_ENTRY)

    const handleCancel = async () => {
        if (!_id) {
            toast.error("Entry ID is missing")
            return
        }

        if (!reason.trim()) {
            toast.error("Please provide a reason for cancellation")
            return
        }

        try {
            const { data } = await cancelEntry({
                variables: {
                    input: {
                        _id: _id,
                        reason: reason.trim(),
                    },
                },
            })

            if (data?.cancelEntry?.ok) {
                toast.success(data.cancelEntry.message || "Entry cancelled successfully")
                setOpen(false)
                setReason("")
                onClose?.()
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to cancel entry")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={(e) => e.preventDefault()}
                >
                    Cancel Entry
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cancel Entry</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to cancel entry{" "}
                        <span className="font-semibold">{entryNumber || "Unknown"}</span>?
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Textarea
                        placeholder="Please provide a reason for cancellation..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="min-h-[100px]"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} className="cursor-pointer hover:bg-gray-200">
                        Back
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleCancel}
                        disabled={loading || !reason.trim() || !_id}
                        className="cursor-pointer hover:bg-red-700"
                    >
                        {loading ? "Cancelling..." : "Confirm Cancellation"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CancelDialog
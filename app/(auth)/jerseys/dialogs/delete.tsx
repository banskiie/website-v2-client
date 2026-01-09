import { gql } from "@apollo/client"
import { useState } from "react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2Icon, Loader2 } from "lucide-react"
import { useMutation } from "@apollo/client/react"

const DELETE_JERSEY = gql`
  mutation DeleteJersey($_id: ID!) {
    deleteJersey(_id: $_id) {
      ok
      message
    }
  }
`

// Define the response type
interface MutationResponse {
    ok: boolean
    message: string
}

interface DeleteJerseyResponse {
    deleteJersey: MutationResponse
}

interface DeleteDialogProps {
    _id?: string
    playerName?: string
    onClose?: () => void
    onSuccess?: () => void
    variant?: "button" | "menu-item"
    disabled?: boolean
}

const DeleteDialog = ({
    _id,
    playerName,
    onClose,
    onSuccess,
    variant = "button",
    disabled = false,
}: DeleteDialogProps) => {
    const [open, setOpen] = useState(false)
    const [deleteJersey, { loading }] = useMutation<DeleteJerseyResponse>(DELETE_JERSEY, {
        refetchQueries: ["Jerseys"],
    })

    const handleDelete = async () => {
        if (!_id) return

        try {
            const { data } = await deleteJersey({
                variables: { _id },
            })

            if (data?.deleteJersey?.ok) {
                // toast.success(data.deleteJersey.message)
                setOpen(false)
                onClose?.()
                onSuccess?.()
            } else {
                toast.error("Failed to delete jersey")
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to delete jersey")
        }
    }

    const renderDialog = () => (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Jersey</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the jersey for{" "}
                        <span className="font-semibold">{playerName || "this player"}</span>?
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setOpen(false)
                            onClose?.()
                        }}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 size-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2Icon className="mr-2 size-4" />
                                Delete Jersey
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )

    if (variant === "menu-item") {
        return (
            <>
                <div
                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-destructive/10 hover:text-destructive focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    onClick={() => setOpen(true)}
                >
                    <Trash2Icon className="mr-2 size-4" />
                    Delete
                </div>
                {renderDialog()}
            </>
        )
    }

    return (
        <>
            <DialogTrigger asChild>
                <Button
                    variant="outline-destructive"
                    size="sm"
                    disabled={disabled || !_id}
                >
                    <Trash2Icon className="size-4" />
                    Delete
                </Button>
            </DialogTrigger>
            {renderDialog()}
        </>
    )
}

export default DeleteDialog
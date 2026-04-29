"use client";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { gql } from "@apollo/client";
import { toast } from "sonner";
import { useState } from "react";
import { useMutation } from "@apollo/client/react";

const RESEND_EMAIL = gql`
  mutation ResendEntryEmail($entryId: ID!) {
    resendEntryEmail(entryId: $entryId)
  }
`;

interface ResendEmailResponse {
    resendEntryEmail: boolean;
}

interface ResendDialogProps {
    _id?: string;
    entryNumber?: string;
    onClose?: () => void;
    variant?: "dropdown" | "button";
}

const ResendDialog = ({ _id, entryNumber, onClose, variant = "dropdown" }: ResendDialogProps) => {
    const [open, setOpen] = useState(false);
    const [resendEmail, { loading }] = useMutation<ResendEmailResponse>(RESEND_EMAIL, {
        onCompleted: (data) => {
            if (data?.resendEntryEmail) {
                toast.success(`Email resent successfully for entry ${entryNumber || _id}`);
                setOpen(false);
                onClose?.();
            }
        },
        onError: (error) => {
            console.error("Error resending email:", error);
            toast.error(error.message || "Failed to resend email. Please try again.");
        },
    });

    const handleResend = async () => {
        if (!_id) return;

        try {
            await resendEmail({
                variables: { entryId: _id },
            });
        } catch (error) {
            console.error("Error in handleResend:", error);
        }
    };

    if (variant === "dropdown") {
        return (
            <>
                <div
                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    onClick={() => setOpen(true)}
                >
                    Resend Email
                </div>
                <AlertDialog open={open} onOpenChange={setOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Resend Email</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to resend the email for entry {entryNumber || _id}?
                                This will send the appropriate confirmation email based on the entry's current status.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleResend} disabled={loading}>
                                {loading ? "Sending..." : "Resend Email"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </>
        );
    }

    return (
        <>
            <Button variant="outline" onClick={() => setOpen(true)} disabled={loading}>
                {loading ? "Sending..." : "Resend Email"}
            </Button>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Resend Email</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to resend the email for entry {entryNumber || _id}?
                            This will send the appropriate confirmation email based on the entry's current status.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResend} disabled={loading}>
                            {loading ? "Sending..." : "Resend Email"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default ResendDialog;
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { AlertTriangle } from "lucide-react";

interface MaxEntriesWarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventName: string;
    maxEntries: number;
    remainingSlots: number;
    entryNumber?: string;
}

export const MaxEntriesWarningModal = ({
    isOpen,
    onClose,
    eventName,
    maxEntries,
    remainingSlots,
    entryNumber,
}: MaxEntriesWarningModalProps) => {

    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setVisible(true)
        } else {
            const timer = setTimeout(() => setVisible(false), 300)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    if (!visible && isOpen) return null

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all duration-300
                ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            onClick={onClose}
        >
            <div className={`animate-in fade-in zoom-in duration-300 w-full max-w-md transition-all
                ${isOpen ? "scale-100" : "scale-95"}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl shadow-2xl p-6 text-center border-2 border-amber-400">
                    <div className="flex items-center justify-center mb-6">
                        <div className="p-3 bg-red-100 rounded-full animate-pulse">
                            <AlertTriangle className="w-12 h-12 text-red-600" />
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-red-800 mb-3">
                        Event Almost Full!
                    </h3>

                    <p className="text-gray-700 mb-2">
                        The event <strong className="text-red-700">{eventName}</strong> is
                        reaching its maximum capacity.
                    </p>

                    <div className="my-4 p-3 bg-white/60 rounded-lg">
                        <p className="text-2xl font-bold text-red-700">
                            Only {remainingSlots} slot{remainingSlots !== 1 ? "s" : ""} remaining!
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            Maximum capacity: {maxEntries} entries
                        </p>
                    </div>

                    {entryNumber && (
                        <p className="text-sm text-green-700 bg-green-50 p-2 rounded-lg mb-4">
                            ✓ Entry <span className="underline underline-offset-2">{entryNumber}</span> has been approved
                        </p>
                    )}

                    <p className="text-gray-600 mb-6">
                        The event will be closed for registration once it reaches{" "}
                        <strong className="text-red-800">{maxEntries}</strong> entries.
                        {remainingSlots === 1
                            ? " This is the LAST available slot!"
                            : ` Only ${remainingSlots} slots left!`}
                    </p>

                    <Button
                        onClick={onClose}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 hover:cursor-pointer rounded-lg font-semibold transition-all duration-300"
                    >
                        Got it
                    </Button>
                </div>
            </div>
        </div>
    );
};
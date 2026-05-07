// In sortable-entries.tsx, update the onChange type and add handlers for all fields:
"use client"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash } from "lucide-react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"

interface SortableEntryProps {
    id: string
    index: number
    entry: { combinedEntry: string; entryNumber: string; entryKey: string }
    isJointPayment: boolean
    onChange: (index: number, field: "combinedEntry" | "entryNumber" | "entryKey", value: string) => void
    onDelete: (index: number) => void
}

export default function SortableEntry({
    id,
    index,
    entry,
    isJointPayment,
    onChange,
    onDelete,
}: SortableEntryProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative flex items-start gap-3 bg-white rounded-lg p-2 shadow-sm"
        >
            <div
                {...attributes}
                {...listeners}
                className="flex-shrink-0 w-8 h-8 flex items-center mt-1 justify-center border border-gray-300 rounded-md cursor-grab active:cursor-grabbing bg-gray-50 hover:bg-gray-100"
                title="Drag to reorder"
            >
                <GripVertical className="w-4 h-4 text-gray-500" />
            </div>

            <div className="flex-1">
                <div className="grid grid-cols-1 gap-2">
                    <div className="relative">
                        <Input
                            type="text"
                            value={entry.combinedEntry}
                            onChange={(e) => onChange(index, "combinedEntry", e.target.value)}
                            placeholder="Example: ME-0030_SAFW"
                            className="w-full placeholder:text-sm pr-10"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Format: EntryNumber_EntryKey (e.g., ME-0030_SAFW)
                        </p>
                    </div>
                </div>
            </div>

            {isJointPayment && index > 0 && (
                <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => onDelete(index)}
                    className="flex-shrink-0 mt-0 cursor-pointer h-8! w-8! hover:bg-red-500"
                    aria-label="Remove Entry"
                >
                    <Trash className="w-3.5 h-3.5" />
                </Button>
            )}
        </div>
    )
}
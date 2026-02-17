"use client"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash } from "lucide-react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"

interface SortableEntryProps {
    id: string
    index: number
    entry: { entryNumber: string; entryKey: string }
    isJointPayment: boolean
    onChange: (index: number, field: "entryNumber" | "entryKey", value: string) => void
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

            <div className="grid grid-cols-2 gap-2 flex-1 items-end">
                <div>
                    <Input
                        type="text"
                        value={entry.entryNumber}
                        onChange={(e) => onChange(index, "entryNumber", e.target.value)}
                        placeholder="Example: 000V8_0001"
                        className="w-full placeholder:text-sm"
                    />
                </div>

                <div className="relative">
                    <Input
                        type="text"
                        value={entry.entryKey}
                        onChange={(e) => onChange(index, "entryKey", e.target.value)}
                        placeholder="Example: ABC123"
                        className="w-full placeholder:text-sm pr-10"
                    />

                    {isJointPayment && index > 0 && (
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => onDelete(index)}
                            className="absolute right-1 cursor-pointer top-1/2 -translate-y-1/2 h-7! w-7! hover:bg-red-500"
                            aria-label="Remove Entry"
                        >
                            <Trash className="w-3.5 h-3.5" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

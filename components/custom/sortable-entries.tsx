"use client"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash } from "lucide-react"

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

            <div className="grid grid-cols-2 gap-4 flex-1 items-end">
                <div>

                    <input
                        type="text"
                        value={entry.entryNumber}
                        onChange={(e) => onChange(index, "entryNumber", e.target.value)}
                        placeholder="Example: 000V8_0001"
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-400 border-gray-300 placeholder:text-sm"
                    />
                </div>

                <div className="relative">
                    <input
                        type="text"
                        value={entry.entryKey}
                        onChange={(e) => onChange(index, "entryKey", e.target.value)}
                        placeholder="Example: ABC123"
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-400 border-gray-300 placeholder:text-sm pr-10"
                    />

                    {isJointPayment && index > 0 && (
                        <button
                            type="button"
                            onClick={() => onDelete(index)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 hover:bg-red-600 text-white hover:text-white rounded-md cursor-pointer p-1 transition"
                            title="Remove Entry"
                        >
                            <Trash className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

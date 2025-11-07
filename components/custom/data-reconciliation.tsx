"use client"

import React, { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Check, Info } from "lucide-react"

interface DataReconciliationModalProps {
  isOpen: boolean
  onClose: () => void
  oldData: Record<string, any>
  newData: Record<string, any>
  onMerge: (merged: Record<string, any>) => void
}

export function DataReconciliationModal({
  isOpen,
  onClose,
  oldData,
  newData,
  onMerge,
}: DataReconciliationModalProps) {
  const [selectedValues, setSelectedValues] = useState<Record<string, "old" | "new">>({})

  useEffect(() => {
    if (isOpen) {
      const defaults = Object.keys(oldData).reduce((acc, key) => {
        acc[key] = "old"
        return acc
      }, {} as Record<string, "old" | "new">)
      setSelectedValues(defaults)
    }
  }, [isOpen, oldData])

  const handleSelect = (key: string, choice: "old" | "new") => {
    setSelectedValues((prev) => ({ ...prev, [key]: choice }))
  }

  const handleMerge = () => {
    const merged = Object.keys({ ...oldData, ...newData }).reduce((acc, key) => {
      const choice = selectedValues[key]
      acc[key] = choice === "new" ? newData[key] : oldData[key]
      return acc
    }, {} as Record<string, any>)
    onMerge(merged)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-5xl !w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Data Reconciliation
          </DialogTitle>
          <DialogDescription>
            Compare the <span className="font-medium text-green-700">new data</span> and
            <span className="font-medium text-gray-700"> old data</span>. Choose which values to
            keep before merging.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-3 mt-2">
          <div className="grid grid-cols-2 gap-8">
            <Card className="border-green-300 shadow-sm">
              <CardHeader className="pb-2 font-semibold text-green-700 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span>New Data</span>
                  <Check className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-green-50 p-2 rounded-md">
                  <Info className="w-4 h-4 text-green-600" />
                  <span>
                    Select any field here to update and replace the corresponding value in the old data.
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {Object.keys(newData).map((key) => (
                  <div
                    key={key}
                    className="flex justify-between items-center border-b border-gray-200 py-2"
                  >
                    <div className="flex flex-col w-full">
                      <Label className="text-xs text-gray-500">{key}</Label>
                      <span className="text-sm truncate">{String(newData[key] ?? "—")}</span>
                    </div>
                    <RadioGroup
                      value={selectedValues[key] === "new" ? "new" : ""}
                      onValueChange={() => handleSelect(key, "new")}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="new" id={`new-${key}`} />
                        <Label htmlFor={`new-${key}`} className="text-xs cursor-pointer">
                          Use
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-gray-300 shadow-sm">
              <CardHeader className="pb-2 font-semibold text-gray-700 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span>Old Data</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-md">
                  <Info className="w-4 h-4 text-gray-600" />
                  <span>
                    These are the current values. They’re selected by default unless you choose a new one to replace them.
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {Object.keys(oldData).map((key) => (
                  <div
                    key={key}
                    className="flex justify-between items-center border-b border-gray-200 py-2"
                  >
                    <div className="flex flex-col w-full">
                      <Label className="text-xs text-gray-500">{key}</Label>
                      <span className="text-sm truncate">{String(oldData[key] ?? "—")}</span>
                    </div>
                    <RadioGroup
                      value={selectedValues[key] === "old" ? "old" : ""}
                      onValueChange={() => handleSelect(key, "old")}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="old" id={`old-${key}`} />
                        <Label htmlFor={`old-${key}`} className="text-xs cursor-pointer">
                          Use
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleMerge} className="bg-green-600 hover:bg-green-700 text-white">
            Merge Selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

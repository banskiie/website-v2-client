import React, { useState } from "react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { CheckIcon, ChevronsUpDownIcon, Eraser } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "../ui/label"

type IOption = {
  label: string
  value: string
}

const ColumnFilter = ({
  label,
  filterKey,
  filterType,
  filterValue,
  onFilterChange,
  options = [],
}: {
  label: string
  filterKey: string
  filterType:
    | "TEXT"
    | "SELECT"
    | "NUMBER"
    | "NUMBER_RANGE"
    | "DATE"
    | "DATE_RANGE"
    | "BOOLEAN"
  filterValue: { key: string; value: string; type: string }[]
  onFilterChange: (value: any) => void
  options?: IOption[]
}) => {
  const [filterTerm, setFilterTerm] = useState(
    filterValue.find((f) => f.key === filterKey)?.value || ""
  )
  let filterComponent
  const [openCommand, setOpenCommand] = useState(false)

  switch (filterType) {
    case "TEXT":
      filterComponent = (
        <>
          <Input
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            placeholder={`Filter ${label}`}
            onKeyDown={(e) => {
              const trimmedTerm = filterTerm.trim()
              if (e.key === "Enter") {
                // If empty, remove filter
                if (!trimmedTerm) {
                  setFilterTerm("")
                  return onFilterChange((prev: any) =>
                    prev.filter((f: any) => f.key !== filterKey)
                  )
                } else {
                  // Add / update filter
                  onFilterChange((prev: any) => [
                    ...prev.filter((f: any) => f.key !== filterKey),
                    { key: filterKey, value: trimmedTerm, type: "TEXT" },
                  ])
                }
              }
            }}
            className={cn(filterTerm && "rounded-tr-none rounded-br-none")}
          />
          {filterTerm && (
            <Button
              className="rounded-tl-none rounded-bl-none"
              variant="destructive"
              onClick={() => {
                setFilterTerm("")
                onFilterChange((prev: any) =>
                  prev.filter((f: any) => f.key !== filterKey)
                )
              }}
            >
              <Eraser />
            </Button>
          )}
        </>
      )
      break
    case "SELECT":
      filterComponent = (
        <Popover open={openCommand} onOpenChange={setOpenCommand}>
          <PopoverTrigger asChild>
            <div className="w-full flex items-center">
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCommand}
                className={cn(
                  filterTerm && "rounded-tr-none rounded-br-none text-black",
                  "flex-1 justify-between text-muted-foreground bg-transparent hover:bg-transparent hover:text-muted-foreground capitalize"
                )}
              >
                {filterValue.some((f: any) => f.key === filterKey)
                  ? options?.find(
                      (o: IOption) => o.value === filterTerm.toString()
                    )?.label
                  : `Filter ${label}`}
                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
              {filterTerm && (
                <Button
                  className="rounded-tl-none rounded-bl-none"
                  variant="destructive"
                  onClick={() => {
                    setFilterTerm("")
                    onFilterChange((prev: any) =>
                      prev.filter((f: any) => f.key !== filterKey)
                    )
                  }}
                >
                  <Eraser />
                </Button>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder={`Filter ${label}`} />
              <CommandList className="max-h-72 overflow-y-auto">
                <CommandEmpty>No {label} found.</CommandEmpty>
                <CommandGroup>
                  <Label className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
                    {label}
                  </Label>
                  {options?.map((o: IOption) => (
                    <CommandItem
                      key={o.value}
                      value={o.value}
                      onSelect={(currentValue) => {
                        if (currentValue === filterTerm) {
                          setFilterTerm("")
                          onFilterChange((prev: any) =>
                            prev.filter((f: any) => f.key !== filterKey)
                          )
                        } else {
                          setFilterTerm(currentValue)
                          onFilterChange((prev: any) => [
                            ...prev.filter((f: any) => f.key !== filterKey),
                            {
                              key: filterKey,
                              value: currentValue,
                              type: "TEXT",
                            },
                          ])
                        }
                        setOpenCommand(false)
                      }}
                      className="capitalize"
                    >
                      <CheckIcon
                        className={cn(
                          "h-4 w-4",
                          filterTerm.toString() === o.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {o.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )
      break
    case "BOOLEAN":
      filterComponent = (
        <>
          <Select
            value={filterValue.find((f) => f.key === filterKey)?.value || ""}
            onValueChange={(value) => {
              if (value === "true" || value === "false")
                onFilterChange((prev: any) => [
                  ...prev.filter((f: any) => f.key !== filterKey),
                  { key: filterKey, value, type: "BOOLEAN" },
                ])
            }}
          >
            <SelectTrigger
              className={cn(
                "w-full",
                filterValue.find((f) => f.key === filterKey)?.value &&
                  "rounded-tr-none rounded-br-none"
              )}
            >
              <SelectValue
                className="py-2 h-100"
                placeholder={`Filter ${label}`}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          {filterValue.find((f) => f.key === filterKey) && (
            <Button
              className="rounded-tl-none rounded-bl-none"
              variant="destructive"
              onClick={() => {
                onFilterChange((prev: any) =>
                  prev.filter((f: any) => f.key !== filterKey)
                )
              }}
            >
              <Eraser />
            </Button>
          )}
        </>
      )
    default:
      break
  }
  return (
    <div className="flex my-2 items-center justify-center">
      {filterComponent}
    </div>
  )
}

export default ColumnFilter

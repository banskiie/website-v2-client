import React, { useEffect, useState } from "react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon,
  Eraser,
} from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { DateRange } from "react-day-picker"
import { formatDateRange } from "little-date"
import { Calendar } from "@/components/ui/calendar"
import { set } from "zod"
import {
  addHours,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns"

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
  // Date Range Picker State
  const [openDateRangePopover, setOpenDateRangePopover] = React.useState(false)
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })

  useEffect(() => {
    if (
      filterType === "DATE_RANGE" &&
      filterValue.find((f) => f.key === filterKey)
    ) {
      const [from, to] = filterValue
        .find((f) => f.key === filterKey)!
        .value.split("_")
      setDateRange({
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
      })
    }
  }, [filterType, filterValue, filterKey])

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
                <SelectLabel>{label}</SelectLabel>
                <SelectItem value="true">
                  {filterKey == "isActive" ? "Active" : "Yes"}
                </SelectItem>
                <SelectItem value="false">
                  {filterKey == "isActive" ? "Inactive" : "No"}
                </SelectItem>
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
      break
    case "DATE_RANGE":
      filterComponent = (
        <Popover
          open={openDateRangePopover}
          onOpenChange={setOpenDateRangePopover}
        >
          <PopoverTrigger asChild>
            <div className="w-full flex items-center">
              <Button
                variant="outline"
                id="date"
                className={cn(
                  "flex-1 justify-between font-medium text-muted-foreground",
                  dateRange?.from &&
                    dateRange?.to &&
                    "text-black rounded-r-none"
                )}
              >
                {dateRange?.from && dateRange?.to
                  ? formatDateRange(dateRange.from, dateRange.to, {
                      includeTime: false,
                    })
                  : `Filter ${label}`}
                <ChevronDownIcon />
              </Button>
              {dateRange?.from && dateRange?.to && (
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
            </div>
          </PopoverTrigger>

          <PopoverContent
            className="w-auto overflow-hidden p-0 flex"
            align="start"
          >
            <div className="p-2 flex flex-col items-center border-r space-y-1.5">
              <Label className="text-sm font-normal text-muted-foreground text-center">
                Quick Select
              </Label>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  setDateRange({
                    from: startOfDay(new Date()),
                    to: endOfDay(new Date()),
                  })
                }
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  setDateRange({
                    from: startOfWeek(new Date()),
                    to: endOfWeek(new Date()),
                  })
                }
              >
                This Week
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  setDateRange({
                    from: startOfMonth(new Date()),
                    to: endOfMonth(new Date()),
                  })
                }
              >
                This Month
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  setDateRange({
                    from: startOfYear(new Date()),
                    to: endOfYear(new Date()),
                  })
                }
              >
                This Year
              </Button>
            </div>
            <div>
              <Calendar
                mode="range"
                captionLayout="dropdown"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
              <div className="p-2 flex gap-2 justify-end">
                <Button
                  variant="outline-destructive"
                  size="sm"
                  onClick={() => {
                    setDateRange({ from: undefined, to: undefined })
                    onFilterChange((prev: any) =>
                      prev.filter((f: any) => f.key !== filterKey)
                    )
                  }}
                >
                  Reset
                </Button>
                <Button
                  variant="outline-info"
                  size="sm"
                  onClick={() => {
                    setDateRange({ from: undefined, to: undefined })
                  }}
                >
                  Clear
                </Button>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => {
                    if (!dateRange?.from || !dateRange?.to) return
                    const dateRangeISO = `${format(
                      new Date(dateRange?.from),
                      "yyyy-MM-dd"
                    )}_${format(new Date(dateRange?.to), "yyyy-MM-dd")}`
                    onFilterChange((prev: any) => [
                      ...prev.filter((f: any) => f.key !== filterKey),
                      {
                        key: filterKey,
                        value: dateRangeISO,
                        type: "DATE_RANGE",
                      },
                    ])
                  }}
                >
                  Filter
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )
      break
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

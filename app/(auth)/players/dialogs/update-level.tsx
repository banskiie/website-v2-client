"use client"

import { gql } from "@apollo/client"
import { useMutation, useQuery } from "@apollo/client/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { PlayerLevel } from "@/types/player.interface"
import { format } from "date-fns"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"

const PLAYER = gql`
  query Player($_id: ID!) {
    player(_id: $_id) {
      firstName
      lastName
      levels {
        level
        dateLevelled
      }
    }
  }
`

const UPDATE_LEVEL = gql`
  mutation UpdateLevel($input: UpdateLevelInput!) {
    updateLevel(input: $input) {
      ok
      message
    }
  }
`

type Props = {
  _id?: string
  onClose?: () => void
}

const UpdateLevelDialog = (props: Props) => {
  // Dialog open state
  const [open, setOpen] = useState(false)
  // Fetch existing date if updating
  const { data, loading: playerLoading }: any = useQuery(PLAYER, {
    variables: { _id: props._id },
    skip: !open || !Boolean(props._id),
    fetchPolicy: "network-only",
  })
  // Mutation for changing status
  const [updateLevel, { loading: changeStatusLoading }] =
    useMutation(UPDATE_LEVEL)
  // Loading State
  const loading = playerLoading || changeStatusLoading
  // Form State
  const [form, setForm] = useState<{ level: PlayerLevel; dateLevelled: Date }>({
    level: PlayerLevel.BEGINNER,
    dateLevelled: new Date(),
  })

  const onSubmit = async () => {
    try {
      const result: any = await updateLevel({
        variables: {
          input: {
            _id: props._id,
            level: form.level,
            dateLevelled: form.dateLevelled,
          },
        },
      })
      if (result) onClose()
    } catch (error: any) {
      console.error("Error changing player status:", error)
      toast.error(error.message || "Failed to change player status.")
    }
  }

  const onClose = () => {
    setOpen(false)
    props.onClose?.()
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <form>
        <AlertDialogTrigger asChild>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            Update Level
          </DropdownMenuItem>
        </AlertDialogTrigger>
        <AlertDialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Update Level for Player: {data?.player?.firstName}{" "}
              {data?.player?.lastName}
            </AlertDialogTitle>
            <AlertDialogDescription>
              <span className="block text-foreground">
                Are you sure you want to{" "}
                <span className={cn("font-semibold underline")}>
                  update the level
                </span>{" "}
                of this player?
              </span>
              <div className="pt-1 pb-2 flex flex-wrap items-center gap-4">
                <div className="space-y-1 flex-1">
                  <Label>Skill Level</Label>
                  <Select
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        level: value as PlayerLevel,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full" size="sm">
                      <SelectValue placeholder="Select Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Object.values(PlayerLevel).map((level) => (
                          <SelectItem value={level} key={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <span className="text-2xl -mb-2.5">→</span>
                <div className="space-y-1 flex-1">
                  <Label>Date Levelled</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="birth-date"
                        name="birth-date"
                        variant="outline"
                        className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal flex -mt-1"
                        disabled={loading}
                      >
                        <CalendarIcon className="size-3.5" />
                        {form.dateLevelled ? (
                          format(form.dateLevelled, "PP")
                        ) : (
                          <span>Select Birth Date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        captionLayout="dropdown"
                        required
                        selected={form.dateLevelled}
                        onSelect={(date) =>
                          setForm((prev) => ({
                            ...prev,
                            dateLevelled: date,
                          }))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              {!!(data?.player?.levels && data?.player?.levels.length) ? (
                <div className="space-y-1">
                  <span>Latest Levels</span>
                  <div className="max-h-48 overflow-y-auto border p-1">
                    {data?.player?.levels.map((item: any, index: number) => (
                      <span className="block" key={index}>
                        {item.level}→ {format(item.dateLevelled, "PPp")}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <span>Unlevelled.</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button loading={loading} onClick={onSubmit}>
              Update
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </form>
    </AlertDialog>
  )
}

export default UpdateLevelDialog

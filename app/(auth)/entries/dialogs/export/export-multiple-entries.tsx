"use client"

import { gql } from "@apollo/client"
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  Select,
} from "@/components/ui/select"
import { format } from "date-fns"
import { Label } from "@/components/ui/label"
import { EntryStatus } from "@/types/entry.interface"
import { Input } from "@/components/ui/input"

const EXPORT = gql`
  query ExportPlayersWithMultipleEntries($tournamentId: ID!, $statuses: [EntryStatus], $count: Int) {
    exportPlayersWithMultipleEntries(tournamentId: $tournamentId, statuses: $statuses, count: $count) {
        tournament
        players {
            firstName
            lastName
            birthDate
            jerseySizes
            email
            phoneNumber
            entryNumbers
        }
    }
}
`

const TOURNAMENT_OPTIONS = gql`
  query TournamentOptions {
    tournamentOptions {
      label
      value
      hasEarlyBird
      earlyBirdRegistrationEnd
    }
  }
`

type Props = {
  onClose?: () => void
}

const ExportMultipleEntries = (props: Props) => {
  // Dialog open state
  const [open, setOpen] = useState(false)

  // Tournament options for select dropdown
  const { data: tournamentOptionsData } = useQuery(TOURNAMENT_OPTIONS)
  const tournamentOptions =
    (tournamentOptionsData as any)?.tournamentOptions || []
  const [selectedTournament, setSelectedTournament] = useState<string>("")
  // Mutation for changing status
  const [exportEntries, { loading: changeStatusLoading }] = useLazyQuery(EXPORT)
  // Loading State
  const loading = changeStatusLoading
  const [selectedStatus, setSelectedStatus] = useState<string>("VERIFIED")
  const [statuses, setStatuses] = useState<string[]>([
    EntryStatus.VERIFIED,
    EntryStatus.PAYMENT_VERIFIED,
  ])
  const [count, setCount] = useState<number>(2)


  const onSubmit = async () => {
    try {
      const result: any = await exportEntries({
        variables: { tournamentId: selectedTournament, statuses, count },
      })
      const response = await fetch("/api/export/multiple-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: result.data.exportPlayersWithMultipleEntries }),
      })
      const blob = await response.blob()

      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `Exported Entries (${format(new Date(), "MMM dd, yyyy, hmm a")}).xlsx`
      link.click()
      if (result) {
        onClose()
      }
    } catch (error: any) {
      console.error("Error exporting entries by status:", error)
      toast.error(error.message || "Failed to export entries by status.")
    }
  }

  const onClose = () => {
    setOpen(false)
    props.onClose?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogTrigger asChild>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            Multiple Entry Report
          </DropdownMenuItem>
        </DialogTrigger>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Export Multiple Entry Report</DialogTitle>
            <DialogDescription>
              <span className="block text-foreground">
                Are you sure you want to export the multiple entry report for the
                selected tournament?
              </span>
              <Select
                onValueChange={(value) => setSelectedTournament(value)}
                value={selectedTournament}
              >
                <SelectTrigger className="w-full mt-2 mb-3 text-black">
                  <SelectValue placeholder="Select a tournament" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Tournament</SelectLabel>
                    {tournamentOptions.map((option: any) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <div className="space-y-2">
                <Label>Select Statuses</Label>
                <Select
                  onValueChange={(value) => {
                    setSelectedStatus(value)
                    switch (value) {
                      case "ALL":
                        setStatuses([
                          EntryStatus.PENDING,
                          EntryStatus.PAYMENT_PENDING,
                          EntryStatus.LEVEL_PENDING,
                          EntryStatus.LEVEL_APPROVED,
                          EntryStatus.PAYMENT_PARTIALLY_PAID,
                          EntryStatus.PAYMENT_PAID,
                          EntryStatus.PAYMENT_VERIFIED,
                          EntryStatus.VERIFIED,
                        ])
                        break
                      case "UNASSIGNED":
                        setStatuses([EntryStatus.PENDING])
                        break
                      case "PENDING":
                        setStatuses([
                          EntryStatus.PENDING,
                          EntryStatus.ASSIGNED,
                          EntryStatus.LEVEL_PENDING,
                        ])
                        break
                      case "PAYMENT_PENDING":
                        setStatuses([
                          EntryStatus.PAYMENT_PENDING,
                          EntryStatus.PAYMENT_PARTIALLY_PAID,
                        ])
                        break
                      case "PAID":
                        setStatuses([
                          EntryStatus.PAYMENT_PAID,
                          EntryStatus.VERIFIED,
                          EntryStatus.PAYMENT_VERIFIED,
                        ])
                        break
                           case "APPROVED":
                        setStatuses([
                          EntryStatus.LEVEL_APPROVED,
                          EntryStatus.PAYMENT_PENDING,
                          EntryStatus.PAYMENT_PARTIALLY_PAID,
                          EntryStatus.PAYMENT_PAID,
                          EntryStatus.PAYMENT_VERIFIED,
                          EntryStatus.VERIFIED,
                        ])
                        break
                      case "VERIFIED":
                        setStatuses([
                          EntryStatus.VERIFIED,
                          EntryStatus.PAYMENT_VERIFIED,
                        ])
                        break
                    }
                  }}
                  value={selectedStatus}
                >
                  <SelectTrigger className="w-full text-black">
                    <SelectValue placeholder="Select entry status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Select Entry Status</SelectLabel>
                      <SelectItem value="ALL">All</SelectItem>
                      <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PAYMENT_PENDING">
                        Payment Pending
                      </SelectItem>
                      <SelectItem value="PAID">
                        Fully Paid
                      </SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="VERIFIED">Verified</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Input type="number" value={count} onChange={(e) => setCount(Number(e.target.value))} placeholder="Minimum number of entries" />
                {/* <FieldGroup className="grid grid-cols-2 place-content-center gap-px p-2 border rounded-md">
                  {Object.values(EntryStatus).map((status) => (
                    <Field orientation="horizontal" key={status}>
                      <Checkbox
                        id={`status-${status}`}
                        name={`status-${status}`}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setStatuses((prev) => [
                              ...prev,
                              status as EntryStatus,
                            ])
                          } else {
                            setStatuses((prev) =>
                              prev.filter((s) => s !== status),
                            )
                          }
                        }}
                      />
                      <FieldLabel
                        htmlFor={`status-${status}`}
                        className="font-normal capitalize"
                      >
                        {status.replaceAll("_", " ").toLocaleLowerCase()}
                      </FieldLabel>
                    </Field>
                  ))}
                </FieldGroup> */}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button loading={loading} onClick={onSubmit}>
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}

export default ExportMultipleEntries

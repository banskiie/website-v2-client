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

const EXPORT = gql`
  query ExportEntriesByStatus($statuses: [EntryStatus!], $tournamentId: ID!) {
    exportEntriesByStatus(tournamentId: $tournamentId, statuses: $statuses) {
      tournament
      entries {
        eventName
        entryNumber
        entryStatus
        paymentStatus
        paymentDate
        isInSoftware
        club
        player1FirstName
        player1LastName
        player1Email
        player1PhoneNumber
        player1Gender
        player1Birthdate
        player1JerseySize
        player2FirstName
        player2LastName
        player2Email
        player2PhoneNumber
        player2Gender
        player2Birthdate
        player2JerseySize
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

const ExportEntriesByStatus = (props: Props) => {
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

  const onSubmit = async () => {
    try {
      const result: any = await exportEntries({
        variables: { tournamentId: selectedTournament, statuses },
      })
      const response = await fetch("/api/export/entries-by-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: result.data.exportEntriesByStatus }),
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
            Entries
          </DropdownMenuItem>
        </DialogTrigger>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Export Entries By Status</DialogTitle>
            <DialogDescription>
              <span className="block text-foreground">
                Are you sure you want to export the entries by status for the
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
                      <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PAYMENT_PENDING">
                        Payment Pending
                      </SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="VERIFIED">Verified</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
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

export default ExportEntriesByStatus

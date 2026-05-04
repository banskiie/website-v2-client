"use client"

import { gql } from "@apollo/client"
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { EntryStatus } from "@/types/entry.interface"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const EXPORT_PLAYERS_BY_STATUS = gql`
  query ExportPlayersByStatus($tournamentId: ID!, $status: [EntryStatus]) {
    exportPlayersByStatus(status: $status, tournamentId: $tournamentId) {
      tournament
      players {
        entryNumber
        eventName
        status
        players {
          firstName
          lastName
          phoneNumber
        }
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

const ExportPlayerByStatusDialog = (props: Props) => {
  // Dialog open state
  const [open, setOpen] = useState(false)

  // Tournament options for select dropdown
  const { data: tournamentOptionsData } = useQuery(TOURNAMENT_OPTIONS)
  const tournamentOptions =
    (tournamentOptionsData as any)?.tournamentOptions || []
  const [selectedTournament, setSelectedTournament] = useState<string>("")
  // Mutation for changing status
  const [exportEntries, { loading: changeStatusLoading }] = useLazyQuery(
    EXPORT_PLAYERS_BY_STATUS,
  )
  // Loading State
  const loading = changeStatusLoading
  // Status Handler
  const [statuses, setStatuses] = useState<EntryStatus[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>("")

  const onSubmit = async () => {
    try {
      if (statuses.length === 0) {
        toast.error("Please select at least one status.")
        return
      }
      if (!selectedTournament) {
        toast.error("Please select a tournament.")
        return
      }
      const result: any = await exportEntries({
        variables: { tournamentId: selectedTournament, status: statuses },
      })
      // console.log(result)
      const response = await fetch("/api/export/players-by-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: result.data.exportPlayersByStatus }),
      })
      const blob = await response.blob()

      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `Exported Players By Status (${format(new Date(), "MMM dd, yyyy, hmm a")}).xlsx`
      link.click()
      if (result) {
        onClose()
      }
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
            Player By Status
          </DropdownMenuItem>
        </AlertDialogTrigger>
        <AlertDialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Export Entries</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="block text-foreground">
                Are you sure you want to export the entries for the selected
                tournament?
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
                    <SelectLabel>Status</SelectLabel>
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
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button loading={loading} onClick={onSubmit}>
              Export
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </form>
    </AlertDialog>
  )
}

export default ExportPlayerByStatusDialog

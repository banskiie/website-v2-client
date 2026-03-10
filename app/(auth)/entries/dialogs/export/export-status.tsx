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

const EXPORT_ENTRIES = gql`
  query ExportEntries($tournamentId: ID!) {
    exportEntries(tournamentId: $tournamentId) {
      tournament
      events {
        eventName
        total
        paid
        approved
        pending
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

const BatchStatusDialog = (props: Props) => {
  // Dialog open state
  const [open, setOpen] = useState(false)

  // Tournament options for select dropdown
  const { data: tournamentOptionsData } = useQuery(TOURNAMENT_OPTIONS)
  const tournamentOptions =
    (tournamentOptionsData as any)?.tournamentOptions || []
  const [selectedTournament, setSelectedTournament] = useState<string>("")
  // Mutation for changing status
  const [exportEntries, { loading: changeStatusLoading }] =
    useLazyQuery(EXPORT_ENTRIES)
  // Loading State
  const loading = changeStatusLoading

  const onSubmit = async () => {
    try {
      const result: any = await exportEntries({
        variables: { tournamentId: selectedTournament },
      })
      // console.log(result)
      const response = await fetch("/api/export/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: result.data.exportEntries }),
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
            Entries
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
              <span className="block text-xs">
                <span className="text-destructive">*</span> Note: This will
                affect their access to the system
              </span>
              <span className="block text-xs">
                <span className="text-info">**</span> Additional Note: You
                cannot change the status of your own player account.
              </span>
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

export default BatchStatusDialog

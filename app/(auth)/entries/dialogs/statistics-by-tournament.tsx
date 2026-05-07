"use client";

import { gql } from "@apollo/client";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  Select,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { EntryStatus } from "@/types/entry.interface";
import { Input } from "@/components/ui/input";

const EXPORT = gql`
  query ExportPlayersWithMultipleEntries(
    $tournamentId: ID!
    $statuses: [EntryStatus]
    $count: Int
  ) {
    exportPlayersWithMultipleEntries(
      tournamentId: $tournamentId
      statuses: $statuses
      count: $count
    ) {
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
`;

const CHECK_EVENTS_BY_TOURNAMENT = gql`
  query CheckEventsByTournament($tournamentId: ID!) {
    checkEventsByTournament(tournamentId: $tournamentId) {
      eventName
      maxSlots
      currentApprovedEntries
    }
  }
`;

const TOURNAMENT_OPTIONS = gql`
  query TournamentOptions {
    tournamentOptions {
      label
      value
      hasEarlyBird
      earlyBirdRegistrationEnd
    }
  }
`;

type Props = {
  onClose?: () => void;
};

const CheckStats = (props: Props) => {
  // Dialog open state
  const [open, setOpen] = useState(false);

  // Tournament options for select dropdown
  const { data: tournamentOptionsData } = useQuery(TOURNAMENT_OPTIONS, {
    skip: !open,
  });
  const tournamentOptions =
    (tournamentOptionsData as any)?.tournamentOptions || [];
  const [selectedTournament, setSelectedTournament] = useState<string>("");
  // Mutation for changing status

  const { data: checkEventsData, loading: checkEventsLoading } = useQuery(
    CHECK_EVENTS_BY_TOURNAMENT,
    {
      variables: { tournamentId: selectedTournament },
      skip: !selectedTournament && !open,
    },
  );
  const events = (checkEventsData as any)?.checkEventsByTournament || [];
  console.log(events);

  const onClose = () => {
    setOpen(false);
    setSelectedTournament("");
    if (props.onClose) props.onClose();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline">Check Stats</Button>
        </DialogTrigger>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Export Multiple Entry Report</DialogTitle>
            <DialogDescription>
              <span className="block text-foreground">
                Are you sure you want to export the multiple entry report for
                the selected tournament?
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
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-50 overflow-y-auto gap-1.5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-4">
            {checkEventsLoading
              ? "Loading..."
              : events.map((event: any) => (
                  <div key={event.eventName} className="border p-3">
                    <span className="block text-xs font-bold">
                      {event.eventName}
                    </span>
                    <span className="block text-xs">
                      Approved: {event.currentApprovedEntries}
                    </span>
                    <span className="block text-xs">
                      Entry Limit:{" "}
                      {event.maxSlots > 0 ? event.maxSlots : "No limit"}
                    </span>
                  </div>
                ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default CheckStats;

"use client"

import { gql } from "@apollo/client"
import { useMutation, useQuery, useApolloClient } from "@apollo/client/react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import ViewDialog from "./view"
import { AlertTriangle } from "lucide-react"

const PLAYER = gql`
  query Entry($_id: ID!) {
    entry(_id: $_id) {
      _id
      entryNumber
      event {
        _id
        name
      }
    }
  }
`

const APPROVE = gql`
  mutation ApproveEntry($_id: ID!) {
    approveEntry(_id: $_id) {
      ok
      message
    }
  }
`

const GET_EVENT_BY_NAME = gql`
  query GetEventByName($name: String!) {
    events(filter: [{ key: "name", value: $name, type: TEXT }], first: 1) {
      edges {
        node {
          _id
          name
        }
      }
    }
  }
`

const GET_EVENT_DETAILS = gql`
  query GetEventDetails($eventId: ID!) {
    event(_id: $eventId) {
      _id
      name
      maxEntries
    }
  }
`

const GET_APPROVED_ENTRY_COUNT = gql`
  query GetApprovedEntryCount($eventId: ID!) {
    approvedEntryCountByEvent(eventId: $eventId)
  }
`

type Props = {
  _id?: string
  onClose?: () => void
  triggerClassName?: string
  variant?: "dropdown" | "button"
}

const ApproveDialog = (props: Props) => {
  const client = useApolloClient()
  // Dialog open state
  const [open, setOpen] = useState(false)
  const [warningMessage, setWarningMessage] = useState<string | null>(null)
  const [warningType, setWarningType] = useState<"warning" | "danger" | null>(null)
  const [remainingSlotsBefore, setRemainingSlotsBefore] = useState<number | null>(null)
  const [remainingSlotsAfter, setRemainingSlotsAfter] = useState<number | null>(null)
  const [maxEntries, setMaxEntries] = useState<number | null>(null)
  const [pendingApproval, setPendingApproval] = useState(false)
  const [capacityChecked, setCapacityChecked] = useState(false)

  // Fetch existing date if updating
  const { data, loading: playerLoading, refetch } = useQuery(PLAYER, {
    variables: { _id: props._id },
    skip: !open || !Boolean(props._id),
    fetchPolicy: "network-only",
  })
  const [approveEntry, { loading: changeStatusLoading }] = useMutation(APPROVE, {
    variables: { _id: props._id },
  })
  const loading = playerLoading || changeStatusLoading

  const entryData = (data as any)?.entry;

  // // Log when dialog opens
  // useEffect(() => {
  //   if (open) {
  //     console.log("Dialog opened, entryData:", entryData);
  //   }
  // }, [open, entryData]);

  // Check capacity when dialog opens and data is loaded
  useEffect(() => {
    if (open && entryData && !capacityChecked) {
      checkCapacityOnOpen();
    }
  }, [open, entryData, capacityChecked]);

  const checkCapacityOnOpen = async () => {
    const entry = entryData;

    if (!entry?.event?.name) {
      setWarningMessage(null);
      setRemainingSlotsBefore(null);
      setRemainingSlotsAfter(null);
      setMaxEntries(null);
      return;
    }

    try {
      const eventResult = await client.query({
        query: GET_EVENT_BY_NAME,
        variables: { name: entry.event.name },
        fetchPolicy: "network-only",
      });

      const eventData = eventResult.data as any;
      const events = eventData?.events?.edges || [];

      if (events.length === 0) {
        setWarningMessage(null);
        setRemainingSlotsBefore(null);
        setRemainingSlotsAfter(null);
        setMaxEntries(null);
        return;
      }

      const eventId = events[0].node._id;

      const eventDetailsResult = await client.query({
        query: GET_EVENT_DETAILS,
        variables: { eventId },
        fetchPolicy: "network-only",
      });

      const eventDetails = (eventDetailsResult.data as any)?.event;

      if (!eventDetails || !eventDetails.maxEntries) {
        setWarningMessage(null);
        setRemainingSlotsBefore(null);
        setRemainingSlotsAfter(null);
        setMaxEntries(null);
        return;
      }

      const countResult = await client.query({
        query: GET_APPROVED_ENTRY_COUNT,
        variables: { eventId },
        fetchPolicy: "network-only",
      });

      const approvedCount = (countResult.data as any)?.approvedEntryCountByEvent || 0;

      const remainingSlotsBeforeApproval = eventDetails.maxEntries - approvedCount;

      const remainingSlotsAfterApproval = eventDetails.maxEntries - (approvedCount + 1);

      setRemainingSlotsBefore(remainingSlotsBeforeApproval);
      setRemainingSlotsAfter(remainingSlotsAfterApproval);
      setMaxEntries(eventDetails.maxEntries);

      if (remainingSlotsAfterApproval <= 5 && remainingSlotsAfterApproval > 0) {
        setWarningType("warning");
        if (remainingSlotsAfterApproval === 1) {
          setWarningMessage(
            `⚠️ LAST SLOT! After approving this entry, only 1 slot will remain for "${eventDetails.name}".`
          );
        } else {
          setWarningMessage(
            `⚠️ WARNING: After approving this entry, only ${remainingSlotsAfterApproval} slot${remainingSlotsAfterApproval !== 1 ? 's' : ''} will remain for "${eventDetails.name}"!`
          );
        }
      } else if (remainingSlotsAfterApproval === 0) {
        setWarningType("danger");
        setWarningMessage(
          `❌ EVENT WILL BE FULL: After approving this entry, "${eventDetails.name}" will reach its maximum capacity of ${eventDetails.maxEntries} entries.`
        );
      } else if (remainingSlotsAfterApproval < 0) {
        setWarningType("danger");
        setWarningMessage(
          `❌ EVENT OVER CAPACITY: This event already has ${approvedCount} approved entries out of ${eventDetails.maxEntries} maximum. This entry cannot be approved.`
        );
      } else {
        setWarningMessage(null);
        setWarningType(null);
      }

      setCapacityChecked(true);
    } catch (error) {
      console.error("Error checking capacity:", error);
      setWarningMessage(null);
      setRemainingSlotsBefore(null);
      setRemainingSlotsAfter(null);
      setMaxEntries(null);
      setCapacityChecked(true);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setCapacityChecked(false);
      setWarningMessage(null);
      setWarningType(null);
      setRemainingSlotsBefore(null);
      setRemainingSlotsAfter(null);
      setMaxEntries(null);
    }
  };

  const onSubmit = async () => {
    if (warningType === "danger") {
      toast.error("Cannot approve entry. Event has reached maximum capacity.");
      return;
    }

    setPendingApproval(true);
    try {
      const result: any = await approveEntry()
      if (result) {
        setOpen(false)
        props.onClose?.()
      }
    } catch (error: any) {
      console.error("Error changing player status:", error)
      toast.error(error.message || "Failed to change player status.")
    } finally {
      setPendingApproval(false);
    }
  }

  const onClose = () => {
    setOpen(false)
    props.onClose?.()
  }

  const isDropdown = props.variant === "dropdown"

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {isDropdown ? (
            <div
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-success/10 hover:text-success focus:bg-success/10 focus:text-success text-success"
              onSelect={(e) => e.preventDefault()}
            >
              Approve
            </div>
          ) : (
            <Button variant="success" className="w-full sm:w-auto">
              Approve
            </Button>
          )}
        </DialogTrigger>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="w-[95vw] max-w-lg mx-auto p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader className="space-y-2 sm:space-y-3">
            <DialogTitle className="text-base sm:text-lg">
              Approve Entry: {entryData?.entryNumber}
            </DialogTitle>
            <DialogDescription>
              <span className="block text-foreground text-sm sm:text-base">
                Are you sure you want to approve this entry?
              </span>
            </DialogDescription>
          </DialogHeader>

          {remainingSlotsBefore !== null && remainingSlotsBefore >= 0 && remainingSlotsBefore <= 5 && (
            <div className="mt-4 p-4 rounded-lg border-2 bg-red-50 border-red-400">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  Only {remainingSlotsBefore} Slot{remainingSlotsBefore !== 1 ? 's' : ''} Remaining
                </p>
                <p className="text-sm font-semibold underline underline-offset-2 tracking-wider text-green-600 mt-1">
                  Currently available
                </p>
                {maxEntries !== null && (
                  <p className="text-xs text-gray-600 mt-2">
                    Maximum Capacity: {maxEntries} total entries
                  </p>
                )}
              </div>
            </div>
          )}

          {warningMessage && (
            <div className={`p-4 rounded-lg border-2 ${warningType === "danger"
              ? "bg-red-50 border-red-400"
              : "bg-amber-50 border-amber-400"
              }`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${warningType === "danger" ? "bg-red-100" : "bg-amber-100"
                  }`}>
                  <AlertTriangle className={`w-5 h-5 ${warningType === "danger" ? "text-red-600" : "text-amber-600"
                    }`} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${warningType === "danger" ? "text-red-800" : "text-amber-800"
                    }`}>
                    {warningType === "danger" ? "Event Full" : "Action Warning"}
                  </p>
                  <p className={`text-sm mt-1 ${warningType === "danger" ? "text-red-700" : "text-amber-700"
                    }`}>
                    {warningType === "danger"
                      ? warningMessage
                      : `⚠️ After approving this entry, only ${remainingSlotsAfter} slot${remainingSlotsAfter !== 1 ? 's' : ''} will remain!`}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="my-3 sm:my-4">
            <ViewDialog
              externalUse
              _id={entryData?._id}
              title={`Click to view details: ${entryData?.entryNumber} 🔍`}
              titleClassName="block text-sm font-medium text-blue-600 hover:text-blue-800 break-words"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2 my-3 sm:my-4">
            <span className="text-destructive block text-xs sm:text-sm">
              <span className="font-bold">*</span>
              <span className="underline">This action cannot be reversed.</span>
            </span>
            <span className="block text-xs sm:text-sm text-muted-foreground">
              <span className="font-bold text-info">*</span>This will send an
              email notification to the players.
            </span>
            <span className="block text-xs sm:text-sm text-muted-foreground">
              <span className="font-bold text-info">*</span>This will allow the
              players to pay for their entry.
            </span>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              loading={loading || pendingApproval}
              variant={warningType === "danger" ? "destructive" : "success"}
              onClick={onSubmit}
              disabled={warningType === "danger"}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ApproveDialog
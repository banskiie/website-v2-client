"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ContextMenuItem } from "@/components/ui/context-menu"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { gql } from "@apollo/client"
import { useMutation, useQuery } from "@apollo/client/react"

const ASSIGN_TICKET = gql`
  mutation AssignTicket($id: ID!, $agentId: ID!) {
    assignTicket(_id: $id, agentId: $agentId) {
      ok
      message
    }
  }
`

const TICKET = gql`
  query TicketAgent($_id: ID!) {
    ticketAgent(_id: $_id) {
      assignedTo {
        _id
      }
    }
  }
`

const USER_OPTIONS = gql`
  query Options {
    userOptions {
      label
      value
    }
  }
`

type Props = {
  _id?: string
  onClose?: () => void
}

const AssignTicketDialog = (props: Props) => {
  // Dialog open state
  const [open, setOpen] = useState(false)
  const [agent, setAgent] = useState<string>("")
  const [assignTicket] = useMutation(ASSIGN_TICKET)
  const { data }: any = useQuery(USER_OPTIONS)
  const { data: ticketData }: any = useQuery(TICKET, {
    variables: { _id: props._id },
    skip: !props._id,
  })
  const { userOptions } = data || []

  useEffect(() => {
    if (ticketData?.ticketAgent?.assignedTo) {
      setAgent(ticketData.ticketAgent.assignedTo._id)
    }
  }, [ticketData])

  const onSubmit = async () => {
    try {
      const agentId = agent === "none" ? "" : agent
      const response: any = await assignTicket({
        variables: { id: props._id, agentId },
      })
      if (response) onClose()
    } catch (error: any) {
      console.error("Error changing event status:", error)
      toast.error(error.message || "Failed to change event status.")
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
          <ContextMenuItem onSelect={(e) => e.preventDefault()}>
            Assign Ticket
          </ContextMenuItem>
        </AlertDialogTrigger>
        <AlertDialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Assign Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to assign this ticket to an agent.
            </AlertDialogDescription>
            <Select onValueChange={(value) => setAgent(value)} value={agent}>
              <SelectTrigger size="sm" className="hover:bg-gray-100">
                <SelectValue placeholder="Select Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="none" className="text-muted-foreground">
                    Unassigned
                  </SelectItem>
                  {userOptions?.map((option: any) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onSubmit}>Assign</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </form>
    </AlertDialog>
  )
}

export default AssignTicketDialog

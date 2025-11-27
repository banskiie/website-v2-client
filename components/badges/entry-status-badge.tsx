import { EntryStatus } from "@/types/entry.interface"
import { Badge } from "@/components/ui/badge"

type Props = {
  status: EntryStatus
}

const EntryStatusBadge = (props: Props) => {
  switch (props.status) {
    case EntryStatus.PENDING:
      return (
        <Badge className="pointer-events-none bg-slate-400 capitalize">
          {props.status.toLocaleLowerCase()}
        </Badge>
      )
    case EntryStatus.ASSIGNED:
      return (
        <Badge className="pointer-events-none bg-cyan-500 capitalize">
          {props.status.toLocaleLowerCase()}
        </Badge>
      )
    case EntryStatus.LEVEL_PENDING:
      return (
        <Badge className="pointer-events-none bg-green-500 capitalize">
          {props.status.toLocaleLowerCase().replace("_", " ")}
        </Badge>
      )
    case EntryStatus.LEVEL_APPROVED:
      return (
        <Badge className="pointer-events-none bg-green-700/70 capitalize">
          {props.status.toLocaleLowerCase().replace("_", " ")}
        </Badge>
      )
    case EntryStatus.LEVEL_VERIFIED:
      return (
        <Badge className="pointer-events-none bg-green-800 capitalize">
          {props.status.toLocaleLowerCase().replace("_", " ")}
        </Badge>
      )
    case EntryStatus.PAYMENT_PENDING:
      return (
        <Badge className="pointer-events-none bg-amber-500 capitalize">
          {props.status.toLocaleLowerCase().replace("_", " ")}
        </Badge>
      )
    case EntryStatus.PAYMENT_PARTIALLY_PAID:
      return (
        <Badge className="pointer-events-none bg-amber-600 capitalize">
          {props.status.toLocaleLowerCase().replace("_", " ")}
        </Badge>
      )
    case EntryStatus.PAYMENT_PAID:
      return (
        <Badge className="pointer-events-none bg-amber-700 capitalize">
          {props.status.toLocaleLowerCase().replace("_", " ")}
        </Badge>
      )
    case EntryStatus.VERIFIED:
      return (
        <Badge className="pointer-events-none bg-sky-600 capitalize">
          {props.status.toLocaleLowerCase().replace("_", " ")}
        </Badge>
      )
    case EntryStatus.REJECTED:
      return (
        <Badge className="pointer-events-none bg-destructive capitalize">
          {props.status.toLocaleLowerCase().replace("_", " ")}
        </Badge>
      )
    case EntryStatus.CANCELLED:
      return (
        <Badge className="pointer-events-none bg-pink-400 capitalize">
          {props.status.toLocaleLowerCase().replace("_", " ")}
        </Badge>
      )
    default:
      return <Badge className="pointer-events-none bg-gray-700">Unknown</Badge>
  }
}

export default EntryStatusBadge

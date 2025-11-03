import { Badge } from "@/components/ui/badge"

type Props = {
  status: boolean
}

const StatusBadge = (props: Props) => {
  switch (props.status) {
    case true:
      return <Badge className="pointer-events-none bg-success">Yes</Badge>
    case false:
      return <Badge className="pointer-events-none bg-destructive">No</Badge>
    default:
      return <Badge className="pointer-events-none bg-gray-700">Unknown</Badge>
  }
}

export default StatusBadge

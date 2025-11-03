import { Badge } from "@/components/ui/badge"

type Props = {
  isActive: boolean
}

const ActiveBadge = (props: Props) => {
  switch (props.isActive) {
    case true:
      return (
        <Badge variant="outline-success" className="pointer-events-none">
          Active
        </Badge>
      )
    case false:
      return (
        <Badge variant="outline-destructive" className="pointer-events-none">
          Inactive
        </Badge>
      )
    default:
      return <Badge className="pointer-events-none bg-gray-700">Unknown</Badge>
  }
}

export default ActiveBadge

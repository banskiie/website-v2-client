import { Badge } from "@/components/ui/badge"
import { JerseyStatus, JerseySize } from "@/types/jersey.interface"

interface JerseyBadgeProps {
  value: JerseyStatus | JerseySize
}

export default function JerseyBadge({ value }: JerseyBadgeProps) {
  const isStatus = Object.values(JerseyStatus).includes(value as JerseyStatus)
  
  if (isStatus) {
    const status = value as JerseyStatus
    const getStatusConfig = (status: JerseyStatus) => {
      switch (status) {
        case JerseyStatus.PENDING:
          return { label: "Pending", variant: "outline" as const }
        case JerseyStatus.PAID:
          return { label: "Paid", variant: "secondary" as const }
        case JerseyStatus.CLAIMED:
          return { label: "Claimed", variant: "default" as const }
        case JerseyStatus.CANCELLED:
          return { label: "Cancelled", variant: "destructive" as const }
        default:
          return { label: status, variant: "outline" as const }
      }
    }
    
    const config = getStatusConfig(status)
    return <Badge variant={config.variant}>{config.label}</Badge>
  } else {
    const size = value as JerseySize
    return <Badge variant="outline" className="font-mono">{size}</Badge>
  }
}
import { PaymentStatus } from "@/types/payment.interface"
import { Badge } from "@/components/ui/badge"

type Props = {
  status: PaymentStatus
}

const PaymentStatusBadge = (props: Props) => {
  switch (props.status) {
    case PaymentStatus.SENT:
      return (
        <Badge className="pointer-events-none bg-slate-400 capitalize">
          {props.status.toLocaleLowerCase()}
        </Badge>
      )
    case PaymentStatus.VERIFIED:
      return (
        <Badge className="pointer-events-none bg-sky-600 capitalize">
          {props.status.toLocaleLowerCase().replace("_", " ")}
        </Badge>
      )
    case PaymentStatus.REJECTED:
      return (
        <Badge className="pointer-events-none bg-destructive capitalize">
          {props.status.toLocaleLowerCase().replace("_", " ")}
        </Badge>
      )
    case PaymentStatus.REFUNDED:
      return (
        <Badge className="pointer-events-none bg-destructive capitalize">
          {props.status.toLocaleLowerCase().replace("_", " ")}
        </Badge>
      )
    case PaymentStatus.DUPLICATE:
      return (
        <Badge className="pointer-events-none bg-purple-600 capitalize">
          {props.status.toLocaleLowerCase().replace("_", " ")}
        </Badge>
      )
    default:
      return <Badge className="pointer-events-none bg-gray-700">Unknown</Badge>
  }
}

export default PaymentStatusBadge

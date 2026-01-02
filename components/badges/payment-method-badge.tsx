import { PaymentMethod } from "@/types/payment.interface"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Props = {
  method: PaymentMethod
  className?: string
}

const PaymentMethodBadge = (props: Props) => {
  switch (props.method) {
    case PaymentMethod.GCASH:
      return (
        <Badge className={cn("pointer-events-none bg-emerald-500 capitalize", props.className)}>
          GCash
        </Badge>
      )
    case PaymentMethod.BANK_TRANSFER:
      return (
        <Badge className={cn("pointer-events-none bg-blue-500 capitalize", props.className)}>
          Bank Transfer
        </Badge>
      )
    case PaymentMethod.OVER_THE_COUNTER:
      return (
        <Badge className={cn("pointer-events-none bg-amber-500 capitalize", props.className)}>
          Over the Counter
        </Badge>
      )
    default:
      return (
        <Badge className={cn("pointer-events-none bg-gray-500 capitalize", props.className)}>
          {String(props.method).toLowerCase().replace("_", " ") || "Unknown"}
        </Badge>
      )
  }
}

export default PaymentMethodBadge
import React from "react"
import { Role } from "@/types/user.interface"
import { Badge } from "@/components/ui/badge"

type Props = {
  role: Role
}

const RoleBadge = (props: Props) => {
  switch (props.role) {
    case Role.ADMIN:
      return <Badge className="pointer-events-none bg-destructive">Admin</Badge>
    case Role.ACCOUNTING:
      return (
        <Badge className="pointer-events-none bg-blue-700">Accounting</Badge>
      )
    case Role.LEVELLER:
      return (
        <Badge className="pointer-events-none bg-green-700">Leveller</Badge>
      )
    case Role.ORGANIZER:
      return (
        <Badge className="pointer-events-none bg-gray-700">Organizer</Badge>
      )
    case Role.SUPPORT:
      return (
        <Badge className="pointer-events-none bg-orange-500">Support</Badge>
      )
    default:
      return <Badge className="pointer-events-none bg-gray-700">Unknown</Badge>
  }
}

export default RoleBadge

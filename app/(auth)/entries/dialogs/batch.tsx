import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Group } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import BatchStatusDialog from "./batch/batch-status"

type Props = {
  ids: string[]
  clearSelected: () => void
}

const BatchMenu = (props: Props) => {
  const [batchMenuOpen, setBatchMenuOpen] = useState(false)
  return (
    <DropdownMenu modal open={batchMenuOpen} onOpenChange={setBatchMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline-info">
          <Group /> Batch
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="left" align="start">
        <DropdownMenuLabel>Batch Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <BatchStatusDialog
            _ids={props.ids}
            onClose={() => setBatchMenuOpen(false)}
            clearSelected={props.clearSelected}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default BatchMenu

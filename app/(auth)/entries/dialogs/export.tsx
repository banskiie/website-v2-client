import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { DownloadCloud, Group } from "lucide-react"
import { use, useState } from "react"
import { Button } from "@/components/ui/button"
import ExportStatusDialog from "./export/export-status"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

const ExportMenu = () => {
  const isMobile = useIsMobile()
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  return (
    <DropdownMenu modal open={exportMenuOpen} onOpenChange={setExportMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button className={cn(isMobile && "w-fit")} variant="outline-info">
          <DownloadCloud /> Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="left" align="start">
        <DropdownMenuLabel>Export Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <ExportStatusDialog onClose={() => setExportMenuOpen(false)} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ExportMenu

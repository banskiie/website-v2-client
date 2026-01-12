"use client"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { gql } from "@apollo/client"
import { useQuery } from "@apollo/client/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { CheckCircle, CheckCircle2, CircleAlert, Shirt } from "lucide-react"
import { cn } from "@/lib/utils"
import RoleBadge from "@/components/badges/role-badge"
import { Badge } from "@/components/ui/badge"

const JERSEY = gql`
  query Jersey($_id: ID!) {
    jersey(_id: $_id) {
      _id
      size
      createdAt
      updatedAt
      statuses {
        status
        dateUpdated
      }
      player {
        _id
        firstName
        middleName
        lastName
        suffix
        gender
        birthDate
        email
        phoneNumber
        isActive
        createdAt
        updatedAt
      }
      tournament {
        _id
        name
        isActive
        createdAt
        updatedAt
      }
    }
  }
`

type Props = {
    _id?: string
    row?: boolean
    openFromParent?: boolean
    setOpenFromParent?: (open: boolean) => void
    externalUse?: boolean
    title?: string
    titleClassName?: string
    rowSettings?: {
        clearId: () => void
        open: boolean
        onOpenChange: (open: boolean) => void
    }
}

const ViewDialog = (props: Props) => {
    const [open, setOpen] = useState(false)
    const isOpen = props.row ? props.rowSettings?.open || false : open
    const setIsOpen = (value: boolean) => {
        if (props.row) {
            props.rowSettings?.onOpenChange(value)
        } else {
            setOpen(value)
        }
    }
    const { data, loading, error }: any = useQuery(JERSEY, {
        variables: { _id: props._id },
        skip: !isOpen || !Boolean(props._id),
    })

    if (error) console.error(error)

    const onClose = () => {
        if (props.row) {
            props.rowSettings?.clearId()
            props.rowSettings?.onOpenChange(false)
        } else {
            setOpen(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case "DELIVERED":
                return "text-green-600 bg-green-50"
            case "SHIPPED":
                return "text-blue-600 bg-blue-50"
            case "PROCESSING":
                return "text-yellow-600 bg-yellow-50"
            case "PENDING":
                return "text-orange-600 bg-orange-50"
            case "CANCELLED":
                return "text-red-600 bg-red-50"
            default:
                return "text-gray-600 bg-gray-50"
        }
    }

    const getStatusIcon = (status: string, index: number, total: number) => {
        if (index === total - 1) { // Latest status
            switch (status?.toUpperCase()) {
                case "DELIVERED":
                    return <CheckCircle className="size-4 my-2 text-success" />
                case "SHIPPED":
                    return <CheckCircle2 className="size-4 my-2 text-blue-500" />
                case "PROCESSING":
                    return <CheckCircle2 className="size-4 my-2 text-yellow-500" />
                case "PENDING":
                    return <CircleAlert className="size-4 my-2 text-orange-500" />
                case "CANCELLED":
                    return <CircleAlert className="size-4 my-2 text-destructive" />
                default:
                    return <CircleAlert className="size-4 my-2 text-gray-500" />
            }
        } else {
            return <CheckCircle className="size-4 my-2 text-muted-foreground/50" />
        }
    }

    const getFullName = (player: any) => {
        if (!player) return "Not assigned"
        const name = `${player.firstName || ''} ${player.middleName ? player.middleName + ' ' : ''}${player.lastName || ''}`
        return player.suffix ? `${name} ${player.suffix}` : name
    }

    return (
        <Dialog modal open={isOpen} onOpenChange={setIsOpen}>
            <form>
                <DialogTrigger asChild>
                    {props.row ? null : props.externalUse ? (
                        <span
                            className={cn(
                                "hover:underline hover:cursor-pointer",
                                props.titleClassName
                            )}
                        >
                            {props.title || "View"}
                        </span>
                    ) : (
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            View
                        </DropdownMenuItem>
                    )}
                </DialogTrigger>
                <DialogContent
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onInteractOutside={(e) => e.preventDefault()}
                    showCloseButton={false}
                    className="max-w-3xl"
                >
                    <DialogHeader>
                        <DialogTitle>View Jersey Order</DialogTitle>
                        <DialogDescription>
                            View the details of this jersey order below.
                        </DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="details" className="">
                        <TabsList className="w-full grid grid-cols-3 -mt-2 mb-1">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="player">Player Info</TabsTrigger>
                            <TabsTrigger value="status">Status History</TabsTrigger>
                        </TabsList>

                        {/* Details Tab */}
                        <TabsContent value="details">
                            <div className="grid grid-cols-2 gap-4 place-content-start h-[60vh] overflow-y-auto">
                                {/* Jersey Information */}
                                <div className="col-span-2">
                                    <Label>Jersey ID</Label>
                                    {loading ? (
                                        <Skeleton className="w-full my-1 h-4" />
                                    ) : (
                                        <span className="block text-sm font-mono">
                                            {data?.jersey?._id || "N/A"}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <Label>Size</Label>
                                    {loading ? (
                                        <Skeleton className="w-full my-1 h-4" />
                                    ) : (
                                        <span className="block text-sm font-medium">
                                            {data?.jersey?.size || "Not specified"}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <Label>Current Status</Label>
                                    {loading ? (
                                        <Skeleton className="w-full my-1 h-4" />
                                    ) : (
                                        <Badge className={cn("capitalize", getStatusColor(data?.jersey?.statuses?.[data?.jersey?.statuses?.length - 1]?.status))}>
                                            {data?.jersey?.statuses?.[data?.jersey?.statuses?.length - 1]?.status || "UNKNOWN"}
                                        </Badge>
                                    )}
                                </div>

                                <div>
                                    <Label>Created Date</Label>
                                    {loading ? (
                                        <Skeleton className="w-full my-1 h-4" />
                                    ) : (
                                        <span className="block text-sm">
                                            {data?.jersey?.createdAt &&
                                                format(new Date(data?.jersey?.createdAt), "PP")}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <Label>Last Updated</Label>
                                    {loading ? (
                                        <Skeleton className="w-full my-1 h-4" />
                                    ) : (
                                        <span className="block text-sm">
                                            {data?.jersey?.updatedAt &&
                                                format(new Date(data?.jersey?.updatedAt), "PP")}
                                        </span>
                                    )}
                                </div>

                                <div className="col-span-2">
                                    <Label>Tournament</Label>
                                    {loading ? (
                                        <Skeleton className="w-full my-1 h-4" />
                                    ) : (
                                        <div className="space-y-1">
                                            <span className="block text-sm font-medium">
                                                {data?.jersey?.tournament?.name || "N/A"}
                                            </span>
                                            <div className="flex gap-2 text-xs text-muted-foreground">
                                                <Badge variant={data?.jersey?.tournament?.isActive ? "default" : "secondary"}>
                                                    {data?.jersey?.tournament?.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                                <span>
                                                    Created: {data?.jersey?.tournament?.createdAt &&
                                                        format(new Date(data.jersey.tournament.createdAt), "PP")}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {/* Player Info Tab */}
                        <TabsContent value="player">
                            <div className="grid grid-cols-2 gap-4 place-content-start h-[60vh] overflow-y-auto">
                                <div className="col-span-2">
                                    <Label>Player Name</Label>
                                    {loading ? (
                                        <Skeleton className="w-full my-1 h-4" />
                                    ) : (
                                        <span className="block text-sm font-medium">
                                            {getFullName(data?.jersey?.player)}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <Label>Email</Label>
                                    {loading ? (
                                        <Skeleton className="w-full my-1 h-4" />
                                    ) : (
                                        <span className="block text-sm">
                                            {data?.jersey?.player?.email || "Not available"}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <Label>Phone Number</Label>
                                    {loading ? (
                                        <Skeleton className="w-full my-1 h-4" />
                                    ) : (
                                        <span className="block text-sm">
                                            {data?.jersey?.player?.phoneNumber || "Not available"}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <Label>Gender</Label>
                                    {loading ? (
                                        <Skeleton className="w-full my-1 h-4" />
                                    ) : (
                                        <span className="block text-sm capitalize">
                                            {data?.jersey?.player?.gender || "Not specified"}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <Label>Birth Date</Label>
                                    {loading ? (
                                        <Skeleton className="w-full my-1 h-4" />
                                    ) : (
                                        <span className="block text-sm">
                                            {data?.jersey?.player?.birthDate ?
                                                format(new Date(data.jersey.player.birthDate), "PP") :
                                                "Not available"}
                                        </span>
                                    )}
                                </div>

                                <div className="col-span-2">
                                    <Label>Player Status</Label>
                                    {loading ? (
                                        <Skeleton className="w-full my-1 h-4" />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Badge variant={data?.jersey?.player?.isActive ? "default" : "secondary"}>
                                                {data?.jersey?.player?.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                Joined: {data?.jersey?.player?.createdAt &&
                                                    format(new Date(data.jersey.player.createdAt), "PP")}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="col-span-2">
                                    <Label>Player ID</Label>
                                    {loading ? (
                                        <Skeleton className="w-full my-1 h-4" />
                                    ) : (
                                        <span className="block text-sm font-mono">
                                            {data?.jersey?.player?._id || "N/A"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {/* Status History Tab */}
                        <TabsContent value="status">
                            <div className="flex flex-col gap-2 h-[60vh] overflow-y-auto place-content-start">
                                {loading ? (
                                    <Skeleton className="w-full my-1 h-3" />
                                ) : data?.jersey?.statuses && data?.jersey?.statuses.length ? (
                                    <div className="h-full">
                                        {data?.jersey.statuses
                                            .slice()
                                            .reverse()
                                            .map((status: any, index: number, array: any[]) => (
                                                <div key={index} className="flex gap-3">
                                                    <div className="flex flex-col justify-start items-center">
                                                        {getStatusIcon(status.status, index, array.length)}
                                                        {index < array.length - 1 && (
                                                            <div className="min-h-11 w-px bg-gray-200"></div>
                                                        )}
                                                    </div>
                                                    <div className="mt-1 flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span
                                                                className={cn(
                                                                    "capitalize block -mb-0.5 font-medium",
                                                                    index === 0 ? "text-foreground" : "text-muted-foreground"
                                                                )}
                                                            >
                                                                {status.status
                                                                    .split("_")
                                                                    .join(" ")
                                                                    .toLocaleLowerCase()}
                                                            </span>
                                                            <Badge className={cn("capitalize text-xs", getStatusColor(status.status))}>
                                                                {status.status}
                                                            </Badge>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground block">
                                                            {status.dateUpdated &&
                                                                format(new Date(status.dateUpdated), "PPpp")}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                        <Shirt className="w-12 h-12 mb-2 opacity-20" />
                                        <span className="text-sm">No status history available.</span>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button className="w-20" onClick={onClose} variant="outline">
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}

export default ViewDialog
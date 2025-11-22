"use client"
import {
  CircleUser,
  Flag,
  LayoutDashboard,
  Logs,
  Notebook,
  Settings,
  Shirt,
  Ticket,
  Trophy,
  User2,
  VideoIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Role } from "@/types/user.interface"
import { useAuthStore } from "@/store/auth.store"
import Link from "next/link"
import LogoImage from "@/public/images/c_one_signature.png"
import Image from "next/image"

const MENU_ITEMS = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    allowedRoles: ["*"],
  },
  {
    title: "Entries",
    url: "/entries",
    icon: Notebook,
    allowedRoles: [Role.ADMIN, Role.LEVELLER, Role.ORGANIZER, Role.SUPPORT],
  },
  {
    title: "Jerseys",
    url: "/jerseys",
    icon: Shirt,
    allowedRoles: [Role.ADMIN, Role.ORGANIZER, Role.ACCOUNTING, Role.SUPPORT],
  },
  {
    title: "Events",
    url: "/events",
    icon: Flag,
    allowedRoles: [Role.ADMIN, Role.ORGANIZER, Role.SUPPORT],
  },
  {
    title: "Tournaments",
    url: "/tournaments",
    icon: Trophy,
    allowedRoles: [Role.ADMIN, Role.ORGANIZER, Role.SUPPORT],
  },
  {
    title: "Players",
    url: "/players",
    icon: User2,
    allowedRoles: [Role.ADMIN, Role.ORGANIZER, Role.LEVELLER, Role.SUPPORT],
  },
  {
    title: "Users",
    url: "/users",
    icon: CircleUser,
    allowedRoles: [Role.ADMIN, Role.SUPPORT],
  },
  {
    title: "Videos",
    url: "/videos",
    icon: VideoIcon,
    allowedRoles: [Role.ADMIN, Role.ORGANIZER, Role.LEVELLER, Role.SUPPORT],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    allowedRoles: [Role.ADMIN, Role.SUPPORT],
  },
  {
    title: "Logs",
    url: "/logs",
    icon: Logs,
    allowedRoles: [Role.ADMIN, Role.SUPPORT],
  },
  {
    title: "Tickets",
    url: "/tickets",
    icon: Ticket,
    allowedRoles: [Role.ADMIN, Role.ORGANIZER, Role.SUPPORT],
  },
]

export default function AppSidebar() {
  const user = useAuthStore((state) => state.user)
  return (
    <Sidebar>
      <SidebarHeader>
        <Image src={LogoImage} alt="C-One Logo" width={150} height={150} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MENU_ITEMS.map((item) => {
                if (
                  (user && item.allowedRoles.includes(user.role)) ||
                  item.allowedRoles.includes("*")
                )
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

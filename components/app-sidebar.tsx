"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Database,
  BarChart3,
  Settings,
  ChevronUp,
  User2,
  Lightbulb,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Navigation items
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Data Hub",
    url: "/dashboard/data-hub",
    icon: Database,
  },
  {
    title: "Insight Panel",
    url: "/dashboard/insights",
    icon: Lightbulb,
  },
]


export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useUser()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex h-16 items-center gap-3 px-4 border-b border-sidebar-border">
          <div className="flex h-7 w-7 items-center justify-center bg-primary text-primary-foreground">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight">Clue</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Analytics</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/dashboard/settings"}>
              <Link href="/dashboard/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <User2 className="h-4 w-4" />
                  <span className="flex-1 text-left">
                    {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                  </span>
                  <ChevronUp className="h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-56">
                <DropdownMenuItem>
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

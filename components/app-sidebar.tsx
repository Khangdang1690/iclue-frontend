"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Database,
  BarChart3,
  ChevronUp,
  User2,
  Lightbulb,
  Building2,
  Mail,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser, useClerk } from "@clerk/nextjs"

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { companyService, type Company } from "@/lib/api"

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
  const { signOut } = useClerk()
  const [isProfileOpen, setIsProfileOpen] = React.useState(false)
  const [company, setCompany] = React.useState<Company | null>(null)
  const [isLoadingCompany, setIsLoadingCompany] = React.useState(false)

  // Load company info when profile dialog opens
  React.useEffect(() => {
    if (isProfileOpen && user?.id && !company) {
      setIsLoadingCompany(true)
      companyService.getMyCompany(user.id)
        .then(setCompany)
        .catch(error => console.error('Failed to load company:', error))
        .finally(() => setIsLoadingCompany(false))
    }
  }, [isProfileOpen, user?.id, company])

  return (
    <>
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Profile Information</DialogTitle>
            <DialogDescription>
              Your account and company details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* User Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">User Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <User2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user?.firstName || 'No name set'}
                    </p>
                    <p className="text-xs text-muted-foreground">Full Name</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {user?.emailAddresses[0]?.emailAddress || 'No email'}
                    </p>
                    <p className="text-xs text-muted-foreground">Email Address</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="space-y-3 pt-3 border-t">
              <h3 className="text-sm font-medium text-muted-foreground">Company Information</h3>
              {isLoadingCompany ? (
                <p className="text-sm text-muted-foreground">Loading company information...</p>
              ) : company ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{company.name}</p>
                      <p className="text-xs text-muted-foreground">Company Name</p>
                    </div>
                  </div>
                  {company.industry && (
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{company.industry}</p>
                        <p className="text-xs text-muted-foreground">Industry</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No company information available</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Sidebar>
      <SidebarHeader>
        <div className="flex h-16 items-center gap-3 px-4 border-b border-sidebar-border">
          <div className="flex h-7 w-7 items-center justify-center bg-primary text-primary-foreground">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight">iClue</span>
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
                <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut({ redirectUrl: '/' })}>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
    </>
  )
}

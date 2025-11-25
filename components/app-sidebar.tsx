"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Calendar,
  Heart,
  User,
  Shield,
  LogOut,
  Menu,
  X,
  Home,
  Users,
  FileText,
  TrendingUp,
  ChevronLeft,
  Settings,
  Mail,
  Globe,
  ListTree,
  FolderTree,
  Briefcase,
  CreditCard,
  MessageSquare,
  KeyRound,
  UserCog,
  Gift,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSidebar } from "@/components/admin/admin-layout-client"

interface AppSidebarProps {
  userRole?: string
  userName?: string
  userEmail?: string
  userImage?: string | null
  userPrivileges?: string[]
}

interface MenuItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  requiredPrivileges?: string[]
}

const userNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Messages",
    href: "/dashboard/chat",
    icon: MessageSquare,
  },
  {
    title: "Events",
    href: "/dashboard/events",
    icon: Calendar,
  },
  {
    title: "My Matches",
    href: "/dashboard/matches",
    icon: Heart,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Referrals",
    href: "/dashboard/referrals",
    icon: Gift,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

const adminNavItems: MenuItem[] = [
  {
    title: "Admin Dashboard",
    href: "/admin",
    icon: Shield,
    requiredPrivileges: ["dashboard.view"],
  },
  {
    title: "Edit Profile",
    href: "/admin/profile",
    icon: UserCog,
    requiredPrivileges: ["admin-profile.view"],
  },
  {
    title: "Change Password",
    href: "/admin/change-password",
    icon: KeyRound,
    requiredPrivileges: ["change-password.update"],
  },
  {
    title: "Admin Users",
    href: "/admin/admin-users",
    icon: Shield,
    requiredPrivileges: ["admin-users.view"],
  },
  {
    title: "Roles & Privileges",
    href: "/admin/roles",
    icon: Shield,
    requiredPrivileges: ["roles.view"],
  },
  {
    title: "Manage Users",
    href: "/admin/users",
    icon: Users,
    requiredPrivileges: ["users.view"],
  },
  {
    title: "Manage Events",
    href: "/admin/events",
    icon: Calendar,
    requiredPrivileges: ["events.view"],
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    requiredPrivileges: ["settings.view"],
  },
  {
    title: "Email Templates",
    href: "/admin/email-templates",
    icon: Mail,
    requiredPrivileges: ["email-templates.view"],
  },
  {
    title: "Email Recipients",
    href: "/admin/recipients",
    icon: Mail,
    requiredPrivileges: ["recipients.view"],
  },
  {
    title: "Locations",
    href: "/admin/locations",
    icon: Globe,
    requiredPrivileges: ["locations.view"],
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
    requiredPrivileges: ["categories.view"],
  },
  {
    title: "Enums",
    href: "/admin/enums",
    icon: ListTree,
    requiredPrivileges: ["enums.view"],
  },
  {
    title: "Content Pages",
    href: "/admin/content",
    icon: FileText,
    requiredPrivileges: ["content.view"],
  },
  {
    title: "Affiliates",
    href: "/admin/affiliates",
    icon: Briefcase,
    requiredPrivileges: ["affiliates.view"],
  },
  {
    title: "Subscriptions",
    href: "/admin/subscriptions",
    icon: CreditCard,
    requiredPrivileges: ["subscriptions.view"],
  },
  {
    title: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
    requiredPrivileges: ["payments.view"],
  },
  {
    title: "Contact Forms",
    href: "/admin/contacts",
    icon: MessageSquare,
    requiredPrivileges: ["contacts.view"],
  },
  {
    title: "Waivers",
    href: "/admin/waivers",
    icon: FileText,
    requiredPrivileges: ["waivers.view"],
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: TrendingUp,
    requiredPrivileges: ["analytics.view"],
  },
]

export function AppSidebar({ userRole, userName, userEmail, userImage, userPrivileges = [] }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const isAdmin = userRole === "admin"

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (response.ok) {
        setTimeout(() => {
          router.push("/")
        }, 500)
      } else {
        console.error("Logout failed")
      }
    } catch (err) {
      console.error("Sign out error:", err)
    }
  }

  // Filter menu items based on privileges
  const hasPrivilege = (requiredPrivileges?: string[]) => {
    if (!requiredPrivileges || requiredPrivileges.length === 0) {
      return true
    }
    return requiredPrivileges.some(priv => userPrivileges.includes(priv))
  }

  let navItems = isAdmin ? adminNavItems : userNavItems
  
  // Filter admin items based on privileges
  if (isAdmin && Array.isArray(adminNavItems)) {
    navItems = adminNavItems.filter((item: MenuItem) => hasPrivilege(item.requiredPrivileges))
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full bg-sidebar border-r border-sidebar-border transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-center p-4 border-b border-sidebar-border">
            {isCollapsed ? (
              <Logo className="h-8 w-8" />
            ) : (
              <Logo className="h-8 w-auto" />
            )}
          </div>

          {/* User info */}
          {!isCollapsed && (userName || userEmail) && (
            <div className="p-4 border-b border-sidebar-border">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {userImage ? (
                    <AvatarImage src={userImage} alt={userName} />
                  ) : (
                    <AvatarFallback className="bg-sidebar-accent">
                      <User className="h-5 w-5 text-sidebar-accent-foreground" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  {userName && <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p>}
                  {userEmail && <p className="text-xs text-sidebar-foreground/60 truncate">{userEmail}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive =
                  pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                      isCollapsed && "justify-center",
                    )}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-2 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-sidebar-foreground/80 hover:bg-red-600/90 hover:text-white transition-colors",
                isCollapsed && "justify-center px-2",
              )}
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="ml-3">Sign Out</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}

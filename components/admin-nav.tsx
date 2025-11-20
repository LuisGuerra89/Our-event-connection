"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Calendar, FileText, TrendingUp, FolderKanban } from "lucide-react"

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Events",
    href: "/admin/events",
    icon: Calendar,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: FolderKanban,
  },
  {
    title: "Waivers",
    href: "/admin/waivers",
    icon: FileText,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: TrendingUp,
  },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-6 h-16">
          <Link href="/admin" className="font-bold text-lg">
            Admin Panel
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              )
            })}
          </div>
          <div className="ml-auto">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              Back to App
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

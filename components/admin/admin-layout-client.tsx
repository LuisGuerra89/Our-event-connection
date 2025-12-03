"use client"

import type React from "react"
import { useState, createContext, useContext } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { cn } from "@/lib/utils"

interface SidebarContextType {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | null>(null)

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    // Return default values if not in a sidebar context (for backwards compatibility)
    return {
      isCollapsed: false,
      setIsCollapsed: () => { },
    }
  }
  return context
}

interface AdminLayoutClientProps {
  userRole?: string
  userName?: string
  userEmail?: string
  userImage?: string | null
  userPrivileges?: string[]
  children: React.ReactNode
}

export function AdminLayoutClient({ userRole, userName, userEmail, userImage, userPrivileges, children }: AdminLayoutClientProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div className="flex h-full overflow-hidden bg-background">
        <AppSidebar userRole={userRole} userName={userName} userEmail={userEmail} userImage={userImage} userPrivileges={userPrivileges} />
        <main
          className={cn(
            "flex-1 overflow-y-auto transition-all duration-300",
            isCollapsed ? "lg:ml-16" : "lg:ml-64"
          )}
        >
          <div className="pt-8 sm:pt-12 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarContext.Provider>
  )
}

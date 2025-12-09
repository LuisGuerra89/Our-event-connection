"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  pageKey?: string
}

interface PublicHeaderNavProps {
  navItems?: NavItem[]
}

export function PublicHeaderNav({ navItems = [] }: PublicHeaderNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 justify-center flex-wrap">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-xs sm:text-sm md:text-xs lg:text-sm font-medium transition-colors relative whitespace-nowrap px-1.5 sm:px-2.5 py-1 rounded hover:bg-muted",
              isActive 
                ? "text-primary after:absolute after:bottom-[-12px] after:left-0 after:right-0 after:h-0.5 after:bg-primary" 
                : "text-muted-foreground hover:text-primary"
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

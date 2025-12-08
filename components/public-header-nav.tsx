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
    <nav className="hidden md:flex items-center gap-8">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-base font-semibold transition-colors relative",
              isActive 
                ? "text-primary after:absolute after:bottom-[-8px] after:left-0 after:right-0 after:h-0.5 after:bg-primary" 
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

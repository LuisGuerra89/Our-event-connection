"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  pageKey?: string
}

interface MobileMenuProps {
  isAuthenticated: boolean
  navItems?: NavItem[]
}

export function MobileMenu({ isAuthenticated, navItems = [] }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "text-base font-medium py-2 px-4 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {item.label}
              </Link>
            )
          })}
          
          {!isAuthenticated && (
            <>
              <div className="border-t my-4" />
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="text-base font-medium py-2 px-4 rounded-lg transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Sign In
              </Link>
              <Link
                href="/auth/sign-up"
                onClick={() => setOpen(false)}
              >
                <Button className="w-full">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

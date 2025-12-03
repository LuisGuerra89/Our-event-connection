import { Heart } from "lucide-react"
import Link from "next/link"

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 font-bold text-xl ${className}`}>
      <div className="relative">
        <Heart className="h-8 w-8 fill-red-500 text-red-500" />
      </div>
      <span className="text-primary">Our Love Connection</span>
    </Link>
  )
}

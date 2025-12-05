import Link from "next/link"
import Image from "next/image"

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 font-bold text-xl ${className}`}>
      <div className="relative h-12 w-auto">
        <Image
          src="/logo.png"
          alt="Our Love Connection"
          width={120}
          height={48}
          className="h-12 w-auto"
          priority
        />
      </div>
    </Link>
  )
}

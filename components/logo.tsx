import Link from "next/link"
import Image from "next/image"

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 font-bold text-xl flex-shrink-0 h-24 ${className}`}>
      <div className="relative w-auto">
        <Image
          src="/logo.png"
          alt="Our Love Connection"
          width={280}
          height={96}
          className="h-24 w-auto"
          priority
        />
      </div>
    </Link>
  )
}

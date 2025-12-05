import Link from "next/link"
import Image from "next/image"

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 font-bold text-xl flex-shrink-0 ${className}`}>
      <div className="relative h-12 w-auto min-w-[150px]">
        <Image
          src="/logo.png"
          alt="Our Love Connection"
          width={150}
          height={48}
          className="h-12 w-auto"
          priority
        />
      </div>
    </Link>
  )
}

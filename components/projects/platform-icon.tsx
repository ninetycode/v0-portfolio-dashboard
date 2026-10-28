import { Gamepad2, Globe, Monitor, Smartphone } from "lucide-react"
import { cn } from "@/lib/utils"

export function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  const key = platform.toLowerCase()
  const Icon = /naveg|browser|web/.test(key)
    ? Globe
    : /mobile|móvil|movil|android|ios/.test(key)
      ? Smartphone
      : /consol|switch|xbox|playstation|ps\d/.test(key)
        ? Gamepad2
        : Monitor
  return <Icon className={cn("h-3 w-3", className)} aria-hidden="true" />
}

"use client"

import { Heart, Sparkles, Target, MapPin } from "lucide-react"
import { useLang } from "@/lib/i18n"

export function StatusBar() {
  const { t } = useLang()
  const s = t.status

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-primary/30 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 gap-4 overflow-x-auto">
        {/* HP Bar */}
        <div className="flex items-center gap-2 shrink-0">
          <Heart className="h-4 w-4 text-[var(--hp-red)]" />
          <span className="font-mono text-xs text-muted-foreground">HP:</span>
          <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[var(--hp-red)] to-red-400 transition-all duration-500"
              style={{ width: "100%" }}
            />
          </div>
          <span className="font-mono text-xs text-[var(--hp-red)]">100%</span>
        </div>

        {/* MP Bar */}
        <div className="flex items-center gap-2 shrink-0">
          <Sparkles className="h-4 w-4 text-[var(--mp-blue)]" />
          <span className="font-mono text-xs text-muted-foreground">MP:</span>
          <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[var(--mp-blue)] to-blue-400 transition-all duration-500"
              style={{ width: "90%" }}
            />
          </div>
          <span className="font-mono text-xs text-[var(--mp-blue)]">90%</span>
        </div>

        {/* Current Goal */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <Target className="h-4 w-4 text-primary" />
          <span className="font-mono text-xs text-muted-foreground">{s.objective}</span>
          <span className="font-mono text-xs text-primary">{s.objectiveValue}</span>
        </div>

        {/* Location */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-mono text-xs text-muted-foreground">{s.location}</span>
          <span className="font-mono text-xs text-primary">{s.locationValue}</span>
        </div>
      </div>
    </div>
  )
}

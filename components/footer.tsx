"use client"

import { useLang } from "@/lib/i18n"

export function Footer() {
  const { t } = useLang()

  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-md py-8">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <p className="font-mono text-sm text-muted-foreground">
          {"// "} {t.footer.madeBy}{" "}
          <span className="text-primary">Mathías Andino</span>
          {" // "}
        </p>
        <p className="font-mono text-xs text-muted-foreground/60 mt-2">
          2024 | Technical Game Designer | González Catán, Argentina
        </p>
      </div>
    </footer>
  )
}

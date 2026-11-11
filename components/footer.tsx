"use client"

import { BrandLogo } from "@/components/brand-logo"
import { useLang } from "@/lib/i18n"
import { getFooterTagline, siteConfig } from "@/lib/site-config"

export function Footer({ reveal = false }: { reveal?: boolean }) {
  const { t, lang } = useLang()

  return (
    <footer
      data-reveal={reveal ? "rise" : undefined}
      className="border-t border-border/50 bg-background/80 backdrop-blur-md py-8"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center">
        <p className="text-balance font-mono text-sm text-muted-foreground">
          {"// "}
          {t.footer.madeBy} <span className="text-primary">{siteConfig.name}</span>
          {" // "}
        </p>
        <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
          <BrandLogo className="h-9 w-9 text-primary" />
        </div>
        <p className="text-balance font-mono text-xs text-muted-foreground/60">{getFooterTagline(lang)}</p>
      </div>
    </footer>
  )
}

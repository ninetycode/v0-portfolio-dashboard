"use client"

import { RichText } from "@/components/rich-text"
import { useSiteLang } from "@/lib/site-content/context"

export function HomeFooter() {
  const { tx, content } = useSiteLang()
  const home = content.home

  return (
    <footer data-reveal="rise" className="border-t border-border/50 bg-background/80 backdrop-blur-md py-8 mb-12">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <p className="font-mono text-sm text-muted-foreground">
          {"// "}
          <RichText value={tx(home.footerCredit)} />{" "}
          <span className="text-primary"><RichText value={tx(home.footerName)} /></span>
          {" // "}
        </p>
        <p className="font-mono text-xs text-muted-foreground/60 mt-2"><RichText value={tx(home.footerTagline)} /></p>
      </div>
    </footer>
  )
}

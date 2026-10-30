"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useLang, type Lang } from "@/lib/i18n"
import { defaultSiteContent } from "./defaults"
import type { Bilingual, SiteContent } from "./types"

const SiteContentContext = createContext<SiteContent>(defaultSiteContent)

export function SiteContentProvider({ content, children }: { content: SiteContent; children: ReactNode }) {
  return <SiteContentContext.Provider value={content}>{children}</SiteContentContext.Provider>
}

export function useSiteContent() {
  return useContext(SiteContentContext)
}

export function tx(value: Bilingual | undefined, lang: Lang): string {
  if (!value) return ""
  const text = value[lang]
  return typeof text === "string" ? text : value.es
}

export function useSiteLang() {
  const { lang } = useLang()
  const content = useSiteContent()
  return {
    lang,
    content,
    tx: (value: Bilingual | undefined) => tx(value, lang),
  }
}

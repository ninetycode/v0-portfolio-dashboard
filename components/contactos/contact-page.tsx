"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Check, Moon, Share2, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { LinkIcon } from "@/components/contactos/link-icon"
import { CONTACT_SHARE_URL } from "@/lib/site-url"
import { visibleContactLinks, type ContactLink, type ContactLinksContent } from "@/lib/site-content/contact-links"
import { cn } from "@/lib/utils"

const ContactEditorDialog = dynamic(() =>
  import("@/components/contactos/contact-editor").then((mod) => mod.ContactEditorDialog),
)

export function ContactPage({ data, canEdit }: { data: ContactLinksContent; canEdit: boolean }) {
  const links = visibleContactLinks(data)
  let previousCategory = ""

  return (
    <main className="min-h-[100dvh] bg-background">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <Toaster position="top-center" />
        {canEdit ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
            <span className="text-muted-foreground">modo_admin</span>
            <div className="flex flex-wrap items-center gap-2">
              <ContactEditorDialog data={data} />
              <Link
                href="/contactos/stats"
                className="rounded-md border border-border/70 px-2.5 py-1 text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Estadísticas
              </Link>
            </div>
          </div>
        ) : null}

        <div className="mb-6 flex items-center justify-end gap-2">
          <ThemeButton />
          <ShareButton />
        </div>

        <ProfileHeader header={data.header} />

        {links.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">No hay enlaces activos.</p>
        ) : (
          <div className="mt-8 rounded-md border-2 border-[#2f7d45] bg-[#f4faf5] p-3 dark:border-[#b6e3a8] dark:bg-card/70">
            <ul className="flex flex-col gap-3">
              {links.map((link, index) => {
                const showCategory = Boolean(link.category) && link.category !== previousCategory
                if (link.category) previousCategory = link.category
                return (
                  <li key={link.id} className="flex flex-col gap-2">
                    {showCategory ? (
                      <p className={cn("px-1 font-mono text-xs text-muted-foreground", index > 0 && "pt-2")}>{link.category}</p>
                    ) : null}
                    <ContactLinkButton link={link} />
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </main>
  )
}

function ProfileHeader({ header }: { header: ContactLinksContent["header"] }) {
  const [broken, setBroken] = useState(false)
  const showImage = Boolean(header.avatarUrl) && !broken

  return (
    <header className="flex flex-col items-center text-center">
      {showImage ? (
        <img
          src={header.avatarUrl}
          alt={header.displayName}
          width={96}
          height={96}
          className="h-24 w-24 rounded-full border border-primary/40 object-cover box-glow-subtle"
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-primary/40 font-serif text-2xl box-glow-subtle">
          {header.displayName.slice(0, 1) || "M"}
        </div>
      )}
      <h1 className="mt-4 font-serif text-2xl font-bold">{header.displayName}</h1>
      {header.roleBadge ? (
        <p className="mt-2 font-mono text-xs uppercase tracking-widest text-primary text-balance">{header.roleBadge}</p>
      ) : null}
      {header.bio ? <p className="mt-3 text-sm text-muted-foreground text-balance">{header.bio}</p> : null}
    </header>
  )
}

function ContactLinkButton({ link }: { link: ContactLink }) {
  return (
    <Link
      href={`/go/${link.slug}`}
      prefetch={false}
      className={cn(
        "flex min-h-14 items-center gap-3 rounded-md border-2 border-[#2f7d45] bg-background px-3 py-3 transition-colors hover:bg-[#2f7d45]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-[#b6e3a8] dark:hover:bg-[#b6e3a8]/10",
        link.featured && "bg-[#2f7d45]/10 dark:bg-[#b6e3a8]/15",
      )}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background/70 text-primary">
        <LinkIcon name={link.icon} />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-sm font-medium text-foreground">{link.title}</span>
        {link.subtitle ? <span className="mt-0.5 block text-xs text-muted-foreground">{link.subtitle}</span> : null}
      </span>
    </Link>
  )
}

function ThemeButton() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {mounted ? isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" /> : <span className="h-4 w-4" />}
    </button>
  )
}

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    try {
      const input = document.createElement("textarea")
      input.value = value
      input.setAttribute("readonly", "")
      input.style.position = "fixed"
      input.style.left = "-9999px"
      document.body.appendChild(input)
      input.select()
      const ok = document.execCommand("copy")
      input.remove()
      return ok
    } catch {
      return false
    }
  }
}

function ShareButton() {
  const [copied, setCopied] = useState(false)

  async function onShare() {
    const canShare =
      typeof navigator.share === "function" &&
      (typeof navigator.canShare !== "function" || navigator.canShare({ url: CONTACT_SHARE_URL }))
    if (canShare) {
      try {
        await navigator.share({ title: "Mathías Andino", url: CONTACT_SHARE_URL })
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
      }
    }
    const ok = await copyText(CONTACT_SHARE_URL)
    if (ok) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
      toast.success("Link copiado")
      return
    }
    toast.error(`No se pudo copiar. El link es ${CONTACT_SHARE_URL}`)
  }

  return (
    <button
      type="button"
      onClick={() => void onShare()}
      aria-label={copied ? "Link copiado" : "Compartir o copiar el link"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
    </button>
  )
}

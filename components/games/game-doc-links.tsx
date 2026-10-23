import { Download, ExternalLink } from "lucide-react"
import type { GameDocLink } from "@/lib/db/schema"

const DOWNLOAD_PATTERN = /\.(pdf|zip|rar|7z|docx?|xlsx?|pptx?)(\?|$)|drive\.google\.com|dropbox\.com|mega\.nz/i

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

export function GameDocLinks({ links }: { links: GameDocLink[] }) {
  if (links.length === 0) {
    return <p className="font-mono text-sm text-muted-foreground">{"Sin documentación publicada todavía."}</p>
  }

  return (
    <ul className="flex flex-col gap-2">
      {links.map((link) => {
        const host = hostOf(link.url)
        const isDownload = DOWNLOAD_PATTERN.test(link.url)
        const ActionIcon = isDownload ? Download : ExternalLink
        return (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5 transition-colors hover:border-primary/50"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`}
                  alt=""
                  className="h-5 w-5"
                  loading="lazy"
                />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                  {link.label}
                </span>
                <span className="truncate font-mono text-xs text-muted-foreground">{host}</span>
              </span>
              <ActionIcon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden="true" />
              <span className="sr-only">{isDownload ? "Descargar" : "Abrir en otra pestaña"}</span>
            </a>
          </li>
        )
      })}
    </ul>
  )
}

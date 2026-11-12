"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useRef, useState } from "react"
import useSWR from "swr"
import { Download, ExternalLink, FileText, Loader2, Maximize2, Minimize2, MonitorSmartphone, Presentation, Table2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { KIND_LABELS, getDocumentSource, type DocKind } from "@/lib/document-files"
import { cn } from "@/lib/utils"

const PdfCanvasViewer = dynamic(() => import("@/components/projects/pdf-canvas-viewer").then((m) => m.PdfCanvasViewer), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-48 items-center justify-center text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  ),
})

type Props = { url: string; title: string; lang: "es" | "en" }

const text = {
  es: {
    open: "Abrir original",
    download: "Descargar",
    fullscreen: "Pantalla completa",
    exitFullscreen: "Salir de pantalla completa",
    webViewer: "Visor web",
    nativeViewer: "Visor nativo",
    loading: "Cargando documento…",
    textError: "No se pudo leer el archivo. Descárgalo para verlo.",
    officeNote: "Se muestra con el visor de Office para conservar el formato original. Si no carga, descarga el archivo.",
    driveNote: "Si el archivo no se ve, revisa que esté compartido como «Cualquiera con el enlace».",
  },
  en: {
    open: "Open original",
    download: "Download",
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit fullscreen",
    webViewer: "Web viewer",
    nativeViewer: "Native viewer",
    loading: "Loading document…",
    textError: "Couldn't read the file. Download it to view it.",
    officeNote: "Shown with the Office viewer to keep the original formatting. If it doesn't load, download the file.",
    driveNote: "If the file doesn't show, make sure it's shared as “Anyone with the link”.",
  },
} as const

const bodyHeight: Record<DocKind, string> = {
  pdf: "h-[70vh] min-h-96",
  presentation: "aspect-video",
  "google-slides": "aspect-video",
  word: "h-[80vh] min-h-96",
  "google-doc": "h-[80vh] min-h-96",
  sheet: "h-[75vh] min-h-96",
  "google-sheet": "h-[75vh] min-h-96",
  "google-drive": "h-[75vh] min-h-96",
  text: "max-h-[75vh] min-h-48",
  image: "min-h-48",
  link: "",
}

function KindIcon({ kind }: { kind: DocKind }) {
  if (kind === "presentation" || kind === "google-slides") return <Presentation className="h-4 w-4" />
  if (kind === "sheet" || kind === "google-sheet") return <Table2 className="h-4 w-4" />
  return <FileText className="h-4 w-4" />
}

async function fetchText(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error("fetch failed")
  return new TextDecoder("utf-8").decode(await res.arrayBuffer())
}

function TextBody({ url, copy }: { url: string; copy: (typeof text)[keyof typeof text] }) {
  const { data, error, isLoading } = useSWR(url, fetchText, { revalidateOnFocus: false })
  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {copy.loading}
      </div>
    )
  }
  if (error || data === undefined) return <p className="p-6 text-sm text-muted-foreground">{copy.textError}</p>
  return <pre className="max-h-[75vh] overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-sm leading-relaxed text-foreground">{data}</pre>
}

export function DocumentViewer({ url, title, lang }: Props) {
  const copy = text[lang]
  const source = getDocumentSource(url)
  const containerRef = useRef<HTMLDivElement>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [iframeReady, setIframeReady] = useState(false)
  const [webPdf, setWebPdf] = useState(false)

  // Phones can't scroll or zoom an embedded PDF, so they start on the canvas viewer.
  useEffect(() => {
    setWebPdf(window.matchMedia("(pointer: coarse)").matches)
  }, [])

  useEffect(() => setIframeReady(false), [url])

  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement === containerRef.current)
    document.addEventListener("fullscreenchange", sync)
    return () => document.removeEventListener("fullscreenchange", sync)
  }, [])

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen()
    else containerRef.current?.requestFullscreen?.()
  }

  const handlePdfFail = useCallback(() => setWebPdf(false), [])

  const isOffice = source.kind === "presentation" || source.kind === "word" || source.kind === "sheet"
  const usesIframe = source.embedUrl !== null && source.kind !== "text" && source.kind !== "image" && !(source.kind === "pdf" && webPdf)
  const note = isOffice ? copy.officeNote : source.kind === "google-drive" ? copy.driveNote : null

  return (
    <div className="flex flex-col gap-2">
      <div ref={containerRef} className={cn("flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card", fullscreen && "rounded-none border-0")}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-primary">
              <KindIcon kind={source.kind} />
            </span>
            <span className="truncate text-sm font-medium">{title}</span>
            <span className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {KIND_LABELS[source.kind][lang]}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {source.kind === "pdf" && (
              <Button type="button" variant="ghost" size="sm" className="gap-1.5 font-mono text-xs" onClick={() => setWebPdf((v) => !v)}>
                <MonitorSmartphone className="h-4 w-4" />
                <span className="hidden sm:inline">{webPdf ? copy.nativeViewer : copy.webViewer}</span>
              </Button>
            )}
            <Button asChild variant="ghost" size="sm" className="gap-1.5 font-mono text-xs">
              <a href={source.fileUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">{copy.open}</span>
              </a>
            </Button>
            <Button asChild variant="ghost" size="sm" className="gap-1.5 font-mono text-xs">
              <a href={source.downloadUrl} download>
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">{copy.download}</span>
              </a>
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={toggleFullscreen} aria-label={fullscreen ? copy.exitFullscreen : copy.fullscreen}>
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className={cn("relative w-full overflow-hidden bg-muted/40", fullscreen ? "min-h-0 flex-1" : bodyHeight[source.kind])}>
          {usesIframe && (
            <>
              {!iframeReady && (
                <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {copy.loading}
                </div>
              )}
              <iframe
                key={source.embedUrl}
                src={source.embedUrl ?? undefined}
                title={title}
                className="absolute inset-0 h-full w-full border-0 bg-white"
                allowFullScreen
                loading="lazy"
                onLoad={() => setIframeReady(true)}
              />
            </>
          )}
          {source.kind === "pdf" && webPdf && <PdfCanvasViewer url={source.fileUrl} label={title} onFail={handlePdfFail} />}
          {source.kind === "text" && <TextBody url={source.fileUrl} copy={copy} />}
          {source.kind === "image" && (
            <img src={source.fileUrl || "/placeholder.svg"} alt={title} className="mx-auto max-h-[75vh] w-auto max-w-full object-contain" />
          )}
        </div>
      </div>
      {note && <p className="text-pretty font-mono text-xs text-muted-foreground">{note}</p>}
    </div>
  )
}

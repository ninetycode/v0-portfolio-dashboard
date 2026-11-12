"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import type { PDFDocumentProxy } from "pdfjs-dist/legacy/build/pdf.mjs"

type Props = { url: string; label: string; onFail: () => void }

function PdfPage({ doc, pageNumber, width }: { doc: PDFDocumentProxy; pageNumber: number; width: number }) {
  const holderRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [visible, setVisible] = useState(pageNumber <= 2)
  const [ratio, setRatio] = useState(1.3)

  useEffect(() => {
    const holder = holderRef.current
    if (!holder) return
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setVisible(true), { rootMargin: "600px 0px" })
    observer.observe(holder)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || !width) return
    let cancelled = false
    let task: { cancel: () => void; promise: Promise<unknown> } | null = null
    ;(async () => {
      const page = await doc.getPage(pageNumber)
      const base = page.getViewport({ scale: 1 })
      const viewport = page.getViewport({ scale: (width / base.width) * Math.min(window.devicePixelRatio || 1, 2) })
      const canvas = canvasRef.current
      if (!canvas || cancelled) return
      canvas.width = viewport.width
      canvas.height = viewport.height
      setRatio(base.height / base.width)
      task = page.render({ canvas, viewport })
      await task.promise
    })().catch(() => {})
    return () => {
      cancelled = true
      task?.cancel()
    }
  }, [doc, pageNumber, visible, width])

  return (
    <div ref={holderRef} className="mx-auto bg-white shadow-md" style={{ width, height: width * ratio }}>
      <canvas ref={canvasRef} className="block h-full w-full" aria-label={`Página ${pageNumber}`} />
    </div>
  )
}

/** Renders every PDF page to canvas so it scrolls and zooms normally on phones and tablets. */
export function PdfCanvasViewer({ url, label, onFail }: Props) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    let cancelled = false
    let loadingTask: { destroy: () => Promise<void> } | null = null
    ;(async () => {
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString()
      const task = pdfjs.getDocument({ url })
      loadingTask = task
      const loaded = await task.promise
      if (cancelled) return
      setDoc(loaded)
    })().catch(() => !cancelled && onFail())
    return () => {
      cancelled = true
      loadingTask?.destroy()
    }
  }, [url, onFail])

  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    const update = () => setWidth(Math.floor(Math.min(box.clientWidth - 24, 1100)))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(box)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={boxRef} role="document" aria-label={label} className="h-full overflow-y-auto bg-muted/60 p-3">
      {!doc ? (
        <div className="flex h-full min-h-48 items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {Array.from({ length: doc.numPages }, (_, i) => (
            <PdfPage key={i} doc={doc} pageNumber={i + 1} width={width} />
          ))}
        </div>
      )}
    </div>
  )
}

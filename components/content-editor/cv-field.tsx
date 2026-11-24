"use client"

import { useState } from "react"
import { upload } from "@vercel/blob/client"
import { AlertCircle, ExternalLink, FileText, FileUp, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  CV_ACCEPT,
  CV_FOLDER,
  KIND_LABELS,
  MAX_DOCUMENT_BYTES,
  documentMimeType,
  getDocumentSource,
} from "@/lib/document-files"
import { cn } from "@/lib/utils"
import { TextField } from "./editor-fields"

type CvFieldProps = {
  url: string
  fileName: string
  onChange: (patch: { cvUrl: string; cvFileName: string }) => void
}

function displayFileName(url: string, fileName: string): string {
  if (fileName.trim()) return fileName.trim()
  try {
    const last = decodeURIComponent(new URL(url).pathname.split("/").pop() ?? "")
    if (last) return last
  } catch {
    // ignore invalid url
  }
  return url
}

export function CvField({ url, fileName, onChange }: CvFieldProps) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState<{ name: string; percent: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    setError(null)

    const mime = documentMimeType(file.name)
    if (!mime) {
      setError(`"${file.name}" no es un formato compatible. Usa PDF, Word (DOC/DOCX) o una imagen.`)
      return
    }
    if (file.size > MAX_DOCUMENT_BYTES) {
      setError(`"${file.name}" supera los ${MAX_DOCUMENT_BYTES / 1024 / 1024} MB.`)
      return
    }

    setUploading({ name: file.name, percent: 0 })
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
      const blob = await upload(`${CV_FOLDER}${safeName}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload-document",
        contentType: mime,
        multipart: file.size > 8 * 1024 * 1024,
        onUploadProgress: ({ percentage }) =>
          setUploading({ name: file.name, percent: Math.round(percentage) }),
      })
      onChange({ cvUrl: blob.url, cvFileName: file.name })
    } catch (e) {
      setError(e instanceof Error ? `No se pudo subir "${file.name}": ${e.message}` : `No se pudo subir "${file.name}".`)
    } finally {
      setUploading(null)
    }
  }

  const source = url ? getDocumentSource(url) : null

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {url ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-background text-primary">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{displayFileName(url, fileName)}</p>
              {source ? (
                <p className="font-mono text-xs text-muted-foreground">{KIND_LABELS[source.kind].es}</p>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild type="button" variant="outline" size="sm" className="gap-1.5 font-mono text-xs">
              <a href={source?.fileUrl ?? url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Abrir
              </a>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 font-mono text-xs hover:text-destructive"
              onClick={() => onChange({ cvUrl: "", cvFileName: "" })}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Quitar
            </Button>
          </div>
        </div>
      ) : (
        <p className="font-mono text-xs text-muted-foreground">Todavía no hay ningún CV adjunto.</p>
      )}

      <label
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          void handleFile(event.dataTransfer.files)
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center transition-colors focus-within:ring-2 focus-within:ring-ring",
          dragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-primary/5",
        )}
      >
        <FileUp className="h-6 w-6 text-primary" />
        <span className="text-sm font-medium">
          {url ? "Arrastra un CV nuevo aquí o haz clic para reemplazarlo" : "Arrastra tu CV aquí o haz clic para adjuntarlo"}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          PDF, DOC o DOCX · hasta {MAX_DOCUMENT_BYTES / 1024 / 1024} MB
        </span>
        <input
          type="file"
          accept={CV_ACCEPT}
          className="sr-only"
          onChange={(event) => {
            void handleFile(event.target.files)
            event.target.value = ""
          }}
        />
      </label>

      {uploading ? (
        <div className="flex flex-col gap-1" role="status">
          <div className="flex items-center justify-between gap-2 font-mono text-xs text-muted-foreground">
            <span className="truncate">{uploading.name}</span>
            <span>{uploading.percent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${uploading.percent}%` }} />
          </div>
        </div>
      ) : null}

      <TextField
        plain
        label="Enlace del CV (se completa al subir, o pega un link de Drive/PDF)"
        value={url}
        hint="Después de adjuntar o cambiar el CV, recuerda pulsar Guardar."
        onChange={(nextUrl) =>
          onChange({
            cvUrl: nextUrl,
            cvFileName: nextUrl.trim() ? (nextUrl === url ? fileName : "") : "",
          })
        }
      />
    </div>
  )
}

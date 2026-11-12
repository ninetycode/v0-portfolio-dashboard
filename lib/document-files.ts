export type DocKind =
  | "pdf"
  | "presentation"
  | "word"
  | "sheet"
  | "text"
  | "image"
  | "google-slides"
  | "google-doc"
  | "google-sheet"
  | "google-drive"
  | "link"

export const MAX_DOCUMENT_BYTES = 100 * 1024 * 1024
export const DOCUMENT_FOLDER = "projects/docs/"

type ExtensionInfo = { kind: DocKind; mime: string }

const EXTENSIONS: Record<string, ExtensionInfo> = {
  pdf: { kind: "pdf", mime: "application/pdf" },
  pptx: { kind: "presentation", mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
  ppsx: { kind: "presentation", mime: "application/vnd.openxmlformats-officedocument.presentationml.slideshow" },
  ppt: { kind: "presentation", mime: "application/vnd.ms-powerpoint" },
  pps: { kind: "presentation", mime: "application/vnd.ms-powerpoint" },
  docx: { kind: "word", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  doc: { kind: "word", mime: "application/msword" },
  xlsx: { kind: "sheet", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  xls: { kind: "sheet", mime: "application/vnd.ms-excel" },
  txt: { kind: "text", mime: "text/plain" },
  md: { kind: "text", mime: "text/markdown" },
  csv: { kind: "text", mime: "text/csv" },
  png: { kind: "image", mime: "image/png" },
  jpg: { kind: "image", mime: "image/jpeg" },
  jpeg: { kind: "image", mime: "image/jpeg" },
  gif: { kind: "image", mime: "image/gif" },
  webp: { kind: "image", mime: "image/webp" },
}

export const ALLOWED_DOCUMENT_MIME_TYPES = Array.from(new Set(Object.values(EXTENSIONS).map((e) => e.mime)))
export const DOCUMENT_ACCEPT = Object.keys(EXTENSIONS)
  .map((ext) => `.${ext}`)
  .join(",")

export const KIND_LABELS: Record<DocKind, { es: string; en: string }> = {
  pdf: { es: "PDF", en: "PDF" },
  presentation: { es: "Presentación", en: "Presentation" },
  word: { es: "Documento Word", en: "Word document" },
  sheet: { es: "Hoja de cálculo", en: "Spreadsheet" },
  text: { es: "Texto", en: "Text" },
  image: { es: "Imagen", en: "Image" },
  "google-slides": { es: "Google Slides", en: "Google Slides" },
  "google-doc": { es: "Google Docs", en: "Google Docs" },
  "google-sheet": { es: "Google Sheets", en: "Google Sheets" },
  "google-drive": { es: "Google Drive", en: "Google Drive" },
  link: { es: "Enlace", en: "Link" },
}

export function fileExtension(nameOrUrl: string): string {
  let path = nameOrUrl
  try {
    path = new URL(nameOrUrl).pathname
  } catch {
    // plain file name
  }
  const last = decodeURIComponent(path.split("/").pop() ?? "")
  const dot = last.lastIndexOf(".")
  return dot === -1 ? "" : last.slice(dot + 1).toLowerCase()
}

/** Returns the MIME type for an uploadable file, or null when its format isn't supported. */
export function documentMimeType(fileName: string): string | null {
  return EXTENSIONS[fileExtension(fileName)]?.mime ?? null
}

export function resourceTypeForFile(fileName: string): string {
  const kind = EXTENSIONS[fileExtension(fileName)]?.kind
  return kind === "presentation" ? "Presentación" : "Documento"
}

export function isBlobUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith(".blob.vercel-storage.com")
  } catch {
    return false
  }
}

export type DocumentSource = {
  kind: DocKind
  /** Source for the iframe, or null when the file can only be linked. */
  embedUrl: string | null
  /** Direct file URL used by the native PDF / text / image viewers. */
  fileUrl: string
  downloadUrl: string
  ext: string
}

const GOOGLE_ID = /docs\.google\.com\/(presentation|document|spreadsheets)\/d\/([a-zA-Z0-9_-]+)/
const DRIVE_FILE_ID = /drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/

/** Decides how a resource URL can be shown inside the page. */
export function getDocumentSource(url: string): DocumentSource {
  const ext = fileExtension(url)
  const base = { fileUrl: url, downloadUrl: url, ext }

  const google = url.match(GOOGLE_ID)
  if (google) {
    const [, product, id] = google
    if (product === "presentation") {
      return { ...base, kind: "google-slides", embedUrl: `https://docs.google.com/presentation/d/${id}/embed?start=false&loop=false&delayms=60000` }
    }
    if (product === "document") {
      return { ...base, kind: "google-doc", embedUrl: `https://docs.google.com/document/d/${id}/preview` }
    }
    return { ...base, kind: "google-sheet", embedUrl: `https://docs.google.com/spreadsheets/d/${id}/preview` }
  }

  const drive = url.match(DRIVE_FILE_ID)
  if (drive) {
    return {
      ...base,
      kind: "google-drive",
      embedUrl: `https://drive.google.com/file/d/${drive[1]}/preview`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${drive[1]}`,
    }
  }

  const kind = EXTENSIONS[ext]?.kind
  if (!kind) return { ...base, kind: "link", embedUrl: null }

  const downloadUrl = isBlobUrl(url) ? `${url}${url.includes("?") ? "&" : "?"}download=1` : url

  if (kind === "presentation" || kind === "word" || kind === "sheet") {
    return {
      ...base,
      kind,
      downloadUrl,
      embedUrl: `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`,
    }
  }

  return { ...base, kind, downloadUrl, embedUrl: kind === "pdf" ? `${url}#toolbar=1&navpanes=0&view=FitH` : url }
}

export const isViewableDocument = (url: string) => getDocumentSource(url).kind !== "link"

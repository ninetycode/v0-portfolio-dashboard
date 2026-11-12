const MAX_DIMENSION = 2560
const WEBP_QUALITY = 0.88

// Los GIF pueden estar animados y los SVG son vectoriales: convertirlos los rompería.
const KEEP_AS_IS = /^image\/(gif|svg\+xml|webp)$/

/** Convierte la imagen a WebP en el navegador (y la reduce si es enorme) antes de subirla. */
export async function convertToWebp(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || KEEP_AS_IS.test(file.type)) return file

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error(`No se pudo leer "${file.name}". Usa una imagen JPG, PNG, WebP o GIF.`)
  }

  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const ctx = canvas.getContext("2d")
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", WEBP_QUALITY))
    // Navegadores sin codificador WebP devuelven PNG: en ese caso se sube el original.
    if (!blob || blob.type !== "image/webp") return file
    if (scale === 1 && blob.size >= file.size) return file

    const baseName = file.name.replace(/\.[^.]+$/, "") || "imagen"
    return new File([blob], `${baseName}.webp`, { type: "image/webp" })
  } finally {
    bitmap.close()
  }
}

/** Sube una imagen a Blob (convertida a WebP) y devuelve su URL pública. */
export async function uploadImageFile(file: File, folder?: string): Promise<string> {
  const optimized = await convertToWebp(file)
  const body = new FormData()
  body.append("file", optimized)
  if (folder) body.append("folder", folder)
  const res = await fetch("/api/admin/upload", { method: "POST", body })
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
  if (!res.ok || !data.url) throw new Error(data.error ?? "No se pudo subir la imagen.")
  return data.url
}

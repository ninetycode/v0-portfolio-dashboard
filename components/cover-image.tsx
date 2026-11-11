import Image from "next/image"
import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"
import { coverFocusStyle, type CoverFocus } from "@/lib/cover-focus"

// Debe coincidir con images.remotePatterns en next.config.mjs.
const OPTIMIZABLE_HOSTS = [/^img\.itch\.zone$/, /\.public\.blob\.vercel-storage\.com$/]

function canOptimize(src: string): boolean {
  if (/\.svg(\?|#|$)/i.test(src)) return false
  if (src.startsWith("/") && !src.startsWith("//")) return true
  try {
    const url = new URL(src)
    return url.protocol === "https:" && OPTIMIZABLE_HOSTS.some((host) => host.test(url.hostname))
  } catch {
    return false
  }
}

type CoverImageProps = {
  src: string
  alt: string
  sizes: string
  className?: string
  style?: CSSProperties
  /** Encuadre elegido por el admin (posición y zoom dentro de la miniatura). */
  focus?: CoverFocus | null
  priority?: boolean
  draggable?: boolean
}

/**
 * Imagen que llena a su contenedor (que debe estar posicionado).
 * Sirve una versión redimensionada en AVIF/WebP cuando el origen está permitido
 * y cae a un <img> normal para cualquier otra URL que cargue el admin.
 */
export function CoverImage({ src, alt, sizes, className, style: styleProp, focus, priority = false, draggable }: CoverImageProps) {
  const style = { ...styleProp, ...coverFocusStyle(focus) }
  if (!canOptimize(src)) {
    return (
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={draggable}
        className={cn("absolute inset-0 h-full w-full", className)}
        style={style}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      draggable={draggable}
      className={className}
      style={style}
    />
  )
}

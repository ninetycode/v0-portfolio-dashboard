import type { CSSProperties } from "react"

/** Encuadre de una portada dentro de su miniatura: punto de foco (0-100 %) y zoom (1 = sin zoom). */
export type CoverFocus = { x: number; y: number; zoom: number }

export const DEFAULT_COVER_FOCUS: CoverFocus = { x: 50, y: 50, zoom: 1 }
export const MIN_COVER_ZOOM = 1
export const MAX_COVER_ZOOM = 3

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function isDefaultFocus(focus: CoverFocus | null | undefined): boolean {
  return !focus || (focus.x === 50 && focus.y === 50 && focus.zoom === 1)
}

/** Normaliza cualquier valor guardado; devuelve null cuando equivale al encuadre por defecto. */
export function sanitizeCoverFocus(value: unknown): CoverFocus | null {
  if (!value || typeof value !== "object") return null
  const raw = value as Partial<Record<keyof CoverFocus, unknown>>
  const x = Number(raw.x)
  const y = Number(raw.y)
  const zoom = Number(raw.zoom)
  const focus: CoverFocus = {
    x: Number.isFinite(x) ? Math.round(clamp(x, 0, 100) * 10) / 10 : 50,
    y: Number.isFinite(y) ? Math.round(clamp(y, 0, 100) * 10) / 10 : 50,
    zoom: Number.isFinite(zoom) ? Math.round(clamp(zoom, MIN_COVER_ZOOM, MAX_COVER_ZOOM) * 100) / 100 : 1,
  }
  return isDefaultFocus(focus) ? null : focus
}

/**
 * Estilos que aplican el encuadre a una imagen que llena su contenedor con object-fit: cover.
 * El zoom escala alrededor del mismo punto de foco, así ese punto no se desplaza al hacer zoom.
 */
export function coverFocusStyle(focus: CoverFocus | null | undefined): CSSProperties | undefined {
  if (isDefaultFocus(focus) || !focus) return undefined
  const origin = `${focus.x}% ${focus.y}%`
  return {
    objectPosition: origin,
    transformOrigin: origin,
    transform: focus.zoom !== 1 ? `scale(${focus.zoom})` : undefined,
  }
}

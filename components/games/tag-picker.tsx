"use client"

import { useId, useMemo, useState } from "react"
import { Check, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { uniqueTags } from "@/lib/games-options"

type Props = {
  label: string
  description?: string
  value: string[]
  options: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  max?: number
}

export function TagPicker({ label, description, value, options, onChange, placeholder = "Buscar o crear...", max = 10 }: Props) {
  const inputId = useId()
  const [query, setQuery] = useState("")
  const selectedKeys = useMemo(() => new Set(value.map((v) => v.toLowerCase())), [value])
  const allOptions = useMemo(() => uniqueTags([...options, ...value]), [options, value])
  const trimmed = query.trim()
  const filtered = allOptions.filter((o) => o.toLowerCase().includes(trimmed.toLowerCase()))
  const exactMatch = allOptions.some((o) => o.toLowerCase() === trimmed.toLowerCase())
  const full = value.length >= max

  const toggle = (tag: string) => {
    if (selectedKeys.has(tag.toLowerCase())) onChange(value.filter((v) => v.toLowerCase() !== tag.toLowerCase()))
    else if (!full) onChange([...value, tag])
  }

  const commit = () => {
    if (!trimmed) return
    const existing = allOptions.find((o) => o.toLowerCase() === trimmed.toLowerCase())
    const tag = existing ?? trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
    if (!selectedKeys.has(tag.toLowerCase()) && !full) onChange([...value, tag])
    setQuery("")
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={inputId} className="text-sm font-medium">{label}</label>
        <span className="font-mono text-xs text-muted-foreground">{value.length}/{max}</span>
      </div>
      {description && <p className="-mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p>}

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 focus-within:border-primary/60">
        <div className="flex flex-wrap items-center gap-2">
          {value.map((tag) => (
            <span key={tag} className="flex items-center gap-1 rounded-md bg-primary py-1 pr-1 pl-2.5 font-mono text-xs text-primary-foreground">
              {tag}
              <button
                type="button"
                onClick={() => toggle(tag)}
                className="rounded p-0.5 opacity-80 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-primary-foreground"
                aria-label={`Quitar ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            id={inputId}
            value={query}
            onChange={(e) => setQuery(e.target.value.replace(",", ""))}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing || e.keyCode === 229) return
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault()
                commit()
              } else if (e.key === "Backspace" && !query && value.length) {
                onChange(value.slice(0, -1))
              }
            }}
            placeholder={full ? "Límite alcanzado" : placeholder}
            disabled={full}
            autoComplete="off"
            spellCheck={false}
            className="min-w-32 flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 border-t border-border pt-3" aria-label={`Sugerencias de ${label.toLowerCase()}`}>
          {filtered.map((tag) => {
            const active = selectedKeys.has(tag.toLowerCase())
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(tag)}
                disabled={!active && full}
                className={cn(
                  "flex items-center gap-1 rounded-md border px-2.5 py-1 font-mono text-xs transition-colors disabled:opacity-40",
                  active
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {active && <Check className="h-3 w-3" />}
                {tag}
              </button>
            )
          })}
          {trimmed && !exactMatch && (
            <button
              type="button"
              onClick={commit}
              disabled={full}
              className="flex items-center gap-1 rounded-md border border-dashed border-primary/50 px-2.5 py-1 font-mono text-xs text-primary hover:bg-primary/10 disabled:opacity-40"
            >
              <Plus className="h-3 w-3" />
              {`Crear "${trimmed}"`}
            </button>
          )}
          {!trimmed && filtered.length === 0 && (
            <span className="font-mono text-xs text-muted-foreground">Escribe para crear una opción nueva.</span>
          )}
        </div>
      </div>
    </div>
  )
}

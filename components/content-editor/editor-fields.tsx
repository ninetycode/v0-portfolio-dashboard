"use client"

import { useId, type ReactNode } from "react"
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Bilingual, Lang } from "@/lib/site-content/types"
import { RichField } from "./rich-field"

export function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items
  const next = items.slice()
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export function emptyText(): Bilingual {
  return { es: "", en: "" }
}

export function Group({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border/50 bg-card p-5">
      <div>
        <h3 className="font-serif text-lg font-semibold">{title}</h3>
        {hint ? <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
    </section>
  )
}

export function TextField({
  label,
  value,
  onChange,
  multiline,
  hint,
  plain,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
  hint?: string
  plain?: boolean
}) {
  const id = useId()
  if (!plain) {
    return <RichField label={label} value={value} onChange={onChange} multiline={multiline} hint={hint} />
  }
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="font-mono text-xs text-muted-foreground">
        {label}
      </Label>
      {multiline ? (
        <Textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} className="min-h-28" />
      ) : (
        <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

export function BiField({
  label,
  value,
  lang,
  onChange,
  multiline,
  hint,
}: {
  label: string
  value: Bilingual
  lang: Lang
  onChange: (value: Bilingual) => void
  multiline?: boolean
  hint?: string
}) {
  return (
    <TextField
      label={label}
      value={value[lang]}
      multiline={multiline}
      hint={hint}
      onChange={(text) => onChange({ ...value, [lang]: text })}
    />
  )
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  hint?: string
}) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="font-mono text-xs text-muted-foreground">
        {label}
      </Label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

export function CheckField({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (value: boolean) => void; hint?: string }) {
  return (
    <label className="flex items-start gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 accent-primary"
      />
      <span>
        {label}
        {hint ? <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span> : null}
      </span>
    </label>
  )
}

export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="font-mono text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => {
          const next = Number(event.target.value)
          onChange(Number.isFinite(next) ? next : min)
        }}
      />
    </div>
  )
}

export function ItemCard({
  title,
  index,
  count,
  kind,
  onMove,
  onRemove,
  children,
}: {
  title: string
  index: number
  count: number
  kind: string
  onMove: (from: number, to: number) => void
  onRemove: () => void
  children: ReactNode
}) {
  return (
    <div
      className="rounded-lg border border-border/60 bg-background"
      onDragOver={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
      onDrop={(event) => {
        event.preventDefault()
        event.stopPropagation()
        const [dragKind, raw] = event.dataTransfer.getData("text/plain").split(":")
        const from = Number(raw)
        if (dragKind === kind && Number.isInteger(from)) onMove(from, index)
      }}
    >
      <div className="flex items-center gap-2 border-b border-border/50 px-3 py-2">
        <button
          type="button"
          draggable
          onDragStart={(event) => {
            event.stopPropagation()
            event.dataTransfer.setData("text/plain", `${kind}:${index}`)
            event.dataTransfer.effectAllowed = "move"
          }}
          className="cursor-grab text-muted-foreground active:cursor-grabbing"
          aria-label="Arrastrar para reordenar"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <p className="min-w-0 flex-1 truncate font-serif text-sm font-semibold">{title || "Sin título"}</p>
        <Button type="button" size="icon" variant="ghost" className="h-8 w-8" disabled={index === 0} onClick={() => onMove(index, index - 1)} aria-label="Subir">
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button type="button" size="icon" variant="ghost" className="h-8 w-8" disabled={index === count - 1} onClick={() => onMove(index, index + 1)} aria-label="Bajar">
          <ChevronDown className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 hover:text-destructive"
          aria-label="Quitar"
          onClick={() => {
            if (confirm("¿Quitar este elemento? El cambio se publica al guardar.")) onRemove()
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-col gap-4 p-4">{children}</div>
    </div>
  )
}

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button type="button" variant="outline" onClick={onClick} className="gap-2 self-start border-primary/30">
      <Plus className="h-4 w-4" />
      {label}
    </Button>
  )
}

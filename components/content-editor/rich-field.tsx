"use client"

import { useEffect, useId, useRef, useState } from "react"
import { Bold, ImagePlus, Italic, List, RemoveFormatting, Underline } from "lucide-react"
import { Label } from "@/components/ui/label"
import { editorValue, splitIntoItems, stripInlineFormatting, type FontName } from "@/lib/site-content/rich-text"

const SWATCHES = ["#1e293b", "#3d5a9e", "#478cbf", "#16a34a", "#b45309"]

function writeEditor(el: HTMLElement, value: string) {
  if (!value.includes("<")) {
    el.textContent = value
    return
  }
  el.innerHTML = value
}

export function RichField({
  label,
  value,
  onChange,
  multiline,
  hint,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
  hint?: string
}) {
  const id = useId()
  const fieldRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const rangeRef = useRef<Range | null>(null)
  const last = useRef<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const el = fieldRef.current
    if (!el || last.current === value) return
    writeEditor(el, value)
    last.current = value
  }, [value])

  function emit() {
    const el = fieldRef.current
    if (!el) return
    const next = editorValue(el.innerHTML)
    if (next === last.current) return
    last.current = next
    onChange(next)
  }

  function saveRange() {
    const el = fieldRef.current
    const selection = window.getSelection()
    if (!el || !selection || selection.rangeCount === 0 || !selection.anchorNode || !el.contains(selection.anchorNode)) {
      rangeRef.current = null
      return
    }
    rangeRef.current = selection.getRangeAt(0).cloneRange()
  }

  function focusField() {
    const el = fieldRef.current
    if (!el) return
    const selection = window.getSelection()
    const live = !!selection && selection.rangeCount > 0 && !!selection.anchorNode && el.contains(selection.anchorNode)
    if (live) return
    el.focus()
    const next = window.getSelection()
    if (rangeRef.current && next) {
      next.removeAllRanges()
      next.addRange(rangeRef.current)
      return
    }
    const range = document.createRange()
    range.selectNodeContents(el)
    range.collapse(false)
    next?.removeAllRanges()
    next?.addRange(range)
  }

  function selectAll(el: HTMLElement) {
    const range = document.createRange()
    range.selectNodeContents(el)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
  }

  function withSelection(apply: () => void) {
    const el = fieldRef.current
    if (!el) return
    focusField()
    const selection = window.getSelection()
    const inside = !!selection && selection.rangeCount > 0 && !!selection.anchorNode && el.contains(selection.anchorNode)
    if (!inside || selection!.isCollapsed) selectAll(el)
    apply()
    rangeRef.current = null
    emit()
  }

  function applyCommand(command: string, arg?: string) {
    withSelection(() => document.execCommand(command, false, arg))
  }

  function applyFont(font: FontName | "" | "clear") {
    withSelection(() => {
      const el = fieldRef.current
      const selection = window.getSelection()
      if (!el || !selection || selection.rangeCount === 0) return
      const range = selection.getRangeAt(0)
      if (!font || font === "clear") {
        for (const span of Array.from(el.querySelectorAll<HTMLElement>("[data-font]"))) {
          if (!range.intersectsNode(span)) continue
          const parent = span.parentNode
          if (!parent) continue
          while (span.firstChild) parent.insertBefore(span.firstChild, span)
          parent.removeChild(span)
        }
        return
      }
      const wrapper = document.createElement("span")
      wrapper.setAttribute("data-font", font)
      try {
        range.surroundContents(wrapper)
      } catch {
        wrapper.appendChild(range.extractContents())
        range.insertNode(wrapper)
      }
    })
  }

  function clearFormatting() {
    const el = fieldRef.current
    if (!el) return
    const next = stripInlineFormatting(editorValue(el.innerHTML) || value)
    writeEditor(el, next)
    last.current = next
    onChange(next)
  }

  function splitItems() {
    const el = fieldRef.current
    if (!el) return
    const next = splitIntoItems(editorValue(el.innerHTML) || value)
    writeEditor(el, next)
    last.current = next
    onChange(next)
  }

  function insertImage(url: string) {
    const el = fieldRef.current
    if (!el) return
    focusField()
    const image = document.createElement("img")
    image.src = url
    image.alt = ""
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0 && selection.anchorNode && el.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0)
      range.collapse(false)
      range.insertNode(image)
      range.setStartAfter(image)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
    } else {
      el.appendChild(image)
    }
    emit()
  }

  async function upload(file: File) {
    setError("")
    setUploading(true)
    try {
      const body = new FormData()
      body.set("file", file)
      body.set("folder", "content")
      const response = await fetch("/api/admin/upload", { method: "POST", body })
      const data = (await response.json()) as { url?: string; error?: string }
      if (!response.ok || !data.url) {
        setError(data.error || "No se pudo subir la imagen")
        return
      }
      insertImage(data.url)
    } catch {
      setError("No se pudo subir la imagen")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const toolClass =
    "inline-flex h-7 items-center gap-1 rounded-sm border border-border bg-background px-2 font-mono text-[11px] text-foreground hover:border-primary/50 hover:text-primary"

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="font-mono text-xs text-muted-foreground" onClick={() => fieldRef.current?.focus()}>
        {label}
      </Label>
      <div className="overflow-hidden rounded-md border border-input bg-transparent focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
        <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 px-1.5 py-1">
          <button type="button" className={toolClass} title="Negrita" onMouseDown={(event) => event.preventDefault()} onClick={() => applyCommand("bold")}>
            <Bold className="h-3.5 w-3.5" />
            Negrita
          </button>
          <button type="button" className={toolClass} title="Subrayado" onMouseDown={(event) => event.preventDefault()} onClick={() => applyCommand("underline")}>
            <Underline className="h-3.5 w-3.5" />
            Subrayado
          </button>
          <button type="button" className={toolClass} title="Cursiva" onMouseDown={(event) => event.preventDefault()} onClick={() => applyCommand("italic")}>
            <Italic className="h-3.5 w-3.5" />
            Cursiva
          </button>
          <select
            aria-label="Fuente"
            defaultValue=""
            className="h-7 rounded-sm border border-border bg-background px-1.5 font-mono text-[11px]"
            onChange={(event) => {
              const font = event.target.value as FontName | "" | "clear"
              event.target.value = ""
              if (font) applyFont(font)
            }}
          >
            <option value="">Fuente</option>
            <option value="clear">Automático</option>
            <option value="serif">Serif</option>
            <option value="sans">Sans</option>
            <option value="mono">Mono</option>
          </select>
          {SWATCHES.map((color) => (
            <button
              key={color}
              type="button"
              title={`Color ${color}`}
              aria-label={`Color ${color}`}
              className="h-5 w-5 rounded-sm border border-border"
              style={{ backgroundColor: color }}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => applyCommand("foreColor", color)}
            />
          ))}
          <input
            type="color"
            aria-label="Otro color"
            title="Otro color"
            defaultValue="#3d5a9e"
            className="h-7 w-8 cursor-pointer rounded-sm border border-border bg-background p-0.5"
            onChange={(event) => {
              const color = event.target.value
              applyCommand("foreColor", color)
            }}
          />
          <button
            type="button"
            className={toolClass}
            title="Imagen"
            disabled={uploading}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => fileRef.current?.click()}
          >
            <ImagePlus className="h-3.5 w-3.5" />
            {uploading ? "Subiendo…" : "Imagen"}
          </button>
          <button type="button" className={toolClass} title="Dividir en ítems" onMouseDown={(event) => event.preventDefault()} onClick={splitItems}>
            <List className="h-3.5 w-3.5" />
            Ítems
          </button>
          <button type="button" className={toolClass} title="Quitar formato" onMouseDown={(event) => event.preventDefault()} onClick={clearFormatting}>
            <RemoveFormatting className="h-3.5 w-3.5" />
            Limpiar
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void upload(file)
            }}
          />
        </div>
        <div className="relative">
          {!value && <span className="pointer-events-none absolute left-3 top-2 text-sm text-muted-foreground">Escribe aquí</span>}
          <div
            id={id}
            ref={fieldRef}
            role="textbox"
            aria-multiline={multiline ? true : undefined}
            aria-label={label}
            contentEditable
            suppressContentEditableWarning
            className={`rich-editor px-3 py-2 text-sm outline-none ${multiline ? "min-h-28 whitespace-pre-wrap" : "min-h-9"}`}
            onInput={emit}
            onBlur={emit}
            onKeyUp={saveRange}
            onMouseUp={saveRange}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return
              event.preventDefault()
              if (!multiline) return
              document.execCommand("insertLineBreak")
              emit()
            }}
            onPaste={(event) => {
              event.preventDefault()
              const html = event.clipboardData.getData("text/html")
              const text = event.clipboardData.getData("text/plain")
              const clean = html ? editorValue(html) : text
              if (clean.includes("<")) document.execCommand("insertHTML", false, clean)
              else document.execCommand("insertText", false, clean)
              emit()
            }}
          />
        </div>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

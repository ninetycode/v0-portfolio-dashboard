"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Minus,
  Code2,
  ImageIcon,
  Video,
  GripVertical,
  Trash2,
  Bold,
  Italic,
  Code,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export type BlockType =
  | "text"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "bullet"
  | "numbered"
  | "quote"
  | "divider"
  | "code"
  | "image"
  | "video"

export interface Block {
  id: string
  type: BlockType
  content: string
  meta?: string // language for code, alt text for image
}

let blockCounter = 0
export function newBlock(type: BlockType = "text", content = "", meta = ""): Block {
  blockCounter += 1
  return { id: `block-${Date.now()}-${blockCounter}`, type, content, meta }
}

/** Serialize blocks to markdown compatible with the blog renderer */
export function blocksToMarkdown(blocks: Block[]): string {
  const out: string[] = []
  let numberedIndex = 0

  for (const block of blocks) {
    if (block.type !== "numbered") numberedIndex = 0

    switch (block.type) {
      case "h1":
        out.push(`# ${block.content}`)
        break
      case "h2":
        out.push(`## ${block.content}`)
        break
      case "h3":
        out.push(`### ${block.content}`)
        break
      case "h4":
        out.push(`#### ${block.content}`)
        break
      case "bullet":
        out.push(`- ${block.content}`)
        break
      case "numbered":
        numberedIndex += 1
        out.push(`${numberedIndex}. ${block.content}`)
        break
      case "quote":
        out.push(`> ${block.content}`)
        break
      case "divider":
        out.push("---")
        break
      case "code":
        out.push("```" + (block.meta || "") + "\n" + block.content + "\n```")
        break
      case "image":
        out.push(`![${block.meta || ""}](${block.content})`)
        break
      case "video":
        out.push(`@video(${block.content})`)
        break
      default:
        out.push(block.content)
    }
  }

  return out.join("\n\n")
}

/** Parse existing markdown into editable blocks */
export function markdownToBlocks(markdown: string): Block[] {
  const blocks: Block[] = []
  const lines = markdown.split("\n")
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed === "") {
      i++
      continue
    }

    // Code fence
    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing fence
      blocks.push(newBlock("code", codeLines.join("\n"), lang))
      continue
    }

    // Video
    const videoMatch = trimmed.match(/^@video[(](.+)[)]$/)
    if (videoMatch) {
      blocks.push(newBlock("video", videoMatch[1]))
      i++
      continue
    }

    // Image
    const imageMatch = trimmed.match(/^!\[([^\]]*)\][(](.+)[)]$/)
    if (imageMatch) {
      blocks.push(newBlock("image", imageMatch[2], imageMatch[1]))
      i++
      continue
    }

    if (trimmed === "---") {
      blocks.push(newBlock("divider"))
      i++
      continue
    }
    if (trimmed.startsWith("#### ")) {
      blocks.push(newBlock("h4", trimmed.slice(5)))
      i++
      continue
    }
    if (trimmed.startsWith("### ")) {
      blocks.push(newBlock("h3", trimmed.slice(4)))
      i++
      continue
    }
    if (trimmed.startsWith("## ")) {
      blocks.push(newBlock("h2", trimmed.slice(3)))
      i++
      continue
    }
    if (trimmed.startsWith("# ")) {
      blocks.push(newBlock("h1", trimmed.slice(2)))
      i++
      continue
    }
    if (trimmed.startsWith("> ")) {
      blocks.push(newBlock("quote", trimmed.slice(2)))
      i++
      continue
    }
    if (trimmed.startsWith("- ")) {
      blocks.push(newBlock("bullet", trimmed.slice(2)))
      i++
      continue
    }
    const numberedMatch = trimmed.match(/^\d+\. (.+)$/)
    if (numberedMatch) {
      blocks.push(newBlock("numbered", numberedMatch[1]))
      i++
      continue
    }

    // Plain paragraph — merge consecutive non-empty plain lines
    const paraLines: string[] = [line]
    i++
    while (i < lines.length && lines[i].trim() !== "" && !isSpecialLine(lines[i])) {
      paraLines.push(lines[i])
      i++
    }
    blocks.push(newBlock("text", paraLines.join(" ").trim()))
  }

  return blocks.length > 0 ? blocks : [newBlock("text")]
}

function isSpecialLine(line: string): boolean {
  const t = line.trim()
  return (
    t.startsWith("#") ||
    t.startsWith("- ") ||
    t.startsWith("> ") ||
    t.startsWith("```") ||
    t.startsWith("@video(") ||
    t.startsWith("![") ||
    t === "---" ||
    /^\d+\. /.test(t)
  )
}

interface SlashMenuItem {
  type: BlockType
  label: string
  description: string
  icon: React.ReactNode
  shortcut?: string
}

const SLASH_MENU_ITEMS: SlashMenuItem[] = [
  { type: "text", label: "Texto", description: "Párrafo simple", icon: <Type className="h-4 w-4" /> },
  { type: "h1", label: "Título 1", description: "Encabezado grande", icon: <Heading1 className="h-4 w-4" />, shortcut: "#" },
  { type: "h2", label: "Título 2", description: "Encabezado mediano", icon: <Heading2 className="h-4 w-4" />, shortcut: "##" },
  { type: "h3", label: "Título 3", description: "Encabezado pequeño", icon: <Heading3 className="h-4 w-4" />, shortcut: "###" },
  { type: "h4", label: "Título 4", description: "Encabezado mínimo", icon: <Heading4 className="h-4 w-4" />, shortcut: "####" },
  { type: "bullet", label: "Lista con viñetas", description: "Lista simple", icon: <List className="h-4 w-4" />, shortcut: "-" },
  { type: "numbered", label: "Lista numerada", description: "Lista ordenada", icon: <ListOrdered className="h-4 w-4" />, shortcut: "1." },
  { type: "quote", label: "Cita", description: "Bloque de cita", icon: <Quote className="h-4 w-4" />, shortcut: ">" },
  { type: "divider", label: "Divisor", description: "Línea separadora", icon: <Minus className="h-4 w-4" />, shortcut: "---" },
  { type: "code", label: "Código", description: "Bloque de código", icon: <Code2 className="h-4 w-4" />, shortcut: "```" },
  { type: "image", label: "Imagen", description: "Subir una imagen", icon: <ImageIcon className="h-4 w-4" /> },
  { type: "video", label: "Video", description: "YouTube, Vimeo o archivo", icon: <Video className="h-4 w-4" /> },
]

const BLOCK_STYLES: Record<BlockType, string> = {
  text: "text-base leading-relaxed",
  h1: "font-serif text-3xl font-bold",
  h2: "font-serif text-2xl font-semibold",
  h3: "font-serif text-xl font-semibold",
  h4: "font-serif text-lg font-semibold",
  bullet: "text-base leading-relaxed",
  numbered: "text-base leading-relaxed",
  quote: "text-base italic",
  divider: "",
  code: "font-mono text-sm",
  image: "",
  video: "",
}

const BLOCK_PLACEHOLDERS: Record<BlockType, string> = {
  text: "Escribe algo, o presiona '/' para comandos...",
  h1: "Título 1",
  h2: "Título 2",
  h3: "Título 3",
  h4: "Título 4",
  bullet: "Elemento de lista",
  numbered: "Elemento numerado",
  quote: "Cita",
  divider: "",
  code: "Escribe tu código aquí...",
  image: "",
  video: "Pega la URL del video (YouTube, Vimeo o .mp4)",
}

interface BlockEditorProps {
  blocks: Block[]
  onChange: (blocks: Block[]) => void
}

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [slashMenuOpenFor, setSlashMenuOpenFor] = useState<string | null>(null)
  const [slashFilter, setSlashFilter] = useState("")
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null)
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0)
  const [uploadingFor, setUploadingFor] = useState<string | null>(null)
  const refs = useRef<Map<string, HTMLTextAreaElement>>(new Map())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingImageBlockId = useRef<string | null>(null)
  const focusRequestId = useRef<string | null>(null)

  const filteredMenuItems = SLASH_MENU_ITEMS.filter(
    (item) =>
      item.label.toLowerCase().includes(slashFilter.toLowerCase()) ||
      item.type.includes(slashFilter.toLowerCase()),
  )

  // Focus a block after render
  useEffect(() => {
    if (focusRequestId.current) {
      const el = refs.current.get(focusRequestId.current)
      if (el) {
        el.focus()
        el.setSelectionRange(el.value.length, el.value.length)
      }
      focusRequestId.current = null
    }
  })

  const updateBlock = useCallback(
    (id: string, patch: Partial<Block>) => {
      onChange(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)))
    },
    [blocks, onChange],
  )

  const insertBlockAfter = useCallback(
    (afterId: string, block: Block) => {
      const idx = blocks.findIndex((b) => b.id === afterId)
      const next = [...blocks]
      next.splice(idx + 1, 0, block)
      onChange(next)
      focusRequestId.current = block.id
    },
    [blocks, onChange],
  )

  const removeBlock = useCallback(
    (id: string) => {
      const idx = blocks.findIndex((b) => b.id === id)
      if (blocks.length === 1) {
        onChange([newBlock("text")])
        return
      }
      const next = blocks.filter((b) => b.id !== id)
      onChange(next)
      const prev = next[Math.max(0, idx - 1)]
      if (prev) focusRequestId.current = prev.id
    },
    [blocks, onChange],
  )

  const moveBlock = useCallback(
    (id: string, direction: -1 | 1) => {
      const idx = blocks.findIndex((b) => b.id === id)
      const target = idx + direction
      if (target < 0 || target >= blocks.length) return
      const next = [...blocks]
      const [moved] = next.splice(idx, 1)
      next.splice(target, 0, moved)
      onChange(next)
    },
    [blocks, onChange],
  )

  const convertBlock = useCallback(
    (id: string, type: BlockType) => {
      if (type === "image") {
        // Trigger upload flow
        pendingImageBlockId.current = id
        updateBlock(id, { type: "image", content: "", meta: "" })
        setSlashMenuOpenFor(null)
        setSlashFilter("")
        setTimeout(() => fileInputRef.current?.click(), 50)
        return
      }
      updateBlock(id, { type, content: type === "divider" ? "" : blocks.find((b) => b.id === id)?.content.replace(/^\/.*$/, "") || "" })
      setSlashMenuOpenFor(null)
      setSlashFilter("")
      focusRequestId.current = id
    },
    [blocks, updateBlock],
  )

  const handleImageUpload = async (file: File) => {
    const blockId = pendingImageBlockId.current
    if (!blockId) return
    setUploadingFor(blockId)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (res.ok && data.url) {
        updateBlock(blockId, { content: data.url, meta: file.name.replace(/\.[^.]+$/, "") })
      } else {
        updateBlock(blockId, { type: "text", content: `Error al subir imagen: ${data.error || "desconocido"}` })
      }
    } catch {
      updateBlock(blockId, { type: "text", content: "Error de red al subir la imagen" })
    } finally {
      setUploadingFor(null)
      pendingImageBlockId.current = null
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, block: Block) => {
    const isMenuOpen = slashMenuOpenFor === block.id

    if (isMenuOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedMenuIndex((i) => Math.min(i + 1, filteredMenuItems.length - 1))
        return
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedMenuIndex((i) => Math.max(i - 1, 0))
        return
      }
      if (e.key === "Enter") {
        e.preventDefault()
        const item = filteredMenuItems[selectedMenuIndex]
        if (item) convertBlock(block.id, item.type)
        return
      }
      if (e.key === "Escape") {
        e.preventDefault()
        setSlashMenuOpenFor(null)
        setSlashFilter("")
        return
      }
    }

    // Enter creates a new block (except in code blocks, where Enter is a newline; use Shift+Enter to exit)
    if (e.key === "Enter" && !e.shiftKey && block.type !== "code") {
      if (e.nativeEvent.isComposing || e.keyCode === 229) return
      e.preventDefault()
      const continuationType: BlockType =
        block.type === "bullet" || block.type === "numbered" ? block.type : "text"
      // Empty list item exits the list
      if ((block.type === "bullet" || block.type === "numbered") && block.content === "") {
        updateBlock(block.id, { type: "text" })
        return
      }
      insertBlockAfter(block.id, newBlock(continuationType))
      return
    }

    if (e.key === "Enter" && e.shiftKey && block.type === "code") {
      e.preventDefault()
      insertBlockAfter(block.id, newBlock("text"))
      return
    }

    // Backspace on empty block deletes it
    if (e.key === "Backspace" && block.content === "" && block.type !== "divider") {
      if (block.type !== "text") {
        e.preventDefault()
        updateBlock(block.id, { type: "text" })
        return
      }
      e.preventDefault()
      removeBlock(block.id)
      return
    }
  }

  const handleContentChange = (block: Block, value: string) => {
    // Slash command detection
    if (value === "/" && block.content === "") {
      setSlashMenuOpenFor(block.id)
      setSlashFilter("")
      setSelectedMenuIndex(0)
      updateBlock(block.id, { content: value })
      return
    }

    if (slashMenuOpenFor === block.id) {
      if (value.startsWith("/")) {
        setSlashFilter(value.slice(1))
        setSelectedMenuIndex(0)
      } else {
        setSlashMenuOpenFor(null)
        setSlashFilter("")
      }
    }

    // Markdown shortcuts at start of block
    if (block.type === "text") {
      const shortcuts: Array<[string, BlockType]> = [
        ["# ", "h1"],
        ["## ", "h2"],
        ["### ", "h3"],
        ["#### ", "h4"],
        ["- ", "bullet"],
        ["1. ", "numbered"],
        ["> ", "quote"],
      ]
      for (const [prefix, type] of shortcuts) {
        if (value === prefix) {
          updateBlock(block.id, { type, content: "" })
          return
        }
      }
      if (value === "```") {
        updateBlock(block.id, { type: "code", content: "" })
        return
      }
      if (value === "---") {
        updateBlock(block.id, { type: "divider", content: "" })
        insertBlockAfter(block.id, newBlock("text"))
        return
      }
    }

    updateBlock(block.id, { content: value })
  }

  const wrapSelection = (blockId: string, wrapper: string) => {
    const el = refs.current.get(blockId)
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    if (start === end) return
    const block = blocks.find((b) => b.id === blockId)
    if (!block) return
    const selected = block.content.slice(start, end)
    const newContent = block.content.slice(0, start) + wrapper + selected + wrapper + block.content.slice(end)
    updateBlock(blockId, { content: newContent })
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + wrapper.length, end + wrapper.length)
    })
  }

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }

  return (
    <div className="space-y-1">
      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleImageUpload(file)
          e.target.value = ""
        }}
      />

      {blocks.map((block, index) => (
        <div key={block.id} className="group/block relative flex items-start gap-1">
          {/* Block handle */}
          <div className="flex items-center gap-0.5 pt-2 opacity-0 group-hover/block:opacity-100 transition-opacity shrink-0">
            <button
              type="button"
              onClick={() => moveBlock(block.id, -1)}
              disabled={index === 0}
              className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
              aria-label="Mover bloque arriba"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => moveBlock(block.id, 1)}
              disabled={index === blocks.length - 1}
              className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
              aria-label="Mover bloque abajo"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => removeBlock(block.id)}
              className="p-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-muted"
              aria-label="Eliminar bloque"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <GripVertical className="h-4 w-4 text-muted-foreground/40" />
          </div>

          {/* Block content */}
          <div className="relative flex-1 min-w-0">
            {block.type === "divider" ? (
              <div className="py-3 cursor-pointer" onClick={() => removeBlock(block.id)} role="separator">
                <hr className="border-border" />
              </div>
            ) : block.type === "image" ? (
              <div className="my-2">
                {uploadingFor === block.id ? (
                  <div className="flex items-center gap-3 rounded-lg border border-dashed border-border p-8 justify-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="font-mono text-sm">Subiendo imagen...</span>
                  </div>
                ) : block.content ? (
                  <figure>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={block.content || "/placeholder.svg"}
                      alt={block.meta || "Imagen del blog"}
                      className="w-full rounded-lg border border-border"
                    />
                    <input
                      type="text"
                      value={block.meta || ""}
                      onChange={(e) => updateBlock(block.id, { meta: e.target.value })}
                      placeholder="Texto alternativo / pie de foto"
                      className="mt-2 w-full bg-transparent text-center text-sm text-muted-foreground font-mono outline-none placeholder:text-muted-foreground/50"
                    />
                  </figure>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      pendingImageBlockId.current = block.id
                      fileInputRef.current?.click()
                    }}
                    className="flex w-full items-center gap-3 rounded-lg border border-dashed border-border p-6 justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    <ImageIcon className="h-5 w-5" />
                    <span className="font-mono text-sm">Haz clic para subir una imagen</span>
                  </button>
                )}
              </div>
            ) : block.type === "video" && block.content ? (
              <div className="my-2 space-y-2">
                <VideoPreview url={block.content} />
                <input
                  type="text"
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                  className="w-full bg-muted/30 rounded px-3 py-1.5 text-sm font-mono text-muted-foreground outline-none border border-border focus:border-primary/50"
                  placeholder="URL del video"
                />
              </div>
            ) : (
              <>
                {block.type === "code" && (
                  <input
                    type="text"
                    value={block.meta || ""}
                    onChange={(e) => updateBlock(block.id, { meta: e.target.value })}
                    placeholder="lenguaje (ej: gdscript, csharp)"
                    className="mb-1 w-48 bg-muted/30 rounded px-2 py-1 text-xs font-mono text-muted-foreground outline-none border border-border focus:border-primary/50"
                  />
                )}
                <div className={block.type === "quote" ? "border-l-2 border-primary pl-4" : ""}>
                  <div className={block.type === "bullet" ? "flex gap-2" : block.type === "numbered" ? "flex gap-2" : ""}>
                    {block.type === "bullet" && <span className="pt-2 text-primary select-none">•</span>}
                    {block.type === "numbered" && (
                      <span className="pt-2 text-primary font-mono text-sm select-none">
                        {blocks.slice(0, index + 1).filter((b) => b.type === "numbered").length}.
                      </span>
                    )}
                    <textarea
                      ref={(el) => {
                        if (el) {
                          refs.current.set(block.id, el)
                          autoResize(el)
                        } else {
                          refs.current.delete(block.id)
                        }
                      }}
                      value={block.content}
                      onChange={(e) => {
                        handleContentChange(block, e.target.value)
                        autoResize(e.target)
                      }}
                      onKeyDown={(e) => handleKeyDown(e, block)}
                      onFocus={() => setFocusedBlockId(block.id)}
                      placeholder={BLOCK_PLACEHOLDERS[block.type]}
                      rows={1}
                      className={`w-full resize-none overflow-hidden bg-transparent py-1.5 outline-none placeholder:text-muted-foreground/40 ${BLOCK_STYLES[block.type]} ${block.type === "code" ? "bg-muted/30 rounded-lg border border-border p-3" : ""}`}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Inline format toolbar (visible when block focused and has selection support) */}
            {focusedBlockId === block.id &&
              ["text", "quote", "bullet", "numbered", "h1", "h2", "h3", "h4"].includes(block.type) && (
                <div className="absolute -top-9 left-0 z-20 flex items-center gap-1 rounded-md border border-border bg-card shadow-md px-1 py-0.5">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      wrapSelection(block.id, "**")
                    }}
                    aria-label="Negrita"
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      wrapSelection(block.id, "*")
                    }}
                    aria-label="Cursiva"
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      wrapSelection(block.id, "`")
                    }}
                    aria-label="Código inline"
                  >
                    <Code className="h-3.5 w-3.5" />
                  </Button>
                  <span className="px-2 text-[10px] font-mono text-muted-foreground hidden sm:inline">
                    selecciona texto y aplica formato
                  </span>
                </div>
              )}

            {/* Slash menu */}
            {slashMenuOpenFor === block.id && (
              <div className="absolute left-0 top-full z-30 mt-1 w-72 max-h-80 overflow-y-auto rounded-lg border border-border bg-card shadow-xl">
                <p className="px-3 pt-3 pb-1 text-xs font-mono text-muted-foreground">Bloques básicos</p>
                {filteredMenuItems.length === 0 && (
                  <p className="px-3 py-2 text-sm text-muted-foreground">Sin resultados</p>
                )}
                {filteredMenuItems.map((item, i) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => convertBlock(block.id, item.type)}
                    onMouseEnter={() => setSelectedMenuIndex(i)}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                      i === selectedMenuIndex ? "bg-primary/10" : ""
                    }`}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded border border-border bg-muted/30 text-muted-foreground shrink-0">
                      {item.icon}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium">{item.label}</span>
                      <span className="block text-xs text-muted-foreground">{item.description}</span>
                    </span>
                    {item.shortcut && (
                      <span className="font-mono text-xs text-muted-foreground/60">{item.shortcut}</span>
                    )}
                  </button>
                ))}
                <div className="border-t border-border px-3 py-2 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Cerrar menú</span>
                  <span className="font-mono text-xs text-muted-foreground/60">esc</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Add block at end */}
      <button
        type="button"
        onClick={() => {
          const block = newBlock("text")
          onChange([...blocks, block])
          focusRequestId.current = block.id
        }}
        className="mt-2 flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/30 transition-colors"
      >
        <Type className="h-4 w-4" />
        <span className="font-mono text-xs">+ Agregar bloque</span>
      </button>
    </div>
  )
}

function VideoPreview({ url }: { url: string }) {
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)
  if (ytMatch) {
    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
        <iframe
          src={`https://www.youtube.com/embed/${ytMatch[1]}`}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          title="Vista previa del video"
        />
      </div>
    )
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          title="Vista previa del video"
        />
      </div>
    )
  }
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return <video controls className="w-full rounded-lg border border-border" src={url} />
  }
  return (
    <p className="text-sm text-muted-foreground font-mono px-3 py-2 rounded border border-dashed border-border">
      Vista previa no disponible: se mostrará como enlace
    </p>
  )
}

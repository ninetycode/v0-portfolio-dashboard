"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  Loader2,
  ImageIcon,
  X,
  Star,
  Eye,
  PenLine,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BlockEditor, blocksToMarkdown, markdownToBlocks, newBlock, type Block } from "./block-editor"
import { createPost, updatePost, type BlogPostInput } from "@/app/actions/blog"
import { categories } from "@/lib/blog-data"
import type { BlogPostRow } from "@/lib/db/schema"

interface PostEditorProps {
  post?: BlogPostRow | null
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80)
}

function estimateReadTime(blocks: Block[]): string {
  const text = blocks.map((b) => b.content).join(" ")
  const words = text.split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 200))
  return `${minutes} min`
}

export function PostEditor({ post }: PostEditorProps) {
  const router = useRouter()
  const isEditing = Boolean(post)

  const [title, setTitle] = useState(post?.title ?? "")
  const [slug, setSlug] = useState(post?.slug ?? "")
  const [slugTouched, setSlugTouched] = useState(Boolean(post))
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "")
  const [category, setCategory] = useState(post?.category ?? "Devlogs")
  const [tags, setTags] = useState<string[]>(post?.tags ?? [])
  const [tagInput, setTagInput] = useState("")
  const [publishedAt, setPublishedAt] = useState(post?.publishedAt ?? new Date().toISOString().slice(0, 10))
  const [featured, setFeatured] = useState(post?.featured ?? false)
  const [coverImage, setCoverImage] = useState<string | null>(post?.coverImage ?? null)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [blocks, setBlocks] = useState<Block[]>(() =>
    post?.content ? markdownToBlocks(post.content) : [newBlock("text")],
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const effectiveSlug = useMemo(
    () => (slugTouched ? slug : slugify(title)),
    [slug, slugTouched, title],
  )

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) {
      setTags([...tags, t])
    }
    setTagInput("")
  }

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (res.ok && data.url) {
        setCoverImage(data.url)
      } else {
        setError(data.error || "Error al subir la imagen de portada")
      }
    } catch {
      setError("Error de red al subir la imagen")
    } finally {
      setUploadingCover(false)
    }
  }

  const handleSave = async () => {
    setError(null)

    if (!title.trim()) {
      setError("El título es obligatorio")
      return
    }

    const content = blocksToMarkdown(blocks)
    if (!content.trim()) {
      setError("El contenido no puede estar vacío")
      return
    }

    setSaving(true)

    const input: BlogPostInput = {
      slug: effectiveSlug,
      title,
      excerpt,
      content,
      category,
      tags,
      readTime: estimateReadTime(blocks),
      coverImage,
      featured,
      publishedAt,
    }

    const result = isEditing && post ? await updatePost(post.id, input) : await createPost(input)

    setSaving(false)

    if (result.success && result.slug) {
      router.push(`/blog/${result.slug}`)
      router.refresh()
    } else {
      setError(result.error || "Error al guardar")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-mono text-xs hidden sm:inline">volver_al_blog</span>
          </Link>

          <span className="ml-auto flex items-center gap-2 font-mono text-xs text-primary">
            <PenLine className="h-3.5 w-3.5" />
            {isEditing ? "editando_entrada" : "nueva_entrada"}
          </span>

          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEditing ? "Guardar cambios" : "Publicar"}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive font-mono">
            {error}
          </div>
        )}

        {/* Cover image */}
        <div className="mb-6">
          {coverImage ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImage || "/placeholder.svg"}
                alt="Imagen de portada"
                className="w-full h-48 md:h-64 object-cover rounded-lg border border-border"
              />
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-3 right-3 h-8 w-8"
                onClick={() => setCoverImage(null)}
                aria-label="Quitar portada"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <label className="flex items-center gap-2 w-fit cursor-pointer rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              {uploadingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
              <span className="font-mono text-xs">
                {uploadingCover ? "subiendo..." : "+ agregar imagen de portada"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleCoverUpload(file)
                  e.target.value = ""
                }}
              />
            </label>
          )}
        </div>

        {/* Title */}
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value.replace(/\n/g, ""))}
          placeholder="Título de la entrada"
          rows={1}
          className="w-full resize-none bg-transparent font-serif text-3xl md:text-4xl font-bold outline-none placeholder:text-muted-foreground/40 mb-2"
          onInput={(e) => {
            const el = e.currentTarget
            el.style.height = "auto"
            el.style.height = `${el.scrollHeight}px`
          }}
        />

        {/* Slug */}
        <div className="flex items-center gap-2 mb-6 text-sm font-mono text-muted-foreground">
          <span className="shrink-0">/blog/</span>
          <input
            type="text"
            value={effectiveSlug}
            onChange={(e) => {
              setSlugTouched(true)
              setSlug(slugify(e.target.value))
            }}
            placeholder="slug-de-la-entrada"
            className="flex-1 bg-transparent outline-none border-b border-transparent focus:border-border transition-colors"
          />
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 rounded-lg border border-border bg-card p-4">
          <div className="space-y-2">
            <Label className="font-mono text-xs text-muted-foreground">Categoría</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="published-date" className="font-mono text-xs text-muted-foreground">
              Fecha de publicación
            </Label>
            <Input
              id="published-date"
              type="date"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className="bg-background"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="excerpt-input" className="font-mono text-xs text-muted-foreground">
              Extracto (resumen breve)
            </Label>
            <Textarea
              id="excerpt-input"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Un resumen de 1-2 oraciones que aparece en el listado del blog..."
              className="bg-background resize-none"
              rows={2}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="tag-input" className="font-mono text-xs text-muted-foreground">
              Etiquetas
            </Label>
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="font-mono text-xs gap-1 pr-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                    className="rounded-full p-0.5 hover:bg-muted"
                    aria-label={`Quitar etiqueta ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Input
                id="tag-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === ",") && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                    e.preventDefault()
                    addTag()
                  }
                }}
                onBlur={addTag}
                placeholder="Escribe y presiona Enter..."
                className="bg-background w-56 h-8 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:col-span-2">
            <Switch id="featured-switch" checked={featured} onCheckedChange={setFeatured} />
            <Label htmlFor="featured-switch" className="flex items-center gap-2 text-sm cursor-pointer">
              <Star className={`h-4 w-4 ${featured ? "text-chart-2 fill-chart-2" : "text-muted-foreground"}`} />
              Entrada destacada
            </Label>
            <span className="ml-auto font-mono text-xs text-muted-foreground flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {estimateReadTime(blocks)} de lectura
            </span>
          </div>
        </div>

        {/* Content editor */}
        <div className="rounded-lg border border-border bg-card p-4 md:p-6 min-h-[400px]">
          <p className="mb-4 font-mono text-xs text-muted-foreground">
            {"Escribe '/' en un bloque vacío para insertar títulos, listas, citas, código, imágenes y más."}
          </p>
          <BlockEditor blocks={blocks} onChange={setBlocks} />
        </div>
      </main>
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, Eye, EyeOff, Loader2, Plus, Save, Star, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TagPicker } from "@/components/games/tag-picker"
import { FieldShell, FormSection, ImageDrop } from "@/components/games/game-editor-form"
import { GamePlayer } from "@/components/games/game-player"
import { createProject, updateProject } from "@/app/actions/projects"
import { slugify } from "@/lib/games-options"
import {
  PROJECT_STATUSES,
  RESOURCE_TYPES,
  statusConfig,
  toProjectEmbed,
  type Project,
  type ProjectInput,
} from "@/lib/projects-types"
import { cn } from "@/lib/utils"

type Taxonomy = { categories: string[]; platforms: string[]; tags: string[] }
type Props = { project?: Project; taxonomy: Taxonomy }

const defaults: ProjectInput = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  status: "idea",
  categories: [],
  platforms: [],
  tags: [],
  projectDate: "",
  coverImage: "",
  screenshots: [],
  embedUrl: "",
  embedWidth: 1280,
  embedHeight: 740,
  externalUrl: "",
  resources: [],
}

function toInput(p: Project): ProjectInput {
  return {
    title: p.title,
    slug: p.slug,
    shortDescription: p.shortDescription,
    description: p.description,
    status: p.status,
    categories: p.categories,
    platforms: p.platforms,
    tags: p.tags,
    projectDate: p.projectDate,
    coverImage: p.coverImage ?? "",
    screenshots: p.screenshots,
    embedUrl: p.embedUrl ?? "",
    embedWidth: p.embedWidth,
    embedHeight: p.embedHeight,
    externalUrl: p.externalUrl ?? "",
    resources: p.resources,
  }
}

async function uploadImage(file: File) {
  const body = new FormData()
  body.append("file", file)
  body.append("folder", "projects")
  const res = await fetch("/api/admin/upload", { method: "POST", body })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.url) throw new Error(data.error ?? "No se pudo subir la imagen.")
  return data.url as string
}

export function ProjectEditorForm({ project, taxonomy }: Props) {
  const router = useRouter()
  const initial = useMemo(() => (project ? toInput(project) : defaults), [project])
  const [form, setForm] = useState<ProjectInput>(initial)
  const [slugTouched, setSlugTouched] = useState(Boolean(project))
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<"cover" | "screenshots" | null>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dirty = JSON.stringify(form) !== JSON.stringify(initial)

  useEffect(() => {
    if (!dirty || saving) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty, saving])

  const update = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) => setForm((prev) => ({ ...prev, [key]: value }))

  const setTitle = (title: string) => setForm((prev) => ({ ...prev, title, slug: slugTouched ? prev.slug : slugify(title) }))

  const setEmbed = (raw: string) => {
    if (!/<iframe|docs\.google\.com\/presentation/i.test(raw)) return update("embedUrl", raw)
    const parsed = toProjectEmbed(raw)
    setForm((prev) => ({
      ...prev,
      embedUrl: parsed.url,
      embedWidth: parsed.width ?? prev.embedWidth,
      embedHeight: parsed.height ?? prev.embedHeight,
    }))
  }

  const handleFiles = async (files: FileList | null, target: "cover" | "screenshots") => {
    if (!files?.length) return
    setUploading(target)
    setError(null)
    try {
      const urls = await Promise.all(Array.from(files).map(uploadImage))
      if (target === "cover") update("coverImage", urls[0])
      else setForm((prev) => ({ ...prev, screenshots: [...prev.screenshots, ...urls].slice(0, 12) }))
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir la imagen.")
    } finally {
      setUploading(null)
    }
  }

  const addImageUrl = () => {
    const url = imageUrl.trim()
    if (!/^(https?:\/\/|\/)\S+$/.test(url)) return
    setForm((prev) => ({ ...prev, screenshots: [...prev.screenshots, url].slice(0, 12) }))
    setImageUrl("")
  }

  const updateResource = (index: number, key: "type" | "label" | "url", value: string) =>
    setForm((prev) => ({ ...prev, resources: prev.resources.map((r, i) => (i === index ? { ...r, [key]: value } : r)) }))

  const save = async () => {
    setSaving(true)
    setError(null)
    const result = project ? await updateProject(project.id, form) : await createProject(form)
    if (!result.success) {
      setSaving(false)
      setError(result.error)
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    router.push(`/proyectos/${result.slug}`)
    router.refresh()
  }

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
    >
      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <FormSection title="Información básica">
        <div className="grid gap-5 md:grid-cols-2">
          <FieldShell label="Título" required>
            {(id) => <Input id={id} value={form.title} onChange={(e) => setTitle(e.target.value)} maxLength={160} />}
          </FieldShell>
          <FieldShell label="Slug (URL)" required hint={`/proyectos/${form.slug || "mi-proyecto"}`}>
            {(id) => (
              <Input
                id={id}
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  update("slug", slugify(e.target.value))
                }}
              />
            )}
          </FieldShell>
        </div>
        <FieldShell label="Descripción corta" hint="Se ve en la tarjeta de la galería." counter={`${form.shortDescription.length}/500`}>
          {(id) => <Textarea id={id} rows={2} maxLength={500} value={form.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} />}
        </FieldShell>
        <FieldShell label="Descripción larga" hint="Separa párrafos con una línea en blanco." counter={`${form.description.length}/10000`}>
          {(id) => <Textarea id={id} rows={8} maxLength={10000} value={form.description} onChange={(e) => update("description", e.target.value)} />}
        </FieldShell>
        <FieldShell label="Fecha" hint="Texto libre, por ejemplo: 2025-07 o Julio 2025.">
          {(id) => <Input id={id} value={form.projectDate} onChange={(e) => update("projectDate", e.target.value)} className="max-w-xs" />}
        </FieldShell>
      </FormSection>

      <FormSection title="Estado">
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Estado del proyecto">
          {PROJECT_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              role="radio"
              aria-checked={form.status === status}
              onClick={() => update("status", status)}
              className={cn(
                "rounded-md border px-3 py-1.5 font-mono text-xs transition-colors",
                form.status === status ? statusConfig[status].color : "border-border text-muted-foreground hover:border-primary/40",
              )}
            >
              {statusConfig[status].label}
            </button>
          ))}
        </div>
      </FormSection>

      <FormSection title="Clasificación">
        <TagPicker label="Categorías" value={form.categories} options={taxonomy.categories} onChange={(v) => update("categories", v)} />
        <TagPicker label="Plataformas" value={form.platforms} options={taxonomy.platforms} onChange={(v) => update("platforms", v)} />
        <TagPicker label="Etiquetas" description="Herramientas, temas o técnicas." value={form.tags} options={taxonomy.tags} onChange={(v) => update("tags", v)} />
      </FormSection>

      <FormSection
        title="Jugable / embed"
        description="Pega un iframe (itch.io, etc.) o un link de Google Slides: se convierte solo en presentación embebida. Déjalo vacío si no es jugable."
      >
        <FieldShell label="Iframe o URL del embed">
          {(id) => <Textarea id={id} rows={3} value={form.embedUrl} onChange={(e) => setEmbed(e.target.value)} placeholder='<iframe src="..."></iframe>' className="font-mono text-xs" />}
        </FieldShell>
        <div className="grid max-w-sm grid-cols-2 gap-4">
          <FieldShell label="Ancho">
            {(id) => <Input id={id} type="number" value={form.embedWidth} onChange={(e) => update("embedWidth", Number(e.target.value))} />}
          </FieldShell>
          <FieldShell label="Alto">
            {(id) => <Input id={id} type="number" value={form.embedHeight} onChange={(e) => update("embedHeight", Number(e.target.value))} />}
          </FieldShell>
        </div>
        {form.embedUrl && (
          <div className="flex flex-col gap-3">
            <Button type="button" variant="outline" size="sm" className="w-fit gap-2" onClick={() => setShowPreview((v) => !v)}>
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPreview ? "Ocultar vista previa" : "Ver vista previa"}
            </Button>
            {showPreview && (
              <div className="w-full" style={{ maxWidth: `${form.embedWidth}px` }}>
                <GamePlayer title={form.title || "Vista previa"} embedUrl={form.embedUrl} width={form.embedWidth} height={form.embedHeight} coverImage={form.coverImage || null} />
              </div>
            )}
          </div>
        )}
        <FieldShell label="Link externo (opcional)" hint="Página original del proyecto. Aparece como botón.">
          {(id) => <Input id={id} value={form.externalUrl} onChange={(e) => update("externalUrl", e.target.value)} placeholder="https://..." />}
        </FieldShell>
      </FormSection>

      <FormSection title="Imágenes" description="La portada aparece en la galería y como fondo del reproductor.">
        <div className="max-w-md">
          <ImageDrop
            image={form.coverImage}
            busy={uploading === "cover"}
            label="Subir portada"
            onFile={(files) => handleFiles(files, "cover")}
            onClear={() => update("coverImage", "")}
          />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {form.screenshots.map((src, i) => (
            <div key={src + i} className="group relative aspect-video overflow-hidden rounded-md border border-border bg-muted">
              <img src={src || "/placeholder.svg"} alt={`Captura ${i + 1}`} className="h-full w-full object-cover" />
              <div className="absolute right-1.5 bottom-1.5 flex gap-1">
                <Button type="button" size="icon" variant="secondary" className="h-7 w-7" onClick={() => update("coverImage", src)} aria-label="Usar como portada">
                  <Star className={cn("h-3.5 w-3.5", form.coverImage === src && "fill-current text-primary")} />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-7 w-7 hover:text-destructive"
                  onClick={() => update("screenshots", form.screenshots.filter((_, j) => j !== i))}
                  aria-label="Quitar captura"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {form.screenshots.length < 12 && (
            <div className="aspect-video">
              <ImageDrop compact multiple busy={uploading === "screenshots"} label="Agregar capturas" onFile={(files) => handleFiles(files, "screenshots")} />
            </div>
          )}
        </div>
        <div className="flex max-w-xl gap-2">
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="o pega la URL de una imagen"
            aria-label="URL de imagen"
            onKeyDown={(e) => {
              if (e.key !== "Enter" || e.nativeEvent.isComposing || e.keyCode === 229) return
              e.preventDefault()
              addImageUrl()
            }}
          />
          <Button type="button" variant="outline" onClick={addImageUrl}>
            Agregar
          </Button>
        </div>
      </FormSection>

      <FormSection title="Recursos y links" description="Documentos, presentaciones, videos o páginas relacionadas.">
        {form.resources.map((resource, i) => (
          <div key={i} className="grid gap-2 md:grid-cols-[160px_1fr_1.5fr_auto]">
            <Select value={resource.type} onValueChange={(v) => updateResource(i, "type", v)}>
              <SelectTrigger aria-label="Tipo de recurso">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESOURCE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input value={resource.label} onChange={(e) => updateResource(i, "label", e.target.value)} placeholder="Nombre del botón" aria-label="Nombre del recurso" />
            <Input value={resource.url} onChange={(e) => updateResource(i, "url", e.target.value)} placeholder="https://..." aria-label="URL del recurso" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hover:text-destructive"
              onClick={() => update("resources", form.resources.filter((_, j) => j !== i))}
              aria-label="Quitar recurso"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit gap-2"
          onClick={() => update("resources", [...form.resources, { type: "Página", label: "", url: "" }])}
        >
          <Plus className="h-4 w-4" />
          Agregar recurso
        </Button>
      </FormSection>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-3 rounded-lg border border-border bg-card/95 p-3 backdrop-blur">
        {dirty && <span className="mr-auto font-mono text-xs text-muted-foreground">cambios sin guardar</span>}
        <Button type="button" variant="ghost" asChild>
          <Link href={project ? `/proyectos/${project.slug}` : "/proyectos"}>Cancelar</Link>
        </Button>
        <Button type="submit" disabled={saving || uploading !== null} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {project ? "Guardar cambios" : "Crear proyecto"}
        </Button>
      </div>
    </form>
  )
}

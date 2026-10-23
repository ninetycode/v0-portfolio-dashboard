"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Monitor,
  Plus,
  Save,
  Star,
  Trash2,
  Upload,
  WandSparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TagPicker } from "@/components/games/tag-picker"
import { importItchGame, createGame, updateGame } from "@/app/actions/games"
import {
  BROWSER_PLATFORM,
  DEFAULT_DOWNLOAD_PLATFORMS,
  DEFAULT_GENRES,
  STATUS_OPTIONS,
  parseEmbed,
  slugify,
  uniqueTags,
  type GameTaxonomy,
} from "@/lib/games-options"
import type { GameDetail, GameInput } from "@/lib/games-types"
import { cn } from "@/lib/utils"

type Props = { game?: GameDetail; taxonomy?: GameTaxonomy }
type Message = { kind: "success" | "error"; text: string } | null

const COMMON_ENGINES = ["Godot", "Unity", "GameMaker", "Unreal", "Construct", "PICO-8"]

const defaults: GameInput = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  controls: "",
  genres: [],
  platforms: [BROWSER_PLATFORM],
  engine: "",
  status: STATUS_OPTIONS[0],
  embedUrl: "",
  embedWidth: 1280,
  embedHeight: 740,
  externalUrl: "",
  coverImage: "",
  screenshots: [],
  docLinks: [],
}

const isBrowserPlatform = (p: string) => p.toLowerCase() === BROWSER_PLATFORM.toLowerCase()
const isHttpUrl = (value: string) => /^https?:\/\/\S+$/i.test(value.trim())

function toInput(game: GameDetail): GameInput {
  return {
    title: game.title,
    slug: game.slug,
    shortDescription: game.shortDescription,
    description: game.description,
    controls: game.controls,
    genres: game.genres,
    platforms: game.platforms,
    engine: game.engine ?? "",
    status: game.status,
    embedUrl: game.embedUrl ?? "",
    embedWidth: game.embedWidth,
    embedHeight: game.embedHeight,
    externalUrl: game.externalUrl ?? "",
    coverImage: game.coverImage ?? "",
    screenshots: game.screenshots,
    docLinks: game.docLinks,
  }
}

async function uploadImage(file: File) {
  const body = new FormData()
  body.append("file", file)
  body.append("folder", "games")
  const res = await fetch("/api/admin/upload", { method: "POST", body })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.url) throw new Error(data.error ?? "No se pudo subir la imagen.")
  return data.url as string
}

export function GameEditorForm({ game, taxonomy }: Props) {
  const router = useRouter()
  const initial = useMemo(() => (game ? toInput(game) : defaults), [game])
  const [form, setForm] = useState<GameInput>(initial)
  const [slugTouched, setSlugTouched] = useState(Boolean(game))
  const [downloadable, setDownloadable] = useState(initial.platforms.some((p) => !isBrowserPlatform(p)))
  const [itchUrl, setItchUrl] = useState("")
  const [embedCode, setEmbedCode] = useState("")
  const [importing, setImporting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<"cover" | "screenshots" | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [screenshotUrl, setScreenshotUrl] = useState("")
  const [message, setMessage] = useState<Message>(null)
  const [errors, setErrors] = useState<string[]>([])

  const isBrowser = form.platforms.some(isBrowserPlatform)
  const osPlatforms = form.platforms.filter((p) => !isBrowserPlatform(p))
  const dirty = JSON.stringify(form) !== JSON.stringify(initial)

  useEffect(() => {
    if (!dirty || saving) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty, saving])

  const update = <K extends keyof GameInput>(key: K, value: GameInput[K]) => setForm((prev) => ({ ...prev, [key]: value }))

  const setTitle = (title: string) =>
    setForm((prev) => ({ ...prev, title, slug: slugTouched ? prev.slug : slugify(title) }))

  const setPlatforms = (browser: boolean, os: string[]) =>
    update("platforms", uniqueTags([...(browser ? [BROWSER_PLATFORM] : []), ...os]))

  const toggleDownloadable = () => {
    if (downloadable) {
      setDownloadable(false)
      setPlatforms(isBrowser, [])
    } else {
      setDownloadable(true)
      if (osPlatforms.length === 0) setPlatforms(isBrowser, ["Windows"])
    }
  }

  const setEmbed = (raw: string) => {
    const parsed = parseEmbed(raw)
    setForm((prev) => ({
      ...prev,
      embedUrl: parsed.url,
      embedWidth: parsed.width ?? prev.embedWidth,
      embedHeight: parsed.height ?? prev.embedHeight,
    }))
  }

  const runImport = async () => {
    setImporting(true)
    setMessage(null)
    const result = await importItchGame({ itchUrl, embedCode })
    setImporting(false)
    if (!result.success) return setMessage({ kind: "error", text: result.error })
    const data = result.data
    setForm((prev) => ({ ...prev, ...data }))
    if (data.platforms?.some((p) => !isBrowserPlatform(p))) setDownloadable(true)
    setSlugTouched(false)
    setErrors([])
    setMessage({ kind: "success", text: "Ficha importada. Revisa los géneros, controles y capturas antes de guardar." })
  }

  const handleCoverUpload = async (file?: File) => {
    if (!file) return
    setUploading("cover")
    try {
      update("coverImage", await uploadImage(file))
    } catch (e) {
      setMessage({ kind: "error", text: (e as Error).message })
    }
    setUploading(null)
  }

  const handleScreenshotUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading("screenshots")
    try {
      const urls = await Promise.all([...files].slice(0, 12).map(uploadImage))
      setForm((prev) => ({ ...prev, screenshots: uniqueTags([...prev.screenshots, ...urls]).slice(0, 12) }))
    } catch (e) {
      setMessage({ kind: "error", text: (e as Error).message })
    }
    setUploading(null)
  }

  const addScreenshotUrl = () => {
    if (!isHttpUrl(screenshotUrl)) return
    setForm((prev) => ({ ...prev, screenshots: uniqueTags([...prev.screenshots, screenshotUrl.trim()]).slice(0, 12) }))
    setScreenshotUrl("")
  }

  const validate = () => {
    const issues: string[] = []
    if (!form.title.trim()) issues.push("title")
    if (!slugify(form.slug)) issues.push("slug")
    if (!form.shortDescription.trim()) issues.push("shortDescription")
    if (!isBrowser && !downloadable) issues.push("platforms")
    if (downloadable && osPlatforms.length === 0) issues.push("os")
    if (isBrowser && !isHttpUrl(form.embedUrl)) issues.push("embedUrl")
    if (!isBrowser && !isHttpUrl(form.externalUrl)) issues.push("externalUrl")
    return issues
  }

  const save = async () => {
    const issues = validate()
    setErrors(issues)
    if (issues.length) {
      setMessage({ kind: "error", text: "Revisa los campos marcados en rojo." })
      document.querySelector(`[data-field="${issues[0]}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    setSaving(true)
    setMessage(null)
    const payload = { ...form, slug: slugify(form.slug) }
    const result = game ? await updateGame(game.id, payload) : await createGame(payload)
    if (result.success && result.slug) {
      router.push(`/games/${result.slug}`)
      router.refresh()
      return
    }
    setSaving(false)
    setMessage({ kind: "error", text: "error" in result ? result.error : "No se pudo guardar el juego." })
  }

  const hasError = (field: string) => errors.includes(field)

  return (
    <div className="flex flex-col gap-10">
      {!game && (
        <section className="flex flex-col gap-5 rounded-lg border border-primary/30 bg-primary/5 p-5 md:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <WandSparkles className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-serif text-xl font-semibold">Importar desde itch.io</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {"Traigo título, descripción, portada, género, motor, estado y plataformas. El iframe es opcional: pégalo si el juego se juega en el navegador."}
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FieldShell label="URL pública de itch.io">
              {(id) => (
                <Input id={id} value={itchUrl} onChange={(e) => setItchUrl(e.target.value)} placeholder="https://usuario.itch.io/mi-juego" autoComplete="off" />
              )}
            </FieldShell>
            <FieldShell label="Iframe (opcional)">
              {(id) => (
                <Input id={id} value={embedCode} onChange={(e) => setEmbedCode(e.target.value)} placeholder={'<iframe src="https://itch.io/embed-upload/..." ...>'} autoComplete="off" className="font-mono text-xs" />
              )}
            </FieldShell>
          </div>
          <Button type="button" onClick={runImport} disabled={importing || !itchUrl.trim()} className="gap-2 self-start">
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
            {importing ? "Importando..." : "Importar datos"}
          </Button>
        </section>
      )}

      <FormSection title="Información básica">
        <div className="grid gap-5 md:grid-cols-2">
          <FieldShell label="Título" required error={hasError("title") ? "Escribe un título." : undefined} field="title">
            {(id) => <Input id={id} value={form.title} onChange={(e) => setTitle(e.target.value)} autoComplete="off" placeholder="Mi gran juego" />}
          </FieldShell>
          <FieldShell
            label="URL del juego"
            required
            field="slug"
            error={hasError("slug") ? "El slug no puede estar vacío." : undefined}
            hint={slugTouched ? undefined : "Se genera a partir del título."}
          >
            {(id) => (
              <div className="flex items-center overflow-hidden rounded-md border border-input bg-background focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
                <span className="border-r border-border bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">/games/</span>
                <input
                  id={id}
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true)
                    update("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))
                  }}
                  onBlur={() => update("slug", slugify(form.slug))}
                  autoComplete="off"
                  spellCheck={false}
                  className="h-9 min-w-0 flex-1 bg-transparent px-3 font-mono text-sm outline-none"
                />
              </div>
            )}
          </FieldShell>
        </div>
        <FieldShell
          label="Descripción breve"
          required
          field="shortDescription"
          error={hasError("shortDescription") ? "Escribe una frase para la tarjeta del juego." : undefined}
          counter={`${form.shortDescription.length}/500`}
        >
          {(id) => (
            <Textarea id={id} value={form.shortDescription} maxLength={500} onChange={(e) => update("shortDescription", e.target.value)} placeholder="Aparece en la tarjeta de la galería." className="min-h-20" />
          )}
        </FieldShell>
        <FieldShell label="Descripción completa">
          {(id) => (
            <Textarea id={id} value={form.description} onChange={(e) => update("description", e.target.value)} className="min-h-40" placeholder="Historia, mecánicas, créditos..." />
          )}
        </FieldShell>
      </FormSection>

      <FormSection title="Clasificación">
        <TagPicker
          label="Géneros"
          description="Toca para seleccionar. Escribe y pulsa Enter para crear uno nuevo; quedará disponible para los próximos juegos."
          value={form.genres}
          options={taxonomy?.genres ?? DEFAULT_GENRES}
          onChange={(genres) => update("genres", genres)}
          placeholder="Buscar o crear género..."
        />
        <div className="grid gap-5 md:grid-cols-2">
          <FieldShell label="Estado">
            {(id) => (
              <Select value={form.status} onValueChange={(status) => update("status", status)}>
                <SelectTrigger id={id} className="w-full">
                  <SelectValue placeholder="Elige un estado" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueTags([...STATUS_OPTIONS, form.status]).map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FieldShell>
          <FieldShell label="Motor">
            {(id) => (
              <div className="flex flex-col gap-2">
                <Input id={id} value={form.engine} onChange={(e) => update("engine", e.target.value)} placeholder="Godot, Unity..." autoComplete="off" />
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_ENGINES.map((engine) => (
                    <button
                      key={engine}
                      type="button"
                      onClick={() => update("engine", engine)}
                      aria-pressed={form.engine === engine}
                      className={cn(
                        "rounded-md border px-2 py-0.5 font-mono text-xs transition-colors",
                        form.engine === engine ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {engine}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </FieldShell>
        </div>
      </FormSection>

      <FormSection title="¿Cómo se juega?" description="Puedes elegir ambas opciones.">
        <div className="grid gap-3 sm:grid-cols-2" data-field="platforms" role="group" aria-label="Tipo de distribución">
          <ModeCard
            icon={<Monitor className="h-5 w-5" />}
            title="En el navegador"
            text="Se juega embebido en la página."
            active={isBrowser}
            error={hasError("platforms")}
            onClick={() => setPlatforms(!isBrowser, osPlatforms)}
          />
          <ModeCard
            icon={<Download className="h-5 w-5" />}
            title="Descargable"
            text="El jugador descarga un ejecutable."
            active={downloadable}
            error={hasError("platforms")}
            onClick={toggleDownloadable}
          />
        </div>
        {hasError("platforms") && <ErrorText>Elige al menos una forma de jugar.</ErrorText>}

        {isBrowser && (
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
            <FieldShell
              label="Iframe o URL del embed"
              required
              field="embedUrl"
              hint="Pega el iframe completo de itch.io: extraigo la URL y el tamaño solos."
              error={hasError("embedUrl") ? "Falta una URL de embed válida." : undefined}
            >
              {(id) => (
                <Input id={id} value={form.embedUrl} onChange={(e) => setEmbed(e.target.value)} placeholder="https://itch.io/embed-upload/..." autoComplete="off" className="font-mono text-xs" />
              )}
            </FieldShell>
            <div className="flex flex-wrap items-end gap-4">
              <FieldShell label="Ancho (px)">
                {(id) => <Input id={id} type="number" min={320} max={2400} value={form.embedWidth} onChange={(e) => update("embedWidth", Number(e.target.value))} className="w-28" />}
              </FieldShell>
              <FieldShell label="Alto (px)">
                {(id) => <Input id={id} type="number" min={240} max={1600} value={form.embedHeight} onChange={(e) => update("embedHeight", Number(e.target.value))} className="w-28" />}
              </FieldShell>
              <Button type="button" variant="outline" className="gap-2 bg-transparent" disabled={!isHttpUrl(form.embedUrl)} onClick={() => setShowPreview((v) => !v)}>
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPreview ? "Ocultar prueba" : "Probar embed"}
              </Button>
            </div>
            {showPreview && isHttpUrl(form.embedUrl) && (
              <div className="overflow-hidden rounded-md border border-border bg-muted" style={{ aspectRatio: `${form.embedWidth} / ${form.embedHeight}` }}>
                <iframe src={form.embedUrl} title="Vista previa del juego" className="h-full w-full" allowFullScreen />
              </div>
            )}
          </div>
        )}

        {downloadable && (
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4" data-field="os">
            <TagPicker
              label="Plataformas de descarga"
              value={osPlatforms}
              options={taxonomy?.platforms ?? DEFAULT_DOWNLOAD_PLATFORMS}
              onChange={(os) => setPlatforms(isBrowser, os)}
              placeholder="Otra plataforma..."
              max={8}
            />
            {hasError("os") && <ErrorText>Elige al menos una plataforma.</ErrorText>}
          </div>
        )}

        <FieldShell
          label={isBrowser ? "Página externa (itch.io)" : "Enlace de descarga"}
          required={!isBrowser}
          field="externalUrl"
          hint={isBrowser ? "Opcional. Aparece como botón “Ver en itch.io”." : undefined}
          error={hasError("externalUrl") ? "Los juegos descargables necesitan un enlace." : undefined}
        >
          {(id) => <Input id={id} value={form.externalUrl} onChange={(e) => update("externalUrl", e.target.value)} placeholder="https://usuario.itch.io/mi-juego" autoComplete="off" />}
        </FieldShell>
      </FormSection>

      <FormSection title="Imágenes">
        <div className="grid gap-5 md:grid-cols-[280px_minmax(0,1fr)]">
          <div className="flex flex-col gap-2">
            <Label>Portada</Label>
            <ImageDrop
              image={form.coverImage}
              busy={uploading === "cover"}
              onFile={(files) => handleCoverUpload(files?.[0])}
              onClear={() => update("coverImage", "")}
              label="Subir portada"
            />
          </div>
          <FieldShell label="O pega la URL de la portada" hint="Recomendado 16:9. Máx. 10 MB.">
            {(id) => <Input id={id} value={form.coverImage} onChange={(e) => update("coverImage", e.target.value)} placeholder="https://..." autoComplete="off" />}
          </FieldShell>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <Label>Capturas</Label>
            <span className="font-mono text-xs text-muted-foreground">{form.screenshots.length}/12</span>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {form.screenshots.map((src, i) => (
              <li key={src} className="group relative aspect-video overflow-hidden rounded-md border border-border bg-muted">
                <img src={src || "/placeholder.svg"} alt={`Captura ${i + 1}`} className="h-full w-full object-cover" style={{ imageRendering: "pixelated" }} />
                {form.coverImage === src && (
                  <span className="absolute top-1.5 left-1.5 rounded bg-primary px-1.5 py-0.5 font-mono text-[10px] text-primary-foreground">portada</span>
                )}
                <div className="absolute inset-x-1.5 bottom-1.5 flex justify-end gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                  <Button type="button" size="icon" variant="secondary" className="h-7 w-7" onClick={() => update("coverImage", src)} aria-label={`Usar captura ${i + 1} como portada`}>
                    <Star className="h-3.5 w-3.5" />
                  </Button>
                  <Button type="button" size="icon" variant="secondary" className="h-7 w-7 hover:text-destructive" onClick={() => update("screenshots", form.screenshots.filter((s) => s !== src))} aria-label={`Quitar captura ${i + 1}`}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
            {form.screenshots.length < 12 && (
              <li className="aspect-video">
                <ImageDrop busy={uploading === "screenshots"} onFile={handleScreenshotUpload} label="Subir capturas" multiple compact />
              </li>
            )}
          </ul>
          <div className="flex gap-2">
            <Input
              value={screenshotUrl}
              onChange={(e) => setScreenshotUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing || e.keyCode === 229) return
                if (e.key === "Enter") {
                  e.preventDefault()
                  addScreenshotUrl()
                }
              }}
              placeholder="O pega la URL de una imagen y pulsa Enter"
              aria-label="URL de captura"
              autoComplete="off"
            />
            <Button type="button" variant="outline" className="bg-transparent" onClick={addScreenshotUrl} disabled={!isHttpUrl(screenshotUrl)}>
              Añadir
            </Button>
          </div>
        </div>
      </FormSection>

      <FormSection title="Controles" description="Una línea por acción, con el formato “Teclas - Acción”. Separa teclas alternativas con /.">
        <div className="grid gap-4 md:grid-cols-2">
          <Textarea
            value={form.controls}
            onChange={(e) => update("controls", e.target.value)}
            placeholder={"W/A/S/D - Moverse\nEspacio - Saltar\nJ - Atacar"}
            aria-label="Controles"
            className="min-h-40 font-mono text-sm"
          />
          <ControlsPreview controls={form.controls} />
        </div>
      </FormSection>

      <FormSection title="Documentación y enlaces">
        <div className="flex flex-col gap-2">
          {form.docLinks.map((doc, i) => (
            <div className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]" key={i}>
              <Input
                placeholder="GDD, Devlog..."
                aria-label={`Etiqueta del enlace ${i + 1}`}
                value={doc.label}
                onChange={(e) => update("docLinks", form.docLinks.map((d, n) => (n === i ? { ...d, label: e.target.value } : d)))}
              />
              <Input
                placeholder="https://..."
                aria-label={`URL del enlace ${i + 1}`}
                value={doc.url}
                onChange={(e) => update("docLinks", form.docLinks.map((d, n) => (n === i ? { ...d, url: e.target.value } : d)))}
              />
              <Button type="button" size="icon" variant="ghost" onClick={() => update("docLinks", form.docLinks.filter((_, n) => n !== i))} aria-label={`Quitar enlace ${i + 1}`}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button type="button" size="sm" variant="outline" onClick={() => update("docLinks", [...form.docLinks, { label: "", url: "" }])} className="gap-1 self-start bg-transparent">
            <Plus className="h-4 w-4" />
            Agregar enlace
          </Button>
        </div>
      </FormSection>

      <div className="sticky bottom-14 z-40 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur-md">
        <div className="min-w-0 flex-1" aria-live="polite">
          {message ? (
            <p className={cn("flex items-center gap-2 text-sm", message.kind === "error" ? "text-destructive" : "text-primary")}>
              {message.kind === "error" ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
              {message.text}
            </p>
          ) : (
            <p className="font-mono text-xs text-muted-foreground">{dirty ? "Cambios sin guardar" : "Sin cambios"}</p>
          )}
        </div>
        <Button asChild variant="ghost">
          <Link href={game ? `/games/${game.slug}` : "/games"}>Cancelar</Link>
        </Button>
        <Button type="button" onClick={save} disabled={saving || Boolean(uploading)} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {game ? "Guardar cambios" : "Publicar juego"}
        </Button>
      </div>
    </div>
  )
}

function FormSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5 border-t border-border pt-8">
      <div>
        <h2 className="font-serif text-xl font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function FieldShell({
  label,
  required,
  hint,
  error,
  counter,
  field,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  error?: string
  counter?: string
  field?: string
  children: (id: string) => React.ReactNode
}) {
  const id = useId()
  return (
    <div className={cn("flex flex-col gap-2", error && "[&_input]:border-destructive [&_textarea]:border-destructive")} data-field={field}>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-destructive" aria-hidden="true">*</span>}
        </Label>
        {counter && <span className="font-mono text-xs text-muted-foreground">{counter}</span>}
      </div>
      {children(id)}
      {error ? <ErrorText>{error}</ErrorText> : hint && <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  )
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-destructive">{children}</p>
}

function ModeCard({ icon, title, text, active, error, onClick }: { icon: React.ReactNode; title: string; text: string; active: boolean; error?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 text-left transition-colors",
        active ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40",
        error && !active && "border-destructive",
      )}
    >
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md", active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
        {icon}
      </span>
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="font-medium">{title}</span>
        <span className="text-xs leading-relaxed text-muted-foreground">{text}</span>
      </span>
      <span
        className={cn("mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded border", active ? "border-primary bg-primary" : "border-border")}
        aria-hidden="true"
      >
        {active && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
      </span>
    </button>
  )
}

function ImageDrop({
  image,
  busy,
  onFile,
  onClear,
  label,
  multiple,
  compact,
}: {
  image?: string
  busy: boolean
  onFile: (files: FileList | null) => void
  onClear?: () => void
  label: string
  multiple?: boolean
  compact?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        onFile(e.dataTransfer.files)
      }}
      className={cn(
        "relative flex h-full w-full overflow-hidden rounded-md border border-dashed bg-muted transition-colors",
        !compact && "aspect-video",
        over ? "border-primary bg-primary/10" : "border-border",
      )}
    >
      {image ? (
        <>
          <img src={image || "/placeholder.svg"} alt="Portada" className="h-full w-full object-cover" style={{ imageRendering: "pixelated" }} />
          <div className="absolute right-1.5 bottom-1.5 flex gap-1">
            <Button type="button" size="icon" variant="secondary" className="h-7 w-7" onClick={() => inputRef.current?.click()} aria-label="Cambiar portada">
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            </Button>
            {onClear && (
              <Button type="button" size="icon" variant="secondary" className="h-7 w-7 hover:text-destructive" onClick={onClear} aria-label="Quitar portada">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex h-full w-full flex-col items-center justify-center gap-1.5 p-3 text-muted-foreground transition-colors hover:text-primary"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          <span className="font-mono text-xs">{busy ? "Subiendo..." : label}</span>
          {!compact && <span className="text-xs">o arrastra una imagen aquí</span>}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          onFile(e.target.files)
          e.target.value = ""
        }}
      />
    </div>
  )
}

function ControlsPreview({ controls }: { controls: string }) {
  const rows = controls
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [keys, ...rest] = line.split(" - ")
      return { keys: keys.trim(), action: rest.join(" - ").trim() }
    })

  return (
    <div className="flex flex-col gap-2 rounded-md border border-dashed border-border p-3" aria-label="Vista previa de controles">
      <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Vista previa</span>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Los controles aparecerán aquí tal como se verán en la ficha.</p>
      ) : (
        rows.map((row, i) => (
          <div key={i} className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2">
            <div className="flex flex-wrap gap-1">
              {row.keys.split("/").map((k, n) => (
                <kbd key={n} className="min-w-7 rounded border border-b-2 border-border bg-muted px-1.5 py-0.5 text-center font-mono text-xs">
                  {k.trim()}
                </kbd>
              ))}
            </div>
            <span className={cn("text-right text-sm", row.action ? "text-muted-foreground" : "text-destructive")}>
              {row.action || "Falta “ - acción”"}
            </span>
          </div>
        ))
      )}
    </div>
  )
}

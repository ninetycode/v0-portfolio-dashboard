"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Save, Trash2, WandSparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { importItchGame, createGame, updateGame } from "@/app/actions/games"
import type { GameDetail, GameInput } from "@/lib/games-types"

type Props = { game?: GameDetail }
const defaults: GameInput = { title: "", slug: "", shortDescription: "", description: "", controls: "", genres: ["Plataformas"], platforms: ["Navegador"], engine: "", status: "Released", releaseType: "browser", embedUrl: "", embedWidth: 1280, embedHeight: 740, externalUrl: "", coverImage: "", screenshots: [], docLinks: [] }

export function GameEditorForm({ game }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<GameInput>(game ? { title: game.title, slug: game.slug, shortDescription: game.shortDescription, description: game.description, controls: game.controls, genres: game.genres, platforms: game.platforms, engine: game.engine ?? "", status: game.status, releaseType: game.releaseType, embedUrl: game.embedUrl ?? "", embedWidth: game.embedWidth, embedHeight: game.embedHeight, externalUrl: game.externalUrl ?? "", coverImage: game.coverImage ?? "", screenshots: game.screenshots, docLinks: game.docLinks } : defaults)
  const [itchUrl, setItchUrl] = useState("")
  const [embedCode, setEmbedCode] = useState("")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")

  const update = (key: keyof GameInput, value: string | number | string[] | { label: string; url: string }[]) => setForm((prev) => ({ ...prev, [key]: value } as GameInput))
  const importGame = async () => { setBusy(true); setMessage(""); const result = await importItchGame({ itchUrl, embedCode }); if (result.success) { setForm(result.data); setMessage("Datos encontrados. Revisa y completa la ficha antes de guardar.") } else setMessage(result.error); setBusy(false) }
  const save = async () => { setBusy(true); setMessage(""); const result = game ? await updateGame(game.id, form) : await createGame(form); if (result.success && result.slug) router.push(`/games/${result.slug}`); else setMessage("error" in result ? result.error : "No se pudo guardar el juego."); setBusy(false) }
  const addLine = (key: "screenshots" | "genres" | "platforms") => update(key, [...form[key], ""])
  const setLine = (key: "screenshots" | "genres" | "platforms", index: number, value: string) => update(key, form[key].map((v, i) => i === index ? value : v))
  const removeLine = (key: "screenshots" | "genres" | "platforms", index: number) => update(key, form[key].filter((_, i) => i !== index))
  const addDoc = () => update("docLinks", [...form.docLinks, { label: "", url: "" }])
  const setDoc = (index: number, key: "label" | "url", value: string) => update("docLinks", form.docLinks.map((d, i) => i === index ? { ...d, [key]: value } : d))

  return <div className="flex flex-col gap-8">
    {!game && <section className="rounded-lg border border-primary/30 bg-primary/5 p-5 flex flex-col gap-4"><div><h2 className="font-serif text-xl font-semibold">Importar desde itch.io</h2><p className="text-sm text-muted-foreground mt-1">Pega la URL pública y el iframe. Traeré automáticamente título, descripción, portada y enlace.</p></div><div className="grid gap-4 md:grid-cols-2"><div className="flex flex-col gap-2"><Label>URL de itch.io</Label><Input value={itchUrl} onChange={(e) => setItchUrl(e.target.value)} placeholder="https://tu-juego.itch.io/mi-juego" /></div><div className="flex flex-col gap-2"><Label>Iframe completo</Label><Input value={embedCode} onChange={(e) => setEmbedCode(e.target.value)} placeholder={'<iframe ...></iframe>'} /></div></div><Button type="button" onClick={importGame} disabled={busy} className="self-start gap-2"><WandSparkles className="h-4 w-4" />Importar datos</Button></section>}
    <section className="grid gap-5 md:grid-cols-2">
      <Field label="Título" value={form.title} onChange={(v) => update("title", v)} />
      <Field label="Slug" value={form.slug} onChange={(v) => update("slug", v)} />
      <Field label="Descripción breve" value={form.shortDescription} onChange={(v) => update("shortDescription", v)} />
      <Field label="Géneros (separados por coma)" value={form.genres.join(", ")} onChange={(v) => update("genres", v.split(","))} />
      <Field label="Plataformas (separadas por coma)" value={form.platforms.join(", ")} onChange={(v) => update("platforms", v.split(","))} />
      <Field label="Motor" value={form.engine} onChange={(v) => update("engine", v)} />
      <Field label="Estado" value={form.status} onChange={(v) => update("status", v)} />
      <div className="flex flex-col gap-2"><Label>Tipo de lanzamiento</Label><select value={form.releaseType} onChange={(e) => update("releaseType", e.target.value as GameInput["releaseType"])} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="browser">Jugable en navegador</option><option value="download">Descargable</option><option value="external">Página externa</option></select></div>
      <Field label="URL externa / descarga" value={form.externalUrl} onChange={(v) => update("externalUrl", v)} />
      {form.releaseType === "browser" && <Field label="URL del embed" value={form.embedUrl} onChange={(v) => update("embedUrl", v)} />}
      <Field label="URL de portada" value={form.coverImage} onChange={(v) => update("coverImage", v)} />
    </section>
    <TextField label="Descripción completa" value={form.description} onChange={(v) => update("description", v)} />
    <TextField label="Controles" value={form.controls} onChange={(v) => update("controls", v)} placeholder={'W/A/S/D - Moverse\nEspacio - Salto'} />
    <ListEditor label="Capturas (URLs)" items={form.screenshots} onAdd={() => addLine("screenshots")} onChange={(i, v) => setLine("screenshots", i, v)} onRemove={(i) => removeLine("screenshots", i)} />
    <section className="flex flex-col gap-3"><div className="flex items-center justify-between"><Label>Documentación y enlaces</Label><Button type="button" size="sm" variant="outline" onClick={addDoc}><Plus className="h-4 w-4 mr-1" />Agregar link</Button></div>{form.docLinks.map((doc, i) => <div className="grid gap-2 md:grid-cols-[1fr_2fr_auto]" key={i}><Input placeholder="Etiqueta" value={doc.label} onChange={(e) => setDoc(i, "label", e.target.value)} /><Input placeholder="https://..." value={doc.url} onChange={(e) => setDoc(i, "url", e.target.value)} /><Button type="button" size="icon" variant="ghost" onClick={() => update("docLinks", form.docLinks.filter((_, n) => n !== i))}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>)}</section>
    {message && <p className="font-mono text-sm text-primary">{message}</p>}
    <Button type="button" onClick={save} disabled={busy} className="self-start gap-2">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{game ? "Guardar cambios" : "Crear juego"}</Button>
  </div>
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) { return <div className="flex flex-col gap-2"><Label>{label}</Label><Input value={value} onChange={(e) => onChange(e.target.value)} /></div> }
function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) { return <div className="flex flex-col gap-2"><Label>{label}</Label><Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="min-h-32" /></div> }
function ListEditor({ label, items, onAdd, onChange, onRemove }: { label: string; items: string[]; onAdd: () => void; onChange: (i: number, v: string) => void; onRemove: (i: number) => void }) { return <section className="flex flex-col gap-3"><div className="flex items-center justify-between"><Label>{label}</Label><Button type="button" size="sm" variant="outline" onClick={onAdd}><Plus className="h-4 w-4 mr-1" />Agregar</Button></div>{items.map((item, i) => <div className="flex gap-2" key={i}><Input value={item} onChange={(e) => onChange(i, e.target.value)} placeholder="https://imagen..." /><Button type="button" size="icon" variant="ghost" onClick={() => onRemove(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>)}</section> }

"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { saveContactLinks } from "@/app/actions/contact-links"
import { LinkIcon } from "@/components/contactos/link-icon"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  CONTACT_ICONS,
  slugifyLinkTitle,
  type ContactHeader,
  type ContactLink,
  type ContactLinksContent,
} from "@/lib/site-content/contact-links"

const controlClass =
  "rounded-md border border-border/70 px-2.5 py-1 font-mono text-xs text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

export function ContactEditorDialog({ data }: { data: ContactLinksContent }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className={controlClass}>
          Editar Enlaces
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[min(92dvh,900px)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Editar enlaces</DialogTitle>
          <DialogDescription>Los cambios se publican en la página de contacto.</DialogDescription>
        </DialogHeader>
        {open ? <ContactLinksForm initial={data} onSaved={() => setOpen(false)} /> : null}
      </DialogContent>
    </Dialog>
  )
}

export function ContactLinksForm({
  initial,
  onSaved,
}: {
  initial: ContactLinksContent
  onSaved?: () => void
}) {
  const router = useRouter()
  const [draft, setDraft] = useState(initial)
  const [error, setError] = useState("")
  const [uploading, setUploading] = useState(false)
  const [avatarBroken, setAvatarBroken] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const links = draft.links.toSorted((a, b) => a.sortOrder - b.sortOrder)

  useEffect(() => {
    setAvatarBroken(false)
  }, [draft.header.avatarUrl])

  function patchHeader(partial: Partial<ContactHeader>) {
    setDraft((current) => ({ ...current, header: { ...current.header, ...partial } }))
  }

  function patch(id: string, partial: Partial<ContactLink>) {
    setDraft((current) => ({
      ...current,
      links: current.links.map((link) => (link.id === id ? { ...link, ...partial } : link)),
    }))
  }

  function move(id: string, direction: -1 | 1) {
    setDraft((current) => {
      const ordered = current.links.toSorted((a, b) => a.sortOrder - b.sortOrder)
      const index = ordered.findIndex((link) => link.id === id)
      const target = index + direction
      if (index < 0 || target < 0 || target >= ordered.length) return current
      const next = ordered.slice()
      const [item] = next.splice(index, 1)
      if (!item) return current
      next.splice(target, 0, item)
      return { ...current, links: next.map((link, order) => ({ ...link, sortOrder: order })) }
    })
  }

  function remove(id: string) {
    setConfirmId(null)
    setDraft((current) => ({
      ...current,
      links: current.links
        .filter((link) => link.id !== id)
        .toSorted((a, b) => a.sortOrder - b.sortOrder)
        .map((link, order) => ({ ...link, sortOrder: order })),
    }))
  }

  function addLink() {
    setDraft((current) => {
      const used = new Set(current.links.map((link) => link.slug))
      let n = current.links.length + 1
      let slug = `enlace-${n}`
      while (used.has(slug)) {
        n += 1
        slug = `enlace-${n}`
      }
      const id = globalThis.crypto?.randomUUID?.() ?? `link-${Date.now()}`
      return {
        ...current,
        links: [
          ...current.links,
          {
            id,
            slug,
            title: "Nuevo enlace",
            subtitle: "",
            url: "",
            icon: "link",
            category: "",
            featured: false,
            active: true,
            sortOrder: current.links.length,
          },
        ],
      }
    })
  }

  async function onAvatar(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se pueden subir imágenes")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("La imagen supera los 10MB")
      return
    }
    setUploading(true)
    try {
      const body = new FormData()
      body.set("file", file)
      body.set("folder", "contacto")
      const response = await fetch("/api/admin/upload", { method: "POST", body })
      const payload = (await response.json()) as { url?: string; error?: string }
      if (!response.ok || !payload.url) {
        toast.error(payload.error || "No se pudo subir la imagen")
        return
      }
      patchHeader({ avatarUrl: payload.url })
      toast.success("Imagen subida")
    } catch {
      toast.error("No se pudo subir la imagen")
    } finally {
      setUploading(false)
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    const payload = draft
    startTransition(async () => {
      const result = await saveContactLinks(payload)
      if (!result.success) {
        setError(result.error)
        return
      }
      setDraft(result.data)
      toast.success("Enlaces guardados")
      router.refresh()
      onSaved?.()
    })
  }

  return (
    <form onSubmit={onSubmit} aria-busy={isPending} className="flex flex-col gap-8">
      <fieldset disabled={isPending || uploading} className="flex flex-col gap-8 disabled:opacity-70">
        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-lg font-semibold">Cabecera</h2>
          <div className="flex items-center gap-3">
            {draft.header.avatarUrl && !avatarBroken ? (
              <img
                src={draft.header.avatarUrl}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 rounded-full border border-primary/40 object-cover"
                onError={() => setAvatarBroken(true)}
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/40 font-serif text-xl">
                {draft.header.displayName.slice(0, 1) || "M"}
              </div>
            )}
            <Label className="cursor-pointer rounded-md border border-border/70 px-3 py-2 text-sm hover:bg-primary/10">
              {uploading ? "Subiendo…" : "Subir imagen"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ""
                  void onAvatar(file)
                }}
              />
            </Label>
          </div>
          <Field label="URL del avatar" id="contact-avatar">
            <Input
              id="contact-avatar"
              value={draft.header.avatarUrl}
              onChange={(event) => patchHeader({ avatarUrl: event.target.value })}
              placeholder="/profile-avatar.jpg o https://"
              autoComplete="off"
            />
          </Field>
          <Field label="Nombre" id="contact-name">
            <Input
              id="contact-name"
              value={draft.header.displayName}
              onChange={(event) => patchHeader({ displayName: event.target.value })}
              required
            />
          </Field>
          <Field label="Insignia" id="contact-badge">
            <Input
              id="contact-badge"
              value={draft.header.roleBadge}
              onChange={(event) => patchHeader({ roleBadge: event.target.value })}
            />
          </Field>
          <Field label="Bio" id="contact-bio">
            <Textarea
              id="contact-bio"
              value={draft.header.bio}
              onChange={(event) => patchHeader({ bio: event.target.value })}
              rows={3}
            />
          </Field>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-lg font-semibold">Enlaces</h2>
            <Button type="button" variant="outline" size="sm" onClick={addLink}>
              <Plus className="h-4 w-4" />
              Agregar enlace
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Solo los activos aparecen en la página, en este orden.</p>
          {links.length === 0 ? <p className="text-sm text-muted-foreground">Todavía no hay enlaces.</p> : null}
          <ul className="flex flex-col gap-3">
            {links.map((link, index) => (
              <li key={link.id} className="flex flex-col gap-3 rounded-xl border border-border/70 p-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 text-primary">
                    <LinkIcon name={link.icon} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{link.title || "Sin título"}</span>
                  <Button type="button" variant="outline" size="icon-sm" onClick={() => move(link.id, -1)} disabled={index === 0} aria-label={`Subir ${link.title}`}>
                    <ChevronUp />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={() => move(link.id, 1)}
                    disabled={index === links.length - 1}
                    aria-label={`Bajar ${link.title}`}
                  >
                    <ChevronDown />
                  </Button>
                </div>
                <Field label="Título" id={`${link.id}-title`}>
                  <Input
                    id={`${link.id}-title`}
                    value={link.title}
                    onChange={(event) => patch(link.id, { title: event.target.value })}
                    onBlur={() => {
                      if (/^enlace-\d+$/.test(link.slug)) patch(link.id, { slug: slugifyLinkTitle(link.title) })
                    }}
                  />
                </Field>
                <Field label="Subtítulo" id={`${link.id}-subtitle`}>
                  <Input
                    id={`${link.id}-subtitle`}
                    value={link.subtitle}
                    onChange={(event) => patch(link.id, { subtitle: event.target.value })}
                  />
                </Field>
                <Field label="URL" id={`${link.id}-url`}>
                  <Input
                    id={`${link.id}-url`}
                    value={link.url}
                    onChange={(event) => patch(link.id, { url: event.target.value })}
                    placeholder="https:// o /games"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Slug" id={`${link.id}-slug`}>
                    <Input
                      id={`${link.id}-slug`}
                      value={link.slug}
                      onChange={(event) => patch(link.id, { slug: event.target.value })}
                      className="font-mono"
                      autoCapitalize="none"
                      spellCheck={false}
                    />
                  </Field>
                  <Field label="Ícono" id={`${link.id}-icon`}>
                    <select
                      id={`${link.id}-icon`}
                      value={link.icon}
                      onChange={(event) => patch(link.id, { icon: event.target.value })}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {CONTACT_ICONS.map((icon) => (
                        <option key={icon.id} value={icon.id}>
                          {icon.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Categoría" id={`${link.id}-category`}>
                  <Input
                    id={`${link.id}-category`}
                    value={link.category}
                    onChange={(event) => patch(link.id, { category: event.target.value })}
                    placeholder="Sitio, Redes…"
                  />
                </Field>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`${link.id}-active`}
                      checked={link.active}
                      onCheckedChange={(checked) => patch(link.id, { active: checked })}
                    />
                    <Label htmlFor={`${link.id}-active`}>Activo</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`${link.id}-featured`}
                      checked={link.featured}
                      onCheckedChange={(checked) => patch(link.id, { featured: checked })}
                    />
                    <Label htmlFor={`${link.id}-featured`}>Destacado</Label>
                  </div>
                  {confirmId === link.id ? (
                    <Button type="button" variant="destructive" size="sm" onClick={() => remove(link.id)}>
                      Confirmar
                    </Button>
                  ) : (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmId(link.id)} aria-label={`Eliminar ${link.title}`}>
                      <Trash2 />
                      Eliminar
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </fieldset>

      <div className="sticky bottom-0 z-10 -mx-6 flex flex-col gap-3 border-t border-border/60 bg-background/95 px-6 py-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-end">
        {error ? (
          <p role="alert" className="text-sm text-destructive sm:mr-auto">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={isPending || uploading}>
          {isPending ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  )
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}

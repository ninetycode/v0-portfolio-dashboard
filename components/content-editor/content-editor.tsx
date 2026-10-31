"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { saveSiteSection } from "@/app/actions/site-content"
import { sectionByKey, SECTIONS } from "@/lib/site-content/sections"
import type { Lang, SectionKey, SiteContent } from "@/lib/site-content/types"
import { cn } from "@/lib/utils"
import { AboutForm, ExperienceForm, HomeForm, MissionsForm, ToolsForm } from "./section-forms"

type Message = { kind: "success" | "error"; text: string } | null

export function ContentEditor({ initial, initialSection }: { initial: SiteContent; initialSection: SectionKey }) {
  const router = useRouter()
  const [content, setContent] = useState(initial)
  const [saved, setSaved] = useState(initial)
  const [section, setSection] = useState<SectionKey>(initialSection)
  const [lang, setLang] = useState<Lang>("es")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<Message>(null)

  const contentRef = useRef(content)
  const savingRef = useRef(false)
  contentRef.current = content

  const current = sectionByKey(section)
  const dirty = JSON.stringify(content[section]) !== JSON.stringify(saved[section])

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  const selectSection = (next: SectionKey) => {
    if (next === section) return
    if (dirty && !confirm("Esta sección tiene cambios sin guardar. ¿Descartarlos y cambiar de sección?")) return
    setContent((prev) => ({ ...prev, [section]: saved[section] }))
    setSection(next)
    setMessage(null)
  }

  const save = async () => {
    if (savingRef.current) return
    const target = section
    const payload = contentRef.current[target]
    savingRef.current = true
    setSaving(true)
    setMessage(null)
    try {
      const result = await saveSiteSection(target, payload)
      if (result.success) {
        setSaved((prev) => ({ ...prev, [target]: payload }))
        setMessage({ kind: "success", text: "Guardado. Ya se ve en la página pública." })
        router.refresh()
      } else {
        setMessage({ kind: "error", text: result.error })
      }
    } catch {
      setMessage({ kind: "error", text: "No se pudo guardar. Revisa tu conexión e inténtalo de nuevo." })
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-primary">modo_admin / textos</p>
        <h1 className="mt-3 font-serif text-4xl font-bold">Editar textos</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Elige una sección, cambia el texto y pulsa Guardar. La página pública usa este contenido en cuanto se guarda.
        </p>
      </div>

      <div className="sticky top-16 z-30 -mx-4 border-b border-border/50 bg-background/90 px-4 py-3 backdrop-blur">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-1">
            {SECTIONS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => selectSection(item.key)}
                className={cn(
                  "rounded-md px-3 py-2 font-mono text-xs transition-colors",
                  item.key === section ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
                )}
              >
                {item.label}
              </button>
            ))}
            <Button type="button" size="sm" onClick={save} disabled={!dirty || saving} className="ml-auto gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">Idioma del texto</span>
            <button
              type="button"
              onClick={() => setLang("es")}
              className={cn("rounded-full border px-3 py-1 font-mono text-xs", lang === "es" ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground")}
            >
              Español
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={cn("rounded-full border px-3 py-1 font-mono text-xs", lang === "en" ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground")}
            >
              English
            </button>
          </div>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {current.description} Estás editando en {lang === "es" ? "español" : "inglés"}. Agregar, quitar o reordenar vale para los dos idiomas.
      </p>

      {section === "home" ? <HomeForm lang={lang} value={content.home} onChange={(home) => setContent((prev) => ({ ...prev, home }))} /> : null}
      {section === "about" ? <AboutForm lang={lang} value={content.about} onChange={(about) => setContent((prev) => ({ ...prev, about }))} /> : null}
      {section === "experience" ? (
        <ExperienceForm lang={lang} value={content.experience} onChange={(experience) => setContent((prev) => ({ ...prev, experience }))} />
      ) : null}
      {section === "tools" ? <ToolsForm lang={lang} value={content.tools} onChange={(tools) => setContent((prev) => ({ ...prev, tools }))} /> : null}
      {section === "missions" ? (
        <MissionsForm lang={lang} value={content.missions} onChange={(missions) => setContent((prev) => ({ ...prev, missions }))} />
      ) : null}

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/30 bg-card px-4 py-3">
        <Button type="button" onClick={save} disabled={!dirty || saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar {current.label}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!dirty || saving}
          onClick={() => {
            setContent((prev) => ({ ...prev, [section]: saved[section] }))
            setMessage(null)
          }}
        >
          Descartar
        </Button>
        <Button asChild variant="ghost" className="font-mono text-xs">
          <Link href={current.viewHref}>Ver en la página</Link>
        </Button>
        {message?.kind === "success" ? (
          <span className="flex items-center gap-2 font-mono text-xs text-primary">
            <CheckCircle2 className="h-4 w-4" />
            {message.text}
          </span>
        ) : null}
        {message?.kind === "error" ? <span className="font-mono text-xs text-destructive">{message.text}</span> : null}
      </div>
    </div>
  )
}

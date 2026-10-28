"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, ExternalLink, FileText, Pencil, Play, Presentation, Video } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GamePlayer } from "@/components/games/game-player"
import { PlatformIcon } from "@/components/projects/platform-icon"
import { statusIcons } from "@/components/projects-gallery"
import { useLang } from "@/lib/i18n"
import { statusConfig, type Project } from "@/lib/projects-types"
import { cn } from "@/lib/utils"

function ResourceIcon({ type }: { type: string }) {
  if (type === "Video") return <Video className="h-4 w-4" />
  if (type === "Presentación") return <Presentation className="h-4 w-4" />
  if (type === "Página") return <ExternalLink className="h-4 w-4" />
  return <FileText className="h-4 w-4" />
}

export function ProjectDetail({ project, admin }: { project: Project; admin: boolean }) {
  const { t, lang } = useLang()
  const pr = t.projects
  const screenshots = project.screenshots.length ? project.screenshots : project.coverImage ? [project.coverImage] : []
  const [current, setCurrent] = useState(0)
  const StatusIcon = statusIcons[project.status]
  const statusLabel = lang === "en" ? statusConfig[project.status].labelEn : statusConfig[project.status].label

  const next = () => setCurrent((i) => (i + 1) % screenshots.length)
  const prev = () => setCurrent((i) => (i - 1 + screenshots.length) % screenshots.length)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link href="/proyectos" className="group inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-mono text-sm">volver_a_proyectos</span>
        </Link>
        {admin && (
          <Button asChild variant="outline" size="sm" className="gap-2 font-mono text-xs">
            <Link href={`/proyectos/editor/${project.id}`}>
              <Pencil className="h-3.5 w-3.5" />
              editar_proyecto
            </Link>
          </Button>
        )}
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-6">
        {project.projectDate ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Calendar className="h-5 w-5" />
            <span className="font-mono">{project.projectDate}</span>
          </div>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap gap-2">
          <Badge className={`gap-1.5 border font-mono text-sm ${statusConfig[project.status].color}`}>
            <StatusIcon className="h-4 w-4" />
            {statusLabel}
          </Badge>
          {project.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="font-mono text-sm">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="flex flex-col gap-4">
          {screenshots.length > 0 && (
            <div className="relative aspect-video overflow-hidden rounded-xl border border-border/50 bg-muted">
              <img src={screenshots[current] || "/placeholder.svg"} alt={`${project.title}, imagen ${current + 1}`} className="h-full w-full object-cover" />
              {screenshots.length > 1 && (
                <>
                  <button onClick={prev} className="absolute top-1/2 left-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/50 bg-background/80 backdrop-blur-sm transition-colors hover:bg-background" aria-label="Anterior">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={next} className="absolute top-1/2 right-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/50 bg-background/80 backdrop-blur-sm transition-colors hover:bg-background" aria-label="Siguiente">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          )}
          {screenshots.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {screenshots.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setCurrent(i)}
                  aria-label={`Ver imagen ${i + 1}`}
                  className={cn(
                    "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                    i === current ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-primary/50",
                  )}
                >
                  <img src={src || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="mb-6 text-balance font-serif text-3xl font-bold md:text-4xl">{project.title}</h1>

          <div className="mb-6 flex flex-wrap gap-2">
            {project.platforms.map((platform) => (
              <Badge key={platform} variant="outline" className="gap-1.5 text-sm">
                <PlatformIcon platform={platform} className="h-4 w-4" />
                {platform}
              </Badge>
            ))}
            {project.categories.map((category) => (
              <Badge key={category} variant="secondary" className="border-primary/20 bg-primary/10 text-sm text-primary">
                {category}
              </Badge>
            ))}
          </div>

          <div className="mb-8 flex flex-col gap-4">
            {(project.description || project.shortDescription).split("\n\n").map((paragraph, i) => (
              <p key={i} className="whitespace-pre-line text-pretty leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </div>

          {project.embedUrl && (
            <Button asChild size="lg" className="mb-8 w-fit gap-2 font-mono">
              <a href="#jugar">
                <Play className="h-4 w-4" />
                {lang === "en" ? "play_now" : "jugar_ahora"}
              </a>
            </Button>
          )}

          {(project.resources.length > 0 || project.externalUrl) && (
            <div className="mt-auto border-t border-border/50 pt-6">
              <h2 className="mb-4 font-mono text-sm font-medium uppercase tracking-wider text-muted-foreground">{pr.downloadResources}</h2>
              <div className="flex flex-wrap gap-3">
                {project.resources.map((resource) => (
                  <Button key={resource.url + resource.label} variant="outline" size="lg" className="gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/5" asChild>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      <ResourceIcon type={resource.type} />
                      {resource.label}
                    </a>
                  </Button>
                ))}
                {project.externalUrl && !project.resources.some((r) => r.url === project.externalUrl) && (
                  <Button variant="outline" size="lg" className="gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/5" asChild>
                    <a href={project.externalUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      {lang === "en" ? "Open original" : "Abrir original"}
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {project.embedUrl && (
        <section id="jugar" className="mt-16 scroll-mt-24 border-t border-border/50 pt-10">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">{lang === "en" ? "play" : "jugar"}</p>
          <h2 className="mt-2 mb-6 font-serif text-2xl font-bold">{project.title}</h2>
          <div className="mx-auto w-full" style={{ maxWidth: `${project.embedWidth}px` }}>
            <GamePlayer
              title={project.title}
              embedUrl={project.embedUrl}
              width={project.embedWidth}
              height={project.embedHeight}
              coverImage={project.coverImage}
            />
          </div>
        </section>
      )}
    </div>
  )
}

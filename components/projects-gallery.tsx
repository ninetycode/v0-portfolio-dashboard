"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Archive,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Clock,
  Filter,
  FolderOpen,
  Lightbulb,
  Pencil,
  Play,
  Plus,
  Rocket,
  Search,
  Trash2,
} from "lucide-react"
import { useLang } from "@/lib/i18n"
import { useAdmin } from "@/lib/admin-context"
import { deleteProject, reorderProjects } from "@/app/actions/projects"
import { PROJECT_STATUSES, statusConfig, type Project, type ProjectStatus } from "@/lib/projects-types"
import { PlatformIcon } from "@/components/projects/platform-icon"

export const statusIcons: Record<ProjectStatus, typeof Lightbulb> = {
  idea: Lightbulb,
  "in-progress": Rocket,
  finished: CheckCircle2,
  abandoned: Archive,
  future: Clock,
}

const toggle = (list: string[], value: string) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

export function ProjectsGallery({ projects }: { projects: Project[] }) {
  const router = useRouter()
  const { isAdmin } = useAdmin()
  const { t, lang } = useLang()
  const pr = t.projects
  const [items, setItems] = useState(projects)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeStatus, setActiveStatus] = useState<ProjectStatus | "all">("all")
  const [activePlatforms, setActivePlatforms] = useState<string[]>([])
  const [activeCategories, setActiveCategories] = useState<string[]>([])
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => setItems(projects), [projects])

  const allPlatforms = useMemo(() => [...new Set(items.flatMap((p) => p.platforms))].sort(), [items])
  const allCategories = useMemo(() => [...new Set(items.flatMap((p) => p.categories))].sort(), [items])
  const allTags = useMemo(() => [...new Set(items.flatMap((p) => p.tags))].sort(), [items])

  const filteredProjects = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return items.filter((project) => {
      const matchesSearch =
        !q ||
        project.title.toLowerCase().includes(q) ||
        project.shortDescription.toLowerCase().includes(q) ||
        [...project.tags, ...project.categories].some((v) => v.toLowerCase().includes(q))
      const matchesStatus = activeStatus === "all" || project.status === activeStatus
      const matchesPlatform = activePlatforms.length === 0 || project.platforms.some((p) => activePlatforms.includes(p))
      const matchesCategory = activeCategories.length === 0 || project.categories.some((c) => activeCategories.includes(c))
      const matchesTag = activeTags.length === 0 || project.tags.some((tag) => activeTags.includes(tag))
      return matchesSearch && matchesStatus && matchesPlatform && matchesCategory && matchesTag
    })
  }, [items, searchQuery, activeStatus, activePlatforms, activeCategories, activeTags])

  const clearFilters = () => {
    setSearchQuery("")
    setActiveStatus("all")
    setActivePlatforms([])
    setActiveCategories([])
    setActiveTags([])
  }

  const hasActiveFilters =
    searchQuery || activeStatus !== "all" || activePlatforms.length > 0 || activeCategories.length > 0 || activeTags.length > 0

  const getStatusLabel = (status: ProjectStatus) => (lang === "en" ? statusConfig[status].labelEn : statusConfig[status].label)

  const move = (id: string, direction: -1 | 1) => {
    const index = items.findIndex((p) => p.id === id)
    const target = index + direction
    if (index < 0 || target < 0 || target >= items.length) return
    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]
    setItems(next)
    startTransition(async () => {
      await reorderProjects(next.map((p) => p.id))
      router.refresh()
    })
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    const id = pendingDelete.id
    setPendingDelete(null)
    setItems((prev) => prev.filter((p) => p.id !== id))
    startTransition(async () => {
      await deleteProject(id)
      router.refresh()
    })
  }

  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div data-reveal="rise" className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-accent/30 bg-accent/10">
              <FolderOpen className="h-5 w-5 text-accent" />
            </div>
            <h2 className="font-serif text-3xl font-bold">{pr.title}</h2>
          </div>
          {isAdmin && (
            <Button asChild className="gap-2 font-mono text-xs">
              <Link href="/proyectos/editor">
                <Plus className="h-4 w-4" />
                agregar_proyecto
              </Link>
            </Button>
          )}
        </div>
        <p data-reveal="rise" className="mb-8 max-w-3xl text-muted-foreground">{pr.subtitle}</p>

        <div className="mb-8 flex flex-col gap-4">
          <div className="relative max-w-md">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={pr.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-border/50 bg-card pl-10 focus:border-primary/50"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(["all", ...PROJECT_STATUSES] as const).map((status) => (
              <Button
                key={status}
                variant={activeStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveStatus(status)}
                className={`font-mono text-xs ${activeStatus === status ? "bg-primary text-primary-foreground" : "border-border/50 hover:border-primary/50"}`}
              >
                {status === "all" ? pr.filterAll : getStatusLabel(status)}
              </Button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="w-fit gap-2 text-muted-foreground hover:text-foreground"
          >
            <Filter className="h-4 w-4" />
            {pr.moreFilters}
          </Button>

          {showFilters && (
            <div className="flex flex-col gap-4 rounded-lg border border-border/50 bg-card p-4">
              {allPlatforms.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">{pr.filterPlatform}</h4>
                  <div className="flex flex-wrap gap-2">
                    {allPlatforms.map((platform) => (
                      <Button
                        key={platform}
                        variant={activePlatforms.includes(platform) ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setActivePlatforms((prev) => toggle(prev, platform))}
                        className="gap-1.5 font-mono text-xs"
                      >
                        <PlatformIcon platform={platform} />
                        {platform}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {allCategories.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">{lang === "en" ? "Category" : "Categoría"}</h4>
                  <div className="flex flex-wrap gap-2">
                    {allCategories.map((category) => (
                      <Badge
                        key={category}
                        variant={activeCategories.includes(category) ? "default" : "outline"}
                        className={`cursor-pointer text-xs ${activeCategories.includes(category) ? "border-primary/30 bg-primary/20 text-primary" : "hover:border-primary/30"}`}
                        onClick={() => setActiveCategories((prev) => toggle(prev, category))}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {allTags.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">{pr.filterTags}</h4>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={activeTags.includes(tag) ? "default" : "outline"}
                        className={`cursor-pointer font-mono text-xs ${activeTags.includes(tag) ? "border-accent/30 bg-accent/20 text-accent" : "hover:border-accent/30"}`}
                        onClick={() => setActiveTags((prev) => toggle(prev, tag))}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="w-fit text-muted-foreground hover:text-foreground">
                  {pr.clearFilters}
                </Button>
              )}
            </div>
          )}
        </div>

        <p className="mb-6 text-sm text-muted-foreground">
          {filteredProjects.length} {pr.projectsFound}
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const StatusIcon = statusIcons[project.status]
            const index = items.findIndex((p) => p.id === project.id)
            return (
              <div key={project.id} data-reveal="pop" className="relative">
                <Link href={`/proyectos/${project.slug}`} className="block h-full">
                  <Card className="group relative h-full cursor-pointer overflow-hidden border-border/50 bg-card transition-all duration-300 hover:border-primary/50">
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      {project.coverImage ? (
                        <img
                          src={project.coverImage || "/placeholder.svg"}
                          alt={project.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <FolderOpen className="h-10 w-10 text-muted-foreground/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <Badge className={`gap-1 border font-mono text-xs ${statusConfig[project.status].color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {getStatusLabel(project.status)}
                        </Badge>
                        {project.embedUrl && (
                          <Badge className="gap-1 border border-accent/30 bg-accent/20 font-mono text-xs text-accent">
                            <Play className="h-3 w-3" />
                            {lang === "en" ? "Playable" : "Jugable"}
                          </Badge>
                        )}
                      </div>
                      <div className="absolute top-3 right-3 flex gap-1">
                        {project.platforms.map((platform) => (
                          <div
                            key={platform}
                            className="flex h-6 w-6 items-center justify-center rounded border border-border/50 bg-background/80 backdrop-blur-sm"
                            title={platform}
                          >
                            <PlatformIcon platform={platform} />
                            <span className="sr-only">{platform}</span>
                          </div>
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <span className="font-mono text-sm text-primary">{pr.seeDetails}</span>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="mb-2 font-serif text-lg font-semibold transition-colors group-hover:text-primary">{project.title}</h3>
                      <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{project.shortDescription}</p>
                      <div className="flex flex-wrap gap-1">
                        {project.categories.map((category) => (
                          <Badge key={category} variant="secondary" className="border-primary/20 bg-primary/10 font-mono text-xs text-primary">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                {isAdmin && (
                  <div className="absolute right-3 bottom-3 z-10 flex gap-1">
                    <Button size="icon" variant="secondary" className="h-8 w-8" disabled={isPending || index <= 0} onClick={() => move(project.id, -1)} aria-label="Mover antes">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="secondary" className="h-8 w-8" disabled={isPending || index >= items.length - 1} onClick={() => move(project.id, 1)} aria-label="Mover después">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="secondary" className="h-8 w-8" asChild>
                      <Link href={`/proyectos/editor/${project.id}`} aria-label={`Editar ${project.title}`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <Button size="icon" variant="secondary" className="h-8 w-8 hover:text-destructive" onClick={() => setPendingDelete(project)} aria-label={`Eliminar ${project.title}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filteredProjects.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">{pr.noResults}</p>
            {hasActiveFilters && (
              <Button variant="link" onClick={clearFilters} className="mt-2">
                {pr.clearFilters}
              </Button>
            )}
          </div>
        )}
      </div>

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar &quot;{pendingDelete?.title}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

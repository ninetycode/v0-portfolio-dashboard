"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Lightbulb, 
  Rocket, 
  Archive, 
  Clock,
  Monitor, 
  Smartphone, 
  Gamepad2,
  Search,
  Filter,
  FolderOpen
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useLang } from "@/lib/i18n"
import { 
  projectsData, 
  statusConfig as statusConfigData,
  type ProjectStatus,
  type Platform
} from "@/lib/projects-data"

const statusConfig = {
  idea: { 
    label: "Idea", 
    labelEn: "Idea",
    icon: Lightbulb, 
    ...statusConfigData.idea
  },
  "in-progress": { 
    label: "En Progreso", 
    labelEn: "In Progress",
    icon: Rocket, 
    ...statusConfigData["in-progress"]
  },
  abandoned: { 
    label: "Abandonado", 
    labelEn: "Abandoned",
    icon: Archive, 
    ...statusConfigData.abandoned
  },
  future: { 
    label: "Idea a Futuro", 
    labelEn: "Future Idea",
    icon: Clock, 
    ...statusConfigData.future
  },
}

const PlatformIcon = ({ platform }: { platform: Platform }) => {
  switch (platform) {
    case "PC":
      return <Monitor className="h-3 w-3" />
    case "Consola":
      return <Gamepad2 className="h-3 w-3" />
    case "Mobile":
      return <Smartphone className="h-3 w-3" />
    default:
      return <Monitor className="h-3 w-3" />
  }
}



export function ProjectsGallery() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeStatus, setActiveStatus] = useState<ProjectStatus | "all">("all")
  const [activePlatforms, setActivePlatforms] = useState<Platform[]>([])
  const [activeGenres, setActiveGenres] = useState<string[]>([])
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const { t, lang } = useLang()
  const pr = t.projects

  // Get all unique values for filters
  const allGenres = useMemo(() => 
    [...new Set(projectsData.flatMap(p => p.genres))].sort(), 
    []
  )
  const allTags = useMemo(() => 
    [...new Set(projectsData.flatMap(p => p.tags))].sort(), 
    []
  )
  const allPlatforms: Platform[] = ["PC", "Consola", "Mobile"]
  const allStatuses: (ProjectStatus | "all")[] = ["all", "idea", "in-progress", "abandoned", "future"]

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projectsData.filter(project => {
      // Search filter
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = !searchQuery || 
        project.title.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        project.genres.some(genre => genre.toLowerCase().includes(searchLower))

      // Status filter
      const matchesStatus = activeStatus === "all" || project.status === activeStatus

      // Platform filter
      const matchesPlatform = activePlatforms.length === 0 || 
        project.platforms.some(p => activePlatforms.includes(p))

      // Genre filter
      const matchesGenre = activeGenres.length === 0 || 
        project.genres.some(g => activeGenres.includes(g))

      // Tag filter
      const matchesTag = activeTags.length === 0 || 
        project.tags.some(t => activeTags.includes(t))

      return matchesSearch && matchesStatus && matchesPlatform && matchesGenre && matchesTag
    })
  }, [searchQuery, activeStatus, activePlatforms, activeGenres, activeTags])

  const togglePlatform = (platform: Platform) => {
    setActivePlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  const toggleGenre = (genre: string) => {
    setActiveGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  const toggleTag = (tag: string) => {
    setActiveTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSearchQuery("")
    setActiveStatus("all")
    setActivePlatforms([])
    setActiveGenres([])
    setActiveTags([])
  }

  const hasActiveFilters = searchQuery || activeStatus !== "all" || 
    activePlatforms.length > 0 || activeGenres.length > 0 || activeTags.length > 0

  const getStatusLabel = (status: ProjectStatus) => {
    return lang === "en" ? statusConfig[status].labelEn : statusConfig[status].label
  }

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 border border-accent/30">
            <FolderOpen className="h-5 w-5 text-accent" />
          </div>
          <h2 className="font-serif text-3xl font-bold">{pr.title}</h2>
        </div>
        <p className="text-muted-foreground mb-8 max-w-3xl">
          {pr.subtitle}
        </p>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={pr.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/60 border-border/50 focus:border-primary/50"
            />
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            {allStatuses.map((status) => (
              <Button
                key={status}
                variant={activeStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveStatus(status)}
                className={`font-mono text-xs ${
                  activeStatus === status 
                    ? "bg-primary text-primary-foreground" 
                    : "border-border/50 hover:border-primary/50"
                }`}
              >
                {status === "all" ? pr.filterAll : getStatusLabel(status as ProjectStatus)}
              </Button>
            ))}
          </div>

          {/* Toggle Filters Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <Filter className="h-4 w-4" />
            {pr.moreFilters}
          </Button>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="space-y-4 p-4 rounded-lg bg-background/60 border border-border/50">
              {/* Platform Filters */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">{pr.filterPlatform}</h4>
                <div className="flex flex-wrap gap-2">
                  {allPlatforms.map((platform) => (
                    <Button
                      key={platform}
                      variant={activePlatforms.includes(platform) ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => togglePlatform(platform)}
                      className="gap-1.5 font-mono text-xs"
                    >
                      <PlatformIcon platform={platform} />
                      {platform}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Genre Filters */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">{pr.filterGenre}</h4>
                <div className="flex flex-wrap gap-2">
                  {allGenres.map((genre) => (
                    <Badge
                      key={genre}
                      variant={activeGenres.includes(genre) ? "default" : "outline"}
                      className={`cursor-pointer text-xs ${
                        activeGenres.includes(genre) 
                          ? "bg-primary/20 text-primary border-primary/30" 
                          : "hover:border-primary/30"
                      }`}
                      onClick={() => toggleGenre(genre)}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tag Filters */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">{pr.filterTags}</h4>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={activeTags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer text-xs font-mono ${
                        activeTags.includes(tag) 
                          ? "bg-accent/20 text-accent border-accent/30" 
                          : "hover:border-accent/30"
                      }`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {pr.clearFilters}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-6">
          {filteredProjects.length} {pr.projectsFound}
        </p>

        {/* Projects Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const StatusIcon = statusConfig[project.status].icon
            return (
              <Link key={project.id} href={`/proyectos/${project.slug}`}>
                <Card className="group relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 cursor-pointer h-full">
                <div className="relative aspect-video overflow-hidden">
                  <Image 
                    src={project.coverImage} 
                    alt={project.title} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className={`gap-1 text-xs font-mono border ${statusConfig[project.status].color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {getStatusLabel(project.status)}
                    </Badge>
                  </div>

                  {/* Platform Icons */}
                  <div className="absolute top-3 right-3 flex gap-1">
                    {project.platforms.map((platform) => (
                      <div 
                        key={platform} 
                        className="flex h-6 w-6 items-center justify-center rounded bg-background/80 backdrop-blur-sm border border-border/50" 
                        title={platform}
                      >
                        <PlatformIcon platform={platform} />
                      </div>
                    ))}
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="font-mono text-sm text-primary">{pr.seeDetails}</span>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-serif text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {project.genres.map((genre) => (
                      <Badge 
                        key={genre} 
                        variant="secondary" 
                        className="text-xs font-mono bg-primary/10 text-primary border-primary/20"
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              </Link>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{pr.noResults}</p>
            <Button 
              variant="link" 
              onClick={clearFilters}
              className="mt-2"
            >
              {pr.clearFilters}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

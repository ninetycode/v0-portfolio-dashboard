"use client"

import { useState, use } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Lightbulb, 
  Rocket, 
  Archive, 
  Clock,
  Monitor, 
  Smartphone, 
  Gamepad2,
  ChevronLeft, 
  ChevronRight,
  Download,
  FileText,
  Video,
  Presentation,
  Calendar,
  ArrowLeft
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { useLang } from "@/lib/i18n"
import { 
  getProjectBySlug, 
  statusConfig, 
  type Platform, 
  type DocumentType,
  type ProjectStatus
} from "@/lib/projects-data"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const statusIcons = {
  idea: Lightbulb,
  "in-progress": Rocket,
  abandoned: Archive,
  future: Clock,
}

const PlatformIcon = ({ platform }: { platform: Platform }) => {
  switch (platform) {
    case "PC":
      return <Monitor className="h-4 w-4" />
    case "Consola":
      return <Gamepad2 className="h-4 w-4" />
    case "Mobile":
      return <Smartphone className="h-4 w-4" />
    default:
      return <Monitor className="h-4 w-4" />
  }
}

const ResourceIcon = ({ type }: { type: DocumentType }) => {
  switch (type) {
    case "GDD":
    case "Documento":
      return <FileText className="h-4 w-4" />
    case "Video":
      return <Video className="h-4 w-4" />
    case "Presentación":
      return <Presentation className="h-4 w-4" />
    default:
      return <Download className="h-4 w-4" />
  }
}

export default function ProjectDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = use(params)
  const project = getProjectBySlug(slug)
  const [currentScreenshot, setCurrentScreenshot] = useState(0)
  const { t, lang } = useLang()
  const pr = t.projects

  if (!project) {
    notFound()
  }

  const StatusIcon = statusIcons[project.status]
  const screenshots = project.screenshots

  const nextScreenshot = () => setCurrentScreenshot((prev) => (prev + 1) % screenshots.length)
  const prevScreenshot = () => setCurrentScreenshot((prev) => (prev - 1 + screenshots.length) % screenshots.length)

  const getStatusLabel = (status: ProjectStatus) => {
    return lang === "en" ? statusConfig[status].labelEn : statusConfig[status].label
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Back Button */}
          <Link 
            href="/proyectos" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-mono text-sm">volver_a_proyectos</span>
          </Link>

          {/* Header with Date and Tags */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-border/50">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Calendar className="h-5 w-5" />
              <span className="font-mono">{project.date}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className={`gap-1.5 text-sm font-mono border ${statusConfig[project.status].color}`}>
                <StatusIcon className="h-4 w-4" />
                {getStatusLabel(project.status)}
              </Badge>
              {project.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="font-mono text-sm"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Main Content - Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-muted border border-border/50">
                <Image 
                  src={screenshots[currentScreenshot] || project.coverImage} 
                  alt={`${project.title} screenshot ${currentScreenshot + 1}`} 
                  fill 
                  className="object-cover" 
                  priority
                />
                {screenshots.length > 1 && (
                  <>
                    <button 
                      onClick={prevScreenshot} 
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors border border-border/50" 
                      aria-label="Previous"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={nextScreenshot} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors border border-border/50" 
                      aria-label="Next"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Image Caption */}
              <div className="min-h-[2.25rem] px-1 py-2 border-b border-border/30">
                {project.screenshotCaptions?.[currentScreenshot] ? (
                  <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                    <span className="text-primary/60 mr-1">&#x2014;</span>
                    {project.screenshotCaptions[currentScreenshot]}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground/30 font-mono italic">Sin descripción</p>
                )}
              </div>

              {/* Thumbnails */}
              {screenshots.length > 1 && (
                <ScrollArea className="w-full">
                  <div className="flex gap-3 pt-3 pb-1">
                    {screenshots.map((screenshot, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentScreenshot(i)}
                        className={`relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          i === currentScreenshot 
                            ? "border-primary ring-2 ring-primary/20" 
                            : "border-transparent hover:border-primary/50"
                        }`}
                      >
                        <Image 
                          src={screenshot} 
                          alt={`Thumbnail ${i + 1}`} 
                          fill 
                          className="object-cover" 
                        />
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Right: Text Content */}
            <div className="flex flex-col">
              <h1 className="font-serif text-3xl md:text-4xl font-bold mb-6 text-balance">
                {project.title}
              </h1>

              {/* Platforms and Genres */}
              <div className="flex flex-wrap gap-2 mb-6">
                {project.platforms.map((platform) => (
                  <Badge 
                    key={platform} 
                    variant="outline" 
                    className="gap-1.5 text-sm"
                  >
                    <PlatformIcon platform={platform} />
                    {platform}
                  </Badge>
                ))}
                {project.genres.map((genre) => (
                  <Badge 
                    key={genre} 
                    variant="secondary" 
                    className="text-sm bg-primary/10 text-primary border-primary/20"
                  >
                    {genre}
                  </Badge>
                ))}
              </div>

              {/* Description */}
              <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
                {project.longDescription.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-muted-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Download Buttons */}
              {project.resources.length > 0 && (
                <div className="mt-auto pt-6 border-t border-border/50">
                  <h4 className="text-sm font-medium text-muted-foreground mb-4 font-mono uppercase tracking-wider">
                    {pr.downloadResources}
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {project.resources.map((resource, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="lg"
                        className="gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/5"
                        asChild
                      >
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          <ResourceIcon type={resource.type} />
                          <Download className="h-4 w-4" />
                          {resource.label}
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

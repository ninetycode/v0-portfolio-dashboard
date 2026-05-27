"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Newspaper, Search, Clock, ArrowRight } from "lucide-react"
import { useLang } from "@/lib/i18n"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  category: "Actualizaciones" | "Post-Mortems" | "Opinión de Industria"
  date: string
  readTime: string
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: "roguelike-postmortem",
    title: "Post-Mortem: Desarrollando un Roguelike Cooperativo",
    excerpt:
      "Las lecciones aprendidas tras 18 meses desarrollando nuestro primer roguelike con netcode. Desde el diseño inicial hasta el Early Access.",
    category: "Post-Mortems",
    date: "15 de noviembre de 2024",
    readTime: "12 min",
  },
  {
    id: "game-feel-sistemas",
    title: "Game Feel: Más que Partículas y Screen Shake",
    excerpt:
      "Un análisis profundo de lo que hace que un juego se sienta bien, con ejemplos prácticos de implementación en Godot y Unity.",
    category: "Opinión de Industria",
    date: "28 de octubre de 2024",
    readTime: "8 min",
  },
  {
    id: "devlog-inventario",
    title: "Devlog: Sistema de Inventario Modular",
    excerpt:
      "Cómo diseñé e implementé un sistema de inventario flexible que se adapta a diferentes géneros de juegos.",
    category: "Actualizaciones",
    date: "12 de octubre de 2024",
    readTime: "6 min",
  },
  {
    id: "gdd-living-document",
    title: "El GDD como Documento Vivo",
    excerpt:
      "Por qué tu Game Design Document debería evolucionar con el proyecto y cómo estructurarlo para facilitar la iteración.",
    category: "Opinión de Industria",
    date: "20 de septiembre de 2024",
    readTime: "10 min",
  },
  {
    id: "ludum-dare-54",
    title: "Post-Mortem: Top 10 en Ludum Dare 54",
    excerpt:
      "Cómo logramos un Top 10 en nuestra primera participación como equipo, incluyendo nuestro proceso de ideación y desarrollo.",
    category: "Post-Mortems",
    date: "5 de agosto de 2024",
    readTime: "15 min",
  },
  {
    id: "balance-economias",
    title: "Balanceando Economías de Juego: Una Guía Práctica",
    excerpt:
      "Técnicas y herramientas para crear sistemas económicos equilibrados en juegos F2P y premium.",
    category: "Opinión de Industria",
    date: "18 de julio de 2024",
    readTime: "11 min",
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  Actualizaciones: "var(--primary)",
  "Post-Mortems": "var(--accent-foreground)",
  "Opinión de Industria": "var(--secondary)",
}

export function BlogSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { t } = useLang()
  const tb = t.blog

  const filtered = BLOG_POSTS.filter((post) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      post.title.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q)
    const matchesCategory =
      !selectedCategory || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(BLOG_POSTS.map((p) => p.category)))

  return (
    <section id="blog" className="py-20 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 border border-primary/30">
            <Newspaper className="h-5 w-5 text-primary" />
          </div>
          <h2 className="font-serif text-3xl font-bold">{tb.sectionTitle}</h2>
        </div>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          {tb.sectionSubtitle}
        </p>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={tb.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border/50 focus:border-primary/50"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-md text-sm font-mono transition-colors ${
                !selectedCategory
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {tb.allCategories}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-sm font-mono transition-colors ${
                  selectedCategory === cat
                    ? "border"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
                style={
                  selectedCategory === cat
                    ? {
                        backgroundColor: `color-mix(in oklch, ${CATEGORY_COLORS[cat]} 20%, transparent)`,
                        color: CATEGORY_COLORS[cat],
                        borderColor: `color-mix(in oklch, ${CATEGORY_COLORS[cat]} 30%, transparent)`,
                      }
                    : undefined
                }
              >
                {tb.homeCategories[cat as keyof typeof tb.homeCategories] ?? cat}
              </button>
            ))}
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {filtered.map((post) => (
            <Card
              key={post.id}
              className="group overflow-hidden border-border/50 bg-card hover:border-primary/50 transition-all duration-300 cursor-pointer"
            >
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge
                        variant="secondary"
                        className="font-mono text-xs"
                        style={{
                          backgroundColor: `color-mix(in oklch, ${CATEGORY_COLORS[post.category]} 15%, transparent)`,
                          color: CATEGORY_COLORS[post.category],
                          borderColor: `color-mix(in oklch, ${CATEGORY_COLORS[post.category]} 30%, transparent)`,
                        }}
                      >
                        {tb.homeCategories[post.category as keyof typeof tb.homeCategories] ?? post.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span className="font-mono text-xs">{post.readTime}</span>
                      </div>
                    </div>

                    <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-muted-foreground">
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1 text-primary text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        {tb.readMoreShort}
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Newspaper className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {tb.noResults}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

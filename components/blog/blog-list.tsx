"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Clock, Calendar, Star, ArrowRight, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { BlogPost } from "@/lib/blog-data"
import { useLang } from "@/lib/i18n"

interface BlogListProps {
  posts: BlogPost[]
  isAdmin?: boolean
  onEdit?: (post: BlogPost) => void
  onDelete?: (post: BlogPost) => void
}

export function BlogList({ posts, isAdmin = false, onEdit, onDelete }: BlogListProps) {
  const [visiblePosts, setVisiblePosts] = useState<Set<string>>(new Set())
  const observerRef = useRef<IntersectionObserver | null>(null)
  const { t } = useLang()
  const tb = t.blog

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const postId = entry.target.getAttribute("data-post-id")
            if (postId) {
              setVisiblePosts((prev) => new Set([...prev, postId]))
            }
          }
        })
      },
      { threshold: 0.1, rootMargin: "50px" }
    )

    return () => observerRef.current?.disconnect()
  }, [])

  useEffect(() => {
    const cards = document.querySelectorAll("[data-post-id]")
    cards.forEach((card) => observerRef.current?.observe(card))
    return () => observerRef.current?.disconnect()
  }, [posts])

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground font-mono">
          {tb.noResults}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post, index) => (
        <article
          key={post.id}
          data-post-id={post.id}
          className={`
            group relative rounded-lg border border-border bg-card overflow-hidden
            transition-all duration-300 hover:border-primary/50
            ${visiblePosts.has(post.id) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}
          style={{ 
            transitionDelay: `${index * 100}ms`,
            transitionProperty: "opacity, transform, border-color, box-shadow"
          }}
        >
          {/* Gradient overlay on hover */}
          <div className={`absolute inset-0 bg-gradient-to-br ${post.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
          
          {/* Bottom line animation */}
          <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary group-hover:w-full transition-all duration-500" />

          {/* Admin controls */}
          {isAdmin && (
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 border border-border bg-card/90 backdrop-blur-sm hover:border-primary/50 hover:text-primary"
                onClick={(e) => {
                  e.preventDefault()
                  onEdit?.(post)
                }}
                aria-label={`Editar: ${post.title}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 border border-border bg-card/90 backdrop-blur-sm hover:border-destructive/50 hover:text-destructive"
                onClick={(e) => {
                  e.preventDefault()
                  onDelete?.(post)
                }}
                aria-label={`Eliminar: ${post.title}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Link href={`/blog/${post.slug}`} className="block relative p-6">
            <span className="sr-only">{tb.readMore}: {post.title}</span>

            {/* Header: Category + Featured + Date */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <Badge 
                variant="secondary" 
                className="font-mono text-xs bg-primary/10 text-primary border-primary/20"
              >
                {post.category}
              </Badge>
              
              {post.featured && (
                <Badge variant="outline" className="font-mono text-xs border-chart-2/50 text-chart-2">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  {tb.featured}
                </Badge>
              )}

              <div className="flex items-center gap-4 ml-auto text-xs text-muted-foreground font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readTime}
                </span>
              </div>
            </div>

            {/* Title */}
            <h2 className="font-serif text-xl md:text-2xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
              {post.title}
            </h2>

            {/* Excerpt */}
            <p className="text-muted-foreground leading-relaxed line-clamp-2 mb-4">
              {post.excerpt}
            </p>

            {/* Footer: Author + Tags */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="relative h-8 w-8 rounded-full overflow-hidden border border-border">
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-sm">
                  <p className="font-medium">{post.author.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{post.author.role}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs font-mono bg-muted/50 text-muted-foreground rounded"
                  >
                    {tag}
                  </span>
                ))}
                {post.tags.length > 3 && (
                  <span className="px-2 py-1 text-xs font-mono text-muted-foreground">
                    +{post.tags.length - 3}
                  </span>
                )}
              </div>

              {/* Read more arrow */}
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </Link>
        </article>
      ))}
    </div>
  )
}

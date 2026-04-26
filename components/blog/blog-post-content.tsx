"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Twitter, 
  Linkedin, 
  Link2, 
  Bookmark,
  Check
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { BlogPost } from "@/lib/blog-data"
import { useLang } from "@/lib/i18n"

interface BlogPostContentProps {
  post: BlogPost
  relatedPosts: BlogPost[]
  baseUrl: string
}

// Simple markdown parser
function parseMarkdown(content: string): string {
  let html = content

  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="bg-muted/50 border border-border rounded-lg p-4 overflow-x-auto my-4"><code class="text-sm font-mono text-foreground">${code.trim()}</code></pre>`
  })

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-muted/50 px-1.5 py-0.5 rounded text-sm font-mono text-primary">$1</code>')

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="font-serif text-xl font-semibold mt-8 mb-4 text-foreground">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 class="font-serif text-2xl font-semibold mt-10 mb-4 text-foreground border-b border-border pb-2">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 class="font-serif text-3xl font-bold mt-12 mb-6 text-foreground">$1</h1>')

  // Bold and italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 mb-2 text-muted-foreground before:content-[\"•\"] before:text-primary before:mr-2">$1</li>')
  
  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 mb-2 text-muted-foreground list-decimal list-inside">$1</li>')

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p class="text-muted-foreground leading-relaxed mb-4">')

  return `<p class="text-muted-foreground leading-relaxed mb-4">${html}</p>`
}

export function BlogPostContent({ post, relatedPosts, baseUrl }: BlogPostContentProps) {
  const [copied, setCopied] = useState(false)
  const { t } = useLang()
  const tb = t.blog

  const shareUrl = `${baseUrl}/blog/${post.slug}`
  const shareText = `${post.title} por ${post.author.name}`

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className={`relative pt-24 pb-12 bg-gradient-to-br ${post.color}`}>
        <div className="mx-auto max-w-4xl px-4">
          {/* Back link and Category */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {tb.backToBlog}
            </Link>

            {/* Category */}
            <Badge className="font-mono bg-primary/10 text-primary border-primary/20">
              {post.category}
            </Badge>
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            {post.excerpt}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 mb-6">
            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-primary/30">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{post.author.name}</p>
                <p className="text-sm text-muted-foreground font-mono">{post.author.role}</p>
              </div>
            </div>

            <div className="h-8 w-px bg-border hidden sm:block" />

            {/* Date & Read time */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {post.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-mono bg-muted/50 text-muted-foreground rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-12">
            {/* Article */}
            <article 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(post.content) }}
            />

            {/* Share Sidebar - Desktop */}
            <aside className="hidden lg:block">
              <div className="sticky top-28 space-y-3">
                <p className="font-mono text-xs text-muted-foreground mb-4 flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  {tb.share}
                </p>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-10 h-10"
                  asChild
                >
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${tb.shareOn} Twitter`}
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-10 h-10"
                  asChild
                >
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${tb.shareOn} LinkedIn`}
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-10 h-10"
                  onClick={handleCopyLink}
                  aria-label={tb.copyLink}
                >
                  {copied ? <Check className="h-4 w-4 text-primary" /> : <Link2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-10 h-10"
                  aria-label={tb.savePost}
                >
                  <Bookmark className="h-4 w-4" />
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Share Bar - Mobile */}
      <section className="lg:hidden border-t border-border py-6">
        <div className="mx-auto max-w-4xl px-4">
          <p className="font-mono text-xs text-muted-foreground mb-4 flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            {tb.sharePost}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Link2 className="h-4 w-4 mr-2" />}
              {copied ? tb.copied : tb.copyLink}
            </Button>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-border py-12 bg-muted/30">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="font-serif text-2xl font-semibold mb-6">{tb.relatedPosts}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="group block rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors"
                >
                  <Badge variant="secondary" className="mb-2 font-mono text-xs">
                    {related.category}
                  </Badge>
                  <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {related.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-mono mt-2">
                    {related.readTime}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}


    </div>
  )
}

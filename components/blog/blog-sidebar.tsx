"use client"

import { useState } from "react"
import { Search, Rss, Mail, Tag, Folder } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { categories, popularTags, getCategoryCounts } from "@/lib/blog-data"
import { useLang } from "@/lib/i18n"

interface BlogSidebarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
  selectedTags: string[]
  onTagToggle: (tag: string) => void
  categoryCounts?: Record<string, number>
}

export function BlogSidebar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedTags,
  onTagToggle,
  categoryCounts: categoryCountsProp,
}: BlogSidebarProps) {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const categoryCounts = categoryCountsProp ?? getCategoryCounts()
  const { t } = useLang()
  const tb = t.blog

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail("")
    }
  }

  return (
    <aside className="space-y-6 lg:sticky lg:top-28">
      {/* Search */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-mono text-sm text-muted-foreground mb-3 flex items-center gap-2">
          <Search className="h-4 w-4" />
          {tb.search}
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={tb.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-mono text-sm text-muted-foreground mb-3 flex items-center gap-2">
          <Folder className="h-4 w-4" />
          {tb.categories}
        </h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => onCategoryChange(null)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                selectedCategory === null
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{tb.allCategories}</span>
              <span className="font-mono text-xs">{Object.values(categoryCounts).reduce((a, b) => a + b, 0)}</span>
            </button>
          </li>
          {categories.map((category) => (
            <li key={category}>
              <button
                onClick={() => onCategoryChange(category === selectedCategory ? null : category)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                  selectedCategory === category
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>{tb.blogCategories[category as keyof typeof tb.blogCategories] ?? category}</span>
                <span className="font-mono text-xs">{categoryCounts[category] || 0}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Tags */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-mono text-sm text-muted-foreground mb-3 flex items-center gap-2">
          <Tag className="h-4 w-4" />
          {tb.popularTags}
        </h3>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${
                selectedTags.includes(tag)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-mono text-sm text-muted-foreground mb-2 flex items-center gap-2">
          <Mail className="h-4 w-4" />
          {tb.newsletter}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {tb.newsletterDesc}
        </p>
        {subscribed ? (
          <p className="text-sm text-primary font-mono">
            {tb.subscribed}
          </p>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-2">
            <Input
              type="email"
              placeholder={t.contact.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background"
              required
            />
            <Button type="submit" className="w-full" size="sm">
              {tb.subscribe}
            </Button>
          </form>
        )}
      </div>

      {/* RSS */}
      <a
        href="/rss.xml"
        className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border bg-card text-sm text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
      >
        <Rss className="h-4 w-4" />
        <span className="font-mono">RSS Feed</span>
      </a>
    </aside>
  )
}

"use client"

import { useState, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { BlogHero } from "@/components/blog/blog-hero"
import { BlogList } from "@/components/blog/blog-list"
import { BlogSidebar } from "@/components/blog/blog-sidebar"
import { blogPosts, searchPosts } from "@/lib/blog-data"
import { Footer } from "@/components/footer"

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const filteredPosts = useMemo(() => {
    let posts = blogPosts

    // Search filter
    if (searchQuery) {
      posts = searchPosts(searchQuery)
    }

    // Category filter
    if (selectedCategory) {
      posts = posts.filter((post) => post.category === selectedCategory)
    }

    // Tags filter
    if (selectedTags.length > 0) {
      posts = posts.filter((post) =>
        selectedTags.some((tag) => post.tags.includes(tag))
      )
    }

    return posts
  }, [searchQuery, selectedCategory, selectedTags])

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />

      <BlogHero />

      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
            {/* Main content */}
            <main>
              <BlogList posts={filteredPosts} />
            </main>

            {/* Sidebar */}
            <BlogSidebar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

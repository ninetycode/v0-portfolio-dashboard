"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { BlogHero } from "@/components/blog/blog-hero"
import { BlogList } from "@/components/blog/blog-list"
import { BlogSidebar } from "@/components/blog/blog-sidebar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useAdmin } from "@/lib/admin-context"
import { deletePost } from "@/app/actions/blog"
import type { BlogPost } from "@/lib/blog-data"
import { Plus, Shield, Trash2, Loader2 } from "lucide-react"
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

interface BlogPageClientProps {
  posts: BlogPost[]
}

export function BlogPageClient({ posts }: BlogPageClientProps) {
  const router = useRouter()
  const { isAdmin } = useAdmin()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const filteredPosts = useMemo(() => {
    let result = posts

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(q) ||
          post.excerpt.toLowerCase().includes(q) ||
          post.tags.some((tag) => tag.toLowerCase().includes(q)),
      )
    }

    if (selectedCategory) {
      result = result.filter((post) => post.category === selectedCategory)
    }

    if (selectedTags.length > 0) {
      result = result.filter((post) => selectedTags.some((tag) => post.tags.includes(tag)))
    }

    return result
  }, [posts, searchQuery, selectedCategory, selectedTags])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const post of posts) {
      counts[post.category] = (counts[post.category] || 0) + 1
    }
    return counts
  }, [posts])

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleDelete = async () => {
    if (!postToDelete) return
    setIsDeleting(true)
    setDeleteError(null)
    const result = await deletePost(postToDelete.id)
    setIsDeleting(false)
    if (result.success) {
      setPostToDelete(null)
      router.refresh()
    } else {
      setDeleteError(result.error || "Error al eliminar")
    }
  }

  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />

      <BlogHero />

      {/* Admin toolbar */}
      {isAdmin && (
        <div className="mx-auto max-w-6xl px-4 -mt-4 mb-4">
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
            <span className="flex items-center gap-2 font-mono text-xs text-primary">
              <Shield className="h-4 w-4" />
              modo_admin
            </span>
            <div className="ml-auto flex items-center gap-2">
              <Button asChild size="sm" className="gap-2">
                <Link href="/blog/editor">
                  <Plus className="h-4 w-4" />
                  Agregar nueva entrada
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
            {/* Main content */}
            <main>
              <BlogList
                posts={filteredPosts}
                isAdmin={isAdmin}
                onEdit={(post) => router.push(`/blog/editor/${post.id}`)}
                onDelete={(post) => setPostToDelete(post)}
              />
            </main>

            {/* Sidebar */}
            <BlogSidebar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
              categoryCounts={categoryCounts}
            />
          </div>
        </div>
      </section>

      <Footer />

      {/* Delete confirmation dialog */}
      <AlertDialog open={postToDelete !== null} onOpenChange={(open) => !open && setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{"¿Eliminar esta entrada?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {postToDelete
                ? `"${postToDelete.title}" se eliminará permanentemente. Esta acción no se puede deshacer.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p className="text-sm text-destructive font-mono">{deleteError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Eliminando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

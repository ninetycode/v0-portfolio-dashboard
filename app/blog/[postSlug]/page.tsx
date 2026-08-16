import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { BlogPostContent } from "@/components/blog/blog-post-content"
import { getPostBySlug, getAllPosts } from "@/app/actions/blog"
import { rowToPost } from "@/lib/blog-mapper"
import { generateBlogPostingSchema } from "@/lib/structured-data"
import { Footer } from "@/components/footer"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ postSlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postSlug } = await params
  const row = await getPostBySlug(postSlug)

  if (!row) {
    return {
      title: "Post not found",
    }
  }

  const post = rowToPost(row)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mathias.dev"

  return {
    title: `${post.title} | Mathías Andino`,
    description: post.excerpt,
    authors: [{ name: post.author.name }],
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: row.publishedAt,
      authors: [post.author.name],
      tags: post.tags,
      url: `${baseUrl}/blog/${post.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
    alternates: {
      canonical: `${baseUrl}/blog/${post.slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { postSlug } = await params
  const row = await getPostBySlug(postSlug)

  if (!row) {
    notFound()
  }

  const post = rowToPost(row)

  const allRows = await getAllPosts()
  const relatedPosts = allRows
    .filter((p) => p.id !== row.id && p.category === row.category)
    .slice(0, 3)
    .map(rowToPost)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mathias.dev"
  const structuredData = generateBlogPostingSchema(post, baseUrl)

  return (
    <div className="relative min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Navbar />

      <BlogPostContent post={post} relatedPosts={relatedPosts} baseUrl={baseUrl} />

      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-md py-8">
        <div className="mx-auto max-w-6xl px-4">
          <Footer />
        </div>
      </footer>
    </div>
  )
}

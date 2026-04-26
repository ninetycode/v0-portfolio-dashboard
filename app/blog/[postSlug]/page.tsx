import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { BlogPostContent } from "@/components/blog/blog-post-content"
import { blogPosts, getPostBySlug, getRelatedPosts } from "@/lib/blog-data"
import { generateBlogPostingSchema } from "@/lib/structured-data"
import { Footer } from "@/components/footer"

interface Props {
  params: Promise<{ postSlug: string }>
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    postSlug: post.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postSlug } = await params
  const post = getPostBySlug(postSlug)

  if (!post) {
    return {
      title: "Post not found",
    }
  }

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
      publishedTime: post.date,
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
  const post = getPostBySlug(postSlug)

  if (!post) {
    notFound()
  }

  const relatedPosts = getRelatedPosts(post, 3)
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

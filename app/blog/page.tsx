import { getAllPosts } from "@/app/actions/blog"
import { rowToPost } from "@/lib/blog-mapper"
import { BlogPageClient } from "@/components/blog/blog-page-client"

export const revalidate = 3600

export default async function BlogPage() {
  const rows = await getAllPosts()
  const posts = rows.map(rowToPost)

  return <BlogPageClient posts={posts} />
}

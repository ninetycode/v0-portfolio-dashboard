import { notFound, redirect } from "next/navigation"
import { isAdmin } from "@/lib/admin-auth"
import { getPostById } from "@/app/actions/blog"
import { PostEditor } from "@/components/blog/editor/post-editor"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Editar entrada | Admin",
  robots: { index: false, follow: false },
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: Props) {
  if (!(await isAdmin())) {
    redirect("/blog")
  }

  const { id } = await params
  const post = await getPostById(id)

  if (!post) {
    notFound()
  }

  return <PostEditor post={post} />
}

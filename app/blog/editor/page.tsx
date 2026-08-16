import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/admin-auth"
import { PostEditor } from "@/components/blog/editor/post-editor"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Nueva entrada | Admin",
  robots: { index: false, follow: false },
}

export default async function NewPostPage() {
  if (!(await isAdmin())) {
    redirect("/blog")
  }

  return <PostEditor />
}

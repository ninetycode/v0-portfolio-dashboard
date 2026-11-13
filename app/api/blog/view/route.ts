import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { recordPostView } from "@/app/actions/blog"

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { slug?: unknown } | null
    const slug = typeof body?.slug === "string" ? body.slug.trim() : ""
    if (!slug) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const recorded = await recordPostView(slug)
    if (recorded) {
      try {
        revalidatePath("/blog")
      } catch {
        // Ignore revalidation errors outside request cache context
      }
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ContentEditor } from "@/components/content-editor/content-editor"
import { isAdmin } from "@/lib/admin-auth"
import { sectionFromSlug } from "@/lib/site-content/sections"
import { readSiteContent } from "@/lib/site-content/store"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Editar textos | Mathías Andino",
  robots: { index: false, follow: false },
}

export default async function ContenidoPage({ searchParams }: { searchParams: Promise<{ seccion?: string }> }) {
  if (!(await isAdmin())) redirect("/")
  const params = await searchParams
  const content = await readSiteContent()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <ContentEditor initial={content} initialSection={sectionFromSlug(params.seccion)} />
      </main>
      <Footer />
    </div>
  )
}

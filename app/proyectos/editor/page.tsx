import { redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProjectEditorForm } from "@/components/projects/project-editor-form"
import { getProjectTaxonomy } from "@/app/actions/projects"
import { isAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export default async function NewProjectPage() {
  if (!(await isAdmin())) redirect("/proyectos")
  const taxonomy = await getProjectTaxonomy()
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pt-28 pb-20">
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">modo_admin / nuevo proyecto</p>
          <h1 className="mt-3 font-serif text-4xl font-bold">Agregar proyecto</h1>
          <p className="mt-3 text-muted-foreground">Ideas, ejercicios, prototipos o conceptos abandonados. Si es jugable, pega su embed.</p>
        </div>
        <ProjectEditorForm taxonomy={taxonomy} />
      </main>
      <Footer />
    </div>
  )
}

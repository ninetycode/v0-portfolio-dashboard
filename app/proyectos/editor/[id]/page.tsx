import { notFound, redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProjectEditorForm } from "@/components/projects/project-editor-form"
import { getProjectById, getProjectTaxonomy } from "@/app/actions/projects"
import { isAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/proyectos")
  const { id } = await params
  const [project, taxonomy] = await Promise.all([getProjectById(id), getProjectTaxonomy()])
  if (!project) notFound()
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pt-28 pb-20">
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">modo_admin / editar proyecto</p>
          <h1 className="mt-3 font-serif text-4xl font-bold">Editar {project.title}</h1>
        </div>
        <ProjectEditorForm project={project} taxonomy={taxonomy} />
      </main>
      <Footer />
    </div>
  )
}

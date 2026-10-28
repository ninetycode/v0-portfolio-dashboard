import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProjectDetail } from "@/components/projects/project-detail"
import { getProjectBySlug } from "@/app/actions/projects"
import { isAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) return { title: "Proyecto no encontrado | Mathías Andino" }
  return { title: `${project.title} | Proyectos | Mathías Andino`, description: project.shortDescription }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params
  const [project, admin] = await Promise.all([getProjectBySlug(slug), isAdmin()])
  if (!project) notFound()

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 pt-20">
        <ProjectDetail project={project} admin={admin} />
      </main>
      <Footer />
    </div>
  )
}

import { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { ProjectsGallery } from "@/components/projects-gallery"
import { StatusBar } from "@/components/status-bar"
import { Footer } from "@/components/footer"
import { getProjects } from "@/app/actions/projects"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Proyectos | Mathías Andino",
  description: "Ideas, conceptos, ejercicios y proyectos de diseño de videojuegos: en progreso, terminados, ideas a futuro y conceptos abandonados.",
}

export default async function ProjectsPage() {
  const projects = await getProjects()
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="pt-16 pb-12">
        <ProjectsGallery projects={projects} />
      </main>

      <div className="mb-12">
        <Footer />
      </div>

      <StatusBar />
    </div>
  )
}

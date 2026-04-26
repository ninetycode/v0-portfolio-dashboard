import { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { ProjectsGallery } from "@/components/projects-gallery"
import { StatusBar } from "@/components/status-bar"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Proyectos | Mathías Andino",
  description: "Ideas, conceptos y proyectos que nunca vieron la luz o aún no. Descubre proyectos en progreso, ideas a futuro y conceptos abandonados de diseño de videojuegos.",
}

export default function ProjectsPage() {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="pt-16 pb-12">
        <ProjectsGallery />
      </main>

      <div className="mb-12">
        <Footer />
      </div>

      <StatusBar />
    </div>
  )
}

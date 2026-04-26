import { Button } from "@/components/ui/button"
import { ArrowLeft, FolderX } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function ProjectNotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center pt-20 px-4">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <FolderX className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>
          <h1 className="font-serif text-3xl font-bold mb-4">Proyecto no encontrado</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            El proyecto que buscas no existe o ha sido movido a otro lugar.
          </p>
          <Button asChild>
            <Link href="/proyectos" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver a proyectos
            </Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  )
}

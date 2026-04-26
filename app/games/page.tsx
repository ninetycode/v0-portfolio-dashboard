import { Suspense } from "react"
import { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { GamesGallery } from "@/components/games-gallery"
import { StatusBar } from "@/components/status-bar"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "My Games | Mathías Andino",
  description: "Collection of video games designed and developed by Mathías Andino — Technical Game Designer. Explore each project, its GDD and technical challenges.",
}

export default function GamesPage() {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="pt-16 pb-12">
        <Suspense fallback={<div className="container mx-auto px-4 py-12 text-center">Loading...</div>}>
          <GamesGallery />
        </Suspense>
      </main>

      <div className="mb-12">
        <Footer />
      </div>

      <StatusBar />
    </div>
  )
}

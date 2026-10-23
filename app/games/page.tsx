import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { GamesGallery } from "@/components/games-gallery"
import { StatusBar } from "@/components/status-bar"
import { Footer } from "@/components/footer"
import { getGames } from "@/app/actions/games"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "My Games | Mathías Andino",
  description:
    "Collection of video games designed and developed by Mathías Andino — Technical Game Designer. Play them in the browser, rate them and leave feedback.",
}

export default async function GamesPage() {
  const games = await getGames()

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="pt-16 pb-12">
        <GamesGallery games={games} />
      </main>

      <div className="mb-12">
        <Footer />
      </div>

      <StatusBar />
    </div>
  )
}

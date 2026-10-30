import { Navbar } from "@/components/navbar"
import { StatusBar } from "@/components/status-bar"
import { HeroSection } from "@/components/hero-section"
import { AboutMe } from "@/components/about-me"
import { FeaturedGames } from "@/components/featured-games"
import { ExperienceTimeline } from "@/components/experience-timeline"
import { SkillTree } from "@/components/skill-tree"
import { ToolInventory } from "@/components/tool-inventory"
import { ContactQuest } from "@/components/contact-quest"
import { getGames } from "@/app/actions/games"

export const dynamic = "force-dynamic"

export default async function Home() {
  const games = await getGames()

  return (
    <div className="relative min-h-screen">
      <Navbar />
      
      <main className="pb-12">
        <HeroSection />
        <AboutMe gameCount={games.length} />
        <FeaturedGames games={games} />
        <ExperienceTimeline />
        <SkillTree />
        <ToolInventory />
        <ContactQuest />
      </main>

      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-md py-8 mb-12">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="font-mono text-sm text-muted-foreground">
            {"// "} Diseñado y desarrollado por{" "}
            <span className="text-primary">Mathías Andino</span>
            {" // "}
          </p>
          <p className="font-mono text-xs text-muted-foreground/60 mt-2">
            2024 | Game Narrative Designer Junior | Buenos Aires, Argentina
          </p>
        </div>
      </footer>

      <StatusBar />
    </div>
  )
}

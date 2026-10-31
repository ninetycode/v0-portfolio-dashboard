import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { AboutMe } from "@/components/about-me"
import { FeaturedGames } from "@/components/featured-games"
import { ExperienceTimeline } from "@/components/experience-timeline"
import { SkillTree } from "@/components/skill-tree"
import { ToolInventory } from "@/components/tool-inventory"
import { ContactQuest } from "@/components/contact-quest"
import { HomeFooter } from "@/components/home-footer"
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

      <HomeFooter />
    </div>
  )
}

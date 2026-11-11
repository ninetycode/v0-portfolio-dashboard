import { siteConfig } from "@/lib/site-config"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: `Devlog & Blog | ${siteConfig.name}`,
  description: `Articles about game development, project post-mortems, and reflections on the gaming industry. Follow my journey as a ${siteConfig.role.en}.`,
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

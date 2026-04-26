import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Devlog & Blog | Mathías Andino",
  description: "Articles about game development, project post-mortems, and reflections on the gaming industry. Follow my journey as a Technical Game Designer.",
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

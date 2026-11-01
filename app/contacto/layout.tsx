import type { ReactNode } from "react"

// Keeps this route on its own loading boundary, so the home skeleton
// (navbar and footer) does not cover /contactos while the links load.
export default function ContactosLayout({ children }: { children: ReactNode }) {
  return children
}

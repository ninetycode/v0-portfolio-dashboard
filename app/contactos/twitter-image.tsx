export const alt = "Mathías Andino — contacto"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const runtime = "nodejs"

export default async function ContactTwitterImage() {
  const { renderContactOg } = await import("@/lib/contact-og")
  return renderContactOg()
}

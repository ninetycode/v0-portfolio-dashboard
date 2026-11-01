export const CONTACT_SHARE_URL = "https://mathiasandino.ar/contacto"

export function siteBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "")
  if (configured && /^https?:\/\/[^/\s]+/i.test(configured)) return configured
  return "https://mathiasandino.ar"
}

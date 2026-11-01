import { NextResponse } from "next/server"
import { detectDeviceType, recordLinkClick } from "@/lib/db/link-clicks"
import { findActiveContactLink, resolveRedirectTarget } from "@/lib/site-content/contact-links"
import { readContactLinks } from "@/lib/site-content/contact-links-store"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function isPrefetch(request: Request): boolean {
  const purpose = `${request.headers.get("purpose") ?? ""} ${request.headers.get("sec-purpose") ?? ""}`.toLowerCase()
  return purpose.includes("prefetch") || request.headers.get("next-router-prefetch") === "1"
}

function redirectTo(target: string | URL): NextResponse {
  const response = NextResponse.redirect(target, 302)
  response.headers.set("Cache-Control", "no-store")
  return response
}

function publicOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim()
  const host = forwardedHost || request.headers.get("host")?.trim()
  if (!host) return new URL(request.url).origin
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim()
  const proto = forwardedProto || new URL(request.url).protocol.replace(/:$/, "")
  return `${proto}://${host}`
}

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug: raw } = await context.params
  let slug = raw.trim().toLowerCase()
  try {
    slug = decodeURIComponent(raw).trim().toLowerCase()
  } catch {
    slug = raw.trim().toLowerCase()
  }

  const origin = publicOrigin(request)
  const fallback = new URL("/contacto", origin)
  const content = await readContactLinks()
  const link = findActiveContactLink(content, slug)
  if (!link) return redirectTo(fallback)

  const target = resolveRedirectTarget(link.url, origin)
  if (!target) return redirectTo(fallback)

  if (!isPrefetch(request)) {
    const userAgent = request.headers.get("user-agent")
    const click = recordLinkClick({
      slug: link.slug,
      referrer: request.headers.get("referer"),
      userAgent,
      deviceType: detectDeviceType(userAgent),
      country: request.headers.get("x-vercel-ip-country"),
    }).catch(() => undefined)
    await new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, 1200)
      void click.finally(() => {
        clearTimeout(timer)
        resolve()
      })
    })
  }

  if (target.toLowerCase().startsWith("mailto:")) {
    return new NextResponse(null, {
      status: 302,
      headers: {
        Location: target,
        "Cache-Control": "no-store",
      },
    })
  }

  return redirectTo(target)
}

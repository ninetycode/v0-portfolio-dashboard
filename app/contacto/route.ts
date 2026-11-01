import { NextResponse } from "next/server"

function publicOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim()
  const host = forwardedHost || request.headers.get("host")?.trim()
  if (!host) return new URL(request.url).origin
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim()
  const proto = forwardedProto || new URL(request.url).protocol.replace(/:$/, "")
  return `${proto}://${host}`
}

export function GET(request: Request) {
  return NextResponse.redirect(new URL("/contactos", publicOrigin(request)), 308)
}

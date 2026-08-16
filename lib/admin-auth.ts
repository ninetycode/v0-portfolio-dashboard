import { createHmac, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"

const ADMIN_PASSWORD = "puccaloca1909"
const COOKIE_NAME = "admin_session"
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12 // 12 hours

function getSecret(): string {
  // Derive a signing secret from server-only values so tokens can't be forged client-side
  return `${ADMIN_PASSWORD}::${process.env.DATABASE_URL ?? "fallback-secret"}`
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex")
}

export function verifyPassword(password: string): boolean {
  const a = Buffer.from(password)
  const b = Buffer.from(ADMIN_PASSWORD)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function createSessionToken(): string {
  const expiresAt = Date.now() + SESSION_DURATION_MS
  const payload = `admin:${expiresAt}`
  return `${payload}:${sign(payload)}`
}

export function validateSessionToken(token: string | undefined): boolean {
  if (!token) return false
  const parts = token.split(":")
  if (parts.length !== 3) return false
  const [role, expiresAtStr, signature] = parts
  if (role !== "admin") return false
  const expiresAt = Number.parseInt(expiresAtStr, 10)
  if (Number.isNaN(expiresAt) || expiresAt < Date.now()) return false
  const payload = `${role}:${expiresAtStr}`
  const expected = sign(payload)
  const sigBuf = Buffer.from(signature)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length) return false
  return timingSafeEqual(sigBuf, expBuf)
}

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  return validateSessionToken(cookieStore.get(COOKIE_NAME)?.value)
}

export async function setAdminCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "none", // required for the v0 preview iframe
    maxAge: SESSION_DURATION_MS / 1000,
    path: "/",
  })
}

export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

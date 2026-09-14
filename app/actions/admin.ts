"use server"

import { clearAdminCookie, isAdmin, setAdminCookie, verifyPassword } from "@/lib/admin-auth"

export async function adminLogin(password: string): Promise<{ success: boolean; error?: string }> {
  if (!verifyPassword(password)) {
    return { success: false, error: "Contraseña incorrecta. Acceso denegado." }
  }
  await setAdminCookie()
  return { success: true }
}

export async function adminLogout(): Promise<{ success: boolean }> {
  await clearAdminCookie()
  return { success: true }
}

export async function checkAdminStatus(): Promise<{ isAdmin: boolean }> {
  return { isAdmin: await isAdmin() }
}

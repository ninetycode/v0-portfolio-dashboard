"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { checkAdminStatus, adminLogout } from "@/app/actions/admin"

interface AdminContextValue {
  isAdmin: boolean
  setIsAdmin: (value: boolean) => void
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AdminContext = createContext<AdminContextValue>({
  isAdmin: false,
  setIsAdmin: () => {},
  logout: async () => {},
  refresh: async () => {},
})

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const { isAdmin: status } = await checkAdminStatus()
      setIsAdmin(status)
    } catch {
      setIsAdmin(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await adminLogout()
    setIsAdmin(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <AdminContext.Provider value={{ isAdmin, setIsAdmin, logout, refresh }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  return useContext(AdminContext)
}

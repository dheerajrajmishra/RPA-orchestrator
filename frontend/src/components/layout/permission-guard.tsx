"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { ShieldX, Lock } from "lucide-react"

const ROUTE_PERMISSIONS: Record<string, string> = {
  "/hosts": "sys:hosts",
  "/alerts": "sys:alerts",
  "/api-keys": "sys:keys",
  "/users": "admin:users",
  "/audit": "admin:audit",
  "/settings": "admin:settings",
  "/processes/new": "proc:write",
}

type LoggedInUser = {
  displayName?: string
  username?: string
  name?: string
  email?: string
  role?: {
    name?: string
    isSystem?: boolean
    permissions?: string[]
  }
}

export function PermissionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user")
      if (stored) {
        setCurrentUser(JSON.parse(stored))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setHasLoaded(true)
    }
  }, [pathname])

  if (!hasLoaded) {
    return <>{children}</>
  }

  // Determine required permission for current route
  let requiredPermission: string | null = null;
  for (const [route, perm] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      requiredPermission = perm
      break
    }
  }

  // If route doesn't require special permission, allow access
  if (!requiredPermission) {
    return <>{children}</>
  }

  // Admin role / system role bypasses permission checks
  const roleName = currentUser?.role?.name?.toLowerCase() || ""
  const isSystemAdmin = roleName === "admin" || currentUser?.role?.isSystem === true
  const userPerms = currentUser?.role?.permissions || []

  const hasAccess = isSystemAdmin || userPerms.includes(requiredPermission)

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4 border border-red-500/20 shadow-lg shadow-red-500/5">
          <ShieldX className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Access Restricted</h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-2 max-w-md leading-relaxed">
          Your assigned role (<strong className="text-[var(--foreground)]">{currentUser?.role?.name || "Viewer"}</strong>) does not have permission to access the <code className="bg-[var(--muted)] px-1.5 py-0.5 rounded text-xs text-[var(--primary)]">{pathname}</code> area.
        </p>
        <div className="mt-6 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs">
          <Lock className="w-3.5 h-3.5" />
          <span>Requires <strong className="font-semibold">{requiredPermission}</strong> permission. Contact an Administrator to request elevated access.</span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

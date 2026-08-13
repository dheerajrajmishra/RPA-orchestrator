"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, Users, Key, Settings,
  AlertTriangle, FileText, Plus, Eye, LogOut, Server,
  ChevronLeft, ChevronRight, Layers
} from "lucide-react"
import { useSidebar } from "./sidebar-context"

const NAV_GROUPS = [
  {
    label: "Monitoring",
    items: [
      { name: "Dashboard",        href: "/",        icon: LayoutDashboard, permission: "proc:read" },
      { name: "Process Overview", href: "/processes", icon: Eye,            permission: "proc:read" },
    ],
  },
  {
    label: "Configuration",
    items: [
      { name: "Categories", href: "/categories", icon: Layers,        permission: "proc:read" },
      { name: "VM Hosts",   href: "/hosts",      icon: Server,        permission: "sys:hosts" },
      { name: "Alerts",     href: "/alerts",     icon: AlertTriangle, permission: "sys:alerts" },
      { name: "API Keys",   href: "/api-keys",   icon: Key,           permission: "sys:keys" },
    ],
  },
  {
    label: "Admin",
    items: [
      { name: "Users & Roles", href: "/users",    icon: Users,    permission: "admin:users" },
      { name: "Audit Log",     href: "/audit",    icon: FileText, permission: "admin:audit" },
      { name: "Settings",      href: "/settings", icon: Settings, permission: "admin:settings" },
    ],
  },
]

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

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isCollapsed, toggleSidebar } = useSidebar()
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user")
      if (stored) {
        setCurrentUser(JSON.parse(stored))
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.push("/login")
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/")

  const userName = currentUser?.displayName || currentUser?.name || currentUser?.username || "Guest User"
  const userInitials = userName.substring(0, 2).toUpperCase()
  const roleName = currentUser?.role?.name || "Viewer"

  // RBAC Permission checking
  const isSystemAdmin = roleName.toLowerCase() === "admin" || currentUser?.role?.isSystem === true
  const userPerms = currentUser?.role?.permissions || []

  const hasPermission = (requiredPermission?: string) => {
    if (!requiredPermission) return true
    if (isSystemAdmin) return true
    return userPerms.includes(requiredPermission)
  }

  return (
    <aside
      className={`bg-[var(--card)] border-r border-[var(--border)] flex flex-col h-screen fixed left-0 top-0 z-30 select-none transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className={`p-4 border-b border-[var(--border)] flex items-center justify-between ${isCollapsed ? "px-2 justify-center" : ""}`}>
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center font-bold text-white shadow-md shadow-[var(--primary)]/20 text-xs tracking-wider flex-shrink-0">
            RP
          </div>
          {!isCollapsed && (
            <div className="min-w-0 truncate">
              <div className="font-bold text-sm leading-tight tracking-tight text-[var(--foreground)] truncate">RPA Orchestrator</div>
              <div className="text-[10px] text-[var(--muted-foreground)] leading-none mt-0.5">Enterprise v1.0</div>
            </div>
          )}
        </Link>

        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
          title={isCollapsed ? "Expand Navigation" : "Collapse Navigation"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-6">
        {NAV_GROUPS.map((group) => {
          // Filter items based on RBAC permissions
          const allowedItems = group.items.filter(item => hasPermission(item.permission))

          if (allowedItems.length === 0) return null

          return (
            <div key={group.label} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-2">
                  {group.label}
                </div>
              )}
              <ul className="space-y-1">
                {allowedItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        title={isCollapsed ? item.name : undefined}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                          isCollapsed ? "justify-center px-0" : ""
                        } ${
                          active
                            ? "bg-[var(--primary)]/10 text-[var(--primary)] font-semibold shadow-xs"
                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50"
                        }`}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--border)] p-3 space-y-3">
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-500/30 flex-shrink-0" title={userName}>
              {userInitials}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate" title={userName}>{userName}</div>
                <div className="text-[10px] text-[var(--muted-foreground)] truncate" title={roleName}>{roleName}</div>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button onClick={handleLogout} className="text-[var(--muted-foreground)] hover:text-red-400 transition-colors p-1.5 rounded cursor-pointer" title="Log out">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {!isCollapsed && (
          <div className="pt-2 border-t border-[var(--border)]">
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              4/4 VMs reporting
            </div>
            <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5 whitespace-nowrap">Last heartbeat: 8s ago</div>
          </div>
        )}
      </div>
    </aside>
  )
}

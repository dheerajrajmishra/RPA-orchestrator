"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Users, Key, Settings, Activity,
  List, AlertTriangle, FileText, Plus, Eye, LogOut, Server
} from "lucide-react"

const NAV_GROUPS = [
  {
    label: "Monitoring",
    items: [
      { name: "Dashboard",        href: "/",        icon: LayoutDashboard },
      { name: "Process Overview", href: "/processes", icon: Eye },
    ],
  },
  {
    label: "Configuration",
    items: [
      { name: "VM Hosts",   href: "/hosts",     icon: Server },
      { name: "Alerts",     href: "/alerts",    icon: AlertTriangle },
      { name: "API Keys",   href: "/api-keys",  icon: Key },
    ],
  },
  {
    label: "Admin",
    items: [
      { name: "Users & Roles", href: "/users",    icon: Users },
      { name: "Audit Log",     href: "/audit",    icon: FileText },
      { name: "Settings",      href: "/settings", icon: Settings },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/")

  return (
    <div className="w-56 border-r border-[var(--border)] bg-[var(--card)] flex flex-col h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-[var(--border)] gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[11px] font-black">RP</span>
        </div>
        <div className="min-w-0">
          <div className="font-bold text-sm tracking-tight truncate">RPA Orchestrator</div>
          <div className="text-[10px] text-[var(--muted-foreground)] truncate">Phase 1 · Passive</div>
        </div>
      </div>

      {/* Register Process button */}
      <div className="px-3 pt-3">
        <Link
          href="/processes/new"
          className="flex items-center justify-center gap-2 w-full py-2 text-xs font-semibold bg-[var(--primary)] text-white rounded-md hover:opacity-90 transition-opacity"
        >
          <Plus className="h-3.5 w-3.5" />
          Register Process
        </Link>
      </div>

      {/* Grouped Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="px-4 mb-1 text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
              {group.label}
            </div>
            <ul className="space-y-0.5 px-2">
              {group.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                        active
                          ? "bg-[var(--primary)]/15 text-[var(--primary)]"
                          : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--border)] p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-500/30">
              AD
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate">Admin User</div>
              <div className="text-[10px] text-[var(--muted-foreground)] truncate">Administrator</div>
            </div>
          </div>
          <Link href="/login" className="text-[var(--muted-foreground)] hover:text-red-400 transition-colors p-1" title="Log out">
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="pt-2 border-t border-[var(--border)]">
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            4/4 VMs reporting
          </div>
          <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">Last heartbeat: 8s ago</div>
        </div>
      </div>
    </div>
  )
}

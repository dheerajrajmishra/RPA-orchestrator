"use client"

import { useTheme } from "next-themes"
import { Moon, Sun, Bell, Menu } from "lucide-react"
import { useEffect, useState } from "react"
import { useSidebar } from "./sidebar-context"

type LoggedInUser = {
  displayName?: string
  username?: string
  name?: string
}

export function Header() {
  const { theme, setTheme } = useTheme()
  const { toggleSidebar } = useSidebar()
  const [mounted, setMounted] = useState(false)
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null)

  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem("user")
      if (stored) {
        setCurrentUser(JSON.parse(stored))
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  const userName = currentUser?.displayName || currentUser?.name || currentUser?.username || "Admin User"
  const userInitials = userName.substring(0, 2).toUpperCase()

  return (
    <header className="w-full h-16 border-b border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] flex items-center justify-between px-6 sticky top-0 z-20 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-sm font-semibold text-[var(--muted-foreground)]">Platform Overview</h2>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors cursor-pointer" title="Notifications">
          <Bell className="h-5 w-5" />
        </button>
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        )}
        <div className="h-8 w-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-xs shadow-xs" title={userName}>
          {userInitials}
        </div>
      </div>
    </header>
  )
}

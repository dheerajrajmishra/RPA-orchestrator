"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { SidebarProvider, useSidebar } from "@/components/layout/sidebar-context"
import { PermissionGuard } from "@/components/layout/permission-guard"

function DashboardLayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { isCollapsed } = useSidebar()
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    setIsNavigating(true)
    const timer = setTimeout(() => setIsNavigating(false), 300)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div className="min-h-screen w-full flex bg-[var(--background)] relative">
      <Sidebar />
      <div
        className={`flex flex-col flex-1 w-full min-w-0 transition-all duration-300 ${
          isCollapsed ? "pl-16" : "pl-64"
        }`}
      >
        {isNavigating && (
          <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[var(--primary)] animate-pulse shadow-md shadow-[var(--primary)]/50" />
        )}
        <Header />
        <main className="flex-1 w-full p-6 overflow-y-auto">
          <PermissionGuard>{children}</PermissionGuard>
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  )
}

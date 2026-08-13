"use client"

import { Loader2 } from "lucide-react"

export function PageLoader({ message = "Loading data..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full py-12 animate-in fade-in duration-200">
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-12 h-12 rounded-full border-2 border-[var(--primary)]/20 border-t-[var(--primary)] animate-spin" />
        <Loader2 className="w-6 h-6 text-[var(--primary)] animate-spin absolute" />
      </div>
      <p className="text-sm font-medium text-[var(--muted-foreground)] animate-pulse">{message}</p>
    </div>
  )
}

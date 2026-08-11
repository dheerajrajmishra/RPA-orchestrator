"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Download, User, Settings, PlayCircle, Key, Server, Shield } from "lucide-react"

type AuditEvent = {
  id: string
  timestamp: string
  user: string
  action: string
  resource: string
  details: string
  ip: string
  type: "system" | "user" | "process" | "security"
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetch("http://localhost:8080/api/audit")
      .then(res => res.json())
      .then(data => { setLogs(data); setIsLoading(false); })
      .catch(err => { console.error(err); setIsLoading(false); })
  }, [])
  const [showFilters, setShowFilters] = useState(false)
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.resource.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || log.type === typeFilter
    
    return matchesSearch && matchesType
  })

  const handleExport = () => {
    const headers = ["Timestamp", "Actor", "Event", "Target Resource", "IP Address"]
    const csvContent = [
      headers.join(","),
      ...filteredLogs.map(log => `"${log.timestamp}","${log.user}","${log.action}","${log.resource}","${log.ip}"`)
    ].join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "audit_logs_export.csv")
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "security": return <Shield className="h-4 w-4 text-purple-400" />
      case "process": return <PlayCircle className="h-4 w-4 text-emerald-400" />
      case "system": return <Settings className="h-4 w-4 text-blue-400" />
      default: return <User className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Immutable record of all system, security, and process events.</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--muted)] hover:bg-[var(--muted)]/80 border border-[var(--border)] text-[var(--foreground)] rounded-md text-sm font-medium transition-colors"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <input 
              type="text" 
              placeholder="Search events, users, or resources..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium transition-colors ${showFilters ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "bg-[var(--card)] border-[var(--border)] hover:bg-[var(--muted)]"}`}
          >
            <Filter className="h-4 w-4" /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] flex items-center gap-6 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="space-y-1.5 flex-1 max-w-xs">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Event Type</label>
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--muted)]/50 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer"
              >
                <option value="all">All Events</option>
                <option value="security">Security</option>
                <option value="process">Process Execution</option>
                <option value="system">System Configuration</option>
              </select>
            </div>
            <div className="pt-5">
              <button 
                onClick={() => { setSearchTerm(""); setTypeFilter("all"); }}
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline underline-offset-2"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden h-fit">
        {isLoading ? (
          <div className="p-12 text-center text-[var(--muted-foreground)] text-sm">Loading...</div>
        ) : (
        <>
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-[var(--muted-foreground)] uppercase bg-[var(--muted)]/50 border-b border-[var(--border)]">
            <tr>
              <th className="px-6 py-3 font-semibold tracking-wider">Timestamp</th>
              <th className="px-6 py-3 font-semibold tracking-wider">Actor</th>
              <th className="px-6 py-3 font-semibold tracking-wider">Event</th>
              <th className="px-6 py-3 font-semibold tracking-wider">Target Resource</th>
              <th className="px-6 py-3 font-semibold tracking-wider">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-[var(--muted)]/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-[var(--muted-foreground)] font-mono text-xs">
                  {log.timestamp}
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-[var(--muted)] flex items-center justify-center text-[10px] uppercase font-bold text-[var(--muted-foreground)] border border-[var(--border)]">
                      {log.user === "System" ? "SYS" : log.user.substring(0,2)}
                    </div>
                    {log.user}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">{getEventIcon(log.type)}</div>
                    <div>
                      <div className="font-medium">{log.action}</div>
                      <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{log.details}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium">
                  {log.resource}
                </td>
                <td className="px-6 py-4 font-mono text-xs text-[var(--muted-foreground)]">
                  {log.ip}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredLogs.length === 0 && (
          <div className="p-12 text-center text-[var(--muted-foreground)] text-sm">
            No audit logs found matching your search.
          </div>
        )}
        </>
        )}
      </div>
    </div>
  )
}

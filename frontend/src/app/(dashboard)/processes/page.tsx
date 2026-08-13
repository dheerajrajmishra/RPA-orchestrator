"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Activity, CheckCircle2, XCircle, TrendingUp, Monitor, Layers,
  ChevronDown, ChevronRight, Search, FileText, ChevronUp, Plus
} from "lucide-react"

import { useProcessStore, type Process } from "@/store/useProcessStore"
import { Pagination } from "@/components/ui/pagination"

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string; bg: string }> = {
  success:   { label: "SUCCESS",  color: "text-emerald-400", dot: "bg-emerald-400", bg: "bg-emerald-400/10" },
  failed:    { label: "FAILED",   color: "text-red-400",     dot: "bg-red-400",     bg: "bg-red-400/10" },
  running:   { label: "RUNNING",  color: "text-blue-400",    dot: "bg-blue-400",    bg: "bg-blue-400/10" },
  queued:    { label: "QUEUED",   color: "text-amber-400",   dot: "bg-amber-400",   bg: "bg-amber-400/10" },
  timeout:   { label: "TIMEOUT",  color: "text-orange-400",  dot: "bg-orange-400",  bg: "bg-orange-400/10" },
}

const CATEGORY_CONFIG: Record<string, string> = {
  Finance:     "text-violet-400 bg-violet-400/10 ring-violet-400/30",
  HR:          "text-pink-400 bg-pink-400/10 ring-pink-400/30",
  Procurement: "text-orange-400 bg-orange-400/10 ring-orange-400/30",
  IT:          "text-cyan-400 bg-cyan-400/10 ring-cyan-400/30",
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.queued
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${cfg.color} ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function RunDot({ status }: { status: string }) {
  const color = status === "success" ? "bg-emerald-400" : status === "failed" ? "bg-red-400" : "bg-amber-400"
  return <span className={`inline-block w-2.5 h-2.5 rounded-sm ${color}`} />
}

function StepRow({ step }: { step: Process["detail"]["steps"][0] }) {
  const isSuccess = step.status === "success"
  return (
    <div className="flex items-start gap-3 py-1">
      <div className={`mt-0.5 flex-shrink-0 w-3 h-3 rounded-full border-2 ${isSuccess ? "bg-emerald-400 border-emerald-400" : "bg-red-400 border-red-400"}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-sm text-foreground font-medium">{step.name}</span>
          <span className="text-xs text-[var(--muted-foreground)]">{step.duration}</span>
        </div>
        <div className="text-xs text-[var(--muted-foreground)] mt-0.5">in: {step.recordsIn} → out: {step.recordsOut}</div>
      </div>
    </div>
  )
}

function MetaCell({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">{label}</div>
      <div className={`text-sm font-medium ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  )
}

function ProcessRow({ process }: { process: Process }) {
  const [expanded, setExpanded] = useState(false)
  const [activeRun, setActiveRun] = useState(0)
  const [showLogs, setShowLogs] = useState(false)
  const detail = process.detail

  return (
    <div className="border-b border-[var(--border)] last:border-0">
      <div
        className="grid grid-cols-[minmax(0,1fr)_100px_100px_100px_60px] lg:grid-cols-[minmax(0,1fr)_110px_100px_100px_110px_60px] gap-4 items-center px-4 py-3 hover:bg-[var(--muted)]/40 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className={`transition-transform duration-150 text-[var(--muted-foreground)] flex-shrink-0 ${expanded ? "rotate-90" : ""}`}>
            <ChevronRight className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm text-foreground truncate">{process.name}</span>
              {process.badge && (
                <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 ring-1 ring-red-400/30">{process.badge}</span>
              )}
            </div>
            <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{process.schedule}</div>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ring-1 ${CATEGORY_CONFIG[process.category] ?? ""}`}>{process.category}</span>
        <span className="text-xs text-[var(--muted-foreground)] font-mono whitespace-nowrap">{process.host}</span>
        <StatusBadge status={process.status} />
        <span className="text-xs text-[var(--muted-foreground)] whitespace-nowrap hidden lg:block">{process.lastRun}</span>
        <div className="flex items-center gap-1">{process.last5.map((s, i) => <RunDot key={i} status={s} />)}</div>
      </div>

      {expanded && (
        <div className="bg-[var(--muted)]/30 border-t border-[var(--border)] px-4 py-4 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide font-medium">Runs:</span>
            {process.runs.map((run, i) => (
              <button key={i} onClick={() => setActiveRun(i)}
                className={`text-xs px-2.5 py-1 rounded border font-medium transition-colors ${activeRun === i ? "bg-blue-500/20 text-blue-400 border-blue-500/40" : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--muted-foreground)]"}`}>
                ● {run.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 py-3 border-y border-[var(--border)]">
            <MetaCell label="STATUS" value={<StatusBadge status={detail.status} />} />
            <MetaCell label="TRIGGER" value={detail.trigger} />
            <MetaCell label="STARTED" value={detail.started} />
            <MetaCell label="DURATION" value={detail.duration} />
            <MetaCell label="RECORDS" value={detail.records} />
            <MetaCell label="HOST" value={detail.host} mono />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-1.5">Output Summary</div>
            <div className="text-sm text-[var(--foreground)] font-mono bg-[var(--card)] border border-[var(--border)] rounded px-3 py-2">{detail.outputSummary}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-2">Execution Steps</div>
            <div className="relative pl-1">
              <div className="absolute left-[5px] top-2 bottom-2 w-px bg-[var(--border)]" />
              <div className="pl-5 space-y-1">{detail.steps.map((step, i) => <StepRow key={i} step={step} />)}</div>
            </div>
          </div>
          <div>
            <button className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors" onClick={() => setShowLogs(!showLogs)}>
              <FileText className="h-3.5 w-3.5" />
              {showLogs ? "Hide" : "Show"} Logs ({detail.logs.length})
              {showLogs ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {showLogs && (
              <div className="mt-2 bg-black/80 rounded border border-[var(--border)] p-3 max-h-48 overflow-y-auto log-panel">
                {detail.logs.map((log, i) => (
                  <div key={i} className="flex gap-3 leading-relaxed">
                    <span className="text-[var(--muted-foreground)] flex-shrink-0">{log.time}</span>
                    <span className={`flex-shrink-0 font-semibold w-12 ${log.level === "ERROR" ? "text-red-400" : log.level === "WARN" ? "text-amber-400" : "text-emerald-400"}`}>{log.level}</span>
                    <span className="text-gray-300">{log.msg}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProcessOverviewPage() {
  const processes = useProcessStore((state) => state.processes)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All Categories")
  const [statusFilter, setStatusFilter] = useState("All Statuses")
  const [hostFilter, setHostFilter] = useState("All VMs")

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const filtered = processes.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCat = categoryFilter === "All Categories" || p.category === categoryFilter
    const matchStatus = statusFilter === "All Statuses" || p.status === statusFilter
    const matchHost = hostFilter === "All VMs" || p.host === hostFilter
    return matchSearch && matchCat && matchStatus && matchHost
  })

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1
  const paginatedProcesses = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Process Overview</h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">All registered processes with latest run details — click any row to expand</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full ring-1 ring-emerald-400/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All VMs reporting
          </div>
          <Link
            href="/processes/new"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Process
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
          <input type="text" placeholder="Search processes..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-[var(--card)] border border-[var(--border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--ring)] placeholder:text-[var(--muted-foreground)]" />
        </div>
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }} className="text-sm bg-[var(--card)] border border-[var(--border)] rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--ring)] text-[var(--foreground)] cursor-pointer">
          <option>All Categories</option><option>Finance</option><option>HR</option><option>Procurement</option><option>IT</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="text-sm bg-[var(--card)] border border-[var(--border)] rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--ring)] text-[var(--foreground)] cursor-pointer">
          <option>All Statuses</option><option>success</option><option>failed</option><option>running</option>
        </select>
        <select value={hostFilter} onChange={e => { setHostFilter(e.target.value); setCurrentPage(1); }} className="text-sm bg-[var(--card)] border border-[var(--border)] rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--ring)] text-[var(--foreground)] cursor-pointer">
          <option>All VMs</option><option>VM-FIN-01</option><option>VM-HR-01</option><option>VM-PROC-01</option>
        </select>
        <div className="ml-auto text-xs text-[var(--muted-foreground)]">{filtered.length} process{filtered.length !== 1 ? "es" : ""}</div>
      </div>

      {/* Process Table */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_100px_100px_100px_60px] lg:grid-cols-[minmax(0,1fr)_110px_100px_100px_110px_60px] gap-4 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--muted)]/50">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Process</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Category</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Host</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Status</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] hidden lg:block">Last Run</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Last 3</span>
        </div>
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-[var(--muted-foreground)] text-sm">No processes match your filters.</div>
        ) : (
          <>
            {paginatedProcesses.map(p => <ProcessRow key={p.id} process={p} />)}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </>
        )}
      </div>
    </div>
  )
}

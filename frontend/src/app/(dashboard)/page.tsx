"use client"

import { useState, useEffect } from "react"
import {
  Activity, CheckCircle2, XCircle, TrendingUp, Monitor, Layers,
  Clock, AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw,
  Wifi, WifiOff, Cpu, Database, Zap
} from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts"

// ─── Mock Data ────────────────────────────────────────────────────────────────

const run7d = [
  { day: "Aug 5",  success: 18, failed: 2, timeout: 0 },
  { day: "Aug 6",  success: 22, failed: 1, timeout: 1 },
  { day: "Aug 7",  success: 20, failed: 3, timeout: 0 },
  { day: "Aug 8",  success: 25, failed: 0, timeout: 0 },
  { day: "Aug 9",  success: 19, failed: 4, timeout: 1 },
  { day: "Aug 10", success: 23, failed: 2, timeout: 0 },
  { day: "Aug 11", success: 14, failed: 1, timeout: 0 },
]

const successRateTrend = [
  { time: "08:00", rate: 100 },
  { time: "08:30", rate: 100 },
  { time: "09:00", rate: 83 },
  { time: "09:30", rate: 83 },
  { time: "10:00", rate: 71 },
  { time: "10:30", rate: 71 },
  { time: "11:00", rate: 71 },
]

const durationTrend = [
  { name: "AP Automation",       avg: 15.0, p95: 18.2 },
  { name: "HR Payroll Sync",     avg: 3.4,  p95: 5.1 },
  { name: "Vendor Crawler",      avg: 1.1,  p95: 2.4 },
  { name: "IT Backup Sync",      avg: 8.2,  p95: 11.0 },
  { name: "Procurement Report",  avg: 4.6,  p95: 6.8 },
]

const categoryBreakdown = [
  { name: "Finance",     value: 3, color: "#818cf8" },
  { name: "HR",          value: 2, color: "#f472b6" },
  { name: "Procurement", value: 2, color: "#fb923c" },
  { name: "IT",          value: 1, color: "#22d3ee" },
]

const activeRuns = [
  {
    process: "HR Payroll Sync",
    host: "VM-HR-01",
    status: "running",
    started: "11:28:00",
    elapsedSec: 204,
    expectedSec: 202,
    heartbeatAge: 12,
    pid: 9820,
  },
]

const recentFailures = [
  {
    process: "Vendor Invoice Crawler",
    host: "VM-PROC-01",
    time: "10:01",
    error: "Connection refused: vendor-portal.corp:443",
    category: "network",
    ago: "29m ago",
  },
  {
    process: "Account Payable Automation",
    host: "VM-FIN-01",
    time: "Aug 9, 09:00",
    error: "Data validation failed — 12 invalid records",
    category: "data_validation",
    ago: "2d ago",
  },
]

const vmStatus = [
  { id: "VM-FIN-01",  status: "online", processes: 3, lastSeen: "11s ago" },
  { id: "VM-HR-01",   status: "online", processes: 2, lastSeen: "8s ago" },
  { id: "VM-PROC-01", status: "online", processes: 2, lastSeen: "6s ago" },
  { id: "VM-IT-01",   status: "online", processes: 1, lastSeen: "22s ago" },
]

const alertHistory = [
  { rule: "Consecutive Failures > 2", process: "Vendor Invoice Crawler", time: "10:02", channel: "slack", msg: "3 consecutive failures" },
  { rule: "SLA Breach > 20min",       process: "AP Automation",           time: "Aug 9, 09:18", channel: "email", msg: "Run exceeded 20m SLA" },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon: Icon, color, border, bg, trend, trendUp }: {
  label: string; value: string; sub?: string; icon: React.ElementType;
  color: string; border: string; bg: string; trend?: string; trendUp?: boolean
}) {
  return (
    <div className={`rounded-xl border ${border} bg-[var(--card)] p-4 flex flex-col gap-3 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${bg}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs font-semibold ${trendUp ? "text-emerald-400" : "text-red-400"}`}>
            {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">{label}</div>
        <div className={`text-3xl font-black tracking-tight mt-1 ${color}`}>{value}</div>
        {sub && <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

function SectionCard({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm ${className}`}>
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h3 className="text-sm font-bold text-[var(--foreground)]">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function ElapsedBar({ elapsed, expected }: { elapsed: number; expected: number }) {
  const pct = Math.min(Math.round((elapsed / expected) * 100), 100)
  const over = elapsed > expected
  return (
    <div className="w-full">
      <div className="flex justify-between text-[10px] text-[var(--muted-foreground)] mb-1">
        <span>{Math.floor(elapsed / 60)}m {elapsed % 60}s elapsed</span>
        <span className={over ? "text-amber-400 font-semibold" : ""}>{pct}%{over ? " OVER" : ""}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[var(--muted)]">
        <div
          className={`h-1.5 rounded-full transition-all ${over ? "bg-amber-400" : "bg-blue-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function HeartbeatDot({ age }: { age: number }) {
  const color = age < 30 ? "bg-emerald-400" : age < 90 ? "bg-amber-400" : "bg-red-400"
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${color} ${age < 30 ? "animate-pulse" : ""}`} />
      <span className="text-xs text-[var(--muted-foreground)]">{age}s ago</span>
    </div>
  )
}

// Custom tooltip for charts
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="font-semibold text-[var(--foreground)] mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[var(--muted-foreground)]">{p.name}:</span>
          <span className="font-semibold text-[var(--foreground)]">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function MonitoringDashboard() {
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const refresh = () => setLastRefresh(new Date())

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Monitoring Dashboard</h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Live operational view — refreshes every 30s · Last: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={refresh} className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors border border-[var(--border)] px-2.5 py-1.5 rounded-md">
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full ring-1 ring-emerald-400/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            4/4 VMs Online
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="Total Processes" value="8" icon={Layers}      color="text-violet-400" border="border-violet-500/20" bg="bg-violet-500/10" />
        <KpiCard label="Active Now"      value="1" sub="HR Payroll Sync running" icon={Activity}   color="text-blue-400"   border="border-blue-500/20"   bg="bg-blue-500/10"   />
        <KpiCard label="Success (24h)"   value="5" icon={CheckCircle2} color="text-emerald-400" border="border-emerald-500/20" bg="bg-emerald-500/10" trend="+2 vs yesterday" trendUp />
        <KpiCard label="Failed (24h)"    value="1" icon={XCircle}      color="text-red-400"    border="border-red-500/20"    bg="bg-red-500/10"    trend="-1 vs yesterday" trendUp />
        <KpiCard label="Success Rate"    value="71%" sub="Target: 95%" icon={TrendingUp}  color="text-amber-400"  border="border-amber-500/20"  bg="bg-amber-500/10"  trend="↓ from 90%" trendUp={false} />
        <KpiCard label="VMs Online"      value="4/4" icon={Monitor}    color="text-cyan-400"   border="border-cyan-500/20"   bg="bg-cyan-500/10"   trend="All healthy" trendUp />
      </div>

      {/* Row 1: Run volume chart + Active Runs */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* 7-day run volume stacked bar */}
        <SectionCard title="Run Volume — Last 7 Days" className="lg:col-span-3">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={run7d} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="success" name="Success" stackId="a" fill="#34d399" radius={[0,0,3,3]} />
              <Bar dataKey="failed"  name="Failed"  stackId="a" fill="#f87171" radius={[0,0,0,0]} />
              <Bar dataKey="timeout" name="Timeout" stackId="a" fill="#fbbf24" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            {[["Success","bg-emerald-400"],["Failed","bg-red-400"],["Timeout","bg-amber-400"]].map(([l,c]) => (
              <div key={l} className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                <span className={`w-2.5 h-2.5 rounded-sm ${c}`} /> {l}
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Active Runs */}
        <SectionCard title="Active Runs" className="lg:col-span-2">
          {activeRuns.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-[var(--muted-foreground)] text-sm">
              No runs in progress
            </div>
          ) : (
            <div className="space-y-4">
              {activeRuns.map((r, i) => (
                <div key={i} className="border border-blue-500/20 bg-blue-500/5 rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-[var(--foreground)]">{r.process}</div>
                      <div className="text-xs text-[var(--muted-foreground)] font-mono">{r.host} · PID {r.pid}</div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold text-blue-400 bg-blue-400/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> RUNNING
                    </span>
                  </div>
                  <ElapsedBar elapsed={r.elapsedSec} expected={r.expectedSec} />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--muted-foreground)]">Started {r.started}</span>
                    <HeartbeatDot age={r.heartbeatAge} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Row 2: Success Rate trend + Duration p95 + Category Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Success Rate trend */}
        <SectionCard title="Success Rate Today (Hourly)">
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={successRateTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
              <YAxis domain={[0,100]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="rate" name="Success %" stroke="#34d399" strokeWidth={2} fill="url(#rateGrad)" dot={{ r: 3, fill: "#34d399" }} />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Avg Duration per process */}
        <SectionCard title="Avg Duration by Process (min)">
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={durationTrend} layout="vertical" margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="avg" name="Avg" fill="#818cf8" radius={[0,3,3,0]} barSize={8} />
              <Bar dataKey="p95" name="P95" fill="#f87171" radius={[0,3,3,0]} barSize={4} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Category breakdown donut */}
        <SectionCard title="Processes by Category">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={3} dataKey="value">
                  {categoryBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {categoryBreakdown.map(cat => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: cat.color }} />
                    <span className="text-[var(--muted-foreground)]">{cat.name}</span>
                  </div>
                  <span className="font-bold text-[var(--foreground)]">{cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Row 3: Recent Failures + VM Health + Alert History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Failures */}
        <SectionCard title="Recent Failures (7d)">
          <div className="space-y-3">
            {recentFailures.map((f, i) => (
              <div key={i} className="flex gap-3 pb-3 border-b border-[var(--border)] last:border-0 last:pb-0">
                <div className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <XCircle className="h-4 w-4 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">{f.process}</span>
                    <span className="text-xs text-[var(--muted-foreground)] flex-shrink-0">{f.ago}</span>
                  </div>
                  <div className="text-xs text-red-400 mt-0.5 truncate">{f.error}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--muted)] text-[var(--muted-foreground)] font-mono">{f.host}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-400/10 text-orange-400">{f.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* VM Health */}
        <SectionCard title="VM Health">
          <div className="space-y-3">
            {vmStatus.map((vm) => (
              <div key={vm.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${vm.status === "online" ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                  <div>
                    <div className="text-sm font-mono font-medium">{vm.id}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">{vm.processes} process{vm.processes !== 1 ? "es" : ""}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-semibold ${vm.status === "online" ? "text-emerald-400" : "text-red-400"}`}>
                    {vm.status.toUpperCase()}
                  </div>
                  <div className="text-[10px] text-[var(--muted-foreground)]">seen {vm.lastSeen}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Alert History */}
        <SectionCard title="Recent Alerts">
          <div className="space-y-3">
            {alertHistory.map((a, i) => (
              <div key={i} className="flex gap-3 pb-3 border-b border-[var(--border)] last:border-0 last:pb-0">
                <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{a.process}</div>
                  <div className="text-xs text-amber-400 mt-0.5">{a.msg}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-[var(--muted-foreground)]">{a.time}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--muted)] text-[var(--muted-foreground)]">{a.channel}</span>
                  </div>
                </div>
              </div>
            ))}
            {alertHistory.length === 0 && (
              <div className="py-4 text-center text-[var(--muted-foreground)] text-sm">No recent alerts</div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Bell, CheckCircle2, Settings, Mail, Plus, XCircle, Clock, Server, Activity } from "lucide-react"

type Alert = {
  id: string
  severity: "critical" | "warning" | "info"
  message: string
  source: string
  timestamp: string
  status: "active" | "acknowledged"
}

type AlertRule = {
  id: string
  name: string
  condition: string
  action: string
  enabled: boolean
}

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState<"inbox" | "rules">("inbox")
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [rules, setRules] = useState<AlertRule[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8080/api/alerts").then(res => res.json()),
      fetch("http://localhost:8080/api/alerts/rules").then(res => res.json())
    ])
      .then(([alertsData, rulesData]) => {
        setAlerts(alertsData)
        setRules(rulesData)
        setIsLoading(false)
      })
      .catch(err => {
        console.error(err)
        setIsLoading(false)
      })
  }, [])
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false)

  const handleAcknowledge = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/alerts/${id}/acknowledge`, { method: "POST" })
      if (res.ok) {
        setAlerts(alerts.map(a => a.id === id ? { ...a, status: "acknowledged" } : a))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleRule = async (id: string) => {
    const rule = rules.find(r => r.id === id)
    if (!rule) return
    try {
      const res = await fetch(`http://localhost:8080/api/alerts/rules/${id}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !rule.enabled })
      })
      if (res.ok) {
        setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const activeAlertsCount = alerts.filter(a => a.status === "active").length

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alerts & Monitoring</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Monitor system health, process failures, and configure notification rules.</p>
        </div>
        {activeTab === "rules" && (
          <button 
            onClick={() => setIsRuleModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" /> Create Rule
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[var(--border)]">
        <button 
          onClick={() => setActiveTab("inbox")}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${activeTab === "inbox" ? "border-[var(--primary)] text-[var(--foreground)]" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
        >
          Alert Inbox
          {activeAlertsCount > 0 && (
            <span className="flex items-center justify-center bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full">
              {activeAlertsCount}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab("rules")}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${activeTab === "rules" ? "border-[var(--primary)] text-[var(--foreground)]" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
        >
          Alert Rules <Settings className="h-4 w-4" />
        </button>
      </div>

      {activeTab === "inbox" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {isLoading ? (
            <div className="p-12 text-center text-[var(--muted-foreground)] text-sm">Loading...</div>
          ) : alerts.length === 0 ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-12 text-center text-[var(--muted-foreground)] text-sm shadow-sm">
              <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-400/50 mb-4" />
              All clear! There are no alerts to display.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {alerts.map(alert => (
                <div key={alert.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border shadow-sm transition-all ${alert.status === "active" ? "bg-[var(--card)] border-[var(--border)]" : "bg-[var(--muted)]/20 border-transparent opacity-75"}`}>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0">
                      {alert.severity === "critical" && <XCircle className="h-5 w-5 text-red-500" />}
                      {alert.severity === "warning" && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                      {alert.severity === "info" && <Bell className="h-5 w-5 text-blue-500" />}
                    </div>
                    <div>
                      <div className="font-semibold text-sm flex items-center gap-2">
                        {alert.message}
                        {alert.status === "active" && (
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-red-500/10 text-red-500 border border-red-500/20">New</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-[var(--muted-foreground)]">
                        <span className="flex items-center gap-1"><Server className="h-3.5 w-3.5" /> {alert.source}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {alert.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  {alert.status === "active" && (
                    <button 
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3 py-1.5 text-xs font-medium border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--muted)] transition-colors rounded-md flex-shrink-0"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "rules" && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden animate-in fade-in duration-300">
          {isLoading ? (
            <div className="p-12 text-center text-[var(--muted-foreground)] text-sm">Loading...</div>
          ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[var(--muted-foreground)] uppercase bg-[var(--muted)]/50 border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-3 font-semibold tracking-wider">Rule Name</th>
                <th className="px-6 py-3 font-semibold tracking-wider">Condition</th>
                <th className="px-6 py-3 font-semibold tracking-wider">Action</th>
                <th className="px-6 py-3 font-semibold tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {rules.map(rule => (
                <tr key={rule.id} className={`transition-colors ${rule.enabled ? 'hover:bg-[var(--muted)]/30' : 'bg-[var(--muted)]/10 text-[var(--muted-foreground)]'}`}>
                  <td className="px-6 py-4 font-medium flex items-center gap-2">
                    <Activity className={`h-4 w-4 ${rule.enabled ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`} />
                    {rule.name}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{rule.condition}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[var(--border)] bg-[var(--background)] text-xs w-fit">
                      <Mail className="h-3.5 w-3.5" /> {rule.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={rule.enabled}
                        onChange={() => handleToggleRule(rule.id)}
                      />
                      <div className="w-9 h-5 bg-[var(--muted)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      )}

      {/* Create Rule Modal */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-2xl w-full max-w-md m-4 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold mb-4 tracking-tight">Create Alert Rule</h2>
            <div className="space-y-4 mb-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Rule Name</label>
                <input type="text" placeholder="e.g. Host Offline" className="w-full px-3 py-2 bg-[var(--muted)]/50 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Condition</label>
                <select className="w-full px-3 py-2 bg-[var(--muted)]/50 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer">
                  <option>Process fails &gt; 1 time</option>
                  <option>Process execution &gt; 60 mins</option>
                  <option>Host heartbeat lost &gt; 5 mins</option>
                  <option>Host CPU usage &gt; 90%</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Action</label>
                <select className="w-full px-3 py-2 bg-[var(--muted)]/50 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer">
                  <option>Send Email</option>
                  <option>Trigger Webhook</option>
                  <option>Log Only</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsRuleModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Cancel</button>
              <button onClick={() => setIsRuleModalOpen(false)} className="px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity">Create Rule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

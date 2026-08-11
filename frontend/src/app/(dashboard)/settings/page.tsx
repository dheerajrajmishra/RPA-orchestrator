"use client"

import { useState, useEffect } from "react"
import { Save, Bell, Shield, Database, LayoutDashboard, Globe, Mail } from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "security" | "retention" | "notifications">("general")
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("http://localhost:8080/api/settings")
      .then(res => res.json())
      .then(data => { setSettings(data); setIsLoading(false); })
      .catch(err => { console.error(err); setIsLoading(false); })
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await fetch("http://localhost:8080/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings || {})
      })
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Configure global preferences, security policies, and data retention.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSaving ? <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-1">
          <button 
            onClick={() => setActiveTab("general")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "general" ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50 hover:text-[var(--foreground)]"}`}
          >
            <Globe className="h-4 w-4" /> General
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "security" ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50 hover:text-[var(--foreground)]"}`}
          >
            <Shield className="h-4 w-4" /> Security
          </button>
          <button 
            onClick={() => setActiveTab("retention")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "retention" ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50 hover:text-[var(--foreground)]"}`}
          >
            <Database className="h-4 w-4" /> Data Retention
          </button>
          <button 
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "notifications" ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50 hover:text-[var(--foreground)]"}`}
          >
            <Bell className="h-4 w-4" /> Notifications
          </button>
        </div>

        {/* Settings Content */}
        <div className="flex-1 space-y-6">
          {activeTab === "general" && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden animate-in fade-in duration-300">
              <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--muted)]/30">
                <h3 className="font-semibold text-lg">General Settings</h3>
                <p className="text-sm text-[var(--muted-foreground)]">Global configuration for the orchestrator instance.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Instance Name</label>
                    <input type="text" defaultValue="RPA Orchestrator Prod" className="w-full px-3 py-2 bg-[var(--muted)]/30 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
                    <p className="text-xs text-[var(--muted-foreground)]">Displayed in the header and alert emails.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Default Timezone</label>
                    <select className="w-full px-3 py-2 bg-[var(--muted)]/30 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer">
                      <option>UTC (Coordinated Universal Time)</option>
                      <option>America/New_York (EST)</option>
                      <option>Europe/London (GMT)</option>
                      <option>Asia/Kolkata (IST)</option>
                    </select>
                    <p className="text-xs text-[var(--muted-foreground)]">Used for process schedules and audit logs.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden animate-in fade-in duration-300">
              <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--muted)]/30">
                <h3 className="font-semibold text-lg">Security & Authentication</h3>
                <p className="text-sm text-[var(--muted-foreground)]">Manage session timeouts and authentication policies.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] bg-[var(--muted)]/20">
                  <div>
                    <h4 className="font-semibold text-sm">Require Multi-Factor Authentication</h4>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Force all users to configure MFA upon login.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-[var(--muted)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Session Timeout (Minutes)</label>
                    <input type="number" defaultValue={30} className="w-full px-3 py-2 bg-[var(--muted)]/30 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
                    <p className="text-xs text-[var(--muted-foreground)]">Users are logged out after inactivity.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Max Login Attempts</label>
                    <input type="number" defaultValue={5} className="w-full px-3 py-2 bg-[var(--muted)]/30 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
                    <p className="text-xs text-[var(--muted-foreground)]">Lock account after X failed attempts.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "retention" && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden animate-in fade-in duration-300">
              <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--muted)]/30">
                <h3 className="font-semibold text-lg">Data Retention</h3>
                <p className="text-sm text-[var(--muted-foreground)]">Configure how long historical data is kept in the database.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2 max-w-md">
                  <label className="text-sm font-semibold">Process Execution Logs</label>
                  <select className="w-full px-3 py-2 bg-[var(--muted)]/30 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer">
                    <option>7 Days</option>
                    <option>30 Days</option>
                    <option selected>90 Days</option>
                    <option>1 Year</option>
                    <option>Forever</option>
                  </select>
                </div>
                <div className="space-y-2 max-w-md">
                  <label className="text-sm font-semibold">System Audit Logs</label>
                  <select className="w-full px-3 py-2 bg-[var(--muted)]/30 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer">
                    <option>30 Days</option>
                    <option>90 Days</option>
                    <option>1 Year</option>
                    <option selected>3 Years (Compliance Standard)</option>
                    <option>Forever</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden animate-in fade-in duration-300">
              <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--muted)]/30">
                <h3 className="font-semibold text-lg">SMTP & Webhooks</h3>
                <p className="text-sm text-[var(--muted-foreground)]">Configure outbound messaging for alerts and invites.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm flex items-center gap-2"><Mail className="h-4 w-4" /> SMTP Server</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Host</label>
                      <input type="text" defaultValue="smtp.sendgrid.net" className="w-full px-3 py-2 bg-[var(--muted)]/30 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Port</label>
                      <input type="text" defaultValue="587" className="w-full px-3 py-2 bg-[var(--muted)]/30 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Username</label>
                      <input type="text" defaultValue="apikey" className="w-full px-3 py-2 bg-[var(--muted)]/30 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Password</label>
                      <input type="password" defaultValue="****************" className="w-full px-3 py-2 bg-[var(--muted)]/30 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

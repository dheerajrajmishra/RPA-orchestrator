"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Box, Clock, Server, Bell, ShieldAlert, CheckCircle2, ChevronDown } from "lucide-react"
import { useProcessStore } from "@/store/useProcessStore"
import { API_BASE_URL } from "@/lib/config"

type VmHost = {
  id: string
  name?: string
  hostname?: string
  status?: string
}

type Category = {
  id: string
  name: string
  description?: string
  color?: string
}

export default function RegisterProcessPage() {
  const router = useRouter()
  const addProcess = useProcessStore((state) => state.addProcess)
  const [activeTab, setActiveTab] = useState("general")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [category, setCategory] = useState("Finance")
  const [host, setHost] = useState("VM-FIN-01")

  const [vmHosts, setVmHosts] = useState<VmHost[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    // Fetch VM Hosts from database
    fetch(`${API_BASE_URL}/api/hosts`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setVmHosts(data)
          if (data.length > 0) {
            setHost(data[0].hostname || data[0].name || "VM-FIN-01")
          }
        }
      })
      .catch(err => console.error("Error loading hosts:", err))

    // Fetch Categories from database
    fetch(`${API_BASE_URL}/api/categories`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data)
          if (data.length > 0) {
            setCategory(data[0].name)
          }
        }
      })
      .catch(err => console.error("Error loading categories:", err))
  }, [])

  const handleSave = () => {
    setIsSubmitting(true)
    
    addProcess({
      id: Math.random().toString(36).substr(2, 9),
      name: name || "Untitled Process",
      slug: slug || "untitled",
      badge: null,
      schedule: "Manual",
      category: category,
      host: host.split(' ')[0],
      status: "queued",
      lastRun: "Never",
      duration: "-",
      last5: [],
      runs: [],
      detail: {
        status: "queued",
        trigger: "manual",
        started: "-",
        duration: "-",
        records: "-",
        host: host.split(' ')[0],
        outputSummary: "Waiting for first run...",
        steps: [],
        logs: []
      }
    })

    setTimeout(() => {
      router.push("/processes")
    }, 600)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <Link href="/processes" className="inline-flex items-center gap-2 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Processes
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Register New Process</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Configure a new RPA worker process for orchestration and monitoring.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-start">
        {/* Sidebar Navigation */}
        <div className="flex flex-col space-y-1 sticky top-6">
          <TabButton active={activeTab === "general"} onClick={() => setActiveTab("general")} icon={Box} label="General Info" />
          <TabButton active={activeTab === "execution"} onClick={() => setActiveTab("execution")} icon={Server} label="Execution Target" />
          <TabButton active={activeTab === "schedule"} onClick={() => setActiveTab("schedule")} icon={Clock} label="Schedule & SLA" />
          <TabButton active={activeTab === "alerts"} onClick={() => setActiveTab("alerts")} icon={Bell} label="Alerts & Notifications" />
        </div>

        {/* Form Content */}
        <div className="space-y-6">
          
          {/* General Info */}
          <div className={`space-y-6 ${activeTab !== "general" && "hidden"}`}>
            <SectionHeader title="General Information" desc="Basic identification for this process." />
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-5 shadow-sm">
              <div className="space-y-2">
                <Label>Process Name</Label>
                <Input placeholder="e.g. Account Payable Automation" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Process ID (Slug)</Label>
                <Input placeholder="ap-automation" className="font-mono text-sm" value={slug} onChange={e => setSlug(e.target.value)} />
                <p className="text-xs text-[var(--muted-foreground)]">Unique identifier used by the VM reporter API.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onChange={e => setCategory(e.target.value)}>
                    {categories.length === 0 ? (
                      <>
                        <option>Finance</option>
                        <option>HR</option>
                        <option>Procurement</option>
                        <option>IT</option>
                      </>
                    ) : (
                      categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)
                    )}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Criticality</Label>
                  <Select>
                    <option>Standard</option>
                    <option>High</option>
                    <option>Critical</option>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <textarea 
                  className="w-full min-h-[100px] bg-transparent border border-[var(--border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-shadow placeholder:text-[var(--muted-foreground)]" 
                  placeholder="Describe what this RPA process does..."
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setActiveTab("execution")} className="px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
                Next: Execution Target
              </button>
            </div>
          </div>

          {/* Execution Target */}
          <div className={`space-y-6 ${activeTab !== "execution" && "hidden"}`}>
            <SectionHeader title="Execution Target" desc="Where will this process run?" />
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-5 shadow-sm">
              <div className="space-y-2">
                <Label>Target Host VM (Loaded from Database)</Label>
                <Select value={host} onChange={e => setHost(e.target.value)}>
                  {vmHosts.length === 0 ? (
                    <>
                      <option value="VM-FIN-01">VM-FIN-01 (Online)</option>
                      <option value="VM-HR-01">VM-HR-01 (Online)</option>
                      <option value="VM-PROC-01">VM-PROC-01 (Online)</option>
                      <option value="VM-IT-01">VM-IT-01 (Online)</option>
                    </>
                  ) : (
                    vmHosts.map(h => {
                      const hName = h.hostname || h.name || "VM-Host"
                      return (
                        <option key={h.id} value={hName}>
                          {hName} ({h.status || "online"})
                        </option>
                      )
                    })
                  )}
                </Select>
                <p className="text-xs text-[var(--muted-foreground)]">The specific virtual machine host fetched from your registered database hosts.</p>
              </div>
              <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                <Label>API Key Binding</Label>
                <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--muted)]/50">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="h-5 w-5 text-amber-500" />
                    <div>
                      <div className="text-sm font-medium">Require specific API Key</div>
                      <div className="text-xs text-[var(--muted-foreground)]">Only allow ingest from a specific key for security.</div>
                    </div>
                  </div>
                  <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] bg-transparent" />
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setActiveTab("general")} className="px-4 py-2 bg-[var(--muted)] text-[var(--foreground)] rounded-md text-sm font-medium hover:bg-[var(--border)] transition-colors">Back</button>
              <button onClick={() => setActiveTab("schedule")} className="px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity">Next: Schedule</button>
            </div>
          </div>

          {/* Schedule */}
          <div className={`space-y-6 ${activeTab !== "schedule" && "hidden"}`}>
            <SectionHeader title="Schedule & SLA" desc="When does it run and how long should it take?" />
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-5 shadow-sm">
              <div className="space-y-2">
                <Label>Trigger Type</Label>
                <Select>
                  <option>Scheduled (Cron)</option>
                  <option>Event-Driven (API)</option>
                  <option>Manual Only</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cron Expression</Label>
                <Input placeholder="0 9 * * 1-5" className="font-mono text-sm" />
                <p className="text-xs text-emerald-500 font-medium mt-1">Runs at 09:00 on every day-of-week from Monday through Friday.</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
                <div className="space-y-2">
                  <Label>Expected Duration (SLA)</Label>
                  <div className="relative">
                    <Input placeholder="15" type="number" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)]">minutes</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Timeout Threshold</Label>
                  <div className="relative">
                    <Input placeholder="30" type="number" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)]">minutes</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setActiveTab("execution")} className="px-4 py-2 bg-[var(--muted)] text-[var(--foreground)] rounded-md text-sm font-medium hover:bg-[var(--border)] transition-colors">Back</button>
              <button onClick={() => setActiveTab("alerts")} className="px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity">Next: Alerts</button>
            </div>
          </div>

          {/* Alerts */}
          <div className={`space-y-6 ${activeTab !== "alerts" && "hidden"}`}>
            <SectionHeader title="Alerts & Notifications" desc="Who gets notified when things go wrong?" />
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-5 shadow-sm">
              <div className="space-y-3">
                <Label>Alert Conditions</Label>
                <CheckboxRow label="Notify on any failure" desc="Send an alert immediately if the run fails." defaultChecked />
                <CheckboxRow label="Notify on SLA breach" desc="Send an alert if the run exceeds the Expected Duration." defaultChecked />
                <CheckboxRow label="Notify on missing schedule" desc="Send an alert if a scheduled run doesn't start on time." />
                <CheckboxRow label="Notify on success" desc="Send a confirmation when the run finishes successfully." />
              </div>
              <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                <Label>Notification Channels</Label>
                <Select>
                  <option>#finance-bots-alerts (Slack)</option>
                  <option>#general-alerts (Slack)</option>
                  <option>rpa-admin@company.com (Email)</option>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between pt-6">
              <button onClick={() => setActiveTab("schedule")} className="px-4 py-2 bg-[var(--muted)] text-[var(--foreground)] rounded-md text-sm font-medium hover:bg-[var(--border)] transition-colors">Back</button>
              <button 
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-[var(--primary)]/20 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" /> {isSubmitting ? "Saving..." : "Save Process"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function SectionHeader({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="pb-4 border-b border-[var(--border)]">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-sm text-[var(--muted-foreground)]">{desc}</p>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">{children}</label>
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      {...props} 
      className={`w-full bg-transparent border border-[var(--border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-shadow placeholder:text-[var(--muted-foreground)] ${props.className || ""}`}
    />
  )
}

function Select({ children, className, value, onChange }: { children: React.ReactNode, className?: string, value?: string, onChange?: (e: any) => void }) {
  return (
    <div className="relative">
      <select value={value} onChange={onChange} className={`w-full bg-transparent border border-[var(--border)] rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent appearance-none transition-shadow ${className || ""}`}>
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)] pointer-events-none" />
    </div>
  )
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: React.ElementType, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active 
          ? "bg-[var(--primary)]/10 text-[var(--primary)]" 
          : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
      }`}
    >
      <Icon className={`h-4 w-4 ${active ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`} />
      {label}
    </button>
  )
}

function CheckboxRow({ label, desc, defaultChecked = false }: { label: string, desc: string, defaultChecked?: boolean }) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)]/30 cursor-pointer transition-colors">
      <input type="checkbox" defaultChecked={defaultChecked} className="mt-1 flex-shrink-0 w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] bg-transparent" />
      <div>
        <div className="text-sm font-medium text-[var(--foreground)]">{label}</div>
        <div className="text-xs text-[var(--muted-foreground)]">{desc}</div>
      </div>
    </label>
  )
}

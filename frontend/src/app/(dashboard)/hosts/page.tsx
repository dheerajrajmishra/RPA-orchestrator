"use client"

import { useState, useEffect } from "react"
import { Server, Plus, Trash2, Edit2 } from "lucide-react"

type VmHost = {
  id: string
  name?: string
  hostname?: string
  category: string
  ipAddress: string
  status: "online" | "offline"
  lastSeen?: string
}

export default function VmHostsPage() {
  const [hosts, setHosts] = useState<VmHost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchHosts()
  }, [])

  const fetchHosts = () => {
    fetch("http://localhost:8080/api/hosts")
      .then(res => res.json())
      .then(data => { setHosts(data); setIsLoading(false); })
      .catch(err => { console.error(err); setIsLoading(false); })
  }

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHost, setEditingHost] = useState<VmHost | null>(null)

  // Form State
  const [hostName, setHostName] = useState("")
  const [category, setCategory] = useState("Finance")
  const [ipAddress, setIpAddress] = useState("")

  const handleOpenAddModal = () => {
    setEditingHost(null)
    setHostName("")
    setCategory("Finance")
    setIpAddress("")
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (host: VmHost) => {
    setEditingHost(host)
    setHostName(host.name || host.hostname || "")
    setCategory(host.category || "Finance")
    setIpAddress(host.ipAddress || "")
    setIsModalOpen(true)
  }

  const handleSubmitHost = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingHost) {
      // Update Host via PUT /api/hosts/{id}
      const payload = {
        name: hostName,
        hostname: hostName,
        category,
        ipAddress: ipAddress || "Pending..."
      }
      try {
        const res = await fetch(`http://localhost:8080/api/hosts/${editingHost.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        if (res.ok) {
          const updatedHost = await res.json()
          setHosts(hosts.map(h => h.id === editingHost.id ? updatedHost : h))
          setIsModalOpen(false)
          setEditingHost(null)
          setHostName("")
          setIpAddress("")
        } else {
          console.error("Failed to update host:", res.status, res.statusText)
        }
      } catch (err) {
        console.error(err)
      }
    } else {
      // Add Host via POST /api/hosts
      const payload = {
        name: hostName,
        hostname: hostName,
        category,
        ipAddress: ipAddress || "Pending...",
        status: "offline",
        lastSeen: null
      }
      try {
        const res = await fetch("http://localhost:8080/api/hosts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        if (res.ok) {
          const newHost = await res.json()
          setHosts([newHost, ...hosts])
          setIsModalOpen(false)
          setHostName("")
          setIpAddress("")
        } else {
          console.error("Failed to add host:", res.status, res.statusText)
        }
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/hosts/${id}`, { method: "DELETE" })
      if (res.ok) {
        setHosts(hosts.filter(h => h.id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">VM Hosts</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Manage the Virtual Machines that execute your RPA processes.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Host
        </button>
      </div>
      
      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-2xl w-full max-w-md m-4 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold mb-4 tracking-tight">
              {editingHost ? "Edit VM Host Details" : "Register New VM Host"}
            </h2>
            
            <form onSubmit={handleSubmitHost} className="space-y-4 mb-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Hostname</label>
                <input 
                  type="text" 
                  required
                  value={hostName}
                  onChange={e => setHostName(e.target.value)}
                  placeholder="e.g. VM-FIN-02"
                  className="w-full px-3 py-2 bg-[var(--muted)]/50 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Category / Department</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--muted)]/50 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer"
                >
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                  <option value="Procurement">Procurement</option>
                  <option value="IT">IT Support</option>
                  <option value="Sales">Sales Operations</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">IP Address (Optional)</label>
                <input 
                  type="text" 
                  value={ipAddress}
                  onChange={e => setIpAddress(e.target.value)}
                  placeholder="e.g. 10.0.4.120"
                  className="w-full px-3 py-2 bg-[var(--muted)]/50 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </form>

            <div className="flex justify-end gap-2">
              <button 
                type="button"
                onClick={() => { setIsModalOpen(false); setEditingHost(null); }}
                className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitHost}
                className="px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
              >
                {editingHost ? "Save Changes" : "Register Host"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-[var(--muted-foreground)] text-sm">
            Loading...
          </div>
        ) : hosts.length === 0 ? (
          <div className="p-12 text-center text-[var(--muted-foreground)] text-sm">
            No VM Hosts registered. Add a host to deploy processes.
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[var(--muted-foreground)] uppercase bg-[var(--muted)]/50 border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-3 font-semibold tracking-wider">Hostname</th>
                <th className="px-6 py-3 font-semibold tracking-wider">Category</th>
                <th className="px-6 py-3 font-semibold tracking-wider">IP / Network</th>
                <th className="px-6 py-3 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-3 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {hosts.map((host) => (
                <tr key={host.id} className="hover:bg-[var(--muted)]/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium flex items-center gap-2">
                      <Server className="h-4 w-4 text-[var(--muted-foreground)]" />
                      {host.name || host.hostname || "Unnamed Host"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)]">
                      {host.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{host.ipAddress}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${host.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                      <span className={`text-xs font-medium ${host.status === 'online' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {host.status === 'online' ? 'Online' : 'Offline'}
                      </span>
                      <span className="text-[10px] text-[var(--muted-foreground)] ml-1">
                        ({host.lastSeen ? new Date(host.lastSeen).toLocaleTimeString() : "Never"})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => handleOpenEditModal(host)}
                      className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors rounded cursor-pointer"
                      title="Edit Host"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(host.id)}
                      className="p-1.5 text-[var(--muted-foreground)] hover:text-red-400 transition-colors rounded cursor-pointer"
                      title="Remove Host"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

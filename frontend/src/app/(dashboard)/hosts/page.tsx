"use client"

import { useState, useEffect } from "react"
import { Server, Plus, Trash2, Edit2, AlertTriangle, Search, RefreshCw, Layers, ChevronDown } from "lucide-react"
import { PageLoader } from "@/components/ui/page-loader"
import { Pagination } from "@/components/ui/pagination"
import { API_BASE_URL } from "@/lib/config"

type VmHost = {
  id: string
  name?: string
  hostname?: string
  category: string
  ipAddress: string
  status: "online" | "offline"
  lastSeen?: string
}

type Category = {
  id: string
  name: string
  description?: string
  color?: string
}

export default function VmHostsPage() {
  const [hosts, setHosts] = useState<VmHost[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories")
  const [searchQuery, setSearchQuery] = useState("")

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalElements, setTotalElements] = useState(0)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchHosts(currentPage, itemsPerPage)
  }, [currentPage, itemsPerPage])

  const fetchData = async () => {
    setIsLoading(true)
    await Promise.all([fetchHosts(currentPage, itemsPerPage), fetchCategories()])
    setIsLoading(false)
  }

  const fetchHosts = async (page: number = 1, size: number = 10) => {
    try {
      // API uses 0-based page indexing in Spring Boot
      const res = await fetch(`${API_BASE_URL}/api/hosts?page=${page - 1}&size=${size}`)
      if (res.ok) {
        const data = await res.json()
        if (data && Array.isArray(data.content)) {
          // Pageable response from Spring Data
          setHosts(data.content)
          setTotalElements(data.totalElements ?? data.content.length)
        } else if (Array.isArray(data)) {
          setHosts(data)
          setTotalElements(data.length)
        } else {
          setHosts([data])
          setTotalElements(1)
        }
      }
    } catch (err) {
      console.error("Error fetching hosts:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories`)
      if (res.ok) {
        const data = await res.json()
        setCategories(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error("Error fetching categories:", err)
    }
  }

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHost, setEditingHost] = useState<VmHost | null>(null)
  const [deletingHost, setDeletingHost] = useState<VmHost | null>(null)

  // Form State
  const [hostName, setHostName] = useState("")
  const [category, setCategory] = useState("Finance")
  const [ipAddress, setIpAddress] = useState("")
  const [status, setStatus] = useState<"online" | "offline">("offline")

  const handleOpenAddModal = () => {
    setEditingHost(null)
    setHostName("")
    setCategory(
      selectedCategory !== "All Categories"
        ? selectedCategory
        : (categories.length > 0 ? categories[0].name : "Finance")
    )
    setIpAddress("")
    setStatus("offline")
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (host: VmHost) => {
    setEditingHost(host)
    setHostName(host.name || host.hostname || "")
    setCategory(host.category || (categories.length > 0 ? categories[0].name : "Finance"))
    setIpAddress(host.ipAddress || "")
    setStatus(host.status || "offline")
    setIsModalOpen(true)
  }

  const handleQuickUpdateCategory = async (host: VmHost, newCat: string) => {
    if (!newCat || newCat === host.category) return
    const updated = { ...host, category: newCat }
    setHosts(hosts.map(h => h.id === host.id ? updated : h))

    try {
      const res = await fetch(`${API_BASE_URL}/api/hosts/${host.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostname: host.name || host.hostname,
          name: host.name || host.hostname,
          category: newCat,
          ipAddress: host.ipAddress
        })
      })
      if (res.ok) {
        const result = await res.json()
        setHosts(hosts.map(h => h.id === host.id ? result : h))
      }
    } catch (err) {
      console.error("Failed to update host category:", err)
    }
  }

  const handleSubmitHost = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingHost) {
      // Update Host via PUT /api/hosts/{id}
      const payload = {
        name: hostName,
        hostname: hostName,
        category,
        ipAddress: ipAddress || "Pending...",
        status,
        lastSeen: status === "online" ? new Date().toISOString() : editingHost.lastSeen
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/hosts/${editingHost.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        if (res.ok) {
          await fetchHosts(currentPage, itemsPerPage)
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
        status,
        lastSeen: status === "online" ? new Date().toISOString() : null
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/hosts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        if (res.ok) {
          await fetchHosts(currentPage, itemsPerPage)
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

  const handleDelete = async () => {
    if (!deletingHost) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/hosts/${deletingHost.id}`, { method: "DELETE" })
      if (res.ok) {
        setHosts(hosts.filter(h => h.id !== deletingHost.id))
        setDeletingHost(null)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getCategoryCount = (catName: string) => {
    if (!Array.isArray(hosts)) return 0
    if (catName === "All Categories") return hosts.length
    return hosts.filter(h => h.category === catName).length
  }

  const filteredHosts = Array.isArray(hosts) ? hosts.filter(host => {
    const hostCategory = host.category || "Unassigned"
    const matchCategory = selectedCategory === "All Categories" || hostCategory === selectedCategory
    
    const query = searchQuery.toLowerCase().trim()
    if (!query) return matchCategory

    const nameStr = (host.name || host.hostname || "").toLowerCase()
    const ipStr = (host.ipAddress || "").toLowerCase()
    const catStr = hostCategory.toLowerCase()
    const statusStr = (host.status || "offline").toLowerCase()
    const lastSeenStr = host.lastSeen ? new Date(host.lastSeen).toLocaleString().toLowerCase() : "never"

    const matchSearch = 
      nameStr.includes(query) || 
      ipStr.includes(query) || 
      catStr.includes(query) || 
      statusStr.includes(query) ||
      lastSeenStr.includes(query)

    return matchCategory && matchSearch
  }) : []

  const totalPages = Math.ceil((totalElements || filteredHosts.length) / itemsPerPage) || 1

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">VM Hosts</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Manage the Virtual Machines that execute your RPA processes.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchData}
            title="Refresh Data"
            className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)] rounded-md hover:bg-[var(--muted)]/50 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button 
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Host
          </button>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Category Filter Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-[180px]">
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                className="w-full appearance-none pl-9 pr-8 py-1.5 text-xs font-medium bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary)] cursor-pointer text-[var(--foreground)]"
              >
                <option value="All Categories">All Categories ({getCategoryCount("All Categories")})</option>
                {categories.map((cat) => (
                  <option key={cat.id || cat.name} value={cat.name}>
                    {cat.name} ({getCategoryCount(cat.name)})
                  </option>
                ))}
              </select>
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted-foreground)] pointer-events-none" />
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted-foreground)] pointer-events-none" />
            </div>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Search hostname, IP, category, status (online/offline)..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary)] placeholder:text-[var(--muted-foreground)]"
            />
          </div>
        </div>
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
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <option key={cat.id || cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))
                  ) : (
                    <option value="Finance">Finance</option>
                  )}
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

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Host Status</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value as "online" | "offline")}
                  className="w-full px-3 py-2 bg-[var(--muted)]/50 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer"
                >
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                </select>
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

      {/* Delete Confirmation Modal */}
      {deletingHost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-2xl w-full max-w-sm m-4 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold mb-2 tracking-tight text-red-500 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Delete VM Host
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-6 leading-relaxed">
              Are you sure you want to delete host <strong className="text-[var(--foreground)]">{deletingHost.name || deletingHost.hostname || "this host"}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setDeletingHost(null)} 
                className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors cursor-pointer shadow-sm"
              >
                Delete Host
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden">
        {isLoading ? (
          <PageLoader message="Loading VM Hosts..." />
        ) : filteredHosts.length === 0 ? (
          <div className="p-12 text-center text-[var(--muted-foreground)] text-sm">
            {hosts.length === 0 
              ? "No VM Hosts registered. Add a host to deploy processes."
              : `No VM Hosts found in ${selectedCategory !== "All Categories" ? selectedCategory : "search results"}.`}
          </div>
        ) : (
          <>
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
                {filteredHosts.map((host) => (
                  <tr key={host.id} className="hover:bg-[var(--muted)]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium flex items-center gap-2">
                        <Server className="h-4 w-4 text-[var(--muted-foreground)]" />
                        {host.name || host.hostname || "Unnamed Host"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const catObj = categories.find(c => c.name === host.category)
                        const catColor = catObj?.color || "#8b5cf6"
                        return (
                          <div className="relative inline-block">
                            <select
                              value={host.category || ""}
                              onChange={(e) => handleQuickUpdateCategory(host, e.target.value)}
                              className="appearance-none px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)] shadow-sm pr-6 transition-all"
                              style={{ 
                                backgroundColor: `${catColor}18`, 
                                color: catColor, 
                                borderColor: `${catColor}40` 
                              }}
                              title="Click to change category"
                            >
                              {categories.length > 0 ? (
                                categories.map((cat) => (
                                  <option key={cat.id || cat.name} value={cat.name} className="bg-[var(--card)] text-[var(--foreground)] text-xs font-sans capitalize">
                                    {cat.name}
                                  </option>
                                ))
                              ) : (
                                <option value={host.category}>{host.category}</option>
                              )}
                            </select>
                            <ChevronDown className="h-3 w-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" style={{ color: catColor }} />
                          </div>
                        )
                      })()}
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
                        onClick={() => setDeletingHost(host)}
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

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalElements || filteredHosts.length}
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



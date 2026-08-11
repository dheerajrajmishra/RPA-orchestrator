"use client"

import { useState, useEffect } from "react"
import { Plus, Copy, Trash2, CheckCircle2 } from "lucide-react"

type ApiKey = {
  id: string
  name: string
  keyPrefix?: string
  prefix?: string
  createdAt?: string
  created?: string
  rawKey?: string
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchKeys()
  }, [])

  const fetchKeys = () => {
    fetch("http://localhost:8080/api/keys")
      .then(res => res.json())
      .then(data => {
        setKeys(Array.isArray(data) ? data : [])
        setIsLoading(false)
      })
      .catch(err => {
        console.error("Error fetching API keys:", err)
        setKeys([])
        setIsLoading(false)
      })
  }

  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVm, setSelectedVm] = useState("VM-FIN-01")
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)

  const openModal = () => {
    setSelectedVm("VM-FIN-01")
    setGeneratedKey(null)
    setIsModalOpen(true)
  }

  const handleGenerate = async () => {
    try {
      const payload = { targetVm: selectedVm, name: `API Key (${selectedVm})` }
      const res = await fetch("http://localhost:8080/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        const data = await res.json()
        const newKeyObj = data.key || data
        setKeys(prev => Array.isArray(prev) ? [newKeyObj, ...prev] : [newKeyObj])
        setGeneratedKey(data.rawKey || data.fullKey || data.value || "rpa_" + Math.random().toString(36).substring(2, 15))
      } else {
        console.error("Failed to generate key:", res.status, res.statusText)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleCopyModal = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey)
      setCopiedId("modal")
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/keys/${id}`, { method: "DELETE" })
      if (res.ok) {
        setKeys(prev => Array.isArray(prev) ? prev.filter(k => k.id !== id) : [])
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleCopy = (id: string, textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Manage API keys used by RPA agents (Reporter API) to authenticate.</p>
        </div>
        <button 
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
        >
          <Plus className="h-4 w-4" /> Generate Key
        </button>
      </div>
      
      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-2xl w-full max-w-sm m-4 animate-in fade-in zoom-in-95 duration-200">
            {generatedKey ? (
              <>
                <h2 className="text-lg font-bold mb-4 tracking-tight text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" /> Key Generated
                </h2>
                <div className="space-y-4 mb-6">
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                    Please copy this API key and store it securely. For security reasons, <strong>it will not be shown again</strong>.
                  </p>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={generatedKey} 
                      className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-md text-sm font-mono focus:outline-none"
                    />
                    <button 
                      onClick={handleCopyModal}
                      className="p-2 bg-[var(--primary)] text-white rounded-md hover:opacity-90 transition-opacity flex-shrink-0 cursor-pointer"
                    >
                      {copiedId === "modal" ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-[var(--muted)] hover:bg-[var(--muted)]/80 border border-[var(--border)] text-[var(--foreground)] rounded-md text-sm font-medium transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold mb-4 tracking-tight">Generate API Key</h2>
                <div className="space-y-4 mb-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Select Target VM Host</label>
                    <select 
                      value={selectedVm} 
                      onChange={(e) => setSelectedVm(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--muted)]/50 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer"
                    >
                      <option value="VM-FIN-01">VM-FIN-01 (Finance)</option>
                      <option value="VM-HR-01">VM-HR-01 (HR)</option>
                      <option value="VM-PROC-01">VM-PROC-01 (Procurement)</option>
                      <option value="VM-IT-01">VM-IT-01 (IT Support)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleGenerate}
                    className="px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                  >
                    Generate
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-[var(--muted-foreground)] text-sm">
            Loading...
          </div>
        ) : !Array.isArray(keys) || keys.length === 0 ? (
          <div className="p-12 text-center text-[var(--muted-foreground)] text-sm">
            No API keys found. Generate one to get started.
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[var(--muted-foreground)] uppercase bg-[var(--muted)]/50 border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-3 font-semibold tracking-wider">Key Name</th>
                <th className="px-6 py-3 font-semibold tracking-wider">Prefix</th>
                <th className="px-6 py-3 font-semibold tracking-wider">Created</th>
                <th className="px-6 py-3 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {keys.map((key) => {
                const prefixVal = key.keyPrefix || key.prefix || "rpa_key_..."
                const createdVal = key.createdAt ? new Date(key.createdAt).toLocaleDateString() : key.created || "Just now"
                return (
                  <tr key={key.id} className="hover:bg-[var(--muted)]/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{key.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-[var(--primary)]">{prefixVal}***</td>
                    <td className="px-6 py-4 text-[var(--muted-foreground)]">{createdVal}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleCopy(key.id, prefixVal)}
                        className={`p-1.5 transition-colors rounded cursor-pointer ${copiedId === key.id ? "text-emerald-400" : "text-[var(--muted-foreground)] hover:text-[var(--primary)]"}`}
                        title="Copy Key Prefix"
                      >
                        {copiedId === key.id ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                      <button 
                        onClick={() => handleDelete(key.id)}
                        className="p-1.5 text-[var(--muted-foreground)] hover:text-red-400 transition-colors rounded cursor-pointer"
                        title="Delete Key"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

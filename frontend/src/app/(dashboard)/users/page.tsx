"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, CheckCircle2, Lock } from "lucide-react"

type Permission = {
  id: string
  name: string
  description: string
}

type PermissionGroup = {
  category: string
  permissions: Permission[]
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    category: "Processes",
    permissions: [
      { id: "proc:read", name: "View Processes", description: "Can view processes and execution history." },
      { id: "proc:write", name: "Manage Processes", description: "Can create, edit, or delete processes." },
      { id: "proc:exec", name: "Execute Processes", description: "Can manually trigger process runs." },
    ]
  },
  {
    category: "System & Infrastructure",
    permissions: [
      { id: "sys:hosts", name: "Manage VM Hosts", description: "Can add or remove RPA VM hosts." },
      { id: "sys:keys", name: "Manage API Keys", description: "Can generate and revoke API keys." },
      { id: "sys:alerts", name: "Manage Alerts", description: "Can configure alert rules." },
    ]
  },
  {
    category: "Administration",
    permissions: [
      { id: "admin:users", name: "Manage Users", description: "Can invite users and assign roles." },
      { id: "admin:roles", name: "Manage Roles", description: "Can create and modify RBAC roles." },
      { id: "admin:settings", name: "System Settings", description: "Can modify global retention and timezone settings." },
    ]
  }
]

type Role = {
  id: string
  name: string
  isSystem?: boolean
  permissions: string[]
}

type User = {
  id: string
  name: string
  email: string
  roleId: string
  status: "Active" | "Pending"
}

export default function UsersAndRolesPage() {
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users")
  
  const [roles, setRoles] = useState<Role[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8080/api/users").then(res => res.json()),
      fetch("http://localhost:8080/api/roles").then(res => res.json())
    ])
      .then(([usersData, rolesData]) => {
        setUsers(usersData)
        setRoles(rolesData)
        setIsLoading(false)
      })
      .catch(err => {
        console.error(err)
        setIsLoading(false)
      })
  }, [])
  
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)

  const [newUserName, setNewUserName] = useState("")
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserRole, setNewUserRole] = useState("r1")
  const [newRoleName, setNewRoleName] = useState("")
  
  const [selectedRoleId, setSelectedRoleId] = useState<string>("r1")
  const selectedRole = roles.find(r => r.id === selectedRoleId)

  const togglePermission = (permId: string) => {
    if (selectedRole?.isSystem) return // Can't edit system roles
    setRoles(roles.map(r => {
      if (r.id === selectedRoleId) {
        const hasPerm = r.permissions.includes(permId)
        return {
          ...r,
          permissions: hasPerm ? r.permissions.filter(p => p !== permId) : [...r.permissions, permId]
        }
      }
      return r
    }))
  }

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        name: newUserName,
        email: newUserEmail,
        roleId: newUserRole,
        status: "Pending"
      }
      const res = await fetch("http://localhost:8080/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        const newUser = await res.json()
        setUsers([...users, newUser])
        setIsUserModalOpen(false)
        setNewUserName("")
        setNewUserEmail("")
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        name: newRoleName,
        isSystem: false,
        permissions: []
      }
      const res = await fetch("http://localhost:8080/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        const newRole = await res.json()
        setRoles([...roles, newRole])
        setSelectedRoleId(newRole.id)
        setIsRoleModalOpen(false)
        setNewRoleName("")
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Access Management</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Manage users, roles, and granular permissions.</p>
        </div>
        <button 
          onClick={() => activeTab === "users" ? setIsUserModalOpen(true) : setIsRoleModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> {activeTab === "users" ? "Invite User" : "Create Role"}
        </button>
      </div>

      {/* Invite User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-2xl w-full max-w-md m-4 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold mb-4 tracking-tight">Invite New User</h2>
            <form onSubmit={handleInviteUser} className="space-y-4 mb-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Name</label>
                <input type="text" required value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full px-3 py-2 bg-[var(--muted)]/50 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Email</label>
                <input type="email" required value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="w-full px-3 py-2 bg-[var(--muted)]/50 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Assign Role</label>
                <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className="w-full px-3 py-2 bg-[var(--muted)]/50 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            </form>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Cancel</button>
              <button onClick={handleInviteUser} className="px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity">Send Invite</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-2xl w-full max-w-sm m-4 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold mb-4 tracking-tight">Create Custom Role</h2>
            <form onSubmit={handleCreateRole} className="space-y-4 mb-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Role Name</label>
                <input type="text" required value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="e.g. Audit Reviewer" className="w-full px-3 py-2 bg-[var(--muted)]/50 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
              </div>
            </form>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsRoleModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Cancel</button>
              <button onClick={handleCreateRole} className="px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity">Create Role</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[var(--border)]">
        <button 
          onClick={() => setActiveTab("users")}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === "users" ? "border-[var(--primary)] text-[var(--foreground)]" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
        >
          Users
        </button>
        <button 
          onClick={() => setActiveTab("roles")}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === "roles" ? "border-[var(--primary)] text-[var(--foreground)]" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
        >
          Roles & Permissions
        </button>
      </div>
      
      {activeTab === "users" && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden h-fit">
          {isLoading ? (
            <div className="p-12 text-center text-[var(--muted-foreground)] text-sm">Loading...</div>
          ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[var(--muted-foreground)] uppercase bg-[var(--muted)]/50 border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-3 font-semibold tracking-wider">User</th>
                <th className="px-6 py-3 font-semibold tracking-wider">Role</th>
                <th className="px-6 py-3 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-3 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {users.map(u => {
                const role = roles.find(r => r.id === u.roleId)
                return (
                  <tr key={u.id} className="hover:bg-[var(--muted)]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider bg-[var(--muted)] border border-[var(--border)] rounded-full">
                        {role?.name || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium ${u.status === "Active" ? "text-emerald-400" : "text-amber-400"}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors rounded"><Edit2 className="h-4 w-4" /></button>
                      <button className="p-1.5 text-[var(--muted-foreground)] hover:text-red-400 transition-colors rounded"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          )}
        </div>
      )}

      {activeTab === "roles" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-1 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden flex flex-col h-fit">
            <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--muted)]/30">
              <h3 className="font-semibold text-sm">Defined Roles</h3>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {roles.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoleId(r.id)}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${selectedRoleId === r.id ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "hover:bg-[var(--muted)]/30 text-[var(--foreground)]"}`}
                >
                  <span className="font-medium">{r.name}</span>
                  {r.isSystem && (
                    <span title="System Role">
                      <Lock className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-3 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm flex flex-col h-fit">
            <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--muted)]/30 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{selectedRole?.name} Permissions</h3>
                {selectedRole?.isSystem && <p className="text-xs text-amber-500 mt-1">This is a system-managed role and cannot be modified.</p>}
              </div>
            </div>
            <div className="p-6 space-y-8">
              {PERMISSION_GROUPS.map(group => (
                <div key={group.category}>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-4">{group.category}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {group.permissions.map(perm => {
                      const hasPerm = selectedRole?.permissions.includes(perm.id)
                      return (
                        <div 
                          key={perm.id} 
                          onClick={() => togglePermission(perm.id)}
                          className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${selectedRole?.isSystem ? "opacity-75 cursor-not-allowed" : "cursor-pointer hover:border-[var(--primary)]/50"} ${hasPerm ? "border-[var(--primary)]/50 bg-[var(--primary)]/5" : "border-[var(--border)] bg-[var(--muted)]/20"}`}
                        >
                          <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${hasPerm ? "bg-[var(--primary)] border-[var(--primary)] text-white" : "border-[var(--muted-foreground)]"}`}>
                            {hasPerm && <CheckCircle2 className="h-3 w-3" />}
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{perm.name}</div>
                            <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{perm.description}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

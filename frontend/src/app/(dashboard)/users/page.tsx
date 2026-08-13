"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, CheckCircle2, Lock, Save, AlertTriangle } from "lucide-react"
import { PageLoader } from "@/components/ui/page-loader"
import { Pagination } from "@/components/ui/pagination"
import { API_BASE_URL } from "@/lib/config"

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
  name?: string
  username?: string
  displayName?: string
  email: string
  roleId?: string
  role?: { id: string; name: string }
  status?: "Active" | "Pending" | "Inactive"
  isActive?: boolean
}

export default function UsersAndRolesPage() {
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users")
  
  const [roles, setRoles] = useState<Role[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingPermissions, setIsSavingPermissions] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalUsersCount, setTotalUsersCount] = useState(0)

  useEffect(() => {
    fetchRoles()
  }, [])

  useEffect(() => {
    fetchUsers(currentPage, itemsPerPage)
  }, [currentPage, itemsPerPage])

  const fetchUsers = (page: number = 1, size: number = 10) => {
    fetch(`${API_BASE_URL}/api/users?page=${page - 1}&size=${size}`)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.content)) {
          setUsers(data.content)
          setTotalUsersCount(data.totalElements ?? data.content.length)
        } else if (Array.isArray(data)) {
          setUsers(data)
          setTotalUsersCount(data.length)
        } else {
          setUsers([data])
          setTotalUsersCount(1)
        }
        setIsLoading(false)
      })
      .catch(err => {
        console.error(err)
        setUsers([])
        setIsLoading(false)
      })
  }

  const fetchRoles = () => {
    fetch(`${API_BASE_URL}/api/roles`)
      .then(res => res.json())
      .then(rolesData => {
        const roleArr = Array.isArray(rolesData) ? rolesData : []
        setRoles(roleArr)
        if (roleArr.length > 0 && !selectedRoleId) {
          setSelectedRoleId(roleArr[0].id)
        }
      })
      .catch(err => console.error(err))
  }

  const fetchData = () => {
    fetchUsers(currentPage, itemsPerPage)
    fetchRoles()
  }
  
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)

  const [newUserName, setNewUserName] = useState("")
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserRole, setNewUserRole] = useState("")
  const [newUserPassword, setNewUserPassword] = useState("Welcome@123")
  const [newUserStatus, setNewUserStatus] = useState<"Active" | "Pending" | "Inactive">("Active")
  const [newRoleName, setNewRoleName] = useState("")
  
  const [selectedRoleId, setSelectedRoleId] = useState<string>("")
  const selectedRole = roles.find(r => r.id === selectedRoleId) || roles[0]

  const handleOpenAddUserModal = () => {
    setEditingUser(null)
    setNewUserName("")
    setNewUserEmail("")
    setNewUserPassword("Welcome@123")
    setNewUserRole(roles[0]?.id || "")
    setNewUserStatus("Active")
    setIsUserModalOpen(true)
  }

  const handleOpenEditUserModal = (u: User) => {
    setEditingUser(u)
    setNewUserName(u.displayName || u.name || u.username || "")
    setNewUserEmail(u.email || "")
    setNewUserPassword("") // Blank unless changing
    const currentRoleId = u.roleId || (u.role ? u.role.id : roles[0]?.id || "")
    setNewUserRole(currentRoleId)
    setNewUserStatus(u.status || (u.isActive === false ? "Inactive" : "Active"))
    setIsUserModalOpen(true)
  }

  const togglePermission = (permId: string) => {
    if (selectedRole?.isSystem) return
    setRoles(roles.map(r => {
      if (r.id === (selectedRole?.id || selectedRoleId)) {
        const currentPerms = r.permissions || []
        const hasPerm = currentPerms.includes(permId)
        return {
          ...r,
          permissions: hasPerm ? currentPerms.filter(p => p !== permId) : [...currentPerms, permId]
        }
      }
      return r
    }))
  }

  const handleSavePermissions = async () => {
    if (!selectedRole || selectedRole.isSystem) return
    setIsSavingPermissions(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/roles/${selectedRole.id}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedRole.permissions || [])
      })
      if (res.ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSavingPermissions(false)
    }
  }

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingUser) {
      // Edit User via PUT /api/users/{id}
      try {
        const payload: Record<string, any> = {
          name: newUserName,
          email: newUserEmail,
          roleId: newUserRole,
          status: newUserStatus
        }
        if (newUserPassword && newUserPassword.trim() !== "") {
          payload.password = newUserPassword
        }
        const res = await fetch(`${API_BASE_URL}/api/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        if (res.ok) {
          fetchData()
          setIsUserModalOpen(false)
          setEditingUser(null)
        }
      } catch (err) {
        console.error(err)
      }
    } else {
      // Add User via POST /api/users
      try {
        const payload = {
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          roleId: newUserRole || (roles[0] ? roles[0].id : null),
          status: newUserStatus
        }
        const res = await fetch(`${API_BASE_URL}/api/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        if (res.ok) {
          fetchData()
          setIsUserModalOpen(false)
        }
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleDeleteUser = async () => {
    if (!deletingUser) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${deletingUser.id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        setUsers(users.filter(u => u.id !== deletingUser.id))
        setDeletingUser(null)
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
      const res = await fetch(`${API_BASE_URL}/api/roles`, {
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

  const totalPages = Math.ceil((totalUsersCount || users.length) / itemsPerPage) || 1

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Access Management</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Manage users, roles, and granular permissions.</p>
        </div>
        <button 
          onClick={() => activeTab === "users" ? handleOpenAddUserModal() : setIsRoleModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
        >
          <Plus className="h-4 w-4" /> {activeTab === "users" ? "Invite User" : "Create Role"}
        </button>
      </div>

      {/* Add / Edit User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-2xl w-full max-w-md m-4 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold mb-4 tracking-tight">
              {editingUser ? "Edit User Details" : "Invite New User"}
            </h2>
            <form onSubmit={handleSaveUser} className="space-y-4 mb-6">
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
                <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className="w-full px-3 py-2 bg-[var(--muted)]/50 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer">
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                  {editingUser ? "New Password (Optional)" : "Initial Password"}
                </label>
                <input type="password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} placeholder={editingUser ? "Leave blank to keep unchanged" : "Welcome@123"} className="w-full px-3 py-2 bg-[var(--muted)]/50 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
              </div>
              {editingUser && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Account Status</label>
                  <select value={newUserStatus} onChange={e => setNewUserStatus(e.target.value as any)} className="w-full px-3 py-2 bg-[var(--muted)]/50 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              )}
            </form>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleSaveUser} className="px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer shadow-sm">
                {editingUser ? "Save Changes" : "Send Invite"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-2xl w-full max-w-sm m-4 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold mb-2 tracking-tight text-red-500 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Delete User Account
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-6 leading-relaxed">
              Are you sure you want to remove <strong className="text-[var(--foreground)]">{deletingUser.displayName || deletingUser.name || deletingUser.username}</strong> (<span className="text-[var(--primary)]">{deletingUser.email}</span>)? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDeletingUser(null)} className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleDeleteUser} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors cursor-pointer shadow-sm">Delete User</button>
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
              <button type="button" onClick={() => setIsRoleModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleCreateRole} className="px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer shadow-sm">Create Role</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[var(--border)]">
        <button 
          onClick={() => setActiveTab("users")}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 cursor-pointer ${activeTab === "users" ? "border-[var(--primary)] text-[var(--foreground)]" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
        >
          Users
        </button>
        <button 
          onClick={() => setActiveTab("roles")}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 cursor-pointer ${activeTab === "roles" ? "border-[var(--primary)] text-[var(--foreground)]" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
        >
          Roles & Permissions
        </button>
      </div>
      
      {activeTab === "users" && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden h-fit">
          {isLoading ? (
            <PageLoader message="Loading access management data..." />
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-[var(--muted-foreground)] text-sm">No users registered. Click Invite User to add team members.</div>
          ) : (
          <>
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
                  const userRoleId = u.roleId || (u.role ? u.role.id : null)
                  const roleObj = roles.find(r => r.id === userRoleId)
                  const roleName = roleObj ? roleObj.name : (u.role ? u.role.name : "Administrator")
                  const displayName = u.displayName || u.name || u.username || "User"
                  const userStatus = u.status || (u.isActive === false ? "Inactive" : "Active")
                  return (
                    <tr key={u.id} className="hover:bg-[var(--muted)]/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium">{displayName}</div>
                        <div className="text-xs text-[var(--muted-foreground)]">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider bg-[var(--muted)] border border-[var(--border)] rounded-full">
                          {roleName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium ${userStatus === "Active" ? "text-emerald-400" : userStatus === "Pending" ? "text-amber-400" : "text-red-400"}`}>
                          {userStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => handleOpenEditUserModal(u)} className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors rounded cursor-pointer" title="Edit User"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => setDeletingUser(u)} className="p-1.5 text-[var(--muted-foreground)] hover:text-red-400 transition-colors rounded cursor-pointer" title="Remove User"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalUsersCount || users.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </>
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
                  onClick={() => { setSelectedRoleId(r.id); setSaveSuccess(false); }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between cursor-pointer ${selectedRole?.id === r.id ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "hover:bg-[var(--muted)]/30 text-[var(--foreground)]"}`}
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
                <h3 className="font-semibold text-lg">{selectedRole?.name || "Role"} Permissions</h3>
                {selectedRole?.isSystem ? (
                  <p className="text-xs text-amber-500 mt-1">This is a system-managed role and cannot be modified.</p>
                ) : (
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Toggle granular permissions and click Save Changes below.</p>
                )}
              </div>
              
              {!selectedRole?.isSystem && (
                <div className="flex items-center gap-3">
                  {saveSuccess && (
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 animate-in fade-in duration-200">
                      <CheckCircle2 className="h-4 w-4" /> Saved!
                    </span>
                  )}
                  <button 
                    onClick={handleSavePermissions}
                    disabled={isSavingPermissions}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {isSavingPermissions ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-6 space-y-8">
              {PERMISSION_GROUPS.map(group => (
                <div key={group.category}>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-4">{group.category}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {group.permissions.map(perm => {
                      const currentPerms = selectedRole?.permissions || []
                      const hasPerm = currentPerms.includes(perm.id)
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

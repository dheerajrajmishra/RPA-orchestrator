"use client"

import { useState, useEffect } from "react"
import { Layers, Plus, Trash2, Edit2, AlertTriangle } from "lucide-react"
import { PageLoader } from "@/components/ui/page-loader"
import { Pagination } from "@/components/ui/pagination"
import { API_BASE_URL } from "@/lib/config"

type Category = {
  id: string
  name: string
  description?: string
  color?: string
}

const PRESET_COLORS = [
  { label: "Violet", hex: "#8b5cf6" },
  { label: "Pink", hex: "#ec4899" },
  { label: "Orange", hex: "#f97316" },
  { label: "Cyan", hex: "#06b6d4" },
  { label: "Emerald", hex: "#10b981" },
  { label: "Blue", hex: "#3b82f6" },
  { label: "Amber", hex: "#f59e0b" },
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalElements, setTotalElements] = useState(0)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState("#8b5cf6")

  useEffect(() => {
    fetchCategories(currentPage, itemsPerPage)
  }, [currentPage, itemsPerPage])

  const fetchCategories = (page: number = 1, size: number = 10) => {
    fetch(`${API_BASE_URL}/api/categories?page=${page - 1}&size=${size}`)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.content)) {
          setCategories(data.content)
          setTotalElements(data.totalElements ?? data.content.length)
        } else if (Array.isArray(data)) {
          setCategories(data)
          setTotalElements(data.length)
        } else {
          setCategories([data])
          setTotalElements(1)
        }
        setIsLoading(false)
      })
      .catch(err => {
        console.error(err)
        setCategories([])
        setIsLoading(false)
      })
  }

  const handleOpenAddModal = () => {
    setEditingCategory(null)
    setName("")
    setDescription("")
    setColor("#8b5cf6")
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat)
    setName(cat.name)
    setDescription(cat.description || "")
    setColor(cat.color || "#8b5cf6")
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingCategory) {
      // PUT /api/categories/{id}
      try {
        const payload = { name, description, color }
        const res = await fetch(`${API_BASE_URL}/api/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        if (res.ok) {
          fetchCategories()
          setIsModalOpen(false)
        }
      } catch (err) {
        console.error(err)
      }
    } else {
      // POST /api/categories
      try {
        const payload = { name, description, color }
        const res = await fetch(`${API_BASE_URL}/api/categories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        if (res.ok) {
          fetchCategories()
          setIsModalOpen(false)
        }
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleDelete = async () => {
    if (!deletingCategory) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/${deletingCategory.id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        setCategories(categories.filter(c => c.id !== deletingCategory.id))
        setDeletingCategory(null)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const totalPages = Math.ceil((totalElements || categories.length) / itemsPerPage) || 1

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Category Management</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Organize and group your RPA processes into business categories.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-2xl w-full max-w-md m-4 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold mb-4 tracking-tight">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Category Name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Compliance & Tax" className="w-full px-3 py-2 bg-[var(--muted)]/50 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the business domain..." className="w-full min-h-[80px] px-3 py-2 bg-[var(--muted)]/50 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Badge Color</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setColor(c.hex)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${color === c.hex ? "scale-110 border-[var(--foreground)]" : "border-transparent hover:scale-105"}`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    />
                  ))}
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-7 h-7 rounded border border-[var(--border)] cursor-pointer bg-transparent" />
                </div>
              </div>
            </form>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer shadow-sm">
                {editingCategory ? "Save Changes" : "Create Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-2xl w-full max-w-sm m-4 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold mb-2 tracking-tight text-red-500 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Delete Category
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-6 leading-relaxed">
              Are you sure you want to delete category <strong className="text-[var(--foreground)]">{deletingCategory.name}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDeletingCategory(null)} className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors cursor-pointer shadow-sm">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden">
        {isLoading ? (
          <PageLoader message="Loading process categories..." />
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-[var(--muted-foreground)] text-sm">No categories configured. Click Add Category to create your first business domain.</div>
        ) : (
          <>
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[var(--muted-foreground)] uppercase bg-[var(--muted)]/50 border-b border-[var(--border)]">
                <tr>
                  <th className="px-6 py-3 font-semibold tracking-wider">Category</th>
                  <th className="px-6 py-3 font-semibold tracking-wider">Description</th>
                  <th className="px-6 py-3 font-semibold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {categories.map(c => (
                  <tr key={c.id} className="hover:bg-[var(--muted)]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.color || "#8b5cf6" }} />
                        <span className="font-semibold">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-[var(--muted-foreground)]">
                      {c.description || "No description provided."}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleOpenEditModal(c)} className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors rounded cursor-pointer" title="Edit Category"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => setDeletingCategory(c)} className="p-1.5 text-[var(--muted-foreground)] hover:text-red-400 transition-colors rounded cursor-pointer" title="Delete Category"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalElements || categories.length}
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

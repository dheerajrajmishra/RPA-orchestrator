"use client"

import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type PaginationProps = {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (itemsPerPage: number) => void
  pageSizeOptions?: number[]
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = [5, 10, 20, 50]
}: PaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const maxVisiblePages = 5
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  const pages = []
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  if (totalItems === 0) return null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-[var(--border)] bg-[var(--card)] text-xs text-[var(--muted-foreground)]">
      {/* Items count & Per Page Selector */}
      <div className="flex items-center gap-4">
        <span>
          Showing <strong className="text-[var(--foreground)]">{startItem}</strong> to{" "}
          <strong className="text-[var(--foreground)]">{endItem}</strong> of{" "}
          <strong className="text-[var(--foreground)]">{totalItems}</strong> entries
        </span>

        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span>Per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value))
                onPageChange(1)
              }}
              className="px-2 py-1 bg-[var(--muted)]/50 border border-[var(--border)] rounded text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] cursor-pointer"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Page Navigation Buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium text-[var(--foreground)]"
          title="Previous Page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Prev</span>
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                currentPage === 1
                  ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                  : "border-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)]"
              }`}
            >
              1
            </button>
            {startPage > 2 && <span className="px-1 text-[var(--muted-foreground)]">...</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
              currentPage === p
                ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                : "border-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)]"
            }`}
          >
            {p}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-1 text-[var(--muted-foreground)]">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                currentPage === totalPages
                  ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                  : "border-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)]"
              }`}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium text-[var(--foreground)]"
          title="Next Page"
        >
          <span>Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

import { create } from 'zustand'

export type ProcessDetail = {
  status: string
  trigger: string
  started: string
  duration: string
  records: string
  host: string
  outputSummary: string
  steps: any[]
  logs: any[]
}

export type Process = {
  id: string
  name: string
  slug: string
  badge: string | null
  schedule: string
  category: string
  host: string
  status: string
  lastRun: string
  duration: string
  last5: string[]
  runs: any[]
  detail: ProcessDetail
}

const INITIAL_PROCESSES: Process[] = [
  {
    id: "1",
    name: "Account Payable Automation",
    slug: "ap-automation",
    badge: "critical",
    schedule: "Weekdays 09:00 KST",
    category: "Finance",
    host: "VM-FIN-01",
    status: "success",
    lastRun: "Aug 11, 09:00",
    duration: "15m 0s",
    last5: ["success", "success", "failed"],
    runs: [
      { label: "Aug 11, 09:00", active: true },
      { label: "Aug 12, 08:00", active: false },
      { label: "Aug 9, 08:00", active: false },
    ],
    detail: {
      status: "success",
      trigger: "scheduled",
      started: "Aug 11, 09:00",
      duration: "15m 0s",
      records: "47 processed, 2 failed",
      host: "VM-FIN-01",
      outputSummary: "Invoices posted: 45   Total amount: 284,500",
      steps: [
        { name: "download_invoices", duration: "3m 1s", recordsIn: 0, recordsOut: 47, status: "success" },
        { name: "validate_and_transform", duration: "4m 12s", recordsIn: 47, recordsOut: 45, status: "success" },
        { name: "post_to_finance_db", duration: "4m 45s", recordsIn: 45, recordsOut: 45, status: "success" },
        { name: "mark_portal_status", duration: "3m 3s", recordsIn: 45, recordsOut: 45, status: "success" },
      ],
      logs: [
        { level: "INFO", time: "09:00:01", msg: "Run started: run-a1b2c3" },
        { level: "INFO", time: "09:00:02", msg: "Step started: download_invoices" },
        { level: "INFO", time: "09:03:04", msg: "Downloaded 47 invoices from portal" },
        { level: "INFO", time: "09:03:05", msg: "Step completed: download_invoices" },
        { level: "INFO", time: "09:03:06", msg: "Step started: validate_and_transform" },
        { level: "WARN", time: "09:07:18", msg: "2 invoices failed schema validation — skipped" },
        { level: "INFO", time: "09:07:19", msg: "Step completed: validate_and_transform — valid: 45, invalid: 2" },
      ],
    }
  },
  {
    id: "2",
    name: "HR Payroll Sync",
    slug: "hr-payroll-sync",
    badge: null,
    schedule: "Daily 06:00 KST",
    category: "HR",
    host: "VM-HR-01",
    status: "success",
    lastRun: "Aug 11, 06:00",
    duration: "3m 22s",
    last5: ["success", "success", "success"],
    runs: [
      { label: "Aug 11, 06:00", active: true },
      { label: "Aug 10, 06:00", active: false },
    ],
    detail: {
      status: "success",
      trigger: "scheduled",
      started: "Aug 11, 06:00",
      duration: "3m 22s",
      records: "312 processed, 0 failed",
      host: "VM-HR-01",
      outputSummary: "Employees synced: 312",
      steps: [
        { name: "fetch_payroll_data", duration: "1m 10s", recordsIn: 0, recordsOut: 312, status: "success" },
        { name: "sync_to_hrms", duration: "2m 12s", recordsIn: 312, recordsOut: 312, status: "success" },
      ],
      logs: [
        { level: "INFO", time: "06:00:01", msg: "Run started" },
        { level: "INFO", time: "06:01:12", msg: "Fetched 312 payroll records" },
        { level: "INFO", time: "06:03:23", msg: "Sync completed successfully" },
      ],
    }
  },
  {
    id: "3",
    name: "Vendor Invoice Crawler",
    slug: "vendor-invoice-crawler",
    badge: null,
    schedule: "Hourly",
    category: "Procurement",
    host: "VM-PROC-01",
    status: "failed",
    lastRun: "Aug 11, 10:00",
    duration: "1m 02s",
    last5: ["failed", "success", "success"],
    runs: [
      { label: "Aug 11, 10:00", active: true },
      { label: "Aug 11, 09:00", active: false },
    ],
    detail: {
      status: "failed",
      trigger: "scheduled",
      started: "Aug 11, 10:00",
      duration: "1m 02s",
      records: "0 processed, 0 failed",
      host: "VM-PROC-01",
      outputSummary: "Error: Connection refused — vendor portal unreachable",
      steps: [
        { name: "connect_vendor_portal", duration: "1m 02s", recordsIn: 0, recordsOut: 0, status: "failed" },
      ],
      logs: [
        { level: "INFO", time: "10:00:01", msg: "Run started" },
        { level: "ERROR", time: "10:01:02", msg: "Connection refused: vendor-portal.corp:443 — ETIMEDOUT" },
      ],
    }
  },
]

type ProcessStore = {
  processes: Process[]
  addProcess: (process: Process) => void
}

export const useProcessStore = create<ProcessStore>((set) => ({
  processes: INITIAL_PROCESSES,
  addProcess: (process) => set((state) => ({ processes: [...state.processes, process] })),
}))

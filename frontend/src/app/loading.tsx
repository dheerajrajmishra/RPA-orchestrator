import { PageLoader } from "@/components/ui/page-loader"

export default function RootLoading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--background)]">
      <PageLoader message="Loading RPA Orchestrator..." />
    </div>
  )
}

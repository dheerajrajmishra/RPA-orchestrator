import { PageLoader } from "@/components/ui/page-loader"

export default function Loading() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <PageLoader message="Loading dashboard section..." />
    </div>
  )
}

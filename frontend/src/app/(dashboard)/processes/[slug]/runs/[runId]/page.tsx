export default function RunDetailPage({ params }: { params: { slug: string, runId: string } }) {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Run Details</h2>
        <div className="flex gap-2 items-center text-muted-foreground mt-2 font-mono text-sm">
          <span>Process: <a href={`/processes/${params.slug}`} className="text-primary hover:underline">{params.slug}</a></span>
          <span>•</span>
          <span>Run ID: {params.runId}</span>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow md:col-span-1">
          <div className="p-6 space-y-4">
            <h3 className="font-bold border-b pb-2">Execution Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium text-green-500">Success</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trigger</span>
                <span className="font-medium">Scheduled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Started At</span>
                <span className="font-medium">2026-08-11 08:00:01</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed At</span>
                <span className="font-medium">2026-08-11 08:00:43</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">42.1s</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Records Processed</span>
                <span className="font-medium">47</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow md:col-span-2">
          <div className="p-6">
            <h3 className="font-bold border-b pb-2 mb-4">Step Timeline (Sub-processes)</h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-green-500 text-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16"><path d="M12.9 3.3a1 1 0 0 0-1.4 0L6 8.8l-2.5-2.5a1 1 0 0 0-1.4 1.4l3.2 3.2a1 1 0 0 0 1.4 0l6.2-6.2a1 1 0 0 0 0-1.4z"></path></svg>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border bg-card shadow">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold">download_invoices</div>
                    <time className="font-mono text-xs text-muted-foreground">08:00:02</time>
                  </div>
                  <div className="text-sm text-muted-foreground flex justify-between">
                    <span>Duration: 1.1s</span>
                    <span>Out: 47</span>
                  </div>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-green-500 text-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16"><path d="M12.9 3.3a1 1 0 0 0-1.4 0L6 8.8l-2.5-2.5a1 1 0 0 0-1.4 1.4l3.2 3.2a1 1 0 0 0 1.4 0l6.2-6.2a1 1 0 0 0 0-1.4z"></path></svg>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border bg-card shadow">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold">validate_and_transform</div>
                    <time className="font-mono text-xs text-muted-foreground">08:00:15</time>
                  </div>
                  <div className="text-sm text-muted-foreground flex justify-between">
                    <span>Duration: 13s</span>
                    <span>Valid: 45, Invalid: 2</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      
      <div className="rounded-xl border bg-card text-card-foreground shadow mt-6">
        <div className="p-6">
          <h3 className="font-bold border-b pb-2 mb-4">Run Logs</h3>
          <div className="bg-black/90 p-4 rounded text-green-400 font-mono text-sm overflow-x-auto">
            <div>[08:00:01] INFO  - Run started: 550e8400</div>
            <div>[08:00:02] INFO  - Step started: download_invoices</div>
            <div>[08:00:03] INFO  - Downloaded 47 invoices</div>
            <div>[08:00:03] INFO  - Step completed: download_invoices</div>
            <div>[08:00:15] INFO  - Step started: validate_and_transform</div>
            <div>[08:00:28] WARN  - 2 invoices failed validation constraints</div>
            <div>[08:00:28] INFO  - Valid: 45, Invalid: 2</div>
            <div>[08:00:28] INFO  - Step completed: validate_and_transform</div>
          </div>
        </div>
      </div>

    </div>
  )
}

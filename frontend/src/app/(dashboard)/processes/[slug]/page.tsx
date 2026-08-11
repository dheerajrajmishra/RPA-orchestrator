export default function ProcessDetailPage({ params }: { params: { slug: string } }) {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Process: {params.slug}</h2>
          <p className="text-muted-foreground">Detailed run history and statistics for this process.</p>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex items-center rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500 ring-1 ring-inset ring-green-500/20">Active</span>
          <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-500 ring-1 ring-inset ring-blue-500/20">Finance</span>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Runs</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">142</div>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Success Rate</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold text-green-500">98.5%</div>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Avg Duration</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">45s</div>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Target Host</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-lg font-bold">VM-FIN-01</div>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold tracking-tight mt-8">Recent Runs</h3>
      <div className="rounded-md border bg-card text-card-foreground shadow">
        <table className="w-full text-sm text-left">
          <thead className="border-b bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Run ID</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Started At</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Records</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/50">
              <td className="px-4 py-3 font-mono text-xs">550e8400...</td>
              <td className="px-4 py-3"><span className="text-green-500">Success</span></td>
              <td className="px-4 py-3">2026-08-11 08:00:01</td>
              <td className="px-4 py-3">42s</td>
              <td className="px-4 py-3">47</td>
              <td className="px-4 py-3 text-right">
                <a href={`/processes/${params.slug}/runs/550e8400`} className="text-primary hover:underline">View Details</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

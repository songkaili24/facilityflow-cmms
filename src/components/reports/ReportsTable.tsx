const TRADE_REPORTS = [
  { trade: "HVAC", wo: 118, sla: 92.4, cost: "$48,200", top: "Chiller #2 high head pressure" },
  { trade: "Electrical", wo: 86, sla: 95.1, cost: "$31,750", top: "Parking deck lighting drivers" },
  { trade: "Plumbing", wo: 74, sla: 96.2, cost: "$22,980", top: "DHW booster seal replacement" },
  { trade: "Structural", wo: 41, sla: 97.8, cost: "$64,400", top: "Dock leveler apron spalling" },
  {
    trade: "Security",
    wo: 33,
    sla: 98.5,
    cost: "$18,120",
    top: "Lobby camera switch ports",
  },
  { trade: "Cleaning", wo: 52, sla: 99.0, cost: "$9,400", top: "Post-renovation detail cleans" },
  { trade: "General", wo: 33, sla: 90.8, cost: "$12,650", top: "Door hardware adjustments" },
];

export function ReportsTable() {
  return (
    <section aria-label="Cost and compliance by trade">
      <h2 className="mb-3 font-heading text-xl font-bold">By trade — rolling 90 days</h2>
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <caption className="sr-only">
            Work order volume, SLA compliance, and cost by trade for the last 90 days
          </caption>
          <thead>
            <tr className="border-b border-border bg-muted/60 text-xs font-bold uppercase tracking-widest text-charcoal-500">
              <th scope="col" className="px-4 py-3">
                Trade
              </th>
              <th scope="col" className="px-4 py-3">
                Work orders
              </th>
              <th scope="col" className="px-4 py-3">
                SLA %
              </th>
              <th scope="col" className="px-4 py-3">
                Total cost
              </th>
              <th scope="col" className="px-4 py-3">
                Top issue
              </th>
            </tr>
          </thead>
          <tbody>
            {TRADE_REPORTS.map((row) => (
              <tr
                key={row.trade}
                className="border-b border-border last:border-b-0 hover:bg-muted/40"
              >
                <th scope="row" className="px-4 py-3 font-semibold text-charcoal-800">
                  {row.trade}
                </th>
                <td className="px-4 py-3 tabular-nums">{row.wo}</td>
                <td className="px-4 py-3 tabular-nums">
                  <span
                    className={
                      row.sla >= 95
                        ? "font-bold text-success"
                        : row.sla >= 92
                          ? "font-bold text-warning-foreground"
                          : "font-bold text-danger"
                    }
                  >
                    {row.sla.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3 tabular-nums">{row.cost}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.top}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

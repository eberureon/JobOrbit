import { useQuery } from "@tanstack/react-query";
import type { Stats, Application, ApplicationStatus } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatusBadge, statusColor } from "@/components/StatusBadge";
import { ArrowUpRight, Briefcase, Calendar, Target } from "lucide-react";

const STATUS_ORDER: ApplicationStatus[] = [
  "Applied",
  "Interview",
  "Offer",
  "Accepted",
  "Rejected",
  "Withdrawn",
];

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  testId,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  testId: string;
}) {
  return (
    <Card className="card-hairline relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {label}
          </div>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div
          className="mt-3 font-mono-num text-3xl font-semibold text-foreground"
          data-testid={testId}
        >
          {value}
        </div>
        {hint && (
          <div className="mt-1 text-xs text-muted-foreground font-mono-num">
            {hint}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FunnelRow({
  label,
  count,
  total,
  color,
  testId,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
  testId: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div data-testid={testId} className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono-num text-foreground">
          {count}
          <span className="text-muted-foreground ml-2">{pct}%</span>
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });
  const { data: apps } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const recent = (apps ?? []).slice(0, 5);

  const pieData = stats
    ? STATUS_ORDER.filter((s) => stats.statusBreakdown[s] > 0).map((s) => ({
        name: s,
        value: stats.statusBreakdown[s],
        color: statusColor(s),
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border border-card-border bg-card card-hairline">
        <div className="absolute inset-0 bg-dot-grid opacity-60 pointer-events-none" />
        <div className="relative px-6 py-7">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="live-dot" />
            <span className="font-mono-num">live</span>
            <span>· dashboard</span>
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            Job Application Tracker
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your private, self-hosted pipeline. All data stays on your machine.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Applications"
          value={isLoading ? "—" : stats?.total ?? 0}
          icon={Briefcase}
          testId="stat-total"
        />
        <StatCard
          label="Last 7 Days"
          value={isLoading ? "—" : stats?.last7Days ?? 0}
          hint="rolling window"
          icon={Calendar}
          testId="stat-last-7"
        />
        <StatCard
          label="Last 30 Days"
          value={isLoading ? "—" : stats?.last30Days ?? 0}
          hint="rolling window"
          icon={Calendar}
          testId="stat-last-30"
        />
        <StatCard
          label="Active Pipeline"
          value={
            isLoading
              ? "—"
              : (stats?.statusBreakdown.Applied ?? 0) +
                (stats?.statusBreakdown.Interview ?? 0) +
                (stats?.statusBreakdown.Offer ?? 0)
          }
          hint="applied + interview + offer"
          icon={ArrowUpRight}
          testId="stat-active"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Timeline */}
        <Card className="lg:col-span-2 card-hairline">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Applications Over Time
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                Last 90 days
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64" data-testid="chart-timeline">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.timeline ?? []}>
                  <defs>
                    <linearGradient id="g-timeline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    tickFormatter={(d) => {
                      const dt = new Date(d);
                      return `${dt.getMonth() + 1}/${dt.getDate()}`;
                    }}
                    interval={Math.floor(((stats?.timeline.length ?? 90) - 1) / 6)}
                    stroke="hsl(var(--border))"
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    allowDecimals={false}
                    stroke="hsl(var(--border))"
                    width={28}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#g-timeline)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status breakdown pie */}
        <Card className="card-hairline">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center" data-testid="chart-status">
              {pieData.length === 0 ? (
                <div className="w-full text-center text-sm text-muted-foreground">
                  No data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={48}
                      outerRadius={80}
                      paddingAngle={2}
                      stroke="hsl(var(--card))"
                      strokeWidth={2}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
              {STATUS_ORDER.map((s) => (
                <div key={s} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: statusColor(s) }}
                    />
                    <span className="text-muted-foreground">{s}</span>
                  </div>
                  <span className="font-mono-num text-foreground">
                    {stats?.statusBreakdown[s] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel + Top companies row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 card-hairline">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Success Rate Funnel
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                cumulative — each stage includes later stages
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FunnelRow
              label="Applied"
              count={stats?.funnel.applied ?? 0}
              total={stats?.funnel.applied ?? 0}
              color={statusColor("Applied")}
              testId="funnel-applied"
            />
            <FunnelRow
              label="Interview"
              count={stats?.funnel.interview ?? 0}
              total={stats?.funnel.applied ?? 0}
              color={statusColor("Interview")}
              testId="funnel-interview"
            />
            <FunnelRow
              label="Offer"
              count={stats?.funnel.offer ?? 0}
              total={stats?.funnel.applied ?? 0}
              color={statusColor("Offer")}
              testId="funnel-offer"
            />
            <FunnelRow
              label="Accepted"
              count={stats?.funnel.accepted ?? 0}
              total={stats?.funnel.applied ?? 0}
              color={statusColor("Accepted")}
              testId="funnel-accepted"
            />
            <div className="pt-3 border-t border-border text-xs flex items-center justify-between text-muted-foreground">
              <span>Rejected</span>
              <span
                className="font-mono-num text-foreground"
                data-testid="funnel-rejected"
              >
                {stats?.funnel.rejected ?? 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hairline">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground">
              Top Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(stats?.topCompanies ?? []).length === 0 ? (
              <div className="text-sm text-muted-foreground">No data yet</div>
            ) : (
              <div className="space-y-2.5">
                {stats?.topCompanies.map((c) => {
                  const max = stats.topCompanies[0]?.count || 1;
                  const pct = Math.round((c.count / max) * 100);
                  return (
                    <div
                      key={c.company}
                      className="text-xs"
                      data-testid={`top-company-${c.company}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-foreground truncate pr-2">
                          {c.company}
                        </span>
                        <span className="font-mono-num text-muted-foreground">
                          {c.count}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent */}
      <Card className="card-hairline">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">
            Recent Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center">
              No applications yet. Add your first one on the Applications page.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="pb-2 pr-3 font-medium">Company</th>
                    <th className="pb-2 pr-3 font-medium">Role</th>
                    <th className="pb-2 pr-3 font-medium">Status</th>
                    <th className="pb-2 font-medium">Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-border/40 last:border-0"
                      data-testid={`recent-row-${a.id}`}
                    >
                      <td className="py-2.5 pr-3 text-foreground">
                        {a.company}
                      </td>
                      <td className="py-2.5 pr-3 text-muted-foreground">
                        {a.role}
                      </td>
                      <td className="py-2.5 pr-3">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="py-2.5 font-mono-num text-muted-foreground text-xs">
                        {a.applied_date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

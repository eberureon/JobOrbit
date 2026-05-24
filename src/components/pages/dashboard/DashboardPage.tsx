import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Briefcase, Calendar, Target } from "lucide-react";
import { Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from "recharts";
import { StatusBadge, statusColor } from "~/components/StatusBadge";
import { Skeleton } from "~/components/ui/skeleton";
import type { Application } from "~/db/schema";
import type { PieSectorShapeProps } from "recharts";
import {
  getStats,
  listApplications,
} from "~/lib/server/applications.functions";
import type { ApplicationStatus, Stats } from "~/lib/types";
import { getEffectiveLocale, useSettings } from "~/lib/use-settings";
import { FunnelRow } from "./FunnelRow";
import { StatCard } from "./StatCard";
import { TimelineChart } from "./TimeLineChart";

const STATUS_ORDER: ApplicationStatus[] = [
  "Applied",
  "Interview",
  "Offer",
  "Accepted",
  "Rejected",
  "Withdrawn",
] as const;

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: () => getStats(),
  });
  const { data: applications = [] } = useQuery<Application[]>({
    queryKey: ["applications"],
    queryFn: () => listApplications(),
  });

  const { settings } = useSettings();
  const locale = getEffectiveLocale(settings);

  const recent = applications.slice(0, 5);

  const pieData = stats
    ? STATUS_ORDER.filter((s) => stats.statusBreakdown[s] > 0).map((s) => ({
        name: s,
        value: stats.statusBreakdown[s],
        color: statusColor(s),
      }))
    : [];

  const renderPieShape = (props: PieSectorShapeProps) => {
    const payload = props.payload as { color: string };
    return <Sector {...props} fill={payload.color} />;
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl border border-card-border bg-card card-hairline">
        <div className="absolute inset-0 bg-dot-grid opacity-60 pointer-events-none" />
        <div className="relative px-6 py-7">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)/0.7]" />
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Applications"
          value={stats?.total ?? 0}
          icon={Briefcase}
          testId="stat-total"
          loading={statsLoading}
        />
        <StatCard
          label="Last 7 Days"
          value={stats?.last7Days ?? 0}
          hint="rolling window"
          icon={Calendar}
          testId="stat-last-7"
          loading={statsLoading}
        />
        <StatCard
          label="Last 30 Days"
          value={stats?.last30Days ?? 0}
          hint="rolling window"
          icon={Calendar}
          testId="stat-last-30"
          loading={statsLoading}
        />
        <StatCard
          label="Active Pipeline"
          value={
            (stats?.statusBreakdown.Applied ?? 0) +
            (stats?.statusBreakdown.Interview ?? 0) +
            (stats?.statusBreakdown.Offer ?? 0)
          }
          hint="applied + interview + offer"
          icon={ArrowUpRight}
          testId="stat-active"
          loading={statsLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-card-border bg-card card-hairline">
          <div className="p-5 pb-2">
            <div className="text-sm font-medium text-foreground">
              Applications Over Time
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                Last 90 days
              </span>
            </div>
          </div>
          <div className="px-5 pb-5 pt-0">
            <TimelineChart
              data={stats?.timeline ?? []}
              loading={statsLoading}
            />
          </div>
        </div>

        <div className="rounded-xl border border-card-border bg-card card-hairline">
          <div className="p-5 pb-2">
            <div className="text-sm font-medium text-foreground">
              Status Breakdown
            </div>
          </div>
          <div className="p-5 pt-2">
            <div
              className="h-64 flex items-center justify-center"
              data-testid="chart-status"
            >
              {statsLoading ? (
                <Skeleton className="w-40 h-40 rounded-full" />
              ) : pieData.length === 0 ? (
                <div className="w-full text-center text-sm text-muted-foreground">
                  No data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={256}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={48}
                      outerRadius={80}
                      paddingAngle={2}
                      stroke="var(--card)"
                      strokeWidth={2}
                      shape={renderPieShape}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
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
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-card-border bg-card card-hairline">
          <div className="p-5 pb-3">
            <div className="text-sm font-medium text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Success Rate Funnel
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                cumulative — each stage includes later stages
              </span>
            </div>
          </div>
          <div className="p-5 pt-0 space-y-4">
            {statsLoading ? (
              <>
                {["Applied", "Interview", "Offer", "Accepted"].map((label) => (
                  <div key={label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <Skeleton className="h-3 w-6" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
                <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span>Rejected</span>
                  <Skeleton className="h-3 w-6" />
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-card-border bg-card card-hairline">
          <div className="p-5 pb-3">
            <div className="text-sm font-medium text-foreground">
              Top Companies
            </div>
          </div>
          <div className="p-5 pt-0">
            {statsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-5" />
                    </div>
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                ))}
              </div>
            ) : (stats?.topCompanies ?? []).length === 0 ? (
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
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-card-border bg-card card-hairline">
        <div className="p-5 pb-3">
          <div className="text-sm font-medium text-foreground">
            Recent Applications
          </div>
        </div>
        <div className="p-5 pt-0">
          {statsLoading ? (
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
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr
                      key={i}
                      className="border-b border-border/40 last:border-0"
                    >
                      <td className="py-2.5 pr-3">
                        <Skeleton className="h-4 w-28" />
                      </td>
                      <td className="py-2.5 pr-3">
                        <Skeleton className="h-4 w-36" />
                      </td>
                      <td className="py-2.5 pr-3">
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </td>
                      <td className="py-2.5">
                        <Skeleton className="h-4 w-16" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : recent.length === 0 ? (
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
                        {new Intl.DateTimeFormat(locale, {
                          dateStyle: "medium",
                        }).format(new Date(a.applied_date))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

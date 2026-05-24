import { Skeleton } from "~/components/ui/skeleton";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  testId,
  loading,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  testId: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-card-border bg-card card-hairline relative overflow-hidden p-5">
      <div className="flex items-start justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          {label}
        </div>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-9 w-20" />
      ) : (
        <div
          className="mt-3 font-mono-num text-3xl font-semibold text-foreground"
          data-testid={testId}
        >
          {value}
        </div>
      )}
      {hint && <div className="mt-1 text-xs text-muted-foreground font-mono-num">{hint}</div>}
    </div>
  );
}

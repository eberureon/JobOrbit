export function FunnelRow({
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

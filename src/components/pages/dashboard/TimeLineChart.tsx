import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Skeleton } from "@heroui/react";
import { formatMonthDay } from "~/lib/date";

export function TimelineChart({
	data,
	loading,
}: {
	data: { date: string; count: number }[];
	loading: boolean;
}) {
	return (
		<div className="w-full h-full aspect-2/1" data-testid="chart-timeline">
			{loading ? (
				<div className="w-full h-full grid">
					<Skeleton className="w-full h-full rounded-lg" />
				</div>
			) : (
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart
						data={data}
						title="Applications Over Time"
						desc="Shows applied applications over the last 90 days"
					>
						<defs>
							<linearGradient id="g-timeline" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
								<stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid
							stroke="var(--border)"
							strokeDasharray="3 3"
							vertical={false}
						/>
						<XAxis
							dataKey="date"
							tick={{
								fill: "var(--muted)",
								fontSize: 11,
							}}
							tickFormatter={(d: string) => formatMonthDay(d)}
							interval={Math.max(Math.floor(((data.length ?? 90) - 1) / 6), 0)}
							stroke="var(--border)"
						/>
						<YAxis
							tick={{
								fill: "var(--muted)",
								fontSize: 11,
							}}
							allowDecimals={false}
							stroke="var(--border)"
							width={24}
						/>
						<Tooltip
							contentStyle={{
								background: "var(--overlay)",
								border: "1px solid var(--border)",
								borderRadius: 8,
								fontSize: 12,
							}}
						/>
						<Area
							type="monotone"
							dataKey="count"
							stroke="var(--accent)"
							strokeWidth={2}
							dot={false}
							fill="url(#g-timeline)"
						/>
					</AreaChart>
				</ResponsiveContainer>
			)}
		</div>
	);
}

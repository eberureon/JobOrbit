import { useEffect, useRef, useState } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Skeleton } from "@heroui/react";

export function TimelineChart({
	data,
	loading,
}: {
	data: { date: string; count: number }[];
	loading: boolean;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState(0);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const ro = new ResizeObserver(([entry]) => {
			setWidth(entry.contentRect.width);
		});
		ro.observe(el);
		setWidth(el.getBoundingClientRect().width);
		return () => ro.disconnect();
	}, []);

	return (
		<div ref={ref} className="w-full" data-testid="chart-timeline">
			{loading ? (
				<div className="w-full aspect-2/1 grid">
					<Skeleton className="w-full h-full rounded-lg" />
				</div>
			) : width > 0 ? (
				<AreaChart width={width} height={width / 2} data={data}>
					<defs>
						<linearGradient id="g-timeline" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="var(--accent)" stopOpacity={0.4} />
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
							fill: "var(--muted-foreground)",
							fontSize: 11,
						}}
						tickFormatter={(d: string) => {
							const dt = new Date(d);
							return `${dt.getMonth() + 1}/${dt.getDate()}`;
						}}
						interval={Math.max(Math.floor(((data.length ?? 90) - 1) / 6), 0)}
						stroke="var(--border)"
					/>
					<YAxis
						tick={{
							fill: "var(--muted-foreground)",
							fontSize: 11,
						}}
						allowDecimals={false}
						stroke="var(--border)"
						width={28}
					/>
					<Tooltip
						contentStyle={{
							background: "var(--popover)",
							border: "1px solid var(--border)",
							borderRadius: 8,
							fontSize: 12,
						}}
						labelStyle={{ color: "var(--foreground)" }}
					/>
					<Area
						type="monotone"
						dataKey="count"
						stroke="var(--primary)"
						strokeWidth={2}
						fill="url(#g-timeline)"
					/>
				</AreaChart>
			) : (
				<div className="w-full aspect-[2/1]" />
			)}
		</div>
	);
}

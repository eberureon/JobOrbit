export function Logo({
	className = "",
	collapsed,
}: {
	className?: string;
	collapsed?: boolean;
}) {
	return (
		<div
			className={`flex items-center ${collapsed ? "gap-0" : "gap-2"} ${className}`}
			aria-label="JobOrbit"
		>
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				aria-hidden="true"
				className="text-foreground shrink-0"
			>
				<rect
					x="3"
					y="3"
					width="18"
					height="18"
					rx="4"
					stroke="currentColor"
					strokeWidth="1.5"
				/>
				<path
					d="M8 8v4a4 4 0 0 0 8 0V8"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
				<circle cx="18" cy="6" r="2" fill="hsl(var(--primary))" />
			</svg>
			<span
				className={`font-semibold tracking-tight text-foreground text-base transition-opacity duration-200 ${
					collapsed
						? "opacity-0 w-0 overflow-hidden inline-block whitespace-nowrap"
						: ""
				}`}
			>
				Job<span className="text-primary">Orbit</span>
			</span>
		</div>
	);
}

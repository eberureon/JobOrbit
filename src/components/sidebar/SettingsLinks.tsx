import { Settings } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";

export function SettingsLink({ collapsed }: { collapsed?: boolean }) {
	const { pathname } = useLocation();
	const isActive = pathname === "/settings";

	return (
		<Link
			to="/settings"
			onClick={() => {}}
			className={`group relative flex items-center py-1.5 px-3 text-sm font-medium transition-colors ${
				collapsed ? "justify-center" : "gap-3 px-3"
			} ${
				isActive
					? "bg-sidebar-accent text-sidebar-accent-foreground"
					: "text-sidebar-foreground/65 hover:text-lagoon-deep hover:bg-default"
			}`}
			title={collapsed ? "Settings" : undefined}
		>
			<Settings
				className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`}
			/>
			<span
				className={`transition-opacity duration-200 ${collapsed ? "opacity-0 w-0 overflow-hidden inline-block whitespace-nowrap" : ""}`}
			>
				Settings
			</span>
			{isActive && !collapsed && (
				<span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
			)}
		</Link>
	);
}

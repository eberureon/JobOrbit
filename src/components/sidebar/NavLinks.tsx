import { Briefcase, FileText, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";

const NAV = [
	{
		to: "/",
		label: "Dashboard",
		icon: LayoutDashboard,
		activeOptions: { exact: true },
	},
	{ to: "/applications", label: "Applications", icon: Briefcase },
	{ to: "/resume", label: "Resume", icon: FileText },
];

export function NavLinks({
	collapsed,
	onNavigate,
}: {
	collapsed?: boolean;
	onNavigate?: () => void;
}) {
	const { pathname } = useLocation();
	return (
		<nav className={`flex flex-col gap-0.5 ${collapsed ? "p-2" : "p-3"}`}>
			{NAV.map((item) => {
				const isActive =
					item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
				const Icon = item.icon;
				return (
					<Link
						key={item.to}
						to={item.to}
						activeOptions={item.activeOptions}
						onClick={onNavigate}
						className={`group relative flex items-center rounded-md py-2 text-sm font-medium transition-colors ${
							collapsed ? "justify-center" : "gap-3 px-3"
						} ${
							isActive
								? "bg-sidebar-accent text-sidebar-accent-foreground"
								: "text-muted-foreground hover:text-foreground"
						}`}
						title={collapsed ? item.label : undefined}
					>
						<Icon
							className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`}
						/>
						<span
							className={`transition-opacity duration-200 ${collapsed ? "opacity-0 w-0 overflow-hidden inline-block whitespace-nowrap" : ""}`}
						>
							{item.label}
						</span>
						{isActive && !collapsed && (
							<span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
						)}
					</Link>
				);
			})}
		</nav>
	);
}

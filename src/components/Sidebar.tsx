import { Link, useLocation } from "@tanstack/react-router";
import {
	Briefcase,
	FileText,
	LayoutDashboard,
	PanelLeftClose,
	PanelLeftOpen,
	Settings,
} from "lucide-react";
import { Logo } from "./Logo";

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

function SettingsLink({ collapsed }: { collapsed?: boolean }) {
	const { pathname } = useLocation();
	const isActive = pathname === "/settings";

	return (
		<Link
			to="/settings"
			onClick={() => {}}
			className={`group relative flex items-center rounded-md py-2 text-sm font-medium transition-colors ${
				collapsed ? "justify-center" : "gap-3 px-3"
			} ${
				isActive
					? "bg-sidebar-accent text-sidebar-accent-foreground"
					: "text-muted-foreground hover:text-foreground"
			}`}
			title={collapsed ? "Settings" : undefined}
		>
			<Settings
				className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`}
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

export function Sidebar({
	collapsed,
	onToggle,
}: {
	collapsed: boolean;
	onToggle: () => void;
}) {
	return (
		<aside
			className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-in-out ${
				collapsed ? "w-14" : "w-60"
			}`}
		>
			<div
				className={`flex items-center border-b border-sidebar-border ${collapsed ? "flex-col gap-3 p-2" : "justify-between p-4"}`}
			>
				<Logo collapsed={collapsed} />
				<div
					className={`flex items-center ${collapsed ? "flex-col gap-3" : "gap-1"}`}
				>
					<button
						type="button"
						onClick={onToggle}
						className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors"
						aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
					>
						{collapsed ? (
							<PanelLeftOpen className="h-4 w-4" />
						) : (
							<PanelLeftClose className="h-4 w-4" />
						)}
					</button>
				</div>
			</div>
			<div className="flex-1 overflow-y-auto">
				<NavLinks collapsed={collapsed} />
			</div>
			<div
				className={`border-t border-sidebar-border ${collapsed ? "p-2" : "p-3"}`}
			>
				<SettingsLink collapsed={collapsed} />
			</div>
		</aside>
	);
}

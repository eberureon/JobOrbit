import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@heroui/react";
import { Logo } from "../Logo";
import { ThemeToggle } from "../ThemeToggle";
import { LockToggle, SettingsLink } from ".";
import { NavLinks } from "./NavLinks";
import { Link } from "@tanstack/react-router";

export function Sidebar({
	collapsed,
	onToggle,
	onLock,
}: {
	collapsed: boolean;
	onToggle: () => void;
	onLock?: () => void;
}) {
	return (
		<aside
			aria-label="Sidebar navigation"
			className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-in-out ${
				collapsed ? "w-14" : "w-60"
			}`}
		>
			<div
				className={`flex items-center border-b border-sidebar-border ${collapsed ? "flex-col gap-3 p-2" : "justify-between p-4"}`}
			>
				<Link to="/">
					<Logo collapsed={collapsed} />
				</Link>
				<div
					className={`flex items-center ${collapsed ? "flex-col gap-3" : "gap-1"}`}
				>
					<ThemeToggle />
					<Button
						type="button"
						variant="ghost"
						isIconOnly
						onClick={onToggle}
						aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
					>
						{collapsed ? (
							<PanelLeftOpen className="h-4 w-4" />
						) : (
							<PanelLeftClose className="h-4 w-4" />
						)}
					</Button>
				</div>
			</div>
			<div className="flex-1 overflow-y-auto">
				<NavLinks collapsed={collapsed} />
			</div>
			<div
				className={`border-t border-sidebar-border ${collapsed ? "p-2" : "p-3"}`}
			>
				<div
					className={
						collapsed ? "flex flex-col items-center gap-2" : "space-y-1"
					}
				>
					<LockToggle collapsed={collapsed} onLocked={onLock} />
					<SettingsLink collapsed={collapsed} />
				</div>
			</div>
		</aside>
	);
}

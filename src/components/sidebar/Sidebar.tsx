import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@heroui/react";
import { Logo } from "../Logo";
import { ThemeToggle } from "../ThemeToggle";
import { SettingsLink } from "./SettingsLinks";
import { NavLinks } from "./NavLinks";

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
					<ThemeToggle />
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

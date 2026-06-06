import { Link, Outlet } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, Settings, X } from "lucide-react";
import { useEffect, useState } from "react";
import { checkSession } from "~/lib/server/lock.functions";
import { LockGate } from "./LockGate";
import { Logo } from "./Logo";
import { Sidebar, NavLinks } from "./sidebar";

export function RootComponent() {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [isLocked, setIsLocked] = useState<boolean | null>(null);

	const { data: session } = useQuery({
		queryKey: ["session"],
		queryFn: () => checkSession(),
	});

	useEffect(() => {
		if (session && isLocked === null) {
			setIsLocked(!session.authenticated);
		}
	}, [session, isLocked]);

	if (isLocked === null) return null;
	if (isLocked) return <LockGate onUnlocked={() => setIsLocked(false)} />;

	const collapsed = !sidebarOpen;
	const toggleMobileMenu = () => setMobileOpen((v) => !v);

	return (
		<div className="min-h-screen">
			<div className="sticky top-0 z-40 flex items-center justify-between border-b border-sidebar-border bg-sidebar/80 backdrop-blur px-4 py-3 md:hidden">
				<Link to="/" onClick={() => setMobileOpen(false)}>
					<Logo />
				</Link>
				<button
					type="button"
					onClick={toggleMobileMenu}
					className="size-10 rounded-md border border-border"
					aria-label="Toggle menu"
				>
					{mobileOpen ? (
						<X className="pointer-events-none h-4 w-4 m-auto" />
					) : (
						<Menu className="pointer-events-none h-4 w-4 m-auto" />
					)}
				</button>
			</div>

			<>
				<Sidebar
					collapsed={collapsed}
					onToggle={() => setSidebarOpen((v) => !v)}
					onLock={() => setIsLocked(true)}
				/>

				{mobileOpen && (
					<div className="md:hidden fixed inset-0 z-30 bg-background/95 backdrop-blur pt-14 flex flex-col">
						<div className="flex-1 overflow-y-auto">
							<NavLinks onNavigate={() => setMobileOpen(false)} />
						</div>
						<div className="border-t border-border p-3">
							<Link
								to="/settings"
								onClick={() => setMobileOpen(false)}
								className="group relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
							>
								<Settings className="h-4 w-4 shrink-0 text-muted-foreground" />
								Settings
							</Link>
						</div>
					</div>
				)}

				<main
					className={`flex-1 min-h-screen min-w-0 overflow-x-hidden transition-[padding] duration-200 ease-in-out ${
						collapsed ? "md:pl-14" : "md:pl-60"
					}`}
				>
					<div className="px-4 sm:px-6 lg:px-8 py-6 max-w-8xl mx-auto min-w-0">
						<Outlet />
					</div>
				</main>
			</>
		</div>
	);
}

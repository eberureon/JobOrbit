import { Link, useLocation } from "@tanstack/react-router";
import {
  Briefcase,
  FileText,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  {
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    activeOptions: { exact: true },
  },
  { to: "/applications", label: "Applications", icon: Briefcase },
  { to: "/cv", label: "CV", icon: FileText },
];

function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className={`flex items-center ${!collapsed ? "gap-2" : "gap-0"}`}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="text-foreground shrink-0"
        aria-label="JobOrbit"
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
        className={`font-semibold tracking-tight text-foreground text-base transition-opacity duration-200 ${collapsed ? "opacity-0 w-0 overflow-hidden inline-block whitespace-nowrap" : ""}`}
      >
        Job<span className="text-primary">Orbit</span>
      </span>
    </div>
  );
}

function NavLinks({
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
              className={`h-4 w-4 shrink-0 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <span
              className={`transition-opacity duration-200 ${collapsed ? "opacity-0 w-0 overflow-hidden inline-block whitespace-nowrap" : ""}`}
            >
              {item.label}
            </span>
            {isActive && !collapsed && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            )}
            {isActive && collapsed && (
              <span className="absolute right-0 h-4 w-1 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const collapsed = !sidebarOpen;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-sidebar-border bg-sidebar/80 backdrop-blur px-4 py-3 md:hidden">
        <Logo />
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-md border border-border p-2"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="flex">
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
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setSidebarOpen((v) => !v)}
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
          <NavLinks collapsed={collapsed} />
        </aside>

        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-30 bg-background/95 backdrop-blur pt-14">
            <NavLinks onNavigate={() => setMobileOpen(false)} />
          </div>
        )}

        <main
          className={`flex-1 min-h-screen min-w-0 overflow-x-hidden transition-[padding] duration-200 ease-in-out ${
            collapsed ? "md:pl-14" : "md:pl-60"
          }`}
        >
          <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

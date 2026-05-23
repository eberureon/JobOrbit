import { Link, useLocation } from "wouter";
import { Briefcase, FileText, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, testId: "link-dashboard" },
  { href: "/applications", label: "Applications", icon: Briefcase, testId: "link-applications" },
  { href: "/cv", label: "CV", icon: FileText, testId: "link-cv" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const [location] = useLocation();
  return (
    <nav className="flex flex-col gap-0.5 p-3">
      {NAV.map((item) => {
        const isActive =
          item.href === "/" ? location === "/" : location.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            data-testid={item.testId}
            onClick={onNavigate}
            className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover-elevate ${
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon
              className={`h-4 w-4 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <span>{item.label}</span>
            {isActive && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-sidebar-border bg-sidebar/80 backdrop-blur px-4 py-3 md:hidden">
        <Logo />
        <button
          type="button"
          data-testid="button-mobile-menu"
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-md border border-border p-2 hover-elevate"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 border-r border-sidebar-border bg-sidebar">
          <div className="px-5 py-5 border-b border-sidebar-border">
            <Logo />
          </div>
          <NavLinks />
          <div className="mt-auto p-4 text-xs text-muted-foreground/70 border-t border-sidebar-border">
            <div className="flex items-center gap-2">
              <span className="live-dot" />
              <span className="font-mono-num">self-hosted · v1.0</span>
            </div>
          </div>
        </aside>

        {/* Mobile sidebar */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-30 bg-background/95 backdrop-blur pt-14">
            <NavLinks onNavigate={() => setMobileOpen(false)} />
          </div>
        )}

        <main className="flex-1 md:pl-60 min-h-screen min-w-0 overflow-x-hidden">
          <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

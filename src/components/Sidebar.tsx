import { Link, useLocation } from '@tanstack/react-router'
import { Briefcase, FileText, LayoutDashboard, Menu, X } from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, activeOptions: { exact: true } },
  { to: '/applications', label: 'Applications', icon: Briefcase },
  { to: '/cv', label: 'CV', icon: FileText },
]

function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`} aria-label="JobOrbit">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-foreground shrink-0">
        <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 8v4a4 4 0 0 0 8 0V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="18" cy="6" r="2" fill="hsl(var(--primary))" />
      </svg>
      <span className="font-semibold tracking-tight text-foreground text-base">
        Job<span className="text-primary">Orbit</span>
      </span>
    </div>
  )
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation()
  return (
    <nav className="flex flex-col gap-0.5 p-3">
      {NAV.map((item) => {
        const isActive =
          item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)
        const Icon = item.icon
        return (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={item.activeOptions}
            onClick={onNavigate}
            className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon
              className={`h-4 w-4 shrink-0 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            />
            <span>{item.label}</span>
            {isActive && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

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
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex">
        <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 border-r border-sidebar-border bg-sidebar">
          <div className="px-5 py-5 border-b border-sidebar-border">
            <Logo />
          </div>
          <NavLinks />
          <div className="mt-auto p-4 text-xs text-muted-foreground/70 border-t border-sidebar-border">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.7)]" />
              <span className="font-mono-num">self-hosted · v1.0</span>
            </div>
          </div>
        </aside>

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
  )
}

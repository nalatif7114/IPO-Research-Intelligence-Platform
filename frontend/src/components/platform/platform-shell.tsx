'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, Bot, BrainCircuit, Clock3, FileUp, LayoutDashboard, Menu, PanelLeftClose, Search, X } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/upload', label: 'Upload', icon: FileUp },
  { href: '/analysis', label: 'Live analysis', icon: Activity },
  { href: '/dashboard', label: 'Investment dashboard', icon: BrainCircuit },
  { href: '/copilot', label: 'Investor copilot', icon: Bot },
  { href: '/history', label: 'History', icon: Clock3 },
]

export function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_28px_var(--primary-glow)]">
        <BrainCircuit aria-hidden="true" className="size-4" />
      </span>
      {!collapsed && <span className="min-w-0"><span className="block text-sm font-semibold tracking-tight">Atlast Research</span><span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">IPO Intelligence OS</span></span>}
    </Link>
  )
}

export function ProductNav({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  return (
    <nav aria-label="Product navigation" className="relative">
      <button className="icon-button lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
      <div className={`${open ? 'flex' : 'hidden'} absolute right-0 top-11 z-30 w-64 flex-col gap-1 rounded-xl border bg-popover p-2 shadow-2xl lg:static lg:flex lg:w-auto lg:flex-row lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`} aria-current={active ? 'page' : undefined}><Icon aria-hidden="true" className="size-3.5" /><span className={compact ? 'xl:hidden 2xl:inline' : ''}>{label}</span></Link>
        })}
      </div>
    </nav>
  )
}

export function PlatformHeader({ eyebrow, title, actions }: { eyebrow?: string; title?: string; actions?: React.ReactNode }) {
  return <header className="sticky top-0 z-20 flex min-h-16 shrink-0 items-center justify-between gap-4 border-b bg-background/85 px-4 backdrop-blur-xl md:px-6"><div className="flex min-w-0 items-center gap-5"><div className="lg:hidden"><Brand /></div>{(title || eyebrow) && <div className="min-w-0"><p className="eyebrow">{eyebrow}</p><p className="truncate text-sm font-medium">{title}</p></div>}</div><div className="flex items-center gap-3"><div className="hidden xl:block"><ProductNav compact /></div>{actions}<div className="xl:hidden"><ProductNav compact /></div></div></header>
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  return <div className="min-h-screen bg-background text-foreground"><aside className={`fixed inset-y-0 left-0 z-30 hidden border-r bg-card/75 backdrop-blur-xl lg:flex lg:flex-col ${collapsed ? 'w-20' : 'w-64'}`}><div className="flex h-16 items-center justify-between border-b px-5"><Brand collapsed={collapsed} /><button className="icon-button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}><PanelLeftClose className={collapsed ? 'rotate-180' : ''} /></button></div><nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Primary navigation">{navItems.map(({ href, label, icon: Icon }) => { const active = pathname === href; return <Link key={href} href={href} title={collapsed ? label : undefined} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${active ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}><Icon className="size-4 shrink-0" />{!collapsed && <span>{label}</span>}</Link> })}</nav><div className="border-t p-3"><div className={`flex items-center gap-3 rounded-lg border bg-background/60 p-2 ${collapsed ? 'justify-center' : ''}`}><span className="flex size-8 items-center justify-center rounded-md bg-primary/15 text-xs font-semibold text-primary">NA</span>{!collapsed && <div className="min-w-0"><p className="truncate text-xs font-medium">Research desk</p><p className="truncate text-[10px] text-muted-foreground">Institutional workspace</p></div>}</div></div></aside><div className={collapsed ? 'lg:pl-20' : 'lg:pl-64'}>{children}</div></div>
}

export function PageFrame({ children, className = '' }: { children: React.ReactNode; className?: string }) { return <AppShell><main className={`min-h-screen bg-background text-foreground ${className}`}>{children}</main></AppShell> }

export function SectionHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: React.ReactNode }) { return <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">{eyebrow}</p><h2 className="mt-1 text-xl font-semibold tracking-tight text-balance">{title}</h2>{description && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}</div>{action}</div> }

export function StatusBadge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'positive' | 'warning' | 'danger' }) { const tones = { neutral: 'border-border bg-secondary text-muted-foreground', positive: 'border-success/25 bg-success/10 text-success', warning: 'border-primary/25 bg-primary/10 text-primary', danger: 'border-destructive/25 bg-destructive/10 text-destructive' }; return <span className={`inline-flex items-center rounded-full border px-2 py-1 font-mono text-[9px] uppercase tracking-wider ${tones[tone]}`}>{children}</span> }

export function SearchBox({ placeholder = 'Search research…' }: { placeholder?: string }) { return <label className="flex items-center gap-2 rounded-lg border bg-card/70 px-3 py-2.5 focus-within:ring-2 focus-within:ring-ring"><Search className="size-4 text-muted-foreground" /><span className="sr-only">Search</span><input className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder={placeholder} /></label> }

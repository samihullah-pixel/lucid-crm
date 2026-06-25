"use client";

import { ReactNode, Suspense, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Star,
  Users,
  Building2,
  UserCircle,
  MapPin,
  FileText,
  ShoppingCart,
  Truck,
  FileSpreadsheet,
  CalendarClock,
  Search,
  BookOpen,
  Handshake,
  type LucideIcon,
} from "lucide-react";
import { logout } from "@/actions/auth";
import { cn } from "@/lib/utils";
import { CommandPalette } from "@/components/command-palette";
import { FlashToast } from "@/components/ui/flash-toast";

function openPalette() {
  window.dispatchEvent(new Event("open-command-palette"));
}

type NavItem = { href: string; label: string; icon: LucideIcon };
type NavGroup = { title: string; items: NavItem[] };

const navigation: NavGroup[] = [
  {
    title: "Überblick",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dienstplan", label: "Dienstplan", icon: CalendarDays },
    ],
  },
  {
    title: "Einsätze",
    items: [
      { href: "/arbeitsprotokoll", label: "Arbeitsprotokoll", icon: ClipboardCheck },
      { href: "/sop-procedures", label: "Anleitungen", icon: BookOpen },
      { href: "/protokolle", label: "Kontrolle", icon: ClipboardList },
      { href: "/appointments", label: "Termine", icon: CalendarClock },
      { href: "/cleaning-jobs", label: "Einsätze", icon: Clock },
      { href: "/extra-works", label: "Zusatzarbeiten", icon: Star },
    ],
  },
  {
    title: "Stammdaten",
    items: [
      { href: "/customers", label: "Kunden", icon: Users },
      { href: "/properties", label: "Objekte", icon: Building2 },
      { href: "/employees", label: "Mitarbeiter", icon: UserCircle },
      { href: "/sites", label: "Standorte", icon: MapPin },
      { href: "/inspection-templates", label: "Aufnahmebögen", icon: FileSpreadsheet },
    ],
  },
  {
    title: "Abrechnung & Material",
    items: [
      { href: "/invoices", label: "Rechnungen", icon: FileText },
      { href: "/hours", label: "Stunden", icon: Clock },
      { href: "/supply-orders", label: "Bestellungen", icon: ShoppingCart },
      { href: "/suppliers", label: "Lieferanten", icon: Truck },
      { href: "/partners", label: "Partner", icon: Handshake },
    ],
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen bg-light text-black">
      <div className="mx-auto flex max-w-7xl">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="fixed left-4 top-4 z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded bg-black text-white md:hidden"
          aria-label="Menü öffnen/schließen"
          aria-expanded={menuOpen}
        >
          <span className="flex flex-col gap-1">
            <span className="block h-0.5 w-5 bg-white" />
            <span className="block h-0.5 w-5 bg-white" />
            <span className="block h-0.5 w-5 bg-white" />
          </span>
        </button>

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto bg-black p-6 transition-transform duration-200 md:static md:translate-x-0",
            menuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="mb-6 mt-12 rounded bg-white p-3 md:mt-0">
            <img src="/lucid-logo.svg" alt="Lucid*" className="w-full" />
          </div>

          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              openPalette();
            }}
            className="mb-8 flex w-full items-center gap-2.5 rounded border border-white/10 bg-white/5 px-3 py-2.5 font-sans text-[11px] font-light uppercase tracking-[2px] text-grey transition-colors hover:border-gold/40 hover:text-gold"
          >
            <Search className="h-3.5 w-3.5" strokeWidth={1.5} />
            Suchen
            <kbd className="ml-auto rounded border border-white/15 px-1.5 py-0.5 text-[9px] tracking-widest">
              ⌘K
            </kbd>
          </button>

          <nav className="space-y-7">
            {navigation.map((group) => (
              <div key={group.title}>
                <p className="px-3 pb-2.5 font-sans text-[10px] font-light uppercase tracking-[3px] text-grey/60">
                  {group.title}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded px-3 py-2 font-sans text-[11px] font-light uppercase tracking-[2.5px] transition-colors",
                          active
                            ? "bg-gold text-black"
                            : "text-grey hover:bg-white/5 hover:text-gold"
                        )}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <form action={logout} className="mt-8 border-t border-white/10 pt-4">
            <button
              type="submit"
              className="font-sans text-[11px] font-light uppercase tracking-[3px] text-grey transition-colors hover:text-gold"
            >
              Abmelden
            </button>
          </form>
        </aside>

        {menuOpen && (
          <div
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            aria-hidden="true"
          />
        )}

        <main className="min-w-0 flex-1 p-4 pt-20 md:p-10 md:pt-10">{children}</main>
      </div>
      <CommandPalette />
      <Suspense fallback={null}>
        <FlashToast />
      </Suspense>
    </div>
  );
}

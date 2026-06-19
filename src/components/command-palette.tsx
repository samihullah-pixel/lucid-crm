"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search,
  Users,
  Building2,
  UserCircle,
  FileText,
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Plus,
  CornerDownLeft,
} from "lucide-react";
import { globalSearch, type SearchResult } from "@/actions/search";

const quickLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Dienstplan", href: "/dienstplan", icon: CalendarDays },
  { label: "Kontrolle", href: "/protokolle", icon: ClipboardList },
  { label: "Kunden", href: "/customers", icon: Users },
  { label: "Objekte", href: "/properties", icon: Building2 },
  { label: "Rechnungen", href: "/invoices", icon: FileText },
];

const quickActions = [
  { label: "Neuer Kunde", href: "/customers/new" },
  { label: "Neues Objekt", href: "/properties/new" },
  { label: "Neue Rechnung", href: "/invoices/new" },
  { label: "Neuer Termin", href: "/appointments/new" },
];

const typeIcon = {
  customer: Users,
  property: Building2,
  employee: UserCircle,
  invoice: FileText,
} as const;

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const openEvt = () => setOpen(true);
    document.addEventListener("keydown", down);
    window.addEventListener("open-command-palette", openEvt);
    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener("open-command-palette", openEvt);
    };
  }, []);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounce.current = setTimeout(async () => {
      const r = await globalSearch(query);
      setResults(r);
      setLoading(false);
    }, 200);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [query]);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 p-4 pt-[12vh]"
      onClick={() => setOpen(false)}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl">
        <Command
          shouldFilter={false}
          className="overflow-hidden rounded-xl border border-gold/30 bg-black font-sans text-light shadow-2xl"
        >
          <div className="flex items-center gap-3 border-b border-white/10 px-4">
            <Search className="h-4 w-4 text-grey" strokeWidth={1.5} />
            <Command.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Kunde, Objekt, Mitarbeiter, Rechnung suchen…"
              className="w-full bg-transparent py-4 text-sm font-light tracking-wide text-light outline-none placeholder:text-grey"
            />
            <kbd className="rounded border border-white/15 px-1.5 py-0.5 text-[10px] tracking-widest text-grey">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[55vh] overflow-y-auto p-2">
            {loading && (
              <div className="px-3 py-6 text-center text-xs tracking-widest text-grey">
                Suche läuft…
              </div>
            )}

            {!loading && query.trim().length >= 2 && results.length === 0 && (
              <Command.Empty className="px-3 py-6 text-center text-xs tracking-widest text-grey">
                Keine Treffer für „{query}"
              </Command.Empty>
            )}

            {results.length > 0 && (
              <Command.Group
                heading="Treffer"
                className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[3px] [&_[cmdk-group-heading]]:text-grey/60"
              >
                {results.map((r) => {
                  const Icon = typeIcon[r.type];
                  return (
                    <Item key={`${r.type}-${r.id}`} onSelect={() => go(r.href)}>
                      <Icon className="h-4 w-4 text-gold" strokeWidth={1.5} />
                      <span className="flex-1">{r.label}</span>
                      <span className="text-[11px] tracking-wide text-grey">
                        {r.sublabel}
                      </span>
                    </Item>
                  );
                })}
              </Command.Group>
            )}

            {query.trim().length < 2 && (
              <>
                <Command.Group
                  heading="Schnellzugriff"
                  className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[3px] [&_[cmdk-group-heading]]:text-grey/60"
                >
                  {quickLinks.map((l) => {
                    const Icon = l.icon;
                    return (
                      <Item key={l.href} onSelect={() => go(l.href)}>
                        <Icon className="h-4 w-4 text-grey" strokeWidth={1.5} />
                        <span className="flex-1">{l.label}</span>
                      </Item>
                    );
                  })}
                </Command.Group>

                <Command.Group
                  heading="Neu erstellen"
                  className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[3px] [&_[cmdk-group-heading]]:text-grey/60"
                >
                  {quickActions.map((a) => (
                    <Item key={a.href} onSelect={() => go(a.href)}>
                      <Plus className="h-4 w-4 text-gold" strokeWidth={1.5} />
                      <span className="flex-1">{a.label}</span>
                    </Item>
                  ))}
                </Command.Group>
              </>
            )}
          </Command.List>

          <div className="flex items-center gap-4 border-t border-white/10 px-4 py-2.5 text-[10px] tracking-widest text-grey">
            <span className="flex items-center gap-1.5">
              <CornerDownLeft className="h-3 w-3" /> Öffnen
            </span>
            <span>↑↓ Navigieren</span>
            <span className="ml-auto">⌘K Suche</span>
          </div>
        </Command>
      </div>
    </div>
  );
}

function Item({
  children,
  onSelect,
}: {
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm font-light tracking-wide text-light aria-selected:bg-gold aria-selected:text-black"
    >
      {children}
    </Command.Item>
  );
}

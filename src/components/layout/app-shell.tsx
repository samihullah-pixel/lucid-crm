import { ReactNode } from "react";
import Link from "next/link";
import { logout } from "@/actions/auth";

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/customers", label: "Kunden" },
  { href: "/properties", label: "Objekte" },
  { href: "/employees", label: "Mitarbeiter" },
  { href: "/appointments", label: "Termine" },
  { href: "/cleaning-jobs", label: "Einsaetze" },
  { href: "/extra-works", label: "Zusatzarbeiten" },
  { href: "/invoices", label: "Rechnungen" },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-light text-black">
      <div className="mx-auto flex max-w-7xl">
        <aside className="min-h-screen w-64 bg-black p-8">
          <div className="mb-12 rounded bg-white p-3">
            <img src="/lucid-logo.svg" alt="Lucid*" className="w-full" />
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded px-3 py-2 font-sans text-[11px] font-light uppercase tracking-[3px] text-grey transition-colors hover:text-gold"
              >
                {item.label}
              </Link>
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
        <main className="flex-1 p-10">{children}</main>
      </div>
    </div>
  );
}

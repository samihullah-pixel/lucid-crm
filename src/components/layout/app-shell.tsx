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
  { href: "/inspection-templates", label: "Aufnahmebögen" },
  { href: "/hours", label: "Stunden" },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-light text-black">
      <div className="mx-auto flex max-w-7xl">
        <input type="checkbox" id="mobile-nav-toggle" className="peer hidden" />

        <label
          htmlFor="mobile-nav-toggle"
          className="fixed left-4 top-4 z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded bg-black text-white md:hidden"
          aria-label="Menue oeffnen/schliessen"
        >
          <span className="flex flex-col gap-1">
            <span className="block h-0.5 w-5 bg-white" />
            <span className="block h-0.5 w-5 bg-white" />
            <span className="block h-0.5 w-5 bg-white" />
          </span>
        </label>

        <aside className="fixed inset-y-0 left-0 z-40 w-64 -translate-x-full overflow-y-auto bg-black p-8 transition-transform duration-200 peer-checked:translate-x-0 md:static md:translate-x-0">
          <div className="mb-12 mt-12 rounded bg-white p-3 md:mt-0">
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

        <label
          htmlFor="mobile-nav-toggle"
          className="fixed inset-0 z-30 hidden bg-black/50 peer-checked:block md:hidden"
          aria-hidden="true"
        />

        <main className="min-w-0 flex-1 p-4 pt-20 md:p-10 md:pt-10">{children}</main>
      </div>
    </div>
  );
}

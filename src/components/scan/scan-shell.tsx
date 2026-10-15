import type { ReactNode } from "react";

/** Gemeinsamer Rahmen für die mobilen Mitarbeiter-Seiten (/scan, /me). */
export function ScanShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-light">
      <header className="bg-[#141414] px-5 pb-7 pt-6">
        <div className="mx-auto max-w-md">
          <span className="font-serif text-2xl font-light tracking-wide text-white">
            Lucid<span className="align-super text-sm text-gold">*</span>
          </span>
          <h1 className="mt-5 font-serif text-3xl font-light leading-tight text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 font-sans text-sm font-light text-white/60">{subtitle}</p>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-md px-5 py-6">{children}</main>
    </div>
  );
}

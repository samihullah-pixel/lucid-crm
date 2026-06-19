import Link from "next/link";
import { createProcedure } from "@/actions/procedures";

export default function NewProcedurePage() {
  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light text-black">Neue Anleitung</h1>
        <p className="font-sans text-sm font-light text-grey">
          Erst Name & Kurzbeschreibung — danach baust du die Schritte.
        </p>
      </div>

      <form action={createProcedure} className="space-y-4 rounded-lg border border-gold/20 bg-white p-6">
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">
            Name
          </label>
          <input
            name="name"
            required
            autoFocus
            placeholder="z.B. Bus-Innenreinigung"
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">
            Kurzbeschreibung (optional)
          </label>
          <input
            name="description"
            placeholder="z.B. Schicht 06:00–10:00 · ca. 14 Busse"
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-6 py-2.5 font-sans text-[11px] uppercase tracking-[3px] text-black"
          >
            Anlegen & weiter
          </button>
          <Link
            href="/sop-procedures"
            className="rounded-full border border-black/10 px-6 py-2.5 font-sans text-[11px] uppercase tracking-[2px] text-grey"
          >
            Abbrechen
          </Link>
        </div>
      </form>
    </div>
  );
}

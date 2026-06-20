import Link from "next/link";
import { createProcedure, createProcedureFromTemplate } from "@/actions/procedures";
import { SOP_TEMPLATES } from "@/lib/sop-templates";

export default function NewProcedurePage() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-light text-black">Neue Anleitung</h1>
        <p className="font-sans text-sm font-light text-grey">
          Mit einer Vorlage starten — oder leer beginnen.
        </p>
      </div>

      {/* VORLAGEN NACH OBJEKTTYP */}
      <section className="space-y-4">
        <h2 className="font-sans text-[11px] uppercase tracking-[2px] text-gold-dark">
          Vorlage nach Objekttyp
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SOP_TEMPLATES.map((tpl) => (
            <form key={tpl.id} action={createProcedureFromTemplate}>
              <input type="hidden" name="templateId" value={tpl.id} />
              <button
                type="submit"
                className="flex w-full items-start gap-3 rounded-xl border border-gold/20 bg-white p-4 text-left transition-colors hover:border-gold hover:shadow-[0_6px_24px_rgba(201,169,110,0.15)]"
              >
                <span className="text-2xl leading-none">{tpl.icon}</span>
                <span className="min-w-0">
                  <span className="block font-sans text-sm text-black">{tpl.label}</span>
                  <span className="mt-0.5 block font-sans text-xs font-light leading-snug text-grey">
                    {tpl.steps.length} Schritte · {tpl.equipment.length} Equipment
                  </span>
                </span>
              </button>
            </form>
          ))}
        </div>
        <p className="font-sans text-xs font-light text-grey">
          Die Vorlage füllt Abschnitte, Schritte, Tipps und Equipment vor — danach
          passt du Details an und fügst eigene Fotos hinzu.
        </p>
      </section>

      {/* LEER STARTEN */}
      <section className="space-y-4">
        <h2 className="font-sans text-[11px] uppercase tracking-[2px] text-gold-dark">
          Oder leer beginnen
        </h2>
        <form action={createProcedure} className="space-y-4 rounded-lg border border-black/10 bg-white p-6">
          <div>
            <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">
              Name
            </label>
            <input
              name="name"
              required
              placeholder="z.B. Büroreinigung Standort Nord"
              className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">
              Kurzbeschreibung (optional)
            </label>
            <input
              name="description"
              placeholder="z.B. Schicht 06:00–10:00 · 3. OG"
              className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-6 py-2.5 font-sans text-[11px] uppercase tracking-[3px] text-black"
            >
              Leer anlegen & weiter
            </button>
            <Link
              href="/sop-procedures"
              className="rounded-full border border-black/10 px-6 py-2.5 font-sans text-[11px] uppercase tracking-[2px] text-grey"
            >
              Abbrechen
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}

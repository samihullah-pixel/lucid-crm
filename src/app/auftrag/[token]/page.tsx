import { notFound } from "next/navigation";
import type { Metadata, Viewport } from "next";
import { prisma } from "@/lib/prisma";
import {
  confirmSubcontractRequest,
  proposeSubcontractDate,
  declineSubcontractRequest,
} from "@/actions/subcontract";

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#080808",
};

export const metadata: Metadata = {
  title: "Lucid* — Terminanfrage",
  robots: { index: false, follow: false },
};

function fmtDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function fmtPrice(price: unknown): string {
  return `${Number(price).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
}

export default async function AuftragPage(props: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await props.params;
  const req = await prisma.subcontractRequest.findUnique({
    where: { confirmToken: token },
    include: { partner: true, property: true },
  });
  if (!req) notFound();

  const location = [
    req.property.name,
    req.property.address,
    [req.property.postalCode, req.property.city].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");

  const confirm = confirmSubcontractRequest.bind(null, token);
  const propose = proposeSubcontractDate.bind(null, token);
  const decline = declineSubcontractRequest.bind(null, token);

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div className="border-b border-white/10 py-3">
      <p className="font-sans text-[10px] uppercase tracking-[2px] text-grey">{label}</p>
      <p className="mt-1 font-sans text-base font-light text-white">{value}</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <p className="font-serif text-3xl font-light text-gold">Lucid*</p>
          <p className="mt-1 font-sans text-[11px] uppercase tracking-[3px] text-grey">
            Terminanfrage
          </p>
        </div>

        <div className="rounded-lg border border-gold/20 bg-[#0d0d0d] p-6">
          <Field label="Leistung" value={req.serviceDescription} />
          <Field label="Objekt" value={location} />
          <Field label="Wunschtermin" value={fmtDate(req.requestedDate)} />
          <Field label="Vergütung (fest)" value={fmtPrice(req.partnerPrice)} />

          {req.status === "ANGEFRAGT" ? (
            <div className="mt-6 space-y-5">
              <form action={confirm}>
                <button
                  type="submit"
                  className="w-full rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold py-3 font-sans text-[12px] uppercase tracking-[3px] text-black"
                >
                  Termin bestätigen
                </button>
              </form>

              <details className="rounded border border-white/10 p-4">
                <summary className="cursor-pointer font-sans text-[11px] uppercase tracking-[2px] text-grey">
                  Alternativtermin vorschlagen
                </summary>
                <form action={propose} className="mt-4 space-y-3">
                  <div>
                    <label className="mb-1 block font-sans text-[10px] uppercase tracking-[2px] text-grey">
                      Neuer Termin
                    </label>
                    <input
                      name="proposedDate"
                      type="date"
                      required
                      className="w-full rounded border border-white/15 bg-black px-3 py-2 font-sans text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-sans text-[10px] uppercase tracking-[2px] text-grey">
                      Notiz (optional)
                    </label>
                    <textarea
                      name="note"
                      rows={2}
                      className="w-full rounded border border-white/15 bg-black px-3 py-2 font-sans text-sm text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-full border border-gold/40 py-2.5 font-sans text-[11px] uppercase tracking-[2px] text-gold hover:border-gold"
                  >
                    Alternativtermin senden
                  </button>
                </form>
              </details>

              <details className="rounded border border-white/10 p-4">
                <summary className="cursor-pointer font-sans text-[11px] uppercase tracking-[2px] text-grey">
                  Ablehnen
                </summary>
                <form action={decline} className="mt-4 space-y-3">
                  <textarea
                    name="note"
                    rows={2}
                    placeholder="Grund (optional)"
                    className="w-full rounded border border-white/15 bg-black px-3 py-2 font-sans text-sm text-white"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-full border border-white/20 py-2.5 font-sans text-[11px] uppercase tracking-[2px] text-grey hover:border-white/40"
                  >
                    Anfrage ablehnen
                  </button>
                </form>
              </details>
            </div>
          ) : (
            <div className="mt-6 rounded border border-gold/20 bg-black p-4 text-center">
              <p className="font-sans text-sm font-light text-white">
                {req.status === "BESTAETIGT" &&
                  "Vielen Dank — der Termin ist bestätigt. Wir haben alles Weitere veranlasst."}
                {req.status === "TERMIN_VORGESCHLAGEN" &&
                  `Ihr Alternativvorschlag${req.proposedDate ? ` (${fmtDate(req.proposedDate)})` : ""} wurde übermittelt. Wir melden uns.`}
                {req.status === "ABGELEHNT" && "Sie haben diese Anfrage abgelehnt."}
                {req.status === "STORNIERT" && "Diese Anfrage wurde storniert."}
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 text-center font-sans text-[10px] uppercase tracking-[2px] text-grey/50">
          Lucid* Cleaning Services
        </p>
      </div>
    </main>
  );
}

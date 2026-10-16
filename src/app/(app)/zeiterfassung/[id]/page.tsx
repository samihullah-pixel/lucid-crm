import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { markReviewed } from "@/actions/checklist";
import { loadCustomerReport } from "@/actions/customer-report";
import { SendReportButton } from "@/components/forms/send-report-button";
import {
  FLAG_LABELS,
  formatDateTime,
  formatDuration,
  minutesBetween,
} from "@/lib/time-entry";

export const dynamic = "force-dynamic";

function mapLink(lat: number | null, lng: number | null) {
  if (lat == null || lng == null) return null;
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function Place({
  title,
  lat,
  lng,
  accuracy,
  distance,
}: {
  title: string;
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  distance: number | null;
}) {
  const link = mapLink(lat, lng);
  return (
    <div>
      <p className="font-sans text-[10px] uppercase tracking-[2px] text-grey">{title}</p>
      {link ? (
        <>
          <a href={link} target="_blank" rel="noreferrer" className="text-gold-dark underline underline-offset-4">
            {lat!.toFixed(5)}, {lng!.toFixed(5)}
          </a>
          <p className="text-xs font-light text-grey">
            {distance != null ? `${distance} m vom Objekt` : "Objekt ohne Koordinaten"}
            {accuracy != null ? `, Genauigkeit ±${Math.round(accuracy)} m` : ""}
          </p>
        </>
      ) : (
        <p className="font-light text-grey">Kein Standort übermittelt</p>
      )}
    </div>
  );
}

export default async function TimeEntryDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const entry = await prisma.timeEntry.findUnique({
    where: { id },
    include: {
      employee: true,
      property: {
        include: {
          customer: { select: { companyName: true } },
          checklistTemplate: { include: { items: { orderBy: { order: "asc" } } } },
        },
      },
      checks: true,
      photos: { orderBy: { uploadedAt: "asc" } },
    },
  });
  if (!entry) notFound();

  const checkedIds = new Set(entry.checks.filter((c) => c.checked).map((c) => c.itemId));
  // Archivierte Punkte nur zeigen, wenn sie in dieser Schicht abgehakt wurden.
  const items = (entry.property.checklistTemplate?.items ?? []).filter(
    (i) => !i.archived || checkedIds.has(i.id)
  );
  const sections = Array.from(new Set(items.map((i) => i.section)));
  const minutes = entry.endedAt ? minutesBetween(entry.startedAt, entry.endedAt) : null;
  const review = entry.status === "REVIEW";
  const markDone = markReviewed.bind(null, entry.id);
  const reportEmail = entry.property.customerReportEmail;
  const report = reportEmail ? (await loadCustomerReport(entry.id))?.report ?? null : null;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/zeiterfassung" className="font-sans text-[11px] uppercase tracking-wide text-gold-dark hover:text-gold">
          Alle Schichten
        </Link>
        <h1 className="mt-2 font-serif text-3xl font-light text-black">{entry.number}</h1>
        <p className="font-sans text-sm font-light text-grey">
          {entry.employee.firstName} {entry.employee.lastName} · {entry.property.name} ({entry.property.customer.companyName})
        </p>
      </div>

      {(review || entry.flags.length > 0) && (
        <div className={`rounded-lg border p-5 ${review ? "border-red-200 bg-red-50" : "border-gold/20 bg-white"}`}>
          <p className={`font-sans text-[11px] uppercase tracking-[3px] ${review ? "text-red-700" : "text-grey"}`}>
            {review ? "Prüfen" : entry.reviewedAt ? "Geprüft" : "Hinweise"}
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {entry.flags.map((f) => (
              <li key={f}>{FLAG_LABELS[f] ?? f}</li>
            ))}
          </ul>
          {review && (
            <form action={markDone} className="mt-4">
              <button type="submit" className="rounded-full border border-gold px-4 py-2 font-sans text-[11px] uppercase tracking-wide text-gold-dark hover:bg-gold/10">
                Als geprüft markieren
              </button>
            </form>
          )}
        </div>
      )}

      <div className="grid gap-4 rounded-lg border border-gold/20 bg-white p-6 text-sm md:grid-cols-4">
        <div>
          <p className="font-sans text-[10px] uppercase tracking-[2px] text-grey">Start</p>
          <p>{formatDateTime(entry.startedAt)}</p>
        </div>
        <div>
          <p className="font-sans text-[10px] uppercase tracking-[2px] text-grey">Ende</p>
          <p>{entry.endedAt ? formatDateTime(entry.endedAt) : "läuft noch"}</p>
        </div>
        <div>
          <p className="font-sans text-[10px] uppercase tracking-[2px] text-grey">Dauer</p>
          <p>
            {minutes != null ? formatDuration(minutes) : "—"}
            {entry.property.targetMinutes ? ` (Soll ${formatDuration(entry.property.targetMinutes)})` : ""}
          </p>
        </div>
        <div>
          <p className="font-sans text-[10px] uppercase tracking-[2px] text-grey">Notizen</p>
          <p>{entry.notes ?? "—"}</p>
        </div>
        <Place title="Standort Start" lat={entry.startLat} lng={entry.startLng} accuracy={entry.startAccuracy} distance={entry.startDistanceM} />
        <Place title="Standort Ende" lat={entry.endLat} lng={entry.endLng} accuracy={entry.endAccuracy} distance={entry.endDistanceM} />
      </div>

      <div className="rounded-lg border border-gold/20 bg-white p-6">
        <h2 className="font-sans text-[11px] uppercase tracking-[3px] text-gold-dark">
          Checkliste ({items.filter((i) => checkedIds.has(i.id)).length} von {items.length})
        </h2>
        {items.length === 0 ? (
          <p className="mt-3 text-sm font-light text-grey">Für dieses Objekt ist keine Checkliste hinterlegt.</p>
        ) : (
          <div className="mt-3 space-y-4">
            {sections.map((s) => (
              <div key={s}>
                <p className="mb-1 font-sans text-[10px] uppercase tracking-[2px] text-grey">{s}</p>
                <ul className="space-y-1 text-sm">
                  {items.filter((i) => i.section === s).map((i) => (
                    <li key={i.id} className={checkedIds.has(i.id) ? "" : "text-red-700"}>
                      {checkedIds.has(i.id) ? "✓" : "○"} {i.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-gold/20 bg-white p-6">
        <h2 className="font-sans text-[11px] uppercase tracking-[3px] text-gold-dark">Kundenbericht</h2>
        {!reportEmail ? (
          <p className="mt-3 text-sm font-light text-grey">
            Nicht aktiviert. Hinterlege beim Objekt eine Kunden-E-Mail, um Berichte zu verschicken.
          </p>
        ) : (
          <div className="mt-3 space-y-4 text-sm">
            <p className="font-light text-grey">
              Empfänger: {reportEmail}. Der Bericht nennt nur den Einsatztag und die erledigten Leistungen, keine Uhrzeiten, Fotos, Preise oder internen Hinweise. Er wird nur nach deiner Freigabe gesendet.
            </p>
            {report && (
              <pre className="whitespace-pre-wrap rounded bg-light p-4 font-sans text-sm font-light">
                {report.subject}
                {"\n\n"}
                {report.text}
              </pre>
            )}
            {entry.customerReportSentAt ? (
              <p className="text-gold-dark">Gesendet am {formatDateTime(entry.customerReportSentAt)}</p>
            ) : entry.status === "DONE" ? (
              <SendReportButton entryId={entry.id} email={reportEmail} />
            ) : (
              <p className="font-light text-grey">
                {entry.status === "REVIEW"
                  ? "Erst nach dem Markieren als geprüft sendbar."
                  : "Erst nach Ende der Schicht sendbar."}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-gold/20 bg-white p-6">
        <h2 className="font-sans text-[11px] uppercase tracking-[3px] text-gold-dark">Fotos ({entry.photos.length})</h2>
        {entry.photos.length === 0 ? (
          <p className="mt-3 text-sm font-light text-grey">Keine Fotos.</p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            {entry.photos.map((p) => (
              <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="aspect-square w-full rounded object-cover" />
                <p className="mt-1 text-xs font-light text-grey">{formatDateTime(p.uploadedAt)}</p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

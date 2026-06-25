import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppointmentForm } from "@/components/forms/appointment-form";
import { acceptProposedDate, resendSubcontractRequest } from "@/actions/subcontract";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  ANGEFRAGT: "Angefragt – wartet auf Partner",
  TERMIN_VORGESCHLAGEN: "Partner schlägt Alternativtermin vor",
  BESTAETIGT: "Bestätigt – fest eingeplant",
  ABGELEHNT: "Vom Partner abgelehnt",
  STORNIERT: "Storniert",
};

function fmtDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

export default async function EditAppointmentPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const [appointment, properties, employees, subRequest] = await Promise.all([
    prisma.appointment.findUnique({ where: { id: params.id } }),
    prisma.property.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, customer: { select: { companyName: true } } },
    }),
    prisma.employee.findMany({
      where: { isActive: true },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true },
    }),
    prisma.subcontractRequest.findFirst({
      where: { appointmentId: params.id },
      orderBy: { createdAt: "desc" },
      include: { partner: true },
    }),
  ]);

  if (!appointment) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light text-black">Termin bearbeiten</h1>
        <p className="font-sans text-sm font-light text-grey">Aktualisiere "{appointment.title}".</p>
      </div>

      {subRequest && (
        <div className="rounded-lg border border-gold/30 bg-white p-6">
          <h2 className="font-sans text-[11px] uppercase tracking-[2px] text-grey">Fremdleistung / Subunternehmer</h2>
          <div className="mt-3 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
            <p><span className="text-grey">Partner:</span> {subRequest.partner.name}</p>
            <p><span className="text-grey">Status:</span> {statusLabels[subRequest.status] ?? subRequest.status}</p>
            <p><span className="text-grey">Leistung:</span> {subRequest.serviceDescription}</p>
            <p><span className="text-grey">Termin:</span> {fmtDate(subRequest.requestedDate)}</p>
            <p><span className="text-grey">Partnerpreis (intern):</span> {Number(subRequest.partnerPrice).toFixed(2)} €</p>
            {subRequest.customerPrice != null && (
              <p><span className="text-grey">Kundenpreis:</span> {Number(subRequest.customerPrice).toFixed(2)} €</p>
            )}
          </div>

          {subRequest.status === "TERMIN_VORGESCHLAGEN" && subRequest.proposedDate && (
            <div className="mt-4 rounded border border-gold/40 bg-light/50 p-4">
              <p className="text-sm">
                Partner schlägt vor: <strong>{fmtDate(subRequest.proposedDate)}</strong>
                {subRequest.partnerNote && <> — „{subRequest.partnerNote}"</>}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <form action={acceptProposedDate.bind(null, subRequest.id)}>
                  <button type="submit" className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-4 py-1.5 font-sans text-[11px] uppercase tracking-[2px] text-black">
                    Alternativtermin übernehmen
                  </button>
                </form>
                <form action={resendSubcontractRequest.bind(null, subRequest.id)}>
                  <button type="submit" className="rounded-full border border-gold/40 px-4 py-1.5 font-sans text-[11px] uppercase tracking-[2px] text-gold-dark hover:border-gold">
                    Ursprungstermin erneut anfragen
                  </button>
                </form>
              </div>
            </div>
          )}

          {(subRequest.status === "ABGELEHNT" || subRequest.status === "STORNIERT") && (
            <form action={resendSubcontractRequest.bind(null, subRequest.id)} className="mt-4">
              <button type="submit" className="rounded-full border border-gold/40 px-4 py-1.5 font-sans text-[11px] uppercase tracking-[2px] text-gold-dark hover:border-gold">
                Anfrage erneut senden
              </button>
            </form>
          )}
        </div>
      )}

      <AppointmentForm properties={properties} employees={employees} initialValues={appointment} />
    </div>
  );
}

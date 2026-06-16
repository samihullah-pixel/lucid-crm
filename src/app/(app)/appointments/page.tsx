import Link from "next/link";
import { prisma } from "@/lib/prisma";

const weekdayLabels: Record<number, string> = {
  1: "Mo",
  2: "Di",
  3: "Mi",
  4: "Do",
  5: "Fr",
  6: "Sa",
  7: "So",
};

export default async function AppointmentsPage() {
  const appointments = await prisma.appointment.findMany({
    orderBy: { createdAt: "desc" },
    include: { property: { include: { customer: true } }, employee: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-black">Termine</h1>
          <p className="font-sans text-sm font-light text-grey">Wiederkehrende und einmalige Termine.</p>
        </div>
        <Link
          href="/appointments/new"
          className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 text-[11px] font-sans uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]"
        >
          Neuer Termin
        </Link>
      </div>
      <div className="border border-gold/20 bg-white p-6">
        {appointments.length === 0 ? (
          <p className="font-sans text-sm font-light text-grey">Noch keine Termine vorhanden.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-grey text-[11px] uppercase tracking-wide">
                <th className="py-2 pr-4">Titel</th>
                <th className="py-2 pr-4">Objekt</th>
                <th className="py-2 pr-4">Mitarbeiter</th>
                <th className="py-2 pr-4">Rhythmus</th>
                <th className="py-2 pr-4">Tage</th>
                <th className="py-2 pr-4">Zeit</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id} className="border-b border-black/10 last:border-0">
                  <td className="py-2 pr-4">{a.title}</td>
                  <td className="py-2 pr-4">
                    {a.property.name} ({a.property.customer.companyName})
                  </td>
                  <td className="py-2 pr-4">
                    {a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : "-"}
                  </td>
                  <td className="py-2 pr-4">{a.intervalType}</td>
                  <td className="py-2 pr-4">
                    {a.weekdays.length > 0 ? a.weekdays.map((w) => weekdayLabels[w]).join(", ") : "-"}
                  </td>
                  <td className="py-2 pr-4">
                    {a.startTime ?? "-"}
                    {a.endTime ? ` - ${a.endTime}` : ""}
                  </td>
                  <td className="py-2 pr-4">{a.status}</td>
                  <td className="py-2 pr-4">
                    <Link href={`/appointments/${a.id}/edit`} className="font-sans text-xs uppercase tracking-wide text-gold-dark hover:text-gold">
                      Bearbeiten
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}

import { AppointmentForm } from "@/components/forms/appointment-form";
import { prisma } from "@/lib/prisma";

export default async function NewAppointmentPage() {
  const [properties, employees] = await Promise.all([
    prisma.property.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, customer: { select: { companyName: true } } },
    }),
    prisma.employee.findMany({
      where: { isActive: true },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light text-black">Neuen Termin anlegen</h1>
        <p className="font-sans text-sm font-light text-grey">Lege einen Regel- oder Einzeltermin fuer ein Objekt an.</p>
      </div>
      <AppointmentForm properties={properties} employees={employees} />
    </div>
  );
}

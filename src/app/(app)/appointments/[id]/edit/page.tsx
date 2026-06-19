import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppointmentForm } from "@/components/forms/appointment-form";

export default async function EditAppointmentPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const [appointment, properties, employees] = await Promise.all([
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
  ]);

  if (!appointment) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light text-black">Termin bearbeiten</h1>
        <p className="font-sans text-sm font-light text-grey">Aktualisiere "{appointment.title}".</p>
      </div>
      <AppointmentForm properties={properties} employees={employees} initialValues={appointment} />
    </div>
  );
}

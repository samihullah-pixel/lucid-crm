import { CleaningJobForm } from "@/components/forms/cleaning-job-form";
import { prisma } from "@/lib/prisma";

export default async function NewCleaningJobPage(
  props: {
    searchParams: Promise<{ date?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const [customers, properties, employees] = await Promise.all([
    prisma.customer.findMany({ orderBy: { companyName: "asc" }, select: { id: true, companyName: true } }),
    prisma.property.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, customerId: true } }),
    prisma.employee.findMany({ where: { isActive: true }, orderBy: { firstName: "asc" }, select: { id: true, firstName: true, lastName: true } }),
  ]);

  const prefillDate = searchParams.date ? new Date(searchParams.date) : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light text-black">Neuen Einsatz anlegen</h1>
        <p className="font-sans text-sm font-light text-grey">Erfasse einen durchgeführten oder geplanten Einsatz.</p>
      </div>
      <CleaningJobForm
        customers={customers}
        properties={properties}
        employees={employees}
        defaultDate={prefillDate}
      />
    </div>
  );
}

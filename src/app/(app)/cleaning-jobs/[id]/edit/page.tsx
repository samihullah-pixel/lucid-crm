import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CleaningJobForm } from "@/components/forms/cleaning-job-form";

export default async function EditCleaningJobPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const [job, customers, properties, employees] = await Promise.all([
    prisma.cleaningJob.findUnique({ where: { id: params.id } }),
    prisma.customer.findMany({
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true },
    }),
    prisma.property.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, customerId: true },
    }),
    prisma.employee.findMany({
      where: { isActive: true },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);

  if (!job) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light text-black">Einsatz bearbeiten</h1>
        <p className="font-sans text-sm font-light text-grey">
          Aktualisiere den Einsatz vom {job.date.toLocaleDateString("de-DE")}.
        </p>
      </div>
      <CleaningJobForm customers={customers} properties={properties} employees={employees} initialValues={job} />
    </div>
  );
}

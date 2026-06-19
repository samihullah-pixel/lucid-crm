import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EmployeeForm } from "@/components/forms/employee-form";

export default async function EditEmployeePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const employee = await prisma.employee.findUnique({ where: { id: params.id } });
  if (!employee) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light text-black">Mitarbeiter bearbeiten</h1>
        <p className="font-sans text-sm font-light text-grey">
          Aktualisiere die Stammdaten von {employee.firstName} {employee.lastName}.
        </p>
      </div>
      <EmployeeForm initialValues={employee} />
    </div>
  );
}

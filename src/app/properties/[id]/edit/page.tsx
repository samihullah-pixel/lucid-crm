import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PropertyForm } from "@/components/forms/property-form";

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  const [property, customers] = await Promise.all([
    prisma.property.findUnique({ where: { id: params.id } }),
    prisma.customer.findMany({
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true },
    }),
  ]);

  if (!property) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light text-black">Objekt bearbeiten</h1>
        <p className="font-sans text-sm font-light text-grey">
          Aktualisiere die Daten von {property.name}.
        </p>
      </div>
      <PropertyForm customers={customers} initialValues={property} />
    </div>
  );
}

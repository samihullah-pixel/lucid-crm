import { PropertyForm } from "@/components/forms/property-form";
import { prisma } from "@/lib/prisma";

export default async function NewPropertyPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { companyName: "asc" },
    select: { id: true, companyName: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light text-black">Neues Objekt anlegen</h1>
        <p className="font-sans text-sm font-light text-grey">
          Erfasse einen Einsatzort fuer einen bestehenden Kunden.
        </p>
      </div>
      <PropertyForm customers={customers} />
    </div>
  );
}

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CustomerForm } from "@/components/forms/customer-form";

export default async function EditCustomerPage({ params }: { params: { id: string } }) {
  const customer = await prisma.customer.findUnique({ where: { id: params.id } });
  if (!customer) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light text-black">Kunde bearbeiten</h1>
        <p className="font-sans text-sm font-light text-grey">
          Aktualisiere die Stammdaten von {customer.companyName}.
        </p>
      </div>
      <CustomerForm initialValues={customer} />
    </div>
  );
}

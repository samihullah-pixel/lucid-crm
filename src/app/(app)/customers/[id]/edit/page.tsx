import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CustomerForm } from "@/components/forms/customer-form";
import Link from "next/link";

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
      <div className="flex gap-3">
        <Link
          href={`/customers/${customer.id}/supply`}
          className="rounded-full border border-gold/40 px-4 py-1.5 font-sans text-[11px] uppercase tracking-[2px] text-gold-dark hover:border-gold"
        >
          Verbrauchsmittel-Plan
        </Link>
      </div>
      <CustomerForm initialValues={customer} />
    </div>
  );
}

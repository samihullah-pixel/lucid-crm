import { ExtraWorkForm } from "@/components/forms/extra-work-form";
import { prisma } from "@/lib/prisma";

export default async function NewExtraWorkPage() {
  const [customers, properties] = await Promise.all([
    prisma.customer.findMany({
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true },
    }),
    prisma.property.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light text-black">Neue Zusatzarbeit anlegen</h1>
        <p className="font-sans text-sm font-light text-grey">Erfasse eine Extraleistung ausserhalb des Regelauftrags.</p>
      </div>
      <ExtraWorkForm customers={customers} properties={properties} />
    </div>
  );
}

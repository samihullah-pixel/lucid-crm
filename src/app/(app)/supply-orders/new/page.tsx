import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SupplyOrderBuilder } from "@/components/forms/supply-order-builder";

export const dynamic = "force-dynamic";

export default async function NewSupplyOrderPage() {
  const [properties, suppliers, employees] = await Promise.all([
    prisma.property.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        address: true,
        postalCode: true,
        city: true,
        customer: { select: { companyName: true } },
      },
    }),
    prisma.supplier.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        customerNumber: true,
        defaultCc: true,
        products: {
          where: { isActive: true },
          orderBy: { name: "asc" },
          select: { id: true, name: true, unit: true, unitPrice: true, imageUrl: true },
        },
      },
    }),
    prisma.employee.findMany({
      where: { isActive: true },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);

  // Prisma Decimal lässt sich nicht direkt an eine Client-Komponente übergeben.
  const suppliersForClient = suppliers.map((s) => ({
    ...s,
    products: s.products.map((p) => ({ ...p, unitPrice: Number(p.unitPrice) })),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-light text-black">Neue Bestellung</h1>
          <p className="font-sans text-sm font-light text-grey">
            Objekt und Artikel wählen – die Bestellung geht direkt an den Lieferanten.
          </p>
        </div>
        <Link
          href="/supply-orders"
          className="font-sans text-[11px] uppercase tracking-[2px] text-grey hover:text-gold-dark"
        >
          ← Zurück zur Übersicht
        </Link>
      </div>

      {properties.length === 0 || suppliers.length === 0 ? (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 font-sans text-sm text-yellow-800">
          {properties.length === 0
            ? "Es sind noch keine Objekte angelegt. "
            : ""}
          {suppliers.length === 0
            ? "Es sind noch keine Lieferanten mit Artikeln angelegt."
            : ""}
        </div>
      ) : (
        <SupplyOrderBuilder
          properties={properties}
          suppliers={suppliersForClient}
          employees={employees}
        />
      )}
    </div>
  );
}

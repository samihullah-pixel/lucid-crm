import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { createCustomerSupplyItem, deleteCustomerSupplyItem } from "@/actions/supply-items";
import { DeleteButton } from "@/components/ui/delete-button";
import Link from "next/link";

const INTERVAL_OPTIONS = [
  { label: "Wöchentlich", days: 7 },
  { label: "2-Wöchentlich", days: 14 },
  { label: "3-Wöchentlich", days: 21 },
  { label: "Monatlich (28 Tage)", days: 28 },
  { label: "6-Wöchentlich", days: 42 },
  { label: "2-Monatlich", days: 60 },
  { label: "Quartalsweise", days: 90 },
];

export default async function CustomerSupplyPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const customer = await prisma.customer.findUnique({ where: { id: params.id } });
  if (!customer) notFound();

  const [supplyItems, allProducts] = await Promise.all([
    prisma.customerSupplyItem.findMany({
      where: { customerId: params.id },
      include: { product: { include: { supplier: true } } },
      orderBy: { nextDueAt: "asc" },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      include: { supplier: true },
      orderBy: [{ supplier: { name: "asc" } }, { name: "asc" }],
    }),
  ]);

  const addItem = createCustomerSupplyItem;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-black">Verbrauchsmittel</h1>
          <p className="font-sans text-sm font-light text-grey">{customer.companyName} – automatische Bestellungen</p>
        </div>
        <Link href={`/customers/${params.id}/edit`} className="font-sans text-[11px] uppercase tracking-wide text-gold-dark hover:text-gold">
          ← Zurück zum Kunden
        </Link>
      </div>

      {/* Aktive Bestellpläne */}
      <div className="border border-gold/20 bg-white p-6 space-y-4">
        <h2 className="font-sans text-[11px] uppercase tracking-[2px] text-grey">Bestellpläne</h2>
        {supplyItems.length === 0 ? (
          <p className="font-sans text-sm font-light text-grey">Noch keine Artikel konfiguriert.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-[10px] uppercase tracking-[2px] text-grey">
                <th className="py-2 pr-4">Artikel</th>
                <th className="py-2 pr-4">Lieferant</th>
                <th className="py-2 pr-4">Menge</th>
                <th className="py-2 pr-4">Intervall</th>
                <th className="py-2 pr-4">Nächste Bestellung</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4" />
              </tr>
            </thead>
            <tbody>
              {supplyItems.map((item) => {
                const del = deleteCustomerSupplyItem.bind(null, item.id, params.id);
                const due = new Date(item.nextDueAt);
                due.setHours(0, 0, 0, 0);
                const isOverdue = due <= today && item.active;
                return (
                  <tr key={item.id} className="border-b border-black/5 last:border-0 transition-colors hover:bg-light/60">
                    <td className="py-2 pr-4">{item.product.name}</td>
                    <td className="py-2 pr-4 text-grey">{item.product.supplier.name}</td>
                    <td className="py-2 pr-4">{item.quantity} {item.product.unit ?? "Stk"}</td>
                    <td className="py-2 pr-4">alle {item.intervalDays} Tage</td>
                    <td className={`py-2 pr-4 ${isOverdue ? "text-red-600 font-medium" : ""}`}>
                      {new Date(item.nextDueAt).toLocaleDateString("de-DE")}
                      {isOverdue && " ⚠"}
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`font-sans text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${item.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                        {item.active ? "Aktiv" : "Pausiert"}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <DeleteButton action={del} confirm={`Bestellplan für "${item.product.name}" löschen?`} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Neuen Artikel hinzufügen */}
      {allProducts.length > 0 && (
        <div className="rounded-lg border border-gold/20 bg-white p-6">
          <h2 className="font-sans text-[11px] uppercase tracking-[2px] text-grey mb-4">Artikel hinzufügen</h2>
          <form action={addItem} className="grid grid-cols-2 gap-4 max-w-xl">
            <input type="hidden" name="customerId" value={params.id} />
            <div className="col-span-2">
              <label className="block font-sans text-[11px] uppercase tracking-wide text-grey mb-1">Produkt *</label>
              <select name="productId" required className="w-full border border-black/20 px-3 py-2 font-sans text-sm">
                <option value="">– Bitte wählen –</option>
                {allProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.supplier.name} – {p.name} ({Number(p.unitPrice).toFixed(2)} €/{p.unit ?? "Stk"})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-sans text-[11px] uppercase tracking-wide text-grey mb-1">Menge *</label>
              <input name="quantity" type="number" min="1" defaultValue={1} required className="w-full border border-black/20 px-3 py-2 font-sans text-sm" />
            </div>
            <div>
              <label className="block font-sans text-[11px] uppercase tracking-wide text-grey mb-1">Intervall *</label>
              <select name="intervalDays" required className="w-full border border-black/20 px-3 py-2 font-sans text-sm">
                {INTERVAL_OPTIONS.map((o) => (
                  <option key={o.days} value={o.days}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-sans text-[11px] uppercase tracking-wide text-grey mb-1">Erste Bestellung</label>
              <input name="startDate" type="date" defaultValue={new Date().toISOString().split("T")[0]} className="w-full border border-black/20 px-3 py-2 font-sans text-sm" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 font-sans text-[11px] uppercase tracking-[3px] text-black">
                Hinzufügen
              </button>
            </div>
          </form>
        </div>
      )}
      {allProducts.length === 0 && (
        <p className="font-sans text-sm text-grey">
          Noch keine Produkte angelegt.{" "}
          <Link href="/suppliers/new" className="text-gold-dark underline">Lieferant + Produkt anlegen</Link>
        </p>
      )}
    </div>
  );
}

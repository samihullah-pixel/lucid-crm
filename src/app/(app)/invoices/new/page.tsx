import { prisma } from "@/lib/prisma";
import { InvoiceForm } from "@/components/forms/invoice-form";
import { redirect } from "next/navigation";

async function selectCustomer(formData: FormData) {
  "use server";
  const id = formData.get("customerId");
  redirect(`/invoices/new?customerId=${id}`);
}

export default async function NewInvoicePage(
  props: {
    searchParams: Promise<{ customerId?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const [customers, properties] = await Promise.all([
    prisma.customer.findMany({
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true },
    }),
    prisma.property.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, customerId: true },
    }),
  ]);

  const customerId = searchParams.customerId;

  // Offene Verbrauchsmittel für gewählten Kunden
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let unbilledSupplyItems: any[] = [];

  if (customerId) {
    unbilledSupplyItems = await prisma.supplyOrderItem.findMany({
      where: { customerId, billed: false },
      include: {
        product: { select: { name: true, unit: true } },
        order: { select: { createdAt: true, supplier: { select: { name: true } } } },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  const supplyTotal = unbilledSupplyItems.reduce(
    (sum, i) => sum + i.quantity * Number(i.unitPrice),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light text-black">Neue Rechnung anlegen</h1>
        <p className="font-sans text-sm font-light text-grey">
          Rechnungsnummer, Steuer und Bruttobetrag werden automatisch berechnet.
        </p>
      </div>

      {/* Schritt 1: Kunde wählen wenn noch nicht gewählt */}
      {!customerId ? (
        <div className="border border-gold/20 bg-white p-6 max-w-sm space-y-4">
          <p className="font-sans text-sm text-grey">Wähle zuerst den Kunden, um offene Verbrauchsmittel zu laden.</p>
          <form action={selectCustomer} className="space-y-3">
            <select
              name="customerId"
              required
              className="w-full border border-black/20 px-3 py-2 font-sans text-sm"
            >
              <option value="">– Kunde wählen –</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 font-sans text-[11px] uppercase tracking-[3px] text-black"
            >
              Weiter
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Offene Verbrauchsmittel */}
          {unbilledSupplyItems.length > 0 && (
            <div className="border border-gold/30 bg-amber-50/40 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-sans text-[11px] uppercase tracking-[2px] text-gold-dark">
                  Offene Verbrauchsmittel – {unbilledSupplyItems.length} Position{unbilledSupplyItems.length > 1 ? "en" : ""}
                </h2>
                <span className="font-sans text-sm font-medium">{supplyTotal.toFixed(2)} € netto</span>
              </div>
              <p className="font-sans text-xs text-grey">
                Diese Positionen werden als Rechnungspositionen angehängt und als verrechnet markiert.
                Haken entfernen zum Ausschließen.
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-grey border-b border-black/10">
                    <th className="py-1 pr-3 text-left w-8"></th>
                    <th className="py-1 pr-3 text-left">Artikel</th>
                    <th className="py-1 pr-3 text-left">Lieferant</th>
                    <th className="py-1 pr-3 text-left">Bestellt am</th>
                    <th className="py-1 pr-3 text-left">Menge</th>
                    <th className="py-1 pr-3 text-right">Betrag</th>
                  </tr>
                </thead>
                <tbody>
                  {unbilledSupplyItems.map((item) => (
                    <tr key={item.id} className="border-b border-black/5">
                      <td className="py-1.5 pr-3">
                        <input
                          form="invoice-form"
                          type="checkbox"
                          name="supplyItemIds"
                          value={item.id}
                          defaultChecked
                          className="accent-gold"
                        />
                      </td>
                      <td className="py-1.5 pr-3">
                        {item.product.name}
                        {item.product.unit ? ` (${item.product.unit})` : ""}
                      </td>
                      <td className="py-1.5 pr-3 text-grey">{item.order.supplier.name}</td>
                      <td className="py-1.5 pr-3 text-grey">
                        {new Date(item.order.createdAt).toLocaleDateString("de-DE")}
                      </td>
                      <td className="py-1.5 pr-3">{item.quantity}</td>
                      <td className="py-1.5 text-right">
                        {(item.quantity * Number(item.unitPrice)).toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <InvoiceForm
            customers={customers}
            properties={properties}
            preselectedCustomerId={customerId}
            supplyNetHint={supplyTotal > 0 ? supplyTotal : undefined}
          />
        </>
      )}
    </div>
  );
}

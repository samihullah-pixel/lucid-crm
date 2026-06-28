import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cancelSupplyOrder } from "@/actions/supply-items";
import { DeleteButton } from "@/components/ui/delete-button";

const SOURCE_LABEL: Record<string, string> = {
  AUTO: "Automatisch",
  MANUAL: "Manuell",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Ausstehend",
  SENT: "Versendet",
  FAILED: "Fehlgeschlagen",
  CANCELLED: "Storniert",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  SENT: "bg-green-50 text-green-700",
  FAILED: "bg-red-50 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-400",
};

export default async function SupplyOrdersPage() {
  const orders = await prisma.supplyOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      supplier: true,
      property: true,
      employee: true,
      items: {
        include: {
          customer: true,
          product: true,
        },
      },
    },
  });

  const failed = orders.filter((o) => o.status === "FAILED");
  const pending = orders.filter((o) => o.status === "PENDING");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-light text-black">Bestellungen</h1>
          <p className="font-sans text-sm font-light text-grey">Manuelle und automatisch ausgelöste Lieferantenbestellungen.</p>
        </div>
        <Link
          href="/supply-orders/new"
          className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 font-sans text-[11px] uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]"
        >
          + Neue Bestellung
        </Link>
      </div>

      {failed.length > 0 && (
        <div className="border border-red-200 bg-red-50 p-4 font-sans text-sm text-red-700">
          ⚠ {failed.length} Bestellung{failed.length > 1 ? "en" : ""} fehlgeschlagen – bitte manuell prüfen.
        </div>
      )}

      {pending.length > 0 && (
        <div className="border border-yellow-200 bg-yellow-50 p-4 font-sans text-sm text-yellow-800">
          {pending.length} Bestellung{pending.length > 1 ? "en" : ""} ausstehend (werden beim nächsten Cron-Lauf versendet).
        </div>
      )}

      <div className="border border-gold/20 bg-white p-6 space-y-6">
        {orders.length === 0 ? (
          <p className="font-sans text-sm font-light text-grey">Noch keine Bestellungen ausgelöst.</p>
        ) : (
          orders.map((order) => {
            const cancel = cancelSupplyOrder.bind(null, order.id);
            return (
              <div key={order.id} className="border-b border-black/10 pb-6 last:border-0 last:pb-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-medium">{order.supplier.name}</span>
                    <span className="ml-3 font-sans text-xs text-grey">
                      {new Date(order.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {(order.property || order.employee) && (
                      <span className="block font-sans text-xs text-grey mt-0.5">
                        {order.property ? `Lieferadresse: ${order.property.name}` : ""}
                        {order.property && order.employee ? " · " : ""}
                        {order.employee ? `Bestellt von ${order.employee.firstName} ${order.employee.lastName}` : ""}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-sans text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      {SOURCE_LABEL[order.source] ?? order.source}
                    </span>
                    <span className={`font-sans text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status] ?? ""}`}>
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                    {(order.status === "PENDING" || order.status === "FAILED") && (
                      <DeleteButton action={cancel} confirm="Bestellung stornieren?" label="Stornieren" />
                    )}
                  </div>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wide text-grey">
                      <th className="text-left py-1 pr-4">Artikel</th>
                      <th className="text-left py-1 pr-4">Kunde</th>
                      <th className="text-left py-1 pr-4">Menge</th>
                      <th className="text-left py-1 pr-4">Einzelpreis</th>
                      <th className="text-left py-1 pr-4">Verrechnet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-t border-black/5">
                        <td className="py-1 pr-4">{item.product.name}</td>
                        <td className="py-1 pr-4 text-grey">{item.customer.companyName}</td>
                        <td className="py-1 pr-4">{item.quantity}</td>
                        <td className="py-1 pr-4">{Number(item.unitPrice).toFixed(2)} €</td>
                        <td className="py-1 pr-4">
                          <span className={item.billed ? "text-green-600" : "text-grey"}>
                            {item.billed ? "✓ Ja" : "Nein"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

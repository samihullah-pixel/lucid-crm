import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateSupplier, createProduct, deleteProduct } from "@/actions/suppliers";
import { DeleteButton } from "@/components/ui/delete-button";
import { NewProductImageField, ProductRowImage } from "@/components/forms/product-image-upload";

export default async function EditSupplierPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supplier = await prisma.supplier.findUnique({
    where: { id: params.id },
    include: { products: { orderBy: { name: "asc" } } },
  });
  if (!supplier) notFound();

  const update = updateSupplier.bind(null, supplier.id);
  const addProduct = createProduct.bind(null, supplier.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-light text-black">{supplier.name}</h1>
        <p className="font-sans text-sm font-light text-grey">Lieferant bearbeiten und Produkte verwalten.</p>
      </div>

      {/* Stammdaten */}
      <form action={update} className="border border-gold/20 bg-white p-6 space-y-4 max-w-lg">
        <h2 className="font-sans text-[11px] uppercase tracking-[2px] text-grey">Stammdaten</h2>
        <div>
          <label className="block font-sans text-[11px] uppercase tracking-wide text-grey mb-1">Name *</label>
          <input name="name" defaultValue={supplier.name} required className="w-full border border-black/20 px-3 py-2 font-sans text-sm" />
        </div>
        <div>
          <label className="block font-sans text-[11px] uppercase tracking-wide text-grey mb-1">E-Mail (Bestelladresse) *</label>
          <input name="email" type="email" defaultValue={supplier.email} required className="w-full border border-black/20 px-3 py-2 font-sans text-sm" />
        </div>
        <div>
          <label className="block font-sans text-[11px] uppercase tracking-wide text-grey mb-1">Telefon</label>
          <input name="phone" defaultValue={supplier.phone ?? ""} className="w-full border border-black/20 px-3 py-2 font-sans text-sm" />
        </div>
        <div>
          <label className="block font-sans text-[11px] uppercase tracking-wide text-grey mb-1">Unsere Kundennummer (beim Lieferanten)</label>
          <input name="customerNumber" defaultValue={supplier.customerNumber ?? ""} placeholder="erscheint in jeder Bestell-Mail" className="w-full border border-black/20 px-3 py-2 font-sans text-sm" />
        </div>
        <div>
          <label className="block font-sans text-[11px] uppercase tracking-wide text-grey mb-1">Standard-CC (optional)</label>
          <input name="defaultCc" type="email" defaultValue={supplier.defaultCc ?? ""} placeholder="z.B. buchhaltung@firma.de" className="w-full border border-black/20 px-3 py-2 font-sans text-sm" />
        </div>
        <div>
          <label className="block font-sans text-[11px] uppercase tracking-wide text-grey mb-1">Notizen</label>
          <textarea name="notes" defaultValue={supplier.notes ?? ""} rows={3} className="w-full border border-black/20 px-3 py-2 font-sans text-sm" />
        </div>
        <button type="submit" className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 font-sans text-[11px] uppercase tracking-[3px] text-black">
          Speichern
        </button>
      </form>

      {/* Produkte */}
      <div className="border border-gold/20 bg-white p-6 space-y-4">
        <h2 className="font-sans text-[11px] uppercase tracking-[2px] text-grey">Produkte / Artikel</h2>
        {supplier.products.length === 0 ? (
          <p className="font-sans text-sm font-light text-grey">Noch keine Produkte.</p>
        ) : (
          <table className="w-full text-left text-sm mb-4">
            <thead>
              <tr className="border-b border-black/10 text-[10px] uppercase tracking-[2px] text-grey">
                <th className="py-2 pr-4">Foto</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Einheit</th>
                <th className="py-2 pr-4">Preis/Einheit</th>
                <th className="py-2 pr-4" />
              </tr>
            </thead>
            <tbody>
              {supplier.products.map((p) => {
                const del = deleteProduct.bind(null, p.id, supplier.id);
                return (
                  <tr key={p.id} className="border-b border-black/10 last:border-0">
                    <td className="py-2 pr-4">
                      <ProductRowImage productId={p.id} supplierId={supplier.id} imageUrl={p.imageUrl} />
                    </td>
                    <td className="py-2 pr-4">{p.name}</td>
                    <td className="py-2 pr-4">{p.unit ?? "—"}</td>
                    <td className="py-2 pr-4">{Number(p.unitPrice).toFixed(2)} €</td>
                    <td className="py-2 pr-4">
                      <DeleteButton action={del} confirm={`Produkt "${p.name}" löschen?`} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <form action={addProduct} className="border-t border-black/10 pt-4 space-y-3">
          <h3 className="font-sans text-[11px] uppercase tracking-wide text-grey">Neues Produkt</h3>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block font-sans text-[11px] uppercase tracking-wide text-grey mb-1">Foto</label>
              <NewProductImageField />
            </div>
            <div className="grid flex-1 grid-cols-3 gap-3">
            <div>
              <label className="block font-sans text-[11px] uppercase tracking-wide text-grey mb-1">Name *</label>
              <input name="name" required className="w-full border border-black/20 px-3 py-2 font-sans text-sm" />
            </div>
            <div>
              <label className="block font-sans text-[11px] uppercase tracking-wide text-grey mb-1">Einheit</label>
              <input name="unit" placeholder="Stk, Rolle, L…" className="w-full border border-black/20 px-3 py-2 font-sans text-sm" />
            </div>
            <div>
              <label className="block font-sans text-[11px] uppercase tracking-wide text-grey mb-1">Preis/Einheit (€) *</label>
              <input name="unitPrice" type="number" step="0.01" min="0" required className="w-full border border-black/20 px-3 py-2 font-sans text-sm" />
            </div>
            </div>
          </div>
          <button type="submit" className="rounded-full border border-gold/40 px-4 py-1.5 font-sans text-[11px] uppercase tracking-[2px] text-gold-dark hover:border-gold">
            + Produkt hinzufügen
          </button>
        </form>
      </div>
    </div>
  );
}

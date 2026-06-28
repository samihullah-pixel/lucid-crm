"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Building2, Truck, Check, Minus, Plus, Search, Send, Package } from "lucide-react";
import { createManualSupplyOrder } from "@/actions/supply-items";
import { cn } from "@/lib/utils";

type Property = {
  id: string;
  name: string;
  address: string;
  postalCode: string | null;
  city: string | null;
  customer: { companyName: string };
};

type Product = {
  id: string;
  name: string;
  unit: string | null;
  unitPrice: number;
  imageUrl: string | null;
};

type Supplier = {
  id: string;
  name: string;
  email: string;
  customerNumber: string | null;
  defaultCc: string | null;
  products: Product[];
};

type EmployeeOption = { id: string; firstName: string; lastName: string };

const labelClass =
  "mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey";
const inputClass =
  "w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none";

export function SupplyOrderBuilder({
  properties,
  suppliers,
  employees,
}: {
  properties: Property[];
  suppliers: Supplier[];
  employees: EmployeeOption[];
}) {
  const [propertyId, setPropertyId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [ccEmail, setCcEmail] = useState("");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();

  const property = properties.find((p) => p.id === propertyId);
  const supplier = suppliers.find((s) => s.id === supplierId);

  const filteredProducts = useMemo(() => {
    if (!supplier) return [];
    const q = search.trim().toLowerCase();
    if (!q) return supplier.products;
    return supplier.products.filter((p) => p.name.toLowerCase().includes(q));
  }, [supplier, search]);

  const selectedItems = useMemo(
    () =>
      Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .map(([productId, quantity]) => ({ productId, quantity })),
    [quantities]
  );

  const positionCount = selectedItems.length;

  function onSupplierChange(id: string) {
    setSupplierId(id);
    setQuantities({});
    setSearch("");
    const next = suppliers.find((s) => s.id === id);
    setCcEmail(next?.defaultCc ?? "");
  }

  function setQty(productId: string, qty: number) {
    setQuantities((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[productId];
      else next[productId] = qty;
      return next;
    });
  }

  const deliveryLines = property
    ? [
        property.name,
        property.address,
        [property.postalCode, property.city].filter(Boolean).join(" "),
      ].filter(Boolean)
    : [];

  const canSubmit = Boolean(propertyId && supplierId && positionCount > 0) && !isPending;

  function submit() {
    if (!canSubmit) return;
    startTransition(async () => {
      try {
        await createManualSupplyOrder({
          propertyId,
          supplierId,
          employeeId: employeeId || null,
          ccEmail: ccEmail || null,
          note: note || null,
          items: selectedItems,
        });
        // createManualSupplyOrder leitet bei Erfolg auf /supply-orders weiter.
      } catch (err) {
        const digest =
          err && typeof err === "object" && "digest" in err
            ? String((err as { digest: unknown }).digest)
            : "";
        if (digest.startsWith("NEXT_REDIRECT")) {
          toast.success("Bestellung versendet");
          return;
        }
        toast.error("Bestellung fehlgeschlagen");
      }
    });
  }

  const stepLabel = "font-sans text-[10px] uppercase tracking-[3px] text-gold-dark";

  return (
    <div className="space-y-6">
      {/* Schritt 1 + 2: Objekt & Lieferant */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-gold/20 bg-white p-6">
          <p className={stepLabel}>Schritt 1</p>
          <h2 className="mb-4 mt-1 flex items-center gap-2 font-serif text-xl font-light">
            <Building2 className="h-4 w-4 text-gold-dark" strokeWidth={1.5} /> Für welches Objekt?
          </h2>
          <select
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            className={inputClass}
          >
            <option value="">Objekt wählen …</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.customer.companyName}
              </option>
            ))}
          </select>
          {property && (
            <div className="mt-4 rounded border border-black/10 bg-light/60 p-3">
              <p className="mb-1 font-sans text-[10px] uppercase tracking-wide text-grey">
                Lieferadresse
              </p>
              <p className="whitespace-pre-line font-sans text-sm text-black">
                {deliveryLines.join("\n")}
              </p>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-gold/20 bg-white p-6">
          <p className={stepLabel}>Schritt 2</p>
          <h2 className="mb-4 mt-1 flex items-center gap-2 font-serif text-xl font-light">
            <Truck className="h-4 w-4 text-gold-dark" strokeWidth={1.5} /> Lieferant
          </h2>
          <select
            value={supplierId}
            onChange={(e) => onSupplierChange(e.target.value)}
            className={inputClass}
          >
            <option value="">Lieferant wählen …</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {supplier && (
            <div className="mt-4 space-y-1 rounded border border-black/10 bg-light/60 p-3 font-sans text-sm">
              <p className="text-grey">
                Bestell-E-Mail: <span className="text-black">{supplier.email}</span>
              </p>
              <p className="text-grey">
                Unsere Kundennummer:{" "}
                {supplier.customerNumber ? (
                  <span className="text-black">{supplier.customerNumber}</span>
                ) : (
                  <span className="text-red-500">nicht hinterlegt</span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Schritt 3: Artikel */}
      <div className="rounded-lg border border-gold/20 bg-white p-6">
        <p className={stepLabel}>Schritt 3</p>
        <div className="mb-4 mt-1 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-xl font-light">Artikel auswählen</h2>
          {supplier && (
            <span className="font-sans text-xs text-grey">
              {positionCount} Position{positionCount === 1 ? "" : "en"} gewählt
            </span>
          )}
        </div>

        {!supplier ? (
          <p className="font-sans text-sm font-light text-grey">
            Bitte zuerst einen Lieferanten wählen, um dessen Sortiment anzuzeigen.
          </p>
        ) : supplier.products.length === 0 ? (
          <p className="font-sans text-sm font-light text-grey">
            Für diesen Lieferanten sind noch keine Artikel hinterlegt.
          </p>
        ) : (
          <>
            <div className="relative mb-4">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey"
                strokeWidth={1.5}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Artikel suchen …"
                className={cn(inputClass, "pl-9")}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => {
                const qty = quantities[product.id] ?? 0;
                const active = qty > 0;
                return (
                  <div
                    key={product.id}
                    className={cn(
                      "rounded-lg border p-4 transition-colors",
                      active
                        ? "border-gold bg-gold/5"
                        : "border-black/10 hover:border-gold/40"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setQty(product.id, active ? 0 : 1)}
                      className="flex w-full items-start justify-between gap-3 text-left"
                    >
                      <span className="flex min-w-0 items-start gap-3">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.imageUrl}
                            alt=""
                            className="h-12 w-12 flex-shrink-0 rounded-md border border-black/10 object-cover"
                          />
                        ) : (
                          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md border border-dashed border-black/15 bg-light/60 text-grey">
                            <Package className="h-4 w-4" strokeWidth={1.5} />
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block font-sans text-sm font-medium text-black">
                            {product.name}
                          </span>
                          <span className="font-sans text-xs text-grey">
                            {product.unit ? `${product.unit} · ` : ""}
                            {Number(product.unitPrice).toFixed(2)} €
                          </span>
                        </span>
                      </span>
                      <span
                        className={cn(
                          "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border",
                          active
                            ? "border-gold bg-gold text-black"
                            : "border-black/20 text-transparent"
                        )}
                      >
                        <Check className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                    </button>
                    {active && (
                      <div className="mt-3 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setQty(product.id, qty - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded border border-black/15 text-grey hover:border-gold hover:text-gold-dark"
                          aria-label="Menge verringern"
                        >
                          <Minus className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={qty}
                          onChange={(e) =>
                            setQty(product.id, Math.max(0, Math.floor(Number(e.target.value) || 0)))
                          }
                          className="w-14 rounded border border-black/15 px-2 py-1 text-center font-sans text-sm focus:border-gold focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setQty(product.id, qty + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded border border-black/15 text-grey hover:border-gold hover:text-gold-dark"
                          aria-label="Menge erhöhen"
                        >
                          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Schritt 4: Versand-Details */}
      <div className="rounded-lg border border-gold/20 bg-white p-6">
        <p className={stepLabel}>Schritt 4</p>
        <h2 className="mb-4 mt-1 font-serif text-xl font-light">Versand & Hinweise</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>CC-E-Mail (Kopie an)</label>
            <input
              type="email"
              value={ccEmail}
              onChange={(e) => setCcEmail(e.target.value)}
              placeholder="z.B. buchhaltung@firma.de"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Bestellt von</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className={inputClass}
            >
              <option value="">— optional —</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Hinweis an den Lieferanten</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Optionale Anmerkung, z.B. Lieferzeitfenster …"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Aktionsleiste */}
      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gold/30 bg-white/95 p-4 shadow-[0_6px_24px_rgba(0,0,0,0.06)] backdrop-blur">
        <p className="font-sans text-sm text-grey">
          {property ? (
            <>
              <span className="text-black">{property.name}</span> ·{" "}
              {supplier ? supplier.name : "kein Lieferant"} · {positionCount} Position
              {positionCount === 1 ? "" : "en"}
            </>
          ) : (
            "Objekt, Lieferant und Artikel wählen, um die Bestellung zu senden."
          )}
        </p>
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-6 py-2.5 font-sans text-[11px] uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-3.5 w-3.5" strokeWidth={1.5} />
          {isPending ? "Wird gesendet …" : "Bestellung senden"}
        </button>
      </div>
    </div>
  );
}

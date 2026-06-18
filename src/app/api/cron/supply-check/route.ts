import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueItems = await prisma.customerSupplyItem.findMany({
    where: { active: true, nextDueAt: { lte: today } },
    include: {
      customer: true,
      product: { include: { supplier: true } },
    },
  });

  if (dueItems.length === 0) {
    return NextResponse.json({ message: "Nichts fällig heute." });
  }

  // Gruppieren nach Lieferant
  const bySupplier = new Map<string, typeof dueItems>();
  for (const item of dueItems) {
    const sid = item.product.supplierId;
    if (!bySupplier.has(sid)) bySupplier.set(sid, []);
    bySupplier.get(sid)!.push(item);
  }

  const results: { supplier: string; status: string; orderId?: string }[] = [];

  for (const [supplierId, items] of bySupplier) {
    const supplier = items[0].product.supplier;

    // Order erstellen
    const order = await prisma.supplyOrder.create({
      data: {
        supplierId,
        status: "PENDING",
        items: {
          create: items.map((i) => ({
            customerId: i.customerId,
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.product.unitPrice,
          })),
        },
      },
    });

    // E-Mail an Lieferant
    const tableRows = items
      .map(
        (i) =>
          `  - ${i.quantity}x ${i.product.name}${i.product.unit ? ` (${i.product.unit})` : ""} für Kunde: ${i.customer.companyName}`
      )
      .join("\n");

    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "bestellungen@reinigung.de",
        to: supplier.email,
        subject: `Bestellung vom ${today.toLocaleDateString("de-DE")} – ${supplier.name}`,
        text: `Guten Tag,\n\nbitte liefern Sie folgende Artikel:\n\n${tableRows}\n\nMit freundlichen Grüßen\nIhr Reinigungsservice`,
      });

      await prisma.supplyOrder.update({
        where: { id: order.id },
        data: { status: "SENT", sentAt: new Date() },
      });

      results.push({ supplier: supplier.name, status: "sent", orderId: order.id });
    } catch (err) {
      await prisma.supplyOrder.update({
        where: { id: order.id },
        data: { status: "FAILED" },
      });
      results.push({ supplier: supplier.name, status: "failed" });
      console.error(`E-Mail an ${supplier.name} fehlgeschlagen:`, err);
    }
  }

  // nextDueAt + lastOrderedAt aktualisieren
  for (const item of dueItems) {
    const nextDue = new Date(today);
    nextDue.setDate(nextDue.getDate() + item.intervalDays);
    await prisma.customerSupplyItem.update({
      where: { id: item.id },
      data: { lastOrderedAt: today, nextDueAt: nextDue },
    });
  }

  return NextResponse.json({ results });
}

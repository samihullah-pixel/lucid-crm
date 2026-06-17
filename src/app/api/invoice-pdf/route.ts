import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { InvoiceDocument } from "@/lib/pdf/invoice-document";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const invoiceId = searchParams.get("invoiceId");
  if (!invoiceId) return new Response("invoiceId required", { status: 400 });

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      customer: true,
      property: true,
    },
  });
  if (!invoice) return new Response("Not found", { status: 404 });

  const buffer = await renderToBuffer(
    InvoiceDocument({
      invoice: {
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        servicePeriodFrom: invoice.servicePeriodFrom,
        servicePeriodTo: invoice.servicePeriodTo,
        netAmount: Number(invoice.netAmount),
        taxRate: Number(invoice.taxRate),
        taxAmount: Number(invoice.taxAmount),
        grossAmount: Number(invoice.grossAmount),
        status: invoice.status,
        notes: invoice.notes,
        customer: {
          companyName: invoice.customer.companyName,
          contactPerson: invoice.customer.contactPerson,
          billingAddress: invoice.customer.billingAddress,
          postalCode: invoice.customer.postalCode,
          city: invoice.customer.city,
          email: invoice.customer.email,
          vatId: invoice.customer.vatId,
        },
        property: invoice.property ? { name: invoice.property.name, address: invoice.property.address } : null,
      },
    })
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Rechnung_${invoice.invoiceNumber}.pdf"`,
    },
  });
}

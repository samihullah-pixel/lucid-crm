import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { appBaseUrl } from "@/lib/email";
import { QrPosterDocument } from "@/lib/pdf/qr-poster-document";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Druckbares A6-Poster mit dem Scan-QR-Code eines Objekts. */
export async function GET(request: Request) {
  const propertyId = new URL(request.url).searchParams.get("propertyId");
  if (!propertyId) return new Response("propertyId required", { status: 400 });

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) return new Response("Not found", { status: 404 });
  if (!property.qrToken) return new Response("Objekt hat kein Scan-Token", { status: 409 });

  // Gedruckte Codes müssen immer auf die Live-Adresse zeigen, auch wenn lokal erzeugt.
  const qrDataUrl = await QRCode.toDataURL(`${appBaseUrl()}/scan/${property.qrToken}`, {
    margin: 1,
    width: 600,
    errorCorrectionLevel: "M",
    color: { dark: "#141414", light: "#ffffff" },
  });

  const buffer = await renderToBuffer(
    QrPosterDocument({
      propertyName: property.name,
      address: [property.address, [property.postalCode, property.city].filter(Boolean).join(" ")]
        .filter(Boolean)
        .join(", "),
      qrDataUrl,
    })
  );

  const safeName = property.name.replace(/[^a-zA-Z0-9äöüÄÖÜß\s-]/g, "").replace(/\s+/g, "_");
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="QR_${safeName}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}

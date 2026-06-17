import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { InspectionDocument } from "@/lib/pdf/inspection-document";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const templateId = searchParams.get("templateId");

  if (!templateId) {
    return new Response("templateId required", { status: 400 });
  }

  const template = await prisma.inspectionTemplate.findUnique({
    where: { id: templateId },
    include: {
      property: true,
      areas: {
        orderBy: { order: "asc" },
        include: { items: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!template) {
    return new Response("Not found", { status: 404 });
  }

  const areas = template.areas.map((a) => ({
    name: a.name,
    items: a.items.map((i) => ({ label: i.label, interval: i.interval, durationMinutes: i.durationMinutes })),
  }));

  const buffer = await renderToBuffer(
    InspectionDocument({
      templateName: template.name,
      propertyName: template.property?.name,
      areas,
    })
  );

  const safeName = template.name.replace(/[^a-zA-Z0-9äöüÄÖÜß\s-]/g, "").replace(/\s+/g, "_");

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Aufnahmebogen_${safeName}.pdf"`,
    },
  });
}

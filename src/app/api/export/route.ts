import { prisma } from "@/lib/prisma";

function csv(rows: string[][]): string {
  return rows
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(";"))
    .join("\n");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  let filename = "export.csv";
  let content = "";

  if (type === "customers") {
    const rows = await prisma.customer.findMany({ orderBy: { customerNumber: "asc" } });
    filename = "Kunden.csv";
    content = csv([
      ["Kd.-Nr.", "Firma", "Ansprechpartner", "E-Mail", "Telefon", "PLZ", "Ort", "Rechnungsadresse", "Zahlungsziel", "Aktiv"],
      ...rows.map((r) => [
        r.customerNumber, r.companyName, r.contactPerson ?? "", r.email ?? "",
        r.phone ?? "", r.postalCode ?? "", r.city ?? "", r.billingAddress ?? "",
        String(r.paymentTermsDays ?? ""), r.isActive ? "Ja" : "Nein",
      ]),
    ]);
  } else if (type === "properties") {
    const rows = await prisma.property.findMany({ include: { customer: true }, orderBy: { name: "asc" } });
    filename = "Objekte.csv";
    content = csv([
      ["Objekt", "Kunde", "Adresse", "PLZ", "Ort", "Ansprechpartner vor Ort", "Telefon vor Ort", "Stockwerk", "Aufzug", "Aktiv"],
      ...rows.map((r) => [
        r.name, r.customer.companyName, r.address, r.postalCode ?? "", r.city ?? "",
        r.contactOnSite ?? "", r.phoneOnSite ?? "", r.floor ?? "",
        r.hasElevator ? "Ja" : "Nein", r.isActive ? "Ja" : "Nein",
      ]),
    ]);
  } else if (type === "employees") {
    const rows = await prisma.employee.findMany({ orderBy: { lastName: "asc" } });
    filename = "Mitarbeiter.csv";
    content = csv([
      ["Vorname", "Nachname", "E-Mail", "Telefon", "Aktiv"],
      ...rows.map((r) => [r.firstName, r.lastName, r.email ?? "", r.phone ?? "", r.isActive ? "Ja" : "Nein"]),
    ]);
  } else if (type === "cleaning-jobs") {
    const rows = await prisma.cleaningJob.findMany({
      include: { customer: true, property: true, employee: true },
      orderBy: { date: "desc" },
    });
    filename = "Einsaetze.csv";
    content = csv([
      ["Datum", "Kunde", "Objekt", "Mitarbeiter", "Leistungsart", "Start", "Ende", "Stunden", "Status", "Abrechenbar"],
      ...rows.map((r) => [
        r.date.toLocaleDateString("de-DE"),
        r.customer.companyName, r.property.name,
        r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : "",
        r.serviceType, r.startTime ?? "", r.endTime ?? "",
        r.workedHours ? String(r.workedHours) : "",
        r.status, r.billable ? "Ja" : "Nein",
      ]),
    ]);
  } else if (type === "invoices") {
    const rows = await prisma.invoice.findMany({
      include: { customer: true },
      orderBy: { invoiceDate: "desc" },
    });
    filename = "Rechnungen.csv";
    content = csv([
      ["Rechnungsnr.", "Kunde", "Datum", "Netto", "MwSt", "Brutto", "Status"],
      ...rows.map((r) => [
        r.invoiceNumber, r.customer.companyName,
        r.invoiceDate.toLocaleDateString("de-DE"),
        String(r.netAmount), String(r.taxAmount), String(r.grossAmount), r.status,
      ]),
    ]);
  } else {
    return new Response("Unbekannter Typ", { status: 400 });
  }

  return new Response("﻿" + content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

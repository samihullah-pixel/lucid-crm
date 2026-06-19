"use server";

import { prisma } from "@/lib/prisma";

export type SearchResult = {
  id: string;
  type: "customer" | "property" | "employee" | "invoice";
  label: string;
  sublabel: string;
  href: string;
};

export async function globalSearch(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const [customers, properties, employees, invoices] = await Promise.all([
    prisma.customer.findMany({
      where: {
        OR: [
          { companyName: { contains: q, mode: "insensitive" } },
          { customerNumber: { contains: q, mode: "insensitive" } },
          { contactPerson: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, companyName: true, customerNumber: true },
      take: 5,
    }),
    prisma.property.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { address: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, city: true, customerId: true },
      take: 5,
    }),
    prisma.employee.findMany({
      where: {
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, firstName: true, lastName: true },
      take: 5,
    }),
    prisma.invoice.findMany({
      where: { invoiceNumber: { contains: q, mode: "insensitive" } },
      select: {
        id: true,
        invoiceNumber: true,
        customer: { select: { companyName: true } },
      },
      take: 5,
    }),
  ]);

  const results: SearchResult[] = [];

  for (const c of customers) {
    results.push({
      id: c.id,
      type: "customer",
      label: c.companyName,
      sublabel: c.customerNumber,
      href: `/customers/${c.id}/edit`,
    });
  }
  for (const p of properties) {
    results.push({
      id: p.id,
      type: "property",
      label: p.name,
      sublabel: p.city ?? "Objekt",
      href: `/properties/${p.id}/edit`,
    });
  }
  for (const e of employees) {
    results.push({
      id: e.id,
      type: "employee",
      label: `${e.firstName} ${e.lastName}`,
      sublabel: "Mitarbeiter",
      href: `/employees/${e.id}/edit`,
    });
  }
  for (const i of invoices) {
    results.push({
      id: i.id,
      type: "invoice",
      label: i.invoiceNumber,
      sublabel: i.customer.companyName,
      href: `/invoices`,
    });
  }

  return results;
}

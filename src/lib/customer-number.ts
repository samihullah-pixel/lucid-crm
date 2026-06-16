import { prisma } from "@/lib/prisma";

export async function generateCustomerNumber(): Promise<string> {
  const count = await prisma.customer.count();
  const nextNumber = count + 1;
  return `K-${String(nextNumber).padStart(4, "0")}`;
}

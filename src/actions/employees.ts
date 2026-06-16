"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createEmployee(formData: FormData) {
  await prisma.employee.create({
    data: {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? "") || null,
      phone: String(formData.get("phone") ?? "") || null,
      color: String(formData.get("color") ?? "") || null,
      isActive: formData.get("isActive") === "on",
    },
  });

  redirect("/employees");
}

export async function updateEmployee(id: string, formData: FormData) {
  await prisma.employee.update({
    where: { id },
    data: {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? "") || null,
      phone: String(formData.get("phone") ?? "") || null,
      color: String(formData.get("color") ?? "") || null,
      isActive: formData.get("isActive") === "on",
    },
  });

  redirect("/employees");
}

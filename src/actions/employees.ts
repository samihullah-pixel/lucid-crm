"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function revalidateAll() {
  revalidatePath("/", "layout");
}

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

  revalidateAll();
  redirect("/employees?flash=" + encodeURIComponent("Mitarbeiter angelegt"));
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

  revalidateAll();
  redirect("/employees?flash=" + encodeURIComponent("Mitarbeiter gespeichert"));
}

export async function deleteEmployee(id: string) {
  await prisma.employee.delete({ where: { id } });
  revalidateAll();
  redirect("/employees");
}

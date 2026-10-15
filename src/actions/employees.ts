"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { PIN_PATTERN, hashPin } from "@/lib/employee-session";

function revalidateAll() {
  revalidatePath("/", "layout");
}

/** Leer = PIN unverändert. Sonst 4–6 Ziffern; neue PIN macht alte Sessions ungültig. */
type PinData = {
  pinHash?: string;
  pinVersion?: { increment: number };
  pinFailedAttempts?: number;
  pinLockedUntil?: null;
};

async function pinData(formData: FormData, back: string): Promise<PinData> {
  const pin = String(formData.get("pin") ?? "").trim();
  if (!pin) return {};
  if (!PIN_PATTERN.test(pin)) {
    redirect(back + "?flash=" + encodeURIComponent("error:PIN muss aus 4 bis 6 Ziffern bestehen"));
  }
  return {
    pinHash: await hashPin(pin),
    pinVersion: { increment: 1 },
    pinFailedAttempts: 0,
    pinLockedUntil: null,
  };
}

export async function createEmployee(formData: FormData) {
  const pin = await pinData(formData, "/employees/new");
  await prisma.employee.create({
    data: {
      ...(pin.pinHash ? { pinHash: pin.pinHash } : {}),
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
  const pin = await pinData(formData, `/employees/${id}/edit`);
  await prisma.employee.update({
    where: { id },
    data: {
      ...pin,
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
  // Zeiteinträge müssen 2 Jahre aufbewahrt werden (§ 17 MiLoG) -> nicht löschbar.
  const entries = await prisma.timeEntry.count({ where: { employeeId: id } });
  if (entries > 0) {
    redirect(
      "/employees?flash=" +
        encodeURIComponent(
          "error:Mitarbeiter hat erfasste Arbeitszeiten (Aufbewahrungspflicht) und kann nicht gelöscht werden. Bitte stattdessen deaktivieren."
        )
    );
  }
  await prisma.employee.delete({ where: { id } });
  revalidateAll();
  redirect("/employees");
}

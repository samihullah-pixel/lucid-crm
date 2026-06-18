"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function revalidateAll() {
  revalidatePath("/", "layout");
}

export async function assignEmployee(formData: FormData) {
  const shiftId = String(formData.get("shiftId") ?? "");
  const employeeId = String(formData.get("employeeId") ?? "");
  const dateStr = String(formData.get("date") ?? "");

  if (!shiftId || !employeeId || !dateStr) return;

  await prisma.shiftAssignment.upsert({
    where: {
      shiftId_employeeId_date: {
        shiftId,
        employeeId,
        date: new Date(dateStr),
      },
    },
    update: {},
    create: {
      shiftId,
      employeeId,
      date: new Date(dateStr),
      note: String(formData.get("note") ?? "") || null,
    },
  });

  revalidateAll();
}

export async function removeAssignment(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.shiftAssignment.delete({ where: { id } });
  revalidateAll();
}

export async function copyWeek(formData: FormData) {
  const sourceStart = new Date(String(formData.get("sourceStart") ?? ""));
  const targetStart = new Date(String(formData.get("targetStart") ?? ""));

  const sourceEnd = new Date(sourceStart);
  sourceEnd.setDate(sourceEnd.getDate() + 7);

  const existing = await prisma.shiftAssignment.findMany({
    where: {
      date: { gte: sourceStart, lt: sourceEnd },
    },
  });

  const diffMs = targetStart.getTime() - sourceStart.getTime();

  for (const assignment of existing) {
    const newDate = new Date(assignment.date.getTime() + diffMs);
    await prisma.shiftAssignment.upsert({
      where: {
        shiftId_employeeId_date: {
          shiftId: assignment.shiftId,
          employeeId: assignment.employeeId,
          date: newDate,
        },
      },
      update: {},
      create: {
        shiftId: assignment.shiftId,
        employeeId: assignment.employeeId,
        date: newDate,
        note: assignment.note,
      },
    });
  }

  revalidateAll();
}

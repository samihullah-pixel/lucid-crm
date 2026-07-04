"use server";

import { prisma } from "@/lib/prisma";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getOrCreateTodayRun(siteProcedureId: string) {
  const date = startOfToday();

  return prisma.procedureRun.upsert({
    where: { siteProcedureId_date: { siteProcedureId, date } },
    create: { siteProcedureId, date },
    update: {},
    include: { checks: true },
  });
}

export async function toggleProcedureStepCheck(runId: string, stepId: string, checked: boolean) {
  await prisma.procedureRunCheck.upsert({
    where: { procedureRunId_stepId: { procedureRunId: runId, stepId } },
    create: { procedureRunId: runId, stepId, checked, checkedAt: checked ? new Date() : null },
    update: { checked, checkedAt: checked ? new Date() : null },
  });
}

export async function completeProcedureRun(runId: string) {
  await prisma.procedureRun.update({
    where: { id: runId },
    data: { status: "ABGESCHLOSSEN", completedAt: new Date() },
  });
}

export async function reopenProcedureRun(runId: string) {
  await prisma.procedureRun.update({
    where: { id: runId },
    data: { status: "OFFEN", completedAt: null },
  });
}

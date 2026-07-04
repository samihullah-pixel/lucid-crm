import { prisma } from "@/lib/prisma";
import { getOrCreateTodayRun } from "@/actions/procedure-runs";

export async function getGuideByToken(token: string) {
  const sp = await prisma.siteProcedure.findUnique({
    where: { qrToken: token },
    include: {
      site: true,
      procedure: {
        include: {
          steps: { orderBy: { order: "asc" } },
          equipment: {
            orderBy: { order: "asc" },
            include: { equipment: true },
          },
        },
      },
    },
  });

  if (!sp || !sp.isActive || !sp.procedure.isActive) return null;

  const hasCheckableSteps = sp.procedure.steps.some((s) => s.requiresCheck);
  const run = hasCheckableSteps ? await getOrCreateTodayRun(sp.id) : null;

  return { ...sp, run };
}

export type Guide = NonNullable<Awaited<ReturnType<typeof getGuideByToken>>>;

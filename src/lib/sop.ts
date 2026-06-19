import { prisma } from "@/lib/prisma";

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
  return sp;
}

export type Guide = NonNullable<Awaited<ReturnType<typeof getGuideByToken>>>;

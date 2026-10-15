import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentEmployee } from "@/lib/employee-session";

/**
 * Token-Vergabe für den Foto-Upload direkt zu Vercel Blob. Nur eingeloggte
 * Mitarbeiter, nur für ihre eigene laufende Schicht.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const employee = await getCurrentEmployee();
        const entryId = clientPayload ?? "";
        const entry = employee
          ? await prisma.timeEntry.findUnique({ where: { id: entryId } })
          : null;
        if (!employee || !entry || entry.employeeId !== employee.id || entry.status !== "OPEN") {
          throw new Error("Not allowed");
        }
        if (!pathname.startsWith(`time/${entryId}/`)) throw new Error("Invalid path");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          maximumSizeInBytes: 15 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // Das Foto wird per addPhoto() an der Schicht gespeichert.
      },
    });
    return NextResponse.json(json);
  } catch (error) {
    console.error("time-photo upload failed:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

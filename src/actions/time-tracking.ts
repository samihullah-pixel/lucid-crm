"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { MIN_PHOTOS } from "@/lib/checklist";
import { sendEmail, appBaseUrl } from "@/lib/email";
import {
  MAX_PIN_ATTEMPTS,
  PIN_LOCK_MINUTES,
  PIN_PATTERN,
  clearEmployeeCookie,
  getCurrentEmployee,
  setEmployeeCookie,
  verifyPin,
} from "@/lib/employee-session";
import {
  FLAG,
  FLAG_LABELS,
  describeGeo,
  durationFlag,
  escapeHtml,
  evaluateGeo,
  formatDateTime,
  formatDuration,
  minutesBetween,
  needsReview,
  nextEntryNumber,
  sanitizeGeo,
} from "@/lib/time-entry";

export type LoginState = { error?: string } | undefined;
export type ActionResult = { ok: true } | { ok: false; error: string };

const SIGN_IN_AGAIN = "Your session has expired. Please sign in again.";

/** Nur interne Ziele erlauben (kein Open Redirect). */
function safeRedirect(target: string): string {
  return /^\/(scan\/[A-Za-z0-9]+|me)$/.test(target) ? target : "/me";
}

export async function employeeLogin(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const employeeId = String(formData.get("employeeId") ?? "");
  const pin = String(formData.get("pin") ?? "");
  const target = safeRedirect(String(formData.get("redirectTo") ?? ""));

  if (!employeeId) return { error: "Please choose your name." };
  if (!PIN_PATTERN.test(pin)) return { error: "Enter your 4 to 6 digit PIN." };

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee || !employee.isActive || !employee.pinHash) {
    return { error: "Sign-in not possible. Please contact the office." };
  }

  if (employee.pinLockedUntil && employee.pinLockedUntil > new Date()) {
    const minutes = Math.ceil((employee.pinLockedUntil.getTime() - Date.now()) / 60000);
    return { error: `Too many attempts. Try again in ${minutes} min.` };
  }

  if (!(await verifyPin(pin, employee.pinHash))) {
    const attempts = employee.pinFailedAttempts + 1;
    const lock = attempts >= MAX_PIN_ATTEMPTS;
    await prisma.employee.update({
      where: { id: employee.id },
      data: {
        pinFailedAttempts: lock ? 0 : attempts,
        pinLockedUntil: lock ? new Date(Date.now() + PIN_LOCK_MINUTES * 60000) : null,
      },
    });
    return {
      error: lock
        ? `Too many attempts. Try again in ${PIN_LOCK_MINUTES} min.`
        : "Wrong PIN.",
    };
  }

  if (employee.pinFailedAttempts > 0 || employee.pinLockedUntil) {
    await prisma.employee.update({
      where: { id: employee.id },
      data: { pinFailedAttempts: 0, pinLockedUntil: null },
    });
  }

  await setEmployeeCookie(employee.id, employee.pinVersion);
  redirect(target);
}

export async function employeeLogout(redirectTo: string) {
  await clearEmployeeCookie();
  redirect(safeRedirect(redirectTo));
}

async function notifyOwner(subject: string, lines: string[]) {
  const to = process.env.OWNER_EMAIL;
  if (!to) {
    console.warn("OWNER_EMAIL ist nicht gesetzt – Zeiterfassungs-Mail übersprungen.");
    return;
  }
  const text = lines.join("\n");
  const html = `<div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#141414">${lines
    .map((l) => (l ? `<div>${escapeHtml(l)}</div>` : "<br>"))
    .join("")}</div>`;
  await sendEmail({ to, subject, text, html });
}

/** Schicht starten. Die Startzeit setzt ausschließlich der Server. */
export async function startShift(qrToken: string, geoInput: unknown): Promise<ActionResult> {
  const employee = await getCurrentEmployee();
  if (!employee) return { ok: false, error: SIGN_IN_AGAIN };

  const property = await prisma.property.findUnique({ where: { qrToken } });
  if (!property || !property.isActive) {
    return { ok: false, error: "This QR code is not valid." };
  }

  const openEntries = await prisma.timeEntry.findMany({
    where: { employeeId: employee.id, status: "OPEN" },
    select: { id: true, propertyId: true },
  });
  // Doppeltes Antippen / erneutes Scannen: laufende Schicht beibehalten.
  if (openEntries.some((e) => e.propertyId === property.id)) {
    revalidatePath(`/scan/${qrToken}`);
    return { ok: true };
  }

  const flags: string[] = [];
  if (openEntries.length > 0) flags.push(FLAG.OVERLAPPING_OPEN);

  const geo = evaluateGeo(sanitizeGeo(geoInput), property, "START");
  if (geo.flag) flags.push(geo.flag);

  const now = new Date();
  let entry = null;
  for (let attempt = 0; attempt < 3 && !entry; attempt++) {
    try {
      entry = await prisma.timeEntry.create({
        data: {
          number: await nextEntryNumber(now),
          employeeId: employee.id,
          propertyId: property.id,
          startedAt: now,
          startLat: geo.lat,
          startLng: geo.lng,
          startAccuracy: geo.accuracy,
          startDistanceM: geo.distanceM,
          flags,
        },
      });
    } catch (err) {
      // Nummer parallel vergeben (Unique-Konflikt) -> erneut versuchen.
      if ((err as { code?: string }).code !== "P2002" || attempt === 2) throw err;
    }
  }
  if (!entry) return { ok: false, error: "Could not start the shift. Please try again." };

  await notifyOwner(`Schicht gestartet – ${property.name} (${entry.number})`, [
    `Mitarbeiter: ${employee.firstName} ${employee.lastName}`,
    `Objekt: ${property.name}`,
    `Start: ${formatDateTime(now)}`,
    `Standort: ${describeGeo(geo, property.geofenceRadiusM)}`,
    ...(flags.includes(FLAG.OVERLAPPING_OPEN)
      ? ["", `Hinweis: ${FLAG_LABELS[FLAG.OVERLAPPING_OPEN]}.`]
      : []),
    "",
    `Details: ${appBaseUrl()}/zeiterfassung/${entry.id}`,
  ]);

  revalidatePath(`/scan/${qrToken}`);
  revalidatePath("/zeiterfassung");
  return { ok: true };
}

/** Schicht beenden. Die Endzeit setzt ausschließlich der Server. */
export async function endShift(
  entryId: string,
  geoInput: unknown,
  notesInput: string
): Promise<ActionResult> {
  const employee = await getCurrentEmployee();
  if (!employee) return { ok: false, error: SIGN_IN_AGAIN };

  const entry = await prisma.timeEntry.findUnique({
    where: { id: entryId },
    include: { property: true },
  });
  if (!entry || entry.employeeId !== employee.id) {
    return { ok: false, error: "Shift not found." };
  }
  if (entry.status !== "OPEN") return { ok: true };

  // Pflichtfotos: ohne mindestens MIN_PHOTOS Fotos kein Ende (Prüfung auch serverseitig).
  const photoCount = await prisma.timeEntryPhoto.count({ where: { timeEntryId: entry.id } });
  if (photoCount < MIN_PHOTOS) {
    return { ok: false, error: `Please add at least ${MIN_PHOTOS} photos before ending the shift.` };
  }

  const items = await prisma.checklistItem.findMany({
    where: { template: { propertyId: entry.propertyId }, archived: false },
    orderBy: { order: "asc" },
  });
  const checked = await prisma.timeEntryCheck.findMany({
    where: { timeEntryId: entry.id, checked: true },
    select: { itemId: true },
  });
  const checkedIds = new Set(checked.map((c) => c.itemId));
  const openItems = items.filter((i) => !checkedIds.has(i.id));

  const now = new Date();
  const minutes = minutesBetween(entry.startedAt, now);
  const geo = evaluateGeo(sanitizeGeo(geoInput), entry.property, "END");

  const flags = [...entry.flags];
  if (geo.flag) flags.push(geo.flag);
  const dFlag = durationFlag(minutes, entry.property.targetMinutes);
  if (dFlag) flags.push(dFlag);

  const notes = notesInput.trim().slice(0, 2000) || null;
  const status = needsReview(flags) ? "REVIEW" : "DONE";

  await prisma.timeEntry.update({
    where: { id: entry.id },
    data: {
      endedAt: now,
      endLat: geo.lat,
      endLng: geo.lng,
      endAccuracy: geo.accuracy,
      endDistanceM: geo.distanceM,
      flags,
      notes,
      status,
    },
  });

  const warnings = flags.filter((f) => FLAG_LABELS[f]).map((f) => FLAG_LABELS[f]);
  await notifyOwner(`Schicht beendet – ${entry.property.name} (${entry.number})`, [
    `Mitarbeiter: ${employee.firstName} ${employee.lastName}`,
    `Objekt: ${entry.property.name}`,
    `Start: ${formatDateTime(entry.startedAt)}`,
    `Ende: ${formatDateTime(now)}`,
    `Dauer: ${formatDuration(minutes)}${
      entry.property.targetMinutes ? ` (Soll ${formatDuration(entry.property.targetMinutes)})` : ""
    }`,
    `Standort Ende: ${describeGeo(geo, entry.property.geofenceRadiusM)}`,
    ...(items.length
      ? [`Erledigt: ${items.length - openItems.length} von ${items.length}`]
      : ["Erledigt: keine Checkliste für dieses Objekt hinterlegt"]),
    ...(openItems.length
      ? ["Offene Punkte:", ...openItems.map((i) => `- ${i.section}: ${i.text}`)]
      : []),
    `Notizen: ${notes ?? "–"}`,
    `Fotos: ${photoCount}`,
    ...(warnings.length ? ["", "Warnungen:", ...warnings.map((w) => `- ${w}`)] : []),
    "",
    `Details und Fotos: ${appBaseUrl()}/zeiterfassung/${entry.id}`,
  ]);

  revalidatePath(`/scan/${entry.property.qrToken}`);
  revalidatePath("/zeiterfassung");
  revalidatePath("/me");
  return { ok: true };
}

"use server";

import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type TranslationResult = { ok: true } | { ok: false; error: string };

function pick<T extends Record<string, unknown>>(obj: T, keys: (keyof T)[]) {
  const out: Record<string, unknown> = {};
  for (const k of keys) {
    const v = obj[k];
    if (v !== null && v !== undefined && v !== "") out[k as string] = v;
  }
  return out;
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  return start >= 0 && end > start ? text.slice(start, end + 1) : text;
}

export async function translateProcedure(procedureId: string): Promise<TranslationResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, error: "ANTHROPIC_API_KEY fehlt – in Vercel/.env setzen." };
  }

  const procedure = await prisma.procedure.findUnique({
    where: { id: procedureId },
    include: {
      steps: { orderBy: { order: "asc" } },
      equipment: { include: { equipment: true } },
      sites: true,
    },
  });
  if (!procedure) return { ok: false, error: "Anleitung nicht gefunden." };

  const source = {
    procedure: pick(procedure, ["name", "description"]),
    steps: Object.fromEntries(
      procedure.steps.map((s) => [s.id, pick(s, ["section", "title", "body", "tip", "warning"])])
    ),
    equipment: Object.fromEntries(
      procedure.equipment.map((e) => [e.equipmentId, pick(e.equipment, ["name"])])
    ),
    sites: Object.fromEntries(
      procedure.sites.map((sp) => [
        sp.id,
        pick(sp, ["welcomeText", "waterLocation", "accessNote", "emergencyNote"]),
      ])
    ),
  };

  const client = new Anthropic();

  let parsed: any;
  try {
    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 8000,
      system:
        "Du bist ein professioneller Übersetzer für Arbeitsanweisungen in der Gebäudereinigung. " +
        "Übersetze die deutschen Texte ins Englische (en) und Spanische (es). " +
        "Halte den Ton knapp, anweisend und praxisnah für Reinigungskräfte vor Ort. " +
        "Behalte die exakte JSON-Struktur und alle IDs bei. Übersetze nur die Werte, nie die Schlüssel. " +
        "Antworte ausschließlich mit gültigem JSON, ohne erklärenden Text.",
      messages: [
        {
          role: "user",
          content:
            "Übersetze jeden Textwert im folgenden Objekt nach en und es. " +
            "Gib für jeden Eintrag dieselben Felder zurück, gruppiert pro Sprache. Antwortform:\n" +
            '{ "procedure": { "en": {…}, "es": {…} }, "steps": { "<id>": { "en": {…}, "es": {…} } }, ' +
            '"equipment": { "<id>": { "en": {…}, "es": {…} } }, "sites": { "<id>": { "en": {…}, "es": {…} } } }\n\n' +
            "Quelle (Deutsch):\n" +
            JSON.stringify(source, null, 2),
        },
      ],
    });

    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    parsed = JSON.parse(extractJson(text));
  } catch (e) {
    return { ok: false, error: "Übersetzung fehlgeschlagen: " + (e as Error).message };
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (parsed.procedure) {
        await tx.procedure.update({
          where: { id: procedureId },
          data: { translations: parsed.procedure },
        });
      }
      for (const [id, tr] of Object.entries(parsed.steps ?? {})) {
        await tx.procedureStep.update({ where: { id }, data: { translations: tr as object } });
      }
      for (const [id, tr] of Object.entries(parsed.equipment ?? {})) {
        await tx.equipmentItem.update({ where: { id }, data: { translations: tr as object } });
      }
      for (const [id, tr] of Object.entries(parsed.sites ?? {})) {
        await tx.siteProcedure.update({ where: { id }, data: { translations: tr as object } });
      }
    });
  } catch (e) {
    return { ok: false, error: "Speichern der Übersetzung fehlgeschlagen: " + (e as Error).message };
  }

  revalidatePath(`/sop-procedures/${procedureId}/edit`);
  return { ok: true };
}
